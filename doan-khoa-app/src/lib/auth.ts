import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'supersecret-key-change-in-production'
);

export interface UserPayload {
    id: string;
    email: string;
    hoTen: string;
    vaiTro: 'DOAN_KHOA' | 'CHI_DOAN';
    chiDoanId?: string;
    chiDoanName?: string;
}

export async function createToken(payload: UserPayload): Promise<string> {
    return new SignJWT({ ...payload })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('24h')
        .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<UserPayload | null> {
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        return payload as unknown as UserPayload;
    } catch {
        return null;
    }
}

export async function authenticateUser(
    email: string,
    password: string
): Promise<{ user: UserPayload; token: string } | null> {
    const nguoiDung = await prisma.nguoiDung.findUnique({
        where: { email },
        include: { chiDoan: true },
    });

    if (!nguoiDung || !nguoiDung.trangThai) {
        return null;
    }

    const isValid = await bcrypt.compare(password, nguoiDung.matKhauHash);
    if (!isValid) {
        return null;
    }

    // Update last login
    await prisma.nguoiDung.update({
        where: { id: nguoiDung.id },
        data: { lanDangNhapCuoi: new Date() },
    });

    const user: UserPayload = {
        id: nguoiDung.id,
        email: nguoiDung.email,
        hoTen: nguoiDung.hoTen,
        vaiTro: nguoiDung.vaiTro as 'DOAN_KHOA' | 'CHI_DOAN',
        chiDoanId: nguoiDung.chiDoanId || undefined,
        chiDoanName: nguoiDung.chiDoan?.tenChiDoan || undefined,
    };

    const token = await createToken(user);

    return { user, token };
}

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
}
