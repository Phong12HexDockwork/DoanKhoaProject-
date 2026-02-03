import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email và mật khẩu là bắt buộc' },
                { status: 400 }
            );
        }

        const result = await authenticateUser(email, password);

        if (!result) {
            return NextResponse.json(
                { error: 'Email hoặc mật khẩu không đúng' },
                { status: 401 }
            );
        }

        const response = NextResponse.json({
            success: true,
            user: result.user,
        });

        // Set HTTP-only cookie
        response.cookies.set('token', result.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24, // 24 hours
            path: '/',
        });

        return response;
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'Đã có lỗi xảy ra' },
            { status: 500 }
        );
    }
}
