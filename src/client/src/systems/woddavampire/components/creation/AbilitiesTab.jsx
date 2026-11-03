// src/client/src/systems/woddavampire/components/creation/AbilitiesTab.jsx
// Onglet « Capacités » : priorités 13 / 9 / 5, maximum 3 à cette étape (les
// points bonus peuvent dépasser, 2 par point) ; domaine d'expertise obligatoire
// pour Érudition, Commerce, Artisanat, Représentation ; Artisanat corporel pour
// les Tzimisce. §4.3, §5.1.

import React, { useState } from 'react';
import { ABILITY_GROUPS, ABILITY_DOMAINS, BODY_CRAFTS, CREATION_BUDGET } from '../../config.jsx';
import { abilityRemaining, pickDot } from '../../config/rules/creationRules.js';
import { clanProfile } from '../../config/rules/character.js';
import { VdaChip, VdaSectionTitle } from '../ui/VdaUi.jsx';
import TraitRow from './TraitRow.jsx';
import PriorityHeader from './PriorityHeader.jsx';
import { useHelp, helpProps } from './CreationHelp.jsx';

// Domaine d'expertise : un choix en pills, dont une pill « Autre… » qui ouvre
// une saisie libre (pas de <datalist> : sa liste native ne s'habille pas)
const DomainField = ({ abilityKey, value, onChange }) => {
    const suggestions = ABILITY_DOMAINS[abilityKey];
    const [otherOpen, setOtherOpen] = useState(false);
    const isOther = otherOpen || (!!value && !suggestions.includes(value));
    return (
        <div className="ml-2 mb-2">
            <div className="vda-chips is-small">
                {suggestions.map(d => (
                    <VdaChip key={d} on={value === d} onClick={() => { setOtherOpen(false); onChange(value === d ? '' : d); }}>{d}</VdaChip>
                ))}
                <VdaChip on={isOther} onClick={() => { setOtherOpen(!isOther); onChange(''); }}>Autre…</VdaChip>
            </div>
            {isOther && (
                <input className="vda-input mt-1" value={value} placeholder="Domaine d'expertise" autoFocus
                       onChange={(e) => onChange(e.target.value)} aria-label="Autre domaine d'expertise" />
            )}
        </div>
    );
};

const AbilitiesTab = ({ ws, patch, setIn, bonusMode }) => {
    const show = useHelp();
    const remaining = abilityRemaining(ws);
    const tzimisce = !!clanProfile(ws.clanKey, ws.casteKey)?.effects?.bodyCrafts;
    const [nudge, setNudge] = useState(null);   // colonne cliquée sans priorité

    const pickPriority = (group, value) => {
        const next = { ...ws.abilityPriority };
        for (const k of Object.keys(next)) if (next[k] === value) next[k] = null;
        next[group] = ws.abilityPriority?.[group] === value ? null : value;
        const groupKeys = ABILITY_GROUPS.find(g => g.key === group).abilities.map(([k]) => k);
        if (group === 'skill') groupKeys.push(BODY_CRAFTS[0]);
        const abilities = { ...ws.abilities };
        for (const k of groupKeys) delete abilities[k];
        patch({ abilityPriority: next, abilities });
    };

    const row = (group, key, label) => {
        const base = ws.abilities?.[key] ?? 0;
        const bonus = ws.bonus?.abilities?.[key] ?? 0;
        return (
            <React.Fragment key={key}>
                <TraitRow label={label} help={{ kind: 'ability', key }} base={base} bonus={bonus} max={5}
                          onPick={(n) => {
                              if (!bonusMode && !ws.abilityPriority?.[group]) { setNudge(group); return; }
                              const r = pickDot({ n, free: 0, base, bonus, max: 5, baseCap: CREATION_BUDGET.abilityMaxAtCreation, baseRemaining: remaining[group], bonusMode });
                              setIn('abilities', key, r.base);
                              setIn('bonus.abilities', key, r.bonus);
                          }} />
                {ABILITY_DOMAINS[key] && base + bonus > 0 && (
                    <DomainField abilityKey={key} value={ws.domains?.[key]?.[0] ?? ''} onChange={(v) => setIn('domains', key, [v])} />
                )}
            </React.Fragment>
        );
    };

    return (
        <div>
            <VdaSectionTitle>Capacités</VdaSectionTitle>
            <div className="vda-three">
                {ABILITY_GROUPS.map(g => (
                    <div key={g.key}>
                        <div className="vda-col-title" {...helpProps(show, { kind: 'abilityGroup', key: g.key })}>{g.label}</div>
                        <PriorityHeader priorities={CREATION_BUDGET.abilityPriorities} value={ws.abilityPriority?.[g.key]} remaining={remaining[g.key]}
                                        nudge={nudge === g.key} onPick={(p) => { setNudge(null); pickPriority(g.key, p); }} />
                        {g.abilities.map(([key, label]) => row(g.key, key, label))}
                        {g.key === 'skill' && tzimisce && row('skill', BODY_CRAFTS[0], BODY_CRAFTS[1])}
                    </div>
                ))}
            </div>
            <p className="vda-note mt-3">Maximum 3 avec les priorités ; Linguistique : 1 langue par point.</p>
        </div>
    );
};

export default AbilitiesTab;
