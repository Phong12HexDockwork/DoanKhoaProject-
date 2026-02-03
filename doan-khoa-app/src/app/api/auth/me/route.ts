import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get('token')?.value;

        if (!token) {
            return NextResponse.json(
                { error: 'Chưa đăng nhập' },
                { status: 401 }
            );
        }

        const user = await verifyToken(token);

        if (!user) {
            return NextResponse.json(
                { error: 'Token không hợp lệ' },
                { status: 401 }
            );
        }

        return NextResponse.json({ user });
    } catch (error) {
        console.error('Auth check error:', error);
        return NextResponse.json(
            { error: 'Đã có lỗi xảy ra' },
            { status: 500 }
        );
    }
}
