// src/server/systems/woddavampire/CoterieController.js
// ─────────────────────────────────────────────────────────────────────────────
// Coterie : fiche du groupe, une par table de jeu (spec_woddavampire.md §20,
// §II.17.3). Règles des Historiques mis en commun (livre p. 181) :
//   - poolables : Alliés, Contacts, Domaine, Troupeau, Influence, Mentor
//     (décision maison), Ressources, Serviteurs ;
//   - un Historique ancre, fixé à la création ; aucun autre pool ne le dépasse ;
//     plafond 10 ;
//   - verser retire les points de la fiche ; retirer sa mise d'un Historique
//     rend un point de moins ; le Conteur ajuste par l'histoire (story_points).
//
// Contrat :
//   loadCoterie(db, sessionId)                         → coterie ou null
//   createCoterie(db, sessionId, { name, anchorKey })
//   updateCoterieTexts(db, sessionId, user, data)      → textes, emblème, détails (joueurs de la table, Conteur)
//   setStoryPoints(db, sessionId, backgroundKey, storyPoints)
//   contribute(db, sessionId, characterId, backgroundKey, points)
//   withdraw(db, sessionId, characterId, backgroundKey)
// Les écritures renvoient la coterie rechargée ; une règle enfreinte lève une
// CoterieError (status HTTP + message pour le joueur).
// ─────────────────────────────────────────────────────────────────────────────

const POOLABLE = ['allies', 'contacts', 'domain', 'herd', 'influence', 'mentor', 'resources', 'retainers'];
const POOL_MAX = 10;

class CoterieError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}

const _int = (v) => (Number.isInteger(Number(v)) && v !== null && v !== '' ? Number(v) : null);

function _transaction(db, fn) {
    db.prepare('BEGIN').run();
    try {
        fn();
        db.prepare('COMMIT').run();
    } catch (err) {
        db.prepare('ROLLBACK').run();
        throw err;
    }
}

function _requireCoterie(db, sessionId) {
    const row = db.prepare('SELECT * FROM coteries WHERE session_id = ?').get(sessionId);
    if (!row) throw new CoterieError(404, 'Aucune coterie à cette table');
    return row;
}

function _requirePoolable(key) {
    if (!POOLABLE.includes(key)) throw new CoterieError(400, 'Cet Historique ne se met pas en commun');
}

/** Totaux des pools d'une coterie : { [backgroundKey]: total } */
function _totals(db, coterieId) {
    const totals = {};
    for (const b of db.prepare('SELECT background_key, story_points FROM coterie_backgrounds WHERE coterie_id = ?').all(coterieId)) {
        totals[b.background_key] = (totals[b.background_key] ?? 0) + b.story_points;
    }
    for (const c of db.prepare('SELECT background_key, points FROM coterie_contributions WHERE coterie_id = ?').all(coterieId)) {
        totals[c.background_key] = (totals[c.background_key] ?? 0) + c.points;
    }
    return totals;
}

/** Plafond d'un pool : 10 pour l'ancre, sinon la valeur de l'ancre (10 au plus) */
const _cap = (coterie, totals, key) => (key === coterie.anchor_key ? POOL_MAX : Math.min(POOL_MAX, totals[coterie.anchor_key] ?? 0));

const _touch = (db, coterieId) => db.prepare('UPDATE coteries SET updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(coterieId);
const _ensurePool = (db, coterieId, key) => db.prepare(
    'INSERT INTO coterie_backgrounds (coterie_id, background_key) VALUES (?, ?) ON CONFLICT (coterie_id, background_key) DO NOTHING'
).run(coterieId, key);

// ── Lecture ───────────────────────────────────────────────────────────────────

function loadCoterie(db, sessionId) {
    const row = db.prepare('SELECT * FROM coteries WHERE session_id = ?').get(sessionId);
    if (!row) return null;

    const pools = new Map();
    const pool = (key) => {
        if (!pools.has(key)) pools.set(key, { backgroundKey: key, storyPoints: 0, details: '', contributions: [], total: 0 });
        return pools.get(key);
    };
    pool(row.anchor_key);
    for (const b of db.prepare('SELECT * FROM coterie_backgrounds WHERE coterie_id = ?').all(row.id)) {
        Object.assign(pool(b.background_key), { storyPoints: b.story_points, details: b.details ?? '' });
    }
    for (const c of db.prepare('SELECT * FROM coterie_contributions WHERE coterie_id = ? ORDER BY id').all(row.id)) {
        pool(c.background_key).contributions.push({ characterId: c.character_id, points: c.points });
    }
    const backgrounds = [...pools.values()]
        .map(p => ({ ...p, total: p.storyPoints + p.contributions.reduce((s, c) => s + c.points, 0) }))
        .sort((a, b) => (a.backgroundKey === row.anchor_key ? -1 : b.backgroundKey === row.anchor_key ? 1
            : POOLABLE.indexOf(a.backgroundKey) - POOLABLE.indexOf(b.backgroundKey)));

    const table = db.prepare(`
        SELECT c.id, c.nom, c.player_name, c.avatar
        FROM session_characters sc JOIN characters c ON c.id = sc.character_id
        WHERE sc.session_id = ? ORDER BY sc.joined_at, c.id
    `).all(sessionId).map(c => ({ characterId: c.id, name: c.nom, playerName: c.player_name, avatar: c.avatar }));

    return {
        id: row.id, sessionId: row.session_id, name: row.name, description: row.description ?? '', emblem: row.emblem,
        anchorKey: row.anchor_key, notes: row.notes ?? '', backgrounds, table, updatedAt: row.updated_at,
    };
}

// ── Écritures ─────────────────────────────────────────────────────────────────

function createCoterie(db, sessionId, { name, anchorKey } = {}) {
    if (!db.prepare('SELECT id FROM game_sessions WHERE id = ?').get(sessionId)) throw new CoterieError(404, 'Table introuvable');
    if (db.prepare('SELECT id FROM coteries WHERE session_id = ?').get(sessionId)) throw new CoterieError(409, 'Cette table a déjà une coterie');
    if (!String(name ?? '').trim()) throw new CoterieError(400, 'Le nom est requis');
    _requirePoolable(anchorKey);
    _transaction(db, () => {
        const { lastInsertRowid } = db.prepare('INSERT INTO coteries (session_id, name, anchor_key) VALUES (?, ?, ?)').run(sessionId, String(name).trim(), anchorKey);
        _ensurePool(db, lastInsertRowid, anchorKey);
    });
    return loadCoterie(db, sessionId);
}

/** Textes de la fiche (Conteur ou joueur de la table) : name, description, notes, emblem, details { clé: texte } */
function updateCoterieTexts(db, sessionId, user, data = {}) {
    const coterie = _requireCoterie(db, sessionId);
    const atTable = db.prepare('SELECT 1 FROM session_characters WHERE session_id = ? AND character_id = ?').get(sessionId, user?.characterId);
    if (!user?.isGM && !atTable) throw new CoterieError(403, 'Réservé aux joueurs de la table et au Conteur');
    if (data.name !== undefined && !String(data.name).trim()) throw new CoterieError(400, 'Le nom ne peut pas être vide');

    _transaction(db, () => {
        db.prepare(`
            UPDATE coteries SET name = COALESCE(@name, name), description = COALESCE(@description, description),
                   notes = COALESCE(@notes, notes), updated_at = CURRENT_TIMESTAMP
            WHERE id = @id
        `).run({
            id: coterie.id,
            name: data.name !== undefined ? String(data.name).trim() : null,
            description: data.description ?? null,
            notes: data.notes ?? null,
        });
        if ('emblem' in data) db.prepare('UPDATE coteries SET emblem = ? WHERE id = ?').run(data.emblem || null, coterie.id);
        for (const [key, text] of Object.entries(data.details ?? {})) {
            _requirePoolable(key);
            _ensurePool(db, coterie.id, key);
            db.prepare('UPDATE coterie_backgrounds SET details = ? WHERE coterie_id = ? AND background_key = ?').run(String(text ?? ''), coterie.id, key);
        }
    });
    return loadCoterie(db, sessionId);
}

/** Ajustement d'histoire du Conteur (ajoute un Historique s'il n'existait pas) ; total borné de 0 à 10 */
function setStoryPoints(db, sessionId, backgroundKey, storyPoints) {
    const coterie = _requireCoterie(db, sessionId);
    _requirePoolable(backgroundKey);
    const value = _int(storyPoints);
    if (value === null) throw new CoterieError(400, 'Valeur d\'histoire invalide');
    const staked = db.prepare('SELECT COALESCE(SUM(points), 0) AS s FROM coterie_contributions WHERE coterie_id = ? AND background_key = ?')
        .get(coterie.id, backgroundKey).s;
    const clamped = Math.max(-staked, Math.min(POOL_MAX - staked, value));
    _transaction(db, () => {
        _ensurePool(db, coterie.id, backgroundKey);
        db.prepare('UPDATE coterie_backgrounds SET story_points = ? WHERE coterie_id = ? AND background_key = ?').run(clamped, coterie.id, backgroundKey);
        _touch(db, coterie.id);
    });
    return loadCoterie(db, sessionId);
}

/** Verser : points pris sur la fiche, ajoutés à la mise du personnage (plafond : l'ancre, 10 pour l'ancre) */
function contribute(db, sessionId, characterId, backgroundKey, points) {
    const coterie = _requireCoterie(db, sessionId);
    _requirePoolable(backgroundKey);
    const n = _int(points);
    if (n === null || n < 1) throw new CoterieError(400, 'Nombre de points invalide');
    if (!db.prepare('SELECT 1 FROM session_characters WHERE session_id = ? AND character_id = ?').get(sessionId, characterId)) {
        throw new CoterieError(403, 'Ce personnage n\'est pas à cette table');
    }
    const own = db.prepare('SELECT id, rating FROM character_backgrounds WHERE character_id = ? AND background_key = ?').get(characterId, backgroundKey);
    if (!own || own.rating < n) throw new CoterieError(400, 'Pas assez de points dans cet Historique');
    const totals = _totals(db, coterie.id);
    const cap = _cap(coterie, totals, backgroundKey);
    if ((totals[backgroundKey] ?? 0) + n > cap) {
        throw new CoterieError(400, backgroundKey === coterie.anchor_key ? `Plafond : ${POOL_MAX}` : `Plafond : ${cap} (la valeur de l'ancre)`);
    }
    _transaction(db, () => {
        db.prepare('UPDATE character_backgrounds SET rating = rating - ? WHERE id = ?').run(n, own.id);
        _ensurePool(db, coterie.id, backgroundKey);
        db.prepare(`
            INSERT INTO coterie_contributions (coterie_id, character_id, background_key, points) VALUES (?, ?, ?, ?)
            ON CONFLICT (coterie_id, character_id, background_key) DO UPDATE SET points = points + excluded.points
        `).run(coterie.id, characterId, backgroundKey, n);
        _touch(db, coterie.id);
    });
    return loadCoterie(db, sessionId);
}

/** Retirer sa mise d'un Historique : toute la mise, un point de moins rendu à la fiche */
function withdraw(db, sessionId, characterId, backgroundKey) {
    const coterie = _requireCoterie(db, sessionId);
    const stake = db.prepare('SELECT id, points FROM coterie_contributions WHERE coterie_id = ? AND character_id = ? AND background_key = ?')
        .get(coterie.id, characterId, backgroundKey);
    if (!stake) throw new CoterieError(404, 'Aucune mise dans cet Historique');
    const refund = stake.points - 1;
    _transaction(db, () => {
        db.prepare('DELETE FROM coterie_contributions WHERE id = ?').run(stake.id);
        if (refund > 0) {
            const own = db.prepare('SELECT id FROM character_backgrounds WHERE character_id = ? AND background_key = ?').get(characterId, backgroundKey);
            if (own) db.prepare('UPDATE character_backgrounds SET rating = rating + ? WHERE id = ?').run(refund, own.id);
            else db.prepare('INSERT INTO character_backgrounds (character_id, background_key, rating, details) VALUES (?, ?, ?, \'\')').run(characterId, backgroundKey, refund);
        }
        _touch(db, coterie.id);
    });
    return loadCoterie(db, sessionId);
}

module.exports = {
    POOLABLE, POOL_MAX, CoterieError,
    loadCoterie, createCoterie, updateCoterieTexts, setStoryPoints, contribute, withdraw,
};
