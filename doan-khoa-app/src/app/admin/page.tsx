import { prisma } from '@/lib/prisma';

export default async function AdminDashboard() {
    // Fetch stats
    const [suKienCount, chiDoanCount, suKienChoDuyet, sinhVienCount] = await Promise.all([
        prisma.suKien.count(),
        prisma.chiDoan.count(),
        prisma.suKien.count({ where: { trangThaiDuyet: 'CHO_DUYET' } }),
        prisma.sinhVien.count(),
    ]);

    const recentEvents = await prisma.suKien.findMany({
        take: 5,
        orderBy: { ngayTao: 'desc' },
        include: { chiDoan: true },
    });

    const stats = [
        { name: 'Tổng sự kiện', value: suKienCount, color: 'bg-blue-500', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
        { name: 'Chi đoàn', value: chiDoanCount, color: 'bg-green-500', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
        { name: 'Chờ duyệt', value: suKienChoDuyet, color: 'bg-yellow-500', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
        { name: 'Sinh viên', value: sinhVienCount, color: 'bg-purple-500', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    ];

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
        <div className="space-y-8">
            {/* Stats */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <div
                        key={stat.name}
                        className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center">
                            <div className={`rounded-xl ${stat.color} p-3`}>
                                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                                <p className="text-sm text-gray-500">{stat.name}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Events */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900">Sự kiện gần đây</h2>
                </div>
                <div className="divide-y divide-gray-100">
                    {recentEvents.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">
                            Chưa có sự kiện nào
                        </div>
                    ) : (
                        recentEvents.map((event) => (
                            <div key={event.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-sm font-medium text-gray-900 truncate">
                                            {event.tenSuKien}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            {event.chiDoan.tenChiDoan} • {new Date(event.thoiGianBatDau).toLocaleDateString('vi-VN')}
                                        </p>
                                    </div>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[event.trangThaiDuyet]}`}>
                                        {statusLabels[event.trangThaiDuyet]}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <a
                    href="/admin/su-kien"
                    className="flex items-center p-6 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl text-white hover:from-blue-600 hover:to-indigo-700 transition-all transform hover:scale-[1.02]"
                >
                    <svg className="h-8 w-8 mr-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <div>
                        <p className="font-semibold">Duyệt sự kiện</p>
                        <p className="text-sm text-blue-100">Xem và duyệt các sự kiện chờ</p>
                    </div>
                </a>

                <a
                    href="/admin/chi-doan"
                    className="flex items-center p-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl text-white hover:from-green-600 hover:to-emerald-700 transition-all transform hover:scale-[1.02]"
                >
                    <svg className="h-8 w-8 mr-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <div>
                        <p className="font-semibold">Quản lý Chi Đoàn</p>
                        <p className="text-sm text-green-100">Thêm và cấp tài khoản</p>
                    </div>
                </a>

                <a
                    href="/admin/hoc-ky"
                    className="flex items-center p-6 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl text-white hover:from-purple-600 hover:to-pink-700 transition-all transform hover:scale-[1.02]"
                >
                    <svg className="h-8 w-8 mr-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <div>
                        <p className="font-semibold">Quản lý Học kỳ</p>
                        <p className="text-sm text-purple-100">Thiết lập học kỳ mới</p>
                    </div>
                </a>
            </div>
        </div>
    );
}
