import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]); 
  const [loading, setLoading] = useState(true);

  // State điều khiển Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // State dữ liệu Form
  const [newEmp, setNewEmp] = useState({
    full_name: '', email: '', phone: '', dep_id: '', position: '', username: '', password: ''
  });
  const [editingEmp, setEditingEmp] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Gọi cả 2 API cùng lúc để lấy danh sách NV và danh sách Phòng để đổ vào Select
      const [empRes, deptRes] = await Promise.all([
        axios.get('http://localhost:5000/api/employees'),
        axios.get('http://localhost:5000/api/phongban')
      ]);
      setEmployees(empRes.data);
      setDepartments(deptRes.data);
    } catch (err) {
      console.error("Lỗi quét dữ liệu:", err);
    } finally {
      setLoading(false); // Luôn tắt loading kể cả lỗi
    }
  };

  // --- HÀM XỬ LÝ THÊM MỚI ---
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/employees', newEmp);
      // Backend mới sẽ trả về message nếu thành công
      alert(res.data.message || "Đã chiêu mộ nhân tài thành công! 🚀");
      
      setShowAddModal(false);
      setNewEmp({ full_name: '', email: '', phone: '', dep_id: '', position: '', username: '', password: '' });
      fetchData(); // Load lại cả 2 bảng để cập nhật sếp bên phòng ban luôn
    } catch (err) {
      alert("Lỗi thêm: " + (err.response?.data || err.message));
    }
  };

  // --- HÀM XỬ LÝ XÓA ---
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

  // --- HÀM XỬ LÝ CẬP NHẬT ---
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/api/employees/${editingEmp.id}`, editingEmp);
      setShowEditModal(false);
      fetchData();
      alert("Cập nhật hồ sơ thành công!");
    } catch (err) {
      alert("Lỗi update: " + err.message);
    }
  };

  if (loading) return <div className="p-20 text-center font-black text-slate-300 animate-pulse uppercase tracking-[0.3em]">Hệ thống đang quét dữ liệu...</div>;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 p-6">
      <div className="bg-white rounded-[3.5rem] shadow-xl border border-slate-100 overflow-hidden">
        
        {/* --- HEADER --- */}
        <div className="p-10 flex justify-between items-center border-b border-slate-50 bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-3xl font-black text-slate-800 uppercase italic tracking-tighter">👥 Hồ sơ nhân sự</h2>
            <p className="text-slate-400 font-bold text-xs mt-1 uppercase tracking-widest italic">Nhóm 21 - HRM Intelligence</p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-indigo-600 text-white px-10 py-5 rounded-[2rem] font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
          >
            + THÊM MỚI
          </button>
        </div>

        {/* --- BẢNG DỮ LIỆU --- */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Họ và tên / Mã NV</th>
                <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Đơn vị & Chức vụ</th>
                <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Liên hệ</th>
                <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Ngày gia nhập</th>
                <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50/20 transition-all group">
                  <td className="p-8">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 bg-slate-900 rounded-[1.5rem] flex items-center justify-center text-white font-black text-xl shadow-lg group-hover:bg-indigo-600 transition-colors italic">
                        {emp.full_name?.charAt(0)}
                      </div>
                      <div>
                        <span className="block font-black text-slate-800 text-lg leading-none uppercase italic">{emp.full_name}</span>
                        <span className="text-[10px] font-bold text-slate-300 uppercase mt-1 inline-block tracking-tighter">Mã số: #{emp.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-8">
                    <div className="flex flex-col gap-2">
                        <span className="px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-indigo-100 w-fit">
                        {emp.department_name || 'Vãng lai'}
                        </span>
                        <span className="text-[11px] font-bold text-slate-400 italic ml-1">{emp.position || 'Nhân viên'}</span>
                    </div>
                  </td>
                  <td className="p-8">
                    <div className="flex flex-col">
                      <span className="font-black text-slate-700 text-sm italic">{emp.phone}</span>
                      <span className="text-slate-400 text-[11px] font-bold">{emp.email}</span>
                    </div>
                  </td>
                  <td className="p-8 font-black text-slate-400 text-sm italic">
                    {emp.join_date ? new Date(emp.join_date).toLocaleDateString('vi-VN') : '---'}
                  </td>
                  <td className="p-8 text-center">
                    <div className="flex justify-center gap-3">
                       <button onClick={() => {setEditingEmp(emp); setShowEditModal(true);}} className="p-4 bg-white border border-slate-100 rounded-2xl hover:bg-slate-900 hover:text-white transition-all shadow-sm active:scale-90">✏️</button>
                       <button onClick={() => handleDelete(emp.id)} className="p-4 bg-white border border-slate-100 rounded-2xl hover:bg-rose-500 hover:text-white transition-all shadow-sm active:scale-90">🗑️</button>
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] p-12 shadow-2xl overflow-y-auto max-h-[90vh]">
            <h3 className="text-2xl font-black uppercase italic mb-8">➕ Chiêu mộ nhân tài mới</h3>
            <form onSubmit={handleAddSubmit} className="grid grid-cols-2 gap-6">
              <div className="col-span-2 md:col-span-1">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2">Họ và tên</label>
                <input required className="w-full bg-slate-50 border-none p-5 rounded-2xl mt-2 font-bold outline-none focus:ring-2 ring-indigo-500" 
                  value={newEmp.full_name} onChange={(e) => setNewEmp({...newEmp, full_name: e.target.value})} />
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2">Chức vụ (vd: Trưởng phòng Kỹ thuật)</label>
                <input required className="w-full bg-slate-50 border-none p-5 rounded-2xl mt-2 font-bold outline-none focus:ring-2 ring-indigo-500" 
                  value={newEmp.position} onChange={(e) => setNewEmp({...newEmp, position: e.target.value})} />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2">Email</label>
                <input required type="email" className="w-full bg-slate-50 border-none p-5 rounded-2xl mt-2 font-bold outline-none focus:ring-2 ring-indigo-500" 
                  value={newEmp.email} onChange={(e) => setNewEmp({...newEmp, email: e.target.value})} />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2">Số điện thoại</label>
                <input required className="w-full bg-slate-50 border-none p-5 rounded-2xl mt-2 font-bold outline-none focus:ring-2 ring-indigo-500" 
                  value={newEmp.phone} onChange={(e) => setNewEmp({...newEmp, phone: e.target.value})} />
              </div>
              <div className="col-span-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2">Phòng ban mục tiêu</label>
                <select required className="w-full bg-slate-50 border-none p-5 rounded-2xl mt-2 font-bold outline-none focus:ring-2 ring-indigo-500 appearance-none"
                  value={newEmp.dep_id} onChange={(e) => setNewEmp({...newEmp, dep_id: e.target.value})}>
                  <option value="">-- Chọn đơn vị --</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div className="col-span-2 p-6 bg-indigo-50/50 rounded-[2rem] border border-indigo-100 grid grid-cols-2 gap-4">
                 <div className="col-span-2 mb-2 font-black text-indigo-400 text-[10px] uppercase tracking-widest">Thiết lập tài khoản đăng nhập</div>
                 <input placeholder="Username" required className="bg-white p-4 rounded-xl font-bold outline-none" 
                  value={newEmp.username} onChange={(e) => setNewEmp({...newEmp, username: e.target.value})} />
                 <input placeholder="Password" required type="password" className="bg-white p-4 rounded-xl font-bold outline-none" 
                  value={newEmp.password} onChange={(e) => setNewEmp({...newEmp, password: e.target.value})} />
              </div>
              <div className="col-span-2 flex gap-4 pt-4">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 bg-slate-100 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 transition-all">Hủy</button>
                <button type="submit" className="flex-1 bg-indigo-600 text-white py-5 rounded-2xl font-black uppercase text-[10px] shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all">Lưu dữ liệu</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL CHỈNH SỬA --- */}
      {showEditModal && editingEmp && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in zoom-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-[3rem] p-12 shadow-2xl">
            <h3 className="text-2xl font-black uppercase italic mb-8">✏️ Cập nhật hồ sơ</h3>
            <form onSubmit={handleEditSubmit} className="space-y-5">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-300 ml-2">Họ tên</label>
                <input required className="w-full bg-slate-50 p-5 rounded-2xl font-bold mt-1 outline-none focus:ring-2 ring-slate-200" 
                  value={editingEmp.full_name} onChange={(e) => setEditingEmp({...editingEmp, full_name: e.target.value})} />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-300 ml-2">Chức vụ</label>
                <input required className="w-full bg-slate-50 p-5 rounded-2xl font-bold mt-1 outline-none focus:ring-2 ring-slate-200" 
                  value={editingEmp.position} onChange={(e) => setEditingEmp({...editingEmp, position: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input placeholder="Email" className="bg-slate-50 p-5 rounded-2xl font-bold outline-none" 
                  value={editingEmp.email} onChange={(e) => setEditingEmp({...editingEmp, email: e.target.value})} />
                <input placeholder="SĐT" className="bg-slate-50 p-5 rounded-2xl font-bold outline-none" 
                  value={editingEmp.phone} onChange={(e) => setEditingEmp({...editingEmp, phone: e.target.value})} />
              </div>
              <select className="w-full bg-slate-50 p-5 rounded-2xl font-bold outline-none appearance-none"
                value={editingEmp.dep_id} onChange={(e) => setEditingEmp({...editingEmp, dep_id: e.target.value})}>
                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 bg-slate-100 py-5 rounded-2xl font-black uppercase text-[10px] hover:bg-slate-200 transition-all">Đóng</button>
                <button type="submit" className="flex-1 bg-slate-900 text-white py-5 rounded-2xl font-black uppercase text-[10px] hover:bg-slate-800 transition-all shadow-xl">Cập nhật</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;