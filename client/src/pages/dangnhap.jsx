import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const DangNhap = () => {
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Gọi API login
      const response = await axios.post('http://localhost:5000/api/auth/login', form);
      const data = response.data;

      if (data.success) {
        const user = data.user;

        // ✅ BƯỚC 1: Xóa sạch dữ liệu cũ để tránh xung đột quyền
        localStorage.clear();

        // ✅ BƯỚC 2: Lưu thông tin mới vào LocalStorage
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('userRole', user.role); 
        localStorage.setItem('userName', user.username);

        // ✅ BƯỚC 3: Điều hướng "đúng chuồng"
        // Thêm điều kiện check role manager bro vừa mới đổi trong DB
        if (user.role === 'admin') {
          window.location.href = '/admin/dashboard';
        } else if (user.role === 'manager') {
          window.location.href = '/manager/dashboard';
        } else if (user.role === 'employee') {
          window.location.href = '/employee/home';
        } else {
          alert("Tài khoản chưa được phân quyền hệ thống!");
          window.location.href = '/';
        }
      }
    } catch (err) {
      console.error("Lỗi đăng nhập chi tiết:", err);
      if (err.response) {
        alert(err.response.data.message || "Tài khoản hoặc mật khẩu không chính xác!");
      } else if (err.request) {
        alert("Không thể kết nối tới máy chủ. Bro check xem Backend đã chạy chưa!");
      } else {
        alert("Có lỗi xảy ra trong quá trình đăng nhập!");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 animate-in fade-in zoom-in duration-500">
      <div className="bg-white w-full max-w-5xl flex rounded-[4rem] shadow-2xl overflow-hidden border border-slate-100">

        {/* CỘT TRÁI: DECOR */}
        <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-indigo-700 via-violet-600 to-indigo-800 p-16 flex-col justify-between text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-fuchsia-500/20 rounded-full blur-2xl -ml-10 -mb-10"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-12">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 font-black shadow-lg">21</div>
              <span className="font-black tracking-widest uppercase text-sm opacity-90">Nhóm 21 HRM System</span>
            </div>
            <h2 className="text-6xl font-black leading-tight tracking-tighter">
              HRM <br /> Portal.
            </h2>
            <p className="mt-8 text-indigo-100 text-lg opacity-80 leading-relaxed max-w-xs font-medium">
              Chào mừng quay trở lại. Hãy đăng nhập để truy cập vào hệ thống quản lý.
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

        {/* CỘT PHẢI: FORM ĐĂNG NHẬP */}
        <div className="w-full lg:w-1/2 p-10 md:p-20 flex flex-col justify-center bg-white">
          <div className="mb-10 text-center lg:text-left">
            <h3 className="text-4xl font-black text-slate-800 tracking-tight">Đăng nhập</h3>
            <p className="text-slate-500 mt-3 font-medium">Vui lòng nhập tài khoản để tiếp tục</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
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