import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

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

        // Create CSV content
        const BOM = '\uFEFF'; // UTF-8 BOM for Excel
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

        const csvContent = BOM + [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
        ].join('\n');

        // Create filename
        const eventDate = new Date(suKien.thoiGianBatDau).toISOString().split('T')[0];
        const sanitizedName = suKien.tenSuKien.replace(/[^a-zA-Z0-9\u00C0-\u1EF9]/g, '_').substring(0, 50);
        const filename = `DiemDanh_${sanitizedName}_${eventDate}.csv`;

        return new NextResponse(csvContent, {
            headers: {
                'Content-Type': 'text/csv; charset=utf-8',
                'Content-Disposition': `attachment; filename="${filename}"`,
            },
        });
    } catch (error) {
        console.error('Export attendance error:', error);
        return NextResponse.json({ error: 'Có lỗi xảy ra khi xuất danh sách' }, { status: 500 });
    }
}
