const express = require('express');
const router = express.Router();
const db = require('../../db'); 

// 1. LẤY DANH SÁCH PHÒNG BAN (JOIN ĐỂ HIỆN TÊN SẾP)
router.get('/', async (req, res) => {
    try {
        const sql = `
            SELECT 
                d.id, 
                d.name, 
                d.description, 
                d.manager_id,
                e.full_name AS manager_name,
                e.position AS manager_position
            FROM departments d
            LEFT JOIN employees e ON d.manager_id = e.id
            ORDER BY d.id ASC
        `;
        const [rows] = await db.execute(sql);
        res.status(200).json(rows);
    } catch (err) {
        console.error("LỖI LẤY PHÒNG BAN:", err);
        res.status(500).json({ error: "Không thể lấy danh sách phòng ban", details: err.message });
    }
});

// 2. LẤY NHÂN VIÊN THEO PHÒNG (DÙNG CHO MODAL XEM CHI TIẾT)
router.get('/:id/employees', async (req, res) => {
    const { id } = req.params; 
    try {
        const sql = `
            SELECT id, full_name, position, email, phone 
            FROM employees 
            WHERE dep_id = ?
            ORDER BY id ASC
        `;
        const [rows] = await db.execute(sql, [id]);
        res.status(200).json(rows);
    } catch (err) {
        console.error("LỖI LẤY NHÂN VIÊN:", err);
        res.status(500).json({ error: "Lỗi khi truy xuất nhân viên trong phòng" });
    }
});

// 3. TẠO PHÒNG BAN MỚI (FIXED UNDEFINED)
router.post('/', async (req, res) => {
    const { name, description, manager_id } = req.body;
    try {
        if (!name) {
            return res.status(400).json({ error: "Tên phòng ban không được trống nha bro!" });
        }

        const sql = "INSERT INTO departments (name, description, manager_id) VALUES (?, ?, ?)";
        
        // ✅ FIX: Ép tất cả về null nếu là undefined hoặc chuỗi rỗng
        const val = [
            name || null, 
            (description === undefined || description === "") ? null : description, 
            (manager_id === undefined || manager_id === "" || manager_id === null) ? null : manager_id
        ];

        const [result] = await db.execute(sql, val);
        
        res.status(201).json({ 
            success: true, 
            id: result.insertId, 
            message: "Tạo đơn vị mới thành công rồi bro! 🚀" 
        });
    } catch (err) {
        console.error("LỖI THÊM PHÒNG BAN:", err);
        res.status(500).json({ error: "Lỗi chèn dữ liệu vào Database", details: err.message });
    }
});

// 4. CẬP NHẬT PHÒNG BAN (FIXED UNDEFINED)
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, description, manager_id } = req.body;
    try {
        const sql = `
            UPDATE departments 
            SET name = ?, description = ?, manager_id = ? 
            WHERE id = ?
        `;
        
        // ✅ FIX: Đảm bảo không có 'undefined' lọt vào mảng tham số
        const val = [
            name || null, 
            (description === undefined || description === "") ? null : description, 
            (manager_id === undefined || manager_id === "" || manager_id === null) ? null : manager_id,
            id
        ];

        const [result] = await db.execute(sql, val);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Không tìm thấy phòng để sửa!" });
        }
        res.status(200).json({ success: true, message: "Cập nhật thành công! ✅" });
    } catch (err) {
        console.error("LỖI CẬP NHẬT:", err);
        res.status(500).json({ error: "Lỗi khi update dữ liệu", details: err.message });
    }
});

// 5. GIẢI TÁN PHÒNG BAN (XÓA)
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // Bước 1: Gỡ tất cả nhân viên khỏi phòng này (đưa dep_id về NULL) 
        await db.execute("UPDATE employees SET dep_id = NULL WHERE dep_id = ?", [id]);

        // Bước 2: Tiến hành xóa
        const sql = "DELETE FROM departments WHERE id = ?";
        const [result] = await db.execute(sql, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Phòng này không tồn tại hoặc đã xóa rồi!" });
        }
        res.status(200).json({ success: true, message: "Đã giải tán đơn vị! 🗑️" });
    } catch (err) {
        console.error("LỖI XÓA:", err);
        res.status(500).json({ error: "Không thể xóa phòng ban này" });
    }
});

module.exports = router;