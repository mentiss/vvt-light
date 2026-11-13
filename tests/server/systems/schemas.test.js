// tests/server/systems/schemas.test.js
// Conformité des schémas de slug (code-rules/back.md, B-SCHEMA-SHARED et B-FK) :
// une base neuve, créée depuis le schéma, doit fonctionner comme une base en
// service. Pour chaque slug : les tables partagées ont les colonnes de base.sql
// (colonnes en plus permises) et les mêmes ON DELETE ; characters a ses colonnes
// obligatoires et le compte MJ (id = -1) ; toute clé vers characters ou
// game_sessions déclare son ON DELETE. Spec : documentations/spec_correctifs_audit.md §9.
import { describe, it, expect } from 'vitest';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { listSlugs } from '../helpers/slugApp.js';

const require  = createRequire(import.meta.url);
const Database = require('better-sqlite3');
const Loader   = require('../../../src/server/systems/Loader.js');
const BASE_SQL = path.resolve(import.meta.dirname, '../../../database-template/base.sql');

const SHARED = ['game_sessions', 'session_characters', 'dice_history', 'character_journal', 'refresh_tokens', 'npcs', 'session_npcs', 'table_journal', 'table_journal_reads'];
const REQUIRED_CHARACTER_COLUMNS = ['access_code', 'access_url', 'player_name', 'avatar', 'login_attempts', 'last_attempt_at', 'last_accessed'];

// Écarts documentés (B-FK) : bases en service où supprimer un personnage garde ses jets, anonymes
const FK_EXCEPTIONS = new Set([
    'cyberpunk dice_history.character_id SET NULL',
    'dune dice_history.character_id SET NULL',
    'noctis dice_history.character_id SET NULL',
]);

function fromSql(file) {
    const db = new Database(':memory:');
    db.exec(fs.readFileSync(file, 'utf8'));
    return db;
}
const columns = (db, table) => db.prepare(`PRAGMA table_info(${table})`).all().map(c => c.name);
const foreignKeys = (db, table) => db.prepare(`PRAGMA foreign_key_list(${table})`).all();

const base = fromSql(BASE_SQL);

describe.each(listSlugs())('schéma %s', (slug) => {
    const db = fromSql(Loader.getSystem(slug).schemaPath);

    it.each(SHARED)('%s : colonnes et ON DELETE de base.sql', (table) => {
        const missing = columns(base, table).filter(c => !columns(db, table).includes(c));
        expect(missing).toEqual([]);

        // Chaque clé de base.sql existe, vers la même table, avec le même ON DELETE (ou un écart documenté)
        const actual = Object.fromEntries(foreignKeys(db, table).map(f => [f.from, f]));
        for (const ref of foreignKeys(base, table)) {
            const fk = actual[ref.from];
            expect(fk, `${table}.${ref.from} : clé vers ${ref.table} absente`).toBeTruthy();
            expect(fk.table).toBe(ref.table);
            if (fk.on_delete === ref.on_delete) continue;
            expect(FK_EXCEPTIONS.has(`${slug} ${table}.${fk.from} ${fk.on_delete}`),
                `${table}.${fk.from} : ${fk.on_delete} au lieu de ${ref.on_delete}`).toBe(true);
        }
    });

    it('characters : colonnes obligatoires, pas d\'avatar_url, compte MJ', () => {
        const cols = columns(db, 'characters');
        expect(REQUIRED_CHARACTER_COLUMNS.filter(c => !cols.includes(c))).toEqual([]);
        expect(cols).not.toContain('avatar_url');
        expect(db.prepare('SELECT id FROM characters WHERE id = -1').get()).toBeTruthy();
    });

    it('clés vers characters et game_sessions : ON DELETE déclaré', () => {
        const tables = db.prepare("SELECT name FROM sqlite_master WHERE type = 'table'").all().map(t => t.name);
        const undeclared = tables.flatMap(t => foreignKeys(db, t)
            .filter(f => ['characters', 'game_sessions'].includes(f.table) && f.on_delete === 'NO ACTION')
            .map(f => `${t}.${f.from}`));
        expect(undeclared).toEqual([]);
    });
});
