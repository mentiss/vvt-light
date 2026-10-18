// src/server/utils/db.js
// Compatibilité descendante uniquement.
// Les nouvelles routes doivent utiliser req.db (injecté par systemResolver).
// getDb() retourne la connexion Vikings via le pool lazy.

const { getDbForSystem } = require('../db/index');
const { getSystem }      = require('../systems/Loader');
const { ensureUniqueCode } = require('./characters');

function getDb() {
    const system = getSystem('vikings');
    if (!system) throw new Error('[db.js] Vikings system not loaded');
    return getDbForSystem(system);
}

module.exports = { getDb, ensureUniqueCode };