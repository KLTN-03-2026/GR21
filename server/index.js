const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// 1. Kết nối MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Lk2308**', // Bro nhớ check pass này có đúng với MySQL Workbench/HeidiSQL của bro không nhé
    database: 'hrm_db'
});

db.connect(err => {
    if (err) {
        console.error("❌ Lỗi kết nối Database rồi bro ơi: ", err.message);
    } else {
        console.log("✅ Database đã thông suốt! Chiến thôi bro.");
    }
});

// --- CÁC API ROUTES ---

// Thêm cái này để fix lỗi "Unexpected token '<'" khi bro gọi /api/test ở Frontend
app.get('/api/test', (req, res) => {
    res.json({
        success: true,
        message: "Kết nối server ngon lành rồi nhé bro! Không còn lỗi HTML nữa đâu."
    });
});

// 2. API Lấy danh sách tin tuyển dụng
app.get('/api/jobs', (req, res) => {
    const sql = "SELECT * FROM jobs ORDER BY created_at DESC";
    db.query(sql, (err, data) => {
        if (err) {
            console.error("Lỗi lấy dữ liệu:", err);
            return res.status(500).json({ error: "Lỗi server rồi bro" });
        }
        return res.json(data);
    });
});

// 3. API Đăng tin tuyển dụng mới
app.post('/api/jobs', (req, res) => {
    const { title, description, salary } = req.body;
    const sql = "INSERT INTO jobs (title, description, salary) VALUES (?, ?, ?)";
    db.query(sql, [title, description, salary], (err, result) => {
        if (err) {
            console.error("Lỗi insert:", err);
            return res.status(500).json({ success: false, message: err.message });
        }
        return res.json({ success: true, insertId: result.insertId });
    });
});

// 4. API Đăng nhập
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    const sql = "SELECT * FROM users WHERE username = ? AND password = ?";
    db.query(sql, [username, password], (err, data) => {
        if (err) {
            console.error("Lỗi đăng nhập:", err);
            return res.status(500).json({ success: false });
        }

        if (data.length > 0) {
            // Đăng nhập thành công
            return res.json({ success: true, user: data[0] });
        } else {
            // Sai thông tin
            return res.status(401).json({ success: false, message: "Sai tài khoản hoặc mật khẩu rồi bro!" });
        }
    });
});

// Handle 404 cho các route không tồn tại (tránh trả về HTML mặc định)
app.use((req, res) => {
    res.status(404).json({ error: "Route này t chưa định nghĩa bro ơi!" });
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server đang nổ máy tại port ${PORT}...`);
    console.log(`🔗 Link test: http://localhost:${PORT}/api/test`);
});