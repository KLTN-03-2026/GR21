import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { X, Bell, LayoutDashboard, Calendar, FileText, ChevronRight, Mail, Phone } from 'lucide-react';

const HomeEmployee = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const [data, setData] = useState({ 
    workDays: 0, 
    pendingLeaves: 0, 
    publicNotifs: [], 
    deptNotifs: [],
    colleagues: [] 
  });
  const [loading, setLoading] = useState(true);
  const [selectedNotif, setSelectedNotif] = useState(null);
  const [selectedColleague, setSelectedColleague] = useState(null);
  
  // Ref để điều khiển thanh cuộn ngang
  const scrollRef = useRef(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/employee/home/stats/${user.id}`);
        setData(res.data);
      } catch (err) {
        console.error("Lỗi đồng bộ Dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    if (user?.id) fetchStats();
  }, [user.id]);

  // Hàm cuộn mượt mà sang phải
  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  const closeModal = () => setSelectedNotif(null);

  return (
    <div className="space-y-10 animate-in fade-in duration-1000 pb-10">
      {/* HEADER */}
      <div className="text-left">
        <h2 className="text-4xl font-black text-slate-800 tracking-tighter italic uppercase leading-none">
            Chào buổi sáng, {user?.full_name || user?.username}! 👋
        </h2>
        <p className="text-slate-400 font-bold mt-3 italic text-[11px] uppercase tracking-widest flex items-center gap-2">
          <LayoutDashboard size={14} /> Hệ thống quản trị nhân sự Nhóm 21 - Have a nice day!
        </p>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard color="from-indigo-600 to-violet-700" value={data.workDays} label={`Ngày công tháng ${new Date().getMonth() + 1}`} icon={<Calendar size={24}/>} loading={loading} />
        <StatCard color="from-amber-400 to-orange-500" value={data.pendingLeaves} label="Đơn nghỉ chờ duyệt" icon={<FileText size={24}/>} loading={loading} />
        <StatCard color="from-emerald-400 to-teal-500" value={data.publicNotifs.length + data.deptNotifs.length} label="Thông báo mới" icon={<Bell size={24}/>} loading={loading} />
      </div>

      {/* TEAM CỦA TÔI (SCROLL NGANG + SẾP TỎA SÁNG) */}
      <div className="bg-white/50 backdrop-blur-sm rounded-[3.5rem] p-10 border border-white shadow-xl shadow-slate-100/50">
        <div className="flex justify-between items-center mb-8 px-2">
          <h3 className="font-black text-slate-800 flex items-center gap-4 italic uppercase text-left tracking-tighter text-xl">
            <span className="w-2 h-8 bg-emerald-400 rounded-full shadow-lg shadow-emerald-100"></span> 
            Đồng nghiệp cùng phòng ({data.colleagues?.length || 0})
          </h3>
          <button 
            onClick={scrollRight}
            className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase italic tracking-widest hover:text-indigo-600 transition-all active:scale-95"
          >
             Lướt xem thêm <ChevronRight size={12} />
          </button>
        </div>
        
        <div ref={scrollRef} className="flex gap-8 overflow-x-auto pb-6 px-2 no-scrollbar scroll-smooth">
          {data.colleagues?.length > 0 ? data.colleagues.map((member) => {
            const isManager = member.role === 'manager';
            return (
              <div 
                key={member.id} 
                onClick={() => setSelectedColleague(member)}
                className="flex flex-col items-center gap-4 group flex-shrink-0 cursor-pointer"
              >
                <div className="relative">
                  <div className={`w-24 h-24 rounded-[2.5rem] flex items-center justify-center text-3xl font-black text-white border-4 transition-all duration-500 italic shadow-2xl
                    ${isManager 
                      ? 'bg-gradient-to-tr from-amber-400 to-yellow-600 border-yellow-200 scale-110 shadow-yellow-200 rotate-3 ring-4 ring-yellow-400/20' 
                      : 'bg-gradient-to-tr from-indigo-500 to-purple-600 border-white shadow-indigo-100 group-hover:rotate-6'
                    }`}
                  >
                    {member.full_name.charAt(0)}
                    {isManager && (
                      <div className="absolute -top-3 -right-1 bg-yellow-400 text-white p-1.5 rounded-lg shadow-lg rotate-12">
                         <span className="text-[10px]">👑</span>
                      </div>
                    )}
                  </div>
                  <div className={`absolute bottom-1 right-1 w-6 h-6 border-4 border-white rounded-full ${isManager ? 'bg-orange-500' : 'bg-emerald-500'}`}></div>
                </div>
                <div className="text-center w-24">
                  <p className={`font-black text-[11px] uppercase truncate transition-colors ${isManager ? 'text-amber-600' : 'text-slate-800 group-hover:text-indigo-600'}`}>
                    {member.full_name.split(' ').pop()}
                  </p>
                  <span className={`text-[7px] px-2 py-0.5 rounded-md font-black uppercase italic truncate block mt-1
                    ${isManager ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-400'}`}>
                    {member.position}
                  </span>
                </div>
              </div>
            );
          }) : (
            <div className="w-full py-6 text-center text-slate-300 font-black italic uppercase text-xs tracking-widest border-2 border-dashed border-slate-100 rounded-[2rem]">
                Team đang chờ bro gia nhập... 🚀
            </div>
          )}
        </div>
      </div>

      {/* BẢNG TIN TỔNG HỢP */}
      <div className="bg-slate-50 rounded-[4rem] p-8 md:p-12 border border-slate-100 shadow-inner space-y-12">
         {/* THÔNG BÁO ADMIN */}
         <div className="space-y-8 text-left">
            <h3 className="font-black text-slate-800 flex items-center gap-4 italic uppercase tracking-tighter text-2xl">
              <span className="w-3 h-10 bg-rose-500 rounded-full shadow-lg shadow-rose-100"></span> 
              Thông báo từ Admin
            </h3>
            <div className="grid gap-6">
               {data.publicNotifs.map(notif => (
                 <NotificationCard key={`pub-${notif.id}`} notif={notif} type="admin" onClick={() => setSelectedNotif(notif)} />
               ))}
            </div>
         </div>

         {/* THÔNG BÁO PHÒNG BAN */}
         <div className="space-y-8 text-left">
            <h3 className="font-black text-slate-800 flex items-center gap-4 italic uppercase tracking-tighter text-2xl">
              <span className="w-3 h-10 bg-indigo-600 rounded-full shadow-lg shadow-indigo-100"></span> 
              Thông báo phòng ban
            </h3>
            <div className="grid gap-6">
               {data.deptNotifs.map(notif => (
                 <NotificationCard key={`dept-${notif.id}`} notif={notif} type="manager" onClick={() => setSelectedNotif(notif)} />
               ))}
            </div>
         </div>
      </div>

      {/* MODAL CHI TIẾT ĐỒNG NGHIỆP */}
      {selectedColleague && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in" onClick={() => setSelectedColleague(null)}></div>
          <div className="relative bg-white w-full max-w-sm rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className={`h-24 ${selectedColleague.role === 'manager' ? 'bg-gradient-to-r from-amber-400 to-yellow-600' : 'bg-gradient-to-r from-indigo-600 to-purple-600'}`}></div>
            <div className="px-8 pb-10 text-center relative">
              <div className="w-24 h-24 bg-white rounded-[2rem] mx-auto -mt-12 flex items-center justify-center text-4xl font-black text-indigo-600 shadow-xl border-4 border-white italic">
                {selectedColleague.full_name.charAt(0)}
              </div>
              <h3 className="text-2xl font-black text-slate-800 uppercase italic mt-4">{selectedColleague.full_name}</h3>
              <p className="text-indigo-500 font-black text-[10px] uppercase tracking-widest mb-6">{selectedColleague.position}</p>
              
              <div className="space-y-4 text-left bg-slate-50 p-6 rounded-[2rem]">
                <div className="flex items-center gap-4 text-slate-600">
                  <Mail size={16} className="text-slate-400" />
                  <span className="text-xs font-bold truncate">{selectedColleague.email || "Chưa cập nhật"}</span>
                </div>
                <div className="flex items-center gap-4 text-slate-600">
                  <Phone size={16} className="text-slate-400" />
                  <span className="text-xs font-bold">{selectedColleague.phone || "09x.xxx.xxxx"}</span>
                </div>
              </div>
              <button onClick={() => setSelectedColleague(null)} className="w-full mt-8 bg-slate-900 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-indigo-600 transition-all shadow-lg">Đóng lại</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL THÔNG BÁO (Giữ nguyên) */}
      {selectedNotif && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in" onClick={closeModal}></div>
          <div className="relative bg-white w-full max-w-2xl rounded-[3.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 text-left">
            <div className="p-10 md:p-14">
              <div className="flex justify-between items-start mb-8">
                 <span className={`text-[9px] px-4 py-2 rounded-full font-black uppercase tracking-[0.2em] shadow-sm ${selectedNotif.scope === 'all' ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-indigo-50 text-indigo-600 border border-indigo-100'}`}>
                    {selectedNotif.scope === 'all' ? '📢 Thông báo chung' : '👥 Nội bộ phòng'}
                 </span>
                 <button onClick={closeModal} className="p-2 bg-slate-50 rounded-xl text-slate-400 hover:text-rose-500 transition-all"><X size={24} /></button>
              </div>
              <h3 className="text-3xl font-black text-slate-800 uppercase italic tracking-tighter mb-6 leading-tight">{selectedNotif.title}</h3>
              <div className="flex items-center gap-3 text-slate-400 font-bold text-[10px] uppercase mb-10 pb-8 border-b border-slate-50 italic"><Calendar size={14} /> Đăng vào: {new Date(selectedNotif.created_at).toLocaleString('vi-VN')}</div>
              <div className="text-slate-600 font-bold leading-relaxed italic text-lg mb-12 max-h-[40vh] overflow-y-auto no-scrollbar">{selectedNotif.content}</div>
              <button onClick={closeModal} className="w-full bg-slate-900 text-white py-6 rounded-[2.5rem] font-black uppercase tracking-[0.3em] italic hover:bg-indigo-600 shadow-2xl">Đã hiểu, thưa sếp!</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Component con: Thẻ thông báo
const NotificationCard = ({ notif, type, onClick }) => (
  <div className="bg-white p-8 md:p-10 rounded-[3rem] shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 group hover:border-indigo-400 transition-all duration-500 hover:shadow-2xl">
    <div className="flex gap-6 md:gap-8 items-center text-left">
      <div className={`w-16 h-16 md:w-20 md:h-20 rounded-[2rem] flex items-center justify-center text-3xl md:text-4xl shadow-inner group-hover:rotate-12 transition-transform ${type === 'admin' ? 'bg-rose-50' : 'bg-indigo-50'}`}>{type === 'admin' ? '📢' : '👥'}</div>
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h4 className="font-black text-slate-800 text-lg md:text-xl italic uppercase tracking-tighter leading-none">{notif.title}</h4>
          <span className={`text-[8px] px-3 py-1 rounded-full font-black uppercase tracking-widest ${type === 'admin' ? 'bg-rose-100 text-rose-600' : 'bg-indigo-100 text-indigo-600'}`}>{type === 'admin' ? 'Admin' : 'Phòng ban'}</span>
        </div>
        <p className="text-sm text-slate-400 mt-3 italic font-bold line-clamp-1">{notif.content}</p>
      </div>
    </div>
    <button onClick={onClick} className="w-full md:w-auto bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-indigo-600 shadow-lg">Xem chi tiết</button>
  </div>
);

// Component con: Thẻ thống kê
const StatCard = ({ color, value, label, icon, loading }) => (
  <div className={`bg-gradient-to-br ${color} p-9 rounded-[3.5rem] text-white shadow-2xl flex flex-col items-start transition-all hover:-translate-y-2 duration-300 group relative overflow-hidden`}>
    <div className="absolute top-6 right-8 opacity-20 group-hover:scale-125 transition-transform duration-500">{icon}</div>
    <span className="block font-black text-7xl mb-2 italic group-hover:scale-110 transition-transform">{loading ? '...' : (value < 10 ? `0${value}` : value)}</span>
    <span className="font-black text-[10px] uppercase tracking-[0.2em] opacity-70 italic">{label}</span>
  </div>
);

export default HomeEmployee;