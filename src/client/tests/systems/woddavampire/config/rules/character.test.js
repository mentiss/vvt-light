// tests/systems/woddavampire/config/rules/character.test.js
// Données dérivées d'un personnage (spec_woddavampire.md §4.6, §7.1, §13, §15).
import { describe, it, expect } from 'vitest';
import {
    generationStats, traitMaxFor, clanDisciplines, roadStatus, characterProfile,
    disciplineBranch, knownPowers, disciplineSummary, nextValue, upsertByKey,
} from '../../../../../src/systems/woddavampire/config/rules/character.js';

describe('Génération (§7.1)', () => {
    it('table de la Génération : traits max, réserve, sang par tour', () => {
        expect(generationStats(12)).toEqual({ traitMax: 5, bloodMax: 11, perTurn: 1 });
        expect(generationStats(7)).toEqual({ traitMax: 6, bloodMax: 20, perTurn: 4 });
        expect(generationStats(13)).toEqual({ traitMax: 5, bloodMax: 10, perTurn: 1 });
    });

    it('points affichés : 5, davantage à partir de la 7ᵉ Génération', () => {
        expect(traitMaxFor({ generation: 12 })).toBe(5);
        expect(traitMaxFor({ generation: 6 })).toBe(7);
    });
});

describe('Disciplines de clan (§5.1, §15.4)', () => {
    it('celles du clan ou de la caste', () => {
        expect(clanDisciplines('assamites', 'warriors')).toEqual(['celerity', 'obfuscate', 'quietus']);
        expect(clanDisciplines('assamites')).toEqual(['auspex', 'presence', 'quietus']);   // caste par défaut : Vizirs
    });

    it('lignée à clan d’origine : sa Discipline + celles du clan d’origine', () => {
        expect(clanDisciplines('kiasyd', null, 'ventrue')).toEqual(['mytherceria', 'dominate', 'fortitude', 'presence']);
    });
});

describe('Profil affiché (§4)', () => {
    it('statut sur la Route : Initié, Adepte, Parangon', () => {
        expect(roadStatus(3)).toBe('Initié');
        expect(roadStatus(4)).toBe('Adepte');
        expect(roadStatus(8)).toBe('Parangon');
    });

    it('clan avec sa caste, réserve de la Génération', () => {
        const p = characterProfile({ clanKey: 'assamites', casteKey: 'warriors', generation: 12, roadKey: 'road_of_humanity', roadRating: 5 });
        expect(p.clanLabel).toMatch(/\(.+\)$/);
        expect(p.bloodMax).toBe(11);
        expect(p.roadStatus).toBe('Adepte');
    });
});

describe('Pouvoirs connus (§13.1)', () => {
    const dominate = (rating, powers = []) => ({ disciplineKey: 'dominate', rating, powers });

    it('niveau ≤ valeur, plafonné à 5 ; pouvoirs d’aîné seulement s’ils sont choisis', () => {
        expect(knownPowers({}, dominate(2)).map(p => p.key)).toEqual(['command', 'subjugation']);
        expect(knownPowers({}, dominate(6)).map(p => p.level)).toEqual([1, 2, 3, 4, 5]);
        expect(knownPowers({}, dominate(6, ['obedience'])).map(p => p.key)).toContain('obedience');
    });

    it('Quietus : branche selon la caste assamite', () => {
        expect(disciplineBranch({ clanKey: 'assamites', casteKey: 'warriors' }, 'quietus')).toBe('cruscitus');
        expect(disciplineBranch({ clanKey: 'assamites' }, 'quietus')).toBe('hematus');
        const c = { clanKey: 'assamites', casteKey: 'warriors' };
        expect(knownPowers(c, { disciplineKey: 'quietus', rating: 2 }).every(p => p.branch === 'cruscitus')).toBe(true);
    });

    it('résumé d’une ligne : pouvoirs connus, ou bonus permanent pour une Discipline physique', () => {
        expect(disciplineSummary({}, dominate(1))).not.toBe('');
        expect(disciplineSummary({}, { disciplineKey: 'celerity', rating: 2 })).toBe('Bonus permanent');
    });
});

describe('Édition des listes', () => {
    it('cliquer le dernier point le retire', () => {
        expect(nextValue(3, 3)).toBe(2);
        expect(nextValue(3, 4)).toBe(4);
    });

    it('met à jour une entrée existante (id conservé) ou l’ajoute', () => {
        const list = [{ id: 7, abilityKey: 'melee', rating: 2 }];
        expect(upsertByKey(list, 'abilityKey', 'melee', { rating: 3 })).toEqual([{ id: 7, abilityKey: 'melee', rating: 3 }]);
        expect(upsertByKey(list, 'abilityKey', 'brawl', { rating: 1 })).toHaveLength(2);
    });
});
