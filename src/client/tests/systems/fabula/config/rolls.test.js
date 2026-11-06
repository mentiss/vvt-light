// tests/systems/fabula/config/rolls.test.js
// Jet de Fabula (spec_fabula.md §3.3) : compétences proposées et pré-activées,
// modificateurs, critique sur tout double (Frénésie, sauf double 1), dégâts des
// sorts lus dans leur texte, Nombre porte-bonheur.
import { describe, it, expect } from 'vitest';
import {
    applicableRollSkills, rollModifiers, resolveFabulaTest, parseSpellDamage, applyLuckyNumber,
} from '../../../../src/systems/fabula/config/rolls.js';

const furie = (patch = {}) => ({
    pvActuel: 10, seuilCrise: 20,
    classes: [{ classKey: 'furie', niveau: 3 }, { classKey: 'maitre_armes', niveau: 2 }],
    skills: [
        { classKey: 'furie', skillKey: 'frenesie', rang: 1 },
        { classKey: 'furie', skillKey: 'adrenaline', rang: 2 },
        { classKey: 'furie', skillKey: 'provocation', rang: 1 },
        { classKey: 'maitre_armes', skillKey: 'maitrise_armes_cac', rang: 2 },
    ],
    equipment: [],
    ...patch,
});
const dague = { categorie: 'dague', portee: 'cac' };

describe('compétences au jet', () => {
    it('attaque à la dague en Crise : Frénésie, Maîtrise du corps à corps et Adrénaline pré-activées', () => {
        const skills = applicableRollSkills(furie(), { mode: 'attaque', weapon: dague, attrs: ['dex', 'int'] });
        expect(skills.map(s => [s.key, s.auto])).toEqual([
            ['adrenaline', true], ['frenesie', true], ['maitrise_armes_cac', true],
        ]);
        expect(rollModifiers(skills)).toEqual({ bonus: 2, damage: 4, critAnyDouble: true, names: ['Adrénaline', 'Frénésie', 'Maîtrise des armes de corps à corps'] });
    });

    it('arc hors Crise : Frénésie proposée mais pas cochée, Adrénaline pas cochée', () => {
        const skills = applicableRollSkills(furie({ pvActuel: 30 }), { mode: 'attaque', weapon: { categorie: 'arc', portee: 'distance' }, attrs: ['dex', 'int'] });
        expect(skills.find(s => s.key === 'frenesie').auto).toBe(false);
        expect(skills.find(s => s.key === 'adrenaline').auto).toBe(false);
        expect(skills.find(s => s.key === 'maitrise_armes_cac').auto).toBe(false);
    });

    it('test simple : seul le raccourci Provocation est proposé', () => {
        const skills = applicableRollSkills(furie(), { mode: 'test', attrs: ['dex', 'int'] });
        expect(skills).toEqual([expect.objectContaining({ key: 'provocation', effect: 'shortcut', attrs: ['pui', 'vol'], value: 1 })]);
    });

    it('sort offensif avec arme arcanique : Artillerie magique +[NC × 2]', () => {
        const char = {
            classes: [{ classKey: 'elementaliste', niveau: 3 }],
            skills: [{ classKey: 'elementaliste', skillKey: 'artillerie_magique', rang: 2 }],
            equipment: [{ categorie: 'arcanique', emplacementEquipe: 'deux_mains' }],
        };
        const [s] = applicableRollSkills(char, { mode: 'attaque', spell: { offensif: true }, attrs: ['int', 'vol'] });
        expect(s).toMatchObject({ key: 'artillerie_magique', value: 4, auto: true });
    });
});

describe('résolution', () => {
    it('double 3 : critique seulement avec Frénésie', () => {
        expect(resolveFabulaTest({ die1: 3, die2: 3 }).criticalSuccess).toBe(false);
        expect(resolveFabulaTest({ die1: 3, die2: 3, critAnyDouble: true }).criticalSuccess).toBe(true);
    });

    it('double 1 : fumble, jamais critique', () => {
        const r = resolveFabulaTest({ die1: 1, die2: 1, critAnyDouble: true });
        expect(r).toMatchObject({ criticalFailure: true, criticalSuccess: false, success: false });
    });

    it('total = dés + modificateur + bonus, dégâts = VH + bonus', () => {
        expect(resolveFabulaTest({ die1: 7, die2: 4, modifier: 1, bonus: 4, nd: 15, degatsBonus: 15 }))
            .toMatchObject({ vh: 7, total: 16, success: true, degats: 22 });
    });
});

describe('sorts et porte-bonheur', () => {
    it('dégâts lus dans la description', () => {
        expect(parseSpellDamage('Chaque cible touchée subit aussitôt [VH + 15] dégâts de foudre.')).toEqual({ degatsBonus: 15, degatsType: 'foudre' });
        expect(parseSpellDamage('La cible subit [VH + 25] dégâts de ténèbres.')).toEqual({ degatsBonus: 25, degatsType: 'tenebres' });
        expect(parseSpellDamage('Vous tissez un voile.')).toBeNull();
    });

    it('Nombre porte-bonheur : le dé prend le nombre, la valeur remplacée devient le nombre', () => {
        expect(applyLuckyNumber([3, 5], 0, 7)).toEqual({ dice: [7, 5], next: 3 });
    });
});
