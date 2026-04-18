import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { 
    Users, Search, Eye, Star, X, Save, 
    MessageSquare, Award, TrendingUp, UserCheck 
} from 'lucide-react';

const ManagerEmployee = () => {
    // 1. KHAI BÁO STATE
    const [team, setTeam] = useState([]);
    const [departmentName, setDepartmentName] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [reviews, setReviews] = useState([]);
    
    // State cho Form đánh giá mới
    const [newReview, setNewReview] = useState({
        score: 10,
        title: '',
        content: ''
    });

    // Lấy thông tin Manager từ LocalStorage
    const manager = JSON.parse(localStorage.getItem('user'));
    const managerId = manager?.id;

    // 2. KHAI BÁO CÁC HÀM XỬ LÝ (Đưa lên trước useEffect để tránh lỗi undefined)
    const fetchTeam = useCallback(async () => {
        if (!managerId) return;
        try {
            const res = await axios.get(`http://localhost:5000/api/manager/employee/my-team/${managerId}`);
            setTeam(res.data.team);
            setDepartmentName(res.data.department);
        } catch (err) { 
            console.error("Lỗi lấy danh sách team bro ơi!", err); 
        }
    }, [managerId]);

    const handleOpenDetail = async (employee) => {
        setSelectedEmployee(employee);
        setIsModalOpen(true);
        try {
            const res = await axios.get(`http://localhost:5000/api/manager/employee/reviews/${employee.id}`);
            setReviews(res.data);
        } catch (err) { 
            console.error("Lỗi lấy review!", err); 
        }
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:5000/api/manager/employee/reviews', {
                employee_id: selectedEmployee.id,
                manager_id: managerId,
                ...newReview
            });
            if (res.data.success) {
                alert("Đã gửi đánh giá thành công! 🌟");
                setNewReview({ score: 10, title: '', content: '' });
                // Load lại lịch sử sau khi đánh giá
                handleOpenDetail(selectedEmployee);
            }
        // eslint-disable-next-line no-unused-vars
        } catch (err) { 
            alert("Lỗi gửi đánh giá!"); 
        }
    };

    // 3. GỌI DỮ LIỆU KHI COMPONENT MOUNT
    useEffect(() => {
        fetchTeam();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fetchTeam]);

    const filteredTeam = team.filter(emp => 
        emp.full_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8 bg-[#f8fafc] min-h-screen text-left animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter flex items-center gap-3">
                        <Users size={32} className="text-[#8b5cf6]" /> Quản lý nhân sự phòng {departmentName}
                    </h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1 italic">
                        Dữ liệu nhân sự nội bộ dành cho Manager
                    </p>
                </div>
                
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="text"
                        placeholder="Tìm tên nhân viên..."
                        className="pl-12 pr-6 py-3 bg-white border border-slate-100 rounded-2xl w-80 shadow-sm focus:ring-2 ring-purple-100 outline-none transition-all font-medium"
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* List Table */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-[#1e1b4b] text-white uppercase text-[10px] font-black tracking-widest">
                            <th className="p-6">Nhân viên</th>
                            <th className="p-6">Vị trí</th>
                            <th className="p-6 text-center">Trạng thái</th>
                            <th className="p-6 text-center">Liên hệ</th>
                            <th className="p-6 text-right">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {filteredTeam.length > 0 ? filteredTeam.map((emp) => (
                            <tr key={emp.id} className="hover:bg-purple-50/30 transition-all group">
                                <td className="p-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                            {emp.full_name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-black text-slate-800 text-sm uppercase italic">{emp.full_name}</div>
                                            <div className="text-[10px] font-bold text-slate-400">ID: #EMP-00{emp.id}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-6 font-bold text-slate-500 text-xs uppercase">{emp.position}</td>
                                <td className="p-6 text-center">
                                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase border ${
                                        emp.status === 'Active' ? 'bg-emerald-50 text-emerald-500 border-emerald-100' : 'bg-rose-50 text-rose-500 border-rose-100'
                                    }`}>
                                        {emp.status === 'Active' ? 'Đang làm việc' : 'Nghỉ phép'}
                                    </span>
                                </td>
                                <td className="p-6">
                                    <div className="text-[11px] font-bold text-slate-600 text-center">{emp.email}</div>
                                    <div className="text-[10px] text-slate-400 text-center">{emp.phone}</div>
                                </td>
                                <td className="p-6 text-right">
                                    <button 
                                        onClick={() => handleOpenDetail(emp)}
                                        className="bg-[#1e1b4b] hover:bg-[#8b5cf6] text-white px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 ml-auto shadow-md"
                                    >
                                        <Eye size={14} /> Chi tiết & Đánh giá
                                    </button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="5" className="p-10 text-center text-slate-400 font-bold italic">Không tìm thấy nhân viên nào trong phòng này bro ơi!</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* MODAL CHI TIẾT & ĐÁNH GIÁ */}
            {isModalOpen && selectedEmployee && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex justify-center items-center p-4">
                    <div className="bg-white w-full max-w-6xl h-[85vh] rounded-[3.5rem] shadow-2xl overflow-hidden flex animate-in zoom-in duration-300">
                        {/* Sidebar Modal: Info Nhân viên */}
                        <div className="w-1/3 bg-slate-50 p-10 border-r border-slate-100 flex flex-col items-center text-center">
                            <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-4xl font-black shadow-2xl mb-6">
                                {selectedEmployee.full_name.charAt(0)}
                            </div>
                            <h3 className="text-2xl font-black text-slate-800 uppercase italic tracking-tighter mb-1">{selectedEmployee.full_name}</h3>
                            <p className="text-[#8b5cf6] font-bold text-xs uppercase tracking-widest mb-8">{selectedEmployee.position}</p>
                            
                            <div className="w-full space-y-4 text-left">
                                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                                    <p className="text-[9px] font-black text-slate-400 uppercase">Email công ty</p>
                                    <p className="text-xs font-bold text-slate-700">{selectedEmployee.email}</p>
                                </div>
                                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                                    <p className="text-[9px] font-black text-slate-400 uppercase">Số điện thoại</p>
                                    <p className="text-xs font-bold text-slate-700">{selectedEmployee.phone}</p>
                                </div>
                                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                                    <p className="text-[9px] font-black text-slate-400 uppercase">Giới tính</p>
                                    <p className="text-xs font-bold text-slate-700">{selectedEmployee.gender}</p>
                                </div>
                            </div>
                            
                            <button onClick={() => setIsModalOpen(false)} className="mt-auto w-full py-4 bg-slate-200 hover:bg-rose-500 hover:text-white text-slate-500 rounded-2xl font-black text-xs uppercase transition-all flex items-center justify-center gap-2">
                                <X size={18} /> Đóng cửa sổ
                            </button>
                        </div>

                        {/* Nội dung Modal: Reviews & Form */}
                        <div className="w-2/3 p-12 flex flex-col overflow-y-auto bg-white">
                            <h4 className="text-xl font-black text-slate-800 uppercase italic flex items-center gap-2 mb-8">
                                <TrendingUp className="text-purple-500" /> Hiệu suất công việc
                            </h4>

                            {/* Form đánh giá mới */}
                            <form onSubmit={handleSubmitReview} className="bg-slate-900 rounded-[2.5rem] p-8 text-white mb-10 shadow-xl">
                                <div className="flex items-center gap-2 mb-6 text-purple-400 font-black text-xs uppercase tracking-widest">
                                    <Award size={16} /> Viết đánh giá mới
                                </div>
                                <div className="grid grid-cols-4 gap-4 mb-4">
                                    <div className="col-span-3">
                                        <input 
                                            required
                                            className="w-full bg-slate-800 border-none rounded-xl p-4 text-sm font-bold placeholder:text-slate-500 outline-none focus:ring-2 ring-purple-500"
                                            placeholder="Tiêu đề đánh giá (VD: Đánh giá tháng 4...)"
                                            value={newReview.title}
                                            onChange={e => setNewReview({...newReview, title: e.target.value})}
                                        />
                                    </div>
                                    <div className="col-span-1">
                                        <select 
                                            className="w-full bg-slate-800 border-none rounded-xl p-4 text-sm font-bold outline-none cursor-pointer"
                                            value={newReview.score}
                                            onChange={e => setNewReview({...newReview, score: e.target.value})}
                                        >
                                            {[10,9,8,7,6,5,4,3,2,1].map(num => <option key={num} value={num}>{num} Điểm</option>)}
                                        </select>
                                    </div>
                                </div>
                                <textarea 
                                    required
                                    className="w-full bg-slate-800 border-none rounded-xl p-4 text-sm font-medium h-32 outline-none focus:ring-2 ring-purple-500 mb-4 resize-none"
                                    placeholder="Nhận xét chi tiết..."
                                    value={newReview.content}
                                    onChange={e => setNewReview({...newReview, content: e.target.value})}
                                />
                                <button type="submit" className="w-full bg-purple-500 hover:bg-purple-600 py-4 rounded-xl font-black uppercase text-xs tracking-[0.2em] transition-all flex items-center justify-center gap-2">
                                    <Save size={18} /> Lưu kết quả đánh giá
                                </button>
                            </form>

                            {/* Lịch sử đánh giá */}
                            <h5 className="font-black text-slate-400 uppercase text-[10px] mb-4 tracking-widest italic">Lịch sử nhận xét</h5>
                            <div className="space-y-4">
                                {reviews.length > 0 ? reviews.map((rev) => (
                                    <div key={rev.id} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex gap-6 items-start">
                                        <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex flex-col items-center justify-center shadow-sm">
                                            <span className="text-xl font-black text-purple-600">{rev.score}</span>
                                            <span className="text-[7px] font-bold text-slate-400 -mt-1 uppercase">Score</span>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-2">
                                                <h6 className="font-black text-slate-800 text-sm">{rev.title}</h6>
                                                <span className="text-[9px] font-bold text-slate-400 uppercase italic">
                                                    {new Date(rev.review_date).toLocaleDateString('vi-VN')}
                                                </span>
                                            </div>
                                            <p className="text-slate-500 text-xs font-medium">{rev.content}</p>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center py-10 text-slate-300 font-bold italic">Chưa có đánh giá nào cho nhân viên này</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManagerEmployee;