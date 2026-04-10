import React, { useState, useEffect } from 'react';

const Jobs = () => {
    const [jobs, setJobs] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState(null); // Để phân biệt đang Thêm hay đang Sửa
    const [jobData, setJobData] = useState({ title: '', salary: '', description: '' });

    // 1. Lấy danh sách tin
    const fetchJobs = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/jobs');
            const data = await res.json();
            setJobs(data);
        } catch (err) { console.error("Lỗi:", err); }
    };

    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => { fetchJobs(); }, []);

    // 2. Khi bấm nút Sửa
    const handleEdit = (job) => {
        setJobData({ title: job.title, salary: job.salary, description: job.description });
        setEditingId(job.id);
        setIsAdding(true); // Mở form ra
    };

    // 3. Khi bấm nút Xóa
    const handleDelete = async (id) => {
        if (window.confirm("Bro có chắc muốn xóa tin này không?")) {
            await fetch(`http://localhost:5000/api/jobs/${id}`, { method: 'DELETE' });
            fetchJobs();
        }
    };

    // 4. Xử lý Submit (Dùng chung cho cả Thêm và Sửa)
    const handleSubmit = async (e) => {
        e.preventDefault();
        const method = editingId ? 'PUT' : 'POST';
        const url = editingId ? `http://localhost:5000/api/jobs/${editingId}` : 'http://localhost:5000/api/jobs';

        try {
            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(jobData)
            });
            const data = await res.json();
            if (data.success || data.insertId) {
                alert(editingId ? "✅ Cập nhật thành công!" : "🚀 Đăng tin thành công!");
                setIsAdding(false);
                setEditingId(null);
                setJobData({ title: '', salary: '', description: '' });
                fetchJobs();
            }
            // eslint-disable-next-line no-unused-vars
        } catch (err) { alert("Lỗi kết nối rồi bro!"); }
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
            {!isAdding ? (
                /* --- MÀN HÌNH DANH SÁCH --- */
                <div className="space-y-8">
                    <div className="flex justify-between items-center bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
                        <div>
                            <h2 className="text-2xl font-black text-slate-800 uppercase italic">✍️ Tin tuyển dụng</h2>
                            <p className="text-slate-400 font-bold text-sm mt-1 uppercase tracking-widest">Quản lý các vị trí đang trống</p>
                        </div>
                        <button
                            onClick={() => { setIsAdding(true); setEditingId(null); setJobData({ title: '', salary: '', description: '' }); }}
                            className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black shadow-lg hover:bg-slate-900 transition-all active:scale-95"
                        >
                            + ĐĂNG TIN MỚI
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {jobs.map((job) => (
                            <div key={job.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
                                <div className="relative z-10 text-left">
                                    <h3 className="font-black text-slate-800 text-xl mb-2">{job.title}</h3>
                                    <p className="text-emerald-500 font-black text-sm mb-4 uppercase">💰 {job.salary}</p>
                                    <p className="text-slate-500 text-sm line-clamp-3 mb-6 font-medium leading-relaxed">{job.description}</p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(job)}
                                            className="flex-1 py-3 bg-slate-50 rounded-xl font-bold text-slate-400 hover:bg-indigo-600 hover:text-white transition-all text-[10px] uppercase tracking-widest"
                                        >
                                            Sửa tin
                                        </button>
                                        <button
                                            onClick={() => handleDelete(job.id)}
                                            className="w-12 h-12 flex items-center justify-center bg-slate-50 rounded-xl text-rose-400 hover:bg-rose-500 hover:text-white transition-all"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                /* --- MÀN HÌNH FORM (DÙNG CHUNG) --- */
                <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl border border-slate-100 relative overflow-hidden">
                    <button
                        onClick={() => setIsAdding(false)}
                        className="absolute top-8 right-8 w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center font-black hover:bg-rose-50 hover:text-rose-500 transition-all z-20"
                    >
                        ✖
                    </button>

                    <div className="relative z-10 text-left">
                        <h2 className="text-3xl font-black text-slate-800 mb-10 flex items-center gap-3 italic">
                            <span className="bg-indigo-100 p-4 rounded-2xl">{editingId ? '✏️' : '✍️'}</span>
                            {editingId ? 'Cập nhật tin cũ' : 'Đăng tuyển vị trí mới'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="ml-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Vị trí công việc</label>
                                    <input type="text" required placeholder="VD: Senior NodeJS..." className="w-full p-5 bg-slate-50 rounded-3xl outline-none font-bold border-2 border-transparent focus:border-indigo-500 transition-all shadow-inner" onChange={(e) => setJobData({ ...jobData, title: e.target.value })} value={jobData.title} />
                                </div>
                                <div className="space-y-3">
                                    <label className="ml-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Mức lương</label>
                                    <input type="text" placeholder="VD: 15-20 triệu..." className="w-full p-5 bg-slate-50 rounded-3xl outline-none font-bold border-2 border-transparent focus:border-indigo-500 transition-all shadow-inner" onChange={(e) => setJobData({ ...jobData, salary: e.target.value })} value={jobData.salary} />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="ml-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Yêu cầu & Mô tả</label>
                                <textarea required placeholder="Nhập chi tiết..." className="w-full p-6 bg-slate-50 rounded-[2rem] h-64 outline-none font-medium border-2 border-transparent focus:border-indigo-500 transition-all shadow-inner" onChange={(e) => setJobData({ ...jobData, description: e.target.value })} value={jobData.description}></textarea>
                            </div>
                            <button type="submit" className="w-full bg-indigo-600 text-white py-6 rounded-3xl font-black text-xl shadow-xl hover:bg-slate-900 transition-all uppercase tracking-widest">
                                {editingId ? 'LƯU THAY ĐỔI' : 'XÁC NHẬN ĐĂNG TIN'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Jobs;