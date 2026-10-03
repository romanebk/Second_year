import { CalendarDays, LayoutDashboard, Send, Settings } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  /** match nested routes for active state */
  match?: (pathname: string) => boolean;
};

export const NAV_ITEMS: NavItem[] = [
  {
    href: "/dashboard",
    label: "Tableau de bord",
    icon: LayoutDashboard,
    match: (p) => p === "/dashboard",
  },
  {
    href: "/posts",
    label: "Publications",
    icon: Send,
    match: (p) => p === "/posts" || p.startsWith("/posts/") && !p.startsWith("/posts/calendar"),
  },
  {
    href: "/posts/calendar",
    label: "Calendrier",
    icon: CalendarDays,
    match: (p) => p.startsWith("/posts/calendar"),
  },
  {
    href: "/settings",
    label: "Paramètres",
    icon: Settings,
    match: (p) => p.startsWith("/settings"),
  },
];
