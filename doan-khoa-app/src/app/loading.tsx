import Image from "next/image";

export default function Loading() {
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white">
            <div className="flex flex-col items-center gap-6">
                <div className="relative w-20 h-20">
                    <Image
                        src="/favicon.png"
                        alt="Logo"
                        fill
                        className="object-contain"
                        priority
                    />
                </div>
                <div className="h-8 w-8 border-4 border-gray-200 border-t-[#0054A6] rounded-full animate-spin"></div>
            </div>
        </div>
    );
}
