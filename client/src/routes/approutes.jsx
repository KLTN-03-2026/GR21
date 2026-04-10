import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import AdminLayout from '../layouts/adminlayout';
import ManagerLayout from '../layouts/managerlayout';
import EmployeeLayout from '../layouts/employeelayout';

// Components & Pages
import Navbar from '../components/Navbar';
import Home from '../pages/home';
import DangNhap from '../pages/dangnhap';
import { NotFound, Developing } from '../components/common/statuspages';

// Admin Pages
import Dashboard from '../pages/admin/dashboard';
import Employees from '../pages/admin/employees';
import PhongBan from '../pages/admin/departments';
import Attendance from '../pages/admin/attendance';
import Leaves from '../pages/admin/leaves';
import Job from '../pages/admin/job';

// Manager Pages
import ManagerDashboard from '../pages/manager/managerdashboard';

// Employee Pages
import HomeEmployee from '../pages/employee/homeemployee';

const AppRoutes = ({ jobs, loading }) => {
    const currentRole = localStorage.getItem('userRole');

    return (
        <Routes>
            {/* --- PUBLIC ROUTES --- */}
            <Route path="/" element={<><Navbar /><Home jobs={jobs} loading={loading} /></>} />
            <Route path="/dang-nhap" element={<><Navbar /><DangNhap /></>} />

            {/* --- ADMIN ROUTES --- */}
            <Route path="/admin" element={currentRole === 'admin' ? <AdminLayout /> : <Navigate to="/dang-nhap" replace />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="employees" element={<Employees />} />
                <Route path="phong-ban" element={<PhongBan />} />
                <Route path="cham-cong" element={<Attendance />} />
                <Route path="leaves" element={<Leaves />} />
                <Route path="jobs" element={<Job />} />
                <Route path="salary" element={<Developing pageName="Quản lý lương" />} />
                <Route path="contracts" element={<Developing pageName="Quản lý hợp đồng" />} />
            </Route>

            {/* --- MANAGER ROUTES --- */}
            <Route path="/manager" element={currentRole === 'manager' ? <ManagerLayout /> : <Navigate to="/dang-nhap" replace />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<ManagerDashboard />} />
                <Route path="employees" element={<Developing pageName="Nhân sự (Manager)" />} />
                <Route path="attendance" element={<Developing pageName="Chấm công (Manager)" />} />
                <Route path="leaves" element={<Developing pageName="Nghỉ phép (Manager)" />} />
                <Route path="salary" element={<Developing pageName="Lương (Manager)" />} />
                <Route path="contracts" element={<Developing pageName="Hợp đồng (Manager)" />} />
                <Route path="notifications" element={<Developing pageName="Thông báo" />} />
            </Route>

            {/* --- EMPLOYEE ROUTES --- */}
            <Route path="/employee" element={currentRole === 'employee' ? <EmployeeLayout /> : <Navigate to="/dang-nhap" replace />}>
                <Route index element={<Navigate to="home" replace />} />
                <Route path="home" element={<HomeEmployee />} />
                <Route path="profile" element={<Developing pageName="Hồ sơ" />} />
                <Route path="attendance" element={<Developing pageName="Chấm công" />} />
                <Route path="leave" element={<Developing pageName="Xin nghỉ" />} />
                <Route path="salary" element={<Developing pageName="Phiếu lương" />} />
            </Route>

            <Route path="*" element={<><Navbar /><NotFound /></>} />
        </Routes>
    );
};

export default AppRoutes;