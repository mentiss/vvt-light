// src/client/src/systems/cyberpunk/gm/GMView.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Interface GM Cyberpunk — 5 onglets :
//   Session   → liste perso, gestion ressources (générique TabSession)
//   Clocks    → horloges de campagne + session
//   Threats   → menaces liées aux clocks
//   Manœuvres → validation des moves custom en attente
//   Journal   → journal GM (générique TabJournal)
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useCallback } from 'react';
import { useParams }  from 'react-router-dom';
import { useAuth }    from '../../../context/AuthContext.jsx';
import { useSocket }  from '../../../context/SocketContext.jsx';
import { useFetch }   from '../../../hooks/useFetch.js';
import { useSystem }  from '../../../hooks/useSystem.js';

import ToastNotifications   from '../../../components/layout/ToastNotifications.jsx';
import HistoryPanel         from '../../../components/layout/HistoryPanel.jsx';
import ThemeToggle          from '../../../components/ui/ThemeToggle.jsx';
import TableManagementModal from '../../../components/gm/modals/TableManagementModal.jsx';
import DiceConfigModal      from '../../../components/modals/DiceConfigModal.jsx';
import TabJournal           from '../../../components/gm/tabs/TabJournal.jsx';

import cyberpunkConfig, { STAT_LABELS } from '../config.jsx';
import TabSession from "./tabs/TabSession.jsx";

// ── Onglets GM ────────────────────────────────────────────────────────────────

const GM_TABS = [
    { id: 'session',   label: '📜 Session'   },
    { id: 'clocks',    label: '⏱ Clocks'     },
    { id: 'threats',   label: '⚠ Menaces'    },
    { id: 'moves',     label: '⬡ Manœuvres'  },
    { id: 'journal',   label: '📓 Journal'   },
];

// ── Helpers UI ────────────────────────────────────────────────────────────────

const SectionTitle = ({ children }) => (
    <h2
        className="text-xs font-bold cp-font-ui uppercase tracking-widest mb-3"
        style={{ color: 'var(--color-text-muted)' }}
    >
        {children}
    </h2>
);

const Btn = ({ onClick, children, variant = 'default', small = false, disabled = false }) => {
    const styles = {
        default:  { background: 'var(--color-surface-alt)', color: 'var(--color-text)',    border: '1px solid var(--color-border)' },
        primary:  { background: 'var(--color-primary)',     color: 'var(--color-bg)',       border: 'none', boxShadow: 'var(--cp-glow-cyan)' },
        danger:   { background: 'var(--color-danger)',      color: 'white',                 border: 'none' },
        success:  { background: 'var(--color-success)',     color: 'var(--color-bg)',       border: 'none' },
        ghost:    { background: 'transparent',              color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' },
    };
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`rounded-lg font-semibold transition-all ${small ? 'text-xs px-2 py-1' : 'text-sm px-3 py-2'}`}
            style={{ ...styles[variant], opacity: disabled ? 0.5 : 1, cursor: disabled ? 'not-allowed' : 'pointer' }}
        >
            {children}
        </button>
    );
};

const Input = ({ value, onChange, placeholder, type = 'text', small = false }) => (
    <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={`rounded-lg outline-none w-full ${small ? 'text-xs px-2 py-1' : 'text-sm px-3 py-2'}`}
        style={{
            background: 'var(--color-surface-alt)',
            border:     '1px solid var(--color-border)',
            color:      'var(--color-text)',
        }}
    />
);

const Textarea = ({ value, onChange, placeholder, rows = 3 }) => (
    <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="rounded-lg outline-none w-full text-sm px-3 py-2 resize-none"
        style={{
            background: 'var(--color-surface-alt)',
            border:     '1px solid var(--color-border)',
            color:      'var(--color-text)',
        }}
    />
);

// ── ClockBar — jauge horizontale ──────────────────────────────────────────────

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
                <Btn small variant={isFull ? 'danger' : 'primary'} onClick={() => onAdvance(Math.min(clock.segments, clock.current + 1))} disabled={isFull}>
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

// ── ThreatCard ────────────────────────────────────────────────────────────────

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

// ── Formulaire Clock ──────────────────────────────────────────────────────────

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

// ── Formulaire Threat ─────────────────────────────────────────────────────────

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

// ── TabClocks ─────────────────────────────────────────────────────────────────

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
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <SectionTitle>Clocks ({clocks.length})</SectionTitle>
                <Btn variant="primary" onClick={() => { setEditClock(null); setShowForm(true); }}>+ Nouvelle clock</Btn>
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
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <SectionTitle>Menaces ({threats.length})</SectionTitle>
                <Btn variant="primary" onClick={() => { setEditThreat(null); setShowForm(true); }}>+ Nouvelle menace</Btn>
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

// ── TabMoves — validation des moves custom ────────────────────────────────────

const TabMoves = ({ fetchWithAuth, apiBase }) => {
    const [pending, setPending] = useState([]);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const data = await fetchWithAuth(`${apiBase}/moves`).then(r => r.ok ? r.json() : []);
            setPending((data ?? []).filter(m => m.type === 'custom' && !m.isApproved));
        } catch { setPending([]); }
        finally { setLoading(false); }
    }, [apiBase, fetchWithAuth]);

    useEffect(() => { load(); }, [load]);

    const approve = async (id, approved) => {
        await fetchWithAuth(`${apiBase}/moves/${id}/approve`, {
            method: 'PATCH',
            body:   JSON.stringify({ approved }),
        });
        load();
    };

    if (loading) return <p className="text-center py-8 text-sm" style={{ color: 'var(--color-text-muted)' }}>Chargement…</p>;

    return (
        <div className="flex flex-col gap-4">
            <SectionTitle>Manœuvres custom en attente ({pending.length})</SectionTitle>

            {pending.length === 0 && (
                <div
                    className="rounded-xl p-6 text-center"
                    style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
                >
                    <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                        ✦ Aucune manœuvre en attente de validation.
                    </p>
                </div>
            )}

            {pending.map(move => (
                <div
                    key={move.id}
                    className="rounded-xl p-4 flex flex-col gap-3"
                    style={{
                        background: 'var(--color-surface)',
                        border:     '1px solid var(--cp-neon-amber)',
                        boxShadow:  'var(--cp-glow-amber)',
                    }}
                >
                    <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>
                                    {move.name}
                                </span>
                                {move.playbook && (
                                    <span
                                        className="text-xs px-2 py-0.5 rounded cp-font-ui uppercase tracking-wide"
                                        style={{ background: 'rgba(255,170,0,0.15)', color: 'var(--cp-neon-amber)', border: '1px solid rgba(255,170,0,0.3)' }}
                                    >
                                        {move.playbook}
                                    </span>
                                )}
                                {move.stat && (
                                    <span className={`cp-stat-badge cp-stat-badge-${move.stat}`}>
                                        {STAT_LABELS[move.stat]}
                                    </span>
                                )}
                            </div>
                            <p className="text-sm mt-1 leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                                {move.description}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Btn variant="success" onClick={() => approve(move.id, true)}>
                            ✓ Approuver
                        </Btn>
                        <Btn variant="danger" onClick={() => approve(move.id, false)}>
                            ✕ Rejeter
                        </Btn>
                    </div>
                </div>
            ))}
        </div>
    );
};

// ── GMView principal ──────────────────────────────────────────────────────────

const GMView = ({ activeSession, onSessionChange, onlineCharacters, darkMode, onToggleDarkMode }) => {
    const { logout }    = useAuth();
    const fetchWithAuth = useFetch();
    const { apiBase }   = useSystem();
    const socket        = useSocket();

    const [activeTab,          setActiveTab]          = useState(() => {
        const hash = window.location.hash.replace('#', '');
        return GM_TABS.some(t => t.id === hash) ? hash : 'session';
    });
    const [showMenu,           setShowMenu]           = useState(false);
    const [showTableMgmt,      setShowTableMgmt]      = useState(false);
    const [showDiceConfig,     setShowDiceConfig]     = useState(false);
    const [historyPanelOpen,   setHistoryPanelOpen]   = useState(false);

    const changeTab = (id) => {
        setActiveTab(id);
        window.location.hash = id;
        setShowMenu(false);
    };

    // Compte des moves en attente (badge sur l'onglet)
    const [pendingMovesCount, setPendingMovesCount] = useState(0);
    useEffect(() => {
        if (!apiBase) return;
        fetchWithAuth(`${apiBase}/moves`)
            .then(r => r.ok ? r.json() : [])
            .then(data => setPendingMovesCount((data ?? []).filter(m => m.type === 'custom' && !m.isApproved).length))
            .catch(() => {});
    }, [apiBase, activeTab]); // refresh quand on revient sur cet onglet

    const handleLogout = async () => {
        setShowMenu(false);
        await logout();
    };

    return (
        <div
            className="min-h-screen flex flex-col"
            style={{ background: 'var(--color-bg)', color: 'var(--color-text)' }}
            data-theme={darkMode ? 'dark' : undefined}
        >
            <ToastNotifications sessionId={activeSession?.id} />

            {/* ── Header ───────────────────────────────────────────────── */}
            <header
                className="flex items-center justify-between px-4 py-3 sticky top-0 z-30"
                style={{
                    background:   'var(--color-surface)',
                    borderBottom: '1px solid var(--color-border)',
                    boxShadow:    '0 2px 12px rgba(0,0,0,0.5)',
                }}
            >

                <div className="text-center ml-2 gap-0 min-w-0">
                    <div className="text-[38px] cp-font-title text-accent tracking-widest cp-neon-glow">
                        CyberPunk
                    </div>
                    <div className="mt-0.5 mb-0.5 cp-divider"></div>
                    {activeSession ? (
                        <p
                            className="text-xs cp-font-ui uppercase tracking-widest text-muted"
                        >
                            Session : <b>{activeSession.name}</b>
                        </p>
                    ) : (
                        <p className="text-xs cp-font-ui uppercase tracking-widest text-muted">
                            The Sprawl — édition Ré²
                        </p>
                    )}

                </div>

                <div className="flex items-center gap-2">
                    <ThemeToggle darkMode={darkMode} onToggle={onToggleDarkMode} />

                    {/* Hamburger */}
                    <div className="relative">
                        <button
                            onClick={() => setShowMenu(v => !v)}
                            className="w-9 h-9 flex flex-col items-center justify-center gap-1 rounded-lg bg-surface-alt hover:cp-neon-glow-el hover:bg-surface border border-base hover:border-accent"
                        >
                            <span className="w-4 h-0.5 rounded" style={{ background: 'var(--color-text)' }} />
                            <span className="w-4 h-0.5 rounded" style={{ background: 'var(--color-text)' }} />
                            <span className="w-4 h-0.5 rounded" style={{ background: 'var(--color-text)' }} />
                        </button>

                        {showMenu && (
                            <>
                                <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => setShowMenu(false)}
                                />
                                <div
                                    className="absolute right-0 top-11 rounded-xl overflow-hidden z-50 shadow-2xl"
                                    style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', minWidth: '180px' }}
                                >
                                    {[
                                        { label: '🗂 Gestion sessions', action: () => { setShowTableMgmt(true); setShowMenu(false); } },
                                        { label: '🎲 Config dés',       action: () => { setShowDiceConfig(true); setShowMenu(false); } },
                                        { label: '📜 Historique jets',  action: () => { setHistoryPanelOpen(true); setShowMenu(false); } },
                                        { label: '🔒 Déconnexion',      action: handleLogout },
                                    ].map(item => (
                                        <button
                                            key={item.label}
                                            onClick={item.action}
                                            className="w-full text-left px-4 py-3 text-sm hover:bg-surface-alt transition-colors"
                                            style={{ color: 'var(--color-text)' }}
                                        >
                                            {item.label}
                                        </button>
                                    ))}
                                </div>
                            </>

                        )}
                    </div>
                </div>
            </header>

            {/* ── Nav onglets ───────────────────────────────────────────── */}
            <nav
                className="flex border-b overflow-x-auto"
                style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}
            >
                {GM_TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => changeTab(tab.id)}
                        className="relative flex-shrink-0 px-4 py-3 text-sm font-semibold cp-font-ui uppercase tracking-wide transition-colors"
                        style={{
                            color:      activeTab === tab.id ? 'var(--color-primary)' : 'var(--color-text-muted)',
                            background: 'none',
                            border:     'none',
                            cursor:     'pointer',
                        }}
                    >
                        {tab.label}
                        {/* Badge moves en attente */}
                        {tab.id === 'moves' && pendingMovesCount > 0 && (
                            <span
                                className="absolute top-2 right-1 text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold"
                                style={{ background: 'var(--cp-neon-amber)', color: 'var(--color-bg)' }}
                            >
                                {pendingMovesCount}
                            </span>
                        )}
                        {activeTab === tab.id && (
                            <span
                                className="absolute bottom-0 left-0 right-0 h-0.5"
                                style={{ background: 'var(--color-primary)', boxShadow: 'var(--cp-glow-cyan)' }}
                            />
                        )}
                    </button>
                ))}
            </nav>

            {/* ── Contenu ───────────────────────────────────────────────── */}
            <main className="flex-1 overflow-y-auto cp-scroll max-w-full w-full mx-auto">

                {activeTab === 'session' && (
                    <TabSession
                        activeSession={activeSession}
                        onlineCharacters={onlineCharacters}
                        onSessionChange={onSessionChange}
                    />
                )}

                {activeTab === 'clocks' && (
                    <TabClocks
                        activeSession={activeSession}
                        fetchWithAuth={fetchWithAuth}
                        apiBase={apiBase}
                    />
                )}

                {activeTab === 'threats' && (
                    <TabThreats
                        activeSession={activeSession}
                        fetchWithAuth={fetchWithAuth}
                        apiBase={apiBase}
                    />
                )}

                {activeTab === 'moves' && (
                    <TabMoves
                        fetchWithAuth={fetchWithAuth}
                        apiBase={apiBase}
                    />
                )}

                {activeTab === 'journal' && (
                    <TabJournal characterId={-1} />
                )}
            </main>

            {/* ── Modales globales ──────────────────────────────────────── */}
            {showTableMgmt && (
                <TableManagementModal
                    isOpen
                    onClose={() => setShowTableMgmt(false)}
                    onSelectTable={(session) => { onSessionChange?.(session); setShowTableMgmt(false); }}
                    activeSessionId={activeSession?.id}
                />
            )}
            {showDiceConfig && <DiceConfigModal onClose={() => setShowDiceConfig(false)} />}
            <HistoryPanel
                isOpen={historyPanelOpen}
                onClose={() => setHistoryPanelOpen(false)}
                sessionId={activeSession?.id}
                renderHistoryEntry={cyberpunkConfig.dice.renderHistoryEntry}
            />
        </div>
    );
};

export default GMView;