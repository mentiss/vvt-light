// src/client/src/systems/dune/components/npc/duneNpcPick.js
// ─────────────────────────────────────────────────────────────────────────────
// Jet composé d'un PNJ de Dune pour la brique de la plateforme (spec_pnj.md §6.8,
// §7) : une compétence + un principe (un mineur : sa valeur « Principe » unique,
// part fixe), puis la fenêtre « Jet du meneur » préremplie.
// ─────────────────────────────────────────────────────────────────────────────

import { traitLabel } from '../../config/traits.js';
import { hasSpecialisation, isMinor, testThreshold, traitRank } from '../../config/rules/npc.js';

/** Requête de jet transmise à la fenêtre du slug (RollWindow) : seuil, libellé, spécialisation possible. */
export function npcRollRequest(sd, sel, label) {
    return {
        rang: testThreshold(sd, sel),
        label,
        specialisation: hasSpecialisation(sd, sel.competences) ? traitRank(sd, 'competences', sel.competences) : null,
    };
}

/** Texte d'un jet préparé : « Combat + Devoir · 12 ». */
export function presetText(sd, preset) {
    const parts = [traitLabel(preset.pick?.competences), isMinor(sd) ? 'Principe' : traitLabel(preset.pick?.principes)];
    return `${parts.join(' + ')} · ${testThreshold(sd, preset.pick)}`;
}

/** Contrat `pick` de la brique NpcSystem (features/npc/NpcSystem.jsx). */
export const duneNpcPick = {
    groups: (npc) => (isMinor(npc.systemData)
        ? [{ key: 'competences', label: 'une compétence' }]
        : [{ key: 'competences', label: 'une compétence' }, { key: 'principes', label: 'un principe' }]),
    part: (npc, group, key) => ({ label: traitLabel(key), value: traitRank(npc.systemData, group, key) }),
    extra: (npc) => (isMinor(npc.systemData) ? { label: 'Principe', value: npc.systemData.drive ?? 5 } : null),
    resolve: (npc, sel, name) => {
        const sd = npc.systemData;
        const label = isMinor(sd) ? `${name} · ${traitLabel(sel.competences)}` : `${name} · ${traitLabel(sel.competences)} + ${traitLabel(sel.principes)}`;
        return npcRollRequest(sd, sel, label);
    },
};
