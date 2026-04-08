const express = require('express');
const router = express.Router();

module.exports = (db) => {
    router.get('/stats', async (req, res) => {
        try {
            // Chuyển db sang dạng promise để dùng được await
            const promisePool = db.promise();

            // Chạy tất cả query cùng lúc (tối ưu tốc độ)
            const [
                [empRes],
                [depRes],
                [jobRes],
                [chartRes]
            ] = await Promise.all([
                promisePool.query("SELECT COUNT(*) as total FROM employees"),
                promisePool.query("SELECT COUNT(*) as total FROM departments"),
                promisePool.query("SELECT COUNT(*) as total FROM jobs"),
                promisePool.query(`
                    SELECT d.name, COUNT(e.id) as value 
                    FROM departments d 
                    LEFT JOIN employees e ON d.id = e.dep_id 
                    GROUP BY d.id, d.name
                `)
            ]);

            // Trả về dữ liệu
            res.json({
                success: true,
                data: {
                    totalEmployees: empRes[0].total || 0,
                    totalDepartments: depRes[0].total || 0,
                    activeJobs: jobRes[0].total || 0,
                    pendingLeaves: 0, // Hiện tại bro chưa đếm bảng này nên để tạm là 0
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