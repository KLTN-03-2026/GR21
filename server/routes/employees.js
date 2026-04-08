const express = require('express');
const router = express.Router();

module.exports = (db) => {

    // 1. LẤY DANH SÁCH NHÂN VIÊN (JOIN VỚI PHÒNG BAN)
    router.get('/', (req, res) => {
        const sql = `
            SELECT e.*, d.name AS department_name 
            FROM employees e 
            LEFT JOIN departments d ON e.dep_id = d.id
            ORDER BY e.id DESC
        `;
        db.query(sql, (err, rows) => {
            if (err) {
                console.error("❌ Lỗi GET:", err.message);
                return res.status(500).send(err.message);
            }
            res.status(200).json(rows);
        });
    });

    // 2. THÊM MỚI NHÂN VIÊN + TỰ ĐỘNG CẬP NHẬT TRƯỞNG PHÒNG
    router.post('/', (req, res) => {
        const { full_name, email, phone, dep_id, position, username, password } = req.body;

        // Bước A: Tạo tài khoản trong bảng users trước
        const sqlUser = "INSERT INTO users (username, password, role) VALUES (?, ?, 'employee')";
        db.query(sqlUser, [username, password], (err, userRes) => {
            if (err) {
                console.error("❌ Lỗi tạo User:", err.message);
                return res.status(500).send("Lỗi tạo tài khoản: " + err.message);
            }

            const newUserId = userRes.insertId;

            // Bước B: Tạo nhân viên trong bảng employees
            const sqlEmp = `
                INSERT INTO employees (user_id, dep_id, full_name, position, email, phone, join_date) 
                VALUES (?, ?, ?, ?, ?, ?, CURDATE())
            `;
            db.query(sqlEmp, [newUserId, dep_id, full_name, position, email, phone], (err, empRes) => {
                if (err) {
                    console.error("❌ Lỗi tạo Employee:", err.message);
                    return res.status(500).send("Lỗi tạo nhân sự: " + err.message);
                }

                const newEmpId = empRes.insertId;
                const posLower = position.toLowerCase();
                const isLeader = posLower.includes("trưởng phòng") || posLower.includes("giám đốc");

                // Bước C: Nếu là sếp thì cập nhật manager_id cho phòng ban luôn
                if (isLeader) {
                    const sqlUpdateDept = "UPDATE departments SET manager_id = ? WHERE id = ?";
                    db.query(sqlUpdateDept, [newEmpId, dep_id], (errDept) => {
                        if (errDept) console.error("⚠️ Lỗi cập nhật sếp:", errDept.message);
                        res.status(201).json({ success: true, message: "Thêm NV và đã lên chức Sếp! 👑" });
                    });
                } else {
                    res.status(201).json({ success: true, message: "Thêm nhân viên thành công!" });
                }
            });
        });
    });

    // 3. CẬP NHẬT NHÂN VIÊN (SỬA)
    router.put('/:id', (req, res) => {
        const { id } = req.params;
        const { full_name, email, phone, dep_id, position } = req.body;

        const sqlUpdate = `
            UPDATE employees 
            SET full_name=?, email=?, phone=?, dep_id=?, position=? 
            WHERE id=?
        `;
        db.query(sqlUpdate, [full_name, email, phone, dep_id, position, id], (err) => {
            if (err) {
                console.error("❌ Lỗi PUT:", err.message);
                return res.status(500).send(err.message);
            }

            // Logic phụ: Nếu sửa thành sếp thì cập nhật bên phòng ban
            const posLower = position.toLowerCase();
            if (posLower.includes("trưởng phòng") || posLower.includes("giám đốc")) {
                const sqlDept = "UPDATE departments SET manager_id = ? WHERE id = ?";
                db.query(sqlDept, [id, dep_id], (err2) => {
                    res.json({ success: true, message: "Cập nhật hồ sơ và chức vụ sếp thành công!" });
                });
            } else {
                res.json({ success: true, message: "Cập nhật thành công!" });
            }
        });
    });

    // 4. XÓA NHÂN VIÊN (VÀ TÀI KHOẢN TƯƠNG ỨNG)
    router.delete('/:id', (req, res) => {
        const { id } = req.params;

        // Tìm user_id trước để xóa cho sạch rác database
        db.query("SELECT user_id FROM employees WHERE id = ?", [id], (err, rows) => {
            if (err) return res.status(500).send(err.message);
            if (rows.length === 0) return res.status(404).send("Không tìm thấy nhân viên!");

            const userId = rows[0].user_id;

            // Xóa ở bảng employees trước (vì lý do ràng buộc)
            db.query("DELETE FROM employees WHERE id = ?", [id], (errEmp) => {
                if (errEmp) return res.status(500).send(errEmp.message);

                // Sau đó xóa tài khoản ở bảng users
                if (userId) {
                    db.query("DELETE FROM users WHERE id = ?", [userId], (errUser) => {
                        res.json({ success: true, message: "Đã xóa sạch sẽ nhân viên và tài khoản!" });
                    });
                } else {
                    res.json({ success: true });
                }
            });
        });
    });

    return router;
};