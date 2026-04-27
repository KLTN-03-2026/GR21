const express = require('express');
const router = express.Router();

module.exports = (db) => {
    const dbPromise = db.promise ? db.promise() : db;

    // 1. [GET] Lấy danh sách chấm công Trưởng phòng
    router.get('/', async (req, res) => {
        const { startDate, endDate, dep_id, status } = req.query;
        
        let sql = `
            SELECT a.*, e.full_name, e.position, d.name as department_name
            FROM attendances a
            JOIN employees e ON a.emp_id = e.id
            JOIN departments d ON e.dep_id = d.id
            WHERE EXISTS (
                SELECT 1 FROM departments d2 WHERE d2.manager_id = e.id
            )
        `;
        const params = [];

        if (startDate && endDate) {
            sql += " AND a.date BETWEEN ? AND ?";
            params.push(startDate, endDate);
        } else if (startDate) {
            sql += " AND a.date = ?";
            params.push(startDate);
        }

        if (dep_id && dep_id !== 'all') {
            sql += " AND e.dep_id = ?";
            params.push(dep_id);
        }

        if (status && status !== 'all') {
            sql += " AND a.status = ?";
            params.push(status);
        }

        sql += " ORDER BY a.date DESC, a.id DESC";

        try {
            const [rows] = await dbPromise.execute(sql, params);
            res.status(200).json(rows);
        } catch (err) {
            res.status(500).send(err.message);
        }
    });

    // 2. [GET] Thống kê Stats cho Admin (Đã thêm trạng thái absent)
    router.get('/stats', async (req, res) => {
        const { startDate, endDate } = req.query;
        const start = startDate || new Date().toISOString().split('T')[0];
        const end = endDate || start;

        const sql = `
            SELECT 
                (SELECT COUNT(DISTINCT manager_id) FROM departments) as total_managers,
                (SELECT COUNT(*) FROM attendances a 
                 JOIN departments d ON a.emp_id = d.manager_id 
                 WHERE (a.date BETWEEN ? AND ?) AND a.status = 'present') as on_time,
                (SELECT COUNT(*) FROM attendances a 
                 JOIN departments d ON a.emp_id = d.manager_id 
                 WHERE (a.date BETWEEN ? AND ?) AND a.status = 'late') as late,
                (SELECT COUNT(*) FROM attendances a 
                 JOIN departments d ON a.emp_id = d.manager_id 
                 WHERE (a.date BETWEEN ? AND ?) AND a.status = 'absent') as absent_count
            FROM DUAL
        `;

        try {
            const [results] = await dbPromise.execute(sql, [start, end, start, end, start, end]);
            const data = results[0];
            const present = data.on_time + data.late;
            // Absent thực tế = Tổng manager - Số người có mặt (có thể dùng absent_count nếu chấm đủ)
            const absent = data.absent_count || Math.max(0, data.total_managers - present);

            res.json({
                total: data.total_managers,
                present: present,
                on_time: data.on_time,
                late: data.late,
                absent: absent
            });
        } catch (err) {
            res.status(500).send(err.message);
        }
    });

    // 3. [POST] Admin chấm công cho Manager + Nhảy lương (Chỉ tính tiền ngày present/late)
    router.post('/', async (req, res) => {
        const { emp_id, date, check_in, check_out, status } = req.body;
        const attDate = new Date(date);
        const month = attDate.getMonth() + 1;
        const year = attDate.getFullYear();

        try {
            const sqlInsert = "INSERT INTO attendances (emp_id, date, check_in, check_out, status) VALUES (?, ?, ?, ?, ?)";
            await dbPromise.execute(sqlInsert, [emp_id, date, check_in || null, check_out || null, status]);

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
            res.status(201).json({ success: true, message: "Đã ghi nhận công. Lương sếp đã tự động cập nhật theo số ngày làm! 💸" });
        } catch (err) {
            if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ message: "Ngày này sếp đã có dữ liệu rồi bro!" });
            res.status(500).send(err.message);
        }
    });

    // 4. [PUT] Admin sửa chấm công cho Manager + Nhảy lại lương chuẩn
    router.put('/:id', async (req, res) => {
        const { id } = req.params;
        const { emp_id, date, check_in, check_out, status } = req.body;
        const attDate = new Date(date);
        const month = attDate.getMonth() + 1;
        const year = attDate.getFullYear();

        try {
            await dbPromise.execute("UPDATE attendances SET check_in=?, check_out=?, status=? WHERE id=?", [check_in || null, check_out || null, status, id]);
            
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
            res.json({ success: true, message: "Cập nhật thành công! Tiền lương sếp đã được tính lại chuẩn đét. ✅" });
        } catch (err) { res.status(500).send(err.message); }
    });

    return router;
};