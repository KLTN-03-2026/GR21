import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CheckCircle, XCircle, Clock, Calendar, User } from 'lucide-react';

const Leaves = () => {
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);

    // 1. Lấy dữ liệu từ Backend
    const fetchLeaves = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/leaves');
            setLeaves(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Lỗi lấy đơn nghỉ phép:", err);
            setLoading(false);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchLeaves();
    }, []);

    // 2. Hàm duyệt/từ chối đơn
    const handleStatusUpdate = async (id, newStatus) => {
        try {
            await axios.put(`http://localhost:5000/api/leaves/${id}/status`, { status: newStatus });
            fetchLeaves(); // Load lại data sau khi cập nhật
        // eslint-disable-next-line no-unused-vars
        } catch (err) {
            alert("Không thể cập nhật trạng thái!");
        }
    };

    if (loading) return <div className="p-10 text-center font-bold text-slate-400 italic">Đang tải dữ liệu nghỉ phép...</div>;

    // --- LOGIC LỌC: CHỈ HIỆN ĐƠN ĐANG CHỜ (PENDING) ---
    const pendingLeaves = leaves.filter(item => item.status === 'pending');

    return (
        <div className="p-8 bg-slate-50 min-h-screen text-left">
            {/* Header */}
            <div className="mb-10">
                <h2 className="text-4xl font-black text-slate-800 tracking-tighter italic">
                    QUẢN LÝ NGHỈ PHÉP
                </h2>
                <p className="text-slate-400 font-bold text-xs mt-1 uppercase tracking-widest italic">
                    Chỉ hiển thị các đơn đang chờ xử lý
                </p>
                <div className="h-1 w-20 bg-indigo-600 mt-2 rounded-full"></div>
            </div>

            {/* Danh sách đơn nghỉ phép dạng Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Dùng pendingLeaves thay vì leaves để ẩn đơn đã duyệt */}
                {pendingLeaves.map((item) => (
                    <div key={item.id} className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 hover:shadow-2xl transition-all duration-300 relative overflow-hidden group">
                        
                        {/* Status Badge */}
                        <div className="flex justify-between items-start mb-6">
                            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-500">
                                <User size={24} />
                            </div>
                            <span className="text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest bg-amber-100 text-amber-600 animate-pulse">
                                {item.status}
                            </span>
                        </div>

                        {/* Employee Info */}
                        <div className="mb-6">
                            <h3 className="text-xl font-extrabold text-slate-800 uppercase italic">{item.full_name}</h3>
                            <p className="text-xs font-bold text-indigo-500 tracking-wider uppercase mt-1">{item.position}</p>
                        </div>

                        {/* Leave Detail */}
                        <div className="bg-slate-50 rounded-[1.5rem] p-5 mb-8 space-y-3 shadow-inner">
                            <div className="flex items-center gap-3 text-slate-600 font-bold text-xs">
                                <Calendar size={16} className="text-indigo-500" />
                                <span>{new Date(item.start_date).toLocaleDateString('vi-VN')}</span>
                                <span className="text-slate-300">→</span>
                                <span>{new Date(item.end_date).toLocaleDateString('vi-VN')}</span>
                            </div>
                            <div className="text-xs text-slate-500 leading-relaxed italic">
                                " {item.reason} "
                            </div>
                            <div className="pt-2 border-t border-slate-200">
                                <span className="text-[10px] font-black text-slate-400 uppercase">Loại: {item.leave_type}</span>
                            </div>
                        </div>

                        {/* Action Buttons (Đã lọc ở trên nên ở đây mặc định chỉ hiện đơn pending) */}
                        <div className="flex gap-4">
                            <button 
                                onClick={() => handleStatusUpdate(item.id, 'approved')}
                                className="flex-1 bg-indigo-600 hover:bg-slate-800 text-white py-4 rounded-2xl font-black text-xs transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
                            >
                                <CheckCircle size={16} /> DUYỆT
                            </button>
                            <button 
                                onClick={() => handleStatusUpdate(item.id, 'rejected')}
                                className="flex-1 bg-white border-2 border-slate-100 hover:bg-rose-50 hover:border-rose-100 hover:text-rose-600 text-slate-400 py-4 rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-2"
                            >
                                <XCircle size={16} /> TỪ CHỐI
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State: Hiện khi không còn đơn pending nào */}
            {pendingLeaves.length === 0 && (
                <div className="text-center mt-20 py-20 bg-white rounded-[3rem] shadow-sm border border-slate-100">
                    <p className="text-slate-400 font-black uppercase tracking-widest italic">
                        ☕ Tuyệt vời bro! Hiện không còn đơn nghỉ phép nào cần xử lý.
                    </p>
                </div>
            )}
        </div>
    );
};

export default Leaves;