import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function MySuKienPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    const user = token ? await verifyToken(token) : null;

    if (!user?.chiDoanId) {
        return <div>Không tìm thấy thông tin chi đoàn</div>;
    }

    const suKiens = await prisma.suKien.findMany({
        where: {
            OR: [
                { chiDoanId: user.chiDoanId },
                { chiDoan: { maChiDoan: 'DOAN_KHOA' } }
            ]
        },
        orderBy: { thoiGianBatDau: 'desc' },
        include: { hocKy: true, chiDoan: true },
    });

    // Sort: Đoàn Khoa pinned top
    suKiens.sort((a, b) => {
        const aDK = a.chiDoan.maChiDoan === 'DOAN_KHOA';
        const bDK = b.chiDoan.maChiDoan === 'DOAN_KHOA';
        if (aDK && !bDK) return -1;
        if (!aDK && bDK) return 1;
        return 0; // Keep original orderBy for others
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
                        <svg className="mx-auto h-12 w-12 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                                className={`block px-6 py-4 hover:bg-gray-50 transition-colors ${event.chiDoan.maChiDoan === 'DOAN_KHOA' ? 'bg-blue-50/60 border-l-4 border-[#0054A6]' : ''
                                    }`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-4">
                                        {/* Date Badge */}
                                        <div className={`flex-shrink-0 w-14 h-14 rounded-xl flex flex-col items-center justify-center text-white shadow-lg ${event.chiDoan.maChiDoan === 'DOAN_KHOA'
                                            ? 'bg-[#0054A6] shadow-blue-200'
                                            : 'bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-emerald-200'
                                            }`}>
                                            <span className="text-xs font-medium opacity-90">
                                                Tháng {new Date(event.thoiGianBatDau).getMonth() + 1}
                                            </span>
                                            <span className="text-xl font-bold">
                                                {new Date(event.thoiGianBatDau).getDate()}
                                            </span>
                                        </div>

                                        {/* Event Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h3 className={`font-semibold truncate ${event.chiDoan.maChiDoan === 'DOAN_KHOA' ? 'text-[#0054A6] text-lg' : 'text-gray-900'
                                                    }`}>
                                                    {event.chiDoan.maChiDoan === 'DOAN_KHOA' && '★ '}
                                                    {event.tenSuKien}
                                                </h3>
                                                {event.chiDoan.maChiDoan === 'DOAN_KHOA' && (
                                                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                                                        Đoàn Khoa
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-3 mt-2 text-sm text-gray-500 flex-wrap">
                                                <span className="flex items-center">
                                                    <svg className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    {new Date(event.thoiGianBatDau).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                                    {' - '}
                                                    {new Date(event.thoiGianKetThuc).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                {/* Hình thức badge */}
                                                <span className="flex items-center">
                                                    {event.hinhThuc === 'ONLINE' ? (
                                                        <svg className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                                        </svg>
                                                    ) : (
                                                        <svg className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                        </svg>
                                                    )}
                                                    {event.hinhThuc === 'ONLINE' ? 'Online' : 'Offline'}
                                                </span>
                                            </div>
                                            {/* Địa điểm */}
                                            {event.hinhThuc !== 'ONLINE' && (event.coSo || event.diaDiem) && (
                                                <p className="mt-1 text-sm text-gray-500 flex items-center">
                                                    <svg className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                    {event.coSo === 'CS1' && 'Cơ sở 1'}
                                                    {event.coSo === 'CS2' && 'Cơ sở 2'}
                                                    {event.diaDiem && ` - ${event.diaDiem}`}
                                                </p>
                                            )}
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
