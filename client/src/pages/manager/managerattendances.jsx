import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { 
    Clock, Calendar, UserCheck, UserX, AlertCircle, 
    Filter, ArrowRight, ListFilter 
} from 'lucide-react';

const ManagerAttendance = () => {
    const [attendance, setAttendance] = useState([]);
    const [departmentName, setDepartmentName] = useState("");
    const [stats, setStats] = useState({ total: 0, present: 0, on_time: 0, late: 0, absent: 0 });
    
    // State cho bộ lọc nâng cao
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [statusFilter, setStatusFilter] = useState('all');
    
    const manager = JSON.parse(localStorage.getItem('user'));
    const managerId = manager?.id;

    const fetchAttendance = useCallback(async () => {
        if (!managerId) return;
        try {
            // Gọi API với đầy đủ các param lọc: startDate, endDate, status
            const res = await axios.get(
                `http://localhost:5000/api/manager/attendances/my-team-attendance/${managerId}`,
                {
                    params: { startDate, endDate, status: statusFilter }
                }
            );
            setAttendance(res.data.attendanceData);
            setDepartmentName(res.data.department);
            setStats(res.data.stats); // Lấy stats từ Backend đổ vào đây
        // eslint-disable-next-line no-unused-vars
        } catch (err) {
            console.error("Lỗi lấy dữ liệu chấm công rồi bro!");
        }
    }, [managerId, startDate, endDate, statusFilter]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchAttendance();
    }, [fetchAttendance]);

    return (
        <div className="p-8 bg-[#f8fafc] min-h-screen text-left animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter flex items-center gap-3">
                        <Clock size={32} className="text-[#8b5cf6]" /> Team: {departmentName}
                    </h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1 italic">
                        Giám sát chuyên cần và kỷ luật nội bộ phòng
                    </p>
                </div>
            </div>

            {/* Quick Stats Cards - 4 CARD THEO BACKEND MỚI */}
            <div className="grid grid-cols-4 gap-6 mb-8">
                <StatCard icon={<UserCheck size={28}/>} value={stats.present} label="Lượt có mặt" color="purple" />
                <StatCard icon={<Clock size={28}/>} value={stats.on_time} label="Đúng giờ" color="emerald" border="emerald" />
                <StatCard icon={<AlertCircle size={28}/>} value={stats.late} label="Đi muộn" color="orange" border="orange" />
                <StatCard icon={<UserX size={28}/>} value={stats.absent} label="Vắng mặt" color="rose" border="rose" />
            </div>

            {/* Filter Bar - BỘ LỌC KHOẢNG NGÀY & TRẠNG THÁI */}
            <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 mb-8 flex flex-wrap gap-8 items-center">
                <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Khoảng ngày:</span>
                    <div className="flex items-center bg-slate-50 rounded-xl px-4 py-2 border border-slate-100">
                        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-transparent outline-none font-bold text-slate-600 text-xs cursor-pointer" />
                        <ArrowRight size={14} className="mx-3 text-slate-300" />
                        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="bg-transparent outline-none font-bold text-slate-600 text-xs cursor-pointer" />
                    </div>
                </div>

                <div className="flex items-center gap-3 border-l pl-8 border-slate-100">
                    <ListFilter size={16} className="text-[#8b5cf6]" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Lọc theo:</span>
                    <select 
                        value={statusFilter} 
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-slate-50 border-none rounded-xl px-4 py-2 font-black text-slate-700 text-xs outline-none cursor-pointer"
                    >
                        <option value="all">Tất cả quân số</option>
                        <option value="present">Chỉ đúng giờ</option>
                        <option value="late">Chỉ đi muộn</option>
                    </select>
                </div>
            </div>

            {/* Table Data */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden shadow-xl shadow-slate-200/50">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-[#1e1b4b] text-white uppercase text-[10px] font-black tracking-widest italic">
                            <th className="p-6">Ngày làm việc</th>
                            <th className="p-6">Nhân viên</th>
                            <th className="p-6 text-center">Giờ vào</th>
                            <th className="p-6 text-center">Giờ ra</th>
                            <th className="p-6 text-right">Tình trạng</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {attendance.length > 0 ? attendance.map((row) => (
                            <tr key={row.id} className="hover:bg-purple-50/40 transition-all group">
                                <td className="p-6 text-slate-500 font-bold text-xs italic">
                                    {new Date(row.date).toLocaleDateString('vi-VN')}
                                </td>
                                <td className="p-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 bg-purple-100 text-[#8b5cf6] rounded-xl flex items-center justify-center font-black text-xs">
                                            {row.full_name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-black text-slate-800 text-xs uppercase italic">{row.full_name}</div>
                                            <div className="text-[9px] font-bold text-slate-400 uppercase">{row.position}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-6 text-center">
                                    <span className="font-mono font-black text-slate-700 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 text-xs">
                                        {row.check_in || '--:--'}
                                    </span>
                                </td>
                                <td className="p-6 text-center text-slate-400 font-mono text-xs">
                                    {row.check_out || <span className="italic text-[10px] opacity-50">In progress...</span>}
                                </td>
                                <td className="p-6 text-right">
                                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase border shadow-sm ${
                                        row.status === 'present' 
                                        ? 'bg-emerald-50 text-emerald-500 border-emerald-100' 
                                        : 'bg-orange-50 text-orange-600 border-orange-100'
                                    }`}>
                                        {row.status === 'present' ? 'Đúng giờ' : 'Đi muộn'}
                                    </span>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="5" className="p-20 text-center">
                                    <div className="flex flex-col items-center gap-2">
                                        <Clock size={48} className="text-slate-100 mb-2" />
                                        <p className="text-slate-300 font-black uppercase italic tracking-widest text-sm">
                                            Không tìm thấy dữ liệu phù hợp bro ơi!
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// Component con để render Card cho gọn
const StatCard = ({ icon, label, value, color, border }) => {
    const colors = {
        purple: "bg-purple-50 text-purple-600",
        emerald: "bg-emerald-50 text-emerald-600",
        orange: "bg-orange-50 text-orange-600",
        rose: "bg-rose-50 text-rose-600"
    };
    const borders = {
        emerald: "border-l-4 border-l-emerald-400",
        orange: "border-l-4 border-l-orange-400",
        rose: "border-l-4 border-l-rose-400",
        purple: "border-slate-100"
    };

    return (
        <div className={`bg-white p-6 rounded-[2.5rem] shadow-sm border ${borders[border || 'purple']} flex items-center gap-5 transition-transform hover:scale-105 duration-300`}>
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner ${colors[color]}`}>
                {icon}
            </div>
            <div>
                <p className="text-2xl font-black text-slate-800 tracking-tighter">{value}</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{label}</p>
            </div>
        </div>
    );
};

export default ManagerAttendance;