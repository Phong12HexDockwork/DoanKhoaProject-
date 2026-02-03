import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });
}

export function formatDateTime(date: Date | string): string {
    return new Date(date).toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export const TRANG_THAI_DUYET = {
    CHO_DUYET: { label: 'Chờ duyệt', color: 'bg-yellow-100 text-yellow-800' },
    DA_DUYET: { label: 'Đã duyệt', color: 'bg-green-100 text-green-800' },
    TU_CHOI: { label: 'Từ chối', color: 'bg-red-100 text-red-800' },
    YEU_CAU_SUA: { label: 'Yêu cầu sửa', color: 'bg-orange-100 text-orange-800' },
} as const;

export const VAI_TRO = {
    DOAN_KHOA: 'DOAN_KHOA',
    CHI_DOAN: 'CHI_DOAN',
} as const;
