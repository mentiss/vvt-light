// src/client/src/systems/woddavampire/config/rules/character.js
// ─────────────────────────────────────────────────────────────────────────────
// Données dérivées d'un personnage, communes à la création, à la fiche joueur et
// à la fiche du Conteur (spec_woddavampire.md §4, §7.1, §13, §15) : Génération,
// clan et caste, Route, plafond des traits, pouvoirs connus d'une Discipline,
// et les petites aides d'édition des listes de la fiche.
// Fonctions pures, sans React ; testées dans tests/systems/woddavampire/config/rules/.
// ─────────────────────────────────────────────────────────────────────────────

import { CLANS } from '../clans.js';
import { ROADS, roadVirtues } from '../roads.js';
import { ARCHETYPES } from '../traits.js';
import { DISCIPLINES } from '../disciplines.js';
import { PATHS, KRAINA } from '../bloodMagic.js';
import { DISCIPLINE_POWERS } from '../powers/disciplines.js';

// ── Génération et sang (§7.1) ────────────────────────────────────────────────

const GENERATION_TABLE = {
    3: { traitMax: 10, bloodMax: null, perTurn: null },
    4: { traitMax: 9,  bloodMax: 50, perTurn: 10 },
    5: { traitMax: 8,  bloodMax: 40, perTurn: 8 },
    6: { traitMax: 7,  bloodMax: 30, perTurn: 6 },
    7: { traitMax: 6,  bloodMax: 20, perTurn: 4 },
    8: { traitMax: 5,  bloodMax: 15, perTurn: 3 },
    9: { traitMax: 5,  bloodMax: 14, perTurn: 2 },
    10: { traitMax: 5, bloodMax: 13, perTurn: 1 },
    11: { traitMax: 5, bloodMax: 12, perTurn: 1 },
    12: { traitMax: 5, bloodMax: 11, perTurn: 1 },
};

/** Plafond des traits, réserve maximale et sang par tour d'une Génération */
export const generationStats = (generation) =>
    GENERATION_TABLE[generation] ?? (generation >= 13 ? { traitMax: 5, bloodMax: 10, perTurn: 1 } : GENERATION_TABLE[4]);

/** Points affichés pour un trait : 5, davantage à partir de la 7ᵉ Génération */
export const traitMaxFor = (c) => Math.max(5, generationStats(c.generation ?? 12).traitMax ?? 5);

/** Pouvoirs au-delà de 5 (pouvoirs d'aîné) : 7ᵉ Génération ou mieux (§13.1) */
export const ELDER_GENERATION = 7;

// ── Clan (§15) ───────────────────────────────────────────────────────────────

/** Données du clan, fusionnées avec la caste choisie */
export const clanProfile = (clanKey, casteKey) => {
    const clan = CLANS[clanKey];
    if (!clan) return null;
    const caste = clan.castes?.[casteKey ?? clan.defaultCaste];
    return {
        ...clan,
        caste,
        disciplines: caste?.disciplines ?? clan.disciplines ?? [],
        weakness: caste?.weakness ?? clan.weakness ?? '',
        weaknessField: caste?.weaknessField ?? clan.weaknessField ?? null,
        effects: clan.effects ?? {},
    };
};

/** Disciplines de clan : celles du clan (ou de la caste) ; lignées à clan d'origine : + 2 au choix parmi celles du clan d'origine */
export const clanDisciplines = (clanKey, casteKey, originClanKey) => {
    const profile = clanProfile(clanKey, casteKey);
    if (!profile) return [];
    if (!profile.originClan) return profile.disciplines;
    const origin = clanProfile(originClanKey);
    return [...profile.disciplines, ...(origin?.disciplines ?? [])];
};

// ── Route et archétypes (§4.6, §11) ─────────────────────────────────────────

/** Statut sur la Route : Initié (1-3), Adepte (4-7), Parangon (8+) */
export const roadStatus = (rating) => (rating >= 8 ? 'Parangon' : rating >= 4 ? 'Adepte' : 'Initié');

/** Libellé d'une Nature ou d'une Attitude */
export const archetypeLabel = (key) => ARCHETYPES.find(a => a.key === key)?.label ?? '';

// ── Profil : ce que chaque vue de la fiche relit ─────────────────────────────

/**
 * Données dérivées affichées par la fiche (joueur ou Conteur).
 * @returns {{ clan, casteKey, clanLabel, road, roadLabel, moralKey, controlKey,
 *             traitMax, bloodMax, perTurn, roadStatus }}
 */
export const characterProfile = (c) => {
    const clan = clanProfile(c.clanKey, c.casteKey);
    const road = ROADS[c.roadKey];
    const [moralKey, controlKey] = roadVirtues(c.roadKey, c.roadPathKey);
    const { bloodMax, perTurn } = generationStats(c.generation ?? 12);
    return {
        clan,
        casteKey: c.casteKey ?? CLANS[c.clanKey]?.defaultCaste ?? null,
        clanLabel: clan ? `${clan.label}${clan.caste ? ` (${clan.caste.label})` : ''}` : '',
        road,
        roadLabel: `${road?.label ?? ''}${c.roadPathKey ? ` · ${road?.paths?.[c.roadPathKey]?.label ?? ''}` : ''}`,
        moralKey,
        controlKey,
        traitMax: traitMaxFor(c),
        bloodMax: bloodMax ?? 10,
        perTurn,
        roadStatus: roadStatus(c.roadRating ?? 0),
    };
};

// ── Disciplines (§13, §14) ──────────────────────────────────────────────────

/** Branche d'une Discipline à variantes : Quietus selon la caste assamite, Valeren selon la caste salubrite */
export const disciplineBranch = (c, key) => {
    if (key === 'quietus') return clanProfile(c.clanKey, c.casteKey)?.caste?.quietusBranch ?? null;
    if (key === 'valeren') return c.casteKey ?? CLANS[c.clanKey]?.defaultCaste ?? null;
    return null;
};

/** Pouvoirs de la Discipline (toutes valeurs), restreints à la branche du personnage */
export const disciplinePowers = (c, key) => {
    const branch = disciplineBranch(c, key);
    return (DISCIPLINE_POWERS[key] ?? []).filter(p => !p.branch || !branch || p.branch === branch);
};

/** Pouvoirs connus d'une Discipline de la fiche : niveau ≤ valeur (5 au plus), plus les pouvoirs d'aîné choisis */
export const knownPowers = (c, d) => {
    const elder = new Set(d.powers ?? []);
    return disciplinePowers(c, d.disciplineKey).filter(p => p.level <= Math.min(5, d.rating) || elder.has(p.key));
};

/** Nom d'une voie (Thaumaturgie, Nécromancie) ou d'une kraina (Koldunisme) */
export const bloodPathName = (discKey, pathKey) => {
    const def = DISCIPLINES[discKey];
    return (def?.bloodMagic === 'kraina' ? KRAINA[discKey]?.[pathKey] : PATHS[def?.pathSet]?.[pathKey]) ?? pathKey;
};

/** Résumé d'une ligne d'une Discipline (fiche du Conteur) : voies et valeurs, ou pouvoirs connus */
export const disciplineSummary = (c, d) => {
    const def = DISCIPLINES[d.disciplineKey];
    if (def?.bloodMagic) {
        return (c.bloodPaths ?? []).filter(p => p.disciplineKey === d.disciplineKey)
            .map(p => `${bloodPathName(d.disciplineKey, p.pathKey)} ${p.rating}`).join(' · ');
    }
    if (def?.physical) return 'Bonus permanent';
    return knownPowers(c, d).map(p => p.label).join(' · ');
};

// ── Édition des listes de la fiche ───────────────────────────────────────────

/** Point cliqué en édition : le dernier point se retire */
export const nextValue = (current, n) => (n === current ? n - 1 : n);

/** Met à jour (ou ajoute) l'entrée d'une sous-table identifiée par sa clé, en gardant son id */
export const upsertByKey = (list, keyField, key, patch) => {
    const found = (list ?? []).some(e => e[keyField] === key);
    return found ? list.map(e => (e[keyField] === key ? { ...e, ...patch } : e)) : [...(list ?? []), { [keyField]: key, ...patch }];
};
