import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { 
    Fingerprint, Plus, Calendar, Clock, CheckCircle, 
    AlertTriangle, Save, X, Users, ChevronRight, UserX, Edit3
} from 'lucide-react';

const ManagerAttendance = () => {
    const [attendanceList, setAttendanceList] = useState([]);
    const [myEmployees, setMyEmployees] = useState([]);
    const [stats, setStats] = useState({ total: 0, present: 0, on_time: 0, late: 0, absent: 0 });
    const [deptName, setDeptName] = useState("");
    const [loading, setLoading] = useState(true);

    const manager = JSON.parse(localStorage.getItem('user'));
    const managerId = manager?.id;

    const [filters, setFilters] = useState({
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        status: 'all'
    });

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

    const fetchMyEmployees = useCallback(async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/employees`);
            // Lấy nhân viên cùng phòng ban của manager
            const teamOnly = res.data.filter(emp => Number(emp.dep_id) === Number(manager?.dep_id));
            setMyEmployees(teamOnly);
        } catch (err) { console.error("Lỗi lấy nhân viên team:", err); }
    }, [manager?.dep_id]);

    const fetchAttendanceData = useCallback(async () => {
        if (!managerId) return;
        setLoading(true);
        try {
            const { startDate, endDate, status } = filters;
            const res = await axios.get(`http://localhost:5000/api/manager/attendances/my-team-attendance/${managerId}`, {
                params: { startDate, endDate, status }
            });
            setAttendanceList(res.data.attendanceData || []);
            setStats(res.data.stats || { total: 0, present: 0, on_time: 0, late: 0, absent: 0 });
            setDeptName(res.data.department || "");
        } catch (err) { console.error("Lỗi lấy chấm công:", err); } 
        finally { setLoading(false); }
    }, [managerId, filters]);

    useEffect(() => {
        fetchMyEmployees();
        fetchAttendanceData();
    }, [fetchMyEmployees, fetchAttendanceData]);

    const handleEdit = (item) => {
    setIsEditing(true);
    setEditId(item.id);

    // FIX LỖI LỆCH NGÀY: Tạo đối tượng Date và bóc tách thủ công
    const d = new Date(item.date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;

    setNewRecord({
        emp_id: item.emp_id,
        date: formattedDate, // Giờ nó là "2026-04-28" chuẩn theo giờ máy tính bro
        check_in: item.check_in || '08:00',
        check_out: item.check_out || '17:00',
        status: item.status
    });
    setShowAddModal(true);
};

    const handleStatusChangeInModal = (val) => {
        if (val === 'absent') {
            setNewRecord({ ...newRecord, status: val, check_in: null, check_out: null });
        } else {
            setNewRecord({ ...newRecord, status: val, check_in: '08:00', check_out: '17:00' });
        }
    };

    const handleTimeChange = (type, value) => {
        if (type === 'check_in') {
            const [hour, minute] = value.split(':').map(Number);
            const isLate = hour > 8 || (hour === 8 && minute > 0);
            setNewRecord({ ...newRecord, check_in: value, status: isLate ? 'late' : 'present' });
        } else {
            setNewRecord({ ...newRecord, [type]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                const res = await axios.put(`http://localhost:5000/api/manager/attendances/${editId}`, newRecord);
                alert("✅ " + res.data.message);
            } else {
                const res = await axios.post('http://localhost:5000/api/manager/attendances', newRecord);
                alert("🔥 " + res.data.message);
            }
            setShowAddModal(false);
            setIsEditing(false);
            fetchAttendanceData(); 
        } catch (err) {
            alert("❌ Lỗi: " + (err.response?.data?.message || "Thao tác thất bại"));
        }
    };

    return (
        <div className="p-8 bg-[#f8fafc] min-h-screen text-left font-sans animate-in fade-in duration-500">
            {/* Header Area */}
            <div className="mb-10 flex flex-col xl:flex-row justify-between items-start gap-8">
                <div>
                    <h2 className="text-4xl font-black text-slate-800 tracking-tighter italic uppercase flex items-center gap-3">
                        <div className="p-2 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-100">
                            <Fingerprint size={32} />
                        </div>
                        Chấm công: {deptName || "..."}
                    </h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2 italic">Nhóm 21 - Manager Control Panel</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full xl:w-auto">
                    <StatBox label="Đúng giờ" value={stats.on_time} color="text-emerald-500" icon={<CheckCircle size={14}/>} />
                    <StatBox label="Đi muộn" value={stats.late} color="text-amber-500" icon={<AlertTriangle size={14}/>} />
                    <StatBox label="Vắng mặt" value={stats.absent} color="text-rose-500" icon={<UserX size={14}/>} />
                    <StatBox label="Team Size" value={stats.total} color="text-indigo-500" icon={<Users size={14}/>} />
                </div>
            </div>

            {/* Filter Toolbar */}
            <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 mb-8 flex flex-wrap items-center justify-between gap-6">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                        <Calendar size={16} className="text-slate-400" />
                        <input type="date" className="bg-transparent outline-none font-bold text-xs text-slate-600 cursor-pointer" value={filters.startDate} onChange={e => setFilters({...filters, startDate: e.target.value})} />
                        <ChevronRight size={12} className="text-slate-300 font-black" />
                        <input type="date" className="bg-transparent outline-none font-bold text-xs text-slate-600 cursor-pointer" value={filters.endDate} onChange={e => setFilters({...filters, endDate: e.target.value})} />
                    </div>

                    <select className="bg-slate-50 px-6 py-2.5 rounded-xl border border-slate-100 font-black text-[10px] uppercase outline-none text-slate-500" value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})}>
                        <option value="all">Tất cả trạng thái</option>
                        <option value="present">Đúng giờ</option>
                        <option value="late">Đi muộn</option>
                        <option value="absent">Vắng mặt</option>
                    </select>
                </div>

                <button onClick={() => { setIsEditing(false); setShowAddModal(true); }} className="bg-slate-900 text-white px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all flex items-center gap-2">
                    <Plus size={16} /> Ghi nhận công Team
                </button>
            </div>

            {/* Attendance Table */}
            <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-left font-sans border-collapse">
                    <thead className="bg-slate-900 text-white uppercase text-[10px] font-black tracking-widest italic">
                        <tr>
                            <th className="p-8">Nhân viên</th>
                            <th className="p-8">Ngày</th>
                            <th className="p-8 text-center">Giờ vào</th>
                            <th className="p-8 text-center">Trạng thái</th>
                            <th className="p-8 text-center">Sửa</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {loading ? (
                            <tr><td colSpan="5" className="p-20 text-center animate-pulse font-black text-slate-200 uppercase italic">Đang đồng bộ team...</td></tr>
                        ) : attendanceList.map(item => (
                            <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="p-8 border-none">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-black group-hover:bg-indigo-600 italic">
                                            {item.full_name?.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-black text-slate-700 text-sm uppercase italic leading-none">{item.full_name}</p>
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{item.position}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-8 font-bold text-slate-500 text-sm italic border-none">{new Date(item.date).toLocaleDateString('vi-VN')}</td>
                                <td className="p-8 text-center border-none">
                                    <span className="px-4 py-2 bg-slate-50 rounded-lg font-black text-xs text-indigo-600 border border-slate-100 shadow-sm">
                                        {item.status === 'absent' ? '--:--' : item.check_in}
                                    </span>
                                </td>
                                <td className="p-8 text-center border-none">
                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                                        item.status === 'present' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                                        item.status === 'late' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                                        'bg-rose-50 text-rose-600 border-rose-100'
                                    }`}>
                                        {item.status === 'present' ? 'Đúng giờ' : item.status === 'late' ? 'Đi muộn' : 'Vắng mặt'}
                                    </span>
                                </td>
                                <td className="p-8 text-center border-none">
                                    <button onClick={() => handleEdit(item)} className="p-2 text-slate-400 hover:text-indigo-600 transition-all bg-slate-50 rounded-xl group-hover:bg-indigo-50">
                                        <Edit3 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal - ĐÃ FIX FILTER DROPDOWN */}
            {showAddModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                    <div className="bg-white w-full max-w-xl rounded-[3rem] p-10 shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="flex justify-between items-center mb-8 border-b border-slate-50 pb-6">
                            <h3 className="text-2xl font-black uppercase italic flex items-center gap-3"><Fingerprint className="text-indigo-600"/> {isEditing ? "Chỉnh sửa công" : "Điểm danh Team"}</h3>
                            <button onClick={() => setShowAddModal(false)} className="p-2 text-slate-300 hover:text-slate-900 transition-colors"><X size={24}/></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-2 mb-2 block tracking-widest italic">Thành viên phòng ban</label>
                                <select 
                                    required 
                                    disabled={isEditing} 
                                    className="w-full bg-slate-50 p-4 rounded-2xl font-bold border border-slate-100 outline-none text-sm appearance-none cursor-pointer focus:ring-2 focus:ring-indigo-500/20" 
                                    value={newRecord.emp_id} 
                                    onChange={e => setNewRecord({...newRecord, emp_id: e.target.value})}
                                >
                                    <option value="">-- Chọn nhân viên để chấm công --</option>
                                    
                                    {/* FIX: Filter loại bỏ chính Manager ra khỏi danh sách */}
                                    {myEmployees
                                        .filter(emp => Number(emp.id) !== Number(managerId)) 
                                        .map(e => (
                                            <option key={e.id} value={e.id}>
                                                {e.full_name} - {e.position}
                                            </option>
                                        ))
                                    }
                                </select>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2 mb-2 block tracking-widest">Ngày chấm</label>
                                    <input type="date" required disabled={isEditing} className="w-full bg-slate-50 p-4 rounded-2xl font-bold border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-500/20" value={newRecord.date} onChange={e => setNewRecord({...newRecord, date: e.target.value})} />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2 mb-2 block text-center tracking-widest italic">Trạng thái</label>
                                    <select className="w-full bg-slate-50 p-4 rounded-2xl font-black text-[10px] uppercase border border-slate-100 outline-none cursor-pointer focus:ring-2 focus:ring-indigo-500/20" value={newRecord.status} onChange={e => handleStatusChangeInModal(e.target.value)}>
                                        <option value="present">✅ Đúng giờ</option>
                                        <option value="late">⚠️ Đi muộn</option>
                                        <option value="absent">❌ Vắng mặt</option>
                                    </select>
                                </div>
                            </div>
                            
                            {newRecord.status !== 'absent' && (
                                <div className="grid grid-cols-2 gap-6 animate-in slide-in-from-top duration-300">
                                    <div>
                                        <label className="text-[10px] font-black uppercase text-slate-400 ml-2 mb-2 block tracking-widest">Giờ vào</label>
                                        <input type="time" required className="w-full bg-slate-50 p-4 rounded-2xl font-bold border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-500/20" value={newRecord.check_in} onChange={e => handleTimeChange('check_in', e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase text-slate-400 ml-2 mb-2 block tracking-widest">Giờ ra</label>
                                        <input type="time" className="w-full bg-slate-50 p-4 rounded-2xl font-bold border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-500/20" value={newRecord.check_out} onChange={e => handleTimeChange('check_out', e.target.value)} />
                                    </div>
                                </div>
                            )}
                            
                            <button type="submit" className="w-full bg-slate-900 text-white py-6 rounded-[2.5rem] font-black uppercase text-xs tracking-[0.4em] hover:bg-indigo-600 transition-all shadow-2xl flex items-center justify-center gap-3 mt-4 active:scale-95 duration-200">
                                <Save size={20}/> {isEditing ? "CẬP NHẬT DỮ LIỆU" : "XÁC NHẬN GHI CÔNG"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const StatBox = ({ label, value, color, icon }) => (
    <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col items-center justify-center group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
        <span className={`flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.1em] mb-2 ${color} opacity-70 group-hover:opacity-100`}>
            {icon} {label}
        </span>
        <p className={`text-3xl font-black italic tracking-tighter ${color}`}>{value}</p>
    </div>
);

export default ManagerAttendance;