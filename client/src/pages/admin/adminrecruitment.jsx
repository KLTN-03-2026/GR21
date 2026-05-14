import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Mail, Phone, ExternalLink, CheckCircle2, XCircle, 
    Search, Briefcase, UserCheck, Inbox 
} from 'lucide-react';

const AdminRecruitment = () => {
    const [apps, setApps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Admin mặc định lấy toàn bộ dữ liệu
    // eslint-disable-next-line no-unused-vars
    const role = localStorage.getItem('userRole');

    const fetchApplications = async () => {
        setLoading(true);
        try {
            // Gọi API lấy đơn cho Admin
            const res = await axios.get(`http://localhost:5000/api/recruitment/all`, {
                params: { role: 'admin' } 
            });
            setApps(res.data);
        } catch (err) {
            console.error("Lỗi fetch đơn Admin:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplications();
    }, []);

    const handleUpdateStatus = async (app, newStatus) => {
        const confirmMsg = newStatus === 'hired' 
            ? `Xác nhận DUYỆT ứng viên ${app.full_name} và gửi GMAIL thông báo?` 
            : `Xác nhận TỪ CHỐI ứng viên ${app.full_name}?`;

        if (window.confirm(confirmMsg)) {
            try {
                await axios.put(`http://localhost:5000/api/recruitment/update-status/${app.id}`, {
                    status: newStatus,
                    email: app.email,
                    full_name: app.full_name,
                    job_title: app.job_title
                });
                alert(newStatus === 'hired' ? "Đã duyệt & gửi Gmail thành công! 📧" : "Đã cập nhật trạng thái.");
                fetchApplications();
            // eslint-disable-next-line no-unused-vars
            } catch (err) {
                alert("Lỗi hệ thống khi cập nhật bro ơi!");
            }
        }
    };

    const filteredApps = apps.filter(app => 
        app.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.job_title?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
            
            {/* --- ADMIN QUICK STATS --- */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-slate-900 p-6 rounded-[2rem] text-white flex flex-col justify-between shadow-xl italic">
                    <Inbox className="text-indigo-400 mb-4" size={24} />
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Tổng đơn</p>
                        <h4 className="text-4xl font-black tracking-tighter">{apps.length}</h4>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 flex flex-col justify-between shadow-sm hover:shadow-lg transition-all">
                    <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center font-bold">⏳</div>
                    <div className="mt-4">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Chờ duyệt</p>
                        <h4 className="text-3xl font-black text-slate-800 tracking-tighter">{apps.filter(a => a.status === 'pending').length}</h4>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 flex flex-col justify-between shadow-sm hover:shadow-lg transition-all">
                    <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center font-bold">✅</div>
                    <div className="mt-4">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Đã tuyển</p>
                        <h4 className="text-3xl font-black text-slate-800 tracking-tighter">{apps.filter(a => a.status === 'hired').length}</h4>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 flex flex-col justify-between shadow-sm hover:shadow-lg transition-all">
                    <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center font-bold">❌</div>
                    <div className="mt-4">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Đã loại</p>
                        <h4 className="text-3xl font-black text-slate-800 tracking-tighter">{apps.filter(a => a.status === 'rejected').length}</h4>
                    </div>
                </div>
            </div>

            {/* --- SEARCH BAR --- */}
            <div className="relative group shadow-sm">
                <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={22} />
                <input 
                    type="text" 
                    placeholder="Tìm tên ứng viên, email hoặc vị trí..."
                    className="w-full pl-20 pr-10 py-6 bg-white rounded-[2rem] border-none focus:ring-4 focus:ring-indigo-500/10 font-bold text-base outline-none transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* --- APPLICATIONS LISTING --- */}
            {loading ? (
                <div className="py-24 text-center">
                    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="font-black text-slate-400 uppercase tracking-[0.3em] italic">Đang đồng bộ dữ liệu Admin...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 2xl:grid-cols-2 gap-8 pb-12">
                    {filteredApps.map((app) => (
                        <div key={app.id} className="bg-white rounded-[3.5rem] p-10 border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/5 transition-all group relative overflow-hidden flex flex-col md:flex-row gap-10 items-start">
                            
                            {/* Status Badge */}
                            <div className={`absolute top-0 right-14 px-8 py-2 rounded-b-3xl text-[10px] font-black uppercase italic tracking-widest shadow-sm ${
                                app.status === 'pending' ? 'bg-amber-100 text-amber-600' : 
                                app.status === 'hired' ? 'bg-emerald-600 text-white' : 'bg-rose-100 text-rose-600'
                            }`}>
                                ● {app.status}
                            </div>

                            <div className="w-28 h-28 bg-slate-100 rounded-[3rem] flex items-center justify-center text-4xl font-black text-slate-800 italic shadow-inner group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 shrink-0">
                                {app.full_name?.charAt(0)}
                            </div>

                            <div className="flex-1 text-left space-y-6">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Briefcase size={14} className="text-indigo-500" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">{app.job_title}</span>
                                        <span className="text-slate-300 mx-2">|</span>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase italic">Phòng: {app.dep_name || 'Chung'}</span>
                                    </div>
                                    <h3 className="text-4xl font-black text-slate-800 uppercase italic tracking-tighter leading-tight">{app.full_name}</h3>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="flex items-center gap-3 text-slate-500 font-bold text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                        <Mail size={16} className="text-indigo-400" /> {app.email}
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-500 font-bold text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                        <Phone size={16} className="text-indigo-400" /> {app.phone}
                                    </div>
                                </div>

                                <div className="pt-8 border-t border-slate-50 flex flex-wrap items-center gap-4">
                                    <a 
                                        href={app.cv_link} 
                                        target="_blank" 
                                        rel="noreferrer"
                                        className="flex items-center gap-3 bg-slate-900 text-white px-10 py-5 rounded-[2rem] font-black text-[11px] uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl italic"
                                    >
                                        Mở CV ứng viên <ExternalLink size={16} />
                                    </a>

                                    {app.status === 'pending' && (
                                        <div className="flex gap-3 ml-auto">
                                            <button 
                                                onClick={() => handleUpdateStatus(app, 'hired')}
                                                className="w-16 h-16 flex items-center justify-center bg-emerald-50 text-emerald-600 rounded-3xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm active:scale-90"
                                                title="Duyệt hồ sơ"
                                            >
                                                <CheckCircle2 size={32} />
                                            </button>
                                            <button 
                                                onClick={() => handleUpdateStatus(app, 'rejected')}
                                                className="w-16 h-16 flex items-center justify-center bg-rose-50 text-rose-600 rounded-3xl hover:bg-rose-600 hover:text-white transition-all shadow-sm active:scale-90"
                                                title="Loại hồ sơ"
                                            >
                                                <XCircle size={32} />
                                            </button>
                                        </div>
                                    )}

                                    {app.status === 'hired' && (
                                        <div className="ml-auto flex items-center gap-3 text-emerald-500 font-black uppercase text-[11px] italic tracking-widest bg-emerald-50 px-6 py-3 rounded-full border border-emerald-100">
                                            <UserCheck size={20} /> Đã mời nhận việc
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminRecruitment;