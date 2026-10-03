import * as React from "react"
import Link from "next/link"
import { Button, type ButtonProps } from "@/components/ui/button"

export interface CtaProps extends ButtonProps {
  ctaEnabled?: boolean
  text: string
  link?: string
}

export function Cta({ cta }: { cta: CtaProps }) {
  const { ctaEnabled, text, link, ...props } = cta

  if (!ctaEnabled) return null

  if (link) {
    return (
      <Button asChild {...props}>
        <Link href={link}>{text}</Link>
      </Button>
    )
  }

  return <Button {...props}>{text}</Button>
}
