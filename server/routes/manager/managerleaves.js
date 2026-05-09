const express = require('express');
const router = express.Router();

module.exports = (db) => {
    const dbPromise = db.promise ? db.promise() : db;

    // 1. Lấy đơn của lính trong phòng (Trừ chính Manager ra)
    router.get('/staff-leaves/:depId/:managerId', async (req, res) => {
        const { depId, managerId } = req.params;
        const cleanManagerId = String(managerId).split(':')[0]; // Làm sạch ID phòng hờ lỗi 25:1
        
        try {
            const sql = `
                SELECT l.*, e.full_name, e.position 
                FROM leave_requests l
                INNER JOIN employees e ON l.emp_id = e.id
                WHERE e.dep_id = ? 
                AND l.emp_id != ?
                ORDER BY l.id DESC`; 
            
            const [rows] = await dbPromise.execute(sql, [depId, cleanManagerId]);
            res.json(rows);
        } catch (err) {
            console.error("❌ LỖI STAFF-LEAVES:", err.message);
            res.status(500).json({ error: "Lỗi SQL: " + err.message });
        }
    });

    // 2. Xem lịch sử đơn cá nhân của Manager (Tự xem đơn mình gửi cho Admin)
    router.get('/my-history/:managerId', async (req, res) => {
        const { managerId } = req.params;
        const cleanManagerId = String(managerId).split(':')[0];

        try {
            const sql = `SELECT * FROM leave_requests WHERE emp_id = ? ORDER BY id DESC`;
            const [rows] = await dbPromise.execute(sql, [cleanManagerId]);
            res.json(rows);
        } catch (err) {
            console.error("❌ LỖI MY-HISTORY:", err.message);
            res.status(500).json({ error: err.message });
        }
    });

    // 3. Manager tự gửi đơn lên Admin (ĐÃ FIX CHỐNG QUÁ KHỨ)
    router.post('/create-my-leave', async (req, res) => {
        const { emp_id, start_date, end_date, reason, leave_type } = req.body;

        try {
            // --- 🛠️ BỘ LỌC CHỐNG XUYÊN KHÔNG ---
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Đưa về 00:00:00 để so sánh chuẩn ngày

            const start = new Date(start_date);
            const end = new Date(end_date);

            if (start < today) {
                return res.status(400).json({ 
                    success: false, 
                    message: "Sếp ơi, không thể xin nghỉ phép cho các ngày trong quá khứ được! 🕰️" 
                });
            }

            if (end < start) {
                return res.status(400).json({ 
                    success: false, 
                    message: "Ngày kết thúc không được trước ngày bắt đầu đâu sếp ơi!" 
                });
            }

            const sql = `
                INSERT INTO leave_requests (emp_id, leave_type, start_date, end_date, reason, status) 
                VALUES (?, ?, ?, ?, ?, 'pending')`;
            
            await dbPromise.execute(sql, [emp_id, leave_type, start_date, end_date, reason]);
            
            res.json({ success: true, message: "Đã gửi đơn lên Admin chờ duyệt bro nhé! 🚀" });
        } catch (err) {
            console.error("❌ LỖI MANAGER GỬI ĐƠN:", err.message);
            res.status(500).json({ error: err.message });
        }
    });

    // 4. Duyệt đơn cho nhân viên (PUT)
    router.put('/review/:id', async (req, res) => {
        const { status } = req.body; // 'approved' hoặc 'rejected'
        const { id } = req.params;
        try {
            await dbPromise.execute(`UPDATE leave_requests SET status = ? WHERE id = ?`, [status, id]);
            res.json({ success: true, message: `Đã ${status === 'approved' ? 'duyệt' : 'từ chối'} đơn thành công! ✅` });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    // 5. Xóa đơn (Hủy đơn của chính mình)
    router.delete('/delete/:id', async (req, res) => {
        try {
            await dbPromise.execute(`DELETE FROM leave_requests WHERE id = ?`, [req.params.id]);
            res.json({ success: true, message: "Xóa đơn thành công! 🗑️" });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    return router;
};