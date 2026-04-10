const express = require('express');
const router = express.Router();

module.exports = (db) => {
    router.get('/stats', async (req, res) => {
        try {
            const { role, depId } = req.query;
            const promisePool = db.promise();
            const isManager = role === 'manager' && depId;

            // 1. Query nhân viên
            const empSql = isManager 
                ? ["SELECT COUNT(*) as total FROM employees WHERE dep_id = ?", [depId]]
                : ["SELECT COUNT(*) as total FROM employees", []];

            // 2. Query tin tuyển dụng
            const jobSql = isManager
                ? ["SELECT COUNT(*) as total FROM jobs WHERE dep_id = ?", [depId]]
                : ["SELECT COUNT(*) as total FROM jobs", []];

            // 3. Query đơn nghỉ phép (Sửa leaves -> leave_requests)
            // Lưu ý: Bro check lại cột l.employee_id hay l.emp_id nhé
            const leaveSql = isManager
                ? [`SELECT COUNT(*) as total FROM leave_requests l 
                    JOIN employees e ON l.employee_id = e.id 
                    WHERE e.dep_id = ? AND l.status = 'Pending'`, [depId]]
                : ["SELECT COUNT(*) as total FROM leave_requests WHERE status = 'Pending'", []];

            // 4. Query biểu đồ
            const chartSql = isManager
                ? [`SELECT d.name, COUNT(e.id) as value 
                    FROM departments d 
                    LEFT JOIN employees e ON d.id = e.dep_id 
                    WHERE d.id = ? 
                    GROUP BY d.id, d.name`, [depId]]
                : [`SELECT d.name, COUNT(e.id) as value 
                    FROM departments d 
                    LEFT JOIN employees e ON d.id = e.dep_id 
                    GROUP BY d.id, d.name`, []];

            // Chạy tất cả query
            const [
                [empRes],
                [depRes],
                [jobRes],
                [leaveRes],
                [chartRes]
            ] = await Promise.all([
                promisePool.query(empSql[0], empSql[1]),
                promisePool.query("SELECT COUNT(*) as total FROM departments"),
                promisePool.query(jobSql[0], jobSql[1]),
                promisePool.query(leaveSql[0], leaveSql[1]),
                promisePool.query(chartSql[0], chartSql[1])
            ]);

            res.json({
                success: true,
                data: {
                    totalEmployees: empRes[0].total || 0,
                    totalDepartments: depRes[0].total || 0,
                    activeJobs: jobRes[0].total || 0,
                    pendingLeaves: leaveRes[0].total || 0,
                    chartData: chartRes
                }
            });

        } catch (error) {
            console.error("❌ Lỗi API Dashboard:", error);
            res.status(500).json({
                success: false,
                message: "Lỗi Server rồi bro ơi!",
                error: error.message
            });
        }
    });

    return router;
};