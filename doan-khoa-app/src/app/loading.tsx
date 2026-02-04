import Image from "next/image";

export default function Loading() {
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white">
            <div className="relative flex flex-col items-center">
                {/* Logo Pulse Effect */}
                <div className="relative mb-8">
                    <div className="absolute inset-0 bg-blue-400/20 rounded-full animate-ping blur-xl"></div>
                    <div className="relative bg-white p-4 rounded-full shadow-xl border border-blue-100 animate-pulse">
                        <Image
                            src="/favicon.png"
                            alt="Logo Loader"
                            width={80}
                            height={80}
                            className="object-contain"
                            priority
                        />
                    </div>
                </div>

                {/* Spinner & Text */}
                <div className="flex flex-col items-center gap-3">
                    <div className="h-10 w-10 border-4 border-[#0054A6]/30 border-t-[#0054A6] rounded-full animate-spin"></div>
                    <p className="text-[#0054A6] font-medium text-sm animate-pulse tracking-wide">Đang tải dữ liệu...</p>
                </div>
            </div>
        </div>
    );
}
