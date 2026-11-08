// src/client/src/components/board/BoardHelp.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Aide du tableau (documentations/spec_tableau.md §12.3) : bouton « ? » en bas à
// gauche du cadre, bulle des gestes et raccourcis selon le rôle et ce que la
// diapositive permet. Fermée par Échap, un clic ailleurs ou le même bouton.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect, useRef, useState } from 'react';
import { TOOLS, toolState } from './BoardToolbar.jsx';

/** Lignes de la bulle : [touche ou geste, ce qu'il fait] */
function helpLines(isGM, slide) {
    const gestures = [
        ['Glisser dans le vide', 'déplacer la vue (Sélection, Main)'],
        ['Clic molette, Espace maintenu', 'déplacer la vue avec tout outil'],
        ['Molette, deux doigts', 'zoomer (deux doigts : aussi déplacer)'],
        ['Alt + clic, appui long', 'ping'],
    ];
    if (isGM) {
        gestures.push(
            ['Clic sur un objet', 'le sélectionner, même verrouillé'],
            ['Poignée de l\'objet', 'le redimensionner'],
            ['Glisser une image, Ctrl+V', 'la déposer sur la diapositive'],
        );
    } else if (slide.playersMove) {
        gestures.push(['Glisser un jeton, une icône', 'le déplacer']);
    }

    const keys = TOOLS
        .filter(t => { const s = toolState(t, isGM, slide); return s.shown && s.enabled; })
        .map(t => [t.key, t.label.split(/ [:(]/)[0]]);
    if (isGM) keys.push(['Suppr', 'supprimer l\'objet sélectionné']);
    keys.push(['Échap', isGM ? 'annuler le geste, sinon désélectionner' : 'annuler le geste'], ['+  −  0', 'zoom avant, arrière, recadrer']);
    return { gestures, keys };
}

const HelpTable = ({ title, rows }) => (
    <>
        <span className="vtt-field-label">{title}</span>
        <dl className="vtt-board-help-list">
            {rows.map(([key, text]) => (
                <React.Fragment key={key}>
                    <dt>{key}</dt>
                    <dd>{text}</dd>
                </React.Fragment>
            ))}
        </dl>
    </>
);

/**
 * @param {object} props
 * @param {boolean} props.isGM
 * @param {object}  props.slide réglages de la diapositive (playersDraw, playersMove, gridEnabled)
 */
const BoardHelp = ({ isGM, slide }) => {
    const [open, setOpen] = useState(false);
    const rootRef = useRef(null);

    useEffect(() => {
        if (!open) return undefined;
        const onKey = (e) => { if (e.key === 'Escape') { e.stopPropagation(); setOpen(false); } };
        const onDown = (e) => { if (!rootRef.current?.contains(e.target)) setOpen(false); };
        document.addEventListener('keydown', onKey, true);
        document.addEventListener('pointerdown', onDown);
        return () => {
            document.removeEventListener('keydown', onKey, true);
            document.removeEventListener('pointerdown', onDown);
        };
    }, [open]);

    const { gestures, keys } = open ? helpLines(isGM, slide) : { gestures: [], keys: [] };

    return (
        <div ref={rootRef} className="vtt-board-corner is-bottom-left">
            {open && (
                <div className="vtt-board-help" role="dialog" aria-label="Aide du tableau">
                    <HelpTable title="Gestes" rows={gestures} />
                    <HelpTable title="Raccourcis (pointeur sur le tableau)" rows={keys} />
                </div>
            )}
            <button type="button" className={`vtt-board-tool${open ? ' is-active' : ''}`} aria-expanded={open}
                    onClick={() => setOpen(o => !o)} aria-label="Aide : gestes et raccourcis" title="Aide : gestes et raccourcis">
                ?
            </button>
        </div>
    );
};

export default BoardHelp;
