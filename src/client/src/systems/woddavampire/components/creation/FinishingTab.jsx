// src/client/src/systems/woddavampire/components/creation/FinishingTab.jsx
// Onglet « Finitions » : 15 points bonus (Route 2, Volonté 1 ; Attributs,
// Capacités, Avantages achetés dans leurs onglets en mode bonus), Atouts et
// Handicaps (plafond des Handicaps, restrictions ; validation par le Conteur autour de la table). §5.2, §16.

import React, { useState } from 'react';
import { MERITS_FLAWS, MERIT_FLAW_ORDER, MERIT_CATEGORY_LABELS, costOptions, CHRONICLE, CREATION_BUDGET } from '../../config.jsx';
import {
    bonusRemaining, bonusSpent, flawPoints, meritFlawCost, meritFlawProblems, roadRating, willpowerRating,
} from '../../config/rules/creationRules.js';
import { VdaChip, VdaSectionTitle, VdaStepper } from '../ui/VdaUi.jsx';
import { useHelp, helpProps } from './CreationHelp.jsx';

const costLabel = (entry) => {
    if (Array.isArray(entry.cost)) return entry.cost.join(' ou ');
    if (typeof entry.cost === 'object') return `${entry.cost.min} à ${entry.cost.max}`;
    return String(entry.cost);
};

// Liste d'une catégorie : nom, coût, effet en clair, bouton Prendre (désactivé avec la raison)
const EntryList = ({ ws, kind, category, onAdd }) => {
    const show = useHelp();
    const taken = new Set((ws.meritsFlaws ?? []).map(e => e.entryKey));
    const entries = MERIT_FLAW_ORDER.map(k => MERITS_FLAWS[k]).filter(e => e.kind === kind && e.category === category && !taken.has(e.key)
        && !(e.chronicle === 'literacy_merit' && CHRONICLE.literacyAssumed) && !(e.chronicle === 'literacy_flaw' && !CHRONICLE.literacyAssumed));
    if (!entries.length) return <p className="vda-note">Rien de plus dans cette catégorie.</p>;
    return entries.map(e => {
        const problems = meritFlawProblems(ws, e.key);
        return (
            <div key={e.key} className={`vda-entry${problems.length ? ' is-blocked' : ''}`} {...helpProps(show, { kind: 'merit', key: e.key })}>
                <div className="vda-entry-head">
                    <b>{e.label}</b> <span className="vda-note">({costLabel(e)} pt)</span>
                    <span className="ml-auto"><VdaChip disabled={problems.length > 0} onClick={() => onAdd(e)}>Prendre</VdaChip></span>
                </div>
                <div className="vda-entry-text">{e.effect}</div>
                {problems.length > 0 && <div className="vda-entry-text is-problem">{problems.join(', ')}</div>}
            </div>
        );
    });
};
const FinishingTab = ({ ws, patch, setIn }) => {
    const left = bonusRemaining(ws);
    const { raw, granted } = flawPoints(ws);
    const list = ws.meritsFlaws ?? [];
    const [category, setCategory] = useState('physical');

    const add = (entry) => patch({ meritsFlaws: [...list, { entryKey: entry.key, cost: costOptions(entry)[0] }] });
    const remove = (key) => patch({ meritsFlaws: list.filter(e => e.entryKey !== key) });
    const setCost = (key, cost) => patch({ meritsFlaws: list.map(e => (e.entryKey === key ? { ...e, cost } : e)) });

    return (
        <div>
            <VdaSectionTitle>Finitions</VdaSectionTitle>
            <div className="vda-budget is-top">
                <span>Points bonus : {CREATION_BUDGET.bonusPoints} + Handicaps {granted} − dépensés {bonusSpent(ws)} = <b>{left}</b></span>
                <span className="vda-note">Attributs, Capacités et Avantages : interrupteur « Dépenser des points bonus » en haut de l'assistant</span>
            </div>

            <div className="vda-two mt-3">
                <div className="vda-trait">
                    <span className="vda-trait-name">Route (+2 par point) — actuelle {roadRating(ws)}</span>
                    <VdaStepper value={ws.bonus?.road ?? 0} min={0} max={10} onChange={(v) => setIn('bonus', 'road', v)} label="Route" />
                </div>
                <div className="vda-trait">
                    <span className="vda-trait-name">Volonté (+1 par point) — actuelle {willpowerRating(ws)}</span>
                    <VdaStepper value={ws.bonus?.willpower ?? 0} min={0} max={10} onChange={(v) => setIn('bonus', 'willpower', v)} label="Volonté" />
                </div>
            </div>

            <VdaSectionTitle small>Atouts et Handicaps choisis</VdaSectionTitle>
            {list.length === 0 && <p className="vda-note">Aucun. Facultatifs : les Handicaps rapportent des points bonus (jusqu'à {CHRONICLE.flawCap}).</p>}
            {list.map(item => {
                const entry = MERITS_FLAWS[item.entryKey];
                const options = costOptions(entry);
                const cost = meritFlawCost(ws, item);
                return (
                    <div key={item.entryKey} className="vda-trait">
                        <span className="vda-trait-name">
                            {entry.kind === 'merit' ? 'Atout' : 'Handicap'} · <b>{entry.label}</b> <small>{entry.effect}</small>
                        </span>
                        {options.length > 1
                            ? <span className="vda-chips">{options.map(c => <VdaChip key={c} on={item.cost === c} onClick={() => setCost(item.entryKey, c)}>{c}</VdaChip>)}</span>
                            : <span className="vda-note">{cost} pt{cost > 1 ? 's' : ''}{cost === 0 ? ' (imposé)' : ''}</span>}
                        <button type="button" className="vtt-btn vtt-btn-sm" onClick={() => remove(item.entryKey)}>Retirer</button>
                    </div>
                );
            })}
            {raw > CHRONICLE.flawCap && <div className="vda-warning-list">Handicaps : {raw} points, seuls {CHRONICLE.flawCap} rapportent des points bonus.</div>}

            <VdaSectionTitle small>Ajouter un Atout ou un Handicap</VdaSectionTitle>
            <div className="vda-chips mb-2">
                {Object.entries(MERIT_CATEGORY_LABELS).map(([k, label]) => (
                    <VdaChip key={k} on={category === k} onClick={() => setCategory(k)}>{label}</VdaChip>
                ))}
            </div>
            <div className="vda-two">
                <div><div className="vda-col-title">Atouts</div><EntryList ws={ws} kind="merit" category={category} onAdd={add} /></div>
                <div><div className="vda-col-title">Handicaps</div><EntryList ws={ws} kind="flaw" category={category} onAdd={add} /></div>
            </div>
            <p className="vda-note mt-2">Atouts et Handicaps se valident avec le Conteur, autour de la table.</p>
        </div>
    );
};

export default FinishingTab;
