// tests/systems/achtung/dice.test.js
// Hooks des dés de Challenge d'Achtung (config.jsx → challengeDice) : dégâts fixes d'un groupe de Troupes
// comptés dans le résultat enregistré (spec_pnj.md §10.4, Gamemaster Guide p.150).
import { describe, it, expect } from 'vitest';
import achtungConfig from '../../../src/systems/achtung/config.jsx';

const roll = (values, systemData) => achtungConfig.challengeDice.afterRoll({ groups: [{ values }] }, { label: 'Fusil', systemData });

describe('Dés de Challenge', () => {
    it('1 et 2 font 1 et 2 stress, 5 et 6 un stress et un effet', () => {
        expect(roll([1, 2, 4, 6], { nbDice: 4 })).toMatchObject({ stress: 4, effects: 1 });
    });
    it('groupe de trois : +2 dégâts dans le résultat enregistré', () => {
        expect(roll([1, 2, 4, 6], { nbDice: 4, bonusStress: 2 })).toMatchObject({ stress: 6, bonusStress: 2, successes: 6 });
    });
});
