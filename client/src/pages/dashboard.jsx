import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// Nhận props changeTab từ AdminDashboard truyền xuống
const Dashboard = ({ changeTab }) => {
    const [stats, setStats] = useState({
        totalEmployees: 0,
        totalDepartments: 0,
        activeJobs: 0,
        pendingLeaves: 0,
        chartData: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('http://localhost:5000/api/dashboard/stats')
            .then(res => res.json())
            .then(result => {
                if (result.success) setStats(result.data);
                setLoading(false);
            })
            .catch(err => console.error("Lỗi Dashboard:", err));
    }, []);

    if (loading) return <div className="p-10 font-black text-slate-300 animate-pulse uppercase tracking-widest text-center">Đang tải dữ liệu hệ thống...</div>;

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">

            {/* HÀNG THẺ THỐNG KÊ (STATS CARDS) - ĐÃ THÊM CLICK ĐỂ CHUYỂN TAB */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                <div onClick={() => changeTab('employees')} className="cursor-pointer">
                    <StatCard icon="👥" label="Nhân sự" value={stats.totalEmployees} color="indigo" />
                </div>

                <div onClick={() => changeTab('departments')} className="cursor-pointer">
                    <StatCard icon="🏢" label="Phòng ban" value={stats.totalDepartments} color="emerald" />
                </div>

                <div onClick={() => changeTab('jobs')} className="cursor-pointer">
                    <StatCard icon="✍️" label="Tuyển dụng" value={stats.activeJobs} color="amber" />
                </div>

                {/* Thẻ này tạm thời chưa có tab chi tiết thì để nguyên hoặc link sang thông báo */}
                <div className="cursor-default">
                    <StatCard icon="📅" label="Đơn nghỉ" value={stats.pendingLeaves} color="rose" />
                </div>

            </div>

            {/* BIỂU ĐỒ PHÂN BỔ NHÂN SỰ */}
            <div className="bg-white p-10 rounded-[3.5rem] shadow-xl border border-slate-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full blur-3xl -mr-32 -mt-32"></div>

                <h3 className="text-2xl font-black text-slate-800 mb-10 flex items-center gap-3 relative z-10 italic">
                    <span className="bg-slate-100 p-2 rounded-xl">📊</span> Phân bổ nhân sự thực tế
                </h3>

                <div className="h-[400px] w-full relative z-10">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontWeight: 'bold', fontSize: 12 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontWeight: 'bold' }} />
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

// Component con StatCard - Đã thêm hiệu ứng hover cho chuyên nghiệp
const StatCard = ({ icon, label, value, color }) => (
    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center gap-6 
                  hover:shadow-2xl hover:-translate-y-2 hover:border-indigo-200 transition-all duration-300 group">
        <div className={`w-16 h-16 bg-${color}-50 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform`}>
            {icon}
        </div>
        <div>
            <span className="block text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">{label}</span>
            <span className="text-4xl font-black text-slate-800 tracking-tighter">{value || 0}</span>
        </div>
    </div>
);

export default Dashboard;