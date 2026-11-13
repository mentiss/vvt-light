// src/client/tests/features/genmap/tools/presetFile.test.js
// Presets personnels et fichiers JSON du générateur de plans (spec_genmap.md §41, P-1, P-2).

import { describe, it, expect } from 'vitest';
import { copyPreset, emptyPreset, exportPreset, exportRecipe, freeId, readGenmapFile } from '@/features/genmap/tools/presetFile.js';
import { generate, resolvePreset } from '@/features/genmap/tools/generate.js';
import roomTypes from '@/features/genmap/data/roomTypes.json';
import inn from '@/features/genmap/data/presets/inn.json';
import manor from '@/features/genmap/data/presets/manor.json';

describe('presets personnels', () => {
    it('donne un identifiant libre et copie un preset fourni sans le toucher', () => {
        expect(freeId(['perso-1', 'perso-2'])).toBe('perso-3');
        const copy = copyPreset(inn, ['inn', 'perso-1']);
        expect(copy.id).toBe('perso-2');
        expect(copy.label).toBe('Auberge (copie)');
        expect(copy.personal).toBe(true);
        copy.rooms[0].quantity = 9;
        expect(inn.rooms[0].quantity).toBe(1);
    });

    it('part d\'un preset vide qui se génère', () => {
        const preset = emptyPreset([]);
        const { program, params } = resolvePreset(preset, roomTypes);
        expect(generate(program, { ...params, seed: 1 }).ok).toBe(true);
    });
});

describe('fichiers JSON', () => {
    it('relit un preset exporté', () => {
        const data = readGenmapFile(exportPreset(manor), roomTypes);
        expect(data.kind).toBe('preset');
        expect(data.preset).toEqual(manor);
    });

    it('refait exactement le même plan à partir d\'une recette (P-2)', () => {
        const { program, params } = resolvePreset(manor, roomTypes, { era: 'industrial' });
        const run = { ...params, density: 'balanced', seed: 1037 };
        const plan = generate(program, run);
        const data = readGenmapFile(exportRecipe({ preset: manor, params: run, seed: 1037, era: 'industrial', keep: [] }), roomTypes);
        expect(data.kind).toBe('recipe');
        const again = generate(resolvePreset(data.preset, roomTypes, { era: data.era }, data.keep).program, { ...data.params, seed: data.seed });
        expect(again).toEqual(plan);
    });

    it('refuse un fichier qui ne convient pas, avec un message lisible', () => {
        expect(() => readGenmapFile('pas du json', roomTypes)).toThrow('JSON valide');
        expect(() => readGenmapFile('{"a":1}', roomTypes)).toThrow('ni un preset ni une recette');
        const unknown = { ...inn, rooms: [{ type: 'teleporter', quantity: 1 }] };
        expect(() => readGenmapFile(exportPreset(unknown), roomTypes)).toThrow('teleporter');
        expect(() => readGenmapFile(exportPreset({ ...inn, rooms: [] }), roomTypes)).toThrow('aucune pièce');
    });
});
