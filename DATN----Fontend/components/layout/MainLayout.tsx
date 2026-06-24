import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const MainLayout: React.FC = () => {
  return (
    <div className="flex h-screen bg-[#0d1117] overflow-hidden">
      {/* Sidebar cố định phía bên trái */}
      <div className="flex-shrink-0 z-40">
        <Sidebar />
      </div>
      
      {/* Vùng nội dung có thể cuộn bên phải */}
      <main className="flex-1 overflow-y-auto relative bg-[#0d1117]">
        <div className="min-h-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;