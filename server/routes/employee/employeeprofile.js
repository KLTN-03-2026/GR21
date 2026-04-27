const express = require('express');
const router = express.Router();

module.exports = (db) => {
    // ---------------------------------------------------------
    // 1. LẤY THÔNG TIN CHI TIẾT HỒ SƠ
    // ---------------------------------------------------------
    router.get('/:empId', async (req, res) => {
        const { empId } = req.params;

        try {
            const sql = `
                SELECT 
                    e.id, 
                    e.full_name, 
                    e.email, 
                    e.phone, 
                    e.address, 
                    e.position, 
                    e.dep_id,
                    e.join_date, -- Ngày hệ thống (đã có sẵn của bro)
                    d.name AS department_name, 
                    u.role, 
                    u.username,
                    e.user_id,
                    -- PHẦN THÊM: Lấy ngày bắt đầu nhỏ nhất từ bảng contracts (dùng user_id nối bảng)
                    (SELECT MIN(start_date) FROM contracts WHERE user_id = e.user_id) AS official_date
                FROM employees e
                LEFT JOIN departments d ON e.dep_id = d.id
                JOIN users u ON e.user_id = u.id
                WHERE e.id = ?
            `;

            const [rows] = await db.promise().execute(sql, [empId]);

            if (rows.length === 0) {
                return res.status(404).json({ message: "Không tìm thấy hồ sơ bro ơi!" });
            }

            res.json(rows[0]);
        } catch (err) {
            console.error("❌ LỖI GET PROFILE:", err.message);
            res.status(500).json({ error: err.message });
        }
    });

    // ---------------------------------------------------------
    // 2. CẬP NHẬT THÔNG TIN: EMAIL, PHONE, ADDRESS
    // ---------------------------------------------------------
    router.put('/update/:empId', async (req, res) => {
        const { empId } = req.params;
        const { email, phone, address } = req.body;

        try {
            const updateSql = `
                UPDATE employees 
                SET email = ?, phone = ?, address = ? 
                WHERE id = ?
            `;
            const [result] = await db.promise().execute(updateSql, [email, phone, address, empId]);

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Cập nhật thất bại, không tìm thấy nhân viên!" });
            }

            res.json({ success: true, message: "Hồ sơ đã được cập nhật thành công! 🔥" });
        } catch (err) {
            console.error("❌ LỖI UPDATE PROFILE:", err.message);
            res.status(500).json({ error: err.message });
        }
    });

    // ---------------------------------------------------------
    // 3. LOGIC ĐỔI MẬT KHẨU (Tác động sang bảng users)
    // ---------------------------------------------------------
    router.put('/change-password', async (req, res) => {
        const { userId, oldPassword, newPassword } = req.body;

        if (!userId || !oldPassword || !newPassword) {
            return res.status(400).json({ message: "Bro điền thiếu thông tin mật khẩu rồi!" });
        }

        try {
            const [users] = await db.promise().execute(
                "SELECT password FROM users WHERE id = ?", 
                [userId]
            );

            if (users.length === 0) {
                return res.status(404).json({ message: "Người dùng không tồn tại!" });
            }

            if (users[0].password !== oldPassword) {
                return res.status(400).json({ message: "Mật khẩu hiện tại không đúng bro ơi!" });
            }

            await db.promise().execute(
                "UPDATE users SET password = ? WHERE id = ?", 
                [newPassword, userId]
            );

            res.json({ success: true, message: "Mật khẩu mới đã được thiết lập! 🛡️" });
        } catch (err) {
            console.error("❌ LỖI CHANGE PASSWORD:", err.message);
            res.status(500).json({ error: err.message });
        }
    });

    return router;
};