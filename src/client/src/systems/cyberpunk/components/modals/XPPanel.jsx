import {STAT_LABELS} from "../../config.jsx";
import {useFetch} from "../../../../hooks/useFetch.js";
import React, {useEffect, useState} from "react";
import useSystem from "../../../../hooks/useSystem.js";

const MoveSpendRow = ({ move, xpCost, disabled, accentColor, onSpend }) => (
    <button
        onClick={onSpend}
        disabled={disabled}
        className="text-left rounded-lg px-3 py-2 flex items-start gap-2 transition-all w-full"
        style={{
            background: 'var(--color-surface-alt)',
            border:     '1px solid var(--color-border)',
            opacity:    disabled ? 0.45 : 1,
            cursor:     disabled ? 'not-allowed' : 'pointer',
        }}
    >
        <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{move.name}</span>
                {move.stat && (
                    <span className={`cp-stat-badge cp-stat-badge-${move.stat}`}>{STAT_LABELS[move.stat]}</span>
                )}
            </div>
            <p className="text-xs mt-0.5 line-clamp-2" style={{ color: 'var(--color-text-muted)' }}>
                {move.description}
            </p>
        </div>
        <span className="text-xs font-mono font-bold flex-shrink-0 mt-0.5" style={{ color: accentColor }}>
            −{xpCost} XP
        </span>
    </button>
);

export const XPPanel = ({ character, onUpdate, onClose }) => {
    const { apiBase }   = useSystem();
    const fetchWithAuth = useFetch();

    const [allMoves,   setAllMoves]   = useState([]);
    const [loading,    setLoading]    = useState(false);
    const [msg,        setMsg]        = useState(null);
    const [search,     setSearch]     = useState('');
    const [confirm,    setConfirm]    = useState(null); // { label, action } — confirmation avant dépense
    const [openGroups, setOpenGroups] = useState({});   // accordéon par playbook

    const xp               = character?.xp               ?? 0;
    const baseAdvancements = character?.baseAdvancements  ?? 0;
    const hasAdvancement   = baseAdvancements >= 5;
    const XP_PER_ADV       = 10;
    const canSpend         = xp >= XP_PER_ADV;

    const charMoveIds = new Set((character?.moves ?? []).map(m => m.id));

    useEffect(() => {
        fetchWithAuth(`${apiBase}/moves`)
            .then(r => r.ok ? r.json() : [])
            .then(data => setAllMoves(Array.isArray(data) ? data : []))
            .catch(() => {});
    }, [apiBase]);

    // ── Moves disponibles ─────────────────────────────────────────────────────
    const playbookMovesAvailable = allMoves.filter(
        m => m.type === 'official'
            && m.playbook === character?.playbook
            && !charMoveIds.has(m.id)
    );

    // Moves majeurs groupés par playbook
    const majorMovesRaw = allMoves.filter(
        m => m.type === 'official'
            && m.playbook !== null
            && m.playbook !== character?.playbook
            && !charMoveIds.has(m.id)
            && (search.trim() === '' || m.name.toLowerCase().includes(search.toLowerCase()) || m.description.toLowerCase().includes(search.toLowerCase()))
    );
    const majorByPlaybook = majorMovesRaw.reduce((acc, m) => {
        if (!acc[m.playbook]) acc[m.playbook] = [];
        acc[m.playbook].push(m);
        return acc;
    }, {});

    // ── Actions ───────────────────────────────────────────────────────────────

    const executeAction = async (action) => {
        setConfirm(null);
        setLoading(true);
        setMsg(null);
        try {
            const res = await fetchWithAuth(`${apiBase}/characters/${character.id}/xp`, {
                method: 'PATCH',
                body:   JSON.stringify(action.payload),
            });
            if (res.ok) {
                const updated = await res.json();
                onUpdate(updated);
                setMsg({ type: 'success', text: action.successMsg });
            } else {
                const err = await res.json();
                setMsg({ type: 'error', text: err.error ?? 'Erreur serveur' });
            }
        } catch { setMsg({ type: 'error', text: 'Erreur réseau' }); }
        finally { setLoading(false); }
    };

    const askConfirm = (label, payload, successMsg) => {
        setConfirm({ label, action: { payload, successMsg } });
    };

    const spendOnStat = (stat, isMajor = false) => {
        const current = character?.[stat] ?? 0;
        const maxStat = isMajor ? 3 : 2;
        if (current >= maxStat) return;
        if (!canSpend) return;
        askConfirm(
            `Augmenter ${STAT_LABELS[stat]} de +${current} à +${current + 1} pour ${XP_PER_ADV} XP`,
            {
                xp:               xp - XP_PER_ADV,
                baseAdvancements: isMajor ? baseAdvancements : baseAdvancements + 1,
                statKey:          stat,
                statDelta:        1,
            },
            `✦ ${STAT_LABELS[stat]} passe à +${current + 1} !`
        );
    };

    const spendOnMove = (move, isMajor = false) => {
        if (!canSpend) return;
        askConfirm(
            `Débloquer "${move.name}" pour ${XP_PER_ADV} XP`,
            {
                xp:               xp - XP_PER_ADV,
                baseAdvancements: isMajor ? baseAdvancements : baseAdvancements + 1,
                moveId:           move.id,
                action:           'add',
            },
            `✦ "${move.name}" débloqué !`
        );
    };

    const toggleGroup = (pb) => setOpenGroups(prev => ({ ...prev, [pb]: !prev[pb] }));

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <div
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            style={{ background: 'rgba(0,0,0,0.82)' }}
            onClick={() => { if (!confirm) onClose(); }}
        >
            <div
                className="rounded-2xl w-full max-w-lg flex flex-col overflow-hidden shadow-2xl"
                style={{
                    background: 'var(--color-surface)',
                    border:     '1px solid var(--color-primary)',
                    boxShadow:  'var(--cp-glow-active)',
                    maxHeight:  '88vh',
                }}
                onClick={e => e.stopPropagation()}
            >
                {/* ── Header ─────────────────────────────────────────── */}
                <div
                    className="flex items-center justify-between px-5 py-4 flex-shrink-0"
                    style={{ borderBottom: '1px solid var(--color-border)' }}
                >
                    <div>
                        <h3 className="font-bold text-lg cp-font-ui" style={{ color: 'var(--color-primary)' }}>
                            Dépense d'XP
                        </h3>
                        <div className="flex items-center gap-3 mt-0.5 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                            <span>
                                XP : <span className="font-mono font-bold" style={{ color: 'var(--color-accent)' }}>{xp}</span>
                            </span>
                            <span>·</span>
                            <span>
                                Avancements : <span className="font-mono font-bold" style={{ color: hasAdvancement ? 'var(--color-success)' : 'var(--color-text)' }}>{baseAdvancements}</span>
                                {hasAdvancement && <span style={{ color: 'var(--color-success)' }}> ★</span>}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        style={{ color: 'var(--color-text-muted)', background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}
                    >
                        ✕
                    </button>
                </div>

                {/* ── Confirmation overlay ────────────────────────────── */}
                {confirm && (
                    <div
                        className="absolute inset-0 flex items-center justify-center z-10 rounded-2xl"
                        style={{ background: 'rgba(5,5,8,0.92)' }}
                    >
                        <div
                            className="rounded-xl p-6 flex flex-col gap-4 mx-4 w-full max-w-sm"
                            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-primary)', boxShadow: 'var(--cp-glow-cyan)' }}
                        >
                            <p className="text-sm text-center font-semibold" style={{ color: 'var(--color-text)' }}>
                                {confirm.label}
                            </p>
                            <p className="text-xs text-center" style={{ color: 'var(--color-text-muted)' }}>
                                Cette action est irréversible.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setConfirm(null)}
                                    className="flex-1 py-2.5 rounded-lg text-sm font-semibold"
                                    style={{ background: 'var(--color-surface-alt)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={() => executeAction(confirm.action)}
                                    disabled={loading}
                                    className="flex-1 py-2.5 rounded-lg text-sm font-bold cp-font-ui uppercase"
                                    style={{
                                        background: 'var(--color-primary)',
                                        color:      'var(--color-bg)',
                                        border:     'none',
                                        boxShadow:  'var(--cp-glow-cyan)',
                                        opacity:    loading ? 0.5 : 1,
                                        cursor:     loading ? 'not-allowed' : 'pointer',
                                    }}
                                >
                                    {loading ? '…' : 'Confirmer'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Corps scrollable ────────────────────────────────── */}
                <div className="overflow-y-auto cp-scroll flex-1 px-5 py-4 flex flex-col gap-5">

                    {/* Feedback */}
                    {msg && (
                        <div
                            className="text-sm text-center px-3 py-2 rounded-lg"
                            style={{
                                background: msg.type === 'success' ? 'rgba(32,192,96,0.1)'  : 'rgba(224,48,48,0.1)',
                                color:      msg.type === 'success' ? 'var(--color-success)' : 'var(--color-danger)',
                                border:     `1px solid ${msg.type === 'success' ? 'var(--color-success)' : 'var(--color-danger)'}`,
                            }}
                        >
                            {msg.text}
                        </div>
                    )}

                    {!canSpend && (
                        <p className="text-sm text-center py-2" style={{ color: 'var(--color-text-muted)' }}>
                            Il faut au moins {XP_PER_ADV} XP pour dépenser un avancement.
                        </p>
                    )}

                    {/* ── AVANCEMENTS DE BASE ──────────────────────────── */}
                    <section>
                        <h4 className="text-xs font-bold cp-font-ui uppercase tracking-widest mb-3" style={{ color: 'var(--color-text-muted)' }}>
                            Avancements de base — {XP_PER_ADV} XP
                        </h4>

                        {/* Stats +1 (max +2) */}
                        <p className="text-xs mb-2" style={{ color: 'var(--color-text-muted)' }}>
                            +1 à une stat (max +2 sans avancement majeur)
                        </p>
                        <div className="grid grid-cols-3 gap-2 mb-4">
                            {STATS.map(stat => {
                                const current = character?.[stat] ?? 0;
                                const maxed   = current >= 2; // cap de base
                                return (
                                    <button
                                        key={stat}
                                        onClick={() => spendOnStat(stat, false)}
                                        disabled={!canSpend || maxed || loading}
                                        className="rounded-lg py-2 px-2 flex items-center justify-between text-sm transition-all"
                                        style={{
                                            background: maxed ? 'transparent' : 'var(--color-surface-alt)',
                                            border:     `1px solid ${maxed ? 'var(--color-border)' : 'var(--color-border)'}`,
                                            opacity:    maxed || !canSpend ? 0.45 : 1,
                                            cursor:     (maxed || !canSpend || loading) ? 'not-allowed' : 'pointer',
                                        }}
                                    >
                                        <span className={`cp-stat-badge cp-stat-badge-${stat} text-[9px]`}>{STAT_LABELS[stat]}</span>
                                        <span className="font-mono text-xs ml-1" style={{ color: maxed ? 'var(--color-text-muted)' : 'var(--color-primary)' }}>
                                            {current >= 0 ? `+${current}` : current}{maxed ? ' ✓' : ` →+${current + 1}`}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Moves du playbook */}
                        {playbookMovesAvailable.length > 0 && (
                            <>
                                <p className="text-xs mb-2" style={{ color: 'var(--color-text-muted)' }}>
                                    Nouveau move — {character?.playbook}
                                </p>
                                <div className="flex flex-col gap-1.5">
                                    {playbookMovesAvailable.map(move => (
                                        <MoveSpendRow
                                            key={move.id}
                                            move={move}
                                            xpCost={XP_PER_ADV}
                                            disabled={!canSpend || loading}
                                            accentColor="var(--color-primary)"
                                            onSpend={() => spendOnMove(move, false)}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                        {playbookMovesAvailable.length === 0 && (
                            <p className="text-xs italic mt-1" style={{ color: 'var(--color-text-muted)' }}>
                                Tous les moves du playbook sont débloqués.
                            </p>
                        )}
                    </section>

                    {/* ── AVANCEMENTS MAJEURS ──────────────────────────── */}
                    {hasAdvancement && (
                        <section>
                            <div className="cp-divider mb-4" />
                            <h4 className="text-xs font-bold cp-font-ui uppercase tracking-widest mb-3" style={{ color: 'var(--cp-neon-amber)' }}>
                                ★ Avancements majeurs — {XP_PER_ADV} XP
                            </h4>

                            {/* Stat +3 (uniquement disponible en majeur) */}
                            <p className="text-xs mb-2" style={{ color: 'var(--color-text-muted)' }}>
                                Passer une stat à +3 (maximum absolu — une seule stat peut atteindre +3)
                            </p>
                            <div className="grid grid-cols-3 gap-2 mb-4">
                                {STATS.map(stat => {
                                    const current   = character?.[stat] ?? 0;
                                    const alreadyAt3 = current >= 3;
                                    // Désactivé si une autre stat est déjà à +3
                                    const anotherAt3 = STATS.some(s => s !== stat && (character?.[s] ?? 0) >= 3);
                                    const canUpgrade = current === 2 && !anotherAt3;
                                    return (
                                        <button
                                            key={stat}
                                            onClick={() => canUpgrade && spendOnStat(stat, true)}
                                            disabled={!canSpend || !canUpgrade || loading}
                                            className="rounded-lg py-2 px-2 flex items-center justify-between text-sm transition-all"
                                            style={{
                                                background: canUpgrade ? 'rgba(255,170,0,0.08)' : 'transparent',
                                                border:     `1px solid ${canUpgrade ? 'rgba(255,170,0,0.35)' : 'var(--color-border)'}`,
                                                opacity:    (!canSpend || !canUpgrade) ? 0.4 : 1,
                                                cursor:     (!canSpend || !canUpgrade || loading) ? 'not-allowed' : 'pointer',
                                            }}
                                        >
                                            <span className={`cp-stat-badge cp-stat-badge-${stat} text-[9px]`}>{STAT_LABELS[stat]}</span>
                                            <span className="font-mono text-xs ml-1" style={{ color: canUpgrade ? 'var(--cp-neon-amber)' : 'var(--color-text-muted)' }}>
                                                {alreadyAt3 ? '+3 ✓' : anotherAt3 ? '—' : current === 2 ? '+2→+3' : `+${current}`}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                            <p className="text-xs mb-3 italic" style={{ color: 'var(--color-text-muted)' }}>
                                Remarque : une stat ne peut passer à +3 que si elle est déjà à +2, et une seule stat peut atteindre +3.
                            </p>

                            {/* Recherche */}
                            <div className="mb-3">
                                <input
                                    type="text"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    placeholder="Rechercher un move…"
                                    className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                                    style={{
                                        background: 'var(--color-surface-alt)',
                                        border:     '1px solid var(--color-border)',
                                        color:      'var(--color-text)',
                                    }}
                                />
                            </div>

                            {/* Accordéon par playbook */}
                            {Object.keys(majorByPlaybook).length === 0 && (
                                <p className="text-xs italic" style={{ color: 'var(--color-text-muted)' }}>
                                    {search ? 'Aucun résultat.' : 'Tous les moves sont débloqués.'}
                                </p>
                            )}
                            {Object.entries(majorByPlaybook).map(([pb, moves]) => (
                                <div key={pb} className="mb-2">
                                    <button
                                        onClick={() => toggleGroup(pb)}
                                        className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-semibold transition-all"
                                        style={{
                                            background: 'rgba(255,170,0,0.07)',
                                            border:     '1px solid rgba(255,170,0,0.2)',
                                            color:      'var(--cp-neon-amber)',
                                            cursor:     'pointer',
                                        }}
                                    >
                                        <span className="cp-font-ui uppercase tracking-wide text-xs">{pb}</span>
                                        <span style={{ fontSize: '0.7rem' }}>
                                            {openGroups[pb] ? '▲' : '▼'} {moves.length} move{moves.length > 1 ? 's' : ''}
                                        </span>
                                    </button>
                                    {openGroups[pb] && (
                                        <div className="flex flex-col gap-1 mt-1 ml-2">
                                            {moves.map(move => (
                                                <MoveSpendRow
                                                    key={move.id}
                                                    move={move}
                                                    xpCost={XP_PER_ADV}
                                                    disabled={!canSpend || loading}
                                                    accentColor="var(--cp-neon-amber)"
                                                    onSpend={() => spendOnMove(move, true)}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </section>
                    )}
                </div>
            </div>
        </div>
    );
};
