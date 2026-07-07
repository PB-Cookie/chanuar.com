// Lectura de la colección. Dos fuentes posibles:
//  1. Supabase (anon key, solo lectura garantizada por RLS) — la normal.
//  2. Un JSON exportado por el collector, importado a mano — útil antes de
//     configurar Supabase o para probar en local.
// Ambas devuelven la misma forma de datos ("ownership").

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

/** @returns forma común "ownership" (o null si Supabase no está configurado) */
export async function fetchOwnership() {
  if (!dbConfigured) return null;

  const [profiles, skins, chromas, mastery, lastRun] = await Promise.all([
    q('profiles?select=*&order=updated_at.desc&limit=1'),
    qAll('owned_skins?select=skin_id'),
    qAll('owned_chromas?select=chroma_id,skin_id'),
    qAll('mastery?select=champion_id,level,points'),
    q('sync_runs?select=ran_at,stats,loot&order=ran_at.desc&limit=1'),
  ]);

  const chromasBySkin = new Map();
  for (const c of chromas) chromasBySkin.set(c.skin_id, (chromasBySkin.get(c.skin_id) ?? 0) + 1);

  return {
    source: 'supabase',
    profile: profiles[0] ?? null,
    ownedSkinIds: new Set(skins.map((r) => r.skin_id)),
    ownedChromaIds: new Set(chromas.map((r) => r.chroma_id)),
    chromasOwned: chromas.length,
    chromasBySkin,
    masteryByChampion: new Map(mastery.map((m) => [m.champion_id, m])),
    lastSyncAt: lastRun[0]?.ran_at ?? null,
    loot: lastRun[0]?.loot ?? null,
  };
}

/** Convierte el JSON del collector (v0.1/v0.2) a la misma forma "ownership". */
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
  };
}
