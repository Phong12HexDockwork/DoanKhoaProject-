-- CreateTable
CREATE TABLE "chi_doan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ten_chi_doan" TEXT NOT NULL,
    "ma_chi_doan" TEXT NOT NULL,
    "mo_ta" TEXT,
    "ngay_tao" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "trang_thai" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "nguoi_dung" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "mat_khau_hash" TEXT NOT NULL,
    "ho_ten" TEXT NOT NULL,
    "so_dien_thoai" TEXT,
    "vai_tro" TEXT NOT NULL,
    "chi_doan_id" TEXT,
    "ngay_tao" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lan_dang_nhap_cuoi" DATETIME,
    "trang_thai" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "nguoi_dung_chi_doan_id_fkey" FOREIGN KEY ("chi_doan_id") REFERENCES "chi_doan" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "hoc_ky" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ten_hoc_ky" TEXT NOT NULL,
    "nam_hoc" TEXT NOT NULL,
    "ky" INTEGER NOT NULL,
    "ngay_bat_dau" DATETIME NOT NULL,
    "ngay_ket_thuc" DATETIME NOT NULL,
    "trang_thai" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "su_kien" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "chi_doan_id" TEXT NOT NULL,
    "hoc_ky_id" TEXT NOT NULL,
    "ten_su_kien" TEXT NOT NULL,
    "mo_ta" TEXT,
    "link_tai_lieu" TEXT,
    "dia_diem" TEXT,
    "thoi_gian_bat_dau" DATETIME NOT NULL,
    "thoi_gian_ket_thuc" DATETIME NOT NULL,
    "trang_thai_duyet" TEXT NOT NULL DEFAULT 'CHO_DUYET',
    "nguoi_tao_id" TEXT,
    "nguoi_duyet_id" TEXT,
    "ngay_tao" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ngay_duyet" DATETIME,
    "ngay_cap_nhat" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cho_phep_diem_danh" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "su_kien_chi_doan_id_fkey" FOREIGN KEY ("chi_doan_id") REFERENCES "chi_doan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "su_kien_hoc_ky_id_fkey" FOREIGN KEY ("hoc_ky_id") REFERENCES "hoc_ky" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "su_kien_nguoi_tao_id_fkey" FOREIGN KEY ("nguoi_tao_id") REFERENCES "nguoi_dung" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "su_kien_nguoi_duyet_id_fkey" FOREIGN KEY ("nguoi_duyet_id") REFERENCES "nguoi_dung" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ghi_chu_duyet" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "su_kien_id" TEXT NOT NULL,
    "nguoi_ghi_id" TEXT NOT NULL,
    "noi_dung" TEXT NOT NULL,
    "loai_ghi_chu" TEXT,
    "ngay_tao" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ghi_chu_duyet_su_kien_id_fkey" FOREIGN KEY ("su_kien_id") REFERENCES "su_kien" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ghi_chu_duyet_nguoi_ghi_id_fkey" FOREIGN KEY ("nguoi_ghi_id") REFERENCES "nguoi_dung" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "sinh_vien" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "mssv" TEXT NOT NULL,
    "ho_ten" TEXT NOT NULL,
    "lop" TEXT,
    "khoa" TEXT,
    "email" TEXT,
    "barcode" TEXT,
    "ngay_tao" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "diem_danh" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "su_kien_id" TEXT NOT NULL,
    "sinh_vien_id" TEXT NOT NULL,
    "nguoi_diem_danh_id" TEXT,
    "phuong_thuc" TEXT,
    "thoi_gian_diem_danh" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ghi_chu" TEXT,
    CONSTRAINT "diem_danh_su_kien_id_fkey" FOREIGN KEY ("su_kien_id") REFERENCES "su_kien" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "diem_danh_sinh_vien_id_fkey" FOREIGN KEY ("sinh_vien_id") REFERENCES "sinh_vien" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "diem_danh_nguoi_diem_danh_id_fkey" FOREIGN KEY ("nguoi_diem_danh_id") REFERENCES "nguoi_dung" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "lich_su_su_kien" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "su_kien_id" TEXT NOT NULL,
    "nguoi_thay_doi_id" TEXT,
    "hanh_dong" TEXT NOT NULL,
    "noi_dung_cu" TEXT,
    "noi_dung_moi" TEXT,
    "ngay_thay_doi" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "lich_su_su_kien_su_kien_id_fkey" FOREIGN KEY ("su_kien_id") REFERENCES "su_kien" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "lich_su_su_kien_nguoi_thay_doi_id_fkey" FOREIGN KEY ("nguoi_thay_doi_id") REFERENCES "nguoi_dung" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "chi_doan_ma_chi_doan_key" ON "chi_doan"("ma_chi_doan");

-- CreateIndex
CREATE UNIQUE INDEX "nguoi_dung_email_key" ON "nguoi_dung"("email");

-- CreateIndex
CREATE UNIQUE INDEX "sinh_vien_mssv_key" ON "sinh_vien"("mssv");

-- CreateIndex
CREATE UNIQUE INDEX "diem_danh_su_kien_id_sinh_vien_id_key" ON "diem_danh"("su_kien_id", "sinh_vien_id");
