// @ts-nocheck -- existing presentation markup; loader and pure collection model remain enforced.
import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { useLoaderData, useRevalidator, useRouteError } from 'react-router';
import { fetchCatalog, assetUrl } from '../api/catalog';
import { fetchOwnership, ownershipFromExport, dbConfigured } from '../api/ownership';
import {
  Header, StatsVault, Controls, ChampionSection, ChromaSection, SkinModal,
  OffersSection, CosmeticsSection, ActivitySection,
} from '../components/parts';
import { buildChromaSections, buildSkinSections, chromaTotal, rarityTotals } from '../model/collection';
import type { Catalog, Ownership } from '../model/types';
import '../skinfolio.css';

type SkinfolioRouteData = { catalog: Catalog; ownership: Ownership | null; warning: string | null };

export async function loader(): Promise<SkinfolioRouteData> {
  const catalog = await fetchCatalog();
  if (!dbConfigured) return { catalog, ownership: null, warning: null };
  try {
    return { catalog, ownership: await fetchOwnership(), warning: null };
  } catch (error) {
    return { catalog, ownership: null, warning: `No se pudo leer tu colección de Supabase (${(error as Error).message}). Puedes importar el JSON del collector.` };
  }
}

const EMPTY_OWNERSHIP = {
  source: 'ninguna',
  profile: null,
  ownedSkinIds: new Set(),
  ownedChromaIds: new Set(),
  chromasOwned: 0,
  chromasBySkin: new Map(),
  masteryByChampion: new Map(),
  lastSyncAt: null,
  loot: null,
  // Contrato v0.3: cartera, distinciones, valor de tienda, ofertas, partidas,
  // cosméticos, actividad e histórico de sincronizaciones.
  wallet: null,
  flair: null,
  collectionValueRp: 0,
  pricedOwnedCount: 0,
  offers: [],
  matches: [],
  cosmetics: { wards: new Set(), emotes: new Set(), icons: new Set() },
  events: [],
  syncHistory: [],
};

export default function App({ initialData = null }: { initialData?: SkinfolioRouteData | null } = {}) {
  const [catalog, setCatalog] = useState(initialData?.catalog ?? null);
  const [ownership, setOwnership] = useState(initialData?.ownership ? { ...EMPTY_OWNERSHIP, ...initialData.ownership } : EMPTY_OWNERSHIP);
  const [error, setError] = useState(null); // fatal: sin catálogo no hay nada que pintar
  const [warn, setWarn] = useState(initialData?.warning ?? null);   // no fatal: la colección falló pero la web sigue

  const [mode, setMode] = useState('skins');       // 'skins' | 'chromas' | 'ofertas' | 'otros' | 'actividad'
  const [query, setQuery] = useState('');
  // Filtrar ~1900 cartas en cada pulsación bloquea el tecleo: el input usa
  // `query` (respuesta inmediata) y las vistas usan la versión diferida.
  const deferredQuery = useDeferredValue(query);
  const [view, setView] = useState('all');         // 'all' | 'owned' | 'missing'
  const [sort, setSort] = useState('mastery');     // 'mastery' | 'completion' | 'alpha'
  const [rarities, setRarities] = useState(new Set());
  const [flags, setFlags] = useState({ legacy: false, withChromas: false });
  const [modal, setModal] = useState(null); // { skin, chromaId } | null
  const fileInput = useRef(null);

  const openSkin = (skin, chromaId = null) => setModal({ skin, chromaId });
  const closeModal = () => setModal(null);

  useEffect(() => {
    if (initialData) return;
    fetchCatalog().then(setCatalog).catch((e) => setError(e.message));
    if (dbConfigured) {
      fetchOwnership()
        .then((o) => o && setOwnership({ ...EMPTY_OWNERSHIP, ...o }))
        .catch((e) => setWarn(`No se pudo leer tu colección de Supabase (${e.message}). Puedes importar el JSON del collector.`));
    }
  }, [initialData]);

  function importFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    file.text()
      .then((text) => {
        setOwnership({ ...EMPTY_OWNERSHIP, ...ownershipFromExport(JSON.parse(text)) });
        setWarn(null);
      })
      .catch(() => setWarn('El archivo no parece un export del collector.'));
    e.target.value = '';
  }

  const toggleRarity = (key) =>
    setRarities((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  const toggleFlag = (key) => setFlags((prev) => ({ ...prev, [key]: !prev[key] }));

  // Totales por rareza para la estantería de gemas
  const byRarity = useMemo(() => catalog ? rarityTotals(catalog, ownership) : new Map(), [catalog, ownership]);

  const chromasTotal = useMemo(() => catalog ? chromaTotal(catalog) : 0, [catalog]);

  /* // Filtros comunes a ambas vistas (a nivel de skin); la búsqueda se aplica aparte
  // porque en la vista de chromas también debe casar por nombre de chroma.
  function skinPassesBaseFilters(skin) {
    if (rarities.size > 0 && !rarities.has(skin.rarity)) return false;
    if (flags.legacy && !skin.isLegacy) return false;
    if (mode === 'skins' && flags.withChromas && skin.chromaTotal === 0) return false;
    return true;
  }

  const sortSections = (list) => {
    const masteryPts = (id) => ownership.masteryByChampion.get(id)?.points ?? 0;
    if (sort === 'alpha') list.sort((a, b) => a.champ.name.localeCompare(b.champ.name, 'es'));
    else if (sort === 'completion')
      list.sort((a, b) => (b.ownedCount / (b.total || 1)) - (a.ownedCount / (a.total || 1)) || b.ownedCount - a.ownedCount);
    else list.sort((a, b) => masteryPts(b.champ.id) - masteryPts(a.champ.id) || a.champ.name.localeCompare(b.champ.name, 'es'));
    return list;
  };

  // Vista SKINS: secciones por campeón con cartas de skin
  const legacySkinSections = useMemo(() => {
    if (!catalog || mode !== 'skins') return [];
    const q = norm(deferredQuery.trim());
    const list = catalog.champions.map((champ) => {
      const all = catalog.skinsByChampion.get(champ.id) ?? [];
      const champMatches = q && norm(champ.name).includes(q);
      let skins = all.filter((s) =>
        skinPassesBaseFilters(s) && (!q || champMatches || norm(s.name).includes(q)));
      if (view === 'owned') skins = skins.filter((s) => ownership.ownedSkinIds.has(s.id));
      if (view === 'missing') skins = skins.filter((s) => !ownership.ownedSkinIds.has(s.id));
      const ownedCount = all.reduce((n, s) => n + (ownership.ownedSkinIds.has(s.id) ? 1 : 0), 0);
      return { champ, skins, ownedCount, total: all.length };
    }).filter((x) => x.skins.length > 0);
    return sortSections(list);
  }, [catalog, ownership, mode, deferredQuery, view, sort, rarities, flags]);

  // Vista CHROMAS: secciones por campeón; cada entrada = skin + sus chromas visibles
  const legacyChromaSections = useMemo(() => {
    if (!catalog || mode !== 'chromas') return [];
    const q = norm(deferredQuery.trim());
    const list = catalog.champions.map((champ) => {
      const champMatches = q && norm(champ.name).includes(q);
      const all = (catalog.skinsByChampion.get(champ.id) ?? []).filter((s) => s.chromaTotal > 0);
      let ownedCount = 0, total = 0;
      const entries = [];
      for (const skin of all) {
        total += skin.chromaTotal;
        ownedCount += skin.chromas.reduce((n, c) => n + (ownership.ownedChromaIds.has(c.id) ? 1 : 0), 0);
        if (!skinPassesBaseFilters(skin)) continue;
        let chromas = skin.chromas;
        if (q && !champMatches && !norm(skin.name).includes(q)) {
          // La skin no casa por nombre: la búsqueda aún puede casar por chroma
          chromas = chromas.filter((c) => norm(c.name).includes(q));
        }
        if (view === 'owned') chromas = chromas.filter((c) => ownership.ownedChromaIds.has(c.id));
        if (view === 'missing') chromas = chromas.filter((c) => !ownership.ownedChromaIds.has(c.id));
        if (chromas.length > 0) entries.push({ skin, chromas });
      }
      return { champ, entries, ownedCount, total };
    }).filter((x) => x.entries.length > 0);
    return sortSections(list);
  }, [catalog, ownership, mode, deferredQuery, view, sort, rarities, flags]); */

  const filters = useMemo(() => ({ query: deferredQuery, view, sort, rarities, legacy: flags.legacy, withChromas: flags.withChromas }), [deferredQuery, view, sort, rarities, flags]);
  const skinSections = useMemo(() => catalog && mode === 'skins' ? buildSkinSections(catalog, ownership, filters) : [], [catalog, ownership, mode, filters]);
  const chromaSections = useMemo(() => catalog && mode === 'chromas' ? buildChromaSections(catalog, ownership, filters) : [], [catalog, ownership, mode, filters]);

  if (error) {
    return (
      <div className="app">
        <div className="notice"><strong>Algo ha fallado:</strong> {error}. Recarga la página para reintentar.</div>
      </div>
    );
  }
  if (!catalog) return <div className="app"><div className="loading">Abriendo la colección…</div></div>;

  const isCollection = mode === 'skins' || mode === 'chromas';
  const sections = mode === 'skins' ? skinSections : chromaSections;

  return (
    <div className="app">
      <input ref={fileInput} type="file" accept="application/json" hidden onChange={importFile} />
      <Header
        profile={ownership.profile}
        source={ownership.source}
        lastSyncAt={ownership.lastSyncAt}
        flair={ownership.flair}
        onImport={() => fileInput.current?.click()}
      />

      {warn && (
        <div className="notice">
          <strong>Aviso:</strong> {warn}
          <button onClick={() => setWarn(null)}>Cerrar</button>
        </div>
      )}

      {ownership.source === 'ninguna' && (
        <div className="notice">
          <strong>Todavía no hay datos de tu colección.</strong> Configura las variables de Supabase
          (<code>web/.env</code>) o importa el JSON generado por el collector.
          <button onClick={() => fileInput.current?.click()}>Importar JSON</button>
        </div>
      )}

      <StatsVault
        ownedCount={ownership.ownedSkinIds.size}
        totalCount={catalog.totals.skins}
        chromasOwned={ownership.chromasOwned}
        chromasTotal={chromasTotal}
        byRarity={byRarity}
        loot={ownership.loot}
        collectionValueRp={ownership.collectionValueRp}
        pricedOwnedCount={ownership.pricedOwnedCount}
        wallet={ownership.wallet}
      />

      <Controls
        mode={mode} onMode={setMode}
        query={query} onQuery={setQuery}
        view={view} onView={setView}
        sort={sort} onSort={setSort}
        rarities={rarities} onToggleRarity={toggleRarity}
        flags={flags} onToggleFlag={toggleFlag}
        offersCount={ownership.offers.length}
      />

      {isCollection && sections.length === 0 && (
        <div className="empty">
          {ownership.source === 'ninguna' && view !== 'all'
            ? 'Aún no hay colección cargada: importa el JSON del collector para ver lo que tienes.'
            : 'Nada coincide con esos filtros. Prueba con otro nombre o quita alguno.'}
        </div>
      )}

      {mode === 'skins' &&
        skinSections.map(({ champ, skins, ownedCount, total }) => (
          <ChampionSection
            key={champ.id}
            champion={champ}
            skins={skins}
            ownedCount={ownedCount}
            total={total}
            ownedSkinIds={ownership.ownedSkinIds}
            chromasBySkin={ownership.chromasBySkin}
            mastery={ownership.masteryByChampion.get(champ.id)}
            assetUrl={assetUrl}
            onOpen={openSkin}
          />
        ))}

      {mode === 'chromas' &&
        chromaSections.map(({ champ, entries, ownedCount, total }) => (
          <ChromaSection
            key={champ.id}
            champion={champ}
            entries={entries}
            ownedCount={ownedCount}
            total={total}
            ownedChromaIds={ownership.ownedChromaIds}
            ownedSkinIds={ownership.ownedSkinIds}
            mastery={ownership.masteryByChampion.get(champ.id)}
            assetUrl={assetUrl}
            onOpen={openSkin}
          />
        ))}

      {mode === 'ofertas' && (
        <OffersSection
          offers={ownership.offers}
          catalog={catalog}
          ownedSkinIds={ownership.ownedSkinIds}
          chromasBySkin={ownership.chromasBySkin}
          assetUrl={assetUrl}
          onOpen={openSkin}
        />
      )}

      {mode === 'otros' && (
        <CosmeticsSection
          cosmetics={ownership.cosmetics}
          query={deferredQuery}
          assetUrl={assetUrl}
        />
      )}

      {mode === 'actividad' && (
        <ActivitySection
          syncHistory={ownership.syncHistory}
          events={ownership.events}
          matches={ownership.matches}
          ownedCount={ownership.ownedSkinIds.size}
          catalog={catalog}
          assetUrl={assetUrl}
        />
      )}

      {modal && (
        <SkinModal
          skin={modal.skin}
          initialChromaId={modal.chromaId}
          skinOwned={ownership.ownedSkinIds.has(modal.skin.id)}
          ownedChromaIds={ownership.ownedChromaIds}
          assetUrl={assetUrl}
          onClose={closeModal}
        />
      )}
    </div>
  );
}

export function Component() {
  return <App initialData={useLoaderData() as SkinfolioRouteData} />;
}

export function ErrorBoundary() {
  const error = useRouteError() as Error;
  const revalidator = useRevalidator();
  return <main className="app"><div className="notice" role="alert"><strong>Algo ha fallado:</strong> {error.message}. <button type="button" onClick={() => revalidator.revalidate()}>Reintentar</button></div></main>;
}
