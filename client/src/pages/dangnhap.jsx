import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const DangNhap = () => {
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false); // Thêm loading cho pro
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();

      if (data.success) {
        localStorage.setItem('user', JSON.stringify(data.user));
        // Chuyển hướng sang Admin
        navigate('/admin');
      } else {
        alert(data.message || "Sai tài khoản hoặc mật khẩu!");
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi kết nối Server rồi bro! Check xem server chạy ở port 5000 chưa?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 animate-in fade-in zoom-in duration-500">
      <div className="bg-white w-full max-w-5xl flex rounded-[4rem] shadow-2xl overflow-hidden border border-slate-100">

        {/* CỘT TRÁI: DECOR (Ẩn trên mobile cho gọn) */}
        <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-indigo-700 via-violet-600 to-indigo-800 p-16 flex-col justify-between text-white relative overflow-hidden">
          {/* Hiệu ứng kính mờ trang trí */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-fuchsia-500/20 rounded-full blur-2xl -ml-10 -mb-10"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-12">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 font-black shadow-lg">21</div>
              <span className="font-black tracking-widest uppercase text-sm opacity-90">Nhóm 21 HRM System</span>
            </div>
            <h2 className="text-6xl font-black leading-tight tracking-tighter">
              Admin <br /> Portal.
            </h2>
            <p className="mt-8 text-indigo-100 text-lg opacity-80 leading-relaxed max-w-xs font-medium">
              Chào mừng quản trị viên quay trở lại. Hãy đăng nhập để điều hành hệ thống AI.
            </p>
          </div>

          <div className="relative z-10">
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-[2rem] border border-white/20 shadow-xl">
              <p className="text-sm italic font-medium opacity-90">"Hệ thống quản lý nhân sự thông minh tích hợp Chatbot AI hỗ trợ tra cứu dữ liệu thời gian thực."</p>
              <div className="flex items-center gap-2 mt-4">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-black uppercase tracking-widest">KLTN 2026 - Nhóm 21</span>
              </div>
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: FORM ĐĂNG NHẬP (Lấy logic từ code cũ của bro) */}
        <div className="w-full lg:w-1/2 p-10 md:p-20 flex flex-col justify-center bg-white">
          <div className="mb-10 text-center lg:text-left">
            <h3 className="text-4xl font-black text-slate-800 tracking-tight">Đăng nhập</h3>
            <p className="text-slate-500 mt-3 font-medium">Truy cập vào trang quản trị hệ thống</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* TÀI KHOẢN (Username) */}
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Tài khoản</label>
              <input
                type="text"
                required
                placeholder="Nhập username..."
                className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none font-bold text-slate-700"
                onChange={(e) => setForm({ ...form, username: e.target.value })}
              />
            </div>

            {/* MẬT KHẨU */}
            <div className="space-y-2">
              <div className="flex justify-between items-center px-2">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Mật khẩu</label>
                <button type="button" className="text-[11px] font-bold text-indigo-600 hover:underline">Quên mật khẩu?</button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none font-bold text-slate-700"
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* NÚT SUBMIT */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black text-xl hover:bg-indigo-600 transition-all shadow-2xl shadow-indigo-100 active:scale-95 mt-6 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest"
            >
              {loading ? "Đang xử lý..." : "Vào hệ thống →"}
            </button>
          </form>

          <div className="mt-12 pt-8 border-t border-slate-50 text-center lg:text-left">
            <p className="text-slate-500 text-sm font-medium">
              Vấn đề đăng nhập?{' '}
              <a href="tel:090xxxxxxx" className="text-indigo-600 font-bold hover:underline">Liên hệ Admin Nhóm 21</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DangNhap;