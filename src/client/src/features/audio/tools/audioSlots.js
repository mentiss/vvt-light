// src/client/src/features/audio/tools/audioSlots.js
// ─────────────────────────────────────────────────────────────────────────────
// Pistes fixes, modes permis et niveaux de partage, côté client
// (documentations/spec_audio.md §11.3). Miroir de SLOTS dans
// src/server/routes/audio.js : le serveur refuse tout mode hors de cette liste.
// ─────────────────────────────────────────────────────────────────────────────

export const SLOTS = [
    { id: 'music',     label: 'Musique',    modes: ['playlist', 'loop', 'shuffle'] },
    { id: 'ambience1', label: 'Ambiance 1', modes: ['loop', 'playlist'] },
    { id: 'ambience2', label: 'Ambiance 2', modes: ['loop', 'playlist'] },
    { id: 'effect',    label: 'Effet',      modes: ['once'] },
];

export const SLOT_LABEL = Object.fromEntries(SLOTS.map(s => [s.id, s.label]));
export const SLOT_MODES = Object.fromEntries(SLOTS.map(s => [s.id, s.modes]));

// Pistes jouées par-dessus la musique, affichées en pastilles
export const LAYER_SLOTS = ['ambience1', 'ambience2', 'effect'];

export const MODE_LABELS = { playlist: 'Playlist', loop: 'Boucle', shuffle: 'Aléatoire', once: 'Une fois' };

/** Mode suivant d'une piste, pour un bouton qui fait défiler les modes permis. */
export const nextMode = (slot, mode) => {
    const modes = SLOT_MODES[slot];
    return modes[(modes.indexOf(mode) + 1) % modes.length];
};

export const VISIBILITIES = [
    { id: 'private',  label: 'Privée',                hint: 'Visible de cette table seulement' },
    { id: 'slug',     label: 'Publique · jeu',        hint: 'Copiable par les autres tables de ce jeu' },
    { id: 'platform', label: 'Publique · plateforme', hint: 'Copiable par toutes les tables de tous les jeux' },
];

export const VISIBILITY_LABEL = Object.fromEntries(VISIBILITIES.map(v => [v.id, v.label]));
