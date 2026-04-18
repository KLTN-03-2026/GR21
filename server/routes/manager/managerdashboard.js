const express = require('express');
const router = express.Router();

module.exports = (db) => {
    router.get('/stats', async (req, res) => {
        try {
            const { depId } = req.query; // Lấy ID phòng ban của Manager từ query string
            const promisePool = db.promise();

            // Chốt chặn: Nếu không có depId thì không cho lấy dữ liệu
            if (!depId) {
                return res.status(400).json({ 
                    success: false, 
                    message: "Manager cần cung cấp mã phòng ban (depId)!" 
                });
            }

            // Chạy song song các query để tối ưu hiệu năng
            const [
                [empRes],
                [leaveRes],
                [jobRes],
                [deptRes]
            ] = await Promise.all([
                // 1. Đếm tổng nhân viên chỉ trong phòng ban này
                promisePool.query("SELECT COUNT(*) as total FROM employees WHERE dep_id = ?", [depId]),
                
                // 2. Đếm đơn nghỉ phép đang chờ duyệt của nhân viên trong phòng
                promisePool.query(`SELECT COUNT(*) as total FROM leave_requests l 
                                   JOIN employees e ON l.emp_id = e.id 
                                   WHERE e.dep_id = ? AND l.status = 'pending'`, [depId]),
                
                // 3. Đếm tin tuyển dụng thuộc phòng này (nếu có)
                promisePool.query("SELECT COUNT(*) as total FROM jobs WHERE dep_id = ?", [depId]),

                // 4. Lấy tên phòng ban để hiển thị lên Dashboard cho "xịn"
                promisePool.query("SELECT name FROM departments WHERE id = ?", [depId])
            ]);

            res.json({
                success: true,
                data: {
                    totalEmployees: empRes[0].total || 0,
                    pendingLeaves: leaveRes[0].total || 0,
                    activeJobs: jobRes[0].total || 0,
                    departmentName: deptRes[0]?.name || "N/A"
                }
            });

        } catch (error) {
            console.error("❌ Lỗi Manager Dashboard API:", error);
            res.status(500).json({
                success: false,
                message: "Lỗi server rồi bro ơi!",
                error: error.message
            });
        }
    });

    return router;
};