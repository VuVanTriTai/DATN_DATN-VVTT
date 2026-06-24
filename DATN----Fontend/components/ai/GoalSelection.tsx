// src/components/ai/GoalSelection.tsx
import React from 'react';
import { Book, Hammer, GraduationCap, Microscope, ChevronRight, Calendar, Clock } from 'lucide-react';

interface GoalSelectionProps {
  onConfirm: (goals: { focus: string; depth: string; days: number }) => void;
  onBack: () => void;
}

const GoalSelection: React.FC<GoalSelectionProps> = ({ onConfirm, onBack }) => {
  const [focus, setFocus] = React.useState('theory');
  const [depth, setDepth] = React.useState('basic');
  const [days, setDays] = React.useState(7); // Mặc định 7 ngày

  return (
    <div className="max-w-4xl w-full bg-[#1e293b] rounded-[3rem] p-10 border border-slate-800 space-y-10 animate-in zoom-in shadow-2xl overflow-y-auto max-h-[90vh] custom-scrollbar">
      <div className="text-center">
        <h2 className="text-3xl font-black text-white italic">Thiết lập lộ trình cá nhân</h2>
        <p className="text-slate-400 mt-2 text-sm font-medium">Lựa chọn của bạn là "đề bài" để AI thiết kế khóa học.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* CỘT 1: THIÊN HƯỚNG & ĐỘ SÂU */}
        <div className="space-y-8">
          <div className="space-y-4">
            <label className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] ml-2">Thiên hướng</label>
            <div className="grid grid-cols-1 gap-3">
               <button onClick={() => setFocus('theory')} className={`p-4 rounded-2xl border-2 transition-all flex items-center gap-4 ${focus === 'theory' ? 'bg-blue-600/10 border-blue-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
                  <Book size={20}/> <span className="font-bold text-sm">Lý thuyết hệ thống</span>
               </button>
               <button onClick={() => setFocus('practical')} className={`p-4 rounded-2xl border-2 transition-all flex items-center gap-4 ${focus === 'practical' ? 'bg-indigo-600/10 border-indigo-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
                  <Hammer size={20}/> <span className="font-bold text-sm">Thực hành ứng dụng</span>
               </button>
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] ml-2">Mức độ tiếp cận</label>
            <div className="grid grid-cols-1 gap-3">
               <button onClick={() => setDepth('basic')} className={`p-4 rounded-2xl border-2 transition-all flex items-center gap-4 ${depth === 'basic' ? 'bg-emerald-600/10 border-emerald-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
                  <GraduationCap size={20}/> <span className="font-bold text-sm">Kiến thức cơ bản</span>
               </button>
               <button onClick={() => setDepth('advanced')} className={`p-4 rounded-2xl border-2 transition-all flex items-center gap-4 ${depth === 'advanced' ? 'bg-purple-600/10 border-purple-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
                  <Microscope size={20}/> <span className="font-bold text-sm">Nghiên cứu chuyên sâu</span>
               </button>
            </div>
          </div>
        </div>

        {/* CỘT 2: THỜI GIAN HỌC (CHỨC NĂNG MỚI) */}
        <div className="space-y-6 bg-[#0f172a]/50 p-6 rounded-[2rem] border border-slate-800">
          <div className="flex items-center gap-2 text-amber-500">
            <Calendar size={20}/>
            <label className="text-[10px] font-black uppercase tracking-[0.2em]">Thời lượng lộ trình</label>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-slate-900 p-4 rounded-2xl border border-slate-700">
              <span className="text-sm font-bold text-slate-400">Số ngày dự kiến:</span>
              <input 
                type="number" 
                min={1} max={14}
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="bg-transparent text-xl font-black text-blue-500 w-12 outline-none text-right"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[3, 5, 7, 10, 14].map(v => (
                <button 
                  key={v}
                  onClick={() => setDays(v)}
                  className={`py-3 rounded-xl text-xs font-black transition-all ${days === v ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-500 hover:bg-slate-700'}`}
                >
                  {v} Ngày
                </button>
              ))}
            </div>
            
            <div className="p-4 bg-amber-500/5 rounded-xl border border-amber-500/10 flex gap-3">
              <Clock size={32} className="text-amber-500 shrink-0" />
              <p className="text-[10px] text-slate-400 leading-relaxed italic">
                * Lưu ý: Số ngày càng dài, AI sẽ chia nhỏ kiến thức càng sâu. Giới hạn tối đa 14 ngày để đảm bảo chất lượng RAG.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4 pt-4 border-t border-slate-800">
        <button onClick={onBack} className="flex-1 py-4 text-slate-500 font-bold hover:text-white transition-all underline">Quay lại</button>
        <button 
          onClick={() => onConfirm({ focus, depth, days })}
          className="flex-[2] py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black shadow-xl flex items-center justify-center gap-2 transition-all active:scale-95"
        >
          Xác nhận & Phân tích AI <ChevronRight size={20}/>
        </button>
      </div>
    </div>
  );
};

export default GoalSelection;