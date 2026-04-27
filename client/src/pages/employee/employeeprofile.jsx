import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  User, Mail, Phone, MapPin, Briefcase, 
  Calendar, ShieldCheck, Lock, X, Edit3, Save, RotateCcw 
} from 'lucide-react';

const ProfileEmployee = () => {
    const userLocal = JSON.parse(localStorage.getItem('user'));
    const [profile, setProfile] = useState(null);
    const [tempProfile, setTempProfile] = useState(null); 
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [pwdData, setPwdData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
    const [submitting, setSubmitting] = useState(false);

    const fetchProfile = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/employee/profile/${userLocal.id}`);
            setProfile(res.data);
            setTempProfile(res.data);
        } catch (err) {
            console.error("Lỗi lấy profile:", err);
        } finally {
            setLoading(false);
        }
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { if (userLocal?.id) fetchProfile(); }, [userLocal.id]);

    const handleSaveProfile = async () => {
        try {
            await axios.put(`http://localhost:5000/api/employee/profile/update/${userLocal.id}`, {
                email: tempProfile.email,
                phone: tempProfile.phone,
                address: tempProfile.address
            });
            setProfile(tempProfile);
            setIsEditing(false);
            alert("Hồ sơ cập nhật thành công rồi bro! ✨");
        // eslint-disable-next-line no-unused-vars
        } catch (err) {
            alert("Lỗi cập nhật rồi bro ơi!");
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (pwdData.newPassword !== pwdData.confirmPassword) {
            alert("Mật khẩu xác nhận không khớp!");
            return;
        }
        setSubmitting(true);
        try {
            await axios.put(`http://localhost:5000/api/employee/profile/change-password`, {
                userId: profile.user_id,
                oldPassword: pwdData.oldPassword,
                newPassword: pwdData.newPassword
            });
            alert("Đổi mật khẩu thành công! 🛡️");
            setShowPasswordModal(false);
            setPwdData({ oldPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            alert(err.response?.data?.message || "Lỗi rồi!");
        } finally { setSubmitting(false); }
    };

    if (loading) return (
        <div className="flex h-[60vh] items-center justify-center font-black italic text-slate-300 animate-pulse uppercase tracking-widest">
            Đang quét dữ liệu Nhóm 21...
        </div>
    );

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-10 duration-700 pb-10 text-left">
            {/* HEADER & ACTIONS */}
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-4xl font-black text-slate-800 tracking-tighter uppercase flex items-center gap-4">
                        <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-200">
                            <User size={32} />
                        </div>
                        {isEditing ? "Đang chỉnh sửa" : "Hồ sơ nhân sự"}
                    </h2>
                    <p className="text-slate-400 font-bold mt-2 italic text-[11px] uppercase tracking-[0.2em]">Thông tin cá nhân & Bảo mật</p>
                </div>

                <div className="flex gap-3">
                    {isEditing ? (
                        <>
                            <button onClick={() => { setIsEditing(false); setTempProfile(profile); }} className="bg-slate-100 text-slate-400 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center gap-2">
                                <RotateCcw size={14}/> Hủy
                            </button>
                            <button onClick={handleSaveProfile} className="bg-emerald-600 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 transition-all shadow-lg flex items-center gap-2">
                                <Save size={14}/> Lưu hồ sơ
                            </button>
                        </>
                    ) : (
                        <button onClick={() => setIsEditing(true)} className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg flex items-center gap-2">
                            <Edit3 size={14}/> Sửa thông tin
                        </button>
                    )}
                </div>
            </div>

            {/* MAIN CARD */}
            <div className="bg-white rounded-[4rem] border border-slate-100 shadow-2xl overflow-hidden relative">
                <div className="h-40 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 relative rounded-[2.5rem] mx-4 mt-4 shadow-inner">
                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                </div>

                <div className="px-12 pb-16 relative">
                    <div className="flex flex-col md:flex-row items-center md:items-end gap-8 -mt-16 mb-12">
                        <div className="relative z-10">
                            <div className={`w-48 h-48 rounded-[3.5rem] border-[12px] border-white flex items-center justify-center text-white text-7xl font-black italic shadow-2xl transition-all duration-500 hover:scale-105
                                ${profile?.role === 'manager' ? 'bg-gradient-to-tr from-amber-400 to-yellow-600' : 'bg-gradient-to-tr from-indigo-600 to-violet-700'}`}>
                                {profile?.full_name?.charAt(0)}
                            </div>
                            <div className="absolute bottom-3 right-3 w-10 h-10 bg-emerald-500 border-[6px] border-white rounded-full"></div>
                        </div>

                        <div className="mb-4 text-center md:text-left flex-1">
                            <h3 className="text-5xl font-black text-slate-800 uppercase tracking-tighter leading-none font-sans">
                                {profile?.full_name}
                            </h3>
                            <div className="flex gap-3 mt-4 justify-center md:justify-start">
                                <span className="bg-indigo-50 text-indigo-600 px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-indigo-100 shadow-sm italic">
                                    {profile?.department_name || 'Nhóm 21'}
                                </span>
                                {profile?.role === 'manager' && <span className="bg-amber-100 text-amber-600 px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-amber-100 shadow-sm italic">👑 Quản lý</span>}
                            </div>
                        </div>
                    </div>

                    {/* Grid thông tin chi tiết */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <InfoBox icon={<Briefcase />} label="Chức danh" value={profile?.position} />
                        
                        {/* EDITABLE FIELDS */}
                        <InfoBox icon={<Mail />} label="Email liên hệ" value={tempProfile?.email} isEdit={isEditing} onChange={(v) => setTempProfile({...tempProfile, email: v})} />
                        <InfoBox icon={<Phone />} label="Số điện thoại" value={tempProfile?.phone} isEdit={isEditing} onChange={(v) => setTempProfile({...tempProfile, phone: v})} />
                        <InfoBox icon={<MapPin />} label="Địa chỉ" value={tempProfile?.address} isEdit={isEditing} onChange={(v) => setTempProfile({...tempProfile, address: v})} />
                        
                        {/* FORMAT 2 NGÀY ĐỂ BRO HẾT LĂN TĂN */}
                        <InfoBox 
                            icon={<Calendar />} 
                            label="Ngày tạo hồ sơ" 
                            value={profile?.join_date ? new Date(profile.join_date).toLocaleDateString('vi-VN') : 'N/A'} 
                        />
                        <InfoBox 
                            icon={<ShieldCheck />} 
                            label="Ngày chính thức" 
                            value={profile?.official_date ? new Date(profile.official_date).toLocaleDateString('vi-VN') : 'Đang chờ ký hợp đồng'} 
                            isStatus={!!profile?.official_date}
                        />
                    </div>

                    <div className="mt-12 pt-10 border-t border-slate-50">
                        <button onClick={() => setShowPasswordModal(true)} className="bg-slate-900 text-white px-10 py-5 rounded-[2.2rem] font-black text-[10px] uppercase tracking-[0.2em] italic hover:bg-indigo-600 transition-all shadow-xl active:scale-95 flex items-center gap-3">
                            <Lock size={14} /> Đổi mật khẩu bảo mật
                        </button>
                    </div>
                </div>
            </div>

            {/* MODAL PASSWORD */}
            {showPasswordModal && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowPasswordModal(false)}></div>
                    <form onSubmit={handleChangePassword} className="relative bg-white w-full max-w-md rounded-[3.5rem] shadow-2xl p-12 animate-in zoom-in-95 duration-300 text-left">
                        <div className="flex justify-between items-center mb-10">
                            <h3 className="text-2xl font-black text-slate-800 uppercase italic tracking-tighter">🛡️ Đổi mật khẩu</h3>
                            <button type="button" onClick={() => setShowPasswordModal(false)} className="text-slate-300 hover:text-slate-800 transition-colors"><X size={24}/></button>
                        </div>
                        <div className="space-y-6">
                            <InputGroup label="Mật khẩu hiện tại" type="password" value={pwdData.oldPassword} onChange={(val) => setPwdData({...pwdData, oldPassword: val})} />
                            <InputGroup label="Mật khẩu mới" type="password" value={pwdData.newPassword} onChange={(val) => setPwdData({...pwdData, newPassword: val})} />
                            <InputGroup label="Xác nhận mật khẩu mới" type="password" value={pwdData.confirmPassword} onChange={(val) => setPwdData({...pwdData, confirmPassword: val})} />
                        </div>
                        <button disabled={submitting} type="submit" className="w-full mt-10 bg-indigo-600 text-white py-6 rounded-[2rem] font-black uppercase text-[11px] tracking-[0.2em] italic shadow-2xl shadow-indigo-200 hover:bg-slate-900 transition-all disabled:opacity-50">
                            {submitting ? 'Đang cập nhật...' : 'Xác nhận thay đổi'}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

const InfoBox = ({ icon, label, value, isStatus, isEdit, onChange }) => (
    <div className={`p-7 rounded-[2.8rem] border transition-all duration-500 group/box ${isEdit ? 'bg-indigo-50/50 border-indigo-200 shadow-inner' : 'bg-slate-50/50 border-slate-50 hover:bg-white hover:shadow-xl'}`}>
        <div className="flex items-center gap-6">
            <div className={`p-4 rounded-2xl shadow-sm transition-all duration-500 ${isEdit ? 'bg-indigo-600 text-white shadow-indigo-200' : 'bg-white text-indigo-600'}`}>
                {React.cloneElement(icon, { size: 22 })}
            </div>
            <div className="flex-1 text-left">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">{label}</p>
                {isEdit ? (
                    <input type="text" value={value || ''} onChange={(e) => onChange(e.target.value)} className="w-full bg-transparent border-b border-indigo-200 font-black text-sm text-slate-800 focus:outline-none focus:border-indigo-600 animate-pulse" />
                ) : (
                    <p className={`font-black text-sm uppercase tracking-tighter ${isStatus ? 'text-emerald-500' : 'text-slate-700'}`}>{value || 'N/A'}</p>
                )}
            </div>
        </div>
    </div>
);

const InputGroup = ({ label, type, value, onChange }) => (
    <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase italic ml-5 tracking-widest">{label}</label>
        <input required type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-slate-50 border-none rounded-[1.5rem] px-6 py-5 font-bold text-sm focus:ring-2 focus:ring-indigo-500 transition-all" />
    </div>
);

export default ProfileEmployee;