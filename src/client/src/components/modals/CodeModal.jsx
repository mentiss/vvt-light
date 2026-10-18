// components/CodeModal.jsx - Modale pour demander le code d'accès
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import Modal from '../ui/Modal.jsx';

const CodeModal = ({ isOpen, onClose, character, onSuccess }) => {
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!code.trim()) {
            setError('Veuillez entrer le code d\'accès');
            return;
        }

        setLoading(true);

        try {
            const loggedCharacter = await login(code, character.accessUrl ?? character.access_url);
            onSuccess(loggedCharacter);
            setCode('');
            onClose();
        } catch (err) {
            setError(err.message || 'Code incorrect');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setCode('');
        setError('');
        onClose();
    };

    if (!isOpen || !character) return null;

    // Le bouton de validation, dans le pied, est rattaché au formulaire par son id
    return (
        <Modal
            title="Code d'accès"
            size="sm"
            onClose={handleClose}
            footer={
                <>
                    <button type="button" onClick={handleClose} className="vtt-btn flex-1">
                        Annuler
                    </button>
                    <button type="submit" form="code-form" disabled={loading || !code} className="vtt-btn vtt-btn-primary flex-1">
                        {loading ? 'Vérification...' : 'Valider'}
                    </button>
                </>
            }
        >
                {/* En-tête */}
                <div className="mb-4">
                    <p className="text-muted mb-1">
                        Entrez le code pour accéder à :
                    </p>
                    <p className="text-lg font-semibold text-primary">
                        {character.name}
                    </p>
                    <p className="text-sm text-muted">
                        Joueur : {character.playerName}
                    </p>
                </div>

                {/* Formulaire */}
                <form id="code-form" onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <input
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value.toUpperCase())}
                            placeholder="ABC123"
                            maxLength={6}
                            className="vtt-input uppercase text-center text-2xl font-bold tracking-widest"
                            autoFocus
                        />
                        <p className="text-xs text-muted mt-2 text-center">
                            Code à 6 caractères
                        </p>
                    </div>

                    {/* Erreur */}
                    {error && (
                        <div className="vtt-callout vtt-callout-danger">
                            {error}
                        </div>
                    )}
                </form>
        </Modal>
    );
};

export default CodeModal;