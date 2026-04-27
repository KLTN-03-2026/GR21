import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Megaphone, Send, Clock, Info, AlertTriangle, 
    CheckCircle, Plus, Users, Lock, Trash2, Timer, Edit3, XCircle
} from 'lucide-react';

const ManagerNotifications = () => {
    const [notis, setNotis] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null); // Lưu ID tin đang sửa
    
    const manager = JSON.parse(localStorage.getItem('user'));
    const managerId = manager?.id;
    const depId = manager?.dep_id;

    const [form, setForm] = useState({
        title: '',
        content: '',
        type: 'info',
        scope: 'department' 
    });

    // Lấy tin: Sẽ thấy tin đã duyệt của cty/phòng + tin pending của bản thân
    const fetchNotis = async () => {
        if (!managerId) return;
        setLoading(true);
        try {
            const res = await axios.get(`http://localhost:5000/api/manager/notifications/my-notifications/${managerId}?depId=${depId}`);
            setNotis(res.data);
        } catch (err) {
            console.error("Lỗi lấy thông báo:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [managerId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                // API PUT: Cập nhật tin (Backend sẽ check status = pending)
                await axios.put(`http://localhost:5000/api/manager/notifications/${editingId}`, {
                    ...form,
                    userId: managerId
                });
                alert("Cập nhật nội dung chờ duyệt thành công! 📝");
            } else {
                // API POST: Tạo mới (Backend ép status = pending)
                const payload = { 
                    ...form, 
                    sender_id: managerId, 
                    dep_id: depId 
                };
                await axios.post('http://localhost:5000/api/manager/notifications/create', payload);
                alert("Thông báo đã gửi đi! Đợi Admin duyệt nhé bro! ⏳");
            }
            cancelEdit();
            fetchNotis();
        } catch (err) {
            alert(err.response?.data?.error || "Lỗi rồi bro ơi, check lại server!");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Bro chắc chắn muốn thu hồi tin này chứ?")) return;
        try {
            // Gửi managerId để BE check đúng chủ và status=pending mới cho xóa
            await axios.delete(`http://localhost:5000/api/manager/notifications/${id}?userId=${managerId}`);
            fetchNotis();
        } catch (err) {
            alert(err.response?.data?.error || "Duyệt rồi thì không xóa được đâu bro!");
        }
    };

    const handleEditClick = (n) => {
        setEditingId(n.id);
        setForm({ title: n.title, content: n.content, type: n.type, scope: n.scope });
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Cuộn lên để Manager thấy form sửa
    };

    const cancelEdit = () => {
        setEditingId(null);
        setForm({ title: '', content: '', type: 'info', scope: 'department' });
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
                    <Megaphone size={40} className="text-indigo-600" /> Bảng tin nội bộ
                </h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1 italic">Hệ thống quản trị - Group 21</p>
                <div className="h-1 w-20 bg-indigo-600 mt-2 rounded-full"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* FORM SOẠN/SỬA TIN */}
                <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 h-fit sticky top-8">
                    <h3 className="font-black uppercase text-[11px] text-slate-400 mb-6 flex items-center gap-2 tracking-widest">
                        {editingId ? <Edit3 size={16} className="text-amber-500" /> : <Plus size={16} className="text-indigo-600" />}
                        {editingId ? 'Chỉnh sửa tin chờ duyệt' : 'Soạn thông báo mới'}
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-2 block">Tiêu đề</label>
                            <input 
                                className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold text-sm outline-none focus:ring-2 ring-indigo-500/20 transition-all"
                                placeholder="Vdu: Thông báo họp gấp..." 
                                value={form.title}
                                onChange={e => setForm({...form, title: e.target.value})}
                                required
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-2 block">Loại thông báo</label>
                            <select 
                                className="w-full p-4 bg-slate-50 rounded-2xl border-none font-black text-[10px] uppercase outline-none"
                                value={form.type}
                                onChange={e => setForm({...form, type: e.target.value})}
                            >
                                <option value="info">💡 Thông tin chung</option>
                                <option value="warning">⚠️ Nhắc nhở/Cảnh báo</option>
                                <option value="success">🎉 Tuyên dương/Thành tích</option>
                            </select>
                        </div>
                        <textarea 
                            className="w-full p-4 bg-slate-50 rounded-2xl border-none font-medium text-sm outline-none h-32 resize-none focus:ring-2 ring-indigo-500/20 transition-all"
                            placeholder="Nhập nội dung chi tiết tại đây..."
                            value={form.content}
                            onChange={e => setForm({...form, content: e.target.value})}
                            required
                        />
                        
                        <div className="flex gap-2">
                            <button type="submit" className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-2 text-white ${editingId ? 'bg-amber-500 hover:bg-amber-600' : 'bg-indigo-900 hover:bg-indigo-600'}`}>
                                <Send size={14} /> {editingId ? 'Cập nhật lại' : 'Gửi yêu cầu duyệt'}
                            </button>
                            {editingId && (
                                <button type="button" onClick={cancelEdit} className="bg-slate-100 text-slate-400 px-4 rounded-2xl hover:bg-slate-200 transition-all">
                                    <XCircle size={20} />
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* DANH SÁCH THÔNG BÁO */}
                <div className="lg:col-span-2 space-y-6">
                    <h3 className="font-black uppercase text-[11px] text-slate-400 mb-2 flex items-center gap-2 tracking-widest ml-4">
                        <Clock size={16} /> Lịch sử bảng tin
                    </h3>
                    
                    {loading ? (
                        <div className="p-20 text-center animate-pulse font-black text-slate-300 italic">ĐANG TẢI DỮ LIỆU...</div>
                    ) : notis.length === 0 ? (
                        <div className="bg-white p-20 rounded-[3rem] border-2 border-dashed border-slate-100 text-center font-black text-slate-300 uppercase italic">Hộp thư trống trơn bro ơi!</div>
                    ) : notis.map(n => (
                        <div key={n.id} className="bg-white p-8 rounded-[3rem] border border-slate-100 flex justify-between items-start group hover:shadow-lg transition-all duration-500 relative overflow-hidden">
                            <div className="flex gap-6 text-left relative z-10">
                                <div className={`p-4 rounded-2xl h-fit ${n.type === 'warning' ? 'bg-rose-50' : n.type === 'success' ? 'bg-emerald-50' : 'bg-blue-50'}`}>
                                    {getIcon(n.type)}
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <h4 className="font-black text-slate-800 uppercase italic text-lg tracking-tight">{n.title}</h4>
                                        <span className="flex items-center gap-1 text-[8px] font-bold text-slate-400 uppercase border px-2 py-0.5 rounded-full bg-white">
                                            {n.scope === 'all' ? <Megaphone size={10}/> : <Users size={10}/>} {n.scope}
                                        </span>
                                        {/* Hiển thị Trạng thái */}
                                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                                            n.status === 'pending' ? 'bg-amber-50 text-amber-500 border-amber-100 animate-pulse' : 'bg-emerald-50 text-emerald-500 border-emerald-100'
                                        }`}>
                                            {n.status === 'pending' ? <Timer size={10}/> : <CheckCircle size={10}/>}
                                            {n.status === 'pending' ? 'Đang chờ Admin duyệt' : 'Đã công khai'}
                                        </span>
                                    </div>
                                    <p className="text-slate-500 text-sm leading-relaxed font-medium max-w-xl">{n.content}</p>
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-300 uppercase tracking-widest pt-4">
                                        <Clock size={12} /> {new Date(n.created_at).toLocaleString('vi-VN')}
                                    </div>
                                </div>
                            </div>
                            
                            {/* Nút hành động cho chính Manager */}
                            {n.sender_id === managerId && (
                                <div className="flex gap-1 relative z-20">
                                    {n.status === 'pending' ? (
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                            <button onClick={() => handleEditClick(n)} className="text-slate-300 hover:text-amber-500 transition-all p-3 hover:bg-amber-50 rounded-2xl" title="Sửa nội dung">
                                                <Edit3 size={20} />
                                            </button>
                                            <button onClick={() => handleDelete(n.id)} className="text-slate-300 hover:text-rose-500 transition-all p-3 hover:bg-rose-50 rounded-2xl" title="Thu hồi tin">
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="p-3 text-slate-200" title="Đã duyệt - Nội dung bị khóa">
                                            <Lock size={18} />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ManagerNotifications;