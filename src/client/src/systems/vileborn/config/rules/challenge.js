// src/client/src/systems/vileborn/config/rules/challenge.js
// ─────────────────────────────────────────────────────────────────────────────
// Défis (spec_vileborn_defis.md §II.1, §II.4) — pur.
//   - difficulté finale d'une approche : base choisie par le MJ + écart de la
//     fiche + ajustement en jeu (le total peut dépasser 7) ;
//   - piste : déclencheur d'une case, déclencheur atteint en cochant ;
//   - dé d'obscurité : actif selon `when`, ligne retenue = la plus haute dont
//     le minimum est atteint ;
//   - fiche vierge, duplication, validation du formulaire.
// ─────────────────────────────────────────────────────────────────────────────

import { APPROACHES } from '../approaches.js';

export const MAX_TRACK = 12;
export const MAX_SHIFT = 3;   // écart de la fiche et ajustement en jeu : −3 à +3

/** Difficulté finale d'une approche */
export const finalDifficulty = (sheet, adjust, approach, base) =>
    base + (sheet?.difficulty?.[approach] ?? 0) + (adjust?.[approach] ?? 0);

/** Déclencheur d'une case (ou null) */
export const triggerAt = (sheet, box) => (sheet?.triggers ?? []).find(t => t.box === box) ?? null;

/**
 * Déclencheur atteint en passant la piste de `from` à `to` cases cochées : le
 * plus haut franchi (cocher plusieurs cases d'un coup n'en montre qu'un). null
 * en décochant.
 */
export const reachedTrigger = (sheet, from, to) => {
    for (let box = to; box > from; box--) {
        const trigger = triggerAt(sheet, box);
        if (trigger) return trigger;
    }
    return null;
};

/** Nouvelle valeur de la piste au clic sur une case : cocher jusqu'à elle, ou la décocher si elle l'est */
export const toggleBox = (progress, box) => (box <= progress ? box - 1 : box);

export const isDone = (sheet, progress) => progress >= (sheet?.track ?? Infinity);

/** Le dé d'obscurité s'applique-t-il à ce stade du défi ? */
export const darkActive = (sheet, progress) => {
    const dark = sheet?.dark;
    if (!dark || dark.when === 'none') return false;
    if (dark.when === 'fromBox') return progress >= (dark.fromBox ?? 1);
    return true;
};

/** Ligne de la table du d12 atteinte (la plus haute dont min ≤ résultat), ou null */
export const darkRow = (sheet, value) =>
    [...(sheet?.dark?.rows ?? [])].sort((a, b) => b.min - a.min).find(r => value >= r.min) ?? null;

/** Fiche vierge d'un nouveau défi du MJ */
export const blankSheet = () => ({
    source: 'mj', page: null, name: '', family: 'other', kind: 'Défi', quote: '', description: '',
    track: 5, difficulty: Object.fromEntries(APPROACHES.map(a => [a.key, 0])),
    resistances: [], vulnerabilities: [], triggers: [], complications: [],
    dark: { when: 'none', fromBox: null, threshold: null, rows: [] },
    rules: [], familyRules: [],
});

/** Duplication : une copie du MJ, sans identifiant */
export const duplicateSheet = (sheet) => {
    const { id: _id, ...rest } = sheet;
    return { ...structuredClone(rest), name: `${sheet.name} (copie)`, source: 'mj' };
};

/** Fiche prête à enregistrer : lignes vides retirées, bornes appliquées */
export const cleanSheet = (sheet) => {
    const track = Math.min(MAX_TRACK, Math.max(1, sheet.track));
    const text = (s) => (s ?? '').trim();
    return {
        ...sheet,
        name: text(sheet.name),
        track,
        resistances: sheet.resistances.map(text).filter(Boolean),
        vulnerabilities: sheet.vulnerabilities.map(text).filter(Boolean),
        rules: sheet.rules.map(text).filter(Boolean),
        triggers: sheet.triggers.filter(t => text(t.text) && t.box >= 1 && t.box <= track).sort((a, b) => a.box - b.box),
        complications: sheet.complications.filter(c => text(c.text)),
        familyRules: sheet.familyRules.filter(r => text(r.name) || text(r.text)),
        dark: { ...sheet.dark, rows: sheet.dark.rows.filter(r => text(r.text)).sort((a, b) => a.min - b.min) },
    };
};

/** Le formulaire peut-il être enregistré ? */
export const canSaveSheet = (sheet) => !!sheet?.name?.trim() && Number.isInteger(sheet.track) && sheet.track >= 1 && sheet.track <= MAX_TRACK;
