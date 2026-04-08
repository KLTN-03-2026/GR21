import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import axios from 'axios';

// Import CSS để kích hoạt Tailwind (Bắt buộc)
import './index.css';

// Import các trang và component
import Home from './pages/home';
import DangNhap from './pages/dangnhap';
import Admin from './pages/admin';
import Navbar from './components/Navbar';
import PhongBan from './pages/departments'; // Giả sử bro để trong thư mục pages

function App() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Hàm lấy dữ liệu từ Server (MySQL) cho Jobs
  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/jobs');
      setJobs(response.data);
    } catch (error) {
      console.error("Lỗi kết nối API Jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-100 selection:text-indigo-700">
      <Navbar />

      <main>
        <Routes>
          <Route path="/" element={<Home jobs={jobs} loading={loading} />} />
          <Route path="/dang-nhap" element={<DangNhap />} />

          {/* Trang Admin tổng hoặc trang quản lý Jobs */}
          <Route path="/admin" element={<Admin jobs={jobs} fetchJobs={fetchJobs} />} />

          {/* --- THÊM ROUTE QUẢN LÝ PHÒNG BAN Ở ĐÂY --- */}
          <Route path="/admin/phong-ban" element={<PhongBan />} />

          <Route path="*" element={
            <div className="flex flex-col items-center justify-center h-[70vh]">
              <h1 className="text-9xl font-black text-slate-200">404</h1>
              <p className="text-xl font-bold text-slate-500 -mt-8">Đi đâu đấy bro? Trang này không có!</p>
              <a href="/" className="mt-6 text-indigo-600 font-bold hover:underline">Về trang chủ thôi cha nội</a>
            </div>
          } />
        </Routes>
      </main>

      <footer className="py-10 text-center text-slate-400 text-xs uppercase tracking-widest border-t border-slate-100 mt-20">
        <p>© 2026 Nhóm 21 - Hệ thống Quản trị Nhân sự (HRM)</p>
      </footer>
    </div>
  );
}

export default App;