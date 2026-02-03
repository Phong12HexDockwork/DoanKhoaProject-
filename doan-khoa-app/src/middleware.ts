import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

// Routes that don't require authentication
const publicRoutes = ['/login', '/api/auth/login'];

// Routes that only Đoàn Khoa can access
const adminRoutes = ['/admin'];

// Routes that only Chi Đoàn can access  
const chiDoanRoutes = ['/chi-doan'];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Allow public routes
    if (publicRoutes.some(route => pathname.startsWith(route))) {
        return NextResponse.next();
    }

    // Allow static files and API routes (except protected ones)
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/favicon') ||
        pathname === '/'
    ) {
        return NextResponse.next();
    }

    // Check for token
    const token = request.cookies.get('token')?.value;

    if (!token) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // Verify token
    const user = await verifyToken(token);

    if (!user) {
        const response = NextResponse.redirect(new URL('/login', request.url));
        response.cookies.delete('token');
        return response;
    }

    // Check role-based access
    if (adminRoutes.some(route => pathname.startsWith(route))) {
        if (user.vaiTro !== 'DOAN_KHOA') {
            return NextResponse.redirect(new URL('/chi-doan', request.url));
        }
    }

    if (chiDoanRoutes.some(route => pathname.startsWith(route))) {
        if (user.vaiTro !== 'CHI_DOAN') {
            return NextResponse.redirect(new URL('/admin', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
