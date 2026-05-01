const express = require('express');
const router = express.Router();

module.exports = (db) => {
    const dbPromise = db.promise ? db.promise() : db;

    // 1. [POST] Nhân viên gửi đơn xin nghỉ mới
    router.post('/send', async (req, res) => {
        const { emp_id, leave_type, start_date, end_date, reason } = req.body;

        try {
            // Mặc định status là 'pending' khi mới gửi
            const sql = `
                INSERT INTO leave_requests (emp_id, leave_type, start_date, end_date, reason, status) 
                VALUES (?, ?, ?, ?, ?, 'pending')
            `;
            
            await dbPromise.execute(sql, [emp_id, leave_type, start_date, end_date, reason]);
            
            res.status(201).json({ 
                success: true, 
                message: "Đơn xin nghỉ đã được gửi thành công! Chờ sếp duyệt nhé bro. 🚀" 
            });
        } catch (err) {
            console.error("❌ LỖI GỬI ĐƠN NGHỈ PHÉP:", err.message);
            res.status(500).json({ error: "Không thể gửi đơn, bro check lại database xem!" });
        }
    });

    // 2. [GET] Lấy lịch sử đơn xin nghỉ của 1 nhân viên cụ thể
    router.get('/history/:empId', async (req, res) => {
        const { empId } = req.params;

        try {
            const sql = `
                SELECT id, leave_type, start_date, end_date, reason, status, created_at 
                FROM leave_requests 
                WHERE emp_id = ? 
                ORDER BY created_at DESC
            `;
            
            const [rows] = await dbPromise.execute(sql, [empId]);
            res.json(rows);
        } catch (err) {
            console.error("❌ LỖI LẤY LỊCH SỬ NGHỈ PHÉP:", err.message);
            res.status(500).json({ error: "Lỗi rồi bro ơi, không bốc được lịch sử đơn!" });
        }
    });

    return router;
};