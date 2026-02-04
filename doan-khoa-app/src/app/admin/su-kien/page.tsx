import { prisma } from '@/lib/prisma';
import EventListClient from './EventListClient';

export const dynamic = 'force-dynamic';

interface PageProps {
    searchParams: Promise<{ chiDoan?: string; trangThai?: string; hangMuc?: string }>;
}

export default async function SuKienPage({ searchParams }: PageProps) {
    const { chiDoan: chiDoanFilter, trangThai: trangThaiFilter, hangMuc: hangMucFilter } = await searchParams;

    // Get all chi đoàn for filter
    const chiDoans = await prisma.chiDoan.findMany({
        orderBy: { tenChiDoan: 'asc' },
    });

    const suKiens = await prisma.suKien.findMany({
        where: {
            ...(chiDoanFilter ? { chiDoanId: chiDoanFilter } : {}),
            ...(trangThaiFilter ? { trangThaiDuyet: trangThaiFilter } : {}),
            ...(hangMucFilter ? { hangMuc: hangMucFilter } : {}),
        },
        orderBy: { ngayTao: 'desc' },
        include: {
            chiDoan: true,
            hocKy: true,
            _count: {
                select: { diemDanhs: true },
            },
        },
    });

    const statusColors: Record<string, string> = {
        CHO_DUYET: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        DA_DUYET: 'bg-green-100 text-green-800 border-green-200',
        TU_CHOI: 'bg-red-100 text-red-800 border-red-200',
        YEU_CAU_SUA: 'bg-orange-100 text-orange-800 border-orange-200',
    };

    const statusLabels: Record<string, string> = {
        CHO_DUYET: 'Chờ duyệt',
        DA_DUYET: 'Đã duyệt',
        TU_CHOI: 'Từ chối',
        YEU_CAU_SUA: 'Yêu cầu sửa',
    };

    // Serialize dates for client component
    const serializedSuKiens = suKiens.map(event => ({
        ...event,
        thoiGianBatDau: event.thoiGianBatDau.toISOString(),
        thoiGianKetThuc: event.thoiGianKetThuc.toISOString(),
    }));

    return (
        <EventListClient
            suKiens={serializedSuKiens}
            chiDoans={chiDoans}
            chiDoanFilter={chiDoanFilter}
            trangThaiFilter={trangThaiFilter}
            hangMucFilter={hangMucFilter}
            statusColors={statusColors}
            statusLabels={statusLabels}
        />
    );
}
