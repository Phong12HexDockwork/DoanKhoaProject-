'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

interface User {
    hoTen: string;
    email: string;
    vaiTro: string;
    chiDoanName?: string;
}

const navItems = [
    { name: 'Tổng quan', href: '/chi-doan', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { name: 'Sự kiện của tôi', href: '/chi-doan/su-kien', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { name: 'Điểm danh', href: '/chi-doan/diem-danh', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
    { name: 'Lịch chung', href: '/chi-doan/lich', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
];

export default function ChiDoanLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        fetch('/api/auth/me')
            .then((res) => res.json())
            .then((data) => {
                if (data.user) setUser(data.user);
            })
            .catch(console.error);
    }, []);

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/login');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Mobile sidebar */}
            <div className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? '' : 'hidden'}`}>
                <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)}></div>
                <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-gradient-to-b from-emerald-700 to-teal-800">
                    <div className="flex h-16 items-center justify-between px-4">
                        <span className="text-xl font-bold text-white">Chi Đoàn</span>
                        <button onClick={() => setSidebarOpen(false)} className="text-white">
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <nav className="flex-1 space-y-1 px-2 py-4">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all ${pathname === item.href
                                        ? 'bg-white/20 text-white'
                                        : 'text-emerald-100 hover:bg-white/10'
                                    }`}
                            >
                                <svg className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                                </svg>
                                {item.name}
                            </Link>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Desktop sidebar */}
            <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
                <div className="flex flex-col flex-grow bg-gradient-to-b from-emerald-700 to-teal-800 pt-5 overflow-y-auto">
                    <div className="flex items-center flex-shrink-0 px-6 mb-8">
                        <div className="flex items-center">
                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-lg font-bold text-white">Chi Đoàn</p>
                                <p className="text-xs text-emerald-200 truncate max-w-[140px]">{user?.chiDoanName || 'Quản lý sự kiện'}</p>
                            </div>
                        </div>
                    </div>

                    <nav className="flex-1 px-3 space-y-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all ${pathname === item.href
                                        ? 'bg-white/20 text-white shadow-lg'
                                        : 'text-emerald-100 hover:bg-white/10'
                                    }`}
                            >
                                <svg className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                                </svg>
                                {item.name}
                            </Link>
                        ))}
                    </nav>

                    {/* User info */}
                    <div className="p-4 border-t border-emerald-600">
                        <div className="flex items-center">
                            <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center">
                                <span className="text-white font-medium">
                                    {user?.hoTen?.charAt(0) || 'U'}
                                </span>
                            </div>
                            <div className="ml-3 flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">{user?.hoTen}</p>
                                <p className="text-xs text-emerald-200 truncate">{user?.email}</p>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="p-2 text-emerald-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                title="Đăng xuất"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="lg:pl-64">
                {/* Top bar */}
                <div className="sticky top-0 z-10 flex h-16 bg-white shadow-sm">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="px-4 text-gray-500 focus:outline-none lg:hidden"
                    >
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    <div className="flex flex-1 justify-between px-4 lg:px-8">
                        <div className="flex flex-1 items-center">
                            <h1 className="text-lg font-semibold text-gray-900">
                                {navItems.find((item) => item.href === pathname)?.name || 'Dashboard'}
                            </h1>
                        </div>
                    </div>
                </div>

                {/* Page content */}
                <main className="flex-1 p-4 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
