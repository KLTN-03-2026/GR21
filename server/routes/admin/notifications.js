const express = require('express');
const router = express.Router();

module.exports = (db) => {
    const dbPromise = db.promise();

    // 1. Lấy tất cả tin (Thêm JOIN để biết Manager nào đăng)
    router.get('/', async (req, res) => {
        try {
            const sql = `
                SELECT n.*, e.full_name as sender_name, d.name as dept_name
                FROM notifications n
                LEFT JOIN employees e ON n.sender_id = e.id
                LEFT JOIN departments d ON n.dep_id = d.id
                ORDER BY n.created_at DESC
            `;
            const [rows] = await dbPromise.execute(sql);
            res.json(rows);
        } catch (err) { res.status(500).json({ error: err.message }); }
    });

    // 2. Duyệt tin (Cập nhật status sang 'approved')
    router.put('/approve/:id', async (req, res) => {
        try {
            await dbPromise.execute(
                `UPDATE notifications SET status = 'approved' WHERE id = ?`, 
                [req.params.id]
            );
            res.json({ success: true, message: "Đã duyệt thông báo! ✅" });
        } catch (err) { res.status(500).json({ error: err.message }); }
    });

    // 3. Đăng tin Admin (Mặc định 'admin', 'all', 'approved')
    router.post('/create', async (req, res) => {
        const { sender_id, title, content, type } = req.body;
        try {
            const sql = `
                INSERT INTO notifications (sender_id, sender_role, title, content, type, scope, status) 
                VALUES (?, 'admin', ?, ?, ?, 'all', 'approved')
            `;
            await dbPromise.execute(sql, [sender_id, title, content, type || 'info']);
            res.json({ success: true, message: "Đăng tin toàn công ty thành công! 🔥" });
        } catch (err) { res.status(500).json({ error: err.message }); }
    });

    // 4. Xóa tin (Chốt chặn role Admin)
    router.delete('/:id', async (req, res) => {
        const { id } = req.params;
        const { role } = req.query; 

        if (role !== 'admin') {
            return res.status(403).json({ error: "Bro không phải Admin! ❌" });
        }

        try {
            await dbPromise.execute(`DELETE FROM notifications WHERE id = ?`, [id]);
            res.json({ success: true, message: "Admin đã xóa tin!" });
        } catch (err) { res.status(500).json({ error: err.message }); }
    });

    return router;
};