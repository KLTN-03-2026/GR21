const express = require('express');
const router = express.Router();

module.exports = (db) => {
    const dbPromise = db.promise();

    // 1. Lấy đơn của lính trong phòng
    router.get('/staff-leaves/:depId/:managerId', async (req, res) => {
        const { depId, managerId } = req.params;
        try {
            // Fix: Bỏ e.role, dùng l.* để lấy hết data nghỉ phép, e.full_name và e.position để hiện tên/chức vụ
            const sql = `
                SELECT l.*, e.full_name, e.position 
                FROM leave_requests l
                INNER JOIN employees e ON l.emp_id = e.id
                WHERE e.dep_id = ? 
                AND l.emp_id != ?
                ORDER BY l.id DESC`; 
            
            const [rows] = await dbPromise.execute(sql, [depId, managerId]);
            res.json(rows);
        } catch (err) {
            console.error("❌ LỖI STAFF-LEAVES:", err.message);
            res.status(500).json({ error: "Lỗi SQL: " + err.message });
        }
    });

    // 2. Xem lịch sử đơn cá nhân của Manager
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

    // 3. Manager tự gửi đơn (POST)
    router.post('/create-my-leave', async (req, res) => {
        const { emp_id, start_date, end_date, reason, leave_type } = req.body;
        try {
            const sql = `
                INSERT INTO leave_requests (emp_id, leave_type, start_date, end_date, reason, status) 
                VALUES (?, ?, ?, ?, ?, 'pending')`;
            await dbPromise.execute(sql, [emp_id, leave_type, start_date, end_date, reason]);
            res.json({ success: true, message: "Đã gửi đơn lên Admin!" });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    // 4. Duyệt đơn (PUT)
    router.put('/review/:id', async (req, res) => {
        const { status } = req.body;
        try {
            await dbPromise.execute(`UPDATE leave_requests SET status = ? WHERE id = ?`, [status, req.params.id]);
            res.json({ success: true });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    // 5. Xóa đơn (DELETE)
    router.delete('/delete/:id', async (req, res) => {
        try {
            await dbPromise.execute(`DELETE FROM leave_requests WHERE id = ?`, [req.params.id]);
            res.json({ success: true });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    return router;
};