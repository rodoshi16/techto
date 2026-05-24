import { OrangeIcon } from "./OrangeIcon";

/** Tangi avatar — white orange on brand orange circle */
export function TangiIcon({
  size = 40,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  const iconSize = Math.round(size * 0.52);
  return (
    <div
      className={`rounded-full bg-tangerine flex items-center justify-center shrink-0 shadow-sm ${className}`}
      style={{ width: size, height: size }}
    >
      <OrangeIcon className="w-full h-full text-white" style={{ width: iconSize, height: iconSize }} />
    </div>
  );
}
