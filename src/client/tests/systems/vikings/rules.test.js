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
    applyRollOutcome, gainSaga, getCombatValues, withDerivedValues, getPassivePostures,
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

describe('effets d\'un jet sur la fiche (régression : dépenses qui s\'écrasaient)', () => {
    const epee = { name: 'Combat CàC (armé)', specialization: 'Épée', level: 3, currentPoints: 3 };
    const hache = { name: 'Combat CàC (armé)', specialization: 'Hache', level: 2, currentPoints: 2 };
    const guerrier = perso({ sagaActuelle: 2, skills: [epee, hache] });

    it('assurance + succès auto : SAGA ET points de compétence dépensés ensemble', () => {
        const apres = applyRollOutcome(guerrier, { sagaSpent: 1, skill: epee, skillPointsSpent: 2 });
        expect(apres.sagaActuelle).toBe(1);
        expect(apres.skills).toEqual([{ ...epee, currentPoints: 1 }, hache]);
    });

    it('jet héroïque réussi : le point de SAGA revient, les points dépensés restent dépensés', () => {
        const avant = applyRollOutcome(guerrier, { sagaSpent: 1, skill: epee, skillPointsSpent: 1 });
        const apres = applyRollOutcome(avant, { sagaRestored: 1 });
        expect(apres.sagaActuelle).toBe(2);
        expect(apres.skills[0].currentPoints).toBe(2);
    });

    it('annulation d\'un jet refusé : dépense remboursée, plafonnée au niveau', () => {
        const avant = applyRollOutcome(guerrier, { sagaSpent: 1, skill: epee, skillPointsSpent: 2 });
        const annule = applyRollOutcome(avant, { sagaRestored: 1, skill: epee, skillPointsSpent: -2 });
        expect(annule.sagaActuelle).toBe(2);
        expect(annule.skills[0].currentPoints).toBe(3);
        expect(applyRollOutcome(guerrier, { skill: epee, skillPointsSpent: -5 }).skills[0].currentPoints).toBe(3);
    });

    it('SAGA bornée entre 0 et 5', () => {
        expect(applyRollOutcome(perso({ sagaActuelle: 0 }), { sagaSpent: 1 }).sagaActuelle).toBe(0);
        expect(applyRollOutcome(perso({ sagaActuelle: 5 }), { sagaRestored: 1 }).sagaActuelle).toBe(5);
    });

    it('jet héroïque réussi : le point récupéré n\'augmente pas la SAGA totale (D-10)', () => {
        const avant = applyRollOutcome(perso({ sagaActuelle: 3, sagaTotale: 7 }), { sagaSpent: 1 });
        expect(applyRollOutcome(avant, { sagaRestored: 1 })).toMatchObject({ sagaActuelle: 3, sagaTotale: 7 });
    });

    it('triple 10 : +1 SAGA et +1 SAGA totale, rien à 5 (D-15, L3-1)', () => {
        expect(applyRollOutcome(perso({ sagaActuelle: 2, sagaTotale: 4 }), { tripleTen: true }))
            .toMatchObject({ sagaActuelle: 3, sagaTotale: 5 });
        expect(applyRollOutcome(perso({ sagaActuelle: 5, sagaTotale: 9 }), { tripleTen: true }))
            .toMatchObject({ sagaActuelle: 5, sagaTotale: 9 });
    });
});

describe('gain de SAGA (D-9, D-10, L3-1)', () => {
    it('réserve plafonnée à 5, SAGA totale augmentée du seul gain reçu', () => {
        expect(gainSaga({ sagaActuelle: 3, sagaTotale: 3 }, 3)).toEqual({ sagaActuelle: 5, sagaTotale: 5 });
        expect(gainSaga({ sagaActuelle: 1, sagaTotale: 1 }, 2)).toEqual({ sagaActuelle: 3, sagaTotale: 3 });
    });
});

describe('valeurs de combat dérivées (B-8, L3-6)', () => {
    const broigne  = { name: 'Broigne', category: 'armor', armorValue: 1, location: 'equipped' };
    const bouclier = { name: 'Bouclier en bois', category: 'armor', armorValue: 1, location: 'equipped' };

    it('traits + armure portée ; boucliers à part ; objet au sac ignoré', () => {
        const c = perso({
            traits: [{ name: 'Bons réflexes' }, { name: 'Peau dure' }],
            items: [broigne, bouclier, { ...broigne, location: 'bag' }],
        });
        expect(getCombatValues(c)).toMatchObject({ actions: 2, seuil: 1, armureNaturelle: 1, armureEquipee: 1, armureTotale: 2, armureBoucliers: 1 });
        // Colonne armure lue par le système de combat : boucliers compris, comme avant la refonte
        expect(withDerivedValues(c)).toMatchObject({ actionsDisponibles: 2, seuilCombat: 1, armure: 3 });
    });

    it('effets conditionnels hors calcul : Marin (en mer), Insaisissable (armure légère)', () => {
        expect(getCombatValues(perso({ traits: [{ name: 'Marin' }, { name: 'Insaisissable' }] })))
            .toMatchObject({ actions: 1, seuil: 1 });
    });

    it('ajustement positif ou négatif ajouté au calcul', () => {
        const c = perso({ traits: [{ name: 'Peau dure' }], actionsMod: 1, seuilMod: 1, armureMod: -1 });
        expect(getCombatValues(c)).toMatchObject({ actions: 2, seuil: 2, armureTotale: 0 });
    });

    it('les anciennes valeurs stockées sont ignorées (recalcul)', () => {
        expect(withDerivedValues(perso({ armure: 7, actionsDisponibles: 4, seuilCombat: 3 })))
            .toMatchObject({ armure: 0, actionsDisponibles: 1, seuilCombat: 1 });
    });
});

describe('posture passive (§8.2, C-1, C-2)', () => {
    it('bonus = niveau ÷ 2 arrondi à l\'inférieur, max 3 ; une ligne par compétence de contact', () => {
        const c = perso({ skills: [
            { name: 'Combat CàC (armé)', specialization: 'Épée', level: 3 },
            { name: 'Combat CàC (armé)', specialization: 'Hache', level: 1 },
            { name: 'Combat CàC (non armé)', level: 5 },
            { name: 'Combat distance', specialization: 'Arc', level: 4 },
        ] });
        expect(getPassivePostures(c).map(p => [p.label, p.bonus, p.seuilDefense])).toEqual([
            ['Parade (Épée)', 1, 2],
            ['Parade (Hache)', 0, 1],
            ['Esquive', 2, 3],
        ]);
        expect(getPassivePostures(perso({ skills: [{ name: 'Combat CàC (non armé)', level: 7 }] }))[0].bonus).toBe(3);
    });
});
