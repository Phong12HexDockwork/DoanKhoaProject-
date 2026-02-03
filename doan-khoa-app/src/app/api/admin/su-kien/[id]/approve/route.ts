import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
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
        const { action, note } = body;

        if (!['DA_DUYET', 'TU_CHOI', 'YEU_CAU_SUA'].includes(action)) {
            return NextResponse.json({ error: 'Hành động không hợp lệ' }, { status: 400 });
        }

        // Update event status
        const suKien = await prisma.suKien.update({
            where: { id },
            data: {
                trangThaiDuyet: action,
                nguoiDuyetId: user.id,
                ngayDuyet: new Date(),
                ngayCapNhat: new Date(),
            },
        });

        // Add note if provided
        if (note && note.trim()) {
            await prisma.ghiChuDuyet.create({
                data: {
                    suKienId: id,
                    nguoiGhiId: user.id,
                    noiDung: note.trim(),
                    loaiGhiChu: action,
                },
            });
        }

        // Log history
        await prisma.lichSuSuKien.create({
            data: {
                suKienId: id,
                nguoiThayDoiId: user.id,
                hanhDong: action,
                noiDungMoi: JSON.stringify({ trangThaiDuyet: action, note }),
            },
        });

        return NextResponse.json({ success: true, suKien });
    } catch (error) {
        console.error('Approve error:', error);
        return NextResponse.json({ error: 'Có lỗi xảy ra' }, { status: 500 });
    }
}
