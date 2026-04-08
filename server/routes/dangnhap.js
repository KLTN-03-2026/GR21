const express = require('express');
const router = express.Router();

module.exports = (db) => {
    router.post('/login', (req, res) => {
        const { username, password } = req.body;
        const sql = "SELECT * FROM users WHERE username = ? AND password = ?";
        db.query(sql, [username, password], (err, data) => {
            if (err) return res.status(500).json({ success: false });
            if (data.length > 0) {
                res.json({ success: true, user: data[0] });
            } else {
                res.status(401).json({ success: false, message: "Sai tài khoản hoặc mật khẩu!" });
            }
        });
    });
    return router;
};