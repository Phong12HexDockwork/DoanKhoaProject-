# BUSINESS REQUIREMENT DOCUMENT (BRD)
# HỆ THỐNG QUẢN LÝ SỰ KIỆN ĐOÀN THANH NIÊN

**Ngày tạo:** 06/02/2026
**Phiên bản:** 1.0
**Tình trạng:** Draft

---

## 1. TỔNG QUAN DỰ ÁN (Executive Summary)

### 1.1 Chi Tiết Dự Án
Dự án xây dựng "Hệ thống quản lý sự kiện Đoàn Thanh niên" là một giải pháp web app nhằm số hóa toàn bộ quy trình quản lý, tổ chức và điểm danh các sự kiện phong trào tại trường Đại học. Hệ thống giúp kết nối giữa **Đoàn Khoa** (cấp quản lý) và **Chi Đoàn/Sinh Viên** (cấp thực hiện/tham gia), thay thế các quy trình thủ công bằng giấy tờ hoặc bảng tính rời rạc.

### 1.2 Mục Tiêu Kinh Doanh (Business Objectives)
- **Số hóa quy trình:** Chuyển đổi 100% việc đăng ký và duyệt sự kiện sang nền tảng số.
- **Tối ưu hóa thời gian:** Giảm 80% thời gian xét duyệt và tổng hợp báo cáo cho Đoàn Khoa.
- **Minh bạch hóa:** Cung cấp trạng thái duyệt sự kiện realtime, giúp các Chi Đoàn nắm bắt thông tin nhanh chóng.
- **Chính xác hóa dữ liệu:** Điểm danh bằng QR Code/Barcode giúp loại bỏ sai sót và gian lận trong việc ghi nhận tham gia hoạt động (điểm rèn luyện).

---

## 2. PHẠM VI DỰ ÁN (Project Scope)

### 2.1 Trong Phạm Vi (In-Scope)
- **Quản lý người dùng:** Phân quyền Đoàn Khoa (Admin) và Chi Đoàn (User).
- **Quản lý sự kiện:** Quy trình Tạo -> Duyệt -> Tổ chức -> Kết thúc.
- **Điểm danh:** Hỗ trợ quét mã Barcode (thẻ SV) và QR Code.
- **Báo cáo thống kê:** Xuất danh sách tham gia, thống kê số lượng sự kiện theo Học kỳ.
- **Giao diện Web:** Responsive cho cả PC và Mobile.

### 2.2 Ngoài Phạm Vi (Out-Scope) - Giai đoạn 1
- Tích hợp đăng nhập SSO của trường (hiện tại dùng email/pass riêng).
- Mobile App Native (iOS/Android).
- Thanh toán lệ phí sự kiện trực tuyến.

---

## 3. CÁC BÊN LIÊN QUAN (Stakeholders)

| Vai trò | Mô tả | Trách nhiệm chính |
|---------|-------|-------------------|
| **Đoàn Khoa** | Quản trị viên hệ thống | Duyệt sự kiện, quản lý danh sách Chi Đoàn, xem báo cáo tổng hợp. |
| **Chi Đoàn** | Người dùng cấp cơ sở | Đăng ký sự kiện, tổ chức sự kiện, thực hiện điểm danh cho sinh viên. |
| **Sinh Viên** | Người tham gia | Tham gia sự kiện, được điểm danh để ghi nhận thành tích. |
| **Đội Phát Triển** | Dev Team | Xây dựng, bảo trì và vận hành hệ thống. |

---

## 4. YÊU CẦU CẤP CAO (High-Level Requirements)

### 4.1 Quản trị hệ thống
- Hệ thống phải cho phép Đoàn Khoa cấu hình các Học kỳ (HK1, HK2, Hè) để phân loại dữ liệu.
- Quản lý danh sách tài khoản Chi Đoàn tập trung.

### 4.2 Quy trình nghiệp vụ Sự kiện
- **Đăng ký:** Chi Đoàn gửi form đăng ký sự kiện với đầy đủ thông tin (Tên, thời gian, địa điểm, kế hoạch).
- **Xét duyệt:** Đoàn Khoa có quyền Duyệt, Từ chối hoặc Yêu cầu chỉnh sửa (kèm ghi chú).
- **Lịch sử:** Mọi thao tác thay đổi trạng thái sự kiện phải được log lại.

### 4.3 Điểm danh thông minh
- Hỗ trợ điểm danh offline tại chỗ thông qua thiết bị di động (quét mã).
- Đảm bảo mỗi sinh viên chỉ được điểm danh 1 lần/sự kiện.
- Hỗ trợ nhập tay MSSV trong trường hợp quên thẻ/lỗi thiết bị.

---

## 5. RÀNG BUỘC (Constraints)
- **Công nghệ:** Next.js (Frontend + Backend API), PostgreSQL (Database), Prisma (ORM).
- **Bảo mật:** Mật khẩu phải được mã hóa (bcrypt), xác thực qua JWT.
- **Hiệu năng:** Hệ thống phải chịu tải tốt trong các đợt cao điểm nộp hồ sơ sự kiện đầu kỳ.

---

## 6. LỘ TRÌNH DỰ KIẾN (Roadmap)
- **Giai đoạn 1 (MVP):** Hoàn thiện Core Features (CRUD Sự kiện, Duyệt, Điểm danh cơ bản).
- **Giai đoạn 2:** Báo cáo nâng cao, Dashboard thống kê trực quan.
- **Giai đoạn 3:** Thông báo qua Email, Tích hợp Calendar.
