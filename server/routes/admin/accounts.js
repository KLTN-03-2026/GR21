const express = require('express');
const router = express.Router();

module.exports = (db) => {
    const dbPromise = db.promise();

    // 1. LẤY DANH SÁCH TÀI KHOẢN (JOIN ĐỂ BIẾT AI ĐANG GIỮ TÀI KHOẢN)
    router.get('/', async (req, res) => {
        try {
            const sql = `
                SELECT u.id, u.username, u.role, e.full_name, e.position, e.email 
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

    // 3. RESET MẬT KHẨU VỀ MẶC ĐỊNH (123456)
    router.put('/:id/reset-password', async (req, res) => {
        const { id } = req.params;
        try {
            await dbPromise.execute("UPDATE users SET password = '123456' WHERE id = ?", [id]);
            res.json({ success: true, message: "Mật khẩu đã về mặc định 123456! 🔑" });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    // 4. [MỚI] XÓA TÀI KHOẢN (VÀ NHÂN VIÊN TƯƠNG ỨNG)
    router.delete('/:id', async (req, res) => {
        const { id } = req.params;
        try {
            // Xóa ở bảng employees trước (hoặc để CASCADE tự xóa)
            // T viết lệnh xóa cả 2 cho chắc chắn 100% không để lại rác
            await dbPromise.execute("DELETE FROM employees WHERE id = ?", [id]);
            await dbPromise.execute("DELETE FROM users WHERE id = ?", [id]);
            
            res.json({ success: true, message: "Đã khai tử tài khoản và hồ sơ nhân viên! 🗑️" });
        } catch (err) {
            console.error("Lỗi xóa tài khoản:", err.message);
            res.status(500).json({ error: "Không thể xóa tài khoản này bro ơi!" });
        }
    });

    return router;
};