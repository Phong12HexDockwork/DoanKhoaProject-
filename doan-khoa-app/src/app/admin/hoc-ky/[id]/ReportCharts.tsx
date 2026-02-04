'use client';

import Link from 'next/link';
import { HANG_MUCS, getHangMucByMa, getMucConByMa } from '@/lib/activityCategories';

interface ChiDoan {
    id: string;
    tenChiDoan: string;
    maChiDoan: string;
}

interface SuKien {
    id: string;
    tenSuKien: string;
    trangThaiDuyet: string;
    hangMuc: string | null;
    maMuc: string | null;
    chiDoan: ChiDoan;
}

interface ReportChartsProps {
    suKiens: SuKien[];
    chiDoans: ChiDoan[];
    hocKyId: string;
    chiDoanFilter?: string;
}

export default function ReportCharts({ suKiens, chiDoans, hocKyId, chiDoanFilter }: ReportChartsProps) {
    // Calculate stats by hang muc A-H
    const hangMucStats = HANG_MUCS.map(hm => {
        const events = suKiens.filter(s => s.hangMuc === hm.ma && s.trangThaiDuyet === 'DA_DUYET');
        return {
            ma: hm.ma,
            ten: hm.ten,
            count: events.length,
        };
    });

    const chiDoanStats = chiDoans
        .filter(cd => cd.maChiDoan !== 'DOAN_KHOA')
        .map(cd => {
            const events = suKiens.filter(s => s.chiDoan.id === cd.id && s.trangThaiDuyet === 'DA_DUYET');
            return {
                id: cd.id,
                ten: cd.tenChiDoan,
                eventCount: events.length,
            };
        })
        .sort((a, b) => b.eventCount - a.eventCount);

    const maxEvents = Math.max(...hangMucStats.map(h => h.count), 1);
    const maxChiDoanEvents = Math.max(...chiDoanStats.map(c => c.eventCount), 1);

    return (
        <div className={`grid grid-cols-1 ${!chiDoanFilter ? 'lg:grid-cols-2' : ''} gap-6`}>
            {/* Biểu đồ Hạng mục A-H */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Phân bổ theo Hạng mục hoạt động
                </h3>
                <div className="space-y-3">
                    {hangMucStats.map((hm) => (
                        <div key={hm.ma} className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-[#0054A6] text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                                {hm.ma}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-700 truncate" title={hm.ten}>{hm.ten}</span>
                                    <span className="text-gray-500 flex-shrink-0 ml-2">{hm.count} sự kiện</span>
                                </div>
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-[#0054A6] rounded-full transition-all duration-500"
                                        style={{ width: `${(hm.count / maxEvents) * 100}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Tổng kết */}
                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between text-sm">
                    <span className="text-gray-600">Tổng sự kiện đã phân loại:</span>
                    <span className="font-semibold text-gray-900">
                        {hangMucStats.reduce((sum, h) => sum + h.count, 0)}
                    </span>
                </div>
            </div>

            {/* Bảng xếp hạng Chi Đoàn - Chỉ hiển thị khi xem tất cả */}
            {!chiDoanFilter && (
                <div className="bg-white rounded-2xl shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Xếp hạng Chi Đoàn theo số lượng sự kiện
                    </h3>
                    {chiDoanStats.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">Chưa có dữ liệu</p>
                    ) : (
                        <div className="space-y-3">
                            {chiDoanStats.map((cd, index) => (
                                <Link
                                    key={cd.id}
                                    href={`/admin/hoc-ky/${hocKyId}?chiDoan=${cd.id}`}
                                    className="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-gray-50 transition-colors group cursor-pointer"
                                >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0 ${index > 2 ? 'bg-gray-100 text-gray-600 text-sm' : 'text-2xl bg-transparent'
                                        }`}>
                                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="font-medium text-gray-900 truncate group-hover:text-[#0054A6] transition-colors">{cd.ten}</span>
                                            <span className="text-gray-500 flex-shrink-0 ml-2">{cd.eventCount} sự kiện</span>
                                        </div>
                                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-500 ${index === 0 ? 'bg-yellow-400' :
                                                    index === 1 ? 'bg-gray-400' :
                                                        index === 2 ? 'bg-orange-400' :
                                                            'bg-[#0054A6]'
                                                    }`}
                                                style={{ width: `${(cd.eventCount / maxChiDoanEvents) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                    <div className="text-sm font-bold text-[#0054A6] w-16 text-right flex-shrink-0">
                                        {cd.eventCount}
                                    </div>
                                    <svg className="w-5 h-5 text-gray-300 group-hover:text-[#0054A6] opacity-0 group-hover:opacity-100 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
