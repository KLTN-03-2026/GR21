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
app.use('/api/auth', dangNhapRoutes);

// --- [ ROLE: ADMIN ] ---
const adminDashboard = require('./routes/admin/dashboard')(db);
const employeeRoutes = require('./routes/admin/employees')(db);
const tuyenDungRoutes = require('./routes/admin/tuyendung')(db);
const departmentsRoute = require('./routes/admin/departments'); // File này của bro ko truyền (db) vào à? Check lại nhé.
const attendanceRoutes = require('./routes/admin/attendance')(db);
const leaveRoutes = require('./routes/admin/leaves')(db);
const salaryRoutes = require('./routes/admin/salaries')(db); 
const contractRoutes = require('./routes/admin/contracts')(db);
const accountRoutes = require('./routes/admin/accounts')(db); 
const notificationRoutes = require('./routes/admin/notifications')(db);

app.use('/api/admin/dashboard', adminDashboard);
app.use('/api/employees', employeeRoutes);
app.use('/api/jobs', tuyenDungRoutes);
app.use('/api/phongban', departmentsRoute);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/salaries', salaryRoutes); 
app.use('/api/contracts', contractRoutes);
app.use('/api/accounts', accountRoutes); 
app.use('/api/notifications', notificationRoutes);

// --- [ ROLE: MANAGER ] ---
const managerDashboard = require('./routes/manager/managerdashboard')(db); 
const managerEmployeeRoutes = require('./routes/manager/manageremployee')(db);
const managerAttendance = require('./routes/manager/managerattendances')(db);
const managerSalaries = require('./routes/manager/managersalaries')(db);

app.use('/api/manager/dashboard', managerDashboard);
app.use('/api/manager/employee', managerEmployeeRoutes); // Đổi cho đồng bộ nè bro
app.use('/api/manager/attendances', managerAttendance);
app.use('/api/manager/salaries', managerSalaries);

// --- [ ROLE: EMPLOYEE (Dành cho bro sau này "sục") ] ---
// Mai mốt bro làm thì cứ khai báo vào đây cho dễ quản lý
// const employeeProfile = require('./routes/employee/profile')(db);
// app.use('/api/employee/profile', employeeProfile);


// ==========================================
// 3. TEST & KHỞI CHẠY SERVER
// ==========================================
app.get('/api/test', (req, res) => {
    res.json({ success: true, message: "Server nổ máy ngon lành rồi bro ơi!" });
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server Nhóm 21 đang chạy tại port ${PORT}...`);
    console.log(`📌 Admin: http://localhost:${PORT}/api/admin/dashboard`);
    console.log(`📌 Manager: http://localhost:${PORT}/api/manager/dashboard`);
});