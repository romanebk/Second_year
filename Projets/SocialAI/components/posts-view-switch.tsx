"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, List } from "lucide-react";
import { cn } from "@/lib/utils";

export function PostsViewSwitch() {
  const pathname = usePathname();
  const isCalendar = pathname.startsWith("/posts/calendar");

  const items = [
    { href: "/posts", label: "Liste", icon: List, active: !isCalendar },
    {
      href: "/posts/calendar",
      label: "Calendrier",
      icon: CalendarDays,
      active: isCalendar,
    },
  ];

  return (
    <div className="inline-flex rounded-lg border border-border bg-card p-1">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              item.active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
