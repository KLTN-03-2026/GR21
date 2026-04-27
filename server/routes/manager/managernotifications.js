const express = require('express');
const router = express.Router();

module.exports = (db) => {
    const dbPromise = db.promise();

    router.post('/create', async (req, res) => {
        const { sender_id, title, content, type, scope, dep_id } = req.body;
        console.log(">>> ĐANG ĐĂNG TIN VỚI ROLE MANAGER"); // Dòng này để debug
        try {
            const sql = `INSERT INTO notifications (sender_id, sender_role, title, content, type, scope, dep_id, status) 
                         VALUES (?, 'manager', ?, ?, ?, ?, ?, 'pending')`;
            await dbPromise.execute(sql, [sender_id, title, content, type || 'info', scope || 'department', dep_id]);
            res.json({ success: true, message: "Gửi Admin duyệt thành công! ⏳" });
        } catch (err) { res.status(500).json({ error: err.message }); }
    });

    router.put('/:id', async (req, res) => {
        const { id } = req.params;
        const { userId, title, content, type } = req.body;
        try {
            const [result] = await dbPromise.execute(
                `UPDATE notifications SET title = ?, content = ?, type = ? 
                 WHERE id = ? AND sender_id = ? AND status = 'pending'`,
                [title, content, type, id, userId]
            );
            if (result.affectedRows === 0) return res.status(403).json({ error: "Cấm sửa tin đã duyệt!" });
            res.json({ success: true, message: "Cập nhật thành công!" });
        } catch (err) { res.status(500).json({ error: err.message }); }
    });

    router.delete('/:id', async (req, res) => {
        const { id } = req.params;
        const { userId } = req.query; 
        try {
            const [result] = await dbPromise.execute(
                `DELETE FROM notifications WHERE id = ? AND sender_id = ? AND status = 'pending'`, 
                [id, userId]
            );
            if (result.affectedRows === 0) return res.status(403).json({ error: "Không thể thu hồi tin này!" });
            res.json({ success: true, message: "Đã thu hồi tin!" });
        } catch (err) { res.status(500).json({ error: err.message }); }
    });

    router.get('/my-notifications/:userId', async (req, res) => {
        const { userId } = req.params;
        const { depId } = req.query;
        try {
            const sql = `
                SELECT * FROM notifications 
                WHERE (status = 'approved' AND (scope = 'all' OR (scope = 'department' AND dep_id = ?)))
                   OR (sender_id = ? AND status = 'pending')
                ORDER BY created_at DESC`;
            const [rows] = await dbPromise.execute(sql, [depId, userId]);
            res.json(rows);
        } catch (err) { res.status(500).json({ error: err.message }); }
    });

    return router;
};