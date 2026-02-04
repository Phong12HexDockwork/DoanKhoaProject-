'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewChiDoanPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        tenChiDoan: '',
        maChiDoan: '',
        moTa: '',
        // Account info
        email: '',
        hoTen: '',
        password: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/admin/chi-doan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });

            if (!res.ok) {
                const data = await res.json();
                alert(data.error || 'Có lỗi xảy ra');
                return;
            }

            router.push('/admin/chi-doan');
        } catch (error) {
            console.error(error);
            alert('Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-6">
                <a href="/admin/chi-doan" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700">
                    <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Quay lại
                </a>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Thêm Chi Đoàn mới</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Chi Đoàn Info */}
                    <div className="border-b border-gray-100 pb-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Thông tin Chi Đoàn</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tên Chi Đoàn <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={form.tenChiDoan}
                                    onChange={(e) => setForm({ ...form, tenChiDoan: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0054A6] focus:border-transparent"
                                    placeholder="VD: Chi Đoàn Công nghệ thông tin"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Mã Chi Đoàn <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={form.maChiDoan}
                                    onChange={(e) => setForm({ ...form, maChiDoan: e.target.value.toUpperCase() })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0054A6] focus:border-transparent"
                                    placeholder="VD: CD_CNTT"
                                />
                                <p className="mt-1 text-xs text-gray-500">Mã viết tắt, không dấu, in hoa</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Mô tả
                                </label>
                                <textarea
                                    rows={3}
                                    value={form.moTa}
                                    onChange={(e) => setForm({ ...form, moTa: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                                    placeholder="Mô tả chi đoàn..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Account Info */}
                    <div>
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Tài khoản quản lý</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Họ tên người quản lý <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={form.hoTen}
                                    onChange={(e) => setForm({ ...form, hoTen: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0054A6] focus:border-transparent"
                                    placeholder="VD: Nguyễn Văn A"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email đăng nhập <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0054A6] focus:border-transparent"
                                    placeholder="VD: cd_cntt@doankhoa.edu.vn"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Mật khẩu <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="password"
                                    required
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    placeholder="Nhập mật khẩu..."
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-3 bg-[#0054A6] text-white font-semibold rounded-xl hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading ? 'Đang xử lý...' : 'Tạo Chi Đoàn'}
                        </button>
                        <a
                            href="/admin/chi-doan"
                            className="px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                        >
                            Hủy
                        </a>
                    </div>
                </form>
            </div>
        </div>
    );
}
