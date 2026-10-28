// src/client/src/components/audio/audioSync.js
// ─────────────────────────────────────────────────────────────────────────────
// Synchronisation d'un lecteur YouTube local sur l'état de lecture du serveur
// (documentations/spec_audio.md §9.3, §9.6). Fonctions pures, testées sous Vitest.
//
// État du serveur : { status, youtubeId, position, refTime, duration }
//   position (s) à l'instant refTime (horloge du serveur, ms).
// L'horloge locale diffère de celle du serveur : on estime l'écart à partir
// d'échantillons (heure du serveur, aller-retour réseau).
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Écart d'horloge mesuré par un aller-retour : heure du serveur au milieu de l'échange.
 *
 * @param {number} sentAt     Date.now() local à l'envoi
 * @param {number} serverTime heure du serveur dans la réponse
 * @param {number} receivedAt Date.now() local à la réception
 * @returns {{ offset: number, rtt: number }} offset = serveur - local (ms)
 */
export function clockSample(sentAt, serverTime, receivedAt) {
    const rtt = Math.max(0, receivedAt - sentAt);
    return { offset: serverTime - (sentAt + rtt / 2), rtt };
}

/**
 * Meilleur écart d'horloge : celui de l'échantillon au plus court aller-retour,
 * le moins faussé par la latence. 0 sans échantillon.
 *
 * @param {{ offset: number, rtt: number }[]} samples
 */
export function bestOffset(samples) {
    if (!samples?.length) return 0;
    return samples.reduce((best, s) => (s.rtt < best.rtt ? s : best)).offset;
}

/**
 * Position attendue (s) à l'instant serverNow, bornée à la durée si elle est connue.
 *
 * @param {object} state     état du serveur
 * @param {number} serverNow heure du serveur estimée (ms)
 */
export function expectedPosition(state, serverNow) {
    if (!state?.youtubeId) return 0;
    const elapsed = state.status === 'playing' ? Math.max(0, serverNow - state.refTime) / 1000 : 0;
    const position = state.position + elapsed;
    return state.duration ? Math.min(position, state.duration) : position;
}

/**
 * Ce que le lecteur local doit faire pour coller à l'état du serveur.
 *
 * @param {object} p
 * @param {object} p.state          état du serveur
 * @param {number} p.serverNow      heure du serveur estimée (ms)
 * @param {string|null} p.loadedId  vidéo chargée dans le lecteur local
 * @param {string} p.playerState    état du lecteur (PLAYER_STATES de useYouTubePlayer)
 * @param {number} p.currentTime    position du lecteur local (s)
 * @param {number} [p.threshold]    écart toléré avant recalage (s)
 * @returns {{ type: 'none'|'stop'|'load'|'play'|'pause'|'seek', position?: number, autoplay?: boolean, drift?: number }}
 *   drift : position locale - position attendue (s), quand elle a un sens
 */
export function planSync({ state, serverNow, loadedId, playerState, currentTime, threshold = 1.5 }) {
    const active = playerState === 'playing' || playerState === 'buffering';

    if (!state?.youtubeId || state.status === 'stopped') {
        return active ? { type: 'stop' } : { type: 'none' };
    }

    const expected = expectedPosition(state, serverNow);

    if (loadedId !== state.youtubeId) {
        return { type: 'load', position: expected, autoplay: state.status === 'playing' };
    }

    const drift = currentTime - expected;
    const off = Math.abs(drift) > threshold;

    if (state.status === 'paused') {
        if (active) return { type: 'pause', position: expected, drift };
        return off ? { type: 'seek', position: expected, drift } : { type: 'none', drift };
    }

    // En lecture côté serveur
    if (playerState === 'buffering') return { type: 'none', drift };
    if (playerState === 'ended') {
        // Fini localement : on ne relance que si le serveur est revenu en arrière
        return expected < currentTime - threshold ? { type: 'play', position: expected, drift } : { type: 'none', drift };
    }
    if (playerState !== 'playing') return { type: 'play', position: expected, drift };
    return off ? { type: 'seek', position: expected, drift } : { type: 'none', drift };
}
