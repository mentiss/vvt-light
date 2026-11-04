// src/client/src/systems/nimble/config/rules/items.js
// ─────────────────────────────────────────────────────────────────────────────
// Lignes d'inventaire tirées du catalogue d'équipement (spec_nimble.md §4.2) — pur.
// Les caractéristiques utiles au jeu sont copiées dans `data` (dégâts,
// propriétés, Défense…) : la fiche reste juste si le catalogue évolue.
// ─────────────────────────────────────────────────────────────────────────────

import { ITEM_BY_KEY } from '../catalog.js';

let tempId = 0;
/** Identifiant temporaire d'une ligne pas encore enregistrée */
export const newId = () => `new-${Date.now()}-${tempId++}`;

/** Données copiées d'une entrée de catalogue, selon sa nature */
export const itemData = (kind, e) => {
    if (kind === 'weapon') {
        return { damage: e.damage, stat: e.stat, range: e.range, damageType: e.damageType, props: e.props ?? [], tags: e.tags ?? [],
            twoHanded: !!e.twoHanded, req: e.req ?? null, vo: e.vo };
    }
    if (kind === 'armor' || kind === 'shield') {
        return { type: e.type, defense: e.defense, addDex: e.addDex !== false && kind === 'armor', dexMax: e.dexMax ?? null, req: e.req ?? null, vo: e.vo };
    }
    if (kind === 'magic') return { rarity: e.rarity, text: e.text, vo: e.vo };
    return { text: e.text ?? '', heal: e.heal ?? null, vo: e.vo };
};

/**
 * Ligne d'inventaire depuis une clé de catalogue (ou `null` si inconnue).
 * @param {string} key
 * @param {{ quantity?: number, equipped?: boolean }} [opts]
 */
export const itemFromCatalog = (key, { quantity = 1, equipped = false } = {}) => {
    const found = ITEM_BY_KEY[key];
    if (!found) return null;
    const { kind, entry } = found;
    return {
        id: newId(), itemKey: key, kind, name: entry.name, data: itemData(kind, entry),
        quantity, slots: entry.slots ?? 1, equipped, proficient: null, notes: '',
    };
};

/** Ligne libre (objet hors catalogue) */
export const customItem = ({ name, description = '', kind = 'gear', slots = 1, damage = '', stat = 'str' }) => ({
    id: newId(), itemKey: null, kind, name: name.trim(), quantity: 1, slots, equipped: false, proficient: null, notes: '',
    data: kind === 'weapon' ? { damage: damage || '1d6', stat, range: 'melee', props: [], tags: [], text: description } : { text: description },
});

/**
 * Paquetage de départ d'une classe : armes, armures et boucliers portés d'office
 * (une seule armure), objets hors catalogue en lignes libres.
 */
export const startingItems = (gear = []) => {
    let armorWorn = false;
    return gear.map(g => {
        if (g.key) {
            const kind = ITEM_BY_KEY[g.key]?.kind;
            const equip = kind === 'weapon' || kind === 'shield' || (kind === 'armor' && !armorWorn);
            if (kind === 'armor' && equip) armorWorn = true;
            return itemFromCatalog(g.key, { quantity: g.qty ?? 1, equipped: equip });
        }
        return g.name ? { ...customItem({ name: g.name }), quantity: g.qty ?? 1 } : null;
    }).filter(Boolean);
};

/** Équiper une armure retire l'autre armure portée (une seule à la fois) */
export const toggleEquip = (items, id) => {
    const target = items.find(it => it.id === id);
    if (!target) return items;
    const on = !target.equipped;
    return items.map(it => {
        if (it.id === id) return { ...it, equipped: on };
        if (on && target.kind === 'armor' && it.kind === 'armor') return { ...it, equipped: false };
        return it;
    });
};

/** Inventaire trié : armes, armures, boucliers, objets magiques, objets */
const KIND_ORDER = { weapon: 0, armor: 1, shield: 2, magic: 3, gear: 4 };
export const sortedItems = (items = []) => [...items].sort((a, b) => (KIND_ORDER[a.kind] ?? 9) - (KIND_ORDER[b.kind] ?? 9));
