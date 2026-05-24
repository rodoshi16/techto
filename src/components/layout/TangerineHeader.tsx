import { Bell, ChevronLeft } from "lucide-react";
import { USER_NAME } from "../../data/mockData";
import { OrangeIcon } from "../icons/OrangeIcon";

interface TangerineHeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  light?: boolean;
}

export function TangerineLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center">
        <OrangeIcon className="w-4 h-4 text-tangerine" />
      </div>
      <span className="font-semibold text-lg tracking-tight">Tangerine</span>
    </div>
  );
}

export function TangerineHeader({
  title,
  showBack,
  onBack,
  light = false,
}: TangerineHeaderProps) {
  return (
    <header
      className={`shrink-0 px-4 pt-12 pb-4 ${light ? "bg-tangerine text-white" : "bg-white"}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          {showBack && (
            <button
              type="button"
              onClick={onBack}
              className={`p-1 -ml-1 rounded-full ${light ? "text-white" : "text-tangerine"}`}
            >
              <ChevronLeft size={24} />
            </button>
          )}
          {title ? (
            <h1 className={`text-lg font-semibold truncate ${light ? "text-white" : "text-gray-900"}`}>
              {title}
            </h1>
          ) : light ? (
            <div>
              <TangerineLogo className="text-white [&_div]:bg-white/20 [&_span]:text-white [&_.text-tangerine]:text-white" />
              <p className="text-sm text-white/80 mt-2">Good afternoon, {USER_NAME}</p>
            </div>
          ) : (
            <div>
              <p className="text-sm text-gray-500">Good afternoon,</p>
              <p className="text-xl font-semibold text-gray-900">{USER_NAME}</p>
            </div>
          )}
        </div>
        <button
          type="button"
          className={`p-2 rounded-full ${light ? "text-white/90" : "text-gray-600"}`}
          aria-label="Notifications"
        >
          <Bell size={22} />
        </button>
      </div>
    </header>
  );
}
