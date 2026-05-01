const express = require('express');
const router = express.Router();

module.exports = (db) => {
    // Đảm bảo dùng promise để xài được async/await
    const dbPromise = db.promise ? db.promise() : db;

    // Lấy danh sách lương + tự động đếm ngày công thực tế
    router.get('/my-salaries/:empId', async (req, res) => {
        const { empId } = req.params;
        try {
            // Câu lệnh SQL "ma thuật":
            // 1. SELECT * để lấy hết data bảng salaries
            // 2. Subquery để đếm số dòng trong bảng attendances khớp với tháng/năm/id
            // 3. Loại bỏ Thứ 7 (7) và Chủ nhật (1) để ra con số 22 chuẩn
            const sql = `
                SELECT s.*, 
                (
                    SELECT COUNT(*) 
                    FROM attendances a 
                    WHERE a.emp_id = s.emp_id 
                    AND MONTH(a.date) = s.month 
                    AND YEAR(a.date) = s.year
                    AND DAYOFWEEK(a.date) NOT IN (1, 7)
                ) as actual_work_days
                FROM salaries s
                WHERE s.emp_id = ? 
                ORDER BY s.year DESC, s.month DESC
            `;
            
            const [rows] = await dbPromise.execute(sql, [empId]);

            // Map lại dữ liệu để xử lý trường hợp chưa có ngày công nào (null -> 0)
            const result = rows.map(row => ({
                ...row,
                actual_work_days: row.actual_work_days || 0
            }));

            res.json(result);
        } catch (err) {
            console.error("❌ LỖI LẤY LƯƠNG:", err.message);
            res.status(500).json({ error: err.message });
        }
    });

    return router;
};