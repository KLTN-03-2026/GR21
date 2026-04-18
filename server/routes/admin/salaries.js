const express = require('express');
const router = express.Router();

module.exports = (db) => {
    const dbPromise = db.promise();

    // 1. API: Lấy danh sách lương (Đã fix logic ưu tiên Trưởng phòng)
    router.get('/', async (req, res) => {
        const { month, year } = req.query;
        try {
            const sql = `
                SELECT 
                    s.*, 
                    e.full_name, 
                    e.position, 
                    d.name as dept_name,
                    -- Xác định Trưởng phòng chính xác bằng cách join bảng departments
                    CASE WHEN d.manager_id = e.id THEN 1 ELSE 0 END as is_manager
                FROM salaries s 
                JOIN employees e ON s.emp_id = e.id 
                JOIN departments d ON e.dep_id = d.id
                WHERE s.month = ? AND s.year = ?
                AND (
                    s.status IN ('confirmed', 'paid') -- Hiện nhân viên đã duyệt/thanh toán
                    OR d.manager_id = e.id -- LUÔN HIỆN TRƯỞNG PHÒNG (Dù status là pending)
                )
                ORDER BY is_manager DESC, d.name ASC, s.emp_id ASC
            `;
            const [rows] = await dbPromise.execute(sql, [month, year]);
            res.json(rows);
        } catch (err) {
            console.error("❌ LỖI FETCH ADMIN SALARY:", err.message);
            res.status(500).json({ error: err.message });
        }
    });

    // 2. API: Tính lương thực tế (Giữ nguyên logic của bro nhưng fix Status reset)
    router.post('/generate', async (req, res) => {
        const { month, year } = req.body;
        const standardDays = 22; 
        const lateFine = 50000;  

        try {
            const [contracts] = await dbPromise.execute("SELECT user_id, basic_salary, allowance_meal, allowance_parking FROM contracts");

            for (let ct of contracts) {
                const [attendance] = await dbPromise.execute(`
                    SELECT 
                        COUNT(CASE WHEN status IN ('present', 'late') THEN 1 END) as actual_work_days,
                        COUNT(CASE WHEN status = 'late' THEN 1 END) as late_count,
                        COUNT(CASE WHEN status = 'absent' THEN 1 END) as absent_days
                    FROM attendances 
                    WHERE emp_id = ? AND MONTH(date) = ? AND YEAR(date) = ?
                `, [ct.user_id, month, year]);

                const stats = attendance[0];
                const workingDays = stats.actual_work_days || 0;
                const lateCount = stats.late_count || 0;

                const baseSalary = parseFloat(ct.basic_salary) || 0;
                const actualBase = (baseSalary / standardDays) * workingDays;
                const actualMeal = ((parseFloat(ct.allowance_meal) || 0) / standardDays) * workingDays;
                const actualParking = ((parseFloat(ct.allowance_parking) || 0) / standardDays) * workingDays;
                const deductions = lateCount * lateFine;
                const bonus = 0; 
                const finalSalary = actualBase + actualMeal + actualParking + bonus - deductions;

                const sqlSave = `
                    INSERT INTO salaries (
                        emp_id, month, year, base_salary, bonus, deductions, 
                        unpaid_days, final_salary, status, allowance_meal, allowance_parking
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)
                    ON DUPLICATE KEY UPDATE 
                        base_salary=VALUES(base_salary), 
                        bonus=VALUES(bonus), 
                        deductions=VALUES(deductions), 
                        unpaid_days=VALUES(unpaid_days), 
                        final_salary=VALUES(final_salary),
                        allowance_meal=VALUES(allowance_meal),
                        allowance_parking=VALUES(allowance_parking),
                        status=status -- GIỮ NGUYÊN STATUS CŨ (Để tránh việc đã trả rồi lại quay về pending)
                `;
                
                await dbPromise.execute(sqlSave, [
                    ct.user_id, month, year, actualBase, bonus, deductions, 
                    stats.absent_days, finalSalary, actualMeal, actualParking
                ]);
            }

            res.json({ success: true, message: `Đã tính lương tháng ${month}/${year} thành công! ✅` });
        } catch (err) {
            console.error("LỖI GENERATE SALARY:", err);
            res.status(500).json({ error: err.message });
        }
    });

    // 3. API: Cập nhật trạng thái trả lương
    router.put('/:id/status', async (req, res) => {
        const { id } = req.params;
        const { status } = req.body;
        try {
            await dbPromise.execute("UPDATE salaries SET status = ? WHERE id = ?", [status, id]);
            res.json({ success: true });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    return router;
};