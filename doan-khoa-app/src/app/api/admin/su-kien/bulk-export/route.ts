import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import * as XLSX from 'xlsx';

export async function POST(request: NextRequest) {
    try {
        const token = request.cookies.get('token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
        }

        const user = await verifyToken(token);
        if (!user || user.vaiTro !== 'DOAN_KHOA') {
            return NextResponse.json({ error: 'Không có quyền' }, { status: 403 });
        }

        const { eventIds } = await request.json();

        if (!eventIds || !Array.isArray(eventIds) || eventIds.length === 0) {
            return NextResponse.json({ error: 'Vui lòng chọn ít nhất 1 sự kiện' }, { status: 400 });
        }

        // Create workbook
        const workbook = XLSX.utils.book_new();

        // Process each event
        for (const eventId of eventIds) {
            const suKien = await prisma.suKien.findUnique({
                where: { id: eventId },
                select: { tenSuKien: true, thoiGianBatDau: true },
            });

            if (!suKien) continue;

            const diemDanhs = await prisma.diemDanh.findMany({
                where: { suKienId: eventId },
                include: {
                    sinhVien: {
                        select: {
                            mssv: true,
                            hoTen: true,
                            lop: true,
                            khoa: true,
                            email: true,
                        },
                    },
                },
                orderBy: { thoiGianDiemDanh: 'asc' },
            });

            // Create Excel data
            const headers = ['STT', 'MSSV', 'Họ tên', 'Lớp', 'Khoa', 'Email', 'Thời gian điểm danh', 'Ghi chú'];

            const rows = diemDanhs.map((dd, index) => [
                index + 1,
                dd.sinhVien?.mssv || '',
                dd.sinhVien?.hoTen || '',
                dd.sinhVien?.lop || '',
                dd.sinhVien?.khoa || '',
                dd.sinhVien?.email || '',
                new Date(dd.thoiGianDiemDanh).toLocaleString('vi-VN'),
                dd.ghiChu || '',
            ]);

            // Create worksheet
            const worksheetData = [headers, ...rows];
            const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

            // Set column widths
            worksheet['!cols'] = [
                { wch: 5 },   // STT
                { wch: 12 },  // MSSV
                { wch: 25 },  // Họ tên
                { wch: 15 },  // Lớp
                { wch: 30 },  // Khoa
                { wch: 30 },  // Email
                { wch: 20 },  // Thời gian điểm danh
                { wch: 30 },  // Ghi chú
            ];

            // Sheet name (max 31 chars for Excel)
            const sheetName = suKien.tenSuKien.substring(0, 31).replace(/[\\/*?:\[\]]/g, '_');

            XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
        }

        // Generate Excel buffer
        const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        // Create filename
        const now = new Date().toISOString().split('T')[0];
        const filename = `DiemDanh_NhieuSuKien_${now}.xlsx`;

        return new NextResponse(excelBuffer, {
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': `attachment; filename="${filename}"`,
            },
        });
    } catch (error) {
        console.error('Bulk export error:', error);
        return NextResponse.json({ error: 'Có lỗi xảy ra khi xuất danh sách' }, { status: 500 });
    }
}
