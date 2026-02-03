import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Tạo học kỳ
    const hocKy = await prisma.hocKy.create({
        data: {
            tenHocKy: 'HK2 2025-2026',
            namHoc: '2025-2026',
            ky: 2,
            ngayBatDau: new Date('2026-01-01'),
            ngayKetThuc: new Date('2026-06-30'),
            trangThai: true,
        },
    });
    console.log('✅ Created học kỳ:', hocKy.tenHocKy);

    // Tạo các chi đoàn
    const chiDoans = await Promise.all([
        prisma.chiDoan.create({
            data: {
                tenChiDoan: 'Chi Đoàn Công nghệ thông tin',
                maChiDoan: 'CD_CNTT',
                moTa: 'Chi đoàn khoa Công nghệ thông tin',
            },
        }),
        prisma.chiDoan.create({
            data: {
                tenChiDoan: 'Chi Đoàn Kinh tế',
                maChiDoan: 'CD_KT',
                moTa: 'Chi đoàn khoa Kinh tế',
            },
        }),
        prisma.chiDoan.create({
            data: {
                tenChiDoan: 'Chi Đoàn Ngoại ngữ',
                maChiDoan: 'CD_NN',
                moTa: 'Chi đoàn khoa Ngoại ngữ',
            },
        }),
    ]);
    console.log('✅ Created', chiDoans.length, 'chi đoàn');

    // Tạo tài khoản admin Đoàn Khoa
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.nguoiDung.create({
        data: {
            email: 'admin@doankhoa.edu.vn',
            matKhauHash: hashedPassword,
            hoTen: 'Admin Đoàn Khoa',
            vaiTro: 'DOAN_KHOA',
            trangThai: true,
        },
    });
    console.log('✅ Created admin account:', admin.email);

    // Tạo tài khoản cho các chi đoàn
    const chiDoanUsers = await Promise.all(
        chiDoans.map((cd: { id: string; maChiDoan: string; tenChiDoan: string }) =>
            prisma.nguoiDung.create({
                data: {
                    email: `${cd.maChiDoan.toLowerCase()}@doankhoa.edu.vn`,
                    matKhauHash: hashedPassword,
                    hoTen: `Bí thư ${cd.tenChiDoan}`,
                    vaiTro: 'CHI_DOAN',
                    chiDoanId: cd.id,
                    trangThai: true,
                },
            })
        )
    );
    console.log('✅ Created', chiDoanUsers.length, 'chi đoàn accounts');

    // Tạo một số sinh viên mẫu
    const sinhViens = await Promise.all([
        prisma.sinhVien.create({
            data: {
                mssv: '20110001',
                hoTen: 'Nguyễn Văn A',
                lop: 'CNTT01',
                khoa: 'Công nghệ thông tin',
                email: '20110001@student.edu.vn',
                barcode: 'SV20110001',
            },
        }),
        prisma.sinhVien.create({
            data: {
                mssv: '20110002',
                hoTen: 'Trần Thị B',
                lop: 'CNTT01',
                khoa: 'Công nghệ thông tin',
                email: '20110002@student.edu.vn',
                barcode: 'SV20110002',
            },
        }),
        prisma.sinhVien.create({
            data: {
                mssv: '20220003',
                hoTen: 'Lê Văn C',
                lop: 'KT01',
                khoa: 'Kinh tế',
                email: '20220003@student.edu.vn',
                barcode: 'SV20220003',
            },
        }),
    ]);
    console.log('✅ Created', sinhViens.length, 'sinh viên');

    // Tạo sự kiện mẫu
    const suKien = await prisma.suKien.create({
        data: {
            chiDoanId: chiDoans[0].id,
            hocKyId: hocKy.id,
            tenSuKien: 'Ngày hội Tình nguyện Xanh',
            moTa: 'Hoạt động tình nguyện dọn dẹp khuôn viên trường',
            linkTaiLieu: 'https://drive.google.com/example',
            diaDiem: 'Sân trường',
            thoiGianBatDau: new Date('2026-02-15T08:00:00'),
            thoiGianKetThuc: new Date('2026-02-15T12:00:00'),
            trangThaiDuyet: 'CHO_DUYET',
            nguoiTaoId: chiDoanUsers[0].id,
        },
    });
    console.log('✅ Created sự kiện mẫu:', suKien.tenSuKien);

    console.log('🎉 Seeding completed!');
    console.log('\n📋 Test accounts:');
    console.log('   Admin: admin@doankhoa.edu.vn / admin123');
    console.log('   Chi đoàn CNTT: cd_cntt@doankhoa.edu.vn / admin123');
    console.log('   Chi đoàn KT: cd_kt@doankhoa.edu.vn / admin123');
    console.log('   Chi đoàn NN: cd_nn@doankhoa.edu.vn / admin123');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
