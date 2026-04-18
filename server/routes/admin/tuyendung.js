const express = require('express');
const router = express.Router();

module.exports = (db) => {
    // 1. Lấy danh sách (JOIN để lấy tên phòng ban)
    router.get('/', (req, res) => {
        const sql = `
            SELECT j.*, d.name AS department_name 
            FROM jobs j
            LEFT JOIN departments d ON j.dep_id = d.id
            ORDER BY j.created_at DESC
        `;
        db.query(sql, (err, data) => {
            if (err) return res.status(500).json({ error: "Lỗi lấy dữ liệu" });
            res.json(data);
        });
    });

    // 2. Đăng tin mới (Thêm cột dep_id)
    router.post('/', (req, res) => {
        const { title, description, salary, dep_id } = req.body;
        const sql = "INSERT INTO jobs (title, description, salary, dep_id, created_at) VALUES (?, ?, ?, ?, NOW())";
        db.query(sql, [title, description, salary, dep_id], (err, result) => {
            if (err) return res.status(500).json({ success: false, message: err.message });
            res.json({ success: true, insertId: result.insertId });
        });
    });

    // 3. Cập nhật tin (Thêm cột dep_id)
    router.put('/:id', (req, res) => {
        const { title, description, salary, dep_id } = req.body;
        const sql = "UPDATE jobs SET title = ?, description = ?, salary = ?, dep_id = ? WHERE id = ?";
        db.query(sql, [title, description, salary, dep_id, req.params.id], (err, result) => {
            if (err) return res.status(500).json({ success: false, error: err.message });
            res.json({ success: true, message: "Cập nhật thành công!" });
        });
    });

    // 4. Xóa tin
    router.delete('/:id', (req, res) => {
        const sql = "DELETE FROM jobs WHERE id = ?";
        db.query(sql, [req.params.id], (err, result) => {
            if (err) return res.status(500).json({ success: false, error: err.message });
            res.json({ success: true, message: "Xóa thành công!" });
        });
    });

    return router;
};