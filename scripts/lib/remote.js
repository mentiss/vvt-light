// scripts/lib/remote.js
// ─────────────────────────────────────────────────────────────────────────────
// Accès au VPS partagés par les scripts qui y envoient quelque chose : la release
// (scripts/release.js) et l'envoi des cartes du tableau (scripts/board-map.js).
// Configuration : deploy.config.json à la racine (deploy.config.example.json).
// ─────────────────────────────────────────────────────────────────────────────

const fs    = require('fs');
const path  = require('path');
const { spawn } = require('child_process');

const CONFIG_FILE = path.join(__dirname, '../../deploy.config.json');

/**
 * Lit deploy.config.json et vérifie les clés demandées.
 * @param {string[]} requiredKeys
 * @returns {object} configuration
 * @throws {Error} fichier absent ou clé manquante (message prêt à afficher)
 */
function readDeployConfig(requiredKeys) {
    if (!fs.existsSync(CONFIG_FILE)) {
        throw new Error('deploy.config.json introuvable : copie deploy.config.example.json et renseigne-le.');
    }
    const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    for (const key of requiredKeys) {
        if (!config[key]) throw new Error(`deploy.config.json : clé « ${key} » manquante.`);
    }
    return config;
}

/** Valeur entre apostrophes pour une commande shell distante */
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

module.exports = { readDeployConfig, quote, ssh };
