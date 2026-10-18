// src/client/src/components/CharacterListModal.jsx
// Modale de sélection de personnage.
// Utilisée depuis PlayerPage (état 'selecting') et depuis Sheet (changer de perso).
// onSelect(char) → l'appelant gère la suite (CodeModal, etc.)

import React, { useState, useEffect } from 'react';
import { toSystemUrl } from '../../hooks/useFetch.js';
import useSystem from "../../hooks/useSystem.js";
import Modal from '../ui/Modal.jsx';

// Affichage générique « Prénom Nom », identique pour tous les slugs
const SayMyName = (char) =>
    (char.prenom ? (char.nom ? char.prenom+' '+char.nom : char.prenom) : (char.nom ? char.nom : 'Nom inconnu'));

const CharacterListModal = ({ isOpen, currentCharId, onClose, onSelect }) => {
    const { slug } = useSystem()
    const [characters, setCharacters] = useState([]);
    const [loading,    setLoading]    = useState(true);
    const [error,      setError]      = useState(null);

    useEffect(() => {
        if (!isOpen) return;
        setLoading(true);

        fetch(toSystemUrl('/api/characters'))
            .then(res => {
                if (!res.ok) throw new Error('Failed to load characters');
                return res.json();
            })
            .then(data => {
                setCharacters(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Error loading characters:', err);
                setError(err.message);
                setLoading(false);
            });
    }, [isOpen]);

    const handleSelect = (char) => {
        onSelect(char);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <Modal
            title="Choisir un personnage"
            size="lg"
            expandable
            onClose={onClose}
            footer={<button type="button" onClick={onClose} className="vtt-btn w-full">Fermer</button>}
        >
                    {loading ? (
                        <div className="text-center py-8 text-muted">
                            Chargement des personnages...
                        </div>
                    ) : error ? (
                        <div className="vtt-callout vtt-callout-danger">
                            Erreur : {error}
                        </div>
                    ) : characters.length === 0 || characters[0].id === -1 ? (
                        <div className="text-center py-8">
                            <div>Aucun personnage trouvé</div>
                            <div className="text-sm text-muted mt-2">
                                Créez votre premier personnage !
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-2">
                            {characters.filter(c => c.id > 0).map(char => {
                                const isCurrent = char.id === currentCharId;
                                const charname = SayMyName(char);
                                return (
                                    <button
                                        type="button"
                                        key={char.id}
                                        onClick={() => handleSelect(char)}
                                        className={`vtt-list-item ${isCurrent ? 'is-selected' : ''}`}
                                    >
                                        <div className="flex justify-between items-start w-full">
                                            <div className="flex-1">
                                                <div className="font-bold text-lg">{charname}</div>
                                                <div className="text-sm text-muted mt-1">
                                                    {char.playerName}
                                                    {char.sexe && ` | ${char.sexe === 'homme' ? 'H' : 'F'}`}
                                                    {char.age && `, ${char.age}a`}
                                                </div>
                                                {char.activite && (
                                                    <div className="text-xs text-muted">{char.activite}</div>
                                                )}
                                            </div>
                                            {isCurrent && (
                                                <div className="text-xs text-primary font-semibold uppercase">Actuel</div>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
        </Modal>
    );
};

export default CharacterListModal;