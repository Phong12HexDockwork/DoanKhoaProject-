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
            return NextResponse.json({ error: 'Không có quyền' }, { status: 403 });
        }

        const { id } = await params;

        // Check if there are events linked to this semester
        const suKienCount = await prisma.suKien.count({
            where: { hocKyId: id },
        });

        if (suKienCount > 0) {
            return NextResponse.json(
                { error: `Không thể xóa! Học kỳ này có ${suKienCount} sự kiện liên kết.` },
                { status: 400 }
            );
        }

        // Delete the semester
        await prisma.hocKy.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete hoc ky error:', error);
        return NextResponse.json({ error: 'Có lỗi xảy ra' }, { status: 500 });
    }
}
