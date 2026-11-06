// tests/systems/fabula/config/utils.test.js
// Règles touchées par la refonte (spec_fabula.md §3.1 et §3.2) : chevrons des
// attributs bornés de d6 à d12 (sous la base comprise), coût de fusion des
// Arcana avec Arcanum d'urgence, cycle Lié → Fusionné → Renvoi → Lié.
import { describe, it, expect } from 'vitest';
import {
    effectiveAttrDie, attrAdjustable, adjustAttrBoost, arcanumFusionCost, nextArcanumState, computeDerivedStats,
} from '../../../../src/systems/fabula/config.jsx';

const hero = (patch = {}) => ({ dexDe: 8, intDe: 10, puiDe: 6, volDe: 12, boostsAttributs: {}, alterationsEtat: [], ...patch });

describe('attributs : chevrons', () => {
    it('on descend sous la base (d8 → d6)', () => {
        const c = hero({ boostsAttributs: { dex: adjustAttrBoost(hero(), 'dex', -1) } });
        expect(c.boostsAttributs.dex).toBe(-1);
        expect(effectiveAttrDie(c, 'dex')).toBe(6);
    });

    it('▲ masqué à d12, ▼ masqué à d6', () => {
        expect(attrAdjustable(hero(), 'vol')).toEqual({ up: false, down: true });
        expect(attrAdjustable(hero(), 'pui')).toEqual({ up: true, down: false });
        expect(attrAdjustable(hero(), 'dex')).toEqual({ up: true, down: true });
    });

    it('ajustement enregistré borné par le dé de base', () => {
        expect(adjustAttrBoost(hero({ boostsAttributs: { pui: 0 } }), 'pui', -1)).toBe(0);    // d6 : rien en dessous
        expect(adjustAttrBoost(hero({ boostsAttributs: { vol: 0 } }), 'vol', 1)).toBe(0);     // d12 : rien au-dessus
        expect(adjustAttrBoost(hero({ boostsAttributs: { dex: 2 } }), 'dex', 1)).toBe(2);     // d8 + 2 = d12
        expect(adjustAttrBoost(hero({ boostsAttributs: { int: -1 } }), 'int', -1)).toBe(-2);  // d10 − 2 = d6
    });

    it('une altération baisse d\'un cran, plancher d6', () => {
        expect(effectiveAttrDie(hero({ alterationsEtat: ['ralenti', 'enrage'] }), 'dex')).toBe(6);
        expect(attrAdjustable(hero({ alterationsEtat: ['ralenti', 'enrage'] }), 'dex').down).toBe(false);
    });
});

describe('arcana : fusion', () => {
    const arcaniste = (pv, nc) => ({ pvActuel: pv, seuilCrise: 20, skills: nc ? [{ classKey: 'arcaniste', skillKey: 'arcanum_urgence', rang: nc }] : [] });

    it('40 PM hors Crise, même avec Arcanum d\'urgence', () => {
        expect(arcanumFusionCost(arcaniste(30, 2))).toBe(40);
    });

    it('en Crise : 40 − [NC × 5]', () => {
        expect(arcanumFusionCost(arcaniste(20, 1))).toBe(35);
        expect(arcanumFusionCost(arcaniste(5, 6))).toBe(10);
        expect(arcanumFusionCost(arcaniste(5, 0))).toBe(40);
    });

    it('cycle Lié → Fusionné → Renvoi → Lié, sans renvoi : Fusionné → Lié', () => {
        expect(nextArcanumState('lie', true)).toBe('fusionne');
        expect(nextArcanumState('fusionne', true)).toBe('renvoi');
        expect(nextArcanumState('renvoi', true)).toBe('lie');
        expect(nextArcanumState('fusionne', false)).toBe('lie');
    });
});

// spec_fabula.md §11.1 : un PJ a 0 + les modificateurs de l'équipement porté
describe('initiative des PJ', () => {
    const item = (modInitiative, emplacementEquipe) => ({ modInitiative, emplacementEquipe });

    it('sans équipement : 0, quels que soient les dés DEX et INT', () => {
        expect(computeDerivedStats(hero({ dexDe: 12, intDe: 12, equipment: [] })).initiative).toBe(0);
    });

    it('modificateurs de l\'équipement porté additionnés, négatif possible, sac ignoré', () => {
        const equipment = [item(-2, 'armure'), item(1, 'accessoire'), item(4, null)];
        expect(computeDerivedStats(hero({ equipment })).initiative).toBe(-1);
    });
});
