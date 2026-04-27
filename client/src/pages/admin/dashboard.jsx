import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const Dashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalEmployees: 0,
        totalDepartments: 0,
        activeJobs: 0,
        pendingLeaves: 0,
        chartData: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('http://localhost:5000/api/admin/dashboard/stats')
            .then(res => {
                if (!res.ok) throw new Error("Không tìm thấy API Admin");
                return res.json();
            })
            .then(result => {
                if (result.success) {
                    setStats(result.data);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("Lỗi Dashboard Admin:", err);
                setLoading(false);
            });
    }, []);

    if (loading) return (
        <div className="p-10 font-black text-slate-300 animate-pulse uppercase tracking-[0.3em] text-center">
            Đang đồng bộ dữ liệu hệ thống Admin...
        </div>
    );

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">

            {/* HÀNG THẺ THỐNG KÊ (STATS CARDS) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div onClick={() => navigate('/admin/employees')} className="active:scale-95 transition-transform cursor-pointer">
                    <StatCard icon="👥" label="Nhân sự" value={stats.totalEmployees} color="indigo" />
                </div>

                <div onClick={() => navigate('/admin/phong-ban')} className="active:scale-95 transition-transform cursor-pointer">
                    <StatCard icon="🏢" label="Phòng ban" value={stats.totalDepartments} color="emerald" />
                </div>

                <div onClick={() => navigate('/admin/jobs')} className="active:scale-95 transition-transform cursor-pointer">
                    <StatCard icon="✍️" label="Tuyển dụng" value={stats.activeJobs} color="amber" />
                </div>

                <div onClick={() => navigate('/admin/leaves')} className="active:scale-95 transition-transform cursor-pointer">
                    <StatCard icon="📅" label="Đơn nghỉ" value={stats.pendingLeaves} color="rose" />
                </div>
            </div>

            {/* BIỂU ĐỒ PHÂN BỔ NHÂN SỰ */}
            <div className="bg-white p-10 rounded-[3.5rem] shadow-xl border border-slate-100 relative overflow-hidden">
                <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-violet-500"></div>
                
                <h3 className="text-2xl font-black text-slate-800 mb-10 flex items-center gap-3 relative z-10 italic uppercase tracking-tighter">
                    <span className="bg-slate-100 p-2 rounded-xl">📊</span> 
                    Phân bổ nhân sự toàn công ty
                </h3>
                
                <div className="h-[480px] w-full relative z-10"> {/* Tăng chiều cao để đủ chỗ cho nhãn nghiêng */}
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 60 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis 
                                dataKey="name" 
                                axisLine={false} 
                                tickLine={false} 
                                interval={0} // Hiện tất cả các tên phòng ban
                                angle={-25} // Nghiêng chữ để không đè nhau
                                textAnchor="end"
                                height={80}
                                tick={{ fill: '#94a3b8', fontWeight: 'bold', fontSize: 11 }} 
                            />
                            <YAxis 
                                axisLine={false} 
                                tickLine={false} 
                                allowDecimals={false} // Chỉ hiện số nguyên 1, 2, 3...
                                tick={{ fill: '#94a3b8', fontWeight: 'bold' }} 
                            />
                            <Tooltip
                                cursor={{ fill: '#f8fafc' }}
                                contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', padding: '20px' }}
                            />
                            <Bar dataKey="value" radius={[12, 12, 12, 12]} barSize={60}>
                                {stats.chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][index % 5]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ icon, label, value, color }) => {
    const colorClasses = {
        indigo: 'bg-indigo-50 group-hover:bg-indigo-600',
        emerald: 'bg-emerald-50 group-hover:bg-emerald-600',
        amber: 'bg-amber-50 group-hover:bg-amber-600',
        rose: 'bg-rose-50 group-hover:bg-rose-600'
    };

    return (
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center gap-6 
                    hover:shadow-2xl hover:-translate-y-2 hover:border-indigo-200 transition-all duration-300 group">
            <div className={`w-16 h-16 ${colorClasses[color]} rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 group-hover:text-white transition-all duration-500`}>
                {icon}
            </div>
            <div>
                <span className="block text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">{label}</span>
                <span className="text-4xl font-black text-slate-800 tracking-tighter">{value || 0}</span>
            </div>
        </div>
    );
};

export default Dashboard;