'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Html5Qrcode } from 'html5-qrcode';
import * as XLSX from 'xlsx';

interface SuKien {
    id: string;
    tenSuKien: string;
    thoiGianBatDau: string;
    thoiGianKetThuc: string;
    diaDiem: string | null;
}

interface DiemDanh {
    id: string;
    sinhVien: {
        mssv: string;
        hoTen: string;
    };
    thoiGianDiemDanh: string;
    phuongThuc: string;
}

interface CameraDevice {
    id: string;
    label: string;
}

export default function DiemDanhDetailPage() {
    const params = useParams();
    const suKienId = params.id as string;

    const [suKien, setSuKien] = useState<SuKien | null>(null);
    const [diemDanhs, setDiemDanhs] = useState<DiemDanh[]>([]);
    const [mssv, setMssv] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [scannerActive, setScannerActive] = useState(false);
    const [cameras, setCameras] = useState<CameraDevice[]>([]);
    const [selectedCamera, setSelectedCamera] = useState<string>('');
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [deleteModal, setDeleteModal] = useState<{ id: string; hoTen: string } | null>(null);

    useEffect(() => {
        fetchData();
        loadCameras();

        return () => {
            stopScanner();
        };
    }, [suKienId]);

    const loadCameras = async () => {
        try {
            const devices = await Html5Qrcode.getCameras();
            if (devices && devices.length > 0) {
                setCameras(devices.map(d => ({ id: d.id, label: d.label || `Camera ${d.id}` })));
                setSelectedCamera(devices[0].id);
            }
        } catch (err) {
            console.error('Failed to get cameras:', err);
        }
    };

    const fetchData = async () => {
        try {
            const res = await fetch(`/api/chi-doan/diem-danh/${suKienId}`);
            const data = await res.json();
            if (data.suKien) setSuKien(data.suKien);
            if (data.diemDanhs) setDiemDanhs(data.diemDanhs);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSubmit = async (mssvInput: string, phuongThuc: string = 'THU_CONG') => {
        if (!mssvInput.trim()) return;

        setLoading(true);
        setMessage(null);

        try {
            const res = await fetch(`/api/chi-doan/diem-danh/${suKienId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ maSinhVien: mssvInput.trim(), phuongThuc }),
            });

            const data = await res.json();

            if (!res.ok) {
                setMessage({ type: 'error', text: data.error || 'Có lỗi xảy ra' });
                return;
            }

            setMessage({ type: 'success', text: `Đã điểm danh cho ${data.sinhVien.hoTen} (${mssvInput})` });
            setMssv('');
            fetchData();
        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: 'Có lỗi xảy ra' });
        } finally {
            setLoading(false);
        }
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSubmit(mssv, 'THU_CONG');
    };

    const startScanner = async () => {
        if (!selectedCamera) {
            setMessage({ type: 'error', text: 'Vui lòng chọn camera' });
            return;
        }

        try {
            // Stop any existing scanner first
            if (scannerRef.current) {
                try {
                    await scannerRef.current.stop();
                } catch (e) {
                    // Ignore
                }
                scannerRef.current = null;
            }

            // Show the div first
            setScannerActive(true);

            // Wait for React to render the div
            await new Promise(resolve => setTimeout(resolve, 100));

            const scanner = new Html5Qrcode('qr-reader');
            scannerRef.current = scanner;

            await scanner.start(
                selectedCamera,
                {
                    fps: 10,
                    qrbox: { width: 250, height: 150 },
                    aspectRatio: 1.0,
                },
                async (decodedText) => {
                    await handleSubmit(decodedText, 'BARCODE');
                },
                () => { }
            );
        } catch (err) {
            console.error('Failed to start scanner:', err);
            setMessage({ type: 'error', text: 'Không thể khởi động camera. Vui lòng kiểm tra quyền truy cập.' });
            setScannerActive(false);
        }
    };

    const stopScanner = async () => {
        if (scannerRef.current) {
            try {
                await scannerRef.current.stop();
            } catch (e) {
                console.error('Stop scanner error:', e);
            }
            scannerRef.current = null;
        }
        setScannerActive(false);
    };

    // Export to Excel
    const exportToExcel = () => {
        if (!suKien || diemDanhs.length === 0) {
            setMessage({ type: 'error', text: 'Không có dữ liệu để xuất' });
            return;
        }

        const data = diemDanhs.map((dd, index) => ({
            'STT': index + 1,
            'MSSV': dd.sinhVien.mssv,
            'Họ tên': dd.sinhVien.hoTen,
            'Thời gian điểm danh': new Date(dd.thoiGianDiemDanh).toLocaleString('vi-VN'),
            'Phương thức': dd.phuongThuc === 'THU_CONG' ? 'Thủ công' : dd.phuongThuc === 'QR_CODE' ? 'QR' : dd.phuongThuc === 'EXCEL' ? 'Excel' : 'Barcode',
        }));

        // Create sheet with title at A1
        const title = [`DANH SÁCH ĐIỂM DANH: ${suKien.tenSuKien.toUpperCase()}`];
        const ws = XLSX.utils.aoa_to_sheet([title]);

        // Add data starting at A2 (headers at A2, data at A3)
        XLSX.utils.sheet_add_json(ws, data, { origin: 'A2' });

        // Merge title cells
        if (!ws['!merges']) ws['!merges'] = [];
        ws['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: 4 } });

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Điểm danh');

        // Adjust column widths
        ws['!cols'] = [
            { wch: 5 },  // STT
            { wch: 12 }, // MSSV
            { wch: 25 }, // Họ tên
            { wch: 20 }, // Thời gian
            { wch: 12 }, // Phương thức
        ];

        // Sanitize filename
        const safeName = suKien.tenSuKien.replace(/[\\/:*?"<>|]/g, '_').trim();
        const fileName = `${safeName} - Danh Sách.xlsx`;

        // Manual download to force filename
        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([wbout], { type: 'application/octet-stream' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        document.body.appendChild(a);
        a.href = url;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        setMessage({ type: 'success', text: `Đã xuất file: ${fileName}` });
    };

    // Import from Excel
    const importFromExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
        setMessage(null);

        try {
            const data = await file.arrayBuffer();
            const workbook = XLSX.read(data);
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet);

            let successCount = 0;
            let errorCount = 0;

            for (const row of jsonData) {
                const mssvValue = row['MSSV'] || row['mssv'] || row['Ma sinh vien'] || Object.values(row)[0];
                if (mssvValue) {
                    try {
                        const res = await fetch(`/api/chi-doan/diem-danh/${suKienId}`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ maSinhVien: String(mssvValue).trim(), phuongThuc: 'EXCEL' }),
                        });
                        if (res.ok) {
                            successCount++;
                        } else {
                            errorCount++;
                        }
                    } catch {
                        errorCount++;
                    }
                }
            }

            await fetchData();
            setMessage({
                type: successCount > 0 ? 'success' : 'error',
                text: `Đã import ${successCount} sinh viên thành công${errorCount > 0 ? `, ${errorCount} lỗi/trùng` : ''}`
            });
        } catch (error) {
            console.error('Import error:', error);
            setMessage({ type: 'error', text: 'Lỗi khi đọc file Excel' });
        } finally {
            setLoading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    // Delete attendance - show modal
    const showDeleteModal = (diemDanhId: string, hoTen: string) => {
        setDeleteModal({ id: diemDanhId, hoTen });
    };

    // Confirm delete attendance
    const confirmDeleteAttendance = async () => {
        if (!deleteModal) return;

        try {
            const res = await fetch(`/api/chi-doan/diem-danh/${suKienId}?diemDanhId=${deleteModal.id}`, {
                method: 'DELETE',
            });

            if (!res.ok) {
                const data = await res.json();
                setMessage({ type: 'error', text: data.error || 'Có lỗi xảy ra' });
                return;
            }

            setMessage({ type: 'success', text: `Đã xóa điểm danh của ${deleteModal.hoTen}` });
            fetchData();
        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: 'Có lỗi xảy ra' });
        } finally {
            setDeleteModal(null);
        }
    };

    if (!suKien) {
        return <div className="p-6 text-center text-gray-500">Đang tải...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Back button */}
            <Link href="/chi-doan/diem-danh" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700">
                <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Quay lại
            </Link>

            {/* Event Info */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{suKien.tenSuKien}</h1>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center">
                        <svg className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {new Date(suKien.thoiGianBatDau).toLocaleDateString('vi-VN')}
                    </span>
                    <span className="flex items-center">
                        <svg className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {new Date(suKien.thoiGianBatDau).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                        {' - '}
                        {new Date(suKien.thoiGianKetThuc).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {suKien.diaDiem && (
                        <span className="flex items-center">
                            <svg className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            </svg>
                            {suKien.diaDiem}
                        </span>
                    )}
                </div>
            </div>

            {/* Scanner Section */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Quét Barcode</h2>

                {/* Camera selector */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Chọn Camera</label>
                    <div className="flex gap-3">
                        <select
                            value={selectedCamera}
                            onChange={(e) => setSelectedCamera(e.target.value)}
                            disabled={scannerActive}
                            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:bg-gray-100"
                        >
                            {cameras.length === 0 ? (
                                <option value="">Không tìm thấy camera</option>
                            ) : (
                                cameras.map((cam) => (
                                    <option key={cam.id} value={cam.id}>
                                        {cam.label}
                                    </option>
                                ))
                            )}
                        </select>

                        {!scannerActive ? (
                            <button
                                onClick={startScanner}
                                disabled={cameras.length === 0}
                                className="inline-flex items-center px-5 py-2.5 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                Bật Camera
                            </button>
                        ) : (
                            <button
                                onClick={stopScanner}
                                className="inline-flex items-center px-5 py-2.5 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors"
                            >
                                <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Tắt Camera
                            </button>
                        )}
                    </div>
                </div>

                {/* Scanner view */}
                <div
                    id="qr-reader"
                    style={{
                        width: '100%',
                        maxWidth: '500px',
                        margin: '0 auto',
                        display: scannerActive ? 'block' : 'none'
                    }}
                />

                {!scannerActive && (
                    <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-xl">
                        <svg className="mx-auto h-12 w-12 text-gray-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                        </svg>
                        <p>Chọn camera và bấm "Bật Camera" để quét barcode</p>
                    </div>
                )}
            </div>

            {/* Manual Input */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Nhập thủ công</h2>
                <form onSubmit={handleFormSubmit} className="flex gap-4">
                    <div className="flex-1">
                        <input
                            type="text"
                            value={mssv}
                            onChange={(e) => setMssv(e.target.value)}
                            placeholder="Nhập MSSV..."
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading || !mssv.trim()}
                        className="px-6 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {loading ? 'Đang xử lý...' : 'Điểm danh'}
                    </button>
                </form>

                {/* Removed message block from here */}
            </div>

            {/* Attendance List */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-lg font-semibold text-gray-900">Danh sách điểm danh</h2>

                        {/* Message Notification */}
                        {message && (
                            <div className={`mt-4 p-4 rounded-xl border flex items-center justify-between ${message.type === 'success'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                : 'bg-red-50 text-red-700 border-red-100'
                                }`}>
                                <div className="flex items-center gap-3">
                                    {message.type === 'success' ? (
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : (
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    )}
                                    <span className="font-medium">{message.text}</span>
                                </div>
                                <button onClick={() => setMessage(null)} className="text-gray-400 hover:text-gray-600">
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        )}
                        <span className="text-sm text-gray-500">{diemDanhs.length} người</span>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={exportToExcel}
                            disabled={diemDanhs.length === 0}
                            className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <svg className="mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Xuất Excel
                        </button>
                        <label className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 cursor-pointer transition-colors">
                            <svg className="mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                            Import Excel
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".xlsx,.xls"
                                onChange={importFromExcel}
                                className="hidden"
                            />
                        </label>
                    </div>
                </div>
                {diemDanhs.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        Chưa có ai điểm danh
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {diemDanhs.map((dd, index) => (
                            <div key={dd.id} className="px-6 py-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <span className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-sm font-medium">
                                            {index + 1}
                                        </span>
                                        <div>
                                            <p className="font-medium text-gray-900">{dd.sinhVien.hoTen}</p>
                                            <p className="text-sm text-gray-500">{dd.sinhVien.mssv}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="text-right">
                                            <p className="text-sm text-gray-500">
                                                {new Date(dd.thoiGianDiemDanh).toLocaleTimeString('vi-VN', {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </p>
                                            <p className="text-xs text-gray-600">
                                                {dd.phuongThuc === 'THU_CONG' ? 'Thủ công' : dd.phuongThuc === 'QR_CODE' ? 'QR' : dd.phuongThuc === 'EXCEL' ? 'Excel' : 'Barcode'}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => showDeleteModal(dd.id, dd.sinhVien.hoTen)}
                                            className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Xóa"
                                        >
                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {deleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl">
                        <div className="text-center">
                            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Xác nhận xóa</h3>
                            <p className="text-gray-600 mb-6">
                                Bạn có chắc muốn xóa điểm danh của <strong>{deleteModal.hoTen}</strong>?
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setDeleteModal(null)}
                                    className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={confirmDeleteAttendance}
                                    className="flex-1 px-4 py-2.5 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors"
                                >
                                    Xóa
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
