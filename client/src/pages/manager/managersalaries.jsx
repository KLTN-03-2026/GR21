import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Wallet, CheckCircle2, Timer, TrendingUp, AlertCircle } from 'lucide-react';

const ManagerSalaries = () => {
    const [salaryList, setSalaryList] = useState([]);
    const [stats, setStats] = useState({ 
        total_budget: 0, 
        paid_employees: 0, 
        pending_employees: 0, 
        confirmed_employees: 0, 
        total_employees: 0 
    });
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
        } catch (err) {
            console.error("Lỗi lấy bảng lương:", err);
        } finally {
            setLoading(false);
        }
    }, [managerId, month, year]);

    useEffect(() => { fetchSalaries(); }, [fetchSalaries]);

    const handleConfirmPayroll = async () => {
        const confirmMsg = `Bro có chắc chắn muốn xác nhận bảng lương tháng ${month}/${year}?\n\nDữ liệu sẽ được gửi lên Admin để chi trả!`;
        if (!window.confirm(confirmMsg)) return;
        
        try {
            const res = await axios.post(`http://localhost:5000/api/manager/salaries/confirm-payroll`, {
                managerId, month, year
            });
            alert("🔥 " + res.data.message);
            fetchSalaries();
        } catch (err) {
            alert("❌ Lỗi: " + (err.response?.data?.message || "Không thể duyệt lương"));
        }
    };

    const formatVND = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(amount);
    };

    const hasPending = salaryList.some(s => s.status === 'pending');

    return (
        <div className="p-8 bg-[#f8fafc] min-h-screen text-left font-sans animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
                <div>
                    <h2 className="text-3xl font-black text-slate-800 uppercase italic tracking-tighter flex items-center gap-3">
                        <Wallet className="text-emerald-500" size={32} /> Lương phòng {deptName || "..."}
                    </h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1 italic">Payroll System - Group 21</p>
                </div>

                <div className="flex items-center gap-4">
                    <button 
                        onClick={handleConfirmPayroll}
                        disabled={!hasPending}
                        className={`px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2 shadow-lg ${
                            hasPending 
                            ? 'bg-[#8b5cf6] hover:bg-purple-700 text-white shadow-purple-100' 
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                    >
                        <CheckCircle2 size={16} /> 
                        {hasPending ? 'Chốt lương & Gửi Admin' : 'Đã gửi toàn bộ'}
                    </button>

                    <div className="flex items-center gap-4 bg-white p-2.5 rounded-2xl shadow-sm border border-slate-100">
                        <select value={month} onChange={(e) => setMonth(e.target.value)} className="outline-none font-black text-slate-600 text-[11px] uppercase bg-transparent cursor-pointer">
                            {[...Array(12)].map((_, i) => <option key={i+1} value={i+1}>Tháng {i+1}</option>)}
                        </select>
                        <select value={year} onChange={(e) => setYear(e.target.value)} className="outline-none font-black text-slate-600 text-[11px] uppercase bg-transparent cursor-pointer">
                            <option value="2026">2026</option>
                            <option value="2025">2025</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <StatCard icon={<TrendingUp size={24}/>} label="Quỹ lương phòng" value={formatVND(stats.total_budget)} color="emerald" />
                <StatCard icon={<CheckCircle2 size={24}/>} label="Đã trả lương" value={`${stats.paid_employees} người`} color="blue" />
                <StatCard icon={<Timer size={24}/>} label="Chờ Admin duyệt" value={`${stats.confirmed_employees} người`} color="amber" />
                <StatCard icon={<AlertCircle size={24}/>} label="Chưa chốt công" value={`${stats.pending_employees} người`} color="purple" />
            </div>

            {/* Table */}
            <div className="bg-white rounded-[3rem] shadow-xl overflow-hidden border border-slate-100">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-900 text-white uppercase text-[10px] font-black tracking-widest italic">
                            <tr>
                                <th className="p-8">Nhân viên</th>
                                <th className="p-8">Lương cơ bản (HĐ)</th>
                                <th className="p-8">Thưởng & Phụ cấp</th>
                                <th className="p-8 text-right">Thực nhận</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 font-sans">
                            {!loading && salaryList.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50/50 transition-all">
                                    <td className="p-8">
                                        <div className="flex flex-col">
                                            <span className="font-black text-slate-800 uppercase text-sm italic leading-none">{item.full_name}</span>
                                            <span className="text-[9px] font-bold text-slate-400 uppercase mt-1">{item.position}</span>
                                        </div>
                                    </td>
                                    {/* FIX BIẾN Ở ĐÂY NÈ BRO */}
                                    <td className="p-8 font-bold text-slate-600 text-sm">
                                        {formatVND(item.basic_salary)}
                                    </td>
                                    <td className="p-8">
                                        <div className="text-sm font-black text-emerald-600">+{formatVND(parseFloat(item.bonus) + parseFloat(item.total_allowance))}</div>
                                        <div className="text-[8px] text-slate-400 font-bold uppercase">Phụ cấp: {formatVND(item.total_allowance)}</div>
                                    </td>
                                    <td className="p-8 text-right">
                                        <div className="font-black text-slate-900 text-lg italic">{formatVND(item.final_salary)}</div>
                                        <span className={`text-[8px] font-black uppercase px-2.5 py-1 rounded-lg border ${
                                            item.status === 'paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                                            item.status === 'confirmed' ? 'bg-blue-50 text-blue-600 border-blue-100' : 
                                            'bg-amber-50 text-amber-600 border-amber-100'
                                        }`}>
                                            {item.status === 'paid' ? 'Đã chi' : item.status === 'confirmed' ? 'Chờ Admin' : 'Chưa chốt'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ icon, label, value, color }) => {
    const colors = { 
        emerald: "bg-emerald-50 text-emerald-600 border-emerald-100", 
        blue: "bg-blue-50 text-blue-600 border-blue-100", 
        amber: "bg-amber-50 text-amber-600 border-amber-100", 
        purple: "bg-purple-50 text-purple-600 border-purple-100" 
    };
    return (
        <div className={`p-6 rounded-[2.5rem] border bg-white shadow-sm flex items-center gap-5 ${colors[color]}`}>
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${colors[color]}`}>{icon}</div>
            <div>
                <p className="text-xl font-black text-slate-800 tracking-tighter italic">{value}</p>
                <p className="text-[9px] font-black text-slate-400 uppercase">{label}</p>
            </div>
        </div>
    );
};

export default ManagerSalaries;