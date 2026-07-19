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

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
            <div className="bg-surface rounded-lg shadow-2xl p-6 max-w-md w-full mx-4 border-4 border-default">

                <div className="mb-4">
                    <h2 className="text-2xl font-bold text-default mb-2">🔑 Code d'accès</h2>
                    <p className="text-muted">
                        Choisissez le nouveau code d'accès de <span className="text-accent font-semibold">{character.name ?? character.nom ?? character.playerName}</span>.
                    </p>
                </div>

                {!saved ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <input
                                type="text"
                                value={code}
                                onChange={(e) => setCode(sanitize(e.target.value))}
                                placeholder="ABC123"
                                maxLength={CODE_LENGTH}
                                className="w-full px-4 py-3 border-2 border-default rounded-lg bg-surface text-default uppercase text-center text-2xl font-bold tracking-widest"
                                autoFocus
                            />
                            <p className="text-xs text-muted mt-2 text-center">
                                {CODE_LENGTH} caractères — lettres et chiffres uniquement
                            </p>
                        </div>

                        {error && <p className="text-sm text-danger text-center">{error}</p>}

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="flex-1 px-4 py-2 bg-surface-alt text-default rounded font-semibold hover:bg-surface-alt/70"
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 px-4 py-2 bg-primary text-white rounded font-semibold hover:bg-primary/90 disabled:opacity-50"
                            >
                                {loading ? 'Sauvegarde…' : 'Valider'}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="text-center space-y-4">
                        <div className="text-4xl">✅</div>
                        <p className="text-default">Code d'accès mis à jour :</p>
                        <div className="font-mono text-3xl font-bold tracking-widest text-accent">
                            {code}
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={copyCode}
                                className="flex-1 px-4 py-2 border-2 border-default text-default rounded font-semibold hover:bg-surface-alt"
                            >
                                {copied ? '✅ Copié !' : '📋 Copier'}
                            </button>
                            <button
                                onClick={handleClose}
                                className="flex-1 px-4 py-2 bg-primary text-white rounded font-semibold hover:bg-primary/90"
                            >
                                Fermer
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AccessCodeModal;