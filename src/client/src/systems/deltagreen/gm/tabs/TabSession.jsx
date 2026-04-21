// src/client/src/systems/deltagreen/gm/tabs/TabSession.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Vue GM des agents — layout deux colonnes :
//   Gauche  : liste agents (mode étendu / compact toggle)
//   Droite  : fiche complète de l'agent sélectionné (édition immédiate GM)
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSocket }   from '../../../../context/SocketContext.jsx';
import { useSystem }   from '../../../../hooks/useSystem.js';
import { useFetch }    from '../../../../hooks/useFetch.js';
import { GM_TAGS }     from '../../config.jsx';
import '../../theme.css';

// ── Sections fiche ────────────────────────────────────────────────────────────
import StatsSection              from '../../components/layout/StatsSection.jsx';
import DerivedSection            from '../../components/layout/DerivedSection.jsx';
import InjuriesSection, {
    NotesSection,
    SpecialTrainingSection,
}                                from '../../components/layout/Page2Sections.jsx';
import SkillsSection             from '../../components/layout/SkillsSection.jsx';
import EquipmentSection          from '../../components/layout/EquipmentSection.jsx';
import WeaponsSection            from '../../components/layout/WeaponsSection.jsx';
import BondsSection              from '../../components/layout/BondSection.jsx';
import MotivationsSection        from '../../components/layout/MotivationsSection.jsx';
import SanLogSection             from '../../components/layout/SanLogSection.jsx';
import PhysicalDescriptionSection from '../../components/layout/PhysicalDescriotionSection.jsx';
import DiceModal                 from '../../components/modals/DiceModal.jsx';
import GMSendModal               from '../../../../components/gm/modals/GMSendModal.jsx';

// ── Constantes ────────────────────────────────────────────────────────────────

const PALIER_LABELS = ['Stable', 'Sous pression', 'En crise', 'Fracturé', 'Perdu'];
const PALIER_COLORS = [
    'text-success border-success/40',
    'text-accent  border-accent/40',
    'text-accent  border-accent/60',
    'text-danger  border-danger/40',
    'text-danger  border-danger/70',
];
const PALIER_TEXT = [
    'text-success', 'text-accent', 'text-accent', 'text-danger', 'text-danger',
];

// ══════════════════════════════════════════════════════════════════════════════
// AgentCard — mode étendu (inchangé)
// ══════════════════════════════════════════════════════════════════════════════

const AgentCard = ({ character, isOnline, isActiveTurn, onPalierChange, onTagChange, onSelect, isSelected }) => {
    const [showTags, setShowTags] = useState(false);

    const san    = character.sanCurrent ?? 0;
    const sanMax = character.sanMax ?? 1;
    const hp     = character.hpCurrent ?? 0;
    const hpMax  = character.hpMax ?? 1;
    const palier = character.degradationPalier ?? 0;
    const tags   = character.tags ?? [];

    const sanPct = Math.round((san / sanMax) * 100);
    const hpPct  = Math.round((hp  / hpMax)  * 100);

    const toggleTag = (tagKey) => {
        const exists = tags.find(t => t.key === tagKey);
        const tagDef = GM_TAGS.find(t => t.key === tagKey);
        if (!tagDef) return;
        const next = exists
            ? tags.filter(t => t.key !== tagKey)
            : [...tags, { key: tagKey, label: tagDef.label, color: tagDef.color, bgColor: tagDef.bgColor }];
        onTagChange(character.id, next);
    };

    return (
        <div className={[
            'border bg-surface transition-all',
            isSelected    ? 'border-accent'      : 'border-default',
            isActiveTurn  ? 'ring-2 ring-accent/50' : '',
        ].join(' ')}>
            <div
                className="flex items-center gap-3 p-3 cursor-pointer hover:bg-surface-alt"
                onClick={() => onSelect(character.id)}
            >
                <div className="w-10 h-10 border border-default shrink-0 overflow-hidden bg-surface-alt">
                    {character.avatar
                        ? <img src={character.avatar} alt="" className="w-full h-full object-cover" />
                        : <span className="w-full h-full flex items-center justify-center text-muted text-lg">☰</span>
                    }
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-mono text-sm font-bold truncate">
                        {character.nom}
                        {character.alias && <span className="text-muted font-normal"> / {character.alias}</span>}
                    </p>
                    <p className="text-xs text-muted font-mono truncate">{character.profession}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <div className={['w-2 h-2 rounded-full', isOnline ? 'bg-success' : 'bg-muted/40'].join(' ')}
                         title={isOnline ? 'En ligne' : 'Hors ligne'} />
                    {isActiveTurn && (
                        <span className="text-xs font-mono text-accent border border-accent/50 px-1.5 py-0.5">TOUR</span>
                    )}
                </div>
            </div>

            <div className="px-3 pb-2 space-y-1.5">
                {[
                    { label: 'PV',  val: hp,  max: hpMax,  pct: hpPct,  color: 'bg-success' },
                    { label: 'SAN', val: san, max: sanMax, pct: sanPct, color: 'bg-danger'  },
                ].map(({ label, val, max, pct, color }) => (
                    <div key={label} className="flex items-center gap-2">
                        <span className="text-xs text-muted font-mono w-8">{label}</span>
                        <div className="flex-1 h-1.5 bg-surface-alt border border-default/30 overflow-hidden">
                            <div className={`h-full ${color} transition-all`}
                                 style={{ width: `${Math.max(0, Math.min(100, pct))}%` }} />
                        </div>
                        <span className="text-xs font-mono">{val}/{max}</span>
                    </div>
                ))}
                <div className="flex items-center gap-2">
                    <span className="text-xs text-muted font-mono w-8">DEX</span>
                    <span className="text-xs font-mono">{(character.dex ?? 10) * 5}%</span>
                </div>
            </div>

            <div className="px-3 pb-2">
                <div className="flex gap-1">
                    {PALIER_LABELS.map((label, i) => (
                        <button
                            key={i}
                            onClick={() => onPalierChange(character.id, i)}
                            title={label}
                            className={[
                                'flex-1 py-1 text-xs font-mono border transition-colors',
                                palier === i
                                    ? `${PALIER_COLORS[i]} bg-surface-alt`
                                    : 'border-default/30 text-muted hover:border-default',
                            ].join(' ')}
                        >{i}</button>
                    ))}
                </div>
                <p className={`text-xs font-mono mt-1 ${PALIER_COLORS[palier]}`}>{PALIER_LABELS[palier]}</p>
            </div>

            <div className="px-3 pb-3">
                <div className="flex flex-wrap gap-1 mb-1">
                    {tags.map(tag => (
                        <span
                            key={tag.key}
                            className="dg-tag cursor-pointer hover:opacity-70"
                            style={{ color: tag.color, backgroundColor: tag.bgColor, border: `1px solid ${tag.color}40` }}
                            onClick={() => toggleTag(tag.key)}
                            title="Retirer"
                        >{tag.label} ✕</span>
                    ))}
                </div>
                <button
                    onClick={() => setShowTags(v => !v)}
                    className="text-xs font-mono text-muted hover:text-default border border-default/30 hover:border-default px-2 py-0.5 transition-colors"
                >{showTags ? '− Tags' : '+ Tags'}</button>
                {showTags && (
                    <div className="mt-2 flex flex-wrap gap-1">
                        {GM_TAGS.map(tagDef => {
                            const active = !!tags.find(t => t.key === tagDef.key);
                            return (
                                <button
                                    key={tagDef.key}
                                    onClick={() => toggleTag(tagDef.key)}
                                    className={['dg-tag transition-opacity', active ? 'opacity-100' : 'opacity-40 hover:opacity-70'].join(' ')}
                                    style={{
                                        color:           tagDef.color,
                                        backgroundColor: active ? tagDef.bgColor : 'transparent',
                                        border:          `1px solid ${tagDef.color}60`,
                                    }}
                                >{tagDef.label}</button>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

// ══════════════════════════════════════════════════════════════════════════════
// AgentCompactRow — mode réduit
// ══════════════════════════════════════════════════════════════════════════════

const AgentCompactRow = ({ character, isOnline, isActiveTurn, isSelected, onSelect }) => {
    const palier = character.degradationPalier ?? 0;
    return (
        <div
            onClick={() => onSelect(character.id)}
            className={[
                'flex items-center gap-2 px-3 py-2 cursor-pointer border-b border-default/20',
                'hover:bg-surface-alt transition-colors',
                isSelected   ? 'bg-accent/5 border-l-2 border-l-accent' : 'border-l-2 border-l-transparent',
                isActiveTurn ? 'ring-1 ring-inset ring-accent/30' : '',
            ].join(' ')}
        >
            <div className={['w-1.5 h-1.5 rounded-full shrink-0', isOnline ? 'bg-success' : 'bg-muted/30'].join(' ')} />
            <div className="w-6 h-6 border border-default/40 shrink-0 overflow-hidden bg-surface-alt">
                {character.avatar
                    ? <img src={character.avatar} alt="" className="w-full h-full object-cover" />
                    : <span className="w-full h-full flex items-center justify-center text-[9px] text-muted">☰</span>
                }
            </div>
            <span className="text-xs font-mono flex-1 truncate min-w-0">
                {character.nom}
                {character.alias && <span className="text-muted"> / {character.alias}</span>}
            </span>
            {palier > 0 && (
                <span className={[
                    'text-[10px] font-mono border px-1 shrink-0',
                    palier >= 3 ? 'text-danger border-danger/40' : 'text-accent border-accent/40',
                ].join(' ')}>{palier}</span>
            )}
        </div>
    );
};

// ══════════════════════════════════════════════════════════════════════════════
// GMAgentPanel — fiche complète GM (panneau droit)
// ══════════════════════════════════════════════════════════════════════════════
const GMAgentPanel = ({ char, isOnline, sessionId, onCharacterUpdate, onSendNote, onPalierChange, onTagChange }) => {
    const { slug } = useSystem();

    const [localChar, setLocalChar] = useState(char);
    const [dirty,     setDirty]     = useState(false);
    const [editMode,  setEditMode]  = useState(false); // ← lecture par défaut
    const [copied,    setCopied]    = useState(false);

    const localCharRef = useRef(localChar);
    useEffect(() => { localCharRef.current = localChar; }, [localChar]);

    useEffect(() => {
        if (!dirty) setLocalChar(char);
    }, [char, dirty]);

    useEffect(() => {
        setLocalChar(char);
        setDirty(false);
        setEditMode(false); // ← reset en lecture au changement d'agent
    }, [char.id]); // eslint-disable-line react-hooks/exhaustive-deps

    const set = (field, value) => {
        setLocalChar(prev => ({ ...prev, [field]: value }));
        setDirty(true);
    };

    const setArr = (field, arr) => {
        setLocalChar(prev => ({ ...prev, [field]: arr }));
        setDirty(true);
    };

    const patchImmediate = useCallback((partial) => {
        const updated = { ...localCharRef.current, ...partial };
        localCharRef.current = updated;
        setLocalChar(updated);
        onCharacterUpdate(updated);
    }, [onCharacterUpdate]);

    const handleSave = () => {
        onCharacterUpdate(localChar);
        setDirty(false);
    };

    const handleCopyLink = () => {
        const url  = `${window.location.origin}/${slug}/${localChar.accessUrl}`;
        const code = localChar.accessCode ?? '';
        navigator.clipboard.writeText(`${url}\nCode : ${code}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handlePalier = (p)   => patchImmediate({ degradationPalier: p });

    const toggleTag = (tagKey) => {
        const tags   = localCharRef.current.tags ?? [];
        const exists = tags.find(t => t.key === tagKey);
        const tagDef = GM_TAGS.find(t => t.key === tagKey);
        if (!tagDef) return;
        const next = exists
            ? tags.filter(t => t.key !== tagKey)
            : [...tags, { key: tagKey, label: tagDef.label, color: tagDef.color, bgColor: tagDef.bgColor }];
        patchImmediate({ tags: next });
    };

    const palier     = localChar.degradationPalier ?? 0;
    const activeTags = localChar.tags ?? [];

    return (
        <div className="flex flex-col h-full" style={{ fontFamily: 'var(--dg-font-body)' }}>

            {/* ── Header fixe ──────────────────────────────────────────────── */}
            <div className="shrink-0 border-b border-default bg-surface px-4 py-3 space-y-3">

                {/* Ligne 1 : avatar + identité + actions */}
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 border border-default shrink-0 overflow-hidden bg-surface-alt">
                        {localChar.avatar
                            ? <img src={localChar.avatar} alt="" className="w-full h-full object-cover" />
                            : <span className="w-full h-full flex items-center justify-center text-muted text-xl">☰</span>
                        }
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <div className={['w-2 h-2 rounded-full shrink-0', isOnline ? 'bg-success' : 'bg-muted/40'].join(' ')} />
                            <p className="font-mono text-sm font-bold truncate">
                                {[localChar.nom, localChar.prenom].filter(Boolean).join(' ')}
                                {localChar.alias && <span className="text-muted font-normal"> / {localChar.alias}</span>}
                            </p>
                        </div>
                        <p className="text-xs text-muted font-mono truncate mt-0.5">{localChar.profession || '—'}</p>
                    </div>

                    {/* Actions + toggle editMode */}
                    <div className="flex gap-2 shrink-0 flex-wrap justify-end">
                        {/* Rappel sauvegarde dans le header */}
                        {dirty && (
                            <button
                                onClick={handleSave}
                                className="text-xs font-mono border border-accent text-accent px-2 py-1 hover:bg-accent/10 transition-colors font-bold animate-pulse"
                            >💾 Sauvegarder</button>
                        )}
                        <button
                            onClick={() => setEditMode(v => !v)}
                            className={[
                                'text-xs font-mono border px-2 py-1 transition-colors',
                                editMode
                                    ? 'border-accent text-accent bg-accent/10'
                                    : 'border-default text-muted hover:border-default hover:text-default',
                            ].join(' ')}
                            title={editMode ? 'Repasser en lecture' : 'Activer le mode édition'}
                        >{editMode ? '✎ Édition' : '👁 Lecture'}</button>
                        <button
                            onClick={handleCopyLink}
                            className="text-xs font-mono border border-default px-2 py-1 hover:border-accent hover:text-accent transition-colors"
                        >{copied ? '✓ Copié' : '📋 Lien'}</button>
                        <button
                            onClick={onSendNote}
                            className="text-xs font-mono border border-default px-2 py-1 hover:border-accent hover:text-accent transition-colors"
                        >✉ Note</button>
                    </div>
                </div>

                {/* Ligne 2 : palier */}
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-mono text-muted uppercase tracking-wider">Palier</span>
                    {[0,1,2,3,4].map(i => (
                        <button
                            key={i}
                            onClick={() => handlePalier(i)}
                            title={PALIER_LABELS[i]}
                            className={[
                                'w-7 h-7 text-xs font-mono border transition-colors',
                                palier === i
                                    ? `${PALIER_COLORS[i]} bg-surface-alt`
                                    : 'border-default/30 text-muted hover:border-default',
                            ].join(' ')}
                        >{i}</button>
                    ))}
                    <span className={`text-xs font-mono ${PALIER_TEXT[palier]}`}>{PALIER_LABELS[palier]}</span>
                </div>

                {/* Ligne 3 : tags */}
                <div className="flex flex-wrap gap-1">
                    {activeTags.map(tag => (
                        <span
                            key={tag.key}
                            className="dg-tag cursor-pointer hover:opacity-70 transition-opacity"
                            style={{ color: tag.color, backgroundColor: tag.bgColor, border: `1px solid ${tag.color}40` }}
                            onClick={() => toggleTag(tag.key)}
                            title="Retirer"
                        >{tag.label} ✕</span>
                    ))}
                    {GM_TAGS
                        .filter(t => !activeTags.find(x => x.key === t.key))
                        .map(tagDef => (
                            <button
                                key={tagDef.key}
                                onClick={() => toggleTag(tagDef.key)}
                                className="dg-tag opacity-25 hover:opacity-60 transition-opacity"
                                style={{ color: tagDef.color, border: `1px solid ${tagDef.color}50` }}
                            >+ {tagDef.label}</button>
                        ))
                    }
                </div>
            </div>

            {/* ── Corps scrollable — ordre DD-315 ──────────────────────────── */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                <div className="grid grid-cols-3 gap-3">
                    <div>
                        {/* 9. Attributs dérivés */}
                        <DerivedSection
                            char={localChar}
                            editMode={editMode}
                            set={set}
                            onPatchImmediate={patchImmediate}
                        />
                        <hr className="dg-divider" />
                        {/* 11. Attaches */}
                        <div className="dg-bonds-section">
                            <BondsSection
                                char={localChar}
                                editMode={editMode}
                                setArr={setArr}
                                onPatchImmediate={patchImmediate}
                            />
                        </div>
                        <hr className="dg-divider" />

                        {/* 12. Motivations & Troubles */}
                        <MotivationsSection
                            char={localChar}
                            editMode={editMode}
                            setArr={setArr}
                        />
                        <hr className="dg-divider" />

                        {/* 13. Log SAN */}
                        <div className="dg-san-section">
                            <SanLogSection
                                sanLog={localChar.sanLog ?? []}
                                editMode={editMode}
                                onNotesChange={(entryId, notes) => {
                                    setArr('sanLog', (localChar.sanLog ?? []).map(e =>
                                        e.id === entryId ? { ...e, notes } : e
                                    ));
                                }}
                            />
                        </div>
                        <hr className="dg-divider" />

                        {/* 14. Blessures et maladies */}
                        <InjuriesSection
                            char={localChar}
                            editMode={editMode}
                            set={set}
                            onPatchImmediate={patchImmediate}
                        />
                        <hr className="dg-divider" />
                    </div>
                    <div className="col-span-2">
                        {/* 8. Caractéristiques */}
                        <StatsSection
                            char={localChar}
                            editMode={editMode}
                            set={set}
                            onRoll={null}
                        />
                        <hr className="dg-divider" />
                        {/* 15. Compétences */}
                        <SkillsSection
                            char={localChar}
                            editMode={editMode}
                            setArr={setArr}
                            onRoll={null}
                            onPatchImmediate={patchImmediate}
                        />
                        <hr className="dg-divider" />

                        {/* 16. Armure et matériel */}
                        <EquipmentSection
                            char={localChar}
                            editMode={editMode}
                            setArr={setArr}
                        />
                        <hr className="dg-divider" />

                        {/* 17. Armes */}
                        <WeaponsSection
                            char={localChar}
                            editMode={editMode}
                            setArr={setArr}
                            onRoll={null}
                            onPatchImmediate={patchImmediate}
                        />
                        <hr className="dg-divider" />

                        {/* 20. Entraînement spécial */}
                        <SpecialTrainingSection
                            char={localChar}
                            editMode={editMode}
                            set={set}
                            onRoll={null}
                        />
                        <hr className="dg-divider" />
                    </div>
                </div>

                {/* 21-22. Officier / Signature */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="dg-section-label mb-1">21. Officier responsable</p>
                        {editMode
                            ? <input
                                className="dg-field-input w-full px-2 py-1 text-sm"
                                value={localChar.officerResponsible ?? ''}
                                onChange={e => set('officerResponsible', e.target.value)}
                            />
                            : <p className="dg-form-line py-1 text-2xl dg-font-signature">
                                {localChar.officerResponsible || '\u00A0'}
                            </p>
                        }
                    </div>
                    <div>
                        <p className="dg-section-label mb-1">22. Signature agent</p>
                        {editMode
                            ? <input
                                className="dg-field-input w-full px-2 py-1 text-sm"
                                value={localChar.agentSignature ?? ''}
                                onChange={e => set('agentSignature', e.target.value)}
                            />
                            : <p className="dg-form-line py-1 text-2xl dg-font-signature">
                                {localChar.agentSignature || '\u00A0'}
                            </p>
                        }
                    </div>
                </div>

                {dirty && <div className="h-14" />}
            </div>

            {/* ── Barre sauvegarde sticky bas ───────────────────────────────── */}
            {dirty && (
                <div className="shrink-0 border-t border-default bg-surface px-4 py-2 flex items-center justify-between">
                    <span className="text-xs font-mono text-muted italic">Modifications non sauvegardées</span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => { setLocalChar(char); setDirty(false); }}
                            className="text-xs font-mono border border-default px-3 py-1 hover:bg-surface-alt transition-colors"
                        >Annuler</button>
                        <button
                            onClick={handleSave}
                            className="text-xs font-mono border border-accent text-accent px-3 py-1 hover:bg-accent/10 transition-colors font-bold"
                        >Sauvegarder</button>
                    </div>
                </div>
            )}
        </div>
    );
};

// ══════════════════════════════════════════════════════════════════════════════
// TabSession — composant principal
// ══════════════════════════════════════════════════════════════════════════════

const TabSession = ({ activeSession, onlineCharacters }) => {
    const { apiBase }   = useSystem();
    const fetchWithAuth = useFetch();
    const socket        = useSocket();

    const [characters,    setCharacters]    = useState({});
    const [loading,       setLoading]       = useState(false);
    const [selectedId,    setSelectedId]    = useState(null);
    const [collapsed,     setCollapsed]     = useState(false);
    const [activeTurnId,  setActiveTurnId]  = useState(null);
    const [initiativeOn,  setInitiativeOn]  = useState(false);
    const [showSendNote,  setShowSendNote]  = useState(false);
    const [sendPreselect, setSendPreselect] = useState(null);

    const onlineIds = new Set((onlineCharacters ?? []).map(c => c.characterId));

    // ── Chargement ────────────────────────────────────────────────────────────
    useEffect(() => {
        if (!activeSession?.characters?.length) {
            setCharacters({});
            setSelectedId(null);
            return;
        }
        setLoading(true);
        Promise.all(
            activeSession.characters.map(c =>
                fetchWithAuth(`${apiBase}/characters/${c.id}`)
                    .then(r => r.ok ? r.json() : null)
                    .catch(() => null)
            )
        ).then(results => {
            const map = {};
            results.filter(Boolean).forEach(char => { map[char.id] = char; });
            setCharacters(map);
            setSelectedId(prev =>
                (prev && map[prev]) ? prev : (activeSession.characters[0]?.id ?? null)
            );
        }).finally(() => setLoading(false));
    }, [activeSession?.id, activeSession?.characters?.length]); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Socket ────────────────────────────────────────────────────────────────
    useEffect(() => {
        if (!socket) return;
        const onUpdated = (data) => {
            if (data?.id && characters[data.id]) {
                setCharacters(prev => ({ ...prev, [data.id]: { ...prev[data.id], ...data } }));
            }
        };
        socket.on('character:updated', onUpdated);
        return () => socket.off('character:updated', onUpdated);
    }, [socket, characters]);

    // ── Persistance ───────────────────────────────────────────────────────────
    const handleCharacterUpdate = useCallback(async (updatedChar) => {
        if (!updatedChar?.id) return;
        setCharacters(prev => ({ ...prev, [updatedChar.id]: updatedChar }));
        try {
            const r = await fetchWithAuth(`${apiBase}/characters/${updatedChar.id}`, {
                method:  'PUT',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify(updatedChar),
            });
            if (r.ok) {
                const saved = await r.json();
                setCharacters(prev => ({ ...prev, [saved.id]: saved }));
            }
        } catch (err) {
            console.error('[TabSession/DG] handleCharacterUpdate:', err);
        }
    }, [apiBase]); // fetchWithAuth intentionnellement absent

    // ── Palier / Tags depuis AgentCard ────────────────────────────────────────
    const handlePalierChange = useCallback(async (charId, palier) => {
        setCharacters(prev => ({ ...prev, [charId]: { ...prev[charId], degradationPalier: palier } }));
        try {
            await fetchWithAuth(`${apiBase}/characters/${charId}`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ degradationPalier: palier }),
            });
        } catch (err) { console.error('[TabSession] palier:', err); }
    }, [apiBase]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleTagChange = useCallback(async (charId, tags) => {
        setCharacters(prev => ({ ...prev, [charId]: { ...prev[charId], tags } }));
        try {
            await fetchWithAuth(`${apiBase}/characters/${charId}`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tags }),
            });
        } catch (err) { console.error('[TabSession] tags:', err); }
    }, [apiBase]); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Initiative ────────────────────────────────────────────────────────────
    const sorted = Object.values(characters).sort((a, b) => (b.dex ?? 10) - (a.dex ?? 10));

    const handleNextTurn = () => {
        if (!sorted.length) return;
        const idx  = sorted.findIndex(c => c.id === activeTurnId);
        setActiveTurnId(sorted[(idx + 1) % sorted.length].id);
    };

    // ── Gardes ────────────────────────────────────────────────────────────────
    if (!activeSession) return (
        <div className="flex items-center justify-center h-full w-full text-muted font-mono text-sm">
            Aucune session active. Sélectionnez une table via le bouton « Table ».
        </div>
    );

    if (loading) return (
        <div className="flex items-center justify-center h-full w-full text-muted font-mono text-sm animate-pulse">
            Chargement des agents…
        </div>
    );

    const selectedChar = selectedId ? characters[selectedId] : null;

    return (
        <div className="flex h-full w-full overflow-hidden">

            {/* ── Colonne gauche ────────────────────────────────────────────── */}
            <div className={[
                'flex flex-col border-r border-default bg-surface shrink-0 transition-all duration-200',
                collapsed ? 'w-52' : 'w-80',
            ].join(' ')}>

                {/* Header colonne */}
                <div className="flex items-center justify-between px-3 py-2 border-b border-default shrink-0">
                    <span className="text-[10px] font-mono text-muted uppercase tracking-wider">
                        Agents ({sorted.length})
                    </span>
                    <button
                        onClick={() => setCollapsed(v => !v)}
                        className="text-[10px] font-mono text-muted hover:text-default border border-default/30 px-1.5 py-0.5 transition-colors"
                        title={collapsed ? 'Étendre les cartes' : 'Réduire les cartes'}
                    >{collapsed ? '⊞' : '⊟'}</button>
                </div>

                {/* Barre initiative — masquée en mode compact */}
                {!collapsed && (
                    <div className="px-3 py-2 border-b border-default/40 shrink-0">
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[10px] font-mono text-muted uppercase tracking-wider">
                                Initiative
                            </span>
                            <div className="flex gap-1">
                                {initiativeOn && (
                                    <button
                                        onClick={handleNextTurn}
                                        className="text-[10px] font-mono border border-accent text-accent px-1.5 py-0.5 hover:bg-accent/10 transition-colors"
                                    >Suivant →</button>
                                )}
                                <button
                                    onClick={() => {
                                        if (initiativeOn) { setInitiativeOn(false); setActiveTurnId(null); }
                                        else { setInitiativeOn(true); setActiveTurnId(sorted[0]?.id ?? null); }
                                    }}
                                    className="text-[10px] font-mono border border-default/40 text-muted px-1.5 py-0.5 hover:border-default transition-colors"
                                >{initiativeOn ? 'Reset' : 'Démarrer'}</button>
                            </div>
                        </div>
                        {initiativeOn && (
                            <div className="flex flex-wrap gap-1">
                                {sorted.map(c => (
                                    <button
                                        key={c.id}
                                        onClick={() => setActiveTurnId(c.id)}
                                        className={[
                                            'text-[10px] font-mono border px-1.5 py-0.5 transition-colors',
                                            activeTurnId === c.id
                                                ? 'border-accent text-accent bg-accent/10'
                                                : 'border-default/40 text-muted hover:border-default',
                                        ].join(' ')}
                                    >{c.nom ?? '?'} {(c.dex ?? 10) * 5}%</button>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Liste agents */}
                <div className="flex-1 overflow-y-auto">
                    {sorted.length === 0 ? (
                        <p className="text-xs text-muted font-mono text-center py-6 px-3">
                            Aucun agent dans cette session.
                        </p>
                    ) : collapsed ? (
                        sorted.map(char => (
                            <AgentCompactRow
                                key={char.id}
                                character={char}
                                isOnline={onlineIds.has(char.id)}
                                isActiveTurn={activeTurnId === char.id}
                                isSelected={selectedId === char.id}
                                onSelect={setSelectedId}
                            />
                        ))
                    ) : (
                        <div className="p-3 space-y-3">
                            {sorted.map(char => (
                                <AgentCard
                                    key={char.id}
                                    character={char}
                                    isOnline={onlineIds.has(char.id)}
                                    isActiveTurn={activeTurnId === char.id}
                                    isSelected={selectedId === char.id}
                                    onSelect={setSelectedId}
                                    onPalierChange={handlePalierChange}
                                    onTagChange={handleTagChange}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Panneau droit — fiche agent ──────────────────────────────── */}
            <div className="flex-1 overflow-hidden">
                {!selectedChar ? (
                    <div className="flex items-center justify-center h-full text-muted font-mono text-sm">
                        Sélectionnez un agent pour afficher sa fiche.
                    </div>
                ) : (
                    <GMAgentPanel
                        key={selectedChar.id}
                        char={selectedChar}
                        isOnline={onlineIds.has(selectedChar.id)}
                        sessionId={activeSession?.id ?? null}
                        onCharacterUpdate={handleCharacterUpdate}
                        onPalierChange={(p) => handlePalierChange(selectedChar.id, p)}
                        onTagChange={(tags) => handleTagChange(selectedChar.id, tags)}
                        onSendNote={() => {
                            setSendPreselect(selectedChar.id);
                            setShowSendNote(true);
                        }}
                    />
                )}
            </div>

            {/* ── GMSendModal ──────────────────────────────────────────────── */}
            {showSendNote && (
                <GMSendModal
                    sessionId={activeSession?.id}
                    characters={Object.values(characters)}
                    preSelectedCharacterId={sendPreselect}
                    onClose={() => { setShowSendNote(false); setSendPreselect(null); }}
                />
            )}
        </div>
    );
};

export default TabSession;