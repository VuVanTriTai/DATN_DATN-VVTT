// src/pages/instructor/StudentList.tsx
// TRANG NÀY DÙNG ĐỂ HIỂN THỊ DANH SÁCH HỌC VIÊN MÀ GIẢNG VIÊN ĐANG HƯỚNG DẪN
// HIỆN TẠI CHỈ LÀ KHUNG TRỐNG, CHƯA CÓ GÌ, SẼ PHÁT TRIỂN SAU KHI XONG PHẦN CHIA SẺ VÀ QUẢN LÝ HỌC VIÊN
//có khả năng bị xoá
import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { User, ChevronRight, MessageSquare } from 'lucide-react';

const StudentList = () => {
  const [students, setStudents] = useState<any[]>([]);

  useEffect(() => {
    api.instructor.getStudents().then(res => setStudents(res.data));
  }, []);

  return (
    <div className="p-10 space-y-8 text-white">
      <h1 className="text-3xl font-black tracking-tight">Học viên đang hướng dẫn</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {students.map(std => (
          <div key={std.id} className="bg-[#1e293b] p-8 rounded-[2.5rem] border border-slate-800 flex items-center justify-between group hover:border-purple-500/50 transition-all">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-3xl flex items-center justify-center text-2xl font-black shadow-lg">
                {std.fullName[0]}
              </div>
              <div className="space-y-1">
                <p className="text-xl font-bold">{std.fullName}</p>
                <p className="text-slate-500 text-sm font-medium italic">Khóa học: {std.planTitle}</p>
              </div>
            </div>
            
            <div className="flex gap-2">
               <button className="p-4 bg-slate-800 rounded-2xl text-blue-400 hover:bg-blue-600 hover:text-white transition-all">
                 <MessageSquare size={20}/>
               </button>
               <button className="p-4 bg-slate-800 rounded-2xl text-slate-400 hover:bg-slate-700 transition-all">
                 <ChevronRight size={20}/>
               </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default StudentList;