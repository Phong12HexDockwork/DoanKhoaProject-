import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import * as XLSX from 'xlsx';

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const token = request.cookies.get('token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
        }

        const user = await verifyToken(token);
        if (!user) {
            return NextResponse.json({ error: 'Không có quyền' }, { status: 403 });
        }

        const { id } = await params;

        // Get event info
        const suKien = await prisma.suKien.findUnique({
            where: { id },
            select: { tenSuKien: true, thoiGianBatDau: true },
        });

        if (!suKien) {
            return NextResponse.json({ error: 'Sự kiện không tồn tại' }, { status: 404 });
        }

        // Get attendance list
        const diemDanhs = await prisma.diemDanh.findMany({
            where: { suKienId: id },
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

        // Create workbook and worksheet
        const workbook = XLSX.utils.book_new();
        const worksheetData = [headers, ...rows];
        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

        // Set column widths for better readability
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

        XLSX.utils.book_append_sheet(workbook, worksheet, 'Điểm danh');

        // Generate Excel buffer
        const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        // Create filename
        const eventDate = new Date(suKien.thoiGianBatDau).toISOString().split('T')[0];
        const sanitizedName = suKien.tenSuKien.replace(/[^a-zA-Z0-9\u00C0-\u1EF9]/g, '_').substring(0, 50);
        const filename = `DiemDanh_${sanitizedName}_${eventDate}.xlsx`;

        return new NextResponse(excelBuffer, {
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': `attachment; filename="${filename}"`,
            },
        });
    } catch (error) {
        console.error('Export attendance error:', error);
        return NextResponse.json({ error: 'Có lỗi xảy ra khi xuất danh sách' }, { status: 500 });
    }
}
