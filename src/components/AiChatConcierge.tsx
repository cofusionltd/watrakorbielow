import React, { useState, useRef, useEffect } from 'react';
import Markdown from 'react-markdown';
import { 
  X, 
  Send, 
  Bot, 
  Sparkles, 
  RefreshCw, 
  Check, 
  UserCheck, 
  Calendar, 
  Phone, 
  ExternalLink, 
  ChevronRight,
  UtensilsCrossed 
} from 'lucide-react';
import { ChatMessage, Language } from '../types';

interface AiChatConciergeProps {
  currentLang?: Language;
  onOpenBooking: () => void;
}

export const AiChatConcierge: React.FC<AiChatConciergeProps> = ({ currentLang = 'pl', onOpenBooking }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isAdminTakeover, setIsAdminTakeover] = useState(false);

  // Persistent session ID across page loads
  const [sessionId] = useState<string>(() => {
    let stored = '';
    try {
      stored = localStorage.getItem('watra_chat_session_id') || '';
    } catch (_) {}
    if (!stored) {
      stored = `watra-guest-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      try {
        localStorage.setItem('watra_chat_session_id', stored);
      } catch (_) {}
    }
    return stored;
  });

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: `🏔️ **Witaj w Watra Korbielów!**\n\nJestem Twoim wirtualnym asystentem AI. Chętnie odpowiem na wszelkie pytania o:\n• Dostępność i rezerwację pokoi (10% rabatu bezpośredniego)\n• Stok Pilsko i wyciąg narciarski Cypisek (100 m)\n• Gorące jacuzzi pod gwiazdami oraz saunę fińską\n• Regionalną restaurację i lokalne przysmaki Beskidów\n\nMożesz pisać w dowolnym języku (**Polski, English, Slovenčina, Deutsch**) – automatycznie odpowiem w Twoim języku! W czym mogę pomóc?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Real-time polling when open: receive live receptionist answers or takeover status
  useEffect(() => {
    if (!isOpen) return;

    const pollSession = async () => {
      try {
        const res = await fetch(`/api/chat/session/${sessionId}`);
        if (!res.ok) {
          if (res.status === 404) return;
          return;
        }

        const sessionData = await res.json();
        if (sessionData) {
          setIsAdminTakeover(!!sessionData.adminTakeover);
          if (Array.isArray(sessionData.messages) && sessionData.messages.length > 0) {
            // Map to ChatMessage format if new admin replies arrived
            const mapped: ChatMessage[] = sessionData.messages.map((m: any) => ({
              id: m.id,
              sender: m.role === 'user' ? 'user' : 'assistant',
              text: (m.role === 'admin' && m.translationGuest) ? m.translationGuest : m.content,
              timestamp: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }));
            setMessages(prev => {
              // If remote session has more messages, synchronize
              if (mapped.length > prev.length) {
                return mapped;
              }
              return prev;
            });
          }
        }
      } catch (_) {}
    };

    pollSession();
    const interval = setInterval(pollSession, 3000);
    return () => clearInterval(interval);
  }, [isOpen, sessionId]);

  const quickPrompts = [
    { 
      langTag: '⛷️ Stok Pilsko',
      label: 'Wyciągi i 100 m do Cypiska', 
      query: 'Jak blisko od ośrodka Watra Korbielów znajdują się wyciągi narciarskie i stok Pilsko?' 
    },
    { 
      langTag: '🛁 Wellness',
      label: 'Zewnętrzne jacuzzi & sauna', 
      query: 'Jak działa zewnętrzne jacuzzi całoroczne pod gwiazdami i sauna fińska? Czy trzeba rezerwować?' 
    },
    { 
      langTag: '💰 Rezerwacja',
      label: 'Rabat -10% i parking', 
      query: 'Jakie korzyści i rabat otrzymam przy bezpośredniej rezerwacji na stronie internetowej?' 
    },
    { 
      langTag: '🍲 Restauracja',
      label: 'Kwaśnica & regionalne dania', 
      query: 'Jakie dania regionalne serwuje restauracja Watra i w jakich godzinach są śniadania?' 
    },
    { 
      langTag: '🇬🇧 EN',
      label: 'Ski slopes & room amenities', 
      query: 'How close is Watra Korbielów to the ski slopes and what amenities are included in the rooms?' 
    },
    { 
      langTag: '🇸🇰 SK',
      label: 'Vzdialenosť a vírivka', 
      query: 'Ako ďaleko je ośrodek od slovenských hraníc a kedy funguje vonkajšia vírivka?' 
    },
    { 
      langTag: '🇩🇪 DE',
      label: 'Direktbuchung Rabatt', 
      query: 'Welchen Rabatt und welche Vorteile erhalte ich bei einer Direktbuchung auf der Website?' 
    }
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || input.trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          conversationHistory: messages.slice(-6),
          preferredLang: currentLang,
          sessionId,
          guestName: 'Gość Resortu Watra'
        })
      });

      const data = await response.json();
      if (data.adminTakeover) {
        setIsAdminTakeover(true);
      }
      const botReply = data.reply || "Dziękujemy za kontakt. Nasza recepcja służy pomocą również pod numerem +48 511 660 511.";

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: botReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: "Przepraszam, wystąpił chwilowy problem z połączeniem. W razie pilnych pytań recepcja jest dostępna pod numerem telefonu +48 511 660 511.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: 'welcome-reset',
        sender: 'assistant',
        text: "Rozmowa zresetowana.\n\nNapisz w dowolnym języku (Polski, English, Slovenčina, Deutsch) – chętnie odpowiem na wszelkie pytania o nasz resort!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  return (
    <>
      {/* Floating Toggle Button - Clean AI Concierge Box without PL.EN.SK.DE */}
      {!isOpen && (
        <button
          id="open-ai-chat-concierge-btn"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40 bg-[#1E3A2B] hover:bg-[#2A4F3B] text-white px-4 py-3 rounded-full shadow-2xl border-2 border-[#D4A373] flex items-center space-x-2.5 transition-all duration-300 hover:scale-105 active:scale-95 group cursor-pointer"
          aria-label="Open AI Concierge Chatbot"
        >
          <div className="relative">
            <Bot className="w-5 h-5 sm:w-6 sm:h-6 text-[#D4A373]" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>
          <div className="flex items-center pr-1">
            <span className="font-bold text-xs sm:text-sm tracking-wider uppercase text-[#F9F8F6]">
              AI Concierge
            </span>
          </div>
        </button>
      )}

      {/* Chat Window Panel */}
      {isOpen && (
        <div
          id="ai-chat-concierge-panel"
          className="fixed bottom-3 sm:bottom-6 right-2 sm:right-6 z-50 w-[calc(100vw-16px)] sm:w-[440px] h-[600px] max-h-[88vh] bg-white rounded-3xl shadow-2xl border border-neutral-300 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200"
        >
          {/* Header */}
          <div className="bg-[#1E3A2B] text-white px-4 py-3 flex items-center justify-between border-b border-[#2A4F3B]">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-full bg-[#D4A373] text-[#14281E] flex items-center justify-center font-bold shadow-sm shrink-0">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <h3 className="font-serif font-bold text-sm text-[#F9F8F6]">
                    Watra AI Concierge
                  </h3>
                  <span className="bg-emerald-500/20 text-emerald-300 text-[9px] font-bold px-1.5 py-0.5 rounded border border-emerald-400/30">
                    Chatbot AI
                  </span>
                </div>
                <div className="flex items-center space-x-1.5 text-[10px] text-[#D4A373]">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>Wirtualny Asystent • Odpowiada w każdym języku</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={handleResetChat}
                title="Wyczyść rozmowę"
                className="text-white/60 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Zamknij czat"
                className="text-white/60 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Subheader info strip */}
          {isAdminTakeover ? (
            <div className="bg-amber-100/90 px-3.5 py-2 border-b border-amber-300 flex items-center justify-between text-xs text-amber-950 font-medium">
              <div className="flex items-center space-x-2">
                <UserCheck className="w-4 h-4 text-amber-800 shrink-0" />
                <span className="text-[11px] font-bold">Połączono bezpośrednio z żywą recepcją Watra Korbielów</span>
              </div>
              <span className="text-[10px] bg-amber-200 px-1.5 py-0.5 rounded font-bold uppercase">Na żywo</span>
            </div>
          ) : (
            <div className="bg-[#F9F8F6] px-3.5 py-2 border-b border-neutral-200 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-1.5 text-neutral-600 text-[11px]">
                <Sparkles className="w-3.5 h-3.5 text-[#D4A373]" />
                <span>Zadaj pytanie o resort, stoki narciarskie lub rezerwację</span>
              </div>

              <button
                onClick={onOpenBooking}
                className="bg-[#1E3A2B] hover:bg-[#2A4F3B] text-[#D4A373] px-2 py-0.5 rounded-md font-bold text-[10px] uppercase tracking-wider transition-colors cursor-pointer"
              >
                Rabat -10%
              </button>
            </div>
          )}

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 bg-neutral-50/60">
            {messages.map((msg) => {
              const isAssistant = msg.sender === 'assistant';
              const textLower = msg.text.toLowerCase();
              const hasBookingMention = isAssistant && (
                textLower.includes('rezerwac') || 
                textLower.includes('rabat') || 
                textLower.includes('10%') || 
                textLower.includes('dostępn') ||
                textLower.includes('booking')
              );
              const hasPhoneMention = isAssistant && (
                textLower.includes('telefon') || 
                textLower.includes('511 660') || 
                textLower.includes('recepcj')
              );
              const hasMenuMention = isAssistant && (
                textLower.includes('kwaśnic') || 
                textLower.includes('karcie') || 
                textLower.includes('menu') || 
                textLower.includes('śniadani')
              );

              return (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[92%] sm:max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed relative group transition-all ${
                      msg.sender === 'user'
                        ? 'bg-[#1E3A2B] text-white rounded-tr-xs shadow-sm'
                        : 'bg-white text-neutral-800 border border-neutral-200/90 shadow-xs rounded-tl-xs'
                    }`}
                  >
                    {isAssistant ? (
                      <div className="prose-chat text-neutral-800">
                        <Markdown
                          components={{
                            p: ({ children }) => (
                              <p className="mb-2 last:mb-0 leading-relaxed text-[12px] text-neutral-800">
                                {children}
                              </p>
                            ),
                            strong: ({ children }) => (
                              <strong className="font-bold text-[#1E3A2B] bg-[#D4A373]/15 px-1 py-0.5 rounded text-[11.5px]">
                                {children}
                              </strong>
                            ),
                            ul: ({ children }) => (
                              <ul className="my-2 space-y-1.5 pl-0.5">
                                {children}
                              </ul>
                            ),
                            ol: ({ children }) => (
                              <ol className="my-2 space-y-1.5 pl-4 list-decimal text-[12px]">
                                {children}
                              </ol>
                            ),
                            li: ({ children }) => (
                              <li className="flex items-start space-x-1.5 text-[12px] text-neutral-800 leading-snug">
                                <span className="text-[#D4A373] font-bold text-xs select-none shrink-0 mt-0.5">•</span>
                                <span className="flex-1">{children}</span>
                              </li>
                            ),
                            h1: ({ children }) => (
                              <h3 className="font-serif font-bold text-[13px] text-[#1E3A2B] mt-2.5 mb-1 border-b border-neutral-100 pb-0.5">
                                {children}
                              </h3>
                            ),
                            h2: ({ children }) => (
                              <h4 className="font-serif font-bold text-[12.5px] text-[#1E3A2B] mt-2 mb-1">
                                {children}
                              </h4>
                            ),
                            h3: ({ children }) => (
                              <h5 className="font-sans font-bold text-[12px] text-amber-900 mt-1.5 mb-0.5">
                                {children}
                              </h5>
                            ),
                            code: ({ children }) => (
                              <code className="bg-neutral-100 text-amber-900 font-mono text-[11px] px-1 py-0.5 rounded border border-neutral-200">
                                {children}
                              </code>
                            ),
                            table: ({ children }) => (
                              <div className="overflow-x-auto my-2 rounded-lg border border-neutral-200">
                                <table className="min-w-full divide-y divide-neutral-200 text-[11px] text-neutral-700">
                                  {children}
                                </table>
                              </div>
                            ),
                            th: ({ children }) => (
                              <th className="bg-neutral-100 px-2 py-1 font-bold text-[#1E3A2B] text-left text-[11px]">
                                {children}
                              </th>
                            ),
                            td: ({ children }) => (
                              <td className="px-2 py-1 border-t border-neutral-100 text-[11px]">
                                {children}
                              </td>
                            ),
                            a: ({ href, children }) => (
                              <a
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#1E3A2B] font-semibold underline decoration-[#D4A373] hover:text-[#D4A373]"
                              >
                                {children}
                              </a>
                            )
                          }}
                        >
                          {msg.text}
                        </Markdown>

                        {/* Interactive Contextual Action Chips */}
                        {(hasBookingMention || hasPhoneMention || hasMenuMention) && (
                          <div className="mt-3 pt-2 border-t border-neutral-100 flex flex-wrap gap-1.5">
                            {hasBookingMention && (
                              <button
                                onClick={onOpenBooking}
                                className="inline-flex items-center space-x-1.5 bg-[#1E3A2B] text-[#D4A373] hover:bg-[#2A4F3B] px-2.5 py-1 rounded-lg text-[10.5px] font-bold shadow-2xs transition-colors cursor-pointer"
                              >
                                <Calendar className="w-3 h-3" />
                                <span>Rezerwuj z rabatem 10%</span>
                              </button>
                            )}

                            {hasPhoneMention && (
                              <a
                                href="tel:+48511660511"
                                className="inline-flex items-center space-x-1 bg-amber-50 border border-amber-200 text-amber-900 hover:bg-amber-100 px-2.5 py-1 rounded-lg text-[10.5px] font-bold shadow-2xs transition-colors cursor-pointer"
                              >
                                <Phone className="w-3 h-3 text-amber-700" />
                                <span>Zadzwoń do recepcji</span>
                              </a>
                            )}

                            {hasMenuMention && (
                              <a
                                href="#/restauracja"
                                className="inline-flex items-center space-x-1 bg-neutral-100 border border-neutral-200 text-neutral-800 hover:bg-neutral-200 px-2.5 py-1 rounded-lg text-[10.5px] font-semibold shadow-2xs transition-colors cursor-pointer"
                              >
                                <UtensilsCrossed className="w-3 h-3 text-[#D4A373]" />
                                <span>Karta Dań</span>
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="whitespace-pre-line break-words text-white text-[12px]">
                        {msg.text}
                      </div>
                    )}

                    <div className={`flex items-center justify-between mt-2 pt-1 border-t text-[9px] ${
                      isAssistant ? 'border-neutral-100 text-neutral-400' : 'border-white/10 text-white/60'
                    }`}>
                      <span>{msg.timestamp}</span>
                      {isAssistant && (
                        <button
                          onClick={() => handleCopy(msg.id, msg.text)}
                          className="hover:text-[#1E3A2B] flex items-center space-x-0.5 cursor-pointer ml-2 text-neutral-500 font-medium transition-colors"
                          title="Skopiuj treść"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-2.5 h-2.5 text-emerald-600" />
                              <span className="text-emerald-600">Skopiowano</span>
                            </>
                          ) : (
                            <span>Kopiuj</span>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-neutral-200 rounded-2xl p-3 text-xs text-neutral-500 shadow-xs flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-[#1E3A2B] animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-[#D4A373] animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 rounded-full bg-[#C86D51] animate-bounce [animation-delay:0.4s]" />
                  <span className="text-[11px] font-medium text-neutral-600">
                    Wykrywanie języka i generowanie odpowiedzi...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick multilingual suggestions carousel */}
          <div className="px-3 py-1.5 bg-white border-t border-neutral-200 overflow-x-auto scrollbar-none flex space-x-1.5 shrink-0">
            {quickPrompts.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(item.query)}
                className="whitespace-nowrap text-[10px] bg-neutral-100 hover:bg-[#D4A373]/20 hover:border-[#D4A373] text-neutral-800 px-2.5 py-1 rounded-full border border-neutral-200 transition-colors shrink-0 cursor-pointer flex items-center space-x-1"
              >
                <span className="font-bold text-[#1E3A2B]">{item.langTag}</span>
                <span>•</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          {/* Input field with dynamic multilingual placeholder */}
          <div className="p-2.5 bg-white border-t border-neutral-200 flex items-center space-x-2">
            <input
              type="text"
              placeholder="Napisz po polsku, in English, po slovensky, auf Deutsch..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              className="flex-1 bg-[#F9F8F6] border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-800 placeholder-neutral-400 focus:outline-hidden focus:border-[#1E3A2B]"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!input.trim() || isLoading}
              className="bg-[#1E3A2B] hover:bg-[#2A4F3B] disabled:opacity-40 text-white p-2 rounded-xl transition-all shadow-xs cursor-pointer shrink-0"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
