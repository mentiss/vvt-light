// src/client/tests/systems/vikings/rules.test.js
// ─────────────────────────────────────────────────────────────────────────────
// Règles Pure Saga (systems/vikings/config/rules.js).
// Cas tirés de documentations/spec_vikings.md (§1, §2, §5, décisions D-, Q-).
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import {
    getExplosionThreshold, getSuccessThreshold, getBestCharacteristic,
    getBlessureMalus, getFatigueMalus, isFatigueKO,
    splitDiceWaves, isTripleTen,
    XP_COSTS, checkTraitConditions, formatTraitConditions, canSelectTrait,
    TRAITS,
} from '../../../src/systems/vikings/config.jsx';

const trait = (name) => TRAITS.find(t => t.name === name);
const perso = (over = {}) => ({
    force: 2, agilite: 2, perception: 2, intelligence: 2, charisme: 2, chance: 2,
    sagaTotale: 1, skills: [], traits: [], ...over,
});

describe('explosion et seuil (§1.1)', () => {
    it('explosion selon la caractéristique', () => {
        expect([1, 2, 3, 4, 5].map(getExplosionThreshold)).toEqual([[10], [10], [9, 10], [9, 10], [8, 9, 10]]);
    });

    it('seuil selon la compétence, niveau 3 = 5+ (D-1)', () => {
        expect([0, 1, 2, 3, 4, 5].map(getSuccessThreshold)).toEqual([7, 7, 6, 5, 5, 4]);
    });

    it('meilleure des deux caractéristiques liées', () => {
        expect(getBestCharacteristic(perso({ force: 4, agilite: 3 }), { name: 'Combat CàC (armé)' }))
            .toEqual({ name: 'force', level: 4 });
        // Combat distance : Agilité / Agilité (D-13)
        expect(getBestCharacteristic(perso({ agilite: 3, perception: 5 }), { name: 'Combat distance' }))
            .toEqual({ name: 'agilite', level: 3 });
    });
});

describe('vagues d\'explosion (dés explosés insérés après leur dé d\'origine)', () => {
    it('reconstruit les vagues par profondeur', () => {
        // [9!, 2, 6, 9!, 10!, 1] : dés de base 9, 6, 9 ; le 2 explose du 1er 9 ; 10 puis 1 du 2e 9
        expect(splitDiceWaves([9, 2, 6, 9, 10, 1], [9, 10]))
            .toEqual([{ dice: [9, 6, 9] }, { dice: [2, 10] }, { dice: [1] }]);
    });

    it('sans explosion, une seule vague', () => {
        expect(splitDiceWaves([3, 7, 5], [10])).toEqual([{ dice: [3, 7, 5] }]);
        expect(splitDiceWaves([], [10])).toEqual([{ dice: [] }]);
    });
});

describe('triple 10 naturel (D-15, Q-5)', () => {
    it('les 3 dés de base sont des 10, explosions ignorées', () => {
        expect(isTripleTen([10, 4, 10, 2, 10, 7], [9, 10], 3)).toBe(true);
    });

    it('un 10 issu d\'une explosion ne compte pas', () => {
        // 10! → 10 (explosion) → 3 (explosion) : un seul dé de base
        expect(isTripleTen([10, 10, 3, 5, 6], [10], 3)).toBe(false);
    });

    it('impossible à moins de 3 dés (blessure)', () => {
        expect(isTripleTen([10, 10], [10], 2)).toBe(false);
    });
});

describe('blessures et fatigue (§2)', () => {
    it('blessures : 1 token gratuit, puis −1 dé par token', () => {
        expect([0, 1, 2, 3, 4].map(getBlessureMalus)).toEqual([0, 0, 1, 2, 3]);
    });

    it('fatigue : paliers 2/4/6/8, un nombre intermédiaire reste au palier inférieur (D-2)', () => {
        expect([0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(getFatigueMalus)).toEqual([0, 0, 1, 1, 2, 2, 3, 3, 4, 4]);
    });

    it('fatigue : inconscient à 10 tokens', () => {
        expect(isFatigueKO(9)).toBe(false);
        expect(isFatigueKO(10)).toBe(true);
    });
});

describe('coûts d\'évolution (§5)', () => {
    it('runes à 1 SAGA (D-7), le reste selon le vault', () => {
        expect(XP_COSTS).toEqual({ carac: 2, skill: 1, newSkill: 3, trait: 4, rune: 1, newRune: 1 });
    });
});

describe('conditions des traits (D-12)', () => {
    it('compétence requise : meilleure spécialisation', () => {
        const huskarl = trait('Huskarl');   // Force 2, Combat CàC (armé) 2
        expect(checkTraitConditions(perso(), huskarl)).toEqual({ can: false, reason: 'Nécessite Combat CàC (armé) 2+' });
        const armé = perso({ skills: [
            { name: 'Combat CàC (armé)', specialization: 'Épée', level: 1 },
            { name: 'Combat CàC (armé)', specialization: 'Hache', level: 3 },
        ] });
        expect(checkTraitConditions(armé, huskarl).can).toBe(true);
    });

    it('SAGA totale requise (Godi : Loi 2, SAGA 1)', () => {
        const godi = trait('Godi');
        const loi = [{ name: 'Loi', level: 2 }];
        expect(checkTraitConditions(perso({ skills: loi, sagaTotale: 0 }), godi).reason).toBe('Nécessite SAGA totale 1+');
        expect(checkTraitConditions(perso({ skills: loi, sagaTotale: 1 }), godi).can).toBe(true);
    });

    it('maximum (Banni : Chance 1 max)', () => {
        expect(checkTraitConditions(perso({ chance: 1 }), trait('Banni')).can).toBe(true);
        expect(checkTraitConditions(perso({ chance: 2 }), trait('Banni')).reason).toBe('Nécessite Chance 1 max');
    });

    it('alternatives (Survivant miraculeux : Force 2 OU Chance 2)', () => {
        const t = trait('Survivant miraculeux');
        expect(checkTraitConditions(perso({ force: 2, chance: 1 }), t).can).toBe(true);
        expect(checkTraitConditions(perso({ force: 1, chance: 2 }), t).can).toBe(true);
        expect(checkTraitConditions(perso({ force: 1, chance: 1 }), t))
            .toEqual({ can: false, reason: 'Nécessite Force 2+ ou Chance 2+' });
    });

    it('alternative composée (Orphelin aguerri : Agilité 2 OU Survie 1 ET Larcin 1)', () => {
        const t = trait('Orphelin aguerri');
        expect(checkTraitConditions(perso({ agilite: 1, skills: [{ name: 'Survie', level: 1 }] }), t).can).toBe(false);
        expect(checkTraitConditions(perso({ agilite: 1, skills: [{ name: 'Survie', level: 1 }, { name: 'Larcin', level: 1 }] }), t).can).toBe(true);
    });

    it('trait sans condition (Langue de serpent : plus d\'Agilité 2)', () => {
        expect(checkTraitConditions(perso({ agilite: 1 }), trait('Langue de serpent')).can).toBe(true);
    });

    it('libellé des conditions', () => {
        expect(formatTraitConditions(trait('Godi'))).toBe('Loi 2+, SAGA totale 1+');
        expect(formatTraitConditions(trait('Connaissance des runes'))).toBe('Chant 2+ ou Divination 2+ ou Folklore 3+');
        expect(formatTraitConditions(trait('Taille imposante'))).toBe('');
    });
});

describe('sélection d\'un trait à la création', () => {
    it('un trait possédé reste cochable (pour le décocher)', () => {
        expect(canSelectTrait(perso({ traits: [{ name: 'Huskarl' }] }), trait('Huskarl'))).toBe(true);
    });

    it('limite de nombre et incompatibilités', () => {
        const quatre = perso({ traits: ['Campeur', 'Divorcé', 'Infatigable', 'Sommeil léger'].map(name => ({ name })) });
        expect(canSelectTrait(quatre, trait('Taille imposante'), 4)).toBe(false);
        expect(canSelectTrait(perso({ traits: [{ name: 'Divorcé' }] }), trait('Veuf/Veuve'))).toBe(false);
    });

    it('conditions de compétence désormais vérifiées à la création', () => {
        expect(canSelectTrait(perso(), trait('Skald'))).toBe(false);   // Folklore 2
        expect(canSelectTrait(perso({ skills: [{ name: 'Folklore', level: 2 }] }), trait('Skald'))).toBe(true);
    });
});
