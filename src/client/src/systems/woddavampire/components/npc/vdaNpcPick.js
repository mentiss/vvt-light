// src/client/src/systems/woddavampire/components/npc/vdaNpcPick.js
// ─────────────────────────────────────────────────────────────────────────────
// Jet composé d'un PNJ du Conteur pour la brique de la plateforme (spec_pnj.md §6.8,
// §10.3) : un Attribut + une Capacité, malus de blessure retranché, puis la fenêtre
// du Conteur préremplie (VdaNpcRollWindow).
// ─────────────────────────────────────────────────────────────────────────────

import { ATTRIBUTE_LABELS, ABILITY_LABELS } from '../../config/traits.js';
import { npcPool, npcWound } from '../../config/rules/npc.js';

export const abilityLabel = (a) => {
    const base = ABILITY_LABELS[a.key] ?? a.key;
    return a.specialty ? `${base} (${a.specialty})` : base;
};

const findAbility = (sd, key) => (sd?.abilities ?? []).find(a => a.key === key);

/** Contrat `pick` de la brique NpcSystem (features/npc/NpcSystem.jsx). */
export const vdaNpcPick = {
    groups: () => [{ key: 'attribute', label: 'un Attribut' }, { key: 'ability', label: 'une Capacité' }],
    part: (npc, group, key) => (group === 'attribute'
        ? { label: ATTRIBUTE_LABELS[key] ?? key, value: Number(npc.systemData?.attributes?.[key] ?? 0) }
        : { label: abilityLabel(findAbility(npc.systemData, key) ?? { key }), value: Number(findAbility(npc.systemData, key)?.rating ?? 0) }),
    extra: (npc, state) => {
        const { penalty } = npcWound(npc.systemData, state);
        return penalty ? { label: 'blessure', value: penalty } : null;
    },
    resolve: (npc, sel, name, state) => {
        const sd = npc.systemData;
        const ability = findAbility(sd, sel.ability);
        return {
            name,
            label: `${name} · ${ATTRIBUTE_LABELS[sel.attribute] ?? sel.attribute} + ${abilityLabel(ability ?? { key: sel.ability })}`,
            dice: npcPool(sd, state, { attribute: sel.attribute, ability: sel.ability }),
            difficulty: 6,
            specialty: false,
        };
    },
};
