// src/server/systems/cyberpunk/routes/weather.js
// ─────────────────────────────────────────────────────────────────────────────
// Météo de la table (spec_cyberpunk.md §3.1, Q-10) : choisie par le MJ, suivie par
// les joueurs (le monde derrière l'interface). Montée sur /api/cyberpunk/weather.
//
// GET /:sessionId → { sessionId, weather }   ('auto' tant que rien n'est choisi)
// PUT /:sessionId { weather } → MJ seul ; diffuse cyberpunk-weather-update dans la room
// ─────────────────────────────────────────────────────────────────────────────

const express = require('express');
const router  = express.Router();

const { authenticate, requireGM } = require('../../../middlewares/auth');

const WEATHERS = ['auto', 'rain', 'smog', 'clear'];

const readWeather = (db, sessionId) =>
    db.prepare('SELECT weather FROM session_weather WHERE session_id = ?').get(sessionId)?.weather ?? 'auto';

router.get('/:sessionId', authenticate, (req, res) => {
    try {
        const sessionId = Number(req.params.sessionId);
        if (!Number.isInteger(sessionId)) return res.status(400).json({ error: 'Table invalide' });
        res.json({ sessionId, weather: readWeather(req.db, sessionId) });
    } catch (err) {
        console.error('[cyberpunk] GET /weather:', err);
        res.status(500).json({ error: 'Lecture de la météo impossible' });
    }
});

router.put('/:sessionId', authenticate, requireGM, (req, res) => {
    try {
        const sessionId = Number(req.params.sessionId);
        const { weather } = req.body ?? {};
        if (!Number.isInteger(sessionId)) return res.status(400).json({ error: 'Table invalide' });
        if (!WEATHERS.includes(weather)) return res.status(400).json({ error: 'Météo inconnue' });
        if (!req.db.prepare('SELECT id FROM game_sessions WHERE id = ?').get(sessionId)) {
            return res.status(404).json({ error: 'Table introuvable' });
        }

        req.db.prepare(`
            INSERT INTO session_weather (session_id, weather, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(session_id) DO UPDATE SET weather = excluded.weather, updated_at = CURRENT_TIMESTAMP
        `).run(sessionId, weather);

        const payload = { sessionId, weather };
        req.app.get('io')?.to(`cyberpunk_session_${sessionId}`).emit('cyberpunk-weather-update', payload);
        res.json(payload);
    } catch (err) {
        console.error('[cyberpunk] PUT /weather:', err);
        res.status(500).json({ error: 'Enregistrement de la météo impossible' });
    }
});

module.exports = router;
