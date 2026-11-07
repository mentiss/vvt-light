// tests/server/systems/cyberpunk/lockedTags.test.js
// Tags verrouillés (spec_cyberpunk.md §9.8) : posés par une manœuvre, ils gardent
// leur verrou quand la fiche est réenvoyée sans le champ ; le mode Édition peut
// le lever explicitement.
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { startSlugApp, playerToken } from '../../helpers/slugApp.js';

describe('cyberpunk : tags verrouillés', () => {
    let api, id;

    beforeAll(async () => {
        api = await startSlugApp('cyberpunk');
        id = api.db.prepare("INSERT INTO characters (access_code, access_url, player_name, nom) VALUES ('LOCK01', 'lock-01', 'joueur', 'Vega')").run().lastInsertRowid;
    });
    afterAll(() => api?.close());

    const put = (body) => api.request('PUT', `/${id}`, { token: playerToken(id), body });

    it('enregistre le verrou et le renvoie en booléen', async () => {
        const res = await put({ tags: [
            { tag_text: '+contact : Faussaire', tag_variant: 'neutral', locked: true },
            { tag_text: '+blessé', tag_variant: 'negative' },
        ] });
        expect(res.status).toBe(200);
        expect(res.body.tags.map(t => t.locked)).toEqual([true, false]);
    });

    it('un tag réécrit sans le champ garde son verrou', async () => {
        const before = (await api.request('GET', `/${id}`, { token: playerToken(id) })).body.tags;
        const res = await put({ tags: before.map(({ locked: _locked, ...t }) => ({ ...t, tag_text: t.tag_text + ' (modifié)' })) });
        expect(res.body.tags.map(t => t.locked)).toEqual([true, false]);
        expect(res.body.tags[0].tag_text).toBe('+contact : Faussaire (modifié)');
    });

    it('manœuvre prise avec l\'XP : son tag arrive verrouillé, sur la console du personnage seulement', async () => {
        const move = api.db.prepare("SELECT id FROM moves WHERE type = 'official' AND playbook = 'Netrunner' AND name = 'Daemon'").get();
        const deck = api.db.prepare("INSERT INTO character_cyberware (character_id, name) VALUES (?, 'Cyberconsole intégrée (Deck)')").run(id).lastInsertRowid;
        const other = api.db.prepare("INSERT INTO characters (access_code, access_url, player_name, nom) VALUES ('LOCK02', 'lock-02', 'autre', 'Zed')").run().lastInsertRowid;
        const foreign = api.db.prepare("INSERT INTO character_cyberware (character_id, name) VALUES (?, 'Cyberconsole intégrée (Deck)')").run(other).lastInsertRowid;

        const patch = (moveTag) => api.request('PATCH', `/${id}/xp`, { token: playerToken(id), body: { moveId: move.id, action: 'add', moveTag } });
        let res = await patch({ tag_text: '+Daemon caméra', entityType: 'cyberware', entityId: deck });
        expect(res.status).toBe(200);
        expect(res.body.cyberware.find(c => c.id === deck).tags).toContainEqual(expect.objectContaining({ tag_text: '+Daemon caméra', locked: true }));

        // Implant d'un autre personnage : le tag retombe sur le personnage
        res = await patch({ tag_text: '+Daemon fantôme', entityType: 'cyberware', entityId: foreign });
        expect(res.body.tags).toContainEqual(expect.objectContaining({ tag_text: '+Daemon fantôme', locked: true }));
        expect(api.db.prepare("SELECT COUNT(*) n FROM tags WHERE entity_type = 'cyberware' AND entity_id = ?").get(foreign).n).toBe(0);
    });

    it('le verrou se lève explicitement', async () => {
        const before = (await api.request('GET', `/${id}`, { token: playerToken(id) })).body.tags;
        const res = await put({ tags: before.map(t => ({ ...t, locked: false })) });
        expect(res.body.tags.every(t => t.locked === false)).toBe(true);
    });
});
