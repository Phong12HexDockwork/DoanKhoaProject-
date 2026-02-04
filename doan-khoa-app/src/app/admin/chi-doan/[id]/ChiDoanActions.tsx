'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface ChiDoanActionsProps {
    chiDoanId: string;
    tenChiDoan: string;
    trangThai: boolean;
    suKienCount: number;
}

export default function ChiDoanActions({ chiDoanId, tenChiDoan, trangThai, suKienCount }: ChiDoanActionsProps) {
    const router = useRouter();
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showSuspendModal, setShowSuspendModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSuspend = async () => {
        setLoading(true);
        setError('');

        try {
            const res = await fetch(`/api/admin/chi-doan/${chiDoanId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ trangThai: !trangThai }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Có lỗi xảy ra');
                return;
            }

            setShowSuspendModal(false);
            router.refresh();
        } catch {
            setError('Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        setLoading(true);
        setError('');

        try {
            const res = await fetch(`/api/admin/chi-doan/${chiDoanId}`, {
                method: 'DELETE',
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Có lỗi xảy ra');
                return;
            }

            setShowDeleteModal(false);
            router.push('/admin/chi-doan');
            router.refresh();
        } catch {
            setError('Có lỗi xảy ra khi xóa');
        } finally {
            setLoading(false);
        }
    };

    const openDeleteModal = () => {
        if (suKienCount > 0) {
            setError(`Không thể xóa! Chi Đoàn này có ${suKienCount} sự kiện liên kết. Hãy xóa các sự kiện trước.`);
            setShowDeleteModal(true);
        } else {
            setError('');
            setShowDeleteModal(true);
        }
    };

    return (
        <>
            <div className="flex gap-3">
                {/* Suspend/Activate Button */}
                <button
                    onClick={() => setShowSuspendModal(true)}
                    className={`inline-flex items-center px-4 py-2 font-medium rounded-xl transition-colors shadow-lg ${trangThai
                            ? 'bg-orange-500 text-white hover:bg-orange-600 shadow-orange-200'
                            : 'bg-green-500 text-white hover:bg-green-600 shadow-green-200'
                        }`}
                >
                    <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        {trangThai ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        )}
                    </svg>
                    {trangThai ? 'Đình chỉ' : 'Kích hoạt'}
                </button>

                {/* Delete Button */}
                <button
                    onClick={openDeleteModal}
                    className="inline-flex items-center px-4 py-2 bg-red-500 text-white font-medium rounded-xl hover:bg-red-600 transition-colors shadow-lg shadow-red-200"
                >
                    <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Xóa Chi Đoàn
                </button>
            </div>

            {/* Suspend Modal */}
            {showSuspendModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowSuspendModal(false)}>
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center mb-4">
                            <div className={`w-12 h-12 ${trangThai ? 'bg-orange-100' : 'bg-green-100'} rounded-full flex items-center justify-center`}>
                                <svg className={`h-6 w-6 ${trangThai ? 'text-orange-600' : 'text-green-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    {trangThai ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    )}
                                </svg>
                            </div>
                            <div className="ml-4">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    {trangThai ? 'Đình chỉ Chi Đoàn' : 'Kích hoạt Chi Đoàn'}
                                </h3>
                                <p className="text-sm text-gray-500 line-clamp-2">{tenChiDoan}</p>
                            </div>
                        </div>

                        <p className="text-gray-600 mb-6">
                            {trangThai
                                ? 'Đình chỉ sẽ vô hiệu hóa tất cả tài khoản thuộc Chi Đoàn này. Họ sẽ không thể đăng nhập.'
                                : 'Kích hoạt sẽ cho phép tất cả tài khoản thuộc Chi Đoàn này đăng nhập lại.'}
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowSuspendModal(false)}
                                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleSuspend}
                                disabled={loading}
                                className={`flex-1 px-4 py-2.5 text-white font-medium rounded-xl disabled:opacity-50 transition-colors ${trangThai ? 'bg-orange-500 hover:bg-orange-600' : 'bg-green-500 hover:bg-green-600'
                                    }`}
                            >
                                {loading ? 'Đang xử lý...' : (trangThai ? 'Đình chỉ' : 'Kích hoạt')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowDeleteModal(false)}>
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center mb-4">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <h3 className="text-lg font-semibold text-gray-900">Xóa Chi Đoàn</h3>
                                <p className="text-sm text-gray-500 line-clamp-2">{tenChiDoan}</p>
                            </div>
                        </div>

                        {error ? (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4">
                                {error}
                            </div>
                        ) : (
                            <p className="text-gray-600 mb-6">
                                Bạn có chắc chắn muốn xóa Chi Đoàn này? <br />
                                <span className="text-red-600 font-medium">Tất cả tài khoản và sinh viên thuộc Chi Đoàn sẽ bị xóa vĩnh viễn.</span>
                            </p>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                            >
                                Hủy
                            </button>
                            {!error && (
                                <button
                                    onClick={handleDelete}
                                    disabled={loading}
                                    className="flex-1 px-4 py-2.5 bg-red-500 text-white font-medium rounded-xl hover:bg-red-600 disabled:opacity-50 transition-colors"
                                >
                                    {loading ? 'Đang xóa...' : 'Xóa Chi Đoàn'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
