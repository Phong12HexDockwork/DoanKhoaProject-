'use client';

import { useState, useEffect } from 'react';
import { HANG_MUCS, type HangMuc } from '@/lib/activityCategories';

interface ActivityCategorySelectorProps {
    hangMuc: string;
    maMuc: string;
    onChange: (hangMuc: string, maMuc: string) => void;
    required?: boolean;
}

export default function ActivityCategorySelector({
    hangMuc,
    maMuc,
    onChange,
    required = false,
}: ActivityCategorySelectorProps) {
    const [selectedHangMuc, setSelectedHangMuc] = useState<HangMuc | null>(null);
    const [isExpanded, setIsExpanded] = useState(true);

    useEffect(() => {
        if (hangMuc) {
            const hm = HANG_MUCS.find(h => h.ma === hangMuc);
            setSelectedHangMuc(hm || null);
        } else {
            setSelectedHangMuc(null);
        }
    }, [hangMuc]);

    // Auto expand when hangMuc changes (new selection)
    useEffect(() => {
        if (hangMuc && !maMuc) {
            setIsExpanded(true);
        }
    }, [hangMuc, maMuc]);

    const handleHangMucChange = (ma: string) => {
        if (ma === '') {
            setSelectedHangMuc(null);
            onChange('', '');
            setIsExpanded(true);
        } else {
            const hm = HANG_MUCS.find(h => h.ma === ma);
            setSelectedHangMuc(hm || null);
            onChange(ma, '');
            setIsExpanded(true); // Expand when selecting new category
        }
    };

    const handleMucConChange = (maMucCon: string) => {
        onChange(hangMuc, maMucCon);
        setIsExpanded(false); // Auto collapse after selection
    };

    // Get selected muc con info
    const selectedMucCon = selectedHangMuc?.mucCons.find(mc => mc.ma === maMuc);

    return (
        <div className="space-y-4">
            {/* Dropdown chọn Hạng mục A-H */}
            <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                    Hạng mục hoạt động {required && <span className="text-red-500">*</span>}
                </label>
                <select
                    value={hangMuc}
                    onChange={(e) => handleHangMucChange(e.target.value)}
                    required={required}
                    className="block w-full rounded-xl border border-gray-400 px-4 py-2.5 text-gray-900 shadow-sm focus:border-emerald-600 focus:ring-emerald-600"
                >
                    <option value="">-- Chọn hạng mục --</option>
                    {HANG_MUCS.map((hm) => (
                        <option key={hm.ma} value={hm.ma}>
                            {hm.ma}. {hm.ten}
                        </option>
                    ))}
                </select>
            </div>

            {/* Hiển thị mục đã chọn - có thể click để mở lại */}
            {hangMuc && maMuc && selectedMucCon && !isExpanded && (
                <div
                    className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center justify-between cursor-pointer hover:bg-green-100 transition-colors"
                    onClick={() => setIsExpanded(true)}
                >
                    <div className="flex items-center gap-2">
                        <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <div>
                            <span className="text-sm text-green-800">
                                <strong>{maMuc}</strong> - {selectedMucCon.tenMuc.slice(0, 80)}...
                            </span>
                        </div>
                    </div>
                    <span className="text-xs text-green-600 hover:text-green-800">Thay đổi ▼</span>
                </div>
            )}

            {/* Bảng các mục con khi đã chọn hạng mục và đang mở */}
            {selectedHangMuc && isExpanded && (
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <div className="bg-emerald-600 text-white px-4 py-3 flex justify-between items-center">
                        <div>
                            <h4 className="font-medium">{selectedHangMuc.ma}. {selectedHangMuc.ten}</h4>
                        </div>
                        {maMuc && (
                            <button
                                type="button"
                                onClick={() => setIsExpanded(false)}
                                className="text-white/80 hover:text-white text-sm"
                            >
                                Thu gọn ▲
                            </button>
                        )}
                    </div>
                    <div className="max-h-[300px] overflow-y-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 sticky top-0">
                                <tr>
                                    <th className="w-10 px-3 py-2"></th>
                                    <th className="w-16 px-3 py-2 text-left font-medium text-gray-700">Mã</th>
                                    <th className="px-3 py-2 text-left font-medium text-gray-700">Nội dung</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {selectedHangMuc.mucCons.map((mc) => (
                                    <tr
                                        key={mc.ma}
                                        className={`hover:bg-emerald-50 cursor-pointer transition-colors ${maMuc === mc.ma ? 'bg-emerald-100' : ''}`}
                                        onClick={() => handleMucConChange(mc.ma)}
                                    >
                                        <td className="px-3 py-3 text-center">
                                            <input
                                                type="radio"
                                                name="mucCon"
                                                value={mc.ma}
                                                checked={maMuc === mc.ma}
                                                onChange={() => handleMucConChange(mc.ma)}
                                                className="h-4 w-4 text-emerald-600 focus:ring-emerald-600 border-gray-300"
                                            />
                                        </td>
                                        <td className="px-3 py-3 font-medium text-emerald-600">{mc.ma}</td>
                                        <td className="px-3 py-3">
                                            <p className="text-gray-900 line-clamp-2">{mc.tenMuc}</p>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

