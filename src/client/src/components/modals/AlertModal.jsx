// src/client/src/components/modals/AlertModal.jsx
// Alerte générique : au-dessus de tout (variante alert de Modal).
import React from 'react';
import Modal from '../ui/Modal.jsx';

const AlertModal = ({ message, onClose }) => (
    <Modal
        title="Attention"
        size="sm"
        alert
        onClose={onClose}
        footer={<button type="button" onClick={onClose} className="vtt-btn vtt-btn-primary">OK</button>}
    >
        <p>{message}</p>
    </Modal>
);

export default AlertModal;
