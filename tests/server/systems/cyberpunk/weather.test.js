// tests/server/systems/cyberpunk/weather.test.js
// Météo de la table (spec_cyberpunk.md §3.1, Q-10) : 'auto' par défaut, écrite par
// le MJ seul, valeurs bornées, diffusée dans la room de la table.
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { startSlugApp, playerToken, gmToken } from '../../helpers/slugApp.js';

describe('cyberpunk : météo de la table', () => {
    let api, sessionId, charId;

    beforeAll(async () => {
        api = await startSlugApp('cyberpunk', 'weather');
        sessionId = api.db.prepare("INSERT INTO game_sessions (name, access_code, access_url) VALUES ('Sigma', 'SIGMA1', 'sigma-1')").run().lastInsertRowid;
        charId = api.db.prepare("INSERT INTO characters (access_code, access_url, player_name, nom) VALUES ('METEO1', 'meteo-1', 'joueur', 'Ines')").run().lastInsertRowid;
    });
    afterAll(() => api?.close());

    it('auto tant que le MJ n\'a rien choisi', async () => {
        const res = await api.request('GET', `/${sessionId}`, { token: playerToken(charId) });
        expect(res.body).toEqual({ sessionId, weather: 'auto' });
    });

    it('écriture réservée au MJ, diffusée à la table', async () => {
        expect((await api.request('PUT', `/${sessionId}`, { token: playerToken(charId), body: { weather: 'rain' } })).status).toBe(403);
        const res = await api.request('PUT', `/${sessionId}`, { token: gmToken(), body: { weather: 'smog' } });
        expect(res.body).toEqual({ sessionId, weather: 'smog' });
        expect(api.emits.at(-1)).toMatchObject({ room: `cyberpunk_session_${sessionId}`, event: 'cyberpunk-weather-update', payload: { weather: 'smog' } });
        expect((await api.request('GET', `/${sessionId}`, { token: playerToken(charId) })).body.weather).toBe('smog');
    });

    it('valeur inconnue : 400 ; table inconnue : 404', async () => {
        expect((await api.request('PUT', `/${sessionId}`, { token: gmToken(), body: { weather: 'neige' } })).status).toBe(400);
        expect((await api.request('PUT', '/9999', { token: gmToken(), body: { weather: 'rain' } })).status).toBe(404);
    });
});
