import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DollarSign, Calculator, CheckCircle2, AlertCircle, Calendar, FileSpreadsheet, Clock, UserCheck, ShieldCheck } from 'lucide-react';
import * as XLSX from 'xlsx';

const Salaries = () => {
    const [salaries, setSalaries] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear()
    });

    const fetchSalariesData = async () => {
        setLoading(true);
        try {
            // API đã có logic lọc Trưởng phòng/Confirmed từ Backend
            const res = await axios.get(`http://localhost:5000/api/salaries?month=${filter.month}&year=${filter.year}`);
            setSalaries(res.data);
        } catch (err) {
            console.error("Lỗi lấy bảng lương:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSalariesData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filter.month, filter.year]);

    const handleExportExcel = () => {
        if (!salaries || salaries.length === 0) {
            alert("Bảng lương trống không, xuất gì đây bro?");
            return;
        }

        const dataForExcel = salaries.map((item, index) => ({
            "STT": index + 1,
            "Nhân viên": item.full_name,
            "Chức vụ": item.position,
            "Phòng ban": item.dept_name,
            "Lương thực tế": item.base_salary,
            "Phụ cấp": Number(item.allowance_meal) + Number(item.allowance_parking),
            "Thưởng": item.bonus,
            "Khấu trừ": item.deductions,
            "Thực nhận": item.final_salary,
            "Trạng thái": item.status === 'paid' ? 'Đã trả' : (item.status === 'confirmed' ? 'Đã duyệt' : 'Chờ duyệt')
        }));

        const worksheet = XLSX.utils.json_to_sheet(dataForExcel);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Bang-Luong-Chi-Tiet");
        XLSX.writeFile(workbook, `Bang_Luong_Nhom21_T${filter.month}_${filter.year}.xlsx`);
    };

    const handleGenerateSalary = async () => {
        if (!window.confirm(`Bạn có chắc muốn chốt lương dựa trên chấm công tháng ${filter.month}/${filter.year} không?`)) return;
        setLoading(true);
        try {
            await axios.post('http://localhost:5000/api/salaries/generate', filter);
            alert("Hệ thống đã quét chấm công và chốt lương thành công! 🚀");
            fetchSalariesData();
        // eslint-disable-next-line no-unused-vars
        } catch (err) {
            alert("Lỗi khi tính lương!");
        } finally {
            setLoading(false);
        }
    };

    const handlePaySalary = async (id) => {
        if (!window.confirm("Xác nhận chi trả lương cho nhân sự này?")) return;
        try {
            await axios.put(`http://localhost:5000/api/salaries/${id}/status`, { status: 'paid' });
            fetchSalariesData();
        // eslint-disable-next-line no-unused-vars
        } catch (err) {
            alert("Lỗi cập nhật trạng thái!");
        }
    };

    const formatVND = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    return (
        <div className="p-8 bg-slate-50 min-h-screen text-left animate-in fade-in duration-700 font-sans">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6">
                <div>
                    <h2 className="text-4xl font-black text-slate-800 tracking-tighter italic uppercase flex items-center gap-3">
                        <DollarSign size={40} className="text-indigo-600" /> Bảng lương thực tế
                    </h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1 italic">Nhóm 21 - Precision Payroll System</p>
                    <div className="h-1 w-20 bg-indigo-600 mt-2 rounded-full"></div>
                </div>

                <div className="flex items-center gap-4 bg-white p-4 rounded-[2.5rem] shadow-sm border border-slate-100">
                    <div className="flex items-center gap-2 px-4 border-r border-slate-100">
                        <Calendar size={18} className="text-slate-400" />
                        <select className="bg-transparent font-black text-slate-700 outline-none cursor-pointer text-xs uppercase" value={filter.month} onChange={(e) => setFilter({...filter, month: e.target.value})}>
                            {[...Array(12)].map((_, i) => (<option key={i+1} value={i+1}>THÁNG {i+1}</option>))}
                        </select>
                        <select className="bg-transparent font-black text-slate-700 outline-none cursor-pointer text-xs" value={filter.year} onChange={(e) => setFilter({...filter, year: e.target.value})}>
                            <option value="2026">2026</option>
                            <option value="2025">2025</option>
                        </select>
                    </div>
                    
                    <button onClick={handleExportExcel} className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2">
                        <FileSpreadsheet size={14} /> Xuất Excel
                    </button>

                    <button onClick={handleGenerateSalary} className="bg-slate-900 hover:bg-indigo-600 text-white px-5 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2">
                        <Calculator size={14} /> Chốt lương
                    </button>
                </div>
            </div>

            {/* Bảng lương */}
            <div className="bg-white rounded-[3.5rem] shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-900 text-white">
                            <th className="p-6 text-[10px] uppercase font-black tracking-widest text-nowrap">Nhân viên / Ngày công</th>
                            <th className="p-6 text-[10px] uppercase font-black tracking-widest text-center">Lương gốc (Tính theo ngày)</th>
                            <th className="p-6 text-[10px] uppercase font-black tracking-widest text-center text-emerald-400">Phụ cấp & Thưởng</th>
                            <th className="p-6 text-[10px] uppercase font-black tracking-widest text-center text-rose-400">Khấu trừ (Trễ)</th>
                            <th className="p-6 text-[10px] uppercase font-black tracking-widest text-center">Thực nhận</th>
                            <th className="p-6 text-[10px] uppercase font-black tracking-widest text-center">Trạng thái Admin</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {loading ? (
                            <tr><td colSpan="6" className="p-20 text-center animate-pulse text-slate-400 font-black italic uppercase text-xs tracking-widest">Đang tính toán bảng lương...</td></tr>
                        ) : salaries.length === 0 ? (
                            <tr><td colSpan="6" className="p-20 text-center text-slate-300 font-bold uppercase text-xs">Chưa có dữ liệu lương tháng này bro ơi!</td></tr>
                        ) : salaries.map((item) => (
                            <tr key={item.id} className="hover:bg-slate-50 transition-all group">
                                <td className="p-6">
                                    <div className="flex items-center gap-2">
                                        <div className="font-black text-slate-800 uppercase italic text-sm">{item.full_name}</div>
                                        {item.is_manager === 1 && <ShieldCheck size={14} className="text-indigo-500" title="Trưởng phòng" />}
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="flex flex-col">
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{item.dept_name}</span>
                                            <span className="text-[8px] font-bold text-indigo-400 uppercase italic">{item.position}</span>
                                        </div>
                                        <span className="bg-indigo-50 text-indigo-600 text-[8px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 border border-indigo-100">
                                            <UserCheck size={10} /> {22 - (item.unpaid_days || 0)}/22 Ngày
                                        </span>
                                    </div>
                                </td>
                                <td className="p-6 font-bold text-slate-600 text-sm text-center">
                                    {formatVND(item.base_salary)}
                                    <div className="text-[8px] text-slate-400 font-black uppercase mt-1 italic leading-none">Vắng {item.unpaid_days} ngày</div>
                                </td>
                                <td className="p-6 text-center">
                                    <div className="font-bold text-emerald-500 text-sm">+{formatVND(Number(item.bonus) + Number(item.allowance_meal) + Number(item.allowance_parking))}</div>
                                    <div className="flex justify-center gap-1 mt-1">
                                        <span className="text-[7px] font-black bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded border border-emerald-100 uppercase">🍱 PC</span>
                                        <span className="text-[7px] font-black bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100 uppercase">💰 Thưởng</span>
                                    </div>
                                </td>
                                <td className="p-6 font-bold text-rose-500 text-sm italic text-center">
                                    -{formatVND(item.deductions)}
                                    <div className="flex justify-center gap-1 mt-1 items-center text-[8px] font-black text-rose-400 uppercase">
                                        <Clock size={8} /> Trễ/Phạt
                                    </div>
                                </td>
                                <td className="p-6 font-black text-slate-900 text-base text-center">{formatVND(item.final_salary)}</td>
                                <td className="p-6">
                                    <div className="flex justify-center items-center">
                                        {item.status === 'paid' ? (
                                            <span className="flex items-center gap-1.5 text-emerald-500 font-black text-[10px] uppercase tracking-widest bg-emerald-50 px-4 py-2 rounded-2xl border border-emerald-100">
                                                <CheckCircle2 size={14} /> Hoàn tất
                                            </span>
                                        ) : (item.status === 'confirmed' || item.is_manager === 1) ? (
                                            <button onClick={() => handlePaySalary(item.id)} className="bg-indigo-600 text-white px-5 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 transition-all shadow-md active:scale-95 flex items-center gap-2">
                                                <DollarSign size={14} /> Trả lương
                                            </button>
                                        ) : (
                                            <span className="flex items-center gap-1.5 text-amber-500 font-black text-[10px] uppercase tracking-widest bg-amber-50 px-4 py-2 rounded-2xl border border-amber-100 italic">
                                                <AlertCircle size={14} /> Đang đợi duyệt
                                            </span>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Salaries;