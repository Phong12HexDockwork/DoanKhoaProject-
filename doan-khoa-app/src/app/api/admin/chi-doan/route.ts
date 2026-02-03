import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, hashPassword } from '@/lib/auth';

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
        const { tenChiDoan, maChiDoan, moTa, email, hoTen, password } = body;

        if (!tenChiDoan || !maChiDoan || !email || !hoTen || !password) {
            return NextResponse.json(
                { error: 'Vui lòng điền đầy đủ thông tin bắt buộc' },
                { status: 400 }
            );
        }

        // Check if maChiDoan already exists
        const existingChiDoan = await prisma.chiDoan.findUnique({
            where: { maChiDoan },
        });

        if (existingChiDoan) {
            return NextResponse.json(
                { error: 'Mã Chi Đoàn đã tồn tại' },
                { status: 400 }
            );
        }

        // Check if email already exists
        const existingUser = await prisma.nguoiDung.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: 'Email đã được sử dụng' },
                { status: 400 }
            );
        }

        // Create Chi Đoàn and account in transaction
        const result = await prisma.$transaction(async (tx) => {
            const chiDoan = await tx.chiDoan.create({
                data: {
                    tenChiDoan,
                    maChiDoan,
                    moTa: moTa || null,
                },
            });

            const hashedPassword = await hashPassword(password);
            const nguoiDung = await tx.nguoiDung.create({
                data: {
                    email,
                    matKhauHash: hashedPassword,
                    hoTen,
                    vaiTro: 'CHI_DOAN',
                    chiDoanId: chiDoan.id,
                },
            });

            return { chiDoan, nguoiDung };
        });

        return NextResponse.json({ success: true, ...result });
    } catch (error) {
        console.error('Create chi doan error:', error);
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
        if (!user || user.vaiTro !== 'DOAN_KHOA') {
            return NextResponse.json({ error: 'Không có quyền' }, { status: 403 });
        }

        const chiDoans = await prisma.chiDoan.findMany({
            include: {
                _count: {
                    select: { suKiens: true, nguoiDungs: true },
                },
            },
            orderBy: { tenChiDoan: 'asc' },
        });

        return NextResponse.json({ chiDoans });
    } catch (error) {
        console.error('Get chi doans error:', error);
        return NextResponse.json({ error: 'Có lỗi xảy ra' }, { status: 500 });
    }
}
