const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function migrate() {
    // 1. Cấu hình kết nối Database (Bro điền thông tin của bro vào đây)
    const dbConfig = {
        host: 'localhost',
        user: 'root',
        password: 'Lk2308**', // Thường để trống nếu dùng XAMPP
        database: 'hrm_db' // <-- THAY TÊN DB CỦA NHÓM 21 VÀO ĐÂY
    };

    console.log("🚀 Bắt đầu quét database để mã hóa mật khẩu...");

    try {
        const connection = await mysql.createConnection(dbConfig);

        // 2. Lấy tất cả user hiện có
        const [users] = await connection.execute('SELECT id, password FROM users');

        let count = 0;
        for (let user of users) {
            // Kiểm tra xem mật khẩu đã được mã hóa chưa 
            // (Dấu hiệu: Bcrypt hash luôn bắt đầu bằng $2a$ hoặc $2b$ và dài hơn 50 ký tự)
            const isAlreadyHashed = user.password.startsWith('$2a$') || user.password.startsWith('$2b$');

            if (!isAlreadyHashed) {
                // 3. Tiến hành mã hóa mật khẩu cũ
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(user.password, salt);

                // 4. Update lại vào Database
                await connection.execute(
                    'UPDATE users SET password = ? WHERE id = ?',
                    [hashedPassword, user.id]
                );

                console.log(`✅ Đã mã hóa xong cho user ID: ${user.id}`);
                count++;
            } else {
                console.log(`⏩ User ID: ${user.id} đã được mã hóa trước đó, bỏ qua.`);
            }
        }

        console.log(`\n🔥 HOÀN THÀNH! Đã cập nhật thành công ${count} tài khoản.`);
        await connection.end();
        process.exit(0);

    } catch (err) {
        console.error("❌ Lỗi rồi bro ơi:", err.message);
        process.exit(1);
    }
}

migrate();