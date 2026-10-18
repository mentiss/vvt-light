// components/gm/tables/TableManagementModal.jsx - Gestion des tables/sessions
import React, { useState, useEffect } from 'react';
import { useFetch } from '../../../hooks/useFetch.js';
import TableCharactersModal from './TableCharactersModal.jsx';
import AlertModal from "../../modals/AlertModal.jsx";
import Modal from '../../ui/Modal.jsx';

const TableManagementModal = ({ isOpen, onClose, onSelectTable, activeSessionId }) => {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingSession, setEditingSession] = useState(null);
    const [showCharactersModal, setShowCharactersModal] = useState(null);
    const [alertMessage, setAlertMessage] = useState(null);

    const fetchWithAuth = useFetch();

    useEffect(() => {
        if (isOpen) loadSessions();
    }, [isOpen]);

    const loadSessions = async () => {
        setLoading(true);
        try {
            const response = await fetchWithAuth('/api/sessions');
            const data = await response.json();
            setSessions(data);
        } catch (error) {
            console.error('Error loading sessions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSession = async (sessionData) => {
        try {
            const response = await fetchWithAuth('/api/sessions', {
                method: 'POST',
                body: JSON.stringify(sessionData)
            });
            if (response.ok) {
                await loadSessions();
                setShowCreateModal(false);
            }
        } catch (error) {
            console.error('Error creating session:', error);
            setAlertMessage('Erreur lors de la création de la table');
        }
    };

    const handleUpdateSession = async (sessionId, sessionData) => {
        try {
            const response = await fetchWithAuth(`/api/sessions/${sessionId}`, {
                method: 'PUT',
                body: JSON.stringify(sessionData)
            });
            if (response.ok) {
                await loadSessions();
                setShowEditModal(false);
                setEditingSession(null);
            }
        } catch (error) {
            console.error('Error updating session:', error);
            setAlertMessage('Erreur lors de la modification de la table');
        }
    };

    const handleDeleteSession = async (sessionId) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette table ?')) return;
        try {
            const response = await fetchWithAuth(`/api/sessions/${sessionId}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                if (sessionId === activeSessionId) {
                    localStorage.removeItem('activeSessionId');
                    onSelectTable(null);
                }
                await loadSessions();
            }
        } catch (error) {
            console.error('Error deleting session:', error);
            setAlertMessage('Erreur lors de la suppression de la table');
        }
    };

    const filteredSessions = sessions.filter(s =>
        s.name.toLowerCase().includes(filter.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <>
            <Modal title="Gestion des tables" size="lg" expandable onClose={onClose}>

                        {/* Recherche + Créer */}
                        <div className="mb-4 space-y-3">
                            <input
                                type="text"
                                placeholder="Rechercher une table..."
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                className="vtt-input"
                            />
                            <button
                                type="button"
                                onClick={() => setShowCreateModal(true)}
                                className="vtt-btn vtt-btn-primary w-full"
                            >
                                Créer une nouvelle table
                            </button>
                        </div>

                        {/* Liste des tables */}
                        {loading ? (
                            <div className="text-center py-8 text-muted">
                                Chargement...
                            </div>
                        ) : filteredSessions.length === 0 ? (
                            <div className="text-center py-8 text-muted">
                                {filter ? 'Aucune table trouvée' : 'Aucune table créée'}
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {filteredSessions.map(session => {
                                    const isActive = session.id === activeSessionId;
                                    return (
                                        <div
                                            key={session.id}
                                            className={`vtt-list-item ${isActive ? 'is-selected' : ''}`}
                                        >
                                            <div className="flex flex-wrap justify-between items-start gap-2 w-full">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <div className="text-lg font-bold">
                                                            {session.name}
                                                        </div>
                                                        {isActive && (
                                                            <span className="px-2 py-0.5 text-xs font-bold uppercase rounded border border-primary text-primary">
                                                                Active
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-sm text-muted">
                                                        {session.characterCount} personnage{session.characterCount > 1 ? 's' : ''}
                                                    </div>
                                                    {session.notes && (
                                                        <div className="text-xs text-muted mt-1 italic">
                                                            {session.notes}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex flex-wrap gap-2">
                                                    {!isActive && (
                                                        <button
                                                            type="button"
                                                            onClick={() => { onSelectTable(session); onClose(); }}
                                                            className="vtt-btn vtt-btn-primary vtt-btn-sm"
                                                        >
                                                            Activer
                                                        </button>
                                                    )}
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowCharactersModal(session)}
                                                        className="vtt-btn vtt-btn-sm"
                                                    >
                                                        Personnages
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => { setEditingSession(session); setShowEditModal(true); }}
                                                        className="vtt-btn vtt-btn-sm"
                                                    >
                                                        Modifier
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteSession(session.id)}
                                                        className="vtt-btn vtt-btn-danger vtt-btn-sm"
                                                    >
                                                        Supprimer
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
            </Modal>

            {showCreateModal && (
                <SessionFormModal
                    isOpen={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                    onSubmit={handleCreateSession}
                    onAlert={setAlertMessage}
                    title="Créer une nouvelle table"
                />
            )}

            {showEditModal && editingSession && (
                <SessionFormModal
                    isOpen={showEditModal}
                    onClose={() => { setShowEditModal(false); setEditingSession(null); }}
                    onSubmit={(data) => handleUpdateSession(editingSession.id, data)}
                    onAlert={setAlertMessage}
                    initialData={editingSession}
                    title="Modifier la table"
                />
            )}

            {showCharactersModal && (
                <TableCharactersModal
                    isOpen={!!showCharactersModal}
                    onClose={() => setShowCharactersModal(null)}
                    session={showCharactersModal}
                    onSessionUpdated={loadSessions}
                />
            )}

            {alertMessage && (
                <AlertModal
                    message={alertMessage}
                    onClose={() => setAlertMessage(null)}
                />
            )}
        </>
    );
};

// Modale de formulaire création/édition
const SessionFormModal = ({ isOpen, onClose, onSubmit, initialData = null, title, onAlert }) => {
    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        notes: initialData?.notes || ''
    });

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            onAlert('Le nom de la table est requis');
            return;
        }
        onSubmit(formData);
    };

    // Pas de fermeture au clic sur le fond : la saisie serait perdue (U-1).
    // Le bouton d'envoi, dans le pied, est rattaché au formulaire par son id.
    return (
        <Modal
            title={title}
            size="md"
            closeOnBackdrop={false}
            onClose={onClose}
            footer={
                <>
                    <button type="button" onClick={onClose} className="vtt-btn flex-1">
                        Annuler
                    </button>
                    <button type="submit" form="session-form" className="vtt-btn vtt-btn-primary flex-1">
                        {initialData ? 'Modifier' : 'Créer'}
                    </button>
                </>
            }
        >
                <form id="session-form" onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="vtt-field-label">
                            Nom de la table *
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="vtt-input"
                            placeholder="Campagne principale"
                        />
                    </div>
                    <div>
                        <label className="vtt-field-label">
                            Notes (optionnel)
                        </label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            className="vtt-input"
                            rows="3"
                            placeholder="Session hebdomadaire du mercredi..."
                        />
                    </div>
                </form>
        </Modal>
    );
};

export default TableManagementModal;