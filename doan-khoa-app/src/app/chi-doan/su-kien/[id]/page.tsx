'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface HocKy {
    id: string;
    tenHocKy: string;
}

interface ChiDoan {
    id: string;
    maChiDoan: string;
    tenChiDoan: string;
}

interface SuKien {
    id: string;
    tenSuKien: string;
    thoiGianBatDau: string;
    thoiGianKetThuc: string;
    hinhThuc: string;
    coSo: string | null;
    diaDiem: string | null;
    trangThaiDuyet: string;
    moTa: string | null;
    linkTaiLieu: string | null;
    hocKyId: string;
    chiDoan?: ChiDoan;
}

export default function EditSuKienPage() {
    const params = useParams();
    const id = params.id as string;
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [hocKys, setHocKys] = useState<HocKy[]>([]);
    const [suKien, setSuKien] = useState<SuKien | null>(null);
    const [isReadOnly, setIsReadOnly] = useState(false);
    const [isDoanKhoaEvent, setIsDoanKhoaEvent] = useState(false);
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
        Promise.all([
            fetch('/api/hoc-ky').then(res => res.json()),
            fetch(`/api/chi-doan/su-kien/${id}`).then(res => res.json())
        ]).then(([hocKyData, suKienData]) => {
            setHocKys(hocKyData.hocKys || []);

            if (suKienData.suKien) {
                const sk = suKienData.suKien;
                setSuKien(sk);

                const isDK = sk.chiDoan?.maChiDoan === 'DOAN_KHOA';
                setIsDoanKhoaEvent(isDK);

                // Set read only if approved OR if it's a Doan Khoa event
                if (sk.trangThaiDuyet === 'DA_DUYET' || isDK) {
                    setIsReadOnly(true);
                }

                const start = new Date(sk.thoiGianBatDau);
                const end = new Date(sk.thoiGianKetThuc);

                setForm({
                    tenSuKien: sk.tenSuKien,
                    moTa: sk.moTa || '',
                    linkTaiLieu: sk.linkTaiLieu || '',
                    hinhThuc: sk.hinhThuc || 'OFFLINE',
                    coSo: sk.coSo || '',
                    diaDiem: sk.diaDiem || '',
                    hocKyId: sk.hocKyId,
                    ngayBatDau: start.toISOString().split('T')[0],
                    gioBatDau: start.toTimeString().slice(0, 5),
                    ngayKetThuc: end.toISOString().split('T')[0],
                    gioKetThuc: end.toTimeString().slice(0, 5),
                });
            }
            setLoading(false);
        }).catch(err => {
            console.error(err);
            setLoading(false);
        });
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isReadOnly) return;

        setSaving(true);

        try {
            const res = await fetch(`/api/chi-doan/su-kien/${id}`, {
                method: 'PUT',
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
            router.refresh();
        } catch (error) {
            console.error(error);
            alert('Có lỗi xảy ra');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="p-6 text-center text-gray-500">Đang tải...</div>;
    }

    if (!suKien) {
        return <div className="p-6 text-center text-gray-500">Không tìm thấy sự kiện</div>;
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-6 flex items-center justify-between">
                <Link href="/chi-doan/su-kien" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700">
                    <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Quay lại
                </Link>
                {isReadOnly && (
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                        Đã được duyệt
                    </span>
                )}
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">
                        {isReadOnly ? 'Chi tiết sự kiện' : 'Chỉnh sửa sự kiện'}
                    </h1>
                </div>

                {isReadOnly && !isDoanKhoaEvent && (
                    <div className="mb-6 p-4 bg-blue-50 text-blue-700 rounded-xl text-sm border border-blue-100">
                        Sự kiện này đã được Đoàn Khoa duyệt nên không thể chỉnh sửa thông tin.
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tên sự kiện <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            disabled={isReadOnly}
                            value={form.tenSuKien}
                            onChange={(e) => setForm({ ...form, tenSuKien: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Học kỳ <span className="text-red-500">*</span>
                        </label>
                        <select
                            required
                            disabled={isReadOnly}
                            value={form.hocKyId}
                            onChange={(e) => setForm({ ...form, hocKyId: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
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
                                disabled={isReadOnly}
                                value={form.ngayBatDau}
                                onChange={(e) => setForm({ ...form, ngayBatDau: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Giờ bắt đầu <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="time"
                                required
                                disabled={isReadOnly}
                                value={form.gioBatDau}
                                onChange={(e) => setForm({ ...form, gioBatDau: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
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
                                disabled={isReadOnly}
                                value={form.ngayKetThuc}
                                onChange={(e) => setForm({ ...form, ngayKetThuc: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Giờ kết thúc <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="time"
                                required
                                disabled={isReadOnly}
                                value={form.gioKetThuc}
                                onChange={(e) => setForm({ ...form, gioKetThuc: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
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
                                    disabled={isReadOnly}
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
                                    disabled={isReadOnly}
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
                                    disabled={isReadOnly}
                                    value={form.coSo}
                                    onChange={(e) => setForm({ ...form, coSo: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
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
                                    disabled={isReadOnly}
                                    value={form.diaDiem}
                                    onChange={(e) => setForm({ ...form, diaDiem: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
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
                            disabled={isReadOnly}
                            value={form.linkTaiLieu}
                            onChange={(e) => setForm({ ...form, linkTaiLieu: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                            placeholder="https://drive.google.com/..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Mô tả
                        </label>
                        <textarea
                            rows={4}
                            disabled={isReadOnly}
                            value={form.moTa}
                            onChange={(e) => setForm({ ...form, moTa: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none disabled:bg-gray-50 disabled:text-gray-500"
                            placeholder="Mô tả chi tiết về sự kiện..."
                        />
                    </div>

                    <div className="flex gap-4">
                        {!isReadOnly && (
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex-1 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                            </button>
                        )}
                        <Link
                            href="/chi-doan/su-kien"
                            className={`px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors ${isReadOnly ? 'w-full text-center' : ''}`}
                        >
                            {isReadOnly ? 'Quay lại danh sách' : 'Hủy'}
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
