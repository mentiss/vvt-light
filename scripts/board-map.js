// scripts/board-map.js
// ─────────────────────────────────────────────────────────────────────────────
// Découpe d'une grande carte en tuiles pour le tableau (diapositive carte,
// documentations/plateforme/spec_tableau.md §17.1, §17.2), sur le poste du MJ.
//
// Usage :
//   npm run board-map -- "<image>" --name trondelag [--label "Trøndelag"] [--send]
//   npm run board-map -- --name trondelag --send     → envoie une carte déjà découpée
//
// - Écrit storage/maps/<nom>/ (ou BOARD_MAPS_DIR) : map.json et <z>/<x>_<y>.webp,
//   tuiles de 512 px en WebP, du niveau 0 (toute la carte dans une tuile) au niveau
//   levels - 1 (pleine résolution). Une carte du même nom est remplacée.
// - --send : envoie la carte sur le VPS (accès de deploy.config.json, comme la
//   release), dans <appDir>/storage/maps/<nom> (ou la clé facultative mapsDir),
//   mise en place d'un bloc à la place de l'ancienne. Jamais automatique.
// - sharp n'est qu'une dépendance de développement : ce script ne tourne pas sur le VPS.
// ─────────────────────────────────────────────────────────────────────────────

require('dotenv').config();
const fs   = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { mapsDir, isMapName } = require('../src/server/utils/boardMaps');
const { readDeployConfig, quote, ssh } = require('./lib/remote');

const TILE_SIZE = 512;
const QUALITY = 85;

// ─── Arguments ───────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const valueAfter = (flag) => { const i = args.indexOf(flag); return i >= 0 ? args[i + 1] : undefined; };
const name  = valueAfter('--name');
const label = valueAfter('--label');
const send  = args.includes('--send');
const input = args.find((a, i) => !a.startsWith('--') && !['--name', '--label'].includes(args[i - 1]));

function fail(message) {
    console.error(`\n❌ ${message}\n`);
    process.exit(1);
}

// ─── Découpe ─────────────────────────────────────────────────────────────────

/** Nombre de niveaux : le niveau 0 tient dans une tuile (§17.1) */
const levelCount = (width, height) => Math.max(0, Math.ceil(Math.log2(Math.max(width, height) / TILE_SIZE))) + 1;

/** Date de découpe AAAAMMJJhhmmss : version de la carte, dans l'adresse des tuiles */
const versionStamp = () => new Date().toISOString().replace(/\D/g, '').slice(0, 14);

async function cut(imagePath, outDir) {
    const sharp = require('sharp');
    // Image décodée une fois, en mémoire brute (RGBA) : chaque niveau en est réduit
    const source = sharp(imagePath, { limitInputPixels: false }).ensureAlpha();
    const { data, info } = await source.raw().toBuffer({ resolveWithObject: true });
    const { width, height } = info;
    const levels = levelCount(width, height);
    console.log(`   ${width} × ${height} px, ${levels} niveaux`);

    let tiles = 0;
    for (let z = levels - 1; z >= 0; z--) {
        const factor = 2 ** (levels - 1 - z);
        const w = Math.ceil(width / factor);
        const h = Math.ceil(height / factor);
        const level = factor === 1
            ? { data, width, height }
            : { data: await sharp(data, { raw: info }).resize(w, h, { fit: 'fill' }).raw().toBuffer(), width: w, height: h };
        const raw = { width: level.width, height: level.height, channels: info.channels };
        const dir = path.join(outDir, String(z));
        fs.mkdirSync(dir, { recursive: true });
        const cols = Math.ceil(level.width / TILE_SIZE);
        const rows = Math.ceil(level.height / TILE_SIZE);
        for (let x = 0; x < cols; x++) {
            for (let y = 0; y < rows; y++) {
                const left = x * TILE_SIZE;
                const top = y * TILE_SIZE;
                await sharp(level.data, { raw })
                    .extract({ left, top, width: Math.min(TILE_SIZE, level.width - left), height: Math.min(TILE_SIZE, level.height - top) })
                    .webp({ quality: QUALITY })
                    .toFile(path.join(dir, `${x}_${y}.webp`));
                tiles += 1;
            }
        }
        console.log(`   niveau ${z} : ${cols} × ${rows} tuiles`);
    }

    const manifest = { name, label: label || name, width, height, tileSize: TILE_SIZE, levels, version: versionStamp() };
    fs.writeFileSync(path.join(outDir, 'map.json'), `${JSON.stringify(manifest, null, 2)}\n`);
    return tiles;
}

/** Taille d'un dossier, en octets */
const folderSize = (dir) => fs.readdirSync(dir, { withFileTypes: true })
    .reduce((sum, d) => sum + (d.isDirectory() ? folderSize(path.join(dir, d.name)) : fs.statSync(path.join(dir, d.name)).size), 0);

// ─── Envoi ───────────────────────────────────────────────────────────────────

async function sendMap(mapDir) {
    const config = readDeployConfig(['host', 'user', 'appDir']);
    const remoteDir = config.mapsDir || `${config.appDir}/storage/maps`;
    // Archive à côté de la carte, nommée en relatif : le tar de Git Bash lit « C: » comme un hôte distant
    const archiveName = `.board-map-${name}.tar.gz`;
    const archive = path.join(path.dirname(mapDir), archiveName);
    const tar = spawnSync('tar', ['-czf', archiveName, name], { cwd: path.dirname(mapDir), stdio: 'inherit' });
    if (tar.status !== 0) throw new Error('Échec de l\'archive');
    console.log(`   archive : ${(fs.statSync(archive).size / 1024 / 1024).toFixed(1)} Mo`);

    // Extraction dans un dossier temporaire, puis la carte remplace l'ancienne d'un bloc
    const target = `${remoteDir}/${name}`;
    const incoming = `${remoteDir}/.incoming-${name}`;
    try {
        await ssh(config, [
            'set -e',
            `mkdir -p ${quote(remoteDir)}`,
            `rm -rf ${quote(incoming)}`,
            `mkdir -p ${quote(incoming)}`,
            `tar -xzf - -C ${quote(incoming)}`,
            `rm -rf ${quote(`${target}.old`)}`,
            `if [ -d ${quote(target)} ]; then mv ${quote(target)} ${quote(`${target}.old`)}; fi`,
            `mv ${quote(`${incoming}/${name}`)} ${quote(target)}`,
            `rm -rf ${quote(`${target}.old`)} ${quote(incoming)}`,
        ].join(' && '), archive);
    } finally {
        fs.rmSync(archive, { force: true });
    }
    console.log(`   envoyée dans ${target}`);
}

// ─── Point d'entrée ──────────────────────────────────────────────────────────

(async () => {
    if (!isMapName(name)) fail('--name attendu : 1 à 64 caractères parmi a-z, 0-9 et « - » (ex. --name trondelag).');
    if (!input && !send) fail('Image attendue : npm run board-map -- "<image>" --name <nom> [--label "<libellé>"] [--send]');
    const mapDir = path.join(mapsDir(), name);

    if (input) {
        if (!fs.existsSync(input)) fail(`Image introuvable : ${input}`);
        console.log(`\n▶ Découpe de ${path.basename(input)} → ${mapDir}`);
        // Découpe dans un dossier voisin, puis remplacement de l'ancienne carte
        const work = `${mapDir}.tmp`;
        fs.rmSync(work, { recursive: true, force: true });
        fs.mkdirSync(work, { recursive: true });
        try {
            const tiles = await cut(input, work);
            fs.rmSync(mapDir, { recursive: true, force: true });
            fs.renameSync(work, mapDir);
            console.log(`   ${tiles} tuiles, ${(folderSize(mapDir) / 1024 / 1024).toFixed(1)} Mo`);
        } catch (error) {
            fs.rmSync(work, { recursive: true, force: true });
            fail(`Découpe impossible : ${error.message}`);
        }
    }

    if (send) {
        if (!fs.existsSync(path.join(mapDir, 'map.json'))) fail(`Carte « ${name} » absente en local : découpe-la d'abord.`);
        console.log('\n▶ Envoi sur le serveur');
        try {
            await sendMap(mapDir);
        } catch (error) {
            fail(error.message);
        }
    }
    console.log('\n✅ Terminé.\n');
})();
