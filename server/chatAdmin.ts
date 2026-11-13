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
  translationPl?: string;
  translationGuest?: string;
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
if (process.env.GEMINI_API_KEY) aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function translateText(text: string, targetLang: 'pl' | 'en' | 'de' | 'sk', sourceLang = 'auto'): Promise<string> {
  if (!text.trim()) return '';
  if (aiClient) {
    try {
      const prompt = `Translate the following hospitality message from ${sourceLang} into ${
        targetLang === 'pl' ? 'Polish' : targetLang === 'en' ? 'English' : targetLang === 'de' ? 'German' : 'Slovak'
      }. Return only the translation:\n\n${text}`;
      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: { temperature: 0.1, maxOutputTokens: 250 }
      });
      const translated = response.text?.trim();
      if (translated && !translated.startsWith('Error')) return translated.replace(/^["']|["']$/g, '');
      console.warn('Translation provider returned no translated text.');
    } catch (error) {
      console.warn('Translation provider failed; using the built-in phrase glossary.', error);
    }
  }

  const substitutions: Record<typeof targetLang, Array<[RegExp, string]>> = {
    pl: [[/Dobrý deň|Ahoj|Guten Tag|Hallo|Good morning|Hello/gi, 'Dzień dobry']],
    en: [[/Dzień dobry/gi, 'Hello'], [/Dziękujemy/gi, 'Thank you'], [/pokój/gi, 'room'], [/jacuzzi/gi, 'hot tub'], [/śniadanie/gi, 'breakfast']],
    de: [[/Dzień dobry/gi, 'Guten Tag'], [/Dziękujemy/gi, 'Vielen Dank'], [/pokój/gi, 'Zimmer'], [/jacuzzi/gi, 'Whirlpool'], [/śniadanie/gi, 'Frühstück']],
    sk: [[/Dzień dobry/gi, 'Dobrý deň'], [/Dziękujemy/gi, 'Ďakujeme'], [/pokój/gi, 'izba'], [/jacuzzi/gi, 'vírivka'], [/śniadanie/gi, 'raňajky']]
  };
  return substitutions[targetLang].reduce((result, [pattern, replacement]) => result.replace(pattern, replacement), text.trim());
}

export async function handleTranslate(req: Request, res: Response) {
  try {
    const { text, targetLang = 'pl', sourceLang = 'auto' } = req.body;
    if (!text) return res.status(400).json({ error: 'Brak tekstu do przetłumaczenia.' });
    if (!['pl', 'en', 'de', 'sk'].includes(targetLang)) {
      return res.status(400).json({ error: 'Nieobsługiwany język docelowy.' });
    }
    return res.json({ original: text, targetLang, translated: await translateText(text, targetLang, sourceLang) });
  } catch (error) {
    console.error('Translation failed:', error);
    return res.status(503).json({ error: 'Usługa tłumaczenia jest obecnie niedostępna.' });
  }
}

function mapChatSession(row: NonNullable<Awaited<ReturnType<typeof dbGetChatSession>>>): LiveChatSessionData {
  return {
    sessionId: row.sessionId,
    guestName: row.guestName,
    guestEmail: row.guestEmail || undefined,
    language: row.language as LiveChatSessionData['language'],
    isAiPaused: row.isAiPaused,
    adminTakeover: row.adminTakeover,
    lastMessage: row.lastMessage || '',
    lastMessageAt: row.lastMessageAt?.toISOString() || '',
    messages: JSON.parse(row.messagesJson) as ChatMessageItem[]
  };
}

export async function handleGetChatSessions(_req: Request, res: Response) {
  try {
    const rows = await dbGetChatSessions();
    return res.json(rows.map(mapChatSession));
  } catch (error) {
    console.error('Chat session list database query failed:', error);
    return res.status(503).json({ error: 'Nie udało się pobrać sesji czatu z bazy danych.' });
  }
}

export async function handleGetChatSession(req: Request, res: Response) {
  try {
    const row = await dbGetChatSession(req.params.sessionId);
    if (!row) return res.status(404).json({ error: 'Sesja czatu nie istnieje.' });
    return res.json(mapChatSession(row));
  } catch (error) {
    console.error('Chat session database query failed:', error);
    return res.status(503).json({ error: 'Nie udało się pobrać sesji czatu z bazy danych.' });
  }
}

export async function handleToggleChatTakeover(req: Request, res: Response) {
  try {
    const row = await dbGetChatSession(req.params.sessionId);
    if (!row) return res.status(404).json({ error: 'Sesja czatu nie istnieje.' });
    const session = mapChatSession(row);
    const { takeover, pauseAi } = req.body;
    session.isAiPaused = pauseAi !== undefined
      ? Boolean(pauseAi)
      : takeover !== undefined ? Boolean(takeover) : !session.isAiPaused;
    session.adminTakeover = takeover !== undefined ? Boolean(takeover) : session.isAiPaused;
    session.lastMessageAt = new Date().toISOString();
    session.messages.push({
      id: `sys-${Date.now()}`,
      role: 'admin',
      content: session.adminTakeover
        ? '👤 Recepcja Watra Korbielów przejęła rozmowę. Odpowiadasz na żywo jako pracownik hotelu.'
        : '🤖 AI Concierge został ponownie uruchomiony dla tego gościa.',
      timestamp: session.lastMessageAt
    });

    await dbUpsertChatSession({
      ...session,
      messagesJson: JSON.stringify(session.messages)
    });
    return res.json({ success: true, session });
  } catch (error) {
    console.error('Chat takeover database update failed:', error);
    return res.status(503).json({ error: 'Nie udało się zapisać ustawienia czatu w bazie danych.' });
  }
}

export async function handleAdminSendMessage(req: Request, res: Response) {
  try {
    const { text, autoTranslate = true } = req.body;
    if (typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ error: 'Wiadomość nie może być pusta.' });
    }

    const row = await dbGetChatSession(req.params.sessionId);
    if (!row) return res.status(404).json({ error: 'Sesja nie istnieje.' });
    const session = mapChatSession(row);
    const translationGuest = autoTranslate && session.language !== 'pl'
      ? await translateText(text.trim(), session.language, 'pl')
      : text.trim();
    const message: ChatMessageItem = {
      id: `admin-msg-${Date.now()}`,
      role: 'admin',
      content: text.trim(),
      translationPl: text.trim(),
      translationGuest,
      timestamp: new Date().toISOString()
    };
    session.messages.push(message);
    session.lastMessage = translationGuest;
    session.lastMessageAt = message.timestamp;
    session.adminTakeover = true;
    session.isAiPaused = true;
    await dbUpsertChatSession({ ...session, messagesJson: JSON.stringify(session.messages) });
    return res.status(201).json({ success: true, message, session });
  } catch (error) {
    console.error('Admin chat message database write failed:', error);
    return res.status(503).json({ error: 'Nie udało się zapisać wiadomości w bazie danych.' });
  }
}
