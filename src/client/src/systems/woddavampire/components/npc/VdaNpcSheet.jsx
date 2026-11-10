// src/client/src/systems/woddavampire/components/npc/VdaNpcSheet.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Partie système d'un PNJ du Conteur (spec_pnj.md §10.3), posée par la brique
// NpcSystem (props { npc, state, onStateChange, pick, name, onRoll }) ; blocs selon la nature :
//   - personnage, fantôme, animal : Attributs et Capacités à choisir pour le jet composé
//     (barre « Lancer » de la plateforme), Disciplines, Volonté, sang (Passion d'un fantôme),
//     santé à cliquer à la table, attaques lancées en un clic (réserve de dégâts) ;
//   - nuée : dégâts, santé, initiative ; esprit : Volonté, Rage, Gnose, Essence, Charmes.
// Règles : config/rules/npc.js ; jet : vdaNpcPick.js, VdaNpcRollWindow.jsx.
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { ATTRIBUTE_GROUPS } from '../../config/traits.js';
import { DISCIPLINES } from '../../config/disciplines.js';
import { DAMAGE_TYPE_SHORT } from '../../config/equipment.js';
import { cycleNpcHealth, hasTraits, npcHealthLevels, npcHealthMarks, npcWound } from '../../config/rules/npc.js';
import { VdaChip, VdaStepper } from '../ui/VdaUi.jsx';
import { abilityLabel } from './vdaNpcPick.js';

// Piste de santé d'un PNJ : à la table, clic = vide → contondant → létal → aggravé → vide
const NpcHealth = ({ sd, state, onStateChange }) => {
    const levels = npcHealthLevels(sd);
    const marks = npcHealthMarks(sd, state);
    const wound = npcWound(sd, state);
    return (
        <table className="vda-health"><tbody>
            {levels.map((lvl, i) => (
                // relecture: F-KEY — niveaux de santé sans identifiant, liste figée de la fiche
                <tr key={i} className={i === wound.worstIndex ? 'is-worst' : ''}>
                    <td>{lvl.label}</td>
                    <td className="pen">{lvl.penalty ? lvl.penalty : ''}</td>
                    <td>{state && <button type="button" className={`vda-hbox${marks[i] ? ` is-${marks[i]}` : ''}`} aria-label={`${lvl.label} : changer la blessure`}
                                         onClick={() => onStateChange(cycleNpcHealth(sd, state, i))} />}</td>
                </tr>
            ))}
        </tbody></table>
    );
};

const Value = ({ label, value }) => (value == null || value === '' ? null : <span className="vda-npc-value"><b>{label}</b> {value}</span>);

// Ressource dépensable à la table (Volonté, sang, Essence) ; en bibliothèque, sa valeur seule
const Resource = ({ label, max, value, onChange }) => (max == null ? null : (
    <span className="vda-npc-value"><b>{label}</b>
        {onChange ? <><VdaStepper value={value ?? max} min={0} max={Math.max(max, 1)} onChange={onChange} label={label} /> / {max}</> : ` ${max}`}
    </span>
));

// Traits, pouvoirs et notes de la fiche, repliés
const Traits = ({ sd }) => ((sd.traits ?? []).length === 0 ? null : (
    <details className="vda-npc-fold">
        <summary>Traits ({sd.traits.length})</summary>
        {sd.traits.map((t, i) => <p key={`${t.name}-${i}`} className="vda-npc-line"><b>{t.name}.</b> {t.text}</p>)}
    </details>
));

const VdaNpcSheet = ({ npc, state, onStateChange, pick, name, onRoll }) => {
    const sd = npc.systemData ?? {};
    const nature = sd.nature ?? 'character';
    const set = state ? onStateChange : null;
    // Dégâts : jamais d'échec critique (spec_woddavampire.md §3.5)
    const rollDamage = (label, dice) => onRoll?.({ name, label: `${name} · ${label}`, dice: Number(dice) || 0, difficulty: 6, specialty: false, cannotBotch: true });

    if (nature === 'swarm') {
        return (
            <div className="vda-npc-body">
                <div className="vda-npc-values"><Value label="Santé" value={sd.healthPoints} /><Value label="Initiative" value={sd.initiative} /></div>
                {state && <span className="vda-npc-value"><b>Niveaux perdus</b>
                    <VdaStepper value={state.damage ?? 0} min={0} max={Number(sd.healthPoints ?? 99)} onChange={v => onStateChange({ damage: v })} label="Niveaux perdus" /></span>}
                {sd.damage != null && <button type="button" className="vda-chip" onClick={() => rollDamage('dégâts de la nuée', sd.damage)}>Dégâts {sd.damage} dés</button>}
                <Traits sd={sd} />
            </div>
        );
    }

    if (nature === 'spirit') {
        return (
            <div className="vda-npc-body">
                <div className="vda-npc-values">
                    <Value label="Volonté" value={sd.willpower} /><Value label="Rage" value={sd.rage} /><Value label="Gnose" value={sd.gnosis} />
                    <Resource label="Essence" max={sd.essence} value={state?.essence} onChange={set && (v => onStateChange({ essence: v }))} />
                </div>
                {(sd.charms ?? []).length > 0 && (
                    <details className="vda-npc-fold" open={!state}>
                        <summary>Charmes ({sd.charms.length})</summary>
                        {sd.charms.map((c, i) => <p key={`${c.name}-${i}`} className="vda-npc-line"><b>{c.name}{c.cost ? ` (${c.cost})` : ''}.</b> {c.text}</p>)}
                    </details>
                )}
                <Traits sd={sd} />
            </div>
        );
    }

    const groups = nature === 'animal' ? ATTRIBUTE_GROUPS.filter(g => g.key !== 'social') : ATTRIBUTE_GROUPS;
    return (
        <div className="vda-npc-body">
            {hasTraits(sd) && (
                <div className="vda-npc-attrs">
                    {groups.map(g => (
                        <div key={g.key} className="vda-chips is-small">
                            {g.attributes.map(([k, l]) => (
                                <VdaChip key={k} on={!!pick?.isPicked('attribute', k)} onClick={() => pick?.toggle('attribute', k)}>{l} {sd.attributes?.[k] ?? 0}</VdaChip>
                            ))}
                        </div>
                    ))}
                </div>
            )}
            {(sd.abilities ?? []).length > 0 && (
                <div className="vda-chips is-small">
                    {sd.abilities.map(a => (
                        <VdaChip key={a.key} on={!!pick?.isPicked('ability', a.key)} onClick={() => pick?.toggle('ability', a.key)}
                                 title={a.trained ? 'Spécimen dressé seulement' : undefined}>
                            {a.trained ? '[' : ''}{abilityLabel(a)} {a.rating}{a.trained ? ']' : ''}
                        </VdaChip>
                    ))}
                </div>
            )}
            {(sd.disciplines ?? []).length > 0 && (
                <div className="vda-npc-line">{sd.disciplines.map(d => `${DISCIPLINES[d.key]?.label ?? d.key} ${d.rating}`).join(', ')}</div>
            )}
            <div className="vda-npc-values">
                <Resource label="Volonté" max={sd.willpower} value={state?.willpower} onChange={set && (v => onStateChange({ willpower: v }))} />
                {Number(sd.blood) > 0 && (
                    <Resource label={nature === 'ghost' ? 'Passion' : 'Sang'} max={sd.blood} value={state?.blood} onChange={set && (v => onStateChange({ blood: v }))} />
                )}
            </div>
            <NpcHealth sd={sd} state={state} onStateChange={onStateChange} />
            {(sd.attacks ?? []).map((a, i) => (
                // relecture: F-KEY — attaques sans identifiant, liste figée de la fiche
                <div key={`${a.name}-${i}`} className="vda-npc-line">
                    {a.dice ? (
                        <button type="button" className="vda-chip" onClick={() => rollDamage(a.name, a.dice)}>
                            {a.name} {a.dice} dé{a.dice > 1 ? 's' : ''}{a.type ? ` ${DAMAGE_TYPE_SHORT[a.type] ?? a.type}` : ''}
                        </button>
                    ) : <b>{a.name}</b>}
                    {a.text && <span className="vda-npc-note"> {a.text}</span>}
                </div>
            ))}
            <Traits sd={sd} />
        </div>
    );
};

export default VdaNpcSheet;
