// src/client/src/systems/woddavampire/components/layout/VdaHistoryEntry.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Rendu d'un jet, déclaré une fois dans config.jsx (dice.renderHistoryEntry) et
// lu par l'onglet Historique, le panneau d'historique et les notifications :
// rendu identique partout, aucune marge extérieure (la plateforme la porte).
//
// Traite le jet libre en premier (parseFreeRoll), puis :
//   vda_starting_blood : 1d10 de la réserve de départ
//   vda_initiative     : 1d10 + base d'initiative
//   vda_pool           : réserve de d10 (succès, spécialité, succès automatiques,
//                        échec critique → la carte boit le sang)
// Tout le reste : null (rendu générique).
// ─────────────────────────────────────────────────────────────────────────────

import React, { useMemo } from 'react';
import { parseFreeRoll } from '../../../../tools/freeRoll.js';
import VdaBloodSoak, { SOAK_ORIGINS_NO_TOP } from './VdaBloodSoak.jsx';

const FRESH_MS = 20000;   // une entrée plus ancienne s'affiche déjà sèche

const parseResult = (entry) => {
    const raw = entry?.roll_result;
    if (!raw) return null;
    if (typeof raw === 'string') {
        try { return JSON.parse(raw); } catch { return null; }
    }
    return raw;
};

const isFresh = (entry) => {
    const at = entry?.created_at ? Date.parse(`${entry.created_at.replace(' ', 'T')}${entry.created_at.endsWith('Z') ? '' : 'Z'}`) : NaN;
    return Number.isNaN(at) || Date.now() - at < FRESH_MS;
};

const FreeRollEntry = ({ free }) => (
    <div className="vda-roll">
        <div className="vda-roll-head">
            <span className="vda-roll-label">{free.label}</span>
            <span className="vda-roll-total">= {free.total}</span>
        </div>
        <div className="vda-roll-meta">
            {free.groups.map((g, i) => (
                <span key={i} className="vda-roll-group">{g.notation} : {g.values.join(' + ')}</span>
            ))}
            {free.modifier ? <span>{free.modifier > 0 ? '+' : '−'} {Math.abs(free.modifier)}</span> : null}
        </div>
    </div>
);

const Die = ({ value, cls }) => <span className={`vda-die ${cls}`}>{value}</span>;

const PoolEntry = ({ entry, result }) => {
    // Origine de l'imprégnation stable pour une entrée donnée
    const origin = useMemo(() => SOAK_ORIGINS_NO_TOP[(entry?.id ?? 0) % SOAK_ORIGINS_NO_TOP.length], [entry?.id]);
    const diff = result.difficulty;
    return (
        <div className="vda-roll">
            {result.botch && <VdaBloodSoak origin={origin} animate={isFresh(entry)} seed={(entry?.id ?? 1) % 997} />}
            <div className="vda-roll-head">
                <span className="vda-roll-label">{entry?.character_name ? `${entry.character_name} — ` : ''}{result.label}</span>
                <span className="vda-roll-meta">{result.values.length} dé{result.values.length > 1 ? 's' : ''} · diff {diff}{result.specialty ? ' · spécialité' : ''}</span>
            </div>
            <div className="vda-roll-dice">
                {result.values.map((v, i) => {
                    let cls = '';
                    if (v >= diff) cls = result.specialty && v === 10 ? 'is-ten' : 'is-success';
                    else if (v === 1) cls = 'is-one';
                    return <Die key={i} value={v} cls={cls} />;
                })}
                {result.autoSuccesses > 0 && <span className="vda-auto">+{result.autoSuccesses} automatique{result.autoSuccesses > 1 ? 's' : ''}</span>}
                {result.cancelled > 0 && <span className="vda-roll-meta">−{result.cancelled} annulé{result.cancelled > 1 ? 's' : ''} par les 1</span>}
            </div>
            <div className={`vda-roll-result${result.botch ? ' is-botch' : ''}`}>
                {result.botch ? 'Échec critique' : result.failure ? 'Échec' : `${result.successes} succès`}
                {result.degree && <small>réussite {result.degree}</small>}
            </div>
        </div>
    );
};

const VdaHistoryEntry = ({ roll }) => {
    const entry = roll?.roll ?? roll;

    const free = parseFreeRoll(entry);
    if (free) return <FreeRollEntry free={free} />;

    const result = parseResult(entry);
    const rollType = entry?.roll_type ?? '';
    if (!result) return null;

    if (rollType === 'vda_starting_blood') {
        return (
            <div className="vda-roll">
                <div className="vda-roll-head">
                    <span className="vda-roll-label">{result.label}</span>
                    <span className="vda-roll-meta">1d10</span>
                </div>
                <div className="vda-roll-dice"><Die value={result.value} cls="is-success" /></div>
            </div>
        );
    }

    if (rollType === 'vda_initiative') {
        return (
            <div className="vda-roll">
                <div className="vda-roll-head">
                    <span className="vda-roll-label">{entry?.character_name ? `${entry.character_name} — ` : ''}{result.label}</span>
                    <span className="vda-roll-meta">1d10 {result.base >= 0 ? '+' : '−'} {Math.abs(result.base)}</span>
                </div>
                <div className="vda-roll-dice"><Die value={result.die} cls="is-success" /></div>
                <div className="vda-roll-result">Initiative {result.value}</div>
            </div>
        );
    }

    if (rollType === 'vda_pool' && Array.isArray(result.values)) return <PoolEntry entry={entry} result={result} />;

    return null; // rendu générique
};

export default VdaHistoryEntry;
