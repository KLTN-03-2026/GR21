const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs'); // 🛠️ THÊM THƯ VIỆN MÃ HÓA

module.exports = (db) => {
    // 1. LẤY DANH SÁCH NHÂN VIÊN
    router.get('/', (req, res) => {
        const sql = `
            SELECT e.*, d.name AS department_name 
            FROM employees e 
            LEFT JOIN departments d ON e.dep_id = d.id
            ORDER BY e.id DESC
        `;
        db.query(sql, (err, rows) => {
            if (err) return res.status(500).send(err.message);
            res.status(200).json(rows);
        });
    });

    // 2. THÊM MỚI NHÂN VIÊN (ĐÃ TÍCH HỢP BCRYPT HASH)
    router.post('/', async (req, res) => {
        const { 
            full_name, email, phone, dep_id, position, username, password, role,
            dob, gender, address, identity_card, bank_account, bank_name, base_salary
        } = req.body;

        try {
            // Bước 0: Kiểm tra Username duy nhất
            const sqlCheck = "SELECT id FROM users WHERE username = ?";
            db.query(sqlCheck, [username], async (errCheck, results) => {
                if (errCheck) return res.status(500).send("Lỗi kiểm tra hệ thống!");
                if (results.length > 0) {
                    return res.status(400).json({ 
                        success: false, 
                        message: `Username "${username}" đã tồn tại rồi bro ơi!` 
                    });
                }

                // 🛠️ BƯỚC QUAN TRỌNG: MÃ HÓA MẬT KHẨU
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(password, salt);

                // Bước A: Tạo tài khoản trong bảng users với mật khẩu đã HASH
                const sqlUser = "INSERT INTO users (username, password, role) VALUES (?, ?, ?)";
                db.query(sqlUser, [username, hashedPassword, role || 'employee'], (err, userRes) => {
                    if (err) return res.status(500).send("Lỗi tạo tài khoản: " + err.message);
                    
                    const newId = userRes.insertId;

                    // Bước B: Tạo hồ sơ trong bảng employees
                    const sqlEmp = `
                        INSERT INTO employees (id, user_id, dep_id, full_name, position, email, phone, 
                        dob, gender, address, identity_card, bank_account, bank_name, base_salary, join_date) 
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE())
                    `;
                    const empValues = [
                        newId, newId, dep_id, full_name, position, email, phone, 
                        dob || null, gender || 'Nam', address || null, 
                        identity_card || null, bank_account || null, bank_name || null, 
                        base_salary || 0
                    ];

                    db.query(sqlEmp, empValues, (errEmp) => {
                        if (errEmp) {
                            // Xóa User nếu tạo hồ sơ lỗi để tránh rác DB
                            db.query("DELETE FROM users WHERE id = ?", [newId]);
                            return res.status(500).send("Lỗi tạo hồ sơ: " + errEmp.message);
                        }

                        // Kiểm tra nếu là Trưởng phòng/Giám đốc thì cập nhật bảng departments
                        const posLower = position ? position.toLowerCase() : "";
                        if (posLower.includes("trưởng phòng") || posLower.includes("giám đốc")) {
                            db.query("UPDATE departments SET manager_id = ? WHERE id = ?", [newId, dep_id], () => {
                                res.status(201).json({ success: true, message: "Thêm sếp mới và mã hóa mật khẩu thành công! 👑" });
                            });
                        } else {
                            res.status(201).json({ success: true, message: "Thêm nhân viên và mã hóa mật khẩu thành công! 🚀" });
                        }
                    });
                });
            });
        } catch (error) {
            res.status(500).send("Lỗi server: " + error.message);
        }
    });

    // 3. CẬP NHẬT NHÂN VIÊN (CÓ VALIDATION)
    router.put('/:id', (req, res) => {
        const { id } = req.params;
        const { 
            full_name, email, phone, dep_id, position,
            dob, gender, address, identity_card, bank_account, bank_name
        } = req.body;

        // --- VALIDATION ---
        const requiredFields = {
            full_name: "Họ và tên", email: "Email", phone: "SĐT",
            dep_id: "Phòng ban", position: "Chức vụ",
            identity_card: "Số CCCD", address: "Địa chỉ"
        };

        for (const [key, label] of Object.entries(requiredFields)) {
            if (!req.body[key] || String(req.body[key]).trim() === "") {
                return res.status(400).json({ success: false, message: `${label} không được để trống!` });
            }
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) return res.status(400).json({ message: "Email sai định dạng!" });

        const phoneRegex = /^(0[3|5|7|8|9])([0-9]{8})$/;
        if (!phoneRegex.test(phone)) return res.status(400).json({ message: "SĐT phải có 10 số VN!" });

        // --- UPDATE ---
        const sqlUpdate = `
            UPDATE employees 
            SET full_name=?, email=?, phone=?, dep_id=?, position=?, 
                dob=?, gender=?, address=?, identity_card=?, bank_account=?, bank_name=?
            WHERE id=?
        `;
        
        db.query(sqlUpdate, [
            full_name.trim(), email.trim(), phone.trim(), dep_id, position.trim(), 
            dob, gender, address.trim(), identity_card.trim(), bank_account, bank_name, id
        ], (err) => {
            if (err) return res.status(500).send("Lỗi Database: " + err.message);

            const posLower = position ? position.toLowerCase() : "";
            if (posLower.includes("trưởng phòng") || posLower.includes("giám đốc")) {
                db.query("UPDATE departments SET manager_id = ? WHERE id = ?", [id, dep_id], () => {
                    res.json({ success: true, message: "Cập nhật sếp và hồ sơ thành công! 👑" });
                });
            } else {
                res.json({ success: true, message: "Cập nhật hồ sơ thành công! 🔥" });
            }
        });
    });

    // 4. XÓA NHÂN VIÊN
    router.delete('/:id', (req, res) => {
        const { id } = req.params;
        db.query("DELETE FROM employees WHERE id = ?", [id], (err) => {
            if (err) return res.status(500).send(err.message);
            db.query("DELETE FROM users WHERE id = ?", [id], () => {
                res.json({ success: true, message: "Đã xóa sạch sẽ nhân viên và tài khoản!" });
            });
        });
    });

    return router;
};