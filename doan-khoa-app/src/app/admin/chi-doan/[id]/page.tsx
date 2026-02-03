import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function ChiDoanDetailPage({ params }: PageProps) {
    const { id } = await params;

    const chiDoan = await prisma.chiDoan.findUnique({
        where: { id },
        include: {
            nguoiDungs: {
                select: {
                    id: true,
                    hoTen: true,
                    email: true,
                    trangThai: true,
                    lanDangNhapCuoi: true,
                },
            },
            suKiens: {
                take: 5,
                orderBy: { ngayTao: 'desc' },
                select: {
                    id: true,
                    tenSuKien: true,
                    trangThaiDuyet: true,
                    thoiGianBatDau: true,
                },
            },
            _count: {
                select: { suKiens: true },
            },
        },
    });

    if (!chiDoan) {
        notFound();
    }

    const statusColors: Record<string, string> = {
        CHO_DUYET: 'bg-yellow-100 text-yellow-800',
        DA_DUYET: 'bg-green-100 text-green-800',
        TU_CHOI: 'bg-red-100 text-red-800',
        YEU_CAU_SUA: 'bg-orange-100 text-orange-800',
    };

    const statusLabels: Record<string, string> = {
        CHO_DUYET: 'Chờ duyệt',
        DA_DUYET: 'Đã duyệt',
        TU_CHOI: 'Từ chối',
        YEU_CAU_SUA: 'Yêu cầu sửa',
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Back button */}
            <Link href="/admin/chi-doan" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700">
                <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Quay lại
            </Link>

            {/* Header */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center">
                            <span className="text-white font-bold text-2xl">
                                {chiDoan.tenChiDoan.charAt(0)}
                            </span>
                        </div>
                        <div className="ml-4">
                            <h1 className="text-2xl font-bold text-gray-900">{chiDoan.tenChiDoan}</h1>
                            <p className="text-gray-500">{chiDoan.maChiDoan}</p>
                        </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${chiDoan.trangThai
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                        {chiDoan.trangThai ? 'Hoạt động' : 'Đã tắt'}
                    </span>
                </div>

                {chiDoan.moTa && (
                    <p className="text-gray-600">{chiDoan.moTa}</p>
                )}

                <div className="mt-6 flex items-center gap-6 text-sm text-gray-500">
                    <span className="flex items-center">
                        <svg className="mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {chiDoan._count.suKiens} sự kiện
                    </span>
                    <span className="flex items-center">
                        <svg className="mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Tạo ngày {new Date(chiDoan.ngayTao).toLocaleDateString('vi-VN')}
                    </span>
                </div>
            </div>

            {/* Accounts */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">Tài khoản quản lý</h2>
                    <Link
                        href={`/admin/chi-doan/${id}/account`}
                        className="text-sm text-indigo-600 hover:text-indigo-700"
                    >
                        + Thêm tài khoản
                    </Link>
                </div>
                <div className="divide-y divide-gray-100">
                    {chiDoan.nguoiDungs.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">
                            Chưa có tài khoản nào
                        </div>
                    ) : (
                        chiDoan.nguoiDungs.map((user) => (
                            <div key={user.id} className="px-6 py-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                                            <span className="text-indigo-600 font-medium">
                                                {user.hoTen.charAt(0)}
                                            </span>
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm font-medium text-gray-900">{user.hoTen}</p>
                                            <p className="text-sm text-gray-500">{user.email}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${user.trangThai ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                            }`}>
                                            {user.trangThai ? 'Hoạt động' : 'Đã tắt'}
                                        </span>
                                        {user.lanDangNhapCuoi && (
                                            <p className="text-xs text-gray-400 mt-1">
                                                Đăng nhập lần cuối: {new Date(user.lanDangNhapCuoi).toLocaleDateString('vi-VN')}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Recent Events */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900">Sự kiện gần đây</h2>
                </div>
                <div className="divide-y divide-gray-100">
                    {chiDoan.suKiens.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">
                            Chưa có sự kiện nào
                        </div>
                    ) : (
                        chiDoan.suKiens.map((event) => (
                            <Link
                                key={event.id}
                                href={`/admin/su-kien/${event.id}`}
                                className="block px-6 py-4 hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{event.tenSuKien}</p>
                                        <p className="text-xs text-gray-500">
                                            {new Date(event.thoiGianBatDau).toLocaleDateString('vi-VN')}
                                        </p>
                                    </div>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[event.trangThaiDuyet]}`}>
                                        {statusLabels[event.trangThaiDuyet]}
                                    </span>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
