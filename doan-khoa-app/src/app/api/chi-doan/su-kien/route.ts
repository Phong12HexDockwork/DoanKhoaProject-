import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        const token = request.cookies.get('token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
        }

        const user = await verifyToken(token);
        if (!user || user.vaiTro !== 'CHI_DOAN' || !user.chiDoanId) {
            return NextResponse.json({ error: 'Không có quyền' }, { status: 403 });
        }

        const body = await request.json();
        const {
            tenSuKien,
            moTa,
            linkTaiLieu,
            diaDiem,
            hocKyId,
            thoiGianBatDau,
            thoiGianKetThuc,
        } = body;

        if (!tenSuKien || !hocKyId || !thoiGianBatDau || !thoiGianKetThuc) {
            return NextResponse.json(
                { error: 'Vui lòng điền đầy đủ thông tin bắt buộc' },
                { status: 400 }
            );
        }

        const suKien = await prisma.suKien.create({
            data: {
                chiDoanId: user.chiDoanId,
                hocKyId,
                tenSuKien,
                moTa: moTa || null,
                linkTaiLieu: linkTaiLieu || null,
                diaDiem: diaDiem || null,
                thoiGianBatDau: new Date(thoiGianBatDau),
                thoiGianKetThuc: new Date(thoiGianKetThuc),
                trangThaiDuyet: 'CHO_DUYET',
                nguoiTaoId: user.id,
            },
        });

        // Log history
        await prisma.lichSuSuKien.create({
            data: {
                suKienId: suKien.id,
                nguoiThayDoiId: user.id,
                hanhDong: 'TAO_MOI',
                noiDungMoi: JSON.stringify(suKien),
            },
        });

        return NextResponse.json({ success: true, suKien });
    } catch (error) {
        console.error('Create event error:', error);
        return NextResponse.json({ error: 'Có lỗi xảy ra' }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get('token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
        }

        const user = await verifyToken(token);
        if (!user || !user.chiDoanId) {
            return NextResponse.json({ error: 'Không có quyền' }, { status: 403 });
        }

        const suKiens = await prisma.suKien.findMany({
            where: { chiDoanId: user.chiDoanId },
            orderBy: { ngayTao: 'desc' },
            include: { hocKy: true },
        });

        return NextResponse.json({ suKiens });
    } catch (error) {
        console.error('Get events error:', error);
        return NextResponse.json({ error: 'Có lỗi xảy ra' }, { status: 500 });
    }
}
