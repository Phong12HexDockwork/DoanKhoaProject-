import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export default async function MySuKienPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    const user = token ? await verifyToken(token) : null;

    if (!user?.chiDoanId) {
        return <div>Không tìm thấy thông tin chi đoàn</div>;
    }

    const suKiens = await prisma.suKien.findMany({
        where: { chiDoanId: user.chiDoanId },
        orderBy: { thoiGianBatDau: 'desc' },
        include: { hocKy: true },
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'DA_DUYET': return 'bg-green-500';
            case 'CHO_DUYET': return 'bg-yellow-500';
            case 'TU_CHOI': return 'bg-red-500';
            case 'YEU_CAU_SUA': return 'bg-orange-500';
            default: return 'bg-gray-500';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'DA_DUYET': return 'Đã duyệt';
            case 'CHO_DUYET': return 'Chờ duyệt';
            case 'TU_CHOI': return 'Từ chối';
            case 'YEU_CAU_SUA': return 'Yêu cầu sửa';
            default: return status;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Sự kiện của tôi</h1>
                    <p className="text-gray-500 mt-1">Quản lý các sự kiện của chi đoàn</p>
                </div>
                <Link
                    href="/chi-doan/su-kien/new"
                    className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-colors"
                >
                    <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Tạo sự kiện
                </Link>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl shadow-sm p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                            <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{suKiens.filter(s => s.trangThaiDuyet === 'DA_DUYET').length}</p>
                            <p className="text-sm text-gray-500">Đã duyệt</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-2xl shadow-sm p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                            <svg className="h-5 w-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{suKiens.filter(s => s.trangThaiDuyet === 'CHO_DUYET').length}</p>
                            <p className="text-sm text-gray-500">Chờ duyệt</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-2xl shadow-sm p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                            <svg className="h-5 w-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{suKiens.filter(s => s.trangThaiDuyet === 'YEU_CAU_SUA').length}</p>
                            <p className="text-sm text-gray-500">Yêu cầu sửa</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-2xl shadow-sm p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                            <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{suKiens.length}</p>
                            <p className="text-sm text-gray-500">Tổng số</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Events List */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900">Danh sách sự kiện</h2>
                </div>

                {suKiens.length === 0 ? (
                    <div className="p-12 text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="mt-4 text-gray-500">Chưa có sự kiện nào</p>
                        <Link
                            href="/chi-doan/su-kien/new"
                            className="mt-4 inline-flex items-center text-emerald-600 hover:text-emerald-700"
                        >
                            <svg className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Tạo sự kiện đầu tiên
                        </Link>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {suKiens.map((event) => (
                            <Link
                                key={event.id}
                                href={`/chi-doan/su-kien/${event.id}`}
                                className="block px-6 py-4 hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-4">
                                        {/* Date Badge */}
                                        <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex flex-col items-center justify-center text-white shadow-lg shadow-emerald-200">
                                            <span className="text-xs font-medium opacity-90">
                                                Tháng {new Date(event.thoiGianBatDau).getMonth() + 1}
                                            </span>
                                            <span className="text-xl font-bold">
                                                {new Date(event.thoiGianBatDau).getDate()}
                                            </span>
                                        </div>

                                        {/* Event Info */}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-gray-900 truncate">{event.tenSuKien}</h3>

                                            <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                                                <span className="flex items-center">
                                                    <svg className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    {new Date(event.thoiGianBatDau).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                                    {' - '}
                                                    {new Date(event.thoiGianKetThuc).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                <span className="flex items-center">
                                                    <svg className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13" />
                                                    </svg>
                                                    {event.hocKy.tenHocKy}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Status Badge */}
                                    <span className={`flex-shrink-0 px-3 py-1 text-xs font-medium rounded-full text-white ${getStatusColor(event.trangThaiDuyet)}`}>
                                        {getStatusText(event.trangThaiDuyet)}
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
