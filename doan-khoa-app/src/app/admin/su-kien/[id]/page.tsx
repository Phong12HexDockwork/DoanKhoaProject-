import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import ApprovalForm from './ApprovalForm';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function SuKienDetailPage({ params }: PageProps) {
    const { id } = await params;

    const suKien = await prisma.suKien.findUnique({
        where: { id },
        include: {
            chiDoan: true,
            hocKy: true,
            nguoiTao: true,
            nguoiDuyet: true,
            ghiChuDuyets: {
                orderBy: { ngayTao: 'desc' },
                include: { nguoiGhi: true },
            },
        },
    });

    if (!suKien) {
        notFound();
    }

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
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Back button */}
            <a href="/admin/su-kien" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700">
                <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Quay lại
            </a>

            {/* Event Header */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{suKien.tenSuKien}</h1>
                        <p className="text-gray-500 mt-1">{suKien.chiDoan.tenChiDoan}</p>
                    </div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusColors[suKien.trangThaiDuyet]}`}>
                        {statusLabels[suKien.trangThaiDuyet]}
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div className="space-y-4">
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Thời gian</p>
                            <p className="mt-1 text-sm text-gray-900">
                                {new Date(suKien.thoiGianBatDau).toLocaleDateString('vi-VN', {
                                    weekday: 'long',
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                })}
                            </p>
                            <p className="text-sm text-gray-600">
                                {new Date(suKien.thoiGianBatDau).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                {' - '}
                                {new Date(suKien.thoiGianKetThuc).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>

                        {suKien.diaDiem && (
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide">Địa điểm</p>
                                <p className="mt-1 text-sm text-gray-900">{suKien.diaDiem}</p>
                            </div>
                        )}

                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Học kỳ</p>
                            <p className="mt-1 text-sm text-gray-900">{suKien.hocKy.tenHocKy}</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {suKien.linkTaiLieu && (
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide">Tài liệu</p>
                                <a
                                    href={suKien.linkTaiLieu}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-1 inline-flex items-center text-sm text-indigo-600 hover:text-indigo-700"
                                >
                                    <svg className="mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                    Xem tài liệu
                                </a>
                            </div>
                        )}

                        {suKien.nguoiTao && (
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide">Người tạo</p>
                                <p className="mt-1 text-sm text-gray-900">{suKien.nguoiTao.hoTen}</p>
                            </div>
                        )}

                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Ngày tạo</p>
                            <p className="mt-1 text-sm text-gray-900">
                                {new Date(suKien.ngayTao).toLocaleDateString('vi-VN', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </p>
                        </div>
                    </div>
                </div>

                {suKien.moTa && (
                    <div className="mt-6 pt-6 border-t border-gray-100">
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Mô tả</p>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{suKien.moTa}</p>
                    </div>
                )}
            </div>

            {/* Approval Form */}
            <ApprovalForm
                suKienId={suKien.id}
                currentStatus={suKien.trangThaiDuyet}
            />

            {/* Comments History */}
            {suKien.ghiChuDuyets.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Lịch sử ghi chú</h2>
                    <div className="space-y-4">
                        {suKien.ghiChuDuyets.map((ghiChu) => (
                            <div key={ghiChu.id} className="flex gap-4">
                                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-xs font-medium text-indigo-600">
                                        {ghiChu.nguoiGhi.hoTen.charAt(0)}
                                    </span>
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-gray-900">
                                            {ghiChu.nguoiGhi.hoTen}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {new Date(ghiChu.ngayTao).toLocaleDateString('vi-VN', {
                                                day: '2-digit',
                                                month: '2-digit',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </span>
                                    </div>
                                    <p className="mt-1 text-sm text-gray-600">{ghiChu.noiDung}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
