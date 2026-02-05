'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Đăng nhập thất bại');
                return;
            }

            // Redirect based on role
            if (data.user.vaiTro === 'DOAN_KHOA') {
                router.push('/admin');
            } else {
                router.push('/chi-doan');
            }
            // Don't set loading to false on success to keep spinner active until navigation
        } catch {
            setError('Đã có lỗi xảy ra. Vui lòng thử lại.');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Image with blur */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0 blur-sm scale-105"
                style={{ backgroundImage: "url('/login-bg.jpg')" }}
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/30 z-0" />

            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 sm:p-10 border border-gray-100 relative z-10">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="inline-block mb-4">
                        <img
                            src="https://upload.wikimedia.org/wikipedia/vi/0/09/Huy_Hi%E1%BB%87u_%C4%90o%C3%A0n.png"
                            alt="Logo Đoàn"
                            className="w-24 h-24 object-contain mx-auto"
                        />
                    </div>
                    <h1 className="text-xl font-bold text-[#0054A6] mb-1">Đoàn Khoa Vật lý - Vật lý kỹ thuật</h1>
                    <p className="text-gray-500 text-sm">Cổng thông tin quản lý đoàn viên</p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl">
                        <p className="text-red-600 text-sm text-center font-medium">{error}</p>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0054A6] focus:border-transparent transition-all"
                            placeholder="email@example.com"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                            Mật khẩu
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0054A6] focus:border-transparent transition-all"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 px-4 bg-[#0054A6] text-white font-bold rounded-xl shadow-md hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:opacity-70 disabled:cursor-not-allowed transition-all mt-4"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Đang xử lý...</span>
                            </span>
                        ) : (
                            'Đăng nhập'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
