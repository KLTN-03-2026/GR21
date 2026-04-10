const express = require('express');
const router = express.Router();

module.exports = (db) => {

    // 1. LẤY DANH SÁCH CHẤM CÔNG (Kèm tên nhân viên)
    router.get('/', (req, res) => {
        const sql = `
            SELECT a.*, e.full_name, e.position 
            FROM attendances a
            JOIN employees e ON a.emp_id = e.id
            ORDER BY a.date DESC, a.id DESC
        `;
        db.query(sql, (err, rows) => {
            if (err) {
                console.error("❌ Lỗi lấy dữ liệu chấm công:", err.message);
                return res.status(500).send(err.message);
            }
            res.status(200).json(rows);
        });
    });

    // 2. TẠO MỚI (Dành cho Admin nhập bù hoặc hệ thống tự sinh)
    router.post('/', (req, res) => {
        const { emp_id, date, check_in, check_out, status } = req.body;
        // status truyền lên phải là: 'present', 'late', hoặc 'absent'
        const sql = "INSERT INTO attendances (emp_id, date, check_in, check_out, status) VALUES (?, ?, ?, ?, ?)";
        db.query(sql, [emp_id, date, check_in, check_out, status], (err) => {
            if (err) return res.status(500).send(err.message);
            res.status(201).json({ success: true, message: "Đã thêm dữ liệu chấm công!" });
        });
    });

    // 3. SỬA (Khi Admin cần chỉnh lại giờ giấc hoặc trạng thái)
    router.put('/:id', (req, res) => {
        const { id } = req.params;
        const { check_in, check_out, status } = req.body;
        const sql = "UPDATE attendances SET check_in=?, check_out=?, status=? WHERE id=?";
        db.query(sql, [check_in, check_out, status, id], (err) => {
            if (err) return res.status(500).send(err.message);
            res.json({ success: true });
        });
    });

    return router;
};