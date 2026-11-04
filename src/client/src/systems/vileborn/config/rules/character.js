// src/client/src/systems/vileborn/config/rules/character.js
// ─────────────────────────────────────────────────────────────────────────────
// Données dérivées et actions de jeu d'un personnage (spec_vileborn.md §1.3,
// §1.4, §5, §II.4) — pur. Chaque action renvoie le **patch** à enregistrer
// (champs modifiés seulement ; un tableau de sous-table est renvoyé entier).
// ─────────────────────────────────────────────────────────────────────────────

import { STATES, WOUNDS, WORD_SLOTS } from '../approaches.js';
import { HERITAGES } from '../heritages.js';

/**
 * Rêverie : la table soigne tout et garde les coches (MJ, 2026-11-04).
 * true : version du kit, qui efface aussi les coches du sombre héritage et des dons.
 */
export const REVERIE_CLEARS_TICKS = false;

/** Nom affiché : « prénom nom » (l'un ou l'autre peut manquer) */
export const displayName = (c) => [c?.prenom, c?.nom].map(s => s?.trim()).filter(Boolean).join(' ');

const stateOf = (key) => STATES.find(s => s.key === key);

// ── Mots de Personnalité et de Formation (mode Édition) ────────────────────

/** Les mots d'un côté du U en cases (5 au moins), dans l'ordre */
export const wordSlots = (c, kind, slots = WORD_SLOTS) => {
    const list = (c.words ?? []).filter(w => w.kind === kind).sort((a, b) => a.position - b.position).map(w => w.label);
    return [...list, ...Array(Math.max(0, slots - list.length)).fill('')];
};

/**
 * Cases saisies → liste `words` du personnage : cases vides retirées, positions
 * recalculées, ids repris par côté et par rang (pas de ligne recréée inutilement).
 */
export const slotsToWords = (c, personality, training) => {
    const byKind = (kind) => (c.words ?? []).filter(w => w.kind === kind).sort((a, b) => a.position - b.position);
    const build = (kind, labels) => {
        const old = byKind(kind);
        return labels.map(l => l.trim()).filter(Boolean)
            .map((label, position) => ({ ...(old[position]?.id ? { id: old[position].id } : {}), kind, position, label }));
    };
    return [...build('personality', personality), ...build('training', training)];
};

/** Brouillon du mode Édition : la fiche, plus les mots en cases */
export const editDraft = (c) => ({ ...c, personalitySlots: wordSlots(c, 'personality'), trainingSlots: wordSlots(c, 'training') });

/** Patch à enregistrer depuis le brouillon (mots reconvertis, ids repris) */
export const editPatch = (c, draft) => {
    const { personalitySlots, trainingSlots, ...rest } = draft;
    return { ...rest, words: slotsToWords(c, personalitySlots, trainingSlots) };
};

// ── États et blessures ─────────────────────────────────────────────────────

/** Coche une blessure : la première case libre, ou hors jeu si les trois sont prises */
export const addWound = (c) => {
    const free = WOUNDS.find(w => !c[w.field]);
    return free ? { [free.field]: true } : { outOfPlay: true };
};

/** Subir un état : déjà coché, il devient une blessure (§1.3) */
export const sufferState = (c, key) => {
    const s = stateOf(key);
    return c[s.field] ? addWound(c) : { [s.field]: true };
};

export const healState = (key) => ({ [stateOf(key).field]: false });

/** Guérit une blessure : la dernière cochée, sa description avec elle */
export const healWound = (c) => {
    const last = [...WOUNDS].reverse().find(w => c[w.field]);
    return last ? { [last.field]: false, [last.note]: '' } : {};
};

// ── Mobiles ────────────────────────────────────────────────────────────────

/** Mobiles inutilisables : insécurité, ou un don coché qui les bloque (Sang glacé) */
export const mobilesBlocked = (c) => {
    if (c.stateInsecurity) return 'Insécurité : vous ne pouvez pas utiliser vos mobiles.';
    const g = (c.gifts ?? []).find(x => x.checked && giftInfo(x)?.blocksMobiles);
    return g ? `${g.name} : vous ne pouvez plus utiliser vos mobiles tant que ce don est coché.` : null;
};

/** Aspiration : cochée, elle guérit une blessure */
export const spendAspiration = (c) => ({ aspirationChecked: true, ...healWound(c) });

/** Devoir : coché, il guérit l'état choisi (aucun si aucun n'est coché) */
export const spendDuty = (stateKey) => ({ dutyChecked: true, ...(stateKey ? healState(stateKey) : {}) });

export const checkedStates = (c) => STATES.filter(s => c[s.field]);

// ── Sombre héritage, dons, pulsion, Rêverie ───────────────────────────────

/** Le don dans le catalogue de son héritage (automatismes), ou null si libre */
export const giftInfo = (gift) => {
    if (!gift?.giftKey) return null;
    for (const h of Object.values(HERITAGES)) {
        const g = h.gifts.find(x => x.key === gift.giftKey);
        if (g) return g;
    }
    return null;
};

/** Explorer son héritage : coche la case suivante (3 au plus ; à 3, rien de plus) */
export const exploreTicks = (c) => Math.min(3, (c.heritageTicks ?? 0) + 1);

/** Coche ou décoche un don ; renvoie la liste entière */
export const setGiftChecked = (c, index, checked) => ({
    gifts: (c.gifts ?? []).map((g, i) => (i === index ? { ...g, checked } : g)),
});

/**
 * Contrepartie au d6 d'un don, quand elle se déclenche : patch sur le Paria
 * (état ou blessure) ; une blessure infligée à une cible ne touche pas la fiche.
 */
export const giftRollPatch = (c, effect) => {
    if (effect?.startsWith('state:')) return sufferState(c, effect.slice(6));
    if (effect === 'wound') return addWound(c);
    return {};
};

/** Libellé de la contrepartie au d6 (« état peur », « une blessure »…) */
export const giftEffectText = (effect) => {
    if (effect?.startsWith('state:')) return `état ${stateOf(effect.slice(6))?.label.toLowerCase()}`;
    if (effect === 'wound') return 'une blessure';
    if (effect === 'target_wound') return 'la cible subit une blessure';
    return '';
};

const clearTicks = (c) => ({ heritageTicks: 0, gifts: (c.gifts ?? []).map(g => ({ ...g, checked: false })) });

/** Céder à sa pulsion : efface les coches de l'héritage et des dons */
export const yieldToUrge = (c) => clearTicks(c);

/** Consommer la Rêverie : soin de tout (états, blessures, hors jeu) ; coches selon REVERIE_CLEARS_TICKS */
export const consumeReverie = (c, clearsTicks = REVERIE_CLEARS_TICKS) => {
    const patch = { outOfPlay: false };
    for (const s of STATES) patch[s.field] = false;
    for (const w of WOUNDS) { patch[w.field] = false; patch[w.note] = ''; }
    return clearsTicks ? { ...patch, ...clearTicks(c) } : patch;
};

export const REVERIE_TEXT = REVERIE_CLEARS_TICKS
    ? 'Soin complet ; coches du sombre héritage et des dons effacées.'
    : 'Soin complet : blessures, états et hors jeu effacés. Les coches restent.';
export const URGE_TEXT = 'Coches du sombre héritage et des dons effacées.';
