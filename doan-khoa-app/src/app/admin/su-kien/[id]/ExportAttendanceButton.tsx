'use client';

import { useState } from 'react';

interface ExportAttendanceButtonProps {
    eventId: string;
}

export default function ExportAttendanceButton({ eventId }: ExportAttendanceButtonProps) {
    const [loading, setLoading] = useState(false);

    const handleExport = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/su-kien/${eventId}/export`);

            if (!res.ok) {
                const data = await res.json();
                alert(data.error || 'Có lỗi xảy ra khi tải xuống');
                return;
            }

            // Get filename from header or use default
            const contentDisposition = res.headers.get('Content-Disposition');
            let filename = 'diem_danh.csv';
            if (contentDisposition) {
                const match = contentDisposition.match(/filename="(.+)"/);
                if (match) filename = match[1];
            }

            // Download the file
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch {
            alert('Có lỗi xảy ra khi tải xuống');
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleExport}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 bg-green-500 text-white font-medium rounded-xl hover:bg-green-600 transition-colors shadow-lg shadow-green-200 disabled:opacity-50"
        >
            <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            {loading ? 'Đang tải...' : 'Tải điểm danh'}
        </button>
    );
}
