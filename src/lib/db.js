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

const URL = import.meta.env.VITE_SUPABASE_URL;
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const dbConfigured = Boolean(URL && KEY);

async function q(pathAndQuery, range) {
  const headers = { apikey: KEY, Authorization: `Bearer ${KEY}` };
  if (range) {
    headers.Range = range;
    headers['Range-Unit'] = 'items';
  }
  const res = await fetch(`${URL.replace(/\/+$/, '')}/rest/v1/${pathAndQuery}`, { headers });
  if (!res.ok) throw new Error(`Supabase → HTTP ${res.status} en ${pathAndQuery}`);
  return res.json();
}

/** Lectura paginada (Supabase corta en 1000 filas por defecto). */
async function qAll(pathAndQuery, pageSize = 1000) {
  const rows = [];
  for (let offset = 0; ; offset += pageSize) {
    const page = await q(pathAndQuery, `${offset}-${offset + pageSize - 1}`);
    rows.push(...page);
    if (page.length < pageSize) return rows;
  }
}

/** Envuelve una promesa opcional: si falla (p. ej. tabla inexistente) → null. */
const safe = (p) => p.catch(() => null);

// ── Normalizadores: unifican las filas de Supabase (snake_case) y las del
//    JSON exportado (camelCase) en la misma forma de salida (camelCase). ──────

const normalizePrice = (r) => ({
  skinId: r.skin_id ?? r.skinId ?? null,
  championId: r.champion_id ?? r.championId ?? null,
  rp: r.rp ?? null,
  saleRp: r.sale_rp ?? r.saleRp ?? null,
  discount: r.discount ?? 0,
  saleEndsAt: r.sale_ends_at ?? r.saleEndsAt ?? null,
  owned: Boolean(r.owned),
});

const normalizeMatch = (m) => ({
  gameId: m.game_id ?? m.gameId ?? null,
  playedAt: m.played_at ?? m.playedAt ?? null,
  queueId: m.queue_id ?? m.queueId ?? null,
  durationS: m.duration_s ?? m.durationS ?? null,
  championId: m.champion_id ?? m.championId ?? null,
  win: m.win ?? null,
  kills: m.kills ?? null,
  deaths: m.deaths ?? null,
  assists: m.assists ?? null,
});

/** A partir de precios normalizados: valor de la colección y ofertas activas. */
function priceDerived(entries) {
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
    .sort((a, b) => (Number(a.owned) - Number(b.owned)) || (b.discount - a.discount));
  return { collectionValueRp, pricedOwnedCount, offers };
}

/** Ordena partidas por fecha desc y recorta a las 12 más recientes. */
const topMatches = (list) =>
  list
    .slice()
    .sort((a, b) => new Date(b.playedAt).getTime() - new Date(a.playedAt).getTime())
    .slice(0, 12);

/** Filas de owned_cosmetics → { wards, emotes, icons } como Sets de ids. */
const cosmeticsFromRows = (rows) => {
  const wards = new Set(), emotes = new Set(), icons = new Set();
  for (const r of rows ?? []) {
    if (r.item_type === 'ward') wards.add(r.item_id);
    else if (r.item_type === 'emote') emotes.add(r.item_id);
    else if (r.item_type === 'icon') icons.add(r.item_id);
  }
  return { wards, emotes, icons };
};

/** @returns forma común "ownership" (o null si Supabase no está configurado) */
export async function fetchOwnership() {
  if (!dbConfigured) return null;

  // Consultas base (tablas que siempre existen). Si alguna falla, rompe todo.
  const [profiles, skins, chromas, mastery, lastRun] = await Promise.all([
    q('profiles?select=*&order=updated_at.desc&limit=1'),
    qAll('owned_skins?select=skin_id'),
    qAll('owned_chromas?select=chroma_id,skin_id'),
    qAll('mastery?select=champion_id,level,points'),
    q('sync_runs?select=ran_at,stats,loot,wallet&order=ran_at.desc&limit=1'),
  ]);

  // Consultas contra tablas nuevas (pueden no existir aún): fallo → default.
  const [prices, matchesRaw, cosmeticsRows, eventsRaw, syncRows] = await Promise.all([
    safe(qAll('skin_prices?select=*')),
    safe(q('matches?select=*&order=played_at.desc&limit=12')),
    safe(qAll('owned_cosmetics?select=item_type,item_id')),
    safe(q('ownership_events?select=item_type,item_id,champion_id,acquired_at&is_initial=eq.false&order=acquired_at.desc&limit=60')),
    safe(qAll('sync_runs?select=ran_at,stats&order=ran_at.asc')),
  ]);

  const chromasBySkin = new Map();
  for (const c of chromas) chromasBySkin.set(c.skin_id, (chromasBySkin.get(c.skin_id) ?? 0) + 1);

  const priceEntries = (prices ?? []).map(normalizePrice);
  const { collectionValueRp, pricedOwnedCount, offers } = priceDerived(priceEntries);

  const matches = topMatches((matchesRaw ?? []).map(normalizeMatch));

  const events = (eventsRaw ?? []).map((e) => ({
    itemType: e.item_type,
    itemId: e.item_id,
    championId: e.champion_id,
    acquiredAt: e.acquired_at,
  }));

  const syncHistory = (syncRows ?? [])
    .filter((r) => r.stats != null)
    .map((r) => ({
      ranAt: r.ran_at,
      skinsOwned: r.stats.skinsOwned,
      chromasOwned: r.stats.chromasOwned,
    }));

  const profile = profiles[0] ?? null;

  return {
    source: 'supabase',
    profile,
    ownedSkinIds: new Set(skins.map((r) => r.skin_id)),
    ownedChromaIds: new Set(chromas.map((r) => r.chroma_id)),
    chromasOwned: chromas.length,
    chromasBySkin,
    masteryByChampion: new Map(mastery.map((m) => [m.champion_id, m])),
    lastSyncAt: lastRun[0]?.ran_at ?? null,
    loot: lastRun[0]?.loot ?? null,
    // ── Datos v0.3 ──
    wallet: lastRun[0]?.wallet ?? null,
    flair: profile?.flair ?? null,
    collectionValueRp,
    pricedOwnedCount,
    offers,
    matches,
    cosmetics: cosmeticsFromRows(cosmeticsRows),
    events,
    syncHistory,
  };
}

/** Convierte el JSON del collector (v0.1/v0.2/v0.3) a la misma forma "ownership". */
export function ownershipFromExport(json) {
  const ownedSkins = (json.skins ?? []).filter((s) => s.owned && !s.isBase);
  const chromasBySkin = new Map();
  const ownedChromaIds = new Set();
  for (const s of json.skins ?? []) {
    const owned = (s.chromas ?? []).filter((c) => c.owned);
    if (owned.length > 0) {
      chromasBySkin.set(s.id, owned.length);
      for (const c of owned) ownedChromaIds.add(c.id);
    }
  }

  const priceEntries = (json.prices ?? []).map(normalizePrice);
  const { collectionValueRp, pricedOwnedCount, offers } = priceDerived(priceEntries);

  const matches = topMatches((json.matches ?? []).map(normalizeMatch));

  const cos = json.cosmetics ?? {};
  const cosmetics = {
    wards: new Set(cos.wards ?? []),
    emotes: new Set(cos.emotes ?? []),
    icons: new Set(cos.icons ?? []),
  };

  return {
    source: 'archivo',
    profile: json.summoner
      ? {
          game_name: json.summoner.gameName,
          tag_line: json.summoner.tagLine,
          level: json.summoner.level,
          profile_icon_id: json.summoner.profileIconId,
        }
      : null,
    ownedSkinIds: new Set(ownedSkins.map((s) => s.id)),
    ownedChromaIds,
    chromasOwned: ownedChromaIds.size,
    chromasBySkin,
    masteryByChampion: new Map((json.mastery ?? []).map((m) => [m.championId, { points: m.points, level: m.level }])),
    lastSyncAt: json.meta?.generatedAt ?? null,
    loot: json.loot ?? null,
    // ── Datos v0.3 (exports antiguos carecen de estas secciones → defaults) ──
    wallet: json.wallet ?? null,
    flair: json.flair ?? null,
    collectionValueRp,
    pricedOwnedCount,
    offers,
    matches,
    cosmetics,
    events: [], // los exports no llevan historial de eventos
    syncHistory: [], // ni historial de sincronizaciones
  };
}
