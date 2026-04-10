import React from 'react';

export const Footer = () => (
    <footer className="py-10 text-center text-slate-400 text-xs uppercase tracking-widest border-t border-slate-100 mt-20">
        <p>© 2026 Nhóm 21 - Hệ thống Quản trị Nhân sự (HRM)</p>
    </footer>
);

export const NotFound = () => (
    <div className="flex flex-col items-center justify-center h-[70vh]">
        <h1 className="text-9xl font-black text-slate-200">404</h1>
        <p className="text-xl font-bold text-slate-500 -mt-8">Đi đâu đấy bro? Trang này không có!</p>
        <a href="/" className="px-6 py-3 bg-indigo-600 text-white rounded-xl mt-6 font-bold hover:bg-indigo-700 transition-all">Về trang chủ thôi cha nội</a>
    </div>
);

export const Developing = ({ pageName }) => (
    <div className="w-full bg-white p-32 rounded-[3.5rem] text-center border-4 border-dashed border-slate-100 shadow-sm animate-in fade-in duration-700">
        <span className="text-8xl mb-6 block animate-bounce">🚧</span>
        <h3 className="text-2xl font-black text-slate-300 uppercase tracking-widest italic">
            Chức năng <span className="text-indigo-400 underline decoration-wavy">{pageName}</span> đang được phát triển...
        </h3>
    </div>
);