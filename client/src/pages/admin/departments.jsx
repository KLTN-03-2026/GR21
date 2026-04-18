import React, { useEffect, useState } from 'react';
import axios from 'axios';

const PhongBan = () => {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // State Modal Xem Nhân Viên
    const [showModal, setShowModal] = useState(false);
    const [selectedDept, setSelectedDept] = useState(null);
    const [deptEmployees, setDeptEmployees] = useState([]);
    const [modalLoading, setModalLoading] = useState(false);

    // State Modal Thêm Phòng Ban
    const [showAddModal, setShowAddModal] = useState(false);
    const [newDept, setNewDept] = useState({ name: '', description: '' });

    // --- 1. THÊM STATE CHO MODAL SỬA ---
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingDept, setEditingDept] = useState({ id: '', name: '', description: '', manager_id: '' });
    const [employees, setEmployees] = useState([]); // Để chọn sếp trong dropdown sửa

    useEffect(() => {
        fetchDepartments();
        fetchEmployees(); // Lấy sẵn nhân viên để lúc sửa có cái mà chọn sếp
    }, []);

    const fetchDepartments = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/phongban');
            setDepartments(res.data);
        } catch (err) {
            console.error("Lỗi fetch:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchEmployees = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/employees');
            setEmployees(res.data);
        } catch (err) { console.error(err); }
    };

    // --- 2. HÀM XỬ LÝ XÓA ---
    const handleDelete = async (id) => {
        if (window.confirm("Bro chắc chắn muốn giải tán phòng này không? 🗑️")) {
            try {
                await axios.delete(`http://localhost:5000/api/phongban/${id}`);
                alert("Đã xóa thành công! ✅");
                fetchDepartments();
            // eslint-disable-next-line no-unused-vars
            } catch (err) {
                alert("Lỗi khi xóa ròi bro!");
            }
        }
    };

    // --- 3. HÀM XỬ LÝ SỬA ---
    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`http://localhost:5000/api/phongban/${editingDept.id}`, editingDept);
            alert("Cập nhật thành công! ✏️");
            setShowEditModal(false);
            fetchDepartments();
        // eslint-disable-next-line no-unused-vars
        } catch (err) {
            alert("Lỗi cập nhật ròi!");
        }
    };

    const filteredDepartments = departments.filter(dept => 
        dept.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (dept.manager_name && dept.manager_name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleDeptClick = async (dept) => {
        setSelectedDept(dept);
        setShowModal(true);
        setModalLoading(true);
        try {
            const res = await axios.get(`http://localhost:5000/api/phongban/${dept.id}/employees`);
            setDeptEmployees(res.data);
        // eslint-disable-next-line no-unused-vars
        } catch (err) {
            setDeptEmployees([]);
        } finally {
            setModalLoading(false);
        }
    };

    const handleAddDept = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/phongban', newDept);
            await fetchDepartments();
            setShowAddModal(false);
            setNewDept({ name: '', description: '' });
            alert("Thêm phòng ban thành công rồi bro! 🚀");
        } catch (err) {
            alert("Lỗi chèn dữ liệu: " + (err.response?.data || err.message));
        }
    };

    return (
        <div className="w-full animate-in fade-in duration-700 relative text-left">
            <div className="bg-white p-8 rounded-[3.5rem] shadow-sm border border-slate-100">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 px-4 gap-4">
                    <div>
                        <h2 className="text-3xl font-black text-slate-800 tracking-tighter italic uppercase">Quản lý phòng ban</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1 italic">Nhóm 21 - HRM Intelligence System</p>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="flex items-center gap-3 bg-slate-100 px-6 py-4 rounded-[1.5rem] border border-slate-200 focus-within:ring-2 ring-indigo-500 transition-all flex-1 md:w-80 shadow-inner">
                            <span>🔍</span>
                            <input 
                                type="text" placeholder="Tìm kiếm..." 
                                className="bg-transparent outline-none text-sm font-bold text-slate-600 w-full"
                                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button onClick={() => setShowAddModal(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-[1.5rem] font-black text-xs uppercase shadow-xl shadow-indigo-200 transition-all active:scale-95">
                            ➕ THÊM
                        </button>
                    </div>
                </div>

                <div className="overflow-hidden rounded-[2.5rem] border border-slate-50 shadow-inner bg-slate-50/30">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-900 text-white">
                                <th className="p-6 text-[10px] uppercase font-black">ID</th>
                                <th className="p-6 text-[10px] uppercase font-black">Tên đơn vị</th>
                                <th className="p-6 text-[10px] uppercase font-black">Mô tả nhiệm vụ</th>
                                <th className="p-6 text-[10px] uppercase font-black">Người đứng đầu</th>
                                <th className="p-6 text-[10px] uppercase font-black text-center">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan="5" className="p-20 text-center animate-pulse text-slate-400 font-black italic uppercase tracking-widest">Đang triệu hồi dữ liệu...</td></tr>
                            ) : filteredDepartments.map((dept) => (
                                <tr key={dept.id} className="hover:bg-white group transition-all">
                                    <td className="p-6 text-sm font-bold text-slate-300 group-hover:text-indigo-400 transition-colors">#{dept.id}</td>
                                    <td className="p-6 text-sm font-black text-slate-700 italic uppercase cursor-pointer hover:text-indigo-600 hover:translate-x-2 transition-all flex items-center gap-2" onClick={() => handleDeptClick(dept)}>
                                        <span className="opacity-0 group-hover:opacity-100 transition-opacity">👁️</span> {dept.name}
                                    </td>
                                    <td className="p-6 text-sm text-slate-500 font-medium leading-relaxed">{dept.description || "N/A"}</td>
                                    
                                    <td className="p-6">
                                        {dept.manager_name ? (
                                            <div className="flex flex-col gap-1">
                                                <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl text-[10px] font-black border border-emerald-100 shadow-sm uppercase italic w-fit">
                                                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                                                    {dept.manager_name}
                                                </div>
                                                <span className="text-[9px] font-bold text-slate-400 italic ml-2 uppercase tracking-tighter">
                                                    {dept.manager_position || "Quản lý"}
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-slate-300 text-[10px] font-bold uppercase italic tracking-widest px-4">Trống ghế sếp</span>
                                        )}
                                    </td>

                                    <td className="p-6 text-center">
                                        <div className="flex justify-center gap-3">
                                            {/* GÁN HÀM SỬA */}
                                            <button onClick={() => { setEditingDept({ id: dept.id, name: dept.name, description: dept.description, manager_id: dept.manager_id || '' }); setShowEditModal(true); }} className="bg-slate-100 hover:bg-indigo-100 text-indigo-600 p-3 rounded-xl transition-all active:scale-90">✏️</button>
                                            {/* GÁN HÀM XÓA */}
                                            <button onClick={() => handleDelete(dept.id)} className="bg-slate-100 hover:bg-rose-100 text-rose-600 p-3 rounded-xl transition-all active:scale-90">🗑️</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL SỬA PHÒNG BAN (MỚI THÊM) */}
            {showEditModal && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in zoom-in duration-200">
                    <div className="bg-white w-full max-w-lg rounded-[3rem] p-10 shadow-2xl border border-white text-left">
                        <h3 className="text-2xl font-black uppercase italic text-slate-800 mb-8 tracking-tighter text-left">✏️ Cập nhật đơn vị</h3>
                        <form onSubmit={handleEditSubmit} className="space-y-6">
                            <input 
                                type="text" required placeholder="Tên phòng ban..."
                                className="w-full bg-slate-50 border border-slate-200 p-5 rounded-[1.5rem] outline-none focus:ring-2 ring-indigo-500 font-bold transition-all shadow-inner"
                                value={editingDept.name} onChange={(e) => setEditingDept({...editingDept, name: e.target.value})}
                            />
                            <textarea 
                                placeholder="Mô tả nhiệm vụ..."
                                className="w-full bg-slate-50 border border-slate-200 p-5 rounded-[1.5rem] h-32 font-bold outline-none focus:ring-2 ring-indigo-500 transition-all shadow-inner resize-none"
                                value={editingDept.description} onChange={(e) => setEditingDept({...editingDept, description: e.target.value})}
                            />
                            <select 
                                className="w-full bg-slate-50 border border-slate-200 p-5 rounded-[1.5rem] font-bold outline-none focus:ring-2 ring-indigo-500 shadow-inner appearance-none"
                                value={editingDept.manager_id} onChange={(e) => setEditingDept({...editingDept, manager_id: e.target.value})}
                            >
                                <option value="">-- Chọn trưởng phòng --</option>
                                {employees.map(emp => (
                                    <option key={emp.id} value={emp.id}>{emp.full_name}</option>
                                ))}
                            </select>
                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 bg-slate-100 text-slate-500 py-5 rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 transition-all">Hủy</button>
                                <button type="submit" className="flex-1 bg-slate-900 text-white py-5 rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-indigo-600 transition-all">Lưu</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL THÊM VÀ XEM GIỮ NGUYÊN... */}
            {/* [Giữ nguyên phần code Modal Thêm và Modal Xem của bro ở dưới này] */}
            {showAddModal && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in zoom-in duration-200">
                    <div className="bg-white w-full max-w-lg rounded-[3rem] p-10 shadow-2xl border border-white">
                        <h3 className="text-2xl font-black uppercase italic text-slate-800 mb-8 tracking-tighter text-left">➕ Tạo đơn vị mới</h3>
                        <form onSubmit={handleAddDept} className="space-y-6">
                            <input 
                                type="text" required placeholder="Tên phòng ban..."
                                className="w-full bg-slate-50 border border-slate-200 p-5 rounded-[1.5rem] outline-none focus:ring-2 ring-indigo-500 font-bold transition-all shadow-inner"
                                value={newDept.name} onChange={(e) => setNewDept({...newDept, name: e.target.value})}
                            />
                            <textarea 
                                placeholder="Mô tả nhiệm vụ..."
                                className="w-full bg-slate-50 border border-slate-200 p-5 rounded-[1.5rem] h-32 font-bold outline-none focus:ring-2 ring-indigo-500 transition-all shadow-inner resize-none"
                                value={newDept.description} onChange={(e) => setNewDept({...newDept, description: e.target.value})}
                            />
                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 bg-slate-100 text-slate-500 py-5 rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 transition-all">Hủy</button>
                                <button type="submit" className="flex-1 bg-indigo-600 text-white py-5 rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all">Lưu</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in zoom-in duration-300">
                    <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden border border-white">
                        <div className="p-10 bg-gradient-to-br from-indigo-600 to-violet-700 text-white flex justify-between items-center">
                            <div className="text-left">
                                <h3 className="text-2xl font-black uppercase italic tracking-tighter">Thành viên: {selectedDept?.name}</h3>
                                <p className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest mt-1">Dữ liệu nhân sự thời gian thực</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="bg-white/10 hover:bg-white/20 px-6 py-3 rounded-2xl transition-all font-black uppercase text-[10px] tracking-widest border border-white/20">Đóng ✕</button>
                        </div>
                        <div className="p-8 max-h-[60vh] overflow-y-auto bg-slate-50/50">
                            {modalLoading ? (
                                <div className="py-20 text-center animate-pulse font-black text-slate-400 uppercase italic">Đang lọc danh sách...</div>
                            ) : deptEmployees.length > 0 ? (
                                <div className="grid gap-4">
                                    {deptEmployees.map(emp => (
                                        <div key={emp.id} className="flex items-center justify-between p-6 bg-white rounded-[2rem] shadow-sm border border-slate-100 hover:scale-[1.02] transition-all group/item shadow-inner">
                                            <div className="flex items-center gap-4 text-left">
                                                <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black text-lg group-hover/item:bg-indigo-600 transition-colors italic">
                                                    {emp.full_name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-800 uppercase italic text-sm">{emp.full_name}</p>
                                                    <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mt-0.5 px-2 py-0.5 bg-indigo-50 rounded-lg inline-block">
                                                        {emp.position || "Nhân viên"}
                                                    </p>
                                                    <p className="text-[9px] font-medium text-slate-400 italic uppercase block mt-1">{emp.email}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-tighter mb-1">Phone</p>
                                                <p className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-lg italic">{emp.phone}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-20 text-center">
                                    <span className="text-7xl mb-4 block animate-bounce">🏜️</span>
                                    <p className="font-black text-slate-300 uppercase italic tracking-[0.2em]">Trống trơn bro ơi!</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PhongBan;