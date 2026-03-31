import React, { useState } from 'react';

const Admin = ({ fetchJobs }) => {
  const [newJob, setNewJob] = useState({ title: '', description: '', salary: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newJob)
      });
      
      const data = await res.json();
      
      if (data.success) {
        alert("Đã đăng tin mới thành công!");
        setNewJob({ title: '', description: '', salary: '' });
        // Cập nhật lại danh sách ở trang chủ để tin mới hiện lên luôn
        if (fetchJobs) fetchJobs(); 
      } else {
        alert("Lỗi server: " + data.message);
      }
    } catch  {
      alert("Không kết nối được server! Nhớ bật backend lên nha bro.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-10 rounded-[3rem] shadow-xl border-t-8 border-indigo-600 animate-in fade-in duration-500">
      <h2 className="text-2xl font-black text-slate-800 mb-8 flex items-center gap-2 uppercase tracking-tight">
        ✍️ Đăng tin tuyển dụng
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase ml-2 mb-2 tracking-widest">Vị trí công việc</label>
          <input 
            type="text" 
            required 
            placeholder="VD: Lập trình viên NodeJS" 
            value={newJob.title}
            className="w-full p-4 border border-slate-100 bg-slate-50 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition font-bold"
            onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase ml-2 mb-2 tracking-widest">Mô tả chi tiết</label>
          <textarea 
            required 
            placeholder="Yêu cầu công việc, kỹ năng..." 
            value={newJob.description}
            className="w-full p-4 border border-slate-100 bg-slate-50 rounded-2xl h-40 focus:ring-2 focus:ring-indigo-500 outline-none resize-none transition font-medium"
            onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
          ></textarea>
        </div>

        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase ml-2 mb-2 tracking-widest">Mức lương</label>
          <input 
            type="text" 
            placeholder="VD: 15 - 20 triệu" 
            value={newJob.salary}
            className="w-full p-4 border border-slate-100 bg-slate-50 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition font-bold"
            onChange={(e) => setNewJob({ ...newJob, salary: e.target.value })}
          />
        </div>

        <button 
          type="submit"
          className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black text-lg hover:bg-emerald-700 shadow-lg shadow-emerald-50 transition active:scale-95 uppercase tracking-widest"
        >
          Xác nhận đăng tin
        </button>
      </form>
    </div>
  );
};

export default Admin;