// src/client/src/systems/maledictum/config/rules/items.js
// ─────────────────────────────────────────────────────────────────────────────
// Objets d'inventaire (fonctions pures, testées) : catalogue unique (livre de base
// et Inquisition Player's Guide), ligne d'inventaire depuis le catalogue ou libre,
// rattachement des libellés d'équipement de départ (factions, rôles, origines) au
// catalogue. Les armes passent en tête de la liste.
// ─────────────────────────────────────────────────────────────────────────────

import * as CORE from '../equipment.js';
import * as IPG from '../equipmentInquisition.js';

const KIND_OF = { WEAPONS: 'weapon', GRENADES: 'weapon', ARMOUR: 'armour', FORCE_FIELDS: 'armour', GEAR: 'gear', AUGMETICS: 'augmetic', AMMO: 'ammo' };

export const KIND_LABELS = { weapon: 'Armes', armour: 'Armures', gear: 'Équipement', augmetic: 'Augmétiques', ammo: 'Munitions' };
export const KIND_ORDER = ['weapon', 'armour', 'augmetic', 'gear', 'ammo'];

const list = (mod, name) => (Array.isArray(mod?.[name]) ? mod[name] : []);

/** Catalogue complet : chaque entrée porte kind et group (libellé de rangement) */
export const CATALOG = Object.entries(KIND_OF).flatMap(([name, kind]) => [
    ...list(CORE, name).map(e => ({ ...e, kind: e.category === 'augmetic' ? 'augmetic' : kind, catalog: name })),
    ...list(IPG, name).map(e => ({ ...e, kind: e.category === 'augmetic' ? 'augmetic' : kind, catalog: name })),
]);
export const CATALOG_BY_KEY = Object.fromEntries(CATALOG.map(e => [e.key, e]));

const DATA_FIELDS = ['spec', 'damage', 'damageBonus', 'range', 'mag', 'enc', 'cost', 'availability', 'traits', 'locations', 'armour',
    'category', 'summary', 'protection', 'overload', 'group', 'source', 'page'];

/** Ligne d'inventaire depuis une entrée du catalogue (caractéristiques copiées, modifiables) */
export const itemFromEntry = (entry, extra = {}) => ({
    id: `new-${entry.key}-${Math.random().toString(36).slice(2, 8)}`,
    itemKey: entry.key, kind: entry.kind, name: entry.label,
    data: Object.fromEntries(DATA_FIELDS.filter(f => entry[f] !== undefined && entry[f] !== null).map(f => [f, entry[f]])),
    quantity: 1, equipped: entry.kind === 'armour', notes: '', ...extra,
});

export const customItem = ({ name, notes = '', kind = 'gear' }) => ({
    id: `new-free-${Math.random().toString(36).slice(2, 8)}`, itemKey: null, kind, name: name.trim(), data: {}, quantity: 1, equipped: false, notes,
});

const norm = (s) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/\([^)]*\)/g, ' ').replace(/[^a-z0-9]+/g, ' ').trim();

const BY_LABEL = new Map();
for (const e of CATALOG) {
    // libellé entier, puis chaque nom d'un libellé double (« Micro-perle / Perle vox »)
    for (const l of [e.label, e.labelEn, ...String(e.label ?? '').split('/')]) {
        if (l && norm(l) && !BY_LABEL.has(norm(l))) BY_LABEL.set(norm(l), e);
    }
}

/** Noms de l'équipement de départ (factions, rôles, origines) qui diffèrent du
 *  catalogue. Clés comparées avec leur parenthèse (« Fusil de chasse (à pompe) »). */
const normFull = (s) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const ALIASES = Object.fromEntries(Object.entries({
    'Combinaison blindée': 'armoured_bodyglove', 'Cuirs lourds': 'heavy_leathers', 'Cuirs légers': 'robes_light_leathers',
    'Robe': 'robes_light_leathers', 'Robe de cultiste': 'robes_light_leathers', 'Armure pare-éclats': 'astra_militarum_flak_armour',
    'Fusil de chasse': 'pump_action_shotgun', 'Fusil de chasse (à pompe)': 'pump_action_shotgun', 'Fusil de chasse (de combat)': 'combat_shotgun',
    'Lance-flammes de poing': 'hand_flamer', 'Grenade à fragmentation': 'frag_grenade', 'Pistolet à balles automatique': 'autopistol',
    'Coup-de-poing américain': 'brass_knuckles', "Couteau d'origine xenos": 'knife',
    "Bretelles d'arme": 'backpack_slings', 'Plume automatique': 'auto_quill', 'Instruments de chirurgien': 'chirurgeons_kit',
    'Outil combiné': 'combi_tool', 'Multiboussole': 'multicompass', 'Nécessaire de déguisement': 'disguise_kit',
    'Harnais de descente': 'climbing_harness', 'Grappin et corde': 'grapnel_line', 'Photo-visières': 'photo_visors_contacts',
    "Nécessaire d'excruciation": 'excruciator_kit', 'Instrument de divination': 'instruments_of_divination',
    "Fiole d'onguents sacrés": 'sacred_unguents', "Icône de l'Empereur": 'holy_icon', 'Outil de terrassement': 'entrenching_tool',
    'Paire de bouchons filtrants': 'filtration_plugs',
    'Système respiratoire bionique': 'augmetic_respiratory_system', 'Organes sensoriels bioniques': 'augmetic_sensory_organs',
    'Organe sensoriel bionique (œil)': 'augmetic_sensory_organs', 'Organe sensoriel bionique': 'augmetic_sensory_organs',
    'Réseau augural': 'augur_array', 'Bras bionique': 'augmetic_arm', 'Cœur bionique': 'augmetic_heart',
    'Locomotion augmétique': 'augmetic_leg', 'Locomotion bionique': 'augmetic_leg',
}).map(([label, key]) => [normFull(label), key]));

const findEntry = (text) => {
    const alias = ALIASES[normFull(text)] ?? ALIASES[norm(text)];
    if (alias && CATALOG_BY_KEY[alias]) return CATALOG_BY_KEY[alias];
    return BY_LABEL.get(norm(text)) ?? BY_LABEL.get(norm(text.replace(/s\b/g, '')));
};

/** Qualités et défauts lus dans le libellé (« Couteau (Médiocre, Laid) ») */
const QUALITY_WORDS = { mediocre: 'shoddy', laid: 'ugly', laids: 'ugly', ornemente: 'ornamental', 'de maitre': 'master_crafted' };

/** Rattache un libellé d'équipement au catalogue ; sinon objet libre au même nom */
export const itemFromLabel = (label) => {
    const raw = String(label ?? '').trim();
    if (!raw) return null;
    const qty = /^(\d+)\s+(.+)$/.exec(raw);
    const text = qty ? qty[2] : raw;
    const entry = findEntry(text);
    const flags = Object.entries(QUALITY_WORDS).filter(([w]) => normFull(raw).includes(w)).map(([, q]) => q);
    const notes = flags.length ? raw.match(/\(([^)]*)\)/)?.[1] ?? '' : '';
    const quantity = qty ? Number(qty[1]) : 1;
    if (entry) {
        const item = itemFromEntry(entry, { quantity, notes });
        if (flags.length) item.data.qualities = flags;
        return item;
    }
    return { ...customItem({ name: text, notes }), quantity };
};

/** Libellés de départ → lignes ; un libellé composé hors catalogue (« Pistolet laser
 *  et Épée tronçonneuse », « … avec Silencieux ») donne une ligne par objet */
export const itemsFromLabels = (labels) => (labels ?? []).flatMap((label) => {
    const item = itemFromLabel(label);
    if (!item || item.itemKey) return item ? [item] : [];
    const parts = String(label).split(/\s+(?:et|avec)\s+/i).map(itemFromLabel).filter(Boolean);
    return parts.length > 1 && parts[0].itemKey ? parts : [item];
});

/** Inventaire trié : armes, armures, augmétiques, équipement, munitions ; ordre d'ajout conservé */
export const sortedItems = (items) => [...(items ?? [])].sort((a, b) => KIND_ORDER.indexOf(a.kind) - KIND_ORDER.indexOf(b.kind));
