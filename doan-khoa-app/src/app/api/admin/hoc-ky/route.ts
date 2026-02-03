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
        if (!user || user.vaiTro !== 'DOAN_KHOA') {
            return NextResponse.json({ error: 'Không có quyền' }, { status: 403 });
        }

        const body = await request.json();
        const { tenHocKy, namHoc, ky, ngayBatDau, ngayKetThuc } = body;

        if (!tenHocKy || !namHoc || !ky || !ngayBatDau || !ngayKetThuc) {
            return NextResponse.json(
                { error: 'Vui lòng điền đầy đủ thông tin' },
                { status: 400 }
            );
        }

        const hocKy = await prisma.hocKy.create({
            data: {
                tenHocKy,
                namHoc,
                ky: parseInt(ky),
                ngayBatDau: new Date(ngayBatDau),
                ngayKetThuc: new Date(ngayKetThuc),
                trangThai: true,
            },
        });

        return NextResponse.json({ success: true, hocKy });
    } catch (error) {
        console.error('Create hoc ky error:', error);
        return NextResponse.json({ error: 'Có lỗi xảy ra' }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get('token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
        }

        const hocKys = await prisma.hocKy.findMany({
            orderBy: { ngayBatDau: 'desc' },
        });

        return NextResponse.json({ hocKys });
    } catch (error) {
        console.error('Get hoc kys error:', error);
        return NextResponse.json({ error: 'Có lỗi xảy ra' }, { status: 500 });
    }
}
