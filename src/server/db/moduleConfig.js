// src/server/db/moduleConfig.js
// ─────────────────────────────────────────────────────────────────────────────
// Bases de module : le magasin d'une brique de la plateforme (audio, tableau…),
// hors des bases des slugs, sans être une base centrale de jeu
// (documentations/spec_audio.md §11.1).
//
// Une déclaration par base, dans db/modules/<nom>.js, de même forme qu'une config
// de slug ({ slug, dbPath, schemaPath }) : le pool de connexions (db/index.js),
// scripts/migrate.js, la release et install.sh la traitent comme une base de slug.
// getModuleConfig ne charge que la déclaration demandée.
// Une migration vise une base de module par son nom (« -- systems: audio ») ;
// « all » ne vise que les slugs. Le nom d'un module ne doit jamais être celui d'un slug.
// ─────────────────────────────────────────────────────────────────────────────

const fs = require('fs');
const path = require('path');

const MODULES_DIR = path.join(__dirname, 'modules');
const MODULE_NAME = /^[a-z][a-z0-9-]*$/;

/** Config de la base de module `name`, ou null si ce n'en est pas une. */
function getModuleConfig(name) {
    if (typeof name !== 'string' || !MODULE_NAME.test(name)) return null;
    const file = path.join(MODULES_DIR, `${name}.js`);
    return fs.existsSync(file) ? require(file) : null;
}

/** Noms des bases de module déclarées (messages d'erreur, listes). */
function listModules() {
    return fs.readdirSync(MODULES_DIR).filter(f => f.endsWith('.js')).map(f => f.slice(0, -3));
}

module.exports = { getModuleConfig, listModules };
