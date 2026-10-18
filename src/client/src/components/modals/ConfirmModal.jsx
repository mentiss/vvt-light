// src/client/src/components/modals/ConfirmModal.jsx
// Confirmation générique : au-dessus de tout (variante alert de Modal), comme l'alerte.
import React from 'react';
import Modal from '../ui/Modal.jsx';

const ConfirmModal = ({ title, message, onConfirm, onCancel, confirmText = 'Confirmer', cancelText = 'Annuler', danger = false }) => (
    <Modal
        title={title ?? 'Confirmation'}
        size="sm"
        alert
        onClose={onCancel}
        footer={
            <>
                <button type="button" onClick={onCancel} className="vtt-btn">{cancelText}</button>
                <button type="button" onClick={onConfirm} className={`vtt-btn ${danger ? 'vtt-btn-danger' : 'vtt-btn-primary'}`}>
                    {confirmText}
                </button>
            </>
        }
    >
        <p>{message}</p>
    </Modal>
);

export default ConfirmModal;
