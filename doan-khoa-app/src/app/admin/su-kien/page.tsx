import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export default async function SuKienPage() {
    const suKiens = await prisma.suKien.findMany({
        orderBy: { ngayTao: 'desc' },
        include: {
            chiDoan: true,
            hocKy: true,
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

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Quản lý Sự kiện</h1>
                    <p className="text-gray-500 mt-1">Duyệt và quản lý các sự kiện từ Chi Đoàn</p>
                </div>
                <div className="flex gap-2">
                    <select className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                        <option value="">Tất cả trạng thái</option>
                        <option value="CHO_DUYET">Chờ duyệt</option>
                        <option value="DA_DUYET">Đã duyệt</option>
                        <option value="TU_CHOI">Từ chối</option>
                        <option value="YEU_CAU_SUA">Yêu cầu sửa</option>
                    </select>
                </div>
            </div>

            {/* Events List */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                {suKiens.length === 0 ? (
                    <div className="p-12 text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="mt-4 text-gray-500">Chưa có sự kiện nào</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {suKiens.map((event) => (
                            <Link
                                key={event.id}
                                href={`/admin/su-kien/${event.id}`}
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
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
                                                </svg>
                                                {event.chiDoan.tenChiDoan}
                                            </span>
                                            <span className="flex items-center">
                                                <svg className="mr-1.5 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                {new Date(event.thoiGianBatDau).toLocaleDateString('vi-VN', {
                                                    weekday: 'long',
                                                    day: '2-digit',
                                                    month: '2-digit',
                                                    year: 'numeric'
                                                })}
                                            </span>
                                            <span className="flex items-center">
                                                <svg className="mr-1.5 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                {new Date(event.thoiGianBatDau).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                                {' - '}
                                                {new Date(event.thoiGianKetThuc).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        {event.diaDiem && (
                                            <p className="mt-2 text-sm text-gray-500 flex items-center">
                                                <svg className="mr-1.5 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                {event.diaDiem}
                                            </p>
                                        )}
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
