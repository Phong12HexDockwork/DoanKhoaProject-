import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// PATCH - Toggle suspend status
export async function PATCH(request: NextRequest, { params }: RouteParams) {
    try {
        const token = request.cookies.get('token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
        }

        const user = await verifyToken(token);
        if (!user || user.vaiTro !== 'DOAN_KHOA') {
            return NextResponse.json({ error: 'Không có quyền' }, { status: 403 });
        }

        const { id } = await params;
        const body = await request.json();
        const { trangThai } = body;

        // Update Chi Doan status
        const chiDoan = await prisma.chiDoan.update({
            where: { id },
            data: { trangThai },
        });

        // Also update all users of this Chi Doan
        await prisma.nguoiDung.updateMany({
            where: { chiDoanId: id },
            data: { trangThai },
        });

        return NextResponse.json({
            success: true,
            chiDoan,
            message: trangThai ? 'Đã kích hoạt Chi Đoàn' : 'Đã đình chỉ Chi Đoàn'
        });
    } catch (error) {
        console.error('Update chi doan status error:', error);
        return NextResponse.json({ error: 'Có lỗi xảy ra' }, { status: 500 });
    }
}

// DELETE - Delete Chi Doan
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const token = request.cookies.get('token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
        }

        const user = await verifyToken(token);
        if (!user || user.vaiTro !== 'DOAN_KHOA') {
            return NextResponse.json({ error: 'Chỉ Admin Đoàn Khoa mới có quyền xóa Chi Đoàn' }, { status: 403 });
        }

        const { id } = await params;

        // Check if Chi Doan has events
        const eventCount = await prisma.suKien.count({
            where: { chiDoanId: id },
        });

        if (eventCount > 0) {
            return NextResponse.json(
                { error: `Không thể xóa! Chi Đoàn này có ${eventCount} sự kiện liên kết. Hãy xóa các sự kiện trước.` },
                { status: 400 }
            );
        }

        // Delete related users first
        await prisma.nguoiDung.deleteMany({
            where: { chiDoanId: id },
        });

        // Delete Chi Doan
        await prisma.chiDoan.delete({
            where: { id },
        });

        return NextResponse.json({ success: true, message: 'Đã xóa Chi Đoàn thành công' });
    } catch (error) {
        console.error('Delete chi doan error:', error);
        return NextResponse.json({ error: 'Có lỗi xảy ra khi xóa Chi Đoàn' }, { status: 500 });
    }
}
