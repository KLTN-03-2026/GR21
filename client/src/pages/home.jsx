import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Home = ({ jobs, loading }) => {
  const [selectedJob, setSelectedJob] = useState(null);

  // Số điện thoại của bro
  const myPhoneNumber = "035534xxxx";
  const userRole = localStorage.getItem('userRole');

  return (
    <div className="space-y-16 animate-in fade-in duration-700 pb-20">

      {/* SECTION 1: HERO - CỰC NGẦU VỚI BỐ CỤC 2 CỘT */}
      <section className="relative overflow-hidden rounded-[4rem] bg-gradient-to-br from-indigo-700 via-violet-600 to-fuchsia-600 p-8 md:p-16 text-white shadow-2xl">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
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

            <div className="flex flex-wrap gap-4 pt-4">
              {/* NÚT CHÍNH: DẪN VÀO HỆ THỐNG */}
              <Link
                to={!userRole ? "/dang-nhap" : (userRole === 'admin' ? "/admin/dashboard" : "/employee/home")}
                className="inline-flex items-center gap-4 bg-white text-indigo-600 px-8 py-5 rounded-[2.5rem] font-black text-xl hover:bg-indigo-50 transition-all shadow-xl hover:-translate-y-1 active:scale-95"
              >
                {!userRole ? "TRẢI NGHIỆM NGAY" : "VÀO HỆ THỐNG ↗"}
              </Link>
              
              {/* NÚT PHỤ: LIÊN HỆ */}
              <a
                href={`tel:${myPhoneNumber}`}
                className="inline-flex items-center gap-4 bg-indigo-800/30 backdrop-blur-md text-white border border-white/20 px-8 py-5 rounded-[2.5rem] font-bold text-lg hover:bg-indigo-800/50 transition-all"
              >
                📞 HOTLINE
              </a>
            </div>
          </div>

          {/* Cột phải: Box tính năng AI */}
          <div className="hidden lg:block relative">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-[3rem] shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-teal-400 rounded-2xl flex items-center justify-center text-2xl">🤖</div>
                <div>
                  <h4 className="font-bold text-xl">AI Assistant</h4>
                  <p className="text-xs text-indigo-200 italic font-medium animate-pulse">Đang trực tuyến...</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="bg-white/5 p-4 rounded-2xl text-sm border border-white/10 italic hover:bg-white/10 transition-colors">
                   "Tìm cho tôi danh sách lập trình viên ReactJS?"
                </div>
                <div className="bg-white/5 p-4 rounded-2xl text-sm border border-white/10 italic hover:bg-white/10 transition-colors">
                   "Lương trung bình của phòng kỹ thuật là bao nhiêu?"
                </div>
              </div>
            </div>
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-fuchsia-400/30 rounded-full blur-3xl"></div>
          </div>
        </div>
      </section>

      {/* SECTION 2: DANH SÁCH JOB */}
      <section className="px-4">
        <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h2 className="text-4xl font-black text-slate-800 tracking-tight">Vị trí tuyển dụng</h2>
            <p className="text-slate-500 mt-2 font-medium italic underline decoration-indigo-200 decoration-4">Cơ hội nghề nghiệp hấp dẫn tại Nhóm 21.</p>
          </div>
          <div className="bg-emerald-50 px-6 py-3 rounded-2xl text-emerald-700 font-bold text-sm border border-emerald-100 flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            {jobs?.length || 0} Vị trí mới
          </div>
        </div>

        {loading ? (
          <div className="py-32 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-4 border-indigo-600 border-solid mb-4"></div>
            <p className="text-slate-400 font-bold tracking-widest uppercase text-sm">Đang tải dữ liệu...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {jobs?.map(job => (
              <div
                key={job.id}
                onClick={() => setSelectedJob(job)}
                className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all cursor-pointer group hover:-translate-y-2 flex flex-col justify-between min-h-[320px]"
              >
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="text-2xl font-bold text-slate-800 group-hover:text-indigo-600 transition-colors leading-tight">
                      {job.title}
                    </h3>
                  </div>
                  <p className="text-slate-500 text-sm mb-8 line-clamp-3 leading-relaxed font-medium">
                    {job.description}
                  </p>
                </div>
                <div className="pt-6 border-t border-slate-50 flex justify-between items-center">
                  <div className="space-y-1">
                    <span className="block text-[10px] font-black text-slate-400 uppercase tracking-tighter">Thu nhập</span>
                    <span className="text-emerald-600 font-black text-xl">{job.salary}</span>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    →
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* MODAL CHI TIẾT */}
      {selectedJob && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[3.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="bg-indigo-600 p-10 text-white flex justify-between items-start">
              <div>
                <h3 className="text-3xl font-black mb-2">{selectedJob.title}</h3>
                <div className="flex gap-2">
                  <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-bold border border-white/30 tracking-widest">URGENT</span>
                  <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-bold border border-white/30 italic">NHÓM 21 VERIFIED</span>
                </div>
              </div>
              <button onClick={() => setSelectedJob(null)} className="hover:bg-white/20 w-10 h-10 rounded-full flex items-center justify-center text-2xl transition-all">✕</button>
            </div>
            <div className="p-12 space-y-8">
              <div>
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span className="w-8 h-[2px] bg-indigo-100"></span> Mô tả chi tiết
                </h4>
                <p className="text-slate-700 leading-relaxed text-lg whitespace-pre-wrap font-medium h-40 overflow-y-auto pr-4 custom-scrollbar">
                  {selectedJob.description}
                </p>
              </div>
              <div className="bg-slate-50 p-6 rounded-3xl grid grid-cols-2 gap-4 border border-slate-100">
                <div>
                  <span className="block text-[10px] font-black text-slate-400 uppercase mb-1">Mức lương</span>
                  <span className="text-emerald-600 font-black text-2xl">{selectedJob.salary}</span>
                </div>
                <div className="text-right">
                  <span className="block text-[10px] font-black text-slate-400 uppercase mb-1">Trạng thái</span>
                  <span className="text-indigo-600 font-bold uppercase text-xs tracking-widest">Đang tuyển 🟢</span>
                </div>
              </div>
              <button 
                onClick={() => alert("Chức năng ứng tuyển đang được bảo trì bro ơi!")}
                className="w-full bg-slate-900 text-white py-6 rounded-[2rem] font-black text-xl hover:bg-indigo-600 transition shadow-2xl active:scale-95 uppercase tracking-widest"
              >
                Gửi CV ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;