// src/client/src/features/table/tools/sessionResources.js
// ─────────────────────────────────────────────────────────────────────────────
// Ressources de session d'un slug 2D20 (Dune, Achtung) : changement d'une réserve par
// la route HTTP du slug (`PUT /api/<slug>/session-resources/:id { field, delta }`, qui
// diffuse le changement à la table). Sert à « garder la main » de l'initiative
// (documentations/spec_initiative.md §11, Q-39, Q-43) : pas d'emit socket depuis un slug.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Ajoute `delta` à la réserve `field` de la table. Une dépense (delta < 0) est refusée
 * si la réserve ne suffit pas.
 * @param {{ fetchWithAuth: Function, sessionId: number }} ctx
 * @param {string} field   colonne de la ressource (ex. 'impulsions', 'menace', 'momentum', 'threat')
 * @param {number} delta   négatif pour dépenser
 * @param {string} label   nom affiché de la ressource (message de refus)
 * @returns {Promise<{ ok: boolean, error?: string }>}
 */
export async function changeSessionResource({ fetchWithAuth, sessionId }, field, delta, label) {
    try {
        const url = `/api/session-resources/${sessionId}`;
        if (delta < 0) {
            const res = await fetchWithAuth(url);
            if (!res.ok) return { ok: false, error: `Lecture de la réserve de ${label} impossible.` };
            const current = (await res.json())?.[field];
            if (typeof current !== 'number' || current < -delta) {
                return { ok: false, error: `Pas assez de ${label} : ${-delta} demandés, ${current ?? 0} en réserve.` };
            }
        }
        const res = await fetchWithAuth(url, { method: 'PUT', body: JSON.stringify({ field, delta }) });
        return res.ok ? { ok: true } : { ok: false, error: `Le serveur a refusé le changement de ${label}.` };
    } catch (err) {
        console.error('[sessionResources]', err);
        return { ok: false, error: 'Serveur injoignable.' };
    }
}
