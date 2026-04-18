import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { 
    CheckCircle, Clock, XCircle, Calendar, FileSpreadsheet, 
    Users, UserCheck, AlertCircle, ArrowRight
} from 'lucide-react';
import * as XLSX from 'xlsx';

const Attendance = () => {
    const [list, setList] = useState([]);
    const [stats, setStats] = useState({ total: 0, present: 0, late: 0, absent: 0 });
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // State lọc theo khoảng ngày (mặc định là từ đầu tháng đến hôm nay)
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const today = now.toISOString().split('T')[0];

    const [startDate, setStartDate] = useState(firstDay);
    const [endDate, setEndDate] = useState(today);
    const [filterDept, setFilterDept] = useState('all');

    // 1. Lấy dữ liệu chấm công (Dùng cho cả danh sách và Excel)
    const fetchAttendance = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.get(`http://localhost:5000/api/attendance?startDate=${startDate}&endDate=${endDate}&dep_id=${filterDept}`);
            setList(res.data);
        } catch (err) {
            console.error("Lỗi lấy dữ liệu chấm công:", err);
        } finally {
            setLoading(false);
        }
    }, [startDate, endDate, filterDept]);

    // 2. Lấy thống kê (Stats)
    const fetchStats = useCallback(async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/attendance/stats?startDate=${startDate}&endDate=${endDate}`);
            setStats(res.data);
        } catch (err) {
            console.error("Lỗi lấy thống kê:", err);
        }
    }, [startDate, endDate]);

    // 3. Lấy danh sách phòng ban để lọc
    const fetchDepartments = useCallback(async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/phongban');
            setDepartments(res.data);
        } catch (err) {
            console.error("Lỗi lấy phòng ban:", err);
        }
    }, []);

    useEffect(() => {
        fetchDepartments();
    }, [fetchDepartments]);

    useEffect(() => {
        fetchAttendance();
        fetchStats();
    }, [fetchAttendance, fetchStats]);

    const handleExportExcel = () => {
        if (!list.length) return alert("Dữ liệu trống không, xuất gì đây bro?");
        
        const dataForExcel = list.map((item, index) => ({
            "STT": index + 1,
            "Ngày": new Date(item.date).toLocaleDateString('vi-VN'),
            "Họ và Tên": item.full_name,
            "Phòng ban": item.department_name,
            "Chức vụ": item.position,
            "Giờ Vào": item.check_in || '--:--',
            "Giờ Ra": item.check_out || 'Chưa về',
            "Trạng thái": item.status === 'late' ? 'Đi muộn' : 'Đúng giờ'
        }));

        const worksheet = XLSX.utils.json_to_sheet(dataForExcel);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Báo cáo");
        
        const fileName = `Bao_cao_cham_cong_tu_${startDate}_den_${endDate}.xlsx`;
        XLSX.writeFile(workbook, fileName);
    };

    const renderStatus = (status) => {
        if (status === 'late') return <span className="flex items-center gap-1.5 text-amber-700 bg-amber-100 px-3 py-1 rounded-full text-[10px] font-black uppercase"><Clock size={12}/> Đi muộn</span>;
        return <span className="flex items-center gap-1.5 text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full text-[10px] font-black uppercase"><CheckCircle size={12}/> Đúng giờ</span>;
    };

    return (
        <div className="p-8 bg-[#f8fafc] min-h-screen text-left">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3 uppercase italic tracking-tighter">
                        <Calendar className="text-blue-600" size={32} /> Báo Cáo Chấm Công Tổng Hợp
                    </h2>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1 italic">Dữ liệu từ {startDate} đến {endDate}</p>
                </div>
                <button onClick={handleExportExcel} className="bg-slate-900 hover:bg-blue-600 text-white px-6 py-3 rounded-2xl text-xs font-black transition-all flex items-center gap-2 uppercase shadow-lg active:scale-95">
                    <FileSpreadsheet size={18} /> Xuất Excel Theo Khoảng Ngày
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-6 mb-8">
                <StatCard icon={<Users size={24}/>} label="Nhân Sự" value={stats.total} color="blue" />
                <StatCard icon={<UserCheck size={24}/>} label="Tổng Lượt Có Mặt" value={stats.present} color="emerald" />
                <StatCard icon={<Clock size={24}/>} label="Lượt Đi Muộn" value={stats.late} color="amber" />
                <StatCard icon={<AlertCircle size={24}/>} label="Vắng Mặt (Hôm nay)" value={stats.absent} color="rose" />
            </div>

            {/* Advanced Filters */}
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 mb-6 flex flex-wrap gap-8 items-center">
                <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Từ ngày:</span>
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-slate-50 border-none rounded-xl px-4 py-2 font-bold text-slate-700 outline-none focus:ring-2 ring-blue-100" />
                    <ArrowRight size={16} className="text-slate-300" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Đến ngày:</span>
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="bg-slate-50 border-none rounded-xl px-4 py-2 font-bold text-slate-700 outline-none focus:ring-2 ring-blue-100" />
                </div>
                <div className="flex items-center gap-3 border-l pl-8 border-slate-100">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Phòng ban:</span>
                    <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)} className="bg-slate-50 border-none rounded-xl px-4 py-2 font-bold text-slate-700 outline-none cursor-pointer">
                        <option value="all">Tất cả phòng</option>
                        {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100">
                <table className="w-full text-left">
                    <thead className="bg-slate-900 text-white uppercase text-[10px] font-black tracking-widest italic">
                        <tr>
                            <th className="p-6">Ngày</th>
                            <th className="p-6">Nhân viên & Phòng ban</th>
                            <th className="p-6 text-center">Giờ Vào</th>
                            <th className="p-6 text-center">Giờ Ra</th>
                            <th className="p-6 text-right">Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {loading ? (
                            <tr><td colSpan="5" className="p-10 text-center animate-pulse font-bold text-slate-400">Đang truy xuất dữ liệu...</td></tr>
                        ) : list.map((item) => (
                            <tr key={item.id} className="hover:bg-blue-50/40 transition-all">
                                <td className="p-6 font-bold text-slate-500 italic text-xs">
                                    {new Date(item.date).toLocaleDateString('vi-VN')}
                                </td>
                                <td className="p-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-black">
                                            {item.full_name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-black text-slate-800 uppercase text-xs italic">{item.full_name}</div>
                                            <div className="text-[9px] text-blue-500 font-bold uppercase">{item.department_name}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-6 text-center font-mono font-black text-slate-700 text-xs">{item.check_in || '--:--'}</td>
                                <td className="p-6 text-center font-mono font-black text-slate-700 text-xs">
                                    {item.check_out || <span className="text-[9px] text-slate-300 italic">Chưa ra...</span>}
                                </td>
                                <td className="p-6 text-right">{renderStatus(item.status)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const StatCard = ({ icon, label, value, color }) => {
    const colors = {
        blue: "bg-blue-50 text-blue-600 border-blue-100",
        emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
        amber: "bg-amber-50 text-amber-600 border-amber-100",
        rose: "bg-rose-50 text-rose-600 border-rose-100"
    };
    return (
        <div className="p-6 rounded-[2.5rem] border bg-white shadow-sm flex items-center gap-5 transition-all hover:scale-105">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${colors[color]} shadow-inner`}>{icon}</div>
            <div>
                <p className="text-2xl font-black text-slate-800 tracking-tighter">{value}</p>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
            </div>
        </div>
    );
};

export default Attendance;