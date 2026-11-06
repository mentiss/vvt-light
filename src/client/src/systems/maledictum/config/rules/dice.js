// src/client/src/systems/maledictum/config/rules/dice.js
// ─────────────────────────────────────────────────────────────────────────────
// Résolution des jets d'Imperium Maledictum (fonctions pures, testées).
// Livre de base p.185-191 (tests), p.211-214 (attaques), p.161-166 (psy).
//
//   d100 : 1 à 100 ; 100 se lit « 00 » (dizaine 0, unité 0).
//   DR (degrés de réussite) = dizaines du seuil − dizaines du jet (100 compte 10).
//   +0 et −0 existent : réussite / échec marginal.
//   Avantage : on PEUT inverser dizaines et unités ; Désavantage : on DOIT inverser
//   si c'est pire ; les sources s'annulent ; chaque source au-delà de la première
//   donne ±10 au seuil.
//   01-05 : toujours une réussite, 96-00 : toujours un échec ; quand cette règle
//   change l'issue, le résultat est marginal (+0 ou −0) — décision D-16.
//   Double (11, 22… 00) sur une attaque : Critique si réussite, Maladresse si échec.
// ─────────────────────────────────────────────────────────────────────────────

export const AUTO_SUCCESS_MAX = 5;
export const AUTO_FAILURE_MIN = 96;

/** Dizaine et unité d'un d100 (100 → 0 et 0) */
export const splitD100 = (v) => {
    const n = Number(v) % 100;
    return { tens: Math.floor(n / 10), units: n % 10 };
};

/** Valeur d'un d100 depuis ses deux chiffres (« 00 » → 100) */
export const joinD100 = (tens, units) => (tens * 10 + units) || 100;

/** Inversion des dizaines et des unités (72 → 27, 05 → 50, 00 → 00) */
export const reverseD100 = (v) => {
    const { tens, units } = splitD100(v);
    return joinD100(units, tens);
};

/** Dizaines d'un jet pour le calcul des DR (100 compte 10) */
const rollTens = (v) => (Number(v) === 100 ? 10 : Math.floor(Number(v) / 10));

/** Un double : 11, 22… 99 et 00 */
export const isDouble = (v) => {
    const { tens, units } = splitD100(v);
    return tens === units;
};

/** Résultat d'un jet brut contre un seuil, sans Avantage */
export const evaluate = (roll, target) => {
    const v = Number(roll);
    const t = Math.max(0, Math.floor(Number(target)));
    let success = v <= t;
    let sl = Math.floor(t / 10) - rollTens(v);
    let auto = null;
    if (v <= AUTO_SUCCESS_MAX && !success) { success = true; sl = 0; auto = 'success'; }
    else if (v >= AUTO_FAILURE_MIN && success) { success = false; sl = 0; auto = 'failure'; }
    // un échec n'a jamais de DR positifs, une réussite jamais de DR négatifs
    if (success) sl = Math.max(0, sl); else sl = Math.min(0, sl);
    return { roll: v, success, sl, auto };
};

/** Meilleur des deux résultats (réussite d'abord, puis DR) */
const better = (a, b) => {
    if (a.success !== b.success) return a.success ? a : b;
    return b.sl > a.sl ? b : a;
};

/** Avantages nets : positifs = Avantage, négatifs = Désavantage */
export const clampEdge = (edge) => Math.max(-5, Math.min(5, Math.trunc(Number(edge) || 0)));

/** Bonus de seuil des sources d'Avantage ou de Désavantage au-delà de la première */
export const edgeTargetBonus = (edge) => {
    const e = clampEdge(edge);
    if (e > 1) return (e - 1) * 10;
    if (e < -1) return (e + 1) * 10;
    return 0;
};

/**
 * Test complet.
 * @param {number} roll      d100 brut (1-100)
 * @param {number} target    seuil avant les Avantages en plus (compétence + difficulté)
 * @param {number} edge      Avantages nets (−5 à +5)
 * @returns {{ roll, used, reversed, target, success, sl, auto, double }}
 */
export const resolveTest = (roll, target, edge = 0) => {
    const e = clampEdge(edge);
    const finalTarget = Math.max(0, Number(target) + edgeTargetBonus(e));
    const straight = evaluate(roll, finalTarget);
    let chosen = straight;
    if (e !== 0) {
        const swapped = evaluate(reverseD100(roll), finalTarget);
        if (e > 0) chosen = better(straight, swapped);
        else chosen = better(straight, swapped) === straight ? swapped : straight;
    }
    return {
        roll: Number(roll), used: chosen.roll, reversed: chosen.roll !== Number(roll),
        target: finalTarget, success: chosen.success, sl: chosen.sl, auto: chosen.auto, double: isDouble(chosen.roll),
    };
};

/**
 * DR ajoutés après le jet (Supériorité, Influence, talents, Destin) : ils peuvent
 * changer l'issue ; un total nul garde l'issue d'origine (+0 / −0).
 */
export const applySlBonus = (result, bonus) => {
    const b = Math.trunc(Number(bonus) || 0);
    if (!b) return result;
    const sl = result.sl + b;
    const success = sl > 0 ? true : sl < 0 ? false : result.success;
    return { ...result, sl, success, slBonus: (result.slBonus ?? 0) + b };
};

/** Paliers de lecture des DR (livre p.187) */
export const SL_BANDS = [
    { min: 5, success: true, label: 'Réussite stupéfiante' },
    { min: 3, success: true, label: 'Réussite impressionnante' },
    { min: 1, success: true, label: 'Réussite' },
    { min: 0, success: true, label: 'Réussite marginale' },
    { min: 0, success: false, label: 'Échec marginal' },
    { min: -2, success: false, label: 'Échec' },
    { min: -4, success: false, label: 'Échec impressionnant' },
    { min: -Infinity, success: false, label: 'Échec stupéfiant' },
];

export const slBand = (sl, success) => {
    if (success) return SL_BANDS.find(b => b.success && sl >= b.min).label;
    return SL_BANDS.find(b => !b.success && sl >= b.min).label;
};

/** Affichage des DR : +3, +0, −0, −2 */
export const formatSl = (sl, success) => (sl > 0 || (sl === 0 && success) ? `+${sl}` : `−${Math.abs(sl)}`);

/** Signe d'un modificateur : +20, −10, +0 */
export const signed = (n) => (Number(n) >= 0 ? `+${Number(n)}` : `−${Math.abs(Number(n))}`);

// ── Attaques ────────────────────────────────────────────────────────────────

/** Localisation par le chiffre des unités du jet (livre p.211) */
export const HIT_LOCATION_BY_UNITS = { 1: 'head', 2: 'left_arm', 3: 'right_arm', 4: 'left_leg', 5: 'right_leg' };
export const hitLocation = (roll) => HIT_LOCATION_BY_UNITS[splitD100(roll).units] ?? 'body';

export const LOCATION_LABELS = {
    head: 'Tête', left_arm: 'Bras gauche', right_arm: 'Bras droit', body: 'Corps', left_leg: 'Jambe gauche', right_leg: 'Jambe droite',
};

/**
 * Attaque : test, puis Critique ou Maladresse sur un double, localisation, dégâts.
 * Mêlée (opposée) : arme + écart de DR (décision D-6) si l'attaquant gagne ;
 * distance : arme + DR si réussite (opposée seulement en cas d'esquive).
 * @param {{ roll, target, edge, damage, opposedSl, opposedSkill, slBonus }} p
 *   damage : dégâts de base de l'arme (BF déjà ajouté) ; opposedSl : DR du défenseur (null : non opposée) ;
 *   opposedSkill : valeur du défenseur, qui départage une égalité de DR (le plus haut gagne)
 */
export const resolveAttack = ({ roll, target, edge = 0, damage = 0, opposedSl = null, opposedSkill = null, slBonus = 0 }) => {
    const test = applySlBonus(resolveTest(roll, target, edge), slBonus);
    const critical = test.double && test.success;
    const fumble = test.double && !test.success;
    const opposed = opposedSl !== null && opposedSl !== undefined && opposedSl !== '';
    const margin = opposed ? test.sl - Number(opposedSl) : test.sl;
    const tieWon = opposedSkill !== null && opposedSkill !== undefined && Number(target) > Number(opposedSkill);
    const hits = opposed ? margin > 0 || (margin === 0 && tieWon) : test.success;
    return {
        ...test, critical, fumble, opposed, margin,
        hit: hits, location: hitLocation(test.used),
        damage: hits ? Math.max(0, Number(damage) + Math.max(0, margin)) : 0,
    };
};

/** Blessures infligées après armure ; une touche réussie inflige au moins 1 Blessure (sauf arme Inefficace) */
export const woundsAfterArmour = (damage, armour, { ineffective = false } = {}) => {
    const a = Number(armour) * (ineffective ? 2 : 1);
    const w = Math.max(0, Number(damage) - a);
    return damage > 0 && !ineffective ? Math.max(1, w) : w;
};

// ── Pouvoirs psychiques ─────────────────────────────────────────────────────

/**
 * Manifestation (livre p.161-163). Réussite : + Indice Warp ; échec : +1 par DR
 * négatif, au plus l'Indice ; Critique : Indice réduit de BFM (minimum 1) ;
 * Maladresse : Charge gagnée doublée ; Forcer : Avantage, +1d10 de Charge, et une
 * Maladresse en forçant déclenche les Périls.
 */
export const resolvePower = ({ roll, target, edge = 0, warpRating = 1, wilB = 0, push = false, pushDie = 0, slBonus = 0 }) => {
    const test = applySlBonus(resolveTest(roll, target, clampEdge(edge) + (push ? 1 : 0)), slBonus);
    const critical = test.double && test.success;
    const fumble = test.double && !test.success;
    const rating = critical ? Math.max(1, Number(warpRating) - Number(wilB)) : Number(warpRating);
    let charge = test.success ? rating : Math.min(rating, Math.abs(test.sl));
    if (fumble) charge *= 2;
    if (push) charge += Number(pushDie) || 0;
    return { ...test, critical, fumble, push, pushDie: push ? Number(pushDie) || 0 : 0, warpRating: rating, charge, perils: fumble && push };
};

/** Seuil Warp dépassé : test de Maîtrise psychique en fin de tour, sinon Périls */
export const overWarpThreshold = (charge, threshold) => Number(charge) > Number(threshold);

// ── Génération des caractéristiques ─────────────────────────────────────────

/** 2d10 + 20 par caractéristique, dans l'ordre (18 dés lancés d'un coup) */
export const charsFromDice = (values, keys) => keys.reduce((acc, k, i) => {
    acc[k] = 20 + Number(values[i * 2] ?? 0) + Number(values[i * 2 + 1] ?? 0);
    return acc;
}, {});
