import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export default async function ChiDoanDashboard() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    const user = token ? await verifyToken(token) : null;

    if (!user?.chiDoanId) {
        return <div>Không tìm thấy thông tin chi đoàn</div>;
    }

    const [suKienCount, suKienChoDuyet, suKienDaDuyet, diemDanhCount] = await Promise.all([
        prisma.suKien.count({ where: { chiDoanId: user.chiDoanId } }),
        prisma.suKien.count({ where: { chiDoanId: user.chiDoanId, trangThaiDuyet: 'CHO_DUYET' } }),
        prisma.suKien.count({ where: { chiDoanId: user.chiDoanId, trangThaiDuyet: 'DA_DUYET' } }),
        prisma.diemDanh.count({
            where: {
                suKien: { chiDoanId: user.chiDoanId },
            },
        }),
    ]);

    const recentEvents = await prisma.suKien.findMany({
        where: { chiDoanId: user.chiDoanId },
        take: 5,
        orderBy: { ngayTao: 'desc' },
        include: { hocKy: true },
    });

    const stats = [
        { name: 'Tổng sự kiện', value: suKienCount, color: 'bg-blue-500', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
        { name: 'Chờ duyệt', value: suKienChoDuyet, color: 'bg-yellow-500', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
        { name: 'Đã duyệt', value: suKienDaDuyet, color: 'bg-green-500', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
        { name: 'Lượt điểm danh', value: diemDanhCount, color: 'bg-purple-500', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
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
            {/* Welcome */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 text-white">
                <h1 className="text-2xl font-bold mb-2">Xin chào, {user.hoTen}!</h1>
                <p className="text-emerald-100">Quản lý các sự kiện của chi đoàn tại đây</p>
            </div>

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

            {/* Quick Actions */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Link
                    href="/chi-doan/su-kien/new"
                    className="flex items-center p-6 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl text-white hover:from-emerald-600 hover:to-teal-700 transition-all transform hover:scale-[1.02]"
                >
                    <svg className="h-10 w-10 mr-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <div>
                        <p className="text-lg font-semibold">Tạo sự kiện mới</p>
                        <p className="text-sm text-emerald-100">Đăng ký sự kiện để Đoàn Khoa duyệt</p>
                    </div>
                </Link>

                <Link
                    href="/chi-doan/lich"
                    className="flex items-center p-6 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl text-white hover:from-blue-600 hover:to-indigo-700 transition-all transform hover:scale-[1.02]"
                >
                    <svg className="h-10 w-10 mr-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <div>
                        <p className="text-lg font-semibold">Xem lịch chung</p>
                        <p className="text-sm text-blue-100">Lịch sự kiện của tất cả chi đoàn</p>
                    </div>
                </Link>
            </div>

            {/* Recent Events */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">Sự kiện gần đây</h2>
                    <Link href="/chi-doan/su-kien" className="text-sm text-emerald-600 hover:text-emerald-700">
                        Xem tất cả →
                    </Link>
                </div>
                <div className="divide-y divide-gray-100">
                    {recentEvents.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">
                            Chưa có sự kiện nào
                        </div>
                    ) : (
                        recentEvents.map((event) => (
                            <Link
                                key={event.id}
                                href={`/chi-doan/su-kien/${event.id}`}
                                className="block px-6 py-4 hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-sm font-medium text-gray-900 truncate">
                                            {event.tenSuKien}
                                        </h3>
                                        <p className="text-sm text-gray-500">
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
