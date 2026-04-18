const express = require('express');
const router = express.Router();

module.exports = (db) => {
    // Chuyển db sang dạng promise để dùng async/await cho mượt
    const dbPromise = db.promise();

    // 1. API: Lấy tất cả thông báo (Sắp xếp tin mới nhất lên đầu)
    router.get('/', async (req, res) => {
        try {
            const sql = `
                SELECT * FROM notifications 
                ORDER BY created_at DESC
            `;
            const [rows] = await dbPromise.execute(sql);
            res.json(rows);
        } catch (err) {
            console.error("Lỗi lấy thông báo:", err.message);
            res.status(500).json({ error: "Không thể lấy danh sách thông báo rồi bro!" });
        }
    });

    // 2. API: Đăng thông báo mới từ Admin
    router.post('/create', async (req, res) => {
        const { title, content, type, target_id } = req.body;
        
        // Validation nhẹ nhàng cho chắc ăn
        if (!title || !content) {
            return res.status(400).json({ error: "Tiêu đề và nội dung không được để trống nha bro!" });
        }

        try {
            const sql = `
                INSERT INTO notifications (title, content, type, target_id) 
                VALUES (?, ?, ?, ?)
            `;
            // Nếu target_id không gửi lên thì mặc định là NULL (gửi toàn cty)
            await dbPromise.execute(sql, [title, content, type || 'info', target_id || null]);
            
            res.json({ success: true, message: "Đã 'bắn' thông báo thành công rực rỡ! 📣" });
        } catch (err) {
            console.error("Lỗi đăng thông báo:", err.message);
            res.status(500).json({ error: "Lỗi hệ thống khi đăng tin rồi!" });
        }
    });

    // 3. API: Xóa thông báo (Khi tin đã hết hạn hoặc đăng nhầm)
    router.delete('/:id', async (req, res) => {
        const { id } = req.params;
        try {
            const [result] = await dbPromise.execute("DELETE FROM notifications WHERE id = ?", [id]);
            
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: "Không tìm thấy thông báo này để xóa bro ơi!" });
            }

            res.json({ success: true, message: "Đã xóa thông báo thành công!" });
        } catch (err) {
            res.status(500).json({ error: "Lỗi khi xóa thông báo!" });
        }
    });

    return router;
};