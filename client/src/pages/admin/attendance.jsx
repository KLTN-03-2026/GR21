import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CheckCircle, Clock, XCircle, Calendar, User } from 'lucide-react';

const Attendance = () => {
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAttendance();
    }, []);

    const fetchAttendance = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/attendance');
            setList(res.data);
        } catch (err) {
            console.error("Lỗi lấy dữ liệu chấm công:", err);
        } finally {
            setLoading(false);
        }
    };

    // Hàm render Badge màu sắc cho "pro"
    const renderStatus = (status) => {
        switch (status) {
            case 'present': 
                return (
                    <span className="flex items-center gap-1.5 text-green-700 bg-green-100 px-3 py-1 rounded-full text-xs font-bold uppercase">
                        <CheckCircle size={14}/> Có mặt
                    </span>
                );
            case 'late': 
                return (
                    <span className="flex items-center gap-1.5 text-amber-700 bg-amber-100 px-3 py-1 rounded-full text-xs font-bold uppercase">
                        <Clock size={14}/> Đi muộn
                    </span>
                );
            case 'absent': 
                return (
                    <span className="flex items-center gap-1.5 text-red-700 bg-red-100 px-3 py-1 rounded-full text-xs font-bold uppercase">
                        <XCircle size={14}/> Vắng mặt
                    </span>
                );
            default: 
                return <span className="text-gray-400 font-mono">{status}</span>;
        }
    };

    if (loading) return <div className="p-10 text-center font-medium">Đang tải dữ liệu chấm công bro đợi tí...</div>;

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-extrabold text-gray-800 flex items-center gap-2">
                        <Calendar className="text-blue-600" /> Quản Lý Chấm Công
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">Theo dõi thời gian ra vào của nhân sự Nhóm 21</p>
                </div>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-md">
                    Xuất báo cáo (Excel)
                </button>
            </div>
            
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
                <table className="w-full text-left">
                    <thead className="bg-gray-100 border-b border-gray-200">
                        <tr>
                            <th className="p-4 text-gray-600 font-bold text-xs uppercase tracking-wider">Ngày</th>
                            <th className="p-4 text-gray-600 font-bold text-xs uppercase tracking-wider">Nhân viên</th>
                            <th className="p-4 text-gray-600 font-bold text-xs uppercase tracking-wider">Check-in</th>
                            <th className="p-4 text-gray-600 font-bold text-xs uppercase tracking-wider">Check-out</th>
                            <th className="p-4 text-gray-600 font-bold text-xs uppercase tracking-wider">Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                        {list.map((item) => (
                            <tr key={item.id} className="hover:bg-blue-50/30 transition-colors">
                                <td className="p-4 text-gray-700 font-semibold italic">
                                    {new Date(item.date).toLocaleDateString('vi-VN')}
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                                            {item.full_name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-900">{item.full_name}</div>
                                            <div className="text-[10px] text-gray-400 font-medium uppercase">{item.position}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4 font-mono font-medium text-blue-600">{item.check_in || '--:--'}</td>
                                <td className="p-4 font-mono font-medium text-gray-500">{item.check_out || '--:--'}</td>
                                <td className="p-4">{renderStatus(item.status)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Attendance;