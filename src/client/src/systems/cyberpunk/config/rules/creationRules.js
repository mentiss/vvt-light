// src/client/src/systems/cyberpunk/config/rules/creationRules.js
// ─────────────────────────────────────────────────────────────────────────────
// Règles pures de la création (spec_cyberpunk.md §9) : chrome autorisé, défauts
// du cyberware offert, kit selon l'archétype et les manœuvres, achats en Cred,
// tags posés par les manœuvres. Données dans config/.
// ─────────────────────────────────────────────────────────────────────────────

import { CYBERWARE_ALL } from '../cyberware.js';
import { ITEMS_ALL, STARTING_CRED } from '../items.js';
import { PLAYBOOKS, KIT_BY_MOVE, MOVE_GEAR, MOVE_TAGS } from '../playbooks.js';
import { REFERENCE_LISTS } from '../reference.js';
import { STATS, DIRECTIVES_PERSONNELLES } from '../character.js';

// ── Catalogues ───────────────────────────────────────────────────────────────

export const findPlaybook  = (id)   => PLAYBOOKS.find(p => p.id === id) ?? null;
export const findCyberware = (name) => CYBERWARE_ALL.find(c => c.name === name) ?? null;
export const findItem      = (name) => ITEMS_ALL.find(i => i.name === name) ?? null;

/**
 * Libellés d'une liste de l'aide de jeu. `contacts` dépend du playbook.
 * @returns {string[]}
 */
export function referenceList(listName, playbookId) {
    const list = listName === 'contacts'
        ? REFERENCE_LISTS.contacts[playbookId]
        : REFERENCE_LISTS[listName];
    return (list ?? []).map(([label]) => label);
}

/**
 * Choix de tags d'un élément du catalogue, listes de l'aide de jeu résolues
 * (`from: 'daemons'` → un tag par daemon).
 * @returns {Array<{ label, pick, from: Array<{text, variant}> }>}
 */
export function tagChoicesOf(def) {
    return (def?.tagChoices ?? []).map(c => ({
        ...c,
        from: typeof c.from === 'string'
            ? referenceList(c.from).map(label => ({ text: `+${label}`, variant: 'neutral' }))
            : c.from,
    }));
}

// ── Chrome (§9.2) ────────────────────────────────────────────────────────────

/**
 * Chrome autorisé à la création.
 *   archetype : nombre à prendre dans la liste de l'archétype (2 pour l'Assassin)
 *   console   : Netrunner, console imposée (intégrée ou Prise de console)
 *   offered   : cyberware offert, tout le catalogue, avec défauts
 *   chrome    : cyberware dû à Chromé (même règle que l'offert) ; le Chromé du
 *               Techie (accès aux charcudocs) ne donne rien à la création
 *   cosmetic  : fashionware offert, facultatif, hors slot et sans défaut
 */
export function chromeAllowance(playbookId, moveNames = []) {
    const pb = findPlaybook(playbookId);
    const chrome = playbookId !== 'Techie' && moveNames.includes('Chromé') ? 1 : 0;
    return {
        archetype: pb?.defaultPicks ?? 1,
        console:   !!pb?.console,
        offered:   1,
        chrome,
        cosmetic:  1,
    };
}

/**
 * Tags négatifs à choisir pour un cyberware.
 *   offert, Chromé : defects (1 par défaut ; 0 pour le fashionware)
 *   liste de l'archétype : archetypeDefects (0 par défaut ; 2 pour le Sandevistan…)
 */
export function cyberwareDefects(name, slot = 'offered') {
    const def = findCyberware(name);
    if (def?.cosmetic) return 0;
    if (slot === 'archetype' || slot === 'console') return def?.archetypeDefects ?? 0;
    return def?.defects ?? 1;
}

/** Options choisies (variante, modèle) : ce qui va dans le champ « option » de l'implant. */
export const chosenOptions = (def, config) => tagChoicesOf(def).flatMap(c =>
    (config?.choices?.[c.label] ?? []).map(text => c.from.find(f => f.text === text)?.option).filter(Boolean));

// ── Kit (§9.3, §9.7) ─────────────────────────────────────────────────────────

/** Entrée de kit normalisée : { name, tags } (tags ajoutés à ceux du catalogue). */
const entryOf = (e) => typeof e === 'string' ? { name: e, tags: [] } : { name: e.name, tags: e.tags ?? [] };

/** Option d'outillage → groupe { pick, from } (une liste d'objets = tout est donné). */
const giveOf = (option) => Array.isArray(option)
    ? { pick: option.length, from: option.map(entryOf), fixed: true }
    : { pick: option.pick, from: option.from.map(entryOf), fixed: false };

/**
 * Groupes du kit d'un archétype, selon ses choix de création.
 * @param {string} playbookId
 * @param {object} ctx
 * @param {string[]} [ctx.moves]   noms des manœuvres prises
 * @param {string}   [ctx.console] console choisie (Netrunner)
 * @param {string[]} [ctx.picks]   choix faits dans les listes des manœuvres d'outillage
 *                                 (sphères du Techie, spécialisations de l'Edgerunner)
 * @returns {Array<{ id, label, pick, from: Array<{name, tags}>, fixed, options? }>}
 *   fixed : tout le groupe est donné ; options : outillage au choix entre plusieurs sphères
 */
export function resolveKit(playbookId, { moves = [], console: consoleName = null, picks = [] } = {}) {
    const pb = findPlaybook(playbookId);
    if (!pb?.kit) return [];

    let groups = pb.kit
        .filter(g => !g.requires?.console || g.requires.console === consoleName)
        .map(g => {
            const from = g.from.map(entryOf);
            const pick = g.pick ?? from.length;
            return { id: g.id, label: g.label, pick, from, fixed: pick >= from.length };
        });

    const byMove = pb.kitByMove ? KIT_BY_MOVE[pb.kitByMove] : null;
    if (byMove && byMove.moves.some(m => moves.includes(m))) {
        const chosen = picks.filter(p => byMove.options[p]);
        if (chosen.length) {
            const options = chosen.map(p => ({ key: p, ...giveOf(byMove.options[p]) }));
            const replacement = options.length === 1
                ? { id: byMove.replaces, label: `Outillage : ${options[0].key}`, pick: options[0].pick, from: options[0].from, fixed: options[0].fixed }
                : { id: byMove.replaces, label: 'Outillage', pick: 1, from: [], fixed: false, options };
            groups = groups.map(g => g.id === byMove.replaces ? replacement : g);
        }
    }
    return groups;
}

/** Matos personnalisé donné par les manœuvres prises (§9.7). */
export function moveGear(playbookId, moves = []) {
    const table = MOVE_GEAR[playbookId] ?? {};
    return moves.filter(m => table[m]).map(m => ({ move: m, ...table[m] }));
}

// ── Achats en Cred (§9.3) ────────────────────────────────────────────────────

/** Prix d'un lot en Cred, ou null si l'objet n'est pas achetable (sans prix). */
export function itemPrice(name) {
    const price = findItem(name)?.price;
    return Number.isFinite(price) && price >= 0 ? price : null;
}

/** Unités reçues par achat (`quantity` du catalogue, 1 par défaut ; ex. 3 grenades pour 2 Cred). */
export const purchaseQuantity = (name) => findItem(name)?.quantity ?? 1;

/**
 * Tags négatifs proposés pour un achat de création (`negative_tags`) : le prix bas
 * de la création se paie d'un défaut, à prendre parmi cette liste. Liste vide = aucun.
 * Les prix et ces défauts ne valent qu'à la création.
 */
export const purchaseDefects = (name) => findItem(name)?.negative_tags ?? [];

/**
 * Coût total des achats ; les objets sans prix sont ignorés (pas achetables).
 * @param {Array<{ name, lots }>} purchases
 */
export function purchaseCost(purchases = []) {
    return purchases.reduce((sum, p) => {
        const price = itemPrice(p.name);
        return price === null ? sum : sum + price * Math.max(0, p.lots ?? 1);
    }, 0);
}

/** Cred restante après les achats (va sur la fiche). Négative = budget dépassé. */
export const remainingCred = (purchases = [], start = STARTING_CRED) => start - purchaseCost(purchases);

/** Un lot de plus est-il possible avec la Cred restante ? */
export function canBuy(name, purchases = [], start = STARTING_CRED) {
    const price = itemPrice(name);
    return price !== null && price <= remainingCred(purchases, start);
}

// ── Stats des manœuvres d'un playbook ────────────────────────────────────────

/**
 * Stats lancées par les manœuvres d'un playbook, de la plus courante à la moins
 * courante (manœuvres sans jet et « Lien » écartées). Tirée des manœuvres en base,
 * elle reste juste quand le MJ les modifie.
 * @param {Array<{ playbook, stat, type? }>} moves
 * @returns {Array<{ stat, count }>}
 */
export function playbookStatProfile(moves = [], playbookId) {
    const counts = {};
    for (const m of moves) {
        if (m.playbook !== playbookId || !m.stat || m.stat === 'link' || m.type === 'custom') continue;
        counts[m.stat] = (counts[m.stat] ?? 0) + 1;
    }
    return Object.entries(counts).map(([stat, count]) => ({ stat, count })).sort((a, b) => b.count - a.count);
}

// ── Étapes de l'assistant (§9.1) ─────────────────────────────────────────────

/** Étapes de la création, dans l'ordre du rail. */
export const CREATION_STEPS = [
    { id: 1, key: 'archetype',  label: 'Archétype'    },
    { id: 2, key: 'identity',   label: 'Identité'     },
    { id: 3, key: 'stats',      label: 'Stats'        },
    { id: 4, key: 'moves',      label: 'Manœuvres'    },
    { id: 5, key: 'directives', label: 'Directives'   },
    { id: 6, key: 'relations',  label: 'Relations'    },
    { id: 7, key: 'chrome',     label: 'Chrome'       },
    { id: 8, key: 'gear',       label: 'Matos'        },
    { id: 9, key: 'final',      label: 'Finalisation' },
];

/** Manœuvres de playbook à choisir à la création. */
export const CREATION_MOVE_PICKS = 2;
/** Directives personnelles à choisir. */
export const CREATION_DIRECTIVE_PICKS = 2;
/** Relations : minimum et maximum. */
export const CREATION_RELATIONS = { min: 2, max: 3 };

/**
 * Choix qui restent à faire dans une étape (0 = étape complète).
 * @param {number} step  id de CREATION_STEPS
 * @param {object} draft état de l'assistant (voir « Brouillon de la création » plus bas)
 */
export function stepRemaining(step, draft) {
    switch (step) {
        case 1: return draft.playbook ? 0 : 1;
        case 2: return [draft.identity?.playerName, draft.identity?.prenom].filter(v => !String(v ?? '').trim()).length;
        case 3: return Object.values(draft.stats ?? {}).filter(v => v === null || v === undefined).length;
        case 4: return Math.max(0, CREATION_MOVE_PICKS - (draft.moveIds?.length ?? 0)) + moveTagsRemaining(draft);
        case 5: return Math.max(0, CREATION_DIRECTIVE_PICKS - (draft.directives ?? []).filter(d => d.selected).length);
        case 6: {
            const rel = draft.relations ?? [];
            return Math.max(0, CREATION_RELATIONS.min - rel.length) + rel.filter(r => !String(r.name ?? '').trim()).length;
        }
        case 7: return chromeRemaining(draft);
        case 8: return gearRemaining(draft);
        default: return 0;
    }
}

/**
 * Étapes dont dépendent les suivantes : archétype (manœuvres, chrome, kit), manœuvres
 * (Chromé, outillage, matos des manœuvres, tags), chrome (deck externe du kit). Les
 * autres (identité, stats, directives, relations, matos) ne bloquent pas la suite :
 * elles se finissent avant la création.
 */
export const BLOCKING_STEPS = [1, 4, 7];

/** Une étape est ouverte quand les étapes bloquantes qui la précèdent sont complètes. */
export const stepReachable = (step, draft) =>
    BLOCKING_STEPS.every(s => s >= step || stepRemaining(s, draft) === 0);

/** Étapes encore incomplètes avant de pouvoir créer l'opérateur : [{ id, label, remaining }]. */
export const incompleteSteps = (draft) => CREATION_STEPS
    .filter(s => s.id !== 9)
    .map(s => ({ id: s.id, label: s.label, remaining: stepRemaining(s.id, draft) }))
    .filter(s => s.remaining > 0);

// ── Tags posés par les manœuvres (§9.8) ──────────────────────────────────────

// Élément de liste à préciser, ex. « Agent corpo (choisir) » → « Agent corpo (Arasaka) »
const DETAIL = /\s*\(choisir\)\s*$/i;
/** L'élément de liste demande une précision (« (choisir) »). */
export const needsDetail = (label) => DETAIL.test(label ?? '');
/** Élément précisé : « Agent corpo (choisir) » + « Arasaka » → « Agent corpo (Arasaka) ». */
export const withDetail = (label, detail = '') => (needsDetail(label) && String(detail).trim()
    ? label.replace(DETAIL, ` (${String(detail).trim()})`) : label);
/**
 * Retrouve l'élément de la liste et sa précision dans un choix enregistré.
 * @returns {{ item: string|null, detail: string }}
 */
export function splitChoice(list, value = '') {
    if (list.includes(value)) return { item: value, detail: '' };
    const item = list.find(l => needsDetail(l) && value.startsWith(`${l.replace(DETAIL, '')} (`) && value.endsWith(')'));
    return item ? { item, detail: value.slice(item.replace(DETAIL, '').length + 2, -1) } : { item: null, detail: '' };
}

/** Règle de tag d'une manœuvre, ou null si elle n'en pose pas. */
export const moveTagRule = (playbookId, moveName) => MOVE_TAGS[playbookId]?.[moveName] ?? null;

/**
 * Tag verrouillé posé par une manœuvre.
 * @param {string} value  choix fait (élément de liste ou libellé libre) ; ignoré pour un tag fixe
 * @returns {{ tag_text, tag_variant, locked, on } | null}  null si un choix manque
 */
export function buildMoveTag(playbookId, moveName, value = '') {
    const rule = moveTagRule(playbookId, moveName);
    if (!rule) return null;
    if (!rule.text && needsDetail(value)) return null;   // précision encore à donner
    const text = rule.text ?? (String(value).trim() ? `${rule.prefix}${String(value).trim()}` : null);
    if (!text) return null;
    return { tag_text: text, tag_variant: 'neutral', locked: true, on: rule.on ?? 'character' };
}

/**
 * Ce tag (de la fiche) est-il celui posé par cette manœuvre ? Sert à le retirer avec
 * la manœuvre en mode Édition (Q-C22). Liste : préfixe + un élément de la liste ;
 * libellé libre : préfixe propre à la manœuvre ; tag fixe : texte exact.
 */
export function isMoveTag(playbookId, moveName, tag) {
    const rule = moveTagRule(playbookId, moveName);
    if (!rule || !tag?.locked) return false;
    const text = tag.tag_text ?? '';
    if (rule.text) return text === rule.text;
    if (!text.startsWith(rule.prefix)) return false;
    if (rule.list) return splitChoice(referenceList(rule.list, playbookId), text.slice(rule.prefix.length)).item !== null;
    return true;
}

/**
 * Où poser un tag « sur la console » d'une fiche : Cyberconsole intégrée, sinon le
 * Deck externe (avec la Prise de console), sinon le personnage.
 * @returns {{ entityType: 'cyberware'|'item'|'character', entityId: number|null }}
 */
export function consoleTarget(character) {
    const cw = (character?.cyberware ?? []).find(c => c.name === 'Cyberconsole intégrée (Deck)');
    if (cw?.id) return { entityType: 'cyberware', entityId: cw.id };
    const deck = (character?.items ?? []).find(i => i.name === 'Deck externe' || (i.tags ?? []).some(t => t.tag_text === '+confiscable'));
    if (deck?.id) return { entityType: 'item', entityId: deck.id };
    return { entityType: 'character', entityId: character?.id ?? null };
}

// ── Brouillon de la création ─────────────────────────────────────────────────
// Forme de l'état de l'assistant (Creation.jsx) :
//   playbook, identity, stats, moveIds, moveObjs [{ id, name, stat }],
//   moveTags    { [moveId]: choix }                       tags des manœuvres (§9.8)
//   chrome      { console, archetype: [], free: [], cosmetic }   noms du catalogue
//   chromeConfig { [nom]: { defects: [texte], choices: { [libellé]: [texte] } } }
//   gear        { kit: { [groupe]: nom }, kitOption: { [groupe]: option },
//                 buys: [{ uid, name }], config: { [clé]: { choices, defect } },
//                 moveGear: { [manœuvre]: { item, name, tags: [texte] } } }
//   directives, relations, darkSecret

const moveNamesOf = (draft) => (draft.moveObjs ?? []).map(m => m.name);

/** Choix de tags imposés qui manquent pour un élément (config : { choices }). */
function choicesRemaining(def, config) {
    return tagChoicesOf(def).reduce((n, c) => n + Math.max(0, c.pick - (config?.choices?.[c.label]?.length ?? 0)), 0);
}

/** Tags de manœuvre (liste ou libellé libre) qui restent à choisir. */
export function moveTagsRemaining(draft) {
    return (draft.moveObjs ?? []).filter(m => {
        const rule = moveTagRule(draft.playbook, m.name);
        return rule && !buildMoveTag(draft.playbook, m.name, draft.moveTags?.[m.id]);
    }).length;
}

/** Nombre de cyberwares « offert + Chromé », pris dans tout le catalogue. */
export const freeChromeSlots = (draft) => {
    const a = chromeAllowance(draft.playbook, moveNamesOf(draft));
    return a.offered + a.chrome;
};

/** Cyberwares choisis, dans l'ordre de la fiche : [{ slot, name }]. */
export function chromeEntries(draft) {
    const c = draft.chrome ?? {};
    return [
        ...(c.console ? [{ slot: 'console', name: c.console }] : []),
        ...(c.archetype ?? []).map(name => ({ slot: 'archetype', name })),
        ...(c.free ?? []).map((name, i) => ({ slot: i === 0 ? 'offered' : 'chrome', name })),
        ...(c.cosmetic ? [{ slot: 'cosmetic', name: c.cosmetic }] : []),
    ];
}

/** Choix de chrome qui restent : console, archétype, offert et Chromé, défauts, types imposés. */
export function chromeRemaining(draft) {
    const allow = chromeAllowance(draft.playbook, moveNamesOf(draft));
    const c = draft.chrome ?? {};
    let n = (allow.console && !c.console ? 1 : 0)
        + Math.max(0, allow.archetype - (c.archetype?.length ?? 0))
        + Math.max(0, freeChromeSlots(draft) - (c.free?.length ?? 0));
    for (const { slot, name } of chromeEntries(draft)) {
        n += Math.max(0, cyberwareDefects(name, slot) - (draft.chromeConfig?.[name]?.defects?.length ?? 0));
    }
    for (const { name } of chromeEntries(draft)) n += choicesRemaining(findCyberware(name), draft.chromeConfig?.[name]);
    return n;
}

/** Choix de manœuvre qui alimentent l'outillage (sphères, spécialisations). */
const toolingPicks = (draft) => {
    const pb = findPlaybook(draft.playbook);
    const byMove = pb?.kitByMove ? KIT_BY_MOVE[pb.kitByMove] : null;
    if (!byMove) return [];
    return (draft.moveObjs ?? []).filter(m => byMove.moves.includes(m.name)).map(m => draft.moveTags?.[m.id]).filter(Boolean);
};

/** Groupes du kit selon le brouillon (console, manœuvres prises, sphères choisies). */
export const draftKit = (draft) => resolveKit(draft.playbook, {
    moves: moveNamesOf(draft), console: draft.chrome?.console ?? null, picks: toolingPicks(draft),
});

/**
 * Objets du kit retenus : [{ key, group, name, tags }]. Groupe à outillage multiple :
 * l'option choisie (gear.kitOption) donne ses objets ; groupe fixe : tout est donné.
 */
export function kitEntries(draft) {
    const out = [];
    for (const g of draftKit(draft)) {
        let group = g;
        if (g.options) {
            const opt = g.options.find(o => o.key === draft.gear?.kitOption?.[g.id]);
            if (!opt) continue;
            group = { ...g, ...opt };
        }
        const chosen = group.fixed ? group.from : group.from.filter(e => e.name === draft.gear?.kit?.[g.id]);
        for (const e of chosen) out.push({ key: `kit:${g.id}:${e.name}`, group: g.id, name: e.name, tags: e.tags });
    }
    return out;
}

/** Choix de matos qui restent : kit, choix imposés, défauts d'achat, matos des manœuvres, budget. */
export function gearRemaining(draft) {
    const gear = draft.gear ?? {};
    let n = 0;
    for (const g of draftKit(draft)) {
        if (g.options) {
            const opt = g.options.find(o => o.key === gear.kitOption?.[g.id]);
            if (!opt) { n++; continue; }
            if (!opt.fixed && !gear.kit?.[g.id]) n++;
        } else if (!g.fixed && !gear.kit?.[g.id]) n++;
    }
    for (const e of kitEntries(draft)) n += choicesRemaining(findItem(e.name), gear.config?.[e.key]);
    for (const b of gear.buys ?? []) {
        const key = `buy:${b.uid}`;
        if (purchaseDefects(b.name).length && !gear.config?.[key]?.defect) n++;
        n += choicesRemaining(findItem(b.name), gear.config?.[key]);
    }
    for (const mg of moveGear(draft.playbook, moveNamesOf(draft))) {
        const v = gear.moveGear?.[mg.move] ?? {};
        if (mg.kind === 'add' && !v.item) n++;
        if (mg.named && !String(v.name ?? '').trim()) n++;
        n += Math.max(0, mg.tags - (v.tags ?? []).filter(t => String(t).trim()).length);
    }
    if (remainingCred(gear.buys ?? []) < 0) n++;
    return n;
}

// ── Enregistrement ───────────────────────────────────────────────────────────

/** Tag du catalogue ({ text, variant }) → tag de la fiche ({ tag_text, tag_variant, locked }). */
const toSheetTag = (t, locked = false) => ({ tag_text: t.text, tag_variant: t.variant ?? 'neutral', locked });
const textTag = (text, variant = 'neutral') => ({ tag_text: text.startsWith('+') ? text : `+${text}`, tag_variant: variant, locked: false });

/** Tags choisis dans les listes imposées d'un élément. */
const chosenTags = (def, config) => tagChoicesOf(def).flatMap(c =>
    (config?.choices?.[c.label] ?? []).map(text => toSheetTag(c.from.find(f => f.text === text) ?? { text })));

/** Tags verrouillés posés par les manœuvres, séparés par cible. */
function moveTags(draft) {
    const out = { character: [], console: [] };
    for (const m of draft.moveObjs ?? []) {
        const tag = buildMoveTag(draft.playbook, m.name, draft.moveTags?.[m.id]);
        if (!tag) continue;
        const { on, ...sheetTag } = tag;
        out[on === 'console' ? 'console' : 'character'].push(sheetTag);
    }
    return out;
}

/**
 * Corps de POST /characters à partir du brouillon (spec §9) : chrome avec défauts
 * et types, kit, achats (un objet par achat, sauf les achats par quantité regroupés),
 * matos des manœuvres nommé, tags des manœuvres verrouillés, Cred restante.
 */
export function buildCreationPayload(draft) {
    const gear = draft.gear ?? {};
    const tags = moveTags(draft);
    const consoleTags = tags.console;
    const mg = Object.fromEntries(moveGear(draft.playbook, moveNamesOf(draft)).map(x => [x.move, x]));

    // Chrome
    const cyberware = chromeEntries(draft).map(({ slot, name }) => {
        const def = findCyberware(name), cfg = draft.chromeConfig?.[name];
        return {
            name, option_text: chosenOptions(def, cfg).join(', '), notes: '',
            tags: [
                ...(def?.tags ?? []).map(t => toSheetTag(t)),
                ...chosenTags(def, cfg),
                ...(cyberwareDefects(name, slot) > 0 ? (cfg?.defects ?? []).map(t => textTag(t, 'negative')) : []),
                ...(name === 'Cyberconsole intégrée (Deck)' ? consoleTags : []),
            ],
        };
    });

    // Matos : kit (avec personnalisation des manœuvres), achats, ajouts des manœuvres
    const items = [];
    const custom = (groupId) => Object.entries(mg).find(([, x]) => x.kind === 'customize' && x.group === groupId)?.[0];
    for (const e of kitEntries(draft)) {
        const def = findItem(e.name), move = custom(e.group), v = move ? gear.moveGear?.[move] : null;
        items.push({
            name: v?.name?.trim() || e.name, description: '', quantity: def?.quantity ?? 1,
            tags: [
                ...(def?.tags ?? []).map(t => toSheetTag(t)),
                ...e.tags.map(t => toSheetTag(t)),
                ...chosenTags(def, gear.config?.[e.key]),
                ...(v?.tags ?? []).filter(t => String(t).trim()).map(t => textTag(t.trim())),
                ...(e.name === 'Deck externe' ? consoleTags : []),
            ],
        });
    }
    const grouped = {};
    for (const b of gear.buys ?? []) {
        const def = findItem(b.name), cfg = gear.config?.[`buy:${b.uid}`], qty = purchaseQuantity(b.name);
        const line = {
            name: b.name, description: '', quantity: qty,
            tags: [...(def?.tags ?? []).map(t => toSheetTag(t)), ...chosenTags(def, cfg), ...(cfg?.defect ? [textTag(cfg.defect, 'negative')] : [])],
        };
        // Achat par quantité sans défaut ni choix : une seule ligne, quantités cumulées
        if (qty > 1 && !cfg?.defect && !tagChoicesOf(def).length) {
            if (grouped[b.name]) { grouped[b.name].quantity += qty; continue; }
            grouped[b.name] = line;
        }
        items.push(line);
    }
    for (const [move, x] of Object.entries(mg)) {
        if (x.kind !== 'add') continue;
        const v = gear.moveGear?.[move] ?? {}, def = findItem(v.item);
        if (!def) continue;
        items.push({
            name: v.name?.trim() || def.name, description: '', quantity: 1,
            tags: [...(def.tags ?? []).map(t => toSheetTag(t)), ...(v.tags ?? []).filter(t => String(t).trim()).map(t => textTag(t.trim()))],
        });
    }

    return {
        playerName: draft.identity.playerName.trim(),
        prenom:     draft.identity.prenom.trim(),
        nom:        draft.identity.nom.trim(),
        sexe:       draft.identity.sexe,
        apparence:  draft.identity.apparence,
        playbook:   draft.playbook,
        ...Object.fromEntries(STATS.map(s => [s, draft.stats[s] ?? 0])),
        cred:       remainingCred(gear.buys ?? []),
        darkSecret: draft.darkSecret,
        tags:       tags.character,
        directives: (draft.directives ?? []).filter(d => d.selected).map(d => ({
            type:       'personal',
            text:       DIRECTIVES_PERSONNELLES.find(x => x.id === d.id)?.label ?? d.id,
            blankValue: d.blankValue ?? '',
            completed:  false,
        })),
        relations:  (draft.relations ?? []).map(r => ({ ...r, name: r.name.trim() })),
        cyberware,
        items,
        moves:      (draft.moveIds ?? []).map(id => ({ id })),
    };
}
