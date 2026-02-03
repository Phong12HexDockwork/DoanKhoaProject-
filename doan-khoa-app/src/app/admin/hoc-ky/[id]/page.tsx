import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';

interface PageProps {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ chiDoan?: string }>;
}

export default async function HocKyDetailPage({ params, searchParams }: PageProps) {
    const { id } = await params;
    const { chiDoan: chiDoanFilter } = await searchParams;

    const hocKy = await prisma.hocKy.findUnique({
        where: { id },
    });

    if (!hocKy) {
        notFound();
    }

    // Get all chi đoàn for filter
    const chiDoans = await prisma.chiDoan.findMany({
        orderBy: { tenChiDoan: 'asc' },
    });

    // Get events with optional chi đoàn filter
    const suKiens = await prisma.suKien.findMany({
        where: {
            hocKyId: id,
            ...(chiDoanFilter ? { chiDoanId: chiDoanFilter } : {}),
        },
        orderBy: { thoiGianBatDau: 'asc' },
        include: {
            chiDoan: true,
        },
    });

    // Stats
    const stats = {
        total: suKiens.length,
        choDuyet: suKiens.filter(s => s.trangThaiDuyet === 'CHO_DUYET').length,
        daDuyet: suKiens.filter(s => s.trangThaiDuyet === 'DA_DUYET').length,
        tuChoi: suKiens.filter(s => s.trangThaiDuyet === 'TU_CHOI').length,
    };

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
        <div className="space-y-6">
            {/* Back button */}
            <Link href="/admin/hoc-ky" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700">
                <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Quay lại
            </Link>

            {/* Header */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{hocKy.tenHocKy}</h1>
                        <p className="text-gray-500 mt-1">
                            {new Date(hocKy.ngayBatDau).toLocaleDateString('vi-VN')} - {new Date(hocKy.ngayKetThuc).toLocaleDateString('vi-VN')}
                        </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${hocKy.trangThai ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                        {hocKy.trangThai ? 'Đang diễn ra' : 'Đã kết thúc'}
                    </span>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-4 mt-6">
                    <div className="bg-blue-50 rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
                        <p className="text-sm text-blue-600">Tổng sự kiện</p>
                    </div>
                    <div className="bg-yellow-50 rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold text-yellow-600">{stats.choDuyet}</p>
                        <p className="text-sm text-yellow-600">Chờ duyệt</p>
                    </div>
                    <div className="bg-green-50 rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold text-green-600">{stats.daDuyet}</p>
                        <p className="text-sm text-green-600">Đã duyệt</p>
                    </div>
                    <div className="bg-red-50 rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold text-red-600">{stats.tuChoi}</p>
                        <p className="text-sm text-red-600">Từ chối</p>
                    </div>
                </div>
            </div>

            {/* Filter */}
            <div className="bg-white rounded-2xl shadow-sm p-4">
                <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-gray-700">Lọc theo Chi Đoàn:</span>
                    <div className="flex flex-wrap gap-2">
                        <Link
                            href={`/admin/hoc-ky/${id}`}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${!chiDoanFilter
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            Tất cả
                        </Link>
                        {chiDoans.map((cd) => (
                            <Link
                                key={cd.id}
                                href={`/admin/hoc-ky/${id}?chiDoan=${cd.id}`}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${chiDoanFilter === cd.id
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {cd.tenChiDoan}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* Events List */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Danh sách sự kiện
                        {chiDoanFilter && (
                            <span className="text-sm font-normal text-gray-500 ml-2">
                                ({chiDoans.find(c => c.id === chiDoanFilter)?.tenChiDoan})
                            </span>
                        )}
                    </h2>
                </div>
                {suKiens.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        Không có sự kiện nào
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {suKiens.map((event) => (
                            <Link
                                key={event.id}
                                href={`/admin/su-kien/${event.id}`}
                                className="block px-6 py-4 hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="font-medium text-gray-900">{event.tenSuKien}</h3>
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[event.trangThaiDuyet]}`}>
                                                {statusLabels[event.trangThaiDuyet]}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                            <span className="flex items-center">
                                                <svg className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
                                                </svg>
                                                {event.chiDoan.tenChiDoan}
                                            </span>
                                            <span className="flex items-center">
                                                <svg className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                {new Date(event.thoiGianBatDau).toLocaleDateString('vi-VN', {
                                                    weekday: 'short',
                                                    day: '2-digit',
                                                    month: '2-digit',
                                                })}
                                            </span>
                                            <span className="flex items-center">
                                                <svg className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                {new Date(event.thoiGianBatDau).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
