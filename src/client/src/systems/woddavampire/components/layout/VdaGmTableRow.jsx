// src/client/src/systems/woddavampire/components/layout/VdaGmTableRow.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Ligne de la table du Conteur (onglet Session, planche_conteur.html) : présence,
// résumé de l'état (sang, Volonté, pire blessure) et état imposé ; un clic
// choisit le personnage affiché dans la fiche du Conteur.
//
// Props : c, online, selected, onSelect()
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { IMPOSED_STATES } from '../../config.jsx';
import { characterProfile } from '../../config/rules/character.js';
import { woundSummary, imposedState } from '../../config/rules/sheetRules.js';

/** Barre de jauge (largeur en pourcentage de la valeur) */
const Bar = ({ value, max, ink = false }) => (
    <span className={`vda-gm-bar${ink ? ' is-ink' : ''}`}><i style={{ width: `${max ? (100 * value) / max : 0}%` }} /></span>
);

const VdaGmTableRow = ({ c, online, selected, onSelect }) => {
    const { clan, bloodMax } = characterProfile(c);
    const blood = Math.min(c.bloodCurrent ?? 0, bloodMax);
    const health = woundSummary(c);
    const imposed = imposedState(c);
    return (
        <button type="button" className={`vda-gm-pc${selected ? ' is-on' : ''}`} onClick={onSelect} aria-pressed={selected}>
            <span className={`vda-gm-pc-av${online ? ' is-online' : ''}`}>{c.avatar ? <img src={c.avatar} alt="" /> : '✠'}</span>
            <span className="min-w-0">
                <b>{c.nom}</b>
                <span className="vda-gm-pc-who">{c.playerName} · {clan?.label ?? '—'} · {c.generation}ᵉ{online ? '' : ' · hors ligne'}</span>
            </span>
            <span className="vda-gm-mini">
                <span>Sang</span><Bar value={blood} max={bloodMax} /><span>{blood}/{bloodMax}</span>
                <span>Volonté</span><Bar value={c.willpowerCurrent ?? 0} max={c.willpowerPermanent ?? 0} ink />
                <span>{c.willpowerCurrent ?? 0}/{c.willpowerPermanent ?? 0}</span>
                <span>Santé</span><span className={health.hurt ? 'is-hurt' : ''}>{health.text}</span><span />
            </span>
            {imposed && <span className="vda-gm-flag">{IMPOSED_STATES[imposed].label}</span>}
        </button>
    );
};

export default VdaGmTableRow;
