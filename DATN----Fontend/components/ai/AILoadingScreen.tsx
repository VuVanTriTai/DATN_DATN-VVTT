import React, { useState, useEffect, useRef } from 'react';

// Giai đoạn khi tạo khoá học (không bao gồm quiz)
const COURSE_STAGES = [
  { label: 'Tải lên & trích xuất tài liệu', sub: 'Đọc nội dung PDF/DOCX, nhận dạng cấu trúc...', icon: '📄' },
  { label: 'Phân tích & chia đoạn nội dung', sub: 'AI phân loại chủ đề, xây dựng outline lộ trình...', icon: '🗂️' },
  { label: 'Viết nội dung từng bài học', sub: 'RAG tổng hợp kiến thức từ tài liệu cho từng ngày...', icon: '✍️' },
  { label: 'Lưu lộ trình vào hệ thống', sub: 'Khởi tạo tiến độ học tập và cấu trúc bài...', icon: '💾' },
];

interface AILoadingScreenProps {
  isVisible: boolean;
  title?: string;
}

const AILoadingScreen: React.FC<AILoadingScreenProps> = ({ isVisible, title }) => {
  const [elapsed, setElapsed] = useState(0);        // giây đã trôi
  const [stageIdx, setStageIdx] = useState(0);      // giai đoạn hiển thị hiện tại
  const [dots, setDots] = useState('');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stageRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isVisible) {
      setElapsed(0);
      setStageIdx(0);
      return;
    }

    // Đồng hồ đếm giây thực tế
    timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);

    // Chuyển giai đoạn mỗi ~8s (4 giai đoạn × 8s = 32s tổng hiển thị)
    let idx = 0;
    stageRef.current = setInterval(() => {
      idx = Math.min(idx + 1, COURSE_STAGES.length - 1);
      setStageIdx(idx);
    }, 8000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (stageRef.current) clearInterval(stageRef.current);
    };
  }, [isVisible]);

  // Dots animation
  useEffect(() => {
    if (!isVisible) return;
    const id = setInterval(() => setDots(d => d.length >= 3 ? '' : d + '.'), 420);
    return () => clearInterval(id);
  }, [isVisible]);

  if (!isVisible) return null;

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 z-[200] bg-[#060d1a] flex items-center justify-center p-4">
      {/* Bg glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-blue-700/6 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-700/6 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.4s' }} />
      </div>

      <div className="relative w-full max-w-md space-y-8">

        {/* Icon */}
        <div className="flex flex-col items-center gap-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-600 to-violet-700 flex items-center justify-center text-3xl shadow-2xl shadow-blue-900/40">
              🤖
            </div>
            <svg className="absolute -inset-3 w-[calc(100%+24px)] h-[calc(100%+24px)]" viewBox="0 0 104 104">
              <circle cx="52" cy="52" r="48" fill="none" stroke="rgba(99,102,241,0.3)" strokeWidth="1.5"
                strokeDasharray="301" strokeDashoffset="0"
                style={{ transformOrigin: 'center', animation: 'spin 3s linear infinite' }} />
            </svg>
          </div>

          <div className="text-center space-y-1">
            <h1 className="text-2xl font-black text-white">AI đang tạo lộ trình học tập</h1>
            {title && (
              <p className="text-blue-400 font-bold text-sm truncate max-w-xs">"{title}"</p>
            )}
          </div>
        </div>

        {/* Stage card */}
        <div className="bg-[#0f1a2e] border border-blue-900/40 rounded-3xl p-6 space-y-5">
          {COURSE_STAGES.map((s, i) => {
            const isDone = i < stageIdx;
            const isActive = i === stageIdx;
            return (
              <div key={i} className={`flex items-start gap-4 transition-all duration-500
                ${isActive ? 'opacity-100' : isDone ? 'opacity-50' : 'opacity-20'}`}>
                {/* status dot */}
                <div className={`mt-0.5 w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all
                  ${isDone ? 'bg-emerald-500/20' : isActive ? 'bg-blue-500/20' : 'bg-slate-800'}`}>
                  {isDone ? (
                    <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : isActive ? (
                    <div className="w-3.5 h-3.5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span className="text-sm">{s.icon}</span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-bold ${isDone ? 'text-emerald-400' : isActive ? 'text-white' : 'text-slate-600'}`}>
                    {s.label}
                  </p>
                  {isActive && (
                    <p className="text-[11px] text-blue-400/80 mt-0.5">{s.sub}{dots}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Timer & note */}
        <div className="flex items-center justify-between px-1">
          <p className="text-xs text-slate-600 font-mono">Đã xử lý: {fmt(elapsed)}</p>
          <p className="text-xs text-slate-600">Quá trình có thể mất 20–40 giây</p>
        </div>

        <div className="flex items-start gap-3 p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl">
          <span className="text-lg shrink-0">💡</span>
          <p className="text-xs text-slate-500 leading-relaxed">
            Câu hỏi trắc nghiệm sẽ được <strong className="text-slate-400">tạo riêng khi bạn vào từng bài học</strong> để đảm bảo nội dung phù hợp nhất với bài giảng đó.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default AILoadingScreen;
