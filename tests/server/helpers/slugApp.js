// tests/server/helpers/slugApp.js
// ─────────────────────────────────────────────────────────────────────────────
// Banc de test des routes d'un slug, sans server.js (qui écoute dès son
// chargement) : le routeur réel est monté sur une petite app Express, avec
//   - une base SQLite en mémoire créée depuis le schéma du slug (jamais les
//     bases de database/),
//   - req.db / req.system injectés comme le fait systemResolver,
//   - un faux io qui enregistre les diffusions (io.to(room).emit),
//   - des jetons d'accès signés par utils/jwt (secret de tests/server/setup.js).
// Les modules serveur sont chargés par require, comme en production.
// ─────────────────────────────────────────────────────────────────────────────

import { createRequire } from 'node:module';
import fs from 'node:fs';

const require  = createRequire(import.meta.url);
const Database = require('better-sqlite3');
const express  = require('express');
const Loader   = require('../../../src/server/systems/Loader.js');
const { generateJWT } = require('../../../src/server/utils/jwt.js');

let systemsLoaded = false;

/** Slugs actifs, découverts par le Loader (zéro registre central). */
export function listSlugs() {
    if (!systemsLoaded) {
        Loader.loadAllSystems();
        systemsLoaded = true;
    }
    return [...Loader.getAllSystems().keys()];
}

/** Jeton d'accès d'un joueur (ou du MJ : characterId -1, isGM). */
export const playerToken = (characterId) => generateJWT({ characterId, isGM: false });
export const gmToken     = () => generateJWT({ characterId: -1, isGM: true });

/**
 * Démarre l'app de test d'un slug sur un port libre.
 * @param {string} slug
 * @param {string} [routeName]  routeur de systems/:slug/routes (défaut : characters)
 */
export async function startSlugApp(slug, routeName = 'characters') {
    listSlugs();
    const config = Loader.getSystem(slug);
    const db = new Database(':memory:');
    db.exec(fs.readFileSync(config.schemaPath, 'utf8'));
    db.pragma('foreign_keys = ON');   // comme src/server/db/index.js

    const emits = [];
    const io = { to: (room) => ({ emit: (event, payload) => emits.push({ room, event, payload }) }) };

    // /characters : même pile que server.js (route du slug s'il en a une, puis route commune)
    const routers = routeName === 'characters'
        ? Loader.getCharacterRouters(slug)
        : [Loader.getSystemRoute(slug, routeName)];
    const app = express();
    app.use(express.json({ limit: '20mb' }));
    app.set('io', io);
    app.use(`/${routeName}`, (req, res, next) => {
        req.db = db;
        req.system = config;
        next();
    }, ...routers);

    const server = await new Promise(resolve => {
        const s = app.listen(0, '127.0.0.1', () => resolve(s));
    });
    const baseUrl = `http://127.0.0.1:${server.address().port}/${routeName}`;

    // Routes déclarées par les routeurs, ex. « PATCH /:id »
    const routes = routers.flatMap(r => r.stack)
        .filter(layer => layer.route)
        .flatMap(layer => Object.keys(layer.route.methods).map(m => `${m.toUpperCase()} ${layer.route.path}`));

    /** Requête JSON ; renvoie { status, body }. */
    const request = async (method, path, { body, token } = {}) => {
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers.Authorization = `Bearer ${token}`;
        const res = await fetch(`${baseUrl}${path}`, {
            method, headers, body: body === undefined ? undefined : JSON.stringify(body),
        });
        const text = await res.text();
        let parsed = null;
        try { parsed = text ? JSON.parse(text) : null; } catch { parsed = text; }
        return { status: res.status, body: parsed };
    };

    const close = () => new Promise(resolve => {
        server.close(() => {
            db.close();
            resolve();
        });
    });

    return { slug, config, db, emits, routes, request, close };
}
