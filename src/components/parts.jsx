import { useEffect, useState } from 'react';
import { profileIconUrl, rarityInfo, RARITIES } from '../lib/cdragon.js';

/* ------------------------------------------------------------------ */

export function Header({ profile, source, lastSyncAt, onImport }) {
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
          {profile ? `Nivel ${profile.level}` : 'Cámara de skins'}
          {lastSyncAt && (
            <>
              <span className="dot">◆</span>
              Sincronizado {relativeTime(lastSyncAt)}
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

export function StatsVault({ ownedCount, totalCount, chromasOwned, chromasTotal, byRarity, loot }) {
  const pct = totalCount ? Math.round((ownedCount / totalCount) * 1000) / 10 : 0;
  const chests = loot?.chests?.reduce((n, c) => n + c.count, 0) ?? null;
  const permanents = loot?.skinPermanents?.length ?? 0;
  return (
    <section className="vault" aria-label="Resumen de la colección">
      <div className="vault__row">
        <div>
          <div className="vault__label">Skins en la cámara</div>
          <div className="vault__count">
            {ownedCount}
            <small> / {totalCount} · {pct}%</small>
          </div>
        </div>
        <div className="vault__extra">
          <div><strong>{chromasOwned}</strong>{chromasTotal ? ` / ${chromasTotal}` : ''} chromas</div>
          {loot && (
            <div>
              <strong>{loot.skinShards?.length ?? 0}</strong> fragmentos
              {permanents > 0 && <> · <strong>{permanents}</strong> skins por activar</>}
              {chests != null && chests > 0 && <> · <strong>{chests}</strong> cofres</>}
            </div>
          )}
        </div>
      </div>
      <div className="vault__bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
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

export function Controls({
  mode, onMode, query, onQuery, view, onView, sort, onSort,
  rarities, onToggleRarity, flags, onToggleFlag,
}) {
  return (
    <div className="controls">
      <div className="controls__row">
        <nav className="tabs" aria-label="Tipo de colección">
          <button className={`tab ${mode === 'skins' ? 'tab--active' : ''}`} onClick={() => onMode('skins')}>
            Skins
          </button>
          <button className={`tab ${mode === 'chromas' ? 'tab--active' : ''}`} onClick={() => onMode('chromas')}>
            Chromas
          </button>
        </nav>
        <input
          className="controls__search"
          type="search"
          placeholder={mode === 'chromas' ? 'Buscar chroma, skin o campeón' : 'Buscar skin o campeón'}
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          aria-label="Buscar"
        />
        <select className="controls__sort" value={sort} onChange={(e) => onSort(e.target.value)} aria-label="Ordenar campeones">
          <option value="mastery">Por maestría</option>
          <option value="completion">Más completos</option>
          <option value="alpha">Alfabético</option>
        </select>
      </div>

      <div className="controls__row controls__row--filters">
        {VIEWS.map(([value, label]) => (
          <button
            key={value}
            className={`chip ${view === value ? 'chip--active' : ''}`}
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
          onClick={() => onToggleFlag('legacy')}
          title="Solo skins Legacy / de legado"
        >
          ⌛ Legacy
        </button>
        {mode === 'skins' && (
          <button
            className={`chip ${flags.withChromas ? 'chip--active' : ''}`}
            onClick={() => onToggleFlag('withChromas')}
            title="Solo skins que tienen chromas"
          >
            ◈ Con chromas
          </button>
        )}
      </div>
    </div>
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

export function SkinCard({ skin, owned, chromasOwned, assetUrl, onOpen }) {
  const rarity = rarityInfo(skin.rarity);
  return (
    <article
      className={`skin ${owned ? 'skin--owned' : 'skin--locked'}`}
      title={`${skin.name} · ${rarity.label}${skin.isLegacy ? ' · Legacy' : ''}${owned ? '' : ' · no poseída'}`}
      role="button"
      tabIndex={0}
      onClick={() => onOpen(skin)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(skin); } }}
    >
      {skin.image && <img className="skin__img" src={assetUrl(skin.image)} alt={skin.name} loading="lazy" />}
      <div className="skin__veil" />
      {!owned && <LockIcon />}
      {skin.chromaTotal > 0 && (
        <span className="skin__chromas">◈ {chromasOwned}/{skin.chromaTotal}</span>
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

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
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
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={skin.name}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal__close" onClick={onClose} aria-label="Cerrar">✕</button>

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
              {selectedOwned ? 'En tu cámara' : 'No poseído'}
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
