const express = require('express');
const router = express.Router();
const Groq = require("groq-sdk"); // Sử dụng Groq SDK thay cho Gemini

module.exports = (db) => {
    const dbPromise = db.promise ? db.promise() : db;

    // ✅ Khởi tạo Groq với Key từ file .env
    const groq = new Groq({
        apiKey: process.env.GROQ_API_KEY
    });

    router.post('/ask-ai', async (req, res) => {
        const { question, empId } = req.body;

        try {
            let context = "";

            // =========================
            // 📊 LẤY DATA TỪ DB (Giữ nguyên logic của bro)
            // =========================
            if (empId) {
                const [salary] = await dbPromise.execute(
                    `SELECT * FROM salaries 
                     WHERE emp_id = ? 
                     ORDER BY year DESC, month DESC 
                     LIMIT 1`,
                    [empId]
                );

                const [attendance] = await dbPromise.execute(
                    `SELECT COUNT(*) as late_count 
                     FROM attendances 
                     WHERE emp_id = ? AND status = 'late'`,
                    [empId]
                );

                context = `
Dữ liệu nhân viên (ID: ${empId}):
- Lương tháng gần nhất: ${new Intl.NumberFormat('vi-VN').format(salary[0]?.final_salary || 0)} VNĐ
- Số lần đi muộn: ${attendance[0]?.late_count || 0} lần
                `;
            } else {
                const [avgDept] = await dbPromise.execute(`
                    SELECT d.dept_name, AVG(s.final_salary) as avg_salary 
                    FROM salaries s 
                    JOIN employees e ON s.emp_id = e.id 
                    JOIN departments d ON e.dept_id = d.id 
                    GROUP BY d.dept_name
                `);

                context = `Lương trung bình theo phòng ban: ${
                    avgDept.map(d => `${d.dept_name}: ${Math.round(d.avg_salary)}đ`).join(', ')
                }`;
            }

            // =========================
            // 🚀 GỌI GROQ AI (Sử dụng Llama 3 cực nhanh)
            // =========================
            const chatCompletion = await groq.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content: `Bạn là "Trợ lý ảo HR Nhóm 21". 
                        Yêu cầu:
                        - Trả lời ngắn gọn, dễ hiểu
                        - Xưng "t" gọi người dùng là "bro"
                        - Ưu tiên trả lời dựa trên dữ liệu context: ${context}`
                    },
                    {
                        role: "user",
                        content: question
                    }
                ],
                model: "llama-3.1-8b-instant", // Model mã nguồn mở mạnh nhất hiện nay trên Groq
            });

            const answer = chatCompletion.choices[0]?.message?.content || "Bot không nghĩ ra gì rồi bro!";

            res.json({ answer });

        } catch (err) {
            console.error("❌ Lỗi AI Assistant (Groq):", err.message);
            res.status(500).json({
                answer: "Bot bận đá bóng rồi bro 😭 thử lại sau nha!"
            });
        }
    });

    return router;
};