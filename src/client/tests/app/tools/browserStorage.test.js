// Stockage navigateur de la plateforme (spec_browser_storage.md §3)
import { describe, it, expect } from 'vitest';
import {
    PLATFORM_SCOPE, storageKey, tableScope, readStored, writeStored, removeStored, listStoredKeys, parseStored, subscribeStored,
} from '@/app/tools/browserStorage.js';
import { memoryStorage } from './memoryStorage.js';

const broken = {
    getItem: () => { throw new Error('bloqué'); }, setItem: () => { throw new Error('bloqué'); },
    removeItem: () => { throw new Error('bloqué'); }, key: () => null, get length() { throw new Error('bloqué'); },
};

describe('clés', () => {
    it('vtt:<portée>:<fonction>, pour la plateforme, un jeu, une table', () => {
        expect(storageKey(PLATFORM_SCOPE, 'dice')).toBe('vtt:platform:dice');
        expect(storageKey('vikings', 'theme')).toBe('vtt:vikings:theme');
        expect(storageKey(tableScope('vikings', 3), 'audio')).toBe('vtt:vikings:3:audio');
    });
});

describe('lecture et écriture', () => {
    it('enregistre { v, data } et relit la valeur', () => {
        const s = memoryStorage();
        expect(writeStored('vtt:platform:theme', { dark: true }, {}, s)).toBe(true);
        expect(JSON.parse(s.data['vtt:platform:theme'])).toEqual({ v: 1, data: { dark: true } });
        expect(readStored('vtt:platform:theme', {}, s)).toEqual({ dark: true });
    });

    it('complète un objet avec les valeurs par défaut', () => {
        const s = memoryStorage();
        writeStored('vtt:platform:audio', { panelOpen: true }, {}, s);
        expect(readStored('vtt:platform:audio', { defaults: { panelOpen: false, master: 100 } }, s)).toEqual({ panelOpen: true, master: 100 });
    });

    it('donne la valeur par défaut : clé absente, texte illisible, ancien format brut, valeur refusée', () => {
        const s = memoryStorage({ a: '{pas du json', b: 'dark', c: JSON.stringify({ v: 1, data: { mode: 'tordu' } }) });
        expect(readStored('absente', { defaults: 7 }, s)).toBe(7);
        expect(readStored('a', { defaults: 7 }, s)).toBe(7);
        expect(readStored('b', { defaults: 7 }, s)).toBe(7);
        expect(readStored('c', { defaults: { mode: 'panel' }, validate: d => ['panel', 'rail'].includes(d.mode) }, s)).toEqual({ mode: 'panel' });
        expect(readStored('absente', {}, s)).toBeNull();
    });

    it('convertit une autre version, ou repart des défauts sans conversion', () => {
        const raw = JSON.stringify({ v: 1, data: { volume: 0.5 } });
        expect(parseStored(raw, { version: 2, defaults: { volume: 100 } })).toEqual({ volume: 100 });
        expect(parseStored(raw, { version: 2, migrate: (d, from) => (from === 1 ? { volume: d.volume * 100 } : d) })).toEqual({ volume: 50 });
        expect(parseStored(raw, { version: 2, defaults: 'x', migrate: () => { throw new Error('casse'); } })).toBe('x');
    });

    it('efface et liste seulement les clés de la plateforme', () => {
        const s = memoryStorage({ autre: '1' });
        writeStored('vtt:platform:theme', { dark: false }, {}, s);
        writeStored('vtt:vikings:dice', {}, {}, s);
        expect(listStoredKeys(s).sort()).toEqual(['vtt:platform:theme', 'vtt:vikings:dice']);
        removeStored('vtt:vikings:dice', s);
        expect(listStoredKeys(s)).toEqual(['vtt:platform:theme']);
    });

    it('prévient les abonnés de la page à chaque écriture et effacement', () => {
        const s = memoryStorage();
        let calls = 0;
        const unsubscribe = subscribeStored('vtt:platform:audio', () => { calls += 1; });
        writeStored('vtt:platform:audio', {}, {}, s);
        removeStored('vtt:platform:audio', s);
        writeStored('vtt:platform:autre', {}, {}, s);
        unsubscribe();
        writeStored('vtt:platform:audio', {}, {}, s);
        expect(calls).toBe(2);
    });
});

describe('stockage indisponible (navigation privée, plein)', () => {
    it('ne lève jamais d’erreur et donne les valeurs par défaut', () => {
        expect(readStored('vtt:platform:theme', { defaults: { dark: false } }, broken)).toEqual({ dark: false });
        expect(writeStored('vtt:platform:theme', { dark: true }, {}, broken)).toBe(false);
        expect(() => removeStored('vtt:platform:theme', broken)).not.toThrow();
        expect(listStoredKeys(broken)).toEqual([]);
        expect(readStored('vtt:platform:theme', { defaults: 1 }, null)).toBe(1);
    });
});
