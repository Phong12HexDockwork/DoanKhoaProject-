'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface ChiDoan {
    id: string;
    tenChiDoan: string;
    maChiDoan: string;
}

interface SuKien {
    id: string;
    tenSuKien: string;
    thoiGianBatDau: string;
    thoiGianKetThuc: string;
    diaDiem: string | null;
    hinhThuc?: string;
    coSo?: string;
    moTa?: string;
    trangThaiDuyet: string;
    chiDoan: ChiDoan;
    hocKyId: string;
}

export default function AdminLichPage() {
    const router = useRouter();
    const [suKiens, setSuKiens] = useState<SuKien[]>([]);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Create Form State
    const [newEvent, setNewEvent] = useState({
        tenSuKien: '',
        moTa: '',
        hinhThuc: 'OFFLINE',
        coSo: '',
        diaDiem: '',
        thoiGianBatDau: '',
        thoiGianKetThuc: '',
        hocKyId: '', // Ideally fetch current semester
    });

    const [hocKys, setHocKys] = useState<{ id: string; tenHocKy: string }[]>([]);

    // Popover state
    const [selectedEvent, setSelectedEvent] = useState<{ event: SuKien; x: number; y: number } | null>(null);
    const [hoveredEventId, setHoveredEventId] = useState<string | null>(null);

    useEffect(() => {
        fetchEvents();
        fetchHocKys();
    }, []);

    const fetchHocKys = async () => {
        try {
            const res = await fetch('/api/hoc-ky');
            const data = await res.json();
            if (data.hocKys && data.hocKys.length > 0) {
                setHocKys(data.hocKys);
                // Default to first active semester
                setNewEvent(prev => ({ ...prev, hocKyId: data.hocKys[0].id }));
            }
        } catch (error) {
            console.error('Error fetching semesters:', error);
        }
    };

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/admin/lich`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setSuKiens(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateEvent = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Hardcode hocKyId for now or fetch it. 
            // Better: find the latest semester in the list or fetch active semester.
            // For MVP: pick the hocKyId from the first event or let backend handle?
            // Backend expects hocKyId.
            // Let's filter distinct hocKyId from existing events or ask user.
            // Simplified: Require simple input for now or just take the first one found.

            // To be safe, I'll alert if no semester found (assuming seeded).
            // Actually, we must provide hocKyId.
            // Let's quickly fetch semesters or hardcode for the demo if user accepts constraints.
            // I'll add a semester selector in the modal.

            const res = await fetch('/api/admin/lich', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newEvent),
            });

            if (res.ok) {
                setShowCreateModal(false);
                fetchEvents();
                setNewEvent({
                    tenSuKien: '',
                    moTa: '',
                    hinhThuc: 'OFFLINE',
                    coSo: '',
                    diaDiem: '',
                    thoiGianBatDau: '',
                    thoiGianKetThuc: '',
                    hocKyId: newEvent.hocKyId, // Keep semester
                });
            } else {
                alert('Có lỗi xảy ra khi tạo sự kiện');
            }
        } catch (error) {
            console.error(error);
        }
    };

    // Helper: Check if event is from Đoàn Khoa
    const isDoanKhoaEvent = (event: SuKien) => event.chiDoan?.maChiDoan === 'DOAN_KHOA';

    // Get days in month
    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDay = firstDay.getDay(); // 0 is Sunday

        return { daysInMonth, startingDay };
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
            // Sort: Đoàn Khoa first, then by date
            const aDK = isDoanKhoaEvent(a);
            const bDK = isDoanKhoaEvent(b);
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

    const handleEventClick = (e: React.MouseEvent, event: SuKien) => {
        e.preventDefault();
        e.stopPropagation();
        const rect = e.currentTarget.getBoundingClientRect();
        let x = rect.right + 10;
        let y = rect.top;
        if (typeof window !== 'undefined') {
            if (x + 300 > window.innerWidth) x = rect.left - 310;
            if (y + 200 > window.innerHeight) y = window.innerHeight - 220;
        }
        setSelectedEvent({ event, x, y });
    };

    return (
        <div className="space-y-6 relative h-full">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[#0054A6]">Lịch Đoàn Khoa</h1>
                    <p className="text-gray-500">Quản lý và theo dõi sự kiện toàn trường</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-4 py-2 bg-[#0054A6] text-white font-medium rounded-xl hover:bg-blue-800 transition-colors shadow-lg shadow-blue-200"
                >
                    + Sự kiện Đoàn Khoa
                </button>
            </div>

            {/* Controls */}
            <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg text-[#0054A6] transition-colors">
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <h2 className="text-lg font-bold text-[#0054A6] min-w-[180px] text-center">
                            Tháng {currentMonth.getMonth() + 1}, {currentMonth.getFullYear()}
                        </h2>
                        <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg text-[#0054A6] transition-colors">
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>

                    <div className="flex items-center bg-gray-100 rounded-xl p-1">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${viewMode === 'grid' ? 'bg-white text-[#0054A6] shadow-sm' : 'text-gray-600'}`}
                        >
                            Lịch
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${viewMode === 'list' ? 'bg-white text-[#0054A6] shadow-sm' : 'text-gray-600'}`}
                        >
                            Danh sách
                        </button>
                    </div>
                </div>
            </div>

            {/* Calendar View */}
            {viewMode === 'grid' && (
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden min-h-[600px] border border-gray-100">
                    <div className="grid grid-cols-7 bg-[#0054A6]/5 border-b border-[#0054A6]/10">
                        {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((day) => (
                            <div key={day} className="py-3 text-center text-sm font-bold text-[#0054A6]">
                                {day}
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 select-none">
                        {Array.from({ length: startingDay }).map((_, i) => (
                            <div key={`empty-${i}`} className="min-h-[120px] border-b border-r bg-gray-50/50" />
                        ))}
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                            const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i + 1);
                            const dayEvents = suKiens.filter(sk => {
                                const start = new Date(sk.thoiGianBatDau); start.setHours(0, 0, 0, 0);
                                const end = new Date(sk.thoiGianKetThuc); end.setHours(23, 59, 59, 999);
                                const current = new Date(date); current.setHours(0, 0, 0, 0);
                                return current >= start && current <= end;
                            }); // Sort optional?

                            const isToday = date.toDateString() === new Date().toDateString();

                            return (
                                <div key={i} className={`min-h-[120px] border-b border-r flex flex-col pb-1 ${isToday ? 'bg-blue-50' : ''}`}>
                                    <div className={`p-2 text-sm font-medium ${isToday ? 'text-[#0054A6] font-bold' : 'text-gray-500'}`}>{i + 1}</div>
                                    <div className="flex-1 flex flex-col gap-1 px-1">
                                        {dayEvents.map((event) => {
                                            const isDK = isDoanKhoaEvent(event);
                                            // Handle spanning logic simplified for Admin view (just truncating for now to match request speed)
                                            // Actually user requested "highlight", so I emphasize DK events
                                            return (
                                                <div
                                                    key={event.id}
                                                    onClick={(e) => handleEventClick(e, event)}
                                                    className={`
                                                        px-2 py-1 text-xs cursor-pointer truncate rounded-md mb-0.5
                                                        ${isDK
                                                            ? 'bg-[#0054A6] text-white shadow-md font-medium border border-blue-700'
                                                            : `${getStatusColor(event.trangThaiDuyet)} text-white opacity-90`
                                                        }
                                                        hover:scale-[1.02] transition-transform
                                                    `}
                                                >
                                                    {isDK && '★ '} {event.tenSuKien}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Event Detail Popover */}
            {selectedEvent && (
                <div
                    className="fixed z-50 bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 w-80"
                    style={{ left: selectedEvent.x, top: selectedEvent.y }}
                >
                    <div className="flex justify-between items-start mb-3">
                        <h3 className="font-bold text-gray-900 text-lg pr-4">{selectedEvent.event.tenSuKien}</h3>
                        <button
                            onClick={() => setSelectedEvent(null)}
                            className="text-gray-400 hover:text-gray-600 p-1"
                        >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="space-y-2 text-sm">
                        {/* Thời gian */}
                        <div className="flex items-center gap-2 text-gray-600">
                            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>
                                {new Date(selectedEvent.event.thoiGianBatDau).toLocaleDateString('vi-VN')} •
                                {new Date(selectedEvent.event.thoiGianBatDau).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} -
                                {new Date(selectedEvent.event.thoiGianKetThuc).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>

                        {/* Hình thức */}
                        <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${selectedEvent.event.hinhThuc === 'ONLINE'
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-blue-100 text-blue-700'
                                }`}>
                                {selectedEvent.event.hinhThuc === 'ONLINE' ? '🌐 Online' : '📍 Offline'}
                            </span>
                        </div>

                        {/* Địa điểm */}
                        {selectedEvent.event.hinhThuc !== 'ONLINE' && (selectedEvent.event.coSo || selectedEvent.event.diaDiem) && (
                            <div className="flex items-start gap-2 text-gray-600">
                                <svg className="h-4 w-4 text-gray-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span>
                                    {selectedEvent.event.coSo === 'CS1' && 'Cơ sở 1'}
                                    {selectedEvent.event.coSo === 'CS2' && 'Cơ sở 2'}
                                    {selectedEvent.event.diaDiem && ` - ${selectedEvent.event.diaDiem}`}
                                </span>
                            </div>
                        )}

                        {/* Chi Đoàn */}
                        <div className="flex items-center gap-2 text-gray-600">
                            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
                            </svg>
                            <span>{selectedEvent.event.chiDoan?.tenChiDoan}</span>
                        </div>

                        {/* Mô tả */}
                        {selectedEvent.event.moTa && (
                            <p className="text-gray-500 text-xs mt-2 line-clamp-2">{selectedEvent.event.moTa}</p>
                        )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-100">
                        <button
                            onClick={() => router.push(`/admin/su-kien/${selectedEvent.event.id}`)}
                            className="w-full px-4 py-2 bg-[#0054A6] text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors"
                        >
                            Xem chi tiết
                        </button>
                    </div>
                </div>
            )}

            {/* Backdrop to close popover */}
            {selectedEvent && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setSelectedEvent(null)}
                />
            )}

            {/* List View */}
            {viewMode === 'list' && (
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                    <div className="divide-y divide-gray-100">
                        {monthEvents.map((event) => {
                            const isDK = isDoanKhoaEvent(event);
                            return (
                                <div key={event.id} className={`px-6 py-4 hover:bg-gray-50 transition-colors ${isDK ? 'bg-blue-50/50' : ''}`}>
                                    <div className="flex items-start gap-4">
                                        <div className={`flex-shrink-0 w-14 h-14 rounded-xl flex flex-col items-center justify-center ${isDK ? 'bg-[#0054A6] text-white shadow-lg' : 'bg-gray-100 text-gray-700'}`}>
                                            <span className="text-xs font-medium">T{new Date(event.thoiGianBatDau).getMonth() + 1}</span>
                                            <span className="text-xl font-bold">{new Date(event.thoiGianBatDau).getDate()}</span>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className={`font-bold ${isDK ? 'text-[#0054A6] text-lg' : 'text-gray-900'}`}>
                                                    {isDK && '★ '} {event.tenSuKien}
                                                </h3>
                                                {isDK && <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">PINNED</span>}
                                            </div>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {new Date(event.thoiGianBatDau).toLocaleTimeString().slice(0, 5)} - {new Date(event.thoiGianKetThuc).toLocaleTimeString().slice(0, 5)} • {event.diaDiem || 'Chưa cập nhật'}
                                            </p>
                                            <p className="text-xs text-gray-600 mt-1">{event.chiDoan?.tenChiDoan}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Simple Create Modal for Đoàn Khoa */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
                        <h2 className="text-xl font-bold text-[#0054A6] mb-4">Thêm Sự kiện Đoàn Khoa</h2>
                        <form onSubmit={handleCreateEvent} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Tên sự kiện</label>
                                <input required type="text" className="mt-1 block w-full rounded-xl border border-gray-400 px-4 py-2.5 text-gray-900 shadow-sm focus:border-[#0054A6] focus:ring-[#0054A6]"
                                    value={newEvent.tenSuKien} onChange={e => setNewEvent({ ...newEvent, tenSuKien: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Bắt đầu</label>
                                    <input required type="datetime-local" className="mt-1 block w-full rounded-xl border border-gray-400 px-4 py-2.5 text-gray-900 shadow-sm focus:border-[#0054A6] focus:ring-[#0054A6]"
                                        value={newEvent.thoiGianBatDau} onChange={e => setNewEvent({ ...newEvent, thoiGianBatDau: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Kết thúc</label>
                                    <input required type="datetime-local" className="mt-1 block w-full rounded-xl border border-gray-400 px-4 py-2.5 text-gray-900 shadow-sm focus:border-[#0054A6] focus:ring-[#0054A6]"
                                        value={newEvent.thoiGianKetThuc} onChange={e => setNewEvent({ ...newEvent, thoiGianKetThuc: e.target.value })} />
                                </div>
                            </div>
                            {/* Hình thức */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Hình thức</label>
                                <div className="mt-2 flex gap-4">
                                    <label className="flex items-center">
                                        <input type="radio" name="hinhThuc" value="OFFLINE" checked={newEvent.hinhThuc === 'OFFLINE'}
                                            onChange={e => setNewEvent({ ...newEvent, hinhThuc: e.target.value, coSo: newEvent.coSo || 'CS1' })}
                                            className="mr-2 text-[#0054A6] focus:ring-[#0054A6]" />
                                        <span className="text-gray-700">Offline</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input type="radio" name="hinhThuc" value="ONLINE" checked={newEvent.hinhThuc === 'ONLINE'}
                                            onChange={e => setNewEvent({ ...newEvent, hinhThuc: e.target.value, coSo: '', diaDiem: '' })}
                                            className="mr-2 text-[#0054A6] focus:ring-[#0054A6]" />
                                        <span className="text-gray-700">Online</span>
                                    </label>
                                </div>
                            </div>
                            {/* Cơ sở & Địa điểm (only for Offline) */}
                            {newEvent.hinhThuc === 'OFFLINE' && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Cơ sở</label>
                                        <select
                                            required
                                            className="mt-1 block w-full rounded-xl border border-gray-400 px-4 py-2.5 text-gray-900 shadow-sm focus:border-[#0054A6] focus:ring-[#0054A6]"
                                            value={newEvent.coSo}
                                            onChange={e => setNewEvent({ ...newEvent, coSo: e.target.value })}
                                        >
                                            <option value="">Chọn cơ sở</option>
                                            <option value="CS1">Cơ sở 1 (227 Nguyễn Văn Cừ)</option>
                                            <option value="CS2">Cơ sở 2 (Linh Trung, Thủ Đức)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Chi tiết địa điểm</label>
                                        <input type="text" placeholder="VD: Phòng F102"
                                            className="mt-1 block w-full rounded-xl border border-gray-400 px-4 py-2.5 text-gray-900 shadow-sm focus:border-[#0054A6] focus:ring-[#0054A6]"
                                            value={newEvent.diaDiem} onChange={e => setNewEvent({ ...newEvent, diaDiem: e.target.value })} />
                                    </div>
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Học Kỳ</label>
                                <select
                                    required
                                    className="mt-1 block w-full rounded-xl border border-gray-400 px-4 py-2.5 text-gray-900 shadow-sm focus:border-[#0054A6] focus:ring-[#0054A6]"
                                    value={newEvent.hocKyId}
                                    onChange={e => setNewEvent({ ...newEvent, hocKyId: e.target.value })}
                                >
                                    <option value="">Chọn học kỳ</option>
                                    {hocKys.map(hk => (
                                        <option key={hk.id} value={hk.id}>{hk.tenHocKy}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Hủy</button>
                                <button type="submit" className="px-4 py-2 bg-[#0054A6] text-white rounded-lg hover:bg-blue-800">Tạo mới</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
