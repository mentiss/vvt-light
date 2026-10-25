// src/client/tests/tools/catalog.test.js
// Modale de catalogue générique (spec_ui_catalogue.md §8) : recherche dans le
// texte des objets, rangées de filtres, options déduites, groupement.

import { describe, it, expect } from 'vitest';
import { filterCatalog, filterOptions, groupCatalog, searchableText } from '../../src/tools/catalog.js';

const ITEMS = [
    { name: 'Épée longue',  type: 'Mêlée',   faction: 'allies', damage: 15, tags: [{ text: 'Tranchant' }] },
    { name: 'Luger P08',    type: 'Pistolet', faction: 'axis',   damage: 3,  notes: 'Arme de poing standard' },
    { name: 'Colt M1911',   type: 'Pistolet', faction: 'allies', damage: 4 },
    { name: 'Couteau',      type: 'Mêlée',   faction: 'axis',   damage: 2,  description: 'Lame de combat' },
];

const FILTERS = [
    { key: 'type',    getValue: it => it.type },
    { key: 'faction', getValue: it => it.faction },
];

const names = (items) => items.map(it => it.name);

describe('filterCatalog : recherche', () => {
    it('ignore la casse et les accents', () => {
        expect(names(filterCatalog(ITEMS, { query: 'EPEE' }))).toEqual(['Épée longue']);
    });

    it('cherche dans tous les textes, champs imbriqués compris', () => {
        expect(names(filterCatalog(ITEMS, { query: 'tranchant' }))).toEqual(['Épée longue']);
        expect(names(filterCatalog(ITEMS, { query: 'poing' }))).toEqual(['Luger P08']);
    });

    it('ignore les nombres', () => {
        expect(filterCatalog(ITEMS, { query: '15' })).toEqual([]);
    });

    it('se limite aux champs demandés', () => {
        expect(filterCatalog(ITEMS, { query: 'lame', searchFields: ['name'] })).toEqual([]);
        expect(names(filterCatalog(ITEMS, { query: 'lame', searchFields: ['name', 'description'] }))).toEqual(['Couteau']);
    });

    it('rend tout quand la recherche est vide ou blanche', () => {
        expect(filterCatalog(ITEMS, { query: '   ' })).toHaveLength(4);
        expect(filterCatalog(ITEMS)).toHaveLength(4);
    });
});

describe('filterCatalog : filtres', () => {
    it('combine deux rangées', () => {
        const result = filterCatalog(ITEMS, { filters: FILTERS, selected: { type: 'Pistolet', faction: 'allies' } });
        expect(names(result)).toEqual(['Colt M1911']);
    });

    it('ignore une rangée désactivée (null)', () => {
        const result = filterCatalog(ITEMS, { filters: FILTERS, selected: { type: 'Mêlée', faction: null } });
        expect(names(result)).toEqual(['Épée longue', 'Couteau']);
    });

    it('combine filtres et recherche', () => {
        const result = filterCatalog(ITEMS, { query: 'colt', filters: FILTERS, selected: { faction: 'axis' } });
        expect(result).toEqual([]);
    });

    it('accepte un catalogue vide', () => {
        expect(filterCatalog([], { query: 'x', filters: FILTERS, selected: { type: 'Mêlée' } })).toEqual([]);
    });
});

describe('filterOptions', () => {
    it('déduit les options des objets, dans l\'ordre d\'apparition et sans doublon', () => {
        expect(filterOptions(ITEMS, FILTERS[0])).toEqual([
            { value: 'Mêlée', label: 'Mêlée' },
            { value: 'Pistolet', label: 'Pistolet' },
        ]);
    });

    it('ignore les valeurs absentes', () => {
        expect(filterOptions([{ name: 'a' }, { name: 'b', type: 'x' }], FILTERS[0])).toEqual([{ value: 'x', label: 'x' }]);
    });

    it('garde les options fournies par le slug', () => {
        const options = [{ value: 'axis', label: 'Axe' }];
        expect(filterOptions(ITEMS, { ...FILTERS[1], options })).toBe(options);
    });
});

describe('groupCatalog', () => {
    it('regroupe dans l\'ordre d\'apparition', () => {
        const groups = groupCatalog(ITEMS, it => it.type);
        expect(groups.map(g => g.value)).toEqual(['Mêlée', 'Pistolet']);
        expect(names(groups[0].items)).toEqual(['Épée longue', 'Couteau']);
    });
});

describe('searchableText', () => {
    it('normalise et assemble les textes', () => {
        expect(searchableText({ name: 'Épée', n: 3, sub: { a: 'Été' } })).toBe('epee ete');
    });
});
