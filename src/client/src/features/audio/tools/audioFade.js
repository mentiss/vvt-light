// src/client/src/features/audio/tools/audioFade.js
// ─────────────────────────────────────────────────────────────────────────────
// Fondu enchaîné d'un bouton « en fondu » (documentations/plateforme/spec_audio.md
// §15.5, §15.6). Le serveur pose sur la piste fade = { from, at, duration }. Dans
// chaque navigateur, le fondu suit le nouveau lecteur : sa montée ne compte que le
// temps où il joue vraiment (un lecteur YouTube neuf peut rester longtemps en
// chargement), et l'ancien morceau descend au même rythme, au plus tard après
// FADE_WAIT_MS d'attente. Fonctions pures, testées.
// ─────────────────────────────────────────────────────────────────────────────

/** Attente maximale du nouveau morceau avant que l'ancien descende quand même (ms). */
export const FADE_WAIT_MS = 8000;

/**
 * Coefficient de volume (0 à 1) d'un lecteur pendant un fondu, à puissance constante
 * (cosinus) : pas de creux de volume au milieu, comme en aurait un fondu linéaire.
 *
 * @param {number} elapsed    temps écoulé dans le fondu (ms)
 * @param {number} duration   durée du fondu (ms)
 * @param {'in'|'out'} direction  montée ou descente
 */
export function fadeLevel(elapsed, duration, direction) {
    const t = duration > 0 ? Math.min(1, Math.max(0, elapsed / duration)) : 1;
    return direction === 'in' ? Math.sin(t * Math.PI / 2) : Math.cos(t * Math.PI / 2);
}

/**
 * Avancement de la descente de l'ancien morceau (ms) : celui de la montée du nouveau
 * (temps où il a vraiment joué), ou, s'il tarde, le temps écoulé au-delà de l'attente.
 *
 * @param {number} played    temps de lecture réelle du nouveau morceau (ms)
 * @param {number} waited    temps écoulé depuis le début du fondu dans ce navigateur (ms)
 */
export const fadeOutElapsed = (played, waited) => Math.max(played, waited - FADE_WAIT_MS);

/**
 * Le lecteur sortant d'une piste peut-il encore jouer à l'instant serverNow (ms) ?
 * Borne de sécurité : la descente finit au plus tard après l'attente et la durée.
 */
export const fadeOutActive = (fade, serverNow) => !!fade?.from && serverNow < fade.at + FADE_WAIT_MS + fade.duration + 1000;
