// src/client/src/systems/fabula/components/modals/FuGmDiceModal.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Fenêtre de jet du MJ (spec_pnj.md §10.7, F-1) : test ou attaque sur les règles de dés des
// joueurs (deux dés, VH, critique et maladresse : config.jsx, resolveFabulaTest), sans personnage.
//   - depuis un PNJ : ses dés d'attributs (états appliqués), précision, dégâts [VH + N] et type ;
//   - depuis le menu : deux tailles de dé au choix.
// Résultat : le même que la fenêtre du joueur (RollResult). Jet public ou caché (historique).
// Props : sessionId, onClose, name?, label?, dice? { dex, int, pui, vol } (dés effectifs du PNJ),
//         initial? { mode: 'test'|'attaque', attr1, attr2, modifier, degatsBonus, degatsType }, hidden?
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useCallback } from 'react';
import { roll } from '@/features/dice/tools/diceEngine.js';
import { useFetch }  from '@/app/hooks/useFetch.js';
import { useSystem } from '@/app/hooks/useSystem.js';
import Modal from '@/ui/modal/Modal.jsx';
import FuIcon from '../ui/FuIcon.jsx';
import FuDie from '../ui/FuDie.jsx';
import fabulaConfig, { TYPES_DEGATS } from '../../config.jsx';
import { RollResult } from './FabulaDiceModal.jsx';

const ATTRS = [{ key: 'dex', short: 'DEX' }, { key: 'int', short: 'INT' }, { key: 'pui', short: 'PUI' }, { key: 'vol', short: 'VOL' }];
const SIZES = [6, 8, 10, 12];
const signed = (n) => (n >= 0 ? `+${n}` : `−${-n}`);
const degatsLabel = (key) => TYPES_DEGATS.find(t => t.key === key)?.label ?? key;

const FuGmDiceModal = ({ sessionId = null, onClose, name = null, label: initialLabel = '', dice = null, initial = null, hidden: initialHidden = false }) => {
    const { apiBase } = useSystem();
    const fetchWithAuth = useFetch();
    const mode = initial?.mode === 'attaque' ? 'attaque' : 'test';
    // Avec un PNJ : on choisit des attributs ; sans : des tailles de dé
    const [slot1, setSlot1] = useState(initial?.attr1 ?? (dice ? 'dex' : 8));
    const [slot2, setSlot2] = useState(initial?.attr2 ?? (dice ? 'pui' : 8));
    const [modifier, setModifier] = useState(initial?.modifier ?? 0);
    const [nd, setNd] = useState('');
    const [label, setLabel] = useState(initialLabel ?? '');
    const [hidden, setHidden] = useState(!!initialHidden);
    // Type de dégâts : celui de l'attaque, ou au choix quand le profil le laisse ouvert (ex. Décharge élémentaire)
    const [degatsType, setDegatsType] = useState(initial?.degatsType ?? null);
    const needsType = mode === 'attaque' && !degatsType;
    const [rolling, setRolling] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const size = (slot) => (dice ? dice[slot] ?? 8 : slot);
    const slotLabel = (slot) => (dice ? ATTRS.find(a => a.key === slot)?.short ?? slot : `d${slot}`);

    const handleRoll = useCallback(async () => {
        if (rolling) return;
        setRolling(true);
        setError(null);
        try {
            const ctx = {
                apiBase, fetchFn: fetchWithAuth, characterId: null, characterName: name ?? 'MJ', sessionId,
                label: label.trim() || `${mode === 'attaque' ? 'Attaque' : 'Test'} [${slotLabel(slot1)} + ${slotLabel(slot2)}]`,
                rollType: 'fabula_test', persistHistory: !hidden,
                systemData: {
                    type: mode, dieSize1: size(slot1), dieSize2: size(slot2), modifier: Number(modifier) || 0,
                    nd: nd === '' ? null : Number(nd), bonus: 0, critAnyDouble: false, skills: [],
                    degatsBonus: mode === 'attaque' ? Number(initial?.degatsBonus ?? 0) : undefined,
                    degatsType: mode === 'attaque' ? degatsType : undefined,
                },
            };
            setResult(await roll(fabulaConfig.dice.buildNotation(ctx), ctx, fabulaConfig.dice));
        } catch (err) {
            setError(err.message || 'Erreur inattendue lors du jet.');
        } finally {
            setRolling(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- slotLabel et size ne dépendent que de dice (prop figée)
    }, [rolling, slot1, slot2, modifier, nd, label, hidden, mode, name, sessionId, apiBase, fetchWithAuth, initial, dice, degatsType]);

    const options = dice ? ATTRS.map(a => a.key) : SIZES;
    return (
        <Modal onClose={onClose} title={mode === 'attaque' ? 'Attaque' : 'Test'} subtitle={name ? `Jet du MJ · ${name}` : 'Jet du MJ'} size="xl" className="fu-roll-modal">
            <div className="fu-roll">
                <section>
                    {[{ v: slot1, set: setSlot1, label: 'Premier dé' }, { v: slot2, set: setSlot2, label: 'Second dé' }].map(slot => (
                        <div key={slot.label} className="mb-3">
                            <div className="fu-label mb-1.5">{slot.label}</div>
                            <div className="fu-pick">
                                {options.map(o => (
                                    <button key={o} type="button" onClick={() => slot.set(o)} className={slot.v === o ? 'is-on' : ''} title={`${slotLabel(o)} (d${size(o)})`}>
                                        <FuDie size={size(o)} small />
                                        <span className="fu-label">{slotLabel(o)}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                    <div className="fu-formula">
                        <FuDie size={size(slot1)} small /> {slotLabel(slot1)} <span className="fu-op">+</span> <FuDie size={size(slot2)} small /> {slotLabel(slot2)}
                        {(Number(modifier) || 0) !== 0 && <> <span className="fu-op">{signed(Number(modifier) || 0)}</span></>}
                        {mode === 'attaque' && <> <span className="fu-op">·</span> <span className="text-accent">[VH + {initial?.degatsBonus ?? 0}] {degatsType ? degatsLabel(degatsType) : '?'}</span></>}
                    </div>
                    {mode === 'attaque' && !initial?.degatsType && (
                        <div className="mb-3">
                            <div className="fu-label mb-1.5">Type de dégâts</div>
                            <div className="flex flex-wrap gap-1.5">
                                {TYPES_DEGATS.map(t => (
                                    <button key={t.key} type="button" className={`fu-pill${degatsType === t.key ? ' is-on' : ''}`} onClick={() => setDegatsType(t.key)}>{t.label}</button>
                                ))}
                            </div>
                        </div>
                    )}
                    <div className="vtt-field mb-3">
                        <label className="vtt-field-label">Intitulé (facultatif)</label>
                        <input value={label} onChange={e => setLabel(e.target.value)} placeholder="ex : Crocs" className="vtt-input w-full" />
                    </div>
                    <div className="flex gap-4 flex-wrap items-end">
                        <div className="vtt-field">
                            <span className="vtt-field-label">Modificateur{mode === 'attaque' ? ' (précision)' : ''}</span>
                            <div className="fu-step">
                                <button type="button" className="fu-step-btn" onClick={() => setModifier(m => (Number(m) || 0) - 1)} aria-label="Diminuer"><FuIcon name="minus" className="fu-ico-sm" /></button>
                                <span className="fu-step-val">{signed(Number(modifier) || 0)}</span>
                                <button type="button" className="fu-step-btn" onClick={() => setModifier(m => (Number(m) || 0) + 1)} aria-label="Augmenter"><FuIcon name="plus" className="fu-ico-sm" /></button>
                            </div>
                        </div>
                        <div className="vtt-field">
                            <label className="vtt-field-label">{mode === 'attaque' ? 'DEF de la cible (facultatif)' : 'ND (facultatif)'}</label>
                            <input type="number" value={nd} onChange={e => setNd(e.target.value)} placeholder="—" className="vtt-input w-24 text-center" />
                        </div>
                        <div className="flex gap-1.5">
                            <button type="button" className={`fu-skill-pill${!hidden ? ' is-on' : ''}`} onClick={() => setHidden(false)}>Public</button>
                            <button type="button" className={`fu-skill-pill${hidden ? ' is-on' : ''}`} onClick={() => setHidden(true)}>Caché<small>hors de l'historique</small></button>
                        </div>
                    </div>
                    {error && <p className="text-xs text-danger mt-3">{error}</p>}
                    <button type="button" onClick={handleRoll} disabled={rolling || needsType} className="fu-btn fu-btn-gold fu-btn-big mt-4">
                        <FuIcon name="dice" />{rolling ? 'Les dés roulent…' : needsType ? 'Choisis le type de dégâts' : 'Lancer'}
                    </button>
                </section>
                <section>
                    {result ? (
                        <RollResult result={result} lucky={null} canLuck={false} support={false} onReroll={handleRoll} gm />
                    ) : (
                        <div className="fu-stage"><div className="fu-stage-idle"><FuIcon name="sigil" />{rolling ? 'Les dés roulent…' : 'En attente du lancer'}</div></div>
                    )}
                </section>
            </div>
        </Modal>
    );
};

export default FuGmDiceModal;
