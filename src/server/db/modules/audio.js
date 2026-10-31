// src/server/db/modules/audio.js
// ─────────────────────────────────────────────────────────────────────────────
// Base du module audio (documentations/spec_audio.md §11.1) : database/audio.db,
// hors des bases des slugs. Même forme qu'une config de slug ({ slug, dbPath,
// schemaPath }), chargée seule par getModuleConfig('audio') (db/moduleConfig.js).
// ─────────────────────────────────────────────────────────────────────────────

const path = require('path');

const ROOT = path.join(__dirname, '../../../..');

module.exports = {
    slug:       'audio',
    label:      'Lecteur audio',
    dbPath:     path.join(ROOT, 'database/audio.db'),
    schemaPath: path.join(ROOT, 'database-template/audio-schema.sql'),
};
