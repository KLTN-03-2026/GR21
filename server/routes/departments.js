const express = require('express');
const router = express.Router();
const db = require('../db'); // File này dùng mysql2/promise

// 1. Lấy danh sách tất cả phòng ban (kèm Tên + Chức vụ Trưởng phòng)
router.get('/', async (req, res) => {
    try {
        const sql = `
            SELECT 
                d.id, 
                d.name, 
                d.description, 
                e.full_name AS manager_name,
                e.position AS manager_position -- Lấy thêm chức vụ sếp từ database
            FROM departments d
            LEFT JOIN employees e ON d.manager_id = e.id
        `;
        const [rows] = await db.execute(sql);
        res.status(200).json(rows);
    } catch (err) {
        console.log("LỖI LẤY PHÒNG BAN:", err);
        res.status(500).send(err.message);
    }
});

// 2. Lấy danh sách nhân viên thuộc một phòng cụ thể (Khi nhấn vào con mắt 👁️)
router.get('/:id/employees', async (req, res) => {
    const { id } = req.params; 
    try {
        // Lấy đầy đủ thông tin nhân viên bao gồm cả chức vụ (position)
        const sql = `
            SELECT id, full_name, position, email, phone 
            FROM employees 
            WHERE dep_id = ?
        `;
        const [rows] = await db.execute(sql, [id]);
        res.status(200).json(rows);
    } catch (err) {
        console.log("LỖI LẤY NHÂN VIÊN THEO PHÒNG:", err);
        res.status(500).send(err.message);
    }
});

// 3. API: Tạo phòng ban mới
router.post('/', async (req, res) => {
    const { name, description } = req.body;
    try {
        const sql = "INSERT INTO departments (name, description) VALUES (?, ?)";
        const [result] = await db.execute(sql, [name, description]);
        res.status(201).json({ id: result.insertId, name, description });
    } catch (err) {
        console.error("LỖI THÊM PHÒNG BAN:", err);
        res.status(500).send(err.message);
    }
});

module.exports = router;