// src/client/src/tools/freeRoll.js
// ─────────────────────────────────────────────────────────────────────────────
// Jet libre (FreeDiceModal, roll_type 'free_roll') : lecture d'une entrée
// d'historique ou de notification, prête à afficher par le rendu d'un slug
// (documentations/spec_diceengine_v2.md, « Jet libre »).
//
// Les jets enregistrés depuis le 2026-10-23 portent total, modificateur et
// libellé ; les plus anciens n'ont que les dés : le total se recalcule, le
// modificateur se lit dans la notation du dernier groupe, le libellé retombe
// sur « Jet libre ».
// ─────────────────────────────────────────────────────────────────────────────

export const FREE_ROLL_TYPE = 'free_roll';

const DEFAULT_LABEL = 'Jet libre';

// « 2d6 » ou « 1d8+3 » / « 1d8-2 » : dés et modificateur éventuel
const NOTATION_RE = /^(\d+d\d+)([+-]\d+)?$/;

const sum = (values) => values.reduce((s, v) => s + v, 0);

/**
 * @param {object} entry  entrée d'historique ou notification (roll_type, roll_result objet ou JSON)
 * @returns {{ label: string, total: number, modifier: number,
 *             groups: { notation: string, values: number[], subtotal: number }[] } | null}
 *          null si l'entrée n'est pas un jet libre lisible
 */
export const parseFreeRoll = (entry) => {
    if (entry?.roll_type !== FREE_ROLL_TYPE) return null;

    let result = entry.roll_result;
    if (typeof result === 'string') {
        try { result = JSON.parse(result); } catch { return null; }
    }
    if (!result || !Array.isArray(result.groups)) return null;

    let parsedModifier = 0;
    const groups = result.groups.map(g => {
        const values = g.values ?? [];
        const match  = NOTATION_RE.exec(g.notation ?? '');
        if (match?.[2]) parsedModifier = Number(match[2]);
        return {
            notation: match ? match[1] : (g.notation ?? ''),
            values,
            subtotal: sum(values),
        };
    });

    const modifier = result.modifier ?? parsedModifier;
    const total    = result.total ?? sum(groups.map(g => g.subtotal)) + modifier;
    const label    = result.label || entry.roll_target || DEFAULT_LABEL;

    return { label, total, modifier, groups };
};
