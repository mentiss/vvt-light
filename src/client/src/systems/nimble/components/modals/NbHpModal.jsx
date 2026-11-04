// src/client/src/systems/nimble/components/modals/NbHpModal.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Points de vie (spec_nimble.md D-8) : subir des dégâts (Se défendre, critique),
// recevoir des soins, régler les PV temporaires, sortir de l'état mourant.
// Le calcul est dans config/rules/actions.js (takeDamage, heal) ; la fenêtre
// rappelle ce qui s'est passé (réduction, PV temporaires, Blessures).
//
// Props : c, act, onClose
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import Modal from '../../../../components/ui/Modal.jsx';
import { defenseOf, maxHp } from '../../config/rules/character.js';
import { NbPill, NbToggle } from '../ui/NbUi.jsx';

const MODES = [
    { id: 'damage', label: 'Dégâts' },
    { id: 'heal',   label: 'Soins' },
    { id: 'temp',   label: 'PV temporaires' },
];

const report = (r) => {
    const parts = [];
    if (r.reduced) parts.push(`${r.reduced} parés par la Défense`);
    if (r.absorbed) parts.push(`${r.absorbed} absorbés par les PV temporaires`);
    if (r.taken) parts.push(`${r.taken} PV perdus`);
    if (r.woundsGained) parts.push(`${r.woundsGained} Blessure${r.woundsGained > 1 ? 's' : ''}`);
    return parts.length ? `${parts.join(', ')}.` : 'Aucun dégât.';
};

const NbHpModal = ({ c, act, onClose }) => {
    const [mode, setMode] = useState('damage');
    const [amount, setAmount] = useState('');
    const [defend, setDefend] = useState(false);
    const [crit, setCrit] = useState(false);
    const [done, setDone] = useState(null);
    const value = Math.max(0, Math.trunc(Number(amount) || 0));

    const apply = () => {
        if (mode === 'damage') setDone(report(act.takeDamage({ amount: value, defend, crit })));
        else if (mode === 'heal') { act.heal(value); setDone(`${value} PV rendus.`); }
        else { act.setTempHp(value); setDone(`PV temporaires : ${value}.`); }
        setAmount('');
    };

    return (
        <Modal onClose={onClose} title="Points de vie" subtitle={`${c.hpCurrent ?? 0} / ${maxHp(c)} PV${Number(c.tempHp) ? ` · ${c.tempHp} temporaires` : ''}`} size="sm"
               footer={<>
                   <button type="button" className="vtt-btn" onClick={onClose}>Fermer</button>
                   <button type="button" className="vtt-btn vtt-btn-primary" onClick={apply} disabled={mode !== 'temp' && !value}>Appliquer</button>
               </>}>
            <div className="nb-fields">
                <div className="nb-pills">
                    {MODES.map(m => <NbPill key={m.id} on={mode === m.id} onClick={() => { setMode(m.id); setDone(null); }}>{m.label}</NbPill>)}
                </div>
                <label className="block">
                    <span className="vtt-field-label">{mode === 'temp' ? 'PV temporaires (ils ne se cumulent pas : gardez la meilleure valeur)' : 'Montant'}</span>
                    <input className="nb-input" type="number" min="0" inputMode="numeric" value={amount} autoFocus
                           onChange={(e) => setAmount(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') apply(); }} />
                </label>
                {mode === 'damage' && (
                    <>
                        <NbToggle on={defend} onChange={setDefend} hint={`Réaction : −${defenseOf(c)} (Défense)${c.inCombat ? ', 1 action' : ''}. Sans effet contre un critique.`}>Se défendre</NbToggle>
                        <NbToggle on={crit} onChange={setCrit} hint="Ignore la Défense ; en mourant, 3 Blessures au lieu de 2.">Coup critique</NbToggle>
                        {c.dying && <p className="nb-note">Mourant : des dégâts infligent 2 Blessures (3 sur un critique), pas de perte de PV.</p>}
                    </>
                )}
                {mode === 'heal' && c.dying && <p className="nb-note">Des PV rendus mettent fin à l'état mourant.</p>}
                {c.dying && <button type="button" className="vtt-btn vtt-btn-sm self-start" onClick={act.toggleDying}>Retirer l'état mourant</button>}
                {done && <div className="nb-todo is-done">{done}</div>}
            </div>
        </Modal>
    );
};

export default NbHpModal;
