'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface DeleteSemesterButtonProps {
    id: string;
    tenHocKy: string;
    suKienCount: number;
}

export default function DeleteSemesterButton({ id, tenHocKy, suKienCount }: DeleteSemesterButtonProps) {
    const router = useRouter();
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleDelete = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (suKienCount > 0) {
            setError(`Không thể xóa! Học kỳ này có ${suKienCount} sự kiện liên kết.`);
            setShowModal(true);
            return;
        }

        setShowModal(true);
    };

    const confirmDelete = async () => {
        setLoading(true);
        setError('');

        try {
            const res = await fetch(`/api/admin/hoc-ky/${id}`, {
                method: 'DELETE',
            });

            if (!res.ok) {
                const data = await res.json();
                setError(data.error || 'Có lỗi xảy ra');
                return;
            }

            setShowModal(false);
            router.refresh();
        } catch {
            setError('Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <button
                onClick={handleDelete}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Xóa học kỳ"
            >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
            </button>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center mb-4">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <h3 className="text-lg font-semibold text-gray-900">Xóa học kỳ</h3>
                                <p className="text-sm text-gray-500">{tenHocKy}</p>
                            </div>
                        </div>

                        {error ? (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4">
                                {error}
                            </div>
                        ) : (
                            <p className="text-gray-600 mb-6">
                                Bạn có chắc chắn muốn xóa học kỳ này? Hành động này không thể hoàn tác.
                            </p>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowModal(false)}
                                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                            >
                                Hủy
                            </button>
                            {!error && (
                                <button
                                    onClick={confirmDelete}
                                    disabled={loading}
                                    className="flex-1 px-4 py-2.5 bg-red-500 text-white font-medium rounded-xl hover:bg-red-600 disabled:opacity-50 transition-colors"
                                >
                                    {loading ? 'Đang xóa...' : 'Xóa'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
