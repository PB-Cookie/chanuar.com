// @ts-nocheck -- existing presentation markup; typed catalog/ownership models remain enforced.
import { useEffect, useRef, useState } from 'react';
import {
  profileIconUrl, championIconUrl, rarityInfo, RARITIES, fetchCosmeticsCatalog,
} from '../api/catalog';

// Búsqueda insensible a acentos/mayúsculas (mismo patrón que en App.jsx).
const norm = (s) => (s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

// "PLATINUM" → "Platinum": los niveles de reto llegan en mayúsculas.
const titleCase = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : s);

/* ------------------------------------------------------------------ */

export function Header({ profile, source, lastSyncAt, flair, onImport }) {
  return (
    <header className="header">
      {profile?.profile_icon_id != null && (
        <img className="header__icon" src={profileIconUrl(profile.profile_icon_id)} alt="" />
      )}
      <div>
        <h1 className="header__name">
          {profile ? profile.game_name : 'Skinfolio'}
          {profile?.tag_line && <span className="header__tag"> #{profile.tag_line}</span>}
        </h1>
        <div className="header__meta">
          {profile ? `Nivel ${profile.level}` : 'Colección de skins'}
          {lastSyncAt && (
            <>
              <span className="dot" aria-hidden="true">◆</span>
              Sincronizado {relativeTime(lastSyncAt)}
            </>
          )}
          {flair && (
            <>
              <span className="dot" aria-hidden="true">◆</span>
              Honor {flair.honorLevel}
              {flair.challengeLevel && (
                <span className="header__flair-muted"> · Retos {titleCase(flair.challengeLevel)}</span>
              )}
            </>
          )}
        </div>
      </div>
      <div className="header__spacer" />
      <span className={`header__source ${source === 'supabase' ? 'header__source--live' : ''}`}>
        {source === 'supabase' ? 'Supabase' : source === 'archivo' ? 'Archivo local' : 'Sin datos'}
      </span>
      <button className="btn" onClick={onImport}>Importar JSON</button>
    </header>
  );
}

export function relativeTime(iso) {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return 'ahora mismo';
  if (mins < 60) return `hace ${mins} min`;
  const hours = Math.round(mins / 60);
  if (hours < 48) return `hace ${hours} h`;
  return `hace ${Math.round(hours / 24)} días`;
}

/* ------------------------------------------------------------------ */

export function StatsVault({
  ownedCount, totalCount, chromasOwned, chromasTotal, byRarity, loot,
  collectionValueRp = 0, pricedOwnedCount = 0, wallet = null,
}) {
  const pct = totalCount ? Math.round((ownedCount / totalCount) * 1000) / 10 : 0;
  const chests = loot?.chests?.reduce((n, c) => n + c.count, 0) ?? null;
  const permanents = loot?.skinPermanents?.length ?? 0;
  return (
    <section className="vault" aria-label="Resumen de la colección">
      <div className="vault__row">
        <div>
          <div className="vault__label">Skins en la colección</div>
          <div className="vault__count">
            {ownedCount}
            <small> / {totalCount} · {pct}%</small>
          </div>
        </div>
        <div className="vault__extra">
          {collectionValueRp > 0 && (
            <div className="vault__value">
              <div className="vault__value-rp">≈ {collectionValueRp.toLocaleString('es')} RP</div>
              <div className="vault__value-sub">valor de tienda de {pricedOwnedCount} skins</div>
            </div>
          )}
          <div><strong>{chromasOwned}</strong>{chromasTotal ? ` / ${chromasTotal}` : ''} chromas</div>
          {loot && (
            <div>
              <strong>{loot.skinShards?.length ?? 0}</strong> fragmentos
              {permanents > 0 && <> · <strong>{permanents}</strong> skins por activar</>}
              {chests != null && chests > 0 && <> · <strong>{chests}</strong> cofres</>}
            </div>
          )}
          {wallet && (
            <div className="vault__wallet">
              {wallet.RP} RP · {wallet.lol_blue_essence.toLocaleString('es')} EA
            </div>
          )}
        </div>
      </div>
      <div
        className="vault__bar"
        role="progressbar"
        aria-label="Progreso de la colección de skins"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuetext={`${ownedCount} de ${totalCount} skins (${pct}%)`}
      >
        <div className="vault__bar-fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="gems">
        {Object.entries(RARITIES).map(([key, r]) => {
          const t = byRarity.get(key);
          if (!t || t.total === 0) return null;
          return (
            <span className="gem" key={key} style={{ '--stone': r.color }}>
              <span className="gem__stone" aria-hidden="true" />
              <span className="gem__count">{t.owned}<span className="gem__label">/{t.total}</span></span>
              <span className="gem__label">{r.label}</span>
            </span>
          );
        })}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

const VIEWS = [
  ['all', 'Todo'],
  ['owned', 'Poseído'],
  ['missing', 'Me falta'],
];

const TABS = [
  ['skins', 'Skins'],
  ['chromas', 'Chromas'],
  ['ofertas', 'Ofertas'],
  ['otros', 'Otros'],
  ['actividad', 'Actividad'],
];

export function Controls({
  mode, onMode, query, onQuery, view, onView, sort, onSort,
  rarities, onToggleRarity, flags, onToggleFlag, offersCount = 0,
}) {
  const showFilters = mode === 'skins' || mode === 'chromas';
  const showSearch = showFilters || mode === 'otros';
  const searchLabel = mode === 'otros'
    ? 'Buscar ward, emote o icono'
    : mode === 'chromas'
      ? 'Buscar chroma, skin o campeón'
      : 'Buscar skin o campeón';
  return (
    <>
      {/* Solo esta fila es sticky: en móvil los chips ocupan 3-4 filas y
          fijarlos también se comía media pantalla al hacer scroll. */}
      <div className="controls">
        <div className="controls__row">
          <div className="tabs" role="group" aria-label="Tipo de colección">
            {TABS.map(([value, label]) => (
              <button
                key={value}
                className={`tab ${mode === value ? 'tab--active' : ''}`}
                aria-pressed={mode === value}
                onClick={() => onMode(value)}
              >
                {label}
                {value === 'ofertas' && offersCount > 0 && (
                  <span className="tab__badge" aria-hidden="true">{offersCount}</span>
                )}
              </button>
            ))}
          </div>
          {showSearch && (
            <input
              className="controls__search"
              type="search"
              placeholder={searchLabel}
              value={query}
              onChange={(e) => onQuery(e.target.value)}
              aria-label={searchLabel}
            />
          )}
          {showFilters && (
            <select className="controls__sort" value={sort} onChange={(e) => onSort(e.target.value)} aria-label="Ordenar campeones">
              <option value="mastery">Por maestría</option>
              <option value="completion">Más completos</option>
              <option value="alpha">Alfabético</option>
            </select>
          )}
        </div>
      </div>

      {showFilters && (
      <div className="controls__row controls__row--filters">
        {VIEWS.map(([value, label]) => (
          <button
            key={value}
            className={`chip ${view === value ? 'chip--active' : ''}`}
            aria-pressed={view === value}
            onClick={() => onView(value)}
          >
            {label}
          </button>
        ))}

        <span className="controls__divider" aria-hidden="true" />

        {Object.entries(RARITIES).map(([key, r]) => (
          <button
            key={key}
            className={`chip chip--gem ${rarities.has(key) ? 'chip--active' : ''}`}
            style={{ '--stone': r.color }}
            aria-pressed={rarities.has(key)}
            onClick={() => onToggleRarity(key)}
            title={`Rareza: ${r.label}`}
          >
            <span className="chip__stone" aria-hidden="true" />
            {r.label}
          </button>
        ))}

        <span className="controls__divider" aria-hidden="true" />

        <button
          className={`chip ${flags.legacy ? 'chip--active' : ''}`}
          aria-pressed={flags.legacy}
          onClick={() => onToggleFlag('legacy')}
          title="Solo skins Legacy / de legado"
        >
          <span aria-hidden="true">⌛</span> Legacy
        </button>
        {mode === 'skins' && (
          <button
            className={`chip ${flags.withChromas ? 'chip--active' : ''}`}
            aria-pressed={flags.withChromas}
            onClick={() => onToggleFlag('withChromas')}
            title="Solo skins que existen con chromas en el catálogo (los tengas o no)"
          >
            <span aria-hidden="true">◈</span> Tiene chromas
          </button>
        )}
      </div>
      )}
    </>
  );
}

/* ------------------------------------------------------------------ */

function LockIcon() {
  return (
    <svg className="skin__lock" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="4" y="10" width="16" height="11" rx="1.5" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

export function SkinCard({ skin, owned, chromasOwned, assetUrl, onOpen, offer = null }) {
  const rarity = rarityInfo(skin.rarity);
  // El estado (poseída, rareza, chromas) solo se ve por color/candado: hay que
  // decirlo también en el nombre accesible para lectores de pantalla.
  const label = `${skin.name}, ${rarity.label}${skin.isLegacy ? ', Legacy' : ''}, ` +
    `${owned ? 'en tu colección' : 'no poseída'}` +
    (offer ? `, en oferta a ${offer.saleRp} RP, antes ${offer.rp} RP, ${offer.discount}% de descuento` : '') +
    (skin.chromaTotal > 0 ? `, ${chromasOwned} de ${skin.chromaTotal} chromas` : '');
  return (
    <article
      className={`skin ${owned ? 'skin--owned' : 'skin--locked'}`}
      title={`${skin.name} · ${rarity.label}${skin.isLegacy ? ' · Legacy' : ''}${owned ? '' : ' · no poseída'}`}
      role="button"
      tabIndex={0}
      aria-label={label}
      onClick={() => onOpen(skin)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(skin); } }}
    >
      {skin.image && <img className="skin__img" src={assetUrl(skin.image)} alt="" loading="lazy" />}
      <div className="skin__veil" />
      {!owned && <LockIcon />}
      {skin.chromaTotal > 0 && (
        <span className="skin__chromas">◈ {chromasOwned}/{skin.chromaTotal}</span>
      )}
      {offer && (
        <div className="skin__price">
          <span className="skin__price-sale">{offer.saleRp} RP</span>
          <span className="skin__price-was">{offer.rp} RP</span>
          <span className="skin__price-tag">-{offer.discount}%</span>
        </div>
      )}
      <div className="skin__name">
        <span className="skin__gem" style={{ '--stone': rarity.color }} aria-hidden="true" />
        {skin.name}
      </div>
    </article>
  );
}

/* ------------------------------------------------------------------ */

export function ChampionSection({ champion, skins, ownedCount, total, ownedSkinIds, chromasBySkin, mastery, assetUrl, onOpen }) {
  // ownedCount/total llegan calculados sobre TODAS las skins del campeón,
  // no sobre las filtradas: así "completo" no se enciende al filtrar por "Poseído".
  const complete = ownedCount === total && total > 0;
  return (
    <section className="champ">
      <div className="champ__head">
        <h2 className={`champ__name ${complete ? 'champ__name--complete' : ''}`}>{champion.name}</h2>
        <span className="champ__progress">{ownedCount}/{total}{complete ? ' · completo' : ''}</span>
        {mastery?.points > 0 && (
          <span className="champ__mastery">M{mastery.level ?? '?'} · {mastery.points.toLocaleString('es')} pts</span>
        )}
      </div>
      <div className="grid">
        {skins.map((s) => (
          <SkinCard
            key={s.id}
            skin={s}
            owned={ownedSkinIds.has(s.id)}
            chromasOwned={chromasBySkin.get(s.id) ?? 0}
            assetUrl={assetUrl}
            onOpen={onOpen}
          />
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Vista de chromas: una carta por skin, con sus chromas como gemas    */

function ChromaStone({ chroma, owned, onOpen }) {
  const [c0, c1] = [chroma.colors[0], chroma.colors[1] ?? chroma.colors[0]];
  return (
    <button
      className={`chroma ${owned ? 'chroma--owned' : 'chroma--locked'}`}
      style={{ '--c0': c0, '--c1': c1 }}
      title={`${chroma.name}${owned ? '' : ' · no poseído'} — ver en grande`}
      aria-label={`${chroma.name}, ${owned ? 'poseído' : 'no poseído'}`}
      onClick={onOpen}
    >
      <span className="chroma__stone" aria-hidden="true" />
      <span className="chroma__name">{chroma.name}</span>
    </button>
  );
}

export function ChromaCard({ skin, skinOwned, chromas, ownedChromaIds, assetUrl, onOpen }) {
  const ownedCount = chromas.reduce((n, c) => n + (ownedChromaIds.has(c.id) ? 1 : 0), 0);
  const rarity = rarityInfo(skin.rarity);
  return (
    <article className={`chromacard ${ownedCount > 0 ? 'chromacard--lit' : ''}`}>
      <button className="chromacard__thumb" onClick={() => onOpen(skin)} title={`Ver ${skin.name} en grande`}>
        {skin.image && <img src={assetUrl(skin.image)} alt="" loading="lazy" />}
      </button>
      <div className="chromacard__body">
        <div className="chromacard__title">
          <span className="skin__gem" style={{ '--stone': rarity.color }} aria-hidden="true" />
          <span className="chromacard__name">{skin.name}</span>
          <span className="chromacard__count">{ownedCount}/{chromas.length}</span>
        </div>
        <div className="chromacard__stones">
          {chromas.map((c) => (
            <ChromaStone
              key={c.id}
              chroma={c}
              owned={ownedChromaIds.has(c.id)}
              onOpen={() => onOpen(skin, c.id)}
            />
          ))}
        </div>
        {!skinOwned && <div className="chromacard__note">Skin no poseída</div>}
      </div>
    </article>
  );
}

export function ChromaSection({ champion, entries, ownedCount, total, ownedChromaIds, ownedSkinIds, mastery, assetUrl, onOpen }) {
  // ownedCount/total vienen del total real del campeón (sin filtros), ver ChampionSection.
  const complete = ownedCount === total && total > 0;
  return (
    <section className="champ">
      <div className="champ__head">
        <h2 className={`champ__name ${complete ? 'champ__name--complete' : ''}`}>{champion.name}</h2>
        <span className="champ__progress">{ownedCount}/{total} chromas{complete ? ' · completo' : ''}</span>
        {mastery?.points > 0 && (
          <span className="champ__mastery">M{mastery.level ?? '?'} · {mastery.points.toLocaleString('es')} pts</span>
        )}
      </div>
      <div className="chromagrid">
        {entries.map(({ skin, chromas }) => (
          <ChromaCard
            key={skin.id}
            skin={skin}
            skinOwned={ownedSkinIds.has(skin.id)}
            chromas={chromas}
            ownedChromaIds={ownedChromaIds}
            assetUrl={assetUrl}
            onOpen={onOpen}
          />
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Modal: splash en grande + galería de chromas                        */

export function SkinModal({ skin, initialChromaId, skinOwned, ownedChromaIds, assetUrl, onClose }) {
  const [selectedId, setSelectedId] = useState(initialChromaId ?? null);
  const [imgFailed, setImgFailed] = useState(false);
  const dialogRef = useRef(null);
  const closeRef = useRef(null);

  // Gestión de foco del diálogo: entrar al abrir y devolverlo a la carta
  // que lo abrió al cerrar. Solo al montar/desmontar (deps vacías): si
  // dependiera de props recreadas por render, robaría el foco a mitad de uso.
  useEffect(() => {
    const opener = document.activeElement;
    closeRef.current?.focus();
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
      opener?.focus?.();
    };
  }, []);

  // Escape cierra; Tab queda atrapado dentro del diálogo (aria-modal es solo
  // una promesa para lectores de pantalla, no restringe el foco real).
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') return onClose();
      if (e.key !== 'Tab' || !dialogRef.current) return;
      const focusables = dialogRef.current.querySelectorAll('button');
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => setImgFailed(false), [selectedId]);

  const rarity = rarityInfo(skin.rarity);
  const chroma = selectedId != null ? skin.chromas.find((c) => c.id === selectedId) : null;
  const showChromaRender = chroma?.image && !imgFailed;
  const bigSrc = showChromaRender
    ? assetUrl(chroma.image)
    : assetUrl(skin.splash || skin.image);
  const selectedOwned = chroma ? ownedChromaIds.has(chroma.id) : skinOwned;
  const ownedChromaCount = skin.chromas.reduce((n, c) => n + (ownedChromaIds.has(c.id) ? 1 : 0), 0);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        ref={dialogRef}
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={skin.name}
        onClick={(e) => e.stopPropagation()}
      >
        <button ref={closeRef} className="modal__close" onClick={onClose} aria-label="Cerrar">✕</button>

        <div className={`modal__img-wrap ${showChromaRender ? 'modal__img-wrap--render' : ''}`}>
          <img
            key={bigSrc}
            className="modal__img"
            src={bigSrc}
            alt={chroma ? `${skin.name} — chroma ${chroma.name}` : skin.name}
            onError={() => setImgFailed(true)}
          />
        </div>

        <div className="modal__info">
          <div className="modal__title">
            <span className="skin__gem" style={{ '--stone': rarity.color }} aria-hidden="true" />
            <h3 className="modal__name">
              {skin.name}
              {chroma && <span className="modal__chroma-name"> · {chroma.name}</span>}
            </h3>
            <span className={`pill ${selectedOwned ? 'pill--owned' : 'pill--locked'}`}>
              {selectedOwned ? 'En tu colección' : chroma ? 'No poseído' : 'No poseída'}
            </span>
          </div>

          {skin.chromas.length > 0 && (
            <>
              <div className="modal__sub">
                Chromas · {ownedChromaCount}/{skin.chromas.length} desbloqueados
              </div>
              <div className="modal__stones">
                <button
                  className={`stone stone--original ${selectedId === null ? 'stone--selected' : ''}`}
                  onClick={() => setSelectedId(null)}
                  title="Skin original"
                  aria-pressed={selectedId === null}
                >
                  <span className="stone__shape" />
                  <span className="stone__label">Original</span>
                </button>
                {skin.chromas.map((c) => {
                  const owned = ownedChromaIds.has(c.id);
                  return (
                    <button
                      key={c.id}
                      className={`stone ${owned ? 'stone--owned' : 'stone--locked'} ${selectedId === c.id ? 'stone--selected' : ''}`}
                      style={{ '--c0': c.colors[0], '--c1': c.colors[1] ?? c.colors[0] }}
                      onClick={() => setSelectedId(c.id)}
                      title={`${c.name}${owned ? '' : ' · no poseído'}`}
                      aria-label={`${c.name}, ${owned ? 'poseído' : 'no poseído'}`}
                      aria-pressed={selectedId === c.id}
                    >
                      <span className="stone__shape" />
                      <span className="stone__label">{c.name}</span>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Ofertas: rejilla de skins en promoción, reutiliza SkinCard          */

export function OffersSection({ offers, catalog, ownedSkinIds, chromasBySkin, assetUrl, onOpen }) {
  if (!offers || offers.length === 0) {
    return (
      <div className="empty">
        No hay datos de ofertas todavía. Sincroniza con el collector v0.3 para traer los precios de la tienda.
      </div>
    );
  }
  // Las ofertas llegan preordenadas (no poseídas primero, luego mayor descuento).
  const resolved = offers
    .map((offer) => ({ offer, skin: catalog.skinById.get(offer.skinId) }))
    .filter((x) => x.skin);
  const maxEnds = offers.reduce((max, o) => {
    const t = o.saleEndsAt ? new Date(o.saleEndsAt).getTime() : 0;
    return t > max ? t : max;
  }, 0);
  return (
    <section className="offers">
      <div className="section-head">
        <h2 className="section-head__title">Ofertas de la tienda</h2>
        {maxEnds > 0 && (
          <span className="section-head__sub">terminan {new Date(maxEnds).toLocaleDateString('es')}</span>
        )}
      </div>
      <div className="grid">
        {resolved.map(({ offer, skin }) => (
          <SkinCard
            key={offer.skinId}
            skin={skin}
            owned={ownedSkinIds.has(skin.id)}
            chromasOwned={chromasBySkin.get(skin.id) ?? 0}
            assetUrl={assetUrl}
            onOpen={onOpen}
            offer={offer}
          />
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Otros: cosméticos poseídos (wards, emotes, iconos), carga diferida  */

const COSMETIC_GROUPS = [
  ['wards', 'Wards'],
  ['emotes', 'Emotes'],
  ['icons', 'Iconos'],
];

export function CosmeticsSection({ cosmetics, query, assetUrl }) {
  const [catalog, setCatalog] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    fetchCosmeticsCatalog()
      .then((c) => { if (alive) setCatalog(c); })
      .catch((e) => { if (alive) setError(e.message); });
    return () => { alive = false; };
  }, []);

  if (error) {
    return <div className="notice"><strong>No se pudo abrir el arsenal:</strong> {error}.</div>;
  }
  if (!catalog) return <div className="loading">Abriendo el arsenal…</div>;

  const q = norm((query ?? '').trim());
  return (
    <section className="cosmetics">
      {COSMETIC_GROUPS.map(([type, label]) => {
        const map = catalog[type];
        const ownedIds = cosmetics[type] ?? new Set();
        const items = [...ownedIds]
          .map((id) => map.get(id))
          .filter((it) => it && (!q || norm(it.name).includes(q)));
        return (
          <div className="cos-group" key={type}>
            <div className="section-head">
              <h2 className="section-head__title">{label}</h2>
              <span className="section-head__sub">{ownedIds.size} / {map.size}</span>
            </div>
            {items.length > 0 ? (
              <div className="cos-grid">
                {items.map((it) => (
                  <figure className="cos-tile" key={it.id}>
                    <img className="cos-tile__img" src={assetUrl(it.image)} alt="" loading="lazy" />
                    <figcaption className="cos-tile__name" title={it.name}>{it.name}</figcaption>
                  </figure>
                ))}
              </div>
            ) : (
              <div className="cos-empty">Nada que mostrar en esta categoría.</div>
            )}
          </div>
        );
      })}
      <p className="cos-foot">Se muestran solo los que posees.</p>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Actividad: evolución + adquisiciones + últimas partidas             */

const QUEUES = {
  420: 'Solo/Dúo', 440: 'Flex', 450: 'ARAM', 400: 'Normal', 430: 'Normal',
  490: 'Partida rápida', 700: 'Clash', 900: 'URF', 1700: 'Arena', 1900: 'URF',
};

function Sparkline({ points, current }) {
  const values = points.map((p) => p.skinsOwned);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const W = 100, H = 48, pad = 4;
  const coords = values.map((v, i) => {
    const x = (i / (values.length - 1)) * W;
    const y = pad + (1 - (v - min) / range) * (H - pad * 2);
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  }).join(' ');
  return (
    <div className="spark">
      <svg className="spark__svg" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true">
        <polyline
          points={coords}
          fill="none"
          stroke="var(--gold)"
          strokeWidth="1.5"
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <span className="spark__now">{current}</span>
    </div>
  );
}

function eventName(ev, catalog) {
  switch (ev.itemType) {
    case 'skin': return catalog.skinById.get(ev.itemId)?.name ?? 'Skin nueva';
    case 'champion': return catalog.championById.get(ev.itemId)?.name ?? 'Campeón nuevo';
    case 'chroma': {
      const c = catalog.chromaById.get(ev.itemId);
      return c ? `${c.skin.name} · chroma ${c.chroma.name}` : 'Chroma nuevo';
    }
    case 'ward': return 'Nuevo ward';
    case 'emote': return 'Nuevo emote';
    case 'icon': return 'Nuevo icono';
    default: return 'Novedad';
  }
}

export function ActivitySection({ syncHistory = [], events = [], matches = [], ownedCount = 0, catalog }) {
  return (
    <section className="activity">
      <div className="act-block">
        <h2 className="section-head__title">Evolución</h2>
        {syncHistory.length >= 2 ? (
          <Sparkline points={syncHistory} current={ownedCount} />
        ) : (
          <p className="act-muted">La gráfica crecerá con cada sincronización.</p>
        )}
      </div>

      <div className="act-block">
        <h2 className="section-head__title">Adquisiciones recientes</h2>
        {events.length > 0 ? (
          <ul className="acq-list">
            {events.map((ev, i) => (
              <li className="acq" key={`${ev.itemType}-${ev.itemId}-${i}`}>
                <span className="acq__bullet" aria-hidden="true">◆</span>
                <span className="acq__name">{eventName(ev, catalog)}</span>
                <span className="acq__time">{relativeTime(ev.acquiredAt)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="act-muted">Aquí aparecerá cada skin nueva que consigas a partir de ahora.</p>
        )}
      </div>

      <div className="act-block">
        <h2 className="section-head__title">Últimas partidas</h2>
        {matches.length > 0 ? (
          <ul className="match-list">
            {matches.map((m) => {
              const champ = catalog.championById.get(m.championId);
              const queue = QUEUES[m.queueId] ?? `Cola ${m.queueId}`;
              return (
                <li className={`match ${m.win ? 'match--win' : 'match--loss'}`} key={m.gameId}>
                  <img className="match__icon" src={championIconUrl(m.championId)} alt="" loading="lazy" />
                  <div className="match__body">
                    <div className="match__line">
                      <span className="match__champ">{champ?.name ?? `Campeón ${m.championId}`}</span>
                      <span className="match__result">{m.win ? 'Victoria' : 'Derrota'}</span>
                    </div>
                    <div className="match__meta">
                      {queue} · {m.kills}/{m.deaths}/{m.assists} · {Math.round(m.durationS / 60)} min · {relativeTime(m.playedAt)}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="act-muted">Sin partidas registradas todavía.</p>
        )}
      </div>
    </section>
  );
}
