import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  User,
  Radio,
  Power,
  Play,
  Square,
  Send,
  Languages,
  RefreshCw,
  Clock,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Volume2,
  ShieldCheck,
  MessageSquare
} from 'lucide-react';
import { Language, LiveChatSession } from '../../types';
import { adminFetch } from '../../lib/adminApi';
import { adminText } from '../../adminTranslations';

const QUICK_PHRASES = [
  'Dzień dobry! W czym możemy Państwu dzisiaj pomóc?',
  'Państwa pokój jest już gotowy do zameldowania (od godz. 14:00).',
  'Zewnętrzne jacuzzi z widokiem na Pilsko jest nagrzane do 38°C i gotowe.',
  'Zapraszamy na gorącą kwaśnicę i dania regionalne do naszej Karczmy Watra!',
  'Wyciągi Cypisek i Andiamo znajdują się zaledwie 100m od wejścia do resortu.'
];

export const AdminLiveChatManager: React.FC<{ lang: Language }> = ({ lang }) => {
  const [sessions, setSessions] = useState<LiveChatSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [adminMessage, setAdminMessage] = useState('');
  const [autoTranslate, setAutoTranslate] = useState(true);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const shouldAutoScrollRef = useRef(true);

  const fetchSessions = async (silently = false) => {
    if (!silently) setIsLoading(true);
    try {
      const res = await adminFetch('/api/admin/chats');
      if (res.ok) {
        const data: LiveChatSession[] = await res.json();
        setSessions(data);
        setSelectedSessionId(currentId =>
          currentId && data.some(session => session.sessionId === currentId)
            ? currentId
            : data[0]?.sessionId ?? null
        );
      }
    } catch (err) {
      console.error('Failed to fetch chat sessions:', err);
    } finally {
      if (!silently) setIsLoading(false);
    }
  };

  // Poll chat sessions every 3 seconds for real-time responsiveness
  useEffect(() => {
    fetchSessions();
    const interval = setInterval(() => {
      fetchSessions(true);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const selectedSession = sessions.find(s => s.sessionId === selectedSessionId) || null;

  useEffect(() => {
    const messagesContainer = messagesContainerRef.current;
    if (messagesContainer && shouldAutoScrollRef.current) {
      messagesContainer.scrollTo({ top: messagesContainer.scrollHeight, behavior: 'smooth' });
    }
  }, [selectedSessionId, selectedSession?.messages.length]);

  const handleToggleTakeover = async (session: LiveChatSession) => {
    const nextTakeover = !session.adminTakeover;
    try {
      const res = await adminFetch(`/api/admin/chats/${session.sessionId}/takeover`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          takeover: nextTakeover,
          pauseAi: nextTakeover
        })
      });

      if (res.ok) {
        const data = await res.json();
        setSessions(prev =>
          prev.map(s =>
            s.sessionId === session.sessionId
              ? { ...s, adminTakeover: nextTakeover, isAiPaused: nextTakeover }
              : s
          )
        );
        setActionNotice(
          nextTakeover
            ? adminText(lang, '🛑 AI zostało zatrzymane. Przejąłeś rozmowę z gościem "{guest}"!').replace('{guest}', session.guestName)
            : adminText(lang, '▶️ AI Concierge wznowione dla gościa "{guest}".').replace('{guest}', session.guestName)
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendAdminReply = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedSession || !adminMessage.trim() || isSending) return;

    setIsSending(true);
    try {
      const res = await adminFetch(`/api/admin/chats/${selectedSession.sessionId}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: adminMessage.trim(),
          autoTranslate
        })
      });

      if (res.ok) {
        const data = await res.json();
        // Update local session
        setSessions(prev =>
          prev.map(s => {
            if (s.sessionId === selectedSession.sessionId) {
              return {
                ...s,
                adminTakeover: true,
                isAiPaused: true,
                lastMessage: adminMessage.trim(),
                lastMessageAt: new Date().toISOString(),
                messages: [...s.messages, data.adminMessage]
              };
            }
            return s;
          })
        );
        setAdminMessage('');
        setActionNotice(
          autoTranslate && selectedSession.language !== 'pl'
            ? adminText(lang, 'Wysłano odpowiedź przetłumaczoną na język ({language})!').replace('({language})', `(${selectedSession.language.toUpperCase()})`)
            : adminText(lang, 'Wysłano wiadomość z recepcji!')
        );
      }
    } catch (err) {
      console.error('Failed to send admin message:', err);
    } finally {
      setIsSending(false);
    }
  };

  const getLanguageDetails = (lang: string) => {
    switch (lang) {
      case 'sk': return { flag: '🇸🇰', name: 'Slovenčina' };
      case 'de': return { flag: '🇩🇪', name: 'Deutsch' };
      case 'en': return { flag: '🇬🇧', name: 'English' };
      default: return { flag: '🇵🇱', name: 'Polski' };
    }
  };
  const locale = { pl: 'pl-PL', en: 'en-GB', sk: 'sk-SK', de: 'de-DE' }[lang];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl shadow-sm border border-stone-200">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold text-stone-900">{adminText(lang, 'Rozmowy na Żywo & AI Concierge')}</h2>
            <span className="flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold bg-emerald-100 text-emerald-900 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              {adminText(lang, 'Synchronizacja na Żywo')}
            </span>
          </div>
          <p className="text-sm text-stone-600 mt-1">
            {adminText(lang, 'Podglądaj na bieżąco rozmowy gości z AI Concierge. W dowolnym momencie możesz zatrzymać AI, przejąć rozmowę i pisać po polsku z automatycznym tłumaczeniem na język gościa.')}
          </p>
        </div>
        <button
          onClick={() => fetchSessions()}
          className="flex items-center gap-2 px-3 py-2 text-stone-700 bg-stone-100 hover:bg-stone-200 text-xs font-semibold rounded-xl transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          {adminText(lang, 'Odśwież')}
        </button>
      </div>

      {/* Notice */}
      {actionNotice && (
        <div className="flex items-center justify-between p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-amber-700" />
            <span>{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="text-amber-700 hover:text-amber-900">✕</button>
        </div>
      )}

      {/* Main Split: Sessions list (Left) + Active Conversation & Controls (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Active sessions list */}
        <div className="lg:col-span-4 space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-stone-500 px-1">
            {adminText(lang, 'Otwarte Rozmowy')} ({sessions.length})
          </h3>

          <div className="space-y-2.5 max-h-[680px] overflow-y-auto pr-1">
            {sessions.length === 0 ? (
              <div className="p-8 text-center text-stone-400 bg-white rounded-2xl border border-stone-200">
                <Bot className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                <p className="text-xs">{adminText(lang, 'Brak aktywnych sesji czatu w tym momencie.')}</p>
              </div>
            ) : (
              sessions.map((s) => {
                const isSelected = selectedSessionId === s.sessionId;
                const guestLanguage = getLanguageDetails(s.language);
                return (
                  <div
                    key={s.sessionId}
                    onClick={() => setSelectedSessionId(s.sessionId)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-50/80 border-amber-800/40 shadow-sm ring-1 ring-amber-800/20'
                        : 'bg-white border-stone-200 hover:border-stone-300 hover:bg-stone-50/70'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <span className="text-base" title={guestLanguage.name}>{guestLanguage.flag}</span>
                        <div>
                          <span className="font-bold text-stone-900 text-sm">{s.guestName}</span>
                          <span className="text-[11px] text-stone-500 block">
                            {new Date(s.lastMessageAt).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>

                      {s.adminTakeover ? (
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-200 text-amber-900 rounded-full">
                          👤 {adminText(lang, 'Recepcja')}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded-full flex items-center gap-1">
                          <Bot className="w-3 h-3" /> AI
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-stone-600 line-clamp-2 mt-2 font-normal">
                      {s.lastMessage || adminText(lang, 'Brak wiadomości')}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Selected Conversation View */}
        <div className="lg:col-span-8">
          {selectedSession ? (
            <div className="bg-white rounded-2xl border border-stone-200 shadow-sm flex flex-col h-[700px] overflow-hidden">
              {/* Header with Takeover Button */}
              <div className="p-4 sm:p-5 bg-stone-50 border-b border-stone-200 flex flex-wrap justify-between items-center gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center text-lg">
                    {getLanguageDetails(selectedSession.language).flag}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-stone-900">{selectedSession.guestName}</h3>
                      <span className="text-xs text-stone-500 font-medium">
                        ({getLanguageDetails(selectedSession.language).name})
                      </span>
                    </div>
                    <span className="text-xs text-stone-500">
                      {adminText(lang, 'ID Sesji:')} <code className="font-mono text-[11px] bg-stone-200 px-1 rounded">{selectedSession.sessionId}</code>
                    </span>
                  </div>
                </div>

                {/* Big Action Button: Stop AI / Resume AI */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleTakeover(selectedSession)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                      selectedSession.adminTakeover
                        ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
                        : 'bg-rose-700 hover:bg-rose-800 text-white animate-pulse'
                    }`}
                  >
                    {selectedSession.adminTakeover ? (
                      <>
                        <Play className="w-3.5 h-3.5" />
                        {adminText(lang, 'Wznów AI Concierge')}
                      </>
                    ) : (
                      <>
                        <Square className="w-3.5 h-3.5 fill-white" />
                        {adminText(lang, 'Zatrzymaj AI i Przejmij Rozmowę')}
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Message Stream */}
              <div
                ref={messagesContainerRef}
                onScroll={(event) => {
                  const container = event.currentTarget;
                  shouldAutoScrollRef.current = container.scrollHeight - container.scrollTop - container.clientHeight < 48;
                }}
                className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-stone-50/40"
              >
                {selectedSession.messages.map((msg, idx) => {
                  const isGuest = msg.role === 'user';
                  const isAdmin = msg.role === 'admin';
                  const isAi = msg.role === 'model';

                  return (
                    <div
                      key={msg.id || idx}
                      className={`flex flex-col ${isGuest ? 'items-start' : 'items-end'}`}
                    >
                      <div className="flex items-center gap-1.5 mb-1 px-1">
                        <span className="text-[11px] font-bold text-stone-500">
                          {isGuest
                            ? `👤 ${selectedSession.guestName}`
                            : isAdmin
                            ? adminText(lang, '👑 Recepcja (Ty)')
                            : '🤖 AI Alpine Concierge'}
                        </span>
                        <span className="text-[10px] text-stone-400">
                          {new Date(msg.timestamp).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div
                        className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-xs ${
                          isGuest
                            ? 'bg-white text-stone-900 border border-stone-200 rounded-tl-sm'
                            : isAdmin
                            ? 'bg-amber-800 text-white rounded-tr-sm'
                            : 'bg-emerald-900 text-emerald-50 rounded-tr-sm'
                        }`}
                      >
                        {/* Message content */}
                        <div className="whitespace-pre-wrap">{msg.content}</div>

                        {/* Automatic Polish translation for foreign guest messages */}
                        {isGuest && msg.translationPl && selectedSession.language !== 'pl' && (
                          <div className="mt-2.5 pt-2 border-t border-stone-200 text-xs text-amber-900 bg-amber-50/80 p-2 rounded-lg font-medium flex items-start gap-1.5">
                            <Languages className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-bold block text-[11px] uppercase tracking-wider text-amber-800">
                                {adminText(lang, '🇵🇱 Automatyczne Tłumaczenie dla Recepcji:')}
                              </span>
                              <span>{msg.translationPl}</span>
                            </div>
                          </div>
                        )}

                        {/* Translation shown to guest if admin responded with translation */}
                        {isAdmin && msg.translationGuest && selectedSession.language !== 'pl' && (
                          <div className="mt-2.5 pt-2 border-t border-amber-700/50 text-xs text-amber-100 bg-amber-900/40 p-2 rounded-lg font-medium">
                            <span className="font-bold block text-[11px] uppercase tracking-wider text-amber-200">
                              {adminText(lang, '🌐 Wysłano do gościa w języku ({language}):').replace('({language})', `(${selectedSession.language.toUpperCase()})`)}
                            </span>
                            <span>{msg.translationGuest}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Quick response suggestions */}
              <div className="px-4 py-2 bg-stone-100/70 border-t border-stone-200 flex items-center gap-1.5 overflow-x-auto whitespace-nowrap">
                <span className="text-[11px] font-bold text-stone-500 shrink-0">{adminText(lang, 'Szybkie zwroty:')}</span>
                {QUICK_PHRASES.map((phrase, i) => (
                  <button
                    key={i}
                    onClick={() => setAdminMessage(phrase)}
                    className="px-2.5 py-1 text-xs bg-white text-stone-700 hover:bg-stone-50 border border-stone-300 rounded-lg shrink-0 transition-colors"
                  >
                    {adminText(lang, phrase).slice(0, 32)}...
                  </button>
                ))}
              </div>

              {/* Admin reply input */}
              <form onSubmit={handleSendAdminReply} className="p-4 bg-white border-t border-stone-200 space-y-3">
                <div className="flex items-center justify-between text-xs text-stone-600">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoTranslate}
                      onChange={(e) => setAutoTranslate(e.target.checked)}
                      className="w-3.5 h-3.5 text-amber-800 rounded"
                    />
                    <Languages className="w-3.5 h-3.5 text-amber-800" />
                    <span>
                      {adminText(lang, 'Tłumacz z polskiego na język gościa (')}
                      <strong>{getLanguageDetails(selectedSession.language).name}</strong>)
                    </span>
                  </label>

                  <span className="text-[11px] text-stone-500">
                    {adminText(lang, 'Piszesz jako:')} <strong>Recepcja Watra Korbielów</strong>
                  </span>
                </div>

                <div className="flex gap-2">
                  <textarea
                    rows={2}
                    value={adminMessage}
                    onChange={(e) => setAdminMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendAdminReply();
                      }
                    }}
                    placeholder={
                      selectedSession.adminTakeover
                        ? adminText(lang, 'Napisz odpowiedź po polsku (AI nie odpowie, Ty prowadzisz rozmowę)...')
                        : adminText(lang, 'Napisz odpowiedź (wysłanie wiadomości automatycznie przejmie rozmowę z AI)...')
                    }
                    className="flex-1 px-3.5 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-700 resize-none"
                  />
                  <button
                    type="submit"
                    disabled={isSending || !adminMessage.trim()}
                    className="px-5 bg-amber-800 hover:bg-amber-900 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Send className="w-4 h-4" />
                    {adminText(lang, 'Wyślij')}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-stone-200 p-16 text-center text-stone-400">
              {adminText(lang, 'Wybierz sesję rozmowy z listy po lewej, aby zobaczyć wiadomości.')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
