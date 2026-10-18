// src/client/src/components/modals/AccessCodeModal.jsx
// Modale générique — changement du code d'accès d'un personnage.
// Self-service joueur, disponible depuis le menu hamburger de chaque slug.
//
// Contrat :
//   isOpen      — bool
//   character   — personnage courant (objet complet)
//   onClose     — () => void
//   onSuccess   — (updatedCharacter) => void
//
// Envoie toujours le personnage complet ({ ...character, accessCode }) au PUT,
// jamais un delta seul — certains CharacterController (Fabula) font une
// assignation directe sur les autres colonnes plates et un payload partiel
// les viderait.

import React, { useState } from 'react';
import { useSystem } from '../../hooks/useSystem.js';
import { useFetch }  from '../../hooks/useFetch.js';
import Modal from '../ui/Modal.jsx';

const CODE_LENGTH = 6;
const sanitize = (value) => value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, CODE_LENGTH);

const AccessCodeModal = ({ isOpen, character, onClose, onSuccess }) => {
    const { apiBase }   = useSystem();
    const fetchWithAuth = useFetch();

    const [code, setCode]       = useState(character?.accessCode ?? '');
    const [error, setError]     = useState('');
    const [loading, setLoading] = useState(false);
    const [saved, setSaved]     = useState(false);
    const [copied, setCopied]   = useState(false);

    if (!isOpen || !character) return null;

    const handleClose = () => {
        setCode(character?.accessCode ?? '');
        setError('');
        setSaved(false);
        setCopied(false);
        onClose();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (code.length !== CODE_LENGTH) {
            setError(`Le code doit faire exactement ${CODE_LENGTH} caractères (lettres et chiffres).`);
            return;
        }

        setLoading(true);
        try {
            const res = await fetchWithAuth(`${apiBase}/characters/${character.id}`, {
                method:  'PUT',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ ...character, accessCode: code }),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error || 'Erreur lors de la sauvegarde');
            }
            const updated = await res.json();
            setSaved(true);
            onSuccess?.(updated);
        } catch (err) {
            setError(err.message || 'Erreur lors de la sauvegarde');
        } finally {
            setLoading(false);
        }
    };

    const copyCode = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Le bouton de validation, dans le pied, est rattaché au formulaire par son id
    const footer = !saved ? (
        <>
            <button type="button" onClick={handleClose} className="vtt-btn flex-1">
                Annuler
            </button>
            <button type="submit" form="access-code-form" disabled={loading} className="vtt-btn vtt-btn-primary flex-1">
                {loading ? 'Sauvegarde…' : 'Valider'}
            </button>
        </>
    ) : (
        <>
            <button type="button" onClick={copyCode} className="vtt-btn flex-1">
                {copied ? 'Copié !' : 'Copier'}
            </button>
            <button type="button" onClick={handleClose} className="vtt-btn vtt-btn-primary flex-1">
                Fermer
            </button>
        </>
    );

    return (
        <Modal title="Code d'accès" size="sm" onClose={handleClose} footer={footer}>
                <div className="mb-4">
                    <p className="text-muted">
                        Choisissez le nouveau code d'accès de <span className="text-primary font-semibold">{character.name ?? character.nom ?? character.playerName}</span>.
                    </p>
                </div>

                {!saved ? (
                    <form id="access-code-form" onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <input
                                type="text"
                                value={code}
                                onChange={(e) => setCode(sanitize(e.target.value))}
                                placeholder="ABC123"
                                maxLength={CODE_LENGTH}
                                className="vtt-input uppercase text-center text-2xl font-bold tracking-widest"
                                autoFocus
                            />
                            <p className="text-xs text-muted mt-2 text-center">
                                {CODE_LENGTH} caractères — lettres et chiffres uniquement
                            </p>
                        </div>

                        {error && <div className="vtt-callout vtt-callout-danger">{error}</div>}
                    </form>
                ) : (
                    <div className="text-center space-y-4">
                        <p>Code d'accès mis à jour :</p>
                        <div className="font-mono text-3xl font-bold tracking-widest text-primary">
                            {code}
                        </div>
                    </div>
                )}
        </Modal>
    );
};

export default AccessCodeModal;