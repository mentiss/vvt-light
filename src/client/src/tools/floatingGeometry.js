// src/client/src/tools/floatingGeometry.js
// ─────────────────────────────────────────────────────────────────────────────
// Position et taille d'une fenêtre flottante (documentations/spec_ui_panneaux.md) :
// déplacée par son titre, redimensionnée par ses bords et ses coins, toujours
// gardée dans la fenêtre du navigateur. Fonctions pures, testées.
// Un rectangle : { left, top, width, height } en px.
// ─────────────────────────────────────────────────────────────────────────────

export const MIN_SIZE = { width: 320, height: 240 };
export const DEFAULT_SIZE = { width: 480, height: 600 };
export const DEFAULT_OFFSET = { x: 16, y: 72 };   // laisse la place aux boutons flottants en bas à droite
export const ANCHORS = ['bottom-right', 'bottom-left', 'top-right', 'top-left', 'center'];

const MARGIN = 8;          // marge gardée au bord de la fenêtre
const HEADER = 44;         // hauteur à garder visible (barre de titre)

/**
 * Rectangle de départ depuis un ancrage : taille demandée, ramenée à la place
 * disponible entre le décalage et le bord opposé.
 *
 * @param {{ width: number, height: number }} viewport
 * @param {object} [options]
 * @param {{ width: number, height: number }} [options.size]
 * @param {string} [options.anchor]   un des ANCHORS
 * @param {{ x: number, y: number }}  [options.offset] décalage depuis les bords d'ancrage
 * @param {{ width: number, height: number }} [options.min]
 */
export function defaultRect(viewport, { size = DEFAULT_SIZE, anchor = 'bottom-right', offset = DEFAULT_OFFSET, min = MIN_SIZE } = {}) {
    const centered = anchor === 'center';
    // Taille bornée (place disponible, minimum) avant l'ancrage, pour que le décalage soit respecté
    const { width, height } = clampRect({
        left: 0, top: 0,
        width: Math.min(size.width, viewport.width - (centered ? 2 * MARGIN : offset.x + MARGIN)),
        height: Math.min(size.height, viewport.height - (centered ? 2 * MARGIN : offset.y + MARGIN)),
    }, viewport, min);

    let left;
    let top;
    if (centered) {
        left = (viewport.width - width) / 2;
        top = (viewport.height - height) / 2;
    } else {
        left = anchor.endsWith('right') ? viewport.width - width - offset.x : offset.x;
        top = anchor.startsWith('bottom') ? viewport.height - height - offset.y : offset.y;
    }
    return clampRect({ left, top, width, height }, viewport, min);
}

/**
 * Garde la fenêtre dans le navigateur : taille entre le minimum et la fenêtre,
 * barre de titre toujours atteignable.
 */
export function clampRect(rect, viewport, min = MIN_SIZE) {
    const width = Math.round(Math.max(Math.min(min.width, viewport.width - 2 * MARGIN), Math.min(rect.width, viewport.width - 2 * MARGIN)));
    const height = Math.round(Math.max(Math.min(min.height, viewport.height - 2 * MARGIN), Math.min(rect.height, viewport.height - 2 * MARGIN)));
    const left = Math.round(Math.min(Math.max(MARGIN, rect.left), viewport.width - width - MARGIN));
    const top = Math.round(Math.min(Math.max(MARGIN, rect.top), viewport.height - HEADER - MARGIN));
    return { left, top, width, height };
}

/** Déplacement par la barre de titre. */
export function moveRect(start, dx, dy, viewport, min = MIN_SIZE) {
    return clampRect({ ...start, left: start.left + dx, top: start.top + dy }, viewport, min);
}

/**
 * Redimensionnement par un bord ou un coin.
 * @param {string} dir combinaison de n, s, e, w (ex. 'se', 'w')
 */
export function resizeRect(start, dir, dx, dy, viewport, min = MIN_SIZE) {
    let { left, top, width, height } = start;
    if (dir.includes('e')) width = start.width + dx;
    if (dir.includes('s')) height = start.height + dy;
    if (dir.includes('w')) {
        width = Math.max(min.width, start.width - dx);
        left = start.left + start.width - width;
    }
    if (dir.includes('n')) {
        height = Math.max(min.height, start.height - dy);
        top = start.top + start.height - height;
    }
    return clampRect({ left, top, width: Math.max(min.width, width), height: Math.max(min.height, height) }, viewport, min);
}
