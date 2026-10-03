"use client";

import { useTheme } from "./ThemeProvider";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggle } = useTheme();
  return (
    <button
      type="button"
      aria-label="Basculer le thème"
      onClick={toggle}
      className={`btn btn-secondary !py-2 !px-4 !text-sm ${className}`}
    >
      <span className="text-lg leading-none">{theme === "light" ? "🌙" : "☀️"}</span>
      <span>{theme === "light" ? "Dark" : "Light"}</span>
    </button>
  );
}
