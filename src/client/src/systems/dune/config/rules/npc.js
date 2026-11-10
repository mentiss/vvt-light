// src/client/src/systems/dune/config/rules/npc.js
// ─────────────────────────────────────────────────────────────────────────────
// PNJ de Dune (spec_pnj.md §7, livre de base p.136-137, 190, 240, 263, 328) :
// fonctions pures, testées (tests/systems/dune/config/rules/npc.test.js).
//
//   rang     : mineur, notable, majeur (D-1)
//   mineur   : pas de principes, une seule valeur « Principe » ajoutée à toute compétence
//   test     : seuil = compétence + principe (ou + la valeur unique d'un mineur)
//   dés en plus achetés en Menace : 1, puis 2, puis 3 (même barème que l'Impulsion, D-3)
//   défaite  : mineur vaincu au premier coup ; notable et majeur, jauge et « Résister » (D-5)
// ─────────────────────────────────────────────────────────────────────────────

import { COMPETENCES, PRINCIPES } from '../traits.js';
import { impulsionCost } from './roll.js';

export const NPC_RANKS = [
    { key: 'minor',   label: 'Mineur' },
    { key: 'notable', label: 'Notable' },
    { key: 'major',   label: 'Majeur' },
];

export const rankLabel = (rank) => NPC_RANKS.find(r => r.key === rank)?.label ?? 'Notable';

/**
 * Barème du livre par rang (p.328), dans l'ordre des compétences et des principes de la fiche.
 * Le MJ répartit ensuite (le 6 du mineur est son métier) ; tout reste modifiable.
 * Majeur : toutes à 4 puis 11 points, 8 au plus (ici 8 / 7 / 6 / 5 / 5).
 */
export const RANK_TEMPLATES = {
    minor:   { competences: [6, 5, 5, 4, 4], principes: null,             drive: 5 },
    notable: { competences: [7, 6, 5, 5, 4], principes: [7, 6, 5, 5, 5],  drive: null },
    major:   { competences: [8, 7, 6, 5, 5], principes: [8, 7, 6, 5, 4],  drive: null },
};

export const isMinor = (sd) => sd?.rank === 'minor';

/**
 * Applique le barème d'un rang : valeurs remplacées, spécialisations et maximes gardées.
 * @param {object} sd    partie système d'un PNJ (ou {})
 * @param {string} rank
 */
export function applyRankTemplate(sd, rank) {
    const tpl = RANK_TEMPLATES[rank] ?? RANK_TEMPLATES.notable;
    const comps = COMPETENCES.map((c, i) => {
        const current = sd?.competences?.find(x => x.key === c.key) ?? {};
        return { specialisations: [], ...current, key: c.key, rang: tpl.competences[i] };
    });
    const prins = PRINCIPES.map((p, i) => {
        const current = sd?.principes?.find(x => x.key === p.key) ?? {};
        return { maxime: '', ...current, key: p.key, rang: tpl.principes ? tpl.principes[i] : (current.rang ?? 5) };
    });
    return { ...sd, rank, competences: comps, principes: prins, drive: tpl.drive ?? sd?.drive ?? 5 };
}

/** Partie système d'une nouvelle fiche : notable par défaut, au barème du livre. */
export const defaultNpcData = (rank = 'notable') => ({
    ...applyRankTemplate({ traits: [], talents: [], atouts: [], rolls: [] }, rank),
});

/** Rang d'une compétence ou d'un principe (0 si absent). */
export const traitRank = (sd, group, key) => sd?.[group]?.find(x => x.key === key)?.rang ?? 0;

/**
 * Seuil d'un test : compétence + principe, ou compétence + valeur « Principe » d'un mineur.
 * @param {object} sd
 * @param {{ competences: string, principes?: string }} pick
 */
export function testThreshold(sd, pick) {
    const skill = traitRank(sd, 'competences', pick?.competences);
    const drive = isMinor(sd) ? (sd.drive ?? 5) : traitRank(sd, 'principes', pick?.principes);
    return skill + drive;
}

/** La compétence a-t-elle au moins une spécialisation (le MJ dit si elle s'applique au jet) ? */
export const hasSpecialisation = (sd, skillKey) =>
    (sd?.competences?.find(x => x.key === skillKey)?.specialisations ?? []).some(s => s.trim());

/** Menace dépensée pour acheter n dés en plus : 1, puis 2, puis 3 (1, 3, 6 au total), le barème de l'Impulsion. */
export const threatCost = impulsionCost;

/** État initial d'un PNJ à la table (D-5). */
export const initialNpcState = () => ({ defeated: false, defeat: 0, defeatMax: null, resisted: false });

/** « Résister à la défaite » : notable et majeur seulement, une fois par scène (p.167-168). */
export const canResistDefeat = (sd, state) => !isMinor(sd) && !state?.resisted && !state?.defeated;

/** Meilleure compétence, pour la ligne de résumé des listes. */
export function bestSkill(sd) {
    const list = sd?.competences ?? [];
    return list.reduce((best, c) => (c.rang > (best?.rang ?? -1) ? c : best), null);
}
