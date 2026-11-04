// src/server/db/modules/board.js
// ─────────────────────────────────────────────────────────────────────────────
// Base du module tableau (documentations/spec_tableau.md §10.1) : database/board.db,
// hors des bases des slugs. Même forme qu'une config de slug ({ slug, dbPath,
// schemaPath }), chargée seule par getModuleConfig('board') (db/moduleConfig.js).
// ─────────────────────────────────────────────────────────────────────────────

const path = require('path');

const ROOT = path.join(__dirname, '../../../..');

module.exports = {
    slug:       'board',
    label:      'Tableau',
    dbPath:     path.join(ROOT, 'database/board.db'),
    schemaPath: path.join(ROOT, 'database-template/board-schema.sql'),
};
