const express = require('express');
const router = express.Router();
const db = require('../db');

// 1. Lấy toàn bộ danh sách tin tuyển dụng: GET /api/jobs
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM jobs ORDER BY created_at DESC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Lấy CHI TIẾT 1 tin tuyển dụng theo ID: GET /api/jobs/:id
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await db.query('SELECT * FROM jobs WHERE id = ?', [id]);
        if (rows.length > 0) {
            res.json(rows[0]);
        } else {
            res.status(404).json({ message: "Không tìm thấy tin tuyển dụng này!" });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Đăng tin mới (Admin): POST /api/jobs
router.post('/', async (req, res) => {
    const { title, description, salary } = req.body;
    try {
        await db.query('INSERT INTO jobs (title, description, salary) VALUES (?, ?, ?)', [title, description, salary]);
        res.json({ success: true, message: "Đăng tin thành công!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;