// src/client/src/systems/maledictum/gm/tabs/TabEncounter.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Onglet Rencontre de l'interface MJ (spec_maledictum.md §11.4) : PNJ ajoutés
// depuis le bestiaire (CatalogModal) ; par PNJ, profil (caractéristiques,
// Armure unique, Blessures, Blessures critiques selon le rôle), compétences et
// attaques lancées en un clic (d100), traits. Gardée dans ce navigateur, par
// table (usePersistedState, portée tableScope) : aucune base.
// Props : activeSession
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import CatalogModal from '../../../../components/modals/CatalogModal.jsx';
import ConfirmModal from '../../../../components/modals/ConfirmModal.jsx';
import { usePersistedState } from '../../../../hooks/usePersistedState.js';
import { tableScope } from '../../../../tools/browserStorage.js';
import { BESTIARY } from '../../config/bestiary.js';
import { PATRON_FACTIONS } from '../../config/patron.js';
import { CHAR_KEYS, CHAR_SHORT } from '../../config/rules/character.js';
import { useMlRoll } from '../../hooks/useMlRoll.js';
import { Block, Stepper, MinusIcon, PlusIcon, TrashIcon } from '../../components/ui/MlUi.jsx';
import { specName, RANGE_LABELS } from '../../components/layout/MlSections.jsx';

const ENCOUNTER_OPTIONS = { defaults: { npcs: [] }, validate: (v) => Array.isArray(v?.npcs) };
const BY_KEY = Object.fromEntries(BESTIARY.map(b => [b.key, b]));
const ROLE_LABELS = { troop: 'Troupe', elite: 'Élite', leader: 'Meneur' };
const CRIT_MAX = { troop: 0, elite: 1 };   // mort subite (livre p.317) ; Meneur : BE

/** Profil complet : une variante (basedOn) hérite du profil de base */
const profileOf = (key) => {
    const p = BY_KEY[key];
    if (!p?.basedOn) return p;
    const base = BY_KEY[p.basedOn] ?? {};
    const out = { ...base };
    for (const [k, v] of Object.entries(p)) if (v !== null && v !== undefined) out[k] = v;
    out.skills = { ...(base.skills ?? {}), ...(p.skills ?? {}) };
    out.traits = [...(base.traits ?? []), ...(p.traits ?? [])];
    return out;
};
const critMax = (p) => CRIT_MAX[p.role] ?? Math.floor((p.chars?.tgh ?? 30) / 10);

const FILTERS = [{ key: 'role', getValue: m => m.role, options: Object.entries(ROLE_LABELS).map(([value, label]) => ({ value, label })) }];
const FACTION_LABELS = Object.fromEntries(PATRON_FACTIONS.map(f => [f.key, f.label]));
const GROUP = { getValue: m => (typeof m.faction === 'string' ? m.faction : 'Autres'), getLabel: v => FACTION_LABELS[v] ?? v };
const SEARCH = ['label', 'labelEn', 'type'];
const LABELS = { search: 'Rechercher un PNJ…', countOne: 'profil', countMany: 'profils', added: 'Ajouté à la rencontre', all: 'Tous' };

const NpcRow = ({ m }) => (
    <div><b>{m.label}</b> <span className="im-vo">{m.labelEn}</span> <small className="im-note">{ROLE_LABELS[m.role] ?? ''} · {m.type ?? ''}{m.familiar ? ' · familier' : ''}</small></div>
);

const NpcCard = ({ n, onChange, onRemove, sessionId }) => {
    const p = profileOf(n.key);
    const { launch, rolling } = useMlRoll();
    const [open, setOpen] = useState(false);
    if (!p) return null;
    const roll = (label, value, attack = null) => launch({
        characterId: -1, characterName: n.name, sessionId, label,
        type: attack ? 'attack' : 'test',
        systemData: attack ? { target: value, damage: attack.damage, ranged: !!attack.range, note: attack.traits ?? null, theme: null } : { target: value, theme: null },
    });
    const max = p.wounds ?? 0;
    const dead = (n.crits ?? 0) > critMax(p);
    return (
        <Block title={n.name} className={`im-npc${dead ? ' is-dead' : ''}`}>
            <div className="im-npc-head">
                <span className="im-note">{ROLE_LABELS[p.role]} · {p.type} · Armure {p.armour ?? '—'} · Init. {p.initiative ?? '—'} · Détermination {p.resolve ?? '—'}{p.warpThreshold ? ` · Seuil Warp ${p.warpThreshold}` : ''}</span>
                <button type="button" className="im-mini-btn" onClick={onRemove} title="Retirer"><TrashIcon /></button>
            </div>
            <div className="im-npc-chars">
                {CHAR_KEYS.map(k => (
                    <button key={k} type="button" className="im-npc-char" disabled={rolling || !p.chars} onClick={() => roll(`${n.name} · ${CHAR_SHORT[k]}`, p.chars?.[k] ?? 0)}>
                        <b>{CHAR_SHORT[k]}</b>{p.chars?.[k] ?? '—'}
                    </button>
                ))}
            </div>
            <div className="im-res-row">
                <b>Blessures</b><span>{n.wounds ?? 0} <small>/ {max}</small></span>
            </div>
            <Stepper value={n.wounds ?? 0} onChange={v => onChange({ wounds: Math.min(max, v) })} min={0} max={max} editable unit="Blessures" />
            <div className="im-res-row">
                <b>Blessures critiques</b><span className={dead ? 'is-danger' : ''}>{n.crits ?? 0} <small>/ {critMax(p)}{dead ? ' · hors de combat' : ''}</small></span>
            </div>
            <Stepper value={n.crits ?? 0} onChange={v => onChange({ crits: v })} min={0} max={20} label={`${n.crits ?? 0} critique(s)`} />
            <div className="im-sub">Attaques</div>
            {(p.attacks ?? []).map((a, i) => (
                <button key={i} type="button" className="im-power" disabled={rolling}
                        onClick={() => roll(`${n.name} · ${a.label}`, a.value ?? 0, { damage: parseInt(String(a.damage), 10) || 0, range: a.range, traits: a.traits })}>
                    <b>{a.label} · {a.value}</b><span>{a.damage}{a.range ? ` · ${RANGE_LABELS[a.range] ?? a.range}` : ''}{a.traits ? ` · ${a.traits}` : ''}</span>
                </button>
            ))}
            <div className="im-sub">Compétences</div>
            <div className="im-row">
                {Object.entries(p.skills ?? {}).map(([k, v]) => (
                    <button key={k} type="button" className="vtt-pill" disabled={rolling} onClick={() => roll(`${n.name} · ${specName(k)}`, v)}>{specName(k)} {v}</button>
                ))}
            </div>
            <button type="button" className="vtt-btn vtt-btn-sm" onClick={() => setOpen(!open)}>{open ? 'Masquer les traits' : `Traits (${(p.traits ?? []).length})`}</button>
            {open && (p.traits ?? []).map((t, i) => <p key={i} className="im-note"><b>{t.label}.</b> {t.summary}</p>)}
            {open && p.possessions && <p className="im-note"><b>Possessions.</b> {p.possessions}</p>}
        </Block>
    );
};

const TabEncounter = ({ activeSession }) => {
    const scope = activeSession ? tableScope('maledictum', activeSession.id) : 'maledictum';
    const [state, setState] = usePersistedState(scope, 'encounter', ENCOUNTER_OPTIONS);
    const [catalogOpen, setCatalogOpen] = useState(false);
    const [clear, setClear] = useState(false);
    const npcs = state.npcs ?? [];
    const update = (id, p) => setState({ npcs: npcs.map(n => (n.id === id ? { ...n, ...p } : n)) });
    const add = (m) => {
        const same = npcs.filter(n => n.key === m.key).length;
        setState({ npcs: [...npcs, { id: `${m.key}-${Date.now()}`, key: m.key, name: same ? `${m.label} ${same + 1}` : m.label, wounds: 0, crits: 0 }] });
    };
    return (
        <div className="im-tab-page">
            <div className="im-patron-bar">
                <button type="button" className="vtt-btn vtt-btn-sm vtt-btn-primary" onClick={() => setCatalogOpen(true)}>Ajouter un PNJ</button>
                {npcs.length > 0 && <button type="button" className="vtt-btn vtt-btn-sm" onClick={() => setClear(true)}>Vider la rencontre</button>}
            </div>
            {npcs.length === 0 && <p className="im-empty">Aucun PNJ : ajoutez-en depuis le bestiaire (livre de base, Inquisition).</p>}
            <div className="im-npc-grid">
                {npcs.map(n => <NpcCard key={n.id} n={n} sessionId={activeSession?.id ?? null} onChange={p => update(n.id, p)} onRemove={() => setState({ npcs: npcs.filter(x => x.id !== n.id) })} />)}
            </div>
            {catalogOpen && (
                <CatalogModal title="Bestiaire" subtitle="Livre de base · Inquisition" labels={LABELS} layout={['filters', 'search']}
                              items={BESTIARY} getKey={m => m.key} filters={FILTERS} groupBy={GROUP} searchFields={SEARCH}
                              renderItem={m => <NpcRow m={m} />} onAdd={add} onClose={() => setCatalogOpen(false)} />
            )}
            {clear && <ConfirmModal title="Vider la rencontre" message="Tous les PNJ quittent la rencontre." confirmText="Vider" danger
                                    onConfirm={() => { setState({ npcs: [] }); setClear(false); }} onCancel={() => setClear(false)} />}
        </div>
    );
};

export default TabEncounter;
