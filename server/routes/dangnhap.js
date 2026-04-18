const express = require('express');
const router = express.Router();

module.exports = (db) => {
    router.post('/login', (req, res) => {
        const { username, password } = req.body;

        console.log(`🚀 Đang kiểm tra đăng nhập cho: ${username}`);

        /**
         * ✅ GIẢI THÍCH CÂU QUERY:
         * 1. Lấy thông tin cơ bản từ bảng users (u)
         * 2. JOIN với bảng employees (e) để lấy full_name và position
         * 3. JOIN với bảng departments (d) thông qua dep_id của nhân viên để lấy tên phòng
         */
        const sql = `
            SELECT 
                u.id, 
                u.username, 
                u.role, 
                e.dep_id,
                e.full_name, 
                e.position, 
                d.name AS department_name
            FROM users u
            JOIN employees e ON u.id = e.user_id
            JOIN departments d ON e.dep_id = d.id
            WHERE u.username = ? AND u.password = ?
        `;

        db.query(sql, [username, password], (err, data) => {
            if (err) {
                console.error("❌ Lỗi truy vấn DB: ", err);
                return res.status(500).json({
                    success: false,
                    message: "Lỗi hệ thống cơ sở dữ liệu rồi bro!"
                });
            }

            if (data.length > 0) {
                const foundUser = data[0];

                // Vì mình SELECT cụ thể các cột nên không lo dính password
                console.log(`✅ ${username} đã vào hệ thống.`);
                console.log(`👤 Tên thật: ${foundUser.full_name} | 🏢 Phòng: ${foundUser.department_name}`);

                res.json({
                    success: true,
                    user: foundUser
                });
            } else {
                res.status(401).json({
                    success: false,
                    message: "Sai tài khoản hoặc mật khẩu!"
                });
            }
        });
    });

    return router;
};