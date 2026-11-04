// src/client/src/systems/vileborn/components/modals/VilSheetModals.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Fenêtres de la fiche (lot 2), ouvertes par les sections via ask(kind, data)
// et rendues par VilSheet à côté de la feuille :
//   state     état déjà coché : « Guérir » ou « Subir à nouveau » (blessure) — Q34
//   duty      devoir : quel état guérir
//   urge      céder à la pulsion (confirmation)
//   reverie   consommer la Rêverie (confirmation)
//   addBond   nouveau lien (nom, ressenti, niveau)
//   removeBond retirer un lien (confirmation)
// Props : asked { kind, data }, c, act, onClose
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import Modal from '../../../../components/ui/Modal.jsx';
import ConfirmModal from '../../../../components/modals/ConfirmModal.jsx';
import { STATES } from '../../config/approaches.js';
import { checkedStates, REVERIE_TEXT, URGE_TEXT } from '../../config/rules/character.js';
import { VilPill } from '../ui/VilUi.jsx';

const BondForm = ({ onAdd, onClose }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [level, setLevel] = useState(0);
    return (
        <Modal onClose={onClose} title="Nouveau lien" size="sm"
               footer={<>
                   <button type="button" className="vtt-btn" onClick={onClose}>Annuler</button>
                   <button type="button" className="vtt-btn vtt-btn-primary" disabled={!name.trim()}
                           onClick={() => { onAdd({ name: name.trim(), description: description.trim(), level }); onClose(); }}>Ajouter</button>
               </>}>
            <div className="vil-fields">
                <label><span className="vtt-field-label">Avec qui ?</span>
                    <input className="vil-input" value={name} onChange={(e) => setName(e.target.value)} autoFocus /></label>
                <label><span className="vtt-field-label">Comment vous le ressentez</span>
                    <input className="vil-input" value={description} onChange={(e) => setDescription(e.target.value)} /></label>
                <div className="vil-pills">
                    <VilPill on={level === -1} onClick={() => setLevel(-1)}>Rivalité −1</VilPill>
                    <VilPill on={level === 0} onClick={() => setLevel(0)}>Neutre 0</VilPill>
                    <VilPill on={level === 1} onClick={() => setLevel(1)}>Affinité +1</VilPill>
                </div>
            </div>
        </Modal>
    );
};

const VilSheetModals = ({ asked, c, act, onClose }) => {
    if (!asked) return null;
    const { kind, data } = asked;
    const run = (fn) => () => { fn(); onClose(); };

    if (kind === 'state') {
        const s = STATES.find(x => x.key === data);
        return (
            <Modal onClose={onClose} title={s.label} subtitle="Cet état est déjà coché" size="sm"
                   footer={<button type="button" className="vtt-btn" onClick={onClose}>Annuler</button>}>
                <div className="vil-fields">
                    <button type="button" className="vtt-btn" onClick={run(() => act.healState(data))}>Guérir</button>
                    <button type="button" className="vtt-btn vtt-btn-primary" onClick={run(() => act.sufferState(data))}>Subir à nouveau : une blessure</button>
                </div>
            </Modal>
        );
    }
    if (kind === 'duty') {
        return (
            <Modal onClose={onClose} title="Devoir" subtitle="Quel état guérir ?" size="sm"
                   footer={<button type="button" className="vtt-btn" onClick={onClose}>Annuler</button>}>
                <div className="vil-pills">
                    {checkedStates(c).map(s => <VilPill key={s.key} onClick={run(() => act.spendDuty(s.key))}>{s.label}</VilPill>)}
                </div>
            </Modal>
        );
    }
    if (kind === 'urge') {
        return <ConfirmModal title={`Céder à la pulsion : ${c.urge}`} message={URGE_TEXT} confirmText="Céder"
                             onConfirm={run(act.yieldToUrge)} onCancel={onClose} />;
    }
    if (kind === 'reverie') {
        return <ConfirmModal title="Consommer la Rêverie" message={REVERIE_TEXT} confirmText="Consommer"
                             onConfirm={run(act.consumeReverie)} onCancel={onClose} />;
    }
    if (kind === 'addBond') {
        const bonds = c.bonds ?? [];
        return <BondForm onClose={onClose} onAdd={(b) => act.setBonds([...bonds, { id: `new-${Date.now()}`, ...b }])} />;
    }
    if (kind === 'removeBond') {
        return <ConfirmModal title={`Retirer le lien avec ${data.name}`} confirmText="Retirer" danger
                             onConfirm={run(() => act.setBonds((c.bonds ?? []).filter(b => b.id !== data.id)))} onCancel={onClose} />;
    }
    return null;
};

export default VilSheetModals;
