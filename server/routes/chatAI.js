const express = require('express');
const router = express.Router();
const Groq = require("groq-sdk");
const fs = require('fs');
const path = require('path');

module.exports = (db) => {
    const dbPromise = db.promise ? db.promise() : db;
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const getAllKnowledge = () => {
        try {
            const docsPath = path.resolve(__dirname, '../docs/');
            if (!fs.existsSync(docsPath)) return "";
            const files = fs.readdirSync(docsPath).filter(f => f.endsWith('.txt'));
            return files.map(file => {
                const content = fs.readFileSync(path.join(docsPath, file), 'utf-8');
                return `\n--- Tài liệu: ${file} ---\n${content}\n`;
            }).join('');
        } catch { return ""; }
    };

    router.post('/ask-ai', async (req, res) => {
        const { question, empId, role, deptId } = req.body;

        try {
            // --- 1. SQL MASTER ENGINE: QUÉT TOÀN BỘ LINH HỒN DATABASE ---
            const [masterData] = await dbPromise.execute(`
                SELECT 
                    /* Thống kê sơ đồ và Trưởng phòng */
                    (SELECT GROUP_CONCAT(CONCAT(d.name, ': ', COALESCE(e.full_name, 'Trống')) SEPARATOR ' | ') 
                     FROM departments d LEFT JOIN employees e ON d.manager_id = e.id) as managers,
                    
                    /* Top 3 nhân viên xuất sắc nhất (Dựa trên bảng performance_reviews) */
                    (SELECT GROUP_CONCAT(CONCAT(e.full_name, ' (', pr.score, 'đ): ', pr.content) SEPARATOR ' | ')
                     FROM performance_reviews pr JOIN employees e ON pr.employee_id = e.id 
                     ORDER BY pr.score DESC LIMIT 3) as top_performers,

                    /* Thống kê đi muộn toàn công ty tháng 4 và 5 */
                    (SELECT GROUP_CONCAT(CONCAT(e.full_name, ': ', late_count, ' lần') SEPARATOR ' | ')
                     FROM (SELECT emp_id, COUNT(*) as late_count FROM attendances WHERE status = 'late' GROUP BY emp_id) as lats
                     JOIN employees e ON lats.emp_id = e.id) as attendance_report,

                    /* Danh sách vị trí tuyển dụng mới nhất */
                    (SELECT GROUP_CONCAT(CONCAT(title, ' (', salary, ')') SEPARATOR ' | ') FROM jobs) as job_listings,

                    /* Tổng quỹ lương tháng gần nhất (Tháng 4) */
                    (SELECT SUM(final_salary) FROM salaries WHERE month = 4 AND year = 2026) as total_budget_apr
            `);

            let megaContext = `
            [THÔNG TIN CÔNG TY NHÓM 21]:
            - Tổng quan quản lý: ${masterData[0].managers}.
            - Báo cáo nhân viên xuất sắc: ${masterData[0].top_performers || "Chưa có đánh giá"}.
            - Báo cáo chuyên cần (Đi muộn): ${masterData[0].attendance_report || "Không có dữ liệu muộn"}.
            - Vị trí đang tuyển: ${masterData[0].job_listings}.
            
            [TÀI LIỆU QUY ĐỊNH]:
            ${getAllKnowledge()}
            `;

            // --- 2. DỮ LIỆU NGỮ CẢNH CÁ NHÂN & PHÂN QUYỀN ---
            if (role && role !== 'guest' && empId) {
                // Lấy Hồ sơ, Lương, Hợp đồng và Thông báo của người hỏi
                const [personal] = await dbPromise.execute(`
                    SELECT e.full_name, e.position, d.name as dept, c.contract_type, c.basic_salary,
                           (SELECT final_salary FROM salaries WHERE emp_id = e.id ORDER BY year DESC, month DESC LIMIT 1) as last_salary,
                           (SELECT COUNT(*) FROM attendances WHERE emp_id = e.id AND status = 'late') as my_lates,
                           (SELECT GROUP_CONCAT(CONCAT(title, ': ', content) SEPARATOR ' | ') 
                            FROM notifications WHERE scope = 'all' OR (scope = 'department' AND dep_id = e.dep_id)) as my_notifs
                    FROM employees e 
                    LEFT JOIN departments d ON e.dep_id = d.id 
                    LEFT JOIN contracts c ON e.user_id = c.user_id
                    WHERE e.id = ?`, [empId]);

                if (personal.length > 0) {
                    const p = personal[0];
                    megaContext += `\n[NGƯỜI ĐANG HỎI]: Bạn tên là ${p.full_name}, ${p.position} phòng ${p.dept}.
                    - Hợp đồng: ${p.contract_type}. Lương cơ bản: ${p.basic_salary}đ.
                    - Lương thực nhận tháng gần nhất: ${p.last_salary || 0}đ.
                    - Kỷ luật: Bạn đi muộn ${p.my_lates} lần.
                    - Thông báo mới cho bạn: ${p.my_notifs || "Không có"}.`;
                }

                // Nếu là Manager, lấy thêm dữ liệu của phòng ban mình quản lý
                if (role === 'manager' && deptId) {
                    const [deptData] = await dbPromise.execute(`
                        SELECT 
                            (SELECT COUNT(*) FROM employees WHERE dep_id = ?) as team_count,
                            (SELECT GROUP_CONCAT(CONCAT(full_name, ' (KPI: ', COALESCE((SELECT score FROM performance_reviews WHERE employee_id = employees.id LIMIT 1), 'N/A'), ')') SEPARATOR ', ') FROM employees WHERE dep_id = ?) as member_details,
                            (SELECT COUNT(*) FROM leave_requests lr JOIN employees e ON lr.emp_id = e.id WHERE e.dep_id = ? AND lr.status = 'pending') as leaves_to_approve
                    `, [deptId, deptId, deptId]);

                    megaContext += `\n[DỮ LIỆU PHÒNG BAN]: Bạn quản lý ${deptData[0].team_count} nhân viên: ${deptData[0].member_details}. Hiện có ${deptData[0].leaves_to_approve} đơn nghỉ phép cần bạn duyệt.`;
                }
            }

            // --- 3. AI SUY LUẬN ---
            const completion = await groq.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content: `Bạn là Hệ thống Trợ lý AI Nhân sự cao cấp của Nhóm 21. Bạn có khả năng phân tích sâu dữ liệu Database.
                        
                        NGUYÊN TẮC PHẢN HỒI:
                        1. Phải chào bằng tên riêng nếu người dùng đã đăng nhập (trong mục [NGƯỜI ĐANG HỎI]).
                        2. Khi hỏi về lương, hãy dùng dữ liệu 'last_salary'. Nếu hỏi về hợp đồng, dùng 'contract_type'.
                        3. Nếu Manager hỏi về tình hình phòng, hãy báo cáo số người và số đơn nghỉ phép đang chờ.
                        4. Trả lời chuyên nghiệp, súc tích, dựa trên số liệu thực tế. Tuyệt đối không nhầm dữ liệu cá nhân với dữ liệu tổng.

                        DỮ LIỆU DATABASE HIỆN TẠI: ${megaContext}`
                    },
                    { role: "user", content: question }
                ],
                model: "llama-3.1-8b-instant",
            });

            res.json({ answer: completion.choices[0].message.content });

        } catch (err) {
            console.error("❌ Lỗi AI:", err.message);
            res.json({ answer: "Hệ thống AI đang phân tích Database mới, bro đợi tí nhé!" });
        }
    });

    return router;
};