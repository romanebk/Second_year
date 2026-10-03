import type { PostStatus } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { POST_STATUS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function StatusBadge({
  status,
  className,
}: {
  status: PostStatus;
  className?: string;
}) {
  const meta = POST_STATUS[status];
  return (
    <Badge className={cn(meta.className, className)}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      {meta.label}
    </Badge>
  );
}
