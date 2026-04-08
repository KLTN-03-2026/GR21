const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// 1. Kết nối MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Lk2308**',
    database: 'hrm_db'
});

db.connect(err => {
    if (err) console.error("❌ Lỗi kết nối: ", err.message);
    else console.log("✅ Database thông suốt! Sẵn sàng chiến đấu.");
});

// 2. IMPORT ROUTES VÀ TRUYỀN DB VÀO
const employeeRoutes = require('./routes/employees')(db);
const dashboardRoutes = require('./routes/dashboard')(db);
const tuyenDungRoutes = require('./routes/tuyendung')(db);
const dangNhapRoutes = require('./routes/dangnhap')(db);
const departmentsRoute = require('./routes/departments');


// 3. ĐỊNH NGHĨA ĐƯỜNG DẪN API (NỐI DÂY)
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/jobs', tuyenDungRoutes);
app.use('/api/auth', dangNhapRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/phongban', departmentsRoute);
// Test nhanh server
app.get('/api/test', (req, res) => res.json({ success: true, message: "Server chạy ngon bro ơi!" }));

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server đang nổ máy tại port ${PORT}...`);
});