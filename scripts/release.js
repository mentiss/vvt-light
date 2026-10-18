// scripts/release.js
// ─────────────────────────────────────────────────────────────────────────────
// Mise en production en une commande (voir documentations/spec_release.md).
// Fabrique une archive autonome (serveur, schémas/migrations, front buildé,
// install.sh), l'envoie sur le VPS par une seule connexion SSH et l'y installe.
//
// Usage :
//   npm run release                         → mineure (5.0.0 → 5.1.0)
//   npm run release -- --patch | --major
//   npm run release -- --fast               → saute lint et tests (hotfix)
//   npm run release -- --yes                → aucune confirmation (utilisé par /release)
//   npm run release -- --message-file=f.txt → message du commit de release
//   npm run release -- --rollback           → réinstalle l'archive précédente (sans migrations)
// ─────────────────────────────────────────────────────────────────────────────

const fs           = require('fs');
const path         = require('path');
const readline     = require('readline');
const { spawn, spawnSync } = require('child_process');

const ROOT           = path.join(__dirname, '..');
const CLIENT_DIR     = path.join(ROOT, 'src/client');
const MIGRATIONS_DIR = path.join(ROOT, 'database-template/migrations');
const RELEASED_FILE  = path.join(MIGRATIONS_DIR, 'released.txt');
const SYSTEMS_DIR    = path.join(ROOT, 'src/server/systems');
const CONFIG_FILE    = path.join(ROOT, 'deploy.config.json');
const TMP_DIR        = path.join(ROOT, 'release-tmp');

// Chemins qui partent dans l'archive (src/client/src compte pour les non-commités : il part via dist/)
const SHIPPED_PATHS = ['src/server', 'scripts', 'database-template', 'src/client/src', 'package.json', 'package-lock.json'];

// ─── Arguments ───────────────────────────────────────────────────────────────

const args     = process.argv.slice(2);
const has      = flag => args.includes(flag);
const valueOf  = name => (args.find(a => a.startsWith(`--${name}=`)) || '').split('=').slice(1).join('=') || null;

const opts = {
    bump:        has('--major') ? 'major' : has('--patch') ? 'patch' : 'minor',   // --minor accepté, c'est le défaut
    fast:        has('--fast'),
    yes:         has('--yes'),
    rollback:    has('--rollback'),
    messageFile: valueOf('message-file'),
};

// ─── Utilitaires ─────────────────────────────────────────────────────────────

function fail(message) {
    console.error(`\n❌ ${message}\n`);
    process.exit(1);
}

function step(message) {
    console.log(`\n▶ ${message}`);
}

/** Lance une commande en affichant sa sortie ; échoue si le code retour n'est pas 0. */
function run(command, cwd = ROOT, env = process.env) {
    const result = spawnSync(command, { cwd, env, stdio: 'inherit', shell: true });
    if (result.status !== 0) throw new Error(`Échec de « ${command} »`);
}

function git(gitArgs) {
    const result = spawnSync('git', gitArgs, { cwd: ROOT, encoding: 'utf8' });
    if (result.status !== 0) throw new Error(`git ${gitArgs.join(' ')} : ${result.stderr.trim()}`);
    return result.stdout;
}

async function confirm(question) {
    if (opts.yes) return true;
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const answer = await new Promise(resolve => rl.question(`${question} (o/N) `, resolve));
    rl.close();
    return /^o(ui)?$/i.test(answer.trim());
}

function loadConfig() {
    if (!fs.existsSync(CONFIG_FILE)) {
        fail('deploy.config.json introuvable : copie deploy.config.example.json et renseigne-le.');
    }
    const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    for (const key of ['host', 'user', 'appDir', 'pm2Name', 'healthUrl']) {
        if (!config[key]) fail(`deploy.config.json : clé « ${key} » manquante.`);
    }
    return config;
}

function bumpVersion(version, bump) {
    const [major, minor, patch] = version.split('.').map(Number);
    if (bump === 'major') return `${major + 1}.0.0`;
    if (bump === 'minor') return `${major}.${minor + 1}.0`;
    return `${major}.${minor}.${patch + 1}`;
}

/** Remplace la version dans package.json sans toucher au reste du fichier. */
function writeVersion(version) {
    const file    = path.join(ROOT, 'package.json');
    const content = fs.readFileSync(file, 'utf8');
    fs.writeFileSync(file, content.replace(/("version"\s*:\s*")[^"]*(")/, `$1${version}$2`));
}

// ─── Migrations ──────────────────────────────────────────────────────────────

/** "17102026_x.sql" → "20261017_x.sql" : clé de tri chronologique. */
function migrationSortKey(filename) {
    const match = filename.match(/^(\d{2})(\d{2})(\d{4})/);
    return match ? `${match[3]}${match[2]}${match[1]}${filename.slice(8)}` : filename;
}

/** Lit « -- systems: a,b » (ou « all ») dans le bloc de commentaires d'en-tête. */
function readSystems(filename) {
    const lines = fs.readFileSync(path.join(MIGRATIONS_DIR, filename), 'utf8').split(/\r?\n/);
    for (const line of lines) {
        if (line.trim() && !line.trim().startsWith('--')) break;
        const match = line.match(/^--\s*systems\s*:\s*(.+)$/i);
        if (match) return match[1].split(',').map(s => s.trim()).filter(Boolean);
    }
    return null;
}

function collectNewMigrations() {
    const released = fs.existsSync(RELEASED_FILE)
        ? new Set(fs.readFileSync(RELEASED_FILE, 'utf8').split(/\r?\n/).map(l => l.trim()).filter(Boolean))
        : new Set();

    const files = fs.readdirSync(MIGRATIONS_DIR)
        .filter(f => f.endsWith('.sql') && !released.has(f))
        .sort((a, b) => migrationSortKey(a).localeCompare(migrationSortKey(b)));

    const errors     = [];
    const migrations = files.map(file => {
        const systems = readSystems(file);
        if (!systems) {
            errors.push(`${file} : en-tête « -- systems: <slug,...|all> » manquant`);
        } else if (!(systems.length === 1 && systems[0] === 'all')) {
            for (const slug of systems) {
                if (!fs.existsSync(path.join(SYSTEMS_DIR, slug, 'config.js'))) {
                    errors.push(`${file} : système inconnu « ${slug} »`);
                }
            }
        }
        return { file, systems };
    });

    if (errors.length) fail(`Migrations invalides :\n   ${errors.join('\n   ')}`);
    return migrations;
}

// ─── Archive ─────────────────────────────────────────────────────────────────

function buildArchive(version, migrations) {
    const name     = `vtt-${version}`;
    const stageDir = path.join(TMP_DIR, name);
    fs.rmSync(TMP_DIR, { recursive: true, force: true });
    fs.mkdirSync(path.join(stageDir, 'src/client'), { recursive: true });

    fs.cpSync(path.join(ROOT, 'src/server'), path.join(stageDir, 'src/server'), { recursive: true });
    fs.cpSync(path.join(ROOT, 'scripts'), path.join(stageDir, 'scripts'), { recursive: true });   // migrate.js tourne sur le VPS
    fs.cpSync(path.join(ROOT, 'database-template'), path.join(stageDir, 'database-template'), { recursive: true });
    fs.cpSync(path.join(CLIENT_DIR, 'dist'), path.join(stageDir, 'src/client/dist'), { recursive: true });
    fs.copyFileSync(path.join(ROOT, 'package.json'), path.join(stageDir, 'package.json'));
    fs.copyFileSync(path.join(ROOT, 'package-lock.json'), path.join(stageDir, 'package-lock.json'));

    // install.sh tourne sous Linux : fins de ligne LF obligatoires
    const installSh = fs.readFileSync(path.join(__dirname, 'install.sh'), 'utf8').replace(/\r\n/g, '\n');
    fs.writeFileSync(path.join(stageDir, 'install.sh'), installSh);

    fs.writeFileSync(path.join(stageDir, 'release.json'), JSON.stringify({
        version,
        date: new Date().toISOString(),
        migrations,
    }, null, 2));

    // Chemins relatifs + cwd : compatible tar Windows (bsdtar) comme GNU tar de Git Bash
    const archive = path.join(TMP_DIR, `${name}.tar.gz`);
    const result  = spawnSync('tar', ['-czf', `../${name}.tar.gz`, '.'], { cwd: stageDir, stdio: 'inherit' });
    if (result.status !== 0) throw new Error('Échec de la création de l\'archive');
    return archive;
}

// ─── SSH ─────────────────────────────────────────────────────────────────────

const quote = value => `'${String(value).replace(/'/g, `'\\''`)}'`;

/** Lance une commande distante ; si `inputFile` est fourni, il est envoyé sur l'entrée standard. */
function ssh(config, remoteCommand, inputFile = null) {
    const sshArgs = ['-p', String(config.port || 22)];
    if (config.identityFile) sshArgs.push('-i', config.identityFile);
    sshArgs.push(`${config.user}@${config.host}`, remoteCommand);

    return new Promise((resolve, reject) => {
        const child = spawn('ssh', sshArgs, { stdio: [inputFile ? 'pipe' : 'inherit', 'inherit', 'inherit'] });
        if (inputFile) {
            // SSH peut fermer avant la fin de l'envoi (connexion refusée…) : c'est « close » qui conclut
            child.stdin.on('error', () => {});
            fs.createReadStream(inputFile).pipe(child.stdin);
        }
        child.on('error', reject);
        child.on('close', code => (code === 0 ? resolve() : reject(new Error(`SSH terminé avec le code ${code}`))));
    });
}

function installArgs(config) {
    return [config.appDir, config.pm2Name, config.healthUrl].map(quote).join(' ');
}

// ─── Points d'entrée ─────────────────────────────────────────────────────────

async function rollback(config) {
    console.log('\n⚠ Réinstallation de l\'archive précédente, sans restauration des bases.');
    if (!(await confirm('Continuer ?'))) fail('Annulé.');
    await ssh(config, `bash ${quote(`${config.appDir}/releases/install.sh`)} rollback ${installArgs(config)}`);
    console.log('\n✅ Rollback terminé.\n');
}

async function release(config) {
    if (!fs.existsSync(path.join(ROOT, 'package-lock.json'))) fail('package-lock.json introuvable à la racine.');

    // 1. Vérifications
    if (opts.fast) {
        step('Mode --fast : lint et tests sautés');
    } else {
        step('Lint');
        run('npm run lint', CLIENT_DIR);
        step('Tests');
        run('npm test', CLIENT_DIR);
    }

    // 2. Migrations
    step('Migrations');
    const migrations = collectNewMigrations();
    if (migrations.length === 0) console.log('   Aucune nouvelle migration.');
    for (const m of migrations) console.log(`   ${m.file}  →  ${m.systems.join(', ')}`);

    // 3. Fichiers non commités qui partent
    const dirty = git(['status', '--porcelain', '--', ...SHIPPED_PATHS]).trim();
    if (dirty) {
        step('Fichiers non commités inclus dans la release');
        console.log(dirty.split('\n').map(l => `   ${l}`).join('\n'));
        if (!(await confirm('Continuer avec ces fichiers ?'))) fail('Annulé.');
    }

    // 4. Récapitulatif
    const pkg        = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
    const oldVersion = pkg.version;
    const version    = bumpVersion(oldVersion, opts.bump);
    step(`Release v${version} (actuelle : v${oldVersion}) vers ${config.user}@${config.host}:${config.appDir}`);
    if (!(await confirm('Lancer la mise en production ?'))) fail('Annulé.');

    // 5 à 7. Version, build, archive, envoi et installation
    writeVersion(version);
    try {
        step('Build du front');
        run('npm run build', ROOT, { ...process.env, VITE_RELEASE_VERSION: version });

        step('Archive');
        const archive = buildArchive(version, migrations);
        console.log(`   ${path.relative(ROOT, archive)} (${(fs.statSync(archive).size / 1024 / 1024).toFixed(1)} Mo)`);

        step('Envoi et installation sur le serveur');
        const releasesDir = `${config.appDir}/releases`;
        const archiveName = `vtt-${version}.tar.gz`;
        const stagingDir  = `${releasesDir}/.staging-${version}`;
        await ssh(config, [
            'set -e',
            `mkdir -p ${quote(releasesDir)}`,
            `cat > ${quote(`${releasesDir}/${archiveName}`)}`,
            `rm -rf ${quote(stagingDir)}`,
            `mkdir -p ${quote(stagingDir)}`,
            `tar -xzf ${quote(`${releasesDir}/${archiveName}`)} -C ${quote(stagingDir)}`,
            `bash ${quote(`${stagingDir}/install.sh`)} install ${installArgs(config)} ${quote(stagingDir)}`,
        ].join(' && '), archive);
    } catch (error) {
        writeVersion(oldVersion);
        fail(`${error.message}\n   Version remise à v${oldVersion}, rien n'a été commité.`);
    }

    // 8. Liste des migrations parties, commit et tag
    step('Commit et tag');
    if (migrations.length) {
        const current = fs.existsSync(RELEASED_FILE) ? fs.readFileSync(RELEASED_FILE, 'utf8') : '';
        const eol     = current.includes('\r\n') ? '\r\n' : '\n';
        const prefix  = current && !current.endsWith('\n') ? eol : '';
        fs.writeFileSync(RELEASED_FILE, current + prefix + migrations.map(m => m.file).join(eol) + eol);
    }
    const message = opts.messageFile ? fs.readFileSync(opts.messageFile, 'utf8') : `Release v${version}`;
    const paths   = ['package.json', 'database-template/migrations/released.txt'];
    try {
        git(['add', '--', ...paths]);
        git(['commit', '-m', message, '--', ...paths]);
        git(['tag', `v${version}`]);
    } catch (error) {
        console.error(`⚠ La prod est à jour mais le commit ou le tag a échoué : ${error.message}`);
        process.exit(1);
    }

    fs.rmSync(TMP_DIR, { recursive: true, force: true });
    console.log(`\n✅ v${version} en production.\n`);
}

const config = loadConfig();
(opts.rollback ? rollback(config) : release(config)).catch(error => fail(error.message));
