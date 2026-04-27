const express = require('express');
const router = express.Router();

module.exports = (db) => {
    const dbPromise = db.promise ? db.promise() : db;

    // 1. LẤY DANH SÁCH NHÂN VIÊN CHƯA CÓ HỢP ĐỒNG (Hoặc chỉ có HĐ đã hết hiệu lực)
    router.get('/available-employees', async (req, res) => {
        try {
            const sql = `
                SELECT e.id, e.full_name, e.position 
                FROM employees e
                INNER JOIN users u ON e.id = u.id 
                WHERE e.id NOT IN (
                    SELECT user_id FROM contracts WHERE status IN ('Hiệu lực', 'Chờ gia hạn')
                )
                ORDER BY e.full_name ASC
            `;
            const [rows] = await dbPromise.execute(sql);
            res.json(rows);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    // 2. LẤY DANH SÁCH HỢP ĐỒNG (Bản Fix hiển thị đè & Logic Vô thời hạn)
    router.get('/', async (req, res) => {
        const { depId, statusFilter } = req.query;
        try {
            let queryParams = [];
            
            // Dùng Subquery để chỉ lấy 1 dòng DUY NHẤT có ID lớn nhất (mới nhất) của mỗi user_id
            let sql = `
                SELECT c.*, e.full_name, e.position, e.identity_card, e.address, e.dep_id,
                       DATEDIFF(c.end_date, CURDATE()) as days_left
                FROM contracts c 
                JOIN employees e ON c.user_id = e.id 
                WHERE c.id IN (
                    SELECT MAX(id) FROM contracts GROUP BY user_id
                )
            `;

            if (depId && depId !== 'all') {
                sql += ` AND e.dep_id = ?`;
                queryParams.push(depId);
            }

            if (statusFilter && statusFilter !== 'all') {
                if (statusFilter === 'sap_het_han') {
                    // PHẢI CÓ end_date mới tính là sắp hết hạn
                    sql += ` AND c.status = 'Hiệu lực' AND c.end_date IS NOT NULL AND DATEDIFF(c.end_date, CURDATE()) <= 20 AND DATEDIFF(c.end_date, CURDATE()) >= 0`;
                } else if (statusFilter === 'cho_gia_han') {
                    sql += ` AND c.status = 'Chờ gia hạn'`;
                } else if (statusFilter === 'da_het_han') {
                    sql += ` AND (c.status = 'Hết hiệu lực' OR (c.end_date IS NOT NULL AND c.end_date < CURDATE()))`;
                } else if (statusFilter === 'hieu_luc') {
                    // Hợp đồng vô thời hạn (end_date IS NULL) luôn nằm trong bộ lọc này
                    sql += ` AND c.status = 'Hiệu lực' AND (c.end_date IS NULL OR DATEDIFF(c.end_date, CURDATE()) > 20)`;
                }
            }
            
            sql += ` ORDER BY c.id DESC`;
            const [rows] = await dbPromise.execute(sql, queryParams);
            res.json(rows);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    // 3. TẠO HỢP ĐỒNG MỚI (Giữ nguyên logic auto tạo lương)
    router.post('/', async (req, res) => {
        const {
            user_id, contract_code, contract_type, start_date, end_date,
            basic_salary, probation_period, work_location,
            allowance_meal, allowance_parking, insurance_amount, job_description
        } = req.body;

        const final_start_date = (start_date && start_date !== '') ? start_date : new Date().toISOString().split('T')[0];
        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();

        try {
            const sqlContract = `
                INSERT INTO contracts (
                    user_id, contract_code, contract_type, start_date, end_date, 
                    basic_salary, status, probation_period, work_location, 
                    allowance_meal, allowance_parking, insurance_amount, job_description
                ) VALUES (?, ?, ?, ?, ?, ?, 'Hiệu lực', ?, ?, ?, ?, ?, ?)
            `;

            await dbPromise.execute(sqlContract, [
                user_id, contract_code || `HD-${Date.now()}`, contract_type || 'Chính thức', 
                final_start_date, (end_date && end_date !== '') ? end_date : null,
                basic_salary || 0, probation_period || '02 tháng', work_location || 'Văn phòng Nhóm 21', 
                allowance_meal || 730000, allowance_parking || 100000, insurance_amount || 5000000, 
                job_description || 'Nhân viên thực hiện nhiệm vụ theo sự phân công của Ban quản lý.'
            ]);

            const sqlCheckSalary = `SELECT id FROM salaries WHERE emp_id = ? AND month = ? AND year = ?`;
            const [existingSalary] = await dbPromise.execute(sqlCheckSalary, [user_id, currentMonth, currentYear]);

            if (existingSalary.length === 0) {
                const sqlSalary = `INSERT INTO salaries (emp_id, month, year, base_salary, allowance_meal, allowance_parking, final_salary, status) VALUES (?, ?, ?, ?, 0, 0, 0, 'pending')`;
                await dbPromise.execute(sqlSalary, [user_id, currentMonth, currentYear, basic_salary || 0]);
            }

            res.json({ success: true, message: "Hợp đồng đã lên, bảng lương đã sẵn sàng cho sếp rồi bro! 🚀" });
        } catch (err) {
            res.status(500).json({ error: "Lỗi hệ thống: " + err.message });
        }
    });

    // 4. API KÝ LẠI HỢP ĐỒNG (GIA HẠN) 
    router.post('/renew', async (req, res) => {
        const { 
            old_contract_id, user_id, contract_code, start_date, end_date, 
            basic_salary, allowance_meal, allowance_parking, contract_type
        } = req.body;

        try {
            // A. Chốt hợp đồng cũ thành Hết hiệu lực
            await dbPromise.execute("UPDATE contracts SET status = 'Hết hiệu lực' WHERE id = ?", [old_contract_id]);

            // B. Tạo hợp đồng mới 
            const sqlNew = `
                INSERT INTO contracts (
                    user_id, contract_code, contract_type, start_date, end_date, 
                    basic_salary, allowance_meal, allowance_parking, status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Hiệu lực')
            `;
            await dbPromise.execute(sqlNew, [
                user_id, contract_code, contract_type || 'Chính thức', 
                start_date, end_date || null, basic_salary, 
                allowance_meal, allowance_parking
            ]);

            res.json({ success: true, message: "Gia hạn thành công! Hợp đồng mới đã có hiệu lực. ✅" });
        } catch (err) {
            res.status(500).json({ error: "Lỗi gia hạn: " + err.message });
        }
    });

    // 5. API LỊCH SỬ HỢP ĐỒNG (Cho cái Timeline Timeline xịn xò sắp làm)
    router.get('/history/:userId', async (req, res) => {
        const { userId } = req.params;
        try {
            const sql = `
                SELECT c.*, e.full_name 
                FROM contracts c
                JOIN employees e ON c.user_id = e.id
                WHERE c.user_id = ?
                ORDER BY c.id DESC
            `;
            const [rows] = await dbPromise.execute(sql, [userId]);
            res.json(rows);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    // 6. LẤY CHI TIẾT & CẬP NHẬT
    router.get('/:id', async (req, res) => {
        const { id } = req.params;
        try {
            const sql = `SELECT c.*, e.full_name, e.position, e.email, e.phone, e.identity_card, e.address, d.name AS department_name FROM contracts c JOIN employees e ON c.user_id = e.id LEFT JOIN departments d ON e.dep_id = d.id WHERE c.id = ?`;
            const [rows] = await dbPromise.execute(sql, [id]);
            if (rows.length === 0) return res.status(404).json({ message: "Không thấy!" });
            res.json(rows[0]);
        } catch (err) { res.status(500).json({ error: err.message }); }
    });

    router.put('/:id', async (req, res) => {
        const { id } = req.params;
        const { basic_salary, allowance_meal, allowance_parking, contract_type, status, job_description, probation_period, work_location, contract_code, insurance_amount, start_date, end_date } = req.body;
        try {
            const sql = `UPDATE contracts SET basic_salary = ?, allowance_meal = ?, allowance_parking = ?, contract_type = ?, status = ?, job_description = ?, probation_period = ?, work_location = ?, contract_code = ?, insurance_amount = ?, start_date = ?, end_date = ? WHERE id = ?`;
            await dbPromise.execute(sql, [basic_salary, allowance_meal, allowance_parking, contract_type, status, job_description, probation_period, work_location, contract_code, insurance_amount, start_date, (end_date && end_date !== '') ? end_date : null, id]);
            res.json({ success: true, message: "Cập nhật thành công! ✅" });
        } catch (err) { res.status(500).json({ error: err.message }); }
    });

    return router;
};