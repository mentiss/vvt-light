// src/server/migrate.js
// ─────────────────────────────────────────────────────────────────────────────
// Script de migration générique — multi-système.
// S'appuie sur le loader existant pour découvrir les BDD disponibles.
//
// Usage :
//   npm run migrate <filename.sql>
//       → applique la migration sur TOUS les systèmes enregistrés
//
//   npm run migrate <filename.sql> --system=vikings
//       → applique uniquement sur le système "vikings"
//
//   npm run migrate <filename.sql> --system=vikings,noctis
//       → applique sur une liste de systèmes
//
// Exemples :
//   npm run migrate 27022025_dice_history_generic.sql
//   npm run migrate 27022025_dice_history_generic.sql --system=vikings
// ─────────────────────────────────────────────────────────────────────────────

const fs   = require('fs');
const path = require('path');

const { loadAllSystems, getAllSystems } = require('./systems/Loader');
const { getDbForSystem }               = require('./db/index');

const MIGRATIONS_DIR = path.join(__dirname, '../../database-template/migrations');

// ─── Parse --system=xxx depuis argv ──────────────────────────────────────────

function parseSystemFilter() {
    // Cherche d'abord --system= (si appelé avec --)
    const flagArg = process.argv.find(a => a.startsWith('--system='));
    if (flagArg) return flagArg.replace('--system=', '').split(',').map(s => s.trim()).filter(Boolean);

    // Sinon, 3e argument positionnel (npm run migrate file.sql vikings)
    const positional = process.argv[3];
    if (positional && !positional.startsWith('-')) {
        return positional.split(',').map(s => s.trim()).filter(Boolean);
    }

    return null;
}

// ─── Applique une migration sur un système précis ────────────────────────────

function runMigrationOnSystem(system, migrationPath) {
    const db        = getDbForSystem(system);
    const migration = fs.readFileSync(migrationPath, 'utf8');

    console.log(`  🔄 [${system.slug}] Application...`);

    try {
        db.exec('PRAGMA foreign_keys = OFF;');
        db.exec('BEGIN TRANSACTION;');
        db.exec(migration);
        db.exec('COMMIT;');
        db.exec('PRAGMA foreign_keys = ON;');
        console.log(`  ✅ [${system.slug}] OK — BDD : ${system.dbPath}`);
    } catch (error) {
        try { db.exec('ROLLBACK;'); } catch (_) {}
        db.exec('PRAGMA foreign_keys = ON;');
        console.error(`  ❌ [${system.slug}] Échec : ${error.message}`);
        throw error;
    }
}

// ─── Point d'entrée ───────────────────────────────────────────────────────────

function main() {
    const filename = process.argv[2];

    if (!filename) {
        console.error('');
        console.error('❌ Usage : npm run migrate <filename.sql> [--system=slug1,slug2]');
        console.error('');
        console.error('Exemples :');
        console.error('  npm run migrate 27022025_dice_history_generic.sql');
        console.error('  npm run migrate 27022025_dice_history_generic.sql --system=vikings');
        console.error('  npm run migrate 27022025_dice_history_generic.sql --system=vikings,noctis');
        console.error('');
        process.exit(1);
    }

    const migrationPath = path.join(MIGRATIONS_DIR, filename);
    if (!fs.existsSync(migrationPath)) {
        console.error(`❌ Fichier introuvable : ${migrationPath}`);
        process.exit(1);
    }

    // Charger tous les systèmes déclarés (scanne systems/*/config.js)
    loadAllSystems();
    const allSystems   = getAllSystems(); // Map<slug, config>
    const systemFilter = parseSystemFilter();

    // Déterminer les cibles
    let targets;
    if (systemFilter) {
        targets = [];
        for (const slug of systemFilter) {
            const sys = allSystems.get(slug);
            if (!sys) {
                console.error(`❌ Système inconnu : "${slug}"`);
                console.error(`   Disponibles : ${[...allSystems.keys()].join(', ')}`);
                process.exit(1);
            }
            targets.push(sys);
        }
    } else {
        targets = [...allSystems.values()];
    }

    if (targets.length === 0) {
        console.error('❌ Aucun système trouvé. Vérifiez src/server/systems/*/config.js');
        process.exit(1);
    }

    console.log('');
    console.log('═══════════════════════════════════════════════');
    console.log(`🎲 Migration : ${filename}`);
    console.log(`   Systèmes  : ${targets.map(s => s.slug).join(', ')}`);
    console.log('═══════════════════════════════════════════════');
    console.log('');

    let hasError = false;

    for (const system of targets) {
        try {
            runMigrationOnSystem(system, migrationPath);
        } catch (_) {
            hasError = true;
            // Continue sur les autres systèmes pour rapport complet
        }
    }

    console.log('');

    if (hasError) {
        console.error(`❌ Migration échouée sur un ou plusieurs systèmes.`);
        process.exit(1);
    }

    console.log(`✅ "${filename}" appliquée sur ${targets.length} système(s).`);
    console.log('');
}

if (require.main === module) {
    main();
    process.exit(0);
}

module.exports = { runMigrationOnSystem };