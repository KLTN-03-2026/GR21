const express = require('express');
const router = express.Router();

module.exports = (db) => {
    router.get('/stats', async (req, res) => {
        try {
            const promisePool = db.promise();

            // Admin xem tất cả, không cần lọc theo depId
            const [
                [empRes],
                [depRes],
                [jobRes],
                [leaveRes],
                [chartRes]
            ] = await Promise.all([
                promisePool.query("SELECT COUNT(*) as total FROM employees"),
                promisePool.query("SELECT COUNT(*) as total FROM departments"),
                promisePool.query("SELECT COUNT(*) as total FROM jobs"),
                promisePool.query("SELECT COUNT(*) as total FROM leave_requests WHERE status = 'pending'"),
                promisePool.query(`SELECT d.name, COUNT(e.id) as value 
                                   FROM departments d 
                                   LEFT JOIN employees e ON d.id = e.dep_id 
                                   GROUP BY d.id, d.name`)
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
            console.error("❌ Lỗi API Admin Dashboard:", error);
            res.status(500).json({ success: false, message: "Lỗi Server rồi bro!" });
        }
    });

    return router;
};