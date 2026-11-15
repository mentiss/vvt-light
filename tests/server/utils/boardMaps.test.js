// tests/server/utils/boardMaps.test.js
// Cartes en tuiles du tableau (spec_tableau.md §17.3) : lecture du manifeste,
// manifeste invalide ignoré, nom hors motif refusé, liste triée, carte absente.

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const require = createRequire(import.meta.url);
const { readMap, listMaps, slideMap, isMapName } = require('../../../src/server/utils/boardMaps.js');

const dir = path.join(os.tmpdir(), `vtt-maps-test-${process.pid}`);
const previous = process.env.BOARD_MAPS_DIR;
const writeMap = (name, manifest) => {
    fs.mkdirSync(path.join(dir, name), { recursive: true });
    fs.writeFileSync(path.join(dir, name, 'map.json'), typeof manifest === 'string' ? manifest : JSON.stringify(manifest));
};

beforeAll(() => {
    process.env.BOARD_MAPS_DIR = dir;
    writeMap('trondelag', { label: 'Trøndelag', width: 6953, height: 5291, tileSize: 512, levels: 5, version: '1' });
    writeMap('alpha', { width: 100, height: 100, tileSize: 512, levels: 1, version: 2 });
    writeMap('cassee', '{ pas du json');
    writeMap('incoherente', { width: 0, height: 100, tileSize: 512, levels: 1 });
});

afterAll(() => {
    fs.rmSync(dir, { recursive: true, force: true });
    if (previous === undefined) delete process.env.BOARD_MAPS_DIR;
    else process.env.BOARD_MAPS_DIR = previous;
});

describe('boardMaps', () => {
    it('lit une carte ; libellé par défaut : son nom ; version en texte', () => {
        expect(readMap('trondelag')).toMatchObject({ name: 'trondelag', label: 'Trøndelag', width: 6953, levels: 5 });
        expect(readMap('alpha')).toMatchObject({ label: 'alpha', version: '2' });
    });

    it('manifeste illisible ou incohérent ignoré ; nom hors motif refusé', () => {
        expect(readMap('cassee')).toBeNull();
        expect(readMap('incoherente')).toBeNull();
        expect(isMapName('../database')).toBe(false);
        expect(readMap('../database')).toBeNull();
        expect(isMapName('Trondelag')).toBe(false);
    });

    it('liste les cartes valides, triées par libellé', () => {
        expect(listMaps().map(m => m.name)).toEqual(['alpha', 'trondelag']);
    });

    it('carte d\'une diapositive : null si libre, missing si absente', () => {
        expect(slideMap(null)).toBeNull();
        expect(slideMap('disparue')).toEqual({ name: 'disparue', missing: true });
        expect(slideMap('trondelag').width).toBe(6953);
    });
});
