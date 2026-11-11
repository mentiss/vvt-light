// src/client/src/systems/cyberpunk/components/creation/StepMoves.jsx
// Étape 4 : deux manœuvres de playbook ; les manœuvres de base sont acquises
// d'office (affichées repliées, pour mémoire).
import React, { useState } from 'react';
import { usePlaybookMoves } from '../../hooks/usePlaybookMoves.js';
import { useSystem } from '@/app/hooks/useSystem.js';
import { STAT_LABELS, CREATION_MOVE_PICKS, moveTagRule, buildMoveTag, referenceList, stepRemaining } from '../../config.jsx';
import { Card } from '../layout/Card.jsx';
import { StepHead, PickCard, ConfigBox, ListChoice } from './CreationParts.jsx';
import CpIcon from '../ui/CpIcon.jsx';

const StatBadge = ({ stat }) => stat && STAT_LABELS[stat]
    ? <span className={`cp-stat-badge cp-stat-badge-${stat}`}>{STAT_LABELS[stat]}</span>
    : <span className="cp-stat-badge st-none">Sans jet</span>;

// Tag d'une manœuvre choisie (§9.8) : élément de la liste de l'aide de jeu, ou libellé libre
const MoveTagChoice = ({ playbook, move, value, onChange }) => {
    const rule = moveTagRule(playbook, move.name);
    const tag = buildMoveTag(playbook, move.name, value);
    return (
        <ConfigBox title={move.name} got={tag ? 1 : 0} need={rule.text ? 0 : 1} label="choix">
            {rule.list && <ListChoice list={referenceList(rule.list, playbook)} value={value ?? ''} onChange={onChange} />}
            {rule.free && (
                <input className="cp-input is-sm" value={value ?? ''} placeholder="À définir avec le MC" aria-label={`${move.name} : libellé`}
                       onChange={e => onChange(e.target.value)} />
            )}
            <div className="cp-cr-inline">
                <span className="cp-cr-rule">Tag {tag ? '' : 'à venir'} {rule.on === 'console' ? 'sur ta console' : 'sur ton personnage'}, verrouillé :</span>
                {tag && <span className="cp-tag is-locked"><CpIcon name="lock" size="sm" />{tag.tag_text}</span>}
            </div>
        </ConfigBox>
    );
};

const StepMoves = ({ playbook, moveIds, moveObjs, moveTags, onToggle, onMoveTag }) => {
    const { apiBase } = useSystem();
    const { moves, loaded } = usePlaybookMoves(apiBase, [playbook]);
    const [showBase, setShowBase] = useState(false);
    const loading = !loaded;
    const data = { moves };

    const own  = data.moves.filter(m => m.playbook === playbook);
    const base = data.moves.filter(m => m.playbook === null);
    const full = moveIds.length >= CREATION_MOVE_PICKS;
    const tagged = moveObjs.filter(m => moveTagRule(playbook, m.name));
    const remaining = stepRemaining(4, { playbook, moveIds, moveObjs, moveTags });

    return (
        <>
            <StepHead num={4} title="Manœuvres" remaining={remaining} unit={['choix restant', 'choix restants']}
                      sub={`Choisis ${CREATION_MOVE_PICKS} manœuvres de ton playbook. Les manœuvres de base sont acquises d'office.`} />
            <Card title={`Playbook — ${playbook}`}>
                {loading
                    ? <p className="cp-empty">Chargement…</p>
                    : (
                        <div className="cp-cr-cards is-wide">
                            {own.map(m => {
                                const on = moveIds.includes(m.id);
                                return (
                                    <PickCard key={m.id} on={on} disabled={!on && full} onClick={() => onToggle(m)}
                                              name={m.name} desc={m.description}>
                                        <div><StatBadge stat={m.stat} /></div>
                                    </PickCard>
                                );
                            })}
                        </div>
                    )}
            </Card>
            {tagged.length > 0 && (
                <Card title="Tags des manœuvres">
                    <p className="cp-cr-rule">Ces manœuvres posent un tag narratif <b>verrouillé</b> : il ne se retire qu'en mode Édition de la fiche.</p>
                    <div className="cp-cr-configs">
                        {tagged.map(m => (
                            <MoveTagChoice key={m.id} playbook={playbook} move={m} value={moveTags[m.id]} onChange={v => onMoveTag(m.id, v)} />
                        ))}
                    </div>
                </Card>
            )}
            {!loading && (
                <Card title={`Manœuvres de base (${base.length})`}
                      action={<button type="button" className="cp-btn is-sm is-ghost" onClick={() => setShowBase(v => !v)}>{showBase ? 'Replier' : 'Afficher'}</button>}>
                    {showBase
                        ? (
                            <div className="cp-cr-cards is-wide">
                                {base.map(m => <PickCard key={m.id} on disabled name={m.name} desc={m.description}><div><StatBadge stat={m.stat} /></div></PickCard>)}
                            </div>
                        )
                        : <p className="cp-cr-rule">Acquises par tous les opérateurs, posées d'office sur ta console.</p>}
                </Card>
            )}
        </>
    );
};

export default StepMoves;
