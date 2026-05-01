const express = require('express');
const router = express.Router();

module.exports = (db) => {
    const dbPromise = db.promise ? db.promise() : db;

    // 1. Lấy đơn của lính trong phòng (Trừ chính Manager ra)
    router.get('/staff-leaves/:depId/:managerId', async (req, res) => {
        const { depId, managerId } = req.params;
        try {
            const sql = `
                SELECT l.*, e.full_name, e.position 
                FROM leave_requests l
                INNER JOIN employees e ON l.emp_id = e.id
                WHERE e.dep_id = ? 
                AND l.emp_id != ? -- Không lấy đơn của chính mình ở bảng duyệt
                ORDER BY l.id DESC`; 
            
            const [rows] = await dbPromise.execute(sql, [depId, managerId]);
            res.json(rows);
        } catch (err) {
            console.error("❌ LỖI STAFF-LEAVES:", err.message);
            res.status(500).json({ error: "Lỗi SQL: " + err.message });
        }
    });

    // 2. Xem lịch sử đơn cá nhân của Manager (Tự xem đơn mình gửi cho Admin)
    router.get('/my-history/:managerId', async (req, res) => {
        const { managerId } = req.params;
        try {
            const sql = `SELECT * FROM leave_requests WHERE emp_id = ? ORDER BY id DESC`;
            const [rows] = await dbPromise.execute(sql, [managerId]);
            res.json(rows);
        } catch (err) {
            console.error("❌ LỖI MY-HISTORY:", err.message);
            res.status(500).json({ error: err.message });
        }
    });

    // 3. Manager tự gửi đơn lên Admin (POST)
    router.post('/create-my-leave', async (req, res) => {
        const { emp_id, start_date, end_date, reason, leave_type } = req.body;
        try {
            const sql = `
                INSERT INTO leave_requests (emp_id, leave_type, start_date, end_date, reason, status) 
                VALUES (?, ?, ?, ?, ?, 'pending')`;
            await dbPromise.execute(sql, [emp_id, leave_type, start_date, end_date, reason]);
            res.json({ success: true, message: "Đã gửi đơn lên Admin chờ duyệt bro nhé! 🚀" });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    // 4. Duyệt đơn cho nhân viên (PUT)
    router.put('/review/:id', async (req, res) => {
        const { status } = req.body; // 'approved' hoặc 'rejected'
        const { id } = req.params;
        try {
            // Cập nhật trạng thái
            await dbPromise.execute(`UPDATE leave_requests SET status = ? WHERE id = ?`, [status, id]);
            res.json({ success: true, message: `Đã ${status === 'approved' ? 'duyệt' : 'từ chối'} đơn thành công! ✅` });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    // 5. Xóa đơn (Dùng khi Manager muốn hủy đơn của chính mình lúc còn 'pending')
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