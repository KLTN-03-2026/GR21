import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Send, X, Bot, MessageCircle, Sparkles } from 'lucide-react';

const ChatboxAI = () => {
    // Hàm bổ trợ lấy thông tin user mới nhất từ localStorage
    const getAuthPayload = () => {
        try {
            const userLocal = JSON.parse(localStorage.getItem('user'));
            // Đảm bảo bốc đúng các trường để Backend xử lý 10 bảng dữ liệu
            return {
                empId: userLocal?.id || null,
                role: userLocal?.role || 'guest',
                deptId: userLocal?.dep_id || userLocal?.dept_id || null 
            };
        // eslint-disable-next-line no-unused-vars
        } catch (e) {
            return { empId: null, role: 'guest', deptId: null };
        }
    };

    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { 
            role: 'ai', 
            text: "Xin chào! Tôi là Trợ lý Nhân sự AI của Nhóm 21. Tôi có thể hỗ trợ bạn kiểm tra thông tin cá nhân, quy định công ty hoặc các báo cáo nhân sự liên quan. Bạn cần hỗ trợ vấn đề gì không?" 
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    
    const messagesEndRef = useRef(null);
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    useEffect(scrollToBottom, [messages]);

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMsg = { role: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        setLoading(true);
        const currentInput = input;
        setInput('');

        try {
            const authPayload = getAuthPayload();
            
            // Console log để kiểm tra payload trong quá trình demo
            console.log("🚀 [Nhóm 21] AI Request Payload:", authPayload);

            // Gọi API AI với đầy đủ định danh để phân quyền truy cập Database
            const res = await axios.post('http://localhost:5000/api/ai/ask-ai', { 
                question: currentInput, 
                ...authPayload 
            });
            
            setMessages(prev => [...prev, { role: 'ai', text: res.data.answer }]);
        } catch (err) {
            console.error("Lỗi Chat AI:", err);
            setMessages(prev => [...prev, { 
                role: 'ai', 
                text: 'Hệ thống đang gặp sự cố kết nối. Vui lòng thử lại sau hoặc liên hệ bộ phận kỹ thuật.' 
            }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-[9999]">
            {/* Nút bấm tròn đặc trưng Nhóm 21 */}
            <button 
                onClick={() => setIsOpen(!isOpen)} 
                className="bg-slate-900 text-white p-5 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center border-4 border-white"
            >
                {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
            </button>

            {/* Cửa sổ Chat */}
            {isOpen && (
                <div className="absolute bottom-24 right-0 w-[22rem] bg-white rounded-[3rem] shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-slate-100 overflow-hidden flex flex-col animate-in slide-in-from-bottom-5 duration-500">
                    {/* Header */}
                    <div className="bg-slate-900 p-6 text-white flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-500 rounded-xl text-white">
                                <Bot size={20} />
                            </div>
                            <div>
                                <h4 className="text-xs font-black uppercase italic tracking-widest leading-none">HR AI Assistant</h4>
                                <p className="text-[8px] font-bold text-emerald-400 uppercase tracking-widest mt-1">Hệ thống Nhóm 21</p>
                            </div>
                        </div>
                        <Sparkles size={16} className="text-amber-400 animate-pulse" />
                    </div>
                    
                    {/* Danh sách tin nhắn */}
                    <div className="h-96 overflow-y-auto p-6 space-y-4 bg-slate-50/50 scrollbar-hide text-left">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] p-4 rounded-[1.8rem] text-[11px] font-bold leading-relaxed shadow-sm ${
                                    msg.role === 'user' 
                                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                                    : 'bg-white text-slate-700 rounded-tl-none border border-slate-100'
                                }`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-white p-4 rounded-[1.8rem] rounded-tl-none border border-slate-100 shadow-sm">
                                    <div className="flex gap-1">
                                        <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce"></div>
                                        <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                        <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Ô nhập liệu */}
                    <div className="p-4 bg-white flex gap-2 border-t border-slate-100">
                        <input 
                            value={input} 
                            onChange={(e) => setInput(e.target.value)} 
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Nhập câu hỏi về lương, lịch làm việc..." 
                            className="flex-1 bg-slate-100 rounded-2xl px-4 py-3 text-[11px] font-bold focus:outline-none focus:ring-2 ring-indigo-100 transition-all"
                        />
                        <button 
                            onClick={handleSend} 
                            disabled={loading}
                            className="bg-slate-900 text-white p-3 rounded-2xl hover:bg-indigo-600 transition-colors disabled:opacity-50"
                        >
                            <Send size={18}/>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatboxAI;