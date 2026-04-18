const express = require('express');
const router = express.Router();

module.exports = (db) => {

    // 1. LẤY DANH SÁCH CHẤM CÔNG (Nâng cấp: Lọc Khoảng Ngày & Phòng Ban)
    router.get('/', (req, res) => {
        // Lấy startDate và endDate từ query để lọc theo khoảng thời gian
        const { startDate, endDate, dep_id } = req.query;
        
        let sql = `
            SELECT a.*, e.full_name, e.position, d.name as department_name
            FROM attendances a
            JOIN employees e ON a.emp_id = e.id
            JOIN departments d ON e.dep_id = d.id
            WHERE 1=1
        `;
        const params = [];

        // Logic lọc theo ngày: Nếu chọn khoảng ngày thì dùng BETWEEN, nếu chỉ có 1 ngày thì dùng dấu =
        if (startDate && endDate) {
            sql += " AND a.date BETWEEN ? AND ?";
            params.push(startDate, endDate);
        } else if (startDate) {
            sql += " AND a.date = ?";
            params.push(startDate);
        }

        // Lọc theo phòng ban
        if (dep_id && dep_id !== 'all') {
            sql += " AND e.dep_id = ?";
            params.push(dep_id);
        }

        sql += " ORDER BY a.date DESC, a.id DESC";

        db.query(sql, params, (err, rows) => {
            if (err) {
                console.error("❌ Lỗi lấy dữ liệu chấm công:", err.message);
                return res.status(500).send(err.message);
            }
            res.status(200).json(rows);
        });
    });

    // 2. API THỐNG KÊ NHANH (STATS) - Dùng để hiện Card trên Dashboard Admin
    router.get('/stats', (req, res) => {
        const { startDate, endDate } = req.query;
        
        // Nếu không truyền ngày, lấy mặc định hôm nay
        const start = startDate || new Date().toISOString().split('T')[0];
        const end = endDate || start;

        const sql = `
            SELECT 
                (SELECT COUNT(*) FROM employees) as total_emp,
                (SELECT COUNT(*) FROM attendances WHERE (date BETWEEN ? AND ?) AND status = 'present') as on_time,
                (SELECT COUNT(*) FROM attendances WHERE (date BETWEEN ? AND ?) AND status = 'late') as late,
                (SELECT COUNT(DISTINCT emp_id) FROM attendances WHERE (date BETWEEN ? AND ?)) as total_present_distinct
            FROM DUAL
        `;

        db.query(sql, [start, end, start, end, start, end], (err, results) => {
            if (err) return res.status(500).send(err.message);
            
            const data = results[0];
            const present = data.on_time + data.late;
            // Vắng mặt tính trên tổng nhân sự - số người thực tế có đi làm trong khoảng đó
            const absent = data.total_emp - data.total_present_distinct;

            res.json({
                total: data.total_emp,
                present: present,
                on_time: data.on_time,
                late: data.late,
                absent: absent > 0 ? absent : 0
            });
        });
    });

    // 3. TẠO MỚI (Admin nhập bù hoặc sửa lỗi hệ thống)
    router.post('/', (req, res) => {
        const { emp_id, date, check_in, check_out, status } = req.body;
        const sql = "INSERT INTO attendances (emp_id, date, check_in, check_out, status) VALUES (?, ?, ?, ?, ?)";
        db.query(sql, [emp_id, date, check_in, check_out, status], (err) => {
            if (err) return res.status(500).send(err.message);
            res.status(201).json({ success: true, message: "Đã thêm dữ liệu chấm công thành công bro!" });
        });
    });

    // 4. SỬA DỮ LIỆU
    router.put('/:id', (req, res) => {
        const { id } = req.params;
        const { check_in, check_out, status } = req.body;
        const sql = "UPDATE attendances SET check_in=?, check_out=?, status=? WHERE id=?";
        db.query(sql, [check_in, check_out, status, id], (err) => {
            if (err) return res.status(500).send(err.message);
            res.json({ success: true, message: "Cập nhật chấm công xong rồi bro!" });
        });
    });

    return router;
};