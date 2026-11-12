// src/client/src/features/table/modals/TableChoiceModal.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Choix de la table du joueur (documentations/spec_tables.md §3.2, §6.1) : son personnage
// est membre de plusieurs tables actives. Une carte par table, avec les compagnons qui
// s'y trouvent, pour reconnaître la bonne. Ouverte d'elle-même quand rien ne permet de
// trancher, ou par « Changer de table » ; refermable sans choisir (la fiche reste
// utilisable sans table). Montée par PlayerPage, pilotée par SessionContext.
// Habillage : classes vtt-table-choice-* (features/table/tables.css).
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect, useState } from 'react';
import Modal from '@/ui/modal/Modal.jsx';
import { useSession } from '@/app/context/SessionContext.jsx';
import { useFetch } from '@/app/hooks/useFetch.js';

const initialsOf = (name) => String(name ?? '').split(/\s+/).filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase();

const TableChoiceModal = () => {
    const { tableChoice } = useSession();
    const fetchWithAuth = useFetch();
    const [members, setMembers] = useState({});   // { [tableId]: [personnages] }

    const ids = tableChoice.open ? tableChoice.tables.map(t => t.id).join(',') : '';

    // Compagnons de chaque table proposée
    useEffect(() => {
        if (!ids) return;
        let alive = true;
        Promise.all(ids.split(',').map(id => fetchWithAuth(`/api/sessions/${id}`)
            .then(r => (r.ok ? r.json() : null))
            .catch(() => null)))
            .then(list => {
                if (!alive) return;
                setMembers(Object.fromEntries(list.filter(Boolean).map(s => [s.id, s.characters ?? []])));
            });
        return () => { alive = false; };
    }, [ids, fetchWithAuth]);

    if (!tableChoice.open) return null;

    return (
        <Modal
            title="À quelle table vous connecter ?"
            size="md"
            onClose={tableChoice.dismiss}
            footer={<button type="button" className="vtt-btn" onClick={tableChoice.dismiss}>Continuer sans table</button>}
        >
            <p className="text-sm text-muted mb-4">Votre personnage fait partie de plusieurs tables en cours.</p>
            <div className="vtt-table-choice">
                {tableChoice.tables.map(table => {
                    const isCurrent = table.id === tableChoice.currentId;
                    const mates = (members[table.id] ?? []).filter(c => c.id !== tableChoice.characterId);
                    return (
                        <div key={table.id} className={`vtt-table-choice-card${isCurrent ? ' is-current' : ''}`}>
                            <div className="vtt-table-choice-text">
                                <div className="vtt-table-choice-name">{table.name}</div>
                                {members[table.id] && (
                                    <div className="vtt-table-choice-meta">
                                        {mates.length > 0 && (
                                            <span className="vtt-tables-faces">
                                                {mates.slice(0, 6).map(c => (
                                                    <span key={c.id} className="vtt-tables-avatar" title={c.name}>
                                                        {c.avatar ? <img src={c.avatar} alt="" /> : initialsOf(c.name)}
                                                    </span>
                                                ))}
                                            </span>
                                        )}
                                        <span>{mates.length ? `avec ${mates.map(c => c.name.split(' ')[0]).join(', ')}` : 'seul à cette table'}</span>
                                    </div>
                                )}
                            </div>
                            {isCurrent ? (
                                <span className="vtt-tables-state" data-state="here">Connecté</span>
                            ) : (
                                <button type="button" className="vtt-btn vtt-btn-primary" onClick={() => tableChoice.choose(table.id)}>
                                    Rejoindre
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </Modal>
    );
};

export default TableChoiceModal;
