// src/client/src/systems/vikings/components/layout/SheetLayout.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Corps de la fiche Vikings, partagé À L'IDENTIQUE entre la fiche joueur
// (Sheet.jsx) et l'interface MJ (gm/tabs/TabSession.jsx).
// Spec : documentations/spec_vikings_lot3_client.md §3.1.
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
import IdentitySection  from './IdentitySection.jsx';
import CaracsSection    from './CaracsSection.jsx';
import SkillsSection    from './SkillsSection.jsx';
import SagaStateSection from './SagaStateSection.jsx';
import TraitsSection    from './TraitsSection.jsx';
import CombatSection    from './CombatSection.jsx';
import RunesSection     from './RunesSection.jsx';
import InventorySection from './InventorySection.jsx';

const SheetLayout = ({ char, editMode, set, update, onRoll, onAvatarClick, onOpenEditModal }) => (
    <div className="space-y-3">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3" style={{ gridAutoRows: 'min-content' }}>
            <div className="space-y-3">
                <IdentitySection char={char} editMode={editMode} set={set} onAvatarClick={onAvatarClick} />
                <CaracsSection   char={char} editMode={editMode} set={set} onRoll={onRoll} />
                <SkillsSection   char={char} editMode={editMode} set={set} update={update}
                                 onRoll={onRoll} onOpenEditModal={onOpenEditModal} />
            </div>
            <div className="space-y-3">
                <SagaStateSection char={char} editMode={editMode} set={set} update={update} />
                <CombatSection    char={char} editMode={editMode} set={set} />
                <TraitsSection    char={char} editMode={editMode} set={set} onOpenEditModal={onOpenEditModal} />
            </div>
        </div>
        {/* Inventaire sur la fiche (plus d'onglet séparé) : action de jeu, toujours
            active ; seuls les items sont reportés sur la fiche à jour. */}
        <div className="bg-surface rounded-lg p-3 border-2 border-default">
            <h3 className="text-sm font-bold text-default mb-2">Inventaire</h3>
            <InventorySection character={char}
                              onUpdate={(next) => update(prev => ({ ...prev, items: next.items }))} />
        </div>

        {/* Runes en bas de la fiche (§8.1) */}
        <RunesSection char={char} editMode={editMode} set={set} />
    </div>
);

export default SheetLayout;
