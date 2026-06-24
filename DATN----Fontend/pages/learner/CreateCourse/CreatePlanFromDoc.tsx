// src/pages/learner/CreateCourse/CreatePlanFromDoc.tsx
import React, { useState } from 'react';
import { 
  UploadCloud, Loader2, FileText, CheckCircle, 
  Target, Zap, Sparkles, SlidersHorizontal, 
  Calendar, Brain, ChevronDown, Info
} from 'lucide-react';
import { api } from '../../../services/api';
import ReviewCourse from '../../../components/ai/ReviewCourse';

type LearningFocus = "theory" | "practice";
type LearningDepth = "basic" | "deep";
type DayMode = "auto" | "manual";

const CreatePlanFromDoc = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [rawText, setRawText] = useState("");

  // States cho mục tiêu
  const [learningFocus, setLearningFocus] = useState<LearningFocus>("theory");
  const [learningDepth, setLearningDepth] = useState<LearningDepth>("basic");

  // States cho chế độ chọn ngày
  const [dayMode, setDayMode] = useState<DayMode>("auto");
  const [days, setDays] = useState<number>(7);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFile(e.target.files[0]);
  };

  const handleProcess = async () => {
    if (!file) {
      alert("Vui lòng chọn tài liệu trước.");
      return;
    }

    setIsProcessing(true);
    try {
      // BƯỚC 1: Tải lên Cloudinary và trích xuất nội dung
      const extractRes = await api.file.extract(file);
      const text = extractRes.content;
      const cloudinaryUrl = extractRes.fileUrl;
      const metadata = extractRes.metadata;

      setRawText(text);

      // BƯỚC 2: Gửi xuống AI để phân tích
      // Nếu chế độ auto → truyền 'auto', AI sẽ tự gợi ý số ngày
      // Nếu chế độ manual → truyền số ngày user đã chọn
      const daysParam = dayMode === 'auto' ? 'auto' : days;

      const analysisRes = await api.plan.analyze(
        text,
        { focus: learningFocus, depth: learningDepth },
        daysParam as any,
        metadata
      );

      if (analysisRes.success) {
        setAnalysisData({
          ...analysisRes.data,
          fileUrl: cloudinaryUrl,
          metadata: metadata,
          // Kèm số ngày AI gợi ý (hoặc user đã chọn) để truyền sang ReviewCourse
          resolvedDays: analysisRes.data.suggestedDays || days,
          isAutoMode: analysisRes.data.isAutoMode || false,
        });
      } else {
        alert("AI không thể phân tích tài liệu: " + analysisRes.message);
      }

    } catch (err: any) {
      console.error("Lỗi quy trình:", err);
      alert(err.response?.data?.message || "Đã có lỗi xảy ra trong quá trình xử lý AI.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Nếu đã có dữ liệu phân tích, hiển thị component Review
  if (analysisData) {
    return (
      <ReviewCourse
        data={analysisData}
        rawText={rawText}
        learningGoals={{ focus: learningFocus, depth: learningDepth }}
        onBack={() => setAnalysisData(null)}
      />
    );
  }

  return (
    <div className="h-full flex items-center justify-center p-6 lg:p-10 animate-in fade-in duration-500">
      <div className="max-w-4xl w-full bg-[#1e293b] rounded-[3rem] p-8 lg:p-12 border border-slate-800 shadow-2xl space-y-8">

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            {isProcessing ? <Loader2 className="animate-spin text-blue-500" size={32}/> : <Zap className="text-blue-500" size={32}/>}
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight">Thiết kế lộ trình học tập AI</h2>
          <p className="text-slate-400 text-sm font-medium">Tùy chỉnh mục tiêu và tải tài liệu để bắt đầu</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* CỘT TRÁI: CẤU HÌNH MỤC TIÊU + SỐ NGÀY */}
          <div className="space-y-5 bg-[#0f172a]/60 rounded-[2rem] p-6 border border-slate-800">
            <div className="flex items-center gap-2 text-blue-500 mb-1">
              <Target size={18} />
              <span className="text-xs font-black uppercase tracking-widest">Cấu hình học tập</span>
            </div>

            {/* Chọn Trọng tâm */}
            <div className="space-y-2">
              <label className="text-slate-400 text-[10px] font-black uppercase ml-1">Trọng tâm kiến thức</label>
              <div className="grid grid-cols-2 gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setLearningFocus("theory")}
                  className={`py-2.5 rounded-lg text-xs font-bold transition-all ${learningFocus === "theory" ? "bg-blue-600 text-white shadow-lg" : "text-slate-500 hover:text-slate-300"}`}
                >
                  Lý thuyết
                </button>
                <button
                  type="button"
                  onClick={() => setLearningFocus("practice")}
                  className={`py-2.5 rounded-lg text-xs font-bold transition-all ${learningFocus === "practice" ? "bg-blue-600 text-white shadow-lg" : "text-slate-500 hover:text-slate-300"}`}
                >
                  Thực hành
                </button>
              </div>
            </div>

            {/* Chọn Mức độ */}
            <div className="space-y-2">
              <label className="text-slate-400 text-[10px] font-black uppercase ml-1">Mức độ chuyên sâu</label>
              <div className="grid grid-cols-2 gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setLearningDepth("basic")}
                  className={`py-2.5 rounded-lg text-xs font-bold transition-all ${learningDepth === "basic" ? "bg-emerald-600 text-white shadow-lg" : "text-slate-500 hover:text-slate-300"}`}
                >
                  Cơ bản
                </button>
                <button
                  type="button"
                  onClick={() => setLearningDepth("deep")}
                  className={`py-2.5 rounded-lg text-xs font-bold transition-all ${learningDepth === "deep" ? "bg-emerald-600 text-white shadow-lg" : "text-slate-500 hover:text-slate-300"}`}
                >
                  Nghiên cứu
                </button>
              </div>
            </div>

            {/* ────────── CHỌN CHẾ ĐỘ SỐ NGÀY ────────── */}
            <div className="space-y-3">
              <label className="text-slate-400 text-[10px] font-black uppercase ml-1">Thời gian học</label>

              {/* Toggle chế độ */}
              <div className="grid grid-cols-2 gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setDayMode("auto")}
                  className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition-all ${dayMode === "auto" ? "bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-lg" : "text-slate-500 hover:text-slate-300"}`}
                >
                  <Brain size={12} />
                  AI gợi ý
                </button>
                <button
                  type="button"
                  onClick={() => setDayMode("manual")}
                  className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition-all ${dayMode === "manual" ? "bg-slate-700 text-white shadow-lg" : "text-slate-500 hover:text-slate-300"}`}
                >
                  <SlidersHorizontal size={12} />
                  Tự chọn
                </button>
              </div>

              {/* Nội dung theo chế độ */}
              {dayMode === "auto" ? (
                <div className="flex items-start gap-3 p-3 bg-violet-500/8 border border-violet-500/20 rounded-2xl">
                  <Sparkles size={14} className="text-violet-400 mt-0.5 shrink-0" />
                  <p className="text-[11px] text-violet-300 leading-relaxed">
                    AI sẽ đọc tài liệu và <span className="font-bold">tự đề xuất số ngày học phù hợp</span> dựa trên độ dài và độ phức tạp của nội dung.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 text-[10px] font-bold uppercase">Số ngày</span>
                    <span className="text-blue-400 font-black text-sm">{days} ngày</span>
                  </div>
                  <input
                    type="range" min="3" max="14" step="1"
                    value={days}
                    onChange={(e) => setDays(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between text-[9px] text-slate-600 font-bold uppercase">
                    <span>3 ngày</span>
                    <span>14 ngày</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* CỘT PHẢI: TẢI FILE */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-blue-500 mb-4">
              <FileText size={18} />
              <span className="text-xs font-black uppercase tracking-widest">Tài liệu nguồn</span>
            </div>

            <div className="relative flex-1 group">
              <input type="file" id="doc-upload" className="hidden" onChange={handleFileChange} accept=".pdf,.docx,.txt" />
              <label htmlFor="doc-upload" className={`h-full flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-[2rem] cursor-pointer transition-all
                ${file ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-slate-700 bg-slate-900/40 hover:border-blue-500/50 hover:bg-blue-500/5'}`}>
                {file ? (
                  <div className="text-center space-y-2">
                    <CheckCircle className="text-emerald-500 mx-auto" size={32}/>
                    <p className="text-emerald-400 font-bold text-sm truncate max-w-[200px]">{file.name}</p>
                    <span className="text-[10px] text-slate-500 underline">Nhấn để thay đổi</span>
                  </div>
                ) : (
                  <div className="text-center space-y-2">
                    <UploadCloud className="text-slate-600 group-hover:text-blue-500 transition-colors mx-auto" size={40}/>
                    <p className="text-slate-500 text-xs font-medium">Chọn PDF, DOCX hoặc TXT</p>
                  </div>
                )}
              </label>
            </div>
          </div>
        </div>

        {/* Info banner tuỳ theo chế độ */}
        {dayMode === "auto" && file && (
          <div className="flex items-center gap-3 px-5 py-3 bg-blue-500/5 border border-blue-500/15 rounded-2xl">
            <Info size={14} className="text-blue-400 shrink-0" />
            <p className="text-[11px] text-slate-400">
              Sau khi phân tích, AI sẽ hiển thị số ngày gợi ý. Bạn có thể điều chỉnh lại trong màn hình xem trước trước khi tạo khoá học.
            </p>
          </div>
        )}

        {/* Nút hành động */}
        <button
          onClick={handleProcess}
          disabled={!file || isProcessing}
          className={`w-full py-5 rounded-2xl font-black text-xl transition-all shadow-2xl flex items-center justify-center gap-3 active:scale-95
            ${!file || isProcessing
              ? 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700'
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-900/30'}
          `}
        >
          {isProcessing ? (
            <>
              <Loader2 className="animate-spin" size={24}/>
              <span>{dayMode === 'auto' ? 'AI đang phân tích và gợi ý lộ trình...' : 'AI đang xây dựng lộ trình...'}</span>
            </>
          ) : (
            <span>Tiến hành phân tích ngay</span>
          )}
        </button>
      </div>
    </div>
  );
};

export default CreatePlanFromDoc;