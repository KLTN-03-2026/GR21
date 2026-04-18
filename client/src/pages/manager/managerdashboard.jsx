import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const ManagerDashboard = () => {
    const navigate = useNavigate();
    
    // Lấy thông tin user từ localStorage (đảm bảo lúc login đã lưu dep_id)
    const userData = JSON.parse(localStorage.getItem('user') || '{}');

    const [stats, setStats] = useState({
        totalEmployees: 0,
        pendingLeaves: 0,
        departmentName: '',
        chartData: [] // Nếu Backend Manager trả về data biểu đồ
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Lấy depId của manager
        const depId = userData.dep_id || '';
        
        if (!depId) {
            console.error("Không tìm thấy depId của Manager");
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setLoading(false);
            return;
        }

        // GỌI ĐÚNG ĐƯỜNG DẪN ĐÃ PHÂN LUỒNG
        fetch(`http://localhost:5000/api/manager/dashboard/stats?depId=${depId}`)
            .then(res => res.json())
            .then(result => {
                if (result.success) {
                    setStats({
                        totalEmployees: result.data.totalEmployees || 0,
                        pendingLeaves: result.data.pendingLeaves || 0,
                        departmentName: result.data.departmentName || userData.department_name,
                        chartData: result.data.chartData || []
                    });
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("Lỗi kết nối API Manager Dashboard:", err);
                setLoading(false);
            });
    }, [userData.dep_id, userData.department_name]);

    if (loading) return (
        <div className="p-10 text-center font-black text-slate-300 animate-pulse uppercase tracking-[0.3em]">
            Đang đồng bộ dữ liệu {userData.department_name || 'phòng ban'}...
        </div>
    );

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
            
            {/* --- HEADER PHÒNG BAN --- */}
            <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 flex justify-between items-center border-l-8 border-l-violet-600">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 italic uppercase tracking-tighter">
                        Bảng điều khiển {stats.departmentName || userData.department_name}
                    </h2>
                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">
                        Dữ liệu quản trị dành riêng cho Manager
                    </p>
                </div>
                <div className="bg-violet-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase shadow-lg shadow-violet-200">
                    Quản lý: {userData.full_name}
                </div>
            </div>

            {/* --- CÁC THẺ THỐNG KÊ --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                
                {/* NHÂN SỰ PHÒNG */}
                <div 
                    onClick={() => navigate('/manager/employees')}
                    className="bg-white p-12 rounded-[4rem] shadow-sm border border-slate-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group cursor-pointer relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-violet-50 rounded-full -mr-16 -mt-16 transition-all group-hover:scale-150 duration-700"></div>
                    
                    <div className="w-20 h-20 bg-violet-100 text-violet-600 rounded-3xl flex items-center justify-center text-4xl group-hover:bg-violet-600 group-hover:text-white transition-all duration-500 relative z-10">
                        👥
                    </div>
                    <div className="mt-8 relative z-10">
                        <span className="block text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Tổng nhân sự phòng</span>
                        <span className="text-6xl font-black text-slate-800 tracking-tighter">{stats.totalEmployees}</span>
                    </div>
                </div>

                {/* ĐƠN NGHỈ PHÉP */}
                <div 
                    onClick={() => navigate('/manager/leaves')}
                    className="bg-white p-12 rounded-[4rem] shadow-sm border border-slate-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group cursor-pointer relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-full -mr-16 -mt-16 transition-all group-hover:scale-150 duration-700"></div>

                    <div className="w-20 h-20 bg-rose-100 text-rose-500 rounded-3xl flex items-center justify-center text-4xl group-hover:bg-rose-500 group-hover:text-white transition-all duration-500 relative z-10">
                        📅
                    </div>
                    <div className="mt-8 relative z-10">
                        <span className="block text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Đơn nghỉ chờ duyệt</span>
                        <span className="text-6xl font-black text-slate-800 tracking-tighter">{stats.pendingLeaves}</span>
                    </div>
                </div>

            </div>

            {/* --- BIỂU ĐỒ MẬT ĐỘ --- */}
            <div className="bg-white p-12 rounded-[4rem] shadow-xl border border-slate-100 relative overflow-hidden">
                <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-violet-500 to-fuchsia-500"></div>
                
                <h3 className="text-2xl font-black text-slate-800 mb-10 flex items-center gap-4 italic uppercase tracking-tighter">
                    <span className="p-2 bg-slate-100 rounded-xl">📊</span>
                    Mật độ nhân sự thực tế
                </h3>
                
                <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.chartData.length > 0 ? stats.chartData : [{name: stats.departmentName, value: stats.totalEmployees}]}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontWeight: 'bold', fontSize: 12 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontWeight: 'bold' }} />
                            <Tooltip 
                                cursor={{ fill: '#f8fafc' }}
                                contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', padding: '20px' }}
                            />
                            <Bar dataKey="value" barSize={80} radius={[20, 20, 20, 20]}>
                                {stats.chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill="#8b5cf6" />
                                ))}
                                {/* Màu mặc định nếu chartData trống */}
                                <Cell fill="#8b5cf6" />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default ManagerDashboard;