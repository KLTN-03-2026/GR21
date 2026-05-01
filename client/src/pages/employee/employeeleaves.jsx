import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Send, Clock, CheckCircle, XCircle, 
    FileText, Calendar, Info, Plus, AlertCircle 
} from 'lucide-react';

const EmployeeLeaves = () => {
    const userLocal = JSON.parse(localStorage.getItem('user'));
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Hàm bốc ngày hiện tại chuẩn YYYY-MM-DD
    const getTodayStr = () => new Date().toISOString().split('T')[0];

    const [formData, setFormData] = useState({
        leave_type: 'Nghỉ phép năm',
        start_date: getTodayStr(),
        end_date: getTodayStr(),
        reason: ''
    });

    // 1. Fetch lịch sử đơn từ Backend employeeleaves.js
    const fetchHistory = async () => {
        if (!userLocal?.id) return;
        setLoading(true);
        try {
            // Gọi đúng route bro vừa tạo ở BE
            const res = await axios.get(`http://localhost:5000/api/employee/leave/history/${userLocal.id}`);
            setHistory(res.data);
        } catch (err) {
            console.error("❌ Lỗi bốc lịch sử nghỉ phép:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // 2. Xử lý gửi đơn lên sếp
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Logic check ngày tránh bị hớ
        if (new Date(formData.start_date) > new Date(formData.end_date)) {
            alert("Ngày bắt đầu không được sau ngày kết thúc đâu bro ơi! 😅");
            return;
        }

        try {
            const res = await axios.post('http://localhost:5000/api/employee/leave/send', {
                ...formData,
                emp_id: userLocal.id
            });
            
            alert(res.data.message);
            // Reset form cho sạch sẽ
            setFormData({
                leave_type: 'Nghỉ phép năm',
                start_date: getTodayStr(),
                end_date: getTodayStr(),
                reason: ''
            });
            fetchHistory(); // Reload lại bảng để thấy đơn "Pending"
        // eslint-disable-next-line no-unused-vars
        } catch (err) {
            alert("Gửi đơn thất bại rồi bro, check lại server nhé!");
        }
    };

    return (
        <div className="p-4 space-y-10 animate-in fade-in duration-700 text-left">
            {/* Header Area */}
            <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-100">
                    <FileText size={32} />
                </div>
                <div>
                    <h2 className="text-3xl font-black text-slate-800 uppercase italic tracking-tighter">Đơn xin nghỉ phép</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Nhóm 21 - Employee Leaves Management</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* COLUMN 1: FORM TẠO ĐƠN */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-8 rounded-[3.5rem] shadow-2xl border border-slate-50 relative overflow-hidden h-full">
                        <div className="absolute -top-10 -right-10 p-10 opacity-5 text-indigo-600 rotate-12">
                            <Send size={150} strokeWidth={3} />
                        </div>

                        <h3 className="text-xl font-black uppercase italic mb-8 flex items-center gap-2 text-slate-700 relative z-10">
                            <Plus size={20} className="text-indigo-500" strokeWidth={3} /> Tạo đơn mới
                        </h3>

                        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-2 mb-2 block tracking-widest italic">Loại hình nghỉ</label>
                                <select 
                                    className="w-full bg-slate-50 p-4 rounded-2xl font-bold border border-slate-100 outline-none text-sm cursor-pointer appearance-none focus:ring-2 focus:ring-indigo-500/20"
                                    value={formData.leave_type}
                                    onChange={e => setFormData({...formData, leave_type: e.target.value})}
                                >
                                    <option>Nghỉ phép năm</option>
                                    <option>Nghỉ việc riêng</option>
                                    <option>Nghỉ ốm / Bệnh</option>
                                    <option>Nghỉ thai sản</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2 mb-2 block tracking-widest italic">Từ ngày</label>
                                    <input 
                                        type="date" required 
                                        className="w-full bg-slate-50 p-4 rounded-2xl font-bold border border-slate-100 outline-none text-sm"
                                        value={formData.start_date}
                                        onChange={e => setFormData({...formData, start_date: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2 mb-2 block tracking-widest italic">Đến ngày</label>
                                    <input 
                                        type="date" required 
                                        className="w-full bg-slate-50 p-4 rounded-2xl font-bold border border-slate-100 outline-none text-sm"
                                        value={formData.end_date}
                                        onChange={e => setFormData({...formData, end_date: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-2 mb-2 block tracking-widest italic">Lý do cụ thể</label>
                                <textarea 
                                    rows="5" required 
                                    className="w-full bg-slate-50 p-4 rounded-2xl font-bold border border-slate-100 outline-none resize-none placeholder:text-slate-300 text-sm"
                                    placeholder="Bro cần nghỉ vì việc gì nè? Ghi rõ để sếp dễ duyệt nha..."
                                    value={formData.reason}
                                    onChange={e => setFormData({...formData, reason: e.target.value})}
                                ></textarea>
                            </div>

                            <button type="submit" className="w-full bg-slate-900 text-white py-6 rounded-[2.5rem] font-black uppercase text-[11px] tracking-[0.4em] hover:bg-indigo-600 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3">
                                <Send size={18} /> Gửi cho quản lý
                            </button>
                        </form>
                    </div>
                </div>

                {/* COLUMN 2: LỊCH SỬ ĐƠN (HISTORY) */}
                <div className="lg:col-span-2">
                    <div className="bg-white p-8 rounded-[3.5rem] shadow-2xl border border-slate-50 min-h-[600px]">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-xl font-black uppercase italic flex items-center gap-2 text-slate-700">
                                <Clock size={20} className="text-orange-500" /> Trạng thái đơn từ
                            </h3>
                        </div>

                        <div className="space-y-5">
                            {loading ? (
                                <div className="py-20 text-center font-black text-slate-200 uppercase italic animate-pulse tracking-[0.2em]">Đang đồng bộ đơn từ...</div>
                            ) : history.length === 0 ? (
                                <div className="py-24 text-center flex flex-col items-center">
                                    <AlertCircle size={80} className="text-slate-100 mb-6" />
                                    <p className="font-black text-slate-200 uppercase italic tracking-widest">Bro chưa có đơn xin nghỉ nào hết!</p>
                                </div>
                            ) : history.map(item => (
                                <div key={item.id} className="p-7 bg-slate-50 rounded-[2.8rem] flex flex-col md:flex-row items-start md:items-center justify-between group hover:bg-white hover:shadow-2xl transition-all duration-500 border border-transparent hover:border-slate-100 gap-6">
                                    <div className="flex items-center gap-6">
                                        <div className={`p-5 rounded-2xl shadow-sm ${
                                            item.status === 'approved' ? 'bg-emerald-100 text-emerald-600' : 
                                            item.status === 'rejected' ? 'bg-rose-100 text-rose-600' : 
                                            'bg-amber-100 text-amber-600'
                                        }`}>
                                            <Calendar size={28} />
                                        </div>
                                        <div>
                                            <p className="font-black text-slate-700 uppercase italic leading-none mb-2 text-lg">{item.leave_type}</p>
                                            <div className="flex items-center gap-3 text-[11px] font-black text-slate-400 uppercase tracking-tighter">
                                                <span className="bg-white px-2 py-0.5 rounded border border-slate-100">{new Date(item.start_date).toLocaleDateString('vi-VN')}</span>
                                                <span className="text-slate-300">→</span>
                                                <span className="bg-white px-2 py-0.5 rounded border border-slate-100">{new Date(item.end_date).toLocaleDateString('vi-VN')}</span>
                                            </div>
                                            <div className="mt-3 text-slate-500 italic text-xs flex items-start gap-2 bg-slate-100/50 p-2 rounded-xl border border-slate-200/50">
                                                <Info size={14} className="mt-0.5 shrink-0" /> "{item.reason}"
                                            </div>
                                        </div>
                                    </div>

                                    <div className="w-full md:w-auto flex justify-end">
                                        <span className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border shadow-sm flex items-center gap-2
                                            ${item.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                                              item.status === 'rejected' ? 'bg-rose-50 text-rose-600 border-rose-100' : 
                                              'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                            {item.status === 'approved' ? <><CheckCircle size={14}/> Đã duyệt</> : 
                                             item.status === 'rejected' ? <><XCircle size={14}/> Từ chối</> : 
                                             <><Clock size={14}/> Đang chờ</>}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployeeLeaves;