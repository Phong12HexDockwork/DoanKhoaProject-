import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get('token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
        }

        const user = await verifyToken(token);
        if (!user) {
            return NextResponse.json({ error: 'Không có quyền' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const filter = searchParams.get('filter'); // 'mine' or 'all' or chiDoanId

        let whereClause = {};

        if (filter === 'mine' && user.chiDoanId) {
            whereClause = { chiDoanId: user.chiDoanId };
        } else if (filter && filter !== 'all') {
            whereClause = { chiDoanId: filter };
        }
        // If filter is 'all' or not specified, get all events

        const suKiens = await prisma.suKien.findMany({
            where: whereClause,
            orderBy: { thoiGianBatDau: 'asc' },
            include: {
                chiDoan: {
                    select: {
                        id: true,
                        tenChiDoan: true,
                        maChiDoan: true,
                    }
                },
                hocKy: true,
            },
        });

        // Get list of all Chi Đoàn for filter dropdown
        const chiDoans = await prisma.chiDoan.findMany({
            where: { trangThai: true },
            select: {
                id: true,
                tenChiDoan: true,
            },
            orderBy: { tenChiDoan: 'asc' },
        });

        return NextResponse.json({
            suKiens,
            chiDoans,
            currentChiDoanId: user.chiDoanId
        });
    } catch (error) {
        console.error('Get calendar events error:', error);
        return NextResponse.json({ error: 'Có lỗi xảy ra' }, { status: 500 });
    }
}
