// src/client/src/systems/fabula/components/layout/FicheGrid.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Grille complète de la fiche — extraite de Sheet.jsx pour être réutilisée à
// l'identique par TabSession.jsx (GM), conformément au contrat GM standard :
// "Fiche — mêmes composants, même ordre que Sheet.jsx".
//
// Contrat : { character, editMode, onFieldChange, onArrayChange, onQuickUpdate,
//             onAvatarClick, onRollAttribute, onAttack, onCastSpell }
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
import ArmorCard          from './ArmorCard.jsx';
import WeaponsCard        from './WeaponsCard.jsx';
import AccessoryCard      from './AccessoryCard.jsx';
import ArcanaSpellsPanel  from './ArcanaSpellsPanel.jsx';
import BackpackCard       from './BackpackCard.jsx';

const FicheGrid = ({ character, editMode, onFieldChange, onArrayChange, onQuickUpdate, onAvatarClick, onRollAttribute, onAttack, onCastSpell }) => (
    <div className="flex flex-col gap-3 w-full">

        {/* Rangée 1 — Identité · Attributs+Ressources · Points Fabula+Liens
            Colonnes asymétriques (retour MJ) : la colonne PF/Liens rétrécit au
            profit des attributs/ressources, plus denses. */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.25fr_0.75fr] gap-3 items-start">
            <TraitsPanel character={character} editMode={editMode} onFieldChange={onFieldChange}
                         onAvatarClick={onAvatarClick} />

            <div className="flex flex-col gap-3">
                <AttributesPanel character={character} editMode={editMode}
                                 onFieldChange={onFieldChange}
                                 onQuickUpdate={onQuickUpdate}
                                 onRollAttribute={onRollAttribute} />
                <ResourceBar character={character} onQuickUpdate={onQuickUpdate} />
            </div>

            <div className="flex flex-col gap-3">
                <FabulaPointsPanel character={character} onQuickUpdate={onQuickUpdate} />
                <BondsPanel character={character} editMode={editMode} onArrayChange={onArrayChange} />
            </div>
        </div>

        {/* Rangée 2 — Classes · Équipement équipé (empilé) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 items-start">
            <ClassesSkillsPanel character={character} editMode={editMode} onArrayChange={onArrayChange} />
            <div className="flex flex-col gap-3">
                <ArmorCard character={character} editMode={editMode} onArrayChange={onArrayChange} />
                <WeaponsCard character={character} editMode={editMode} onArrayChange={onArrayChange} onAttack={onAttack} />
                <AccessoryCard character={character} editMode={editMode} onArrayChange={onArrayChange} />
            </div>
        </div>

        {/* Rangée 3 — Arcana & Sorts · Sac à dos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 items-start">
            <ArcanaSpellsPanel character={character} editMode={editMode} onArrayChange={onArrayChange} onCastSpell={onCastSpell} />
            <BackpackCard character={character} editMode={editMode} onArrayChange={onArrayChange} />
        </div>
    </div>
);

export default FicheGrid;