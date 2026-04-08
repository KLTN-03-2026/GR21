const express = require('express');
const router = express.Router();

module.exports = (db) => {
    // 1. Lấy danh sách tin tuyển dụng (Sắp xếp tin mới nhất lên đầu)
    router.get('/', (req, res) => {
        const sql = "SELECT * FROM jobs ORDER BY created_at DESC";
        db.query(sql, (err, data) => {
            if (err) return res.status(500).json({ error: "Lỗi lấy dữ liệu" });
            res.json(data);
        });
    });

    // 2. Đăng tin mới
    router.post('/', (req, res) => {
        const { title, description, salary } = req.body;
        const sql = "INSERT INTO jobs (title, description, salary) VALUES (?, ?, ?)";
        db.query(sql, [title, description, salary], (err, result) => {
            if (err) return res.status(500).json({ success: false, message: err.message });
            res.json({ success: true, insertId: result.insertId });
        });
    });

    // 3. Xóa tin tuyển dụng (Mới thêm)
    // Đường dẫn: DELETE /api/jobs/:id
    router.delete('/:id', (req, res) => {
        const sql = "DELETE FROM jobs WHERE id = ?";
        db.query(sql, [req.params.id], (err, result) => {
            if (err) return res.status(500).json({ success: false, error: err.message });
            res.json({ success: true, message: "Đã xóa tin tuyển dụng thành công!" });
        });
    });

    // 4. Cập nhật tin tuyển dụng (Mới thêm)
    // Đường dẫn: PUT /api/jobs/:id
    router.put('/:id', (req, res) => {
        const { title, description, salary } = req.body;
        const sql = "UPDATE jobs SET title = ?, description = ?, salary = ? WHERE id = ?";
        db.query(sql, [title, description, salary, req.params.id], (err, result) => {
            if (err) return res.status(500).json({ success: false, error: err.message });
            res.json({ success: true, message: "Đã cập nhật tin thành công!" });
        });
    });

    return router;
};