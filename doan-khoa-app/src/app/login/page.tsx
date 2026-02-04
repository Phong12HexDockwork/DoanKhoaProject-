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
                className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-110 blur-sm"
                style={{ backgroundImage: "url('https://student.hcmus.edu.vn/_next/image?url=%2Fbackground.jpg&w=3840&q=75')" }}
            />
            {/* Dark overlay for better readability */}
            <div className="absolute inset-0 bg-black/30" />

            {/* Login Card - Liquid Glass Effect */}
            <div className="relative w-full max-w-md z-10">
                <div className="backdrop-blur-xl bg-white/10 rounded-3xl shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] border border-white/20 p-8 sm:p-10 relative overflow-hidden group">

                    {/* Glossy shine effect */}
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

                    {/* Logo / Header */}
                    <div className="text-center mb-8 relative z-10">
                        <div className="inline-flex items-center justify-center gap-3 bg-white/20 backdrop-blur-md rounded-2xl mb-4 shadow-lg border border-white/30 transform group-hover:scale-105 transition-transform duration-300 px-5 py-3">
                            {/* Logo Đoàn */}
                            <img
                                src="https://upload.wikimedia.org/wikipedia/vi/0/09/Huy_Hi%E1%BB%87u_%C4%90o%C3%A0n.png"
                                alt="Logo Đoàn"
                                className="w-32 h-32 object-contain"
                            />
                        </div>
                        <h1 className="text-xl font-bold text-white mb-1 tracking-wide text-shadow">Đoàn Khoa Vật lý - Vật lý kỹ thuật</h1>
                        <p className="text-white/80 text-sm">Trường Đại học Khoa Học Tự Nhiên, ĐHQG-HCM</p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-500/20 backdrop-blur-sm border border-red-500/30 rounded-xl animate-shake">
                            <p className="text-white text-sm text-center font-medium shadow-sm">{error}</p>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                        <div>
                            <label htmlFor="email" className="block text-sm font-semibold text-blue-100 mb-2 pl-1">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-5 py-3.5 bg-white/90 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0054A6]/50 focus:border-[#0054A6] focus:bg-white transition-all shadow-sm"
                                placeholder="email@example.com"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-semibold text-blue-100 mb-2 pl-1">
                                Mật khẩu
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-5 py-3.5 bg-white/90 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0054A6]/50 focus:border-[#0054A6] focus:bg-white transition-all shadow-sm"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 px-4 bg-white text-[#0054A6] font-bold rounded-xl shadow-lg hover:bg-blue-50 focus:outline-none focus:ring-4 focus:ring-white/30 disabled:opacity-70 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98] mt-2 border border-white/50"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-[#0054A6]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Đang xử lý...
                                </span>
                            ) : (
                                'Đăng nhập'
                            )}
                        </button>
                    </form>

                    {/* Demo accounts */}
                    <div className="mt-8 pt-6 border-t border-white/10 relative z-10">
                        <p className="text-xs text-blue-200 text-center mb-3 uppercase tracking-wider font-semibold">Tài khoản demo</p>
                        <div className="space-y-2 text-xs text-blue-100">
                            <div className="flex justify-between bg-white/5 hover:bg-white/10 transition-colors rounded-lg p-3 border border-white/10 backdrop-blur-sm cursor-pointer" onClick={() => { setEmail('admin@doankhoa.edu.vn'); setPassword('admin123'); }}>
                                <span className="font-medium">Admin:</span>
                                <span className="font-mono opacity-90">admin@doankhoa.edu.vn</span>
                            </div>
                            <div className="flex justify-between bg-white/5 hover:bg-white/10 transition-colors rounded-lg p-3 border border-white/10 backdrop-blur-sm cursor-pointer" onClick={() => { setEmail('cd_cntt@doankhoa.edu.vn'); setPassword('admin123'); }}>
                                <span className="font-medium">Chi đoàn:</span>
                                <span className="font-mono opacity-90">cd_cntt@doankhoa.edu.vn</span>
                            </div>
                            <p className="text-center text-blue-300/80 mt-2">Mật khẩu chung: <span className="font-mono text-white">admin123</span></p>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .text-shadow {
                    text-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
            `}</style>
        </div>
    );
}
