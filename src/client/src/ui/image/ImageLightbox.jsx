// src/client/src/ui/image/ImageLightbox.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Agrandissement d'une image, plein écran (spec_journal.md partie IV, I-3) : zoom (molette,
// − / +, 100 %), images voisines (flèches à l'écran ou au clavier, « 2 / 3 »), légende.
// Fermeture : Échap, bouton, clic à côté de l'image. Au-dessus de tout.
// Habillage : classes vtt-lightbox-* (ui/image/image.css).
//
// Props :
//   images   [{ src, caption? }] : les images parcourues (une note entière)
//   index    image affichée à l'ouverture (défaut 0)
//   src      raccourci pour une seule image (ancien contrat)
//   onClose
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

const MIN_ZOOM = 1;
const MAX_ZOOM = 5;
const clampZoom = (z) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z));

const ImageLightbox = ({ images, index = 0, src, onClose }) => {
    const list = images?.length ? images : [{ src, caption: '' }];
    const [current, setCurrent] = useState(Math.min(Math.max(0, index), list.length - 1));
    const [zoom, setZoom] = useState(1);
    const image = list[current];

    const go = (delta) => { setCurrent(i => (i + delta + list.length) % list.length); setZoom(1); };

    useEffect(() => {
        const onKey = (e) => {
            if (e.key === 'Escape') onClose();
            else if (e.key === 'ArrowRight' && list.length > 1) { setCurrent(i => (i + 1) % list.length); setZoom(1); }
            else if (e.key === 'ArrowLeft' && list.length > 1) { setCurrent(i => (i - 1 + list.length) % list.length); setZoom(1); }
        };
        document.addEventListener('keydown', onKey);
        document.body.style.overflow = 'hidden';   // pas de défilement de la page dessous
        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = '';
        };
    }, [onClose, list.length]);

    const onWheel = (e) => setZoom(z => clampZoom(z * (e.deltaY < 0 ? 1.15 : 1 / 1.15)));

    return createPortal(
        <div className="vtt-lightbox" role="dialog" aria-modal="true" aria-label="Image agrandie">
            <div className="vtt-lightbox-top">
                {list.length > 1 && <span className="vtt-lightbox-count">{current + 1} / {list.length}</span>}
                <span className="vtt-lightbox-spacer" />
                <button type="button" className="vtt-lightbox-btn" onClick={() => setZoom(z => clampZoom(z / 1.25))} title="Dézoomer" aria-label="Dézoomer">−</button>
                <button type="button" className="vtt-lightbox-btn" onClick={() => setZoom(1)} title="Taille d'origine">{Math.round(zoom * 100)} %</button>
                <button type="button" className="vtt-lightbox-btn" onClick={() => setZoom(z => clampZoom(z * 1.25))} title="Zoomer" aria-label="Zoomer">+</button>
                <button type="button" className="vtt-lightbox-btn" onClick={onClose} title="Fermer (Échap)" aria-label="Fermer">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
                </button>
            </div>
            {/* Clic à côté de l'image : fermeture */}
            <div className="vtt-lightbox-stage" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }} onWheel={onWheel}>
                <img src={image.src} alt={image.caption || ''} style={{ transform: `scale(${zoom})` }} draggable={false} />
                {list.length > 1 && (
                    <>
                        <button type="button" className="vtt-lightbox-nav is-prev" onClick={() => go(-1)} title="Image précédente (←)" aria-label="Image précédente">‹</button>
                        <button type="button" className="vtt-lightbox-nav is-next" onClick={() => go(1)} title="Image suivante (→)" aria-label="Image suivante">›</button>
                    </>
                )}
            </div>
            <div className="vtt-lightbox-caption">{image.caption}</div>
        </div>,
        document.body,
    );
};

export default ImageLightbox;
