// tests/server/routes/rights.test.js
// Droits des routes (code-rules/back.md, B-AUTH-USER) : toute route d'écriture
// (POST, PUT, PATCH, DELETE) des routeurs partagés et des slugs porte
// `authenticate`, sur la route ou par router.use. Exceptions : les routes
// publiques de la grille, et les chantiers en attente de refonte (combat, PNJ,
// noctis), auxquels la règle s'appliquera à leur refonte.
// Spec : documentations/spec_correctifs_audit.md §11.
import { describe, it, expect } from 'vitest';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { listSlugs } from '../helpers/slugApp.js';

const require = createRequire(import.meta.url);
const Loader = require('../../../src/server/systems/Loader.js');
const SERVER = path.resolve(import.meta.dirname, '../../../src/server');

// Routes publiques (B-AUTH-USER) : création, connexion, rafraîchissement, déconnexion
const PUBLIC = new Set([
    'auth POST /login', 'auth POST /refresh', 'auth POST /logout',
    'characters POST /',
]);

// Refonte en attente : combat et PNJ de la plateforme, slug noctis
const PENDING_SHARED = ['combat', 'npc', 'npc-sets'];
const PENDING_SLUGS = ['noctis'];

/** Routes d'écriture d'un routeur sans authenticate, au format « label MÉTHODE /chemin ». */
function unauthenticatedWrites(label, router) {
    const found = [];
    let routerAuth = false;
    for (const layer of router.stack) {
        if (!layer.route) {
            if (layer.handle?.name === 'authenticate') routerAuth = true;
            continue;
        }
        const names = layer.route.stack.map(l => l.handle.name);
        for (const method of Object.keys(layer.route.methods)) {
            if (method === 'get') continue;
            if (routerAuth || names.includes('authenticate')) continue;
            found.push(`${label} ${method.toUpperCase()} ${layer.route.path}`);
        }
    }
    return found;
}

describe('droits des routes', () => {
    it('toute route d\'écriture exige une connexion, hors routes publiques', () => {
        const slugs = listSlugs();
        const routers = [
            ['auth', require(path.join(SERVER, 'routes/auth.js'))],
            ['characters', require(path.join(SERVER, 'routes/characters.js'))],
            ...['sessions', 'journal', 'dice', 'audio', 'board'].map(r => [r, Loader.getSharedRoute(r)]),
        ];
        for (const slug of slugs.filter(s => !PENDING_SLUGS.includes(s))) {
            const own = path.join(SERVER, 'systems', slug, 'routes', 'characters.js');
            if (fs.existsSync(own)) routers.push([`${slug}/characters`, require(own)]);
            for (const { name, router } of Loader.getSystemExtraRoutes(slug)) routers.push([`${slug}/${name}`, router]);
        }

        const offenders = routers
            .flatMap(([label, router]) => unauthenticatedWrites(label, router))
            .filter(route => !PUBLIC.has(route));
        expect(offenders).toEqual([]);
    });

    it('les routeurs en attente de refonte existent toujours (sinon, retirer l\'exception)', () => {
        for (const r of PENDING_SHARED) expect(() => Loader.getSharedRoute(r)).not.toThrow();
        for (const s of PENDING_SLUGS) expect(listSlugs()).toContain(s);
    });
});
