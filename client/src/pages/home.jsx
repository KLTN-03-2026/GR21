import React, { useState } from 'react';

const Home = ({ jobs, loading }) => {
  const [selectedJob, setSelectedJob] = useState(null);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="mb-10">
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">Tin tuyển dụng mới nhất</h2>
        <p className="text-slate-500 mt-1">Tìm kiếm vị trí phù hợp với năng lực của bạn.</p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-300 font-bold uppercase tracking-widest">Đang quét dữ liệu...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {jobs?.map(job => (
            <div 
              key={job.id} 
              onClick={() => setSelectedJob(job)}
              className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all cursor-pointer group"
            >
              <h3 className="text-2xl font-bold text-slate-800 mb-3 group-hover:text-indigo-600">{job.title}</h3>
              <p className="text-slate-500 text-sm mb-6 line-clamp-2 leading-relaxed italic">{job.description}</p>
              <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                <span className="text-emerald-600 font-black">💰 {job.salary}</span>
                <span className="text-indigo-600 font-bold text-sm">Chi tiết →</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL CHI TIẾT TIN (Click vào là hiện) */}
      {selectedJob && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="bg-indigo-600 p-8 text-white flex justify-between items-start">
              <div>
                <h3 className="text-3xl font-black mb-2">{selectedJob.title}</h3>
                <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">Tin chính thức</span>
              </div>
              <button onClick={() => setSelectedJob(null)} className="text-white/60 hover:text-white text-2xl">✕</button>
            </div>
            <div className="p-10 space-y-6">
              <div>
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Chi tiết công việc</h4>
                <p className="text-slate-700 leading-relaxed text-lg whitespace-pre-wrap">{selectedJob.description}</p>
              </div>
              <div className="bg-slate-50 p-6 rounded-3xl flex justify-between items-center">
                <div>
                  <span className="block text-[10px] font-black text-slate-400 uppercase mb-1 font-bold">Lương</span>
                  <span className="text-emerald-600 font-black text-2xl">{selectedJob.salary}</span>
                </div>
                <div className="text-right">
                  <span className="block text-[10px] font-black text-slate-400 uppercase mb-1 font-bold">Ngày đăng</span>
                  <span className="text-slate-500 font-bold">{new Date(selectedJob.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <button className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-bold text-xl hover:bg-indigo-700 transition shadow-xl shadow-indigo-100">ỨNG TUYỂN NGAY</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;