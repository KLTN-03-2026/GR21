🚀 Dự Án Khoá Luận Tốt Nghiệp - Nhóm 21

Đề tài: Hệ thống Quản lý Nhân sự tích hợp AI Chatbot (RAG) cho doanh nghiệp nhỏ.

👥 Thành viên nhóm:

Nguyễn Văn A (Trưởng nhóm)

Trần Văn B

Lê Khoa (Backend & AI)

🛠 Công nghệ sử dụng

Dự án được xây dựng theo mô hình Fullstack hiện đại:

Frontend: ReactJS + Vite + TailwindCSS

Backend: NodeJS + ExpressJS

Database: MySQL

AI: RAG (Retrieval-Augmented Generation)

📂 Cấu trúc dự án

/client: Chứa mã nguồn giao diện (ReactJS).

/server: Chứa mã nguồn xử lý logic, API và kết nối Database (NodeJS).

.gitignore: File chặn các tệp tin rác và thư mục nặng (node_modules).

README.md: Hướng dẫn tổng quan dự án.

🚀 Hướng dẫn cài đặt và chạy dự án

1. Yêu cầu hệ thống

Đã cài đặt Node.js (Phiên bản 16.x trở lên).

Đã cài đặt MySQL Server.

2. Các bước thực hiện

Bước 1: Tải mã nguồn

git clone [https://github.com/lekhoa200/nhom21_kltn.git](https://github.com/lekhoa200/nhom21_kltn.git)
cd nhom21_kltn


Bước 2: Cài đặt thư viện cho Frontend

cd client
npm install


Bước 3: Cài đặt thư viện cho Backend

cd ../server
npm install


Bước 4: Cấu hình Database

Tạo file .env trong thư mục /server.

Copy nội dung từ .env.example và điền thông tin MySQL của bạn.

Bước 5: Chạy dự án

Mở 2 terminal riêng biệt:

Terminal 1 (Client): cd client && npm run dev

Terminal 2 (Server): cd server && node index.js

📜 Quy định đóng góp (Dành cho thành viên)

Không code trực tiếp trên nhánh main.

Tạo nhánh mới: feature/ten-chuc-nang trước khi làm.

Luôn git pull origin main trước khi bắt đầu code.

Tạo Pull Request và nhờ trưởng nhóm duyệt trước khi Merge.