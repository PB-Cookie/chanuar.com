import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { rarityInfo } from '../api/catalog';
import type { Skin } from '../model/types';

type AssetUrl = (path: string | null | undefined) => string;
type CssVars = CSSProperties & Record<`--${string}`, string | undefined>;
const cssVars = (vars: Record<`--${string}`, string | undefined>) => vars as CssVars;

/* ------------------------------------------------------------------ */
/* Modal: splash en grande + galería de chromas                        */

export function SkinModal({ skin, initialChromaId, skinOwned, ownedChromaIds, assetUrl, onClose }: {
  skin: Skin; initialChromaId: number | null; skinOwned: boolean; ownedChromaIds: Set<number>; assetUrl: AssetUrl; onClose: () => void;
}) {
  const [selectedId, setSelectedId] = useState(initialChromaId ?? null);
  const [imgFailed, setImgFailed] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Gestión de foco del diálogo: entrar al abrir y devolverlo a la carta
  // que lo abrió al cerrar. Solo al montar/desmontar (deps vacías): si
  // dependiera de props recreadas por render, robaría el foco a mitad de uso.
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
      opener?.focus();
    };
  }, []);

  // Escape cierra; Tab queda atrapado dentro del diálogo (aria-modal es solo
  // una promesa para lectores de pantalla, no restringe el foco real).
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') return onClose();
      if (e.key !== 'Tab' || !dialogRef.current) return;
      const focusables = dialogRef.current.querySelectorAll<HTMLButtonElement>('button');
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last!.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first!.focus(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

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
            <span className="skin__gem" style={cssVars({ '--stone': rarity.color })} aria-hidden="true" />
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
                  onClick={() => { setImgFailed(false); setSelectedId(null); }}
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
                      style={cssVars({ '--c0': c.colors[0], '--c1': c.colors[1] ?? c.colors[0] })}
                      onClick={() => { setImgFailed(false); setSelectedId(c.id); }}
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
