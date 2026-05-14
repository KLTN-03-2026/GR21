import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Briefcase, MapPin, DollarSign, Send, User, Mail, Phone, Link as LinkIcon, X, CheckCircle2 } from 'lucide-react';

const Recruitment = () => {
    const [jobs, setJobs] = useState([]);
    const [selectedJob, setSelectedJob] = useState(null);
    const [form, setForm] = useState({ full_name: '', email: '', phone: '', cv_link: '', note: '' });
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    // 1. Lấy danh sách job công khai
    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/jobs');
                setJobs(res.data);
            } catch (err) {
                console.error("Lỗi lấy job:", err);
            }
        };
        fetchJobs();
    }, []);

    // 2. Xử lý nộp đơn
    const handleApply = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post('http://localhost:5000/api/recruitment/apply', {
                ...form,
                job_id: selectedJob.id
            });
            setSubmitted(true);
            setTimeout(() => {
                setSubmitted(false);
                setSelectedJob(null);
                setForm({ full_name: '', email: '', phone: '', cv_link: '', note: '' });
            }, 2500);
        // eslint-disable-next-line no-unused-vars
        } catch (err) {
            alert("Có lỗi khi gửi đơn rồi bro!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-6 md:p-12 text-left font-sans select-none">
            {/* Header Landing Page */}
            <div className="max-w-7xl mx-auto mb-20 text-center md:text-left">
                <div className="inline-block bg-indigo-600 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-4">
                    Careers @ Nhóm 21
                </div>
                <h1 className="text-6xl md:text-8xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">
                    JOIN THE <span className="text-indigo-600">TEAM.</span>
                </h1>
                <p className="max-w-2xl text-slate-400 font-bold text-sm uppercase tracking-widest mt-6 leading-relaxed opacity-80">
                    Cơ hội làm việc trong môi trường công nghệ hiện đại, phát triển hệ thống HRM tích hợp AI Chatbot hàng đầu.
                </p>
            </div>

            {/* Grid Jobs */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {jobs.map(job => (
                    <div key={job.id} className="bg-white p-10 rounded-[4rem] shadow-2xl shadow-slate-200/50 border border-white hover:-translate-y-3 transition-all duration-500 group">
                        <div className="flex justify-between items-start mb-8">
                            <div className="bg-slate-900 text-white p-5 rounded-[2rem] group-hover:bg-indigo-600 transition-colors duration-500">
                                <Briefcase size={32} />
                            </div>
                            <span className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase">
                                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
                                Opening
                            </span>
                        </div>
                        
                        <h3 className="text-3xl font-black text-slate-800 uppercase italic leading-none mb-4 group-hover:text-indigo-600 transition-colors">
                            {job.title}
                        </h3>
                        
                        <div className="flex flex-wrap gap-4 mb-10">
                            <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase">
                                <MapPin size={14} className="text-indigo-400" /> Đà Nẵng
                            </div>
                            <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase">
                                <DollarSign size={14} className="text-indigo-400" /> {job.salary || 'Thỏa thuận'}
                            </div>
                        </div>

                        <button 
                            onClick={() => setSelectedJob(job)}
                            className="w-full bg-slate-900 text-white py-6 rounded-3xl font-black uppercase tracking-[0.2em] text-[11px] hover:bg-indigo-600 transition-all shadow-xl shadow-indigo-100 italic"
                        >
                            Ứng tuyển ngay →
                        </button>
                    </div>
                ))}
            </div>

            {/* Overlay Modal */}
            {selectedJob && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4">
                    <div className="bg-white w-full max-w-2xl rounded-[4rem] overflow-hidden shadow-2xl border border-white/20 animate-in zoom-in-95 duration-300">
                        {submitted ? (
                            <div className="p-20 text-center flex flex-col items-center">
                                <div className="bg-emerald-100 text-emerald-600 p-6 rounded-full mb-6">
                                    <CheckCircle2 size={60} />
                                </div>
                                <h2 className="text-3xl font-black text-slate-800 uppercase italic mb-2">Gửi đơn thành công!</h2>
                                <p className="text-slate-400 font-bold uppercase text-xs">HR Nhóm 21 sẽ sớm liên hệ với bro qua Email.</p>
                            </div>
                        ) : (
                            <>
                                <div className="bg-indigo-600 p-12 text-white relative">
                                    <button onClick={() => setSelectedJob(null)} className="absolute top-10 right-10 hover:rotate-90 transition-all bg-white/10 p-2 rounded-full">
                                        <X size={24} />
                                    </button>
                                    <h3 className="text-4xl font-black uppercase italic tracking-tighter leading-none">Nộp hồ sơ.</h3>
                                    <p className="text-indigo-100 font-bold text-xs uppercase mt-3 opacity-70">Vị trí: {selectedJob.title}</p>
                                </div>

                                <form onSubmit={handleApply} className="p-12 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2 text-left">
                                            <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Họ tên bro</label>
                                            <input required className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 outline-none font-bold text-sm" 
                                            placeholder="Nguyễn Văn A" value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} />
                                        </div>
                                        <div className="space-y-2 text-left">
                                            <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Số điện thoại</label>
                                            <input required className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 outline-none font-bold text-sm" 
                                            placeholder="0912xxxxxx" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                                        </div>
                                    </div>
                                    <div className="space-y-2 text-left">
                                        <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Email cá nhân</label>
                                        <input type="email" required className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 outline-none font-bold text-sm" 
                                        placeholder="email@example.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                                    </div>
                                    <div className="space-y-2 text-left">
                                        <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Link CV (Drive/Dropbox)</label>
                                        <input required className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 outline-none font-bold text-sm" 
                                        placeholder="Dán link CV vào đây bro..." value={form.cv_link} onChange={e => setForm({...form, cv_link: e.target.value})} />
                                    </div>

                                    <button 
                                        type="submit" disabled={loading}
                                        className="w-full bg-slate-900 text-white py-6 rounded-[2.5rem] font-black uppercase tracking-[0.3em] text-[11px] hover:bg-indigo-600 transition-all shadow-2xl mt-4 italic shadow-indigo-100"
                                    >
                                        {loading ? "Đang xử lý đơn..." : "Xác nhận nộp đơn ngay →"}
                                    </button>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Recruitment;