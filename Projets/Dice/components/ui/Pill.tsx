import type { ReactNode } from "react";

export function Pill({
  children,
  dot = false,
  className = "",
}: {
  children: ReactNode;
  dot?: boolean;
  className?: string;
}) {
  return (
    <span className={`pill ${className}`}>
      {dot && <span className="pill-dot" />}
      {children}
    </span>
  );
}
