'use client';

import { useState } from 'react';
import Link from 'next/link';
import DownloadButton from './DownloadButton';
import { HANG_MUCS, getMucConByMa } from '@/lib/activityCategories';

interface ChiDoan {
    id: string;
    tenChiDoan: string;
}

interface SuKien {
    id: string;
    tenSuKien: string;
    trangThaiDuyet: string;
    thoiGianBatDau: string;
    thoiGianKetThuc: string;
    diaDiem: string | null;
    hinhThuc?: string;
    coSo?: string | null;
    hangMuc: string | null;
    maMuc: string | null;
    chiDoan: ChiDoan;
    hocKy: { id: string; tenHocKy: string };
    _count: { diemDanhs: number };
}

interface EventListClientProps {
    suKiens: SuKien[];
    chiDoans: ChiDoan[];
    chiDoanFilter?: string;
    trangThaiFilter?: string;
    hangMucFilter?: string;
    statusColors: Record<string, string>;
    statusLabels: Record<string, string>;
}

export default function EventListClient({
    suKiens,
    chiDoans,
    chiDoanFilter,
    trangThaiFilter,
    hangMucFilter,
    statusColors,
    statusLabels,
}: EventListClientProps) {
    const [selectedEvents, setSelectedEvents] = useState<Set<string>>(new Set());
    const [downloading, setDownloading] = useState(false);

    // Only events with attendance can be selected for bulk download
    const selectableEvents = suKiens.filter(e => e._count.diemDanhs > 0);
    const allSelectableSelected = selectableEvents.length > 0 &&
        selectableEvents.every(e => selectedEvents.has(e.id));

    const toggleEvent = (eventId: string) => {
        const newSelected = new Set(selectedEvents);
        if (newSelected.has(eventId)) {
            newSelected.delete(eventId);
        } else {
            newSelected.add(eventId);
        }
        setSelectedEvents(newSelected);
    };

    const toggleAll = () => {
        if (allSelectableSelected) {
            setSelectedEvents(new Set());
        } else {
            setSelectedEvents(new Set(selectableEvents.map(e => e.id)));
        }
    };

    const handleBulkDownload = async () => {
        if (selectedEvents.size === 0) return;

        setDownloading(true);
        try {
            const res = await fetch('/api/admin/su-kien/bulk-export', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ eventIds: Array.from(selectedEvents) }),
            });

            if (!res.ok) {
                const data = await res.json();
                alert(data.error || 'Có lỗi xảy ra');
                return;
            }

            const contentDisposition = res.headers.get('Content-Disposition');
            let filename = 'diem_danh.xlsx';
            if (contentDisposition) {
                const match = contentDisposition.match(/filename="(.+)"/);
                if (match) filename = match[1];
            }

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            // Clear selection after download
            setSelectedEvents(new Set());
        } catch {
            alert('Có lỗi xảy ra');
        } finally {
            setDownloading(false);
        }
    };

    // Helper to build URL with all filters
    const buildFilterUrl = (params: { chiDoan?: string; trangThai?: string; hangMuc?: string }) => {
        const query = new URLSearchParams();

        // Use params or current state
        const cd = params.chiDoan ?? chiDoanFilter;
        if (cd) query.set('chiDoan', cd);

        const tt = params.trangThai ?? trangThaiFilter;
        if (tt) query.set('trangThai', tt);

        const hm = params.hangMuc ?? hangMucFilter;
        if (hm) query.set('hangMuc', hm);

        return `/admin/su-kien?${query.toString()}`;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Quản lý Sự kiện</h1>
                <p className="text-gray-500 mt-1">Duyệt và quản lý các sự kiện từ Chi Đoàn</p>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl shadow-sm p-4 space-y-4">
                {/* Filter by Chi Đoàn */}
                <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-gray-700 min-w-[100px]">Chi Đoàn:</span>
                    <div className="flex flex-wrap gap-2">
                        <Link
                            href={buildFilterUrl({ chiDoan: '' })} // Reset chiDoan
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${!chiDoanFilter
                                ? 'bg-[#0054A6] text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            Tất cả
                        </Link>
                        {chiDoans.map((cd) => (
                            <Link
                                key={cd.id}
                                href={buildFilterUrl({ chiDoan: cd.id })}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${chiDoanFilter === cd.id
                                    ? 'bg-[#0054A6] text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {cd.tenChiDoan}
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Filter by Status */}
                <div className="flex items-center gap-4 border-t border-gray-100 pt-4">
                    <span className="text-sm font-medium text-gray-700 min-w-[100px]">Trạng thái:</span>
                    <div className="flex flex-wrap gap-2">
                        <Link
                            href={buildFilterUrl({ trangThai: '' })}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${!trangThaiFilter
                                ? 'bg-[#0054A6] text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            Tất cả
                        </Link>
                        {Object.entries(statusLabels).map(([key, label]) => (
                            <Link
                                key={key}
                                href={buildFilterUrl({ trangThai: key })}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${trangThaiFilter === key
                                    ? 'bg-[#0054A6] text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {label}
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Filter by Category */}
                <div className="flex items-center gap-4 border-t border-gray-100 pt-4">
                    <span className="text-sm font-medium text-gray-700 min-w-[100px]">Hạng mục:</span>
                    <div className="flex flex-wrap gap-2">
                        <Link
                            href={buildFilterUrl({ hangMuc: '' })}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${!hangMucFilter
                                ? 'bg-[#0054A6] text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            Tất cả
                        </Link>
                        {HANG_MUCS.map((hm) => (
                            <Link
                                key={hm.ma}
                                href={buildFilterUrl({ hangMuc: hm.ma })}
                                className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-colors ${hangMucFilter === hm.ma
                                    ? 'bg-[#0054A6] text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                title={hm.ten}
                            >
                                {hm.ma}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bulk Download Bar */}
            {selectedEvents.size > 0 && (
                <div className="bg-[#0054A6] text-white rounded-xl p-4 flex items-center justify-between">
                    <span className="font-medium">
                        Đã chọn {selectedEvents.size} sự kiện
                    </span>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSelectedEvents(new Set())}
                            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
                        >
                            Bỏ chọn
                        </button>
                        <button
                            onClick={handleBulkDownload}
                            disabled={downloading}
                            className="px-4 py-2 bg-white text-[#0054A6] rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            {downloading ? 'Đang tải...' : 'Tải xuống'}
                        </button>
                    </div>
                </div>
            )}

            {/* Events List */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                {suKiens.length === 0 ? (
                    <div className="p-12 text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="mt-4 text-gray-500">Chưa có sự kiện nào</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {/* Header with Select All */}
                        {selectableEvents.length > 0 && (
                            <div className="px-6 py-3 bg-gray-50 flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    checked={allSelectableSelected}
                                    onChange={toggleAll}
                                    className="h-4 w-4 rounded border-gray-300 text-[#0054A6] focus:ring-[#0054A6]"
                                />
                                <span className="text-sm text-gray-600">
                                    Chọn tất cả ({selectableEvents.length} sự kiện có điểm danh)
                                </span>
                            </div>
                        )}
                        {suKiens.map((event) => {
                            const hasAttendance = event._count.diemDanhs > 0;
                            const isSelected = selectedEvents.has(event.id);

                            return (
                                <div
                                    key={event.id}
                                    className={`px-6 py-5 hover:bg-gray-50 transition-colors ${isSelected ? 'bg-blue-50' : ''}`}
                                >
                                    <div className="flex items-start gap-4">
                                        {/* Checkbox */}
                                        <div className="pt-1">
                                            {hasAttendance ? (
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => toggleEvent(event.id)}
                                                    className="h-4 w-4 rounded border-gray-300 text-[#0054A6] focus:ring-[#0054A6]"
                                                />
                                            ) : (
                                                <div className="h-4 w-4" />
                                            )}
                                        </div>

                                        {/* Event Info */}
                                        <Link href={`/admin/su-kien/${event.id}`} className="flex-1 min-w-0">
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
                                                    <svg className="mr-1.5 h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
                                                    </svg>
                                                    {event.chiDoan.tenChiDoan}
                                                </span>
                                                <span className="flex items-center">
                                                    <svg className="mr-1.5 h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                                                    <svg className="mr-1.5 h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    {new Date(event.thoiGianBatDau).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                                    {' - '}
                                                    {new Date(event.thoiGianKetThuc).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                <span className="text-gray-500">
                                                    {event.hinhThuc === 'ONLINE' ? 'Online' : 'Offline'}
                                                </span>
                                            </div>
                                            {event.hinhThuc !== 'ONLINE' && (event.coSo || event.diaDiem) && (
                                                <p className="mt-2 text-sm text-gray-500 flex items-center">
                                                    <svg className="mr-1.5 h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                    {event.coSo === 'CS1' && 'Cơ sở 1'}
                                                    {event.coSo === 'CS2' && 'Cơ sở 2'}
                                                    {event.diaDiem && ` - ${event.diaDiem}`}
                                                </p>
                                            )}

                                            {/* Category Info */}
                                            {event.hangMuc && event.maMuc && (
                                                <div className="mt-3 flex items-start gap-2 text-sm">
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-[#0054A6] text-white whitespace-nowrap">
                                                        {event.hangMuc}
                                                    </span>
                                                    <span className="text-gray-600">
                                                        <span className="font-semibold text-gray-900 mr-1">{event.maMuc}:</span>
                                                        {getMucConByMa(event.hangMuc, event.maMuc)?.tenMuc}
                                                    </span>
                                                </div>
                                            )}
                                        </Link>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2">
                                            <DownloadButton eventId={event.id} attendanceCount={event._count.diemDanhs} />
                                            <Link href={`/admin/su-kien/${event.id}`} className="p-2 text-gray-400 hover:text-gray-600">
                                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
