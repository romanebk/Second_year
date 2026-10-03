import { Hero10, type Hero10Props } from '@/components/ui/hero-10'

const values = {
  title: 'Trouvez votre produit',
  titleLine2Prefix: 'phare du',
  titleHighlight: 'moment',
  description:
    'Le bon produit, le bon pays, la bonne période — avec un score de tendance clair et une fiche prête à lancer en quelques minutes.',
  socialProof: 'Utilisé par des centaines d\'e-commerçants francophones',
  images: [
    'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=900&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=900&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=900&auto=format&fit=crop',
  ],
  imageAlts: ['Vendeur e-commerce', 'Analyse de tendances', 'Tableau de bord'],
  animation: 'subtle',
  primaryCTA: {
    ctaEnabled: true,
    text: 'Trouver mon produit phare',
    link: '/inscription',
    variant: 'gradient',
    size: 'lg',
  },
  secondaryCTA: {
    ctaEnabled: true,
    text: 'Voir la démo',
    link: '#demo',
    variant: 'outline',
    size: 'lg',
  },
} satisfies Hero10Props

export function Hero10Example({ isLoggedIn = false }: { isLoggedIn?: boolean }) {
  const primaryCTA = isLoggedIn
    ? { ctaEnabled: true as const, text: 'Accéder au catalogue', link: '/catalogue', variant: 'gradient' as const, size: 'lg' as const }
    : { ctaEnabled: true as const, text: 'Trouver mon produit phare', link: '/inscription', variant: 'gradient' as const, size: 'lg' as const }

  return <Hero10 {...values} primaryCTA={primaryCTA} />
}

export default Hero10Example
