const express = require('express');
const router = express.Router();

module.exports = (db) => {
    // 1. Lấy danh sách nghỉ phép CỦA CÁC TRƯỞNG PHÒNG (Managers)
    router.get('/', (req, res) => {
        // SQL Giải thích: 
        // - l.*: Lấy hết data đơn nghỉ phép
        // - e.full_name, e.position: Lấy tên và chức vụ sếp từ bảng employees
        // - d.name AS dep_name: Lấy tên phòng từ bảng departments (cột 'name' như ảnh bro gửi)
        const sql = `
            SELECT 
                l.*, 
                e.full_name, 
                e.position,
                d.name AS dep_name
            FROM leave_requests l 
            JOIN employees e ON l.emp_id = e.id 
            LEFT JOIN departments d ON e.dep_id = d.id
            WHERE e.position LIKE 'Trưởng phòng%' 
            ORDER BY l.id DESC
        `;
        
        db.query(sql, (err, rows) => {
            if (err) {
                console.error("❌ LỖI DATABASE ADMIN:", err.message);
                return res.status(500).json({ error: err.message });
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
                console.error("❌ LỖI UPDATE STATUS:", err.message);
                return res.status(500).json({ error: err.message });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Không tìm thấy đơn này" });
            }
            res.status(200).json({ success: true, message: "Cập nhật thành công!" });
        });
    });

    // 3. Xóa đơn nghỉ phép (Dành cho Admin dọn dẹp hệ thống)
    router.delete('/delete/:id', (req, res) => {
        const { id } = req.params;
        const sql = "DELETE FROM leave_requests WHERE id = ?";

        db.query(sql, [id], (err, result) => {
            if (err) {
                console.error("❌ LỖI XÓA ĐƠN:", err.message);
                return res.status(500).json({ error: err.message });
            }
            res.status(200).json({ success: true, message: "Đã xóa đơn thành công!" });
        });
    });

    return router;
};