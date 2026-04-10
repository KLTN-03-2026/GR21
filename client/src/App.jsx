import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AppRoutes from './routes/approutes';
import { Footer } from './components/common/statuspages';
import './App.css';

function App() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/jobs');
                setJobs(res.data);
            } catch (err) {
                console.error("Lỗi lấy tin tuyển dụng:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchJobs();
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-100 selection:text-indigo-700">
            <AppRoutes jobs={jobs} loading={loading} />
            <Footer />
        </div>
    );
}

export default App;