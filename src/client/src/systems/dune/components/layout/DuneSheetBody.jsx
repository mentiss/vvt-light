// src/client/src/systems/dune/components/layout/DuneSheetBody.jsx
// Corps de la fiche, commun au joueur et au MJ (spec_dune.md §6.1, §6.4) :
// trois colonnes pleine largeur (Identité · Principes et compétences · Atouts et talents),
// deux sur écran moyen, une sur mobile. Hors édition, les actions de jeu passent par
// onPatch / onAddRow ; en édition, toutes les sections écrivent dans le brouillon.

import React from 'react';
import DuneIdentity from './DuneIdentity.jsx';
import DuneTraits   from './DuneTraits.jsx';
import DuneAssets   from './DuneAssets.jsx';
import DuneTalents  from './DuneTalents.jsx';

/**
 * @param {object}   props.character  fiche enregistrée
 * @param {object|null} props.draft   brouillon du mode Édition (null hors édition)
 * @param {Function} props.setDraft
 * @param {Function} props.onPatch    (fields) => void
 * @param {Function} props.onAddRow   (field, row) => void
 * @param {Function} props.onRoll     ({ type, key }) => void
 * @param {Function} props.onAvatar
 * @param {object|null} props.house   Maison de la table
 */
const DuneSheetBody = ({ character, draft, setDraft, onPatch, onAddRow, onRoll, onAvatar, house }) => {
    const editing = !!draft;
    const c = draft ?? character;
    const onDraft = (fields) => setDraft(prev => ({ ...prev, ...fields }));
    const onDetermination = (delta) => onPatch({ determination: Math.max(0, (character.determination ?? 0) + delta) });

    return (
        <div className="dn-body">
            <DuneIdentity c={c} editing={editing} onDraft={onDraft} onAvatar={onAvatar} onDetermination={onDetermination} house={house} />
            <DuneTraits c={c} editing={editing} onDraft={onDraft} onRoll={onRoll} />
            <div className="dn-body-col">
                <DuneAssets c={c} editing={editing} onDraft={onDraft} onPatch={onPatch} onAddRow={onAddRow} />
                <DuneTalents c={c} editing={editing} onDraft={onDraft} onAddRow={onAddRow} />
            </div>
        </div>
    );
};

export default DuneSheetBody;
