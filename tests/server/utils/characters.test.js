// tests/server/utils/characters.test.js
// Nom affiché d'un personnage (barre de session, listes de table) : getCharNameExpr.
// Défaut corrigé : un prénom NULL rendait toute l'expression NULL (repli sur le nom du joueur).

import { describe, it, expect } from 'vitest';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const Database = require('better-sqlite3');
const { getCharNameExpr } = require('../../../src/server/utils/characters.js');

const displayName = (row) => {
    const db = new Database(':memory:');
    db.exec('CREATE TABLE characters (id INTEGER PRIMARY KEY, player_name TEXT, nom TEXT, prenom TEXT)');
    db.prepare('INSERT INTO characters (player_name, nom, prenom) VALUES (?, ?, ?)').run(row.player, row.nom, row.prenom);
    const name = db.prepare(`SELECT (${getCharNameExpr(db)}) AS n FROM characters c`).get().n;
    db.close();
    return name;
};

describe('getCharNameExpr', () => {
    it('donne le nom seul quand le prénom est absent (Vampire)', () => {
        expect(displayName({ player: 'test', nom: 'Lalala', prenom: null })).toBe('Lalala');
    });
    it('assemble prénom et nom', () => {
        expect(displayName({ player: 'test', nom: 'Atréides', prenom: 'Paul' })).toBe('Paul Atréides');
    });
    it('donne le prénom seul quand le nom est vide', () => {
        expect(displayName({ player: 'test', nom: '', prenom: 'Ragnar' })).toBe('Ragnar');
    });
    it('rend une chaîne vide sans nom ni prénom (l\'appelant se replie sur le joueur)', () => {
        expect(displayName({ player: 'test', nom: null, prenom: null })).toBe('');
    });
});
