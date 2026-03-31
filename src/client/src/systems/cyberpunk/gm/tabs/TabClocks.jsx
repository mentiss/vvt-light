import React, {useCallback, useEffect, useState} from "react";
import {Btn, SectionTitle, Input} from "../BasicComponents.jsx";


const ClockBar = ({ clock, onAdvance, onEdit, onDelete }) => {
    const pct = clock.segments > 0 ? (clock.current / clock.segments) * 100 : 0;
    const isFull = clock.current >= clock.segments;

    return (
        <div
            className="rounded-xl p-4 flex flex-col gap-3"
            style={{
                background: 'var(--color-surface)',
                border:     `1px solid ${isFull ? 'var(--color-danger)' : 'var(--color-border)'}`,
                boxShadow:  isFull ? '0 0 12px rgba(224,48,48,0.25)' : 'none',
            }}
        >
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>
                        {clock.name}
                    </div>
                    {clock.consequence && (
                        <div className="text-xs mt-0.5 italic" style={{ color: 'var(--color-text-muted)' }}>
                            → {clock.consequence}
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                    <span className="font-mono text-xs font-bold" style={{ color: isFull ? 'var(--color-danger)' : 'var(--color-primary)' }}>
                        {clock.current}/{clock.segments}
                    </span>
                    <Btn onClick={onEdit} small variant="ghost">✏</Btn>
                    <Btn onClick={onDelete} small variant="ghost">✕</Btn>
                </div>
            </div>

            {/* Barre de progression */}
            <div
                className="w-full h-3 rounded-full overflow-hidden"
                style={{ background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)' }}
            >
                <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                        width:      `${pct}%`,
                        background: isFull
                            ? 'var(--color-danger)'
                            : pct > 66 ? 'var(--cp-neon-amber)' : 'var(--color-primary)',
                        boxShadow:  isFull ? 'var(--cp-glow-magenta)' : 'var(--cp-glow-cyan)',
                    }}
                />
            </div>

            {/* Segments cliquables */}
            <div className="flex gap-1 flex-wrap">
                {Array.from({ length: clock.segments }).map((_, i) => (
                    <button
                        key={i}
                        onClick={() => onAdvance(i < clock.current ? i : i + 1)}
                        title={`Mettre à ${i + 1}`}
                        className="flex-1 h-4 rounded transition-all min-w-[8px]"
                        style={{
                            background:  i < clock.current
                                ? (isFull ? 'var(--color-danger)' : 'var(--color-primary)')
                                : 'var(--color-surface-alt)',
                            border:      '1px solid var(--color-border)',
                            cursor:      'pointer',
                        }}
                    />
                ))}
            </div>

            {/* Boutons avancement */}
            <div className="flex gap-2">
                <Btn small variant="ghost" onClick={() => onAdvance(Math.max(0, clock.current - 1))} disabled={clock.current <= 0}>
                    ← Reculer
                </Btn>
                <Btn small variant={isFull ? 'danger' : 'default'} onClick={() => onAdvance(Math.min(clock.segments, clock.current + 1))} disabled={isFull}>
                    Avancer →
                </Btn>
            </div>

            {/* Threats liées */}
            {(clock.threatIds ?? []).length > 0 && (
                <div className="flex flex-wrap gap-1">
                    {(clock.threatIds ?? []).map(tid => (
                        <span
                            key={tid}
                            className="text-xs px-2 py-0.5 rounded"
                            style={{
                                background: 'rgba(255,45,120,0.1)',
                                color:      'var(--cp-neon-magenta)',
                                border:     '1px solid rgba(255,45,120,0.25)',
                            }}
                        >
                            ⚠ #{tid}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
};

const ClockForm = ({ initial, threats, onSave, onCancel }) => {
    const [name,        setName]        = useState(initial?.name        ?? '');
    const [segments,    setSegments]    = useState(initial?.segments    ?? 6);
    const [consequence, setConsequence] = useState(initial?.consequence ?? '');
    const [threatIds,   setThreatIds]   = useState(initial?.threatIds   ?? []);
    const [scope,       setScope]       = useState(initial?.sessionId === null ? 'slug' : 'session');

    const toggleThreat = (tid) => setThreatIds(prev =>
        prev.includes(tid) ? prev.filter(x => x !== tid) : [...prev, tid]
    );

    return (
        <div className="flex flex-col gap-3 p-4 rounded-xl" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-primary)', boxShadow: 'var(--cp-glow-cyan)' }}>
            <div>
                <label className="text-xs cp-font-ui uppercase tracking-wide block mb-1" style={{ color: 'var(--color-text-muted)' }}>Nom de la clock *</label>
                <Input value={name} onChange={setName} placeholder="Ex: Arasaka remonte la trace" />
            </div>
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="text-xs cp-font-ui uppercase tracking-wide block mb-1" style={{ color: 'var(--color-text-muted)' }}>Segments</label>
                    <input
                        type="number" min="2" max="20" value={segments}
                        onChange={e => setSegments(parseInt(e.target.value) || 6)}
                        className="w-full rounded-lg text-sm px-3 py-2 outline-none"
                        style={{ background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                    />
                </div>
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
            </div>
            <div>
                <label className="text-xs cp-font-ui uppercase tracking-wide block mb-1" style={{ color: 'var(--color-text-muted)' }}>Conséquence au remplissage</label>
                <Input value={consequence} onChange={setConsequence} placeholder="Ce qui se passe quand la clock est pleine…" />
            </div>
            {threats.length > 0 && (
                <div>
                    <label className="text-xs cp-font-ui uppercase tracking-wide block mb-1" style={{ color: 'var(--color-text-muted)' }}>Menaces liées</label>
                    <div className="flex flex-wrap gap-2">
                        {threats.map(t => (
                            <button
                                key={t.id}
                                onClick={() => toggleThreat(t.id)}
                                className="text-xs px-2 py-1 rounded transition-all"
                                style={{
                                    background: threatIds.includes(t.id) ? 'rgba(255,45,120,0.15)' : 'var(--color-surface-alt)',
                                    border:     `1px solid ${threatIds.includes(t.id) ? 'var(--cp-neon-magenta)' : 'var(--color-border)'}`,
                                    color:      threatIds.includes(t.id) ? 'var(--cp-neon-magenta)' : 'var(--color-text-muted)',
                                    cursor:     'pointer',
                                }}
                            >
                                {t.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}
            <div className="flex gap-2">
                <Btn onClick={onCancel} variant="ghost">Annuler</Btn>
                <Btn onClick={() => onSave({ name, segments, consequence, threatIds, scope })} variant="primary" disabled={!name.trim()}>
                    Sauvegarder
                </Btn>
            </div>
        </div>
    );
};


const TabClocks = ({ activeSession, fetchWithAuth, apiBase }) => {
    const [clocks,    setClocks]    = useState([]);
    const [threats,   setThreats]   = useState([]);
    const [loading,   setLoading]   = useState(true);
    const [showForm,  setShowForm]  = useState(false);
    const [editClock, setEditClock] = useState(null);

    const sessionId = activeSession?.id ?? null;

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const [cr, tr] = await Promise.all([
                fetchWithAuth(`${apiBase}/clocks${sessionId ? `?sessionId=${sessionId}` : ''}`).then(r => r.ok ? r.json() : []),
                fetchWithAuth(`${apiBase}/threats${sessionId ? `?sessionId=${sessionId}` : ''}`).then(r => r.ok ? r.json() : []),
            ]);
            setClocks(Array.isArray(cr) ? cr : []);
            setThreats(Array.isArray(tr) ? tr : []);
        } catch { setClocks([]); }
        finally { setLoading(false); }
    }, [apiBase, sessionId, fetchWithAuth]);

    useEffect(() => { load(); }, [load]);

    const save = async (formData) => {
        const isEdit = !!editClock;
        const body = {
            name:        formData.name,
            segments:    formData.segments,
            consequence: formData.consequence,
            threatIds:   formData.threatIds,
            sessionId:   formData.scope === 'session' ? sessionId : null,
        };
        if (isEdit) {
            await fetchWithAuth(`${apiBase}/clocks/${editClock.id}`, { method: 'PUT', body: JSON.stringify(body) });
        } else {
            await fetchWithAuth(`${apiBase}/clocks`, { method: 'POST', body: JSON.stringify(body) });
        }
        setShowForm(false);
        setEditClock(null);
        load();
    };

    const advance = async (clock, newVal) => {
        await fetchWithAuth(`${apiBase}/clocks/${clock.id}/advance`, {
            method: 'PATCH',
            body:   JSON.stringify({ delta: newVal - clock.current }),
        });
        load();
    };

    const deleteClock = async (id) => {
        if (!confirm('Supprimer cette clock ?')) return;
        await fetchWithAuth(`${apiBase}/clocks/${id}`, { method: 'DELETE' });
        load();
    };

    if (loading) return <p className="text-center py-8 text-sm" style={{ color: 'var(--color-text-muted)' }}>Chargement…</p>;

    return (
        <div className="flex flex-col gap-4 m-1">
            <div className="flex items-center justify-between mt-2">
                <SectionTitle>Clocks ({clocks.length})</SectionTitle>
                <Btn variant="default" onClick={() => { setEditClock(null); setShowForm(true); }}>+ Nouvelle clock</Btn>
            </div>

            {(showForm || editClock) && (
                <ClockForm
                    initial={editClock}
                    threats={threats}
                    onSave={save}
                    onCancel={() => { setShowForm(false); setEditClock(null); }}
                />
            )}

            {clocks.length === 0 && !showForm && (
                <p className="text-sm text-center py-6" style={{ color: 'var(--color-text-muted)' }}>
                    Aucune clock. Crée-en une pour suivre la progression des menaces.
                </p>
            )}

            {clocks.map(clock => (
                <ClockBar
                    key={clock.id}
                    clock={clock}
                    onAdvance={(val) => advance(clock, val)}
                    onEdit={() => { setEditClock(clock); setShowForm(false); }}
                    onDelete={() => deleteClock(clock.id)}
                />
            ))}
        </div>
    );
};


export default TabClocks;