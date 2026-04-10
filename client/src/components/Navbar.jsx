import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  // ✅ Lấy dữ liệu user object (đã chứa full_name từ JOIN 3 bảng)
  const user = JSON.parse(localStorage.getItem('user'));
  const userRole = localStorage.getItem('userRole');

  const handleLogout = () => {
    localStorage.clear(); 
    window.location.href = '/'; 
  };

  return (
    <nav className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm mb-10 max-w-6xl mx-auto border border-gray-100 sticky top-4 z-50 backdrop-blur-md bg-white/80">
      
      {/* Logo Nhóm 21 */}
      <Link to="/" className="flex items-center gap-2 cursor-pointer transition active:scale-95">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-indigo-100">
          21
        </div>
        <div className="flex flex-col">
          <h1 className="text-xl font-black text-slate-800 tracking-tighter leading-none uppercase">NHÓM 21</h1>
          <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">HRM System</span>
        </div>
      </Link>
      
      {/* Menu chính */}
      <div className="flex gap-8 items-center">
        <Link to="/" className="text-slate-500 hover:text-indigo-600 font-bold transition text-sm uppercase tracking-wide">
          Trang chủ
        </Link>

        {/* ✅ HIỆN LINK QUẢN LÝ TÙY THEO ROLE */}
        {userRole === 'admin' && (
          <Link to="/admin/dashboard" className="text-indigo-600 font-black transition text-sm uppercase tracking-wide border-b-2 border-indigo-600 pb-1">
            Quản trị ↗
          </Link>
        )}

        {/* THÊM LINK CHO MANAGER BRO NHÉ */}
        {userRole === 'manager' && (
          <Link to="/manager/dashboard" className="text-violet-600 font-black transition text-sm uppercase tracking-wide border-b-2 border-violet-600 pb-1">
            Quản lý ↗
          </Link>
        )}

        {userRole === 'employee' && (
          <Link to="/employee/home" className="text-emerald-600 font-black transition text-sm uppercase tracking-wide border-b-2 border-emerald-600 pb-1">
            Cá nhân ↗
          </Link>
        )}

        {/* Khu vực Tài khoản / Đăng nhập */}
        {user ? (
          <div className="flex items-center gap-4 border-l pl-8 ml-2">
            <div className="flex flex-col items-end">
              {/* ✅ THAY USERNAME BẰNG FULL_NAME CHO SANG BRO NHÉ */}
              <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Xin chào,</span>
              <span className="text-sm font-black text-slate-800 italic uppercase">
                {user.full_name || user.username}
              </span>
            </div>
            <button 
              onClick={handleLogout}
              className="bg-slate-100 text-slate-600 px-4 py-2 rounded-xl hover:bg-red-50 hover:text-red-500 transition text-xs font-black uppercase"
            >
              Thoát
            </button>
          </div>
        ) : (
          <Link 
            to="/dang-nhap" 
            className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl hover:bg-indigo-700 transition font-black text-sm shadow-xl shadow-indigo-100 uppercase tracking-tight"
          >
            Đăng nhập
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;