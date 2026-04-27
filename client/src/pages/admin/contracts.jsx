import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import {
    FileText, Plus, BadgeCheck, AlertCircle, FileSpreadsheet,
    MapPin, Printer, X, ShieldCheck, Save, Edit3, Calendar, Layers, Filter, Send, History
} from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const Contracts = () => {
    // --- 1. STATE MANAGEMENT ---
    const [contracts, setContracts] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [availableEmployees, setAvailableEmployees] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

    const [selectedContract, setSelectedContract] = useState(null);
    const [editingContract, setEditingContract] = useState(null);
    const [renewContract, setRenewContract] = useState(null);
    const [contractHistory, setContractHistory] = useState([]);

    const [filterDep, setFilterDep] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');

    const today = new Date().toISOString().split('T')[0];

    const [newContract, setNewContract] = useState({
        user_id: '', contract_code: 'HD-21-', contract_type: 'Chính thức',
        start_date: today, end_date: '', basic_salary: '',
        probation_period: '02 tháng', work_location: 'Khu Công nghệ cao, TP. Đà Nẵng',
        allowance_meal: 730000, allowance_parking: 100000,
        insurance_amount: 5000000, job_description: 'Thực hiện công tác chuyên môn theo yêu cầu của công ty.'
    });

    const pdfRef = useRef();

    // --- 2. DATA FETCHING ---
    const fetchContracts = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.get(`http://localhost:5000/api/contracts?depId=${filterDep}&statusFilter=${filterStatus}`);
            setContracts(res.data);
        } catch (err) { console.error("Lỗi lấy danh sách:", err); }
        finally { setLoading(false); }
    }, [filterDep, filterStatus]);

    const fetchDepartments = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/phongban');
            setDepartments(res.data);
        } catch (err) { console.error(err); }
    };

    const fetchAvailableEmployees = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/contracts/available-employees');
            setAvailableEmployees(res.data);
        } catch (err) { console.error(err); }
    };

    const fetchHistory = async (userId) => {
        try {
            const res = await axios.get(`http://localhost:5000/api/contracts/history/${userId}`);
            setContractHistory(res.data);
            setIsHistoryModalOpen(true);
        // eslint-disable-next-line no-unused-vars
        } catch (err) { alert("Lỗi lấy lịch sử!"); }
    };

    useEffect(() => {
        fetchContracts();
        fetchDepartments();
    }, [fetchContracts]);

    useEffect(() => {
        if (isAddModalOpen) fetchAvailableEmployees();
    }, [isAddModalOpen]);

    // --- 3. LOGIC HANDLERS ---
    const cleanData = (data) => {
        const cleaned = { ...data };
        if (cleaned.id) cleaned.id = String(cleaned.id).split(':')[0];
        if (cleaned.user_id) cleaned.user_id = String(cleaned.user_id).split(':')[0];
        if (cleaned.start_date) cleaned.start_date = String(cleaned.start_date).split('T')[0];
        if (cleaned.end_date && (cleaned.end_date === "" || cleaned.end_date === "null" || cleaned.end_date === "0000-00-00")) cleaned.end_date = null;
        return cleaned;
    };

    const formatVND = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
    };

    const handleAddContract = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:5000/api/contracts', cleanData(newContract));
            if (res.data.success) {
                alert("Ký hợp đồng thành công! 🚀");
                setIsAddModalOpen(false);
                fetchContracts();
            }
        // eslint-disable-next-line no-unused-vars
        } catch (err) { alert("Lỗi khi thêm!"); }
    };

    const handleUpdateContract = async (e) => {
        e.preventDefault();
        const cleanId = String(editingContract.id).split(':')[0];
        try {
            const res = await axios.put(`http://localhost:5000/api/contracts/${cleanId}`, cleanData(editingContract));
            if (res.data.success) {
                alert("Cập nhật thành công! ✅");
                setIsEditModalOpen(false);
                fetchContracts();
            }
        // eslint-disable-next-line no-unused-vars
        } catch (err) { alert("Lỗi cập nhật!"); }
    };

    const handleRenewSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:5000/api/contracts/renew', cleanData(renewContract));
            if (res.data.success) {
                alert("Gia hạn thành công! Hợp đồng cũ đã chốt lịch sử. ✅");
                setIsRenewModalOpen(false);
                fetchContracts();
            }
        // eslint-disable-next-line no-unused-vars
        } catch (err) { alert("Lỗi khi gia hạn!"); }
    };

    const openRenewModal = (item) => {
        const nextDay = item.end_date ? new Date(new Date(item.end_date).getTime() + 86400000).toISOString().split('T')[0] : today;
        setRenewContract({
            old_contract_id: item.id, user_id: item.user_id, full_name: item.full_name,
            contract_code: `HD-RE-${Date.now()}`, contract_type: 'Chính thức',
            start_date: nextDay, end_date: '', basic_salary: item.basic_salary,
            allowance_meal: item.allowance_meal, allowance_parking: item.allowance_parking
        });
        setIsRenewModalOpen(true);
    };

    const handleViewDetail = async (id) => {
        try {
            const cleanId = String(id).split(':')[0];
            const res = await axios.get(`http://localhost:5000/api/contracts/${cleanId}`);
            setSelectedContract(res.data);
            setIsModalOpen(true);
        // eslint-disable-next-line no-unused-vars
        } catch (err) { alert("Lỗi lấy chi tiết!"); }
    };

    const exportToExcel = () => {
        const data = contracts.map(c => ({
            "Mã HĐ": c.contract_code,
            "Nhân viên": c.full_name,
            "Loại HĐ": c.contract_type,
            "Bắt đầu": new Date(c.start_date).toLocaleDateString('vi-VN'),
            "Kết thúc": c.end_date ? new Date(c.end_date).toLocaleDateString('vi-VN') : "Vô thời hạn",
            "Lương": c.basic_salary,
            "Trạng thái": c.status
        }));
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Contracts");
        XLSX.writeFile(wb, "Danh_Sach_Hop_Dong.xlsx");
    };

    // --- FIX KHÚC IN PDF: GIỮ CƠ CHẾ IFRAME CỦA BRO - FIX CHỮ BÈ ---
    const handlePrintPDF = async () => {
        if (!selectedContract) return;
        try {
            const iframe = document.createElement('iframe');
            iframe.style.position = 'fixed'; 
            iframe.style.visibility = 'hidden';
            iframe.style.width = '850px'; // Ép chiều rộng để render text chuẩn tỉ lệ
            document.body.appendChild(iframe);
            const doc = iframe.contentDocument || iframe.contentWindow.document;
            doc.open();
            doc.write(`
                <html>
                <head>
                    <style>
                        @page { size: A4; margin: 0; }
                        body { 
                            font-family: 'Times New Roman', serif; 
                            padding: 25mm 20mm; 
                            line-height: 1.6; 
                            background: white; 
                            color: black; 
                            font-size: 13pt;
                        }
                        .text-center { text-align: center; }
                        .header-title { font-weight: bold; text-transform: uppercase; font-size: 13pt; margin: 0; }
                        .contract-title { font-size: 18pt; font-weight: bold; text-transform: uppercase; margin: 30pt 0 10pt; }
                        .section-title { font-weight: bold; text-transform: uppercase; margin-top: 15pt; }
                        .signature-space { height: 70pt; display: flex; align-items: center; justify-content: center; font-style: italic; color: #3b82f6; font-size: 20pt; font-family: cursive; }
                        p { margin: 8pt 0; }
                    </style>
                </head>
                <body>
                    <div class="text-center">
                        <h1 class="header-title">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</h1>
                        <p style="font-weight:bold; text-decoration: underline;">Độc lập - Tự do - Hạnh phúc</p>
                        <h2 class="contract-title">Hợp đồng lao động</h2>
                        <p style="font-weight: bold;">Số: ${selectedContract.contract_code}/N21-2026</p>
                    </div>
                    <p style="margin-top:20pt">Hôm nay, tại văn phòng công ty, chúng tôi gồm:</p>
                    <p><strong>1. BÊN SỬ DỤNG LAO ĐỘNG (BÊN A):</strong> CÔNG TY QUẢN TRỊ NHÂN SỰ NHÓM 21</p>
                    <p>Đại diện: <strong>Ông NGUYỄN MINH NHẬT</strong> - Tổng Giám Đốc</p>
                    <p><strong>2. NGƯỜI LAO ĐỘNG (BÊN B):</strong> Ông/Bà <strong>${selectedContract.full_name}</strong></p>
                    <p>Số CCCD: ${selectedContract.identity_card || '................'} | Địa chỉ: ${selectedContract.address || '................'}</p>
                    <div class="section-title">ĐIỀU 1: CÔNG VIỆC VÀ THỜI HẠN</div>
                    <p>- Chức danh chuyên môn: ${selectedContract.position}</p>
                    <p>- Thời hạn: Từ ${new Date(selectedContract.start_date).toLocaleDateString('vi-VN')} đến ${selectedContract.end_date ? new Date(selectedContract.end_date).toLocaleDateString('vi-VN') : 'Vô thời hạn'}</p>
                    <div class="section-title">ĐIỀU 2: LƯƠNG VÀ QUYỀN LỢI</div>
                    <p>- Mức lương chính: ${formatVND(selectedContract.basic_salary)}</p>
                    <div style="display:flex; justify-content: space-between; margin-top:50pt; text-align:center">
                        <div style="width:200pt"><p style="font-weight:bold">ĐẠI DIỆN BÊN A</p><div class="signature-space">Nguyễn Minh Nhật</div><p style="font-weight:bold">Nguyễn Minh Nhật</p></div>
                        <div style="width:200pt"><p style="font-weight:bold">NGƯỜI LAO ĐỘNG</p><div class="signature-space" style="color:#eee">(Ký tên)</div><p style="font-weight:bold">${selectedContract.full_name}</p></div>
                    </div>
                </body>
                </html>
            `);
            doc.close();
            setTimeout(async () => {
                const canvas = await html2canvas(doc.body, { scale: 3, useCORS: true });
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF('p', 'mm', 'a4');
                pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
                pdf.save(`HDLD_N21_${selectedContract.full_name}.pdf`);
                document.body.removeChild(iframe);
            }, 1000);
        // eslint-disable-next-line no-unused-vars
        } catch (error) { alert("Lỗi in PDF!"); }
    };

    // --- 4. RENDER UI ---
    return (
        <div className="p-8 bg-slate-50 min-h-screen text-left animate-in fade-in duration-700 font-sans">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6">
                <div>
                    <h2 className="text-4xl font-black text-slate-800 tracking-tighter italic uppercase flex items-center gap-3">
                        <FileText size={40} className="text-orange-500" /> Quản lý hợp đồng
                    </h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 italic">Nhóm 21 - Precision Contract System</p>
                    <div className="h-1 w-20 bg-orange-500 mt-2 rounded-full"></div>
                </div>

                <div className="flex items-center gap-4 bg-white p-4 rounded-[2.5rem] shadow-sm border border-slate-100">
                    <button onClick={exportToExcel} className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-600 hover:text-white transition-all">
                        <FileSpreadsheet size={20} />
                    </button>
                    <div className="flex items-center gap-2 px-4 border-r border-slate-100 text-xs font-black uppercase text-slate-700">
                        <Layers size={18} className="text-slate-400" />
                        <select className="bg-transparent outline-none cursor-pointer" value={filterDep} onChange={(e) => setFilterDep(e.target.value)}>
                            <option value="all">PHÒNG BAN</option>
                            {departments.map(dep => <option key={dep.id} value={dep.id}>{dep.name}</option>)}
                        </select>
                    </div>

                    <div className="flex items-center gap-2 px-4 border-r border-slate-100 text-xs font-black uppercase text-slate-700">
                        <Filter size={18} className="text-slate-400" />
                        <select className="bg-transparent outline-none cursor-pointer" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                            <option value="all">TRẠNG THÁI</option>
                            <option value="hieu_luc">ĐANG HIỆU LỰC</option>
                            <option value="sap_het_han">SẮP HẾT HẠN (20N)</option>
                            <option value="cho_gia_han">📩 CHỜ GIA HẠN</option>
                        </select>
                    </div>

                    <button onClick={() => setIsAddModalOpen(true)} className="bg-slate-900 hover:bg-orange-500 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl flex items-center gap-2">
                        <Plus size={16} /> Thêm hợp đồng
                    </button>
                </div>
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-[3.5rem] shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full border-collapse text-center">
                    <thead>
                        <tr className="bg-slate-900 text-white uppercase text-[10px] font-black tracking-widest italic">
                            <th className="p-6 text-left">Số HĐ / Nhân viên</th>
                            <th className="p-6">Loại HĐ / Thời hạn</th>
                            <th className="p-6">Lương cơ bản</th>
                            <th className="p-6">Trạng thái quản lý</th>
                            <th className="p-6">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {loading ? (
                            <tr><td colSpan="5" className="p-20 text-center animate-pulse text-slate-400 font-black uppercase italic text-xs tracking-widest">Đang trích xuất dữ liệu...</td></tr>
                        ) : contracts.length === 0 ? (
                            <tr><td colSpan="5" className="p-20 text-center text-slate-300 font-bold uppercase text-xs">Không có hồ sơ nào phù hợp!</td></tr>
                        ) : contracts.map((item) => (
                            <tr key={item.id} className="hover:bg-orange-50/50 transition-all group">
                                <td className="p-6 text-left">
                                    <div className="font-black text-orange-600 text-[11px] italic mb-1 uppercase tracking-widest cursor-pointer hover:underline" onClick={() => handleViewDetail(item.id)}>{item.contract_code}</div>
                                    <div className="font-black text-slate-800 uppercase italic text-sm hover:text-indigo-600 cursor-help flex items-center gap-2 transition-colors" onClick={() => fetchHistory(item.user_id)}>
                                        {item.full_name} <History size={14} className="text-slate-300 group-hover:text-indigo-400" />
                                    </div>
                                    <div className="text-[10px] font-bold text-slate-400 flex items-center gap-1"><MapPin size={10} /> {item.work_location}</div>
                                </td>
                                <td className="p-6 text-center">
                                    <div className="font-black text-[10px] uppercase text-slate-500 italic mb-1">{item.contract_type}</div>
                                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                                        {new Date(item.start_date).toLocaleDateString('vi-VN')} → {item.end_date ? new Date(item.end_date).toLocaleDateString('vi-VN') : "∞"}
                                    </div>
                                </td>
                                <td className="p-6 font-black text-slate-900 text-base">{formatVND(item.basic_salary)}</td>
                                <td className="p-6 text-center">
                                    {item.status === 'Chờ gia hạn' ? (
                                        <span className="px-4 py-2 rounded-2xl font-black text-[10px] uppercase border text-indigo-600 bg-indigo-50 border-indigo-100 animate-bounce flex items-center justify-center gap-1 mx-auto w-fit">
                                            <Send size={12} /> Đề xuất ký lại
                                        </span>
                                    ) : !item.end_date ? (
                                        <span className="px-4 py-2 rounded-2xl font-black text-[10px] uppercase border text-emerald-500 bg-emerald-50 border-emerald-100 flex items-center justify-center gap-1 mx-auto w-fit">
                                            <ShieldCheck size={12} /> Hiệu lực
                                        </span>
                                    ) : item.days_left < 0 ? (
                                        <span className="px-4 py-2 rounded-2xl font-black text-[10px] uppercase border text-rose-500 bg-rose-50 border-rose-100 flex items-center justify-center gap-1 mx-auto w-fit">
                                            <AlertCircle size={12} /> Hết hạn
                                        </span>
                                    ) : item.days_left <= 20 ? (
                                        <span className="px-4 py-2 rounded-2xl font-black text-[10px] uppercase border text-amber-500 bg-amber-50 border-amber-200 animate-pulse flex items-center justify-center gap-1 mx-auto w-fit">
                                            ⚠️ Sắp hết hạn ({item.days_left}n)
                                        </span>
                                    ) : (
                                        <span className="px-4 py-2 rounded-2xl font-black text-[10px] uppercase border text-emerald-500 bg-emerald-50 border-emerald-100 flex items-center justify-center gap-1 mx-auto w-fit">
                                            <ShieldCheck size={12} /> Hiệu lực
                                        </span>
                                    )}
                                </td>
                                <td className="p-6 flex justify-center gap-2">
                                    {item.status === 'Chờ gia hạn' && (
                                        <button onClick={() => openRenewModal(item)} className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-slate-900 transition-all shadow-md flex items-center gap-2 text-[10px] font-black uppercase">
                                            <Send size={14} /> Ký mới
                                        </button>
                                    )}
                                    <button onClick={(e) => { e.stopPropagation(); setEditingContract(item); setIsEditModalOpen(true); }} className="p-3 bg-white border border-slate-100 rounded-xl hover:bg-slate-900 hover:text-white transition-all shadow-sm">
                                        <Edit3 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* --- 5. MODALS SECTION --- */}

            {/* MODAL: TIMELINE LỊCH SỬ (Z-INDEX 120) */}
            {isHistoryModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[120] flex justify-center items-center p-4">
                    <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
                        <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
                            <div>
                                <h3 className="font-black uppercase italic text-lg flex items-center gap-2"><History className="text-orange-500" /> Vòng đời nhân sự</h3>
                                <p className="text-[10px] text-slate-400 uppercase font-bold mt-1 tracking-widest">Lịch sử: {contractHistory[0]?.full_name}</p>
                            </div>
                            <button onClick={() => setIsHistoryModalOpen(false)} className="hover:bg-white/10 p-2 rounded-xl transition-all"><X size={20} /></button>
                        </div>
                        <div className="p-8 max-h-[60vh] overflow-y-auto bg-slate-50">
                            <div className="relative border-l-2 border-dashed border-slate-300 ml-4 space-y-8">
                                {contractHistory.map((h, index) => (
                                    <div key={h.id} className="relative pl-8">
                                        <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-4 border-white ${index === 0 ? 'bg-orange-500 scale-125 shadow-[0_0_10px_rgba(249,115,22,0.5)]' : 'bg-slate-400'}`}></div>
                                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 group hover:border-indigo-500 transition-all cursor-pointer" onClick={() => handleViewDetail(h.id)}>
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <span className="text-[9px] font-black text-orange-600 uppercase italic flex items-center gap-2">{h.contract_code} <Printer size={10} className="opacity-0 group-hover:opacity-100 transition-all" /></span>
                                                    <h4 className="font-bold text-slate-800 text-xs uppercase">{h.contract_type}</h4>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase ${h.status === 'Hiệu lực' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>{h.status}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
                                                <span>📅 {new Date(h.start_date).toLocaleDateString('vi-VN')} - {h.end_date ? new Date(h.end_date).toLocaleDateString('vi-VN') : '∞'}</span>
                                                <span className="text-slate-900 font-black tracking-widest">{formatVND(h.basic_salary)}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL: CHI TIẾT & XUẤT PDF (Z-INDEX 150) */}
            {isModalOpen && selectedContract && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[150] flex justify-center items-center p-4">
                    <div className="bg-white w-full max-w-5xl rounded-[3rem] shadow-2xl flex flex-col animate-in zoom-in duration-300 max-h-[95vh]">
                        <div className="p-6 border-b flex justify-between items-center bg-slate-50 rounded-t-[3rem]">
                            <div className="flex items-center gap-3">
                                <ShieldCheck className="text-emerald-500" size={28} />
                                <span className="font-black uppercase italic text-slate-800 tracking-tighter">Pháp lý hồ đồng điện tử</span>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={handlePrintPDF} className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-lg transition-transform active:scale-95">
                                    <Printer size={16} /> Xuất PDF
                                </button>
                                <button onClick={() => setIsModalOpen(false)} className="bg-white text-slate-400 p-2.5 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-all">
                                    <X size={20} />
                                </button>
                            </div>
                        </div>
                        <div className="p-20 bg-white overflow-y-auto text-left" ref={pdfRef}>
                            <div className="text-center mb-10">
                                <h1 className="text-xl font-bold uppercase text-black">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</h1>
                                <h2 className="text-md font-bold underline underline-offset-4 uppercase text-black">Độc lập - Tự do - Hạnh phúc</h2>
                                <h3 className="text-3xl font-black mt-10 uppercase tracking-[0.1em] text-black">Hợp đồng lao động</h3>
                                <p className="text-slate-500 font-bold mt-2 text-[10px]">Số: {selectedContract.contract_code}/N21-2026</p>
                            </div>
                            <div className="space-y-6 text-slate-800 text-[13px] leading-relaxed text-justify">
                                <div className="space-y-3 bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
                                    <p><strong>BÊN SỬ DỤNG LAO ĐỘNG (BÊN A):</strong> CÔNG TY QUẢN TRỊ NHÂN SỰ NHÓM 21</p>
                                    <p>Đại diện: <strong>Ông NGUYỄN MINH NHẬT</strong> - Tổng Giám Đốc</p>
                                    <hr className="border-slate-200" />
                                    <p><strong>NGƯỜI LAO ĐỘNG (BÊN B):</strong> Ông/Bà <strong>{selectedContract.full_name}</strong></p>
                                    <p>Số CCCD: {selectedContract.identity_card || '................'} | Địa chỉ: {selectedContract.address || '................'}</p>
                                </div>
                                <h4 className="font-black uppercase text-orange-600 border-b border-orange-100 inline-block">Điều 1: Công việc và thời hạn</h4>
                                <p>- Chức danh chuyên môn: <strong>{selectedContract.position}</strong></p>
                                <p>- Loại hợp đồng: <strong>{selectedContract.contract_type}</strong></p>
                                <p>- Thời hạn: Từ <strong>{new Date(selectedContract.start_date).toLocaleDateString('vi-VN')}</strong> đến <strong>{selectedContract.end_date ? new Date(selectedContract.end_date).toLocaleDateString('vi-VN') : "Vô thời hạn"}</strong></p>

                                <h4 className="font-black uppercase text-orange-600 border-b border-orange-100 inline-block">Điều 2: Chế độ tiền lương</h4>
                                <p>- Mức lương chính: <strong>{formatVND(selectedContract.basic_salary)}</strong></p>
                                <p>- Phụ cấp khác: Ăn trưa (${formatVND(selectedContract.allowance_meal)}/tháng), Gửi xe (${formatVND(selectedContract.allowance_parking)}/tháng).</p>

                                <div className="grid grid-cols-2 gap-10 mt-16 text-center">
                                    <div>
                                        <p className="font-black uppercase text-[11px]">ĐẠI DIỆN BÊN A</p>
                                        <div className="h-24 flex items-center justify-center italic text-blue-500 text-2xl font-serif">(Đã ký)</div>
                                        <p className="font-black uppercase">Nguyễn Minh Nhật</p>
                                    </div>
                                    <div>
                                        <p className="font-black uppercase text-[11px]">NGƯỜI LAO ĐỘNG</p>
                                        <div className="h-24 flex items-center justify-center italic text-slate-300 text-[11px]">(Ký và ghi rõ họ tên)</div>
                                        <p className="font-black uppercase">{selectedContract.full_name}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL: KÝ LẠI HỢP ĐỒNG (RENEW) */}
            {isRenewModalOpen && renewContract && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[130] flex justify-center items-center p-4">
                    <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl animate-in slide-in-from-bottom duration-500 overflow-hidden">
                        <div className="p-8 bg-indigo-50 border-b flex justify-between items-center">
                            <span className="font-black uppercase italic text-indigo-900 flex items-center gap-2"><Send size={20} /> Ký lại hợp đồng: {renewContract.full_name}</span>
                            <button onClick={() => setIsRenewModalOpen(false)} className="bg-white text-slate-400 p-2 rounded-xl shadow-sm"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleRenewSubmit} className="p-10 grid grid-cols-2 gap-5 text-sm">
                            <div className="col-span-1">
                                <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block tracking-widest">Mã số HĐ mới</label>
                                <input required className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold outline-none ring-2 ring-transparent focus:ring-indigo-500 transition-all" value={renewContract.contract_code} onChange={e => setRenewContract({ ...renewContract, contract_code: e.target.value })} />
                            </div>
                            <div className="col-span-1">
                                <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block tracking-widest">Lương thỏa thuận mới</label>
                                <input required type="number" className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold outline-none ring-2 ring-transparent focus:ring-indigo-500 transition-all" value={renewContract.basic_salary} onChange={e => setRenewContract({ ...renewContract, basic_salary: e.target.value })} />
                            </div>
                            <div className="col-span-1">
                                <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block tracking-widest">Bắt đầu từ ngày</label>
                                <input required type="date" className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold outline-none tracking-widest" value={renewContract.start_date} onChange={e => setRenewContract({ ...renewContract, start_date: e.target.value })} />
                            </div>
                            <div className="col-span-1">
                                <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block tracking-widest">Đến ngày (Nếu có)</label>
                                <input type="date" className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold outline-none tracking-widest" value={renewContract.end_date} onChange={e => setRenewContract({ ...renewContract, end_date: e.target.value })} />
                            </div>
                            <button type="submit" className="col-span-2 bg-indigo-600 text-white py-5 rounded-[2rem] font-black uppercase text-xs tracking-widest hover:bg-slate-900 transition-all shadow-xl mt-4 active:scale-95">
                                Xác nhận ký mới & Chốt HĐ cũ ✍️
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL: THÊM HỢP ĐỒNG MỚI */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex justify-center items-center p-4">
                    <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl animate-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">
                        <div className="p-8 bg-slate-50 border-b flex justify-between items-center sticky top-0 z-10">
                            <span className="font-black uppercase italic text-slate-800 flex items-center gap-2"><Plus className="text-orange-500" /> Khởi tạo hồ sơ hợp đồng</span>
                            <button onClick={() => setIsAddModalOpen(false)} className="bg-white text-slate-400 p-2 rounded-xl border border-slate-100 shadow-sm"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleAddContract} className="p-10 grid grid-cols-2 gap-5 text-sm">
                            <div className="col-span-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block tracking-widest">Chọn nhân viên (Chưa có HĐ)</label>
                                <select required className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold outline-none appearance-none" value={newContract.user_id} onChange={e => setNewContract({ ...newContract, user_id: e.target.value })}>
                                    <option value="">-- Danh sách chờ ký --</option>
                                    {availableEmployees.map(emp => <option key={emp.id} value={emp.id}>{emp.full_name} ({emp.position})</option>)}
                                </select>
                            </div>
                            <div className="col-span-1">
                                <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block tracking-widest">Mã hợp đồng</label>
                                <input required className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold outline-none" value={newContract.contract_code} onChange={e => setNewContract({ ...newContract, contract_code: e.target.value })} />
                            </div>
                            <div className="col-span-1">
                                <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block tracking-widest">Lương cơ bản</label>
                                <input required type="number" className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold outline-none" value={newContract.basic_salary} onChange={e => setNewContract({ ...newContract, basic_salary: e.target.value })} />
                            </div>
                            <div className="col-span-1">
                                <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block tracking-widest">Ngày ký kết</label>
                                <input required type="date" className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold outline-none" value={newContract.start_date} onChange={e => setNewContract({ ...newContract, start_date: e.target.value })} />
                            </div>
                            <div className="col-span-1">
                                <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block tracking-widest">Ngày kết thúc</label>
                                <input type="date" className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold outline-none" value={newContract.end_date} onChange={e => setNewContract({ ...newContract, end_date: e.target.value })} />
                            </div>
                            <div className="col-span-2 pt-4">
                                <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black uppercase text-xs tracking-[0.3em] hover:bg-orange-500 transition-all flex items-center justify-center gap-2 shadow-xl active:scale-95">
                                    <Save size={18} /> Lưu hồ sơ pháp lý
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL: CHỈNH SỬA HỢP ĐỒNG */}
            {isEditModalOpen && editingContract && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex justify-center items-center p-4">
                    <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl animate-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">
                        <div className="p-8 bg-slate-50 border-b flex justify-between items-center sticky top-0 z-10">
                            <span className="font-black uppercase italic text-slate-800 flex items-center gap-2"><Edit3 className="text-orange-500" /> Hiệu chỉnh: {editingContract.full_name}</span>
                            <button onClick={() => setIsEditModalOpen(false)} className="bg-white text-slate-400 p-2 rounded-xl border border-slate-100 shadow-sm"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleUpdateContract} className="p-10 grid grid-cols-2 gap-5 text-sm">
                            <div className="col-span-1">
                                <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block tracking-widest">Mã hợp đồng</label>
                                <input required className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold outline-none" value={editingContract.contract_code} onChange={e => setEditingContract({ ...editingContract, contract_code: e.target.value })} />
                            </div>
                            <div className="col-span-1">
                                <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block tracking-widest">Mức lương</label>
                                <input required type="number" className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold outline-none" value={editingContract.basic_salary} onChange={e => setEditingContract({ ...editingContract, basic_salary: e.target.value })} />
                            </div>
                            <div className="col-span-1">
                                <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block tracking-widest">Trạng thái hiện tại</label>
                                <select className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold outline-none appearance-none" value={editingContract.status} onChange={e => setEditingContract({ ...editingContract, status: e.target.value })}>
                                    <option value="Hiệu lực">Hiệu lực</option>
                                    <option value="Hết hiệu lực">Hết hiệu lực</option>
                                    <option value="Chờ gia hạn">Chờ gia hạn</option>
                                </select>
                            </div>
                            <div className="col-span-1">
                                <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block tracking-widest">Cập nhật ngày kết thúc</label>
                                <input type="date" className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold outline-none tracking-widest" value={editingContract.end_date ? String(editingContract.end_date).split('T')[0] : ''} onChange={e => setEditingContract({ ...editingContract, end_date: e.target.value })} />
                            </div>
                            <div className="col-span-2 pt-4">
                                <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black uppercase text-xs tracking-widest hover:bg-orange-500 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2">
                                    <Save size={18} /> Cập nhật dữ liệu
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Contracts;