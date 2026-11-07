// tests/systems/cyberpunk/config/rules/moveConsole.test.js
// Console de manœuvres personnalisable (spec_cyberpunk.md §4, Q-12, Q-13) :
// réglage de base tant que rien n'est posé, une manœuvre seulement sur la ligne
// de sa stat, ordre choisi par le joueur.
import { describe, it, expect } from 'vitest';
import {
    consoleCandidates, resolveConsoleIds, groupConsole, canDropOn, placeInConsole, togglePinned, consoleRowOf,
} from '../../../../../src/systems/cyberpunk/config.jsx';

const LIBRARY = [
    { id: 1, type: 'official', playbook: null, name: 'Agir sous pression', stat: 'cran' },
    { id: 2, type: 'official', playbook: null, name: 'Évaluer', stat: 'pro' },
    { id: 3, type: 'official', playbook: null, name: 'Aider ou Interférer', stat: null },
    { id: 10, type: 'official', playbook: 'Netrunner', name: 'Pénétrer un système', stat: 'synth' },
    { id: 11, type: 'official', playbook: 'Netrunner', name: 'Renom', stat: 'synth' },
    { id: 12, type: 'official', playbook: 'Netrunner', name: 'Tueur d\'ICE', stat: null },
    { id: 20, type: 'official', playbook: 'Fixer', name: 'Réputation', stat: 'pro' },
];
const ACQUIRED = [{ id: 10 }, { id: 12 }];

describe('candidats et réglage de base', () => {
    const candidates = consoleCandidates(LIBRARY, ACQUIRED);

    it('manœuvres de base + manœuvres acquises seulement', () => {
        expect([...candidates.keys()].sort((a, b) => a - b)).toEqual([1, 2, 3, 10, 12]);
    });

    it('rien d\'enregistré : les manœuvres de base', () => {
        expect(resolveConsoleIds(null, candidates)).toEqual([1, 2, 3]);
    });

    it('réglage enregistré : ids inconnus, non acquis ou en double écartés', () => {
        expect(resolveConsoleIds([10, 20, 1, 10, 99], candidates)).toEqual([10, 1]);
    });

    it('console vidée : reste vide (pas de retour silencieux au réglage de base)', () => {
        expect(resolveConsoleIds([], candidates)).toEqual([]);
    });
});

describe('lignes', () => {
    it('chaque manœuvre sur la ligne de sa stat ; sans stat ou Cred : « Autres »', () => {
        expect(consoleRowOf({ stat: 'synth' })).toBe('synth');
        expect(consoleRowOf({ stat: null })).toBe('other');
        expect(consoleRowOf({ stat: 'cred' })).toBe('other');
    });

    it('dépôt refusé sur une autre ligne, même Synth (Q-13)', () => {
        const evaluer = LIBRARY[1];
        expect(canDropOn(evaluer, 'pro')).toBe(true);
        expect(canDropOn(evaluer, 'synth')).toBe(false);
    });

    it('regroupe dans l\'ordre posé', () => {
        const candidates = consoleCandidates(LIBRARY, ACQUIRED);
        const rows = groupConsole([10, 1, 3, 12], candidates);
        expect(rows.synth.map(m => m.id)).toEqual([10]);
        expect(rows.cran.map(m => m.id)).toEqual([1]);
        expect(rows.other.map(m => m.id)).toEqual([3, 12]);
        expect(rows.pro).toEqual([]);
    });
});

describe('poser, déplacer, retirer', () => {
    it('déposée sur une puce : se range avant elle', () => {
        expect(placeInConsole([1, 2, 3], 10, 2)).toEqual([1, 10, 2, 3]);
    });

    it('déplacée : quitte sa place d\'origine', () => {
        expect(placeInConsole([1, 2, 3], 3, 1)).toEqual([3, 1, 2]);
    });

    it('déposée sur la ligne sans puce visée : en fin de liste', () => {
        expect(placeInConsole([1, 2], 10)).toEqual([1, 2, 10]);
    });

    it('épingle : pose puis retire', () => {
        expect(togglePinned([1, 2], 10)).toEqual([1, 2, 10]);
        expect(togglePinned([1, 2, 10], 2)).toEqual([1, 10]);
    });
});
