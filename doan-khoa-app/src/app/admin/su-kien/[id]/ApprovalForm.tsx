'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface ApprovalFormProps {
    suKienId: string;
    currentStatus: string;
}

export default function ApprovalForm({ suKienId, currentStatus }: ApprovalFormProps) {
    const router = useRouter();
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAction = async (action: 'DA_DUYET' | 'TU_CHOI' | 'YEU_CAU_SUA') => {
        if (!note.trim() && action !== 'DA_DUYET') {
            alert('Vui lòng nhập ghi chú');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`/api/admin/su-kien/${suKienId}/approve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, note }),
            });

            if (!res.ok) {
                const data = await res.json();
                alert(data.error || 'Có lỗi xảy ra');
                return;
            }

            router.refresh();
        } catch (error) {
            console.error(error);
            alert('Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    if (currentStatus === 'DA_DUYET') {
        return (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
                <div className="flex items-center">
                    <svg className="h-6 w-6 text-green-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-green-700 font-medium">Sự kiện này đã được duyệt</p>
                </div>
            </div>
        );
    }

    if (currentStatus === 'TU_CHOI') {
        return (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                <div className="flex items-center">
                    <svg className="h-6 w-6 text-red-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-red-700 font-medium">Sự kiện này đã bị từ chối</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Duyệt sự kiện</h2>

            <div className="mb-4">
                <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-2">
                    Ghi chú (bắt buộc khi từ chối hoặc yêu cầu sửa)
                </label>
                <textarea
                    id="note"
                    rows={3}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                    placeholder="Nhập ghi chú..."
                />
            </div>

            <div className="flex flex-wrap gap-3">
                <button
                    onClick={() => handleAction('DA_DUYET')}
                    disabled={loading}
                    className="flex-1 sm:flex-none px-6 py-3 bg-green-500 text-white font-medium rounded-xl hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <span className="flex items-center justify-center">
                        <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Chấp thuận
                    </span>
                </button>

                <button
                    onClick={() => handleAction('YEU_CAU_SUA')}
                    disabled={loading}
                    className="flex-1 sm:flex-none px-6 py-3 bg-orange-500 text-white font-medium rounded-xl hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <span className="flex items-center justify-center">
                        <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Yêu cầu sửa
                    </span>
                </button>

                <button
                    onClick={() => handleAction('TU_CHOI')}
                    disabled={loading}
                    className="flex-1 sm:flex-none px-6 py-3 bg-red-500 text-white font-medium rounded-xl hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <span className="flex items-center justify-center">
                        <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Từ chối
                    </span>
                </button>
            </div>
        </div>
    );
}
