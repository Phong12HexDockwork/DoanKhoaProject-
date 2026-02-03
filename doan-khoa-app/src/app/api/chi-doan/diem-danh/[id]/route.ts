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

        const suKien = await prisma.suKien.findUnique({
            where: { id },
            select: {
                id: true,
                tenSuKien: true,
                thoiGianBatDau: true,
                thoiGianKetThuc: true,
                diaDiem: true,
                chiDoanId: true,
            },
        });

        if (!suKien) {
            return NextResponse.json({ error: 'Không tìm thấy sự kiện' }, { status: 404 });
        }

        // Check permission
        if (user.vaiTro === 'CHI_DOAN' && suKien.chiDoanId !== user.chiDoanId) {
            return NextResponse.json({ error: 'Không có quyền' }, { status: 403 });
        }

        const diemDanhs = await prisma.diemDanh.findMany({
            where: { suKienId: id },
            orderBy: { thoiGianDiemDanh: 'desc' },
            include: {
                sinhVien: {
                    select: {
                        mssv: true,
                        hoTen: true,
                    },
                },
            },
        });

        return NextResponse.json({ suKien, diemDanhs });
    } catch (error) {
        console.error('Get attendance error:', error);
        return NextResponse.json({ error: 'Có lỗi xảy ra' }, { status: 500 });
    }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
    try {
        const token = request.cookies.get('token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
        }

        const user = await verifyToken(token);
        if (!user || user.vaiTro !== 'CHI_DOAN') {
            return NextResponse.json({ error: 'Không có quyền' }, { status: 403 });
        }

        const { id } = await params;
        const body = await request.json();
        const { maSinhVien, phuongThuc = 'THU_CONG' } = body;

        if (!maSinhVien) {
            return NextResponse.json({ error: 'Vui lòng nhập MSSV' }, { status: 400 });
        }

        // Find or create student
        let sinhVien = await prisma.sinhVien.findUnique({
            where: { mssv: maSinhVien },
        });

        if (!sinhVien) {
            // Auto-create student with MSSV
            sinhVien = await prisma.sinhVien.create({
                data: {
                    mssv: maSinhVien,
                    hoTen: `SV ${maSinhVien}`, // Default name, can be updated later
                },
            });
        }

        // Check if already checked in
        const existing = await prisma.diemDanh.findFirst({
            where: {
                suKienId: id,
                sinhVienId: sinhVien.id,
            },
        });

        if (existing) {
            return NextResponse.json({ error: 'Sinh viên đã điểm danh rồi' }, { status: 400 });
        }

        // Create attendance record
        const diemDanh = await prisma.diemDanh.create({
            data: {
                suKienId: id,
                sinhVienId: sinhVien.id,
                nguoiDiemDanhId: user.id,
                phuongThuc,
                thoiGianDiemDanh: new Date(),
            },
        });

        return NextResponse.json({ success: true, diemDanh, sinhVien });
    } catch (error) {
        console.error('Create attendance error:', error);
        return NextResponse.json({ error: 'Có lỗi xảy ra' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const token = request.cookies.get('token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
        }

        const user = await verifyToken(token);
        if (!user || user.vaiTro !== 'CHI_DOAN') {
            return NextResponse.json({ error: 'Không có quyền' }, { status: 403 });
        }

        const { id } = await params;
        const { searchParams } = new URL(request.url);
        const diemDanhId = searchParams.get('diemDanhId');

        if (!diemDanhId) {
            return NextResponse.json({ error: 'Thiếu ID điểm danh' }, { status: 400 });
        }

        // Check if the attendance belongs to the event and the event belongs to the user's chi doan
        const diemDanh = await prisma.diemDanh.findUnique({
            where: { id: diemDanhId },
            include: { suKien: true },
        });

        if (!diemDanh || diemDanh.suKienId !== id) {
            return NextResponse.json({ error: 'Không tìm thấy' }, { status: 404 });
        }

        if (diemDanh.suKien.chiDoanId !== user.chiDoanId) {
            return NextResponse.json({ error: 'Không có quyền' }, { status: 403 });
        }

        await prisma.diemDanh.delete({
            where: { id: diemDanhId },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete attendance error:', error);
        return NextResponse.json({ error: 'Có lỗi xảy ra' }, { status: 500 });
    }
}
