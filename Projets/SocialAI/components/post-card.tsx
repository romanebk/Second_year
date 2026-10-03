import Link from "next/link";
import Image from "next/image";
import { CalendarClock, FileText, ImageIcon, Video } from "lucide-react";

import type { PostWithRelations } from "@/lib/queries";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { PlatformIcon } from "@/components/platform-icon";
import { PostActions } from "@/components/post-actions";
import { PLATFORMS } from "@/lib/constants";
import { formatDateTime } from "@/lib/utils";

export function PostCard({ post }: { post: PostWithRelations }) {
  const cover = post.media[0];
  const platforms = post.targets.map((t) => t.platform);

  return (
    <Card className="group flex gap-4 p-4 transition-shadow hover:shadow-card">
      {/* Media / placeholder */}
      <Link
        href={`/posts/${post.id}`}
        className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-muted"
      >
        {cover ? (
          cover.type === "video" ? (
            <>
              <video
                src={cover.url}
                className="h-full w-full object-cover"
                muted
                playsInline
              />
              <span className="absolute inset-0 flex items-center justify-center bg-foreground/20 text-white">
                <Video className="h-6 w-6" />
              </span>
            </>
          ) : (
            <Image
              src={cover.url}
              alt=""
              fill
              sizes="80px"
              className="object-cover"
            />
          )
        ) : (
          <span className="flex h-full w-full items-center justify-center text-muted-foreground">
            {post.content ? (
              <FileText className="h-6 w-6" />
            ) : (
              <ImageIcon className="h-6 w-6" />
            )}
          </span>
        )}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={post.status} />
            <div className="flex items-center gap-1">
              {platforms.map((p) => (
                <span
                  key={p}
                  title={PLATFORMS[p].label}
                  className="text-muted-foreground"
                >
                  <PlatformIcon platform={p} className="h-4 w-4" />
                </span>
              ))}
            </div>
          </div>
          <PostActions postId={post.id} status={post.status} />
        </div>

        <Link href={`/posts/${post.id}`} className="mt-2 min-w-0">
          <p className="line-clamp-2 text-sm text-foreground/90">
            {post.content || (
              <span className="italic text-muted-foreground">Sans texte</span>
            )}
          </p>
        </Link>

        <div className="mt-auto pt-2 text-xs text-muted-foreground">
          {post.scheduledAt ? (
            <span className="inline-flex items-center gap-1.5">
              <CalendarClock className="h-3.5 w-3.5" />
              {post.status === "PUBLISHED" && post.publishedAt
                ? `Publié le ${formatDateTime(post.publishedAt)}`
                : `Programmé pour le ${formatDateTime(post.scheduledAt)}`}
            </span>
          ) : (
            <span>Brouillon · modifié le {formatDateTime(post.updatedAt)}</span>
          )}
        </div>
      </div>
    </Card>
  );
}
