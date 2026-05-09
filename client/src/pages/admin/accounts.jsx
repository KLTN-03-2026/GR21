import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    UserCog, ShieldCheck, Key, UserCheck, Mail, 
    ShieldAlert, Trash2, Power, AlertCircle, CheckCircle2 
} from 'lucide-react';

const Accounts = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // 🛠️ LẤY ID TỪ LOCALSTORAGE ĐỂ CHẶN TỰ XÓA MÌNH
    const userLocal = JSON.parse(localStorage.getItem('user'));
    const currentUserId = userLocal?.id; 

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await axios.get('http://localhost:5000/api/accounts');
            setUsers(res.data);
        } catch (err) { 
            console.error(err); 
        } finally { 
            setLoading(false); 
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    const handleChangeRole = async (id, newRole) => {
        try {
            await axios.put(`http://localhost:5000/api/accounts/${id}/role`, { role: newRole });
            fetchUsers();
        // eslint-disable-next-line no-unused-vars
        } catch (err) { alert("Lỗi đổi quyền rồi bro!"); }
    };

    // 🛠️ MỚI: THAY ĐỔI TRẠNG THÁI TÀI KHOẢN (ACTIVE / INACTIVE)
    const handleChangeStatus = async (id, currentStatus) => {
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
        const confirmMsg = newStatus === 'inactive' 
            ? "Bro muốn ngưng hoạt động tài khoản này à? Họ sẽ không đăng nhập được nữa đâu nhé!" 
            : "Kích hoạt lại tài khoản này nhé bro?";

        if (!window.confirm(confirmMsg)) return;

        try {
            await axios.put(`http://localhost:5000/api/accounts/${id}/status`, { status: newStatus });
            fetchUsers();
        // eslint-disable-next-line no-unused-vars
        } catch (err) {
            alert("Lỗi cập nhật trạng thái rồi bro!");
        }
    };

    const handleResetPass = async (id) => {
        if(!window.confirm("Reset mật khẩu về 123456 nhé bro?")) return;
        try {
            await axios.put(`http://localhost:5000/api/accounts/${id}/reset-password`);
            alert("Mật khẩu đã về mặc định và được mã hóa Bcrypt! 🚀");
        // eslint-disable-next-line no-unused-vars
        } catch (err) { alert("Lỗi reset mật khẩu!"); }
    };

    const handleDeleteAccount = async (id, username, status) => {
        // 1. Chặn tự xóa chính mình
        if (parseInt(id) === parseInt(currentUserId)) {
            alert("Bro định tự sát à? Đừng tự xóa chính mình thế bro! 😂");
            return;
        }

        // 2. Chặn xóa tài khoản đang Active (Khớp với logic Backend)
        if (status === 'active') {
            alert("❌ Không được xóa tài khoản đang hoạt động bro ơi! Chuyển sang 'Ngưng hoạt động' trước nhé.");
            return;
        }

        if(!window.confirm(`Bro có chắc muốn xóa vĩnh viễn @${username}? Bay màu cả hồ sơ nhân viên luôn đó!`)) return;
        
        try {
            const res = await axios.delete(`http://localhost:5000/api/accounts/${id}`);
            if (res.data.success) {
                alert(res.data.message);
                fetchUsers();
            }
        } catch (err) {
            alert(err.response?.data?.message || "Lỗi khi xóa rồi!");
        }
    };

    return (
        <div className="p-8 bg-slate-50 min-h-screen animate-in fade-in duration-700 font-sans text-left">
            <div className="mb-10 flex justify-between items-end">
                <div>
                    <h2 className="text-4xl font-black text-slate-800 tracking-tighter italic uppercase flex items-center gap-3">
                        <UserCog size={40} className="text-indigo-600" /> Quản trị tài khoản
                    </h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1 italic">Nhóm 21 - Access Control List</p>
                    <div className="h-1 w-20 bg-indigo-600 mt-2 rounded-full"></div>
                </div>
                <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-[10px] font-black uppercase text-slate-600">Hệ thống đang trực tuyến</span>
                </div>
            </div>

            <div className="bg-white rounded-[3.5rem] shadow-sm border border-slate-100 overflow-hidden text-left">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-900 text-white uppercase text-[10px] font-black tracking-widest">
                            <th className="p-7">ID / Tài khoản</th>
                            <th className="p-7">Nhân viên sở hữu</th>
                            <th className="p-7 text-center">Trạng thái</th>
                            <th className="p-7 text-center">Quyền hạn</th>
                            <th className="p-7 text-center">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 text-left">
                        {loading ? (
                            <tr><td colSpan="5" className="p-20 text-center animate-pulse text-slate-400 font-black uppercase italic">Đang đồng bộ danh sách user...</td></tr>
                        ) : users.map((user) => (
                            <tr key={user.id} className={`transition-all group ${user.status === 'inactive' ? 'bg-slate-50/50' : 'hover:bg-indigo-50/30'}`}>
                                <td className="p-7">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-slate-100 text-slate-500 w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs shadow-inner">
                                            {user.id}
                                        </div>
                                        <div>
                                            <div className="font-black text-indigo-600 text-sm italic group-hover:scale-105 transition-transform">@{user.username}</div>
                                            <div className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">Mã bảo mật: encrypted</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-7">
                                    <div className={`font-black uppercase text-sm ${user.status === 'inactive' ? 'text-slate-400' : 'text-slate-800'}`}>
                                        {user.full_name || "Chưa liên kết"}
                                    </div>
                                    <div className="flex items-center gap-2 mt-0.5 text-left opacity-60">
                                        <span className="text-[10px] font-bold uppercase tracking-tighter">{user.position}</span>
                                        {user.email && <span className="text-[9px] font-bold flex items-center gap-0.5"><Mail size={10}/> {user.email}</span>}
                                    </div>
                                </td>
                                <td className="p-7">
                                    <div className="flex justify-center">
                                        <button 
                                            onClick={() => handleChangeStatus(user.id, user.status)}
                                            className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border flex items-center gap-2 transition-all active:scale-90 ${
                                                user.status === 'active' 
                                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100' 
                                                : 'bg-rose-50 text-rose-500 border-rose-100 hover:bg-rose-100'
                                            }`}
                                        >
                                            {user.status === 'active' ? <><CheckCircle2 size={12}/> Hoạt động</> : <><Power size={12}/> Tạm khóa</>}
                                        </button>
                                    </div>
                                </td>
                                <td className="p-7">
                                    <div className="flex justify-center">
                                        <select 
                                            value={user.role} 
                                            onChange={(e) => handleChangeRole(user.id, e.target.value)}
                                            className={`px-4 py-2 rounded-xl font-black text-[10px] uppercase outline-none cursor-pointer border-2 transition-all shadow-sm ${
                                                user.role === 'admin' ? 'bg-slate-900 text-white border-slate-800' : 
                                                user.role === 'manager' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                                                'bg-white text-slate-600 border-slate-100'
                                            }`}
                                        >
                                            <option value="admin">ADMIN</option>
                                            <option value="manager">MANAGER</option>
                                            <option value="employee">EMPLOYEE</option>
                                        </select>
                                    </div>
                                </td>
                                <td className="p-7">
                                    <div className="flex justify-center gap-2">
                                        <button 
                                            onClick={() => handleResetPass(user.id)}
                                            className="bg-white text-slate-400 hover:text-indigo-600 p-3 rounded-xl border border-slate-100 hover:border-indigo-100 transition-all shadow-sm hover:shadow-md"
                                            title="Reset về 123456"
                                        >
                                            <Key size={18} />
                                        </button>
                                        
                                        <button 
                                            onClick={() => handleDeleteAccount(user.id, user.username, user.status)}
                                            className={`p-3 rounded-xl border transition-all shadow-sm ${
                                                user.status === 'active' 
                                                ? 'bg-slate-50 text-slate-200 cursor-not-allowed' 
                                                : 'bg-white text-slate-400 hover:text-rose-500 hover:border-rose-100 hover:shadow-md'
                                            }`}
                                            title={user.status === 'active' ? "Chặn xóa tài khoản đang chạy" : "Xóa vĩnh viễn"}
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