// src/client/src/features/board/BoardTextInput.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Saisie d'un texte du tableau (documentations/spec_tableau.md §13.1) : champ posé
// sur le cadre, à l'endroit du texte, à sa taille au zoom courant.
// Entrée valide, Maj+Entrée va à la ligne, Échap annule, quitter le champ valide.
// À la validation, le texte est mesuré (largeur de la plus longue ligne, hauteur
// des lignes) dans la police du champ, qui est celle du tableau (slug).
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect, useRef, useState } from 'react';

export const TEXT_LINE_HEIGHT = 1.25;
export const MAX_TEXT_LENGTH = 500;     // comme côté serveur

let measureCanvas = null;

/** Boîte du texte en unités du tableau (police de `size` unités) */
function measureText(text, size, fontFamily) {
    measureCanvas ??= document.createElement('canvas');
    const ctx = measureCanvas.getContext('2d');
    ctx.font = `${size}px ${fontFamily}`;
    const lines = text.split('\n');
    const w = Math.max(...lines.map(line => ctx.measureText(line).width), size * 0.5);
    return { w: Math.round(w * 10) / 10, h: Math.round(lines.length * size * TEXT_LINE_HEIGHT * 10) / 10 };
}

/**
 * @param {object} props
 * @param {number} props.left, props.top position à l'écran, relative au cadre (px)
 * @param {number} props.size        taille de police, en unités du tableau
 * @param {number} props.scale       zoom courant (px par unité)
 * @param {string} props.color
 * @param {boolean} props.background fond clair derrière le texte
 * @param {string} props.initialText texte modifié, ou ''
 * @param {Function} props.onCommit  (texte nettoyé, { w, h }) ; texte vide : rien à poser, ou à effacer
 * @param {Function} props.onCancel
 */
const BoardTextInput = ({ left, top, size, scale, color, background, initialText, onCommit, onCancel }) => {
    const [text, setText] = useState(initialText);
    const ref = useRef(null);
    const doneRef = useRef(false);   // validé ou annulé une seule fois (Entrée puis perte du focus)

    // Texte modifié : curseur à la fin, pas au début
    useEffect(() => {
        const end = ref.current?.value.length ?? 0;
        ref.current?.setSelectionRange(end, end);
    }, []);

    const commit = () => {
        if (doneRef.current) return;
        doneRef.current = true;
        const clean = text.replace(/\s+$/, '');
        const fontFamily = getComputedStyle(ref.current).fontFamily;
        onCommit(clean.trim() ? clean : '', measureText(clean, size, fontFamily));
    };
    const cancel = () => {
        if (doneRef.current) return;
        doneRef.current = true;
        onCancel();
    };
    const lines = text.split('\n');

    return (
        <textarea ref={ref} className={`vtt-board-text-input${background ? ' has-background' : ''}`} value={text} autoFocus
                  maxLength={MAX_TEXT_LENGTH} rows={lines.length} aria-label="Texte"
                  style={{
                      left: `${left}px`, top: `${top}px`, fontSize: `${size * scale}px`, color,
                      width: `${Math.max(4, ...lines.map(l => l.length + 1))}ch`,
                  }}
                  onChange={e => setText(e.target.value)} onBlur={commit}
                  onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); commit(); }
                      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); cancel(); }
                  }} />
    );
};

export default BoardTextInput;
