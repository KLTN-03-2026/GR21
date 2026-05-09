const fs = require('fs');
const path = require('path');
const { ChromaClient } = require('chromadb');
require('dotenv').config();

const run = async () => {
    try {
        const client = new ChromaClient({ path: "http://localhost:8000" });
        
        // Tạo hoặc lấy collection (bộ não)
        const collection = await client.getOrCreateCollection({
            name: "hrm_knowledge_base",
        });

        const docsDir = path.resolve(__dirname, '../docs');
        const files = ['recruitment.txt', 'policy_leave.txt', 'benefits.txt'];

        for (const fileName of files) {
            console.log(`📑 Đang đọc: ${fileName}...`);
            const content = fs.readFileSync(path.join(docsDir, fileName), 'utf-8');
            
            // Đưa dữ liệu vào bộ não (ChromaDB sẽ tự xử lý embedding nếu bro đã cài Docker Chroma)
            await collection.add({
                ids: [fileName],
                documents: [content],
                metadatas: [{ source: fileName }]
            });
        }

        console.log("✅ XONG! Dữ liệu đã được nạp vào ChromaDB thành công.");
    } catch (err) {
        console.error("❌ Lỗi rồi bro:", err.message);
        console.log("💡 Mẹo: Bro hãy chắc chắn đã chạy ChromaDB (Docker) hoặc báo tui để tui đổi sang cách lưu file local 100% không cần DB nhé!");
    }
};

run();