// Hệ thống phân loại hoạt động theo tiêu chí đánh giá Chi Đoàn
// 8 hạng mục từ A-H với các mục con

export interface MucCon {
    ma: string;           // 1.1, 1.2, 2.1...
    tenMuc: string;       // Tên hoạt động
}

export interface HangMuc {
    ma: string;           // A, B, C...
    ten: string;          // Tên hạng mục
    mucCons: MucCon[];
}

export const HANG_MUCS: HangMuc[] = [
    {
        ma: 'A',
        ten: 'Công tác giáo dục',
        mucCons: [
            {
                ma: '1.1',
                tenMuc: 'Tổ chức các hoạt động học tập và làm theo tư tưởng, đạo đức, phong cách Hồ Chí Minh'
            },
            {
                ma: '1.2',
                tenMuc: 'Chia sẻ thông tin, giới thiệu cá nhân, tập thể đề xuất danh hiệu Thanh niên và Tập thể tiên tiến làm theo lời Bác năm 2025'
            },
            {
                ma: '1.3',
                tenMuc: 'Chia sẻ thông tin về Hội thi "Sáng mãi tên người" năm 2026'
            },
            {
                ma: '1.4',
                tenMuc: 'Tham gia giao ban chi đoàn - dư luận xã hội hoặc báo cáo thời sự (định kỳ hằng quý)'
            },
            {
                ma: '1.5',
                tenMuc: 'Tổ chức đối thoại với lãnh đạo Đoàn, khoa. Chia sẻ thông tin về Phiên họp giả định Hội đồng Thanh niên 2026'
            },
            {
                ma: '1.6',
                tenMuc: '100% cán bộ đoàn, 80% đoàn viên tham gia học tập, quán triệt Nghị quyết Đảng, Đoàn, Hội các cấp'
            },
            {
                ma: '1.7',
                tenMuc: 'Triển khai đợt hoạt động kỷ niệm 96 năm thành lập Đảng CSVN (03/02/1930 - 03/02/2026)'
            },
            {
                ma: '1.8',
                tenMuc: 'Tổ chức sinh hoạt chi đoàn, sinh hoạt chính trị theo chủ điểm hàng tháng'
            },
            {
                ma: '1.9',
                tenMuc: 'Tuyên truyền pháp luật, kỷ niệm Ngày pháp luật Việt Nam (09/11/2025)'
            },
            {
                ma: '1.10',
                tenMuc: 'Huy động lực lượng kỷ niệm 95 năm thành lập Đoàn TNCS HCM và 30 năm Đoàn trường ĐH KHTN'
            },
            {
                ma: '1.11',
                tenMuc: 'Tổ chức các hoạt động về nguồn, đền ơn đáp nghĩa, chăm sóc mẹ Việt Nam anh hùng'
            },
            {
                ma: '1.12',
                tenMuc: 'Tham gia hoạt động truyền thống khoa, tri ân thầy cô ngày Nhà giáo Việt Nam'
            },
            {
                ma: '1.13',
                tenMuc: 'Tuyên truyền giá trị sống tích cực, cuộc vận động "Mỗi ngày một tin tốt, Mỗi tuần một câu chuyện đẹp"'
            },
            {
                ma: '1.14',
                tenMuc: 'Tham gia "Ngày hội Công dân trẻ Khoa học Tự nhiên" năm 2026'
            }
        ]
    },
    {
        ma: 'B',
        ten: 'Phong trào phát huy thanh niên trong xây dựng và bảo vệ Tổ quốc',
        mucCons: [
            {
                ma: '2.1',
                tenMuc: 'Phát động, ghi nhận ý tưởng sáng kiến thực hiện Nghị quyết 57-NQ/TW về khoa học công nghệ, đổi mới sáng tạo'
            },
            {
                ma: '2.2',
                tenMuc: 'Tham gia hội thi học thuật sáng tạo: Tuổi trẻ sáng tạo, Ý tưởng sáng tạo, giải thưởng Eureka 2025'
            },
            {
                ma: '2.4',
                tenMuc: 'Tuyên truyền chủ quyền biển đảo, biên giới. Hưởng ứng Ngày Chủ nhật xanh'
            },
            {
                ma: '2.5',
                tenMuc: 'Tổ chức hoạt động phòng chống HIV/AIDS, văn hóa giao thông, bảo vệ an ninh Tổ quốc'
            },
            {
                ma: '2.6',
                tenMuc: 'Tổ chức các hoạt động tình nguyện trong năm học'
            }
        ]
    },
    {
        ma: 'C',
        ten: 'Chương trình đồng hành với thanh niên',
        mucCons: [
            {
                ma: '3.1',
                tenMuc: 'Tham gia hoặc tổ chức hội thi, sân chơi học thuật hoặc học thuật chuyên ngành'
            },
            {
                ma: '3.2',
                tenMuc: 'Hoạt động nâng cao năng lực số, hưởng ứng "Bình dân học vụ số"'
            },
            {
                ma: '3.3',
                tenMuc: 'Huy động đoàn viên tham gia Ngày hội Sinh viên với Doanh nghiệp, hướng nghiệp'
            },
            {
                ma: '3.4',
                tenMuc: 'Tham gia hội thi, hội thao, văn hóa văn nghệ, nâng cao ngoại ngữ, kỹ năng mềm'
            }
        ]
    },
    {
        ma: 'D',
        ten: 'Xây dựng Đoàn, đoàn kết tập hợp thanh niên, tham gia xây dựng Đảng',
        mucCons: [
            {
                ma: '4.1',
                tenMuc: 'Tham gia chương trình tập huấn chuyên đề cấp trường'
            },
            {
                ma: '4.2',
                tenMuc: 'Tham gia tập huấn theo đặc thù, nhu cầu do Đoàn cơ sở tổ chức'
            },
            {
                ma: '4.3',
                tenMuc: 'Làm tốt công tác chuẩn bị, tổ chức Đại hội chi Đoàn thành công và đúng tiến độ'
            },
            {
                ma: '4.4',
                tenMuc: 'Tham gia Hội thi Đi tìm thủ lĩnh, Hành trình Bản lĩnh xanh'
            },
            {
                ma: '4.5',
                tenMuc: 'Giải pháp thực hiện hiệu quả việc xây dựng Phong cách cán bộ Đoàn'
            },
            {
                ma: '4.6',
                tenMuc: '100% đoàn viên được đánh giá xếp loại đúng tiến độ, 80% đoàn viên hoàn thành xuất sắc nhiệm vụ'
            },
            {
                ma: '4.7',
                tenMuc: 'Công tác phát triển Đoàn viên mới'
            },
            {
                ma: '4.8',
                tenMuc: 'Huy động Đoàn viên tham gia lớp chuyên đề lý luận chính trị'
            },
            {
                ma: '4.9',
                tenMuc: 'Cập nhật đầy đủ thông tin cán bộ Đoàn trên ứng dụng quản lý đoàn viên và đoàn vụ'
            },
            {
                ma: '4.10',
                tenMuc: 'Tham gia đầy đủ các buổi giao ban định kỳ'
            },
            {
                ma: '4.11',
                tenMuc: 'Tham gia các buổi giao lưu, gặp gỡ cán bộ Đoàn - Hội các cấp'
            },
            {
                ma: '4.12',
                tenMuc: 'Chi Đoàn được công nhận là chi Đoàn "3 nắm - 3 biết - 3 làm"'
            },
            {
                ma: '4.13',
                tenMuc: 'Phối hợp tích cực trong các đợt kiểm tra định kỳ, kiểm tra đột xuất'
            },
            {
                ma: '4.14',
                tenMuc: 'Trích nộp đoàn phí đúng quy định'
            },
            {
                ma: '4.15',
                tenMuc: 'Thực hiện công tác báo cáo tổng kết năm học đúng tiến độ'
            },
            {
                ma: '4.16',
                tenMuc: 'Đảm bảo công tác cập nhật danh sách sinh viên tham gia hoạt động đúng tiến độ'
            },
            {
                ma: '4.17',
                tenMuc: 'Thực hiện công tác thi đua, khen thưởng'
            },
            {
                ma: '4.18',
                tenMuc: 'Thành lập hoặc duy trì trang thông tin điện tử của chi Đoàn - Hội'
            },
            {
                ma: '4.19',
                tenMuc: 'Tỷ lệ tập hợp thanh niên'
            },
            {
                ma: '4.20',
                tenMuc: 'Vai trò nồng cốt với Chi Hội'
            },
            {
                ma: '4.21',
                tenMuc: 'Thực hiện đúng và đầy đủ nghiệp vụ giới thiệu Đoàn viên ưu tú'
            },
            {
                ma: '4.22',
                tenMuc: 'Huy động đoàn viên tham gia khảo sát xã hội học về nguyện vọng kết nạp Đảng'
            },
            {
                ma: '4.23',
                tenMuc: 'Huy động đoàn viên tham gia gặp gỡ chi bộ sinh viên, tìm hiểu hành trình phát triển Đảng'
            },
            {
                ma: '4.24',
                tenMuc: 'Thực hiện nghiêm túc việc đánh giá cán bộ Đoàn tại chi Đoàn'
            }
        ]
    },
    {
        ma: 'E',
        ten: 'Công tác tham mưu, phối hợp, chỉ đạo & thực hiện Công trình thanh niên',
        mucCons: [
            {
                ma: '5.1',
                tenMuc: 'Công tác triển khai thực hiện chủ đề năm theo hướng dẫn của Đoàn cơ sở'
            },
            {
                ma: '5.3',
                tenMuc: 'Tham gia tốt các hoạt động do Đoàn cơ sở phân công, đăng cai'
            },
            {
                ma: '5.4',
                tenMuc: 'Thực hiện tốt việc huy động lực lượng tham gia các hoạt động Đoàn cấp trên'
            },
            {
                ma: '5.5',
                tenMuc: 'Thường xuyên theo dõi và hỗ trợ hoạt động của chi đoàn'
            },
            {
                ma: '5.6',
                tenMuc: 'Hoàn thành chỉ tiêu năm học, tham gia tốt chỉ tiêu cấp cơ sở'
            },
            {
                ma: '5.7',
                tenMuc: 'Thực hiện tốt, hiệu quả công trình thanh niên chi đoàn'
            }
        ]
    },
    {
        ma: 'F',
        ten: 'Điểm sáng tạo',
        mucCons: [
            {
                ma: '6.1',
                tenMuc: 'Mô hình hiệu quả cấp Chi đoàn'
            },
            {
                ma: '6.2',
                tenMuc: 'Giải pháp hiệu quả cấp Chi đoàn'
            }
        ]
    },
    {
        ma: 'G',
        ten: 'Điểm chủ động',
        mucCons: [
            {
                ma: '7.1',
                tenMuc: 'Hoạt động chủ động'
            }
        ]
    },
    {
        ma: 'H',
        ten: 'Điểm thưởng, điểm trừ',
        mucCons: [
            {
                ma: '8.1',
                tenMuc: 'Đơn vị có giải cao trong các cuộc thi do TW Đoàn/Thành Đoàn/Đoàn trường phát động'
            },
            {
                ma: '8.2',
                tenMuc: 'Có công trình thanh niên được Ban Thường vụ Đoàn trường công nhận'
            },
            {
                ma: '8.3',
                tenMuc: 'Có gương điển hình đạt danh hiệu, giải thưởng cấp Thành Đoàn, TW'
            }
        ]
    }
];

// Helper function để lấy tên hạng mục từ mã
export function getHangMucByMa(ma: string): HangMuc | undefined {
    return HANG_MUCS.find(hm => hm.ma === ma);
}

// Helper function để lấy mục con từ hạng mục và mã mục
export function getMucConByMa(hangMuc: string, maMuc: string): MucCon | undefined {
    const hm = getHangMucByMa(hangMuc);
    return hm?.mucCons.find(mc => mc.ma === maMuc);
}

// Helper function để format tên hiển thị
export function formatTenMuc(hangMuc: string, maMuc: string): string {
    const mc = getMucConByMa(hangMuc, maMuc);
    if (!mc) return '';
    return `${maMuc}. ${mc.tenMuc}`;
}
