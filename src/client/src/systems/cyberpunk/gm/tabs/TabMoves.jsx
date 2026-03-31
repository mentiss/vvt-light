import React, {useCallback, useEffect, useState} from "react";
import {Btn, SectionTitle} from "../BasicComponents.jsx";

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
        <div className="flex flex-col gap-4 m-1">
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


export default TabMoves;