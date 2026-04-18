const express = require('express');
const router = express.Router();

module.exports = (db) => {
    const dbPromise = db.promise ? db.promise() : db;

    // API: Lấy danh sách chấm công + Thống kê cho Manager
    router.get('/my-team-attendance/:managerId', async (req, res) => {
        const { managerId } = req.params;
        // Nhận thêm startDate, endDate và status từ query
        const { startDate, endDate, status } = req.query;

        try {
            // Bước A: Tìm phòng ban mà Manager đang quản lý
            const [dept] = await dbPromise.execute(
                'SELECT id, name FROM departments WHERE manager_id = ?',
                [managerId]
            );

            if (dept.length === 0) {
                return res.status(404).json({ message: "Bro không phải là Manager của phòng nào!" });
            }

            const deptId = dept[0].id;
            const deptName = dept[0].name;

            // Bước B: Lấy thống kê (Stats) cho phòng ban này trong khoảng ngày đã chọn
            const statsSql = `
                SELECT 
                    (SELECT COUNT(*) FROM employees WHERE dep_id = ?) as total_members,
                    COUNT(CASE WHEN a.status = 'present' THEN 1 END) as on_time_count,
                    COUNT(CASE WHEN a.status = 'late' THEN 1 END) as late_count,
                    COUNT(DISTINCT a.emp_id) as present_members_count
                FROM attendances a
                JOIN employees e ON a.emp_id = e.id
                WHERE e.dep_id = ? AND (a.date BETWEEN ? AND ?)
            `;
            const [statsResult] = await dbPromise.execute(statsSql, [deptId, deptId, startDate, endDate]);
            const stats = statsResult[0];

            // Bước C: Lấy danh sách chi tiết kèm theo lọc trạng thái
            let sql = `
                SELECT 
                    a.id, 
                    a.emp_id, 
                    e.full_name, 
                    e.position, 
                    a.date, 
                    a.check_in, 
                    a.check_out, 
                    a.status
                FROM attendances a
                JOIN employees e ON a.emp_id = e.id
                WHERE e.dep_id = ? AND (a.date BETWEEN ? AND ?)
            `;
            const params = [deptId, startDate, endDate];

            // Nếu manager muốn lọc riêng 'late' hoặc 'present'
            if (status && status !== 'all') {
                sql += " AND a.status = ?";
                params.push(status);
            }

            sql += " ORDER BY a.date DESC, a.check_in DESC";

            const [rows] = await dbPromise.execute(sql, params);

            // Bước D: Trả về data đầy đủ
            res.json({
                department: deptName,
                stats: {
                    total: stats.total_members,
                    present: rows.length, // Tổng lượt chấm công trong danh sách đã lọc
                    on_time: stats.on_time_count,
                    late: stats.late_count,
                    absent: (stats.total_members - stats.present_members_count) > 0 
                            ? (stats.total_members - stats.present_members_count) : 0
                },
                attendanceData: rows
            });
        } catch (err) {
            console.error("LỖI LẤY CHẤM CÔNG MANAGER:", err);
            res.status(500).json({ error: err.message });
        }
    });

    return router;
};