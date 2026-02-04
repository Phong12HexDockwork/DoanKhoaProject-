import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export default async function ChiDoanPage() {
    const chiDoans = await prisma.chiDoan.findMany({
        include: {
            _count: {
                select: { suKiens: true, nguoiDungs: true },
            },
        },
        orderBy: { tenChiDoan: 'asc' },
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Quản lý Chi Đoàn</h1>
                    <p className="text-gray-500 mt-1">Quản lý và cấp tài khoản cho các Chi Đoàn</p>
                </div>
                <Link
                    href="/admin/chi-doan/new"
                    className="inline-flex items-center px-4 py-2 bg-[#0054A6] text-white font-medium rounded-xl hover:bg-blue-800 transition-colors shadow-lg shadow-blue-200"
                >
                    <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Thêm Chi Đoàn
                </Link>
            </div>

            {/* Chi Đoàn List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {chiDoans.map((chiDoan) => (
                    <div
                        key={chiDoan.id}
                        className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 bg-[#0054A6] rounded-xl flex items-center justify-center shadow-md">
                                <span className="text-white font-bold text-lg">
                                    {chiDoan.tenChiDoan.charAt(0)}
                                </span>
                            </div>
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${chiDoan.trangThai
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-600'
                                }`}>
                                {chiDoan.trangThai ? 'Hoạt động' : 'Đã tắt'}
                            </span>
                        </div>

                        <h3 className="font-semibold text-gray-900 mb-1">{chiDoan.tenChiDoan}</h3>
                        <p className="text-sm text-gray-500 mb-4">{chiDoan.maChiDoan}</p>

                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                            <span className="flex items-center">
                                <svg className="mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {chiDoan._count.suKiens} sự kiện
                            </span>
                            <span className="flex items-center">
                                <svg className="mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                {chiDoan._count.nguoiDungs} tài khoản
                            </span>
                        </div>

                        <div className="flex gap-2">
                            <Link
                                href={`/admin/chi-doan/${chiDoan.id}`}
                                className="flex-1 text-center px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors text-sm"
                            >
                                Chi tiết
                            </Link>
                            <Link
                                href={`/admin/chi-doan/${chiDoan.id}/account`}
                                className="flex-1 text-center px-4 py-2 bg-blue-50 text-[#0054A6] font-medium rounded-xl hover:bg-blue-100 transition-colors text-sm"
                            >
                                Cấp tài khoản
                            </Link>
                        </div>
                    </div>
                ))}
            </div>

            {chiDoans.length === 0 && (
                <div className="text-center py-12 bg-white rounded-2xl">
                    <svg className="mx-auto h-12 w-12 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
                    </svg>
                    <p className="mt-4 text-gray-500">Chưa có Chi Đoàn nào</p>
                    <Link
                        href="/admin/chi-doan/new"
                        className="mt-4 inline-flex items-center text-[#0054A6] hover:text-blue-800"
                    >
                        <svg className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Thêm Chi Đoàn đầu tiên
                    </Link>
                </div>
            )}
        </div>
    );
}
