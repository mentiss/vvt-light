// src/client/src/systems/vikings/components/layout/SheetLayout.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Corps de la fiche Vikings, partagé À L'IDENTIQUE entre la fiche joueur
// (Sheet.jsx) et l'interface MJ (gm/tabs/TabSession.jsx).
// Disposition de la planche « pierre peinte » (spec_vikings_pierre_peinte.md D-10),
// commune aux deux habillages : en-tête du personnage (ruban-serpent, épithètes),
// dalle État, Caractéristiques et Compétences, Combat · Équipement · Bourse et
// bagages, Runes. Le cadre lourd (vk-sheet-frame) n'a pas de dalle en pierre peinte.
//
// Contrat props :
//   char              — personnage affiché (buffer d'édition en mode édition)
//   editMode          — bool
//   set(field, value) — modification du buffer d'édition
//   update(updater)   — action de jeu immédiate, updater = prev => next
//   onRoll(ctx)       — ouvre le jet ({ type: 'carac'|'skill', data })
//   onAvatarClick()   — ouvre l'upload d'avatar
//   onOpenEditModal(type) — ouvre EditModals ('addSkill' | 'addTrait')
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect, useRef, useState } from 'react';
import { emitVk, VK_SAGA_GAIN } from '../../hooks/useVkLook.js';
import VkPanel          from '../ui/VkPanel.jsx';
import IdentitySection  from './IdentitySection.jsx';
import CaracsSection    from './CaracsSection.jsx';
import SkillsSection    from './SkillsSection.jsx';
import SagaStateSection from './SagaStateSection.jsx';
import CombatSection    from './CombatSection.jsx';
import RunesSection     from './RunesSection.jsx';
import { EquipmentSection, PurseSection } from './GearSections.jsx';

const SheetLayout = ({ char, editMode, set, update, onRoll, onAvatarClick, onOpenEditModal }) => {
    // Transe berserk : compteur à l'écran (C-4), partagé entre l'épithète et la dalle État
    const [transe, setTranse] = useState(0);

    // Gain de SAGA du personnage affiché (MJ, triple 10, perle cliquée) : le vivant réagit
    // (ciel, ruban, corbeau). Pas au changement de personnage.
    const lastSaga = useRef({ id: null, saga: 0 });
    useEffect(() => {
        const saga = char.sagaActuelle ?? 0, last = lastSaga.current;
        if (last.id === char.id && saga > last.saga) emitVk(VK_SAGA_GAIN, { id: char.id });
        lastSaga.current = { id: char.id, saga };
    }, [char.id, char.sagaActuelle]);

    return (
        <VkPanel variant="heavy" className="vk-sheet-frame">
            <IdentitySection char={char} editMode={editMode} set={set} onAvatarClick={onAvatarClick}
                             onOpenEditModal={onOpenEditModal} transe={transe} onTranse={setTranse} />

            <SagaStateSection char={char} editMode={editMode} set={set} update={update}
                              transe={transe} onTranseChange={setTranse} />

            <div className="vk-sheet-jets">
                <CaracsSection char={char} editMode={editMode} set={set} onRoll={onRoll} />
                <SkillsSection char={char} editMode={editMode} set={set} update={update}
                               onRoll={onRoll} onOpenEditModal={onOpenEditModal} />
            </div>

            <div className="vk-sheet-gear">
                <CombatSection char={char} editMode={editMode} set={set} />
                {/* Inventaire : action de jeu, toujours active ; seuls les items sont
                    reportés sur la fiche à jour (pas le buffer d'édition). */}
                <EquipmentSection char={char} onRoll={onRoll} onItemsChange={(items) => update(prev => ({ ...prev, items }))} />
                <PurseSection char={char} onItemsChange={(items) => update(prev => ({ ...prev, items }))} />
            </div>

            <RunesSection char={char} editMode={editMode} set={set} className="vk-sheet-runes" />
        </VkPanel>
    );
};

export default SheetLayout;
