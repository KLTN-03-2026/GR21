import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Calendar, Clock, CheckCircle, 
    AlertCircle, Timer, ChevronRight 
} from 'lucide-react';

const EmployeeAttendance = () => {
    const userLocal = JSON.parse(localStorage.getItem('user'));
    const [history, setHistory] = useState([]);
    const [filteredHistory, setFilteredHistory] = useState([]); 
    const [filterType, setFilterType] = useState('all'); 
    const [loading, setLoading] = useState(true);

    const fetchAttendance = async () => {
        try {
            // Gọi API bốc dữ liệu chấm công của nhân viên
            const res = await axios.get(`http://localhost:5000/api/employee/attendance/${userLocal.id}`);
            setHistory(res.data);
            setFilteredHistory(res.data); 
        } catch (err) {
            console.error("Lỗi lấy lịch sử chấm công:", err);
        } finally {
            setLoading(false);
        }
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { if (userLocal?.id) fetchAttendance(); }, [userLocal.id]);

    // LOGIC LỌC KHI CLICK VÀO CÁC CARD THỐNG KÊ
    const handleFilter = (type) => {
        setFilterType(type);
        if (type === 'all') {
            setFilteredHistory(history);
        } else {
            // Lọc theo status (present hoặc late)
            const filtered = history.filter(item => item.status?.toLowerCase() === type);
            setFilteredHistory(filtered);
        }
    };

    // Tính toán chỉ số nhanh để hiển thị lên thẻ
    const totalDays = history.length;
    const lateDays = history.filter(item => item.status?.toLowerCase() === 'late').length;
    const presentDays = history.filter(item => item.status?.toLowerCase() === 'present').length;

    if (loading) return (
        <div className="flex h-[60vh] items-center justify-center font-black italic text-slate-300 animate-pulse uppercase tracking-widest">
            Đang đối soát bảng công Nhóm 21...
        </div>
    );

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-10 duration-700 pb-10 text-left">
            {/* HEADER */}
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-4xl font-black text-slate-800 tracking-tighter uppercase flex items-center gap-4">
                        <div className="p-3 bg-orange-500 rounded-2xl text-white shadow-lg shadow-orange-200">
                            <Timer size={32} />
                        </div>
                        Lịch sử chấm công
                    </h2>
                    <p className="text-slate-400 font-bold mt-2 italic text-[11px] uppercase tracking-[0.2em]">Click vào các thẻ để lọc dữ liệu nhanh</p>
                </div>
            </div>

            {/* STATS CARDS (INTERACTIVE) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard 
                    icon={<Calendar />} 
                    label="Tổng ngày công" 
                    value={totalDays} 
                    color="indigo" 
                    active={filterType === 'all'}
                    onClick={() => handleFilter('all')} 
                />
                <StatCard 
                    icon={<CheckCircle />} 
                    label="Đúng giờ (Present)" 
                    value={presentDays} 
                    color="emerald" 
                    active={filterType === 'present'}
                    onClick={() => handleFilter('present')} 
                />
                <StatCard 
                    icon={<AlertCircle />} 
                    label="Số lần đi muộn (Late)" 
                    value={lateDays} 
                    color="red" 
                    active={filterType === 'late'}
                    onClick={() => handleFilter('late')} 
                />
            </div>

            {/* DATA TABLE */}
            <div className="bg-white rounded-[4rem] border border-slate-100 shadow-2xl shadow-slate-100/50 overflow-hidden transition-all duration-500">
                {/* Status Bar của Table */}
                <div className="px-10 py-6 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full animate-pulse ${filterType === 'late' ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">
                            Chế độ xem: {filterType === 'all' ? 'Tất cả' : (filterType === 'present' ? 'Đúng giờ' : 'Đi muộn')}
                        </span>
                    </div>
                    <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg">
                        KẾT QUẢ: {filteredHistory.length}
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 italic">
                                <th className="px-10 py-8">Ngày làm việc</th>
                                <th className="px-10 py-8">Giờ vào (In)</th>
                                <th className="px-10 py-8">Giờ ra (Out)</th>
                                <th className="px-10 py-8 text-center">Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredHistory.map((row) => (
                                <tr key={row.id} className="group hover:bg-slate-50/30 transition-all duration-300">
                                    <td className="px-10 py-7 font-black text-slate-700 uppercase italic tracking-tighter">
                                        {new Date(row.date).toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}
                                    </td>
                                    <td className="px-10 py-7 font-bold text-slate-600 text-sm">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                                                <Clock size={14}/>
                                            </div>
                                            {row.check_in}
                                        </div>
                                    </td>
                                    <td className="px-10 py-7 font-bold text-slate-600 text-sm">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                                                <Clock size={14}/>
                                            </div>
                                            {row.check_out || '--:--'}
                                        </div>
                                    </td>
                                    <td className="px-10 py-7">
                                        <div className="flex justify-center">
                                            <span className={`px-5 py-2 rounded-2xl text-[9px] font-black uppercase italic tracking-widest border shadow-sm flex items-center gap-2
                                                ${row.status?.toLowerCase() === 'present' 
                                                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                                                    : 'bg-red-50 text-red-600 border-red-100'}`}>
                                                {row.status?.toLowerCase() === 'present' ? '✅ Đúng giờ' : '⏰ Đi muộn'}
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredHistory.length === 0 && (
                    <div className="py-24 text-center">
                        <p className="font-black italic text-slate-300 uppercase tracking-[0.3em] text-sm">
                            Không tìm thấy dữ liệu phù hợp bro ơi!
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

// COMPONENT CARD THỐNG KÊ (NÂNG CẤP)
const StatCard = ({ icon, label, value, color, active, onClick }) => {
    const colorStyles = {
        indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
        emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
        red: "bg-red-50 text-red-600 border-red-100"
    };

    return (
        <button 
            onClick={onClick}
            className={`p-8 rounded-[3rem] border flex items-center gap-6 text-left transition-all duration-500 relative overflow-hidden group
                ${active 
                    ? 'bg-slate-900 border-slate-900 shadow-2xl scale-[1.03] -translate-y-2' 
                    : 'bg-white border-slate-100 shadow-xl hover:border-indigo-200 hover:shadow-2xl hover:-translate-y-1'}`}
        >
            {/* Background trang trí khi active */}
            {active && (
                <div className="absolute top-0 right-0 p-4 opacity-10 text-white">
                    <ChevronRight size={80} strokeWidth={3} />
                </div>
            )}

            <div className={`p-5 rounded-2xl transition-all duration-500 ${active ? 'bg-white/10 text-white shadow-inner' : colorStyles[color]}`}>
                {React.cloneElement(icon, { size: 28 })}
            </div>
            
            <div className="relative z-10">
                <p className={`text-[10px] font-black uppercase italic tracking-widest mb-1 ${active ? 'text-slate-400' : 'text-slate-400'}`}>
                    {label}
                </p>
                <p className={`text-4xl font-black tracking-tighter italic ${active ? 'text-white' : 'text-slate-800'}`}>
                    {value} <span className="text-[10px] uppercase tracking-normal">Ngày</span>
                </p>
            </div>
        </button>
    );
};

export default EmployeeAttendance;