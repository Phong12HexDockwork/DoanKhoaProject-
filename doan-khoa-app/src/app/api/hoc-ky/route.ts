import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const hocKys = await prisma.hocKy.findMany({
            where: { trangThai: true },
            orderBy: { ngayBatDau: 'desc' },
        });

        return NextResponse.json({ hocKys });
    } catch (error) {
        console.error('Error fetching hoc kys:', error);
        return NextResponse.json({ error: 'Có lỗi xảy ra' }, { status: 500 });
    }
}
