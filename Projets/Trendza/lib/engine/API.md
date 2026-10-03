# Trendza — API interne du moteur d'analyse

Le moteur vit dans `lib/engine/`. C'est du TypeScript **pur** (aucun React,
aucune dépendance réseau obligatoire) : il est utilisable aussi bien côté
serveur (pages, route handler) que côté client (simulateur interactif).

Point d'entrée : le barrel `lib/engine/index.ts` ré-exporte l'ensemble des
fonctions publiques ci-dessous.

---

## Orchestration

### `runAnalysis(req: AnalysisRequest): Promise<TrendzaAnalysis>`

Pipeline complet « produit + marché + période → analyse ». C'est la fonction
que les pages d'analyse et l'assistant appellent.

| Param | Type | Description |
| --- | --- | --- |
| `req.product` | `Product` | Produit du catalogue (`types/database`). |
| `req.pays` | `string` | Code pays ISO (ex. `"CI"`). |
| `req.mois` | `number` | Mois 1–12 (valide la valeur, sinon `InvalidAnalysisRequestError`). |
| `req.budget?` | `number` | Budget en €, injecté dans la recommandation. |
| `req.niche?` | `string` | Niches à privilégier (réduit les signaux). |
| `req.enabledSources?` | `SourceId[]` | Sous-ensemble de sources à interroger. |

**Retour** (`TrendzaAnalysis`) — toutes les briques de l'analyse :

```ts
{
  product, pays, paysLabel, mois, moisLabel, generatedAt,
  score:          OpportunityScore,       // 11 critères pondérés + rationales
  sources:        SignalsReport,          // signaux + confiance + coverage + degraded
  market:         MarketAnalysis,         // score pays + comparaison des autres pays
  competition:    CompetitionAnalysis,    // fourchette prix, vendeurs, saturation
  seasonality:    SeasonalityCalendar,    // 12 mois + événements commerciaux
  financial:      FinancialPlan,          // marges, ROAS, CPA (base par défaut)
  prediction:     PredictionReport,       // probabilités à 1/3/6/12 mois
  suppliers:      SupplierReport,         // comparatif + recommandation
  alerts:         TrendzaAlert[],         // alertes métier priorisées
  recommendation: string,                 // phrase NLG argumentée
}
```

Déterminisme : à `(product, pays, mois)` égaux, tous les calculs (scores,
fournisseurs, concurrence) sont **identiques** — le RNG est seedé par produit.

---

## Sources de tendances

### `collectSignals(product, pays, mois, niche?, enabledSources?): Promise<SignalsReport>`

Interroge les 12 sources en parallèle (`Promise.allSettled`) :

- chaque source est un adaptateur `MarketDataSource` (`sources/adapters.ts`) ;
- sans clé API, l'adaptateur renvoie `SourceAuthError` → le signal est
  **simulé** de façon déterministe (`sources/simulated.ts`) et la source est
  marquée `degraded` ;
- une source en échec n'est jamais bloquante : elle est exclue du calcul de
  confiance et listée dans `degraded`.

**Retour** (`SignalsReport`) :

```ts
{
  signals:    SourceSignal[],  // 1 par source : detected, frequency, growth,
                               // velocity, virality, countries, trend[12]…
  confidence: number,          // 0-100 : accord entre sources + direction
  coverage:   number,          // % de sources ayant répondu
  degraded:   SourceId[],      // sources en mode dégradé/simulé
}
```

Pour brancher une vraie API : implémenter le TODO documenté dans
`sources/adapters.ts` (adapter `fetchLive`), laisser `fetchSimulated` en
repli, et renseigner la variable d'environnement `envKey` du descripteur
(`sources/registry.ts`).

### `SOURCES` / `ALL_SOURCES`

- `SOURCES: SourceDescriptor[]` — descriptifs (label FR, icône FontAwesome,
  `envKey`, URL, notes, statut).
- `ALL_SOURCES: SourceId[]` — liste des 12 ids (`google_trends`, `tiktok_trends`,
  `tiktok_shop`, `amazon_bestsellers`, `aliexpress`, `temu`, `etsy`,
  `pinterest_trends`, `meta_ads_library`, `instagram`, `reddit`, `youtube_shorts`).

### `averageSignals(signals, key): number`

Moyenne d'une métrique (`frequency` | `growth` | `velocity` | `virality`) sur
les signaux détectés (repli : tous).

---

## Briques métier

### `computeOpportunityScore(product, pays, mois, signalsReport, market): OpportunityScore`

Score 0-100 sur **11 critères pondérés** (popularité 12 %, croissance 14 %,
saisonnalité 10 %, facilité 8 %, concurrence 8 %, marge 12 %, coût pub 8 %,
fournisseurs 8 %, viralité 10 %, logistique 5 %, saturation 5 %).

**Retour** : `total`, `criteria` (label, weight, value), `confidence`,
`rationale` (`why`, `strengths`, `risks`, `recommendations`).

### `analyzeMarket(product, pays, compareAll = true): MarketAnalysis`

- `scoreCountry(code, product)` → score 0-100 du pays sur 7 axes pondérés
  (demande, concurrence, pouvoir d'achat, coût pub, logistique, rentabilité,
  maturité).
- `analyzeMarket` renvoie `{ country, comparison }` avec la comparaison triée
  par score décroissant (exclut le pays demandé si `compareAll`).

### `analyzeCompetition(product, market, signals): CompetitionAnalysis`

Fourchette de prix (`min/max/median`), nombre estimé de vendeurs (échelle par
catégorie), saturation 0-100, qualité moyenne des annonces, forces / faiblesses
et un angle de différenciation conseillé.

### `computeFinancial(input: FinancialInput): FinancialPlan` — **pure**

Simulateur financier. Coût total = achat + transport + commissions + frais ;
marge brute = vente − coût total ; marge nette = brute − pub ; CPA max = marge
brute ; ROAS cible = vente / marge brute ; prix conseillé ciblant ~30 % de
marge nette.

Utilisé tel quel par le simulateur client (`financial-simulator.tsx`) — c'est
la seule fonction du moteur branchée côté client.

- `defaultFinancialInput(product)` → plan initial dérivé de
  `prix_conseille` + `marge_estimee` du produit.

### `buildSeasonality(product): SeasonalityCalendar`

12 mois avec niveau (`ideal` / `good` / `medium` / `avoid`) basé sur
`mois_pertinents`, calendrier des événements commerciaux
(`COMMERCIAL_EVENTS` : Noël, Ramadan, Rentrée, Black Friday…) et période
idéale formatée.

### `predict(product, signals): PredictionReport`

Horizons 1 / 3 / 6 / 12 mois avec probabilité (0-100), confiance et tendance
(`up` | `stable` | `down`), plus une phrase d'évolution (`outlook`).

### `compareSuppliers(product, pays): SupplierReport`

4 fournisseurs (AliExpress Standard / Choice, CJ Dropshipping, grossiste
local) avec prix ajusté au `prix_conseille`, délai ajusté à la logistique du
pays, qualité / réputation / fiabilité. Recommandation pondérée
(fiabilité 35 %, qualité 25 %, réputation 15 %, délai 15 %, prix 10 %).

### `buildAlerts(product, pays, mois, signals, score): TrendzaAlert[]`

Alertes métier (`info` / `warning` / `danger` / `success`) : période hors pic,
demande en baisse, concurrence qui monte, marge faible, etc.

### `buildRecommendation(args): string` — NLG

Construit la phrase de recommandation budgétisée à partir du score, des
signaux et des mois pertinents. Les helpers `marketComparisonProse(market)` et
`scoreWhyText(score)` produisent respectivement la comparaison de pays et la
justification du score.

---

## Assistant conversationnel (NLG, sans LLM)

### `parseIntent(question): Intent`

Analyse lexicale de la question : `pays` (matching `COUNTRIES`), `budget`
(régex `€`/`euro`), `topic` (produit, tendance, concurrence, rentabilité,
marge, viral, niche, fournisseur, saison, aide, salutation) et `timeframe`
(hiver, été, automne, printemps, noël, ramadan, rentrée, black friday).

### `answerQuestion(question, context, products): Promise<ChatAnswer>`

Résout `pays` / `mois` (timeframe → mois type, sinon contexte, sinon mois
courant) / `budget`, sélectionne les produits du pays cible, lance
`runAnalysis` sur le meilleur produit, puis assemble une réponse en NLG
modulée par le topic. Pas de clé API externe.

**Retour** :

```ts
{ message: string, products?: { id, nom, score, imageUrl, categorie }[] }
```

`message` contient la réponse FR ; `products` (les 3 meilleurs) alimente les
cartes produit de l'interface chat. Le route `app/api/assistant/route.ts`
fait le pont : lecture session Supabase → `ChatContext` → `answerQuestion`.

---

## Tableau de bord

### `buildDashboardInsights(products, pays, mois): Promise<DashboardInsights>`

Enrichit le catalogue filtré (1 `collectSignals` + concurrence par produit,
réutilisés pour les alertes) et renvoie :

```ts
{
  topToday:     InsightProduct[],  // top score
  topWeek:      InsightProduct[],  // top vélocité
  topMonth:     InsightProduct[],  // top croissance
  growing:      InsightProduct[],  // croissance ≥ 20
  avoid:        InsightProduct[],  // score < 55
  niches:       { label, growth, count }[],
  opportunities: InsightProduct[], // score ≥ 75 et saturation ≤ 55
  alerts:       TrendzaAlert[],    // triées danger → warning → success → info (max 6)
}
```

`InsightProduct = { product, growth, velocity, virality, saturation }`.

---

## Infrastructure

### Cache — `TtlCache`

`TtlCache<K, V>` (dans `cache.ts`) : cache TTL en mémoire
(`globalThis.__trendzaCache`, partagé côté serveur) avec persistance
`localStorage` côté client et politique *stale-while-error*.

### RNG déterministe — `rng.ts`

- `seedFrom(...args)` → seed stable ; `hashString`, `mulberry32` ;
- helpers : `clamp`, `round1`, `range`, `intRange`.

Toute valeur « aléatoire » du moteur passe par un RNG seedé par
`(module, product.id, pays, …)` pour des résultats reproductibles par
produit/marché.

### Erreurs — `errors.ts`

- `TrendzaError(code, message)` — base (nom + code machine).
- `SourceAuthError(source)` / `SourceQuotaError(source)` /
  `SourceUnavailableError(source, message)` — jamais bloquantes : l'adaptateur
  bascule en simulation et marque la source `degraded`.
- `InvalidAnalysisRequestError(message)` — produit/pays/mois manquant ou
  invalide dans `runAnalysis`.

### Constantes partagées

- `COUNTRIES`, `MONTHS` (avec labels FR) depuis `lib/constants.ts`.
- Facteurs pays dans `country-data.ts` (`COUNTRY_FACTORS`, `countryFactors(code)`).
