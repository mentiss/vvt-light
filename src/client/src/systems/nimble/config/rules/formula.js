// src/client/src/systems/nimble/config/rules/formula.js
// ─────────────────────────────────────────────────────────────────────────────
// Formules et dés des catalogues (documentations/nimble/format_catalogues.md §0) — pur.
//   evalFormula('3*INT+LVL', vars) → nombre (jetons STR DEX INT WIL KEY LVL)
//   parseDice('WILd8', vars)       → { count, sides, special } ou null
// vars : { STR, DEX, INT, WIL, KEY, LVL } (voir formulaVars, character.js).
// Analyseur à descente récursive (+ - * / parenthèses) : jamais d'eval.
// ─────────────────────────────────────────────────────────────────────────────

const TOKEN_RE = /\s*(\d+(?:\.\d+)?|[A-Z]+|[-+*/()×])/y;

const tokenize = (text) => {
    const tokens = [];
    TOKEN_RE.lastIndex = 0;
    const src = String(text).replace(/×/g, '*');
    let match;
    while (TOKEN_RE.lastIndex < src.length && (match = TOKEN_RE.exec(src))) tokens.push(match[1]);
    if (src.slice(TOKEN_RE.lastIndex).trim()) return null;   // reste illisible
    return tokens;
};

/**
 * Évalue une formule de catalogue. Vide ou illisible : `fallback`.
 * Les jetons inconnus valent 0. Résultat tronqué vers zéro (règles en entiers).
 * @param {string|number|null|undefined} formula
 * @param {object} vars
 * @param {number} [fallback=0]
 */
export const evalFormula = (formula, vars = {}, fallback = 0) => {
    if (formula === null || formula === undefined || formula === '') return fallback;
    if (typeof formula === 'number') return formula;
    const tokens = tokenize(formula);
    if (!tokens?.length) return fallback;
    let i = 0;
    const peek = () => tokens[i];
    const next = () => tokens[i++];

    const primary = () => {
        const t = next();
        if (t === '(') { const v = expr(); next(); return v; }
        if (t === '-') return -primary();
        if (t === '+') return primary();
        if (/^\d/.test(t ?? '')) return Number(t);
        if (/^[A-Z]+$/.test(t ?? '')) return Number(vars[t] ?? 0);
        throw new Error('formule');
    };
    const term = () => {
        let v = primary();
        while (peek() === '*' || peek() === '/') v = next() === '*' ? v * primary() : v / primary();
        return v;
    };
    const expr = () => {
        let v = term();
        while (peek() === '+' || peek() === '-') v = next() === '+' ? v + term() : v - term();
        return v;
    };
    try {
        const value = expr();
        return i === tokens.length && Number.isFinite(value) ? Math.trunc(value) : fallback;
    } catch {
        return fallback;
    }
};

/**
 * Dés d'un catalogue : '2d6', 'd66', 'WILd8', 'LVLd4', '1d20'.
 * Un nombre de dés tiré d'une caractéristique négative ou nulle donne 0 dé.
 * @returns {{ count: number, sides: number, special: 'd44'|'d66'|'d88'|null } | null}
 */
export const parseDice = (dice, vars = {}) => {
    if (!dice) return null;
    const text = String(dice).trim();
    const special = /^d(44|66|88)$/i.exec(text);
    if (special) return { count: 2, sides: Number(special[1][0]), special: `d${special[1]}` };
    const m = /^([A-Z]+|\d*)\s*d\s*(\d+)$/i.exec(text);
    if (!m) return null;
    const count = m[1] === '' ? 1 : /^\d+$/.test(m[1]) ? Number(m[1]) : evalFormula(m[1].toUpperCase(), vars);
    return { count: Math.max(0, count), sides: Number(m[2]), special: null };
};

/** Libellé d'une formule de dés résolue (« 3d8 », « d66 ») */
export const diceLabel = (parsed) => (parsed ? (parsed.special ?? `${parsed.count}d${parsed.sides}`) : '');

/** Signe affiché d'un modificateur : +2, −1, +0 */
export const signed = (n) => (n < 0 ? `−${Math.abs(n)}` : `+${n}`);
