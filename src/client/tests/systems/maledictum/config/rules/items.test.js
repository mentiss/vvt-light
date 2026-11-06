// tests/systems/maledictum/config/rules/items.test.js
// Équipement de départ rattaché au catalogue : noms qui diffèrent du catalogue,
// libellés doubles, qualités entre parenthèses, libellés composés.
import { describe, it, expect } from 'vitest';
import { itemFromLabel, itemsFromLabels } from '../../../../../src/systems/maledictum/config/rules/items.js';

describe('équipement de départ', () => {
    it('noms du livre différents du catalogue, armure portée', () => {
        expect(itemFromLabel('Combinaison blindée')).toMatchObject({ itemKey: 'armoured_bodyglove', kind: 'armour', equipped: true });
        expect(itemFromLabel('Perle vox').itemKey).toBe('micro_bead_vox_bead');
        expect(itemFromLabel('Fusil de chasse (de combat)').itemKey).toBe('combat_shotgun');
    });
    it('qualités lues entre parenthèses', () => {
        const it = itemFromLabel('Lampe-torche (Médiocre)');
        expect(it.itemKey).toBe('glow_globe_stablight');
        expect(it.data.qualities).toEqual(['shoddy']);
    });
    it('libellé composé : une ligne par objet, sauf nom unique du catalogue', () => {
        expect(itemsFromLabels(['Pistolet laser et Épée tronçonneuse']).map(i => i.itemKey)).toEqual(['laspistol', 'chainsword']);
        expect(itemsFromLabels(['Pistolet laser avec Omnispex']).map(i => i.itemKey ?? i.name)).toEqual(['laspistol', 'Omnispex']);
        expect(itemsFromLabels(['Grappin et corde']).map(i => i.itemKey)).toEqual(['grapnel_line']);
        expect(itemsFromLabels(['Uniforme d\'officier'])).toHaveLength(1);
    });
});
