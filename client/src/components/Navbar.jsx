import React from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Dùng Link để chuyển trang mượt mà

const Navbar = () => {
  const navigate = useNavigate();
  
  // Lấy user từ localStorage (Vì lúc nãy ở trang Đăng nhập mình đã lưu vào đó)
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.removeItem('user'); // Xóa user khỏi máy
    navigate('/'); // Đẩy về trang chủ
    window.location.reload(); // Reload nhẹ để Navbar cập nhật lại trạng thái
  };

  return (
    <nav className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm mb-10 max-w-6xl mx-auto border border-gray-100 sticky top-4 z-50 backdrop-blur-md bg-white/80">
      
      {/* Logo Nhóm 21 - Click là về trang chủ */}
      <Link to="/" className="flex items-center gap-2 cursor-pointer transition active:scale-95">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-indigo-100">
          21
        </div>
        <div className="flex flex-col">
          <h1 className="text-xl font-black text-slate-800 tracking-tighter leading-none">NHÓM 21</h1>
          <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">HRM System</span>
        </div>
      </Link>
      
      {/* Menu chính */}
      <div className="flex gap-8 items-center">
        <Link to="/" className="text-slate-500 hover:text-indigo-600 font-bold transition text-sm uppercase tracking-wide">
          Trang chủ
        </Link>

        {/* Chỉ hiện nút Quản lý nếu đã đăng nhập admin */}
        {user && (
          <Link to="/admin" className="text-slate-500 hover:text-indigo-600 font-bold transition text-sm uppercase tracking-wide">
            Quản lý tin
          </Link>
        )}

        {/* Khu vực Tài khoản / Đăng nhập */}
        {user ? (
          <div className="flex items-center gap-4 border-l pl-8 ml-2">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Admin đang trực</span>
              <span className="text-sm font-black text-indigo-600">{user.username}</span>
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