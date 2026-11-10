// src/client/src/systems/maledictum/components/npc/MlNpcSheet.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Partie système d'un PNJ d'Imperium Maledictum (spec_pnj.md §8), posée par la
// brique NpcSystem (props { npc, state, onStateChange, hiddenRolls, sessionId, name }) :
// reprise de l'ancienne carte de rencontre (spec_maledictum.md §11.4).
//   - caractéristiques, attaques et compétences lancées en un clic (d100) ;
//     jet caché de l'historique si l'onglet le demande ;
//   - à la table : Blessures et Blessures critiques selon le rôle (mort subite, p.317) ;
//   - traits et possessions repliés.
// En bibliothèque (pas d'état), mêmes informations sans le suivi des Blessures.
// Règles : config/rules/npc.js.
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { CHAR_KEYS, CHAR_SHORT } from '../../config/rules/character.js';
import { ROLE_LABELS, attackRoll, critMax, isOut } from '../../config/rules/npc.js';
import { useMlRoll } from '../../hooks/useMlRoll.js';
import { Stepper } from '../ui/MlUi.jsx';
import MlHistoryEntry from '../layout/MlHistoryEntry.jsx';
import { specName, RANGE_LABELS } from '../layout/MlSections.jsx';

const MlNpcSheet = ({ npc, state, onStateChange, hiddenRolls, sessionId, name }) => {
    const p = npc.systemData ?? {};
    const { launch, rolling, error, entry } = useMlRoll();
    const roll = (label, value, attack = null) => launch({
        characterId: -1, characterName: name, sessionId, label: `${name} · ${label}`, persistHistory: !hiddenRolls,
        type: attack ? 'attack' : 'test',
        systemData: attack ? attackRoll(attack) : { target: Number(value ?? 0), theme: null },
    });
    const max = Number(p.wounds ?? 0);
    const out = isOut(p, state);
    const traits = p.traits ?? [];

    return (
        <div className="im-npc-body">
            <div className="im-note">
                {ROLE_LABELS[p.role] ?? ''} · Armure {p.armour ?? '—'} · Init. {p.initiative ?? '—'} · Détermination {p.resolve ?? '—'}
                {p.warpThreshold ? ` · Seuil Warp ${p.warpThreshold}` : ''}
            </div>
            <div className="im-npc-chars">
                {CHAR_KEYS.map(k => (
                    <button key={k} type="button" className="im-npc-char" disabled={rolling || p.chars?.[k] == null} onClick={() => roll(CHAR_SHORT[k], p.chars?.[k])}>
                        <b>{CHAR_SHORT[k]}</b>{p.chars?.[k] ?? '—'}
                    </button>
                ))}
            </div>
            {state ? (
                <>
                    <div className="im-res-row"><b>Blessures</b><span>{state.wounds ?? 0} <small>/ {max}</small></span></div>
                    <Stepper value={state.wounds ?? 0} onChange={v => onStateChange({ wounds: Math.min(max, v) })} min={0} max={max} editable unit="Blessures" />
                    <div className="im-res-row">
                        <b>Blessures critiques</b>
                        <span className={out ? 'is-danger' : ''}>{state.crits ?? 0} <small>/ {critMax(p)}{out ? ' · hors de combat' : ''}</small></span>
                    </div>
                    <Stepper value={state.crits ?? 0} onChange={v => onStateChange({ crits: v })} min={0} max={20} editable text="critique(s)" />
                </>
            ) : (
                <div className="im-note">Blessures {max} · Blessures critiques {critMax(p)}</div>
            )}
            {(p.attacks ?? []).length > 0 && <div className="im-sub">Attaques</div>}
            {(p.attacks ?? []).map((a, i) => (
                // relecture: F-KEY — attaques sans identifiant, liste figée de la fiche
                <button key={`${a.label}-${i}`} type="button" className="im-power" disabled={rolling} onClick={() => roll(a.label, a.value, a)}>
                    <b>{a.label} · {a.value}</b><span>{a.damage}{a.range ? ` · ${RANGE_LABELS[a.range] ?? a.range}` : ''}{a.traits ? ` · ${a.traits}` : ''}</span>
                </button>
            ))}
            {Object.keys(p.skills ?? {}).length > 0 && <div className="im-sub">Compétences</div>}
            <div className="im-row">
                {Object.entries(p.skills ?? {}).map(([k, v]) => (
                    <button key={k} type="button" className="vtt-pill" disabled={rolling} onClick={() => roll(specName(k), v)}>{specName(k)} {v}</button>
                ))}
            </div>
            {error && <p className="im-note is-danger">{error}</p>}
            {/* Dernier jet de la fiche : seul endroit où se lit un jet caché (absent de l'historique) */}
            {entry && <div className="vtt-history-entry"><MlHistoryEntry roll={entry} /></div>}
            {(traits.length > 0 || p.possessions) && (
                <details className="im-npc-fold">
                    <summary>Traits ({traits.length})</summary>
                    {traits.map((t, i) => <p key={`${t.label}-${i}`} className="im-note"><b>{t.label}.</b> {t.summary}</p>)}
                    {p.possessions && <p className="im-note"><b>Possessions.</b> {p.possessions}</p>}
                </details>
            )}
        </div>
    );
};

export default MlNpcSheet;
