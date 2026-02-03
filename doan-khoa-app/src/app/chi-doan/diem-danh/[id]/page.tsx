'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface SuKien {
    id: string;
    tenSuKien: string;
    thoiGianBatDau: string;
    thoiGianKetThuc: string;
    diaDiem: string | null;
}

interface DiemDanh {
    id: string;
    sinhVien: {
        maSinhVien: string;
        hoTen: string;
    };
    thoiGianDiemDanh: string;
    phuongThuc: string;
}

export default function DiemDanhDetailPage() {
    const params = useParams();
    const suKienId = params.id as string;

    const [suKien, setSuKien] = useState<SuKien | null>(null);
    const [diemDanhs, setDiemDanhs] = useState<DiemDanh[]>([]);
    const [mssv, setMssv] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        fetchData();
    }, [suKienId]);

    const fetchData = async () => {
        try {
            const res = await fetch(`/api/chi-doan/diem-danh/${suKienId}`);
            const data = await res.json();
            if (data.suKien) setSuKien(data.suKien);
            if (data.diemDanhs) setDiemDanhs(data.diemDanhs);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!mssv.trim()) return;

        setLoading(true);
        setMessage(null);

        try {
            const res = await fetch(`/api/chi-doan/diem-danh/${suKienId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ maSinhVien: mssv.trim(), phuongThuc: 'THU_CONG' }),
            });

            const data = await res.json();

            if (!res.ok) {
                setMessage({ type: 'error', text: data.error || 'Có lỗi xảy ra' });
                return;
            }

            setMessage({ type: 'success', text: `Đã điểm danh cho ${data.sinhVien.hoTen}` });
            setMssv('');
            fetchData();
        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: 'Có lỗi xảy ra' });
        } finally {
            setLoading(false);
        }
    };

    if (!suKien) {
        return <div className="p-6 text-center text-gray-500">Đang tải...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Back button */}
            <Link href="/chi-doan/diem-danh" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700">
                <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Quay lại
            </Link>

            {/* Event Info */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{suKien.tenSuKien}</h1>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center">
                        <svg className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {new Date(suKien.thoiGianBatDau).toLocaleDateString('vi-VN')}
                    </span>
                    <span className="flex items-center">
                        <svg className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {new Date(suKien.thoiGianBatDau).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                        {' - '}
                        {new Date(suKien.thoiGianKetThuc).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {suKien.diaDiem && (
                        <span className="flex items-center">
                            <svg className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            </svg>
                            {suKien.diaDiem}
                        </span>
                    )}
                </div>
            </div>

            {/* Input Form */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Điểm danh thủ công</h2>
                <form onSubmit={handleSubmit} className="flex gap-4">
                    <div className="flex-1">
                        <input
                            type="text"
                            value={mssv}
                            onChange={(e) => setMssv(e.target.value)}
                            placeholder="Nhập MSSV..."
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            autoFocus
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading || !mssv.trim()}
                        className="px-6 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {loading ? 'Đang xử lý...' : 'Điểm danh'}
                    </button>
                </form>

                {message && (
                    <div className={`mt-4 p-3 rounded-xl text-sm ${message.type === 'success'
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                        {message.text}
                    </div>
                )}
            </div>

            {/* Attendance List */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">Danh sách điểm danh</h2>
                    <span className="text-sm text-gray-500">{diemDanhs.length} người</span>
                </div>
                {diemDanhs.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        Chưa có ai điểm danh
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {diemDanhs.map((dd, index) => (
                            <div key={dd.id} className="px-6 py-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <span className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-sm font-medium">
                                            {index + 1}
                                        </span>
                                        <div>
                                            <p className="font-medium text-gray-900">{dd.sinhVien.hoTen}</p>
                                            <p className="text-sm text-gray-500">{dd.sinhVien.maSinhVien}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-500">
                                            {new Date(dd.thoiGianDiemDanh).toLocaleTimeString('vi-VN', {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {dd.phuongThuc === 'THU_CONG' ? 'Thủ công' : dd.phuongThuc === 'QR_CODE' ? 'QR' : 'Barcode'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
