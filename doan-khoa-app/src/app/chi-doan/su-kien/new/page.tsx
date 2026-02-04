'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface HocKy {
    id: string;
    tenHocKy: string;
}

export default function CreateSuKienPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [hocKys, setHocKys] = useState<HocKy[]>([]);
    const [form, setForm] = useState({
        tenSuKien: '',
        moTa: '',
        linkTaiLieu: '',
        hinhThuc: 'OFFLINE',
        coSo: '',
        diaDiem: '',
        hocKyId: '',
        ngayBatDau: '',
        gioBatDau: '',
        ngayKetThuc: '',
        gioKetThuc: '',
    });

    useEffect(() => {
        fetch('/api/hoc-ky')
            .then((res) => res.json())
            .then((data) => {
                setHocKys(data.hocKys || []);
                if (data.hocKys?.length > 0) {
                    setForm((f) => ({ ...f, hocKyId: data.hocKys[0].id }));
                }
            })
            .catch(console.error);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/chi-doan/su-kien', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...form,
                    thoiGianBatDau: `${form.ngayBatDau}T${form.gioBatDau}`,
                    thoiGianKetThuc: `${form.ngayKetThuc}T${form.gioKetThuc}`,
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                alert(data.error || 'Có lỗi xảy ra');
                return;
            }

            router.push('/chi-doan/su-kien');
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
                <a href="/chi-doan/su-kien" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700">
                    <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Quay lại
                </a>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Tạo sự kiện mới</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tên sự kiện <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={form.tenSuKien}
                            onChange={(e) => setForm({ ...form, tenSuKien: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            placeholder="Nhập tên sự kiện..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Học kỳ <span className="text-red-500">*</span>
                        </label>
                        <select
                            required
                            value={form.hocKyId}
                            onChange={(e) => setForm({ ...form, hocKyId: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        >
                            {hocKys.map((hk) => (
                                <option key={hk.id} value={hk.id}>{hk.tenHocKy}</option>
                            ))}
                        </select>
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
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Giờ bắt đầu <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="time"
                                required
                                value={form.gioBatDau}
                                onChange={(e) => setForm({ ...form, gioBatDau: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Ngày kết thúc <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                required
                                value={form.ngayKetThuc}
                                onChange={(e) => setForm({ ...form, ngayKetThuc: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Giờ kết thúc <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="time"
                                required
                                value={form.gioKetThuc}
                                onChange={(e) => setForm({ ...form, gioKetThuc: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Hình thức */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Hình thức <span className="text-red-500">*</span>
                        </label>
                        <div className="flex gap-6">
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="radio"
                                    name="hinhThuc"
                                    value="OFFLINE"
                                    checked={form.hinhThuc === 'OFFLINE'}
                                    onChange={(e) => setForm({ ...form, hinhThuc: e.target.value, coSo: form.coSo || 'CS1' })}
                                    className="mr-2 text-emerald-600 focus:ring-emerald-500"
                                />
                                <span className="text-gray-700">Offline</span>
                            </label>
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="radio"
                                    name="hinhThuc"
                                    value="ONLINE"
                                    checked={form.hinhThuc === 'ONLINE'}
                                    onChange={(e) => setForm({ ...form, hinhThuc: e.target.value, coSo: '', diaDiem: '' })}
                                    className="mr-2 text-emerald-600 focus:ring-emerald-500"
                                />
                                <span className="text-gray-700">Online</span>
                            </label>
                        </div>
                    </div>

                    {/* Cơ sở & Địa điểm (chỉ cho Offline) */}
                    {form.hinhThuc === 'OFFLINE' && (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Cơ sở <span className="text-red-500">*</span>
                                </label>
                                <select
                                    required
                                    value={form.coSo}
                                    onChange={(e) => setForm({ ...form, coSo: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                >
                                    <option value="">Chọn cơ sở</option>
                                    <option value="CS1">Cơ sở 1 (227 Nguyễn Văn Cừ)</option>
                                    <option value="CS2">Cơ sở 2 (Linh Trung, Thủ Đức)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Chi tiết địa điểm
                                </label>
                                <input
                                    type="text"
                                    value={form.diaDiem}
                                    onChange={(e) => setForm({ ...form, diaDiem: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                    placeholder="VD: Phòng F102"
                                />
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Link tài liệu
                        </label>
                        <input
                            type="url"
                            value={form.linkTaiLieu}
                            onChange={(e) => setForm({ ...form, linkTaiLieu: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            placeholder="https://drive.google.com/..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Mô tả
                        </label>
                        <textarea
                            rows={4}
                            value={form.moTa}
                            onChange={(e) => setForm({ ...form, moTa: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                            placeholder="Mô tả chi tiết về sự kiện..."
                        />
                    </div>

                    <div className="flex gap-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading ? 'Đang xử lý...' : 'Gửi duyệt'}
                        </button>
                        <a
                            href="/chi-doan/su-kien"
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
