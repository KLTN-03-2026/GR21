const express = require('express');
const router = express.Router();

module.exports = (db) => {
    const dbPromise = db.promise ? db.promise() : db;

    // 1. [GET] Lấy danh sách chấm công + Thống kê team (FIX: Loại trừ Manager)
    router.get('/my-team-attendance/:managerId', async (req, res) => {
        const { managerId } = req.params;
        const { startDate, endDate, status } = req.query;

        try {
            const [dept] = await dbPromise.execute(
                'SELECT id, name FROM departments WHERE manager_id = ?',
                [managerId]
            );

            if (dept.length === 0) return res.status(404).json({ message: "Bro không phải Manager!" });
            const deptId = dept[0].id;

            // Thống kê team - TRỪ ông Manager ra để số liệu chuẩn "đệ"
            const statsSql = `
                SELECT 
                    (SELECT COUNT(*) FROM employees WHERE dep_id = ? AND id != ?) as total_members,
                    COUNT(CASE WHEN a.status = 'present' THEN 1 END) as on_time_count,
                    COUNT(CASE WHEN a.status = 'late' THEN 1 END) as late_count,
                    COUNT(CASE WHEN a.status = 'absent' THEN 1 END) as absent_count
                FROM attendances a
                JOIN employees e ON a.emp_id = e.id
                WHERE e.dep_id = ? 
                  AND e.id != ?  -- FIX: Loại trừ chính mình khỏi thống kê
                  AND (a.date BETWEEN ? AND ?)
            `;
            const [statsResult] = await dbPromise.execute(statsSql, [deptId, managerId, deptId, managerId, startDate, endDate]);
            const stats = statsResult[0];

            // Lấy danh sách chấm công - TRỪ ông Manager ra
            let sql = `
                SELECT a.id, a.emp_id, e.full_name, e.position, a.date, a.check_in, a.check_out, a.status
                FROM attendances a
                JOIN employees e ON a.emp_id = e.id
                WHERE e.dep_id = ? 
                  AND e.id != ?  -- FIX: Cấm Manager tự nhìn thấy dòng chấm công của mình
                  AND (a.date BETWEEN ? AND ?)
            `;
            const params = [deptId, managerId, startDate, endDate];
            
            if (status && status !== 'all') {
                sql += " AND a.status = ?";
                params.push(status);
            }
            sql += " ORDER BY a.date DESC";

            const [rows] = await dbPromise.execute(sql, params);

            res.json({
                department: dept[0].name,
                stats: {
                    total: stats.total_members,
                    present: stats.on_time_count + stats.late_count,
                    on_time: stats.on_time_count,
                    late: stats.late_count,
                    absent: stats.absent_count
                },
                attendanceData: rows
            });
        } catch (err) { res.status(500).json({ error: err.message }); }
    });

    // 2. [POST] Ghi nhận chấm công mới (Giữ nguyên logic lương bro viết)
    router.post('/', async (req, res) => {
        // ... (Giữ nguyên code POST của bro)
        const { emp_id, date, check_in, check_out, status } = req.body;
        const attDate = new Date(date);
        const month = attDate.getMonth() + 1;
        const year = attDate.getFullYear();

        try {
            const sqlAttendance = "INSERT INTO attendances (emp_id, date, check_in, check_out, status) VALUES (?, ?, ?, ?, ?)";
            await dbPromise.execute(sqlAttendance, [
                emp_id, date, 
                status === 'absent' ? null : check_in, 
                status === 'absent' ? null : check_out, 
                status
            ]);

            const updateSalarySql = `
                UPDATE salaries s
                JOIN contracts c ON s.emp_id = c.user_id
                SET 
                    s.base_salary = c.basic_salary,
                    s.allowance_meal = (SELECT (c.allowance_meal / 26) * COUNT(CASE WHEN status IN ('present', 'late') THEN 1 END) FROM attendances WHERE emp_id = ? AND MONTH(date) = ? AND YEAR(date) = ?),
                    s.allowance_parking = (SELECT (c.allowance_parking / 26) * COUNT(CASE WHEN status IN ('present', 'late') THEN 1 END) FROM attendances WHERE emp_id = ? AND MONTH(date) = ? AND YEAR(date) = ?),
                    s.final_salary = (
                        SELECT (((c.basic_salary + c.allowance_meal + c.allowance_parking) / 26) * COUNT(CASE WHEN status IN ('present', 'late') THEN 1 END)) + IFNULL(s.bonus, 0) - IFNULL(s.deductions, 0)
                        FROM attendances WHERE emp_id = ? AND MONTH(date) = ? AND YEAR(date) = ?
                    )
                WHERE s.emp_id = ? AND s.month = ? AND s.year = ? AND c.status = 'Hiệu lực'
            `;

            await dbPromise.execute(updateSalarySql, [emp_id, month, year, emp_id, month, year, emp_id, month, year, emp_id, month, year]);
            res.status(201).json({ success: true, message: "Chấm công xong rồi bro! Lương đã nhảy đúng tỉ lệ ngày làm. 💸" });
        } catch (err) {
            if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ message: "Ngày này chấm rồi bro!" });
            res.status(500).json({ error: err.message });
        }
    });

    // 3. [PUT] Sửa chấm công (Giữ nguyên logic lương bro viết)
    router.put('/:id', async (req, res) => {
        // ... (Giữ nguyên code PUT của bro)
        const { id } = req.params;
        const { emp_id, date, check_in, check_out, status } = req.body;
        
        const attDate = new Date(date);
        const month = attDate.getMonth() + 1;
        const year = attDate.getFullYear();

        try {
            const sqlUpdate = "UPDATE attendances SET check_in=?, check_out=?, status=? WHERE id=?";
            await dbPromise.execute(sqlUpdate, [
                status === 'absent' ? null : check_in, 
                status === 'absent' ? null : check_out, 
                status, 
                id
            ]);

            const updateSalarySql = `
                UPDATE salaries s
                JOIN contracts c ON s.emp_id = c.user_id
                SET 
                    s.allowance_meal = (SELECT (c.allowance_meal / 26) * COUNT(CASE WHEN status IN ('present', 'late') THEN 1 END) FROM attendances WHERE emp_id = ? AND MONTH(date) = ? AND YEAR(date) = ?),
                    s.allowance_parking = (SELECT (c.allowance_parking / 26) * COUNT(CASE WHEN status IN ('present', 'late') THEN 1 END) FROM attendances WHERE emp_id = ? AND MONTH(date) = ? AND YEAR(date) = ?),
                    s.final_salary = (
                        SELECT (((c.basic_salary + c.allowance_meal + c.allowance_parking) / 26) * COUNT(CASE WHEN status IN ('present', 'late') THEN 1 END)) + IFNULL(s.bonus, 0) - IFNULL(s.deductions, 0)
                        FROM attendances WHERE emp_id = ? AND MONTH(date) = ? AND YEAR(date) = ?
                    )
                WHERE s.emp_id = ? AND s.month = ? AND s.year = ? AND c.status = 'Hiệu lực'
            `;

            await dbPromise.execute(updateSalarySql, [emp_id, month, year, emp_id, month, year, emp_id, month, year, emp_id, month, year]);

            res.json({ success: true, message: "Cập nhật công thành công, lương đệ đã nhảy lại chuẩn đét! ✅" });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    return router;
};