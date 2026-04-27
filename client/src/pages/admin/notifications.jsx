import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Megaphone, Send, Trash2, Info, AlertTriangle, 
    CheckCircle, Clock, Plus, Check, Users, ShieldAlert 
} from 'lucide-react';

const AdminNotifications = () => {
    const [notis, setNotis] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const admin = JSON.parse(localStorage.getItem('user'));
    const adminId = admin?.id;

    const [form, setForm] = useState({
        title: '',
        content: '',
        type: 'info',
    });

    const fetchNotis = async () => {
        setLoading(true);
        try {
            // Gọi API lấy toàn bộ tin (đã có JOIN ở BE để lấy tên Manager)
            const res = await axios.get('http://localhost:5000/api/admin/notifications');
            setNotis(res.data);
        } catch (err) {
            console.error("Lỗi lấy thông báo:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotis();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...form, sender_id: adminId };
            await axios.post('http://localhost:5000/api/admin/notifications/create', payload);
            alert("Admin đã 'bắn' thông báo toàn công ty! 📢");
            setForm({ title: '', content: '', type: 'info' });
            fetchNotis();
        // eslint-disable-next-line no-unused-vars
        } catch (err) {
            alert("Lỗi khi đăng tin rồi bro!");
        }
    };

    const handleApprove = async (id) => {
        if (!window.confirm("Duyệt thông báo này để mọi người cùng thấy nhé?")) return;
        try {
            // Gửi action 'approved' lên cho Backend xử lý
            await axios.put(`http://localhost:5000/api/admin/notifications/approve/${id}`, {
                status: 'approved'
            });
            alert("Đã duyệt thông báo thành công! ✅");
            fetchNotis();
        // eslint-disable-next-line no-unused-vars
        } catch (err) {
            alert("Không duyệt được rồi, check lại Backend đi bro!");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Xóa tin này nhé bro? Hành động này không thể hoàn tác!")) return;
        try {
            // Admin xóa thì phải gửi kèm role=admin để BE chốt chặn
            await axios.delete(`http://localhost:5000/api/admin/notifications/${id}?role=admin`);
            alert("Đã xóa thông báo!");
            fetchNotis();
        } catch (err) {
            alert(err.response?.data?.error || "Xóa không được rồi!");
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'warning': return <AlertTriangle className="text-rose-500" size={20} />;
            case 'success': return <CheckCircle className="text-emerald-500" size={20} />;
            default: return <Info className="text-blue-500" size={20} />;
        }
    };

    return (
        <div className="p-8 bg-slate-50 min-h-screen text-left font-sans animate-in fade-in duration-700">
            {/* Header */}
            <div className="mb-10">
                <h2 className="text-4xl font-black text-slate-800 tracking-tighter italic uppercase flex items-center gap-3">
                    <ShieldAlert size={40} className="text-orange-500" /> Quản lý bảng tin
                </h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1 italic">Nhóm 21 - Admin Control Panel</p>
                <div className="h-1 w-20 bg-orange-500 mt-2 rounded-full"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* FORM ĐĂNG TIN CỦA ADMIN */}
                <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 h-fit sticky top-8">
                    <h3 className="font-black uppercase text-[11px] text-slate-400 mb-6 flex items-center gap-2 tracking-widest">
                        <Plus size={16} className="text-orange-500" /> Đăng tin toàn hệ thống
                    </h3>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                        <div>
                            <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-2 block">Tiêu đề thông báo</label>
                            <input 
                                className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold text-sm outline-none focus:ring-2 ring-orange-500/20 transition-all"
                                placeholder="VD: Lịch nghỉ Tết Nguyên Đán..."
                                value={form.title}
                                onChange={e => setForm({...form, title: e.target.value})}
                                required
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-2 block">Nội dung chi tiết</label>
                            <textarea 
                                className="w-full p-4 bg-slate-50 rounded-2xl border-none font-medium text-sm outline-none h-40 focus:ring-2 ring-orange-500/20 transition-all resize-none"
                                placeholder="Nhập nội dung thông báo tại đây..."
                                value={form.content}
                                onChange={e => setForm({...form, content: e.target.value})}
                                required
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-2 block">Mức độ ưu tiên</label>
                            <select 
                                className="w-full p-4 bg-slate-50 rounded-2xl border-none font-black text-[10px] uppercase outline-none cursor-pointer"
                                value={form.type}
                                onChange={e => setForm({...form, type: e.target.value})}
                            >
                                <option value="info">💡 Thông tin chung</option>
                                <option value="warning">⚠️ Cảnh báo quan trọng</option>
                                <option value="success">🎉 Tin vui/Khen thưởng</option>
                            </select>
                        </div>
                        <button 
                            type="submit"
                            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-orange-500 transition-all shadow-xl flex items-center justify-center gap-3 mt-2"
                        >
                            <Send size={16} /> <span>Phát loa toàn công ty</span>
                        </button>
                    </form>
                </div>

                {/* DANH SÁCH THÔNG BÁO CẦN QUẢN LÝ */}
                <div className="lg:col-span-2 space-y-6">
                    <h3 className="font-black uppercase text-[11px] text-slate-400 mb-2 flex items-center gap-2 tracking-widest ml-4">
                        <Clock size={16} /> Dòng thời gian thông báo
                    </h3>
                    
                    {loading ? (
                        <div className="p-20 text-center animate-pulse font-black text-slate-300 italic uppercase">Đang đồng bộ dữ liệu...</div>
                    ) : notis.length === 0 ? (
                        <div className="bg-white p-20 rounded-[3rem] border-2 border-dashed border-slate-100 text-center font-black text-slate-300 uppercase italic">Hệ thống chưa có tin nhắn nào!</div>
                    ) : notis.map(n => (
                        <div key={n.id} className="bg-white p-8 rounded-[3rem] border border-slate-100 flex justify-between items-start group hover:shadow-xl transition-all duration-500">
                            <div className="flex gap-6 text-left">
                                <div className={`p-4 rounded-2xl h-fit ${n.type === 'warning' ? 'bg-rose-50' : n.type === 'success' ? 'bg-emerald-50' : 'bg-blue-50'}`}>
                                    {getIcon(n.type)}
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <h4 className="font-black text-slate-800 uppercase italic text-lg tracking-tight">{n.title}</h4>
                                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border ${
                                            n.status === 'pending' ? 'bg-amber-100 text-amber-600 border-amber-200 animate-pulse' : 'bg-emerald-100 text-emerald-600 border-emerald-200'
                                        }`}>
                                            {n.status === 'pending' ? '⏳ Chờ duyệt' : '✅ Đã đăng'}
                                        </span>
                                        {n.scope === 'department' && (
                                            <span className="flex items-center gap-1 text-[8px] font-bold text-indigo-500 uppercase border border-indigo-100 px-2 py-0.5 rounded-full bg-indigo-50">
                                                <Users size={10}/> {n.dept_name || 'Phòng ban'}
                                            </span>
                                        )}
                                        <span className="text-[8px] font-bold text-slate-400 italic">Người gửi: {n.sender_name || 'Admin'} ({n.sender_role})</span>
                                    </div>
                                    <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-xl">{n.content}</p>
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-300 uppercase tracking-widest pt-4">
                                        <Clock size={12} /> {new Date(n.created_at).toLocaleString('vi-VN')}
                                    </div>
                                </div>
                            </div>
                            
                            {/* Nút hành động */}
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                {n.status === 'pending' && (
                                    <button 
                                        onClick={() => handleApprove(n.id)} 
                                        className="text-emerald-500 hover:bg-emerald-500 hover:text-white p-3 rounded-2xl border border-emerald-100 transition-all shadow-sm"
                                        title="Phê duyệt thông báo"
                                    >
                                        <Check size={20} />
                                    </button>
                                )}
                                <button 
                                    onClick={() => handleDelete(n.id)} 
                                    className="text-slate-300 hover:text-rose-500 p-3 hover:bg-rose-50 rounded-2xl transition-all"
                                    title="Xóa vĩnh viễn"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminNotifications;