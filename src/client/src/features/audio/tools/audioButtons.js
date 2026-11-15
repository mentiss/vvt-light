// src/client/src/features/audio/tools/audioButtons.js
// ─────────────────────────────────────────────────────────────────────────────
// Boutons de la musique, côté client (documentations/plateforme/spec_audio.md §15) :
// passage des actions d'un bouton à la fiche de la fenêtre d'édition, et retour.
// Fonctions pures, testées.
//
// Actions du serveur : { fade?, slots: { <piste>: entrée | null } } ; piste absente =
// Ne pas toucher, null = Arrêter, entrée = Lancer (titre ou playlist, mode facultatif).
// Fiche d'édition : { <piste>: { op: 'play'|'stop'|'keep', trackId, playlistId, mode, startText } }
// (trackId ou playlistId : le contenu ; mode null = « Mode en cours »).
// ─────────────────────────────────────────────────────────────────────────────

import { SLOTS, SLOT_LABEL, SLOT_MODES } from './audioSlots.js';
import { formatTime } from './audioLibrary.js';
import { parseTimecode } from './timecode.js';

export const SLOT_OPS = [
    { id: 'play', label: 'Lancer' },
    { id: 'stop', label: 'Arrêter' },
    { id: 'keep', label: 'Ne pas toucher' },
];

const KEEP = { op: 'keep', trackId: null, playlistId: null, mode: null, startText: '' };

/** Fiche vide : toutes les pistes en Ne pas toucher. */
export const emptyDraft = () => Object.fromEntries(SLOTS.map(s => [s.id, { ...KEEP }]));

/** Ligne « Lancer » d'une piste depuis une entrée du serveur (un titre l'emporte sur sa playlist). */
const playLine = (entry) => ({
    op: 'play',
    trackId: entry.trackId ?? null,
    playlistId: entry.trackId ? null : entry.playlistId ?? null,
    mode: entry.mode ?? null,
    startText: entry.start ? formatTime(entry.start) : '',
});

/** Fiche d'un bouton existant. */
export function draftFromActions(actions) {
    const slots = actions?.slots ?? {};
    return Object.fromEntries(SLOTS.map(({ id }) => {
        if (!(id in slots)) return [id, { ...KEEP }];
        return [id, slots[id] ? playLine(slots[id]) : { ...KEEP, op: 'stop' }];
    }));
}

/** Fiche « ce qui joue » : chaque piste avec un morceau, dans son mode ; les autres arrêtées. */
export function draftFromState(stateSlots) {
    return Object.fromEntries(SLOTS.map(({ id }) => {
        const s = stateSlots?.[id];
        return [id, s?.trackId ? { ...KEEP, op: 'play', trackId: s.trackId, mode: s.mode ?? null } : { ...KEEP, op: 'stop' }];
    }));
}

/**
 * Fiche d'un bouton créé depuis la bibliothèque : { kind: 'track', trackId } ou
 * { kind: 'playlist', playlistId }, sur sa piste (une playlist ne va pas sur l'effet).
 */
export function draftFromTarget({ kind, trackId, playlistId, slot }) {
    const draft = emptyDraft();
    const target = kind === 'playlist' && slot === 'effect' ? 'music' : (SLOT_LABEL[slot] ? slot : 'music');
    draft[target] = kind === 'playlist'
        ? { ...KEEP, op: 'play', playlistId, mode: 'playlist' }
        : { ...KEEP, op: 'play', trackId };
    return draft;
}

/**
 * Pistes à envoyer au serveur, ou { error } en français.
 * @returns {{ slots: object } | { error: string }}
 */
export function slotsFromDraft(draft) {
    const slots = {};
    for (const { id } of SLOTS) {
        const line = draft[id];
        if (!line || line.op === 'keep') continue;
        if (line.op === 'stop') {
            slots[id] = null;
            continue;
        }
        if (!line.trackId && !line.playlistId) return { error: `${SLOT_LABEL[id]} : choisissez un titre ou une playlist.` };
        const entry = line.trackId ? { trackId: line.trackId } : { playlistId: line.playlistId };
        if (line.mode && SLOT_MODES[id].includes(line.mode)) entry.mode = line.mode;
        if (line.trackId && line.mode !== 'shuffle' && line.startText.trim()) {
            const start = parseTimecode(line.startText);
            if (start === null) return { error: `${SLOT_LABEL[id]} : timecode illisible (1:23, 1:02:03 ou des secondes).` };
            if (start > 0) entry.start = start;
        }
        slots[id] = entry;
    }
    if (!Object.values(slots).some(Boolean)) return { error: 'Le bouton doit lancer au moins une piste.' };
    return { slots };
}

/** Résumé d'un bouton : pistes lancées (il en a toujours une), « en fondu ». */
export function buttonSummary(actions) {
    const slots = actions?.slots ?? {};
    const summary = SLOTS.filter(({ id }) => slots[id]).map(s => s.label).join(', ');
    return actions?.fade ? `${summary} · en fondu` : summary;
}
