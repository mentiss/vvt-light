// src/client/src/systems/fabula/config/utils.js
// ─────────────────────────────────────────────────────────────────────────────
// Recalcul des statistiques dérivées — mêmes formules que Creation.jsx (Étape
// 4 des specs, section 2.3). Appelé avant chaque sauvegarde depuis Sheet.jsx
// et TabSession GM, pour que les stats dérivées suivent automatiquement tout
// changement d'attribut/équipement/niveau — jamais éditées à la main.
// ─────────────────────────────────────────────────────────────────────────────

const sum = (arr) => arr.reduce((a, b) => a + b, 0);

// Ordre des tailles de dé — une altération réduit d'un cran, minimum d6.
const DIE_STEPS = [6, 8, 10, 12];

/**
 * Renvoie la clé d'altération qui affecte un attribut donné, ou null.
 * Mapping fidèle à la fiche officielle : Ralenti→DEX, Étourdi→INT,
 * Affaibli→PUI, Traumatisé→VOL, Enragé→DEX+INT, Empoisonné→PUI+VOL.
 */
export function getAttributeAffliction(alterationsEtat, attrKey) {
    const map = {
        dex: ['ralenti', 'enrage'],
        int: ['etourdi', 'enrage'],
        pui: ['affaibli', 'empoisonne'],
        vol: ['traumatise', 'empoisonne'],
    };
    return (alterationsEtat ?? []).find(a => map[attrKey]?.includes(a)) ?? null;
}

/** Taille de dé effective (base réduite d'un cran si une altération affecte l'attribut). */
export function effectiveDieSize(baseSize, affected) {
    if (!affected) return baseSize;
    const idx = DIE_STEPS.indexOf(baseSize);
    return DIE_STEPS[Math.max(0, idx - 1)];
}

export function computeDerivedStats(character) {
    const dexDe = character.dexDe ?? 8;
    const intDe = character.intDe ?? 8;
    const puiDe = character.puiDe ?? 8;
    const volDe = character.volDe ?? 8;

    const niveauGlobal = sum((character.classes ?? []).map(c => c.niveau || 0)) || character.niveauGlobal || 5;

    const pvMax = puiDe * 5 + niveauGlobal;
    const pmMax = volDe * 5 + niveauGlobal;
    const seuilCrise = Math.floor(pvMax / 2);

    const equipes = (character.equipment ?? []).filter(e => e.equipe);
    const modInit   = sum(equipes.map(e => e.modInitiative ?? 0));
    const modDef    = sum(equipes.map(e => e.modDefense ?? 0));
    const modDefMag = sum(equipes.map(e => e.modDefenseMagique ?? 0));

    return {
        niveauGlobal,
        pvMax,
        pmMax,
        seuilCrise,
        initiative: Math.floor((dexDe + intDe) / 2) + modInit,
        defense: dexDe + modDef,
        defenseMagique: intDe + modDefMag,
        // Les *Actuel ne sont jamais recalculés ici — uniquement via steppers manuels.
        // On les clampe juste pour éviter un actuel > nouveau max après un changement.
        pvActuel: Math.min(character.pvActuel ?? pvMax, pvMax),
        pmActuel: Math.min(character.pmActuel ?? pmMax, pmMax),
    };
}

// ── Équipement — gestion des emplacements contraints ─────────────────────────
// 1 armure, 2 mains (arme et/ou bouclier combinés), 1 accessoire.
// Équiper un objet au-delà de la limite déséquipe automatiquement le plus
// ancien objet du même groupe plutôt que de bloquer l'action.

const SLOT_GROUPS = {
    armure:     { types: ['armure'],           max: 1 },
    accessoire: { types: ['accessoire'],       max: 1 },
    mains:      { types: ['arme', 'bouclier'], max: 2 },
};

function slotGroupFor(typeEmplacement) {
    return Object.values(SLOT_GROUPS).find(g => g.types.includes(typeEmplacement));
}

export function equipItem(equipment, itemIndex) {
    const item = equipment[itemIndex];
    if (!item) return equipment;
    const group = slotGroupFor(item.typeEmplacement);
    if (!group) return equipment;

    const equippedInGroup = equipment
        .map((e, i) => ({ e, i }))
        .filter(({ e, i }) => i !== itemIndex && group.types.includes(e.typeEmplacement) && e.equipe);

    let next = equipment;
    if (equippedInGroup.length >= group.max) {
        const toUnequip = equippedInGroup.slice(0, equippedInGroup.length - group.max + 1);
        const unequipIndexes = new Set(toUnequip.map(x => x.i));
        next = next.map((e, i) => unequipIndexes.has(i) ? { ...e, equipe: false } : e);
    }
    return next.map((e, i) => i === itemIndex ? { ...e, equipe: true } : e);
}

export function unequipItem(equipment, itemIndex) {
    return equipment.map((e, i) => i === itemIndex ? { ...e, equipe: false } : e);
}