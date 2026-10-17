// src/client/tests/systems/vikings/dice.test.js
// ─────────────────────────────────────────────────────────────────────────────
// Hooks de dés Vikings (config.jsx → dice) : notation, interprétation, animation.
// Le « raw » imite la sortie du moteur : raw.groups[i].values dans l'ordre de
// rpg-dice-roller (dés explosés insérés après leur dé d'origine).
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import vikingsConfig from '../../../src/systems/vikings/config.jsx';

const { buildNotation, beforeRoll, afterRoll, buildAnimationSequence } = vikingsConfig.dice;

// Contexte déjà passé par beforeRoll (paramètres calculés)
const ctx = (systemData) => ({
    label: 'Jet',
    systemData: {
        pool: 3, threshold: 7, explosionThresholds: [10], caracLevel: 2,
        blessureMalus: 0, totalTraitBonus: 0, fatigueMalus: 0, autoSuccesses: 0,
        rollType: 'carac', selectedCarac: 'force', declaredMode: null,
        ...systemData,
    },
});
const raw = (...groups) => ({ groups: groups.map(values => ({ values })), allDice: groups.flat() });

describe('buildNotation', () => {
    it('jet normal, héroïque (2 groupes) et assurance (2 jets identiques)', () => {
        const base = { pool: 3, caracLevel: 3, threshold: 6 };
        expect(buildNotation({ systemData: base })).toBe('3d10!>=9>=6');
        expect(buildNotation({ systemData: { ...base, declaredMode: 'heroic' } })).toEqual(['3d10!>=9>=6', '3d10!>=10>=7']);
        expect(buildNotation({ systemData: { ...base, declaredMode: 'insurance' } })).toEqual(['3d10!>=9>=6', '3d10!>=9>=6']);
    });
});

describe('beforeRoll', () => {
    const character = { force: 2, traits: [], skills: [] };
    const sd = { rollType: 'carac', selectedCarac: 'force', tokensBlessure: 0, tokensFatigue: 0, sagaActuelle: 1 };

    it('KO de blessure (5) et inconscience de fatigue (10) bloquent le jet', () => {
        expect(() => beforeRoll({ character, systemData: { ...sd, tokensBlessure: 5 } })).toThrow('KO');
        expect(() => beforeRoll({ character, systemData: { ...sd, tokensFatigue: 10 } })).toThrow('épuisement');
    });

    it('fatigue convertie en succès requis selon les paliers du vault (D-2)', () => {
        expect(beforeRoll({ character, systemData: { ...sd, tokensFatigue: 3 } }).systemData.fatigueMalus).toBe(1);
        expect(beforeRoll({ character, systemData: { ...sd, tokensFatigue: 4 } }).systemData.fatigueMalus).toBe(2);
    });
});

describe('afterRoll — jet normal', () => {
    it('compte les succès des dés + succès auto + traits − fatigue', () => {
        const r = afterRoll(raw([8, 3, 10, 7]), ctx({ autoSuccesses: 1, totalTraitBonus: 1, fatigueMalus: 1 }));
        expect(r.successes).toBe(3 + 1 + 1 - 1);
    });

    it('signale le triple 10 naturel (D-15)', () => {
        // 10! → 4 (explosion), 10! → 2, 10! → 7 : trois 10 de base
        expect(afterRoll(raw([10, 4, 10, 2, 10, 7]), ctx()).meta.tripleTen).toBe(true);
        expect(afterRoll(raw([10, 10, 3, 5, 6]), ctx()).meta.tripleTen).toBe(false);
    });
});

describe('afterRoll — héroïque / épique (D-5, Q-4)', () => {
    const heroic = (main, saga, sd = {}) => afterRoll(raw(main, saga), ctx({ declaredMode: 'heroic', ...sd }));

    it('3 succès sur les dés puis dés SAGA → réussite, la SAGA revient', () => {
        const r = heroic([8, 8, 8], [7, 1, 1]);
        expect(r.meta.sagaFailed).toBe(false);
        expect(r.successes).toBe(4);
        expect(r.meta.sagaSuccess).toBe(true);
        expect(r.meta.resourceGained).toBe(1);
    });

    it('les succès auto et les bonus de traits comptent pour la barre des 3', () => {
        const r = heroic([8, 8, 2], [7, 1, 1], { autoSuccesses: 1 });
        expect(r.meta.sagaFailed).toBe(false);
        expect(heroic([8, 2, 2], [7, 1, 1], { totalTraitBonus: 2 }).meta.sagaFailed).toBe(false);
    });

    it('la fatigue relève la barre d\'entrée et la cible finale', () => {
        // 3 succès des dés − 1 de fatigue = 2 < 3 : barre non atteinte
        const blocked = heroic([8, 8, 8], [7, 7, 7], { fatigueMalus: 1 });
        expect(blocked.meta.sagaFailed).toBe(true);
        expect(blocked.meta.failReason).toBe('Condition non remplie (2/3 succès)');
        // 4 succès des dés − 1 = 3 : barre atteinte ; + 2 SAGA = 5 − 1 = 4 → héroïque réussi
        expect(heroic([8, 8, 8, 8], [7, 7, 1], { pool: 4, fatigueMalus: 1 }).meta.sagaSuccess).toBe(true);
    });

    it('barre non atteinte : dés SAGA ignorés, point perdu', () => {
        const r = heroic([8, 8, 2], [10, 10, 10]);
        expect(r.meta.sagaFailed).toBe(true);
        expect(r.meta.bonusSuccesses).toBe(0);
        expect(r.meta.resourceGained).toBe(0);
    });
});

describe('afterRoll — assurance', () => {
    it('garde le meilleur des deux jets', () => {
        const r = afterRoll(raw([2, 3, 4], [8, 9, 1]), ctx({ declaredMode: 'insurance' }));
        expect(r.meta.keptGroup).toBe(1);
        expect(r.successes).toBe(2);
    });
});

describe('buildAnimationSequence', () => {
    it('vagues d\'explosion dans le bon ordre', () => {
        const c = ctx({ pool: 3, explosionThresholds: [9, 10] });
        const r = afterRoll(raw([9, 2, 6, 9, 10, 1]), c);
        const seq = buildAnimationSequence(raw([9, 2, 6, 9, 10, 1]), c, r);
        expect(seq.groups[0].waves).toEqual([{ dice: [9, 6, 9] }, { dice: [2, 10] }, { dice: [1] }]);
    });
});
