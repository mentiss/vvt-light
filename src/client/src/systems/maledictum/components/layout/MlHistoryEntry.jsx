// src/client/src/systems/maledictum/components/layout/MlHistoryEntry.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Rendu d'un jet, déclaré une fois dans config.jsx (dice.renderHistoryEntry) et
// lu par l'onglet Historique, le panneau d'historique et les notifications :
// rendu identique partout, aucune marge extérieure (la plateforme la porte).
// Chaque jet s'affiche dans le thème de son auteur (roll_result.theme, data-livery).
//
// Jet libre d'abord (parseFreeRoll), puis :
//   maledictum_test / _attack / _power : d100 (dizaine, unité), inversion par
//     l'Avantage, DR et palier ; attaque : Critique / Maladresse, localisation,
//     dégâts ; pouvoir : Charge Warp, Forcer, Périls
//   maledictum_chargen : 9 caractéristiques tirées
//   maledictum_d10 / _table : valeur et entrée de table
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { parseFreeRoll } from '../../../../tools/freeRoll.js';
import { formatSl, signed, splitD100, LOCATION_LABELS } from '../../config/rules/dice.js';
import { CHAR_KEYS, CHAR_SHORT } from '../../config/rules/character.js';
import { TABLE_LABELS } from '../../config/rules/tables.js';

const parseResult = (entry) => {
    const raw = entry?.roll_result;
    if (!raw) return null;
    if (typeof raw === 'string') {
        try { return JSON.parse(raw); } catch { return null; }
    }
    return raw;
};

const Shell = ({ theme, who, title, time, children }) => (
    <div className="im-roll" data-livery={theme || undefined}>
        {who && <div className="im-roll-who">{who}</div>}
        <div className="im-roll-head"><b>{title}</b>{time && <span>{time}</span>}</div>
        {children}
    </div>
);

const D100 = ({ value }) => {
    const { tens, units } = splitD100(value);
    return <span className="im-d10"><i className="is-tens">{tens}</i><i>{units}</i></span>;
};

const edgeText = (edge) => (edge > 0 ? `Avantage ×${edge}` : edge < 0 ? `Désavantage ×${-edge}` : null);
const two = (v) => String(Number(v) % 100).padStart(2, '0');

const Verdict = ({ r }) => (
    <span className={`im-verdict${r.success ? '' : ' is-fail'}`}>
        {formatSl(r.sl, r.success)} DR<small>{r.band} · seuil {r.target}</small>
    </span>
);

const TestBody = ({ r }) => {
    const swap = r.reversed ? <>{edgeText(r.edge)} : {two(r.roll)} → <b>{two(r.used)}</b></> : (r.double ? 'Double' : null);
    const sub = [
        r.difficulty ? `Difficulté ${signed(r.difficulty)}` : 'Exigeant (+0)',
        !r.reversed && r.edge ? edgeText(r.edge) : null,
        r.slBonus ? `${signed(r.slBonus)} DR après le jet` : null,
        r.auto === 'success' ? '01-05 : réussite automatique' : r.auto === 'failure' ? '96-00 : échec automatique' : null,
        r.note,
    ].filter(Boolean).join(' · ');
    return (
        <>
            <div className="im-roll-line"><D100 value={r.used} />{swap && <span className="im-swap">{swap}</span>}<Verdict r={r} /></div>
            {sub && <div className="im-roll-sub">{sub}</div>}
        </>
    );
};

const AttackExtra = ({ r }) => {
    if (r.fumble) return <div className="im-roll-crit is-fumble"><b>Maladresse</b> · à tirer sur la table (d10)</div>;
    if (!r.hit) return <div className="im-roll-crit is-miss">{r.opposed ? `Esquivé ou paré (écart ${signed(r.margin)} DR)` : 'Raté'}</div>;
    return (
        <div className="im-roll-crit">
            {r.critical && <b>Critique · </b>}
            {LOCATION_LABELS[r.location]} · <b>{r.damage} dégâts</b>
            {r.opposed ? ` (écart ${signed(r.margin)} DR)` : ''}
        </div>
    );
};

const PowerExtra = ({ r }) => (
    <div className={`im-roll-crit${r.perils ? ' is-fumble' : ''}`}>
        Charge Warp <b>+{r.charge}</b>{r.push ? ` (dont Forcer +${r.pushDie})` : ''}
        {r.critical && ' · Critique : Indice réduit'}
        {r.fumble && !r.perils && ' · Maladresse : Charge doublée'}
        {r.perils && <b> · Périls du Warp immédiats</b>}
    </div>
);

const MlHistoryEntry = ({ roll }) => {
    const entry = roll?.roll ?? roll;
    const who = entry?.character_name ?? null;

    const free = parseFreeRoll(entry);
    if (free) {
        return (
            <Shell who={who} title={free.label}>
                <div className="im-roll-line">
                    <span className="im-dice">{free.groups.flatMap((g, i) => g.values.map((v, j) => <i key={`${i}-${j}`}>{v}</i>))}</span>
                    <span className="im-verdict is-total">{free.total}<small>total</small></span>
                </div>
                <div className="im-roll-sub">{free.groups.map(g => g.notation).join(' · ')}{free.modifier ? ` ${signed(free.modifier)}` : ''}</div>
            </Shell>
        );
    }

    const r = parseResult(entry);
    if (!r) return null;

    switch (entry.roll_type) {
    case 'maledictum_test':
        return <Shell theme={r.theme} who={who} title={r.label}><TestBody r={r} /></Shell>;
    case 'maledictum_attack':
        return <Shell theme={r.theme} who={who} title={r.label}><TestBody r={r} /><AttackExtra r={r} /></Shell>;
    case 'maledictum_power':
        return <Shell theme={r.theme} who={who} title={r.label}><TestBody r={r} /><PowerExtra r={r} /></Shell>;
    case 'maledictum_chargen':
        return r.chars ? (
            <Shell theme={r.theme} who={who} title={r.label || 'Caractéristiques'}>
                <div className="im-roll-chars">
                    {CHAR_KEYS.map(k => <span key={k}><b>{CHAR_SHORT[k]}</b>{r.chars[k]}</span>)}
                </div>
                <div className="im-roll-sub">2d10 + 20 par caractéristique, dans l'ordre</div>
            </Shell>
        ) : null;
    case 'maledictum_d10':
    case 'maledictum_table':
        return Array.isArray(r.values) ? (
            <Shell theme={r.theme} who={who} title={r.label || TABLE_LABELS[r.tableKey] || 'Jet'}>
                <div className="im-roll-line">
                    {entry.roll_type === 'maledictum_table' ? <D100 value={r.values[0]} /> : <span className="im-dice"><i>{r.values[0]}</i></span>}
                    <span className="im-verdict is-total">{r.total}<small>{r.bonus ? `${r.values[0]} ${signed(r.bonus)}` : TABLE_LABELS[r.tableKey] ?? 'résultat'}</small></span>
                </div>
                {r.entry && <div className="im-roll-crit"><b>{r.entry.label}</b>{r.entry.effect ? ` · ${r.entry.effect}` : ''}</div>}
            </Shell>
        ) : null;
    default:
        return null;   // rendu générique
    }
};

export default MlHistoryEntry;
