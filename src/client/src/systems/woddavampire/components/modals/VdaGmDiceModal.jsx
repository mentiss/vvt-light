// src/client/src/systems/woddavampire/components/modals/VdaGmDiceModal.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Jet du Conteur (spec §II.14 M-7) : un jet de PNJ ou de situation au format
// Vampire, sans fiche : libellé, nombre de dés, difficulté, spécialité, et
// visibilité Public (historisé, diffusé à la table) ou Caché (ni historisé ni
// diffusé : seul le Conteur voit le résultat). Moteur de dés de la plateforme.
//
// Props : sessionId, onClose
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import Modal from '@/ui/modal/Modal.jsx';
import { ROLL_TYPES } from '../../config.jsx';
import { useVdaRoll } from '../../hooks/useVdaRoll.js';
import { difficultyLabel } from '../../config/rules/sheetRules.js';
import { VdaChip, VdaStepper, VdaToggle } from '../ui/VdaUi.jsx';
import VdaHistoryEntry from '../layout/VdaHistoryEntry.jsx';

// Props facultatives d'un jet lancé depuis un PNJ (spec_pnj.md §10.3) : name (lanceur),
// label, initial { dice, difficulty, specialty, cannotBotch (dégâts) }, hidden (réglage de l'onglet PNJ).
const VdaGmDiceModal = ({ sessionId, onClose, name = null, label: initialLabel = '', initial = null, hidden: initialHidden = false }) => {
    const { launch: rollDice, rolling, error, entry } = useVdaRoll();
    const [label, setLabel] = useState(initialLabel ?? '');
    const [dice, setDice] = useState(initial?.dice ?? 5);
    const [difficulty, setDifficulty] = useState(initial?.difficulty ?? 6);
    const [specialty, setSpecialty] = useState(!!initial?.specialty);
    const [hidden, setHidden] = useState(!!initialHidden);

    const launch = () => dice >= 1 && rollDice({
        characterName: name ?? 'Conteur', sessionId: sessionId ?? null, label: label.trim() || 'Jet du Conteur', rollType: ROLL_TYPES.pool,
        persistHistory: !hidden,   // caché : ni historisé ni diffusé
        systemData: { type: 'pool', dice, difficulty, specialty, autoSuccesses: 0, cannotBotch: !!initial?.cannotBotch },
    });

    return (
        <Modal onClose={onClose} title="Jet du Conteur" size="md"
               footer={<>
                   <button type="button" className="vtt-btn" onClick={onClose}>Fermer</button>
                   <button type="button" className="vtt-btn vtt-btn-primary" disabled={rolling || dice < 1} onClick={launch}>
                       {entry ? 'Relancer' : 'Lancer'} {dice} dé{dice > 1 ? 's' : ''}
                   </button>
               </>}>
            <div className="flex flex-col gap-3">
                <label className="block">
                    <span className="vda-label">Libellé</span>
                    <input className="vda-input" value={label} placeholder="Garde du palais : Vigilance" onChange={(e) => setLabel(e.target.value)} autoFocus />
                </label>
                <div className="vda-trait">
                    <span className="vda-trait-name">Dés</span>
                    <input className="vda-input vda-input-short text-center" type="number" min={1} max={30} value={dice}
                           onChange={(e) => setDice(Math.max(0, Math.min(30, Math.floor(Number(e.target.value) || 0))))} aria-label="Nombre de dés" />
                </div>
                <div className="vda-trait">
                    <span className="vda-trait-name">Difficulté — {difficultyLabel(difficulty)}</span>
                    <VdaStepper value={difficulty} min={2} max={10} onChange={setDifficulty} label="Difficulté" />
                </div>
                <VdaToggle on={specialty} onChange={setSpecialty}>Spécialité : un 10 compte 2 succès</VdaToggle>
                <div className="flex items-center gap-3">
                    <span className="vda-label">Visibilité</span>
                    <span className="vda-chips">
                        <VdaChip on={!hidden} onClick={() => setHidden(false)}>Public</VdaChip>
                        <VdaChip on={hidden} onClick={() => setHidden(true)}>Caché</VdaChip>
                    </span>
                </div>
                {error && <div className="vda-error-list">{error}</div>}
                {entry && <div className="vtt-history-entry p-3"><VdaHistoryEntry roll={entry} /></div>}
            </div>
        </Modal>
    );
};

export default VdaGmDiceModal;
