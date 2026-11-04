// tests/tools/boardIcons.test.js
// Recherche et catégories de la bibliothèque d'icônes (documentations/spec_tableau.md §10.7)
import { describe, it, expect } from 'vitest';
import { iconGroups, iconName, searchIcons, svgInner, OTHER_GROUP } from '../../src/tools/boardIcons.js';

const index = {
    groups: [
        { label: 'Animal', tags: ['animal', 'mammal'] },
        { label: 'Fire', tags: ['fire'] },
    ],
    tags: { animal: 'Animal', mammal: 'Mammal', fire: 'Fire' },
    icons: [
        { id: 'delapouite/horse-head', tags: ['animal', 'mammal'] },
        { id: 'lorc/campfire', tags: ['fire'] },
        { id: 'lorc/wolf-head', tags: ['animal'] },
        { id: 'lorc/abacus', tags: [] },
    ],
};

describe('catégories', () => {
    it('groupes de l\'index, puis « Divers » pour les icônes sans tag', () => {
        expect(iconGroups(index)).toEqual(['Animal', 'Fire', OTHER_GROUP]);
        expect(iconGroups({ ...index, icons: index.icons.slice(0, 2) })).toEqual(['Animal', 'Fire']);
    });

    it('filtre par catégorie', () => {
        expect(searchIcons(index, { group: 'Animal' }).map(i => i.id)).toEqual(['delapouite/horse-head', 'lorc/wolf-head']);
        expect(searchIcons(index, { group: OTHER_GROUP }).map(i => i.id)).toEqual(['lorc/abacus']);
    });
});

describe('recherche', () => {
    it('sur le nom et les libellés des tags, tous les mots, sans casse', () => {
        expect(searchIcons(index, { query: 'Horse' }).map(i => i.id)).toEqual(['delapouite/horse-head']);
        expect(searchIcons(index, { query: 'mammal' }).map(i => i.id)).toEqual(['delapouite/horse-head']);
        expect(searchIcons(index, { query: 'head animal' })).toHaveLength(2);
        expect(searchIcons(index, { query: 'head', group: 'Fire' })).toHaveLength(0);
    });

    it('tout sans recherche ni catégorie', () => {
        expect(searchIcons(index)).toHaveLength(4);
    });
});

describe('utilitaires', () => {
    it('nom lisible, contenu sans la balise svg', () => {
        expect(iconName('delapouite/horse-head')).toBe('horse head');
        expect(svgInner('<svg xmlns="x" viewBox="0 0 512 512"><path d="M1"/></svg>')).toBe('<path d="M1"/>');
        expect(svgInner('pas un svg')).toBeNull();
    });
});
