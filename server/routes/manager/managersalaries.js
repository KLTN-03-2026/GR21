const express = require('express');
const router = express.Router();

module.exports = (db) => {
    // Đảm bảo hỗ trợ cả callback và promise
    const dbPromise = db.promise ? db.promise() : db;

    // 1. API: Lấy bảng lương team cho Manager (Bản FIX LEFT JOIN)
    router.get('/my-team-salaries/:managerId', async (req, res) => {
        const { managerId } = req.params;
        const { month, year } = req.query; 

        if (!month || !year) {
            return res.status(400).json({ message: "Vui lòng cung cấp tháng và năm!" });
        }

        try {
            // Bước 1: Tìm phòng ban mà Manager này quản lý
            const [dept] = await dbPromise.execute(
                'SELECT id, name FROM departments WHERE manager_id = ?',
                [managerId]
            );

            if (dept.length === 0) {
                return res.status(404).json({ message: "Bạn không quản lý phòng ban nào!" });
            }
            const deptId = dept[0].id;

            // Bước 2: Truy vấn lấy tất cả nhân viên thuộc phòng ban (Dùng LEFT JOIN với salaries)
            const sql = `
                SELECT 
                    e.id as emp_id, 
                    e.full_name, 
                    e.position,
                    s.id as salary_id, 
                    s.month, 
                    s.year, 
                    IFNULL(s.base_salary, 0) as basic_salary, 
                    IFNULL(s.bonus, 0) as bonus, 
                    IFNULL(s.deductions, 0) as deductions, 
                    IFNULL(s.unpaid_days, 0) as unpaid_days,
                    IFNULL(s.final_salary, 0) as final_salary, 
                    IFNULL(s.status, 'Chưa có lương') as status, 
                    IFNULL(s.allowance_meal, 0) as allowance_meal,
                    IFNULL(s.allowance_parking, 0) as allowance_parking,
                    (IFNULL(s.allowance_meal, 0) + IFNULL(s.allowance_parking, 0)) as total_allowance
                FROM employees e
                LEFT JOIN salaries s ON e.id = s.emp_id AND s.month = ? AND s.year = ?
                WHERE e.dep_id = ?
                ORDER BY e.id ASC
            `;

            const [rows] = await dbPromise.execute(sql, [month, year, deptId]);

            // Tính toán thống kê nhanh dựa trên kết quả trả về
            const stats = {
                total_budget: rows.reduce((sum, item) => sum + parseFloat(item.final_salary || 0), 0),
                paid_employees: rows.filter(item => item.status === 'paid').length,
                pending_employees: rows.filter(item => item.status === 'pending').length,
                confirmed_employees: rows.filter(item => item.status === 'confirmed').length,
                total_employees: rows.length
            };

            res.json({
                success: true,
                department: dept[0].name,
                stats: stats,
                salaryData: rows
            });

        } catch (err) {
            console.error("❌ LỖI SQL SALARY MANAGER:", err.message);
            res.status(500).json({ error: "Lỗi máy chủ khi lấy bảng lương team." });
        }
    });

    // 2. API: Manager xác nhận bảng lương của cả team
    router.post('/confirm-payroll', async (req, res) => {
        const { managerId, month, year } = req.body;

        if (!managerId || !month || !year) {
            return res.status(400).json({ message: "Thiếu thông tin xác nhận!" });
        }

        try {
            // Kiểm tra quyền của Manager
            const [dept] = await dbPromise.execute(
                'SELECT id FROM departments WHERE manager_id = ?', 
                [managerId]
            );
            
            if (dept.length === 0) {
                return res.status(403).json({ message: "Bạn không có quyền duyệt lương cho phòng ban này!" });
            }
            const deptId = dept[0].id;

            // Cập nhật trạng thái những dòng lương đang ở trạng thái 'pending'
            const sql = `
                UPDATE salaries s
                JOIN employees e ON s.emp_id = e.id
                SET s.status = 'confirmed'
                WHERE e.dep_id = ? AND s.month = ? AND s.year = ? AND s.status = 'pending'
            `;
            
            const [result] = await dbPromise.execute(sql, [deptId, month, year]);
            
            if (result.affectedRows === 0) {
                return res.status(400).json({ message: "Không có bảng lương nào đang chờ duyệt!" });
            }

            res.json({ 
                success: true, 
                message: `Đã xác nhận thành công bảng lương cho ${result.affectedRows} nhân viên.` 
            });

        } catch (err) {
            console.error("❌ LỖI XÁC NHẬN LƯƠNG:", err.message);
            res.status(500).json({ error: "Lỗi hệ thống khi duyệt lương." });
        }
    });

    return router;
};