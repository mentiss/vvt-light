// src/client/src/systems/vikings/components/layout/SheetLayout.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Corps de la fiche Vikings, partagé À L'IDENTIQUE entre la fiche joueur
// (Sheet.jsx) et l'interface MJ (gm/tabs/TabSession.jsx).
// Mise en page validée sur la planche (lot 4, L4-3) : cadre lourd pleine
// largeur ; écran large 3 colonnes, puis l'inventaire, puis les runes.
//
// Contrat props :
//   char              — personnage affiché (buffer d'édition en mode édition)
//   editMode          — bool
//   set(field, value) — modification du buffer d'édition
//   update(updater)   — action de jeu immédiate, updater = prev => next
//   onRoll(ctx)       — ouvre la modale de jet ({ type: 'carac'|'skill', data })
//   onAvatarClick()   — ouvre l'upload d'avatar
//   onOpenEditModal(type) — ouvre EditModals ('addSkill' | 'addTrait')
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import VkPanel          from '../ui/VkPanel.jsx';
import IdentitySection  from './IdentitySection.jsx';
import CaracsSection    from './CaracsSection.jsx';
import SkillsSection    from './SkillsSection.jsx';
import SagaStateSection from './SagaStateSection.jsx';
import CombatSection    from './CombatSection.jsx';
import TraitsSection    from './TraitsSection.jsx';
import RunesSection     from './RunesSection.jsx';
import InventorySection from './InventorySection.jsx';

const SheetLayout = ({ char, editMode, set, update, onRoll, onAvatarClick, onOpenEditModal }) => (
    <VkPanel variant="heavy">
        <IdentitySection char={char} editMode={editMode} set={set} onAvatarClick={onAvatarClick} />

        <div className="vk-sep" />

        {/* Colonne de gauche : caractéristiques, Saga & état, combat ;
            les traits seuls à droite (équilibre des hauteurs, retour MJ) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
            <div className="space-y-6">
                <CaracsSection    char={char} editMode={editMode} set={set} onRoll={onRoll} />
                <SagaStateSection char={char} editMode={editMode} set={set} update={update} />
                <CombatSection    char={char} editMode={editMode} set={set} />
            </div>
            <SkillsSection char={char} editMode={editMode} set={set} update={update}
                           onRoll={onRoll} onOpenEditModal={onOpenEditModal} />
            <div className="lg:col-span-2 2xl:col-span-1">
                <TraitsSection char={char} editMode={editMode} set={set} onOpenEditModal={onOpenEditModal} />
            </div>
        </div>

        <div className="vk-sep" />

        {/* Inventaire : action de jeu, toujours active ; seuls les items sont
            reportés sur la fiche à jour (pas le buffer d'édition). */}
        <VkPanel>
            <div className="vk-section-title">Inventaire</div>
            <InventorySection character={char}
                              onUpdate={(next) => update(prev => ({ ...prev, items: next.items }))} />
        </VkPanel>

        {/* Runes en bas de la fiche (§8.1) */}
        <RunesSection char={char} editMode={editMode} set={set} className="mt-6" />
    </VkPanel>
);

export default SheetLayout;
