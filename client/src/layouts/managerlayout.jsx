import React from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';

const ManagerLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // ✅ LẤY DỮ LIỆU USER ĐÃ ĐƯỢC JOIN TỪ BACKEND
    const userData = JSON.parse(localStorage.getItem('user') || '{}');

    // ✅ MENU DÀNH RIÊNG CHO MANAGER (ĐÃ BỎ TUYỂN DỤNG)
    const menuItems = [
        { id: 'dashboard', label: 'Bảng điều khiển', icon: '📊', path: '/manager/dashboard' },
        { id: 'employees', label: 'Quản lý nhân viên', icon: '👥', path: '/manager/employees' },
        { id: 'attendance', label: 'Quản lý chấm công', icon: '⏰', path: '/manager/attendance' },
        { id: 'leaves', label: 'Quản lý nghỉ phép', icon: '📅', path: '/manager/leaves' },
        { id: 'salary', label: 'Quản lý lương', icon: '💰', path: '/manager/salary' },
        { id: 'contracts', label: 'Quản lý hợp đồng', icon: '📜', path: '/manager/contracts' },
        { id: 'notifications', label: 'Thông báo', icon: '🔔', path: '/manager/notifications' },
    ];

    const currentTab = menuItems.find(item => location.pathname.includes(item.path)) || menuItems[0];

    const handleLogout = () => {
        localStorage.clear();
        navigate('/dang-nhap');
    };

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">

            {/* --- SIDEBAR BÊN TRÁI (TÔNG TÍM VIOLET) --- */}
            <aside className="w-80 bg-slate-900 text-white p-8 hidden lg:flex flex-col sticky top-0 h-screen shadow-2xl">
                <div className="flex items-center gap-4 mb-12 px-2">
                    <div className="w-12 h-12 bg-violet-600 rounded-2xl flex items-center justify-center font-black text-xl shadow-lg shadow-violet-500/20 text-white italic">21</div>
                    <div className="flex flex-col text-white">
                        <span className="font-black text-xl tracking-tighter uppercase leading-none italic">Manager</span>
                        <span className="text-[10px] font-bold text-slate-500 tracking-[0.2em] uppercase">HRM System</span>
                    </div>
                </div>

                <nav className="flex-1 space-y-2 overflow-y-auto pr-2 custom-scrollbar transition-all">
                    {menuItems.map((item) => (
                        <NavLink
                            key={item.id}
                            to={item.path}
                            className={({ isActive }) => `
                                w-full flex items-center gap-4 px-6 py-4 rounded-[1.5rem] font-bold transition-all duration-300 active:scale-95
                                ${isActive
                                    ? 'bg-violet-600 text-white shadow-xl shadow-violet-900/40 translate-x-2'
                                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                }
                            `}
                        >
                            <span className="text-xl">{item.icon}</span>
                            <span className="tracking-tight">{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="mt-auto pt-8 border-t border-slate-800">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-rose-400 hover:bg-rose-500/10 transition-all active:scale-95"
                    >
                        <span>🚪</span> Đăng xuất
                    </button>
                </div>
            </aside>

            {/* --- NỘI DUNG CHÍNH --- */}
            <main className="flex-1 p-6 md:p-12 overflow-y-auto bg-slate-50 custom-scrollbar">

                {/* --- HEADER --- */}
                <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="animate-in slide-in-from-left duration-500">
                        <h1 className="text-4xl font-black text-slate-800 tracking-tighter uppercase italic">
                            {currentTab.label}
                        </h1>
                        <p className="text-slate-500 font-semibold mt-1 italic uppercase tracking-widest text-[10px]">Nhóm 21 - HRM Intelligence System</p>
                    </div>

                    {/* ✅ PROFILE GÓC PHẢI */}
                    <div className="flex items-center gap-4 bg-white p-2 pr-8 rounded-full shadow-md border border-slate-100 animate-in slide-in-from-right duration-500 hover:shadow-lg transition-shadow cursor-pointer">
                        <div className="w-12 h-12 bg-gradient-to-tr from-violet-500 to-fuchsia-500 rounded-full flex items-center justify-center text-white font-black shadow-inner uppercase">
                            {userData.full_name?.charAt(0) || 'M'}
                        </div>
                        <div className="flex flex-col">
                            <span className="font-black text-slate-800 text-sm leading-none italic uppercase">
                                {userData.full_name || userData.username || 'Manager'}
                            </span>
                            <span className="text-[10px] font-bold text-violet-500 uppercase tracking-widest mt-1">
                                ● {userData.department_name || 'Hệ thống'}
                            </span>
                        </div>
                    </div>
                </header>

                {/* --- NƠI HIỂN THỊ CÁC ROUTE CON --- */}
                <div className="w-full animate-in fade-in zoom-in-95 duration-500">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default ManagerLayout;