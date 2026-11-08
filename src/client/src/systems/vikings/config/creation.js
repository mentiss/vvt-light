// src/client/src/systems/vikings/config/creation.js
// ─────────────────────────────────────────────────────────────────────────────
// Règles de l'assistant de création (spec_vikings.md §4 et §4.1 ;
// spec_vikings_pierre_peinte.md §9, navigation libre Q-L6-1 ; kit de départ §9.5) :
// budgets, état des traits choisis ou non, kit d'équipement, état de chaque étape,
// ce qui manque avant de créer.
// Testées dans src/client/tests/systems/vikings/creation.test.js.
// ─────────────────────────────────────────────────────────────────────────────

import { checkTraitConditions, getRunePoints, getCombatValues, getTraitSagaBonus, gainSaga } from './rules.js';
import { CARACNAMES } from './competences.js';
import { TRAITS } from './traits.js';
import { ITEMS } from './equipment.js';
import { SKILL_KITS, TRAIT_KITS, STARTING_SILVER, NO_STARTING_SILVER, DOUBLE_STARTING_SILVER } from './kits.js';

export const CREATION = {
    caracPoints: 14, minCarac: 1, maxCarac: 4,   // D-8
    skillPoints: 10, maxSkill: 3,
    minTraits: 2, maxTraits: 4,
};

/** Étapes, dans l'ordre validé (§4.1, §9.4) : 0 accueil, 5 équipement. */
export const CREATION_STEPS = ['Avant de commencer', 'Caractéristiques', 'Compétences', 'Traits', 'Runes', 'Équipement', 'Identité', 'Finalisation'];
export const STEP = { intro: 0, caracs: 1, skills: 2, traits: 3, runes: 4, gear: 5, identity: 6, final: 7 };

/** Choix du joueur dans le kit : objets retirés, choix faits, noms donnés, achats */
export const EMPTY_GEAR = { off: [], pick: {}, names: {}, bought: [] };

/** Points restants : caractéristiques, compétences, runes (livre de sort des traits). */
export const getCreationBudget = (character) => {
    const caracUsed = Object.keys(CARACNAMES).reduce((sum, k) => sum + (character[k] ?? 0), 0);
    const skillUsed = (character.skills ?? []).reduce((sum, s) => sum + (s.level ?? 0), 0);
    const runes = getRunePoints(character);
    return {
        caracLeft: CREATION.caracPoints - caracUsed,
        skillLeft: CREATION.skillPoints - skillUsed,
        runeBook:  runes.total,
        runeSpent: runes.spent,
        runeLeft:  runes.available,
    };
};

/**
 * SAGA de départ (1, plus les « SAGA +N » des traits, plafonnée : D-9, D-11) et
 * valeurs de combat dérivées des traits et des objets équipés, telles qu'elles seront enregistrées.
 */
export const getStartingValues = (character) => {
    const bonus = getTraitSagaBonus((character.traits ?? []).map(t => t.name));
    const { sagaActuelle } = gainSaga({ sagaActuelle: 1, sagaTotale: 1 }, bonus);
    const combat = getCombatValues(character);
    return {
        bonus, saga: sagaActuelle, actions: combat.actions, seuil: combat.seuil,
        armure: combat.armureTotale + combat.armureBoucliers,
    };
};

/**
 * État d'un trait pour l'assistant, avec la raison quand il n'est pas accessible :
 *   { selected, invalid, reason }  trait choisi ; invalid : il n'est plus accessible
 *                                  (carac ou compétence baissée après coup, incompatibilité)
 *   { unavailable, reason }        trait non choisi et hors de portée
 *   {}                             trait accessible
 */
export const getTraitState = (character, trait) => {
    const chosen = character.traits ?? [];
    const selected = chosen.some(t => t.name === trait.name);
    const clash = (trait.incompatible ?? []).find(name => name !== trait.name && chosen.some(t => t.name === name));
    const conditions = checkTraitConditions(character, trait);
    if (selected) {
        const reason = !conditions.can ? conditions.reason : clash ? `Incompatible avec ${clash}` : null;
        return { selected: true, invalid: !!reason, reason };
    }
    if (chosen.length >= CREATION.maxTraits) return { unavailable: true, reason: `${CREATION.maxTraits} traits déjà choisis` };
    if (clash) return { unavailable: true, reason: `Incompatible avec ${clash}` };
    if (!conditions.can) return { unavailable: true, reason: conditions.reason };
    return {};
};

/** Traits choisis qui ne sont plus accessibles, avec leur raison. */
export const getInvalidTraits = (character) => (character.traits ?? [])
    .map(t => ({ name: t.name, ...getTraitState(character, TRAITS.find(d => d.name === t.name) ?? t) }))
    .filter(s => s.invalid);

// ── Kit de départ (§9.5) ─────────────────────────────────────────────────────

export const SILVER_ITEM = 'Once d\'argent';
const catalogItem = (name) => ITEMS.find(i => i.name === name) ?? { name, category: 'item' };

/** Objets achetables à la création : un prix, pas d'argent, pas d'acier (après 830). */
export const CREATION_MARKET = ITEMS.filter(i => i.price != null && i.name !== SILVER_ITEM && i.material !== 'Acier');

/** Ce qu'il faut savoir d'un objet en une ligne : « 1 main · 2 tokens », « armure 1 », ses notes. */
export const formatItemNote = (item) => {
    if (item.category === 'weapon') return [item.weaponType, `${item.damage} token${item.damage > 1 ? 's' : ''}`, item.notes].filter(Boolean).join(' · ');
    if (item.category === 'armor') return `armure ${item.armorValue}`;
    return item.notes ?? '';
};

/** Ligne d'inventaire à partir d'un objet du catalogue ; armes et armures équipées, outils et objets au sac. */
export const toInventoryItem = (def, extra = {}) => ({
    name: def.name, category: def.category, quantity: 1,
    location: def.category !== 'item' && !def.tool ? 'equipped' : 'bag',
    ...(def.weaponType ? { weaponType: def.weaponType, damage: def.damage } : {}),
    ...(def.range ? { range: def.range } : {}),
    ...(def.category === 'armor' ? { armorValue: def.armorValue } : {}),
    ...(def.requirements ? { requirements: def.requirements } : {}),
    ...(def.notes ? { notes: def.notes } : {}),
    ...extra,
});

/**
 * Kit du personnage : ce que donnent ses compétences de métier (dès le niveau 1) et ses
 * traits, les choix faits par le joueur (`gear`), l'argent et les achats.
 * @returns {{ lines, items, silver: { base, bonus, total, spent, left }, pending }}
 *   lines   : [{ source, kind: 'skill'|'trait', rows }] pour l'affichage ; une ligne par entrée :
 *             { key, type: 'item'|'silver'|'choice'|'heirloom'|'named', … }, `duplicateOf` si
 *             l'objet est déjà donné par une autre source, `removed` si le joueur l'a retiré
 *   items   : lignes d'inventaire du kit et des achats (sans l'argent)
 *   pending : choix encore à faire [{ source, text }]
 */
export const getCreationKit = (character, gear = EMPTY_GEAR) => {
    const sources = [];
    (character.skills ?? []).filter(s => (s.level ?? 0) > 0 && SKILL_KITS[s.name]).forEach(s => {
        if (!sources.some(x => x.source === s.name)) sources.push({ source: s.name, kind: 'skill', entries: SKILL_KITS[s.name] });
    });
    (character.traits ?? []).filter(t => TRAIT_KITS[t.name]).forEach(t => sources.push({ source: t.name, kind: 'trait', entries: TRAIT_KITS[t.name] }));

    const items = [], pending = [], given = new Map();
    let bonus = 0;
    const give = (key, source, def, extra) => {
        if (!extra?.customItem && given.has(def.name)) return { duplicateOf: given.get(def.name) };
        if (!extra?.customItem) given.set(def.name, source);
        const removed = gear.off.includes(key);
        if (!removed) items.push(toInventoryItem(def, extra));
        return { removed };
    };

    const lines = sources.map(({ source, kind, entries }) => ({ source, kind, rows: entries.map((entry, i) => {
        const key = `${source}#${i}`;
        if (typeof entry === 'string') return { key, type: 'item', name: entry, ...give(key, source, catalogItem(entry)) };
        if (entry.silver) { bonus += entry.silver; return { key, type: 'silver', silver: entry.silver }; }
        if (entry.named) {
            const value = (gear.names[key] ?? '').trim();
            if (value) items.push({ name: value, category: 'item', quantity: 1, location: 'bag', notes: entry.named, customItem: true });
            else pending.push({ source, text: `${source} : nommer ${entry.named.toLowerCase()}` });
            return { key, type: 'named', label: entry.named, hint: entry.hint, value: gear.names[key] ?? '' };
        }
        const pick = gear.pick[key];
        if (entry.choice) {
            const option = pick != null ? entry.choice[pick] : null;
            if (option == null) pending.push({ source, text: `${source} : faire un choix` });
            else if (typeof option === 'object') bonus += option.silver;
            return { key, type: 'choice', options: entry.choice, pick,
                ...(typeof option === 'string' ? give(key, source, catalogItem(option)) : {}) };
        }
        if (entry.heirloom) {
            const value = (gear.names[key] ?? '').trim();
            if (pick == null) pending.push({ source, text: `${source} : choisir l'arme de famille` });
            else {
                const base = catalogItem(entry.heirloom[pick]);
                items.push(toInventoryItem(base, { name: value || base.name, notes: `Arme de famille (${base.name})`, customItem: true }));
            }
            return { key, type: 'heirloom', options: entry.heirloom, pick, value: gear.names[key] ?? '' };
        }
        return { key };
    }) }));

    // Argent : 10 oz, rien pour un ancien esclave ou une dette de sang, doublé pour un fin négociant, plus les dons des traits
    const names = (character.traits ?? []).map(t => t.name);
    const base = names.some(n => NO_STARTING_SILVER.includes(n)) ? 0
        : STARTING_SILVER * (names.some(n => DOUBLE_STARTING_SILVER.includes(n)) ? 2 : 1);
    const total = base + bonus;
    const counts = gear.bought.reduce((acc, name) => ({ ...acc, [name]: (acc[name] ?? 0) + 1 }), {});
    const spent = gear.bought.reduce((sum, name) => sum + (catalogItem(name).price ?? 0), 0);
    Object.entries(counts).forEach(([name, quantity]) => items.push(toInventoryItem(catalogItem(name), { quantity })));
    return { lines, items, silver: { base, bonus, total, spent, left: total - spent }, pending };
};

/** Inventaire à enregistrer : le kit, les achats et l'argent restant dans la bourse. */
export const getCreationInventory = (character, gear = EMPTY_GEAR) => {
    const kit = getCreationKit(character, gear);
    const silver = kit.silver.left > 0 ? [toInventoryItem(catalogItem(SILVER_ITEM), { quantity: kit.silver.left })] : [];
    return [...kit.items, ...silver];
};

// ── Étapes ───────────────────────────────────────────────────────────────────

/**
 * État d'une étape : 'done', 'todo', 'invalid' (à revoir) ou 'skipped' (Runes sans
 * livre de sort). L'accueil et la Finalisation n'ont pas d'état propre.
 */
export const getCreationStepStatus = (character, step, gear = EMPTY_GEAR) => {
    const b = getCreationBudget(character);
    switch (step) {
        case STEP.caracs: return b.caracLeft === 0 ? 'done' : 'todo';
        case STEP.skills: return b.skillLeft === 0 ? 'done' : 'todo';
        case STEP.traits: return getInvalidTraits(character).length ? 'invalid'
            : (character.traits ?? []).length >= CREATION.minTraits ? 'done' : 'todo';
        case STEP.runes: if (b.runeLeft < 0) return 'invalid';
            if (b.runeBook === 0) return 'skipped';
            return b.runeLeft === 0 ? 'done' : 'todo';
        case STEP.gear: {
            const kit = getCreationKit(character, gear);
            return kit.silver.left < 0 ? 'invalid' : kit.pending.length ? 'todo' : 'done';
        }
        case STEP.identity: return character.prenom?.trim() && character.nom?.trim() ? 'done' : 'todo';
        default: return 'todo';
    }
};

/** Recherche insensible à la casse et aux accents (« foret » trouve « forêt », §4.1). */
const fold = (text) => (text ?? '').normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
export const matchesSearch = (query, ...texts) => texts.some(text => fold(text).includes(fold(query)));

const plural = (n, word) => `${n} ${word}${n > 1 ? 's' : ''}`;

/** Ce qui manque avant de créer le personnage : [{ step, text }] (vide = création possible). */
export const getCreationMissing = (character, gear = EMPTY_GEAR) => {
    const b = getCreationBudget(character);
    const kit = getCreationKit(character, gear);
    const traits = (character.traits ?? []).length;
    const out = [];
    if (b.caracLeft > 0) out.push({ step: STEP.caracs, text: `${plural(b.caracLeft, 'point')} de caractéristiques à placer` });
    if (b.skillLeft > 0) out.push({ step: STEP.skills, text: `${plural(b.skillLeft, 'point')} de compétences à placer` });
    if (traits < CREATION.minTraits) out.push({ step: STEP.traits, text: `${plural(CREATION.minTraits - traits, 'trait')} à choisir (${CREATION.minTraits} à ${CREATION.maxTraits})` });
    getInvalidTraits(character).forEach(t => out.push({ step: STEP.traits, text: `${t.name} n'est plus accessible : ${t.reason.charAt(0).toLowerCase()}${t.reason.slice(1)}` }));
    if (b.runeBook > 0 && b.runeLeft > 0) out.push({ step: STEP.runes, text: `${plural(b.runeLeft, 'point')} de runes à placer` });
    if (b.runeLeft < 0) out.push({ step: STEP.runes, text: `Trop de points de runes pour le livre de sort (${b.runeSpent} sur ${b.runeBook})` });
    kit.pending.forEach(p => out.push({ step: STEP.gear, text: p.text }));
    if (kit.silver.left < 0) out.push({ step: STEP.gear, text: `Achats au-delà de la bourse (${kit.silver.spent} oz sur ${kit.silver.total})` });
    if (!character.prenom?.trim()) out.push({ step: STEP.identity, text: 'Prénom' });
    if (!character.nom?.trim()) out.push({ step: STEP.identity, text: `Nom du parent (« ${character.sexe === 'femme' ? 'fille' : 'fils'} de »)` });
    return out;
};
