import React, {useCallback, useEffect, useState} from "react";
import {Btn, SectionTitle, Textarea, Input} from "../BasicComponents.jsx";

const ThreatCard = ({ threat, clocks, onEdit, onDelete }) => {
    const [expanded, setExpanded] = useState(false);
    const linkedClocks = clocks.filter(c => (threat.clockIds ?? []).includes(c.id));

    return (
        <div
            className="rounded-xl overflow-hidden"
            style={{
                background: 'var(--color-surface)',
                border:     '1px solid var(--color-border)',
            }}
        >
            {/* Header cliquable */}
            <button
                onClick={() => setExpanded(v => !v)}
                className="w-full text-left px-4 py-3 flex items-center gap-3"
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
                <span className="text-base" style={{ color: 'var(--cp-neon-magenta)' }}>⚠</span>
                <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>{threat.name}</div>
                    {threat.type && (
                        <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{threat.type}</div>
                    )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    {linkedClocks.length > 0 && (
                        <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'rgba(0,229,255,0.1)', color: 'var(--color-primary)' }}>
                            {linkedClocks.length} clock{linkedClocks.length > 1 ? 's' : ''}
                        </span>
                    )}
                    <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>
                        {expanded ? '▲' : '▼'}
                    </span>
                </div>
            </button>

            {/* Corps expandable */}
            {expanded && (
                <div
                    className="px-4 pb-4 flex flex-col gap-3"
                    style={{ borderTop: '1px solid var(--color-border)' }}
                >
                    {threat.impulse && (
                        <div>
                            <span className="text-xs cp-font-ui uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>Impulsion</span>
                            <p className="text-sm mt-0.5" style={{ color: 'var(--color-text)' }}>{threat.impulse}</p>
                        </div>
                    )}
                    {(threat.moves ?? []).length > 0 && (
                        <div>
                            <span className="text-xs cp-font-ui uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>Moves MC</span>
                            <ul className="mt-1 flex flex-col gap-1">
                                {threat.moves.map((m, i) => (
                                    <li key={i} className="text-sm flex gap-2" style={{ color: 'var(--color-text)' }}>
                                        <span style={{ color: 'var(--cp-neon-magenta)' }}>›</span> {m}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {linkedClocks.length > 0 && (
                        <div>
                            <span className="text-xs cp-font-ui uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>Clocks liées</span>
                            <div className="flex flex-col gap-1 mt-1">
                                {linkedClocks.map(c => (
                                    <div key={c.id} className="flex items-center gap-2">
                                        <div
                                            className="flex-1 h-1.5 rounded-full overflow-hidden"
                                            style={{ background: 'var(--color-surface-alt)' }}
                                        >
                                            <div
                                                className="h-full rounded-full"
                                                style={{
                                                    width:      `${(c.current / c.segments) * 100}%`,
                                                    background: c.current >= c.segments ? 'var(--color-danger)' : 'var(--color-primary)',
                                                }}
                                            />
                                        </div>
                                        <span className="text-xs font-mono" style={{ color: 'var(--color-text-muted)' }}>
                                            {c.name} ({c.current}/{c.segments})
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {threat.notes && (
                        <p className="text-xs italic" style={{ color: 'var(--color-text-muted)' }}>{threat.notes}</p>
                    )}
                    <div className="flex gap-2 pt-1">
                        <Btn small onClick={onEdit}>✏ Modifier</Btn>
                        <Btn small variant="danger" onClick={onDelete}>✕ Supprimer</Btn>
                    </div>
                </div>
            )}
        </div>
    );
};


const THREAT_TYPES = ['Corporation', 'Gang', 'Individu', 'IA', 'Lieu', 'Autre'];

const ThreatForm = ({ initial, clocks, onSave, onCancel }) => {
    const [name,     setName]     = useState(initial?.name    ?? '');
    const [type,     setType]     = useState(initial?.type    ?? '');
    const [impulse,  setImpulse]  = useState(initial?.impulse ?? '');
    const [moves,    setMoves]    = useState((initial?.moves  ?? []).join('\n'));
    const [notes,    setNotes]    = useState(initial?.notes   ?? '');
    const [clockIds, setClockIds] = useState(initial?.clockIds ?? []);
    const [scope,    setScope]    = useState(initial?.sessionId === null ? 'slug' : 'session');

    const toggleClock = (cid) => setClockIds(prev =>
        prev.includes(cid) ? prev.filter(x => x !== cid) : [...prev, cid]
    );

    return (
        <div className="flex flex-col gap-3 p-4 rounded-xl" style={{ background: 'var(--color-surface)', border: '1px solid var(--cp-neon-magenta)', boxShadow: 'var(--cp-glow-magenta)' }}>
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="text-xs cp-font-ui uppercase tracking-wide block mb-1" style={{ color: 'var(--color-text-muted)' }}>Nom *</label>
                    <Input value={name} onChange={setName} placeholder="Ex: Arasaka" />
                </div>
                <div>
                    <label className="text-xs cp-font-ui uppercase tracking-wide block mb-1" style={{ color: 'var(--color-text-muted)' }}>Type</label>
                    <select
                        value={type}
                        onChange={e => setType(e.target.value)}
                        className="w-full rounded-lg text-sm px-3 py-2 outline-none"
                        style={{ background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                    >
                        <option value="">—</option>
                        {THREAT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>
            </div>
            <div>
                <label className="text-xs cp-font-ui uppercase tracking-wide block mb-1" style={{ color: 'var(--color-text-muted)' }}>Impulsion fondamentale</label>
                <Input value={impulse} onChange={setImpulse} placeholder="Ce que cette menace veut fondamentalement…" />
            </div>
            <div>
                <label className="text-xs cp-font-ui uppercase tracking-wide block mb-1" style={{ color: 'var(--color-text-muted)' }}>Moves MC (un par ligne)</label>
                <Textarea value={moves} onChange={setMoves} placeholder="Compromettre un contact&#10;Avancer une clock&#10;Envoyer des renforts…" rows={4} />
            </div>
            <div>
                <label className="text-xs cp-font-ui uppercase tracking-wide block mb-1" style={{ color: 'var(--color-text-muted)' }}>Notes</label>
                <Textarea value={notes} onChange={setNotes} placeholder="Notes libres…" rows={2} />
            </div>
            {clocks.length > 0 && (
                <div>
                    <label className="text-xs cp-font-ui uppercase tracking-wide block mb-1" style={{ color: 'var(--color-text-muted)' }}>Clocks liées</label>
                    <div className="flex flex-wrap gap-2">
                        {clocks.map(c => (
                            <button
                                key={c.id}
                                onClick={() => toggleClock(c.id)}
                                className="text-xs px-2 py-1 rounded transition-all"
                                style={{
                                    background: clockIds.includes(c.id) ? 'rgba(0,229,255,0.15)' : 'var(--color-surface-alt)',
                                    border:     `1px solid ${clockIds.includes(c.id) ? 'var(--color-primary)' : 'var(--color-border)'}`,
                                    color:      clockIds.includes(c.id) ? 'var(--color-primary)' : 'var(--color-text-muted)',
                                    cursor:     'pointer',
                                }}
                            >
                                {c.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}
            <div>
                <label className="text-xs cp-font-ui uppercase tracking-wide block mb-1" style={{ color: 'var(--color-text-muted)' }}>Portée</label>
                <select
                    value={scope}
                    onChange={e => setScope(e.target.value)}
                    className="w-full rounded-lg text-sm px-3 py-2 outline-none"
                    style={{ background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                >
                    <option value="session">Session</option>
                    <option value="slug">Campagne (global)</option>
                </select>
            </div>
            <div className="flex gap-2">
                <Btn onClick={onCancel} variant="ghost">Annuler</Btn>
                <Btn
                    onClick={() => onSave({
                        name, type, impulse,
                        moves: moves.split('\n').map(m => m.trim()).filter(Boolean),
                        notes, clockIds, scope,
                    })}
                    variant="primary"
                    disabled={!name.trim()}
                >
                    Sauvegarder
                </Btn>
            </div>
        </div>
    );
};

// ── TabThreats ────────────────────────────────────────────────────────────────

const TabThreats = ({ activeSession, fetchWithAuth, apiBase }) => {
    const [threats,    setThreats]    = useState([]);
    const [clocks,     setClocks]     = useState([]);
    const [loading,    setLoading]    = useState(true);
    const [showForm,   setShowForm]   = useState(false);
    const [editThreat, setEditThreat] = useState(null);

    const sessionId = activeSession?.id ?? null;

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const [tr, cr] = await Promise.all([
                fetchWithAuth(`${apiBase}/threats${sessionId ? `?sessionId=${sessionId}` : ''}`).then(r => r.ok ? r.json() : []),
                fetchWithAuth(`${apiBase}/clocks${sessionId ? `?sessionId=${sessionId}` : ''}`).then(r => r.ok ? r.json() : []),
            ]);
            setThreats(Array.isArray(tr) ? tr : []);
            setClocks(Array.isArray(cr) ? cr : []);
        } catch { setThreats([]); }
        finally { setLoading(false); }
    }, [apiBase, sessionId, fetchWithAuth]);

    useEffect(() => { load(); }, [load]);

    const save = async (formData) => {
        const body = {
            name:      formData.name,
            type:      formData.type,
            impulse:   formData.impulse,
            moves:     formData.moves,
            notes:     formData.notes,
            clockIds:  formData.clockIds,
            sessionId: formData.scope === 'session' ? sessionId : null,
        };
        if (editThreat) {
            await fetchWithAuth(`${apiBase}/threats/${editThreat.id}`, { method: 'PUT', body: JSON.stringify(body) });
        } else {
            await fetchWithAuth(`${apiBase}/threats`, { method: 'POST', body: JSON.stringify(body) });
        }
        setShowForm(false);
        setEditThreat(null);
        load();
    };

    const deleteThreat = async (id) => {
        if (!confirm('Supprimer cette menace ?')) return;
        await fetchWithAuth(`${apiBase}/threats/${id}`, { method: 'DELETE' });
        load();
    };

    if (loading) return <p className="text-center py-8 text-sm" style={{ color: 'var(--color-text-muted)' }}>Chargement…</p>;

    return (
        <div className="flex flex-col gap-4 m-1">
            <div className="flex items-center justify-between mt-2">
                <SectionTitle>Menaces ({threats.length})</SectionTitle>
                <Btn variant="default" onClick={() => { setEditThreat(null); setShowForm(true); }}>+ Nouvelle menace</Btn>
            </div>

            {(showForm || editThreat) && (
                <ThreatForm
                    initial={editThreat}
                    clocks={clocks}
                    onSave={save}
                    onCancel={() => { setShowForm(false); setEditThreat(null); }}
                />
            )}

            {threats.length === 0 && !showForm && (
                <p className="text-sm text-center py-6" style={{ color: 'var(--color-text-muted)' }}>
                    Aucune menace définie.
                </p>
            )}

            {threats.map(threat => (
                <ThreatCard
                    key={threat.id}
                    threat={threat}
                    clocks={clocks}
                    onEdit={() => { setEditThreat(threat); setShowForm(false); }}
                    onDelete={() => deleteThreat(threat.id)}
                />
            ))}
        </div>
    );
};

export default TabThreats;