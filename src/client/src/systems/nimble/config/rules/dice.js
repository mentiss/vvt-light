// src/client/src/systems/nimble/config/rules/dice.js
// ─────────────────────────────────────────────────────────────────────────────
// Résolution des jets de Nimble (Core Rules 3.3 p.9, 13-14, 34 ; spec_nimble.md §1.1, §5) — pur.
//
// Attaque : on lance les dés de dégâts. Le dé le plus à gauche restant (dé
// primaire) décide : 1 = raté, maximum = critique (on relance le dé primaire et
// on ajoute, à chaque maximum). Avantage / désavantage X : X dés de plus, on
// retire les X plus bas / plus hauts, de gauche à droite en cas d'égalité.
// Féroce : un dé de plus à chaque fois qu'on lance des dégâts de critique.
// La chaîne de critique ('1dS!') et la réserve Féroce sont tirées d'avance dans
// le même jet ; seuls les dés utilisés comptent (et s'affichent).
// ─────────────────────────────────────────────────────────────────────────────

/** Nombre maximal de dés Féroce tirés d'avance (au-delà, chaîne improbable) */
export const VICIOUS_POOL = 8;
/** Avantage / désavantage net au plus (±) */
export const MAX_EDGE = 6;

export const clampEdge = (n) => Math.max(-MAX_EDGE, Math.min(MAX_EDGE, Math.trunc(Number(n) || 0)));

/**
 * Retire |edge| dés : les plus bas si edge > 0 (avantage), les plus hauts si
 * edge < 0 (désavantage) ; à égalité, le plus à gauche part en premier.
 * @param {number[]} values  dés dans l'ordre du jet
 * @param {number}   edge    avantage net (négatif = désavantage)
 * @returns {{ kept: number[], dropped: number[] }}  indices gardés (ordre d'origine) et retirés
 */
export const pickDice = (values, edge = 0) => {
    const drop = Math.min(Math.abs(edge), Math.max(0, values.length - 1));
    const order = values.map((v, i) => ({ v, i }))
        .sort((a, b) => (edge > 0 ? a.v - b.v : b.v - a.v) || a.i - b.i);
    const dropped = order.slice(0, drop).map(d => d.i).sort((a, b) => a - b);
    const kept = values.map((_, i) => i).filter(i => !dropped.includes(i));
    return { kept, dropped };
};

/** Nombre de dés à lancer pour un jet de `count` dés avec un avantage net `edge` */
export const dicePoolSize = (count, edge = 0) => count + Math.abs(clampEdge(edge));

/** d44 / d66 / d88 : le premier dé donne les dizaines, le second les unités */
export const resolveTensDie = (values) => (values[0] ?? 0) * 10 + (values[1] ?? 0);

/**
 * Résout un jet d'attaque.
 * @param {object} p
 * @param {number[]} p.base        dés lancés (dicePoolSize), dans l'ordre
 * @param {number}   p.sides       taille du dé
 * @param {number}   [p.edge=0]    avantage net
 * @param {number[]} [p.chain=[]]  chaîne de critique tirée d'avance ('1dS!')
 * @param {number[]} [p.viciousPool=[]]
 * @param {boolean}  [p.vicious=false]
 * @param {boolean}  [p.canCrit=true]   arme non maîtrisée, sbire, zone : false
 * @param {boolean}  [p.canMiss=true]   zone, « ne peut pas rater » : false
 * @param {boolean}  [p.opening=false]  Évaluer : ouverture (+1 face au dé primaire)
 * @param {number}   [p.bonus=0]        modificateur ajouté une fois
 * @param {boolean}  [p.special=false]  d44/d66/d88 : ni raté ni critique
 */
export const resolveAttack = ({
    base, sides, edge = 0, chain = [], viciousPool = [], vicious = false,
    canCrit = true, canMiss = true, opening = false, bonus = 0, special = false,
}) => {
    if (special) {
        const value = resolveTensDie(base);
        return {
            kept: [0, 1], dropped: [], primaryIndex: null, primary: null, miss: false, crit: false, critCount: 0,
            chain: [], vicious: [], diceTotal: value, bonus, total: Math.max(0, value + bonus), special: true,
        };
    }
    const { kept, dropped } = pickDice(base, edge);
    const primaryIndex = kept[0] ?? null;
    const raw = primaryIndex === null ? 0 : base[primaryIndex];
    const primary = opening ? Math.min(sides, raw + 1) : raw;
    const miss = canMiss && primaryIndex !== null && primary === 1;
    const crit = !miss && canCrit && primaryIndex !== null && primary === sides;

    // Chaîne : chaque maximum relance le dé ; Féroce : un dé par lancer de dégâts de critique
    const usedChain = crit ? chain : [];
    const critCount = crit ? 1 + usedChain.filter(v => v === sides).length : 0;
    const usedVicious = crit && vicious ? viciousPool.slice(0, critCount) : [];

    const keptSum = kept.reduce((s, i) => s + (i === primaryIndex ? primary : base[i]), 0);
    const diceTotal = miss ? 0 : keptSum + usedChain.reduce((s, v) => s + v, 0) + usedVicious.reduce((s, v) => s + v, 0);
    return {
        kept, dropped, primaryIndex, primary, opening: opening && primary !== raw, miss, crit, critCount,
        chain: usedChain, vicious: usedVicious, diceTotal, bonus, total: miss ? 0 : Math.max(0, diceTotal + bonus), special: false,
    };
};

/**
 * Résout un d20 (test de compétence, sauvegarde, initiative) : avantage = meilleur
 * dé, désavantage = pire ; 1 naturel échoue, 20 naturel réussit.
 * @returns {{ natural, total, keptIndex, success: boolean|null, nat1, nat20 }}
 */
export const resolveD20 = (values, edge = 0, bonus = 0, dc = null) => {
    const { kept } = pickDice(values, edge);
    const keptIndex = kept[0] ?? 0;
    const natural = values[keptIndex] ?? 0;
    const total = natural + bonus;
    const nat1 = natural === 1;
    const nat20 = natural === 20;
    let success = null;
    if (nat1) success = false;
    else if (nat20) success = true;
    else if (dc !== null && dc !== undefined && dc !== '') success = total >= Number(dc);
    return { natural, total, keptIndex, kept, success, nat1, nat20 };
};

/**
 * Initiative → actions du premier tour : un chiffre = 1, deux chiffres = 2,
 * 20 ou plus (ou 20 naturel) = 3. Un total négatif ou nul donne 1 action.
 */
export const initiativeActions = (total, natural = 0) => {
    if (natural === 20 || total >= 20) return 3;
    if (total >= 10) return 2;
    return 1;
};

/**
 * Soins par dés de vie : chaque dé + `perDie` (FOR, éventuellement négative,
 * jamais sous 0 par dé) ; `max` : chaque dé compte pour son maximum (Monter le camp).
 */
export const resolveHitDice = (values, sides, perDie = 0, max = false) => {
    const each = values.map(v => Math.max(0, (max ? sides : v) + perDie));
    return { each, total: each.reduce((s, v) => s + v, 0) };
};

/**
 * Attaque groupée de sbires (GM's Guide p.7) : un dé par sbire, les 1 ratent,
 * pas de critique ; les dégâts s'additionnent en une seule attaque.
 */
export const resolveMinions = (values, bonus = 0) => {
    const hits = values.filter(v => v > 1);
    return { hits: hits.length, total: hits.reduce((s, v) => s + v + bonus, 0) };
};

/** Somme simple d'un jet (soins de capacité, jets « plain ») */
export const sumDice = (values, bonus = 0) => values.reduce((s, v) => s + v, 0) + bonus;
