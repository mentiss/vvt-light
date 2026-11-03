// src/client/src/systems/woddavampire/config/rules/dicePool.js
// ─────────────────────────────────────────────────────────────────────────────
// Résolution d'une réserve de d10 (spec_woddavampire.md §3, §II.3). Pure.
//   - succès : chaque dé ≥ difficulté (difficulté bornée de 2 à 10)
//   - les 1 : règle maison, ils n'annulent rien ; règle du livre (onesCancel, réglée
//     par CHRONICLE.onesCancelSuccesses), chaque 1 annule un succès lancé
//   - spécialité : un 10 compte 2 succès
//   - succès automatiques (Volonté, Puissance…) : ajoutés, ils ne roulent pas et
//     les 1 ne les annulent jamais
//   - échec critique, dans les deux règles : aucun succès (lancé ni automatique) et
//     au moins un 1 ; des 1 qui annulent tous les succès donnent un simple échec
//     (sauf jets qui ne peuvent pas échouer critiquement : dégâts, absorption — §3.5)
// ─────────────────────────────────────────────────────────────────────────────

export const clampDifficulty = (difficulty) => Math.min(10, Math.max(2, Math.round(Number(difficulty) || 6)));

const DEGREES = ['', 'marginale', 'modérée', 'complète', 'exceptionnelle', 'phénoménale'];

/** Degré de réussite (§3.1) : 1 marginale … 5 et plus phénoménale */
export const successDegree = (successes) => (successes > 0 ? DEGREES[Math.min(successes, 5)] : null);

/**
 * @param {number[]} values  résultats des d10 lancés
 * @param {number}   difficulty
 * @param {{ specialty?: boolean, autoSuccesses?: number, cannotBotch?: boolean, onesCancel?: boolean }} [options]
 * @returns {{ successes: number, rolledSuccesses: number, autoSuccesses: number, ones: number, cancelled: number,
 *             botch: boolean, failure: boolean, degree: string|null, difficulty: number }}
 */
export const resolvePool = (values, difficulty, { specialty = false, autoSuccesses = 0, cannotBotch = false, onesCancel = false } = {}) => {
    const diff = clampDifficulty(difficulty);
    let rolledSuccesses = 0;
    let ones = 0;
    for (const v of values) {
        if (v >= diff) rolledSuccesses += specialty && v === 10 ? 2 : 1;
        else if (v === 1) ones += 1;
    }
    const auto = Math.max(0, autoSuccesses);
    const cancelled = onesCancel ? Math.min(ones, rolledSuccesses) : 0;
    const successes = rolledSuccesses - cancelled + auto;
    const botch = !cannotBotch && rolledSuccesses + auto === 0 && ones > 0;
    return {
        successes, rolledSuccesses, autoSuccesses: auto, ones, cancelled,
        botch, failure: successes === 0, degree: successDegree(successes), difficulty: diff,
    };
};
