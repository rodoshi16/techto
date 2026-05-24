import type { ReactNode } from "react";

export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-full flex items-center justify-center p-4 md:p-8">
      <div className="relative w-full max-w-[390px] h-[844px] max-h-[90vh] bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border-[8px] border-gray-900 flex flex-col">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[28px] bg-gray-900 rounded-b-2xl z-50" />
        {children}
      </div>
    </div>
  );
}
