import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Wallet, TrendingUp, Calendar, CheckCircle, Info, Download, Eye } from 'lucide-react';

const EmployeeSalary = () => {
    const userLocal = JSON.parse(localStorage.getItem('user'));
    const [salaries, setSalaries] = useState([]);
    const [selectedSalary, setSelectedSalary] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchSalaries = async () => {
        if (!userLocal?.id) return;
        try {
            const res = await axios.get(`http://localhost:5000/api/employee/salary/my-salaries/${userLocal.id}`);
            setSalaries(res.data);
            if (res.data.length > 0) setSelectedSalary(res.data[0]);
        } catch (err) {
            console.error("Lỗi lấy lương:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSalaries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userLocal.id]);

    const formatVND = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

    return (
        <div className="p-4 space-y-8 animate-in fade-in duration-700 text-left">
            {/* Header Area */}
            <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-600 rounded-2xl text-white shadow-lg shadow-emerald-100">
                    <Wallet size={32} />
                </div>
                <div>
                    <h2 className="text-3xl font-black text-slate-800 uppercase italic tracking-tighter leading-none">Phiếu lương của tôi</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic mt-1">Nhóm 21 - Payroll Transparency</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* DANH SÁCH THÁNG LƯƠNG BÊN TRÁI */}
                <div className="lg:col-span-1 space-y-4">
                    <h3 className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-2 tracking-[0.2em] italic">Lịch sử thu nhập</h3>
                    {loading ? (
                        <div className="p-10 text-center animate-pulse font-black text-slate-200 uppercase">Đang bốc bảng lương...</div>
                    ) : salaries.map(s => (
                        <div 
                            key={s.id}
                            onClick={() => setSelectedSalary(s)}
                            className={`p-6 rounded-[2.5rem] cursor-pointer transition-all border-2 flex flex-col gap-2 ${
                                selectedSalary?.id === s.id 
                                ? 'bg-slate-900 border-slate-900 text-white shadow-2xl translate-x-2' 
                                : 'bg-white border-transparent hover:border-slate-100 shadow-sm'
                            }`}
                        >
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <Calendar size={16} className={selectedSalary?.id === s.id ? 'text-emerald-400' : 'text-slate-400'} />
                                    <span className="font-black italic uppercase text-xs">Tháng {s.month}/{s.year}</span>
                                </div>
                                <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md ${s.status === 'paid' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}`}>
                                    {s.status}
                                </span>
                            </div>
                            <p className="text-xl font-black">{formatVND(s.final_salary)}</p>
                        </div>
                    ))}
                </div>

                {/* CHI TIẾT PHIẾU LƯƠNG BÊN PHẢI */}
                <div className="lg:col-span-2">
                    {selectedSalary ? (
                        <div className="bg-white rounded-[3.5rem] shadow-2xl border border-slate-50 overflow-hidden relative">
                            {/* Decorative Background */}
                            <div className="absolute top-0 right-0 p-10 opacity-[0.03] rotate-12">
                                <TrendingUp size={250} />
                            </div>

                            {/* Phiếu Lương Header */}
                            <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/50 relative z-10">
                                <div>
                                    <h4 className="text-2xl font-black uppercase italic text-slate-800">Chi tiết quyết toán</h4>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Hệ thống tính lương tự động Nhóm 21</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-slate-400 uppercase">Kỳ lương</p>
                                    <p className="text-2xl font-black text-indigo-600 italic leading-none">{selectedSalary.month}/{selectedSalary.year}</p>
                                </div>
                            </div>

                            {/* Nội dung chi tiết */}
                            <div className="p-10 space-y-10 relative z-10">
                                {/* MỤC 1: LƯƠNG THEO CÔNG */}
                                <section>
                                    <p className="text-[10px] font-black uppercase text-indigo-500 mb-5 tracking-[0.2em] flex items-center gap-2"><TrendingUp size={14}/> 01. Lương thực tế theo ngày công</p>
                                    <div className="bg-slate-50 p-7 rounded-[2.5rem] border border-slate-100 space-y-4">
                                        <div className="flex justify-between text-slate-400 font-bold text-sm px-2">
                                            <span>Lương cơ bản (Hợp đồng)</span>
                                            <span>{formatVND(selectedSalary.base_salary)}</span>
                                        </div>
                                        <div className="flex justify-between items-center pt-5 border-t border-dashed border-slate-200 px-2">
                                            <div>
                                                <p className="font-black text-slate-700 italic text-base">Thành tiền công thực tế</p>
                                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                                                    {/* FIX: Dùng actual_work_days từ BE thay vì tính toán 22-unpaid_days ở FE */}
                                                    Công thức: ({formatVND(selectedSalary.base_salary)} / 22) × {selectedSalary.actual_work_days} ngày làm thực tế
                                                </p>
                                            </div>
                                            <p className="font-black text-2xl text-indigo-600 tracking-tighter">
                                                {formatVND((selectedSalary.base_salary / 22) * selectedSalary.actual_work_days)}
                                            </p>
                                        </div>
                                    </div>
                                </section>

                                {/* MỤC 2: PHỤ CẤP & THƯỞNG */}
                                <section>
                                    <p className="text-[10px] font-black uppercase text-emerald-500 mb-5 tracking-[0.2em]">02. Các khoản cộng thêm (+)</p>
                                    <div className="space-y-4 px-6">
                                        <SalaryItem label="Phụ cấp ăn trưa" value={selectedSalary.allowance_meal} />
                                        <SalaryItem label="Phụ cấp gửi xe" value={selectedSalary.allowance_parking} />
                                        <SalaryItem label="Thưởng hiệu suất / KPI" value={selectedSalary.bonus} highlight="text-emerald-600" />
                                    </div>
                                </section>

                                {/* MỤC 3: KHẤU TRỪ */}
                                <section>
                                    <p className="text-[10px] font-black uppercase text-rose-500 mb-5 tracking-[0.2em]">03. Các khoản khấu trừ (-)</p>
                                    <div className="space-y-4 px-6">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="font-bold text-sm text-slate-700">Khấu trừ tổng hợp</p>
                                                <p className="text-[9px] text-slate-400 font-bold uppercase italic tracking-tighter">Bao gồm: Phạt đi muộn, Bảo hiểm, Thuế</p>
                                            </div>
                                            <p className="font-black text-sm text-rose-500">-{formatVND(selectedSalary.deductions)}</p>
                                        </div>
                                    </div>
                                </section>

                                {/* THỰC NHẬN (NET) */}
                                <div className="pt-10 border-t-2 border-dashed border-slate-100 flex flex-col md:flex-row justify-between items-end md:items-center gap-6">
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.4em] mb-1">Tổng thực nhận (NET)</p>
                                        <p className="text-5xl font-black text-slate-900 italic tracking-tighter">{formatVND(selectedSalary.final_salary)}</p>
                                    </div>
                                    <div className={`px-6 py-3 rounded-2xl flex items-center gap-2 border shadow-sm ${selectedSalary.status === 'paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                        <CheckCircle size={20} />
                                        <span className="font-black uppercase text-[10px] tracking-widest">{selectedSalary.status === 'paid' ? 'Đã chi trả' : 'Đang xử lý'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-200 italic font-black uppercase py-40 border-2 border-dashed border-slate-100 rounded-[3.5rem]">
                            <Eye size={64} className="mb-4 opacity-20" />
                            Chọn một tháng để bóc phiếu lương bro ơi!
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Component con để render dòng lương cho gọn
const SalaryItem = ({ label, value, highlight = "text-slate-600" }) => (
    <div className="flex justify-between items-center">
        <span className="font-bold text-sm text-slate-700">{label}</span>
        <span className={`font-black text-sm ${highlight}`}>+{new Intl.NumberFormat('vi-VN').format(value)}</span>
    </div>
);

export default EmployeeSalary;