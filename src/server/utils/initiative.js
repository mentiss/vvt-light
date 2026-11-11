// src/server/utils/initiative.js
// ─────────────────────────────────────────────────────────────────────────────
// Initiative d'une table (documentations/spec_initiative.md §9.3, §9.4).
// Le navigateur du MJ calcule chaque transition et envoie l'état complet (Q-33) ;
// ici, on vérifie seulement sa forme, sans contrôler les règles du jeu (seul le MJ
// écrit). Les avatars voyagent à part : envoyés une fois à l'ajout d'un participant,
// gardés par le serveur et retirés avec lui (un avatar est une data URL de ~30 Ko).
// La route (routes/initiative.js) valide les paramètres et délègue ici.
// ─────────────────────────────────────────────────────────────────────────────

const MAX_PARTICIPANTS = 60;
const MAX_KEY          = 40;
const MAX_NAME         = 120;
const MAX_AVATAR       = 2 * 1024 * 1024;     // data URL d'une image recadrée (256 px) : large marge
const MAX_ROUND        = 9999;
const MAX_ACTIONS      = 10;
const AVATAR_RE        = /^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+/=]+$/;

const MODES  = ['order', 'sides'];
const SIDES  = ['players', 'gm'];
const KINDS  = ['character', 'npc', 'free'];
const WOUNDS = ['light', 'moderate', 'severe', 'out'];

class ValidationError extends Error {}

const isInt = (v, min, max) => typeof v === 'number' && Number.isInteger(v) && v >= min && v <= max;
const isBool = (v) => typeof v === 'boolean';
const isText = (v, max) => typeof v === 'string' && v.length <= max;
const fail = (message) => { throw new ValidationError(message); };

/** Un participant : forme vérifiée, champs inconnus écartés. */
function cleanParticipant(raw, index) {
    const where = `participants[${index}]`;
    if (!raw || typeof raw !== 'object') fail(`${where} invalide`);
    const { key, kind, refId, side, name, publicName, initiative, actions, acted,
        delayed, hidden, reserve, down, wound, woundForced, outRound } = raw;
    if (!isText(key, MAX_KEY) || !key) fail(`${where}.key invalide`);
    if (!KINDS.includes(kind)) fail(`${where}.kind invalide`);
    if (refId !== null && !isInt(refId, -1e9, 1e9)) fail(`${where}.refId invalide`);
    if (!SIDES.includes(side)) fail(`${where}.side invalide`);
    if (!isText(name, MAX_NAME)) fail(`${where}.name invalide`);
    if (!isText(publicName, MAX_NAME)) fail(`${where}.publicName invalide`);
    if (initiative !== null && !(typeof initiative === 'number' && Number.isFinite(initiative))) fail(`${where}.initiative invalide`);
    if (!isInt(actions, 1, MAX_ACTIONS)) fail(`${where}.actions invalide`);
    if (!isInt(acted, 0, MAX_ACTIONS)) fail(`${where}.acted invalide`);
    for (const [label, value] of Object.entries({ delayed, hidden, reserve, down, woundForced })) {
        if (!isBool(value)) fail(`${where}.${label} invalide`);
    }
    if (wound !== null && !WOUNDS.includes(wound)) fail(`${where}.wound invalide`);
    if (outRound !== null && !isInt(outRound, 1, MAX_ROUND)) fail(`${where}.outRound invalide`);
    return { key, kind, refId, side, name, publicName, initiative, actions, acted,
        delayed, hidden, reserve, down, wound, woundForced, outRound };
}

/**
 * État complet envoyé par le MJ → état nettoyé (champs connus seulement).
 * @throws {ValidationError}
 */
function validateState(raw) {
    if (!raw || typeof raw !== 'object') fail('state invalide');
    const { mode, alternate, round, activeKey, opening, hand, kept, enemyOrder, lastSide, participants } = raw;
    if (!MODES.includes(mode)) fail('mode invalide');
    if (!isBool(alternate)) fail('alternate invalide');
    if (!isInt(round, 1, MAX_ROUND)) fail('round invalide');
    if (!SIDES.includes(opening) || !SIDES.includes(hand)) fail('camp invalide');
    if (!kept || !isBool(kept.players) || !isBool(kept.gm)) fail('kept invalide');
    if (!isBool(enemyOrder)) fail('enemyOrder invalide');
    if (lastSide !== null && !SIDES.includes(lastSide)) fail('lastSide invalide');
    if (!Array.isArray(participants) || participants.length > MAX_PARTICIPANTS) fail('participants invalides');
    const list = participants.map(cleanParticipant);
    const keys = new Set(list.map(p => p.key));
    if (keys.size !== list.length) fail('participants en double');
    if (activeKey !== null && !keys.has(activeKey)) fail('activeKey invalide');
    return { mode, alternate, round, activeKey, opening, hand, kept: { players: kept.players, gm: kept.gm },
        enemyOrder, lastSide, participants: list };
}

/**
 * Avatars envoyés avec l'état ({ clé: data URL | null }) → entrées valides.
 * @throws {ValidationError}
 */
function validateAvatars(raw) {
    if (raw === undefined) return {};
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) fail('avatars invalides');
    const out = {};
    for (const [key, value] of Object.entries(raw)) {
        if (!isText(key, MAX_KEY)) fail('clé d\'avatar invalide');
        if (value !== null && (typeof value !== 'string' || value.length > MAX_AVATAR || !AVATAR_RE.test(value))) fail(`avatar de ${key} invalide`);
        out[key] = value;
    }
    return out;
}

/**
 * Avatars gardés pour la table, après une écriture : ceux reçus s'ajoutent (null retire),
 * ceux des participants partis sont retirés. Renvoie { avatars, changed }.
 */
function mergeAvatars(current, incoming, state) {
    const keys = new Set(state.participants.map(p => p.key));
    const next = {};
    let changed = false;
    for (const [key, value] of Object.entries({ ...current, ...incoming })) {
        if (value === null || !keys.has(key)) { if (key in current) changed = true; continue; }
        if (current[key] !== value) changed = true;
        next[key] = value;
    }
    return { avatars: next, changed };
}

module.exports = { ValidationError, validateState, validateAvatars, mergeAvatars, MAX_PARTICIPANTS };
