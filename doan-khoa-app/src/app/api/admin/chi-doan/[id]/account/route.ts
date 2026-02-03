import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, hashPassword } from '@/lib/auth';

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
        const { email, hoTen, password } = body;

        if (!email || !hoTen || !password) {
            return NextResponse.json(
                { error: 'Vui lòng điền đầy đủ thông tin' },
                { status: 400 }
            );
        }

        // Check if chi doan exists
        const chiDoan = await prisma.chiDoan.findUnique({
            where: { id },
        });

        if (!chiDoan) {
            return NextResponse.json({ error: 'Chi Đoàn không tồn tại' }, { status: 404 });
        }

        // Check if email already exists
        const existingUser = await prisma.nguoiDung.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json({ error: 'Email đã được sử dụng' }, { status: 400 });
        }

        const hashedPassword = await hashPassword(password);
        const nguoiDung = await prisma.nguoiDung.create({
            data: {
                email,
                matKhauHash: hashedPassword,
                hoTen,
                vaiTro: 'CHI_DOAN',
                chiDoanId: id,
            },
        });

        return NextResponse.json({ success: true, nguoiDung });
    } catch (error) {
        console.error('Add account error:', error);
        return NextResponse.json({ error: 'Có lỗi xảy ra' }, { status: 500 });
    }
}
