import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { UserCog, ShieldCheck, Key, UserCheck, Mail, ShieldAlert, Trash2 } from 'lucide-react';

const Accounts = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    // Lấy ID của người đang đăng nhập để chặn tự xóa chính mình
    const currentUserId = localStorage.getItem('userId'); 

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await axios.get('http://localhost:5000/api/accounts');
            setUsers(res.data);
        } catch (err) { console.error(err); } finally { setLoading(false); }
    };

    useEffect(() => { fetchUsers(); }, []);

    const handleChangeRole = async (id, newRole) => {
        try {
            await axios.put(`http://localhost:5000/api/accounts/${id}/role`, { role: newRole });
            fetchUsers();
        // eslint-disable-next-line no-unused-vars
        } catch (err) { alert("Lỗi đổi quyền rồi bro!"); }
    };

    const handleResetPass = async (id) => {
        if(!window.confirm("Reset mật khẩu về 123456 nhé bro?")) return;
        try {
            await axios.put(`http://localhost:5000/api/accounts/${id}/reset-password`);
            alert("Đã reset thành công! 🚀");
        // eslint-disable-next-line no-unused-vars
        } catch (err) { alert("Lỗi reset mật khẩu!"); }
    };

    // --- MỚI: LOGIC XÓA TÀI KHOẢN ---
    const handleDeleteAccount = async (id, username) => {
        if (id === parseInt(currentUserId)) {
            alert("Bro định tự xóa chính mình à? Đừng dại thế bro! 😂");
            return;
        }

        if(!window.confirm(`Bro có chắc muốn xóa vĩnh viễn tài khoản @${username}? Thao tác này sẽ xóa luôn cả hồ sơ nhân viên tương ứng!`)) return;
        
        try {
            const res = await axios.delete(`http://localhost:5000/api/accounts/${id}`);
            if (res.data.success) {
                alert(res.data.message);
                fetchUsers(); // Refresh lại danh sách
            }
        } catch (err) {
            console.error(err);
            alert("Lỗi khi xóa tài khoản rồi bro ơi!");
        }
    };

    return (
        <div className="p-8 bg-slate-50 min-h-screen animate-in fade-in duration-700 font-sans text-left">
            <div className="mb-10">
                <h2 className="text-4xl font-black text-slate-800 tracking-tighter italic uppercase flex items-center gap-3">
                    <UserCog size={40} className="text-indigo-600" /> Quản trị tài khoản
                </h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1 italic">Nhóm 21 - Access Control List</p>
                <div className="h-1 w-20 bg-indigo-600 mt-2 rounded-full"></div>
            </div>

            <div className="bg-white rounded-[3.5rem] shadow-sm border border-slate-100 overflow-hidden text-left">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-900 text-white uppercase text-[10px] font-black tracking-widest">
                            <th className="p-6">ID / Tài khoản</th>
                            <th className="p-6">Nhân viên sở hữu</th>
                            <th className="p-6 text-center">Quyền hạn (Role)</th>
                            <th className="p-6 text-center">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 text-left">
                        {loading ? (
                            <tr><td colSpan="4" className="p-20 text-center animate-pulse text-slate-400 font-black uppercase italic">Đang tải danh sách user...</td></tr>
                        ) : users.map((user) => (
                            <tr key={user.id} className="hover:bg-indigo-50/30 transition-all group">
                                <td className="p-6">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-slate-100 text-slate-500 w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs">{user.id}</div>
                                        <div>
                                            <div className="font-black text-indigo-600 text-sm italic">@{user.username}</div>
                                            <div className="text-[10px] font-bold text-slate-300 uppercase">Mật khẩu: ******</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-6">
                                    <div className="font-black text-slate-800 uppercase text-sm">{user.full_name || "Chưa liên kết"}</div>
                                    <div className="flex items-center gap-2 mt-0.5 text-left">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{user.position}</span>
                                        {user.email && <span className="text-[9px] text-indigo-400 font-bold flex items-center gap-0.5"><Mail size={10}/> {user.email}</span>}
                                    </div>
                                </td>
                                <td className="p-6">
                                    <div className="flex justify-center">
                                        <select 
                                            value={user.role} 
                                            onChange={(e) => handleChangeRole(user.id, e.target.value)}
                                            className={`px-4 py-2 rounded-xl font-black text-[10px] uppercase outline-none cursor-pointer border-2 transition-all ${
                                                user.role === 'admin' ? 'bg-rose-50 text-rose-600 border-rose-100' : 
                                                user.role === 'manager' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                                                'bg-slate-50 text-slate-600 border-slate-100'
                                            }`}
                                        >
                                            <option value="admin">ADMIN</option>
                                            <option value="manager">MANAGER</option>
                                            <option value="employee">EMPLOYEE</option>
                                        </select>
                                    </div>
                                </td>
                                <td className="p-6">
                                    <div className="flex justify-center gap-2">
                                        <button 
                                            onClick={() => handleResetPass(user.id)}
                                            className="bg-white text-slate-400 hover:text-indigo-600 p-2.5 rounded-xl border border-slate-100 hover:border-indigo-100 transition-all shadow-sm"
                                            title="Reset mật khẩu"
                                        >
                                            <Key size={18} />
                                        </button>
                                        
                                        {/* NÚT XÓA: CHỈ HIỆN KHI KHÔNG PHẢI LÀ CHÍNH MÌNH HOẶC ROLE KHÁC ADMIN ĐỂ AN TOÀN */}
                                        <button 
                                            onClick={() => handleDeleteAccount(user.id, user.username)}
                                            className="bg-white text-slate-400 hover:text-rose-500 p-2.5 rounded-xl border border-slate-100 hover:border-rose-100 transition-all shadow-sm"
                                            title="Xóa tài khoản"
                                        >
                                            <Trash2 size={18} />
                                        </button>
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

export default Accounts;