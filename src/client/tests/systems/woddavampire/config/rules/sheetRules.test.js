// tests/systems/woddavampire/config/rules/sheetRules.test.js
// Règles de la fiche (spec_woddavampire.md §3.2, §3.3, §4.5, §7, §8, §9, §13.2).
import { describe, it, expect } from 'vitest';
import {
    healthLevels, healthMarks, cycleHealthBox, woundPenalty, buildPool, wakeUp, endOfStory, healWithBlood, healAggravated, thirst, pickBox, stainSpots, stainCount,
    traitValue, powerRollSetup, krainaRoll, ritualRoll, thaumaturgyPathRoll,
    spendCost, woundSummary, imposedState, toWeapon, damageText,
} from '../../../../../src/systems/woddavampire/config/rules/sheetRules.js';

describe('Dépenses, résumé de santé, état imposé, armes', () => {
    it('dépense un coût sans passer sous 0', () => {
        expect(spendCost({ bloodCurrent: 3, willpowerCurrent: 1 }, { blood: 2, willpower: 2 })).toEqual({ bloodCurrent: 1, willpowerCurrent: 0 });
    });

    it('résumé de santé : Indemne, niveau atteint et malus', () => {
        expect(woundSummary({})).toEqual({ text: 'Indemne', hurt: false });
        expect(woundSummary({ damageLethal: 2 })).toEqual({ text: 'Blessé (-1)', hurt: true });
        expect(woundSummary({ damageBashing: 1 })).toEqual({ text: 'Contusionné', hurt: false });
    });

    it('un seul état imposé, dans l’ordre Frénésie, Rötschreck, Torpeur ; la faiblesse n’en est pas un', () => {
        expect(imposedState({ states: ['weakness'] })).toBeNull();
        expect(imposedState({ states: ['weakness', 'torpor'] })).toBe('torpor');
    });

    it('arme libre : dégâts lus dans le texte, difficulté relative à 6', () => {
        const w = toWeapon({ name: 'Gourdin', damage: 'For + 1 C', difficulty: 7 });
        expect(w).toMatchObject({ name: 'Gourdin', ability: 'melee', diffMod: 1, damage: { strength: true, bonus: 1, type: 'bashing' } });
        expect(damageText(w.damage)).toBe('For + 1 C');
    });
});

const char = (extra = {}) => ({
    id: 7, generation: 12, bloodCurrent: 11, roadRating: 6, virtueMoral: 3, virtueControl: 3, virtueCourage: 4,
    willpowerPermanent: 4, willpowerCurrent: 2,
    strength: 2, dexterity: 3, stamina: 2, perception: 3, intelligence: 3, wits: 2,
    abilities: [{ abilityKey: 'melee', rating: 3 }, { abilityKey: 'alertness', rating: 4, specialties: ['Embuscades'] }],
    disciplines: [{ disciplineKey: 'celerity', rating: 2 }],
    meritsFlaws: [], damageBashing: 0, damageLethal: 0, damageAggravated: 0,
    ...extra,
});

describe('Santé (§9)', () => {
    it('7 niveaux ; Robuste ajoute un niveau Contusionné', () => {
        expect(healthLevels(char())).toHaveLength(7);
        expect(healthLevels(char({ meritsFlaws: [{ entryKey: 'sturdy' }] }))).toHaveLength(8);
    });

    it('rangement automatique : aggravé en haut, puis létal, puis contondant', () => {
        expect(healthMarks(char({ damageBashing: 1, damageLethal: 1, damageAggravated: 1 })).slice(0, 4))
            .toEqual(['aggravated', 'lethal', 'bashing', '']);
    });

    it('clic : vide → contondant → létal → aggravé → vide', () => {
        let c = char();
        c = { ...c, ...cycleHealthBox(c, 0) };
        expect(c.damageBashing).toBe(1);
        c = { ...c, ...cycleHealthBox(c, 0) };
        expect([c.damageBashing, c.damageLethal]).toEqual([0, 1]);
        c = { ...c, ...cycleHealthBox(c, 0) };
        expect(c.damageAggravated).toBe(1);
        c = { ...c, ...cycleHealthBox(c, 0) };
        expect([c.damageBashing, c.damageLethal, c.damageAggravated]).toEqual([0, 0, 0]);
    });

    it('seul le malus du niveau le plus grave s’applique', () => {
        expect(woundPenalty(char({ damageLethal: 3 })).penalty).toBe(-1);   // Touché
        expect(woundPenalty(char({ damageLethal: 6 })).penalty).toBe(-5);   // Infirme
        expect(woundPenalty(char({ damageLethal: 7 })).incapacitated).toBe(true);
        expect(woundPenalty(char({ damageLethal: 2, meritsFlaws: [{ entryKey: 'sturdy' }] })).penalty).toBe(0);
    });
});

describe('Réserve d’un jet (§3.2, §3.3, §13.2)', () => {
    it('Attribut + Capacité + bonus permanent de Célérité sur la Dextérité', () => {
        const p = buildPool(char(), { attrKey: 'dexterity', abilityKey: 'melee' });
        expect(p.dice).toBe(3 + 3 + 2);
        expect(p.difficulty).toBe(6);
    });

    it('la Célérité est décochable (usage discret)', () => {
        expect(buildPool(char(), { attrKey: 'dexterity', abilityKey: 'melee', physicalBonus: false }).dice).toBe(6);
    });

    it('malus de blessure, sauf jet réflexe', () => {
        const c = char({ damageLethal: 4 });   // Blessé gravement : −2
        expect(buildPool(c, { attrKey: 'wits', abilityKey: 'alertness' }).dice).toBe(2 + 4 - 2);
        expect(buildPool(c, { attrKey: 'wits', abilityKey: 'alertness', reflex: true }).dice).toBe(6);
    });

    it('Capacité à 0 : Talent sans pénalité, Compétence +1 diff, Connaissance impossible', () => {
        expect(buildPool(char(), { attrKey: 'wits', abilityKey: 'empathy' })).toMatchObject({ dice: 2, difficulty: 6, blocked: null });
        expect(buildPool(char(), { attrKey: 'wits', abilityKey: 'stealth' }).difficulty).toBe(7);
        expect(buildPool(char(), { attrKey: 'intelligence', abilityKey: 'occult' }).blocked).toBeTruthy();
    });

    it('spécialité proposée à partir de 4 si une spécialité est saisie ; Volonté = 1 succès automatique', () => {
        expect(buildPool(char(), { attrKey: 'wits', abilityKey: 'alertness' }).specialtyAllowed).toBe(true);
        expect(buildPool(char({ abilities: [{ abilityKey: 'alertness', rating: 4, specialties: [] }] }), { attrKey: 'wits', abilityKey: 'alertness' }).specialtyAllowed).toBe(false);
        expect(buildPool(char(), { attrKey: 'dexterity', abilityKey: 'melee' }).specialtyAllowed).toBe(false);
        expect(buildPool(char(), { attrKey: 'wits', willpower: true }).autoSuccesses).toBe(1);
    });

    it('modificateurs et difficulté bornée de 2 à 10', () => {
        const p = buildPool(char(), { attrKey: 'wits', diceMod: -1, difficulty: 9, diffMod: 3 });
        expect(p).toMatchObject({ dice: 1, difficulty: 10 });
    });

    it('Vertu plafonnée par la Route ; Maîtrise/Instinct aussi par la réserve de sang (§4.5)', () => {
        expect(buildPool(char({ virtueCourage: 5, roadRating: 3 }), { virtue: 'virtueCourage' }).dice).toBe(3);
        expect(buildPool(char({ virtueControl: 4, bloodCurrent: 2 }), { virtue: 'virtueControl' }).dice).toBe(2);
        expect(buildPool(char({ damageLethal: 6, virtueCourage: 4 }), { virtue: 'virtueCourage' }).dice).toBe(4);   // réflexe
    });
});

describe('Jets de pouvoirs (§13, §14, II.11)', () => {
    it('traits en plus dans la réserve : Volonté permanente, Route, Discipline', () => {
        const c = char({ roadRating: 6 });
        expect(traitValue(c, { kind: 'willpower', key: 'willpower' })).toBe(4);
        expect(buildPool(c, { attrKey: 'wits', extras: [{ kind: 'road', key: 'road' }] }).dice).toBe(2 + 6);
        expect(buildPool(c, { extras: [{ kind: 'discipline', key: 'celerity' }] }).dice).toBe(2);
    });

    it('Puissance activée : ses dés deviennent des succès automatiques ; Célérité ne s’active pas au jet', () => {
        const c = char({ strength: 3, disciplines: [{ disciplineKey: 'potence', rating: 2 }, { disciplineKey: 'celerity', rating: 2 }] });
        expect(buildPool(c, { attrKey: 'strength', activatePhysical: true })).toMatchObject({ dice: 3, autoSuccesses: 2, activatable: 'potence' });
        expect(buildPool(c, { attrKey: 'dexterity' }).activatable).toBeNull();
    });

    it('Koldunisme : Attribut brut, sans bonus de Discipline physique', () => {
        expect(buildPool(char(), { attrKey: 'dexterity', rawAttributes: true }).dice).toBe(3);
    });

    it('jets génériques : voie de Thaumaturgie, rituel (max 9), kraina (−2 principale)', () => {
        expect(thaumaturgyPathRoll(3)).toMatchObject({ difficulty: 6 });
        expect(ritualRoll(5).difficulty).toBe(8);
        expect(ritualRoll(7).difficulty).toBe(9);
        expect(krainaRoll(2, 'Vigueur', true)).toMatchObject({ difficulty: 4, rawAttributes: true });
        expect(krainaRoll(2, 'Vigueur', false).traits[0]).toEqual({ kind: 'attribute', key: 'stamina' });
    });

    it('réglages de la fenêtre depuis un pouvoir : sélecteurs, traits en plus, coût proposé', () => {
        const setup = powerRollSetup({
            label: 'Exemple', costText: '1 S', cost: { blood: 1, willpower: 0 },
            roll: { traits: [{ kind: 'attribute', key: 'manipulation' }, { kind: 'virtue', key: 'virtueControl' }], choices: [], difficulty: 8, diffNote: null },
        });
        expect(setup).toMatchObject({ attrKey: 'manipulation', abilityKey: null, extras: [{ kind: 'virtue', key: 'virtueControl' }], difficulty: 8, askDifficulty: false });
        expect(setup.cost.spendByDefault).toBe(true);
        expect(powerRollSetup({ label: 'Sans jet structuré', rollText: 'Volonté contre Volonté' })).toMatchObject({ note: 'Volonté contre Volonté', attrKey: null });
        expect(powerRollSetup({ label: 'À fixer', roll: { traits: [], choices: [], difficulty: null, diffNote: '= Volonté de la cible' } }))
            .toMatchObject({ askDifficulty: true, diffNote: '= Volonté de la cible' });
    });
});

describe('Sang et Volonté (§7, §8)', () => {
    it('Réveil : −1 sang, +1 Volonté sans dépasser la permanente', () => {
        expect(wakeUp(char())).toEqual({ bloodCurrent: 10, willpowerCurrent: 3 });
        expect(wakeUp(char({ willpowerCurrent: 4, bloodCurrent: 0 }))).toEqual({ bloodCurrent: 0, willpowerCurrent: 4 });
    });

    it('soin : 1 sang pour 1 niveau létal (sinon contondant) ; aggravé : 5 sang', () => {
        expect(healWithBlood(char({ damageLethal: 1, damageBashing: 1 }))).toEqual({ bloodCurrent: 10, damageLethal: 0 });
        expect(healWithBlood(char({ damageBashing: 2 }))).toEqual({ bloodCurrent: 10, damageBashing: 1 });
        expect(healWithBlood(char())).toBeNull();
        expect(healAggravated(char({ damageAggravated: 1 }))).toEqual({ bloodCurrent: 6, damageAggravated: 0 });
        expect(healAggravated(char({ damageAggravated: 1, bloodCurrent: 4 }))).toBeNull();
    });

    it('Fin d’histoire : Volonté remise à la permanente', () => {
        expect(endOfStory(char())).toEqual({ willpowerCurrent: 4 });
    });

    it('soif : intensité selon la réserve, faim sous 7 − Maîtrise/Instinct', () => {
        expect(thirst(char())).toEqual({ intensity: 0, hungry: false });
        expect(thirst(char({ bloodCurrent: 3 })).hungry).toBe(true);
        expect(thirst(char({ bloodCurrent: 4 })).hungry).toBe(false);
    });

    it('clic sur une case : remplir jusqu’à elle ou vider à partir d’elle', () => {
        expect(pickBox(3, 6)).toBe(6);
        expect(pickBox(6, 4)).toBe(3);
    });
});

describe('Taches qui suivent les blessures', () => {
    it('une tache par clic : contondant 1, létal 2, aggravé 3', () => {
        expect(stainCount(char())).toBe(0);
        expect(stainCount(char({ damageBashing: 1, damageLethal: 1, damageAggravated: 1 }))).toBe(6);
        expect(stainCount(char({ damageAggravated: 7 }))).toBe(21);
    });

    it('mêmes places pour un même personnage, les anciennes ne bougent pas', () => {
        expect(stainSpots(7, 3)).toEqual(stainSpots(7, 3));
        expect(stainSpots(7, 2)).toEqual(stainSpots(7, 3).slice(0, 2));
        expect(stainSpots(8, 1)).not.toEqual(stainSpots(7, 1));
    });
});
