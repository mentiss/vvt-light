// src/client/src/systems/cyberpunk/components/creation/StepStats.jsx
// Étape 3 : profil de répartition, puis chaque valeur posée sur une stat.
// Deux façons (P-2) : clic sur la valeur puis sur la stat (tablette), ou glisser.
// Clic sur une stat posée : la valeur revient dans la réserve.
import React, { useState } from 'react';
import { STAT_PROFILES, STATS, STAT_LABELS, STAT_DESCRIPTIONS, findPlaybook, playbookStatProfile } from '../../config.jsx';
import { useSystem } from '@/app/hooks/useSystem.js';
import { usePlaybookMoves } from '../../hooks/usePlaybookMoves.js';
import { Card } from '../layout/Card.jsx';
import { StepHead, PickCard, StatProfile } from './CreationParts.jsx';

const sign = (v) => (v > 0 ? `+${v}` : v < 0 ? `−${Math.abs(v)}` : '±0');
const HEX = <svg viewBox="0 0 100 114" aria-hidden="true"><polygon points="50,3 96,29 96,85 50,111 4,85 4,29" /></svg>;

const StepStats = ({ playbook, profile, stats, pool, onProfile, onPlace, onReturn, onReset }) => {
    const { apiBase } = useSystem();
    const { moves, loaded } = usePlaybookMoves(apiBase, [playbook]);
    const used = playbookStatProfile(moves, playbook);
    const usedBy = Object.fromEntries(used.map(u => [u.stat, u.count]));
    const [picked, setPicked] = useState(null);   // id de la valeur choisie (clic)
    const [over,   setOver]   = useState(null);   // stat survolée pendant un glisser
    const remaining = STATS.filter(s => stats[s] === null).length;

    const place = (stat, chipId) => {
        if (stats[stat] !== null) { if (!chipId) onReturn(stat); return; }
        if (chipId) { onPlace(stat, chipId); setPicked(null); }
    };

    return (
        <>
            <StepHead num={3} title="Stats" remaining={profile ? remaining : STATS.length} unit={['valeur à placer', 'valeurs à placer']}
                      sub="Choisis un profil, puis pose chaque valeur sur une stat : clic sur la valeur puis sur la stat, ou glisser." />
            {playbook && (
                <Card title={`Ton playbook — ${findPlaybook(playbook)?.label ?? playbook}`}>
                    <div className="cp-cr-inline"><span className="cp-cr-rule">Ses manœuvres se lancent avec :</span><StatProfile profile={used} loaded={loaded} /></div>
                </Card>
            )}
            <Card title="Profil">
                <div className="cp-cr-profiles">
                    {STAT_PROFILES.map(p => (
                        <PickCard key={p.id} on={profile === p.id} onClick={() => { setPicked(null); onProfile(p.id); }}
                                  name={p.label} hint={p.description} />
                    ))}
                </div>
            </Card>
            {profile && (
                <Card title="Répartition" action={<button type="button" className="cp-btn is-sm is-ghost" onClick={() => { setPicked(null); onReset(); }}>Tout reprendre</button>}>
                    <div className="cp-cr-pool">
                        <span className="cp-field-label">À placer</span>
                        {pool.length === 0 && <span className="cp-cr-rule"><b>Tout est placé.</b> Clic sur une stat pour reprendre sa valeur.</span>}
                        {pool.map(chip => (
                            <button key={chip.id} type="button" draggable className={`cp-cr-val ${picked === chip.id ? 'is-on' : ''}`}
                                    onClick={() => setPicked(picked === chip.id ? null : chip.id)}
                                    onDragStart={e => { e.dataTransfer.setData('text/plain', chip.id); setPicked(chip.id); }}
                                    onDragEnd={() => setOver(null)}>
                                {sign(chip.value)}
                            </button>
                        ))}
                    </div>
                    <div className={`cp-cr-statgrid ${picked ? 'is-picking' : ''}`}>
                        {STATS.map(stat => {
                            const v = stats[stat];
                            return (
                                <button key={stat} type="button"
                                        className={`cp-cr-stat st-${stat} ${v === null ? 'is-empty' : ''} ${over === stat ? 'is-over' : ''} ${usedBy[stat] ? 'is-advised' : ''}`}
                                        onClick={() => place(stat, picked)}
                                        onDragOver={e => { if (v === null) { e.preventDefault(); setOver(stat); } }}
                                        onDragLeave={() => setOver(null)}
                                        onDrop={e => { e.preventDefault(); setOver(null); place(stat, e.dataTransfer.getData('text/plain')); }}
                                        title={v !== null ? 'Clic : reprendre la valeur' : undefined}>
                                    <span className={`cp-shex st-${stat}`}>{HEX}<b>{v === null ? '·' : sign(v)}</b><span>{STAT_LABELS[stat]}</span></span>
                                    <p><b>{STAT_LABELS[stat]}{usedBy[stat] ? <span className="cp-cr-stat-moves">{usedBy[stat]} manœuvre{usedBy[stat] > 1 ? 's' : ''}</span> : null}</b>{STAT_DESCRIPTIONS[stat]}</p>
                                </button>
                            );
                        })}
                    </div>
                </Card>
            )}
        </>
    );
};

export default StepStats;
