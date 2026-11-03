// tests/systems/woddavampire/config/rules/creationRules.test.js
// Règles de la création (spec_woddavampire.md §5, §7.1, §15, §16, §II.6).
import { describe, it, expect } from 'vitest';
import {
    computeGeneration, startingBlood, attributeFree, attributeMax, attributeValue,
    isStartingDiscipline, roadRating, willpowerRating, virtueValue,
    bonusSpent, bonusRemaining, flawPoints, meritFlawCost, meritFlawProblems, pickDot,
    validateCreation, isCreationValid, buildCharacterPayload, isCommonDiscipline, sanitizeCreation, roadAllowed, bonusBreakdown,
} from '../../../../../src/systems/woddavampire/config/rules/creationRules.js';

const base = (extra = {}) => ({
    clanKey: 'brujah', roadKey: 'road_of_humanity',
    attributes: {}, abilities: {}, disciplines: {}, backgrounds: {}, virtues: {}, bonus: {}, meritsFlaws: [],
    ...extra,
});

describe('Génération (§5.4, §7.1)', () => {
    it('départ 12ᵉ moins les points d’Historique Génération (exemples iso)', () => {
        expect(computeGeneration(base())).toBe(12);
        expect(computeGeneration(base({ backgrounds: { generation: 1 } }))).toBe(11);
        expect(computeGeneration(base({ backgrounds: { generation: 3 }, bonus: { backgrounds: { generation: 2 } } }))).toBe(7);
    });

    it('plancher 4ᵉ ; Treizième Génération impose 13ᵉ', () => {
        const chronicle = { startingGeneration: 6, generationFloor: 4 };
        expect(computeGeneration(base({ backgrounds: { generation: 5 } }), chronicle)).toBe(4);
        expect(computeGeneration(base({ meritsFlaws: [{ entryKey: 'thirteenth_generation' }] }))).toBe(13);
    });

    it('réserve de départ : 1d10 + Domaine + Troupeau, plafonnée (§5.3)', () => {
        expect(startingBlood(6, 1, 2, 11)).toBe(9);
        expect(startingBlood(9, 2, 3, 11)).toBe(11);
    });
});

describe('Attributs (§4.2, §5.1, §16)', () => {
    it('1 point gratuit ; Apparence 0 et bloquée pour les Nosferatu et le Handicap Monstrueux', () => {
        expect(attributeFree(base(), 'appearance')).toBe(1);
        expect(attributeFree(base({ clanKey: 'nosferatu' }), 'appearance')).toBe(0);
        expect(attributeMax(base({ clanKey: 'nosferatu' }), 'appearance')).toBe(0);
        expect(attributeMax(base({ meritsFlaws: [{ entryKey: 'monstrous' }] }), 'appearance')).toBe(0);
    });

    it('Enfant : Force et Vigueur plafonnées à 2', () => {
        const ws = base({ meritsFlaws: [{ entryKey: 'child' }] });
        expect(attributeMax(ws, 'strength')).toBe(2);
        expect(attributeMax(ws, 'dexterity')).toBe(5);
    });

    it('valeur = gratuit + priorités + points bonus', () => {
        expect(attributeValue(base({ attributes: { strength: 2 }, bonus: { attributes: { strength: 1 } } }), 'strength')).toBe(4);
    });
});

describe('Disciplines de clan (§5.1, §15.4)', () => {
    it('Caïtif : toutes ; Koldunisme toujours hors clan', () => {
        expect(isStartingDiscipline(base({ clanKey: 'caitiff' }), 'dominate')).toBe(true);
        expect(isStartingDiscipline(base({ clanKey: 'tzimisce', casteKey: 'koldun' }), 'koldunism')).toBe(false);
        expect(isStartingDiscipline(base(), 'dominate')).toBe(false);
    });

    it('règle maison : Célérité, Augure et Puissance accessibles à tous', () => {
        const nosferatu = base({ clanKey: 'nosferatu' });
        expect(['celerity', 'auspex', 'potence'].map(k => isStartingDiscipline(nosferatu, k))).toEqual([true, true, true]);
        expect(isCommonDiscipline(nosferatu, 'auspex')).toBe(true);
        expect(isCommonDiscipline(nosferatu, 'potence')).toBe(false);   // de clan pour les Nosferatu
    });
});

describe('Détail des points bonus (§II.6)', () => {
    it('une ligne par poste, Handicaps en négatif, postes vides omis', () => {
        const ws = base({ bonus: { attributes: { strength: 1 }, abilities: { melee: 2 } }, meritsFlaws: [{ entryKey: 'odd_gait' }] });
        expect(bonusBreakdown(ws).map(l => [l.label, l.points])).toEqual([['Attributs', 5], ['Capacités', 4], ['Handicaps', -1]]);
    });
});

describe('Routes de clan (§II.6)', () => {
    it('réservées à leur clan, et à la caste pour le Code de Samiel', () => {
        expect(roadAllowed(base(), 'road_of_paradox')).toBe(false);
        expect(roadAllowed(base({ clanKey: 'ravnos' }), 'road_of_paradox')).toBe(true);
        expect(roadAllowed(base({ clanKey: 'salubri' }), 'code_of_samiel')).toBe(false);   // Guérisseurs par défaut
        expect(roadAllowed(base({ clanKey: 'salubri', casteKey: 'warriors' }), 'code_of_samiel')).toBe(true);
        expect(roadAllowed(base(), 'road_of_bones')).toBe(true);
    });

    it('changer de clan ramène à la Route de l’Humanité', () => {
        const ws = sanitizeCreation(base({ clanKey: 'brujah', roadKey: 'road_of_blood', roadPathKey: null }));
        expect(ws.roadKey).toBe('road_of_humanity');
    });
});

describe('Traits devenus interdits (§II.6)', () => {
    it('passer en Nosferatu rend les points d’Apparence, bonus d’abord', () => {
        const ws = sanitizeCreation(base({ clanKey: 'nosferatu', attributes: { appearance: 2 }, bonus: { attributes: { appearance: 1 } } }));
        expect([ws.attributes.appearance, ws.bonus.attributes.appearance]).toEqual([0, 0]);
    });

    it('Enfant : Force ramenée à 2, points bonus rendus avant les priorités', () => {
        const ws = sanitizeCreation(base({ meritsFlaws: [{ entryKey: 'child' }], attributes: { strength: 2 }, bonus: { attributes: { strength: 1 } } }));
        expect([ws.attributes.strength, ws.bonus.attributes.strength]).toEqual([1, 0]);
    });

    it('changer de clan rend les Disciplines de départ perdues, garde les communes', () => {
        const ws = sanitizeCreation(base({ clanKey: 'toreador', disciplines: { potence: 2, celerity: 1, auspex: 1 } }));
        expect(ws.disciplines).toEqual({ potence: 2, celerity: 1, auspex: 1 });
        const ws2 = sanitizeCreation(base({ clanKey: 'nosferatu', disciplines: { presence: 2, potence: 2 } }));
        expect(ws2.disciplines).toEqual({ presence: 0, potence: 2 });
    });

    it('Caïtif : le Statut est rendu ; rien ne change sinon (même objet)', () => {
        expect(sanitizeCreation(base({ clanKey: 'caitiff', backgrounds: { status: 2 } })).backgrounds.status).toBe(0);
        const ok = base({ attributes: { strength: 3 } });
        expect(sanitizeCreation(ok)).toBe(ok);
    });
});

describe('Route, Volonté, Vertus (§5.2)', () => {
    it('Route = Vertu morale + Vertu de maîtrise, Volonté = Courage, sur les points de création', () => {
        const ws = base({ virtues: { moral: 2, control: 1, courage: 3 }, bonus: { virtues: { moral: 1 } } });
        expect(roadRating(ws)).toBe(5);         // 3 + 2, le point bonus en Vertu ne compte pas
        expect(willpowerRating(ws)).toBe(4);
        expect(virtueValue(ws, 'moral')).toBe(4);
    });

    it('Route et Volonté s’achètent séparément', () => {
        const ws = base({ virtues: { moral: 2, control: 1, courage: 3 }, bonus: { road: 1, willpower: 2 } });
        expect(roadRating(ws)).toBe(6);
        expect(willpowerRating(ws)).toBe(6);
    });
});

describe('Points bonus et Atouts / Handicaps (§5.2, §16)', () => {
    it('barème des points bonus', () => {
        const ws = base({ bonus: { attributes: { strength: 1 }, abilities: { melee: 2 }, disciplines: { celerity: 1 },
            backgrounds: { herd: 1 }, virtues: { courage: 1 }, road: 1, willpower: 1 } });
        expect(bonusSpent(ws)).toBe(5 + 4 + 7 + 1 + 2 + 2 + 1);
    });

    it('les Handicaps rapportent des points, plafonnés à 7', () => {
        const ws = base({ meritsFlaws: [{ entryKey: 'hunted', cost: 4 }, { entryKey: 'nameless', cost: 5 }] });
        expect(flawPoints(ws)).toEqual({ raw: 9, granted: 7 });
        expect(bonusRemaining(ws)).toBe(22);
    });

    it('coûts de clan et Handicaps imposés sans points', () => {
        expect(meritFlawCost(base({ clanKey: 'nosferatu' }), { entryKey: 'unclean', cost: 3 })).toBe(1);
        expect(meritFlawCost(base({ clanKey: 'nagaraja' }), { entryKey: 'ragged_bite', cost: 2 })).toBe(0);
    });

    it('restrictions de clan, prérequis et exclusions', () => {
        expect(meritFlawProblems(base({ clanKey: 'nosferatu' }), 'blush_of_health')).not.toEqual([]);
        expect(meritFlawProblems(base(), 'harbinger_of_the_abyss')).not.toEqual([]);
        expect(meritFlawProblems(base({ disciplines: { obtenebration: 1 } }), 'harbinger_of_the_abyss')).toEqual([]);
        expect(meritFlawProblems(base({ meritsFlaws: [{ entryKey: 'weak_blood' }] }), 'cannot_embrace')).not.toEqual([]);
    });

    it('Lettré n’existe que si l’alphabétisation n’est pas supposée', () => {
        expect(meritFlawProblems(base(), 'literacy')).toEqual([]);
        expect(meritFlawProblems(base(), 'literacy', { literacyAssumed: true, flawCap: 7 })).not.toEqual([]);
    });
});

describe('pickDot', () => {
    it('fixe les points de priorité, plafonnés par le budget et le plafond du trait', () => {
        expect(pickDot({ n: 4, free: 1, base: 0, bonus: 0, max: 5, baseCap: 5, baseRemaining: 2, bonusMode: false })).toEqual({ base: 2, bonus: 0 });
        expect(pickDot({ n: 5, free: 0, base: 0, bonus: 0, max: 5, baseCap: 3, baseRemaining: 9, bonusMode: false })).toEqual({ base: 3, bonus: 0 });
    });

    it('cliquer le dernier point le retire ; le mode bonus agit sur la couche bonus', () => {
        expect(pickDot({ n: 3, free: 1, base: 2, bonus: 0, max: 5, baseCap: 5, baseRemaining: 0, bonusMode: false })).toEqual({ base: 1, bonus: 0 });
        expect(pickDot({ n: 5, free: 1, base: 2, bonus: 0, max: 5, baseCap: 5, baseRemaining: 0, bonusMode: true })).toEqual({ base: 2, bonus: 2 });
    });
});

describe('Validation et fiche finale', () => {
    const complete = () => base({
        nom: 'Aldric', playerName: 'Jean', bloodRoll: 5,
        attrPriority: { physical: 3, social: 7, mental: 5 },
        attributes: { strength: 1, dexterity: 1, stamina: 1, charisma: 3, manipulation: 2, appearance: 2, perception: 2, intelligence: 2, wits: 1 },
        abilityPriority: { talent: 13, skill: 9, knowledge: 5 },
        abilities: { alertness: 3, athletics: 3, brawl: 3, empathy: 2, intimidation: 2, melee: 3, ride: 3, etiquette: 3, academics: 2, occult: 3 },
        domains: { academics: ['Philosophie'] },
        disciplines: { celerity: 2, potence: 1, presence: 1 },
        backgrounds: { herd: 2, generation: 1, resources: 2 },
        virtues: { moral: 2, control: 2, courage: 3 },
    });

    it('une création complète est valide', () => {
        const report = validateCreation(complete());
        expect(isCreationValid(report)).toBe(true);
    });

    it('Giovani sans point de Génération : simple rappel, pas un blocage (P-2)', () => {
        const ws = { ...complete(), clanKey: 'giovani', disciplines: { auspex: 2, fortitude: 1, necromancy: 0 }, backgrounds: { herd: 2, resources: 3 } };
        const report = validateCreation(ws);
        expect(report.blood.warnings.length).toBe(1);
        expect(report.blood.errors).toEqual([]);
    });

    it('Statut interdit aux Caïtifs ; domaine d’expertise obligatoire', () => {
        const ws = { ...complete(), clanKey: 'caitiff', backgrounds: { status: 1, herd: 2, generation: 2 }, domains: {} };
        const report = validateCreation(ws);
        expect(report.advantages.errors.some(e => e.includes('Statut'))).toBe(true);
        expect(report.abilities.errors.some(e => e.includes('Érudition'))).toBe(true);
    });

    it('corps de création : valeurs finales et sous-tables', () => {
        const p = buildCharacterPayload(complete());
        expect(p).toMatchObject({ generation: 11, bloodCurrent: 7, roadRating: 6, willpowerPermanent: 4, strength: 2, charisma: 4 });
        expect(p.abilities.find(a => a.abilityKey === 'academics').domains).toEqual(['Philosophie']);
        expect(p.disciplines).toContainEqual({ disciplineKey: 'celerity', rating: 2, powers: [] });
    });
});
