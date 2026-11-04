// src/client/src/systems/vileborn/components/layout/VilHistoryEntry.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Rendu d'un jet, déclaré une fois dans config.jsx (dice.renderHistoryEntry) et
// lu par l'onglet Historique, le panneau d'historique et les notifications :
// rendu identique partout, aucune marge extérieure (la plateforme la porte).
//
// Traite le jet libre en premier (parseFreeRoll), puis :
//   vileborn_test  : réserve de l'approche (+ d12 d'obscurité de l'héritage),
//                    dé gardé, verdict d'un mot
//   vileborn_dark  : dé d'obscurité du MJ
//   vileborn_gift  : d6 de la contrepartie d'un don
//   vileborn_event : Rêverie, Pulsion (ligne sans dé)
// Tout le reste : null (rendu générique).
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { parseFreeRoll } from '../../../../tools/freeRoll.js';
import { VERDICT_LABELS, ordinal } from '../../config/rules/test.js';

const parseResult = (entry) => {
    const raw = entry?.roll_result;
    if (!raw) return null;
    if (typeof raw === 'string') {
        try { return JSON.parse(raw); } catch { return null; }
    }
    return raw;
};

const Head = ({ title, who }) => (
    <div className="vil-roll-head">
        <b>{title}</b>
        {who && <span>{who}</span>}
    </div>
);

const Die = ({ value, kept = false, dark = false }) => (
    <span className={`vil-die${dark ? ' is-dark' : ''}${kept ? ' is-kept' : ''}`}>{value}</span>
);

const FreeRollEntry = ({ free, who }) => (
    <div className="vil-roll">
        <Head title={free.label} who={who} />
        <div className="vil-roll-sub">
            {free.groups.map((g, i) => <span key={i}>{i > 0 ? ' · ' : ''}{g.notation} : {g.values.join(' + ')}</span>)}
            {free.modifier ? ` ${free.modifier > 0 ? '+' : '−'} ${Math.abs(free.modifier)}` : ''}
        </div>
        <div className="vil-verdict">{free.total}</div>
    </div>
);

const TestEntry = ({ r, who }) => {
    // Un seul dé gardé est marqué : le d12 s'il est strictement meilleur, sinon le premier meilleur dé
    const keptIndex = r.keptDark ? -1 : r.values.indexOf(r.kept);
    return (
        <div className="vil-roll">
            <Head title={`${r.label} · d${r.die}`} who={who} />
            <div className="vil-dice">
                {r.values.map((v, i) => <Die key={i} value={v} kept={i === keptIndex} />)}
                {r.dark && <><span className="vil-die-tag">+ obscurité</span><Die value={r.dark} dark kept={r.keptDark} /></>}
            </div>
            <div className="vil-roll-calc">
                Dé gardé <b>{r.kept}</b>{r.modifier ? ` ${r.modifier > 0 ? '+' : '−'} ${Math.abs(r.modifier)}` : ''} contre <b>{r.difficulty}</b>
            </div>
            <div className={`vil-verdict is-${r.verdict}`}>{VERDICT_LABELS[r.verdict]}</div>
            {r.dark && (
                <div className={`vil-roll-dark${r.darkComplication ? ' is-hit' : ''}`}>
                    Sombre héritage ({ordinal(r.ticks)} coche) : d12 = {r.dark}, {r.darkComplication ? 'complication' : 'pas de complication'} ({r.darkThreshold}+)
                </div>
            )}
        </div>
    );
};

const VilHistoryEntry = ({ roll }) => {
    const entry = roll?.roll ?? roll;
    const who = entry?.character_name ?? null;

    const free = parseFreeRoll(entry);
    if (free) return <FreeRollEntry free={free} who={who} />;

    const r = parseResult(entry);
    if (!r) return null;

    switch (entry?.roll_type) {
    case 'vileborn_test':
        return Array.isArray(r.values) ? <TestEntry r={r} who={who} /> : null;
    case 'vileborn_dark':
        return (
            <div className="vil-roll">
                <Head title="Dé d'obscurité" who={who} />
                <div className="vil-dice">
                    <Die value={r.value} dark kept />
                    {r.threshold && <span className="vil-roll-sub">complication sur {r.threshold}+</span>}
                </div>
                {r.threshold && <div className={`vil-verdict ${r.complication ? 'is-complication' : 'is-success'}`}>{r.complication ? 'Complication' : 'Rien'}</div>}
            </div>
        );
    case 'vileborn_gift':
        return (
            <div className="vil-roll">
                <Head title={r.giftName ?? r.label} who={who} />
                <div className="vil-dice"><Die value={r.value} kept={r.triggered} /><span className="vil-roll-sub">d6 du don</span></div>
                {r.triggered && <div className="vil-roll-dark is-hit">La contrepartie s'applique.</div>}
            </div>
        );
    case 'vileborn_event':
        return (
            <div className="vil-roll">
                <Head title={r.label} who={who} />
                {r.text && <div className="vil-roll-sub">{r.text}</div>}
            </div>
        );
    default:
        return null;   // rendu générique
    }
};

export default VilHistoryEntry;
