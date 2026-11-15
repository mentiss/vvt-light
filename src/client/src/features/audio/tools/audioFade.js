// src/client/src/features/audio/tools/audioFade.js
// ─────────────────────────────────────────────────────────────────────────────
// Fondu enchaîné d'un bouton « en fondu » (documentations/plateforme/spec_audio.md
// §15.5, §15.6). Le serveur pose sur la piste fade = { from, at, duration } :
// le lecteur sortant (from) descend, calé sur l'heure du serveur ; le nouveau monte
// à partir du moment où il joue vraiment dans ce navigateur. Fonctions pures, testées.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Coefficient de volume (0 à 1) d'un lecteur pendant un fondu, à puissance constante
 * (cosinus) : pas de creux de volume au milieu, comme en aurait un fondu linéaire.
 *
 * @param {number} elapsed    temps écoulé depuis le début du fondu (ms)
 * @param {number} duration   durée du fondu (ms)
 * @param {'in'|'out'} direction  montée ou descente
 */
export function fadeLevel(elapsed, duration, direction) {
    const t = duration > 0 ? Math.min(1, Math.max(0, elapsed / duration)) : 1;
    return direction === 'in' ? Math.sin(t * Math.PI / 2) : Math.cos(t * Math.PI / 2);
}

/** Le lecteur sortant d'une piste doit-il encore jouer à l'instant serverNow (ms) ? */
export const fadeOutActive = (fade, serverNow) => !!fade?.from && serverNow < fade.at + fade.duration;
