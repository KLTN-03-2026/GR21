const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

module.exports = (db) => {
    router.post('/login', (req, res) => {
        const { username, password } = req.body;

        console.log(`🚀 Đang kiểm tra đăng nhập cho: ${username}`);

        /**
         * ✅ GIẢI THÍCH CÂU QUERY NÂNG CẤP:
         * 1. Lấy thêm cột u.status để kiểm tra tài khoản còn hoạt động không.
         * 2. Dùng LEFT JOIN thay vì JOIN để tránh mất dữ liệu nếu nhân viên chưa hoàn thiện hồ sơ.
         */
        const sql = `
            SELECT 
                u.id, 
                u.username, 
                u.password as hashed_password,
                u.role, 
                u.status,
                e.dep_id,
                e.full_name, 
                e.position, 
                d.name AS department_name
            FROM users u
            LEFT JOIN employees e ON u.id = e.user_id
            LEFT JOIN departments d ON e.dep_id = d.id
            WHERE u.username = ?
        `;

        db.query(sql, [username], async (err, data) => {
            if (err) {
                console.error("❌ Lỗi truy vấn DB: ", err);
                return res.status(500).json({
                    success: false,
                    message: "Lỗi hệ thống cơ sở dữ liệu rồi bro!"
                });
            }

            if (data.length > 0) {
                const foundUser = data[0];
                
                // 1. So sánh mật khẩu bằng bcrypt
                const isMatch = await bcrypt.compare(password, foundUser.hashed_password);
                
                if (!isMatch) {
                    return res.status(401).json({
                        success: false,
                        message: "Sai tài khoản hoặc mật khẩu!"
                    });
                }

                // 2. 🛠️ KIỂM TRA TRẠNG THÁI TÀI KHOẢN (CHẶN NẾU INACTIVE)
                if (foundUser.status === 'inactive') {
                    console.warn(`🚫 Tài khoản ${username} đang cố đăng nhập nhưng đã bị khóa.`);
                    return res.status(403).json({
                        success: false,
                        message: "Tài khoản của bro đã bị tạm khóa! Vui lòng liên hệ Admin. 🚫"
                    });
                }

                // Xoá hashed_password trước khi gửi về client để bảo mật
                delete foundUser.hashed_password;

                console.log(`✅ ${username} đã vào hệ thống.`);
                console.log(`👤 Tên thật: ${foundUser.full_name || 'Chưa cập nhật'} | 🏢 Phòng: ${foundUser.department_name || 'N/A'}`);

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