const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

module.exports = (db) => {
    // Đảm bảo dùng được promise để async/await mượt mà
    const dbPromise = db.promise ? db.promise() : db;

    // 📩 1. Cấu hình Gmail (Sử dụng mật khẩu ứng dụng bro vừa tạo)
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'lekhoa335@gmail.com', // Email của bro
            pass: 'xuhmyksskfpqialq'      // Mã 16 ký tự viết liền
        }
    });

    // 📋 2. API CHO ADMIN/MANAGER: Lấy toàn bộ đơn ứng tuyển
    router.get('/all', async (req, res) => {
        const { role, dep_name } = req.query;
        try {
            // Join 3 bảng để lấy: Thông tin đơn + Tên công việc + Tên phòng ban
            let sql = `
                SELECT 
                    a.*, 
                    j.title as job_title, 
                    d.name as dep_name 
                FROM applications a
                LEFT JOIN jobs j ON a.job_id = j.id
                LEFT JOIN departments d ON j.dep_id = d.id
            `;
            
            let params = [];
            // Nếu là Manager thì lọc theo phòng ban (d.name)
            if (role === 'manager' && dep_name) {
                sql += " WHERE d.name = ?";
                params.push(dep_name);
            }
            
            sql += " ORDER BY a.id DESC";
            
            const [rows] = await dbPromise.execute(sql, params);
            res.json(rows);
        } catch (err) {
            console.error("❌ Lỗi Backend Admin Get All:", err.message);
            res.status(500).json({ error: "Lỗi server rồi bro ơi!" });
        }
    });

    // ✅ 3. API CHO ADMIN: Cập nhật trạng thái & Gửi Gmail trúng tuyển
    router.put('/update-status/:id', async (req, res) => {
        const { status, email, full_name, job_title } = req.body;
        const { id } = req.params;

        try {
            // Cập nhật trạng thái trong database
            await dbPromise.execute("UPDATE applications SET status = ? WHERE id = ?", [status, id]);

            // Nếu Admin nhấn 'Duyệt' (hired), hệ thống tự động bắn mail
            if (status === 'hired' && email) {
                const mailOptions = {
                    from: '"NHÓM 21 HRM" <lekhòa335@gmail.com>',
                    to: email,
                    subject: `[THÔNG BÁO] CHÚC MỪNG BẠN ĐÃ TRÚNG TUYỂN - ${job_title?.toUpperCase()}`,
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e7ff; border-radius: 20px; overflow: hidden;">
                            <div style="background-color: #4f46e5; padding: 30px; text-align: center;">
                                <h1 style="color: white; margin: 0; text-transform: uppercase;">Congratulations!</h1>
                            </div>
                            <div style="padding: 30px; color: #334155;">
                                <p style="font-size: 16px;">Chào <b>${full_name} bro</b>,</p>
                                <p>Đội ngũ <b>Nhóm 21</b> rất ấn tượng với hồ sơ của bạn. Chúng tôi chính thức mời bạn gia nhập đội ngũ với vị trí: <b style="color: #4f46e5;">${job_title}</b>.</p>
                                <p>HR sẽ liên hệ trực tiếp với bạn qua số điện thoại để trao đổi về ngày bắt đầu làm việc.</p>
                                <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 25px 0;" />
                                <p style="font-size: 12px; color: #94a3b8; text-align: center;">Hệ thống HRM tự động bởi Nhóm 21</p>
                            </div>
                        </div>
                    `
                };
                await transporter.sendMail(mailOptions);
                console.log(`✅ Đã gửi mail trúng tuyển cho: ${email}`);
            }

            res.json({ success: true, message: "Cập nhật thành công!" });
        } catch (err) {
            console.error("❌ Lỗi Backend Update Status:", err.message);
            res.status(500).json({ error: "Không thể cập nhật trạng thái." });
        }
    });

    // 📝 4. API CHO ỨNG VIÊN: Gửi đơn đăng ký (Form ngoài Web)
    router.post('/apply', async (req, res) => {
        const { full_name, email, phone, cv_link, note, job_id } = req.body;
        try {
            const sql = `
                INSERT INTO applications (full_name, email, phone, cv_link, note, job_id, status) 
                VALUES (?, ?, ?, ?, ?, ?, 'pending')
            `;
            await dbPromise.execute(sql, [full_name, email, phone, cv_link, note, job_id]);
            res.json({ success: true, message: "Nộp đơn thành công!" });
        } catch (err) {
            console.error("❌ Lỗi Backend Apply:", err.message);
            res.status(500).json({ error: "Lỗi khi nộp đơn bro ơi!" });
        }
    });

    return router;
};