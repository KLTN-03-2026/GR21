import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Calendar, Check, X, Clock, FileText, Send, 
    Plus, UserCheck, History, Briefcase, Trash2, Info 
} from 'lucide-react';

const ManagerLeaves = () => {
    const [activeTab, setActiveTab] = useState('review'); 
    const [staffLeaves, setStaffLeaves] = useState([]);
    const [myHistory, setMyHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    const user = JSON.parse(localStorage.getItem('user'));
    // 🛠️ LÀM SẠCH ID ĐỂ TRÁNH LỖI 25:1
    const managerId = user?.id ? String(user.id).split(':')[0] : null;
    const depId = user?.dep_id;

    // Lấy ngày hiện tại chuẩn YYYY-MM-DD
    const getTodayStr = () => new Date().toISOString().split('T')[0];

    const [form, setForm] = useState({
        start_date: getTodayStr(),
        end_date: getTodayStr(),
        reason: '',
        leave_type: 'Nghỉ phép năm'
    });

    const fetchData = async () => {
        if (!managerId || !depId) return;
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
        fetchData();
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
        
        // 🛠️ VALIDATION TRƯỚC KHI GỬI
        if (form.start_date < getTodayStr()) {
            alert("❌ Sếp ơi, không thể xin nghỉ cho ngày đã qua được!");
            return;
        }
        if (new Date(form.start_date) > new Date(form.end_date)) {
            alert("❌ Ngày bắt đầu không được sau ngày kết thúc đâu sếp!");
            return;
        }

        try {
            await axios.post('http://localhost:5000/api/manager/leaves/create-my-leave', { 
                ...form, 
                emp_id: managerId 
            });
            alert("Gửi đơn thành công! Chờ Admin duyệt nha sếp. ⏳");
            setForm({ start_date: getTodayStr(), end_date: getTodayStr(), reason: '', leave_type: 'Nghỉ phép năm' });
            fetchData();
        } catch (err) { alert(err.response?.data?.message || "Lỗi gửi đơn rồi bro!"); }
    };

    const todayStr = getTodayStr();

    return (
        <div className="p-8 bg-slate-50 min-h-screen text-left font-sans animate-in fade-in duration-700">
            {/* Header */}
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-4xl font-black text-slate-800 tracking-tighter italic uppercase flex items-center gap-3">
                        <Calendar size={40} className="text-rose-500" /> Quản lý nghỉ phép
                    </h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1 italic">
                        {user?.department_name || 'Nhóm 21'} - Leave System Board
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
                <div className="p-20 text-center animate-pulse font-black text-slate-300 italic uppercase">Hệ thống đang đồng bộ...</div>
            ) : activeTab === 'review' ? (
                /* --- TAB 1: DUYỆT ĐƠN CHO NHÂN VIÊN --- */
                <div className="grid grid-cols-1 gap-4 max-w-5xl">
                    {staffLeaves.length === 0 ? (
                        <div className="p-20 text-center font-black text-slate-300 italic border-4 border-dashed rounded-[3.5rem] bg-white/50">Hộp thư duyệt đơn trống!</div>
                    ) : staffLeaves.map(l => (
                        <div key={l.id} className="bg-white p-8 rounded-[3rem] border border-slate-100 flex justify-between items-center group hover:shadow-2xl transition-all duration-500">
                            <div className="flex gap-6 items-center">
                                <div className="h-16 w-16 bg-slate-900 rounded-[2rem] flex items-center justify-center font-black text-white text-xl italic uppercase shadow-lg group-hover:bg-indigo-600 transition-all">
                                    {l.full_name.charAt(0)}
                                </div>
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h4 className="font-black text-slate-800 uppercase italic text-lg">{l.full_name}</h4>
                                        <span className={`text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest border ${
                                            l.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                                            l.status === 'rejected' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                                        }`}>
                                            {l.status === 'pending' ? 'Chờ duyệt' : l.status}
                                        </span>
                                    </div>
                                    <p className="text-[11px] font-bold text-slate-400 mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 lowercase italic">
                                        <span className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100"><Clock size={12} className="text-rose-400"/> {new Date(l.start_date).toLocaleDateString('vi-VN')} - {new Date(l.end_date).toLocaleDateString('vi-VN')}</span>
                                        <span className="flex items-center gap-1 font-medium text-slate-500"><Info size={12} className="text-blue-400"/> "{l.reason}"</span>
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                {l.status === 'pending' && (
                                    <>
                                        <button onClick={() => handleAction(l.id, 'approved')} className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-500 hover:text-white transition-all shadow-sm"><Check size={20}/></button>
                                        <button onClick={() => handleAction(l.id, 'rejected')} className="p-4 bg-rose-50 text-rose-600 rounded-2xl hover:bg-rose-500 hover:text-white transition-all shadow-sm"><X size={20}/></button>
                                    </>
                                )}
                                <button onClick={() => handleDelete(l.id)} className="p-4 bg-slate-50 text-slate-300 rounded-2xl hover:bg-slate-900 hover:text-white transition-all border border-slate-100 shadow-sm" title="Xóa đơn">
                                    <Trash2 size={20}/>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                /* --- TAB 2: ĐƠN CÁ NHÂN CỦA MANAGER --- */
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* FORM TẠO ĐƠN (Khung lịch giống nhân viên) */}
                    <div className="lg:col-span-4 bg-white p-10 rounded-[3.5rem] shadow-2xl border border-slate-50 h-fit sticky top-8">
                        <h3 className="font-black uppercase italic text-xl text-slate-700 mb-8 flex items-center gap-2">
                            <Plus size={24} className="text-indigo-600"/> Tạo đơn sếp
                        </h3>
                        <form onSubmit={handleSubmitLeave} className="space-y-6">
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-2 mb-2 block tracking-widest italic">Loại phép</label>
                                <select className="w-full bg-slate-50 p-4 rounded-2xl font-bold border border-slate-100 outline-none text-sm cursor-pointer appearance-none" value={form.leave_type} onChange={e => setForm({...form, leave_type: e.target.value})}>
                                    <option>Nghỉ phép năm</option>
                                    <option>Nghỉ ốm</option>
                                    <option>Việc riêng cá nhân</option>
                                </select>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2 mb-2 block tracking-widest italic">Từ ngày</label>
                                    <input 
                                        type="date" 
                                        required 
                                        min={todayStr}
                                        className="w-full bg-slate-50 p-4 rounded-2xl font-bold border border-slate-100 outline-none text-sm"
                                        value={form.start_date} 
                                        onChange={e => setForm({...form, start_date: e.target.value, end_date: e.target.value > form.end_date ? e.target.value : form.end_date})} 
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2 mb-2 block tracking-widest italic">Đến ngày</label>
                                    <input 
                                        type="date" 
                                        required 
                                        min={form.start_date || todayStr}
                                        className="w-full bg-slate-50 p-4 rounded-2xl font-bold border border-slate-100 outline-none text-sm"
                                        value={form.end_date} 
                                        onChange={e => setForm({...form, end_date: e.target.value})} 
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-2 mb-2 block tracking-widest italic">Lý do chi tiết</label>
                                <textarea className="w-full bg-slate-50 p-4 rounded-2xl font-bold border border-slate-100 outline-none h-32 resize-none text-sm placeholder:text-slate-300" placeholder="Sếp ghi lý do vào đây nhé..." value={form.reason} onChange={e => setForm({...form, reason: e.target.value})} required />
                            </div>

                            <button type="submit" className="w-full bg-slate-900 text-white py-6 rounded-[2.5rem] font-black uppercase text-[11px] tracking-[0.4em] hover:bg-indigo-600 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3 italic">
                                <Send size={18}/> Gửi cho Admin
                            </button>
                        </form>
                    </div>

                    {/* LỊCH SỬ ĐƠN CỦA SẾP */}
                    <div className="lg:col-span-8 space-y-5">
                        <h3 className="font-black uppercase text-[11px] text-slate-400 ml-6 mb-2 flex items-center gap-2 tracking-[0.2em] italic">
                            <History size={18}/> Lịch sử đơn cá nhân
                        </h3>
                        {myHistory.length === 0 ? (
                            <div className="p-20 text-center font-black text-slate-200 italic border-4 border-dashed rounded-[3.5rem]">Chưa có lịch sử đơn.</div>
                        ) : myHistory.map(l => (
                            <div key={l.id} className="bg-white p-7 rounded-[2.8rem] border border-slate-100 flex justify-between items-center group hover:bg-slate-900 hover:text-white transition-all duration-500 shadow-sm">
                                <div className="flex items-center gap-6">
                                    <div className={`p-5 rounded-2xl ${l.status === 'approved' ? 'bg-emerald-100 text-emerald-600' : l.status === 'rejected' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'} group-hover:bg-white/10 group-hover:text-white transition-colors`}>
                                        <Calendar size={28} />
                                    </div>
                                    <div>
                                        <p className="font-black uppercase italic text-lg leading-none mb-2">{l.leave_type}</p>
                                        <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-tighter opacity-60">
                                            <span>{new Date(l.start_date).toLocaleDateString('vi-VN')}</span>
                                            <span>→</span>
                                            <span>{new Date(l.end_date).toLocaleDateString('vi-VN')}</span>
                                        </div>
                                        <p className="mt-3 italic text-xs opacity-80 flex items-start gap-2 max-w-md">
                                            <Info size={14} className="shrink-0" /> "{l.reason}"
                                        </p>
                                    </div>
                                </div>
                                <span className={`px-6 py-2.5 rounded-full text-[9px] font-black uppercase border tracking-widest ${
                                    l.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                                    l.status === 'pending' ? 'bg-amber-50 text-amber-500 border-amber-100 animate-pulse' : 
                                    'bg-rose-50 text-rose-600 border-rose-100'
                                } group-hover:bg-white group-hover:text-slate-900 transition-colors`}>
                                    {l.status === 'pending' ? 'Chờ Admin' : l.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManagerLeaves;