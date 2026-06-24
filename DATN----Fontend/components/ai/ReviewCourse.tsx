import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  Check, UserCheck, ArrowLeft, Target,
  Search, X, User, ShieldCheck, Info, AlertTriangle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AILoadingScreen from './AILoadingScreen';

const focusLabel = (f: string) => (f === 'practical' || f === 'practice' ? 'Thực hành ứng dụng' : 'Lý thuyết hệ thống');
const depthLabel = (d: string) => (d === 'advanced' || d === 'deep' ? 'Nghiên cứu chuyên sâu' : 'Tiếp cận cơ bản');

const ReviewCourse = ({ data, rawText, onBack, learningGoals: goalsProp }: any) => {
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);
  const [validationError, setValidationError] = useState<{ issues: string[]; level: string } | null>(null);
  const [postWarnings, setPostWarnings] = useState<{ warnings: string[]; depthGap: string | null } | null>(null);

  const [instructors, setInstructors] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInstructor, setSelectedInstructor] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);

  const learningGoals = goalsProp || { focus: 'theory', depth: 'basic' };

  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        setIsSearching(true);
        const res = await api.auth.getInstructors();
        setInstructors(res.data || []);
      } catch (err) {
        console.error('Lỗi lấy danh sách giáo viên:', err);
      } finally {
        setIsSearching(false);
      }
    };
    fetchInstructors();
  }, []);

  const filteredInstructors = instructors.filter(ins =>
    ins.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ins.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFinalize = async () => {
    setIsCreating(true);
    try {
      const res = await api.course.finalizeCreate({
        title: data.analysis.suggestedTitle,
        extractedText: rawText,
        numDays: data.analysis.suggestedDays,
        instructorId: selectedInstructor ? selectedInstructor._id : null,
        previewPlan: data.previewPlan,
        learningGoals,
        fileUrl: data.fileUrl,
        metadata: data.metadata,
      });

      if (res.success === true || res.success === 'true') {
        const planId = res.data?._id || res.data?.id;
        const warnings: string[] = res.data?.validationWarnings || [];
        const depthGap: string | null = res.data?.depthGapWarning || null;

        if (warnings.length > 0 || depthGap) {
          setPostWarnings({ warnings, depthGap });
          setTimeout(() => navigate(`/plan/${planId}`), 4500);
        } else {
          navigate(`/plan/${planId}`);
        }
      } else if (res.validationIssues && res.validationIssues.length > 0) {
        setValidationError({ issues: res.validationIssues, level: res.validationLevel || 'error' });
      } else {
        alert('Có lỗi: ' + res.message);
      }
    } catch (e: any) {
      const body = e?.response?.data;
      if (body?.validationIssues) {
        setValidationError({ issues: body.validationIssues, level: body.validationLevel || 'error' });
      } else {
        alert('Lỗi hệ thống khi tạo lộ trình.');
      }
    } finally {
      setIsCreating(false);
    }
  };

  // ── Validation error screen ───────────────────────────────────────────────
  if (validationError) {
    return (
      <div className="max-w-3xl w-full bg-[#1e293b] rounded-[2.5rem] p-8 border border-red-900/40 space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-red-500/20 flex items-center justify-center">
            <AlertTriangle className="text-red-400" size={24} />
          </div>
          <div>
            <h2 className="text-white font-black text-xl">Tài liệu không đạt yêu cầu</h2>
            <p className="text-red-400/70 text-sm mt-0.5">AI phát hiện vấn đề — vui lòng kiểm tra lại tài liệu</p>
          </div>
        </div>

        <div className="space-y-3">
          {validationError.issues.map((issue, i) => (
            <div key={i} className="flex items-start gap-3 p-4 bg-red-500/5 border border-red-500/20 rounded-2xl">
              <X className="text-red-400 shrink-0 mt-0.5" size={16} />
              <p className="text-red-300 text-sm">{issue}</p>
            </div>
          ))}
        </div>

        <button
          onClick={() => { setValidationError(null); onBack?.(); }}
          className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold transition-colors"
        >
          ← Quay lại &amp; thay tài liệu khác
        </button>
      </div>
    );
  }

  // ── Main form ─────────────────────────────────────────────────────────────
  return (
    <>
      <AILoadingScreen isVisible={isCreating} title={data?.analysis?.suggestedTitle} />

      {/* Post-creation warnings overlay */}
      {postWarnings && (
        <div className="fixed inset-0 z-[210] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#1a2740] border border-amber-500/30 rounded-3xl p-8 max-w-md w-full space-y-5 animate-in zoom-in duration-300">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <h3 className="text-white font-black text-lg">Lộ trình đã tạo — có vài lưu ý</h3>
            </div>
            {postWarnings.warnings.map((w, i) => (
              <p key={i} className="text-amber-300/90 text-sm bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">{w}</p>
            ))}
            {postWarnings.depthGap && (
              <p className="text-blue-300/90 text-sm bg-blue-500/10 border border-blue-500/20 rounded-xl p-3">
                💡 {postWarnings.depthGap}
              </p>
            )}
            <p className="text-slate-500 text-xs text-center">Tự động chuyển sang lộ trình sau vài giây...</p>
          </div>
        </div>
      )}

      {/* Main card */}
      <div className="max-w-3xl w-full bg-[#1e293b] rounded-[2.5rem] p-8 lg:p-10 border border-slate-800 space-y-8 animate-in zoom-in duration-300 shadow-2xl">

        {/* Back button */}
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-slate-400 hover:text-white text-sm font-bold transition-colors group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Quay lại bước thiết lập
        </button>

        {/* Course info */}
        <div className="space-y-3">
          <h2 className="text-3xl font-black text-white leading-tight">{data.analysis.suggestedTitle}</h2>
          <p className="text-slate-400 text-sm leading-relaxed">{data.analysis.summary}</p>
        </div>

        {/* Learning goal badge */}
        <div className="bg-amber-500/5 border border-amber-500/20 p-5 rounded-[2rem] flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-500">
            <Target size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Mục tiêu AI hướng tới</p>
            <p className="text-white font-bold text-sm">
              {focusLabel(learningGoals.focus)} <span className="mx-2 text-slate-700">|</span> {depthLabel(learningGoals.depth)}
            </p>
          </div>
        </div>

        {/* Instructor search */}
        <div className="space-y-4">
          <label className="text-xs font-black text-blue-500 uppercase tracking-widest flex items-center gap-2 ml-2">
            <ShieldCheck size={16} /> Đăng ký người hướng dẫn (Tùy chọn)
          </label>

          <div className="relative">
            {!selectedInstructor ? (
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={20} />
                <input
                  type="text"
                  placeholder="Nhập tên giảng viên muốn đăng ký học cùng..."
                  className="w-full bg-[#0f172a] border border-slate-700 p-4 pl-12 rounded-2xl text-white outline-none focus:border-blue-500 transition-all placeholder:text-slate-600"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-[#1e293b] border border-slate-700 rounded-2xl shadow-2xl z-30 max-h-64 overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-top-2">
                    {filteredInstructors.length > 0 ? (
                      filteredInstructors.map(ins => (
                        <div
                          key={ins._id}
                          onClick={() => { setSelectedInstructor(ins); setSearchTerm(''); }}
                          className="p-4 hover:bg-blue-600/20 border-b border-slate-800 last:border-0 cursor-pointer flex items-center justify-between group transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center font-bold text-slate-300 group-hover:bg-blue-500 group-hover:text-white">
                              {ins.fullName[0]}
                            </div>
                            <div>
                              <p className="font-bold text-sm text-white">{ins.fullName}</p>
                              <p className="text-[10px] text-slate-500 uppercase font-black">{ins.instructorProfile?.specialization || 'Chuyên gia'}</p>
                            </div>
                          </div>
                          <UserCheck size={18} className="text-slate-600 group-hover:text-blue-400" />
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-slate-500 text-sm italic">
                        Không tìm thấy giảng viên "{searchTerm}"
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl animate-in zoom-in">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-900/20">
                    <User size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Giảng viên đã chọn</p>
                    <p className="font-bold text-white uppercase">{selectedInstructor.fullName}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedInstructor(null)}
                  className="p-2 hover:bg-red-500/10 text-slate-500 hover:text-red-500 rounded-xl transition-all"
                >
                  <X size={20} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Plan preview */}
        <div className="space-y-4">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">
            Xem trước cấu trúc ({data.previewPlan.length} ngày)
          </p>
          <div className="max-h-52 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
            {data.previewPlan.map((p: any, index: number) => (
              <div key={index} className="flex items-center gap-4 p-4 bg-[#0f172a] rounded-2xl border border-slate-800 group hover:border-blue-500/30 transition-all">
                <span className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-[10px] font-black text-blue-500 border border-slate-700 group-hover:bg-blue-600 group-hover:text-white">
                  {p.day || p.dayNumber}
                </span>
                <p className="text-sm font-bold text-slate-300 group-hover:text-white truncate">{p.topic || p.title}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="pt-4 space-y-4">
          <button
            onClick={handleFinalize}
            disabled={isCreating}
            className="w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-[1.5rem] font-black text-xl flex items-center justify-center gap-3 transition-all shadow-2xl shadow-blue-900/20 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Check size={26} strokeWidth={3} />
            <span>Bắt đầu tạo lộ trình ngay</span>
          </button>
          <div className="flex items-center gap-2 justify-center text-slate-500">
            <Info size={14} />
            <p className="text-[10px] font-bold uppercase tracking-tight">AI sẽ sinh câu hỏi thích nghi cho mỗi bài học</p>
          </div>
        </div>

      </div>
    </>
  );
};

export default ReviewCourse;