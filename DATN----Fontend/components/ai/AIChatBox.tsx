import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Bot, User, Trash2, Sparkles, WifiOff, BookOpen, ChevronDown } from 'lucide-react';
import { api } from '../../services/api';
import ReactMarkdown from 'react-markdown';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Source {
  section?: string;
  preview?: string;
}

interface Message {
  role: 'user' | 'ai';
  content: string;
  timestamp: number;
  sources?: Source[];
  isError?: boolean;
}

interface AIChatBoxProps {
  planId: string | undefined;
  lessonTitle?: string;
  lessonContent?: string;
  dayNumber?: number;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const MAX_HISTORY_TURNS = 6; // số lượt hội thoại trước gửi lên backend
const STORAGE_PREFIX = 'ai_chat_';
const WELCOME_MSG = (title?: string): Message => ({
  role: 'ai',
  content: `Chào bạn! 👋 Tôi là trợ lý học tập AI${title ? ` cho bài **"${title}"**` : ''}.

Tôi có thể giúp bạn:
- 📖 Giải thích nội dung trong tài liệu
- 🔍 Tìm kiếm thông tin cụ thể
- 💡 Đặt câu hỏi ôn tập

Hãy hỏi tôi bất cứ điều gì về tài liệu này!`,
  timestamp: Date.now(),
});

// ─── Sub-components ──────────────────────────────────────────────────────────

const TypingIndicator: React.FC = () => (
  <div className="flex gap-3 animate-in fade-in slide-in-from-bottom-2">
    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center shrink-0">
      <Bot size={16} className="text-blue-400" />
    </div>
    <div className="bg-[#0f172a] px-5 py-4 rounded-[1.5rem] rounded-tl-none border border-slate-800">
      <div className="flex gap-1.5 items-center h-4">
        {[0, 1, 2].map(i => (
          <span
            key={i}
            className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </div>
    </div>
  </div>
);

const SourceBadges: React.FC<{ sources: Source[] }> = ({ sources }) => {
  if (!sources?.length) return null;
  const unique = [...new Set(sources.map(s => s.section).filter(Boolean))].slice(0, 3);
  if (!unique.length) return null;
  return (
    <div className="flex flex-wrap gap-1 mt-2">
      {unique.map((s, i) => (
        <span key={i} className="inline-flex items-center gap-1 text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full border border-slate-700">
          <BookOpen size={9} />
          {String(s).slice(0, 35)}
        </span>
      ))}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const AIChatBox: React.FC<AIChatBoxProps> = ({ planId, lessonTitle, lessonContent, dayNumber }) => {
  const storageKey = `${STORAGE_PREFIX}${planId}`;

  // ── Load from localStorage ──
  const loadMessages = useCallback((): Message[] => {
    if (!planId) return [WELCOME_MSG(lessonTitle)];
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed: Message[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [WELCOME_MSG(lessonTitle)];
  }, [planId, storageKey, lessonTitle]);

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>(loadMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ── Online/Offline tracking ──
  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => { window.removeEventListener('online', onOnline); window.removeEventListener('offline', onOffline); };
  }, []);

  // ── Persist to localStorage ──
  useEffect(() => {
    if (!planId) return;
    try {
      // Giữ tối đa 50 tin nhắn gần nhất
      const toSave = messages.slice(-50);
      localStorage.setItem(storageKey, JSON.stringify(toSave));
    } catch {}
  }, [messages, storageKey, planId]);

  // ── Auto scroll ──
  const scrollToBottom = useCallback((smooth = true) => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: smooth ? 'smooth' : 'auto' });
    }
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, isLoading]);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    setShowScrollBtn(scrollHeight - scrollTop - clientHeight > 150);
  };

  // ── Build conversation history for backend ──
  const buildHistory = (): Array<{ role: string; content: string }> => {
    const history: Array<{ role: string; content: string }> = [];
    const recent = messages.filter(m => !m.isError).slice(-MAX_HISTORY_TURNS * 2);
    for (const msg of recent) {
      history.push({ role: msg.role === 'user' ? 'user' : 'assistant', content: msg.content });
    }
    return history;
  };

  // ── Send message ──
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !planId || isLoading) return;

    if (!isOnline) {
      setMessages(prev => [...prev, {
        role: 'ai',
        content: '⚠️ Bạn đang offline. Vui lòng kiểm tra kết nối mạng.',
        timestamp: Date.now(),
        isError: true,
      }]);
      return;
    }

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg, timestamp: Date.now() }]);
    setIsLoading(true);

    try {
      const history = buildHistory();
      // Gửi kèm nội dung bài học hiện tại để AI trả lời chính xác
      const res = await api.ai.chat(userMsg, planId, history, lessonContent);
      const answer = res.data?.answer || res.answer || 'Xin lỗi, tôi không thể tìm thấy câu trả lời.';
      const sources: Source[] = res.data?.sources || res.sources || [];

      setMessages(prev => [...prev, {
        role: 'ai',
        content: answer,
        timestamp: Date.now(),
        sources,
      }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'ai',
        content: '❌ Kết nối với AI thất bại. Vui lòng thử lại.',
        timestamp: Date.now(),
        isError: true,
      }]);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  // ── Enter to send ──
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e as unknown as React.FormEvent);
    }
  };

  // ── Clear chat ──
  const clearChat = () => {
    if (window.confirm('Xóa toàn bộ lịch sử chat này?')) {
      const fresh = [WELCOME_MSG(lessonTitle)];
      setMessages(fresh);
      if (planId) localStorage.removeItem(storageKey);
    }
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-full bg-[#1e293b]/50 rounded-[2rem] border border-slate-800 overflow-hidden shadow-2xl">

      {/* ── Header ── */}
      <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-[#1e293b]">
        <div className="flex items-center gap-2">
          <div className="relative p-2 bg-blue-600 rounded-lg">
            <Sparkles size={16} className="text-white" />
            {/* Online dot */}
            <span className={`absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#1e293b] ${isOnline ? 'bg-emerald-400' : 'bg-slate-500'}`} />
          </div>
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-slate-300 block leading-none">AI Assistant</span>
            <span className={`text-[10px] ${isOnline ? 'text-emerald-400' : 'text-slate-500'}`}>
              {isOnline ? 'Trực tuyến' : <span className="flex items-center gap-1"><WifiOff size={9} />Ngoại tuyến</span>}
            </span>
          </div>
        </div>
        <button onClick={clearChat} title="Xóa lịch sử" className="p-2 text-slate-500 hover:text-red-400 transition-colors rounded-lg hover:bg-slate-800">
          <Trash2 size={15} />
        </button>
      </div>

      {/* ── Offline banner ── */}
      {!isOnline && (
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-900/80 border-b border-slate-800 text-slate-400 text-xs">
          <WifiOff size={12} />
          <span>Đang xem lịch sử chat — Cần mạng để gửi tin nhắn mới</span>
        </div>
      )}

      {/* ── Messages ── */}
      <div ref={scrollRef} onScroll={handleScroll} className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar relative">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} animate-in fade-in slide-in-from-bottom-2`}
          >
            {/* Avatar */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-lg mt-1
              ${msg.role === 'user' ? 'bg-blue-600' : msg.isError ? 'bg-red-900' : 'bg-slate-700'}`}>
              {msg.role === 'user' ? <User size={14} /> : <Bot size={14} className={msg.isError ? 'text-red-400' : 'text-blue-400'} />}
            </div>

            {/* Bubble */}
            <div className="flex flex-col gap-1 max-w-[85%]">
              <div className={`p-4 rounded-[1.5rem] text-sm leading-relaxed
                ${msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-none'
                  : msg.isError
                    ? 'bg-red-950/60 text-red-300 border border-red-900/50 rounded-tl-none'
                    : 'bg-[#0f172a] text-slate-300 border border-slate-800 rounded-tl-none'}`}>
                <div className="prose prose-invert prose-sm max-w-none">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
                {msg.sources && msg.sources.length > 0 && (
                  <SourceBadges sources={msg.sources} />
                )}
              </div>
              {/* Timestamp */}
              <span className={`text-[10px] text-slate-600 ${msg.role === 'user' ? 'text-right' : 'text-left'} px-1`}>
                {formatTime(msg.timestamp)}
              </span>
            </div>
          </div>
        ))}

        {isLoading && <TypingIndicator />}
      </div>

      {/* ── Scroll to bottom button ── */}
      {showScrollBtn && (
        <button
          onClick={() => scrollToBottom()}
          className="absolute bottom-20 right-6 p-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-500 transition-all animate-in fade-in"
        >
          <ChevronDown size={16} />
        </button>
      )}

      {/* ── Input ── */}
      <form onSubmit={handleSend} className="p-4 bg-[#1e293b] border-t border-slate-800">
        <div className="relative flex items-center">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isOnline ? 'Hỏi AI về bài học này... (Enter để gửi)' : 'Offline — không thể gửi tin nhắn'}
            disabled={isLoading || !isOnline}
            className="w-full bg-[#0f172a] border border-slate-700 text-white text-sm rounded-2xl py-4 pl-5 pr-14 outline-none focus:border-blue-500 transition-all placeholder:text-slate-600 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading || !isOnline}
            className={`absolute right-2 p-2.5 rounded-xl transition-all
              ${(!input.trim() || isLoading || !isOnline)
                ? 'text-slate-600 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-900/20'}`}
          >
            <Send size={16} />
          </button>
        </div>
        <p className="text-[9px] text-center text-slate-600 mt-2 uppercase font-bold tracking-tighter">
          AI có thể nhầm lẫn, hãy kiểm tra lại thông tin quan trọng.
        </p>
      </form>
    </div>
  );
};

export default AIChatBox;