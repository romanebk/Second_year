import Link from "next/link";
import { redirect } from "next/navigation";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { fr } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

import { getCurrentUserId } from "@/lib/auth";
import { getPostsInRange } from "@/lib/queries";
import { PageHeader } from "@/components/page-header";
import { PostsViewSwitch } from "@/components/posts-view-switch";
import { PlatformIcon } from "@/components/platform-icon";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { POST_STATUS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export const metadata = { title: "Calendrier" };
export const dynamic = "force-dynamic";

const WEEKDAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

function parseMonth(value?: string): Date {
  if (value && /^\d{4}-\d{2}$/.test(value)) {
    const [y, m] = value.split("-").map(Number);
    return new Date(y, m - 1, 1);
  }
  return startOfMonth(new Date());
}

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: { month?: string };
}) {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");

  const base = parseMonth(searchParams.month);
  const gridStart = startOfWeek(startOfMonth(base), { weekStartsOn: 1 });
  const gridEnd = endOfWeek(endOfMonth(base), { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const posts = await getPostsInRange(userId, gridStart, gridEnd);

  const byDay = new Map<string, typeof posts>();
  for (const post of posts) {
    if (!post.scheduledAt) continue;
    const key = format(post.scheduledAt, "yyyy-MM-dd");
    const list = byDay.get(key) ?? [];
    list.push(post);
    byDay.set(key, list);
  }

  const prev = format(subMonths(base, 1), "yyyy-MM");
  const next = format(addMonths(base, 1), "yyyy-MM");
  const monthLabel = format(base, "MMMM yyyy", { locale: fr });

  return (
    <div>
      <PageHeader
        title="Calendrier"
        description="Visualise tes publications programmées mois par mois."
        action={
          <Link href="/posts/new">
            <Button>
              <Plus className="h-4 w-4" />
              Nouveau post
            </Button>
          </Link>
        }
      />

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Link href={`/posts/calendar?month=${prev}`}>
            <Button variant="outline" size="icon" aria-label="Mois précédent">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h2 className="min-w-[160px] text-center font-heading text-lg font-semibold capitalize">
            {monthLabel}
          </h2>
          <Link href={`/posts/calendar?month=${next}`}>
            <Button variant="outline" size="icon" aria-label="Mois suivant">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/posts/calendar" className="ml-1">
            <Button variant="ghost" size="sm">
              Aujourd’hui
            </Button>
          </Link>
        </div>
        <PostsViewSwitch />
      </div>

      <Card className="overflow-hidden p-0">
        <div className="grid grid-cols-7 border-b border-border bg-muted/40">
          {WEEKDAYS.map((d) => (
            <div
              key={d}
              className="px-2 py-2.5 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground"
            >
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {days.map((day) => {
            const key = format(day, "yyyy-MM-dd");
            const dayPosts = byDay.get(key) ?? [];
            const outside = !isSameMonth(day, base);
            const today = isToday(day);

            return (
              <div
                key={key}
                className={cn(
                  "min-h-[104px] border-b border-r border-border p-1.5 last:border-r-0 [&:nth-child(7n)]:border-r-0",
                  outside && "bg-muted/30",
                )}
              >
                <div className="mb-1 flex justify-end">
                  <span
                    className={cn(
                      "flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium",
                      today
                        ? "bg-primary text-primary-foreground"
                        : outside
                          ? "text-muted-foreground/60"
                          : "text-muted-foreground",
                    )}
                  >
                    {format(day, "d")}
                  </span>
                </div>

                <div className="space-y-1">
                  {dayPosts.slice(0, 3).map((post) => (
                    <Link
                      key={post.id}
                      href={`/posts/${post.id}`}
                      className="block rounded-md border border-border bg-card px-1.5 py-1 text-[11px] leading-tight transition-colors hover:bg-muted"
                    >
                      <div className="flex items-center gap-1">
                        <span
                          className={cn(
                            "h-1.5 w-1.5 shrink-0 rounded-full",
                            post.status === "PUBLISHED" && "bg-success",
                            post.status === "SCHEDULED" && "bg-accent",
                            post.status === "FAILED" && "bg-destructive",
                            (post.status === "DRAFT" ||
                              post.status === "PUBLISHING") &&
                              "bg-muted-foreground",
                          )}
                          title={POST_STATUS[post.status].label}
                        />
                        <span className="font-medium tabular-nums text-muted-foreground">
                          {format(post.scheduledAt!, "HH:mm")}
                        </span>
                        <span className="ml-auto flex items-center gap-0.5">
                          {post.targets.slice(0, 3).map((t) => (
                            <PlatformIcon
                              key={t.id}
                              platform={t.platform}
                              className="h-3 w-3"
                            />
                          ))}
                        </span>
                      </div>
                      <p className="mt-0.5 line-clamp-1 text-foreground/80">
                        {post.content || "Sans texte"}
                      </p>
                    </Link>
                  ))}
                  {dayPosts.length > 3 && (
                    <p className="px-1 text-[11px] text-muted-foreground">
                      +{dayPosts.length - 3} de plus
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
