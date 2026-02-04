'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface ChiDoan {
    id: string;
    tenChiDoan: string;
    maChiDoan?: string;
}

interface SuKien {
    id: string;
    tenSuKien: string;
    thoiGianBatDau: string;
    thoiGianKetThuc: string;
    diaDiem: string | null;
    trangThaiDuyet: string;
    chiDoan: ChiDoan;
    _count?: {
        diemDanhs: number;
    };
}

export default function LichPage() {
    const [suKiens, setSuKiens] = useState<SuKien[]>([]);
    const [chiDoans, setChiDoans] = useState<ChiDoan[]>([]);
    const [currentChiDoanId, setCurrentChiDoanId] = useState<string>('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>('all');

    // Popover state
    const [selectedEvent, setSelectedEvent] = useState<{ event: SuKien; x: number; y: number } | null>(null);
    const [hoveredEventId, setHoveredEventId] = useState<string | null>(null);

    useEffect(() => {
        fetchEvents();
    }, [filter]);

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/chi-doan/lich?filter=${filter}`);
            const data = await res.json();
            if (data.suKiens) {
                setSuKiens(data.suKiens);
            }
            if (data.chiDoans) {
                setChiDoans(data.chiDoans);
            }
            if (data.currentChiDoanId) {
                setCurrentChiDoanId(data.currentChiDoanId);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Get days in month
    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDay = firstDay.getDay();

        return { daysInMonth, startingDay };
    };

    // Get events for a specific date
    const getEventsForDate = (date: Date) => {
        return suKiens.filter(sk => {
            const eventDate = new Date(sk.thoiGianBatDau);
            return eventDate.getDate() === date.getDate() &&
                eventDate.getMonth() === date.getMonth() &&
                eventDate.getFullYear() === date.getFullYear();
        });
    };

    // Navigate months
    const prevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
    };

    const nextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
    };

    // Get events for current month (for list view)
    const getEventsForMonth = () => {
        return suKiens.filter(sk => {
            const eventDate = new Date(sk.thoiGianBatDau);
            return eventDate.getMonth() === currentMonth.getMonth() &&
                eventDate.getFullYear() === currentMonth.getFullYear();
        }).sort((a, b) => {
            const aDK = a.chiDoan.maChiDoan === 'DOAN_KHOA';
            const bDK = b.chiDoan.maChiDoan === 'DOAN_KHOA';
            if (aDK && !bDK) return -1;
            if (!aDK && bDK) return 1;
            return new Date(a.thoiGianBatDau).getTime() - new Date(b.thoiGianBatDau).getTime();
        });
    };

    const { daysInMonth, startingDay } = getDaysInMonth(currentMonth);
    const monthEvents = getEventsForMonth();

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'DA_DUYET': return 'bg-green-500';
            case 'CHO_DUYET': return 'bg-yellow-500';
            case 'TU_CHOI': return 'bg-red-500';
            case 'YEU_CAU_SUA': return 'bg-orange-500';
            default: return 'bg-gray-500';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'DA_DUYET': return 'Đã duyệt';
            case 'CHO_DUYET': return 'Chờ duyệt';
            case 'TU_CHOI': return 'Từ chối';
            case 'YEU_CAU_SUA': return 'Yêu cầu sửa';
            default: return status;
        }
    };

    const isMyEvent = (event: SuKien) => event.chiDoan.id === currentChiDoanId;

    const handleEventClick = (e: React.MouseEvent, event: SuKien) => {
        e.preventDefault();
        e.stopPropagation();

        const rect = e.currentTarget.getBoundingClientRect();

        // Calculate position
        let x = rect.right + 10;
        let y = rect.top;

        // Adjust if overflowing viewport
        if (typeof window !== 'undefined') {
            if (x + 300 > window.innerWidth) { // 300px estimated width
                x = rect.left - 310;
            }
            if (y + 200 > window.innerHeight) {
                y = window.innerHeight - 220;
            }
        }

        setSelectedEvent({ event, x, y });
    };

    if (loading && suKiens.length === 0) {
        return <div className="p-6 text-center text-gray-500">Đang tải...</div>;
    }

    return (
        <div className="space-y-6 relative">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Lịch sự kiện</h1>
                    <p className="text-gray-500">Xem và quản lý sự kiện theo lịch</p>
                </div>
                <Link
                    href="/chi-doan/su-kien/new"
                    className="px-4 py-2 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-colors"
                >
                    + Tạo sự kiện
                </Link>
            </div>

            {/* Controls */}
            <div className="bg-white rounded-2xl shadow-sm p-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Month Navigation */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={prevMonth}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <h2 className="text-lg font-semibold text-gray-900 min-w-[180px] text-center">
                            Tháng {currentMonth.getMonth() + 1}, {currentMonth.getFullYear()}
                        </h2>
                        <button
                            onClick={nextMonth}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Chi Đoàn Filter */}
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        >
                            <option value="all">Tất cả Chi Đoàn</option>
                            <option value="mine">Chỉ của tôi</option>
                            <optgroup label="Chi Đoàn">
                                {chiDoans.map((cd) => (
                                    <option key={cd.id} value={cd.id}>
                                        {cd.tenChiDoan}
                                    </option>
                                ))}
                            </optgroup>
                        </select>

                        {/* View Toggle */}
                        <div className="flex items-center bg-gray-100 rounded-xl p-1">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${viewMode === 'grid'
                                    ? 'bg-white text-emerald-600 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                </svg>
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${viewMode === 'list'
                                    ? 'bg-white text-emerald-600 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Calendar Grid View */}
            {viewMode === 'grid' && (
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden min-h-[600px]">
                    {/* Weekday Headers */}
                    <div className="grid grid-cols-7 bg-gray-50 border-b">
                        {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((day) => (
                            <div key={day} className="py-3 text-center text-sm font-medium text-gray-500">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Days */}
                    <div className="grid grid-cols-7 select-none">
                        {/* Empty cells for days before month starts */}
                        {Array.from({ length: startingDay }).map((_, i) => (
                            <div key={`empty-${i}`} className="min-h-[120px] border-b border-r bg-gray-50/30" />
                        ))}

                        {/* Days of the month */}
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                            const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i + 1);

                            // Get events that overlap with this date
                            const dayEvents = suKiens.filter(sk => {
                                const start = new Date(sk.thoiGianBatDau);
                                start.setHours(0, 0, 0, 0);
                                const end = new Date(sk.thoiGianKetThuc);
                                end.setHours(23, 59, 59, 999);
                                const current = new Date(date);
                                current.setHours(0, 0, 0, 0); // Normalized current date (local midnight)

                                return current >= start && current <= end;
                            }).sort((a, b) => new Date(a.thoiGianBatDau).getTime() - new Date(b.thoiGianBatDau).getTime());

                            const isToday = date.toDateString() === new Date().toDateString();

                            return (
                                <div
                                    key={i}
                                    className={`min-h-[120px] border-b border-r flex flex-col pb-1 ${isToday ? 'bg-emerald-50/40' : ''
                                        }`}
                                >
                                    <div className={`p-2 text-sm font-medium ${isToday ? 'text-emerald-600' : 'text-gray-500'
                                        }`}>
                                        {i + 1}
                                    </div>
                                    <div className="flex-1 flex flex-col gap-1">
                                        {dayEvents.slice(0, 3).map((event) => {
                                            const start = new Date(event.thoiGianBatDau);
                                            start.setHours(0, 0, 0, 0);
                                            const end = new Date(event.thoiGianKetThuc);
                                            end.setHours(0, 0, 0, 0);
                                            const current = new Date(date);
                                            current.setHours(0, 0, 0, 0);

                                            const isStart = current.getTime() === start.getTime();
                                            const isEnd = current.getTime() === end.getTime();
                                            const isMiddle = !isStart && !isEnd;

                                            // Determine styles for continuous bar effect
                                            // If it's a multi-day event (start != end)
                                            const isMultiDay = start.getTime() !== end.getTime();
                                            const isHovered = hoveredEventId === event.id;

                                            let roundedClass = 'rounded-md mx-1';
                                            let zIndex = 'z-10';

                                            if (isMultiDay) {
                                                if (isStart) roundedClass = 'rounded-l-md ml-1 -mr-[1px] pr-2 relative';
                                                else if (isEnd) roundedClass = 'rounded-r-md mr-1 -ml-[1px] pl-2 relative';
                                                else roundedClass = 'rounded-none -mx-[1px] relative';
                                            }

                                            if (isHovered) zIndex = 'z-20';

                                            return (
                                                <div
                                                    key={event.id}
                                                    onClick={(e) => handleEventClick(e, event)}
                                                    onMouseEnter={() => setHoveredEventId(event.id)}
                                                    onMouseLeave={() => setHoveredEventId(null)}
                                                    className={`
                                                        px-2 py-1 text-xs cursor-pointer truncate transition-all duration-200 h-6 leading-none relative
                                                        ${roundedClass} ${zIndex}
                                                        ${isMyEvent(event)
                                                            ? 'bg-emerald-600 text-white shadow-sm'
                                                            : event.chiDoan.maChiDoan === 'DOAN_KHOA'
                                                                ? 'bg-[#0054A6] text-white shadow-sm font-semibold'
                                                                : `${getStatusColor(event.trangThaiDuyet)} text-white opacity-80`
                                                        }
                                                        ${isHovered ? 'brightness-110 shadow-md ring-2 ring-yellow-300 scale-[1.02]' : ''}
                                                    `}
                                                    title={`${event.tenSuKien} (${new Date(event.thoiGianBatDau).toLocaleTimeString()} - ${new Date(event.thoiGianKetThuc).toLocaleTimeString()})`}
                                                >
                                                    {/* Show title only on start day or if it's Sunday (start of row visually) - simplified to just showing always but truncated */}
                                                    {/* Or better: if middle, hide text to avoid repetition? Users usually prefer seeing text if space permits. */}
                                                    <span className={!isStart && isMultiDay ? 'invisible' : ''}>
                                                        {event.tenSuKien}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                        {dayEvents.length > 3 && (
                                            <div className="text-[10px] text-gray-500 px-2 mt-auto">
                                                +{dayEvents.length - 3} nữa
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* List View */}
            {viewMode === 'list' && (
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    {monthEvents.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            Không có sự kiện nào trong tháng này
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {monthEvents.map((event) => (
                                <Link
                                    key={event.id}
                                    href={`/chi-doan/su-kien/${event.id}`}
                                    className={`block px-6 py-4 hover:bg-gray-50 transition-colors ${isMyEvent(event) ? 'border-l-4 border-emerald-500 bg-emerald-50/30' : ''
                                        }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-4">
                                            {/* Date Badge */}
                                            <div className={`flex-shrink-0 w-14 h-14 rounded-xl flex flex-col items-center justify-center ${isMyEvent(event)
                                                    ? 'bg-emerald-100'
                                                    : event.chiDoan.maChiDoan === 'DOAN_KHOA'
                                                        ? 'bg-blue-100 text-[#0054A6]'
                                                        : 'bg-gray-100'
                                                }`}>
                                                <span className={`text-xs font-medium ${isMyEvent(event)
                                                        ? 'text-emerald-600'
                                                        : event.chiDoan.maChiDoan === 'DOAN_KHOA'
                                                            ? 'text-[#0054A6]'
                                                            : 'text-gray-500'
                                                    }`}>
                                                    Tháng {new Date(event.thoiGianBatDau).getMonth() + 1}
                                                </span>
                                                <span className={`text-xl font-bold ${isMyEvent(event)
                                                        ? 'text-emerald-700'
                                                        : event.chiDoan.maChiDoan === 'DOAN_KHOA'
                                                            ? 'text-[#0054A6]'
                                                            : 'text-gray-700'
                                                    }`}>
                                                    {new Date(event.thoiGianBatDau).getDate()}
                                                </span>
                                            </div>

                                            {/* Event Info */}
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-semibold text-gray-900">{event.tenSuKien}</h3>
                                                    {isMyEvent(event) && (
                                                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                                                            Của tôi
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Chi Đoàn Name - Highlighted */}
                                                <div className={`inline-block mt-1 px-2 py-0.5 rounded text-sm font-medium ${isMyEvent(event)
                                                    ? 'bg-emerald-100 text-emerald-700'
                                                    : event.chiDoan.maChiDoan === 'DOAN_KHOA'
                                                        ? 'bg-blue-100 text-[#0054A6]'
                                                        : 'bg-blue-50 text-blue-600'
                                                    }`}>
                                                    {event.chiDoan.maChiDoan === 'DOAN_KHOA' ? '★ Đoàn Khoa' : event.chiDoan.tenChiDoan}
                                                </div>

                                                <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                                                    <span className="flex items-center">
                                                        <svg className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        {new Date(event.thoiGianBatDau).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                                        {' - '}
                                                        {new Date(event.thoiGianKetThuc).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                    {event.diaDiem && (
                                                        <span className="flex items-center">
                                                            <svg className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                            </svg>
                                                            {event.diaDiem}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Status Badge */}
                                        <span className={`px-3 py-1 text-xs font-medium rounded-full text-white ${getStatusColor(event.trangThaiDuyet)}`}>
                                            {getStatusText(event.trangThaiDuyet)}
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Event Popover */}
            {selectedEvent && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setSelectedEvent(null)}></div>
                    <div
                        className="fixed z-50 bg-white rounded-xl shadow-2xl border border-gray-100 p-4 w-[280px] animate-in fade-in zoom-in-95 duration-200"
                        style={{ top: selectedEvent.y, left: selectedEvent.x }}
                    >
                        <div className="flex items-start justify-between mb-3">
                            <h3 className="font-semibold text-gray-900 line-clamp-2">{selectedEvent.event.tenSuKien}</h3>
                            <button onClick={() => setSelectedEvent(null)} className="text-gray-600 hover:text-gray-600">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-2 mb-4">
                            <div className="flex items-center text-sm text-gray-600">
                                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {new Date(selectedEvent.event.thoiGianBatDau).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                {selectedEvent.event.chiDoan.tenChiDoan}
                            </div>
                        </div>

                        <div className="flex justify-end pt-2 border-t border-gray-100">
                            {isMyEvent(selectedEvent.event) && (
                                <Link
                                    href={`/chi-doan/su-kien/${selectedEvent.event.id}`}
                                    className="flex items-center gap-2 px-3 py-2 bg-emerald-50 text-emerald-600 text-sm font-medium rounded-lg hover:bg-emerald-100 transition-colors"
                                    title="Chỉnh sửa"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    Chỉnh sửa
                                </Link>
                            )}
                        </div>
                    </div>
                </>
            )}

            {/* Legend */}
            <div className="bg-white rounded-2xl shadow-sm p-4">
                <div className="flex flex-wrap items-center gap-4 lg:gap-6 text-sm">
                    <span className="font-medium text-gray-700">Chú thích:</span>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-emerald-300"></span>
                        <span className="text-gray-600">Sự kiện của tôi</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                        <span className="text-gray-600">Đã duyệt</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                        <span className="text-gray-600">Chờ duyệt</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 bg-orange-500 rounded-full"></span>
                        <span className="text-gray-600">Yêu cầu sửa</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                        <span className="text-gray-600">Từ chối</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
