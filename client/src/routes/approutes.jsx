import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import AdminLayout from '../layouts/adminlayout';
import ManagerLayout from '../layouts/managerlayout';
import EmployeeLayout from '../layouts/employeelayout';

// Components & Pages Common
import Navbar from '../components/Navbar';
import Home from '../pages/home';
import DangNhap from '../pages/dangnhap';
import { NotFound, Developing } from '../components/common/statuspages';

// --- [ ADMIN PAGES ] ---
import Dashboard from '../pages/admin/dashboard';
import Employees from '../pages/admin/employees';
import PhongBan from '../pages/admin/departments';
import Attendance from '../pages/admin/attendance';
import Leaves from '../pages/admin/leaves';
import Job from '../pages/admin/job';
import Salaries from '../pages/admin/salaries';
import Contracts from '../pages/admin/contracts';
import Accounts from '../pages/admin/accounts';
import Notifications from '../pages/admin/notifications';

// --- [ MANAGER PAGES ] ---
import ManagerDashboard from '../pages/manager/managerdashboard';
import ManagerEmployee from '../pages/manager/manageremployee';
import ManagerAttendance from '../pages/manager/managerattendances';
import ManagerSalaries from '../pages/manager/managersalaries'; // Con hàng mới ae mình vừa sục
import ManagerNotifications from "../pages/manager/managernotifications";
import ManagerLeaves from '../pages/manager/managerleaves';
import ManagerContracts from '../pages/manager/managercontracts';

// --- [ EMPLOYEE PAGES ] ---
import HomeEmployee from '../pages/employee/homeemployee';
import ProfileEmployee from '../pages/employee/employeeprofile';
import EmployeeAttendance from '../pages/employee/employeeattendance';

const AppRoutes = ({ jobs, loading }) => {
    const currentRole = localStorage.getItem('userRole');

    return (
        <Routes>
            {/* ==========================================
                1. PUBLIC ROUTES (Ai cũng vào được)
            ========================================== */}
            <Route path="/" element={<><Navbar /><Home jobs={jobs} loading={loading} /></>} />
            <Route path="/dang-nhap" element={<><Navbar /><DangNhap /></>} />

            {/* ==========================================
                2. ADMIN ROUTES (Chỉ dành cho Admin)
            ========================================== */}
            <Route path="/admin" element={currentRole === 'admin' ? <AdminLayout /> : <Navigate to="/dang-nhap" replace />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="employees" element={<Employees />} />
                <Route path="phong-ban" element={<PhongBan />} />
                <Route path="cham-cong" element={<Attendance />} />
                <Route path="leaves" element={<Leaves />} />
                <Route path="jobs" element={<Job />} />
                <Route path="salary" element={<Salaries />} />
                <Route path="contracts" element={<Contracts />} />
                <Route path="accounts" element={<Accounts />} />
                <Route path="notifications" element={<Notifications />} />
            </Route>

            {/* ==========================================
                3. MANAGER ROUTES (Chỉ dành cho Manager)
            ========================================== */}
            <Route path="/manager" element={currentRole === 'manager' ? <ManagerLayout /> : <Navigate to="/dang-nhap" replace />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<ManagerDashboard />} />
                <Route path="employees" element={<ManagerEmployee />} />
                <Route path="attendance" element={<ManagerAttendance />} />
                <Route path="salary" element={<ManagerSalaries />} />
                <Route path="contracts" element={<ManagerContracts />} />
                <Route path="notifications" element={<ManagerNotifications />} />
                <Route path="leaves" element={<ManagerLeaves />} />
            </Route>

            {/* ==========================================
                4. EMPLOYEE ROUTES (Chỉ dành cho Nhân viên)
            ========================================== */}
            <Route path="/employee" element={currentRole === 'employee' ? <EmployeeLayout /> : <Navigate to="/dang-nhap" replace />}>
                <Route index element={<Navigate to="home" replace />} />
                <Route path="home" element={<HomeEmployee />} />
                <Route path="profile" element={<ProfileEmployee />} />
                <Route path="attendance" element={<EmployeeAttendance />} />

                {/* Các trang đang phát triển cho role Employee */}
                
               
                <Route path="leave" element={<Developing pageName="Gửi đơn xin nghỉ" />} />
                <Route path="salary" element={<Developing pageName="Phiếu lương cá nhân" />} />
            </Route>

            {/* 404 NOT FOUND */}
            <Route path="*" element={<><Navbar /><NotFound /></>} />
        </Routes>
    );
};

export default AppRoutes;