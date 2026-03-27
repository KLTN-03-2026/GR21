const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors()); // Cực kỳ quan trọng để React gọi được vào đây
app.use(express.json());

// API test cho nhóm
app.get('/api/test', (req, res) => {
    res.json({ message: "Kết nối thành công!" });
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
});