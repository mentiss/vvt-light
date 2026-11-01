// src/client/tests/systems/fabula/config/projects.test.js
// ─────────────────────────────────────────────────────────────────────────────
// Projets du Bricoleur (livre de base p. 134-139, spec_fabula_reference.md
// §2.3 et §5.4) : les exemples du livre servent de cas de référence.
// Import via config.jsx, comme le fait le code applicatif.
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import { computeProject, projectAmount } from '../../../../src/systems/fabula/config.jsx';

describe('computeProject : exemples du livre (p. 138-139)', () => {
    const cases = [
        ['La Découverte',        { power: 'majeure', area: 'grande',       usage: 'permanente' },               6000, 60],
        ['Golem Gatling',        { power: 'majeure', area: 'individuelle', usage: 'permanente', defect: true }, 1500, 15],
        ['Magnébottes',          { power: 'moyenne', area: 'individuelle', usage: 'permanente' },               1000, 10],
        ['Crampon inhibiteur',   { power: 'majeure', area: 'petite',       usage: 'consommable', defect: true }, 600, 6],
        ['Purepoudre',           { power: 'moyenne', area: 'petite',       usage: 'consommable' },               400, 4],
        ['Huile pyro',           { power: 'moyenne', area: 'grande',       usage: 'consommable' },               600, 6],
        ['Gaz soporifique',      { power: 'majeure', area: 'petite',       usage: 'consommable' },               800, 8],
        ['Casque sous-marin',    { power: 'moyenne', area: 'individuelle', usage: 'permanente' },               1000, 10],
    ];
    it.each(cases)('%s', (_name, input, cost, pp) => {
        const result = computeProject(input);
        expect(result.totalCost).toBe(cost);
        expect(result.progressRequired).toBe(pp);
    });

    it('minitank : deux projets moyens, dont un avec défaut, 1 750 z au total', () => {
        const tank   = computeProject({ power: 'moyenne', area: 'individuelle', usage: 'permanente' });
        const cannon = computeProject({ power: 'moyenne', area: 'individuelle', usage: 'permanente', defect: true });
        expect(tank.totalCost + cannon.totalCost).toBe(1750);
        expect(cannon.progressRequired).toBe(7); // 750 z : arrondi inférieur
    });
});

describe('computeProject : règles', () => {
    it('au moins 1 Point de Progression', () => {
        const r = computeProject({ power: 'mineure', area: 'individuelle', usage: 'consommable', defect: true });
        expect(r.totalCost).toBe(75);
        expect(r.progressRequired).toBe(1);
    });

    it('Visionnaire paie NC × 100 z, sans dépasser le coût', () => {
        const big = computeProject({ power: 'majeure', area: 'individuelle', usage: 'permanente', visionaryRanks: 3 });
        expect(big.paidByVisionary).toBe(300);
        expect(big.materialsToPay).toBe(1700);
        const small = computeProject({ power: 'mineure', area: 'individuelle', usage: 'consommable', visionaryRanks: 5 });
        expect(small.paidByVisionary).toBe(100);
        expect(small.materialsToPay).toBe(0);
    });

    it('PP par jour : PJ +1, Bricoleur +2, assistant +1, Visionnaire +NC', () => {
        const r = computeProject({
            power: 'majeure', area: 'grande', usage: 'permanente',
            players: 2, tinkerers: 1, assistants: 1, visionaryRanks: 2,
        });
        expect(r.progressPerDay).toBe(7);
        expect(r.days).toBe(9); // 60 PP / 7 par jour
    });

    it('assistants : chacun coûte la moitié du coût total', () => {
        const r = computeProject({ power: 'moyenne', area: 'individuelle', usage: 'permanente', assistants: 2 });
        expect(r.assistantsWage).toBe(1000);
    });

    it('personne ne travaille : pas de durée', () => {
        expect(computeProject({ power: 'moyenne', area: 'petite', usage: 'consommable' }).days).toBeNull();
    });

    it('ingrédient spécial exigé à partir de la puissance moyenne', () => {
        expect(computeProject({ power: 'mineure', area: 'individuelle', usage: 'consommable' }).specialIngredient).toBe(false);
        expect(computeProject({ power: 'moyenne', area: 'individuelle', usage: 'consommable' }).specialIngredient).toBe(true);
    });
});

describe('projectAmount', () => {
    it('suit la puissance et le niveau de l’inventeur', () => {
        expect(projectAmount('mineure', 30)).toBeNull();
        expect(projectAmount('moyenne', 5)).toBe(10);
        expect(projectAmount('majeure', 20)).toBe(40);
        expect(projectAmount('extreme', 45)).toBe(80);
    });

    it('sous le niveau 5, lit la ligne du niveau 5', () => {
        expect(projectAmount('extreme', 2)).toBe(40);
    });
});
