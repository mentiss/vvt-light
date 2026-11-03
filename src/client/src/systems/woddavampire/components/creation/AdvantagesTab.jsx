// src/client/src/systems/woddavampire/components/creation/AdvantagesTab.jsx
// Onglet « Avantages » : 4 points de Disciplines (de clan + Célérité, Augure,
// Puissance, règle maison §15.4 ; Caïtif : au choix),
// 5 d'Historiques (Statut interdit aux Caïtifs), 7 de Vertus (1 gratuit chacune).
// Magie du sang : voie principale et un rituel par point ; kraina répartis.
// Mode points bonus : Discipline 7, Historique 1, Vertu 2. §5.1, §14.

import React from 'react';
import {
    DISCIPLINES, DISCIPLINE_ORDER, BACKGROUNDS, VIRTUE_LABELS, CREATION_BUDGET,
    PATHS, KRAINA, NEVER_PRIMARY, availableRituals,
} from '../../config.jsx';
import {
    isStartingDiscipline, isCommonDiscipline, disciplineValue, virtueKeys, pickDot,
} from '../../config/rules/creationRules.js';
import { clanProfile } from '../../config/rules/character.js';
import { VdaChip, VdaSectionTitle, VdaStepper } from '../ui/VdaUi.jsx';
import TraitRow from './TraitRow.jsx';

const total = (obj) => Object.values(obj ?? {}).reduce((s, v) => s + (v || 0), 0);

// Compteur sous le titre de colonne
const Left = ({ n }) => (
    <div className="vda-priority-state mb-1">{n > 0 ? <>Reste <b>{n}</b> à répartir</> : n < 0 ? <>Dépassement de <b>{-n}</b></> : '✓ Réparti'}</div>
);

const BloodMagicBlock = ({ ws, discKey, setIn }) => {
    const def = DISCIPLINES[discKey];
    const value = disciplineValue(ws, discKey);
    if (def.bloodMagic === 'paths') {
        const chosen = ws.rituals?.[discKey] ?? [];
        const toggleRitual = (key) => {
            const next = chosen.includes(key) ? chosen.filter(k => k !== key) : chosen.length < value ? [...chosen, key] : chosen;
            setIn('rituals', discKey, next);
        };
        return (
            <div className="vda-card is-static mt-2">
                <div className="vda-card-title">{def.label} {value}</div>
                <div className="vda-label mt-1">Voie principale ({value} point{value > 1 ? 's' : ''})</div>
                <div className="vda-chips">
                    {Object.entries(PATHS[def.pathSet]).map(([k, label]) => (
                        <VdaChip key={k} on={ws.paths?.[discKey] === k} onClick={() => setIn('paths', discKey, k)}>{label}</VdaChip>
                    ))}
                </div>
                <div className="vda-label mt-2">Rituels : {chosen.length} / {value} (un par point, niveau ≤ {value})</div>
                <div className="vda-chips">
                    {availableRituals(def.pathSet, value, ws.clanKey).map(r => (
                        <VdaChip key={r.key} on={chosen.includes(r.key)} disabled={!chosen.includes(r.key) && chosen.length >= value}
                                 onClick={() => toggleRitual(r.key)}>{r.label} <small>({r.level})</small></VdaChip>
                    ))}
                </div>
            </div>
        );
    }
    // Kraina : répartir les points, une kraina principale (jamais le Genius Loci)
    const spread = ws.kraina?.[discKey] ?? {};
    const left = value - total(spread);
    return (
        <div className="vda-card is-static mt-2">
            <div className="vda-card-title">{def.label} {value}</div>
            <div className="vda-label mt-1">Répartition entre les kraina (reste {left})</div>
            {Object.entries(KRAINA[discKey]).map(([k, label]) => (
                <div key={k} className="vda-trait">
                    <span className="vda-trait-name">{label}</span>
                    <VdaStepper value={spread[k] ?? 0} min={0} max={(spread[k] ?? 0) + Math.max(0, left)}
                                onChange={(v) => setIn(`kraina.${discKey}`, k, v)} label={label} />
                </div>
            ))}
            <div className="vda-label mt-2">Kraina principale</div>
            <div className="vda-chips">
                {Object.entries(KRAINA[discKey]).filter(([k]) => !NEVER_PRIMARY.includes(k)).map(([k, label]) => (
                    <VdaChip key={k} on={ws.paths?.[discKey] === k} onClick={() => setIn('paths', discKey, k)}>{label}</VdaChip>
                ))}
            </div>
        </div>
    );
};

const AdvantagesTab = ({ ws, setIn, bonusMode }) => {
    const profile = clanProfile(ws.clanKey, ws.casteKey);
    const discLeft = CREATION_BUDGET.disciplines - total(ws.disciplines);
    const bgLeft   = CREATION_BUDGET.backgrounds - total(ws.backgrounds);
    const virLeft  = CREATION_BUDGET.virtues - total(ws.virtues);
    const vk = virtueKeys(ws);

    // Disciplines affichées : de clan et communes (points de départ), plus en mode bonus toutes les autres
    const starting = DISCIPLINE_ORDER.filter(k => isStartingDiscipline(ws, k));
    const common = starting.filter(k => isCommonDiscipline(ws, k) && !profile?.anyDisciplines);
    const ofClan = starting.filter(k => !common.includes(k));
    const others = DISCIPLINE_ORDER.filter(k => !starting.includes(k) && (bonusMode || disciplineValue(ws, k) > 0)
        && (k !== 'koldunism' || profile?.caste?.koldunism || disciplineValue(ws, k) > 0));

    const discRow = (key, canBase) => {
        const base = ws.disciplines?.[key] ?? 0;
        const bonus = ws.bonus?.disciplines?.[key] ?? 0;
        return (
            <TraitRow key={key} label={DISCIPLINES[key].label} help={{ kind: 'discipline', key }} base={base} bonus={bonus} max={5}
                      onPick={(n) => {
                          if (!bonusMode && !canBase) return;
                          const r = pickDot({ n, free: 0, base, bonus, max: 5, baseCap: canBase ? 5 : 0, baseRemaining: discLeft, bonusMode });
                          setIn('disciplines', key, r.base);
                          setIn('bonus.disciplines', key, r.bonus);
                      }} />
        );
    };

    return (
        <div>
            <VdaSectionTitle>Avantages</VdaSectionTitle>
            <div className="vda-three">
                <div>
                    <div className="vda-col-title">Disciplines</div>
                    <Left n={discLeft} />
                    {!profile && <p className="vda-note">Choisir d'abord un clan.</p>}
                    {ofClan.map(k => discRow(k, true))}
                    {common.length > 0 && <div className="vda-label mt-2">Accessibles à tous</div>}
                    {common.map(k => discRow(k, true))}
                    {others.length > 0 && <div className="vda-label mt-2">Hors clan (points bonus)</div>}
                    {others.map(k => discRow(k, false))}
                </div>
                <div>
                    <div className="vda-col-title">Historiques</div>
                    <Left n={bgLeft} />
                    {Object.entries(BACKGROUNDS).map(([key, label]) => {
                        const base = ws.backgrounds?.[key] ?? 0;
                        const bonus = ws.bonus?.backgrounds?.[key] ?? 0;
                        const forbidden = key === 'status' && profile?.effects?.forbidStatus;
                        return (
                            <TraitRow key={key} label={label} help={{ kind: 'background', key }} note={forbidden ? 'interdit aux Caïtifs' : null} base={base} bonus={bonus} max={5} locked={forbidden ? 0 : 5}
                                      onPick={(n) => {
                                          const r = pickDot({ n, free: 0, base, bonus, max: 5, baseCap: 5, baseRemaining: bgLeft, bonusMode });
                                          setIn('backgrounds', key, r.base);
                                          setIn('bonus.backgrounds', key, r.bonus);
                                      }} />
                        );
                    })}
                </div>
                <div>
                    <div className="vda-col-title">Vertus</div>
                    <Left n={virLeft} />
                    {['moral', 'control', 'courage'].map(slot => {
                        const base = ws.virtues?.[slot] ?? 0;
                        const bonus = ws.bonus?.virtues?.[slot] ?? 0;
                        return (
                            <TraitRow key={slot} label={VIRTUE_LABELS[vk[slot]]} help={{ kind: 'virtue', key: vk[slot] }} free={1} base={base} bonus={bonus} max={5}
                                      onPick={(n) => {
                                          const r = pickDot({ n, free: 1, base, bonus, max: 5, baseCap: 4, baseRemaining: virLeft, bonusMode });
                                          setIn('virtues', slot, r.base);
                                          setIn('bonus.virtues', slot, r.bonus);
                                      }} />
                        );
                    })}
                    <p className="vda-note mt-1">Les points bonus en Vertus ne changent ni la Route ni la Volonté.</p>
                </div>
            </div>
            {DISCIPLINE_ORDER.filter(k => DISCIPLINES[k].bloodMagic && disciplineValue(ws, k) > 0).map(k => (
                <BloodMagicBlock key={k} ws={ws} discKey={k} setIn={setIn} />
            ))}
        </div>
    );
};

export default AdvantagesTab;
