import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Wallet, CheckCircle2, Timer, TrendingUp, Search, AlertCircle } from 'lucide-react';

const ManagerSalaries = () => {
    const [salaryList, setSalaryList] = useState([]);
    const [stats, setStats] = useState({ total_budget: 0, paid_employees: 0, pending_employees: 0, total_employees: 0 });
    const [deptName, setDeptName] = useState("");
    const [loading, setLoading] = useState(true);

    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());

    const manager = JSON.parse(localStorage.getItem('user'));
    const managerId = manager?.id;

    const fetchSalaries = useCallback(async () => {
        if (!managerId) return;
        setLoading(true);
        try {
            const res = await axios.get(`http://localhost:5000/api/manager/salaries/my-team-salaries/${managerId}`, {
                params: { month, year }
            });
            setSalaryList(res.data.salaryData);
            setStats(res.data.stats);
            setDeptName(res.data.department);
        // eslint-disable-next-line no-unused-vars
        } catch (err) {
            console.error("Lỗi lấy bảng lương!");
        } finally {
            setLoading(false);
        }
    }, [managerId, month, year]);

    useEffect(() => { fetchSalaries(); }, [fetchSalaries]);

    // --- HÀM XỬ LÝ DUYỆT LƯƠNG ---
    const handleConfirmPayroll = async () => {
        if (!window.confirm("Bro có chắc chắn muốn xác nhận bảng lương tháng này để gửi lên Admin không?")) return;
        
        try {
            const res = await axios.post(`http://localhost:5000/api/manager/salaries/confirm-payroll`, {
                managerId,
                month,
                year
            });
            alert("✅ " + res.data.message);
            fetchSalaries(); // Reload lại data để cập nhật Badge
        } catch (err) {
            alert("❌ Lỗi: " + (err.response?.data?.message || "Không thể duyệt lương"));
        }
    };

    const formatVND = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(amount);
    };

    return (
        <div className="p-8 bg-[#f8fafc] min-h-screen text-left">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-black text-slate-800 uppercase italic tracking-tighter flex items-center gap-3">
                        <Wallet className="text-emerald-500" size={32} /> Lương phòng {deptName || "..."}
                    </h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Hệ thống quản lý Nhóm 21</p>
                </div>

                <div className="flex items-center gap-4">
                    {/* NÚT XÁC NHẬN BẢNG LƯƠNG - CHỈ HIỆN KHI CÓ PENDING */}
                    {salaryList.some(s => s.status === 'pending') && (
                        <button 
                            onClick={handleConfirmPayroll}
                            className="bg-[#8b5cf6] hover:bg-purple-700 text-white px-5 py-2.5 rounded-2xl text-[11px] font-black uppercase shadow-lg shadow-purple-100 transition-all active:scale-95 flex items-center gap-2"
                        >
                            <CheckCircle2 size={16} /> Xác nhận gửi Admin
                        </button>
                    )}

                    <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
                        <select value={month} onChange={(e) => setMonth(e.target.value)} className="outline-none font-bold text-slate-700 text-sm p-1">
                            {[...Array(12)].map((_, i) => <option key={i+1} value={i+1}>Tháng {i+1}</option>)}
                        </select>
                        <select value={year} onChange={(e) => setYear(e.target.value)} className="outline-none font-bold text-slate-700 text-sm p-1 border-l">
                            <option value="2026">2026</option>
                            <option value="2025">2025</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-4 gap-6 mb-8">
                <StatCard icon={<TrendingUp size={24}/>} label="Quỹ lương phòng" value={formatVND(stats.total_budget)} color="emerald" />
                <StatCard icon={<CheckCircle2 size={24}/>} label="Đã trả lương" value={`${stats.paid_employees} người`} color="blue" />
                <StatCard icon={<Timer size={24}/>} label="Chờ duyệt" value={`${stats.pending_employees} người`} color="amber" />
                <StatCard icon={<Search size={24}/>} label="Tổng nhân sự" value={`${stats.total_employees} người`} color="purple" />
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-xl overflow-hidden border border-slate-100">
                <table className="w-full text-left">
                    <thead className="bg-slate-900 text-white uppercase text-[10px] font-black tracking-widest italic">
                        <tr>
                            <th className="p-6">Nhân viên</th>
                            <th className="p-6">Lương cơ bản</th>
                            <th className="p-6">Thưởng & Phụ cấp</th>
                            <th className="p-6">Khấu trừ (Phạt)</th>
                            <th className="p-6 text-center">Nghỉ ko lương</th>
                            <th className="p-6 text-right">Thực nhận</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {loading ? (
                            <tr><td colSpan="6" className="p-20 text-center animate-pulse font-black text-slate-300">ĐANG TÍNH TOÁN...</td></tr>
                        ) : salaryList.map((item) => (
                            <tr key={item.id} className="hover:bg-emerald-50/30 transition-all">
                                <td className="p-6 font-black text-slate-800 uppercase text-xs italic">{item.full_name}</td>
                                <td className="p-6 font-bold text-slate-600 text-xs">{formatVND(item.base_salary)}</td>
                                <td className="p-6">
                                    <div className="text-xs font-bold text-emerald-600">+{formatVND(parseFloat(item.bonus) + parseFloat(item.total_allowance))}</div>
                                    <div className="text-[8px] text-slate-400 font-bold uppercase tracking-tighter">Bonus & Allowance</div>
                                </td>
                                <td className="p-6 text-xs font-bold text-rose-500">-{formatVND(item.deductions)}</td>
                                <td className="p-6 text-center font-black text-slate-500 text-[10px]">{item.unpaid_days} ngày</td>
                                <td className="p-6 text-right">
                                    <div className="font-black text-slate-900 text-sm italic">{formatVND(item.final_salary)}</div>
                                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md ${
                                        item.status === 'paid' ? 'bg-emerald-100 text-emerald-600' : 
                                        item.status === 'confirmed' ? 'bg-blue-100 text-blue-600' : 
                                        'bg-amber-100 text-amber-600'
                                    }`}>
                                        {item.status === 'paid' ? 'Đã thanh toán' : 
                                         item.status === 'confirmed' ? 'Đã gửi Admin' : 
                                         'Đang chờ duyệt'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const StatCard = ({ icon, label, value, color }) => {
    const colors = { emerald: "bg-emerald-50 text-emerald-600", blue: "bg-blue-50 text-blue-600", amber: "bg-amber-50 text-amber-600", purple: "bg-purple-50 text-purple-600" };
    return (
        <div className="p-6 rounded-[2.5rem] border bg-white shadow-sm flex items-center gap-5">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${colors[color]}`}>{icon}</div>
            <div>
                <p className="text-lg font-black text-slate-800 tracking-tighter">{value}</p>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
            </div>
        </div>
    );
};

export default ManagerSalaries;