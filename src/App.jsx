import { useEffect, useMemo, useRef, useState } from 'react';
import { fetchCatalog, assetUrl } from './lib/cdragon.js';
import { fetchOwnership, ownershipFromExport, dbConfigured } from './lib/db.js';
import { Header, StatsVault, Controls, ChampionSection, ChromaSection, SkinModal } from './components/parts.jsx';

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
};

const norm = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

export default function App() {
  const [catalog, setCatalog] = useState(null);
  const [ownership, setOwnership] = useState(EMPTY_OWNERSHIP);
  const [error, setError] = useState(null); // fatal: sin catálogo no hay nada que pintar
  const [warn, setWarn] = useState(null);   // no fatal: la colección falló pero la web sigue

  const [mode, setMode] = useState('skins');       // 'skins' | 'chromas'
  const [query, setQuery] = useState('');
  const [view, setView] = useState('all');         // 'all' | 'owned' | 'missing'
  const [sort, setSort] = useState('mastery');     // 'mastery' | 'completion' | 'alpha'
  const [rarities, setRarities] = useState(new Set());
  const [flags, setFlags] = useState({ legacy: false, withChromas: false });
  const [modal, setModal] = useState(null); // { skin, chromaId } | null
  const fileInput = useRef(null);

  const openSkin = (skin, chromaId = null) => setModal({ skin, chromaId });
  const closeModal = () => setModal(null);

  useEffect(() => {
    fetchCatalog().then(setCatalog).catch((e) => setError(e.message));
    if (dbConfigured) {
      fetchOwnership()
        .then((o) => o && setOwnership({ ...EMPTY_OWNERSHIP, ...o }))
        .catch((e) => setWarn(`No se pudo leer tu colección de Supabase (${e.message}). Puedes importar el JSON del collector.`));
    }
  }, []);

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
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  const toggleFlag = (key) => setFlags((prev) => ({ ...prev, [key]: !prev[key] }));

  // Totales por rareza para la estantería de gemas
  const byRarity = useMemo(() => {
    const acc = new Map();
    if (!catalog) return acc;
    for (const skin of catalog.skinById.values()) {
      const cur = acc.get(skin.rarity) ?? { owned: 0, total: 0 };
      cur.total += 1;
      if (ownership.ownedSkinIds.has(skin.id)) cur.owned += 1;
      acc.set(skin.rarity, cur);
    }
    return acc;
  }, [catalog, ownership]);

  const chromasTotal = useMemo(() => {
    if (!catalog) return 0;
    let n = 0;
    for (const s of catalog.skinById.values()) n += s.chromaTotal;
    return n;
  }, [catalog]);

  // Filtros comunes a ambas vistas (a nivel de skin); la búsqueda se aplica aparte
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
  const skinSections = useMemo(() => {
    if (!catalog || mode !== 'skins') return [];
    const q = norm(query.trim());
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
  }, [catalog, ownership, mode, query, view, sort, rarities, flags]);

  // Vista CHROMAS: secciones por campeón; cada entrada = skin + sus chromas visibles
  const chromaSections = useMemo(() => {
    if (!catalog || mode !== 'chromas') return [];
    const q = norm(query.trim());
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
  }, [catalog, ownership, mode, query, view, sort, rarities, flags]);

  if (error) {
    return (
      <div className="app">
        <div className="notice"><strong>Algo ha fallado:</strong> {error}. Recarga la página para reintentar.</div>
      </div>
    );
  }
  if (!catalog) return <div className="app"><div className="loading">Abriendo la cámara…</div></div>;

  const sections = mode === 'skins' ? skinSections : chromaSections;

  return (
    <div className="app">
      <input ref={fileInput} type="file" accept="application/json" hidden onChange={importFile} />
      <Header
        profile={ownership.profile}
        source={ownership.source}
        lastSyncAt={ownership.lastSyncAt}
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
      />

      <Controls
        mode={mode} onMode={setMode}
        query={query} onQuery={setQuery}
        view={view} onView={setView}
        sort={sort} onSort={setSort}
        rarities={rarities} onToggleRarity={toggleRarity}
        flags={flags} onToggleFlag={toggleFlag}
      />

      {sections.length === 0 && (
        <div className="empty">Nada coincide con esos filtros. Prueba con otro nombre o quita alguno.</div>
      )}

      {mode === 'skins'
        ? skinSections.map(({ champ, skins, ownedCount, total }) => (
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
          ))
        : chromaSections.map(({ champ, entries, ownedCount, total }) => (
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
