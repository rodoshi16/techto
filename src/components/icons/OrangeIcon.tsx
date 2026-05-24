import type { CSSProperties } from "react";

/** Simple tangerine / orange fruit icon */
export function OrangeIcon({
  className = "w-5 h-5",
  style,
  variant = "filled",
}: {
  className?: string;
  style?: CSSProperties;
  variant?: "filled" | "outline";
}) {
  if (variant === "outline") {
    return (
      <svg className={className} style={style} viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="12" cy="13" r="7.5" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M12 5.5c0-1.5 1-2.5 2.5-2.5.5 0 1 .2 1.3.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path d="M12 8v1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
        <ellipse cx="10" cy="12" rx="1" ry="1.5" fill="currentColor" opacity="0.25" />
      </svg>
    );
  }

  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="13" r="8" fill="currentColor" />
      <path
        d="M12 4.5c.8-1.8 2.8-2.2 4-1.2 1 .8 1.2 2.2.5 3.2-.4.6-1 .9-1.6 1"
        fill="currentColor"
        opacity="0.85"
      />
      <ellipse cx="9.5" cy="11.5" rx="1.2" ry="2" fill="white" opacity="0.2" />
      <path
        d="M14 10.5c.8-.3 1.5.2 1.5 1"
        stroke="white"
        strokeWidth="0.8"
        strokeLinecap="round"
        opacity="0.35"
      />
    </svg>
  );
}
