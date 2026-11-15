// src/server/utils/boardMaps.js
// ─────────────────────────────────────────────────────────────────────────────
// Cartes en tuiles du tableau (documentations/plateforme/spec_tableau.md §17) :
// dossier des cartes, lecture de leur manifeste, liste.
//
// Une carte est un dossier <nom>/ du dossier des cartes, produit par
// scripts/board-map.js : map.json { name, label, width, height, tileSize, levels,
// version } et les tuiles <z>/<x>_<y>.webp. Le dossier n'est ni dans la release ni
// dans database/ : BOARD_MAPS_DIR (.env), sinon storage/maps/ à la racine de l'app.
// Les tuiles sont servies telles quelles par server.js (/board-maps).
// ─────────────────────────────────────────────────────────────────────────────

const fs = require('fs');
const path = require('path');

const MAP_NAME = /^[a-z0-9-]{1,64}$/;
const DEFAULT_DIR = path.join(__dirname, '../../../storage/maps');

const cache = new Map();   // nom → { mtimeMs, map } : manifeste relu seulement s'il a changé

/** Dossier des cartes (lu à chaque appel : les tests le changent) */
const mapsDir = () => process.env.BOARD_MAPS_DIR || DEFAULT_DIR;

const isMapName = (name) => typeof name === 'string' && MAP_NAME.test(name);
const isPositiveInt = (value) => Number.isInteger(value) && value > 0;

/** Manifeste vérifié, ou null s'il est illisible ou incohérent */
function cleanManifest(name, raw) {
    const { label, width, height, tileSize, levels, version } = raw ?? {};
    if (![width, height, tileSize, levels].every(isPositiveInt) || levels > 20) return null;
    return {
        name,
        label: typeof label === 'string' && label.trim() ? label.trim().slice(0, 100) : name,
        width, height, tileSize, levels,
        version: String(version ?? ''),
    };
}

/**
 * Carte d'après son nom : { name, label, width, height, tileSize, levels, version },
 * ou null si le nom est invalide, le dossier absent ou le manifeste illisible.
 */
function readMap(name) {
    if (!isMapName(name)) return null;
    const file = path.join(mapsDir(), name, 'map.json');
    let stat;
    try { stat = fs.statSync(file); } catch { cache.delete(name); return null; }
    const cached = cache.get(name);
    if (cached && cached.file === file && cached.mtimeMs === stat.mtimeMs) return cached.map;
    let map = null;
    try { map = cleanManifest(name, JSON.parse(fs.readFileSync(file, 'utf8'))); } catch { map = null; }
    cache.set(name, { file, mtimeMs: stat.mtimeMs, map });
    return map;
}

/** Cartes présentes dans le dossier, triées par libellé */
function listMaps() {
    let names = [];
    try {
        names = fs.readdirSync(mapsDir(), { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name);
    } catch {
        return [];   // pas encore de dossier : aucune carte
    }
    return names.map(readMap).filter(Boolean).sort((a, b) => a.label.localeCompare(b.label, 'fr'));
}

/** Carte d'une diapositive, telle qu'envoyée au client : null (libre), la carte, ou { name, missing } */
function slideMap(name) {
    if (!name) return null;
    return readMap(name) ?? { name, missing: true };
}

module.exports = { mapsDir, isMapName, readMap, listMaps, slideMap };
