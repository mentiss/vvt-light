// src/client/src/systems/woddavampire/components/modals/VdaTableActionModal.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Actions de table du Conteur (spec §II.14 M-4, M-5) : Donner de l'XP, Réveil,
// Fin d'histoire. Les personnages de la table en pills, tous cochés par défaut
// (ou celui d'où l'action est lancée) ; un clic en retire un. Aperçu de l'effet
// pour le Réveil et la Fin d'histoire. Modale générique de la plateforme.
//
// Props : kind ('xp' | 'wake' | 'end'), characters (fiches, dans l'ordre de la
//         table), preselect (ids ou null = tous), onApply(ids, amount), onClose
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import Modal from '@/ui/modal/Modal.jsx';
import { wakeUp, endOfStory } from '../../config/rules/sheetRules.js';
import { VdaChip } from '../ui/VdaUi.jsx';

const KINDS = {
    xp:   { title: "Donner de l'XP", action: 'Donner' },
    wake: { title: 'Réveil', subtitle: '−1 sang, +1 Volonté (sans dépasser la permanente)', action: 'Réveiller' },
    end:  { title: "Fin d'histoire", subtitle: 'Volonté remise à la permanente', action: 'Terminer' },
};

/** Aperçu de l'effet sur un personnage */
const preview = (kind, c) => {
    if (kind === 'wake') {
        const p = wakeUp(c);
        return `sang ${c.bloodCurrent ?? 0} → ${p.bloodCurrent}, Volonté ${c.willpowerCurrent ?? 0} → ${p.willpowerCurrent}`;
    }
    if (kind === 'end') return `Volonté ${c.willpowerCurrent ?? 0} → ${endOfStory(c).willpowerCurrent}`;
    return null;
};

const VdaTableActionModal = ({ kind, characters, preselect = null, onApply, onClose }) => {
    const def = KINDS[kind];
    const [ids, setIds] = useState(() => new Set(preselect ?? characters.map(c => c.id)));
    const [amount, setAmount] = useState(1);
    const [busy, setBusy] = useState(false);
    const toggle = (id) => setIds(prev => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
    const chosen = characters.filter(c => ids.has(c.id));
    const valid = chosen.length > 0 && (kind !== 'xp' || amount > 0);

    const apply = async () => {
        if (!valid || busy) return;
        setBusy(true);
        await onApply(chosen.map(c => c.id), amount);
        setBusy(false);
        onClose();
    };

    return (
        <Modal onClose={onClose} title={def.title} subtitle={def.subtitle} size="md"
               footer={<>
                   <button type="button" className="vtt-btn" onClick={onClose}>Annuler</button>
                   <button type="button" className="vtt-btn vtt-btn-primary" disabled={!valid || busy} onClick={apply}>{def.action}</button>
               </>}>
            <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <span className="vda-label">Personnages</span>
                    <span className="vda-note">{chosen.length} sur {characters.length}</span>
                </div>
                <div className="vda-chips">
                    {characters.map(c => <VdaChip key={c.id} on={ids.has(c.id)} onClick={() => toggle(c.id)}>{c.nom}</VdaChip>)}
                </div>
                {kind === 'xp' && (
                    <label className="flex items-center justify-between gap-3">
                        <span className="vda-label">XP à donner</span>
                        <input className="vda-input vda-input-short text-center" type="number" min={1} value={amount}
                               onChange={(e) => setAmount(Math.max(0, Math.floor(Number(e.target.value) || 0)))} autoFocus />
                    </label>
                )}
                {kind !== 'xp' && chosen.length > 0 && (
                    <p className="vda-note">{chosen.map(c => `${c.nom} : ${preview(kind, c)}`).join(' · ')}</p>
                )}
            </div>
        </Modal>
    );
};

export default VdaTableActionModal;
