import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';

const EmployeeLayout = () => {
  // ✅ Lấy dữ liệu user (đã chứa full_name từ JOIN 3 bảng)
  const user = JSON.parse(localStorage.getItem('user'));
  const location = useLocation();

  const menuItems = [
    { path: '/employee/home', label: 'Tổng quan', icon: '📊' },
    { path: '/employee/profile', label: 'Hồ sơ cá nhân', icon: '👤' },
    { path: '/employee/attendance', label: 'Chấm công', icon: '⏰' },
    { path: '/employee/leave', label: 'Xin nghỉ phép', icon: '📝' },
    { path: '/employee/salary', label: 'Phiếu lương', icon: '💰' },
  ];

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  return (
    <div className="flex min-h-screen bg-slate-50 p-6 gap-6">
      {/* SIDEBAR */}
      <aside className="w-72 bg-white rounded-[2.5rem] shadow-xl p-6 flex flex-col border border-slate-100 sticky top-6 h-[calc(100vh-3rem)]">
        <div className="px-4 py-8 mb-6 text-center border-b border-slate-50">
          {/* ✅ AVATAR: HIỆN CHỮ CÁI ĐẦU CỦA TÊN THẬT */}
          <div className="w-20 h-20 bg-indigo-600 rounded-2xl mx-auto mb-4 flex items-center justify-center text-2xl text-white shadow-lg shadow-indigo-200 uppercase font-black">
            {user?.full_name?.charAt(0) || user?.username?.charAt(0) || 'E'}
          </div>
          
          {/* ✅ TÊN: HIỆN FULL NAME CHO CHUYÊN NGHIỆP */}
          <h4 className="font-black text-slate-800 uppercase tracking-tighter">
            {user?.full_name || user?.username || 'Nhân viên'}
          </h4>
          
          <span className="text-[10px] bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full font-black uppercase mt-2 inline-block">
            {user?.position || 'Nhân viên'}
          </span>
        </div>

        <nav className="flex-1 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-sm transition-all ${
                location.pathname === item.path 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 -translate-y-0.5' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600'
              }`}
            >
              <span className="text-xl">{item.icon}</span> {item.label}
            </Link>
          ))}
        </nav>

        <button onClick={handleLogout} className="mt-auto flex items-center gap-4 px-6 py-4 text-red-400 font-bold text-sm hover:bg-red-50 rounded-2xl transition-all">
          <span>🚪</span> Đăng xuất
        </button>
      </aside>

      {/* VÙNG HIỂN THỊ NỘI DUNG TRANG CON */}
      <main className="flex-1 bg-white rounded-[3rem] shadow-sm border border-slate-100 p-10 overflow-y-auto">
        <Outlet /> 
      </main>
    </div>
  );
};

export default EmployeeLayout;