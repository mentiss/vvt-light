// src/client/src/systems/deltagreen/components/modals/EquipmentEditModal.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Modification d'un équipement existant (mode édition, bouton ✎) sur la modale
// générique. Mêmes champs que l'onglet « Objet libre » du catalogue
// (EquipmentFields). La suppression passe par la confirmation générique,
// rendue à côté de la modale (spec_ui_modales.md H-7).
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import Modal from '../../../../components/ui/Modal.jsx';
import useConfirm from '../../../../hooks/useConfirm.jsx';
import EquipmentFields, { equipmentToDraft, draftToEquipment } from '../ui/EquipmentFields.jsx';

/**
 * @param {object}   props.item      équipement modifié
 * @param {Function} props.onSave    (champs) => void
 * @param {Function} props.onDelete  () => void
 * @param {Function} props.onClose
 */
const EquipmentEditModal = ({ item, onSave, onDelete, onClose }) => {
    const [draft, setDraft] = useState(() => equipmentToDraft(item));
    const { confirm, confirmEl } = useConfirm();

    const handleDelete = async () => {
        const ok = await confirm({
            title:       'Supprimer l\'équipement',
            message:     `Supprimer « ${item.name || 'cet équipement'} » ?`,
            danger:      true,
            confirmText: 'Supprimer',
        });
        if (ok) onDelete();
    };

    const footer = (
        <>
            <button type="button" onClick={handleDelete} className="vtt-btn vtt-btn-danger mr-auto">Supprimer</button>
            <button type="button" onClick={onClose} className="vtt-btn">Annuler</button>
            <button type="button" onClick={() => onSave(draftToEquipment(draft))} className="vtt-btn vtt-btn-primary">Sauvegarder</button>
        </>
    );

    return (
        <>
            <Modal onClose={onClose} title={item.name || 'Équipement'} size="md" footer={footer}>
                <EquipmentFields value={draft} onChange={patch => setDraft(prev => ({ ...prev, ...patch }))} />
            </Modal>
            {confirmEl}
        </>
    );
};

export default EquipmentEditModal;
