// src/client/src/tools/boardRights.js
// ─────────────────────────────────────────────────────────────────────────────
// Ce qu'un participant peut faire sur le tableau (documentations/spec_tableau.md
// §10.2), pour griser les outils et ignorer les gestes interdits. Le serveur
// vérifie les mêmes règles à chaque écriture (routes/board.js) : ici, c'est le confort.
// Palette fixe de la v1 (Q-34), couleur de ping d'un participant.
// ─────────────────────────────────────────────────────────────────────────────

export const PLAYER_DRAW_KINDS = ['stroke', 'rect'];
export const PLAYER_MOVE_KINDS = ['token', 'icon'];

/** Palette fixe : nom affiché, couleur */
export const BOARD_PALETTE = [
    { name: 'Noir',   color: '#1f1d1a' },
    { name: 'Blanc',  color: '#f4f2ee' },
    { name: 'Rouge',  color: '#c0392b' },
    { name: 'Orange', color: '#d9822b' },
    { name: 'Jaune',  color: '#e2b93b' },
    { name: 'Vert',   color: '#3a8f5c' },
    { name: 'Bleu',   color: '#2f6db5' },
    { name: 'Violet', color: '#7d4fb3' },
];

/** Couleur stable d'un participant (ping, jeton par défaut), hors noir et blanc */
export function participantColor(id) {
    const colors = BOARD_PALETTE.slice(2);
    const n = Math.abs(Number(id) || 0);
    return colors[n % colors.length].color;
}

/** Le participant dessine-t-il sur cette diapositive ? */
export const canDraw = (isGM, slide) => isGM || !!slide?.playersDraw;

/** Peut-il effacer cet objet ? */
export const canDelete = (isGM, slide, item) =>
    !item.locked && (isGM || (!!slide?.playersDraw && PLAYER_DRAW_KINDS.includes(item.kind)));

/** Peut-il déplacer cet objet ? */
export const canMove = (isGM, slide, item) =>
    !item.locked && (isGM || (!!slide?.playersMove && PLAYER_MOVE_KINDS.includes(item.kind)));
