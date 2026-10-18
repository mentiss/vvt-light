// src/client/src/components/gm/modals/TableCharactersModal.jsx
// Gérer les personnages d'une table/session.
//
// Corrections appliquées :
//   - alertMessage déplacé dans chaque sous-composant (scope propre)
//   - char.name normalisé : utilise nom || name || playerName (multi-slug)
//   - chars défensif : Array.isArray() avant .filter()

import React, { useState, useEffect } from 'react';
import { useFetch } from '../../../hooks/useFetch.js';
import AlertModal from '../../modals/AlertModal.jsx';
import Modal from '../../ui/Modal.jsx';
import useConfirm from '../../../hooks/useConfirm.jsx';

// ─── Composant principal ──────────────────────────────────────────────────────

const TableCharactersModal = ({ isOpen, onClose, session, onSessionUpdated }) => {
    const [sessionData,    setSessionData]    = useState(null);
    const [allCharacters,  setAllCharacters]  = useState([]);
    const [loading,        setLoading]        = useState(true);
    const [showAddModal,   setShowAddModal]   = useState(false);
    const [alertMessage,   setAlertMessage]   = useState(null);

    const fetchWithAuth = useFetch();
    const { confirm, confirmEl } = useConfirm();

    useEffect(() => {
        if (isOpen && session) loadData();
    }, [isOpen, session]);

    const loadData = async () => {
        setLoading(true);
        try {
            const sessionResponse = await fetchWithAuth(`/api/sessions/${session.id}`);
            const sessionFull = await sessionResponse.json();
            setSessionData(sessionFull);

            const charsResponse = await fetchWithAuth('/api/characters');
            const chars = await charsResponse.json();

            if (!Array.isArray(chars)) {
                console.error('[TableCharactersModal] /api/characters n\'a pas retourné un tableau :', chars);
                setAllCharacters([]);
                return;
            }

            setAllCharacters(chars.filter(c => c.id !== -1));
        } catch (error) {
            console.error('[TableCharactersModal] Error loading data:', error);
            setAlertMessage('Erreur lors du chargement des données');
        } finally {
            setLoading(false);
        }
    };

    const handleAddCharacter = async (characterId) => {
        try {
            const response = await fetchWithAuth(
                `/api/sessions/${session.id}/characters/${characterId}`,
                { method: 'POST' }
            );
            if (response.ok) {
                const updated = await response.json();
                setSessionData(updated);
                setShowAddModal(false);
                onSessionUpdated?.(updated);
            } else {
                const err = await response.json().catch(() => ({}));
                setAlertMessage(err.error || 'Erreur lors de l\'ajout du personnage');
            }
        } catch (error) {
            console.error('[TableCharactersModal] Error adding character:', error);
            setAlertMessage('Erreur lors de l\'ajout du personnage');
        }
    };

    const handleRemoveCharacter = async (characterId) => {
        const ok = await confirm({
            title:       'Retirer le personnage',
            message:     'Retirer ce personnage de la table ?',
            confirmText: 'Retirer',
            danger:      true,
        });
        if (!ok) return;
        try {
            const response = await fetchWithAuth(
                `/api/sessions/${session.id}/characters/${characterId}`,
                { method: 'DELETE' }
            );
            if (response.ok) {
                const updated = await response.json();
                setSessionData(updated);
                onSessionUpdated?.(updated);
            }
        } catch (error) {
            console.error('[TableCharactersModal] Error removing character:', error);
            setAlertMessage('Erreur lors du retrait du personnage');
        }
    };

    if (!isOpen) return null;

    const assignedIds    = sessionData?.characters?.map(c => c.id) || [];
    const availableChars = allCharacters.filter(c => !assignedIds.includes(c.id));

    return (
        <>
            <Modal
                title="Personnages de la table"
                subtitle={session.name}
                size="lg"
                expandable
                onClose={onClose}
                footer={<button type="button" onClick={onClose} className="vtt-btn w-full">Fermer</button>}
            >
                        {loading ? (
                            <div className="text-center py-8 text-muted">
                                Chargement...
                            </div>
                        ) : (
                            <>
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(true)}
                                    className="vtt-btn vtt-btn-primary w-full mb-4"
                                >
                                    Ajouter un personnage
                                </button>

                                {!sessionData?.characters?.length ? (
                                    <div className="text-center py-8 text-muted">
                                        Aucun personnage dans cette table
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {sessionData.characters.map(char => (
                                            <CharacterRow
                                                key={char.id}
                                                char={char}
                                                onRemove={() => handleRemoveCharacter(char.id)}
                                            />
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
            </Modal>

            {showAddModal && (
                <AddCharacterModal
                    onClose={() => setShowAddModal(false)}
                    availableCharacters={availableChars}
                    onAddCharacter={handleAddCharacter}
                />
            )}

            {alertMessage && (
                <AlertModal
                    message={alertMessage}
                    onClose={() => setAlertMessage(null)}
                />
            )}

            {confirmEl}
        </>
    );
};

// ─── Ligne d'un personnage assigné ───────────────────────────────────────────

function getDisplayName(char) {
    return char.nom || char.name || char.playerName || '—';
}

// Avatar ou initiale du personnage
const CharacterAvatar = ({ char }) => (
    char.avatar ? (
        <img
            src={char.avatar}
            alt={getDisplayName(char)}
            className="w-12 h-12 rounded-full border-2 border-default shrink-0 object-cover"
        />
    ) : (
        <div className="w-12 h-12 rounded-full border-2 border-dashed border-default bg-surface flex items-center justify-center shrink-0 text-lg font-bold text-muted">
            {getDisplayName(char).charAt(0).toUpperCase()}
        </div>
    )
);

const CharacterRow = ({ char, onRemove }) => (
    <div className="vtt-list-item">
        <CharacterAvatar char={char} />

        <div className="flex-1 min-w-0">
            <div className="font-bold truncate">
                {getDisplayName(char)}
            </div>
            <div className="text-sm text-muted">
                Joueur : {char.playerName}
            </div>
        </div>

        <button
            type="button"
            onClick={onRemove}
            className="vtt-btn vtt-btn-danger vtt-btn-sm shrink-0"
        >
            Retirer
        </button>
    </div>
);

// ─── Modale d'ajout ───────────────────────────────────────────────────────────

const AddCharacterModal = ({ onClose, availableCharacters, onAddCharacter }) => {
    const [filter,       setFilter]       = useState('');
    const [alertMessage, setAlertMessage] = useState(null);

    const filtered = availableCharacters.filter(c => {
        const displayName = getDisplayName(c);
        const search = `${displayName} ${c.playerName ?? ''}`.toLowerCase();
        return search.includes(filter.toLowerCase());
    });

    return (
        <>
            <Modal
                title="Ajouter un personnage"
                size="lg"
                onClose={onClose}
                footer={<button type="button" onClick={onClose} className="vtt-btn w-full">Annuler</button>}
            >
                    <input
                        type="text"
                        placeholder="Rechercher un personnage..."
                        value={filter}
                        onChange={e => setFilter(e.target.value)}
                        className="vtt-input mb-4"
                        autoFocus
                    />

                    {filtered.length === 0 ? (
                        <div className="text-center py-8 text-muted">
                            {filter ? 'Aucun personnage trouvé' : 'Tous les personnages sont déjà assignés'}
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {filtered.map(char => (
                                <button
                                    type="button"
                                    key={char.id}
                                    onClick={() => onAddCharacter(char.id)}
                                    className="vtt-list-item"
                                >
                                    <CharacterAvatar char={char} />

                                    <div className="flex-1 min-w-0">
                                        <div className="font-bold truncate">
                                            {getDisplayName(char)}
                                        </div>
                                        <div className="text-sm text-muted">
                                            {char.playerName}
                                        </div>
                                    </div>

                                    <span className="text-sm font-semibold text-primary shrink-0">Ajouter</span>
                                </button>
                            ))}
                        </div>
                    )}
            </Modal>

            {alertMessage && (
                <AlertModal
                    message={alertMessage}
                    onClose={() => setAlertMessage(null)}
                />
            )}
        </>
    );
};

export default TableCharactersModal;