import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

type Props = {
  src?: string | null;
  name?: string | null;
  fallback: string;
  size?: number;
  className?: string;
};

export function Avatar({ src, name, fallback, size = 40, className }: Props) {
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-primary font-semibold uppercase",
        className,
      )}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
      aria-hidden={!name}
    >
      {src ? (
        <Image
          src={src}
          alt={name ?? ""}
          fill
          sizes={`${size}px`}
          className="object-cover"
        />
      ) : (
        <span>{fallback}</span>
      )}
    </span>
  );
}
