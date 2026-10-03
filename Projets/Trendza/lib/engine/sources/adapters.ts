import type { Product } from "@/types/database";
import type { SourceId, SourceSignal } from "@/lib/engine/types";
import { SourceAuthError, SourceQuotaError, SourceUnavailableError } from "@/lib/engine/errors";
import { TtlCache } from "@/lib/engine/cache";
import { sourceDescriptor } from "@/lib/engine/sources/registry";
import { simulatedSignal } from "@/lib/engine/sources/simulated";

const SIGNAL_TTL_MS = 30 * 60 * 1000; // 30 minutes

const signalCache = new TtlCache<SourceResult>("signal", {
  ttlMs: SIGNAL_TTL_MS,
  staleWhileError: true,
});

export type SourceQuery = {
  product: Product;
  pays: string;
  mois: number;
  niche?: string;
};

export type SourceResult = {
  source: SourceId;
  signal: SourceSignal;
  mode: "live" | "simulated" | "degraded";
};

/**
 * Contrat d'un connecteur de données. Pour activer une vraie API :
 * implémenter `fetchLive` (retourner null quand la clé est absente) et
 * lever SourceQuotaError / SourceAuthError / SourceUnavailableError
 * pour une gestion propre des limites et indisponibilités.
 */
export type MarketDataSource = {
  readonly id: SourceId;
  fetchLive(query: SourceQuery): Promise<SourceSignal | null>;
};

type AdapterConfig = {
  id: SourceId;
  /** Si non défini dans l'environnement, la source passe en mode simulé. */
  envKey?: string;
  /** Implémentation réelle : appel API. À brancher pour passer en mode live. */
  live?: (query: SourceQuery) => Promise<SourceSignal | null>;
};

function hasEnv(envKey?: string): boolean {
  if (!envKey) return false;
  const value = process.env[envKey];
  return Boolean(value && value.trim().length > 0 && value !== "your-key-here");
}

function createAdapter(config: AdapterConfig): MarketDataSource {
  return {
    id: config.id,
    async fetchLive(query: SourceQuery): Promise<SourceSignal | null> {
      if (!hasEnv(config.envKey)) return null;
      if (!config.live) {
        throw new SourceAuthError(config.id);
      }
      return config.live(query);
    },
  };
}

/**
 * Adapters live : les appels réels sont volontairement laissés en stubs.
 * Chaque bloc documente l'endpoint à brancher. Sans clé (ou en cas d'erreur),
 * la chaîne retombe sur la simulation déterministe sans casser le produit.
 */
const ADAPTERS: Record<SourceId, MarketDataSource> = {
  google_trends: createAdapter({
    id: "google_trends",
    envKey: "TRENDZA_GOOGLE_TRENDS_KEY",
    live: async () => null, // TODO: fetch trends.google.com (import `@google-trends/api`), ratio par période
  }),
  tiktok_trends: createAdapter({
    id: "tiktok_trends",
    envKey: "TRENDZA_TIKTOK_TRENDS_KEY",
    live: async () => null, // TODO: TikTok Creative Center popular hashtags
  }),
  tiktok_shop: createAdapter({
    id: "tiktok_shop",
    envKey: "TRENDZA_TIKTOK_SHOP_KEY",
    live: async () => null, // TODO: TikTok Shop Seller API (Top Products)
  }),
  amazon_bestsellers: createAdapter({
    id: "amazon_bestsellers",
    envKey: "TRENDZA_AMAZON_KEY",
    live: async () => null, // TODO: Amazon Product Advertising API / scraper des BS ranks
  }),
  aliexpress: createAdapter({
    id: "aliexpress",
    envKey: "TRENDZA_ALIEXPRESS_KEY",
    live: async () => null, // TODO: AliExpress Open Platform (keyword → orders)
  }),
  temu: createAdapter({
    id: "temu",
    envKey: "TRENDZA_TEMU_KEY",
    live: async () => null, // TODO: Temu public catalogue scraper
  }),
  etsy: createAdapter({
    id: "etsy",
    envKey: "TRENDZA_ETSY_KEY",
    live: async () => null, // TODO: Etsy Open API (Listings Trending)
  }),
  pinterest_trends: createAdapter({
    id: "pinterest_trends",
    envKey: "TRENDZA_PINTEREST_KEY",
    live: async () => null, // TODO: Pinterest API (trending topics)
  }),
  meta_ads_library: createAdapter({
    id: "meta_ads_library",
    envKey: "TRENDZA_META_ADS_KEY",
    live: async () => null, // TODO: Meta Ad Library API (ad count par mot-clé)
  }),
  instagram: createAdapter({
    id: "instagram",
    envKey: "TRENDZA_INSTAGRAM_KEY",
    live: async () => null, // TODO: Instagram Graph API (hashtag counts)
  }),
  reddit: createAdapter({
    id: "reddit",
    envKey: "TRENDZA_REDDIT_KEY",
    live: async () => null, // TODO: Reddit API (search posts)
  }),
  youtube_shorts: createAdapter({
    id: "youtube_shorts",
    envKey: "TRENDZA_YOUTUBE_KEY",
    live: async () => null, // TODO: YouTube Data API (shorts views)
  }),
};

const CACHE_TTL_MS = 5 * 60 * 1000;

async function fetchFromAdapter(adapter: MarketDataSource, query: SourceQuery): Promise<SourceResult> {
  const cacheKey = `${adapter.id}:${query.product.id}:${query.pays}:${query.mois}:${query.niche ?? ""}`;

  return signalCache.getOrLoad(cacheKey, async () => {
    let mode: SourceResult["mode"] = "simulated";
    let signal: SourceSignal;

    try {
      const live = await adapter.fetchLive(query);
      if (live) {
        mode = "live";
        signal = live;
      } else {
        signal = simulatedSignal(adapter.id, query.product, query.pays, query.mois, query.niche);
      }
    } catch (err) {
      // Gestion propre : quotas (429), auth (401/403) et indisponibilités → repli simulé.
      if (err instanceof SourceQuotaError || err instanceof SourceAuthError) {
        mode = "degraded";
        signal = simulatedSignal(adapter.id, query.product, query.pays, query.mois, query.niche);
      } else if (err instanceof SourceUnavailableError) {
        mode = "degraded";
        signal = simulatedSignal(adapter.id, query.product, query.pays, query.mois, query.niche);
      } else {
        throw err;
      }
    }

    return { source: adapter.id, signal, mode };
  });
}

export async function fetchSource(
  id: SourceId,
  query: SourceQuery,
): Promise<SourceResult> {
  return fetchFromAdapter(ADAPTERS[id], query);
}

export { CACHE_TTL_MS, sourceDescriptor };
