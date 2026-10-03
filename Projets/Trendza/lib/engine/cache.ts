export type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

export type CacheOptions = {
  ttlMs: number;
  /** Si true, renvoie la valeur périmée quand la source échoue (stale-while-error). */
  staleWhileError?: boolean;
  /** Persistance navigateur (localStorage) pour les analyses légères côté client. */
  persist?: boolean;
};

const STORAGE_KEY = "trendza.cache.v1";

function memoryStore(): Map<string, CacheEntry<unknown>> {
  if (!globalThis.__trendzaCache) {
    globalThis.__trendzaCache = new Map();
  }
  return globalThis.__trendzaCache as Map<string, CacheEntry<unknown>>;
}

function persistSave(map: Map<string, CacheEntry<unknown>>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...map.entries()]));
  } catch {
    // localStorage plein ou indisponible : on ignore.
  }
}

/** Cache TTL générique avec mode stale-while-error. */
export class TtlCache<T> {
  private readonly keyPrefix: string;
  private readonly options: CacheOptions;

  constructor(keyPrefix: string, options: CacheOptions) {
    this.keyPrefix = keyPrefix;
    this.options = options;
  }

  private key(k: string): string {
    return `${this.keyPrefix}:${k}`;
  }

  get(key: string): T | null {
    const entry = memoryStore().get(this.key(key)) as CacheEntry<T> | undefined;
    if (!entry) return null;
    if (Date.now() <= entry.expiresAt) return entry.value;
    return null;
  }

  /** Renvoie la valeur même périmée (pour stale-while-error). */
  getStale(key: string): T | null {
    const entry = memoryStore().get(this.key(key)) as CacheEntry<T> | undefined;
    return entry ? entry.value : null;
  }

  set(key: string, value: T) {
    const entry: CacheEntry<T> = { value, expiresAt: Date.now() + this.options.ttlMs };
    memoryStore().set(this.key(key), entry);
    if (this.options.persist) persistSave(memoryStore());
  }

  /** Récupère avec fallback : exécute `load` en cas de miss, tolère l'erreur si périmé. */
  async getOrLoad(key: string, load: () => Promise<T>): Promise<T> {
    const fresh = this.get(key);
    if (fresh !== null) return fresh;

    try {
      const value = await load();
      this.set(key, value);
      return value;
    } catch (err) {
      if (this.options.staleWhileError) {
        const stale = this.getStale(key);
        if (stale !== null) return stale;
      }
      throw err;
    }
  }

  invalidate(key?: string) {
    if (key) {
      memoryStore().delete(this.key(key));
    } else {
      memoryStore().forEach((_v, k) => {
        if (k.startsWith(this.keyPrefix)) memoryStore().delete(k);
      });
    }
  }
}

declare global {
  // Stockage mémoire du cache TTL (partagé côté serveur via globalThis).
  var __trendzaCache: Map<string, CacheEntry<unknown>> | undefined;
}
