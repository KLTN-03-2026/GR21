require('dotenv').config(); // - Đưa lên đầu để AI đọc được API Key từ .env
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// ==========================================
// 1. KẾT NỐI DATABASE
// ==========================================
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Lk2308**', 
    database: 'hrm_db'
});

db.connect(err => {
    if (err) {
        console.error("❌ Lỗi kết nối Database: ", err.message);
    } else {
        console.log("✅ Database thông suốt! Nhóm 21 sẵn sàng chiến đấu.");
    }
});

// ==========================================
// 2. IMPORT & KHAI BÁO ROUTES
// ==========================================

// --- [ COMMON - DÙNG CHUNG ] ---
const dangNhapRoutes = require('./routes/dangnhap')(db);
const chatAIRoutes = require('./routes/chatAI')(db); // - Khai báo con hàng AI mới

app.use('/api/auth', dangNhapRoutes);
app.use('/api/ai', chatAIRoutes); // - Endpoint dùng chung cho cả khách và nhân viên

// --- [ ROLE: ADMIN ] ---
const adminDashboard = require('./routes/admin/dashboard')(db);
const employeeRoutes = require('./routes/admin/employees')(db);
const tuyenDungRoutes = require('./routes/admin/tuyendung')(db);
const departmentsRoute = require('./routes/admin/departments'); 
const attendanceRoutes = require('./routes/admin/attendance')(db);
const leaveRoutes = require('./routes/admin/leaves')(db);
const salaryRoutes = require('./routes/admin/salaries')(db); 
const contractRoutes = require('./routes/admin/contracts')(db);
const accountRoutes = require('./routes/admin/accounts')(db); 
const adminNotificationRoutes = require('./routes/admin/notifications')(db);

app.use('/api/admin/dashboard', adminDashboard);
app.use('/api/admin/notifications', adminNotificationRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/jobs', tuyenDungRoutes);
app.use('/api/phongban', departmentsRoute);
app.use('/api/admin/attendance', attendanceRoutes);
app.use('/api/admin/leaves', leaveRoutes);
app.use('/api/salaries', salaryRoutes); 
app.use('/api/contracts', contractRoutes);
app.use('/api/accounts', accountRoutes); 

// --- [ ROLE: MANAGER ] ---
const managerDashboard = require('./routes/manager/managerdashboard')(db); 
const managerEmployeeRoutes = require('./routes/manager/manageremployee')(db);
const managerAttendance = require('./routes/manager/managerattendances')(db);
const managerSalaries = require('./routes/manager/managersalaries')(db);
const managerContracts = require('./routes/manager/managercontracts')(db);
const managerNotificationRoutes = require('./routes/manager/managernotifications')(db);
const managerLeaveRoutes = require('./routes/manager/managerleaves')(db);

app.use('/api/manager/dashboard', managerDashboard);
app.use('/api/manager/employee', managerEmployeeRoutes); 
app.use('/api/manager/attendances', managerAttendance);
app.use('/api/manager/salaries', managerSalaries);
app.use('/api/manager/contracts', managerContracts);
app.use('/api/manager/notifications', managerNotificationRoutes); 
app.use('/api/manager/leaves', managerLeaveRoutes);

// --- [ ROLE: EMPLOYEE ] ---
const employeeHomeRoutes = require('./routes/employee/homeemployee')(db);
const employeeProfileRoute = require('./routes/employee/employeeprofile')(db);
const employeeAttendanceRoute = require('./routes/employee/employeeattendance')(db);
const employeeLeavesRoute = require('./routes/employee/employeeleaves')(db);
const employeeSalaryRoute = require('./routes/employee/employeesalary')(db);

app.use('/api/employee/home', employeeHomeRoutes);
app.use('/api/employee/profile', employeeProfileRoute);
app.use('/api/employee/attendance', employeeAttendanceRoute);
app.use('/api/employee/leave', employeeLeavesRoute);
app.use('/api/employee/salary', employeeSalaryRoute);

// ==========================================
// 3. TEST & KHỞI CHẠY SERVER
// ==========================================
app.get('/api/test', (req, res) => {
    res.json({ success: true, message: "Server nổ máy ngon lành rồi bro ơi!" });
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server Nhóm 21 đang chạy tại port ${PORT}...`);
    console.log(`📌 HR AI Assistant: http://localhost:${PORT}/api/ai/ask-ai`); // - Log check AI
    console.log(`📌 Admin Notifications: http://localhost:${PORT}/api/admin/notifications`);
    console.log(`📌 Manager Notifications: http://localhost:${PORT}/api/manager/notifications`);
});