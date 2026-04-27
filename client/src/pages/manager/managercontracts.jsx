import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FileText, Search, Calendar, Briefcase, ShieldCheck, AlertCircle, Filter, Send, History } from 'lucide-react';

const ManagerContracts = () => {
    const [contracts, setContracts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState('all');
    
    const manager = JSON.parse(localStorage.getItem('user'));
    const managerId = manager?.id;

    const fetchContracts = useCallback(async () => {
        if (!managerId) return;
        const cleanId = String(managerId).split(':')[0];
        setLoading(true);
        try {
            // Sử dụng API lấy team-contracts, Backend đã lọc chỉ lấy cái mới nhất rồi
            const res = await axios.get(`http://localhost:5000/api/manager/contracts/team-contracts/${cleanId}?statusFilter=${filterStatus}`);
            setContracts(res.data);
        // eslint-disable-next-line no-unused-vars
        } catch (err) {
            console.error("Lỗi lấy danh sách hợp đồng!");
        } finally {
            setLoading(false);
        }
    }, [managerId, filterStatus]);

    useEffect(() => { 
        fetchContracts(); 
    }, [fetchContracts]);

    // 🛠️ HÀM GỬI ĐỀ XUẤT LÊN ADMIN
    const handleProposeRenewal = async (id, name) => {
        const cleanId = String(id).split(':')[0];
        if (!window.confirm(`Bro muốn gửi đề xuất gia hạn cho nhân viên ${name} lên Admin chứ?`)) return;

        try {
            const res = await axios.patch(`http://localhost:5000/api/manager/contracts/propose-renewal/${cleanId}`);
            alert("🔥 " + res.data.message);
            fetchContracts(); 
        } catch (err) {
            alert("❌ Lỗi: " + (err.response?.data?.message || "Không thể gửi đề xuất"));
        }
    };

    const formatVND = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
    };

    const filtered = contracts.filter(c => 
        (c.full_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) || 
        (c.contract_code?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8 bg-[#f8fafc] min-h-screen text-left animate-in fade-in duration-500 font-sans">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-6">
                <div>
                    <h2 className="text-3xl font-black text-slate-800 uppercase italic tracking-tighter flex items-center gap-3">
                        <FileText className="text-indigo-600" size={32} /> Hồ sơ hợp đồng team
                    </h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 italic">Nhóm 21 - Manager Board</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-white px-4 py-3 rounded-2xl border border-slate-100 shadow-sm">
                        <Filter size={18} className="text-slate-400" />
                        <select 
                            className="bg-transparent font-black text-slate-700 outline-none cursor-pointer text-[10px] uppercase tracking-widest"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="all">TẤT CẢ TRẠNG THÁI</option>
                            <option value="hieu_luc">ĐANG HIỆU LỰC</option>
                            <option value="sap_het_han">SẮP HẾT HẠN (20N)</option>
                            <option value="Chờ gia hạn">CHỜ ADMIN KÝ</option>
                        </select>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="text"
                            placeholder="Tìm nhân viên..."
                            className="pl-12 pr-6 py-3 bg-white border border-slate-100 rounded-2xl w-64 shadow-sm outline-none font-medium text-sm"
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Table Area */}
            <div className="bg-white rounded-[2.5rem] shadow-xl overflow-hidden border border-slate-100">
                <table className="w-full text-left">
                    <thead className="bg-[#1e1b4b] text-white uppercase text-[10px] font-black tracking-widest italic text-center">
                        <tr>
                            <th className="p-6 text-left">Mã HĐ & Nhân viên</th>
                            <th className="p-6 text-center">Loại HĐ</th>
                            <th className="p-6 text-center">Lương cơ bản</th>
                            <th className="p-6 text-center">Phụ cấp (Ăn/Xe)</th>
                            <th className="p-6 text-center">Thời hạn</th>
                            <th className="p-6 text-right">Trạng thái quản lý</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {loading ? (
                            <tr><td colSpan="6" className="p-20 text-center animate-pulse font-black text-slate-300 uppercase italic">ĐANG TRÍCH XUẤT HỒ SƠ...</td></tr>
                        ) : filtered.length === 0 ? (
                            <tr><td colSpan="6" className="p-20 text-center font-bold text-slate-400 uppercase text-xs tracking-widest">Không có dữ liệu phù hợp bro ơi!</td></tr>
                        ) : filtered.map((item) => {
                            // diffDays chính là days_left từ Backend
                            const diffDays = item.days_left;

                            return (
                                <tr key={item.id} className="hover:bg-indigo-50/30 transition-all group">
                                    <td className="p-6">
                                        <div className="font-black text-slate-800 uppercase text-xs italic">{item.full_name}</div>
                                        <div className="text-[10px] font-bold text-indigo-500 tracking-tighter uppercase">{item.contract_code}</div>
                                    </td>
                                    <td className="p-6 text-center uppercase text-[10px] font-black text-slate-500">
                                        <div className="flex items-center justify-center gap-1">
                                            <Briefcase size={12} className="text-slate-400" /> {item.contract_type}
                                        </div>
                                    </td>
                                    <td className="p-6 text-center font-bold text-slate-700 text-xs tracking-tighter">
                                        {formatVND(item.basic_salary)}
                                    </td>
                                    <td className="p-6 text-center">
                                        <div className="text-[9px] font-bold text-emerald-600 tracking-tighter italic">🍱 {formatVND(item.allowance_meal)}</div>
                                        <div className="text-[9px] font-bold text-blue-600 tracking-tighter italic">🛵 {formatVND(item.allowance_parking)}</div>
                                    </td>
                                    <td className="p-6 text-center">
                                        <div className="flex flex-col items-center">
                                            <span className="text-[10px] font-bold text-slate-600 uppercase italic flex items-center gap-1 text-nowrap">
                                                <Calendar size={10} /> {item.start_date ? new Date(item.start_date).toLocaleDateString('vi-VN') : '---'}
                                            </span>
                                            <span className="text-[9px] text-slate-400 font-bold uppercase mt-1 italic tracking-tighter">
                                                Hết: {item.end_date ? new Date(item.end_date).toLocaleDateString('vi-VN') : 'Vô thời hạn'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-6 text-right flex flex-col items-end gap-2">
                                        {/* LOGIC FIX DỨT ĐIỂM "VÔ THỜI HẠN" BỊ ĐỎ */}
                                        {item.contract_status === 'Chờ gia hạn' ? (
                                            <span className="px-4 py-1.5 rounded-full text-[9px] font-black uppercase border border-indigo-200 bg-indigo-50 text-indigo-500 flex items-center gap-1">
                                                <Send size={12} /> Chờ Admin ký
                                            </span>
                                        ) : diffDays === null ? (
                                            /* Nếu Backend trả về null (vô thời hạn) thì hiện Xanh mướt */
                                            <span className="px-4 py-1.5 rounded-full text-[9px] font-black uppercase border border-emerald-100 bg-emerald-50 text-emerald-500 flex items-center gap-1 shadow-sm">
                                                <ShieldCheck size={12} /> Hiệu lực (Vô hạn)
                                            </span>
                                        ) : diffDays < 0 ? (
                                            <span className="px-4 py-1.5 rounded-full text-[9px] font-black uppercase border border-rose-100 bg-rose-50 text-rose-500 flex items-center gap-1">
                                                <AlertCircle size={12} /> Đã hết hạn
                                            </span>
                                        ) : diffDays <= 20 ? (
                                            <div className="flex flex-col items-end gap-1">
                                                <span className="px-4 py-1.5 rounded-full text-[9px] font-black uppercase border border-amber-200 bg-amber-50 text-amber-500 flex items-center gap-1 animate-pulse">
                                                    <AlertCircle size={12} /> Sắp hết hạn ({diffDays}n)
                                                </span>
                                                <button 
                                                    onClick={() => handleProposeRenewal(item.id, item.full_name)}
                                                    className="bg-indigo-600 text-white px-3 py-1 rounded-lg text-[9px] font-black uppercase hover:bg-slate-900 transition-all shadow-lg active:scale-95"
                                                >
                                                    Gia hạn ngay
                                                </button>
                                            </div>
                                        ) : (
                                            <span className="px-4 py-1.5 rounded-full text-[9px] font-black uppercase border border-emerald-100 bg-emerald-50 text-emerald-500 flex items-center gap-1">
                                                <ShieldCheck size={12} /> Hiệu lực
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ManagerContracts;