const express = require('express');
const router = express.Router();

module.exports = (db) => {
    const dbPromise = db.promise();

    // 1. API: Lấy danh sách lương (Lấy từ bảng salaries)
    router.get('/', async (req, res) => {
        const { month, year, depId } = req.query; 
        try {
            let queryParams = [month, year];
            let sql = `
                SELECT 
                    s.*, e.full_name, e.position, d.name as dept_name,
                    CASE WHEN d.manager_id = e.id THEN 1 ELSE 0 END as is_manager
                FROM salaries s 
                JOIN employees e ON s.emp_id = e.id 
                JOIN departments d ON e.dep_id = d.id
                WHERE s.month = ? AND s.year = ?
            `;
            if (depId && depId !== 'all') {
                sql += ` AND e.dep_id = ? `;
                queryParams.push(depId);
            }
            sql += `
                AND (s.status IN ('confirmed', 'paid') OR d.manager_id = e.id)
                ORDER BY is_manager DESC, d.name ASC, s.emp_id ASC
            `;
            const [rows] = await dbPromise.execute(sql, queryParams);
            res.json(rows);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    // 2. API: Tính lương - FIX: Lấy lương gốc Hợp đồng & Chống trùng lặp
    router.post('/generate', async (req, res) => {
        const { month, year } = req.body;
        const standardDays = 22; 
        const lateFine = 50000;  

        try {
            // CHIÊU CUỐI: Chỉ lấy DUY NHẤT 1 hợp đồng mới nhất đang hiệu lực của mỗi người
            const [contracts] = await dbPromise.execute(`
                SELECT user_id, basic_salary, allowance_meal, allowance_parking 
                FROM contracts 
                WHERE id IN (SELECT MAX(id) FROM contracts GROUP BY user_id)
                AND status = 'Hiệu lực'
            `);

            for (let ct of contracts) {
                // Lấy chuyên cần
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

                // --- PHẦN LOGIC QUAN TRỌNG ---
                const luongGocHopDong = parseFloat(ct.basic_salary) || 0; // Con số 18tr, 20tr
                
                // Tính toán các khoản thực tế dựa trên ngày công
                const actualBase = (luongGocHopDong / standardDays) * workingDays;
                const actualMeal = ((parseFloat(ct.allowance_meal) || 0) / standardDays) * workingDays;
                const actualParking = ((parseFloat(ct.allowance_parking) || 0) / standardDays) * workingDays;
                
                const deductions = lateCount * lateFine;
                const bonus = 0; 

                // Lương thực nhận cuối cùng
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
                        allowance_parking=VALUES(allowance_parking)
                `;
                
                await dbPromise.execute(sqlSave, [
                    ct.user_id, month, year, 
                    luongGocHopDong, // <--- LƯU LƯƠNG GỐC VÀO ĐÂY (Theo ý bro)
                    bonus, 
                    deductions, 
                    stats.absent_days, 
                    finalSalary, 
                    actualMeal, 
                    actualParking
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