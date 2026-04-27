import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { 
    Fingerprint, Search, Filter, Plus, Calendar, 
    Clock, CheckCircle, AlertTriangle, UserX, Save, X, Edit3 
} from 'lucide-react';

const AttendanceAdmin = () => {
    const [data, setData] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [stats, setStats] = useState({ total: 0, present: 0, late: 0, absent: 0 });
    const [loading, setLoading] = useState(true);

    const [filters, setFilters] = useState({
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        dep_id: 'all',
        status: 'all' 
    });

    // States cho Modal
    const [showAddModal, setShowAddModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    
    const [newRecord, setNewRecord] = useState({
        emp_id: '',
        date: new Date().toISOString().split('T')[0],
        check_in: '08:00',
        check_out: '17:00',
        status: 'present'
    });

    const fetchInitialData = async () => {
        try {
            const [empRes, depRes] = await Promise.all([
                axios.get('http://localhost:5000/api/employees'),
                axios.get('http://localhost:5000/api/phongban')
            ]);
            setEmployees(empRes.data);
            setDepartments(depRes.data);
        } catch (err) { console.error("Lỗi fetch data:", err); }
    };

    const fetchAttendance = useCallback(async () => {
        setLoading(true);
        try {
            const { startDate, endDate, dep_id, status } = filters;
            const [listRes, statsRes] = await Promise.all([
                axios.get(`http://localhost:5000/api/admin/attendance`, { 
                    params: { startDate, endDate, dep_id, status } 
                }),
                axios.get(`http://localhost:5000/api/admin/attendance/stats`, { 
                    params: { startDate, endDate } 
                })
            ]);
            setData(listRes.data);
            setStats(statsRes.data);
        } catch (err) { console.error("Lỗi lấy dữ liệu:", err); } 
        finally { setLoading(false); }
    }, [filters]);

    useEffect(() => {
        fetchInitialData();
        fetchAttendance();
    }, [fetchAttendance]);

    // Mở modal sửa
    const handleEdit = (item) => {
        setIsEditing(true);
        setEditId(item.id);
        setNewRecord({
            emp_id: item.emp_id,
            date: item.date.split('T')[0],
            check_in: item.check_in || '08:00',
            check_out: item.check_out || '17:00',
            status: item.status
        });
        setShowAddModal(true);
    };

    const handleTimeChange = (type, value) => {
        if (newRecord.status === 'absent') return; // Nếu vắng thì không quan tâm giờ
        
        if (type === 'check_in') {
            const [hour, minute] = value.split(':').map(Number);
            const status = (hour * 60 + minute) > 480 ? 'late' : 'present';
            setNewRecord(prev => ({ ...prev, check_in: value, status }));
        } else {
            setNewRecord(prev => ({ ...prev, [type]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                const res = await axios.put(`http://localhost:5000/api/admin/attendance/${editId}`, newRecord);
                alert("✅ " + res.data.message);
            } else {
                const res = await axios.post('http://localhost:5000/api/admin/attendance', newRecord);
                alert("🔥 " + res.data.message);
            }
            setShowAddModal(false);
            setIsEditing(false);
            fetchAttendance();
        } catch (err) { 
            alert("Lỗi: " + (err.response?.data?.message || err.message)); 
        }
    };

    const managersOnly = employees.filter(emp => 
        departments.some(dept => dept.manager_id === emp.id)
    );

    return (
        <div className="p-8 bg-slate-50 min-h-screen text-left font-sans animate-in fade-in duration-700">
            {/* Header & Stats y hệt như cũ, tui giữ nguyên nhé */}
            <div className="mb-10 flex flex-col xl:flex-row justify-between items-start gap-8">
                <div>
                    <h2 className="text-4xl font-black text-slate-800 tracking-tighter italic uppercase flex items-center gap-3">
                        <Fingerprint size={40} className="text-indigo-600" /> Quản trị chấm công
                    </h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1 italic">Nhóm 21 - Quản lý sếp</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full xl:w-auto">
                    {[
                        { label: 'Đúng giờ', value: stats.present, color: 'text-emerald-500', icon: <CheckCircle size={14}/> },
                        { label: 'Đi muộn', value: stats.late, color: 'text-amber-500', icon: <AlertTriangle size={14}/> },
                        { label: 'Vắng mặt', value: stats.absent, color: 'text-rose-500', icon: <UserX size={14}/> },
                        { label: 'Tổng số sếp', value: stats.total, color: 'text-indigo-500', icon: <Calendar size={14}/> },
                    ].map((s, i) => (
                        <div key={i} className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm min-w-[140px]">
                            <span className="flex items-center gap-2 text-[9px] font-black uppercase text-slate-400 tracking-widest">{s.icon} {s.label}</span>
                            <p className={`text-2xl font-black italic mt-1 ${s.color}`}>{s.value}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Toolbar - Có thêm bộ lọc Trạng thái */}
            <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 mb-8 flex flex-wrap items-center justify-between gap-6">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                        <Calendar size={16} className="text-slate-400" />
                        <input type="date" className="bg-transparent outline-none font-bold text-xs text-slate-600" value={filters.startDate} onChange={e => setFilters({...filters, startDate: e.target.value})} />
                        <span className="text-slate-300 font-black">→</span>
                        <input type="date" className="bg-transparent outline-none font-bold text-xs text-slate-600" value={filters.endDate} onChange={e => setFilters({...filters, endDate: e.target.value})} />
                    </div>

                    <select className="bg-slate-50 px-6 py-2.5 rounded-xl border border-slate-100 font-black text-[10px] uppercase outline-none text-slate-500" value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})}>
                        <option value="all">Tất cả trạng thái</option>
                        <option value="present">Đúng giờ</option>
                        <option value="late">Đi muộn</option>
                        <option value="absent">Vắng mặt</option>
                    </select>
                </div>

                <button onClick={() => { setIsEditing(false); setNewRecord({emp_id: '', date: new Date().toISOString().split('T')[0], check_in: '08:00', check_out: '17:00', status: 'present'}); setShowAddModal(true); }} className="bg-slate-900 text-white px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all flex items-center gap-2">
                    <Plus size={16} /> Chấm công sếp
                </button>
            </div>

            {/* Table - Thêm nút Sửa */}
            <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50/50">
                        <tr>
                            <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Trưởng phòng</th>
                            <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ngày chấm</th>
                            <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Giờ vào</th>
                            <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Trạng thái</th>
                            <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 font-sans">
                        {loading ? (
                            <tr><td colSpan="5" className="p-20 text-center font-black text-slate-200 animate-pulse italic">Đang lọc dữ liệu...</td></tr>
                        ) : data.map(item => (
                            <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="p-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-black group-hover:bg-indigo-600 uppercase italic">
                                            {item.full_name?.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-black text-slate-700 text-sm uppercase italic">{item.full_name}</p>
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{item.department_name} • Manager</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-8 font-bold text-slate-500 text-sm italic">{new Date(item.date).toLocaleDateString('vi-VN')}</td>
                                <td className="p-8 text-center">
                                    <span className="px-4 py-2 bg-slate-50 rounded-lg font-black text-xs text-indigo-600">{item.status === 'absent' ? '--:--' : item.check_in}</span>
                                </td>
                                <td className="p-8 text-center">
                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                                        item.status === 'present' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                                        item.status === 'late' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                                    }`}>
                                        {item.status === 'present' ? 'Đúng giờ' : item.status === 'late' ? 'Đi muộn' : 'Vắng mặt'}
                                    </span>
                                </td>
                                <td className="p-8 text-center">
                                    <button onClick={() => handleEdit(item)} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
                                        <Edit3 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal nâng cấp */}
            {showAddModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                    <div className="bg-white w-full max-w-xl rounded-[3rem] p-10 shadow-2xl">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-2xl font-black uppercase italic flex items-center gap-3">
                                <Fingerprint className="text-indigo-600"/> {isEditing ? "Cập nhật chấm công" : "Ghi nhận chấm công"}
                            </h3>
                            <button onClick={() => setShowAddModal(false)} className="p-2 text-slate-400"><X size={24}/></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-2 mb-2 block tracking-widest italic">Chọn Trưởng phòng</label>
                                <select required disabled={isEditing} className="w-full bg-slate-50 p-4 rounded-2xl font-bold border border-slate-100 outline-none text-sm" value={newRecord.emp_id} onChange={e => setNewRecord({...newRecord, emp_id: e.target.value})}>
                                    <option value="">-- Danh sách Managers --</option>
                                    {managersOnly.map(e => <option key={e.id} value={e.id}>{e.full_name} ({e.position})</option>)}
                                </select>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2 mb-2 block tracking-widest italic">Ngày</label>
                                    <input type="date" required disabled={isEditing} className="w-full bg-slate-50 p-4 rounded-2xl font-bold border border-slate-100 text-sm" value={newRecord.date} onChange={e => setNewRecord({...newRecord, date: e.target.value})} />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2 mb-2 block tracking-widest italic text-center">Trạng thái</label>
                                    <select className={`w-full p-4 rounded-2xl font-black text-[10px] uppercase border outline-none cursor-pointer ${
                                        newRecord.status === 'present' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                                        newRecord.status === 'late' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                                    }`} value={newRecord.status} onChange={e => setNewRecord({...newRecord, status: e.target.value})}>
                                        <option value="present">✅ Đúng giờ</option>
                                        <option value="late">⚠️ Đi muộn</option>
                                        <option value="absent">❌ Vắng mặt</option>
                                    </select>
                                </div>
                            </div>

                            {newRecord.status !== 'absent' && (
                                <div className="grid grid-cols-2 gap-6 animate-in slide-in-from-top duration-300">
                                    <div>
                                        <label className="text-[10px] font-black uppercase text-slate-400 ml-2 mb-2 block tracking-widest italic">Giờ vào</label>
                                        <input type="time" required className="w-full bg-slate-50 p-4 rounded-2xl font-bold border border-slate-100" value={newRecord.check_in} onChange={e => handleTimeChange('check_in', e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase text-slate-400 ml-2 mb-2 block tracking-widest italic">Giờ ra</label>
                                        <input type="time" className="w-full bg-slate-50 p-4 rounded-2xl font-bold border border-slate-100" value={newRecord.check_out} onChange={e => handleTimeChange('check_out', e.target.value)} />
                                    </div>
                                </div>
                            )}

                            <button type="submit" className="w-full bg-slate-900 text-white py-6 rounded-[2.5rem] font-black uppercase text-xs tracking-[0.4em] hover:bg-indigo-600 transition-all shadow-2xl flex items-center justify-center gap-3 mt-4">
                                <Save size={20}/> {isEditing ? "CẬP NHẬT DỮ LIỆU" : "XÁC NHẬN CHẤM CÔNG"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AttendanceAdmin;