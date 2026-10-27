// src/client/src/systems/deltagreen/components/modals/WeaponEditModal.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Modification de l'arme d'un emplacement (mode édition, bouton ✎) sur la
// modale générique. Mêmes champs que l'onglet « Objet libre » du catalogue
// d'armement (WeaponFields). La suppression passe par la confirmation
// générique, rendue à côté de la modale (spec_ui_modales.md H-7).
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import Modal from '../../../../components/ui/Modal.jsx';
import useConfirm from '../../../../hooks/useConfirm.jsx';
import WeaponFields, { weaponToDraft, draftToWeapon } from '../ui/WeaponFields.jsx';

/**
 * @param {string}   props.slot      emplacement (a → g)
 * @param {object}   props.weapon    arme de l'emplacement
 * @param {object}   props.char      personnage (compétences proposées)
 * @param {Function} props.onSave    ({ name, notes, jsonDetails }) => void
 * @param {Function} props.onDelete  () => void
 * @param {Function} props.onClose
 */
const WeaponEditModal = ({ slot, weapon, char, onSave, onDelete, onClose }) => {
    const [draft, setDraft] = useState(() => weaponToDraft(weapon));
    const { confirm, confirmEl } = useConfirm();

    const handleDelete = async () => {
        const ok = await confirm({
            title:       'Supprimer l\'arme',
            message:     `Retirer « ${weapon.name || 'cette arme'} » de l'emplacement (${slot}) ?`,
            danger:      true,
            confirmText: 'Supprimer',
        });
        if (ok) onDelete();
    };

    const footer = (
        <>
            <button type="button" onClick={handleDelete} className="vtt-btn vtt-btn-danger mr-auto">Supprimer</button>
            <button type="button" onClick={onClose} className="vtt-btn">Annuler</button>
            <button type="button" onClick={() => onSave(draftToWeapon(draft))} className="vtt-btn vtt-btn-primary">Sauvegarder</button>
        </>
    );

    return (
        <>
            <Modal onClose={onClose} title={weapon.name || 'Arme'} subtitle={`Emplacement (${slot})`} size="md" footer={footer}>
                <WeaponFields value={draft} onChange={patch => setDraft(prev => ({ ...prev, ...patch }))} char={char} />
            </Modal>
            {confirmEl}
        </>
    );
};

export default WeaponEditModal;
