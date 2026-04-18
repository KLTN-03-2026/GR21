const express = require('express');
const router = express.Router();

module.exports = (db) => {
    const dbPromise = db.promise ? db.promise() : db;

    // 1. LẤY DANH SÁCH NHÂN VIÊN TRONG PHÒNG MÀ MANAGER QUẢN LÝ
    router.get('/my-team/:managerId', async (req, res) => {
        const { managerId } = req.params;
        try {
            // Bước A: Tìm xem Manager này quản lý phòng nào dựa vào manager_id trong bảng departments
            const [dept] = await dbPromise.execute(
                'SELECT id, name FROM departments WHERE manager_id = ?',
                [managerId]
            );

            if (dept.length === 0) {
                return res.status(404).json({ message: "Bro không phải là Manager của phòng nào!" });
            }

            const deptId = dept[0].id;
            const deptName = dept[0].name;

            // Bước B: Lấy nhân viên thuộc phòng đó (Đã bỏ avatar_url để tránh lỗi DB)
            const [employees] = await dbPromise.execute(
                `SELECT id, full_name, position, email, phone, gender, status 
                 FROM employees 
                 WHERE dep_id = ? AND id != ?`,
                [deptId, managerId]
            );

            res.json({
                department: deptName,
                team: employees
            });
        } catch (err) {
            console.error("LỖI LẤY TEAM:", err);
            res.status(500).json({ error: err.message });
        }
    });

    // 2. LẤY LỊCH SỬ ĐÁNH GIÁ CỦA 1 NHÂN VIÊN
    router.get('/reviews/:employeeId', async (req, res) => {
        const { employeeId } = req.params;
        try {
            const [reviews] = await dbPromise.execute(
                `SELECT r.*, e.full_name as manager_name 
                 FROM performance_reviews r
                 JOIN employees e ON r.manager_id = e.id
                 WHERE r.employee_id = ?
                 ORDER BY r.review_date DESC`,
                [employeeId]
            );
            res.json(reviews);
        } catch (err) {
            console.error("LỖI LẤY REVIEWS:", err);
            res.status(500).json({ error: err.message });
        }
    });

    // 3. GỬI ĐÁNH GIÁ MỚI CHO NHÂN VIÊN
    router.post('/reviews', async (req, res) => {
        const { employee_id, manager_id, score, title, content } = req.body;
        const review_date = new Date().toISOString().split('T')[0];

        try {
            const sql = `INSERT INTO performance_reviews 
                         (employee_id, manager_id, review_date, score, title, content) 
                         VALUES (?, ?, ?, ?, ?, ?)`;
            await dbPromise.execute(sql, [employee_id, manager_id, review_date, score, title, content]);
            
            res.json({ success: true, message: "Đã gửi đánh giá thành công! 🌟" });
        } catch (err) {
            console.error("LỖI LƯU ĐÁNH GIÁ:", err);
            res.status(500).json({ error: err.message });
        }
    });

    return router;
};