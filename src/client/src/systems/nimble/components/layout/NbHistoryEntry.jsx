// src/client/src/systems/nimble/components/layout/NbHistoryEntry.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Rendu d'un jet, déclaré une fois dans config.jsx (dice.renderHistoryEntry) et
// lu par l'onglet Historique, le panneau d'historique et les notifications :
// rendu identique partout, aucune marge extérieure (la plateforme la porte).
//
// Jet libre d'abord (parseFreeRoll), puis :
//   nimble_attack     : dés (retirés barrés, dé primaire cerclé d'or), chaîne de
//                       critique en étincelles, dés Féroce, total ; raté / critique
//   nimble_check/save : d20 gardé, total, DD et verdict
//   nimble_initiative : total et actions obtenues
//   nimble_hitdice    : dés de vie et PV rendus
//   nimble_plain      : somme simple
// Tout le reste : null (rendu générique).
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { parseFreeRoll } from '@/features/dice/tools/freeRoll.js';
import { signed } from '../../config/rules/formula.js';

const parseResult = (entry) => {
    const raw = entry?.roll_result;
    if (!raw) return null;
    if (typeof raw === 'string') {
        try { return JSON.parse(raw); } catch { return null; }
    }
    return raw;
};

const Head = ({ title, who }) => (
    <div className="nb-roll-head"><b>{title}</b>{who && <span>{who}</span>}</div>
);

const Die = ({ value, cls = '' }) => <span className={`nb-die ${cls}`}>{value}</span>;

const Total = ({ value, label }) => <div className="nb-roll-total">{value}{label && <small>{label}</small>}</div>;

const edgeText = (edge) => (edge > 0 ? `avantage ${edge}` : edge < 0 ? `désavantage ${-edge}` : '');

const FreeRollEntry = ({ free, who }) => (
    <div className="nb-roll">
        <Head title={free.label} who={who} />
        <div className="nb-roll-body">
            <div className="nb-dice">
                {free.groups.flatMap((g, i) => g.values.map((v, j) => <Die key={`${i}-${j}`} value={v} />))}
            </div>
            <Total value={free.total} label="total" />
            <div className="nb-roll-sub">
                {free.groups.map(g => g.notation).join(' · ')}{free.modifier ? ` ${signed(free.modifier)}` : ''}
            </div>
        </div>
    </div>
);

const AttackEntry = ({ r, who }) => {
    const cls = (i) => {
        if (r.dropped?.includes(i)) return 'is-dropped';
        if (i !== r.primaryIndex) return '';
        return `is-primary${r.miss ? ' is-miss' : r.crit ? ' is-crit' : ''}`;
    };
    const verdict = r.miss ? { cls: 'is-miss', text: 'Raté' } : r.crit ? { cls: 'is-crit', text: r.critCount > 1 ? `Critique ×${r.critCount}` : 'Critique' } : null;
    const sub = [r.source, r.specialDie ?? (r.sides ? `d${r.sides}` : null), edgeText(r.edge), r.bonus ? `mod. ${signed(r.bonus)}` : null,
        r.opening ? 'ouverture' : null, r.damageType].filter(Boolean).join(' · ');
    return (
        <div className={`nb-roll${r.crit ? ' is-crit' : ''}${r.miss ? ' is-miss' : ''}`}>
            <Head title={r.label} who={who} />
            <div className="nb-roll-body">
                <div className="nb-dice">
                    {r.base.map((v, i) => <Die key={i} value={v} cls={cls(i)} />)}
                    {r.chain?.map((v, i) => (
                        <React.Fragment key={`c${i}`}>
                            <span className="nb-spark" aria-hidden="true">✦</span>
                            <Die value={v} cls="is-chain" />
                            {r.vicious?.[i] !== undefined && <Die value={r.vicious[i]} cls="is-vicious" />}
                        </React.Fragment>
                    ))}
                </div>
                <Total value={r.total} label="dégâts" />
                {verdict && <div className={`nb-verdict ${verdict.cls}`}>{verdict.text}</div>}
                {sub && <div className="nb-roll-sub">{sub}{r.note ? ` · ${r.note}` : ''}</div>}
            </div>
        </div>
    );
};

const D20Entry = ({ r, who }) => {
    let verdict = null;
    if (r.type === 'initiative') verdict = { cls: 'is-success', text: `${r.actions} action${r.actions > 1 ? 's' : ''}` };
    else if (r.nat20) verdict = { cls: 'is-crit', text: '20 naturel : réussite' };
    else if (r.nat1) verdict = { cls: 'is-fail', text: '1 naturel : échec' };
    else if (r.success !== null) verdict = r.success ? { cls: 'is-success', text: 'Réussite' } : { cls: 'is-fail', text: 'Échec' };
    const sub = [edgeText(r.edge), `mod. ${signed(r.bonus ?? 0)}`, r.dc ? `DD ${r.dc}` : null, r.note].filter(Boolean).join(' · ');
    return (
        <div className={`nb-roll${r.nat20 ? ' is-crit' : ''}`}>
            <Head title={r.label} who={who} />
            <div className="nb-roll-body">
                <div className="nb-dice">
                    {r.values.map((v, i) => <Die key={i} value={v} cls={i === r.keptIndex ? `is-primary${v === 20 ? ' is-crit' : v === 1 ? ' is-miss' : ''}` : 'is-dropped'} />)}
                </div>
                <Total value={r.total} label={r.type === 'initiative' ? 'initiative' : 'total'} />
                {verdict && <div className={`nb-verdict ${verdict.cls}`}>{verdict.text}</div>}
                <div className="nb-roll-sub">{sub}</div>
            </div>
        </div>
    );
};

const SumEntry = ({ r, who, label, sub }) => (
    <div className="nb-roll">
        <Head title={r.label || label} who={who} />
        <div className="nb-roll-body">
            <div className="nb-dice">{r.values.map((v, i) => <Die key={i} value={r.max ? r.sides : v} />)}</div>
            <Total value={r.total} label={label} />
            {sub && <div className="nb-roll-sub">{sub}</div>}
        </div>
    </div>
);

const NbHistoryEntry = ({ roll }) => {
    const entry = roll?.roll ?? roll;
    const who = entry?.character_name ?? null;

    const free = parseFreeRoll(entry);
    if (free) return <FreeRollEntry free={free} who={who} />;

    const r = parseResult(entry);
    if (!r) return null;

    switch (entry?.roll_type) {
    case 'nimble_attack':
        return Array.isArray(r.base) ? <AttackEntry r={r} who={who} /> : null;
    case 'nimble_check':
    case 'nimble_save':
    case 'nimble_initiative':
        return Array.isArray(r.values) ? <D20Entry r={r} who={who} /> : null;
    case 'nimble_hitdice':
        return Array.isArray(r.values)
            ? <SumEntry r={r} who={who} label="PV rendus" sub={`${r.values.length}d${r.sides}${r.max ? ' au maximum (camp)' : ''} · ${signed(r.perDie)} par dé`} />
            : null;
    case 'nimble_minions':
        return Array.isArray(r.values) ? (
            <div className="nb-roll">
                <Head title={r.label} who={who} />
                <div className="nb-roll-body">
                    <div className="nb-dice">{r.values.map((v, i) => <Die key={i} value={v} cls={v === 1 ? 'is-miss' : ''} />)}</div>
                    <Total value={r.total} label="dégâts" />
                    <div className="nb-roll-sub">{r.values.length} sbire{r.values.length > 1 ? 's' : ''} · {r.hits} touche{r.hits > 1 ? 'nt' : ''} · une seule attaque (une seule défense)</div>
                </div>
            </div>
        ) : null;
    case 'nimble_levelhp':
        return Array.isArray(r.values) ? (
            <div className="nb-roll">
                <Head title={r.label || 'Montée de niveau'} who={who} />
                <div className="nb-roll-body">
                    <div className="nb-dice">{r.values.map((v, i) => <Die key={i} value={v} cls={i === r.keptIndex ? 'is-primary' : 'is-dropped'} />)}</div>
                    <Total value={`+${r.total}`} label="PV max" />
                    <div className="nb-roll-sub">d{r.sides} avec avantage</div>
                </div>
            </div>
        ) : null;
    case 'nimble_plain':
        return Array.isArray(r.values)
            ? <SumEntry r={r} who={who} label="total" sub={[`${r.values.length}d${r.sides}${r.bonus ? ` ${signed(r.bonus)}` : ''}`, r.note].filter(Boolean).join(' · ')} />
            : null;
    default:
        return null;   // rendu générique
    }
};

export default NbHistoryEntry;
