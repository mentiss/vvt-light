// src/client/src/systems/fabula/components/layout/FabulaHistoryEntry.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Rendu d'un jet (planche §5) — utilisé par renderHistoryEntry (config.jsx) ET
// par les notifications : même affichage partout, sans marge extérieure (la
// carte de la plateforme la porte).
//   gemmes miniatures à gauche · intitulé · total en grand à droite ·
//   ligne de détail : formule, VH, ND, verdict incliné, compétences appliquées,
//   dégâts ; un critique garde le total doré.
//
// Gère roll_type === 'fabula_test' / 'fabula_economie' (FabulaDiceModal),
// 'fabula_objet' (objet de la fiche de groupe utilisé, sans dé) et le
// jet libre 'free_roll' (FreeDiceModal, appelants en renderAllRollTypes). Tout le
// reste retourne null → l'appelant retombe sur son rendu générique.
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { parseFreeRoll } from '../../../../tools/freeRoll.js';
import FuIcon from '../ui/FuIcon.jsx';
import FuDie from '../ui/FuDie.jsx';

const GEMS = [6, 8, 10, 12];
const signed = (n) => (n >= 0 ? `+ ${n}` : `− ${-n}`);
const TYPE_LABELS = { physique: 'physiques', feu: 'de feu', glace: 'de glace', foudre: 'de foudre', air: "d'air", terre: 'de terre', lumiere: 'de lumière', tenebres: 'de ténèbres', poison: 'de poison' };

// Jet libre : un dé en gemme quand sa taille en a une, sinon la notation
const FreeRollEntry = ({ free }) => {
    const dice = free.groups.flatMap(g => {
        const sides = Number(String(g.notation).match(/d(\d+)/)?.[1]);
        return GEMS.includes(sides) ? g.values.map(v => ({ sides, v })) : [];
    });
    // Dés sans gemme (d4, d20, d100…) : valeurs écrites dans la ligne de détail
    const describe = (g) => GEMS.includes(Number(String(g.notation).match(/d(\d+)/)?.[1]))
        ? g.notation : `${g.notation} = ${g.values.join(' + ')}`;
    return (
        <div className="fu-log">
            <div className="fu-log-dice">
                {dice.length > 0
                    ? dice.slice(0, 4).map((d, i) => <FuDie key={i} size={d.sides} label={d.v} small />)
                    : <span className="fu-log-icon"><FuIcon name="dice" className="fu-ico-sm" /></span>}
            </div>
            <div className="fu-log-title">{free.label}</div>
            <div className="fu-log-total">{free.total}</div>
            <div className="fu-log-line">
                {free.groups.map(describe).join(' · ')}
                {free.modifier ? <span>{signed(free.modifier)}</span> : null}
            </div>
        </div>
    );
};

const parseResult = (entry) => {
    const raw = entry?.roll_result;
    if (!raw) return null;
    if (typeof raw === 'string') {
        try { return JSON.parse(raw); } catch { return null; }
    }
    return raw;
};

const FabulaHistoryEntry = ({ roll }) => {
    const entry  = roll?.roll ?? roll;
    const result = parseResult(entry);
    const rollType = entry?.roll_type ?? '';

    const free = parseFreeRoll(entry);
    if (free) return <FreeRollEntry free={free} />;

    if (!result || !['fabula_test', 'fabula_economie', 'fabula_objet'].includes(rollType)) {
        return null; // rendu générique
    }

    const label = result.label || entry?.label || 'Jet';

    // Objet de la fiche de groupe utilisé (spec_fabula.md §7, Q-7) : pas de dé, coût en PI
    if (result.type === 'objet') {
        return (
            <div className="fu-log">
                <div className="fu-log-dice"><span className="fu-log-icon"><FuIcon name="potion" className="fu-ico-sm" /></span></div>
                <div className="fu-log-title">{label}</div>
                <div className="fu-log-total is-pi">−{result.pi} PI</div>
                <div className="fu-log-line">Objet du groupe · {result.effet}</div>
            </div>
        );
    }

    if (result.type === 'economie') {
        return (
            <div className="fu-log">
                <div className="fu-log-dice">
                    {(result.values ?? []).map((v, i) => <FuDie key={i} size={6} label={v} small />)}
                </div>
                <div className="fu-log-title">{label}</div>
                <div className="fu-log-total">{result.total} z</div>
                <div className="fu-log-line">({(result.values ?? []).join(' + ')}) × 10 zénits</div>
            </div>
        );
    }

    const crit = !!result.criticalSuccess;
    const fumble = !!result.criticalFailure;
    let verdict = null;
    if (crit) verdict = <span className="fu-verdict is-sm is-crit">Critique</span>;
    else if (fumble) verdict = <span className="fu-verdict is-sm is-ko">Échec critique</span>;
    else if (result.success === true) verdict = <span className="fu-verdict is-sm is-ok">Réussite</span>;
    else if (result.success === false) verdict = <span className="fu-verdict is-sm is-ko">Échec</span>;
    const showDmg = result.type === 'attaque' && result.degats != null && !fumble && result.success !== false;

    return (
        <div className="fu-log">
            <div className="fu-log-dice">
                <FuDie size={result.dieSize1} label={result.die1} small />
                <FuDie size={result.dieSize2} label={result.die2} small />
            </div>
            <div className="fu-log-title">
                {result.type === 'attaque' && <FuIcon name="sword" className="fu-ico-sm text-primary mr-1" />}
                {label}
            </div>
            <div className={`fu-log-total${crit ? ' is-crit' : fumble ? ' is-ko' : ''}`}>{result.total}</div>
            <div className="fu-log-line">
                <span>
                    {result.die1} + {result.die2}
                    {result.modifier ? ` ${signed(result.modifier)}` : ''}
                    {result.bonus ? ` ${signed(result.bonus)}` : ''}
                    {' · '}VH {result.vh}
                    {result.nd != null ? ` · ND ${result.nd}` : ''}
                </span>
                {verdict}
                {(result.skills ?? []).map(n => <span key={n} className="fu-tag text-primary">{n}</span>)}
                {result.lucky && <span className="fu-tag text-secondary">Porte-bonheur : {result.lucky.from} → {result.lucky.to}</span>}
                {showDmg && <span className="fu-log-dmg">Dégâts {result.degats} {TYPE_LABELS[result.degatsType] ?? result.degatsType}</span>}
            </div>
        </div>
    );
};

export default FabulaHistoryEntry;
