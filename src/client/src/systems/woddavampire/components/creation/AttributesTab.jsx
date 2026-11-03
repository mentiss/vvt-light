// src/client/src/systems/woddavampire/components/creation/AttributesTab.jsx
// Onglet « Attributs » : priorités 7 / 5 / 3, 1 point gratuit partout (Apparence
// 0 : Nosferatu, Monstrueux), maximum 5 ; mode points bonus (5 par point). §5.1.

import React, { useState } from 'react';
import { ATTRIBUTE_GROUPS, CREATION_BUDGET } from '../../config.jsx';
import { attributeFree, attributeMax, attributeRemaining, pickDot } from '../../config/rules/creationRules.js';
import { VdaSectionTitle } from '../ui/VdaUi.jsx';
import TraitRow from './TraitRow.jsx';
import PriorityHeader from './PriorityHeader.jsx';
import { useHelp, helpProps } from './CreationHelp.jsx';

const AttributesTab = ({ ws, patch, setIn, bonusMode }) => {
    const show = useHelp();
    const remaining = attributeRemaining(ws);
    const [nudge, setNudge] = useState(null);   // colonne cliquée sans priorité

    // Une priorité ne sert qu'une fois : la choisir la retire d'une autre catégorie
    const pickPriority = (group, value) => {
        const next = { ...ws.attrPriority };
        for (const k of Object.keys(next)) if (next[k] === value) next[k] = null;
        next[group] = ws.attrPriority?.[group] === value ? null : value;
        const reset = Object.fromEntries(ATTRIBUTE_GROUPS.find(g => g.key === group).attributes.map(([k]) => [k, 0]));
        patch({ attrPriority: next, attributes: { ...ws.attributes, ...reset } });
    };

    return (
        <div>
            <VdaSectionTitle>Attributs</VdaSectionTitle>
            <div className="vda-three">
                {ATTRIBUTE_GROUPS.map(g => (
                    <div key={g.key}>
                        <div className="vda-col-title" {...helpProps(show, { kind: 'attributeGroup', key: g.key })}>{g.label}</div>
                        <PriorityHeader priorities={CREATION_BUDGET.attributePriorities} value={ws.attrPriority?.[g.key]} remaining={remaining[g.key]}
                                        nudge={nudge === g.key} onPick={(p) => { setNudge(null); pickPriority(g.key, p); }} />
                        {g.attributes.map(([key, label]) => {
                            const free = attributeFree(ws, key);
                            const base = ws.attributes?.[key] ?? 0;
                            const bonus = ws.bonus?.attributes?.[key] ?? 0;
                            const max = attributeMax(ws, key);
                            return (
                                <TraitRow key={key} label={label} help={{ kind: 'attribute', key }} free={free} base={base} bonus={bonus} max={5} locked={max}
                                          onPick={(n) => {
                                              if (!bonusMode && !ws.attrPriority?.[g.key]) { setNudge(g.key); return; }
                                              const r = pickDot({ n, free, base, bonus, max, baseCap: max, baseRemaining: remaining[g.key], bonusMode });
                                              setIn('attributes', key, r.base);
                                              setIn('bonus.attributes', key, r.bonus);
                                          }} />
                            );
                        })}
                    </div>
                ))}
            </div>
            <p className="vda-note mt-3">Points : gris = gratuit · encre = priorités · sang = points bonus.</p>
        </div>
    );
};

export default AttributesTab;
