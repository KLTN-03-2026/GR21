const express = require('express');
const router = express.Router();

module.exports = (db) => {
    const dbPromise = db.promise ? db.promise() : db;

    // 1. [POST] Nhân viên gửi đơn xin nghỉ mới (ĐÃ FIX CHỐNG QUÁ KHỨ)
    router.post('/send', async (req, res) => {
        const { emp_id, leave_type, start_date, end_date, reason } = req.body;

        try {
            // --- 🛠️ BỘ LỌC CHỐNG XUYÊN KHÔNG ---
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Đưa về 00:00:00 để so sánh chuẩn ngày

            const start = new Date(start_date);
            const end = new Date(end_date);

            // 1. Kiểm tra ngày bắt đầu
            if (start < today) {
                return res.status(400).json({ 
                    success: false, 
                    message: "Bro không thể xin nghỉ phép cho các ngày trong quá khứ được! 🕰️" 
                });
            }

            // 2. Kiểm tra ngày kết thúc
            if (end < start) {
                return res.status(400).json({ 
                    success: false, 
                    message: "Ngày kết thúc không được trước ngày bắt đầu đâu bro ơi!" 
                });
            }

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