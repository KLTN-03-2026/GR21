import { useEffect, useState } from 'react'

function App() {
  const [message, setMessage] = useState("Đang đợi server trả lời...")

  useEffect(() => {
    // Gọi API từ Server Node.js
    fetch('http://localhost:5000/api/test')
      .then(res => res.json())
      .then(data => setMessage(data.message))
      .catch(err => setMessage("Dang bi loi: " + err.message))
  }, [])

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Dự án KLTN - Nhóm 21</h1>
      <p style={{ color: 'green', fontSize: '20px' }}>{message}</p>
    </div>
  )
}

export default App