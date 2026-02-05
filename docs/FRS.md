# FUNCTIONAL REQUIREMENT SPECIFICATION (FRS)
# HỆ THỐNG QUẢN LÝ SỰ KIỆN ĐOÀN THANH NIÊN

**Ngày tạo:** 06/02/2026
**Phiên bản:** 1.0
**Tình trạng:** Draft

---

## 1. GIỚI THIỆU (Introduction)
Tài liệu này mô tả chi tiết các yêu cầu chức năng của hệ thống Quản lý sự kiện Đoàn Thanh niên, làm cơ sở cho đội phát triển và đội kiểm thử (QA/QC) làm việc.

---

## 2. CÁC TÁC NHÂN HỆ THỐNG (System Actors)

| Tác nhân | Mã | Mô tả |
|----------|----|-------|
| **Đoàn Khoa** | `[ADMIN]` | Người quản trị cao nhất, có quyền duyệt sự kiện, quản lý danh mục và xem báo cáo toàn cục. |
| **Chi Đoàn** | `[USER]` | Ban chấp hành các chi đoàn, chịu trách nhiệm tạo sự kiện và tổ chức điểm danh. |
| **Hệ thống** | `[SYS]` | Các tác vụ tự động (Cron job, validations, notifications). |

---

## 3. YÊU CẦU CHỨC NĂNG CHI TIẾT (Functional Requirements)

### 3.1 Phân hệ Xác thực & Ủy quyền (Authentication & Authorization)

| ID | Tên chức năng | Mô tả chi tiết | Quyền |
|----|---------------|----------------|-------|
| **F-01** | Đăng nhập hệ thống | - Đăng nhập bằng Email và Password.<br>- Mã hóa mật khẩu sử dụng `bcrypt`.<br>- Cấp phát `JWT` token (hết hạn sau 24h). | Tất cả |
| **F-02** | Đăng xuất | - Xóa token khỏi trình duyệt.<br>- Chuyển hướng về trang Login. | Tất cả |
| **F-03** | Phân quyền truy cập | - `[ADMIN]` truy cập được `/admin/*`.<br>- `[USER]` chỉ truy cập được `/chi-doan/*`.<br>- Middleware kiểm tra role trong token. | [SYS] |

### 3.2 Phân hệ Quản lý Sự kiện (Event Management)

| ID | Tên chức năng | Mô tả chi tiết | Quyền |
|----|---------------|----------------|-------|
| **F-04** | Xem danh sách sự kiện | - Hiển thị danh sách sự kiện theo dạng Grid/List.<br>- Bộ lọc: Học kỳ, Trạng thái (Chờ duyệt, Đã duyệt...), Tháng.<br>- Phân trang (Pagination). | Tất cả |
| **F-05** | Tạo sự kiện mới | - Form nhập liệu gồm: Tên, Mô tả, Thời gian (Bắt đầu/Kết thúc), Địa điểm, Link kế hoạch.<br>- Validate: Thời gian kết thúc > Bắt đầu, các trường bắt buộc.<br>- Trạng thái mặc định: `CHO_DUYET`. | [USER] |
| **F-06** | Chi tiết sự kiện | - Xem đầy đủ thông tin sự kiện.<br>- Hiển thị trạng thái duyệt và lịch sử thay đổi (Audit Log).<br>- Hiển thị QR Code điểm danh (nếu sự kiện đang diễn ra). | Tất cả |
| **F-07** | Duyệt sự kiện | - Cho phép chấp nhận (`DA_DUYET`) hoặc từ chối (`TU_CHOI`).<br>- Nếu từ chối hoặc yêu cầu sửa, bắt buộc nhập lý do vào `GhiChuDuyet`. | [ADMIN] |
| **F-08** | Cập nhật sự kiện | - Chỉ cho phép sửa khi trạng thái là `CHO_DUYET` hoặc `YEU_CAU_SUA`.<br>- Khi sửa sự kiện đã duyệt -> Trạng thái quay về `CHO_DUYET` (Logic tùy biến). | [USER] |
| **F-09** | Xóa sự kiện | - Chỉ cho phép xóa sự kiện chưa diễn ra và chưa có dữ liệu điểm danh.<br>- Xóa mềm (Soft delete) hoặc xóa cứng tùy cấu hình. | [USER] |

### 3.3 Phân hệ Điểm danh (Attendance)

| ID | Tên chức năng | Mô tả chi tiết | Quyền |
|----|---------------|----------------|-------|
| **F-10** | Bật/Tắt điểm danh | - Toggle switch cho phép sinh viên bắt đầu điểm danh.<br>- Chỉ bật được khi sự kiện đã được Duyệt. | [USER] |
| **F-11** | Quét Barcode/QR | - Sử dụng camera thiết bị hoặc máy quét cầm tay.<br>- Input: Mã sinh viên (Barcode/MSSV).<br>- Hệ thống kiểm tra: MSSV tồn tại? Đã điểm danh chưa?<br>- Phản hồi: Thành công (Xanh) / Thất bại (Đỏ + Lý do). | [USER] |
| **F-12** | Nhập tay MSSV | - Form nhập MSSV thủ công cho trường hợp quét lỗi.<br>- Validate MSSV hợp lệ (Regex/Database check). | [USER] |
| **F-13** | Danh sách tham gia | - Hiển thị Real-time danh sách sinh viên đã điểm danh.<br>- Thông tin: Họ tên, MSSV, Thời gian check-in. | [USER], [ADMIN] |

### 3.4 Phân hệ Quản lý Danh mục (Master Data)

| ID | Tên chức năng | Mô tả chi tiết | Quyền |
|----|---------------|----------------|-------|
| **F-14** | Quản lý Học kỳ | - CRUD Học kỳ (VD: HK1 2024-2025).<br>- Set trạng thái "Học kỳ hiện tại" (Active semester). | [ADMIN] |
| **F-15** | Quản lý Chi Đoàn | - CRUD tài khoản Chi Đoàn.<br>- Reset mật khẩu cho Chi Đoàn. | [ADMIN] |

---

## 4. YÊU CẦU PHI CHỨC NĂNG (Non-Functional Requirements)

### 4.1 Hiệu năng (Performance)
- Thời gian phản hồi API < 500ms cho các tác vụ thông thường.
- Tốc độ quét điểm danh < 1s/sinh viên để tránh ùn tắc.
- Hỗ trợ đồng thời 50 Chi Đoàn cùng thao tác.

### 4.2 Bảo mật (Security)
- **Authentication:** JWT Token (HS256).
- **Password:** Bcrypt hashing.
- **Data:** Sanitization đầu vào để chống SQL Injection (Prisma đã hỗ trợ).
- **Authorization:** Role-based Access Control (RBAC).

### 4.3 Giao diện (UI/UX)
- Giao diện hiện đại, Clean Design.
- **Responsive:** Tương thích tốt trên Mobile (Ưu tiên mobile-first cho chức năng Điểm danh).
- Thông báo lỗi/thành công rõ ràng (Toast notification).

---

## 5. USE CASES ĐIỂN HÌNH

### UC-01: Quy trình Tổ chức Sự kiện
1. **Chi Đoàn** đăng nhập -> Vào trang Quản lý sự kiện.
2. Chọn "Tạo sự kiện" -> Điền thông tin -> Submit.
3. Hệ thống lưu sự kiện với trạng thái `CHO_DUYET`.
4. **Đoàn Khoa** nhận thông báo (hoặc thấy trên Dashboard).
5. **Đoàn Khoa** xem chi tiết -> Chọn "Duyệt".
6. Sự kiện chuyển sang `DA_DUYET`.

### UC-02: Quy trình Điểm danh
1. Đến giờ tổ chức, **Chi Đoàn** mở trang chi tiết sự kiện trên điện thoại.
2. Bật chức năng "Cho phép điểm danh".
3. Chọn chế độ "Quét Camera" hoặc cắm máy quét Barcode.
4. Quét thẻ sinh viên (Barcode).
5. Hệ thống ghi nhận -> Hiển thị "Nguyễn Văn A - 20h30 ✅".
6. Lặp lại cho sinh viên khác.
