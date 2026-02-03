'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewHocKyPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        tenHocKy: '',
        namHoc: '',
        ky: 1,
        ngayBatDau: '',
        ngayKetThuc: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/admin/hoc-ky', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });

            if (!res.ok) {
                const data = await res.json();
                alert(data.error || 'Có lỗi xảy ra');
                return;
            }

            router.push('/admin/hoc-ky');
        } catch (error) {
            console.error(error);
            alert('Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto">
            <div className="mb-6">
                <a href="/admin/hoc-ky" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700">
                    <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Quay lại
                </a>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Thêm học kỳ mới</h1>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tên học kỳ <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={form.tenHocKy}
                            onChange={(e) => setForm({ ...form, tenHocKy: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="VD: HK1 2025-2026"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Năm học <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                value={form.namHoc}
                                onChange={(e) => setForm({ ...form, namHoc: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="VD: 2025-2026"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Học kỳ <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={form.ky}
                                onChange={(e) => setForm({ ...form, ky: parseInt(e.target.value) })}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            >
                                <option value={1}>Học kỳ 1</option>
                                <option value={2}>Học kỳ 2</option>
                                <option value={3}>Học kỳ hè</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Ngày bắt đầu <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                required
                                value={form.ngayBatDau}
                                onChange={(e) => setForm({ ...form, ngayBatDau: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Ngày kết thúc <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                required
                                value={form.ngayKetThuc}
                                onChange={(e) => setForm({ ...form, ngayKetThuc: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading ? 'Đang xử lý...' : 'Tạo học kỳ'}
                        </button>
                        <a
                            href="/admin/hoc-ky"
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
