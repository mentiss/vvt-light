// src/client/src/systems/nimble/components/modals/NbRollModal.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Fenêtre d'un jet de d20 (spec_nimble.md §1.1) : test de compétence,
// sauvegarde ou initiative. Avantage / désavantage en tête (▲/▼ de la classe
// et avantage d'initiative appliqués d'office), DD facultatif, modificateur libre.
// L'initiative fait entrer en combat avec les actions obtenues.
// Le résultat s'affiche dans la fenêtre, au même rendu que l'historique.
//
// Props : c, kind ('check' | 'save' | 'initiative'), skillOrStat, sessionId, act, rollerName?, onClose
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import Modal from '../../../../components/ui/Modal.jsx';
import { SKILL_BY_KEY, STAT_BY_KEY } from '../../config/basics.js';
import { signed } from '../../config/rules/formula.js';
import { displayName, skillValue, statValue, saveEdge, initiativeOf, effectsOf } from '../../config/rules/character.js';
import { MAX_EDGE } from '../../config/rules/dice.js';
import { useNbRoll } from '../../hooks/useNbRoll.js';
import { NbPill, NbStepper } from '../ui/NbUi.jsx';
import NbHistoryEntry from '../layout/NbHistoryEntry.jsx';

const DCS = [
    { value: null, label: 'Aucun' },
    { value: 8, label: 'Facile 8' }, { value: 12, label: 'Moyen 12' }, { value: 15, label: 'Difficile 15' },
    { value: 18, label: 'Très difficile 18' }, { value: 20, label: 'Extrême 20' },
];

const edgeLabel = (e) => (e > 0 ? `Avantage ${e}` : e < 0 ? `Désavantage ${-e}` : 'Normal');

/** Libellé, bonus et avantage de départ selon le jet */
const setup = (c, kind, key) => {
    if (kind === 'check') {
        const s = SKILL_BY_KEY[key];
        return { label: s.label, bonus: skillValue(c, key), edge: 0, text: s.text };
    }
    if (kind === 'save') {
        const s = STAT_BY_KEY[key];
        const edge = saveEdge(c, key);
        return { label: `Sauvegarde de ${s.name}`, bonus: statValue(c, key), edge, text: edge > 0 ? 'Sauvegarde avantagée par la classe.' : edge < 0 ? 'Sauvegarde désavantagée par la classe.' : null };
    }
    const adv = effectsOf(c).initiativeAdvantage;
    return { label: 'Initiative', bonus: initiativeOf(c), edge: adv ? 1 : 0, text: '1 chiffre : 1 action · 2 chiffres : 2 actions · 20 et plus : 3 actions.' };
};

const NbRollModal = ({ c, kind, skillOrStat, sessionId, act, onClose }) => {
    const base = setup(c, kind, skillOrStat);
    const { launch, rolling, error, entry } = useNbRoll();
    const [edge, setEdge] = useState(base.edge);
    const [dc, setDc] = useState(null);
    const [modifier, setModifier] = useState(0);

    const roll = async () => {
        const result = await launch({
            characterId: c.id, characterName: displayName(c), sessionId: sessionId ?? null, label: base.label, type: kind,
            systemData: { edge, bonus: base.bonus + modifier, dc: kind === 'initiative' ? null : dc, skill: kind === 'check' ? skillOrStat : null, stat: kind === 'save' ? skillOrStat : null },
        });
        if (result && kind === 'initiative' && act) act.startCombat(result.actions);
    };

    return (
        <Modal onClose={onClose} title={base.label} subtitle={`d20 ${signed(base.bonus + modifier)} · ${displayName(c)}`} size="md"
               footer={<>
                   <button type="button" className="vtt-btn" onClick={onClose}>Fermer</button>
                   <button type="button" className="vtt-btn vtt-btn-primary" disabled={rolling} onClick={roll}>
                       {entry ? 'Relancer' : 'Lancer'} {1 + Math.abs(edge)}d20
                   </button>
               </>}>
            <div className="nb-fields">
                <div className="nb-field-row">
                    <b>Avantage</b>
                    <NbStepper value={edge} onChange={setEdge} min={-MAX_EDGE} max={MAX_EDGE} format={edgeLabel} label="Avantage" />
                </div>
                {kind !== 'initiative' && (
                    <div className="nb-field-row">
                        <b>Difficulté</b>
                        <span className="nb-pills">
                            {DCS.map(d => <NbPill key={String(d.value)} on={dc === d.value} onClick={() => setDc(d.value)}>{d.label}</NbPill>)}
                        </span>
                    </div>
                )}
                <div className="nb-field-row">
                    <b>Modificateur</b>
                    <NbStepper value={modifier} onChange={setModifier} min={-10} max={10} signedValue label="Modificateur" />
                </div>
                {base.text && <p className="nb-note">{base.text}</p>}
                {error && <div className="nb-todo is-error">{error}</div>}
                {entry && <div className="vtt-history-entry"><NbHistoryEntry roll={entry} /></div>}
            </div>
        </Modal>
    );
};

export default NbRollModal;
