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

function App() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Hàm lấy dữ liệu từ Server (MySQL)
  const fetchJobs = async () => {
    try {
      setLoading(true);
      // Gọi đến API của Server NodeJS port 5000
      const response = await axios.get('http://localhost:5000/api/jobs');
      setJobs(response.data);
    } catch (error) {
      console.error("Lỗi kết nối API (Check server xem bro):", error);
    } finally {
      setLoading(false);
    }
  };

  // Chạy hàm lấy dữ liệu ngay khi vừa load web
  useEffect(() => {
    fetchJobs();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-100 selection:text-indigo-700">
      {/* Navbar hiện ở mọi trang */}
      <Navbar /> 
      
      {/* Khu vực điều hướng các trang */}
      <main>
        <Routes>
          {/* Trang chủ - Truyền jobs và loading xuống dưới dạng props */}
          <Route path="/" element={<Home jobs={jobs} loading={loading} />} />
          
          {/* Trang Đăng nhập */}
          <Route path="/dang-nhap" element={<DangNhap />} />
          
          {/* Trang Admin - Truyền fetchJobs để Admin có thể cập nhật lại danh sách sau khi thêm/xóa */}
          <Route path="/admin" element={<Admin jobs={jobs} fetchJobs={fetchJobs} />} />
          
          {/* Trang 404 cho mấy link bậy bạ */}
          <Route path="*" element={
            <div className="flex flex-col items-center justify-center h-[70vh]">
              <h1 className="text-9xl font-black text-slate-200">404</h1>
              <p className="text-xl font-bold text-slate-500 -mt-8">Đi đâu đấy bro? Trang này không có!</p>
              <a href="/" className="mt-6 text-indigo-600 font-bold hover:underline">Về trang chủ thôi cha nội</a>
            </div>
          } />
        </Routes>
      </main>

      {/* Footer nhẹ nhàng cuối trang */}
      <footer className="py-10 text-center text-slate-400 text-xs uppercase tracking-widest border-t border-slate-100 mt-20">
        <p>© 2026 Nhóm 21 - Hệ thống Quản trị Nhân sự (HRM)</p>
      </footer>
    </div>
  );
}

export default App;