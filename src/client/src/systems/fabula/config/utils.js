// src/client/src/systems/fabula/config/utils.js
// ─────────────────────────────────────────────────────────────────────────────
// Recalcul des statistiques dérivées — mêmes formules que Creation.jsx (Étape
// 4 des specs, section 2.3). Appelé avant chaque sauvegarde depuis Sheet.jsx
// et TabSession GM, pour que les stats dérivées suivent automatiquement tout
// changement d'attribut/équipement/niveau — jamais éditées à la main.
//
// Équipement (refonte catalogue) :
//   - Un item est équipé ssi emplacementEquipe != null (plus de booléen equipe).
//     Emplacements : 'armure' | 'accessoire' | 'main_directrice' |
//     'main_secondaire' | 'deux_mains'.
//   - Les armures lourdes portent defFixe : la DEF devient cette valeur fixe
//     (le dé DEX est ignoré), les mods des autres pièces s'additionnent dessus.
//   - Helpers de formatage : reconstitution de la notation officielle depuis
//     les composants structurés ([DEX+INT]+1, [VH+8] physique, Taille de dé
//     DEX +1) — jamais de formule stockée en texte.
// ─────────────────────────────────────────────────────────────────────────────

import { ATTR_LABELS, TYPES_DEGATS } from './equipment.js';
import { CLASSES } from './classes.js';

const sum = (arr) => arr.reduce((a, b) => a + b, 0);

// Ordre des tailles de dé — une altération réduit d'un cran, minimum d6.
const DIE_STEPS = [6, 8, 10, 12];

const AFFLICTION_MAP = {
    dex: ['ralenti', 'enrage'],
    int: ['etourdi', 'enrage'],
    pui: ['affaibli', 'empoisonne'],
    vol: ['traumatise', 'empoisonne'],
};

const ATTR_DIE_FIELD = { dex: 'dexDe', int: 'intDe', pui: 'puiDe', vol: 'volDe' };

/**
 * Renvoie TOUTES les altérations affectant un attribut (règle : les états sont
 * cumulatifs — Ralenti + Enragé sur DEX = 2 crans de réduction). Mapping
 * fidèle à la fiche officielle : Ralenti→DEX, Étourdi→INT, Affaibli→PUI,
 * Traumatisé→VOL, Enragé→DEX+INT, Empoisonné→PUI+VOL.
 */
export function getAttributeAfflictions(alterationsEtat, attrKey) {
    return (alterationsEtat ?? []).filter(a => AFFLICTION_MAP[attrKey]?.includes(a));
}

/**
 * Taille de dé EFFECTIVE d'un attribut — le calcul central, utilisé partout
 * (AttributesPanel, FabulaDiceModal, GM) :
 *   cran(base) + boosts (chevrons, armes/sorts) − nb d'altérations actives,
 *   borné [d6, d12].
 * Les boosts (character.boostsAttributs, JSON {dex,int,pui,vol}) se cumulent
 * librement et persistent en BDD — ils voyagent dans la fiche complète comme
 * les altérations, joueur et GM peuvent les modifier.
 */
export function effectiveAttrDie(character, attrKey) {
    const base = character?.[ATTR_DIE_FIELD[attrKey]] ?? 8;
    const baseIdx = Math.max(0, DIE_STEPS.indexOf(base));
    const boosts = character?.boostsAttributs?.[attrKey] ?? 0;
    const maluses = getAttributeAfflictions(character?.alterationsEtat, attrKey).length;
    const idx = Math.max(0, Math.min(DIE_STEPS.length - 1, baseIdx + boosts - maluses));
    return DIE_STEPS[idx];
}

// ── Équipement — état ─────────────────────────────────────────────────────────

/** Un item est équipé ssi il occupe un emplacement. */
export const isEquipped = (item) => item?.emplacementEquipe != null;

const HAND_SLOTS = ['main_directrice', 'main_secondaire', 'deux_mains'];

/** L'item occupe-t-il un emplacement de main ? */
export const isInHands = (item) => HAND_SLOTS.includes(item?.emplacementEquipe);

// ── Statistiques dérivées ─────────────────────────────────────────────────────

/**
 * Somme des bonus mécaniques des atouts gratuits de classe (PV/PM/PI max).
 * Les atouts s'appliquent dès que la classe est prise, quel que soit son
 * niveau. Les atouts narratifs (martial, rituels, projets) sont ignorés ici —
 * purement informatifs, affichés dans ClassesSkillsPanel.
 */
export function classAtoutBonuses(classes) {
    const totals = { pv: 0, pm: 0, pi: 0 };
    for (const c of classes ?? []) {
        for (const a of CLASSES[c.classKey]?.atouts ?? []) {
            if (a.type in totals) totals[a.type] += a.valeur ?? 0;
        }
    }
    return totals;
}

export function computeDerivedStats(character) {
    const dexDe = character.dexDe ?? 8;
    const intDe = character.intDe ?? 8;
    const puiDe = character.puiDe ?? 8;
    const volDe = character.volDe ?? 8;

    const niveauGlobal = sum((character.classes ?? []).map(c => c.niveau || 0)) || character.niveauGlobal || 5;

    const atouts = classAtoutBonuses(character.classes);
    const pvMax = puiDe * 5 + niveauGlobal + atouts.pv;
    const pmMax = volDe * 5 + niveauGlobal + atouts.pm;
    // piMax devient dérivé : base 6 + atouts (Bricoleur/Roublard/Voyageur +2)
    const piMax = 6 + atouts.pi;
    const seuilCrise = Math.floor(pvMax / 2);

    const equipes = (character.equipment ?? []).filter(isEquipped);

    // DEF : base = taille de dé DEX, sauf armure lourde équipée (defFixe) qui
    // la remplace. Dans ce cas le mod_defense propre de l'armure est exclu
    // (defFixe EST sa valeur de défense) ; les mods des autres pièces
    // (bouclier…) s'additionnent toujours par-dessus.
    const armure  = equipes.find(e => e.emplacementEquipe === 'armure');
    const defFixe = Number.isInteger(armure?.defFixe) ? armure.defFixe : null;

    const modInit   = sum(equipes.map(e => e.modInitiative ?? 0));
    const modDefMag = sum(equipes.map(e => e.modDefenseMagique ?? 0));
    const modDef    = sum(
        equipes
            .filter(e => !(defFixe !== null && e === armure))
            .map(e => e.modDefense ?? 0)
    );

    // Défense/Défense Magique basées sur la taille de dé EFFECTIVE (boosts −
    // altérations), pas la base : un perso Ralenti voit sa DEF baisser, un
    // Boosté la voit monter. Confirmé — c'est la règle officielle.
    const dexEffectif = effectiveAttrDie(character, 'dex');
    const intEffectif = effectiveAttrDie(character, 'int');

    return {
        niveauGlobal,
        pvMax,
        pmMax,
        piMax,
        seuilCrise,
        initiative: Math.floor((dexDe + intDe) / 2) + modInit,
        defense: (defFixe ?? dexEffectif) + modDef,
        defenseMagique: intEffectif + modDefMag,
        // Les *Actuel ne sont jamais recalculés ici — uniquement via steppers manuels.
        // On les clampe juste pour éviter un actuel > nouveau max après un changement.
        pvActuel: Math.min(character.pvActuel ?? pvMax, pvMax),
        pmActuel: Math.min(character.pmActuel ?? pmMax, pmMax),
        piActuel: Math.min(character.piActuel ?? piMax, piMax),
    };
}

// ── Équipement — gestion des emplacements nommés ─────────────────────────────
// 1 armure, 1 accessoire, 2 mains (directrice + secondaire, ou une arme
// deux mains occupant tout). Équiper au-delà d'une limite déséquipe
// automatiquement l'occupant (le plus ancien pour les mains) plutôt que de
// bloquer l'action. Aucune contrainte de nature : un bouclier en main
// directrice est légal (Boucliers doubles du Gardien).

/**
 * Équipe l'item à l'index donné. Renvoie un nouveau tableau equipment.
 * Assignation automatique : armure/accessoire → leur emplacement dédié ;
 * item de main 1 main → directrice si libre, sinon secondaire, sinon déloge
 * l'occupant le plus ancien ; item 2 mains → 'deux_mains' en délogeant tous
 * les occupants de main.
 */
export function equipItem(equipment, itemIndex) {
    const item = equipment[itemIndex];
    if (!item) return equipment;
    const type = item.typeEmplacement;

    // Emplacements exclusifs simples : armure, accessoire
    if (type === 'armure' || type === 'accessoire') {
        return equipment.map((e, i) => {
            if (i === itemIndex) return { ...e, emplacementEquipe: type };
            if (e.emplacementEquipe === type) return { ...e, emplacementEquipe: null };
            return e;
        });
    }

    if (type !== 'arme' && type !== 'bouclier') return equipment;

    // Item de main à deux mains : occupe tout, déloge tous les occupants
    if (item.mains === 2) {
        return equipment.map((e, i) => {
            if (i === itemIndex) return { ...e, emplacementEquipe: 'deux_mains' };
            if (isInHands(e)) return { ...e, emplacementEquipe: null };
            return e;
        });
    }

    // Item de main à une main
    let next = equipment;

    // Une arme deux mains équipée bloque tout : on la déloge d'abord.
    next = next.map((e, i) =>
        i !== itemIndex && e.emplacementEquipe === 'deux_mains'
            ? { ...e, emplacementEquipe: null }
            : e
    );

    const occupied = (slot) => next.some((e, i) => i !== itemIndex && e.emplacementEquipe === slot);

    let slot;
    if (!occupied('main_directrice')) {
        slot = 'main_directrice';
    } else if (!occupied('main_secondaire')) {
        slot = 'main_secondaire';
    } else {
        // Deux mains occupées : déloge l'occupant le plus ancien (premier dans
        // la liste) et prend son emplacement.
        const oldest = next.findIndex((e, i) =>
            i !== itemIndex &&
            (e.emplacementEquipe === 'main_directrice' || e.emplacementEquipe === 'main_secondaire')
        );
        slot = next[oldest].emplacementEquipe;
        next = next.map((e, i) => i === oldest ? { ...e, emplacementEquipe: null } : e);
    }

    return next.map((e, i) => i === itemIndex ? { ...e, emplacementEquipe: slot } : e);
}

/** Déséquipe l'item (retour au sac à dos). */
export function unequipItem(equipment, itemIndex) {
    return equipment.map((e, i) => i === itemIndex ? { ...e, emplacementEquipe: null } : e);
}

/**
 * Bascule un item de main entre directrice et secondaire (pill ⇄ des cartes).
 * Si l'emplacement cible est occupé, les deux items permutent.
 * Sans effet sur un item hors main ou à deux mains.
 */
export function switchHand(equipment, itemIndex) {
    const item = equipment[itemIndex];
    const from = item?.emplacementEquipe;
    if (from !== 'main_directrice' && from !== 'main_secondaire') return equipment;

    const to = from === 'main_directrice' ? 'main_secondaire' : 'main_directrice';
    return equipment.map((e, i) => {
        if (i === itemIndex) return { ...e, emplacementEquipe: to };
        if (e.emplacementEquipe === to) return { ...e, emplacementEquipe: from };
        return e;
    });
}

// ── Formatage — notation officielle depuis les composants ────────────────────

const degatsLabel = (key) => TYPES_DEGATS.find(t => t.key === key)?.label ?? key;

const signed = (n) => (n >= 0 ? `+${n}` : `−${Math.abs(n)}`);

/** "[DEX+INT]+1" — ou '—' si l'item n'a pas de profil de précision. */
export function formatPrecision(item) {
    const a1 = ATTR_LABELS[item?.precisionAttr1];
    const a2 = ATTR_LABELS[item?.precisionAttr2];
    if (!a1 || !a2) return '—';
    const bonus = item.precisionBonus ?? 0;
    return `[${a1}+${a2}]${bonus !== 0 ? signed(bonus) : ''}`;
}

/** "[VH+8] Physique" — ou '—' si l'item n'a pas de profil d'arme. */
export function formatDegats(item) {
    if (!item?.precisionAttr1 || !item?.precisionAttr2) return '—';
    return `[VH+${item.degatsBonus ?? 0}] ${degatsLabel(item.degatsType ?? 'physique')}`;
}

/**
 * Valeur de Défense :
 *   armure lourde  → "11"
 *   armure légère  → "Taille de dé DEX" / "Taille de dé DEX +1"
 *   bouclier/accessoire → "+2" (bonus additif), '—' si nul
 */
export function formatDefense(item) {
    if (!item) return '—';
    if (item.typeEmplacement === 'armure') {
        if (Number.isInteger(item.defFixe)) return String(item.defFixe);
        const mod = item.modDefense ?? 0;
        return `Taille de dé DEX${mod !== 0 ? ` ${signed(mod)}` : ''}`;
    }
    const mod = item.modDefense ?? 0;
    return mod !== 0 ? signed(mod) : '—';
}

/**
 * Valeur de Défense Magique :
 *   armure → "Taille de dé INT" / "Taille de dé INT +2" (toujours basée sur
 *   le dé INT, même pour les armures lourdes — fidèle à la table)
 *   bouclier/accessoire → "+2", '—' si nul
 */
export function formatDefenseMagique(item) {
    if (!item) return '—';
    const mod = item.modDefenseMagique ?? 0;
    if (item.typeEmplacement === 'armure') {
        return `Taille de dé INT${mod !== 0 ? ` ${signed(mod)}` : ''}`;
    }
    return mod !== 0 ? signed(mod) : '—';
}