// src/client/src/tools/timecode.js
// ─────────────────────────────────────────────────────────────────────────────
// Saisie d'un timecode (documentations/spec_audio.md §14.2) : point de départ
// d'un bouton de la musique. Fonction pure, testée. L'affichage reprend
// formatTime (tools/audioLibrary.js).
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Lit « 1:23 », « 1:02:03 » ou « 83 » en secondes. Vide : 0 (depuis le début).
 *
 * @param {string} text
 * @returns {number|null} secondes, null si illisible
 */
export function parseTimecode(text) {
    const value = String(text ?? '').trim();
    if (!value) return 0;
    if (!/^\d+(:\d{1,2}){0,2}$/.test(value)) return null;
    const parts = value.split(':').map(Number);
    // Minutes et secondes après le premier nombre : moins de 60
    if (parts.slice(1).some(n => n >= 60)) return null;
    return parts.reduce((total, n) => total * 60 + n, 0);
}
