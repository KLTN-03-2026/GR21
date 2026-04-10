# 🚀 Dự Án Khoá Luận Tốt Nghiệp - Nhóm 21

**Đề tài:** Hệ thống Quản lý Nhân sự tích hợp AI Chatbot (RAG) cho doanh nghiệp nhỏ.

---

## 👥 Thành viên nhóm
* **Lê Xuân Khoa** (Trưởng nhóm)
* **Hoàng Minh Khánh**
* **Phan Đình Rin**
* **Đỗ Trương Hồng Duyên**
* **Phan Dương Phương Duy**

---

## 🛠 Công nghệ sử dụng
Dự án được xây dựng theo mô hình **Fullstack** hiện đại:
* **Frontend:** ReactJS + Vite + TailwindCSS
* **Backend:** NodeJS + ExpressJS
* **Database:** MySQL
* **AI Integration:** RAG (Retrieval-Augmented Generation)

---

## 📂 Cấu trúc dự án
* `/client`: Chứa mã nguồn giao diện (ReactJS).
* `/server`: Chứa mã nguồn xử lý logic, API và kết nối Database (NodeJS).
* `.gitignore`: File chặn các tệp tin rác và thư mục nặng (`node_modules`).
* `README.md`: Hướng dẫn tổng quan dự án.

---

## 🚀 Hướng dẫn cài đặt và chạy dự án

### 1. Yêu cầu hệ thống
* Đã cài đặt **Node.js** (Phiên bản 16.x trở lên).
* Đã cài đặt **MySQL Server**.

### 2. Các bước thực hiện
**Bước 1: Tải mã nguồn**
```bash
git clone [https://github.com/KLTN-03-2026/GR21.git](https://github.com/KLTN-03-2026/GR21.git) nhom21_kltn
cd nhom21_kltn
Bước 2: Cài đặt thư viện cho Frontend

Bash
cd client
npm install

Bước 3: Cài đặt thư viện cho Backend

Bash
cd ../server
npm install
Bước 4: Cấu hình Database

Tạo file .env trong thư mục /server.

Copy nội dung từ .env.example và điền thông tin MySQL của bạn.

Bước 5: Chạy dự án
Mở 2 terminal riêng biệt:

Terminal 1 (Client): cd client && npm run dev

Terminal 2 (Server): cd server && node index.js

 Quy định đóng góp (Dành cho thành viên)
Không code trực tiếp trên nhánh main.

Tạo nhánh mới: feature/ten-chuc-nang trước khi bắt đầu làm một chức năng mới.

Luôn git pull origin main trước khi bắt đầu code để tránh xung đột (Conflict).

Sau khi hoàn thành, tạo Pull Request và nhờ trưởng nhóm duyệt trước khi Merge vào main.