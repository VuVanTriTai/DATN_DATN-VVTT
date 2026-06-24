import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  GraduationCap, CheckCircle2, Circle, Save, Loader2,
  BookOpen, Star, Info, Sparkles, User, FileText, Award
} from 'lucide-react';

const TeachingFields: React.FC = () => {
  const [allFields, setAllFields] = useState<string[]>([]);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [specialization, setSpecialization] = useState('');
  const [bio, setBio] = useState('');
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [fieldsRes, profileRes] = await Promise.all([
        api.instructorDirectory.getFields(),
        api.instructorDirectory.getMyProfile(),
      ]);
      if (fieldsRes.success) setAllFields(fieldsRes.data);
      if (profileRes.success) {
        const p = profileRes.data;
        setProfile(p);
        setSelectedFields(p.instructorProfile?.teachingFields || []);
        setSpecialization(p.instructorProfile?.specialization || '');
        setBio(p.instructorProfile?.bio || '');
      }
    } catch (err) {
      console.error('Lỗi tải dữ liệu:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleField = (field: string) => {
    setSelectedFields(prev =>
      prev.includes(field) ? prev.filter(f => f !== field) : [...prev, field]
    );
    setSaved(false);
  };

  const handleSave = async () => {
    if (selectedFields.length === 0) {
      alert('Vui lòng chọn ít nhất 1 lĩnh vực giảng dạy.');
      return;
    }
    try {
      setSaving(true);
      const res = await api.instructorDirectory.updateMyFields({
        teachingFields: selectedFields,
        specialization,
        bio,
      });
      if (res.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err) {
      alert('Lưu thất bại, thử lại sau.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0f172a]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-violet-500" size={48} />
          <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Đang tải hồ sơ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-6 lg:p-10">
      <div className="max-w-4xl mx-auto space-y-10">

        {/* ── HEADER ── */}
        <header className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-900/40">
              <GraduationCap size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight">Lĩnh vực giảng dạy</h1>
              <p className="text-slate-400 text-sm font-medium">
                Đăng ký lĩnh vực để học viên dễ dàng tìm thấy bạn
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-[#1e293b] rounded-2xl p-5 border border-slate-800 text-center">
              <p className="text-3xl font-black text-violet-400">{selectedFields.length}</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Lĩnh vực đã chọn</p>
            </div>
            <div className="bg-[#1e293b] rounded-2xl p-5 border border-slate-800 text-center">
              <p className="text-3xl font-black text-amber-400">
                {profile?.instructorProfile?.avgRating?.toFixed(1) || '—'}
              </p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Điểm đánh giá</p>
            </div>
            <div className="bg-[#1e293b] rounded-2xl p-5 border border-slate-800 text-center">
              <p className="text-3xl font-black text-emerald-400">
                {profile?.instructorProfile?.ratingCount || 0}
              </p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Lượt đánh giá</p>
            </div>
          </div>
        </header>

        {/* ── HỒ SƠ CÁ NHÂN ── */}
        <section className="bg-[#1e293b] rounded-3xl border border-slate-800 p-8 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <User size={20} className="text-violet-400" />
            <h2 className="font-black text-lg">Thông tin hồ sơ</h2>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-violet-400 uppercase tracking-widest flex items-center gap-2">
                <Award size={12} /> Chuyên ngành chính
              </label>
              <input
                type="text"
                value={specialization}
                onChange={e => { setSpecialization(e.target.value); setSaved(false); }}
                placeholder="VD: Toán học ứng dụng, Lập trình web..."
                className="w-full bg-[#0f172a] border border-slate-700 rounded-2xl px-5 py-3.5 text-sm outline-none focus:border-violet-500 transition-all placeholder:text-slate-600"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-violet-400 uppercase tracking-widest flex items-center gap-2">
                <FileText size={12} /> Giới thiệu bản thân
              </label>
              <textarea
                value={bio}
                onChange={e => { setBio(e.target.value); setSaved(false); }}
                placeholder="Mô tả ngắn về kinh nghiệm giảng dạy, phương pháp, thành tựu của bạn..."
                rows={4}
                className="w-full bg-[#0f172a] border border-slate-700 rounded-2xl px-5 py-3.5 text-sm outline-none focus:border-violet-500 transition-all placeholder:text-slate-600 resize-none"
              />
            </div>
          </div>
        </section>

        {/* ── CHỌN LĨNH VỰC ── */}
        <section className="bg-[#1e293b] rounded-3xl border border-slate-800 p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen size={20} className="text-violet-400" />
              <h2 className="font-black text-lg">Chọn lĩnh vực giảng dạy</h2>
            </div>
            <span className="text-[10px] font-black text-violet-400 bg-violet-500/10 border border-violet-500/20 px-3 py-1.5 rounded-full uppercase tracking-widest">
              {selectedFields.length} / {allFields.length} đã chọn
            </span>
          </div>

          <div className="flex items-start gap-3 p-4 bg-violet-500/5 rounded-2xl border border-violet-500/10">
            <Info size={18} className="text-violet-400 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-400 leading-relaxed">
              Chọn các lĩnh vực bạn có thể hướng dẫn học viên. Học viên có thể lọc và tìm bạn theo các lĩnh vực này. Bạn có thể chọn nhiều lĩnh vực.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {allFields.map(field => {
              const isSelected = selectedFields.includes(field);
              return (
                <button
                  key={field}
                  onClick={() => toggleField(field)}
                  className={`group relative flex items-center gap-3 p-4 rounded-2xl border text-sm font-bold transition-all duration-200 text-left
                    ${isSelected
                      ? 'bg-violet-600/20 border-violet-500 text-violet-300 shadow-lg shadow-violet-900/20'
                      : 'bg-[#0f172a] border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-300'
                    }`}
                >
                  <div className={`shrink-0 transition-all ${isSelected ? 'text-violet-400' : 'text-slate-600 group-hover:text-slate-500'}`}>
                    {isSelected ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                  </div>
                  <span className="leading-tight">{field}</span>
                  {isSelected && (
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-500/5 to-indigo-500/5 pointer-events-none" />
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* ── CÁC LĨNH VỰC ĐÃ CHỌN ── */}
        {selectedFields.length > 0 && (
          <section className="bg-[#1e293b] rounded-3xl border border-slate-800 p-8 space-y-4">
            <div className="flex items-center gap-3">
              <Sparkles size={20} className="text-amber-400" />
              <h2 className="font-black text-lg">Lĩnh vực của bạn</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              {selectedFields.map(f => (
                <div key={f} className="flex items-center gap-2 bg-gradient-to-r from-violet-600/30 to-indigo-600/30 border border-violet-500/30 text-violet-300 rounded-xl px-4 py-2 text-sm font-bold">
                  <Star size={12} className="text-amber-400" />
                  {f}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── NÚT LƯU ── */}
        <div className="flex justify-end pb-10">
          <button
            onClick={handleSave}
            disabled={saving || selectedFields.length === 0}
            className={`flex items-center gap-3 px-10 py-4 rounded-2xl font-black text-base transition-all shadow-xl
              ${saved
                ? 'bg-emerald-600 shadow-emerald-900/30'
                : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-violet-900/30'
              } disabled:opacity-50 disabled:cursor-not-allowed active:scale-95`}
          >
            {saving ? (
              <><Loader2 size={20} className="animate-spin" /> Đang lưu...</>
            ) : saved ? (
              <><CheckCircle2 size={20} /> Đã lưu thành công!</>
            ) : (
              <><Save size={20} /> Lưu lĩnh vực giảng dạy</>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default TeachingFields;
