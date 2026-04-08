import React, { useState } from 'react';
import Dashboard from './dashboard';
import Jobs from './job';
import Employees from './employees';
import Departments from './departments'; // <--- Đã import file departments của bro

const Admin = () => {
  // Quản lý trạng thái chuyển Tab
  const [activeTab, setActiveTab] = useState('dashboard');

  // Danh sách các mục trên Sidebar
  const menuItems = [
    { id: 'dashboard', label: 'Bảng điều khiển', icon: '📊' },
    { id: 'employees', label: 'Quản lý nhân viên', icon: '👥' },
    { id: 'departments', label: 'Quản lý phòng ban', icon: '🏢' },
    { id: 'jobs', label: 'Tin tuyển dụng', icon: '✍️' },
    { id: 'attendance', label: 'Quản lý chấm công', icon: '⏰' },
    { id: 'salary', label: 'Quản lý lương', icon: '💰' },
    { id: 'notifications', label: 'Thông báo', icon: '🔔' },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">

      {/* SIDEBAR BÊN TRÁI */}
      <aside className="w-80 bg-slate-900 text-white p-8 hidden lg:flex flex-col sticky top-0 h-screen shadow-2xl">
        <div className="flex items-center gap-4 mb-12 px-2">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center font-black text-xl shadow-lg shadow-indigo-500/20 text-white">21</div>
          <div className="flex flex-col text-white">
            <span className="font-black text-xl tracking-tighter uppercase leading-none">Admin</span>
            <span className="text-[10px] font-bold text-slate-500 tracking-[0.2em] uppercase">HRM System</span>
          </div>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto pr-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-[1.5rem] font-bold transition-all duration-300 ${activeTab === item.id
                ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-900/40 translate-x-2'
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="tracking-tight">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-8 border-t border-slate-800">
          <button className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-rose-400 hover:bg-rose-500/10 transition-all active:scale-95">
            <span>🚪</span> Đăng xuất
          </button>
        </div>
      </aside>

      {/* NỘI DUNG CHÍNH (MAIN CONTENT) */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto bg-slate-50">

        {/* HEADER CỐ ĐỊNH */}
        <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="animate-in slide-in-from-left duration-500">
            <h1 className="text-4xl font-black text-slate-800 tracking-tighter">
              {menuItems.find(i => i.id === activeTab)?.label}
            </h1>
            <p className="text-slate-500 font-semibold mt-1 italic uppercase tracking-widest text-[10px]">Nhóm 21 - HRM Intelligence System</p>
          </div>

          <div className="flex items-center gap-4 bg-white p-2 pr-8 rounded-full shadow-sm border border-slate-100 animate-in slide-in-from-right duration-500">
            <div className="w-12 h-12 bg-gradient-to-tr from-indigo-500 to-violet-500 rounded-full flex items-center justify-center text-white font-black shadow-inner">B</div>
            <div className="flex flex-col">
              <span className="font-black text-slate-800 text-sm leading-none italic">Admin Beo</span>
              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mt-1">Trực tuyến</span>
            </div>
          </div>
        </header>

        {/* --- HUB HIỂN THỊ CÁC TAB --- */}
        <div className="w-full">

          {/* 1. Dashboard */}
          {activeTab === 'dashboard' && <Dashboard changeTab={setActiveTab} />}

          {/* 2. Tuyển dụng */}
          {activeTab === 'jobs' && <Jobs />}

          {/* 3. Quản lý nhân viên */}
          {activeTab === 'employees' && <Employees />}

          {/* 4. Quản lý phòng ban (MỚI THÊM) */}
          {activeTab === 'departments' && <Departments />}

          {/* --- LOGIC HIỂN THỊ BIỂN BÁO 🚧 --- */}
          {/* Đã thêm 'departments' vào mảng check bên dưới để nó ẨN biển báo khi vào tab này */}
          {!['dashboard', 'jobs', 'employees', 'departments'].includes(activeTab) && (
            <div className="w-full bg-white p-32 rounded-[3.5rem] text-center border-4 border-dashed border-slate-100 animate-in fade-in duration-500 shadow-sm">
              <span className="text-8xl mb-6 block animate-bounce">🚧</span>
              <h3 className="text-2xl font-black text-slate-300 uppercase tracking-widest italic font-sans">
                Chức năng <span className="text-indigo-400">{activeTab}</span> đang phát triển...
              </h3>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default Admin;