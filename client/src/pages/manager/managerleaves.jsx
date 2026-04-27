import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Calendar, Check, X, Clock, FileText, Send, 
    Plus, UserCheck, History, Briefcase, Trash2 
} from 'lucide-react';

const ManagerLeaves = () => {
    const [activeTab, setActiveTab] = useState('review'); 
    const [staffLeaves, setStaffLeaves] = useState([]);
    const [myHistory, setMyHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    const user = JSON.parse(localStorage.getItem('user'));
    const managerId = user?.id;
    const depId = user?.dep_id;

    const [form, setForm] = useState({
        start_date: '',
        end_date: '',
        reason: '',
        leave_type: 'Nghỉ phép năm'
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [resStaff, resMy] = await Promise.all([
                axios.get(`http://localhost:5000/api/manager/leaves/staff-leaves/${depId}/${managerId}`),
                axios.get(`http://localhost:5000/api/manager/leaves/my-history/${managerId}`)
            ]);
            setStaffLeaves(resStaff.data);
            setMyHistory(resMy.data);
        } catch (err) {
            console.error("Lỗi lấy dữ liệu nghỉ phép:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (managerId && depId) fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [managerId, depId]);

    const handleAction = async (id, status) => {
        const actionText = status === 'approved' ? "Chấp thuận" : "Từ chối";
        if (!window.confirm(`Bro chắc chắn muốn ${actionText} đơn này?`)) return;
        try {
            await axios.put(`http://localhost:5000/api/manager/leaves/review/${id}`, { status });
            alert(`${actionText} thành công! ✅`);
            fetchData();
        // eslint-disable-next-line no-unused-vars
        } catch (err) { alert("Lỗi thao tác rồi bro!"); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Bro định xóa đơn này cho đỡ chật bảng thiệt hả? kkk 🧹")) return;
        try {
            await axios.delete(`http://localhost:5000/api/manager/leaves/delete/${id}`);
            fetchData();
        // eslint-disable-next-line no-unused-vars
        } catch (err) { alert("Xóa hụt rồi bro!"); }
    };

    const handleSubmitLeave = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/manager/leaves/create-my-leave', { 
                ...form, 
                emp_id: managerId 
            });
            alert("Gửi đơn thành công! Chờ Admin duyệt nha sếp. ⏳");
            setForm({ start_date: '', end_date: '', reason: '', leave_type: 'Nghỉ phép năm' });
            fetchData();
        // eslint-disable-next-line no-unused-vars
        } catch (err) { alert("Lỗi gửi đơn rồi bro!"); }
    };

    return (
        <div className="p-8 bg-slate-50 min-h-screen text-left font-sans animate-in fade-in duration-700">
            {/* Header */}
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-4xl font-black text-slate-800 tracking-tighter italic uppercase flex items-center gap-3">
                        <Calendar size={40} className="text-rose-500" /> Quản lý nghỉ phép
                    </h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1 italic">
                        {user?.department_name || 'Nhóm 21'} - Leave System
                    </p>
                </div>

                <div className="flex bg-white p-1.5 rounded-3xl shadow-sm border border-slate-100">
                    <button onClick={() => setActiveTab('review')} className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase transition-all duration-300 flex items-center gap-2 ${activeTab === 'review' ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}>
                        <UserCheck size={14}/> Duyệt đơn lính
                    </button>
                    <button onClick={() => setActiveTab('personal')} className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase transition-all duration-300 flex items-center gap-2 ${activeTab === 'personal' ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}>
                        <Plus size={14}/> Đơn cá nhân
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="p-20 text-center animate-pulse font-black text-slate-300 italic uppercase">Đang đồng bộ...</div>
            ) : activeTab === 'review' ? (
                /* TAB 1: DUYỆT ĐƠN */
                <div className="space-y-4 max-w-5xl">
                    {staffLeaves.length === 0 ? (
                        <div className="p-20 text-center font-black text-slate-300 italic border-4 border-dashed rounded-[3.5rem] bg-white/50">Hộp thư trống!</div>
                    ) : staffLeaves.map(l => (
                        <div key={l.id} className="bg-white p-8 rounded-[3rem] border border-slate-100 flex justify-between items-center group hover:shadow-2xl transition-all duration-500">
                            <div className="flex gap-6 items-center">
                                <div className="h-16 w-16 bg-indigo-50 rounded-[2rem] flex items-center justify-center font-black text-indigo-500 text-xl italic uppercase shadow-inner">
                                    {l.full_name.charAt(0)}
                                </div>
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h4 className="font-black text-slate-800 uppercase italic text-lg">{l.full_name}</h4>
                                        <span className={`text-[8px] font-black px-2 py-1 rounded-full uppercase tracking-tighter ${
                                            l.status === 'approved' ? 'bg-emerald-100 text-emerald-600' : 
                                            l.status === 'rejected' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
                                        }`}>
                                            {l.status}
                                        </span>
                                    </div>
                                    <p className="text-[11px] font-bold text-slate-400 mt-1 flex items-center gap-4 lowercase italic">
                                        <span className="flex items-center gap-1"><Clock size={14} className="text-rose-400"/> {new Date(l.start_date).toLocaleDateString('vi-VN')} - {new Date(l.end_date).toLocaleDateString('vi-VN')}</span>
                                        <span className="flex items-center gap-1 font-medium text-slate-500"><FileText size={14} className="text-blue-400"/> {l.reason}</span>
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                {l.status === 'pending' && (
                                    <>
                                        <button onClick={() => handleAction(l.id, 'approved')} className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-500 hover:text-white transition-all"><Check size={20}/></button>
                                        <button onClick={() => handleAction(l.id, 'rejected')} className="p-4 bg-rose-50 text-rose-600 rounded-2xl hover:bg-rose-500 hover:text-white transition-all"><X size={20}/></button>
                                    </>
                                )}
                                <button onClick={() => handleDelete(l.id)} className="p-4 bg-slate-50 text-slate-300 rounded-2xl hover:bg-slate-900 hover:text-white transition-all border border-slate-100" title="Xóa đơn">
                                    <Trash2 size={20}/>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                /* TAB 2: CÁ NHÂN - NƠI FIX LỖI DATE */
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    <div className="lg:col-span-4 bg-white p-10 rounded-[3.5rem] shadow-sm border border-slate-100 h-fit sticky top-8">
                        <h3 className="font-black uppercase text-[11px] text-slate-400 mb-8 flex items-center gap-2 tracking-[0.2em]"><Plus size={18} className="text-rose-500"/> Tạo đơn của sếp</h3>
                        <form onSubmit={handleSubmitLeave} className="space-y-6 text-left">
                            <div>
                                <label className="text-[9px] font-black uppercase text-slate-400 ml-4 mb-2 block tracking-widest text-left">Loại phép</label>
                                <select className="w-full p-4 bg-slate-50 rounded-2xl border-none font-black text-[10px] uppercase outline-none cursor-pointer" value={form.leave_type} onChange={e => setForm({...form, leave_type: e.target.value})}>
                                    <option>Nghỉ phép năm</option>
                                    <option>Nghỉ ốm</option>
                                    <option>Việc riêng cá nhân</option>
                                </select>
                            </div>
                            
                            {/* KHU VỰC FIX LỖI DATE HIỂN THỊ THIẾU NĂM */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex flex-col">
                                    <label className="text-[9px] font-black uppercase text-slate-400 ml-4 mb-2 block tracking-widest text-left">Từ ngày</label>
                                    <input 
                                        type="date" 
                                        className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold text-[13px] outline-none focus:ring-2 ring-indigo-500/20 transition-all" 
                                        style={{ minWidth: '165px' }} // 🎯 Mẹo: Ép độ rộng để hiện đủ yyyy
                                        value={form.start_date} 
                                        onChange={e => setForm({...form, start_date: e.target.value})} 
                                        required 
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <label className="text-[9px] font-black uppercase text-slate-400 ml-4 mb-2 block tracking-widest text-left">Đến ngày</label>
                                    <input 
                                        type="date" 
                                        className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold text-[13px] outline-none focus:ring-2 ring-indigo-500/20 transition-all" 
                                        style={{ minWidth: '165px' }} // 🎯 Mẹo: Ép độ rộng để hiện đủ yyyy
                                        value={form.end_date} 
                                        onChange={e => setForm({...form, end_date: e.target.value})} 
                                        required 
                                    />
                                </div>
                            </div>

                            <textarea className="w-full p-4 bg-slate-50 rounded-2xl border-none font-medium text-sm outline-none h-32 resize-none shadow-inner" placeholder="Lý do chi tiết..." value={form.reason} onChange={e => setForm({...form, reason: e.target.value})} required />
                            <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-3xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all flex items-center justify-center gap-3 shadow-xl"><Send size={16}/> Gửi cho Admin</button>
                        </form>
                    </div>

                    <div className="lg:col-span-8 space-y-6">
                        <h3 className="font-black uppercase text-[11px] text-slate-400 ml-6 mb-2 flex items-center gap-2 tracking-[0.2em]"><History size={18}/> Lịch sử cá nhân</h3>
                        {myHistory.map(l => (
                            <div key={l.id} className="bg-white p-8 rounded-[3rem] border border-slate-100 flex justify-between items-center shadow-sm">
                                <div>
                                    <p className="font-black text-slate-800 text-sm uppercase italic tracking-tighter">{new Date(l.start_date).toLocaleDateString('vi-VN')} — {new Date(l.end_date).toLocaleDateString('vi-VN')}</p>
                                    <div className="flex items-center gap-2 mt-1"><Briefcase size={12} className="text-indigo-400"/><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{l.leave_type}</p></div>
                                    <p className="text-xs text-slate-500 mt-2 font-medium italic border-l-2 border-slate-100 pl-3">"{l.reason}"</p>
                                </div>
                                <span className={`px-6 py-2 rounded-2xl text-[8px] font-black uppercase border tracking-widest ${l.status === 'approved' ? 'bg-emerald-50 text-emerald-500 border-emerald-100' : l.status === 'pending' ? 'bg-amber-50 text-amber-500 border-amber-100 animate-pulse' : 'bg-rose-50 text-rose-500 border-rose-100'}`}>{l.status}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManagerLeaves;