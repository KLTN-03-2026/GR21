const express = require('express');
const router = express.Router();

module.exports = (db) => {
    const dbPromise = db.promise ? db.promise() : db;

    // 📩 API 1: Ứng viên nộp đơn từ Trang chủ
    router.post('/apply', async (req, res) => {
        const { full_name, email, phone, position_apply, cv_link, note } = req.body;

        if (!full_name || !email || !phone || !position_apply) {
            return res.status(400).json({ success: false, message: "Điền thiếu thông tin rồi bro ơi!" });
        }

        try {
            const sql = `INSERT INTO applications (full_name, email, phone, position_apply, cv_link, note, status) 
                         VALUES (?, ?, ?, ?, ?, ?, 'pending')`;
            await dbPromise.execute(sql, [full_name, email, phone, position_apply, cv_link, note]);
            res.json({ success: true, message: "Gửi đơn thành công! Chờ HR liên hệ nhé bro. 🚀" });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    // 📋 API 2: Admin lấy danh sách đơn để duyệt (Dùng cho sau này)
    router.get('/all', async (req, res) => {
        try {
            const [rows] = await dbPromise.execute("SELECT * FROM applications ORDER BY id DESC");
            res.json(rows);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    return router;
};