const express = require('express');
const router = express.Router();
const db = require('../db');

// Route xử lý đăng nhập: POST /api/auth/login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const [rows] = await db.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password]);
        if (rows.length > 0) {
            const user = { id: rows[0].id, username: rows[0].username, role: rows[0].role };
            res.json({ success: true, user });
        } else {
            res.status(401).json({ success: false, message: "Sai tài khoản hoặc mật khẩu bro ơi!" });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;