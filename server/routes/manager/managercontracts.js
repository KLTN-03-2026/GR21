const express = require('express');
const router = express.Router();

module.exports = (db) => {
    const dbPromise = db.promise ? db.promise() : db;

    router.get('/team-contracts/:managerId', async (req, res) => {
        const { managerId } = req.params;
        const cleanManagerId = String(managerId).split(':')[0];

        try {
            // SQL này cực kỳ an toàn, chỉ lấy dữ liệu thô, không tính toán gì dính tới Date
            const sql = `
                SELECT 
                    c.id, c.contract_code, c.contract_type, c.start_date, c.end_date,
                    c.basic_salary, c.allowance_meal, c.allowance_parking,
                    c.status as contract_status, e.full_name, e.position, d.name as dept_name
                FROM contracts c
                JOIN employees e ON c.user_id = e.id
                JOIN departments d ON e.dep_id = d.id
                WHERE d.manager_id = ?
                AND c.id IN (
                    SELECT MAX(id) FROM contracts GROUP BY user_id
                )
                ORDER BY c.created_at DESC
            `;

            const [rows] = await dbPromise.execute(sql, [cleanManagerId]);

            // TÍNH DAYS_LEFT BẰNG JAVASCRIPT (Né 100% lỗi SQL)
            const processedRows = rows.map(item => {
                let daysLeft = null;
                
                // Kiểm tra nếu có end_date và không phải giá trị rác
                if (item.end_date && item.end_date !== '0000-00-00' && item.end_date !== '0000-00-00 00:00:00') {
                    const end = new Date(item.end_date);
                    const now = new Date();
                    // Nếu end_date hợp lệ thì mới tính
                    if (!isNaN(end.getTime())) {
                        const diffTime = end - now;
                        daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    }
                }
                
                return { ...item, days_left: daysLeft };
            });

            res.json(processedRows);
        } catch (err) {
            console.error("❌ LỖI DATABASE:", err.message);
            res.status(500).json({ error: err.message });
        }
    });

    // API Propose Renewal giữ nguyên...
    router.patch('/propose-renewal/:id', async (req, res) => {
        const { id } = req.params;
        const cleanId = String(id).split(':')[0];
        try {
            const [result] = await dbPromise.execute(
                "UPDATE contracts SET status = 'Chờ gia hạn' WHERE id = ? AND status = 'Hiệu lực'", 
                [cleanId]
            );
            if (result.affectedRows === 0) return res.status(400).json({ message: "Không thể đề xuất!" });
            res.json({ success: true, message: "Gửi đề xuất thành công! 🚀" });
        } catch (err) { res.status(500).json({ error: err.message }); }
    });

    return router;
};