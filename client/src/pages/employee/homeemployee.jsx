import React from 'react';

const HomeEmployee = () => {
  const user = JSON.parse(localStorage.getItem('user'));

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div>
        <h2 className="text-4xl font-black text-slate-800 tracking-tighter">Chào buổi sáng, {user?.username}! 👋</h2>
        <p className="text-slate-400 font-medium mt-2 italic">Chúc bro một ngày làm việc năng suất tại Nhóm 21 HRM.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-8 rounded-[3rem] text-white shadow-xl shadow-indigo-100">
          <span className="block font-black text-6xl mb-2">22</span>
          <span className="font-bold text-xs uppercase tracking-[0.2em] opacity-80">Ngày công tháng này</span>
        </div>
        <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-8 rounded-[3rem] text-white shadow-xl shadow-amber-100">
          <span className="block font-black text-6xl mb-2">01</span>
          <span className="font-bold text-xs uppercase tracking-[0.2em] opacity-80">Đơn nghỉ chờ duyệt</span>
        </div>
        <div className="bg-gradient-to-br from-emerald-400 to-teal-500 p-8 rounded-[3rem] text-white shadow-xl shadow-emerald-100">
          <span className="block font-black text-6xl mb-2">05</span>
          <span className="font-bold text-xs uppercase tracking-[0.2em] opacity-80">Thông báo mới</span>
        </div>
      </div>

      <div className="bg-slate-50 rounded-[3.5rem] p-10 border border-slate-100">
         <h3 className="font-black text-slate-700 mb-8 flex items-center gap-3">
           <span className="w-2 h-10 bg-indigo-500 rounded-full"></span> BẢNG TIN CÔNG TY
         </h3>
         <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex justify-between items-center group hover:border-indigo-300 transition-all">
            <div className="flex gap-6 items-center text-left">
              <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-3xl text-left">📢</div>
              <div className='text-left'>
                <h4 className="font-black text-slate-800 text-lg">Cập nhật quy định về Chatbot AI</h4>
                <p className="text-sm text-slate-400 mt-1">Hệ thống sẽ bảo trì vào lúc 23:00 tối nay để nâng cấp.</p>
              </div>
            </div>
            <button className="bg-slate-100 text-slate-500 px-6 py-3 rounded-2xl font-black text-xs uppercase hover:bg-indigo-600 hover:text-white transition-all">
              Xem chi tiết
            </button>
         </div>
      </div>
    </div>
  );
};

export default HomeEmployee;