// src/client/src/systems/achtung/components/npc/acNpcPick.js
// ─────────────────────────────────────────────────────────────────────────────
// Jet composé d'un PNJ d'Achtung pour la brique de la plateforme (spec_pnj.md §6.8, §10.4) :
// un attribut + une compétence → cible, focus ; un Figurant n'a que sa qualité. Puis la fenêtre
// de jet MJ préremplie (AcNpcRollWindow) : 2d20 ; un groupe ajoute 1d20 d'assistance par autre membre.
// ─────────────────────────────────────────────────────────────────────────────

import { NPC_QUALITIES, assistDice, attributeLabel, npcTest, skillLabel } from '../../config/npc.js';

const isIncidental = (npc) => npc.systemData?.rank === 'incidental';

/** Contrat `pick` de la brique NpcSystem (features/npc/NpcSystem.jsx). */
export const acNpcPick = {
    groups: (npc) => (isIncidental(npc) ? [] : [{ key: 'attribute', label: 'un attribut' }, { key: 'skill', label: 'une compétence' }]),
    part: (npc, group, key) => (group === 'attribute'
        ? { label: attributeLabel(key), value: Number(npc.systemData?.attributes?.[key] ?? 0) }
        : { label: skillLabel(key), value: Number((npc.systemData?.skills ?? []).find(s => s.key === key)?.rank ?? 0) }),
    extra: (npc) => (isIncidental(npc)
        ? { label: 'qualité', value: (NPC_QUALITIES[npc.systemData?.quality] ?? NPC_QUALITIES.basic).target }
        : null),
    resolve: (npc, sel, name, state) => {
        const sd = npc.systemData ?? {};
        const test = npcTest(sd, sel.attribute, sel.skill);
        const label = isIncidental(npc) ? `${name} · test` : `${name} · ${attributeLabel(sel.attribute)} + ${skillLabel(sel.skill)}`;
        return { name, label, ...test, difficulty: 1, dice: 2, assist: state?.alive != null ? assistDice(state) : 0 };
    },
};
