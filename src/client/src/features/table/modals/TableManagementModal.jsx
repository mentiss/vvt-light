// src/client/src/features/table/modals/TableManagementModal.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Gestion des tables du MJ (documentations/spec_tables.md §3.1, §6.1 ; planche
// documentations/tables/planche_tables.html). Une seule fenêtre en maître-détail :
//   - à gauche, les tables : recherche, création sur place, état en direct (active ici,
//     sur un autre poste, poste MJ déconnecté), portraits, suppression (confirmée) ;
//   - à droite, la table choisie : nom modifiable sur place, Activer / Désactiver,
//     personnages (en ligne, retrait confirmé sur le bouton), ajout par recherche, notes.
// Taille fixée par la place disponible ; les colonnes défilent (vtt-scroll).
// Contrat inchangé : onSelectTable(session | null) = activer cette table sur ce poste,
// ou la quitter (Désactiver, table active supprimée) ; relié à setActiveSession par GMPage.
// Activer ferme la fenêtre (le MJ retourne jouer) ; Désactiver la laisse ouverte.
// Habillage : classes vtt-tables-* (features/table/tables.css), Modal et vtt-btn / vtt-input.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect, useMemo, useState } from 'react';
import { useFetch } from '@/app/hooks/useFetch.js';
import { useActiveTables } from '@/app/hooks/useActiveTables.js';
import { useOnlineCharacters } from '@/app/hooks/useOnlineCharacters.js';
import { getSystemFromPath } from '@/app/hooks/useSystem.js';
import AlertModal from '@/ui/modal/AlertModal.jsx';
import Modal from '@/ui/modal/Modal.jsx';
import useConfirm from '@/ui/hooks/useConfirm.jsx';

// ── Petits éléments ──────────────────────────────────────────────────────────

const Icon = ({ d, size = 15 }) => (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2"
         strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>
);
const ICON_TRASH = 'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6';
const ICON_CLOSE = 'M6 6l12 12M18 6L6 18';

/** Prénom et nom (liste /characters), sinon le nom déjà composé (table), sinon le joueur. */
const nameOf = (c) => [c.prenom, c.nom].filter(Boolean).join(' ') || c.name || c.playerName || 'Sans nom';
const initialsOf = (name) => name.split(/\s+/).filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase();

const Avatar = ({ char, online }) => {
    const name = nameOf(char);
    return (
        <span className="vtt-tables-avatar" data-online={online ? '' : undefined} title={online ? `${name} · en ligne` : name}>
            {char.avatar ? <img src={char.avatar} alt="" /> : initialsOf(name)}
        </span>
    );
};

/** État d'une table vu de ce poste (null : inactive). */
const tableStatus = (activeTables, sessionId, isActiveHere) => {
    const entry = activeTables?.find(t => t.id === sessionId);
    if (!entry) return null;
    const others = entry.posts - (isActiveHere ? 1 : 0);
    if (isActiveHere) return { key: 'here', label: others > 0 ? `Active ici · +${others} poste${others > 1 ? 's' : ''}` : 'Active ici' };
    if (others > 1) return { key: 'elsewhere', label: `Active sur ${others} autres postes` };
    if (others === 1) return { key: 'elsewhere', label: 'Active sur un autre poste' };
    return { key: 'waiting', label: 'Poste MJ déconnecté' };
};

const StateChip = ({ status }) => (
    status ? <span className="vtt-tables-state" data-state={status.key}>{status.label}</span> : null
);

// ── Carte d'une table (liste de gauche) ──────────────────────────────────────

const TableRow = ({ session, selected, status, online, onSelect, onDelete }) => {
    const count = session.characters?.length ?? session.characterCount ?? 0;
    return (
        <div role="button" tabIndex={0} className={`vtt-tables-row${selected ? ' is-selected' : ''}`}
             onClick={onSelect} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(); } }}>
            <span className="vtt-tables-row-name">{session.name}</span>
            <span className="vtt-tables-row-meta">
                {count > 0 && (
                    <span className="vtt-tables-faces">
                        {(session.characters ?? []).slice(0, 5).map(c => <Avatar key={c.id} char={c} online={online.has(c.id)} />)}
                    </span>
                )}
                <span>{count} personnage{count > 1 ? 's' : ''}</span>
            </span>
            <StateChip status={status} />
            <button type="button" className="vtt-tables-row-delete" title="Supprimer la table"
                    onClick={e => { e.stopPropagation(); onDelete(); }}>
                <Icon d={ICON_TRASH} />
            </button>
        </div>
    );
};

// ── Ajout d'un personnage par recherche ──────────────────────────────────────

const AddCharacterField = ({ available, online, onAdd }) => {
    const [query, setQuery] = useState('');
    const [open, setOpen] = useState(false);
    const [focus, setFocus] = useState(0);

    const q = query.trim().toLowerCase();
    const matches = available.filter(c => `${nameOf(c)} ${c.playerName ?? ''}`.toLowerCase().includes(q));

    const add = (c) => { onAdd(c.id); setQuery(''); setFocus(0); };
    const onKeyDown = (e) => {
        if (e.key === 'ArrowDown') { e.preventDefault(); setOpen(true); setFocus(f => Math.min(matches.length - 1, f + 1)); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); setFocus(f => Math.max(0, f - 1)); }
        else if (e.key === 'Enter' && open && matches[focus]) { e.preventDefault(); add(matches[focus]); }
        else if (e.key === 'Escape' && open) { e.stopPropagation(); setOpen(false); }
    };

    return (
        <div className="vtt-tables-add" onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false); }}>
            <input type="text" className="vtt-input" placeholder="＋ Ajouter un personnage : nom ou joueur…"
                   value={query} onFocus={() => setOpen(true)} onKeyDown={onKeyDown}
                   onChange={e => { setQuery(e.target.value); setOpen(true); setFocus(0); }} />
            {open && (
                <div className="vtt-tables-suggest vtt-scroll">
                    {matches.length === 0 ? (
                        <div className="vtt-tables-empty">
                            {q ? 'Aucun personnage trouvé' : 'Tous les personnages sont déjà à cette table'}
                        </div>
                    ) : matches.map((c, i) => (
                        <button type="button" key={c.id} className={`vtt-tables-suggest-item${i === focus ? ' is-focus' : ''}`}
                                onMouseEnter={() => setFocus(i)} onClick={() => add(c)}>
                            <Avatar char={c} online={online.has(c.id)} />
                            <span className="vtt-tables-member-text">
                                <span className="vtt-tables-member-name">{nameOf(c)}</span>
                                {c.playerName && <span className="vtt-tables-member-player"> · {c.playerName}</span>}
                            </span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

// ── Détail de la table choisie ───────────────────────────────────────────────

const TableDetail = ({ session, isActiveHere, status, online, allCharacters, onSave, onActivate, onDeactivate, onAdd, onRemove }) => {
    const [name, setName] = useState(session.name);
    const [notes, setNotes] = useState(session.notes ?? '');
    const [armed, setArmed] = useState(null);   // personnage dont le retrait attend sa confirmation
    // Une autre table : nouvelle instance (key = id de la table), champs repartis de ses valeurs

    const saveName = () => {
        const trimmed = name.trim();
        if (!trimmed) { setName(session.name); return; }
        if (trimmed !== session.name) onSave({ name: trimmed });
    };
    const saveNotes = () => { if (notes !== (session.notes ?? '')) onSave({ notes }); };

    const members = session.characters ?? [];
    const memberIds = new Set(members.map(c => c.id));
    const available = allCharacters.filter(c => !memberIds.has(c.id));

    return (
        <>
            <div className="vtt-tables-head">
                <input className="vtt-tables-title" value={name} aria-label="Nom de la table" title="Renommer la table"
                       onChange={e => setName(e.target.value)} onBlur={saveName}
                       onKeyDown={e => { if (e.key === 'Enter') e.currentTarget.blur(); }} />
                <div className="vtt-tables-actions">
                    <StateChip status={status} />
                    {isActiveHere
                        ? <button type="button" className="vtt-btn" onClick={onDeactivate}>Désactiver</button>
                        : <button type="button" className="vtt-btn vtt-btn-primary" onClick={onActivate}>Activer</button>}
                </div>
            </div>

            <section>
                <h3 className="vtt-tables-section-title">Personnages · {members.length}</h3>
                {members.length === 0 ? (
                    <div className="vtt-tables-empty">Aucun personnage à cette table.</div>
                ) : (
                    <div className="vtt-tables-members">
                        {members.map(c => (
                            <div key={c.id} className="vtt-tables-member">
                                <Avatar char={c} online={online.has(c.id)} />
                                <div className="vtt-tables-member-text">
                                    <div className="vtt-tables-member-name">{nameOf(c)}</div>
                                    <div className="vtt-tables-member-player">
                                        {c.playerName}{online.has(c.id) ? ' · en ligne' : ''}
                                    </div>
                                </div>
                                {armed === c.id ? (
                                    <button type="button" className="vtt-tables-remove is-armed"
                                            onClick={() => { setArmed(null); onRemove(c.id); }} onBlur={() => setArmed(null)} autoFocus>
                                        Retirer ?
                                    </button>
                                ) : (
                                    <button type="button" className="vtt-tables-remove" title="Retirer de la table" onClick={() => setArmed(c.id)}>
                                        <Icon d={ICON_CLOSE} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
                <AddCharacterField available={available} online={online} onAdd={onAdd} />
            </section>

            <section>
                <h3 className="vtt-tables-section-title">Notes</h3>
                <textarea className="vtt-input vtt-tables-notes" value={notes} placeholder="Jour de jeu, rappel pour la prochaine séance…"
                          onChange={e => setNotes(e.target.value)} onBlur={saveNotes} />
            </section>
        </>
    );
};

// ── Fenêtre ──────────────────────────────────────────────────────────────────

const TableManagementModal = ({ isOpen, onClose, onSelectTable, activeSessionId }) => {
    const [sessions, setSessions] = useState([]);
    const [allCharacters, setAllCharacters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedId, setSelectedId] = useState(activeSessionId ?? null);
    const [filter, setFilter] = useState('');
    const [creating, setCreating] = useState(false);
    const [newName, setNewName] = useState('');
    const [alertMessage, setAlertMessage] = useState(null);

    const fetchWithAuth = useFetch();
    const { confirm, confirmEl } = useConfirm();
    const activeTables = useActiveTables(isOpen);
    const onlineList = useOnlineCharacters(getSystemFromPath(), isOpen);
    const online = useMemo(() => new Set(onlineList.map(c => Number(c.characterId))), [onlineList]);

    useEffect(() => {
        if (!isOpen) return;
        let alive = true;
        setLoading(true);
        Promise.all([
            fetchWithAuth('/api/sessions').then(r => r.json()),
            fetchWithAuth('/api/characters').then(r => r.json()),
        ]).then(([list, chars]) => {
            if (!alive) return;
            setSessions(Array.isArray(list) ? list : []);
            setAllCharacters(Array.isArray(chars) ? chars.filter(c => c.id !== -1) : []);
            setSelectedId(id => id ?? (Array.isArray(list) ? list[0]?.id ?? null : null));
        }).catch(err => {
            console.error('[TableManagementModal] Error loading tables:', err);
            if (alive) setAlertMessage('Erreur lors du chargement des tables');
        }).finally(() => { if (alive) setLoading(false); });
        return () => { alive = false; };
    }, [isOpen, fetchWithAuth]);

    // Table renvoyée par le serveur (création, modification, composition) : remplacée dans la liste
    const putSession = (updated) => setSessions(list => {
        const merged = { ...updated, characterCount: updated.characters?.length ?? updated.characterCount ?? 0 };
        return list.some(s => s.id === merged.id) ? list.map(s => (s.id === merged.id ? { ...s, ...merged } : s)) : [merged, ...list];
    });

    const request = async (url, options, errorMessage) => {
        try {
            const response = await fetchWithAuth(url, options);
            const body = await response.json().catch(() => ({}));
            if (!response.ok) { setAlertMessage(body.error || errorMessage); return null; }
            return body;
        } catch (error) {
            console.error('[TableManagementModal]', error);
            setAlertMessage(errorMessage);
            return null;
        }
    };

    const createTable = async (e) => {
        e.preventDefault();
        const name = newName.trim();
        if (!name) return;
        const created = await request('/api/sessions', { method: 'POST', body: JSON.stringify({ name }) }, 'Erreur lors de la création de la table');
        if (!created) return;
        putSession(created);
        setSelectedId(created.id);
        setCreating(false);
        setNewName('');
    };

    const saveTable = async (sessionId, data) => {
        const updated = await request(`/api/sessions/${sessionId}`, { method: 'PUT', body: JSON.stringify(data) }, 'Erreur lors de la modification de la table');
        if (updated) putSession(updated);
    };

    const deleteTable = async (session) => {
        const isActiveHere = session.id === activeSessionId;
        const ok = await confirm({
            title:       'Supprimer la table',
            message:     `Supprimer « ${session.name} » ? Ses personnages en sont retirés, leurs fiches sont gardées.`
                       + (isActiveHere ? ' Elle est active ici : elle sera d\'abord désactivée.' : ''),
            confirmText: 'Supprimer',
            danger:      true,
        });
        if (!ok) return;
        if (isActiveHere) onSelectTable(null);
        const done = await request(`/api/sessions/${session.id}`, { method: 'DELETE' }, 'Erreur lors de la suppression de la table');
        if (!done) return;
        setSessions(list => list.filter(s => s.id !== session.id));
        setSelectedId(id => (id === session.id ? null : id));
    };

    const addCharacter = async (sessionId, characterId) => {
        const updated = await request(`/api/sessions/${sessionId}/characters/${characterId}`, { method: 'POST' }, 'Erreur lors de l\'ajout du personnage');
        if (updated) putSession(updated);
    };

    const removeCharacter = async (sessionId, characterId) => {
        const updated = await request(`/api/sessions/${sessionId}/characters/${characterId}`, { method: 'DELETE' }, 'Erreur lors du retrait du personnage');
        if (updated) putSession(updated);
    };

    if (!isOpen) return null;

    // Table active ici en tête, puis les autres tables actives, puis le reste (ordre du serveur)
    const rank = (s) => (s.id === activeSessionId ? 0 : tableStatus(activeTables, s.id, false) ? 1 : 2);
    const shown = sessions
        .filter(s => s.name.toLowerCase().includes(filter.trim().toLowerCase()))
        .map((s, i) => ({ s, i }))
        .sort((a, b) => rank(a.s) - rank(b.s) || a.i - b.i)
        .map(({ s }) => s);
    const selected = sessions.find(s => s.id === selectedId) ?? null;
    const activeHere = sessions.find(s => s.id === activeSessionId);

    return (
        <>
            <Modal
                title="Gestion des tables"
                subtitle={activeHere ? `Ce poste mène « ${activeHere.name} »` : 'Aucune table active sur ce poste'}
                size="xl"
                expandable
                className="vtt-tables-modal"
                onClose={onClose}
            >
                {loading ? (
                    <div className="vtt-tables-empty">Chargement…</div>
                ) : (
                    <div className="vtt-tables">
                        <div className="vtt-tables-side">
                            <input type="text" className="vtt-input" placeholder="Rechercher une table…"
                                   value={filter} onChange={e => setFilter(e.target.value)} />
                            {creating ? (
                                <form className="vtt-tables-new" onSubmit={createTable}>
                                    <input type="text" className="vtt-input" placeholder="Nom de la table" autoFocus
                                           value={newName} onChange={e => setNewName(e.target.value)}
                                           onKeyDown={e => { if (e.key === 'Escape') { e.stopPropagation(); setCreating(false); setNewName(''); } }} />
                                    <button type="submit" className="vtt-btn vtt-btn-primary vtt-btn-sm">Créer</button>
                                </form>
                            ) : (
                                <button type="button" className="vtt-btn w-full" onClick={() => setCreating(true)}>＋ Nouvelle table</button>
                            )}
                            <div className="vtt-tables-list vtt-scroll">
                                {shown.length === 0 ? (
                                    <div className="vtt-tables-empty">{filter ? 'Aucune table trouvée' : 'Aucune table créée'}</div>
                                ) : shown.map(s => (
                                    <TableRow key={s.id} session={s} selected={s.id === selectedId} online={online}
                                              status={tableStatus(activeTables, s.id, s.id === activeSessionId)}
                                              onSelect={() => setSelectedId(s.id)} onDelete={() => deleteTable(s)} />
                                ))}
                            </div>
                        </div>

                        <div className="vtt-tables-detail vtt-scroll">
                            {selected ? (
                                <TableDetail
                                    key={selected.id}
                                    session={selected}
                                    isActiveHere={selected.id === activeSessionId}
                                    status={tableStatus(activeTables, selected.id, selected.id === activeSessionId)}
                                    online={online}
                                    allCharacters={allCharacters}
                                    onSave={data => saveTable(selected.id, data)}
                                    onActivate={() => { onSelectTable(selected); onClose(); }}
                                    onDeactivate={() => onSelectTable(null)}
                                    onAdd={id => addCharacter(selected.id, id)}
                                    onRemove={id => removeCharacter(selected.id, id)}
                                />
                            ) : (
                                <div className="vtt-tables-empty">Choisissez une table dans la liste, ou créez-en une.</div>
                            )}
                        </div>
                    </div>
                )}
            </Modal>

            {alertMessage && <AlertModal message={alertMessage} onClose={() => setAlertMessage(null)} />}
            {confirmEl}
        </>
    );
};

export default TableManagementModal;
