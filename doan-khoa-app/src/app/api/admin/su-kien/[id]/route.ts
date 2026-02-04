import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const token = request.cookies.get('token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
        }

        const user = await verifyToken(token);
        if (!user || user.vaiTro !== 'DOAN_KHOA') {
            return NextResponse.json({ error: 'Chỉ Admin Đoàn Khoa mới có quyền xóa sự kiện' }, { status: 403 });
        }

        const { id } = await params;

        // Check if event exists
        const suKien = await prisma.suKien.findUnique({
            where: { id },
            include: { _count: { select: { diemDanhs: true } } }
        });

        if (!suKien) {
            return NextResponse.json({ error: 'Sự kiện không tồn tại' }, { status: 404 });
        }

        // Delete related records first (due to foreign key constraints)
        await prisma.ghiChuDuyet.deleteMany({ where: { suKienId: id } });
        await prisma.diemDanh.deleteMany({ where: { suKienId: id } });
        await prisma.lichSuSuKien.deleteMany({ where: { suKienId: id } });

        // Delete the event
        await prisma.suKien.delete({ where: { id } });

        return NextResponse.json({ success: true, message: 'Đã xóa sự kiện thành công' });
    } catch (error) {
        console.error('Delete event error:', error);
        return NextResponse.json({ error: 'Có lỗi xảy ra khi xóa sự kiện' }, { status: 500 });
    }
}
