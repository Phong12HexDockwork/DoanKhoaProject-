import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import ReportCharts from './ReportCharts';
import { HANG_MUCS, getHangMucByMa, getMucConByMa } from '@/lib/activityCategories';

export const dynamic = 'force-dynamic';
interface PageProps {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ chiDoan?: string; hangMuc?: string }>;
}

export default async function HocKyDetailPage({ params, searchParams }: PageProps) {
    const { id } = await params;
    const { chiDoan: chiDoanFilter, hangMuc: hangMucFilter } = await searchParams;

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

    // Get events with optional chi đoàn filter and hang muc filter
    const suKiens = await prisma.suKien.findMany({
        where: {
            hocKyId: id,
            ...(chiDoanFilter ? { chiDoanId: chiDoanFilter } : {}),
            ...(hangMucFilter ? { hangMuc: hangMucFilter } : {}),
        },
        orderBy: { thoiGianBatDau: 'desc' },
        include: {
            chiDoan: true,
        },
    });

    // Stats
    const approvedEvents = suKiens.filter(s => s.trangThaiDuyet === 'DA_DUYET');

    const stats = {
        total: suKiens.length,
        choDuyet: suKiens.filter(s => s.trangThaiDuyet === 'CHO_DUYET').length,
        daDuyet: approvedEvents.length,
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

    // Serialize for client component
    const serializedSuKiens = suKiens.map(s => ({
        id: s.id,
        tenSuKien: s.tenSuKien,
        trangThaiDuyet: s.trangThaiDuyet,
        hangMuc: s.hangMuc,
        maMuc: s.maMuc,
        chiDoan: {
            id: s.chiDoan.id,
            tenChiDoan: s.chiDoan.tenChiDoan,
            maChiDoan: s.chiDoan.maChiDoan,
        },
    }));

    const serializedChiDoans = chiDoans.map(cd => ({
        id: cd.id,
        tenChiDoan: cd.tenChiDoan,
        maChiDoan: cd.maChiDoan,
    }));

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
                        <h1 className="text-2xl font-bold text-gray-900">Báo cáo {hocKy.tenHocKy}</h1>
                        <p className="text-gray-500 mt-1">
                            {new Date(hocKy.ngayBatDau).toLocaleDateString('vi-VN')} - {new Date(hocKy.ngayKetThuc).toLocaleDateString('vi-VN')}
                        </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${hocKy.trangThai ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                        {hocKy.trangThai ? 'Đang diễn ra' : 'Đã kết thúc'}
                    </span>
                </div>
            </div>

            {/* Filter */}
            <div className="bg-white rounded-2xl shadow-sm p-4">
                <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-gray-700">Lọc theo Chi Đoàn:</span>
                    <div className="flex flex-wrap gap-2">
                        <Link
                            href={`/admin/hoc-ky/${id}${hangMucFilter ? `?hangMuc=${hangMucFilter}` : ''}`}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${!chiDoanFilter
                                ? 'bg-[#0054A6] text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            Tất cả
                        </Link>
                        {chiDoans.filter(cd => cd.maChiDoan !== 'DOAN_KHOA').map((cd) => (
                            <Link
                                key={cd.id}
                                href={`/admin/hoc-ky/${id}?chiDoan=${cd.id}${hangMucFilter ? `&hangMuc=${hangMucFilter}` : ''}`}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${chiDoanFilter === cd.id
                                    ? 'bg-[#0054A6] text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {cd.tenChiDoan}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* Charts */}
            <ReportCharts
                suKiens={serializedSuKiens}
                chiDoans={serializedChiDoans}
                hocKyId={id}
                chiDoanFilter={chiDoanFilter}
            />

            {/* Events List */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Danh sách sự kiện
                        {chiDoanFilter && (
                            <span className="text-sm font-normal text-gray-500 ml-2">
                                ({chiDoans.find(c => c.id === chiDoanFilter)?.tenChiDoan})
                            </span>
                        )}
                    </h2>

                    {/* Category Filter */}
                    <div className="flex flex-wrap gap-2 items-center">
                        <span className="text-sm text-gray-500">Lọc hạng mục:</span>
                        <Link
                            href={`/admin/hoc-ky/${id}${chiDoanFilter ? `?chiDoan=${chiDoanFilter}` : ''}`}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-colors ${!hangMucFilter
                                ? 'bg-[#0054A6] text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            All
                        </Link>
                        {HANG_MUCS.map((hm) => (
                            <Link
                                key={hm.ma}
                                href={`/admin/hoc-ky/${id}?hangMuc=${hm.ma}${chiDoanFilter ? `&chiDoan=${chiDoanFilter}` : ''}`}
                                className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-colors ${hangMucFilter === hm.ma
                                    ? 'bg-[#0054A6] text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                title={hm.ten}
                            >
                                {hm.ma}
                            </Link>
                        ))}
                    </div>
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
                                            {event.hangMuc && (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-[#0054A6] text-white">
                                                    {event.hangMuc}
                                                </span>
                                            )}
                                            <h3 className="font-medium text-gray-900">{event.tenSuKien}</h3>
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[event.trangThaiDuyet]}`}>
                                                {statusLabels[event.trangThaiDuyet]}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                            <span>{event.chiDoan.tenChiDoan}</span>
                                            <span>
                                                {new Date(event.thoiGianBatDau).toLocaleDateString('vi-VN', {
                                                    day: '2-digit',
                                                    month: '2-digit',
                                                    year: 'numeric',
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                    {/* Removed arrow icon */}
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
