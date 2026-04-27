const express = require('express');
const router = express.Router();

module.exports = (db) => {
    router.get('/stats/:empId', async (req, res) => {
        const { empId } = req.params;

        try {
            // 0. Lấy dep_id của nhân viên để lọc thông báo và tìm đồng nghiệp
            const [userRows] = await db.promise().execute(
                "SELECT dep_id FROM employees WHERE id = ?", 
                [empId]
            );
            const depId = userRows[0]?.dep_id;

            // 1. Đếm đơn nghỉ phép đang chờ duyệt
            const leaveSql = `
                SELECT COUNT(*) as pendingCount 
                FROM leave_requests 
                WHERE emp_id = ? AND status = 'pending'
            `;

            // 2. Đếm ngày công thực tế (Check bảng 'attendances' của bro nhé)
            const attendanceSql = `
                SELECT COUNT(*) as workDays 
                FROM attendances 
                WHERE emp_id = ? 
                AND MONTH(date) = MONTH(CURRENT_DATE()) 
                AND YEAR(date) = YEAR(CURRENT_DATE())
                AND (status = 'present' OR status = 'late')
            `;

            // 3. Lấy thông báo CHUNG (Admin gửi)
            const publicNotifSql = `
                SELECT * FROM notifications 
                WHERE scope = 'all' AND status = 'approved' 
                ORDER BY created_at DESC LIMIT 2
            `;

            // 4. Lấy thông báo NỘI BỘ (Manager gửi cho đúng dep_id)
            const deptNotifSql = `
                SELECT * FROM notifications 
                WHERE scope = 'department' AND dep_id = ? AND status = 'approved' 
                ORDER BY created_at DESC LIMIT 2
            `;

            // 5. LẤY ĐỒNG NGHIỆP: Ưu tiên Manager lên đầu danh sách
            const colleagueSql = `
                SELECT e.id, e.full_name, e.position, e.email, e.phone, a.role
                FROM employees e
                JOIN users a ON e.user_id = a.id
                WHERE e.dep_id = ? AND e.id != ? 
                ORDER BY (CASE WHEN a.role = 'manager' THEN 0 ELSE 1 END) ASC, e.full_name ASC
            `;

            // Thực thi tất cả các query song song cho tốc độ bàn thờ
            const [
                [leaveRows], 
                [attendanceRows], 
                [publicRows], 
                [deptRows],
                [colleagueRows]
            ] = await Promise.all([
                db.promise().execute(leaveSql, [empId]),
                db.promise().execute(attendanceSql, [empId]),
                db.promise().execute(publicNotifSql),
                db.promise().execute(deptNotifSql, [depId]),
                db.promise().execute(colleagueSql, [depId, empId])
            ]);

            // Trả về gói dữ liệu tổng hợp
            res.json({
                workDays: attendanceRows[0].workDays || 0,
                pendingLeaves: leaveRows[0].pendingCount || 0,
                publicNotifs: publicRows,
                deptNotifs: deptRows,
                colleagues: colleagueRows, 
                notificationsCount: publicRows.length + deptRows.length
            });

        } catch (err) {
            console.error("❌ LỖI HOME-EMPLOYEE BE:", err.message);
            res.status(500).json({ error: err.message });
        }
    });

    return router;
};