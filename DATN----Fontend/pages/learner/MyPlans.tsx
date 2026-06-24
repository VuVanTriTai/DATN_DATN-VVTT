import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { LayoutGrid, Calendar, ChevronRight } from 'lucide-react';

const MyPlans = () => {
  const [plans, setPlans] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.plan.getMyPlans().then(res => setPlans(res.data));
  }, []);

  return (
    <div className="p-10 space-y-10">
      <h1 className="text-4xl font-black text-white">Lộ trình học tập của tôi</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((p: any) => (
          <div key={p._id} className="bg-[#1e293b] p-8 rounded-[2.5rem] border border-slate-800 hover:border-blue-500/50 transition-all group">
            <div className="flex justify-between items-start mb-6">
              <div className="p-4 bg-blue-500/10 rounded-2xl text-blue-500"><LayoutGrid/></div>
              <span className="bg-emerald-500/10 text-emerald-500 text-[10px] font-black px-3 py-1 rounded-full uppercase">Đang học</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">{p.title}</h3>
            <p className="text-slate-500 text-sm flex items-center gap-2 mb-8"><Calendar size={14}/> {p.duration} ngày học</p>
            <button 
              onClick={() => navigate(`/plan/${p._id}`)}
              className="w-full py-4 bg-slate-800 group-hover:bg-blue-600 rounded-2xl font-bold transition-all flex items-center justify-center gap-2"
            >
              Vào học ngay <ChevronRight size={18}/>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
export default MyPlans;