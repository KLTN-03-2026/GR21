const express = require('express');
const router = express.Router();

module.exports = (db) => {
    const dbPromise = db.promise ? db.promise() : db;

    // ---------------------------------------------------------
    // 1. LẤY DANH SÁCH HỢP ĐỒNG TEAM (CÓ BỘ LỌC)
    // ---------------------------------------------------------
    router.get('/team-contracts/:managerId', async (req, res) => {
        const { managerId } = req.params;
        const { statusFilter } = req.query; 
        
        // 🛠️ LÀM SẠCH ID: Tránh lỗi 25:1
        const cleanManagerId = String(managerId).split(':')[0];

        try {
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

            // TÍNH TOÁN DAYS_LEFT
            let processedRows = rows.map(item => {
                let daysLeft = null;
                if (item.end_date && item.end_date !== '0000-00-00' && item.end_date !== '0000-00-00 00:00:00') {
                    const end = new Date(item.end_date);
                    const now = new Date();
                    if (!isNaN(end.getTime())) {
                        const diffTime = end - now;
                        daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    }
                }
                return { ...item, days_left: daysLeft };
            });

            // 🛠️ CHECK LOGIC BỘ LỌC (FILTER)
            if (statusFilter === 'sap_het_han') {
                // Chỉ lấy người có ngày hết hạn và còn <= 20 ngày
                processedRows = processedRows.filter(r => 
                    r.days_left !== null && r.days_left >= 0 && r.days_left <= 20
                );
            } else if (statusFilter === 'hieu_luc') {
                // Lấy người đang hiệu lực (bao gồm cả vô thời hạn - days_left là null)
                processedRows = processedRows.filter(r => r.contract_status === 'Hiệu lực');
            } else if (statusFilter === 'Chờ gia hạn') {
                // Lọc những người đang chờ Admin ký
                processedRows = processedRows.filter(r => r.contract_status === 'Chờ gia hạn');
            }

            res.json(processedRows);
        } catch (err) {
            console.error("❌ LỖI DATABASE:", err.message);
            res.status(500).json({ error: err.message });
        }
    });

    // ---------------------------------------------------------
    // 2. GỬI ĐỀ XUẤT GIA HẠN (FIX LỖI 404 ID)
    // ---------------------------------------------------------
    router.patch('/propose-renewal/:id', async (req, res) => {
        const { id } = req.params;
        
        // 🛠️ FIX DỨT ĐIỂM: Làm sạch ID "25:1" thành "25"
        const cleanId = String(id).split(':')[0];

        try {
            // Chỉ cập nhật nếu hợp đồng đang ở trạng thái 'Hiệu lực'
            const [result] = await dbPromise.execute(
                "UPDATE contracts SET status = 'Chờ gia hạn' WHERE id = ? AND status = 'Hiệu lực'", 
                [cleanId]
            );

            if (result.affectedRows === 0) {
                return res.status(400).json({ 
                    success: false, 
                    message: "Không tìm thấy hợp đồng phù hợp hoặc đã gửi đề xuất trước đó rồi bro!" 
                });
            }

            res.json({ success: true, message: "Gửi đề xuất gia hạn lên Admin thành công! 🚀" });
        } catch (err) {
            console.error("❌ LỖI UPDATE STATUS:", err.message);
            res.status(500).json({ error: err.message });
        }
    });

    return router;
};