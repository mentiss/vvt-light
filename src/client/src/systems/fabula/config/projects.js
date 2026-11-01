// src/client/src/systems/fabula/config/projects.js
// ─────────────────────────────────────────────────────────────────────────────
// Projets du Bricoleur (livre de base p. 134-137, errata 06/2024 appliqué) :
// barèmes de puissance, zone et utilisation, quantités de dégâts / soins par
// niveau, et calcul d'un projet. Source unique pour les tables de l'onglet
// Référence et pour le calculateur (documentations/spec_fabula_reference.md).
// ─────────────────────────────────────────────────────────────────────────────

/** Puissance : coût de base en zénits et ce qu'elle autorise (p. 135-136). */
export const PROJECT_POWERS = [
    {
        key: 'mineure', label: 'Mineure', cost: 100,
        can: 'Éclairer, transporter des passagers ou des cargaisons sur terre ou sur les eaux, procurer une forme de protection limitée.',
        damage: 'Non disponibles', amountIndex: null,
        protection: 'Une résistance (consommable)',
    },
    {
        key: 'moyenne', label: 'Moyenne', cost: 200,
        can: 'Voyager sous l’eau, contenir un sort, transmettre le son ou la parole, réaliser une opération spécifique à la place de l’inventeur, fournir de l’énergie sur une courte durée.',
        damage: 'Mineurs', amountIndex: 0,
        protection: 'Une résistance',
    },
    {
        key: 'majeure', label: 'Majeure', cost: 400,
        can: 'Voler, altérer la nature d’une zone pendant une brève période, annuler les effets d’un sort, posséder une intelligence élémentaire, combattre aux côtés de son inventeur, fournir de l’énergie à long terme, capturer ou immobiliser la cible.',
        damage: 'Lourds', amountIndex: 1,
        protection: 'Une immunité ou deux résistances',
    },
    {
        key: 'extreme', label: 'Extrême', cost: 800,
        can: 'Altérer la nature d’une zone pendant longtemps, contenir la puissance d’un démon, empêcher une catastrophe, disposer d’une intelligence et d’une personnalité normales.',
        damage: 'Massifs', amountIndex: 2,
        protection: 'Deux immunités ou trois résistances',
    },
];

/** Zone d'effet : multiplicateur du coût (p. 135). */
export const PROJECT_AREAS = [
    { key: 'individuelle', label: 'Individuelle', multiplier: 1, examples: 'Une créature de taille humaine, une porte, un arbre, une arme.' },
    { key: 'petite',       label: 'Petite',       multiplier: 2, examples: 'Quelques créatures de taille humaine, une grande créature, une petite clairière, une pièce, une voiture de train, une cabane.' },
    { key: 'grande',       label: 'Grande',       multiplier: 3, examples: 'Une foule, une petite forêt, un aéronef ou un galion, le hall d’un château, une maison, une créature géante.' },
    { key: 'immense',      label: 'Immense',      multiplier: 4, examples: 'Une forteresse, un lac, le sommet d’une montagne, un village, un quartier dans une ville.' },
];

/** Utilisation : multiplicateur du coût (p. 135). */
export const PROJECT_USAGES = [
    { key: 'consommable', label: 'Consommable', multiplier: 1, description: 'Ne peut plus jamais être utilisée à moins que le créateur n’en fabrique un nouvel exemplaire.' },
    { key: 'permanente',  label: 'Permanente',  multiplier: 5, description: 'Reste disponible pour plusieurs utilisations dans différentes situations.' },
];

/**
 * Quantité de dégâts / soins selon le niveau de l'inventeur (p. 136).
 * Colonnes dans l'ordre mineurs / lourds / massifs (lecture validée, R-8).
 */
export const PROJECT_AMOUNT_LABELS = ['Quantité mineure', 'Quantité majeure', 'Quantité énorme'];
export const PROJECT_AMOUNTS = [
    { minLevel: 5,  values: [10, 30, 40] },
    { minLevel: 20, values: [20, 40, 60] },
    { minLevel: 40, values: [30, 50, 80] },
];

const DEFECT_FACTOR   = 0.75;  // défaut grave : −25 % du coût total
const ZENITS_PER_PP   = 100;   // 1 Point de Progression par tranche de 100 z
const VISIONARY_ZENITS = 100;  // Visionnaire : NC × 100 z de matériaux payés

const byKey = (list, key) => list.find(entry => entry.key === key) ?? list[0];

/**
 * Quantité de dégâts / soins d'une invention, ou null si sa puissance n'en
 * permet pas. Sous le niveau 5, on lit la ligne du niveau 5.
 */
export function projectAmount(powerKey, level) {
    const { amountIndex } = byKey(PROJECT_POWERS, powerKey);
    if (amountIndex === null) return null;
    const row = [...PROJECT_AMOUNTS].reverse().find(r => (level ?? 0) >= r.minLevel) ?? PROJECT_AMOUNTS[0];
    return row.values[amountIndex];
}

/**
 * Calcule un projet.
 * @param {object}  p
 * @param {string}  p.power          clé de PROJECT_POWERS
 * @param {string}  p.area           clé de PROJECT_AREAS
 * @param {string}  p.usage          clé de PROJECT_USAGES
 * @param {boolean} [p.defect]       défaut grave négocié
 * @param {number}  [p.visionaryRanks] rangs de Visionnaire cumulés des travailleurs
 * @param {number}  [p.players]      PJ sans niveau de Bricoleur qui travaillent chaque jour
 * @param {number}  [p.tinkerers]    PJ avec au moins un niveau de Bricoleur qui travaillent
 * @param {number}  [p.assistants]   assistants engagés
 * @param {number}  [p.level]        niveau de l'inventeur (quantités de dégâts / soins)
 */
export function computeProject({
    power, area, usage, defect = false,
    visionaryRanks = 0, players = 0, tinkerers = 0, assistants = 0, level = 5,
}) {
    const powerDef = byKey(PROJECT_POWERS, power);
    const baseCost = powerDef.cost * byKey(PROJECT_AREAS, area).multiplier * byKey(PROJECT_USAGES, usage).multiplier;
    const totalCost = defect ? baseCost * DEFECT_FACTOR : baseCost;

    const paidByVisionary = Math.min(totalCost, Math.max(0, visionaryRanks) * VISIONARY_ZENITS);
    // Livre : 1 750 z → 17 PP (arrondi inférieur), minimum 1
    const progressRequired = Math.max(1, Math.floor(totalCost / ZENITS_PER_PP));
    // +1 par PJ, +1 de plus par Bricoleur, +1 par assistant, +NC par Visionnaire
    const progressPerDay = Math.max(0, players) + Math.max(0, tinkerers) * 2
        + Math.max(0, assistants) + Math.max(0, visionaryRanks);

    return {
        totalCost,
        paidByVisionary,
        materialsToPay: totalCost - paidByVisionary,
        assistantsWage: Math.max(0, assistants) * totalCost / 2,
        progressRequired,
        progressPerDay,
        days: progressPerDay > 0 ? Math.ceil(progressRequired / progressPerDay) : null,
        specialIngredient: powerDef.cost >= byKey(PROJECT_POWERS, 'moyenne').cost,
        damage: powerDef.damage,
        amount: projectAmount(powerDef.key, level),
        protection: powerDef.protection,
    };
}
