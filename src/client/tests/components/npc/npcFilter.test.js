// tests/components/npc/npcFilter.test.js
// Filtre de la bibliothèque des PNJ par étiquettes (spec_pnj.md §6.7) : groupes qui
// s'additionnent, étiquettes hors groupe cumulées, nombres selon le filtre en cours.
import { describe, it, expect } from 'vitest';
import { filterNpcs, tagCounts } from '../../../src/components/npc/npcFilter.js';

const npcs = [
    { nom: 'Garde',      tags: ['Mineur', 'Harkonnen'] },
    { nom: 'Sardaukar',  tags: ['Notable', 'Corrino', 'Archétype'] },
    { nom: 'Contrebandier', tags: ['Notable', 'Archétype'] },
    { nom: 'Feyd',       tags: ['Majeur', 'Harkonnen'] },
];
const groupOf = new Map([['Mineur', 0], ['Notable', 0], ['Majeur', 0], ['Harkonnen', 1], ['Corrino', 1]]);
const f = (selected) => ({ groupOf, groupCount: 2, selected });
const names = (list) => list.map(n => n.nom);

describe('PNJ : filtre par étiquettes', () => {
    it('dans un groupe, les étiquettes s\'additionnent', () => {
        expect(names(filterNpcs(npcs, f(['Mineur', 'Majeur'])))).toEqual(['Garde', 'Feyd']);
    });
    it('entre groupes, une fiche doit répondre aux deux', () => {
        expect(names(filterNpcs(npcs, f(['Notable', 'Majeur', 'Harkonnen'])))).toEqual(['Feyd']);
    });
    it('hors groupe, les étiquettes se cumulent', () => {
        expect(names(filterNpcs(npcs, f(['Archétype', 'Notable'])))).toEqual(['Sardaukar', 'Contrebandier']);
    });
    it('les nombres suivent le filtre en cours', () => {
        const counts = tagCounts(npcs, f(['Harkonnen']), ['Mineur', 'Notable', 'Majeur', 'Harkonnen', 'Corrino', 'Archétype']);
        // Rang : parmi les Harkonnen ; Faction : la sélection de son groupe est ignorée (Corrino s'ajouterait)
        expect(Object.fromEntries(counts)).toEqual({ Mineur: 1, Notable: 0, Majeur: 1, Harkonnen: 2, Corrino: 1, Archétype: 0 });
    });
    it('la recherche limite aussi les nombres', () => {
        const counts = tagCounts(npcs, { ...f([]), matches: n => n.nom.startsWith('S') }, ['Notable', 'Archétype']);
        expect(Object.fromEntries(counts)).toEqual({ Notable: 1, Archétype: 1 });
    });
});
