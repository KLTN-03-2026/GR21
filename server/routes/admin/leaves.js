const express = require('express');
const router = express.Router();

module.exports = (db) => {
    // 1. Lấy danh sách nghỉ phép (Join với bảng employees để lấy tên nhân viên)
    router.get('/', (req, res) => {
        const sql = `
            SELECT 
                l.*, 
                e.full_name, 
                e.position 
            FROM leave_requests l 
            JOIN employees e ON l.emp_id = e.id 
            ORDER BY l.created_at DESC
        `;
        
        db.query(sql, (err, rows) => {
            if (err) {
                console.error("❌ LỖI DATABASE:", err);
                return res.status(500).send(err.message);
            }
            res.status(200).json(rows);
        });
    });

    // 2. Duyệt hoặc Từ chối đơn nghỉ phép
    router.put('/:id/status', (req, res) => {
        const { id } = req.params;
        const { status } = req.body; // 'approved' hoặc 'rejected'

        const sql = "UPDATE leave_requests SET status = ? WHERE id = ?";
        
        db.query(sql, [status, id], (err, result) => {
            if (err) {
                console.error("❌ LỖI UPDATE STATUS:", err);
                return res.status(500).send(err.message);
            }
            res.status(200).json({ success: true, message: "Cập nhật thành công!" });
        });
    });

    return router;
};