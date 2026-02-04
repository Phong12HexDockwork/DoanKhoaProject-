import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// Hard overwrite to fix next-auth cache error

export async function GET(req: NextRequest) {
    try {
        const token = req.cookies.get('token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await verifyToken(token);
        if (!user || user.vaiTro !== 'DOAN_KHOA') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const suKiens = await prisma.suKien.findMany({
            include: {
                chiDoan: true,
                hocKy: true,
            },
            orderBy: {
                thoiGianBatDau: 'asc',
            },
        });

        return NextResponse.json(suKiens);
    } catch (error) {
        console.error('Error fetching admin events:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const token = req.cookies.get('token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await verifyToken(token);
        if (!user || user.vaiTro !== 'DOAN_KHOA') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await req.json();
        const { tenSuKien, moTa, hinhThuc, coSo, diaDiem, thoiGianBatDau, thoiGianKetThuc, hocKyId, linkTaiLieu, hangMuc, maMuc } = body;

        let doanKhoa = await prisma.chiDoan.findUnique({
            where: { maChiDoan: 'DOAN_KHOA' },
        });

        if (!doanKhoa) {
            doanKhoa = await prisma.chiDoan.create({
                data: {
                    maChiDoan: 'DOAN_KHOA',
                    tenChiDoan: 'Đoàn Khoa',
                    moTa: 'Tài khoản quản trị Đoàn Khoa',
                    trangThai: true,
                },
            });
        }

        const newEvent = await prisma.suKien.create({
            data: {
                tenSuKien,
                moTa,
                linkTaiLieu: linkTaiLieu || null,
                hangMuc: hangMuc || null,
                maMuc: maMuc || null,
                hinhThuc: hinhThuc || 'OFFLINE',
                coSo: hinhThuc === 'ONLINE' ? null : coSo,
                diaDiem: hinhThuc === 'ONLINE' ? null : diaDiem,
                thoiGianBatDau: new Date(thoiGianBatDau),
                thoiGianKetThuc: new Date(thoiGianKetThuc),
                hocKyId,
                chiDoanId: doanKhoa.id,
                nguoiTaoId: user.id,
                trangThaiDuyet: 'DA_DUYET',
                ngayDuyet: new Date(),
                nguoiDuyetId: user.id
            },
        });

        return NextResponse.json(newEvent);
    } catch (error) {
        console.error('Error creating admin event:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
