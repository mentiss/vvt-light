// tests/server/systems/dune/characters.test.js
// Champs ajoutés par la refonte (spec_dune.md §3.2, Q-13 et Q-14) :
// identité de la feuille officielle, qualité et mots-clefs facultatifs des atouts,
// identifiants stables des sous-tables, une seule diffusion par table.
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { startSlugApp, playerToken } from '../../helpers/slugApp.js';

describe('dune : fiche (refonte)', () => {
    let api, charId;
    const put = (body) => api.request('PUT', `/${charId}`, { token: playerToken(charId), body });

    beforeAll(async () => {
        api = await startSlugApp('dune');
        const created = await api.request('POST', '/', { body: { playerName: 'Antoine', nom: 'ibn-Javid' } });
        charId = created.body.id;
        // Atout d'avant la refonte : ni qualité ni mots-clefs
        api.db.prepare("INSERT INTO character_items (character_id, nom, description, quantite) VALUES (?, 'Marteleur', '', 2)").run(charId);
        const sessionId = api.db.prepare("INSERT INTO game_sessions (name, access_code, access_url) VALUES ('Molay', 'TABLE1', 'table-1')").run().lastInsertRowid;
        api.db.prepare('INSERT INTO session_characters (session_id, character_id) VALUES (?, ?)').run(sessionId, charId);
    });
    afterAll(() => api?.close());

    it('identité : rôle, faction, traits, ambition enregistrés et relus', async () => {
        const res = await put({ role: "Maître d'armes", faction: 'Sietch Tabr', traitsPersonnalite: 'Casse-cou', ambition: 'Libérer Arrakis' });
        expect(res.status).toBe(200);
        expect(res.body).toMatchObject({ role: "Maître d'armes", faction: 'Sietch Tabr', traitsPersonnalite: 'Casse-cou', ambition: 'Libérer Arrakis', statutSocial: '' });
    });

    it('atouts : ancien atout sans qualité conservé tel quel, nouvel atout avec qualité et mots-clefs', async () => {
        const before = (await api.request('GET', `/${charId}`, { token: playerToken(charId) })).body;
        const old = before.items[0];
        expect(old).toMatchObject({ nom: 'Marteleur', quantite: 2, qualite: null, motsCles: '' });

        const res = await put({ items: [old, { nom: 'Krys', description: '', quantite: 1, qualite: 2, motsCles: 'Arme, Fremen' }] });
        expect(res.body.items).toHaveLength(2);
        expect(res.body.items[0]).toMatchObject({ id: old.id, nom: 'Marteleur', qualite: null });
        expect(res.body.items[1]).toMatchObject({ nom: 'Krys', qualite: 2, motsCles: 'Arme, Fremen' });
    });

    it('atouts : identifiants stables, qualité bornée de 0 à 4, retrait par absence', async () => {
        const [old, krys] = (await api.request('GET', `/${charId}`, { token: playerToken(charId) })).body.items;
        const res = await put({ items: [{ ...krys, quantite: 3, qualite: 9 }] });
        expect(res.body.items).toEqual([expect.objectContaining({ id: krys.id, quantite: 3, qualite: 4 })]);
        expect(res.body.items.some(i => i.id === old.id)).toBe(false);
    });

    it('talents : identifiants stables d’une sauvegarde à l’autre', async () => {
        const first = await put({ talents: [{ talentName: 'À pas de loup', description: 'Fremen' }] });
        const talent = first.body.talents[0];
        const second = await put({ talents: [{ ...talent, description: 'Marcher sans rythme' }] });
        expect(second.body.talents).toEqual([{ id: talent.id, talentName: 'À pas de loup', description: 'Marcher sans rythme' }]);
    });

    it('ajout de ligne : atout et talent renvoyés avec leur id, droits du propriétaire', async () => {
        const item = await api.request('POST', `/${charId}/items`, { token: playerToken(charId), body: { nom: 'Paracompas', qualite: 0, motsCles: 'Orientation' } });
        expect(item.status).toBe(201);
        expect(item.body).toMatchObject({ id: expect.any(Number), nom: 'Paracompas', quantite: 1, qualite: 0, motsCles: 'Orientation' });
        const talent = await api.request('POST', `/${charId}/talents`, { token: playerToken(charId), body: { talentName: 'Agile' } });
        expect(talent.body).toMatchObject({ id: expect.any(Number), talentName: 'Agile', description: '' });
        expect((await api.request('POST', `/${charId}/items`, { token: playerToken(charId), body: { nom: ' ' } })).status).toBe(400);
        expect((await api.request('POST', `/${charId}/items`, { token: playerToken(charId + 1), body: { nom: 'X' } })).status).toBe(403);
    });

    it('création : toute l’identité de l’assistant est enregistrée', async () => {
        const res = await api.request('POST', '/', { body: {
            playerName: 'Lea', nom: 'Molay', prenom: 'Kara', role: 'Héritière', faction: 'Maison Molay', motto: 'Le sable se souvient',
            competences: [{ key: 'combat', rang: 6, specialisation: 'Lame' }], principes: [{ key: 'foi', rang: 8, maxime: 'Je crois' }],
            items: [{ nom: 'Krys', quantite: 1, qualite: 1, motsCles: 'Arme' }],
        } });
        expect(res.status).toBe(201);
        expect(res.body).toMatchObject({ prenom: 'Kara', nom: 'Molay', role: 'Héritière', faction: 'Maison Molay', motto: 'Le sable se souvient' });
        expect(res.body.competences.find(c => c.key === 'combat')).toMatchObject({ rang: 6, specialisation: 'Lame' });
        expect(res.body.items[0]).toMatchObject({ nom: 'Krys', qualite: 1, motsCles: 'Arme' });
    });

    it('diffusion : une seule émission par table', async () => {
        api.emits.length = 0;
        await put({ ambition: 'Voir son peuple libre' });
        expect(api.emits.filter(e => e.event === 'character-full-update')).toHaveLength(1);
    });
});
