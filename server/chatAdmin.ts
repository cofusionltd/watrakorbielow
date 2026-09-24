import { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import {
  dbGetChatSessions,
  dbGetChatSession,
  dbUpsertChatSession
} from '../src/db/repository.ts';

export interface ChatMessageItem {
  id: string;
  role: 'user' | 'model' | 'admin';
  content: string;
  translationPl?: string; // Auto-translated into Polish for admin
  translationGuest?: string; // Translated into guest language when admin speaks Polish
  timestamp: string;
}

export interface LiveChatSessionData {
  sessionId: string;
  guestName: string;
  guestEmail?: string;
  language: 'pl' | 'en' | 'de' | 'sk';
  isAiPaused: boolean;
  adminTakeover: boolean;
  lastMessage: string;
  lastMessageAt: string;
  messages: ChatMessageItem[];
}

let aiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}

// In-memory live chat sessions store
export const liveChatSessions: Map<string, LiveChatSessionData> = new Map([
  [
    'session-sample-1',
    {
      sessionId: 'session-sample-1',
      guestName: 'Martin Novák (Bratislava)',
      guestEmail: 'm.novak@example.sk',
      language: 'sk',
      isAiPaused: false,
      adminTakeover: false,
      lastMessage: 'Ahoj, chceli by sme si zarezervovať vírivku na piatok večer o 20:00.',
      lastMessageAt: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
      messages: [
        {
          id: 'm-1',
          role: 'user',
          content: 'Dobrý deň, sme na ceste zo Žiliny. Máte ešte voľnú vírivku dnes večer?',
          translationPl: 'Dzień dobry, jesteśmy w drodze z Żyliny. Czy macie jeszcze wolne jacuzzi dziś wieczorem?',
          timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString()
        },
        {
          id: 'm-2',
          role: 'model',
          content: 'Dobrý deň! Áno, vonkajšia cédrová vírivka (38°C) pod hviezdami má voľný termín dnes o 20:30. Môžete si ju zarezervovať priamo na recepcii alebo Vám termín môžem podržať.',
          translationPl: 'Dzień dobry! Tak, zewnętrzne jacuzzi cedrowe (38°C) pod gwiazdami ma wolny termin dziś o 20:30. Możecie zarezerwować na recepcji lub mogę przytrzymać termin.',
          timestamp: new Date(Date.now() - 1000 * 60 * 9).toISOString()
        },
        {
          id: 'm-3',
          role: 'user',
          content: 'Ahoj, chceli by sme si zarezervovať vírivku na piatok večer o 20:00.',
          translationPl: 'Cześć, chcielibyśmy zarezerwować jacuzzi na piątek wieczorem o 20:00.',
          timestamp: new Date(Date.now() - 1000 * 60 * 4).toISOString()
        }
      ]
    }
  ],
  [
    'session-sample-2',
    {
      sessionId: 'session-sample-2',
      guestName: 'Hans Schmidt (München)',
      guestEmail: 'hans.schmidt@de-travel.de',
      language: 'de',
      isAiPaused: true,
      adminTakeover: true,
      lastMessage: 'Vielen Dank, das ist sehr hilfreich!',
      lastMessageAt: new Date(Date.now() - 1000 * 60 * 1).toISOString(),
      messages: [
        {
          id: 'm-4',
          role: 'user',
          content: 'Guten Tag, gibt es einen beheizten Skiraum und Skiverleih im Hotel?',
          translationPl: 'Dzień dobry, czy w hotelu jest ogrzewana narciarnia i wypożyczalnia nart?',
          timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString()
        },
        {
          id: 'm-5',
          role: 'admin',
          content: 'Guten Tag Herr Schmidt! Ja, wir haben einen kostenfreien beheizten Skiraum mit Skischuhtrocknern direkt im Erdgeschoss. Skiverleih ist direkt beim Lift Cypisek 100 m vom Hotel.',
          translationPl: 'Dzień dobry Panie Schmidt! Tak, mamy bezpłatną ogrzewaną narciarnię z suszarkami do butów narciarskich na parterze. Wypożyczalnia nart jest 100m od hotelu przy stoku Cypisek.',
          timestamp: new Date(Date.now() - 1000 * 60 * 3).toISOString()
        },
        {
          id: 'm-6',
          role: 'user',
          content: 'Vielen Dank, das ist sehr hilfreich!',
          translationPl: 'Bardzo dziękuję, to bardzo pomocne!',
          timestamp: new Date(Date.now() - 1000 * 60 * 1).toISOString()
        }
      ]
    }
  ]
]);

// Multi-language Translation Engine (using Gemini when available, or smart dictionary fallback)
export async function translateText(text: string, targetLang: 'pl' | 'en' | 'de' | 'sk', sourceLang = 'auto'): Promise<string> {
  if (!text || !text.trim()) return '';

  // 1. Try Gemini AI translation if key present
  if (aiClient) {
    try {
      const prompt = `Translate the following hotel hospitality message into ${
        targetLang === 'pl' ? 'Polish' : targetLang === 'en' ? 'English' : targetLang === 'de' ? 'German' : 'Slovak'
      }. Maintain mountain resort courtesy, natural tone and accuracy. Return ONLY the translated sentence with no commentary:\n\n"${text}"`;

      const res = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          temperature: 0.1,
          maxOutputTokens: 250
        }
      });

      const translated = res.text?.trim();
      if (translated && !translated.startsWith('Error')) {
        return translated.replace(/^["']|["']$/g, '');
      }
    } catch (err) {
      console.warn("Gemini translate error, using glossary fallback:", err);
    }
  }

  // 2. High quality fallback vocabulary rules
  const clean = text.trim();

  // If target is Polish
  if (targetLang === 'pl') {
    if (clean.includes('Dobrý deň') || clean.includes('Ahoj')) return clean.replace(/Dobrý deň|Ahoj/gi, 'Dzień dobry');
    if (clean.includes('Guten Tag') || clean.includes('Hallo')) return clean.replace(/Guten Tag|Hallo/gi, 'Dzień dobry');
    if (clean.includes('Good morning') || clean.includes('Hello')) return clean.replace(/Good morning|Hello/gi, 'Dzień dobry');
    return clean;
  }

  // If translating from Polish to Slovak
  if (targetLang === 'sk') {
    return clean
      .replace(/Dzień dobry/gi, 'Dobrý deň')
      .replace(/Dziękujemy/gi, 'Ďakujeme')
      .replace(/Do zobaczenia/gi, 'Dovidenia')
      .replace(/pokój/gi, 'izba')
      .replace(/jacuzzi/gi, 'vírivka')
      .replace(/śniadanie/gi, 'raňajky');
  }

  // If translating from Polish to German
  if (targetLang === 'de') {
    return clean
      .replace(/Dzień dobry/gi, 'Guten Tag')
      .replace(/Dziękujemy/gi, 'Vielen Dank')
      .replace(/Do zobaczenia/gi, 'Auf Wiedersehen')
      .replace(/pokój/gi, 'Zimmer')
      .replace(/jacuzzi/gi, 'Whirlpool')
      .replace(/śniadanie/gi, 'Frühstück');
  }

  // If translating to English
  if (targetLang === 'en') {
    return clean
      .replace(/Dzień dobry/gi, 'Hello')
      .replace(/Dziękujemy/gi, 'Thank you')
      .replace(/Do zobaczenia/gi, 'See you soon')
      .replace(/pokój/gi, 'room')
      .replace(/jacuzzi/gi, 'hot tub')
      .replace(/śniadanie/gi, 'breakfast');
  }

  return clean;
}

// POST /api/translate - Translation API
export async function handleTranslate(req: Request, res: Response) {
  try {
    const { text, targetLang = 'pl', sourceLang = 'auto' } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Brak tekstu do przetłumaczenia." });
    }
    const translated = await translateText(text, targetLang as any, sourceLang);
    return res.json({ original: text, targetLang, translated });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Błąd tłumaczenia." });
  }
}

// GET /api/admin/chats - List all active chat sessions
export async function handleGetChatSessions(_req: Request, res: Response) {
  try {
    const dbRows = await dbGetChatSessions();
    if (dbRows && dbRows.length > 0) {
      for (const row of dbRows) {
        let msgs: ChatMessageItem[] = [];
        try {
          msgs = JSON.parse(row.messagesJson);
        } catch (_) {}

        liveChatSessions.set(row.sessionId, {
          sessionId: row.sessionId,
          guestName: row.guestName,
          guestEmail: row.guestEmail || undefined,
          language: (row.language as any) || 'pl',
          isAiPaused: Boolean(row.isAiPaused),
          adminTakeover: Boolean(row.adminTakeover),
          lastMessage: row.lastMessage || '',
          lastMessageAt: row.lastMessageAt ? row.lastMessageAt.toISOString() : new Date().toISOString(),
          messages: msgs
        });
      }
    }
  } catch (err) {
    console.warn("DB getChatSessions fallback:", err);
  }

  const list = Array.from(liveChatSessions.values()).sort(
    (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
  );

  return res.json(list);
}

// GET /api/admin/chats/:sessionId - Get single conversation
export async function handleGetChatSession(req: Request, res: Response) {
  const { sessionId } = req.params;
  const session = liveChatSessions.get(sessionId);
  if (!session) {
    return res.status(404).json({ error: "Sesja czatu nie istnieje." });
  }
  return res.json(session);
}

// POST /api/admin/chats/:sessionId/takeover - Admin takes over or resumes AI
export async function handleToggleChatTakeover(req: Request, res: Response) {
  const { sessionId } = req.params;
  const { takeover, pauseAi } = req.body;

  let session = liveChatSessions.get(sessionId);
  if (!session) {
    session = {
      sessionId,
      guestName: 'Gość Watra Korbielów',
      language: 'pl',
      isAiPaused: false,
      adminTakeover: false,
      lastMessage: '',
      lastMessageAt: new Date().toISOString(),
      messages: []
    };
    liveChatSessions.set(sessionId, session);
  }

  const isAiPaused = pauseAi !== undefined ? Boolean(pauseAi) : (takeover !== undefined ? Boolean(takeover) : !session.isAiPaused);
  const adminTakeover = takeover !== undefined ? Boolean(takeover) : isAiPaused;

  session.isAiPaused = isAiPaused;
  session.adminTakeover = adminTakeover;
  session.lastMessageAt = new Date().toISOString();

  // Add system notice into message stream
  const systemNotice: ChatMessageItem = {
    id: `sys-${Date.now()}`,
    role: 'admin',
    content: adminTakeover
      ? '👤 Recepcja Watra Korbielów przejęła rozmowę. Odpowiadasz na żywo jako pracownik hotelu.'
      : '🤖 AI Concierge został ponownie uruchomiony dla tego gościa.',
    timestamp: new Date().toISOString()
  };
  session.messages.push(systemNotice);

  try {
    await dbUpsertChatSession({
      sessionId: session.sessionId,
      guestName: session.guestName,
      guestEmail: session.guestEmail,
      language: session.language,
      isAiPaused: session.isAiPaused,
      adminTakeover: session.adminTakeover,
      lastMessage: session.lastMessage,
      messagesJson: JSON.stringify(session.messages)
    });
  } catch (dbErr) {
    console.warn("DB save chat takeover fallback:", dbErr);
  }

  return res.json({ success: true, session });
}

// POST /api/admin/chats/:sessionId/message - Admin sends message to guest with auto-translation
export async function handleAdminSendMessage(req: Request, res: Response) {
  const { sessionId } = req.params;
  const { text, autoTranslate = true } = req.body;

  if (!text || !text.trim()) {
    return res.status(400).json({ error: "Wiadomość nie może być pusta." });
  }

  let session = liveChatSessions.get(sessionId);
  if (!session) {
    return res.status(404).json({ error: "Sesja nie istnieje." });
  }

  let translationGuest: string | undefined = undefined;
  if (autoTranslate && session.language !== 'pl') {
    translationGuest = await translateText(text.trim(), session.language, 'pl');
  }

  const newMsg: ChatMessageItem = {
    id: `admin-msg-${Date.now()}`,
    role: 'admin',
    content: text.trim(),
    translationPl: text.trim(), // Admin wrote in Polish
    translationGuest: translationGuest || text.trim(),
    timestamp: new Date().toISOString()
  };

  session.messages.push(newMsg);
  session.lastMessage = translationGuest || text.trim();
  session.lastMessageAt = new Date().toISOString();
  session.adminTakeover = true;
  session.isAiPaused = true;

  try {
    await dbUpsertChatSession({
      sessionId: session.sessionId,
      guestName: session.guestName,
      guestEmail: session.guestEmail,
      language: session.language,
      isAiPaused: session.isAiPaused,
      adminTakeover: session.adminTakeover,
      lastMessage: session.lastMessage,
      messagesJson: JSON.stringify(session.messages)
    });
  } catch (dbErr) {
    console.warn("DB save admin message fallback:", dbErr);
  }

  return res.status(201).json({ success: true, message: newMsg, session });
}
