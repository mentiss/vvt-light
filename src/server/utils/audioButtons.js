// src/server/utils/audioButtons.js
// ─────────────────────────────────────────────────────────────────────────────
// Boutons préréglés de la musique (documentations/spec_audio.md §12.6, §15) : forme,
// vérification, lecture et ménage. Le lancement (état de lecture) reste dans
// routes/audio.js.
//
// actions (JSON) : { fade?: true, slots: { <piste>: entrée | null } }
//   - entrée = Lancer : { trackId, playlistId, mode?, start? } ou { playlistId, mode? } ;
//     mode absent : la piste garde le mode qu'elle a au moment du clic ;
//   - null = Arrêter ;
//   - piste absente = Ne pas toucher.
// ─────────────────────────────────────────────────────────────────────────────

const { SLOTS, OWN_TRACK, OWN_PLAYLIST, own, playlistIds } = require('./audioTable');

const MAX_BUTTONS = 12;
const LABEL_MAX = 40;
const OWN_BUTTON = 'SELECT * FROM audio_buttons WHERE id = ? AND slug = ? AND session_id = ?';

/** Actions d'un bouton, ou null si illisibles. */
function parseActions(row) {
    try {
        const actions = JSON.parse(row.actions);
        return actions?.slots && typeof actions.slots === 'object' ? actions : null;
    } catch {
        return null;
    }
}

/** Une entrée lance-t-elle une playlist (au hasard, ou sans titre précis) plutôt qu'un titre ? */
const usesPlaylist = (entry) => !!entry.playlistId && (entry.mode === 'shuffle' || !entry.trackId);

/** Le contenu visé par une entrée est-il encore à la table (sans regarder si une playlist est vide) ? */
const entryExists = (ctx, entry) =>
    (usesPlaylist(entry) ? !!own(ctx, OWN_PLAYLIST, entry.playlistId) : !!own(ctx, OWN_TRACK, entry.trackId));

/** L'entrée peut-elle être lancée (contenu présent, playlist non vide) ? */
const entryAvailable = (ctx, entry) =>
    entryExists(ctx, entry) && (!usesPlaylist(entry) || playlistIds(ctx, entry.playlistId).length > 0);

/** Bouton en erreur : actions illisibles, ou une piste à lancer qui ne peut pas l'être. */
function buttonBroken(ctx, row) {
    const actions = parseActions(row);
    return !actions || Object.values(actions.slots).some(entry => entry && !entryAvailable(ctx, entry));
}

/** Boutons de la table, dans l'ordre (réponse de toutes les routes de boutons). */
function loadButtons(ctx) {
    return ctx.db.prepare('SELECT * FROM audio_buttons WHERE slug = ? AND session_id = ? ORDER BY position, id')
        .all(ctx.slug, ctx.sessionId)
        .map(row => ({ id: row.id, label: row.label, actions: parseActions(row), broken: buttonBroken(ctx, row) }));
}

/**
 * Timecode d'une entrée sur un titre (§14.2), en secondes entières : undefined si absent
 * (depuis le début), NaN si illisible ; au-delà de la durée connue du titre, ramené à 0.
 */
function parseStart(track, value) {
    if (value === undefined || value === null || value === '') return undefined;
    // Un nombre seulement : true ou [83] ne passent pas par Number()
    if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) return NaN;
    // Arrondi avant la comparaison : 299,8 s sur un titre de 300 s ne tombe pas pile à la fin
    const seconds = Math.round(value);
    return track.duration && seconds >= track.duration ? 0 : seconds;
}

const isObject = (value) => !!value && typeof value === 'object' && !Array.isArray(value);
const isId = (value) => Number.isInteger(value) && value > 0;
const hasValue = (value) => value !== undefined && value !== null;

/** Entrée « Lancer » d'une piste, vérifiée (§15.3) : { entry } ou { error }. */
function checkEntry(ctx, slot, entry) {
    const { trackId, playlistId, mode, start } = entry;
    if (hasValue(mode) && !SLOTS[slot].modes.includes(mode)) return { error: `Mode not allowed on ${slot}` };
    const withMode = hasValue(mode) ? { mode } : {};

    if (hasValue(trackId)) {
        if (!isId(trackId)) return { error: 'Invalid trackId' };
        const track = own(ctx, OWN_TRACK, trackId);
        if (!track) return { error: 'Track not found in this table library' };
        const seconds = parseStart(track, start);
        if (Number.isNaN(seconds)) return { error: 'Invalid start' };
        // Au hasard, le titre est tiré dans sa playlist : pas de timecode
        if (seconds !== undefined && mode === 'shuffle') return { error: 'A shuffled track has no start' };
        return { entry: { trackId: track.id, playlistId: track.playlist_id, ...withMode, ...(seconds ? { start: seconds } : {}) } };
    }

    if (!isId(playlistId)) return { error: 'A track or a playlist is required' };
    if (!own(ctx, OWN_PLAYLIST, playlistId)) return { error: 'Playlist not found in this table library' };
    if (slot === 'effect') return { error: 'A playlist cannot target the effect slot' };
    if (hasValue(start) && start !== '') return { error: 'A playlist has no start' };
    return { entry: { playlistId, ...withMode } };
}

/**
 * Bouton reçu du client, vérifié (§15.3, §15.8) : { actions } ou { error }.
 * Au moins une piste lancée ; une piste absente n'est pas touchée.
 */
function checkButton(ctx, { fade, slots }) {
    if (fade !== undefined && typeof fade !== 'boolean') return { error: 'fade must be a boolean' };
    if (!isObject(slots)) return { error: 'slots must be an object' };

    const checked = {};
    for (const [slot, entry] of Object.entries(slots)) {
        if (!SLOTS[slot]) return { error: `Unknown slot: ${slot}` };
        if (entry === null) {
            checked[slot] = null;
            continue;
        }
        if (!isObject(entry)) return { error: `Invalid entry for ${slot}` };
        const result = checkEntry(ctx, slot, entry);
        if (result.error) return result;
        checked[slot] = result.entry;
    }
    if (!Object.values(checked).some(Boolean)) return { error: 'A button must play at least one slot' };
    return { actions: fade ? { fade: true, slots: checked } : { slots: checked } };
}

/**
 * Ménage après une suppression de titre, de playlist ou de collection (§12.7, §15.4) :
 * la piste dont le contenu a disparu passe à Arrêter ; le bouton est supprimé s'il ne
 * lance plus rien. Renvoie true si un bouton a changé.
 */
function pruneButtons(ctx) {
    const rows = ctx.db.prepare('SELECT * FROM audio_buttons WHERE slug = ? AND session_id = ?').all(ctx.slug, ctx.sessionId);
    const remove = ctx.db.prepare('DELETE FROM audio_buttons WHERE id = ?');
    const update = ctx.db.prepare('UPDATE audio_buttons SET actions = ? WHERE id = ?');
    let changed = false;

    ctx.db.transaction(() => {
        for (const row of rows) {
            const actions = parseActions(row);
            if (!actions) continue;
            const slots = { ...actions.slots };
            let dropped = false;
            for (const [slot, entry] of Object.entries(slots)) {
                if (entry && !entryExists(ctx, entry)) { slots[slot] = null; dropped = true; }
            }
            if (!dropped) continue;
            if (Object.values(slots).some(Boolean)) update.run(JSON.stringify({ ...actions, slots }), row.id);
            else remove.run(row.id);
            changed = true;
        }
    })();
    return changed;
}

const buttonLabel = (label) => (typeof label === 'string' && label.trim() ? label.trim().slice(0, LABEL_MAX) : null);

module.exports = {
    MAX_BUTTONS, OWN_BUTTON,
    parseActions, usesPlaylist, buttonBroken, loadButtons, checkButton, pruneButtons, buttonLabel,
};
