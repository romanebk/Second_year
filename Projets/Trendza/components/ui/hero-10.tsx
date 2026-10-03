'use client'

import * as React from 'react'
import Image from 'next/image'
import { motion, useReducedMotion, type Variants } from 'motion/react'
import Balancer from 'react-wrap-balancer'

import { cn } from '@/lib/utils'
import { AnimatedGradientBackground } from '@/components/shared/animated-gradient-background'

import { Cta, type CtaProps } from '@/components/ui/hero-10-utils/cta'
import { Trophy, Globe, LineChart, Clock } from '@/components/shared/icons'

export interface Hero10Props {
  title: string
  titleLine2Prefix?: string
  titleHighlight?: string
  description: string
  badge?: string
  socialProof?: string
  images: string[]
  imageAlts?: string[]
  animation?: 'none' | 'subtle'
  primaryCTA: CtaProps
  secondaryCTA?: CtaProps
  variant?: 'standard' | 'compact'
}

const variantStyles = {
  standard: {
    section: 'pt-20 pb-16 sm:pt-32 sm:pb-20 lg:pt-36 lg:pb-24',
    title: 'text-4xl sm:text-5xl md:text-6xl lg:text-[3.5rem] xl:text-[4rem] leading-[1.08]',
    description: 'text-base sm:text-lg md:text-xl mt-5 lg:pr-16 xl:pr-24 2xl:pr-32',
    header: 'gap-6 lg:gap-8',
    content: 'gap-10 lg:gap-16 xl:gap-24',
    fan: 'w-full',
    fanCard: 'aspect-[4/5]',
  },
  compact: {
    section: 'py-14 sm:py-20',
    title: 'text-3xl sm:text-4xl md:text-5xl',
    description: 'text-sm md:text-base lg:text-lg mt-2',
    header: 'gap-6',
    content: 'gap-8 lg:gap-12',
    fan: 'w-full',
    fanCard: 'aspect-[4/5]',
  },
} as const

const fanSlots = [
  { width: 'w-[44%]', layout: '-mr-10 md:-mr-12 z-10', rotate: -8, x: 60, ty: 32 },
  { width: 'w-[52%]', layout: 'z-20', rotate: 0, x: 0, ty: -12 },
  { width: 'w-[44%]', layout: '-ml-10 md:-ml-12 z-10', rotate: 8, x: -60, ty: 32 },
]

const STATS = [
  { icon: Trophy, value: '500+', label: 'Produits gagnants' },
  { icon: Globe, value: '30+', label: 'Pays analysés' },
  { icon: LineChart, value: '98%', label: 'Précision tendances' },
  { icon: Clock, value: '24/7', label: 'Données en temps réel' },
]

const fanContainer: Variants = {
  hidden: { opacity: 0, y: 12, filter: 'blur(6px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
      delay: 0.4,
      delayChildren: 0.5,
      staggerChildren: 0.1,
    },
  },
}

const fanCard: Variants = {
  hidden: (slot: (typeof fanSlots)[number]) => ({
    x: slot.x,
    rotate: slot.rotate,
    y: slot.ty,
  }),
  visible: (slot: (typeof fanSlots)[number]) => ({
    x: 0,
    rotate: slot.rotate,
    y: slot.ty,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
}

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
}

const item: Variants = {
  hidden: { opacity: 0, y: 12, filter: 'blur(6px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
}

function Reveal({
  active,
  variants,
  className,
  children,
}: Readonly<{
  active: boolean
  variants?: Variants
  className?: string
  children: React.ReactNode
}>) {
  if (!active) return <div className={className}>{children}</div>

  return (
    <motion.div variants={variants ?? item} className={className}>
      {children}
    </motion.div>
  )
}

function ImageFan({
  images,
  imageAlts,
  cardAspect,
  animate,
}: Readonly<{
  images: string[]
  imageAlts?: string[]
  cardAspect: string
  animate: boolean
}>) {
  return (
    <motion.div
      className="relative flex w-full items-center justify-center"
      variants={fanContainer}
      initial={animate ? 'hidden' : false}
      whileInView={animate ? 'visible' : undefined}
      animate={animate ? undefined : 'visible'}
      viewport={{ once: true, margin: '-80px' }}
    >
      {images.slice(0, 3).map((src, i) => {
        const slot = fanSlots[i] ?? fanSlots[1]
        return (
          <motion.div
            key={src}
            custom={slot}
            variants={fanCard}
            whileHover={animate ? { y: slot.ty - 6, transition: { duration: 0.25 } } : undefined}
            className={cn(
              'relative shrink-0 overflow-hidden rounded-2xl shadow-2xl shadow-primary/15 ring-1 ring-border',
              cardAspect,
              slot.width,
              slot.layout,
            )}
          >
            <Image
              src={src}
              alt={imageAlts?.[i] ?? ''}
              fill
              sizes="(max-width: 768px) 33vw, 280px"
              className="object-cover"
              priority={i === 1}
            />
          </motion.div>
        )
      })}
    </motion.div>
  )
}

export function Hero10({
  title,
  titleLine2Prefix,
  titleHighlight,
  description,
  badge,
  socialProof,
  images,
  imageAlts,
  animation = 'none',
  primaryCTA,
  secondaryCTA,
  variant = 'standard',
}: Readonly<Hero10Props>) {
  const reduce = useReducedMotion()
  const animate = animation === 'subtle' && !reduce
  const vs = variantStyles[variant]

  const titleElement = title && (
    <h1
      className={cn(
        'font-heading font-bold tracking-tight text-balance text-center lg:text-left',
        vs.title,
      )}
    >
      <Balancer>{title}</Balancer>
      {(titleLine2Prefix || titleHighlight) && (
        <>
          <br />
          <Balancer>
            {titleLine2Prefix && (
              <span className="font-sans font-normal">{titleLine2Prefix} </span>
            )}
            {titleHighlight && (
              <span className="text-gradient">{titleHighlight}</span>
            )}
          </Balancer>
        </>
      )}
    </h1>
  )

  const descriptionElement = description && (
    <p className={cn('font-sans text-muted-foreground text-center lg:text-left leading-relaxed', vs.description)}>
      <Balancer>{description}</Balancer>
    </p>
  )

  const ctasElement = (primaryCTA?.ctaEnabled || secondaryCTA?.ctaEnabled) && (
    <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
      {primaryCTA?.ctaEnabled && <Cta cta={primaryCTA} />}
      {secondaryCTA?.ctaEnabled && (
        <Cta
          cta={{ ...secondaryCTA, variant: secondaryCTA.variant ?? 'outline' }}
        />
      )}
    </div>
  )

  const socialProofElement = socialProof && (
    <p className="font-sans text-sm text-muted-foreground text-center lg:text-left">{socialProof}</p>
  )

  const mediaElement = images?.length ? (
    <ImageFan
      images={images}
      imageAlts={imageAlts}
      cardAspect={vs.fanCard}
      animate={animate}
    />
  ) : null

  return (
    <section className="relative isolate w-full overflow-hidden">
      <AnimatedGradientBackground />
      <div className="bg-dot pointer-events-none absolute inset-0 opacity-40 mask-[radial-gradient(ellipse_80%_60%_at_50%_0%,black,transparent)]" />

      <motion.div
        className={cn(
          'relative z-10 w-full flex flex-col section-inset',
          vs.section,
        )}
        variants={animate ? container : undefined}
        initial={animate ? 'hidden' : false}
        whileInView={animate ? 'visible' : undefined}
        viewport={{ once: true, margin: '-80px' }}
      >
        <div className={cn('grid grid-cols-1 lg:grid-cols-2 items-center', vs.content)}>
          <div className="flex flex-col gap-8 items-center lg:items-start">
            <Reveal
              active={animate}
              className={cn(
                'flex w-full flex-col items-center lg:items-start',
                vs.header,
              )}
            >
              {badge && (
                <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary-muted px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
                  {badge}
                </span>
              )}
              {titleElement}
              {descriptionElement}
            </Reveal>

            <Reveal active={animate} className="flex flex-col items-center lg:items-start gap-4">
              {ctasElement}
              {socialProofElement}
            </Reveal>
          </div>

          <div className={cn('mx-auto w-full', vs.fan)}>{mediaElement}</div>
        </div>

        <Reveal
          active={animate}
          className="mt-16 pt-10 border-t border-border grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8"
        >
          {STATS.map(({ icon: Icon, value, label }) => (
            <div
              key={label}
              className="group flex flex-col items-center justify-center rounded-2xl border border-transparent p-4 text-center transition-all duration-300 hover:border-border hover:bg-surface/60"
            >
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary-muted text-primary transition-transform duration-300 group-hover:scale-110">
                <Icon className="h-5 w-5" />
              </div>
              <p className="text-2xl font-bold text-gradient sm:text-3xl">{value}</p>
              <p className="text-xs text-muted-foreground mt-1.5 sm:text-sm">{label}</p>
            </div>
          ))}
        </Reveal>
      </motion.div>
    </section>
  )
}

export default Hero10
