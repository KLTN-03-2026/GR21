import React, { useState } from 'react';

const Home = ({ jobs, loading }) => {
  const [selectedJob, setSelectedJob] = useState(null);

  // Số điện thoại của bro
  const myPhoneNumber = "090xxxxxxx";

  return (
    <div className="space-y-16 animate-in fade-in duration-700 pb-20">

      {/* SECTION 1: HERO - CỰC NGẦU VỚI BỐ CỤC 2 CỘT */}
      <section className="relative overflow-hidden rounded-[4rem] bg-gradient-to-br from-indigo-700 via-violet-600 to-fuchsia-600 p-8 md:p-16 text-white shadow-2xl">
        {/* Hiệu ứng hạt (Dots) trang trí nền */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#white 1px, transparent 1px)', size: '20px 20px' }}></div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Cột trái: Nội dung */}
          <div className="space-y-8">
            <span className="inline-block bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border border-white/30">
              🚀 Powered by NHÓM 21 AI
            </span>
            <h1 className="text-5xl md:text-7xl font-black leading-[1.1] tracking-tight">
              Quản trị <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-200 to-indigo-200">Nhân sự 4.0</span>
            </h1>
            <p className="text-indigo-50 text-lg md:text-xl leading-relaxed max-w-lg opacity-90">
              Hệ thống HRM thông minh tích hợp Chatbot AI, giúp tối ưu hóa quy trình tuyển dụng và quản lý nhân sự cho doanh nghiệp nhỏ.
            </p>

            <div className="pt-4">
              <a
                href={`tel:${myPhoneNumber}`}
                className="inline-flex items-center gap-4 bg-white text-indigo-600 px-10 py-5 rounded-[2.5rem] font-black text-xl hover:bg-indigo-50 transition-all shadow-[0_20px_50px_rgba(0,0,0,0.2)] hover:-translate-y-1 active:scale-95 group"
              >
                <div className="bg-indigo-100 p-2 rounded-full group-hover:rotate-12 transition-transform">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                LIÊN HỆ: {myPhoneNumber}
              </a>
            </div>
          </div>

          {/* Cột phải: Hình ảnh minh họa hoặc Box tính năng AI */}
          <div className="hidden lg:block relative">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-[3rem] shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-teal-400 rounded-2xl flex items-center justify-center text-2xl">🤖</div>
                <div>
                  <h4 className="font-bold text-xl">AI Assistant</h4>
                  <p className="text-xs text-indigo-200">Sẵn sàng hỗ trợ tra cứu...</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="bg-white/5 p-3 rounded-xl text-sm border border-white/10 italic">"Tìm cho tôi danh sách lập trình viên ReactJS?"</div>
                <div className="bg-white/5 p-3 rounded-xl text-sm border border-white/10 italic">"Lương trung bình của phòng kỹ thuật là bao nhiêu?"</div>
              </div>
            </div>
            {/* Decor lơ lửng */}
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-fuchsia-400/30 rounded-full blur-3xl"></div>
          </div>
        </div>
      </section>

      {/* SECTION 2: DANH SÁCH JOB (DỮ LIỆU THẬT) */}
      <section>
        <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h2 className="text-4xl font-black text-slate-800 tracking-tight">Vị trí đang tuyển dụng</h2>
            <p className="text-slate-500 mt-2 font-medium italic">Gia nhập đội ngũ Nhóm 21 để cùng nhau phát triển.</p>
          </div>
          <div className="bg-emerald-50 px-6 py-3 rounded-2xl text-emerald-700 font-bold text-sm border border-emerald-100 flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            {jobs?.length || 0} Cơ hội mới
          </div>
        </div>

        {loading ? (
          <div className="py-32 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-4 border-indigo-600 border-solid mb-4"></div>
            <p className="text-slate-400 font-bold tracking-widest uppercase text-sm">Đang đồng bộ dữ liệu...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {jobs?.map(job => (
              <div
                key={job.id}
                onClick={() => setSelectedJob(job)}
                className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all cursor-pointer group hover:-translate-y-2"
              >
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-2xl font-bold text-slate-800 group-hover:text-indigo-600 transition-colors leading-tight">
                    {job.title}
                  </h3>
                </div>
                <p className="text-slate-500 text-sm mb-8 line-clamp-2 leading-relaxed font-medium">
                  {job.description}
                </p>
                <div className="flex justify-between items-center pt-6 border-t border-slate-50">
                  <div className="space-y-1">
                    <span className="block text-[10px] font-black text-slate-400 uppercase tracking-tighter">Mức lương dự kiến</span>
                    <span className="text-emerald-600 font-black text-xl">💰 {job.salary}</span>
                  </div>
                  <button className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold text-sm group-hover:bg-indigo-600 transition-all shadow-lg">
                    Xem chi tiết
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* MODAL CHI TIẾT (GIỮ LẠI VÌ NÓ QUÁ NGON) */}
      {selectedJob && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[3.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="bg-indigo-600 p-10 text-white flex justify-between items-start">
              <div>
                <h3 className="text-3xl font-black mb-2">{selectedJob.title}</h3>
                <div className="flex gap-2">
                  <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-bold border border-white/30">Hiring</span>
                  <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-bold border border-white/30 italic">Nhóm 21 Verified</span>
                </div>
              </div>
              <button onClick={() => setSelectedJob(null)} className="hover:bg-white/20 w-10 h-10 rounded-full flex items-center justify-center text-2xl transition-all">✕</button>
            </div>
            <div className="p-12 space-y-8">
              <div>
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span className="w-8 h-[2px] bg-indigo-100"></span> Chi tiết công việc
                </h4>
                <p className="text-slate-700 leading-relaxed text-lg whitespace-pre-wrap font-medium">{selectedJob.description}</p>
              </div>
              <div className="bg-slate-50 p-6 rounded-3xl grid grid-cols-2 gap-4 border border-slate-100">
                <div>
                  <span className="block text-[10px] font-black text-slate-400 uppercase mb-1">Mức lương</span>
                  <span className="text-emerald-600 font-black text-2xl">{selectedJob.salary}</span>
                </div>
                <div className="text-right">
                  <span className="block text-[10px] font-black text-slate-400 uppercase mb-1">Ngày đăng</span>
                  <span className="text-slate-500 font-bold">{new Date(selectedJob.created_at).toLocaleDateString('vi-VN')}</span>
                </div>
              </div>
              <button className="w-full bg-indigo-600 text-white py-6 rounded-[2rem] font-black text-xl hover:bg-indigo-700 transition shadow-2xl shadow-indigo-100 active:scale-95">
                ỨNG TUYỂN NGAY
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;