// tests/systems/vileborn/config/rules/challenge.test.js
// Défis (spec_vileborn_defis.md §II.1, §II.4) : exemples d'Igritte (kit p. 56-57)
// et de la Revenante (kit p. 72-73).
import { describe, it, expect } from 'vitest';
import {
    finalDifficulty, lastReachedTrigger, toggleBox, isDone, darkActive, darkRow,
    duplicateSheet, cleanSheet, canSaveSheet, blankSheet,
} from '../../../../../src/systems/vileborn/config/rules/challenge.js';

const igritte = {
    name: 'Igritte', source: 'kit', track: 5,
    difficulty: { force: 1, will: -1, influence: 0, reason: -1, precision: 1, subterfuge: 1 },
    triggers: [{ box: 3, text: 'Transformation' }],
    dark: { when: 'fromBox', fromBox: 3, threshold: 6, rows: [{ min: 7, text: 'Cri' }, { min: 8, text: 'Projeté' }, { min: 11, text: 'Broyé' }] },
};
const revenante = { name: 'Revenante', track: 6, triggers: [{ box: 2, text: 'Intangible' }], dark: { when: 'always', rows: [{ min: 6, text: 'Lynchage' }] } };

describe('Difficulté finale : base + écart de la fiche + ajustement en jeu', () => {
    it('base Normale : on retrouve les valeurs absolues du kit (6 / 4 / 5 / 4 / 6 / 6)', () => {
        expect(['force', 'will', 'influence', 'reason', 'precision', 'subterfuge'].map(a => finalDifficulty(igritte, {}, a, 5))).toEqual([6, 4, 5, 4, 6, 6]);
    });
    it('transformation d\'Igritte : Force très difficile (7) par un ajustement de +1', () => {
        expect(finalDifficulty(igritte, { force: 1 }, 'force', 5)).toBe(7);
    });
    it('le total peut dépasser 7 (livre p. 214)', () => {
        expect(finalDifficulty(igritte, { precision: 2 }, 'precision', 6)).toBe(9);
    });
    it('approche absente de la fiche : écart nul', () => {
        expect(finalDifficulty({ difficulty: {} }, undefined, 'reason', 4)).toBe(4);
    });
});

describe('Piste et déclencheurs', () => {
    it('cliquer une case coche jusqu\'à elle ; recliquer la dernière cochée la décoche', () => {
        expect(toggleBox(0, 3)).toBe(3);
        expect(toggleBox(3, 3)).toBe(2);
        expect(toggleBox(3, 1)).toBe(0);
    });
    it('rien avant la 3ᵉ case d\'Igritte', () => {
        expect(lastReachedTrigger(igritte, 0)).toBeNull();
        expect(lastReachedTrigger(igritte, 2)).toBeNull();
    });
    it('la transformation d\'Igritte reste en avant aux cases suivantes', () => {
        expect(lastReachedTrigger(igritte, 3)).toMatchObject({ box: 3 });
        expect(lastReachedTrigger(igritte, 4)).toMatchObject({ box: 3 });
        expect(lastReachedTrigger(igritte, 5)).toMatchObject({ box: 3 });
    });
    it('plusieurs déclencheurs (Igritte de l\'Apocrypha) : le plus haut atteint, l\'ancien revient en décochant', () => {
        const apocrypha = { track: 8, triggers: [2, 4, 6, 8].map(box => ({ box, text: `Case ${box}` })) };
        expect(lastReachedTrigger(apocrypha, 5)).toMatchObject({ box: 4 });
        expect(lastReachedTrigger(apocrypha, 6)).toMatchObject({ box: 6 });
        expect(lastReachedTrigger(apocrypha, 3)).toMatchObject({ box: 2 });
        expect(lastReachedTrigger(apocrypha, 1)).toBeNull();
    });
    it('défi surmonté quand la piste est pleine', () => {
        expect(isDone(igritte, 5)).toBe(true);
        expect(isDone(igritte, 4)).toBe(false);
    });
});

describe('Dé d\'obscurité du défi', () => {
    it('Igritte : seulement après la transformation (case 3) ; la Revenante : à chaque test', () => {
        expect(darkActive(igritte, 2)).toBe(false);
        expect(darkActive(igritte, 3)).toBe(true);
        expect(darkActive(revenante, 0)).toBe(true);
        expect(darkActive({ dark: { when: 'none' } }, 5)).toBe(false);
    });
    it('ligne retenue : la plus haute atteinte', () => {
        expect(darkRow(igritte, 6)).toBeNull();
        expect(darkRow(igritte, 7).text).toBe('Cri');
        expect(darkRow(igritte, 10).text).toBe('Projeté');
        expect(darkRow(igritte, 12).text).toBe('Broyé');
    });
});

describe('Bibliothèque : duplication et formulaire', () => {
    it('dupliquer donne une copie du MJ, sans identifiant, indépendante', () => {
        const copy = duplicateSheet({ id: 4, ...igritte });
        expect(copy).toMatchObject({ name: 'Igritte (copie)', source: 'mj' });
        expect(copy.id).toBeUndefined();
        copy.triggers[0].text = 'Changé';
        expect(igritte.triggers[0].text).toBe('Transformation');
    });
    it('enregistrer retire les lignes vides et les déclencheurs hors piste, trie les cases', () => {
        const sheet = cleanSheet({
            ...blankSheet(), name: '  Poursuite  ', track: 4,
            resistances: ['Rapide', '  '], triggers: [{ box: 3, text: 'Toit' }, { box: 1, text: 'Départ' }, { box: 6, text: 'Hors piste' }, { box: 2, text: '' }],
            complications: [{ text: '', effect: 'fear' }, { text: 'Chute', effect: 'wound' }],
            dark: { when: 'always', threshold: null, rows: [{ min: 11, text: 'B' }, { min: 8, text: 'A' }, { min: 6, text: ' ' }] },
        });
        expect(sheet.name).toBe('Poursuite');
        expect(sheet.resistances).toEqual(['Rapide']);
        expect(sheet.triggers.map(t => t.box)).toEqual([1, 3]);
        expect(sheet.complications).toHaveLength(1);
        expect(sheet.dark.rows.map(r => r.min)).toEqual([8, 11]);
    });
    it('un défi sans nom ne s\'enregistre pas', () => {
        expect(canSaveSheet({ ...blankSheet(), name: ' ' })).toBe(false);
        expect(canSaveSheet({ ...blankSheet(), name: 'Duel' })).toBe(true);
    });
});
