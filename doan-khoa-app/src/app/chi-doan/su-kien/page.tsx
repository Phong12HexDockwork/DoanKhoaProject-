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
        orderBy: { ngayTao: 'desc' },
        include: { hocKy: true },
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

            {/* Events List */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
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
                                className="block px-6 py-5 hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-base font-semibold text-gray-900 truncate">
                                                {event.tenSuKien}
                                            </h3>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColors[event.trangThaiDuyet]}`}>
                                                {statusLabels[event.trangThaiDuyet]}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                            <span className="flex items-center">
                                                <svg className="mr-1.5 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                {new Date(event.thoiGianBatDau).toLocaleDateString('vi-VN', {
                                                    day: '2-digit',
                                                    month: '2-digit',
                                                    year: 'numeric'
                                                })}
                                            </span>
                                            <span className="flex items-center">
                                                <svg className="mr-1.5 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13" />
                                                </svg>
                                                {event.hocKy.tenHocKy}
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
