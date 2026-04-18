import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Megaphone, Send, Trash2, Info, AlertTriangle, CheckCircle, Clock, Plus } from 'lucide-react';

const Notifications = () => {
    const [notis, setNotis] = useState([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({
        title: '',
        content: '',
        type: 'info',
        target_id: ''
    });

    const fetchNotis = async () => {
        setLoading(true);
        try {
            const res = await axios.get('http://localhost:5000/api/notifications');
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
            await axios.post('http://localhost:5000/api/notifications/create', form);
            alert("Đã 'bắn' thông báo thành công rực rỡ! 📣");
            setForm({ title: '', content: '', type: 'info', target_id: '' }); // Reset form
            fetchNotis(); // Load lại danh sách
        // eslint-disable-next-line no-unused-vars
        } catch (err) {
            alert("Lỗi khi đăng tin rồi bro!");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Xóa tin này nhé bro?")) return;
        try {
            await axios.delete(`http://localhost:5000/api/notifications/${id}`);
            fetchNotis();
        // eslint-disable-next-line no-unused-vars
        } catch (err) {
            alert("Xóa không được rồi!");
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
                    <Megaphone size={40} className="text-orange-500" /> Quản lý bảng tin
                </h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1 italic">Nhóm 21 - Internal Communication</p>
                <div className="h-1 w-20 bg-orange-500 mt-2 rounded-full"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* CỘT TRÁI: FORM ĐĂNG TIN */}
                <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 h-fit sticky top-8">
                    <h3 className="font-black uppercase text-[11px] text-slate-400 mb-6 flex items-center gap-2 tracking-widest">
                        <Plus size={16} className="text-orange-500" /> Soạn thông báo mới
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-2 block">Tiêu đề</label>
                            <input 
                                className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold text-sm outline-none focus:ring-2 ring-orange-500/20 transition-all"
                                placeholder="VD: Thông báo nghỉ lễ..."
                                value={form.title}
                                onChange={e => setForm({...form, title: e.target.value})}
                                required
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-2 block">Nội dung</label>
                            <textarea 
                                className="w-full p-4 bg-slate-50 rounded-2xl border-none font-medium text-sm outline-none h-40 focus:ring-2 ring-orange-500/20 transition-all resize-none"
                                placeholder="Nội dung chi tiết gửi đến nhân viên..."
                                value={form.content}
                                onChange={e => setForm({...form, content: e.target.value})}
                                required
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-2 block">Loại tin</label>
                            <select 
                                className="w-full p-4 bg-slate-50 rounded-2xl border-none font-black text-[10px] uppercase outline-none cursor-pointer"
                                value={form.type}
                                onChange={e => setForm({...form, type: e.target.value})}
                            >
                                <option value="info">💡 Thông tin chung</option>
                                <option value="warning">⚠️ Cảnh báo / Nhắc nhở</option>
                                <option value="success">🎉 Tin vui / Khen thưởng</option>
                            </select>
                        </div>
                        <button className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-orange-500 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-2">
                            <Send size={14} /> Bắn thông báo ngay
                        </button>
                    </form>
                </div>

                {/* CỘT PHẢI: DANH SÁCH TIN ĐÃ ĐĂNG */}
                <div className="lg:col-span-2 space-y-6">
                    <h3 className="font-black uppercase text-[11px] text-slate-400 mb-2 flex items-center gap-2 tracking-widest ml-4">
                        <Clock size={16} /> Lịch sử bảng tin
                    </h3>
                    
                    {loading ? (
                        <div className="p-20 text-center animate-pulse font-black text-slate-300 uppercase italic">Đang tải bảng tin...</div>
                    ) : notis.length === 0 ? (
                        <div className="bg-white p-20 rounded-[3rem] border-2 border-dashed border-slate-100 text-center font-black text-slate-300 uppercase italic">Chưa có thông báo nào được đăng bro ơi!</div>
                    ) : notis.map(n => (
                        <div key={n.id} className="bg-white p-8 rounded-[3rem] border border-slate-100 flex justify-between items-start group hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500">
                            <div className="flex gap-6">
                                <div className={`p-4 rounded-2xl h-fit ${
                                    n.type === 'warning' ? 'bg-rose-50' : 
                                    n.type === 'success' ? 'bg-emerald-50' : 'bg-blue-50'
                                }`}>
                                    {getIcon(n.type)}
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3">
                                        <h4 className="font-black text-slate-800 uppercase italic text-lg tracking-tight">{n.title}</h4>
                                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border ${
                                            n.type === 'warning' ? 'bg-rose-100/50 text-rose-500 border-rose-200' : 
                                            n.type === 'success' ? 'bg-emerald-100/50 text-emerald-500 border-emerald-200' : 
                                            'bg-blue-100/50 text-blue-500 border-blue-200'
                                        }`}>
                                            {n.type}
                                        </span>
                                    </div>
                                    <p className="text-slate-500 text-sm leading-relaxed font-medium max-w-xl">{n.content}</p>
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-300 uppercase tracking-widest pt-4">
                                        <Clock size={12} /> Đã đăng: {new Date(n.created_at).toLocaleString('vi-VN')}
                                    </div>
                                </div>
                            </div>
                            <button 
                                onClick={() => handleDelete(n.id)}
                                className="text-slate-200 hover:text-rose-500 transition-all p-3 hover:bg-rose-50 rounded-2xl opacity-0 group-hover:opacity-100"
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Notifications;