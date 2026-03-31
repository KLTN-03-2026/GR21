import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Dùng cái này để chuyển trang bro ơi

const DangNhap = () => {
  const [form, setForm] = useState({ username: '', password: '' });
  const navigate = useNavigate(); // Khởi tạo điều hướng

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      
      if (data.success) {
        // Lưu thông tin vào LocalStorage để các trang khác biết mình đã login
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Chuyển hướng thẳng sang trang Admin
        navigate('/admin'); 
      } else {
        alert(data.message || "Sai tài khoản hoặc mật khẩu!");
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi kết nối Server rồi bro! Check xem server chạy ở port 5000 chưa?");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 px-4">
      <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-100">
        <h2 className="text-3xl font-black text-slate-800 text-center mb-8 uppercase italic tracking-tighter">
          Admin Login
        </h2>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="text-[10px] font-black text-slate-400 ml-2 uppercase tracking-widest">Tài khoản</label>
            <input 
              type="text" 
              placeholder="Nhập username..." 
              required
              className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl outline-none mt-1 font-bold transition-all"
              onChange={(e) => setForm({ ...form, username: e.target.value })}
            />
          </div>
          
          <div>
            <label className="text-[10px] font-black text-slate-400 ml-2 uppercase tracking-widest">Mật khẩu</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              required
              className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl outline-none mt-1 font-bold transition-all"
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
          
          <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-lg hover:bg-indigo-600 transition-all shadow-xl active:scale-95 uppercase mt-4">
            Vào hệ thống
          </button>
        </form>
      </div>
    </div>
  );
};

export default DangNhap;