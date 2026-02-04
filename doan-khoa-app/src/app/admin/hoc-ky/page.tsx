import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import DeleteSemesterButton from './DeleteSemesterButton';

export const dynamic = 'force-dynamic';
export default async function HocKyPage() {
    const hocKys = await prisma.hocKy.findMany({
        orderBy: { ngayBatDau: 'desc' },
        include: {
            _count: {
                select: { suKiens: true },
            },
        },
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Quản lý Học kỳ</h1>
                    <p className="text-gray-500 mt-1">Thiết lập và quản lý các học kỳ</p>
                </div>
                <Link
                    href="/admin/hoc-ky/new"
                    className="inline-flex items-center px-4 py-2 bg-[#0054A6] text-white font-medium rounded-xl hover:bg-blue-800 transition-colors shadow-lg shadow-blue-200"
                >
                    <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Thêm học kỳ
                </Link>
            </div>

            {/* Học kỳ List */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                {hocKys.length === 0 ? (
                    <div className="p-12 text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13" />
                        </svg>
                        <p className="mt-4 text-gray-500">Chưa có học kỳ nào</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {hocKys.map((hocKy) => (
                            <div
                                key={hocKy.id}
                                className="px-6 py-5 hover:bg-gray-50 transition-colors flex items-center justify-between"
                            >
                                <Link
                                    href={`/admin/hoc-ky/${hocKy.id}`}
                                    className="flex items-center flex-1"
                                >
                                    <div className="w-12 h-12 bg-[#0054A6] rounded-xl flex items-center justify-center shadow-md">
                                        <span className="text-white font-bold text-lg">
                                            {hocKy.ky}
                                        </span>
                                    </div>
                                    <div className="ml-4">
                                        <h3 className="text-base font-semibold text-gray-900">
                                            {hocKy.tenHocKy}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            Năm học: {hocKy.namHoc}
                                        </p>
                                    </div>
                                </Link>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <p className="text-sm text-gray-500">
                                            {new Date(hocKy.ngayBatDau).toLocaleDateString('vi-VN')} - {new Date(hocKy.ngayKetThuc).toLocaleDateString('vi-VN')}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            {hocKy._count.suKiens} sự kiện
                                        </p>
                                    </div>
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${hocKy.trangThai
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-gray-100 text-gray-600'
                                        }`}>
                                        {hocKy.trangThai ? 'Hoạt động' : 'Đã kết thúc'}
                                    </span>
                                    <DeleteSemesterButton
                                        id={hocKy.id}
                                        tenHocKy={hocKy.tenHocKy}
                                        suKienCount={hocKy._count.suKiens}
                                    />
                                    <Link href={`/admin/hoc-ky/${hocKy.id}`}>
                                        <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
