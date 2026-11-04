// src/client/src/systems/nimble/components/layout/NbMonsterCard.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Carte d'un monstre de la rencontre (onglet Rencontre du MJ) : en-tête d'encre,
// PV (dégâts après armure, soins) ou sbires restants, attaques en un clic
// (fenêtre : avantage, jet secret ; sbires : attaque groupée), capacités et
// sections (légendaires) repliées. Règles : config/rules/encounter.js.
// Props : inst (monstre de la rencontre), sessionId, onChange(inst), onRemove
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import Modal from '../../../../components/ui/Modal.jsx';
import { MONSTER_SIZES } from '../../config/bestiary.js';
import { parseDice, signed } from '../../config/rules/formula.js';
import { MAX_EDGE } from '../../config/rules/dice.js';
import { damageMonster, healMonster, isDown, afterArmor, ARMOR_LABELS, ARMOR_REDUCTION } from '../../config/rules/encounter.js';
import { useNbRoll } from '../../hooks/useNbRoll.js';
import { NbStepper, NbToggle, NbCounter, NbRich } from '../ui/NbUi.jsx';
import NbHistoryEntry from './NbHistoryEntry.jsx';

const edgeLabel = (e) => (e > 0 ? `Avantage ${e}` : e < 0 ? `Désavantage ${-e}` : 'Normal');

/** Fenêtre d'attaque d'un monstre (ou attaque groupée des sbires) */
const MonsterAttack = ({ inst, attack, sessionId, onClose }) => {
    const dice = parseDice(attack.dice, {});
    const { launch, rolling, error, entry } = useNbRoll();
    const [edge, setEdge] = useState(0);
    const [secret, setSecret] = useState(false);
    const [attackers, setAttackers] = useState(inst.alive);
    const label = `${inst.name} : ${attack.name}`;

    const roll = () => {
        const common = { characterId: null, characterName: inst.name, sessionId, label, persistHistory: !secret };
        if (inst.minion) {
            return launch({ ...common, type: 'minions', systemData: { count: attackers, sides: dice.sides, bonus: Number(attack.bonus ?? 0) } });
        }
        return launch({ ...common, type: 'attack', systemData: {
            count: dice.count, sides: dice.sides, special: dice.special, edge, canCrit: !attack.noCrit, canMiss: true, bonus: Number(attack.bonus ?? 0),
            note: attack.text ?? null,
        } });
    };

    return (
        <Modal onClose={onClose} title={attack.name} subtitle={`${inst.name} · ${attack.dice}${attack.bonus ? ` ${signed(Number(attack.bonus))}` : ''}`} size="md"
               footer={<>
                   <button type="button" className="vtt-btn" onClick={onClose}>Fermer</button>
                   <button type="button" className="vtt-btn vtt-btn-primary" disabled={rolling || !dice || (inst.minion && !attackers)} onClick={roll}>{entry ? 'Relancer' : 'Lancer'}</button>
               </>}>
            <div className="nb-fields">
                {inst.minion ? (
                    <div className="nb-field-row"><b>Sbires qui attaquent</b><NbStepper value={attackers} onChange={setAttackers} min={1} max={Math.max(1, inst.alive)} label="Sbires" /></div>
                ) : (
                    <div className="nb-field-row"><b>Avantage</b><NbStepper value={edge} onChange={setEdge} min={-MAX_EDGE} max={MAX_EDGE} format={edgeLabel} label="Avantage" /></div>
                )}
                {inst.minion && <p className="nb-note">Un dé par sbire, un 1 rate, pas de critique ni d'avantage ; les dégâts forment une seule attaque.</p>}
                {attack.text && <p className="nb-note">{attack.text}</p>}
                <NbToggle on={secret} onChange={setSecret} hint="Le jet n'apparaît pas dans l'historique de la table.">Jet secret</NbToggle>
                {error && <div className="nb-todo is-error">{error}</div>}
                {entry && <div className="vtt-history-entry"><NbHistoryEntry roll={entry} /></div>}
            </div>
        </Modal>
    );
};

const NbMonsterCard = ({ inst, sessionId, onChange, onRemove }) => {
    const [amount, setAmount] = useState('');
    const [crit, setCrit] = useState(false);
    const [attack, setAttack] = useState(null);
    const value = Math.max(0, Math.trunc(Number(amount) || 0));
    const down = isDown(inst);
    const damage = () => { onChange(damageMonster(inst, value, { crit })); setAmount(''); setCrit(false); };
    const heal = () => { onChange(healMonster(inst, value)); setAmount(''); };

    return (
        <article className={`nb-monster${down ? ' is-dead' : ''}`}>
            <header className="nb-monster-head">
                <b>{inst.name}</b>
                <span>{inst.minion ? 'sbires' : `niv. ${inst.level}`}{inst.size ? ` · ${MONSTER_SIZES[inst.size] ?? inst.size}` : ''}{inst.legendary ? ' · légendaire' : ''}</span>
                <button type="button" className="nb-remove" onClick={onRemove} aria-label={`Retirer ${inst.name}`}>×</button>
            </header>
            <div className="nb-monster-body">
                <div className="nb-monster-hp">
                    {inst.minion ? (
                        <>
                            <span className="nb-label">Sbires</span>
                            <NbCounter value={inst.alive} max={99} onChange={(v) => onChange({ ...inst, alive: v, count: Math.max(inst.count, v) })} suffix={` / ${inst.count}`} />
                        </>
                    ) : (
                        <>
                            <b>{inst.hp}</b><span className="nb-line-meta">/ {inst.hpMax} PV</span>
                            <span className="nb-meter"><i style={{ width: `${inst.hpMax ? (inst.hp / inst.hpMax) * 100 : 0}%` }} /></span>
                        </>
                    )}
                    {inst.armor && <span className="nb-tag is-red" title={`−${ARMOR_REDUCTION[inst.armor]} par attaque, sauf critique`}>{ARMOR_LABELS[inst.armor]}</span>}
                </div>
                <div className="nb-monster-hp">
                    <input className="nb-input is-num" type="number" min="0" placeholder="0" value={amount}
                           onChange={e => setAmount(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && value) damage(); }} aria-label="Montant" />
                    <button type="button" className="nb-roll-btn" disabled={!value} onClick={damage}>Dégâts</button>
                    <button type="button" className="vtt-btn vtt-btn-sm" disabled={!value && !inst.minion} onClick={heal}>Soins</button>
                    {inst.armor && <NbToggle on={crit} onChange={setCrit}>Critique</NbToggle>}
                    {inst.armor && value > 0 && <span className="nb-line-meta">→ {afterArmor(value, inst.armor, crit)}</span>}
                </div>
                {inst.attacks.filter(a => a.dice).map((a, i) => (
                    <div key={`${a.name}-${i}`} className="nb-line">
                        <div className="nb-line-main"><span className="nb-line-name">{a.name}</span> <span className="nb-dmg">{a.dice}{a.bonus ? signed(Number(a.bonus)) : ''}</span>
                            {a.text && <div className="nb-line-text">{a.text}</div>}</div>
                        <div className="nb-line-side">
                            {a.noCrit && <span className="nb-tag">sans critique</span>}
                            <button type="button" className="nb-roll-btn" onClick={() => setAttack(a)}>Attaquer</button>
                        </div>
                    </div>
                ))}
                {(inst.abilities.length > 0 || inst.sections.length > 0 || inst.attacks.some(a => !a.dice)) && (
                    <details className="nb-fold">
                        <summary>Capacités</summary>
                        <div>
                            {[...inst.abilities, ...inst.attacks.filter(a => !a.dice)].map((a, i) => (
                                <div key={i} className="nb-monster-ab"><strong>{a.name}.</strong> {a.text}</div>
                            ))}
                            {inst.sections.map((s, i) => (
                                <div key={`s${i}`} className="mt-2"><span className="nb-sub-title">{s.title}</span><NbRich text={s.text} className="nb-monster-ab" /></div>
                            ))}
                        </div>
                    </details>
                )}
            </div>
            {attack && <MonsterAttack inst={inst} attack={attack} sessionId={sessionId} onClose={() => setAttack(null)} />}
        </article>
    );
};

export default NbMonsterCard;
