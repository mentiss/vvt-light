// src/client/src/systems/nimble/config/catalog.js
// ─────────────────────────────────────────────────────────────────────────────
// Index des catalogues transcrits (documentations/nimble/format_catalogues.md) :
// un seul point d'entrée pour les règles et les composants.
// ─────────────────────────────────────────────────────────────────────────────

import berserker from './classes/berserker.js';
import cheat from './classes/cheat.js';
import commander from './classes/commander.js';
import hunter from './classes/hunter.js';
import mage from './classes/mage.js';
import oathsworn from './classes/oathsworn.js';
import shadowmancer from './classes/shadowmancer.js';
import shepherd from './classes/shepherd.js';
import songweaver from './classes/songweaver.js';
import stormshifter from './classes/stormshifter.js';
import zephyr from './classes/zephyr.js';
import { ANCESTRIES, LANGUAGES } from './ancestries.js';
import { BACKGROUNDS } from './backgrounds.js';
import { SPELLS, SCHOOLS } from './spells.js';
import { WEAPONS, ARMORS, GEAR, MAGIC_ITEMS } from './equipment.js';
import { BOONS, EPIC_BOONS } from './boons.js';

/** Les 11 classes, dans l'ordre du livre */
export const CLASS_LIST = [berserker, cheat, commander, hunter, mage, oathsworn, shadowmancer, shepherd, songweaver, stormshifter, zephyr];
export const CLASSES = Object.fromEntries(CLASS_LIST.map(c => [c.key, c]));

const byKey = (list) => Object.fromEntries(list.map(x => [x.key, x]));
export const ANCESTRY_BY_KEY = byKey(ANCESTRIES);
export const BACKGROUND_BY_KEY = byKey(BACKGROUNDS);
export const LANGUAGE_BY_KEY = byKey(LANGUAGES);
export const SCHOOL_BY_KEY = byKey(SCHOOLS);
export const BOON_BY_KEY = byKey([...BOONS, ...EPIC_BOONS]);

/** Objets d'inventaire du catalogue : clé → { kind, entry } */
export const ITEM_BY_KEY = Object.fromEntries([
    ...WEAPONS.map(w => [w.key, { kind: 'weapon', entry: w }]),
    ...ARMORS.map(a => [a.key, { kind: a.type === 'shield' ? 'shield' : 'armor', entry: a }]),
    ...GEAR.map(g => [g.key, { kind: 'gear', entry: g }]),
    ...MAGIC_ITEMS.map(m => [m.key, { kind: 'magic', entry: m }]),
]);

/** Sorts des écoles communes et sorts propres aux classes / sous-classes, par clé */
export const ALL_SPELLS = [
    ...SPELLS,
    ...CLASS_LIST.flatMap(c => [...(c.spells ?? []), ...(c.subclasses ?? []).flatMap(s => s.spells ?? [])]),
];
export const SPELL_BY_KEY = byKey(ALL_SPELLS);
