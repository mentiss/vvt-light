// src/client/src/systems/fabula/components/layout/EquipmentCard.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Fenêtre « Équipement », comme le menu Équipement d'un jRPG : armure, armes
// et accessoire en trois sections d'une même fenêtre (ArmorCard, WeaponsCard,
// AccessoryCard). L'en-tête porte les valeurs dérivées du personnage, toutes
// pièces équipées confondues.
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import ArmorCard     from './ArmorCard.jsx';
import WeaponsCard   from './WeaponsCard.jsx';
import AccessoryCard from './AccessoryCard.jsx';

const EquipmentCard = ({ character, editMode, onArrayChange, onAttack }) => (
    <div className="fu-win">
        <div className="fu-win-head">
            <h3 className="fu-title">Équipement<span className="fu-kana" aria-hidden="true">装備</span></h3>
            <span className="fu-rule" />
            <div className="flex gap-2 text-[10px]">
                <span className="fu-tag text-muted">Déf. <strong className="text-default">{character.defense}</strong></span>
                <span className="fu-tag text-muted">Déf. mag. <strong className="text-default">{character.defenseMagique}</strong></span>
                <span className="fu-tag text-muted">Init. <strong className="text-default">{character.initiative}</strong></span>
            </div>
        </div>
        <ArmorCard character={character} editMode={editMode} onArrayChange={onArrayChange} />
        <WeaponsCard character={character} editMode={editMode} onArrayChange={onArrayChange} onAttack={onAttack} />
        <AccessoryCard character={character} editMode={editMode} onArrayChange={onArrayChange} />
    </div>
);

export default EquipmentCard;
