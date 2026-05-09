const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs'); // 🛠️ PHẢI CÓ ĐỂ MÃ HÓA MK RESET

module.exports = (db) => {
    const dbPromise = db.promise();

    // 1. LẤY DANH SÁCH TÀI KHOẢN (JOIN ĐỂ BIẾT AI ĐANG GIỮ TÀI KHOẢN)
    router.get('/', async (req, res) => {
        try {
            const sql = `
                SELECT u.id, u.username, u.role, u.status, e.full_name, e.position, e.email 
                FROM users u
                LEFT JOIN employees e ON u.id = e.id
                ORDER BY u.id ASC
            `;
            const [rows] = await dbPromise.execute(sql);
            res.json(rows);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    // 2. CẬP NHẬT QUYỀN HẠN (ROLE)
    router.put('/:id/role', async (req, res) => {
        const { id } = req.params;
        const { role } = req.body;
        try {
            await dbPromise.execute("UPDATE users SET role = ? WHERE id = ?", [role, id]);
            res.json({ success: true, message: "Cập nhật quyền thành công! 🛡️" });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    // 3. [MỚI] CẬP NHẬT TRẠNG THÁI (STATUS: active / inactive)
    router.put('/:id/status', async (req, res) => {
        const { id } = req.params;
        const { status } = req.body; // FE gửi lên 'active' hoặc 'inactive'
        try {
            await dbPromise.execute("UPDATE users SET status = ? WHERE id = ?", [status, id]);
            res.json({ success: true, message: `Tài khoản đã chuyển sang: ${status === 'active' ? 'Hoạt động' : 'Ngưng hoạt động'}! ✅` });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    // 4. RESET MẬT KHẨU VỀ MẶC ĐỊNH (123456) - ĐÃ FIX MÃ HÓA BCRYPT
    router.put('/:id/reset-password', async (req, res) => {
        const { id } = req.params;
        try {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('123456', salt);

            await dbPromise.execute("UPDATE users SET password = ? WHERE id = ?", [hashedPassword, id]);
            res.json({ success: true, message: "Mật khẩu đã reset về 123456 và được mã hóa bảo mật! 🔑" });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    // 5. XÓA TÀI KHOẢN (CHỈ XÓA KHI TRẠNG THÁI LÀ INACTIVE)
    router.delete('/:id', async (req, res) => {
        const { id } = req.params;
        try {
            // Bước 1: Check trạng thái hiện tại
            const [users] = await dbPromise.execute("SELECT status FROM users WHERE id = ?", [id]);
            
            if (users.length === 0) {
                return res.status(404).json({ message: "Không tìm thấy tài khoản này bro ơi!" });
            }

            if (users[0].status === 'active') {
                return res.status(400).json({ 
                    success: false, 
                    message: "Tài khoản đang hoạt động, không được xóa bừa bãi đâu bro! Hãy chuyển sang 'Hết hoạt động' trước." 
                });
            }

            // Bước 2: Tiến hành xóa nếu đã inactive
            await dbPromise.execute("DELETE FROM employees WHERE id = ?", [id]);
            await dbPromise.execute("DELETE FROM users WHERE id = ?", [id]);
            
            res.json({ success: true, message: "Đã xóa sạch tài khoản và hồ sơ! 🗑️" });
        } catch (err) {
            console.error("Lỗi xóa tài khoản:", err.message);
            res.status(500).json({ error: "Lỗi hệ thống khi thực hiện lệnh xóa!" });
        }
    });

    return router;
};