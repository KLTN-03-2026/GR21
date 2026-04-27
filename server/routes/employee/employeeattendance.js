const express = require('express');
const router = express.Router();

module.exports = (db) => {
    // ---------------------------------------------------------
    // LẤY LỊCH SỬ CHẤM CÔNG THEO NHÂN VIÊN
    // ---------------------------------------------------------
    router.get('/:empId', async (req, res) => {
        const { empId } = req.params;
        // Mặc định lấy tháng và năm hiện tại nếu không truyền params
        const month = req.query.month || new Date().getMonth() + 1;
        const year = req.query.year || new Date().getFullYear();

        try {
            // Query bốc data từ bảng attendances của bro
            const sql = `
                SELECT 
                    id, 
                    date, 
                    check_in, 
                    check_out, 
                    status 
                FROM attendances 
                WHERE emp_id = ? AND MONTH(date) = ? AND YEAR(date) = ?
                ORDER BY date DESC
            `;
            
            const [rows] = await db.promise().execute(sql, [empId, month, year]);
            res.json(rows);

        } catch (err) {
            console.error("❌ LỖI GET ATTENDANCE:", err.message);
            res.status(500).json({ error: "Lỗi bốc dữ liệu chấm công rồi bro!" });
        }
    });

    return router;
};