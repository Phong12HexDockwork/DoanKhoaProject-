'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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
    hinhThuc?: string;
    coSo?: string;
    moTa?: string;
    linkTaiLieu?: string;
    _count?: {
        diemDanhs: number;
    };
}

export default function LichPage() {
    const router = useRouter();
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
                            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
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
                            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
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
                        {Array.from({ length: startingDay }).map((_, i) => (
                            <div key={`empty-${i}`} className="min-h-[120px] border-b border-r bg-gray-50/30" />
                        ))}

                        {(() => {
                            // Pre-calculate slots for the month
                            const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
                            const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

                            // Filter events overlapping this month
                            const monthEventsSorted = suKiens.filter(sk => {
                                const start = new Date(sk.thoiGianBatDau);
                                const end = new Date(sk.thoiGianKetThuc);
                                return start <= monthEnd && end >= monthStart;
                            }).sort((a, b) => {
                                // Sort: Đoàn Khoa first, then Start Time, then Duration
                                const aDK = a.chiDoan?.maChiDoan === 'DOAN_KHOA';
                                const bDK = b.chiDoan?.maChiDoan === 'DOAN_KHOA';
                                if (aDK && !bDK) return -1;
                                if (!aDK && bDK) return 1;

                                const startA = new Date(a.thoiGianBatDau).getTime();
                                const startB = new Date(b.thoiGianBatDau).getTime();
                                if (startA !== startB) return startA - startB;

                                const durA = new Date(a.thoiGianKetThuc).getTime() - startA;
                                const durB = new Date(b.thoiGianKetThuc).getTime() - startB;
                                return durB - durA;
                            });

                            const eventSlots: Record<string, number> = {};
                            const dailyOccupancy: Record<string, boolean[]> = {};

                            monthEventsSorted.forEach(event => {
                                const start = new Date(event.thoiGianBatDau); start.setHours(0, 0, 0, 0);
                                const end = new Date(event.thoiGianKetThuc); end.setHours(0, 0, 0, 0);

                                const dates: string[] = [];
                                let curr = new Date(start);
                                while (curr <= end) {
                                    dates.push(curr.toDateString());
                                    curr.setDate(curr.getDate() + 1);
                                }

                                let slot = 0;
                                while (true) {
                                    const isFree = dates.every(d => !dailyOccupancy[d] || !dailyOccupancy[d][slot]);
                                    if (isFree) break;
                                    slot++;
                                }

                                eventSlots[event.id] = slot;

                                dates.forEach(d => {
                                    if (!dailyOccupancy[d]) dailyOccupancy[d] = [];
                                    dailyOccupancy[d][slot] = true;
                                });
                            });

                            return Array.from({ length: daysInMonth }).map((_, i) => {
                                const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i + 1);
                                const dayOfWeek = date.getDay();
                                const isToday = date.toDateString() === new Date().toDateString();
                                const dateStr = date.toDateString();

                                const dayOccupancy = dailyOccupancy[dateStr] || [];
                                const maxSlot = dayOccupancy.length;
                                const renderSlots = new Array(maxSlot).fill(null);

                                const eventsToday = monthEventsSorted.filter(sk => {
                                    const start = new Date(sk.thoiGianBatDau); start.setHours(0, 0, 0, 0);
                                    const end = new Date(sk.thoiGianKetThuc); end.setHours(0, 0, 0, 0);
                                    const current = new Date(date); current.setHours(0, 0, 0, 0);
                                    return current >= start && current <= end;
                                });

                                eventsToday.forEach(ev => {
                                    const slot = eventSlots[ev.id];
                                    if (slot !== undefined) {
                                        renderSlots[slot] = ev;
                                    }
                                });

                                const handleDayClick = () => {
                                    const yyyy = date.getFullYear();
                                    const mm = String(date.getMonth() + 1).padStart(2, '0');
                                    const dd = String(date.getDate()).padStart(2, '0');
                                    const dateParam = `${yyyy}-${mm}-${dd}`;
                                    router.push(`/chi-doan/su-kien/new?date=${dateParam}`);
                                };

                                return (
                                    <div
                                        key={i}
                                        onClick={handleDayClick}
                                        className={`min-h-[120px] border-b border-r flex flex-col pb-1 cursor-pointer transition-colors hover:bg-gray-50 ${isToday ? 'bg-emerald-50/40' : ''}`}
                                    >
                                        <div className={`p-2 text-sm font-medium ${isToday ? 'text-emerald-600' : 'text-gray-500'}`}>
                                            {i + 1}
                                        </div>
                                        <div className="flex-1 flex flex-col gap-[2px]">
                                            {renderSlots.map((event, slotIndex) => {
                                                if (!event) {
                                                    return <div key={`empty-${slotIndex}`} className="h-6"></div>;
                                                }

                                                const start = new Date(event.thoiGianBatDau); start.setHours(0, 0, 0, 0);
                                                const end = new Date(event.thoiGianKetThuc); end.setHours(0, 0, 0, 0);
                                                const current = new Date(date); current.setHours(0, 0, 0, 0);

                                                const isStart = current.getTime() === start.getTime();
                                                const isEnd = current.getTime() === end.getTime();
                                                const isMultiDay = start.getTime() !== end.getTime();
                                                const isHovered = hoveredEventId === event.id;

                                                const visualStart = isStart || dayOfWeek === 0;
                                                const visualEnd = isEnd || dayOfWeek === 6;

                                                let roundedClass = 'mx-1 rounded-md';

                                                if (isMultiDay) {
                                                    const connectLeft = !isStart && dayOfWeek !== 0;
                                                    const connectRight = !isEnd && dayOfWeek !== 6;

                                                    roundedClass = `
                                                        ${connectLeft ? '-ml-[1px] rounded-l-none border-l-0' : 'ml-1 rounded-l-md'}
                                                        ${connectRight ? '-mr-[1px] rounded-r-none border-r-0' : 'mr-1 rounded-r-md'}
                                                        relative z-10
                                                    `;
                                                }

                                                if (isHovered) roundedClass += ' z-20';

                                                return (
                                                    <div
                                                        key={event.id}
                                                        onClick={(e) => handleEventClick(e, event)}
                                                        onMouseEnter={() => setHoveredEventId(event.id)}
                                                        onMouseLeave={() => setHoveredEventId(null)}
                                                        className={`
                                                            px-2 py-1 text-xs cursor-pointer truncate transition-all duration-200 h-6 leading-none
                                                            ${roundedClass}
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
                                                        <span className={!isStart && isMultiDay ? 'hidden' : 'block'}>
                                                            {event.chiDoan.maChiDoan === 'DOAN_KHOA' && '★ '} {event.tenSuKien}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            });
                        })()}
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
                        className="fixed z-50 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 w-[320px] animate-in fade-in zoom-in-95 duration-200"
                        style={{ top: selectedEvent.y, left: selectedEvent.x }}
                    >
                        <div className="flex items-start justify-between mb-3">
                            <h3 className="font-bold text-gray-900 text-lg line-clamp-2 pr-2">{selectedEvent.event.tenSuKien}</h3>
                            <button onClick={() => setSelectedEvent(null)} className="text-gray-400 hover:text-gray-600 flex-shrink-0 mt-1">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-3 mb-4">
                            {/* Thời gian */}
                            <div className="flex items-start gap-3 text-sm text-gray-600">
                                <div className="mt-0.5 min-w-[16px]">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <span className="block font-medium text-gray-900">
                                        {new Date(selectedEvent.event.thoiGianBatDau).toLocaleDateString('vi-VN')}
                                    </span>
                                    <span>
                                        {new Date(selectedEvent.event.thoiGianBatDau).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - {' '}
                                        {new Date(selectedEvent.event.thoiGianKetThuc).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>

                            {/* Hình thức */}
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                <div className="min-w-[16px]">
                                    {selectedEvent.event.hinhThuc === 'ONLINE' ? (
                                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                        </svg>
                                    ) : (
                                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
                                        </svg>
                                    )}
                                </div>
                                <span className="font-medium">
                                    {selectedEvent.event.hinhThuc === 'ONLINE' ? 'Online' : 'Offline'}
                                </span>
                            </div>

                            {/* Địa điểm (Offline only) */}
                            {selectedEvent.event.hinhThuc !== 'ONLINE' && (selectedEvent.event.coSo || selectedEvent.event.diaDiem) && (
                                <div className="flex items-start gap-3 text-sm text-gray-600">
                                    <div className="mt-0.5 min-w-[16px]">
                                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </div>
                                    <span>
                                        {selectedEvent.event.coSo === 'CS1' && 'Cơ sở 1'}
                                        {selectedEvent.event.coSo === 'CS2' && 'Cơ sở 2'}
                                        {selectedEvent.event.diaDiem && ` - ${selectedEvent.event.diaDiem}`}
                                    </span>
                                </div>
                            )}

                            {/* Chi Đoàn */}
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                <div className="min-w-[16px]">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                </div>
                                <span className={selectedEvent.event.chiDoan.maChiDoan === 'DOAN_KHOA' ? 'font-bold text-[#0054A6]' : ''}>
                                    {selectedEvent.event.chiDoan.tenChiDoan}
                                </span>
                            </div>

                            {/* Link Tài liệu (Chỉ hiển thị cho Đoàn Khoa) */}
                            {selectedEvent.event.chiDoan.maChiDoan === 'DOAN_KHOA' && selectedEvent.event.linkTaiLieu && (
                                <div className="flex items-start gap-3 text-sm">
                                    <div className="mt-0.5 min-w-[16px]">
                                        <svg className="w-4 h-4 text-[#0054A6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                        </svg>
                                    </div>
                                    <a
                                        href={selectedEvent.event.linkTaiLieu}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[#0054A6] hover:underline break-all"
                                    >
                                        Tài liệu đính kèm
                                    </a>
                                </div>
                            )}

                            {/* Mô tả */}
                            {selectedEvent.event.moTa && (
                                <div className="pt-2 border-t border-gray-50">
                                    <p className="text-gray-500 text-xs mt-1 line-clamp-3 leading-relaxed">{selectedEvent.event.moTa}</p>
                                </div>
                            )}
                        </div>

                        {isMyEvent(selectedEvent.event) && (
                            <div className="flex justify-end pt-3 border-t border-gray-100 gap-2">
                                <Link
                                    href={`/chi-doan/su-kien/${selectedEvent.event.id}`}
                                    className="flex-1 text-center px-4 py-2 bg-gray-50 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    Xem chi tiết
                                </Link>
                                <Link
                                    href={`/chi-doan/su-kien/${selectedEvent.event.id}/edit`}
                                    className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 text-sm font-medium rounded-lg hover:bg-emerald-100 transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    Chỉnh sửa
                                </Link>
                            </div>
                        )}
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
