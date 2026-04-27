import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    CheckCircle, XCircle, Clock, Calendar, User, 
    Inbox, Search, ChevronRight, History, Trash2, ShieldCheck
} from 'lucide-react';

const Leaves = () => {
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('pending'); // 'pending' hoặc 'history'
    const [searchTerm, setSearchTerm] = useState('');

    // 1. Lấy dữ liệu từ Backend Admin (Chỉ lấy đơn của Manager)
    const fetchLeaves = async () => {
        setLoading(true);
        try {
            // Bro check lại route này trong server.js nhé, thường là /api/admin/leaves
            const res = await axios.get('http://localhost:5000/api/admin/leaves');
            setLeaves(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Lỗi lấy đơn nghỉ phép Admin:", err);
            setLoading(false);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchLeaves();
    }, []);

    // 2. Hàm duyệt/từ chối đơn cho Sếp
    const handleStatusUpdate = async (id, newStatus) => {
        const confirmMsg = newStatus === 'approved' ? "Duyệt đơn này cho Sếp nhé bro?" : "Từ chối đơn này của Sếp chứ?";
        if (!window.confirm(confirmMsg)) return;

        try {
            await axios.put(`http://localhost:5000/api/admin/leaves/${id}/status`, { status: newStatus });
            fetchLeaves(); 
        // eslint-disable-next-line no-unused-vars
        } catch (err) {
            alert("Không thể cập nhật trạng thái!");
        }
    };

    // 3. Hàm Xóa đơn (Dọn dẹp cho đỡ chật bảng kkk)
    const handleDelete = async (id) => {
        if (!window.confirm("Xóa vĩnh viễn đơn này cho đỡ chật bảng nha bro? 🧹")) return;
        try {
            // Dùng chung route delete của Manager đã tạo ở managerleaves.js
            await axios.delete(`http://localhost:5000/api/manager/leaves/delete/${id}`);
            fetchLeaves();
        // eslint-disable-next-line no-unused-vars
        } catch (err) {
            alert("Xóa không xong rồi!");
        }
    };

    if (loading) return (
        <div className="p-20 text-center font-black text-slate-300 animate-pulse uppercase tracking-[0.3em]">
            Đang quét đơn của các sếp...
        </div>
    );

    // --- LOGIC LỌC DỮ LIỆU ---
    const pendingLeaves = leaves.filter(item => 
        item.status === 'pending' && 
        item.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const historyLeaves = leaves.filter(item => 
        item.status !== 'pending' && 
        item.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const currentDisplay = activeTab === 'pending' ? pendingLeaves : historyLeaves;

    return (
        <div className="p-8 bg-slate-50 min-h-screen text-left font-sans animate-in fade-in duration-700">
            {/* Header */}
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-4xl font-black text-slate-800 tracking-tighter italic uppercase flex items-center gap-3">
                        <ShieldCheck size={40} className="text-indigo-600" /> Phê duyệt nghỉ phép sếp
                    </h2>
                    <p className="text-slate-400 font-bold text-xs mt-1 uppercase tracking-widest italic">
                        Admin Control Panel - Nhóm 21
                    </p>
                    <div className="h-1 w-20 bg-indigo-600 mt-2 rounded-full"></div>
                </div>

                {/* Thanh tìm kiếm */}
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                    <input 
                        type="text" 
                        placeholder="Tìm tên Manager..."
                        className="pl-12 pr-6 py-3 bg-white border border-slate-100 rounded-2xl outline-none w-full md:w-80 shadow-sm focus:ring-2 ring-indigo-500/20 transition-all font-bold text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* --- HỆ THỐNG TABS --- */}
            <div className="flex gap-2 mb-8 bg-slate-200/50 p-1.5 rounded-[2rem] w-fit">
                <button 
                    onClick={() => setActiveTab('pending')}
                    className={`px-8 py-3 rounded-[1.5rem] font-black text-[11px] uppercase tracking-widest transition-all flex items-center gap-2 ${
                        activeTab === 'pending' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                    <Clock size={16}/> Chờ phê duyệt ({pendingLeaves.length})
                </button>
                <button 
                    onClick={() => setActiveTab('history')}
                    className={`px-8 py-3 rounded-[1.5rem] font-black text-[11px] uppercase tracking-widest transition-all flex items-center gap-2 ${
                        activeTab === 'history' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                    <History size={16}/> Lịch sử xử lý ({historyLeaves.length})
                </button>
            </div>

            {/* --- HIỂN THỊ DANH SÁCH --- */}
            {currentDisplay.length === 0 ? (
                <div className="bg-white p-20 rounded-[3.5rem] border-2 border-dashed border-slate-100 text-center flex flex-col items-center animate-in zoom-in duration-500">
                    <Inbox size={40} className="text-slate-200" />
                    <p className="text-slate-400 font-black uppercase tracking-widest italic mt-4 max-w-md">
                        {activeTab === 'pending' 
                            ? "☕ Tuyệt vời bro! Không có sếp nào đang xin nghỉ." 
                            : "Chưa có dữ liệu lịch sử phê duyệt."}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {currentDisplay.map((item) => (
                        <div key={item.id} className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 hover:shadow-2xl transition-all duration-500 relative overflow-hidden group">
                            
                            <div className={`absolute top-0 left-0 w-full h-1.5 ${
                                item.status === 'pending' ? 'bg-amber-400' : item.status === 'approved' ? 'bg-emerald-500' : 'bg-rose-500'
                            }`} />

                            <div className="flex justify-between items-start mb-6">
                                <div className="bg-slate-900 p-3 rounded-2xl text-white shadow-lg group-hover:bg-indigo-600 transition-colors">
                                    <User size={24} />
                                </div>
                                <span className={`text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest ${
                                    item.status === 'pending' ? 'bg-amber-100 text-amber-600 animate-pulse' : 
                                    item.status === 'approved' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                                }`}>
                                    {item.status === 'pending' ? 'Đang chờ' : item.status === 'approved' ? 'Đã duyệt' : 'Từ chối'}
                                </span>
                            </div>

                            <div className="mb-6">
                                <h3 className="text-xl font-extrabold text-slate-800 uppercase italic leading-none">{item.full_name}</h3>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="text-[9px] font-black bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full border border-indigo-100 uppercase">
                                        {item.dep_name || 'Quản lý'}
                                    </span>
                                    <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase italic">{item.position}</p>
                                </div>
                            </div>

                            <div className="bg-slate-50 rounded-[1.5rem] p-5 mb-8 space-y-3 shadow-inner border border-slate-100">
                                <div className="flex items-center gap-3 text-slate-600 font-bold text-[11px]">
                                    <Calendar size={14} className="text-rose-500" />
                                    <span>{new Date(item.start_date).toLocaleDateString('vi-VN')}</span>
                                    <ChevronRight size={12} className="text-slate-300" />
                                    <span>{new Date(item.end_date).toLocaleDateString('vi-VN')}</span>
                                </div>
                                <div className="text-xs text-slate-500 leading-relaxed italic border-l-2 border-indigo-200 pl-3">
                                    "{item.reason || 'Nghỉ phép theo chế độ'}"
                                </div>
                                <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                                    <span className="text-[9px] font-black text-slate-400 uppercase">Loại: {item.leave_type}</span>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                {item.status === 'pending' ? (
                                    <>
                                        <button 
                                            onClick={() => handleStatusUpdate(item.id, 'approved')}
                                            className="flex-1 bg-slate-900 hover:bg-emerald-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase transition-all shadow-lg flex items-center justify-center gap-2"
                                        >
                                            <CheckCircle size={14} /> DUYỆT
                                        </button>
                                        <button 
                                            onClick={() => handleStatusUpdate(item.id, 'rejected')}
                                            className="flex-1 bg-white border-2 border-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-400 py-4 rounded-2xl font-black text-[10px] uppercase transition-all flex items-center justify-center gap-2"
                                        >
                                            <XCircle size={14} /> TỪ CHỐI
                                        </button>
                                    </>
                                ) : (
                                    <div className="flex gap-2 w-full">
                                        <div className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase text-center italic border ${
                                            item.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                                        }`}>
                                            {item.status === 'approved' ? '✅ Đã chấp thuận' : '❌ Đã từ chối'}
                                        </div>
                                        <button 
                                            onClick={() => handleDelete(item.id)}
                                            className="px-5 bg-slate-50 text-slate-300 rounded-2xl hover:bg-red-600 hover:text-white transition-all border border-slate-100"
                                            title="Xóa cho đỡ chật bảng"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Leaves;