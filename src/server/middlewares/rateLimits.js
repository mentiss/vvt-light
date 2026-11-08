const {authenticate} = require('./auth');

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

/**
 * Lit une date écrite par CURRENT_TIMESTAMP (« YYYY-MM-DD HH:MM:SS », UTC sans
 * fuseau) en millisecondes. new Date() la prendrait pour une heure locale.
 * @param {string|null} value
 * @returns {number|null}
 */
function parseSqliteUtc(value) {
    if (!value) return null;
    const iso = String(value).replace(' ', 'T');
    const ms = Date.parse(/(Z|[+-]\d\d:?\d\d)$/.test(iso) ? iso : `${iso}Z`);
    return Number.isNaN(ms) ? null : ms;
}

function loginRateLimiter(req, res, next) {
    const { code, characterUrl } = req.body;
    if(!code && !characterUrl) {
        return res.status(400).json({error: 'Missing required parameters'});
    }

    const db = req.db;
    const char = db.prepare(`SELECT * FROM characters WHERE access_url = ?`).get(characterUrl);

    if(!char) {
        return res.status(404).json({error: 'Character not found'});
    }

    const attempts = char.login_attempts || 0;
    const lastAttempt = parseSqliteUtc(char.last_attempt_at);

    if (lastAttempt !== null) {
        // Comparaison en millisecondes (B-DATE) : une Date contre une chaîne vaut toujours false
        const windowStart = Date.now() - WINDOW_MS;

        if (lastAttempt > windowStart && attempts >= MAX_ATTEMPTS) {
            return res.status(429).json({
                error: 'Too many login attempts. Please try again in 15 minutes.'
            });
        }

        // Reset si plus de 15 min
        if (lastAttempt <= windowStart) {
            db.prepare('UPDATE characters SET login_attempts = 0 WHERE id = ?').run(char.id);
            char.login_attempts = 0;
        }
    }

    req.targetCharacter = char;
    next();
}

module.exports = {loginRateLimiter};