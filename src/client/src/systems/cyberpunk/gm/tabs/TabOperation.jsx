// src/client/src/systems/cyberpunk/gm/tabs/TabOperation.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Onglet Opération (spec_cyberpunk.md §6, planche §4) : fusion des anciens onglets
// Horloges et Menaces. Chaque menace porte ses horloges ; les horloges liées à
// aucune menace ont leur colonne. Filtre Table / Campagne / Toutes, recherche.
// Horloges en camembert : clic sur un segment = l'horloge y passe.
// Réservé au MJ : rien n'est montré aux joueurs.
// Données et actions : useOperation (partagé avec les horloges épinglées de GMApp).
// ─────────────────────────────────────────────────────────────────────────────

import React, { useRef, useState } from 'react';
import useConfirm from '@/ui/hooks/useConfirm.jsx';
import CpClock from '../../components/ui/CpClock.jsx';
import CpIcon from '../../components/ui/CpIcon.jsx';
import { IconPreview } from '../IconPicker.jsx';
import { ClockForm, ThreatForm, THREAT_STATUS } from '../OperationForms.jsx';

const SCOPE_FILTERS = [{ id: 'session', label: 'Table' }, { id: 'slug', label: 'Campagne' }, { id: 'all', label: 'Toutes' }];
const STATUS_CLASS = { active: 't-active', dormante: 't-dormant', 'neutralisée': 't-done' };

const matchScope = (item, scope) => scope === 'all' || (scope === 'slug' ? item.sessionId === null : item.sessionId !== null);
const nextStatus = (s) => {
    const order = THREAT_STATUS.map(x => x.id);
    return order[(order.indexOf(s ?? 'active') + 1) % order.length];
};

// Horloge sous une menace ou dans la colonne des horloges libres
const ClockItem = ({ clock, op, onEdit, compact = false }) => (
    <div className={compact ? 'cp-tclock' : 'cp-free'}>
        <CpClock segments={clock.segments} current={clock.current} onSet={(v) => op.setClock(clock, v)} size={compact ? 58 : 44} />
        <div className={compact ? 'cp-tclock-txt' : 'cp-free-txt'}>
            <span className="cp-clock-name">{clock.name} <small>{clock.current}/{clock.segments}</small></span>
            {clock.consequence && <span className="cp-clock-cons">→ {clock.consequence}</span>}
        </div>
        <div className="cp-clock-tools">
            {!compact && <span className="cp-scope">{clock.sessionId === null ? 'campagne' : 'table'}</span>}
            <button type="button" className={`cp-icon-btn ${clock.pinned ? 'is-pinned' : ''}`} onClick={() => op.pinClock(clock)}
                    title={clock.pinned ? 'Désépingler de la barre' : 'Épingler dans la barre'}><CpIcon name="pin" size="sm" /></button>
            <button type="button" className="cp-icon-btn" onClick={() => onEdit(clock)} title="Modifier"><CpIcon name="edit" size="sm" /></button>
        </div>
    </div>
);

const ThreatCard = ({ threat, clocks, op, expanded, onToggle, onEdit, onDelete, onEditClock, dragProps }) => {
    const linked = clocks.filter(c => (threat.clockIds ?? []).includes(c.id));
    const ready = linked.length > 0 && linked.every(c => c.current >= c.segments);
    const statusLabel = THREAT_STATUS.find(s => s.id === threat.status)?.label ?? 'Active';
    return (
        <div className={`cp-panel cp-threat ${STATUS_CLASS[threat.status] ?? 't-active'} ${ready ? 'is-ready' : ''}`} {...dragProps}>
            <div className="cp-threat-head">
                <span className="cp-drag" title="Glisser pour réordonner">⠿</span>
                <span className="cp-threat-ico"><IconPreview value={threat.icon} /></span>
                <button type="button" className="cp-threat-title" onClick={onToggle}>
                    <span className="cp-threat-name">{threat.name}</span>
                    <span className="cp-threat-type">{[threat.type, threat.sessionId === null ? 'campagne' : 'table'].filter(Boolean).join(' · ')}</span>
                </button>
                {ready && <span className="cp-threat-ready" title="Toutes ses horloges sont pleines">Prête</span>}
                <button type="button" className="cp-status" onClick={() => op.setThreatStatus(threat, nextStatus(threat.status))}
                        title="Changer le statut">{statusLabel}</button>
                <button type="button" className={`cp-icon-btn ${threat.pinned ? 'is-pinned' : ''}`} onClick={() => op.pinThreat(threat)}
                        title={threat.pinned ? 'Désépingler (en tête de liste)' : 'Épingler en tête de liste'}><CpIcon name="pin" size="sm" /></button>
                <button type="button" className="cp-icon-btn" onClick={onToggle} title={expanded ? 'Replier' : 'Déplier'}>{expanded ? '▲' : '▼'}</button>
            </div>
            {threat.status !== 'neutralisée' && (
                <div className="cp-threat-body">
                    <div className="cp-threat-main">
                        {threat.impulse && <p className="cp-impulse"><b>Impulsion</b>{threat.impulse}</p>}
                        {expanded && (threat.moves ?? []).length > 0 && (
                            <div className="cp-tmoves">{threat.moves.map((m, i) => <span key={i}>{m}</span>)}</div>
                        )}
                        {expanded && threat.notes && <p className="cp-line-desc">{threat.notes}</p>}
                        {expanded && (
                            <div className="cp-form-foot is-left">
                                <button type="button" className="cp-btn is-sm" onClick={onEdit}><CpIcon name="edit" size="sm" /> Modifier</button>
                                <button type="button" className="cp-btn is-danger is-sm" onClick={onDelete}>Supprimer</button>
                            </div>
                        )}
                    </div>
                    {linked.length > 0 && (
                        <div className="cp-tclocks">
                            {linked.map(c => <ClockItem key={c.id} clock={c} op={op} onEdit={onEditClock} compact />)}
                        </div>
                    )}
                </div>
            )}
            {threat.status === 'neutralisée' && expanded && (
                <div className="cp-form-foot is-left">
                    <button type="button" className="cp-btn is-sm" onClick={onEdit}><CpIcon name="edit" size="sm" /> Modifier</button>
                    <button type="button" className="cp-btn is-danger is-sm" onClick={onDelete}>Supprimer</button>
                </div>
            )}
        </div>
    );
};

const TabOperation = ({ op }) => {
    const [scope, setScope] = useState('all');
    const [search, setSearch] = useState('');
    const [form, setForm] = useState(null);         // { kind: 'clock'|'threat', item? }
    const [expanded, setExpanded] = useState(() => new Set());
    const dragId = useRef(null);
    const { confirm, confirmEl } = useConfirm();

    const q = search.trim().toLowerCase();
    const hit = (txt) => !q || (txt ?? '').toLowerCase().includes(q);

    const threats = op.threats.filter(t => matchScope(t, scope) && (hit(t.name) || hit(t.impulse) || hit(t.notes)));
    // Actives d'abord, neutralisées repliées en fin de liste
    const ordered = [...threats.filter(t => t.status !== 'neutralisée'), ...threats.filter(t => t.status === 'neutralisée')];
    const linkedIds = new Set(op.threats.flatMap(t => t.clockIds ?? []));
    const freeClocks = op.clocks.filter(c => !linkedIds.has(c.id) && matchScope(c, scope) && (hit(c.name) || hit(c.consequence)));

    const toggle = (id) => setExpanded(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

    const askDelete = async (kind, item) => {
        const ok = await confirm({
            title: kind === 'clock' ? 'Supprimer l\'horloge' : 'Supprimer la menace',
            message: `« ${item.name} » sera supprimée. Cette action est irréversible.`,
            danger: true, confirmText: 'Supprimer',
        });
        if (!ok) return;
        await (kind === 'clock' ? op.deleteClock(item) : op.deleteThreat(item));
        setForm(null);
    };

    const save = async (data) => {
        await (form.kind === 'clock' ? op.saveClock(data, form.item) : op.saveThreat(data, form.item));
        setForm(null);
    };

    const dropOn = (targetId) => {
        const from = dragId.current;
        dragId.current = null;
        if (!from || from === targetId) return;
        const list = [...op.threats];
        const [moved] = list.splice(list.findIndex(t => t.id === from), 1);
        list.splice(list.findIndex(t => t.id === targetId), 0, moved);
        op.reorderThreats(list);
    };

    if (op.loading) return <p className="cp-empty text-center py-8">Chargement…</p>;

    return (
        <div className="cp-op">
            {confirmEl}
            <div className="cp-op-tools">
                <div className="cp-seg">
                    {SCOPE_FILTERS.map(s => (
                        <button key={s.id} type="button" className={scope === s.id ? 'is-on' : ''} onClick={() => setScope(s.id)}>{s.label}</button>
                    ))}
                </div>
                <input className="cp-input flex-1" value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher une menace ou une horloge…" />
                <button type="button" className="cp-btn" onClick={() => setForm({ kind: 'threat' })}><CpIcon name="threat" /> Nouvelle menace</button>
                <button type="button" className="cp-btn" onClick={() => setForm({ kind: 'clock' })}><CpIcon name="clock" /> Nouvelle horloge</button>
            </div>

            {form?.kind === 'threat' && (
                <ThreatForm key={form.item?.id ?? 'new'} initial={form.item} clocks={op.clocks} onSave={save}
                            onCancel={() => setForm(null)} onCreateClock={op.createClock} />
            )}
            {form?.kind === 'clock' && (
                <div className="flex flex-col gap-2">
                    <ClockForm key={form.item?.id ?? 'new'} initial={form.item} threats={op.threats} onSave={save} onCancel={() => setForm(null)} />
                    {form.item && (
                        <button type="button" className="cp-btn is-danger is-sm self-start" onClick={() => askDelete('clock', form.item)}>Supprimer cette horloge</button>
                    )}
                </div>
            )}

            <div className="cp-op-grid">
                <div className="cp-col">
                    {ordered.length === 0 && <p className="cp-empty">{q ? 'Aucune menace ne correspond.' : 'Aucune menace. Crée-en une pour suivre ce qui pèse sur l\'équipe.'}</p>}
                    {ordered.map(t => (
                        <ThreatCard
                            key={t.id} threat={t} clocks={op.clocks} op={op}
                            expanded={expanded.has(t.id)} onToggle={() => toggle(t.id)}
                            onEdit={() => setForm({ kind: 'threat', item: t })}
                            onDelete={() => askDelete('threat', t)}
                            onEditClock={(c) => setForm({ kind: 'clock', item: c })}
                            dragProps={{
                                draggable: true,
                                onDragStart: (e) => { dragId.current = t.id; e.dataTransfer.effectAllowed = 'move'; },
                                onDragOver: (e) => e.preventDefault(),
                                onDrop: (e) => { e.preventDefault(); dropOn(t.id); },
                            }}
                        />
                    ))}
                </div>
                <div className="cp-col">
                    <div className="cp-panel">
                        <div className="cp-panel-head"><h3 className="cp-panel-title">Horloges libres</h3><span className="cp-panel-rule" /></div>
                        {freeClocks.length === 0 && <p className="cp-empty">Aucune horloge hors menace.</p>}
                        {freeClocks.map(c => <ClockItem key={c.id} clock={c} op={op} onEdit={(cl) => setForm({ kind: 'clock', item: cl })} />)}
                    </div>
                    <p className="cp-op-hint">Clic sur un segment : l'horloge y passe ; sur le dernier rempli : elle recule. Les horloges épinglées s'affichent à droite de la barre d'onglets, sur tous les onglets. Rien n'est montré aux joueurs.</p>
                </div>
            </div>
        </div>
    );
};

export default TabOperation;
