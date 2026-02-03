import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const token = request.cookies.get('token')?.value;
        if (!token) return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });

        const user = await verifyToken(token);
        if (!user || user.vaiTro !== 'CHI_DOAN' || !user.chiDoanId) {
            return NextResponse.json({ error: 'Không có quyền' }, { status: 403 });
        }

        const { id } = await params;

        const suKien = await prisma.suKien.findUnique({
            where: { id },
        });

        if (!suKien || suKien.chiDoanId !== user.chiDoanId) {
            return NextResponse.json({ error: 'Không tìm thấy sự kiện' }, { status: 404 });
        }

        return NextResponse.json({ suKien });
    } catch (error) {
        console.error('Get event error:', error);
        return NextResponse.json({ error: 'Có lỗi xảy ra' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const token = request.cookies.get('token')?.value;
        if (!token) return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });

        const user = await verifyToken(token);
        if (!user || user.vaiTro !== 'CHI_DOAN' || !user.chiDoanId) {
            return NextResponse.json({ error: 'Không có quyền' }, { status: 403 });
        }

        const { id } = await params;
        const body = await request.json();

        const existingSuKien = await prisma.suKien.findUnique({
            where: { id },
        });

        if (!existingSuKien || existingSuKien.chiDoanId !== user.chiDoanId) {
            return NextResponse.json({ error: 'Không tìm thấy sự kiện' }, { status: 404 });
        }

        if (existingSuKien.trangThaiDuyet === 'DA_DUYET') {
            return NextResponse.json({ error: 'Sự kiện đã được duyệt, không thể chỉnh sửa' }, { status: 403 });
        }

        const {
            tenSuKien,
            moTa,
            linkTaiLieu,
            diaDiem,
            hocKyId,
            thoiGianBatDau,
            thoiGianKetThuc,
        } = body;

        const suKien = await prisma.suKien.update({
            where: { id },
            data: {
                tenSuKien,
                moTa,
                linkTaiLieu,
                diaDiem,
                hocKyId,
                thoiGianBatDau: new Date(thoiGianBatDau),
                thoiGianKetThuc: new Date(thoiGianKetThuc),
                trangThaiDuyet: 'CHO_DUYET', // Reset to pending approval on edit
            },
        });

        // Log history
        await prisma.lichSuSuKien.create({
            data: {
                suKienId: suKien.id,
                nguoiThayDoiId: user.id,
                hanhDong: 'CAP_NHAT',
                noiDungMoi: JSON.stringify(suKien),
            },
        });

        return NextResponse.json({ success: true, suKien });
    } catch (error) {
        console.error('Update event error:', error);
        return NextResponse.json({ error: 'Có lỗi xảy ra' }, { status: 500 });
    }
}
