import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function DiemDanhPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    const user = token ? await verifyToken(token) : null;

    if (!user?.chiDoanId) {
        return <div>Không tìm thấy thông tin chi đoàn</div>;
    }

    // Get approved events for attendance
    const suKiens = await prisma.suKien.findMany({
        where: {
            chiDoanId: user.chiDoanId,
            trangThaiDuyet: 'DA_DUYET',
        },
        orderBy: { thoiGianBatDau: 'desc' },
        include: {
            _count: {
                select: { diemDanhs: true },
            },
        },
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Điểm danh</h1>
                <p className="text-gray-500 mt-1">Quản lý điểm danh cho các sự kiện đã được duyệt</p>
            </div>

            {/* Events List */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                {suKiens.length === 0 ? (
                    <div className="p-12 text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                        <p className="mt-4 text-gray-500">Chưa có sự kiện nào được duyệt</p>
                        <p className="text-sm text-gray-600 mt-1">Các sự kiện cần được Đoàn Khoa duyệt trước khi điểm danh</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {suKiens.map((event) => {
                            const isUpcoming = new Date(event.thoiGianBatDau) > new Date();
                            const isOngoing = new Date(event.thoiGianBatDau) <= new Date() && new Date(event.thoiGianKetThuc) >= new Date();

                            return (
                                <Link
                                    key={event.id}
                                    href={`/chi-doan/diem-danh/${event.id}`}
                                    className="block px-6 py-5 hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="font-semibold text-gray-900">{event.tenSuKien}</h3>
                                                {isOngoing && (
                                                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full animate-pulse">
                                                        Đang diễn ra
                                                    </span>
                                                )}
                                                {isUpcoming && (
                                                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                                                        Sắp diễn ra
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                                <span className="flex items-center">
                                                    <svg className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    {new Date(event.thoiGianBatDau).toLocaleDateString('vi-VN', {
                                                        weekday: 'short',
                                                        day: '2-digit',
                                                        month: '2-digit',
                                                        year: 'numeric',
                                                    })}
                                                </span>
                                                <span className="flex items-center">
                                                    <svg className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    {new Date(event.thoiGianBatDau).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                <span className="flex items-center">
                                                    <svg className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
                                                    </svg>
                                                    {event._count.diemDanhs} đã điểm danh
                                                </span>
                                            </div>
                                        </div>
                                        <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
