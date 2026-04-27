import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { UserPlus, Search, Edit3, Trash2, Mail, Phone, MapPin, CreditCard, Calendar, User, Briefcase, Lock, X, Save } from 'lucide-react';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [newEmp, setNewEmp] = useState({
    full_name: '', email: '', phone: '', dep_id: '', position: '', 
    username: '', password: '', role: 'employee',
    dob: '', gender: 'Nam', address: '', identity_card: '',
    bank_account: '', bank_name: ''
  });

  const [editingEmp, setEditingEmp] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [empRes, deptRes] = await Promise.all([
        axios.get('http://localhost:5000/api/employees'),
        axios.get('http://localhost:5000/api/phongban')
      ]);
      setEmployees(empRes.data);
      setDepartments(deptRes.data);
    } catch (err) {
      console.error("Lỗi quét dữ liệu:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/employees', newEmp);
      alert(res.data.message || "Đã chiêu mộ nhân tài thành công! 🚀");
      setShowAddModal(false);
      setNewEmp({ 
        full_name: '', email: '', phone: '', dep_id: '', position: '', 
        username: '', password: '', role: 'employee',
        dob: '', gender: 'Nam', address: '', identity_card: '',
        bank_account: '', bank_name: '' 
      });
      fetchData();
    } catch (err) {
      alert("Lỗi thêm: " + (err.response?.data || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bro có chắc muốn cho nhân viên này 'bay màu' không?")) {
      try {
        await axios.delete(`http://localhost:5000/api/employees/${id}`);
        fetchData();
        alert("Xóa thành công!");
      } catch (err) {
        alert("Lỗi xóa: " + err.message);
      }
    }
  };

  // 🔥 HÀM CẬP NHẬT CHUẨN
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
        // Format lại ngày sinh về YYYY-MM-DD để SQL không báo lỗi 500
        const payload = {
            ...editingEmp,
            dob: editingEmp.dob ? editingEmp.dob.split('T')[0] : null
        };
        const res = await axios.put(`http://localhost:5000/api/employees/${editingEmp.id}`, payload);
        alert(res.data.message || "Cập nhật thành công! ✅");
        setShowEditModal(false);
        fetchData();
    } catch (err) {
        console.error("Lỗi update:", err.response?.data);
        alert("Lỗi update: " + (err.response?.data || err.message));
    }
  };

  const filteredEmployees = employees.filter(emp => 
    emp.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    emp.id?.toString().includes(searchTerm)
  );

  if (loading) return <div className="p-20 text-center font-black text-slate-300 animate-pulse uppercase tracking-[0.3em]">Hệ thống đang quét dữ liệu...</div>;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 p-6 text-left">
      <div className="bg-white rounded-[3.5rem] shadow-xl border border-slate-100 overflow-hidden">
        
        {/* --- HEADER --- */}
        <div className="p-10 flex flex-col lg:flex-row justify-between items-center border-b border-slate-50 bg-white sticky top-0 z-10 gap-6">
          <div className="text-left w-full lg:w-auto">
            <h2 className="text-3xl font-black text-slate-800 uppercase italic tracking-tighter">👥 Hồ sơ nhân sự</h2>
            <p className="text-slate-400 font-bold text-xs mt-1 uppercase tracking-widest italic">Nhóm 21 - HRM Intelligence</p>
          </div>

          <div className="relative w-full lg:w-96 group">
            <span className="absolute inset-y-0 left-5 flex items-center text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                <Search size={18} />
            </span>
            <input 
              type="text" 
              placeholder="Tìm tên hoặc mã nhân viên..." 
              className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-transparent rounded-[2rem] outline-none focus:bg-white focus:ring-2 ring-indigo-500 transition-all shadow-inner font-bold text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button 
            onClick={() => setShowAddModal(true)}
            className="w-full lg:w-auto bg-indigo-600 text-white px-10 py-5 rounded-[2rem] font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <UserPlus size={20} /> THÊM NHÂN VIÊN
          </button>
        </div>

        {/* --- BẢNG DỮ LIỆU --- */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Nhân viên</th>
                <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Đơn vị & Chức vụ</th>
                <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Liên hệ</th>
                <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Ngày gia nhập</th>
                <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 font-sans">
              {filteredEmployees.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50/20 transition-all group">
                  <td className="p-8 text-left">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 bg-slate-900 rounded-[1.5rem] flex items-center justify-center text-white font-black text-xl shadow-lg group-hover:bg-indigo-600 transition-colors italic">
                        {emp.full_name?.charAt(0)}
                      </div>
                      <div>
                        <span className="block font-black text-slate-800 text-lg leading-none uppercase italic">{emp.full_name}</span>
                        <span className="text-[10px] font-bold text-slate-300 uppercase mt-1 inline-block tracking-tighter">Mã: #{emp.id} - {emp.gender}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-8 text-left">
                    <div className="flex flex-col gap-1">
                        <span className="px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-indigo-100 w-fit">
                            {emp.department_name || 'Phòng ban mới'}
                        </span>
                        <span className="text-[11px] font-bold text-slate-400 italic ml-1">{emp.position}</span>
                    </div>
                  </td>
                  <td className="p-8 text-left">
                    <div className="flex flex-col">
                      <span className="font-black text-slate-700 text-sm italic flex items-center gap-1"><Phone size={12}/> {emp.phone}</span>
                      <span className="text-slate-400 text-[11px] font-bold flex items-center gap-1"><Mail size={12}/> {emp.email}</span>
                    </div>
                  </td>
                  <td className="p-8 font-black text-slate-400 text-sm italic">
                    {emp.join_date ? new Date(emp.join_date).toLocaleDateString('vi-VN') : '---'}
                  </td>
                  <td className="p-8 text-center">
                    <div className="flex justify-center gap-2">
                       <button onClick={() => {setEditingEmp(emp); setShowEditModal(true);}} className="p-3 bg-white border border-slate-100 rounded-xl hover:bg-slate-900 hover:text-white transition-all shadow-sm"><Edit3 size={16}/></button>
                       <button onClick={() => handleDelete(emp.id)} className="p-3 bg-white border border-slate-100 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-sm"><Trash2 size={16}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODAL THÊM MỚI --- */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-300 text-left">
          <div className="bg-white w-full max-w-4xl rounded-[3rem] p-10 shadow-2xl overflow-y-auto max-h-[95vh] border border-slate-100">
            <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black uppercase italic flex items-center gap-3"><UserPlus className="text-indigo-600"/> Chiêu mộ nhân tài mới</h3>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-all text-slate-400"><X size={24}/></button>
            </div>
            
            <form onSubmit={handleAddSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="bg-slate-50 p-6 rounded-[2.5rem] space-y-4 border border-slate-100 text-left">
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2 flex items-center gap-2"><User size={12}/> 1. Thông tin cá nhân</p>
                    <div>
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-2 mb-1 block">Họ và tên</label>
                        <input required className="w-full bg-white p-4 rounded-xl font-bold outline-none border border-slate-100 text-sm" value={newEmp.full_name} onChange={(e) => setNewEmp({...newEmp, full_name: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-black uppercase text-slate-400 ml-2 mb-1 block">Ngày sinh</label>
                            <input type="date" required className="w-full bg-white p-4 rounded-xl font-bold outline-none border border-slate-100 text-sm" onChange={(e) => setNewEmp({...newEmp, dob: e.target.value})} />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase text-slate-400 ml-2 mb-1 block">Giới tính</label>
                            <select className="w-full bg-white p-4 rounded-xl font-bold outline-none border border-slate-100 text-sm" onChange={(e) => setNewEmp({...newEmp, gender: e.target.value})}>
                                <option value="Nam">Nam</option><option value="Nữ">Nữ</option><option value="Khác">Khác</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-2 mb-1 block">Số CCCD / Email cá nhân</label>
                        <div className="grid grid-cols-2 gap-4">
                            <input placeholder="Số CCCD" required className="w-full bg-white p-4 rounded-xl font-bold outline-none border border-slate-100 text-sm" onChange={(e) => setNewEmp({...newEmp, identity_card: e.target.value})} />
                            <input placeholder="Email cá nhân" required type="email" className="w-full bg-white p-4 rounded-xl font-bold outline-none border border-slate-100 text-sm" value={newEmp.email} onChange={(e) => setNewEmp({...newEmp, email: e.target.value})} />
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-2 mb-1 block">Số điện thoại / Địa chỉ</label>
                        <div className="grid grid-cols-2 gap-4">
                            <input placeholder="Số điện thoại" required className="w-full bg-white p-4 rounded-xl font-bold outline-none border border-slate-100 text-sm" value={newEmp.phone} onChange={(e) => setNewEmp({...newEmp, phone: e.target.value})} />
                            <input placeholder="Địa chỉ thường trú" required className="w-full bg-white p-4 rounded-xl font-bold outline-none border border-slate-100 text-sm" onChange={(e) => setNewEmp({...newEmp, address: e.target.value})} />
                        </div>
                    </div>
                </div>
                <div className="bg-emerald-50/50 p-6 rounded-[2.5rem] space-y-4 border border-emerald-100">
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2"><CreditCard size={12}/> 2. Tài khoản ngân hàng</p>
                    <div className="grid grid-cols-2 gap-4">
                        <input placeholder="Số tài khoản" required className="w-full bg-white p-4 rounded-xl font-bold outline-none border border-emerald-100 text-sm" onChange={(e) => setNewEmp({...newEmp, bank_account: e.target.value})} />
                        <input placeholder="Tên ngân hàng" required className="w-full bg-white p-4 rounded-xl font-bold outline-none border border-emerald-100 text-sm" onChange={(e) => setNewEmp({...newEmp, bank_name: e.target.value})} />
                    </div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="bg-slate-50 p-6 rounded-[2.5rem] space-y-4 border border-slate-100 text-left">
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2"><Briefcase size={12}/> 3. Vị trí công tác</p>
                    <input placeholder="Chức vụ" required className="w-full bg-white p-4 rounded-xl font-bold border border-slate-100 text-sm" value={newEmp.position} onChange={(e) => setNewEmp({...newEmp, position: e.target.value})} />
                    <select required className="w-full bg-white p-4 rounded-xl font-bold border border-slate-100 text-sm appearance-none" value={newEmp.dep_id} onChange={(e) => setNewEmp({...newEmp, dep_id: e.target.value})}>
                        <option value="">-- Chọn phòng ban --</option>{departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                </div>
                <div className="bg-indigo-600 p-8 rounded-[3rem] space-y-5 shadow-2xl shadow-indigo-200">
                    <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest flex items-center gap-2"><Lock size={12}/> 4. Tài khoản hệ thống</p>
                    <div className="grid grid-cols-2 gap-4">
                        <input placeholder="Username" required className="w-full bg-white/10 text-white placeholder:text-indigo-300/50 p-4 rounded-xl font-bold border border-white/20 text-sm" value={newEmp.username} onChange={(e) => setNewEmp({...newEmp, username: e.target.value})} />
                        <input placeholder="Password" required type="password" className="w-full bg-white/10 text-white placeholder:text-indigo-300/50 p-4 rounded-xl font-bold border border-white/20 text-sm" value={newEmp.password} onChange={(e) => setNewEmp({...newEmp, password: e.target.value})} />
                    </div>
                </div>
                <button type="submit" className="w-full bg-slate-900 text-white py-7 rounded-[2.5rem] font-black uppercase text-xs tracking-[0.4em] hover:bg-indigo-600 transition-all shadow-2xl flex items-center justify-center gap-3 active:scale-95">
                   <Save size={20}/> KÍCH HOẠT NHÂN SỰ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL CHỈNH SỬA (FULL OPTION) --- */}
      {showEditModal && editingEmp && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in zoom-in duration-200 text-left">
          <div className="bg-white w-full max-w-4xl rounded-[3rem] p-10 shadow-2xl overflow-y-auto max-h-[95vh] border border-slate-100">
            <h3 className="text-2xl font-black uppercase italic mb-8 flex items-center gap-2"><Edit3 className="text-indigo-600"/> Cập nhật hồ sơ: {editingEmp.full_name}</h3>
            <form onSubmit={handleEditSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div className="bg-slate-50 p-6 rounded-[2.5rem] space-y-4 border border-slate-100 text-left">
                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">1. Thông tin cá nhân</p>
                        <input className="w-full bg-white p-4 rounded-xl font-bold border border-slate-100 text-sm" value={editingEmp.full_name} onChange={(e) => setEditingEmp({...editingEmp, full_name: e.target.value})} />
                        <div className="grid grid-cols-2 gap-4">
                            <input type="date" className="w-full bg-white p-4 rounded-xl font-bold border border-slate-100 text-sm" value={editingEmp.dob ? editingEmp.dob.split('T')[0] : ''} onChange={(e) => setEditingEmp({...editingEmp, dob: e.target.value})} />
                            <select className="w-full bg-white p-4 rounded-xl font-bold border border-slate-100 text-sm" value={editingEmp.gender} onChange={(e) => setEditingEmp({...editingEmp, gender: e.target.value})}>
                                <option value="Nam">Nam</option><option value="Nữ">Nữ</option>
                            </select>
                        </div>
                        <input placeholder="Số CCCD" className="w-full bg-white p-4 rounded-xl font-bold border border-slate-100 text-sm" value={editingEmp.identity_card} onChange={(e) => setEditingEmp({...editingEmp, identity_card: e.target.value})} />
                        <div className="grid grid-cols-2 gap-4">
                            <input placeholder="Email" className="w-full bg-white p-4 rounded-xl font-bold border border-slate-100 text-sm" value={editingEmp.email} onChange={(e) => setEditingEmp({...editingEmp, email: e.target.value})} />
                            <input placeholder="SĐT" className="w-full bg-white p-4 rounded-xl font-bold border border-slate-100 text-sm" value={editingEmp.phone} onChange={(e) => setEditingEmp({...editingEmp, phone: e.target.value})} />
                        </div>
                        <input placeholder="Địa chỉ" className="w-full bg-white p-4 rounded-xl font-bold border border-slate-100 text-sm" value={editingEmp.address} onChange={(e) => setEditingEmp({...editingEmp, address: e.target.value})} />
                    </div>
                </div>
                <div className="space-y-6">
                    <div className="bg-slate-50 p-6 rounded-[2.5rem] space-y-4 border border-slate-100 text-left">
                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">2. Vị trí & Ngân hàng</p>
                        <input className="w-full bg-white p-4 rounded-xl font-bold border border-slate-100 text-sm" value={editingEmp.position} onChange={(e) => setEditingEmp({...editingEmp, position: e.target.value})} />
                        <select className="w-full bg-white p-4 rounded-xl font-bold border border-slate-100 text-sm" value={editingEmp.dep_id} onChange={(e) => setEditingEmp({...editingEmp, dep_id: e.target.value})}>
                            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                        <div className="grid grid-cols-2 gap-4 pt-2">
                            <input placeholder="Số TK" className="w-full bg-white p-4 rounded-xl font-bold border border-slate-100 text-sm" value={editingEmp.bank_account} onChange={(e) => setEditingEmp({...editingEmp, bank_account: e.target.value})} />
                            <input placeholder="Ngân hàng" className="w-full bg-white p-4 rounded-xl font-bold border border-slate-100 text-sm" value={editingEmp.bank_name} onChange={(e) => setEditingEmp({...editingEmp, bank_name: e.target.value})} />
                        </div>
                    </div>
                    <div className="flex gap-4 pt-4">
                        <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 bg-slate-100 py-5 rounded-2xl font-black uppercase text-[10px] hover:bg-slate-200">Hủy</button>
                        <button type="submit" className="flex-1 bg-slate-900 text-white py-5 rounded-2xl font-black uppercase text-[10px] hover:bg-indigo-600 shadow-xl transition-all">Lưu thay đổi</button>
                    </div>
                </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;