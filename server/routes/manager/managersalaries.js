const express = require('express');
const router = express.Router();

module.exports = (db) => {
    const dbPromise = db.promise ? db.promise() : db;

    // 1. API: Lấy bảng lương team cho Manager
    router.get('/my-team-salaries/:managerId', async (req, res) => {
        const { managerId } = req.params;
        const { month, year } = req.query; 

        try {
            const [dept] = await dbPromise.execute(
                'SELECT id, name FROM departments WHERE manager_id = ?',
                [managerId]
            );

            if (dept.length === 0) return res.status(404).json({ message: "Không tìm thấy phòng ban!" });
            const deptId = dept[0].id;

            const sql = `
                SELECT 
                    s.id, s.emp_id, s.month, s.year, s.base_salary, s.bonus, s.deductions, 
                    s.unpaid_days, s.final_salary, s.status, s.allowance_meal, s.allowance_parking,
                    e.full_name, e.position,
                    (s.allowance_meal + s.allowance_parking) as total_allowance
                FROM salaries s
                JOIN employees e ON s.emp_id = e.id
                WHERE e.dep_id = ? AND s.month = ? AND s.year = ?
                ORDER BY s.final_salary DESC
            `;

            const [rows] = await dbPromise.execute(sql, [deptId, month, year]);

            const stats = {
                total_budget: rows.reduce((sum, item) => sum + parseFloat(item.final_salary || 0), 0),
                paid_employees: rows.filter(item => item.status === 'paid').length,
                pending_employees: rows.filter(item => item.status === 'pending').length,
                confirmed_employees: rows.filter(item => item.status === 'confirmed').length, // Mới thêm để check
                total_employees: rows.length
            };

            res.json({
                department: dept[0].name,
                stats: stats,
                salaryData: rows
            });

        } catch (err) {
            console.error("❌ LỖI SQL SALARY:", err.message);
            res.status(500).json({ error: err.message });
        }
    });

    // 2. [MỚI] API: Manager xác nhận lương của cả phòng
    router.post('/confirm-payroll', async (req, res) => {
        const { managerId, month, year } = req.body;

        try {
            // A. Lấy ID phòng ban của Manager
            const [dept] = await dbPromise.execute(
                'SELECT id FROM departments WHERE manager_id = ?',
                [managerId]
            );
            
            if (dept.length === 0) return res.status(404).json({ message: "Bạn không có quyền duyệt lương!" });
            const deptId = dept[0].id;

            // B. Cập nhật tất cả bản ghi từ 'pending' -> 'confirmed'
            const sql = `
                UPDATE salaries s
                JOIN employees e ON s.emp_id = e.id
                SET s.status = 'confirmed'
                WHERE e.dep_id = ? 
                  AND s.month = ? 
                  AND s.year = ? 
                  AND s.status = 'pending'
            `;

            const [result] = await dbPromise.execute(sql, [deptId, month, year]);

            if (result.affectedRows === 0) {
                return res.status(400).json({ message: "Không có bảng lương nào cần duyệt hoặc đã được duyệt rồi!" });
            }

            res.json({ 
                success: true, 
                message: `Đã xác nhận thành công cho ${result.affectedRows} nhân sự. Admin đã có thể thấy bảng lương này!` 
            });

        } catch (err) {
            console.error("❌ LỖI CONFIRM SALARY:", err.message);
            res.status(500).json({ error: err.message });
        }
    });

    return router;
};