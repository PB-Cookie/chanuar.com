import { supabaseEnvironment } from '../../../shared/config/supabase';
import type { Flair, Loot, Match, Offer, Ownership, Profile, Wallet } from '../model/types';

type PriceEntry = Offer;
type PriceRow = {
  skin_id?: number | null;
  skinId?: number | null;
  rp?: number | null;
  sale_rp?: number | null;
  saleRp?: number | null;
  discount?: number;
  sale_ends_at?: string | null;
  saleEndsAt?: string | null;
  owned?: boolean;
};
type MatchRow = {
  game_id?: string | number;
  gameId?: string | number;
  played_at?: string;
  playedAt?: string;
  queue_id?: number;
  queueId?: number;
  duration_s?: number;
  durationS?: number;
  champion_id?: number;
  championId?: number;
  win?: boolean;
  kills?: number;
  deaths?: number;
  assists?: number;
};
type ProfileRow = {
  game_name?: string;
  gameName?: string;
  tag_line?: string;
  tagLine?: string;
  level?: number;
  profile_icon_id?: number;
  profileIconId?: number;
  flair?: Flair | null;
};
type WalletRow = { RP?: number; lol_blue_essence?: number; blueEssence?: number };
type OwnedSkinRow = { skin_id: number };
type OwnedChromaRow = { chroma_id: number; skin_id: number };
type MasteryRow = { champion_id: number; points: number; level?: number };
type SyncRow = {
  ran_at?: string;
  stats?: { skinsOwned?: number } | null;
  loot?: Loot | null;
  wallet?: WalletRow | null;
};
type CosmeticRow = { item_type: string; item_id: number };
type EventRow = { item_type: string; item_id: number; acquired_at: string };
type ExportSkin = {
  id: number;
  owned?: boolean;
  isBase?: boolean;
  chromas?: Array<{ id: number; owned?: boolean }>;
};
type ExportData = {
  skins?: ExportSkin[];
  prices?: PriceRow[];
  matches?: MatchRow[];
  cosmetics?: { wards?: number[]; emotes?: number[]; icons?: number[] };
  summoner?: { gameName: string; tagLine: string; level: number; profileIconId: number };
  mastery?: Array<{ championId: number; points: number; level?: number }>;
  meta?: { generatedAt?: string };
  loot?: Loot | null;
  wallet?: WalletRow | null;
  flair?: Flair | null;
};

class SupabaseRestError extends Error {
  constructor(
    public status: number,
    public code: string | null,
    path: string,
  ) {
    super(`Supabase → HTTP ${status} en ${path}`);
    this.name = 'SupabaseRestError';
  }
}

// Lectura de la colección. Dos fuentes posibles:
//  1. Supabase (anon key, solo lectura garantizada por RLS) — la normal.
//  2. Un JSON exportado por el collector, importado a mano — útil antes de
//     configurar Supabase o para probar en local.
// Ambas devuelven la misma forma de datos ("ownership").
//
// Desde el collector v0.3 el ownership incluye además:
//  - wallet ({RP, lol_blue_essence}) y flair (honor/retos) del jugador.
//  - Valoración de la colección en RP (collectionValueRp / pricedOwnedCount).
//  - offers: skins en oferta activa (rebaja con fecha de fin en el futuro).
//  - matches: últimas partidas jugadas.
//  - cosmetics: wards/emotes/iconos poseídos.
//  - events: historial de adquisiciones (no iniciales).
//  - syncHistory: evolución de skins/chromas a lo largo del tiempo.
// Las tablas nuevas pueden no existir todavía (migración sin aplicar): sus
// lecturas fallan de forma segura (null/[]) sin romper el ownership base.

const URL = supabaseEnvironment.url;
const KEY = supabaseEnvironment.publishableKey;

export const dbConfigured = supabaseEnvironment.configured;

async function q<T extends object>(pathAndQuery: string, range?: string): Promise<T[]> {
  const headers: Record<string, string> = { apikey: KEY, Authorization: `Bearer ${KEY}` };
  if (range) {
    headers.Range = range;
    headers['Range-Unit'] = 'items';
  }
  const res = await fetch(`${URL.replace(/\/+$/, '')}/rest/v1/${pathAndQuery}`, { headers });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { code?: string } | null;
    throw new SupabaseRestError(res.status, body?.code ?? null, pathAndQuery);
  }
  return res.json() as Promise<T[]>;
}

/** Lectura paginada (Supabase corta en 1000 filas por defecto). */
async function qAll<T extends object>(pathAndQuery: string, pageSize = 1000): Promise<T[]> {
  const rows: T[] = [];
  for (let offset = 0; ; offset += pageSize) {
    const page = await q<T>(pathAndQuery, `${offset}-${offset + pageSize - 1}`);
    rows.push(...page);
    if (page.length < pageSize) return rows;
  }
}

type OptionalResult<T> = { data: T | null; warning: string | null };

async function optional<T>(promise: Promise<T>): Promise<OptionalResult<T>> {
  try {
    return { data: await promise, warning: null };
  } catch (error) {
    if (error instanceof SupabaseRestError && ['42P01', 'PGRST205'].includes(error.code ?? '')) {
      return { data: null, warning: null };
    }
    return {
      data: null,
      warning: error instanceof Error ? error.message : 'Error desconocido de Supabase',
    };
  }
}

// ── Normalizadores: unifican las filas de Supabase (snake_case) y las del
//    JSON exportado (camelCase) en la misma forma de salida (camelCase). ──────

const normalizePrice = (r: PriceRow): PriceEntry => ({
  skinId: r.skin_id ?? r.skinId ?? null,
  rp: r.rp ?? null,
  saleRp: r.sale_rp ?? r.saleRp ?? null,
  discount: r.discount ?? 0,
  saleEndsAt: r.sale_ends_at ?? r.saleEndsAt ?? null,
  owned: Boolean(r.owned),
});

const normalizeMatch = (m: MatchRow): Match => ({
  gameId: m.game_id ?? m.gameId ?? '',
  playedAt: m.played_at ?? m.playedAt ?? '',
  queueId: Number(m.queue_id ?? m.queueId ?? 0),
  durationS: Number(m.duration_s ?? m.durationS ?? 0),
  championId: Number(m.champion_id ?? m.championId ?? 0),
  win: Boolean(m.win),
  kills: Number(m.kills ?? 0),
  deaths: Number(m.deaths ?? 0),
  assists: Number(m.assists ?? 0),
});

const normalizeProfile = (profile: ProfileRow | null): Profile | null =>
  profile
    ? {
        gameName: String(profile.game_name ?? profile.gameName ?? ''),
        tagLine: String(profile.tag_line ?? profile.tagLine ?? ''),
        level: Number(profile.level ?? 0),
        profileIconId: Number(profile.profile_icon_id ?? profile.profileIconId ?? 0),
      }
    : null;

const normalizeWallet = (wallet: WalletRow | null): Wallet | null =>
  wallet
    ? {
        RP: Number(wallet.RP ?? 0),
        blueEssence: Number(wallet.lol_blue_essence ?? wallet.blueEssence ?? 0),
      }
    : null;

/** A partir de precios normalizados: valor de la colección y ofertas activas. */
function priceDerived(entries: PriceEntry[]) {
  let collectionValueRp = 0;
  let pricedOwnedCount = 0;
  for (const e of entries) {
    if (e.owned && e.rp != null) {
      collectionValueRp += e.rp;
      pricedOwnedCount += 1;
    }
  }
  const now = Date.now();
  const offers = entries
    .filter((e) => e.saleEndsAt != null && new Date(e.saleEndsAt).getTime() > now)
    // No poseídas primero, luego mayor descuento.
    .sort((a, b) => Number(a.owned) - Number(b.owned) || b.discount - a.discount);
  return { collectionValueRp, pricedOwnedCount, offers };
}

/** Ordena partidas por fecha desc y recorta a las 12 más recientes. */
const topMatches = (list: Match[]): Match[] =>
  list
    .slice()
    .sort((a, b) => new Date(b.playedAt).getTime() - new Date(a.playedAt).getTime())
    .slice(0, 12);

/** Filas de owned_cosmetics → { wards, emotes, icons } como Sets de ids. */
const cosmeticsFromRows = (rows: CosmeticRow[] | null) => {
  const wards = new Set<number>(),
    emotes = new Set<number>(),
    icons = new Set<number>();
  for (const r of rows ?? []) {
    if (r.item_type === 'ward') wards.add(r.item_id);
    else if (r.item_type === 'emote') emotes.add(r.item_id);
    else if (r.item_type === 'icon') icons.add(r.item_id);
  }
  return { wards, emotes, icons };
};

/** Reads the required collection plus optional, migration-dependent sections. */
export async function fetchOwnership(): Promise<{
  ownership: Ownership | null;
  warning: string | null;
}> {
  if (!dbConfigured) return { ownership: null, warning: null };

  const [
    profiles,
    skins,
    chromas,
    mastery,
    lastRun,
    prices,
    matchesRaw,
    cosmeticsRows,
    eventsRaw,
    syncRows,
  ] = await Promise.all([
    q<ProfileRow>('profiles?select=*&order=updated_at.desc&limit=1'),
    qAll<OwnedSkinRow>('owned_skins?select=skin_id'),
    qAll<OwnedChromaRow>('owned_chromas?select=chroma_id,skin_id'),
    qAll<MasteryRow>('mastery?select=champion_id,level,points'),
    q<SyncRow>('sync_runs?select=ran_at,stats,loot,wallet&order=ran_at.desc&limit=1'),
    optional(qAll<PriceRow>('skin_prices?select=*')),
    optional(q<MatchRow>('matches?select=*&order=played_at.desc&limit=12')),
    optional(qAll<CosmeticRow>('owned_cosmetics?select=item_type,item_id')),
    optional(
      q<EventRow>(
        'ownership_events?select=item_type,item_id,acquired_at&is_initial=eq.false&order=acquired_at.desc&limit=60',
      ),
    ),
    optional(qAll<SyncRow>('sync_runs?select=stats&order=ran_at.asc')),
  ]);

  const chromasBySkin = new Map();
  for (const c of chromas) chromasBySkin.set(c.skin_id, (chromasBySkin.get(c.skin_id) ?? 0) + 1);

  const priceEntries = (prices.data ?? []).map(normalizePrice);
  const { collectionValueRp, pricedOwnedCount, offers } = priceDerived(priceEntries);

  const matches = topMatches((matchesRaw.data ?? []).map(normalizeMatch));

  const events = (eventsRaw.data ?? []).map((e) => ({
    itemType: e.item_type,
    itemId: e.item_id,
    acquiredAt: e.acquired_at,
  }));

  const syncHistory = (syncRows.data ?? [])
    .filter((r): r is SyncRow & { stats: { skinsOwned: number } } => r.stats?.skinsOwned != null)
    .map((r) => ({
      skinsOwned: r.stats.skinsOwned,
    }));

  const profile = normalizeProfile(profiles[0] ?? null);

  const warnings = [prices, matchesRaw, cosmeticsRows, eventsRaw, syncRows]
    .map((result) => result.warning)
    .filter((warning): warning is string => Boolean(warning));

  return {
    ownership: {
      source: 'supabase',
      profile,
      ownedSkinIds: new Set(skins.map((r) => r.skin_id)),
      ownedChromaIds: new Set(chromas.map((r) => r.chroma_id)),
      chromasOwned: chromas.length,
      chromasBySkin,
      masteryByChampion: new Map<number, { points: number; level?: number }>(
        mastery.map((m) => [m.champion_id, { points: m.points, level: m.level }]),
      ),
      lastSyncAt: lastRun[0]?.ran_at ?? null,
      loot: lastRun[0]?.loot ?? null,
      // ── Datos v0.3 ──
      wallet: normalizeWallet(lastRun[0]?.wallet ?? null),
      flair: profiles[0]?.flair ?? null,
      collectionValueRp,
      pricedOwnedCount,
      offers,
      matches,
      cosmetics: cosmeticsFromRows(cosmeticsRows.data),
      events,
      syncHistory,
    },
    warning: warnings.length
      ? `No se pudieron leer algunos datos opcionales (${warnings.join('; ')}).`
      : null,
  };
}

/** Convierte el JSON del collector (v0.1/v0.2/v0.3) a la misma forma "ownership". */
export function ownershipFromExport(json: unknown): Ownership {
  if (!json || typeof json !== 'object' || Array.isArray(json))
    throw new Error('El export del collector no es un objeto JSON válido.');
  const raw = json as Record<string, unknown>;
  for (const key of ['skins', 'prices', 'matches', 'mastery']) {
    if (raw[key] != null && !Array.isArray(raw[key]))
      throw new Error(`La sección ${key} del export no es una lista válida.`);
  }
  const data = raw as ExportData;
  const ownedSkins = (data.skins ?? []).filter((skin) => skin.owned && !skin.isBase);
  const chromasBySkin = new Map<number, number>();
  const ownedChromaIds = new Set<number>();
  for (const s of data.skins ?? []) {
    if (s.chromas != null && !Array.isArray(s.chromas))
      throw new Error('La sección chromas del export no es una lista válida.');
    const owned = (s.chromas ?? []).filter((chroma) => chroma.owned);
    if (owned.length > 0) {
      chromasBySkin.set(s.id, owned.length);
      for (const c of owned) ownedChromaIds.add(c.id);
    }
  }

  const priceEntries = (data.prices ?? []).map(normalizePrice);
  const { collectionValueRp, pricedOwnedCount, offers } = priceDerived(priceEntries);

  const matches = topMatches((data.matches ?? []).map(normalizeMatch));

  const cos = data.cosmetics ?? {};
  const cosmetics = {
    wards: new Set<number>(cos.wards ?? []),
    emotes: new Set<number>(cos.emotes ?? []),
    icons: new Set<number>(cos.icons ?? []),
  };

  return {
    source: 'archivo',
    profile: data.summoner
      ? {
          gameName: data.summoner.gameName,
          tagLine: data.summoner.tagLine,
          level: data.summoner.level,
          profileIconId: data.summoner.profileIconId,
        }
      : null,
    ownedSkinIds: new Set<number>(ownedSkins.map((skin) => skin.id)),
    ownedChromaIds,
    chromasOwned: ownedChromaIds.size,
    chromasBySkin,
    masteryByChampion: new Map<number, { points: number; level?: number }>(
      (data.mastery ?? []).map((entry) => [
        entry.championId,
        { points: entry.points, level: entry.level },
      ]),
    ),
    lastSyncAt: data.meta?.generatedAt ?? null,
    loot: data.loot ?? null,
    // ── Datos v0.3 (exports antiguos carecen de estas secciones → defaults) ──
    wallet: normalizeWallet(data.wallet ?? null),
    flair: data.flair ?? null,
    collectionValueRp,
    pricedOwnedCount,
    offers,
    matches,
    cosmetics,
    events: [], // los exports no llevan historial de eventos
    syncHistory: [], // ni historial de sincronizaciones
  };
}
