const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs'); // 🛠️ THÊM THƯ VIỆN MÃ HÓA

module.exports = (db) => {
    // ---------------------------------------------------------
    // 1. LẤY THÔNG TIN CHI TIẾT HỒ SƠ
    // ---------------------------------------------------------
    router.get('/:empId', async (req, res) => {
        const { empId } = req.params;
        try {
            const sql = `
                SELECT 
                    e.id, e.full_name, e.email, e.phone, e.address, e.position, e.dep_id,
                    e.join_date, d.name AS department_name, u.role, u.username, e.user_id,
                    (SELECT MIN(start_date) FROM contracts WHERE user_id = e.user_id) AS official_date
                FROM employees e
                LEFT JOIN departments d ON e.dep_id = d.id
                JOIN users u ON e.user_id = u.id
                WHERE e.id = ?
            `;
            const [rows] = await db.promise().execute(sql, [empId]);
            if (rows.length === 0) return res.status(404).json({ message: "Không tìm thấy hồ sơ!" });
            res.json(rows[0]);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    // ---------------------------------------------------------
    // 2. CẬP NHẬT THÔNG TIN: EMAIL, PHONE, ADDRESS (CHẶN ĐỂ TRỐNG)
    // ---------------------------------------------------------
    router.put('/update/:empId', async (req, res) => {
        const { empId } = req.params;
        const { email, phone, address } = req.body;

        // --- BẮT ĐẦU KIỂM TRA CHẶN ĐỂ TRỐNG & ĐỊNH DẠNG ---

        // 1. Kiểm tra Email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || email.trim() === "") {
            return res.status(400).json({ message: "Email không được để trống đâu bro!" });
        }
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Định dạng Email sai rồi kìa!" });
        }

        // 2. Kiểm tra Số điện thoại (🛠️ ĐÃ FIX REGEX THOÁNG HƠN ĐỂ DỄ TEST)
        const phoneRegex = /^0[0-9]{9}$/; 
        if (!phone || phone.trim() === "") {
            return res.status(400).json({ message: "Số điện thoại là bắt buộc nhé!" });
        }
        if (!phoneRegex.test(phone)) {
            return res.status(400).json({ message: "Số điện thoại phải có 10 số và bắt đầu bằng số 0!" });
        }

        // 3. Kiểm tra Địa chỉ
        if (!address || address.trim() === "") {
            return res.status(400).json({ message: "Địa chỉ không được để trống bro ơi!" });
        }
        if (address.trim().length < 5) {
            return res.status(400).json({ message: "Địa chỉ cụ thể một chút nhé (ít nhất 5 ký tự)!" });
        }

        try {
            const updateSql = `
                UPDATE employees 
                SET email = ?, phone = ?, address = ? 
                WHERE id = ?
            `;
            const [result] = await db.promise().execute(updateSql, [email.trim(), phone.trim(), address.trim(), empId]);

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Không tìm thấy nhân viên để cập nhật!" });
            }

            res.json({ success: true, message: "Hồ sơ đã cập nhật thành công! 🔥" });
        } catch (err) {
            console.error("❌ LỖI UPDATE:", err.message);
            res.status(500).json({ error: "Lỗi hệ thống khi cập nhật!" });
        }
    });

    // ---------------------------------------------------------
    // 3. ĐỔI MẬT KHẨU (🛠️ ĐÃ TÍCH HỢP BCRYPT MÃ HÓA)
    // ---------------------------------------------------------
    router.put('/change-password', async (req, res) => {
        const { userId, oldPassword, newPassword } = req.body;

        if (!userId || !oldPassword || !newPassword || oldPassword.trim() === "" || newPassword.trim() === "") {
            return res.status(400).json({ message: "Vui lòng điền đầy đủ các ô mật khẩu!" });
        }

        // 🛠️ CHECK REGEX MẬT KHẨU MẠNH (6 ký tự, 1 Hoa, 1 Đặc biệt)
        const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*]).{6,}$/;
        if (!passwordRegex.test(newPassword)) {
            return res.status(400).json({ 
                message: "Mật khẩu mới cần ít nhất 6 ký tự, có 1 chữ HOA và 1 ký tự đặc biệt (!@#$%^&*)" 
            });
        }

        try {
            // 1. Lấy mật khẩu hiện tại (đã mã hóa) từ Database
            const [users] = await db.promise().execute("SELECT password FROM users WHERE id = ?", [userId]);
            if (users.length === 0) return res.status(404).json({ message: "User không tồn tại!" });

            const hashedOldPassword = users[0].password;

            // 2. Sử dụng bcrypt.compare để so sánh mật khẩu cũ
            const isMatch = await bcrypt.compare(oldPassword, hashedOldPassword);
            if (!isMatch) {
                return res.status(400).json({ message: "Mật khẩu hiện tại sai bét rồi bro ơi!" });
            }

            // 3. MÃ HÓA MẬT KHẨU MỚI
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newPassword, salt);

            // 4. Update mật khẩu mới đã mã hóa vào DB
            await db.promise().execute("UPDATE users SET password = ? WHERE id = ?", [hashedPassword, userId]);
            
            res.json({ success: true, message: "Đổi mật khẩu thành công! Bảo mật xịn sò luôn nhé. 🛡️" });
        } catch (err) {
            console.error("❌ LỖI ĐỔI MẬT KHẨU:", err.message);
            res.status(500).json({ error: "Lỗi hệ thống khi đổi mật khẩu!" });
        }
    });

    return router;
};