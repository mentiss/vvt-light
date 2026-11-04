// src/client/src/systems/nimble/components/modals/NbRestModal.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Repos et fin de rencontre (Core Rules 3.3 p.17 ; spec_nimble.md §2) :
//   - Reprendre son souffle (10 min) : dés de vie lancés, + FOR chacun ;
//   - Monter le camp (8 h) : dés de vie au maximum, + FOR chacun ;
//   - Repos sûr : tout revient, 1 Blessure guérie ;
//   - Fin de rencontre : usages et ressources « par rencontre » rendus.
//
// Props : c, act, sessionId, onClose
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import Modal from '../../../../components/ui/Modal.jsx';
import { signed } from '../../config/rules/formula.js';
import { displayName, hitDiceLeft, hitDieSides, statValue, maxHp } from '../../config/rules/character.js';
import { resolveHitDice } from '../../config/rules/dice.js';
import { useNbRoll } from '../../hooks/useNbRoll.js';
import { NbPill, NbStepper } from '../ui/NbUi.jsx';
import NbHistoryEntry from '../layout/NbHistoryEntry.jsx';

const KINDS = [
    { id: 'breath', label: 'Reprendre son souffle', text: '10 minutes : dépensez des dés de vie, lancez-les et ajoutez votre FOR à chacun.' },
    { id: 'camp',   label: 'Monter le camp',        text: '8 heures avec nourriture et sommeil : chaque dé de vie dépensé compte pour son maximum, plus votre FOR.' },
    { id: 'safe',   label: 'Repos sûr',             text: 'Lieu sûr désigné par le MJ : tous les PV, dés de vie, mana et ressources reviennent, 1 Blessure guérit, PV temporaires perdus.' },
    { id: 'encounter', label: 'Fin de rencontre',   text: 'Le combat est fini : actions rendues, usages et ressources « par rencontre » rechargés.' },
];

const NbRestModal = ({ c, act, sessionId, onClose }) => {
    const [kind, setKind] = useState('breath');
    const left = hitDiceLeft(c);
    const sides = hitDieSides(c);
    const str = statValue(c, 'str');
    const [count, setCount] = useState(Math.min(1, left));
    const [done, setDone] = useState(null);
    const { launch, rolling, entry } = useNbRoll();
    const info = KINDS.find(k => k.id === kind);

    const apply = async () => {
        if (kind === 'safe') { act.safeRest(); setDone('Repos sûr : tout est revenu.'); return; }
        if (kind === 'encounter') { act.endEncounter(); setDone('Fin de rencontre.'); return; }
        if (!count) return;
        if (kind === 'camp') {
            const healed = resolveHitDice(Array(count).fill(sides), sides, str, true).total;
            act.fieldRest({ healed, spent: count });
            setDone(`${healed} PV rendus (${count} dé${count > 1 ? 's' : ''} de vie au maximum).`);
            return;
        }
        const result = await launch({
            characterId: c.id, characterName: displayName(c), sessionId: sessionId ?? null, label: 'Reprendre son souffle', type: 'hitdice',
            systemData: { count, sides, perDie: str, max: false },
        });
        if (result) { act.fieldRest({ healed: result.total, spent: count }); setDone(null); }
    };

    const field = kind === 'breath' || kind === 'camp';
    return (
        <Modal onClose={onClose} title="Repos" subtitle={`${c.hpCurrent ?? 0} / ${maxHp(c)} PV · ${left} dé${left > 1 ? 's' : ''} de vie (d${sides})`} size="md"
               footer={<>
                   <button type="button" className="vtt-btn" onClick={onClose}>Fermer</button>
                   <button type="button" className="vtt-btn vtt-btn-primary" disabled={rolling || (field && !count)} onClick={apply}>
                       {kind === 'breath' ? `Lancer ${count}d${sides}` : 'Appliquer'}
                   </button>
               </>}>
            <div className="nb-fields">
                <div className="nb-pills">{KINDS.map(k => <NbPill key={k.id} on={kind === k.id} onClick={() => { setKind(k.id); setDone(null); }}>{k.label}</NbPill>)}</div>
                <p className="nb-note">{info.text}</p>
                {field && (
                    <div className="nb-field-row">
                        <b>Dés de vie</b>
                        <span className="flex items-center gap-3">
                            <NbStepper value={count} onChange={setCount} min={0} max={left} label="Dés de vie" />
                            <span className="nb-line-meta">d{sides} {signed(str)} chacun</span>
                        </span>
                    </div>
                )}
                {field && left === 0 && <p className="nb-note">Plus de dés de vie : ils reviennent au prochain repos sûr.</p>}
                {done && <div className="nb-todo is-done">{done}</div>}
                {kind === 'breath' && entry && <div className="vtt-history-entry"><NbHistoryEntry roll={entry} /></div>}
            </div>
        </Modal>
    );
};

export default NbRestModal;
