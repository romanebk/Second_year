import type { SourceDescriptor, SourceId, SourceStatus } from "@/lib/engine/types";

export const SOURCES: SourceDescriptor[] = [
  {
    id: "google_trends",
    label: "Google Trends",
    icon: "faMagnifyingGlassChart",
    envKey: "TRENDZA_GOOGLE_TRENDS_KEY",
    url: "https://trends.google.com/trends/explore",
    notes: "Requêtes de recherche par mot-clé et par pays.",
    status: "simulated",
  },
  {
    id: "tiktok_trends",
    label: "TikTok Trends",
    icon: "faHashtag",
    envKey: "TRENDZA_TIKTOK_TRENDS_KEY",
    url: "https://ads.tiktok.com/business/creativecenter/inspiration/popular/hashtag",
    notes: "Hashtags et sons en tendance.",
    status: "simulated",
  },
  {
    id: "tiktok_shop",
    label: "TikTok Shop",
    icon: "faBagShopping",
    envKey: "TRENDZA_TIKTOK_SHOP_KEY",
    url: "https://seller.tiktokglobalshop.com",
    notes: "Ventes et catégories les plus performantes.",
    status: "simulated",
  },
  {
    id: "amazon_bestsellers",
    label: "Amazon Best Sellers",
    icon: "faTrophy",
    envKey: "TRENDZA_AMAZON_KEY",
    url: "https://www.amazon.com/Best-Sellers",
    notes: "Best sellers par catégorie (rankings).",
    status: "simulated",
  },
  {
    id: "aliexpress",
    label: "AliExpress",
    icon: "faBoxesStacked",
    envKey: "TRENDZA_ALIEXPRESS_KEY",
    url: "https://www.aliexpress.com",
    notes: "Recherche produits et volume de commandes.",
    status: "simulated",
  },
  {
    id: "temu",
    label: "Temu",
    icon: "faBolt",
    envKey: "TRENDZA_TEMU_KEY",
    url: "https://www.temu.com",
    notes: "Produits les plus vendus.",
    status: "simulated",
  },
  {
    id: "etsy",
    label: "Etsy",
    icon: "faStore",
    envKey: "TRENDZA_ETSY_KEY",
    url: "https://www.etsy.com/market/trends",
    notes: "Tendances des produits faits-main et personnalisés.",
    status: "simulated",
  },
  {
    id: "pinterest_trends",
    label: "Pinterest Trends",
    icon: "faThumbtack",
    envKey: "TRENDZA_PINTEREST_KEY",
    url: "https://trends.pinterest.com",
    notes: "Épingles et recherches en forte progression.",
    status: "simulated",
  },
  {
    id: "meta_ads_library",
    label: "Meta Ads Library",
    icon: "faBullhorn",
    envKey: "TRENDZA_META_ADS_KEY",
    url: "https://www.facebook.com/ads/library",
    notes: "Annonces actives et budget estimé des concurrents.",
    status: "simulated",
  },
  {
    id: "instagram",
    label: "Instagram",
    icon: "faCamera",
    envKey: "TRENDZA_INSTAGRAM_KEY",
    url: "https://www.instagram.com",
    notes: "Hashtags et créateurs qui performent.",
    status: "simulated",
  },
  {
    id: "reddit",
    label: "Reddit",
    icon: "faComments",
    envKey: "TRENDZA_REDDIT_KEY",
    url: "https://www.reddit.com/r/ecommerce",
    notes: "Discussions et signaux d'intérêt organiques.",
    status: "simulated",
  },
  {
    id: "youtube_shorts",
    label: "YouTube Shorts",
    icon: "faClapperboard",
    envKey: "TRENDZA_YOUTUBE_KEY",
    url: "https://www.youtube.com/shorts",
    notes: "Vidéos courtes et vues générées.",
    status: "simulated",
  },
];

export function sourceDescriptor(id: SourceId): SourceDescriptor {
  const found = SOURCES.find((s) => s.id === id);
  if (!found) throw new Error(`Source inconnue : ${id}`);
  return found;
}

export function sourceStatus(id: SourceId): SourceStatus {
  return sourceDescriptor(id).status;
}
