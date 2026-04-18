const express = require('express');
const router = express.Router();

module.exports = (db) => {
    // Sử dụng promise để code gọn hơn nếu cần, nhưng t giữ nguyên kiểu callback db.query theo format của ông
    
    // 1. LẤY DANH SÁCH NHÂN VIÊN (JOIN PHÒNG BAN)
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

    // 2. THÊM MỚI NHÂN VIÊN (ĐÃ THÊM ĐẦY ĐỦ CÁC TRƯỜNG THÔNG TIN)
    router.post('/', (req, res) => {
        const { 
            full_name, email, phone, dep_id, position, username, password, role,
            dob, gender, address, identity_card, bank_account, bank_name, base_salary
        } = req.body;

        // Bước A: Tạo tài khoản trong bảng users trước
        const sqlUser = "INSERT INTO users (username, password, role) VALUES (?, ?, ?)";
        db.query(sqlUser, [username, password, role || 'employee'], (err, userRes) => {
            if (err) {
                console.error("❌ Lỗi tạo User:", err.message);
                return res.status(500).send("Lỗi tạo tài khoản: " + err.message);
            }

            const newId = userRes.insertId; // ID dùng chung cho cả 2 bảng

            // Bước B: Tạo nhân viên trong bảng employees với đầy đủ các cột mới
            const sqlEmp = `
                INSERT INTO employees (
                    id, user_id, dep_id, full_name, position, email, phone, 
                    dob, gender, address, identity_card, bank_account, bank_name, 
                    base_salary, join_date
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE())
            `;
            
            const empValues = [
                newId, newId, dep_id, full_name, position, email, phone,
                dob || null, 
                gender || 'Nam', 
                address || null, 
                identity_card || null, 
                bank_account || null, 
                bank_name || null,
                base_salary || 0
            ];

            db.query(sqlEmp, empValues, (errEmp, empRes) => {
                if (errEmp) {
                    console.error("❌ Lỗi tạo Employee:", errEmp.message);
                    db.query("DELETE FROM users WHERE id = ?", [newId]);
                    return res.status(500).send("Lỗi tạo nhân sự: " + errEmp.message);
                }

                // Kiểm tra chức vụ để cập nhật trưởng phòng
                const posLower = position.toLowerCase();
                const isLeader = posLower.includes("trưởng phòng") || posLower.includes("giám đốc");

                if (isLeader) {
                    const sqlUpdateDept = "UPDATE departments SET manager_id = ? WHERE id = ?";
                    db.query(sqlUpdateDept, [newId, dep_id], (errDept) => {
                        res.status(201).json({ success: true, message: "Thêm nhân sự mới thành công! 👑" });
                    });
                } else {
                    res.status(201).json({ success: true, message: "Thêm nhân viên và liên kết tài khoản thành công! 🚀" });
                }
            });
        });
    });

    // 3. CẬP NHẬT NHÂN VIÊN
    router.put('/:id', (req, res) => {
        const { id } = req.params;
        const { 
            full_name, email, phone, dep_id, position,
            dob, gender, address, identity_card, bank_account, bank_name
        } = req.body;

        const sqlUpdate = `
            UPDATE employees 
            SET full_name=?, email=?, phone=?, dep_id=?, position=?, 
                dob=?, gender=?, address=?, identity_card=?, bank_account=?, bank_name=?
            WHERE id=?
        `;
        db.query(sqlUpdate, [
            full_name, email, phone, dep_id, position, 
            dob, gender, address, identity_card, bank_account, bank_name, id
        ], (err) => {
            if (err) return res.status(500).send(err.message);

            const posLower = position.toLowerCase();
            if (posLower.includes("trưởng phòng") || posLower.includes("giám đốc")) {
                db.query("UPDATE departments SET manager_id = ? WHERE id = ?", [id, dep_id], (err2) => {
                    res.json({ success: true, message: "Cập nhật sếp thành công!" });
                });
            } else {
                res.json({ success: true, message: "Cập nhật thành công!" });
            }
        });
    });

    // 4. XÓA NHÂN VIÊN
    router.delete('/:id', (req, res) => {
        const { id } = req.params;
        db.query("DELETE FROM employees WHERE id = ?", [id], (err) => {
            if (err) return res.status(500).send(err.message);
            db.query("DELETE FROM users WHERE id = ?", [id], (err2) => {
                res.json({ success: true, message: "Đã xóa sạch sẽ nhân viên và tài khoản!" });
            });
        });
    });

    return router;
};