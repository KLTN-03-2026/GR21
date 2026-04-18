import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
    FileText, Plus, BadgeCheck, AlertCircle, FileSpreadsheet,
    MapPin, Printer, X, ShieldCheck, Save, Edit3
} from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const Contracts = () => {
    const [contracts, setContracts] = useState([]);
    const [, setLoading] = useState(true);
    const [availableEmployees, setAvailableEmployees] = useState([]);

    const [selectedContract, setSelectedContract] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const today = new Date().toISOString().split('T')[0];

    // ✅ GIỮ NGUYÊN STATE CŨ & CẬP NHẬT TÊN BIẾN THEO DB (identity_card, address)
    const [newContract, setNewContract] = useState({
        user_id: '', 
        contract_code: 'HD-21-', 
        contract_type: 'Chính thức',
        start_date: today, 
        end_date: '', 
        basic_salary: '', 
        probation_period: '02 tháng',
        work_location: 'Khu Công nghệ cao, TP. Đà Nẵng', 
        allowance_meal: 730000,
        allowance_parking: 100000, 
        insurance_amount: 5000000, 
        job_description: 'Thực hiện công tác chuyên môn theo yêu cầu của công ty.',
        identity_card: '', // Sửa từ cccd_number cho khớp DB
        address: '' // Sửa từ permanent_address cho khớp DB
    });

    const [editingContract, setEditingContract] = useState(null);

    const pdfRef = useRef();

    useEffect(() => { fetchContracts(); }, []);

    useEffect(() => {
        if (isAddModalOpen) fetchAvailableEmployees();
    }, [isAddModalOpen]);

    const fetchContracts = async () => {
        setLoading(true);
        try {
            const res = await axios.get('http://localhost:5000/api/contracts');
            setContracts(res.data);
        } catch (err) { console.error(err); } finally { setLoading(false); }
    };

    const fetchAvailableEmployees = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/contracts/available-employees');
            setAvailableEmployees(res.data);
        } catch (err) { console.error(err); }
    };

    const handleAddContract = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:5000/api/contracts', newContract);
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
        try {
            const res = await axios.put(`http://localhost:5000/api/contracts/${editingContract.id}`, editingContract);
            if (res.data.success) {
                alert("Cập nhật thành công! ✅");
                setIsEditModalOpen(false);
                fetchContracts();
            }
        // eslint-disable-next-line no-unused-vars
        } catch (err) { alert("Lỗi cập nhật!"); }
    };

    const handleViewDetail = async (id) => {
        try {
            const res = await axios.get(`http://localhost:5000/api/contracts/${id}`);
            setSelectedContract(res.data);
            setIsModalOpen(true);
        // eslint-disable-next-line no-unused-vars
        } catch (err) { alert("Lỗi chi tiết!"); }
    };

    const formatVND = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const handlePrintPDF = async () => {
        const input = pdfRef.current;
        if (!input) return;
        try {
            const iframe = document.createElement('iframe');
            iframe.style.position = 'fixed';
            iframe.style.visibility = 'hidden';
            document.body.appendChild(iframe);
            const doc = iframe.contentDocument || iframe.contentWindow.document;
            doc.open();
            doc.write(`
                <html>
                    <head>
                        <style>
                            @page { size: A4; margin: 0; }
                            body { font-family: 'Times New Roman', serif; width: 210mm; min-height: 297mm; padding: 25mm 20mm; margin: 0 auto; line-height: 1.6; background: white; color: black; font-size: 12pt; }
                            .text-center { text-align: center; }
                            .header-title { font-size: 13pt; margin: 0; font-weight: bold; text-transform: uppercase; }
                            .contract-title { font-size: 18pt; margin: 30pt 0 5pt; font-weight: bold; text-transform: uppercase; }
                            .section-title { font-size: 12pt; font-weight: bold; text-transform: uppercase; margin-top: 15pt; }
                            .footer { display: flex; justify-content: space-between; margin-top: 40pt; text-align: center; }
                            .signature-space { height: 60pt; display: flex; align-items: center; justify-content: center; font-style: italic; color: #3b82f6; font-size: 18pt; font-family: cursive; }
                            .info-table { width: 100%; border-collapse: collapse; margin-top: 10pt; }
                            .info-table td { padding: 4pt 0; vertical-align: top; }
                            .info-table td:first-child { width: 160pt; }
                        </style>
                    </head>
                    <body>
                        <div class="text-center">
                            <h1 class="header-title">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</h1>
                            <p class="header-title" style="border-bottom: 1.5pt solid black; display: inline-block; padding-bottom: 3pt;">Độc lập - Tự do - Hạnh phúc</p>
                            <h2 class="contract-title">Hợp đồng lao động</h2>
                            <p style="font-weight: bold; font-style: italic;">Số: ${selectedContract.contract_code}/N21-2026</p>
                        </div>

                        <p style="margin-top: 20pt;">Chúng tôi, gồm một bên là đại diện cho <strong>CÔNG TY QUẢN TRỊ NHÂN SỰ NHÓM 21</strong> và một bên là Người lao động, cùng thỏa thuận ký kết hợp đồng này:</p>

                        <div class="section-title">I. THÔNG TIN CÁC BÊN</div>
                        <table class="info-table">
                            <tr><td><strong>1. Bên sử dụng lao động:</strong></td><td><strong>NHÓM 21 HRM SYSTEM</strong></td></tr>
                            <tr><td>Đại diện:</td><td>Ông <strong>NGUYỄN MINH NHẬT</strong> - Tổng Giám Đốc</td></tr>
                            <tr><td><strong>2. Người lao động:</strong></td><td><strong>${selectedContract.full_name}</strong></td></tr>
                            <tr><td>Số CCCD:</td><td>${selectedContract.identity_card || "...................."}</td></tr>
                            <tr><td>Địa chỉ thường trú:</td><td>${selectedContract.address || "...................."}</td></tr>
                        </table>

                        <div class="section-title">II. NỘI DUNG CÔNG VIỆC</div>
                        <p>- Vị trí chuyên môn: ${selectedContract.position}</p>
                        <p>- Loại hợp đồng: ${selectedContract.contract_type}</p>
                        <p>- Địa điểm làm việc: ${selectedContract.work_location || "Văn phòng Nhóm 21"}</p>
                        <p>- Nhiệm vụ chính: ${selectedContract.job_description || "Thực hiện chuyên môn theo phân công."}</p>

                        <div class="section-title">III. QUYỀN LỢI VÀ NGHĨA VỤ</div>
                        <p>1. Lương cơ bản: <strong>${formatVND(selectedContract.basic_salary)}</strong></p>
                        <p>2. Phụ cấp: Ăn trưa (${formatVND(selectedContract.allowance_meal || 730000)}), Gửi xe (${formatVND(selectedContract.allowance_parking || 100000)})</p>
                        <p>3. Hình thức trả lương: Chuyển khoản ngân hàng vào ngày 05 hàng tháng.</p>
                        <p>4. Chế độ nghỉ: Nghỉ Thứ 7, Chủ Nhật và các ngày Lễ theo quy định Nhà nước.</p>

                        <div class="section-title">IV. ĐIỀU KHOẢN CHUNG</div>
                        <p>- Người lao động cam kết bảo mật tuyệt đối thông tin kinh doanh và dữ liệu của Nhóm 21.</p>

                        <div class="footer">
                            <div><p style="font-weight: bold;">Đại diện bên A</p><div class="signature-space">(Đã ký)</div><p style="font-weight: bold;">NGUYỄN MINH NHẬT</p></div>
                            <div><p style="font-weight: bold;">Người lao động</p><div class="signature-space" style="color:#eee;">(Ký tên)</div><p style="font-weight: bold;">${selectedContract.full_name}</p></div>
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
        } catch (error) { alert("Lỗi in!"); }
    };

    return (
        <div className="p-8 bg-slate-50 min-h-screen text-left animate-in fade-in duration-700 font-sans">
            <div className="flex justify-between items-end mb-10 gap-6">
                <div>
                    <h2 className="text-4xl font-black text-slate-800 tracking-tighter italic uppercase flex items-center gap-3">
                        <FileText size={40} className="text-orange-500" /> Quản lý hợp đồng
                    </h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 italic">Nhóm 21 - HRM Intelligence System</p>
                </div>
                <button onClick={() => setIsAddModalOpen(true)} className="bg-slate-900 hover:bg-orange-500 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl flex items-center gap-2">
                    <Plus size={16} /> Thêm hợp đồng
                </button>
            </div>

            <div className="bg-white rounded-[3.5rem] shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-slate-900 text-white uppercase text-[10px] font-black tracking-widest text-center">
                            <th className="p-6 text-left">Số HĐ / Nhân viên</th>
                            <th className="p-6">Loại HĐ</th>
                            <th className="p-6">Lương cơ bản</th>
                            <th className="p-6">Trạng thái</th>
                            <th className="p-6">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {contracts.map((item) => (
                            <tr key={item.id} className="hover:bg-orange-50/50 transition-all group text-center">
                                <td className="p-6 text-left cursor-pointer" onClick={() => handleViewDetail(item.id)}>
                                    <div className="font-black text-orange-600 text-[11px] italic mb-1 uppercase tracking-widest">{item.contract_code}</div>
                                    <div className="font-black text-slate-800 uppercase italic text-sm">{item.full_name}</div>
                                    <div className="text-[10px] font-bold text-slate-400 flex items-center gap-1"><MapPin size={10} /> {item.work_location}</div>
                                </td>
                                <td className="p-6 font-black text-[10px] uppercase text-slate-500 italic">{item.contract_type}</td>
                                <td className="p-6 font-black text-slate-900 text-base">{formatVND(item.basic_salary)}</td>
                                <td className="p-6">
                                    <span className={`inline-flex items-center px-4 py-2 rounded-2xl font-black text-[10px] uppercase border ${item.status === 'Hiệu lực' ? 'text-emerald-500 bg-emerald-50 border-emerald-100' : 'text-rose-500 bg-rose-50 border-rose-100'}`}>
                                        {item.status}
                                    </span>
                                </td>
                                <td className="p-6">
                                    <button onClick={(e) => { e.stopPropagation(); setEditingContract(item); setIsEditModalOpen(true); }} className="p-3 bg-white border border-slate-100 rounded-xl hover:bg-slate-900 hover:text-white transition-all shadow-sm">
                                        <Edit3 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* MODAL THÊM MỚI (GIỮ NGUYÊN FORMAT CỦA BRO) */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex justify-center items-center p-4">
                    <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl animate-in zoom-in duration-300">
                        <div className="p-8 bg-slate-50 border-b flex justify-between items-center rounded-t-[3rem]">
                            <span className="font-black uppercase italic text-slate-800 flex items-center gap-2"><Plus className="text-orange-500" /> Ký hợp đồng mới</span>
                            <button onClick={() => setIsAddModalOpen(false)} className="bg-white text-slate-400 p-2 rounded-xl border border-slate-100"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleAddContract} className="p-10 grid grid-cols-2 gap-5 text-left text-sm">
                            <div className="col-span-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Chọn nhân viên</label>
                                <select required className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold outline-none" value={newContract.user_id} onChange={e => setNewContract({ ...newContract, user_id: e.target.value })}>
                                    <option value="">-- Click để chọn --</option>
                                    {availableEmployees.map(emp => <option key={emp.id} value={emp.id}>{emp.full_name} ({emp.position})</option>)}
                                </select>
                            </div>
                            <div className="col-span-1">
                                <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Mã hợp đồng</label>
                                <input required className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold outline-none" value={newContract.contract_code} onChange={e => setNewContract({ ...newContract, contract_code: e.target.value })} />
                            </div>
                            <div className="col-span-1">
                                <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Lương cơ bản</label>
                                <input required type="number" className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold outline-none" onChange={e => setNewContract({ ...newContract, basic_salary: e.target.value })} />
                            </div>
                            <div className="col-span-2 pt-4">
                                <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black uppercase text-xs tracking-widest hover:bg-orange-500 transition-all flex items-center justify-center gap-2 shadow-xl">
                                    <Save size={18} /> Lưu hợp đồng mới
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL CHỈNH SỬA */}
            {isEditModalOpen && editingContract && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex justify-center items-center p-4">
                    <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl animate-in zoom-in duration-300">
                        <div className="p-8 bg-slate-50 border-b flex justify-between items-center rounded-t-[3rem]">
                            <span className="font-black uppercase italic text-slate-800 flex items-center gap-2"><Edit3 className="text-orange-500" /> Chỉnh sửa: {editingContract.full_name}</span>
                            <button onClick={() => setIsEditModalOpen(false)} className="bg-white text-slate-400 p-2 rounded-xl border border-slate-100"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleUpdateContract} className="p-10 grid grid-cols-2 gap-5 text-left text-sm">
                            <div className="col-span-1">
                                <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Mã hợp đồng</label>
                                <input required className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold outline-none" value={editingContract.contract_code} onChange={e => setEditingContract({ ...editingContract, contract_code: e.target.value })} />
                            </div>
                            <div className="col-span-1">
                                <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Lương cơ bản</label>
                                <input required type="number" className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold outline-none" value={editingContract.basic_salary} onChange={e => setEditingContract({ ...editingContract, basic_salary: e.target.value })} />
                            </div>
                            <div className="col-span-2 pt-4">
                                <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black uppercase text-xs tracking-widest hover:bg-orange-500 transition-all shadow-xl flex items-center justify-center gap-2">
                                    <Save size={18} /> Lưu thay đổi hợp đồng
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL CHI TIẾT (FIXED CCCD & ADDRESS THEO DB) */}
            {isModalOpen && selectedContract && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex justify-center items-center p-4">
                    <div className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl flex flex-col animate-in zoom-in duration-300 max-h-[90vh]">
                        <div className="p-6 border-b flex justify-between items-center bg-slate-50 rounded-t-[3rem]">
                            <div className="flex items-center gap-3">
                                <ShieldCheck className="text-emerald-500" size={28} />
                                <span className="font-black uppercase italic text-slate-800">Pháp lý hợp đồng điện tử</span>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={handlePrintPDF} className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-orange-100">
                                    <Printer size={16} /> Xuất PDF
                                </button>
                                <button onClick={() => setIsModalOpen(false)} className="bg-white text-slate-400 p-2.5 rounded-2xl transition-all border border-slate-100"><X size={20} /></button>
                            </div>
                        </div>
                        <div className="p-16 bg-white overflow-y-auto text-left" ref={pdfRef}>
                            <div className="text-center mb-10">
                                <h1 className="text-lg font-bold uppercase text-black">Cộng hòa xã hội chủ nghĩa Việt Nam</h1>
                                <h2 className="text-md font-bold underline underline-offset-4 text-black uppercase">Độc lập - Tự do - Hạnh phúc</h2>
                                <h3 className="text-3xl font-black mt-10 uppercase tracking-[0.1em] text-black">Hợp đồng lao động</h3>
                                <p className="text-slate-500 font-bold mt-2 uppercase text-[10px]">Số: {selectedContract.contract_code}/N21-2026</p>
                            </div>
                            <div className="space-y-6 text-slate-800 text-[13px] leading-relaxed text-justify">
                                <p>Căn cứ quy định của Bộ luật Lao động 2019, chúng tôi gồm:</p>
                                <div className="space-y-3 bg-slate-50 p-8 rounded-[2rem] border border-slate-100 text-left">
                                    <p><strong>BÊN SỬ DỤNG LAO ĐỘNG (BÊN A):</strong> CÔNG TY QUẢN TRỊ NHÂN SỰ NHÓM 21</p>
                                    <p>Đại diện: <strong>Ông NGUYỄN MINH NHẬT</strong> - Tổng Giám Đốc</p>
                                    <hr className="border-slate-200"/>
                                    <p><strong>NGƯỜI LAO ĐỘNG (BÊN B):</strong> Ông/Bà <strong>{selectedContract.full_name}</strong></p>
                                    {/* ✅ FIX TÊN BIẾN THEO DATABASE CỦA ÔNG: identity_card & address */}
                                    <p>Số CCCD: {selectedContract.identity_card || "...................."} | Địa chỉ: {selectedContract.address || "...................."}</p>
                                </div>
                                <h4 className="font-black uppercase text-orange-600 border-b border-orange-100 inline-block">Điều 1: Công việc</h4>
                                <p>- Chức danh: <strong>{selectedContract.position}</strong> | Loại hợp đồng: <strong>{selectedContract.contract_type}</strong></p>
                                <p>- Nhiệm vụ chính: {selectedContract.job_description || "Thực hiện chuyên môn theo phân công của quản lý trực tiếp."}</p>
                                <h4 className="font-black uppercase text-orange-600 border-b border-orange-100 inline-block">Điều 2: Lương và Phụ cấp</h4>
                                <p>- Mức lương chính: <strong>{formatVND(selectedContract.basic_salary)}</strong></p>
                                <p>- Phụ cấp: Ăn trưa (${formatVND(730000)}/tháng), Gửi xe (${formatVND(100000)}/tháng).</p>
                                <p>- Hình thức: Chuyển khoản ngân hàng vào ngày 05 hàng tháng.</p>
                                <div className="grid grid-cols-2 gap-10 mt-16 text-center">
                                    <div><p className="font-black uppercase text-[11px]">Đại diện bên A</p><div className="h-20 flex items-center justify-center italic text-blue-500 text-xl font-serif">(Đã ký)</div><p className="font-black uppercase">Nguyễn Minh Nhật</p></div>
                                    <div><p className="font-black uppercase text-[11px]">Người lao động</p><div className="h-20 flex items-center justify-center italic text-slate-300 text-[11px]">(Ký tên)</div><p className="font-black uppercase">{selectedContract.full_name}</p></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Contracts;