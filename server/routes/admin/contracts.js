const express = require('express');
const router = express.Router();

module.exports = (db) => {
    const dbPromise = db.promise ? db.promise() : db;

    // 1. LẤY DANH SÁCH NHÂN VIÊN SẴN SÀNG KÝ HỢP ĐỒNG
    router.get('/available-employees', async (req, res) => {
        try {
            const sql = `
                SELECT e.id, e.full_name, e.position 
                FROM employees e
                INNER JOIN users u ON e.id = u.id 
                WHERE e.id NOT IN (
                    SELECT user_id FROM contracts WHERE status = 'Hiệu lực'
                )
                ORDER BY e.full_name ASC
            `;
            const [rows] = await dbPromise.execute(sql);
            res.json(rows);
        } catch (err) {
            console.error("LỖI LẤY DS NHÂN VIÊN KHẢ DỤNG:", err);
            res.status(500).json({ error: err.message });
        }
    });

    // 2. LẤY DANH SÁCH TẤT CẢ HỢP ĐỒNG
    router.get('/', async (req, res) => {
        try {
            const sql = `
                SELECT c.*, e.full_name, e.position, e.identity_card, e.address
                FROM contracts c 
                JOIN employees e ON c.user_id = e.id 
                ORDER BY c.id ASC
            `;
            const [rows] = await dbPromise.execute(sql);
            res.json(rows);
        } catch (err) {
            console.error("LỖI LẤY DANH SÁCH:", err);
            res.status(500).json({ error: err.message });
        }
    });

    // 3. TẠO HỢP ĐỒNG MỚI
    router.post('/', async (req, res) => {
        const {
            user_id, contract_code, contract_type, start_date, end_date,
            basic_salary, probation_period, work_location,
            allowance_meal, allowance_parking, insurance_amount, job_description
        } = req.body;

        const final_start_date = (start_date && start_date !== '') ? start_date : new Date().toISOString().split('T')[0];

        try {
            const sql = `
                INSERT INTO contracts (
                    user_id, contract_code, contract_type, start_date, end_date, 
                    basic_salary, status, probation_period, work_location, 
                    allowance_meal, allowance_parking, insurance_amount, job_description
                ) VALUES (?, ?, ?, ?, ?, ?, 'Hiệu lực', ?, ?, ?, ?, ?, ?)
            `;

            await dbPromise.execute(sql, [
                user_id, 
                contract_code, 
                contract_type || 'Chính thức', 
                final_start_date,
                end_date || null, 
                basic_salary || 0, 
                probation_period || '02 tháng', 
                work_location || 'Văn phòng Nhóm 21', 
                allowance_meal || 730000, 
                allowance_parking || 100000, 
                insurance_amount || 5000000, 
                job_description || 'Nhân viên thực hiện nhiệm vụ theo sự phân công của Ban quản lý.'
            ]);

            res.json({ success: true, message: "Thêm hợp đồng mới thành công rồi bro! 🚀" });
        } catch (err) {
            console.error("LỖI THÊM HỢP ĐỒNG:", err);
            res.status(500).json({ error: "Lỗi DB rồi: " + err.message });
        }
    });

    // 4. LẤY CHI TIẾT 1 HỢP ĐỒNG ĐỂ IN PDF (SỬ DỤNG IDENTITY_CARD VÀ ADDRESS)
    router.get('/:id', async (req, res) => {
        const { id } = req.params;
        try {
            const sql = `
                SELECT 
                    c.*, 
                    e.full_name, e.position, e.email, e.phone,
                    e.identity_card, e.address, -- ĐÃ FIX THEO DB CỦA BRO
                    d.name AS department_name
                FROM contracts c 
                JOIN employees e ON c.user_id = e.id 
                LEFT JOIN departments d ON e.dep_id = d.id
                WHERE c.id = ?
            `;
            const [rows] = await dbPromise.execute(sql, [id]);
            
            if (rows.length === 0) {
                return res.status(404).json({ message: "Không tìm thấy hợp đồng bro ơi!" });
            }
            res.json(rows[0]);
        } catch (err) {
            console.error("LỖI LẤY CHI TIẾT:", err);
            res.status(500).json({ error: err.message });
        }
    });

    // 5. CẬP NHẬT HỢP ĐỒNG
    router.put('/:id', async (req, res) => {
        const { id } = req.params;
        const {
            basic_salary, allowance_meal, allowance_parking,
            contract_type, status, job_description,
            probation_period, work_location, contract_code,
            insurance_amount, end_date
        } = req.body;

        try {
            const sql = `
                UPDATE contracts 
                SET basic_salary = ?, allowance_meal = ?, allowance_parking = ?, 
                    contract_type = ?, status = ?, job_description = ?,
                    probation_period = ?, work_location = ?, contract_code = ?,
                    insurance_amount = ?, end_date = ?
                WHERE id = ?
            `;
            await dbPromise.execute(sql, [
                basic_salary, 
                allowance_meal, 
                allowance_parking,
                contract_type, 
                status, 
                job_description,
                probation_period, 
                work_location, 
                contract_code,
                insurance_amount,
                end_date || null,
                id
            ]);
            res.json({ success: true, message: "Cập nhật hợp đồng thành công! ✅" });
        } catch (err) {
            console.error("LỖI UPDATE:", err);
            res.status(500).json({ error: err.message });
        }
    });

    return router;
};