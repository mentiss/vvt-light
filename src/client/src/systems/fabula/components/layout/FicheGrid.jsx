// src/client/src/systems/fabula/components/layout/FicheGrid.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Grille complète de la fiche — extraite de Sheet.jsx pour être réutilisée à
// l'identique par TabSession.jsx (GM), conformément au contrat GM standard :
// "Fiche — mêmes composants, même ordre que Sheet.jsx".
//
// Contrat : { character, editMode, onFieldChange, onArrayChange, onQuickUpdate,
//             onAvatarClick, onRollAttribute, onRollInitiative, onAttack, onCastSpell, sessionId }
//   sessionId : table active (objets de la fiche de groupe près des PI)
//   onRollInitiative (optionnel) : clic sur la case Initiative du Statut (joueur)
//   onAttack (optionnel) : ouvre FabulaDiceModal en mode attaque pour une arme
//   équipée. Fourni par Sheet.jsx (joueur) UNIQUEMENT — TabSession.jsx (GM) ne
//   le passe pas, donc le bouton "⚔ Attaquer" de WeaponsCard reste invisible
//   côté GM (le MJ ne joue pas les attaques à la place des joueurs).
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';

import TraitsPanel        from './TraitsPanel.jsx';
import AttributesPanel    from './AttributesPanel.jsx';
import ResourceBar         from './ResourceBar.jsx';
import FabulaPointsPanel  from './FabulaPointsPanel.jsx';
import BondsPanel         from './BondsPanel.jsx';
import ClassesSkillsPanel from './ClassesSkillsPanel.jsx';
import EquipmentCard      from './EquipmentCard.jsx';
import ArcanaSpellsPanel  from './ArcanaSpellsPanel.jsx';
import BackpackCard       from './BackpackCard.jsx';

// Disposition (retour de l'utilisateur, 2026-11-06) :
//   1. Héros en bandeau · Points Fabula, à même hauteur ;
//   2. rangée « en jeu » : Statut · Attributs, à même hauteur ;
//   3. deux colonnes indépendantes : Liens, Classes · actions (Équipement,
//      Sorts, Sac). Les Liens grandissent avec les liens (jusqu'à 6) : dans
//      une colonne libre, ils ne creusent pas de vide sous une rangée.
// En une colonne (écran étroit), les actions passent avant Liens et Classes.
const FicheGrid = ({ character, editMode, onFieldChange, onArrayChange, onQuickUpdate, onAvatarClick, onRollAttribute, onRollInitiative, onAttack, onCastSpell, sessionId }) => (
    <div className="flex flex-col gap-3 w-full">
        <div className="fu-row-stretch grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,19rem)] gap-3">
            <TraitsPanel character={character} editMode={editMode} onFieldChange={onFieldChange}
                         onAvatarClick={onAvatarClick} />
            <FabulaPointsPanel character={character} onQuickUpdate={onQuickUpdate} />
        </div>

        <div className="fu-row-stretch grid grid-cols-1 lg:grid-cols-2 gap-3">
            <ResourceBar character={character} onQuickUpdate={onQuickUpdate} sessionId={sessionId} onRollInitiative={onRollInitiative} />
            <AttributesPanel character={character} editMode={editMode}
                             onFieldChange={onFieldChange}
                             onQuickUpdate={onQuickUpdate}
                             onRollAttribute={onRollAttribute} />
        </div>

        <div className="flex flex-col gap-3 lg:grid lg:grid-cols-2 lg:items-start">
            <div className="order-2 lg:order-1 flex flex-col gap-3 min-w-0">
                <BondsPanel character={character} editMode={editMode} onArrayChange={onArrayChange} />
                <ClassesSkillsPanel character={character} editMode={editMode} onArrayChange={onArrayChange} />
            </div>
            <div className="order-1 lg:order-2 flex flex-col gap-3 min-w-0">
                <EquipmentCard character={character} editMode={editMode} onArrayChange={onArrayChange} onAttack={onAttack} />
                <ArcanaSpellsPanel character={character} editMode={editMode} onArrayChange={onArrayChange}
                                   onQuickUpdate={onQuickUpdate} onCastSpell={onCastSpell} />
                <BackpackCard character={character} editMode={editMode} onArrayChange={onArrayChange} />
            </div>
        </div>
    </div>
);

export default FicheGrid;