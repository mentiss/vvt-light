// src/client/src/features/dice/tools/diceHistory.js
// Écriture d'une entrée de l'historique des jets (route /dice/roll).
// Seul constructeur du corps envoyé : utilisé par le moteur (diceEngine) pour un
// jet, et directement par un slug pour une entrée sans dé (objet utilisé,
// événement…). Contrat : spec_diceengine_v2.md, « Passe générique : contrat ».
//
//   roll_type, label : donnés par le slug, obligatoires
//   notation, raw    : écrits par le moteur seulement, absents sans dé
//   result           : roll_result, espace libre du slug

/** Types d'entrée réservés à la plateforme : un slug ne les prend pas. */
export const PLATFORM_ROLL_TYPES = ['free_roll'];

/**
 * Résultat brut de la bibliothèque (raw_result), recopié sans interprétation :
 * un élément par notation, chaque dé avec ses marques (explode, drop, target-success…).
 * @param {Array<{ notation: string, total: number, rollItems: object[] }>} groups  raw.groups du moteur
 */
export const buildRawResult = (groups) => ({
    groups: groups.map(g => ({
        notation: g.notation,
        total:    g.total,
        dice:     (g.rollItems ?? []).map(d => ({
            value:     d.value,
            modifiers: d.modifiers ? [...d.modifiers] : [],
        })),
    })),
});

/**
 * Enregistre une entrée d'historique. Non bloquant : un refus ou une erreur
 * est signalé en console, jamais remonté au jeu.
 * @param {Function} fetchFn   fetchWithAuth
 * @param {string}   apiBase   préfixe de l'API du slug
 * @param {object}   entry
 * @param {string}   entry.rollType
 * @param {string}   entry.label
 * @param {object}   entry.result             roll_result
 * @param {number}   [entry.sessionId]
 * @param {number}   [entry.characterId]
 * @param {string}   [entry.characterName]
 * @param {string|string[]} [entry.notation]  moteur seulement
 * @param {object}   [entry.raw]              moteur seulement (buildRawResult)
 */
export async function recordHistoryEntry(fetchFn, apiBase, {
    rollType, label, result, sessionId, characterId, characterName, notation = null, raw = null,
}) {
    try {
        const res = await fetchFn(`${apiBase}/dice/roll`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                session_id:     sessionId     ?? null,
                character_id:   characterId   ?? null,
                character_name: characterName ?? null,
                roll_type:      rollType,
                label,
                notation:       Array.isArray(notation) ? JSON.stringify(notation) : notation,
                raw_result:     raw,
                roll_result:    result,
            }),
        });
        if (res && !res.ok) console.warn(`[diceHistory] entrée refusée (${res.status}) :`, rollType, label);
        return res;
    } catch (err) {
        console.warn('[diceHistory] entrée non enregistrée :', err);
        return null;
    }
}
