// src/client/src/systems/achtung/Creation.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Wizard de création de personnage Achtung! Cthulhu — PUBLIC, sans auth.
//
// Ordre canonique :
//   1 — Attributs de départ   (informatif)
//   2 — Archétype
//   3 — Nationalité
//   4 — Background
//   5 — Caractéristique
//   6 — Magie (conditionnelle — si talent Lanceur de sorts)
//   7 — Identité + Finishing Touches
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useCallback, useMemo } from 'react';
import './theme.css';
import { useSystem }   from '../../hooks/useSystem.js';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../../components/ui/ThemeToggle.jsx';
import {
    ATTRIBUTES, SKILLS, ATTR_LABEL, SKILL_LABEL,
    ARCHETYPE_DATA, BACKGROUND_DATA, CHARACTERISTIC_DATA,
    NATIONALITIES, TALENTS, SPELLS,
    getBonusDamage, computeStress, computeArmour, computeCourage, getBonusLanguages,
    SPELLCASTER_PRACTICES, getCastAttribute, getStartingSpellCount, getAccessibleTraditions,
    getPowerRating, getBonusPowerDice,
    KEYWORD_LABELS,
} from './config.jsx';

// ══════════════════════════════════════════════════════════════════════════════
// CONSTANTES
// ══════════════════════════════════════════════════════════════════════════════

const ATTR_BASE        = 6;
const ATTR_MAX         = 11;
const ATTR_MIN         = 6;
const TARGET_ATTR_SUM  = 51;
const TARGET_SKILL_SUM = 17;

const BASE_STEPS = [
    { id: 1, label: 'Attributs'       },
    { id: 2, label: 'Archétype'       },
    { id: 3, label: 'Nationalité'     },
    { id: 4, label: 'Background'      },
    { id: 5, label: 'Caractéristique' },
    { id: 6, label: 'Magie'           }, // conditionnelle — insérée dynamiquement
    { id: 7, label: 'Identité'        },
];

// ══════════════════════════════════════════════════════════════════════════════
// HELPERS DE CALCUL
// ══════════════════════════════════════════════════════════════════════════════

function applyBonusToAttrs(base, bonus) {
    if (!bonus) return { ...base };
    const out = { ...base };
    for (const [k, v] of Object.entries(bonus)) out[k] = (out[k] ?? ATTR_BASE) + v;
    return out;
}

function applyBonusToSkills(base, bonus) {
    if (!bonus) return { ...base };
    const out = { ...base };
    for (const [k, v] of Object.entries(bonus)) out[k] = (out[k] ?? 0) + v;
    return out;
}

function computeFinalValues(ws) {
    let attrs  = {};
    let skills = {};
    ATTRIBUTES.forEach(a => { attrs[a.key]  = ATTR_BASE; });
    SKILLS.forEach(s     => { skills[s.key] = 0; });

    if (ws.archetype) {
        const ad = ARCHETYPE_DATA[ws.archetype];
        if (ad) {
            const attrB  = ad.variants ? ad.variants[ws.occultistVariant ?? 'A'].attrBonus  : ad.attrBonus;
            const skillB = ad.variants ? ad.variants[ws.occultistVariant ?? 'A'].skillBonus : ad.skillBonus;
            attrs  = applyBonusToAttrs(attrs, attrB);
            skills = applyBonusToSkills(skills, skillB);
        }
    }
    if (ws.background) {
        const bd = BACKGROUND_DATA[ws.background];
        if (bd) {
            attrs  = applyBonusToAttrs(attrs, bd.attrBonus);
            skills = applyBonusToSkills(skills, bd.skillBonus);
            if (bd.attrBonusFree && ws.bgAttrFree) attrs[ws.bgAttrFree] = (attrs[ws.bgAttrFree] ?? ATTR_BASE) + 1;
            if (bd.skillBonusFree && ws.bgSkillsFree?.length) {
                for (const sk of ws.bgSkillsFree) skills[sk] = (skills[sk] ?? 0) + 1;
            }
        }
    }
    if (ws.characteristic) {
        const cd = CHARACTERISTIC_DATA[ws.characteristic];
        if (cd) {
            const charData = cd.isChoice ? cd.options[ws.charVariant] : cd;
            if (charData) {
                attrs  = applyBonusToAttrs(attrs, charData.attrBonus);
                skills = applyBonusToSkills(skills, charData.skillBonus);
                if (charData.attrBonusFree && ws.charAttrFree) attrs[ws.charAttrFree] = (attrs[ws.charAttrFree] ?? ATTR_BASE) + 1;
                if (ws.charSkillsFree?.length) for (const sk of ws.charSkillsFree) skills[sk] = (skills[sk] ?? 0) + 1;
                if (charData.specialRule === 'dilettante') SKILLS.forEach(s => { if ((skills[s.key] ?? 0) === 0) skills[s.key] = 1; });
            }
        }
    }
    for (const k of Object.keys(attrs)) attrs[k] = Math.max(ATTR_MIN, Math.min(ATTR_MAX, attrs[k]));
    return { attrs, skills };
}

// Détecte si un talent Lanceur de sorts (keyword 'spellcaster') a été pris,
// parmi les 3 talents choisis. Ne détermine PLUS la pratique — celle-ci est
// choisie librement par le joueur à l'étape 6 (cf. SPELLCASTER_PRACTICES).
function detectSpellcasterTalent(ws) {
    for (const tk of [ws.archTalent, ws.bgTalent, ws.charTalent]) {
        if (tk && TALENTS[tk]?.keywords.includes('spellcaster')) return tk;
    }
    return null;
}

// Affiche une liste de clés keyword anglaises sous forme lisible FR ("X ou Y")
function formatKeywordList(keys) {
    if (!keys?.length) return '—';
    return keys.map(k => KEYWORD_LABELS[k] ?? k).join(' ou ');
}

// ══════════════════════════════════════════════════════════════════════════════
// COMPOSANTS UTILITAIRES — niveau module (évite remount)
// ══════════════════════════════════════════════════════════════════════════════

const StepBar = ({ steps, current }) => (
    <div className="flex items-center gap-0 mb-8 select-none">
        {steps.map((s, i) => (
            <React.Fragment key={s.id}>
                <div className="flex flex-col items-center" style={{ minWidth: 0, flex: 1 }}>
                    <div style={{
                        width: 28, height: 28, borderRadius: '50%',
                        background: s.id < current ? 'var(--ac-primary)' : s.id === current ? 'var(--ac-secondary)' : 'var(--ac-surface-alt)',
                        border: `2px solid ${s.id <= current ? 'var(--ac-primary)' : 'var(--ac-border)'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: s.id <= current ? 'var(--ac-bg)' : 'var(--ac-muted)',
                        fontFamily: 'var(--ac-font-heading)', fontWeight: 700, fontSize: '0.7rem',
                        transition: 'all 0.2s', flexShrink: 0,
                    }}>
                        {s.id < current ? '✓' : s.id}
                    </div>
                    <span style={{
                        fontSize: '0.6rem', fontFamily: 'var(--ac-font-heading)', fontWeight: 600,
                        letterSpacing: '0.06em', textTransform: 'uppercase',
                        color: s.id === current ? 'var(--ac-secondary)' : 'var(--ac-muted)',
                        marginTop: 3, textAlign: 'center', whiteSpace: 'nowrap',
                    }}>{s.label}</span>
                </div>
                {i < steps.length - 1 && (
                    <div style={{
                        flex: '0 0 auto', width: 24, height: 2,
                        background: s.id < current ? 'var(--ac-primary)' : 'var(--ac-border)',
                        marginBottom: 16, transition: 'background 0.2s',
                    }} />
                )}
            </React.Fragment>
        ))}
    </div>
);

// Pour un talent ayant le keyword 'advanced', retourne { skillKey, currentRank } ou null.
// Simplifié : le keyword de compétence associé EST déjà la clé SKILLS (plus de table de trad FR->clé).
function getAdvancedRequirement(talentKey, ws) {
    const t = TALENTS[talentKey];
    if (!t?.keywords.includes('advanced')) return null;
    const skillKey = t.keywords.find(k => SKILLS.some(s => s.key === k));
    if (!skillKey) return null;
    const { skills } = computeFinalValues(ws);
    return { skillKey, currentRank: skills[skillKey] ?? 0 };
}

const TalentCard = ({ talentKey, selected, onSelect, ws }) => {
    const t = TALENTS[talentKey];
    if (!t) return null;

    const advReq   = ws ? getAdvancedRequirement(talentKey, ws) : null;
    const isLocked = advReq && advReq.currentRank < 3 && !selected;

    return (
        <button
            onClick={() => !isLocked && onSelect(talentKey)}
            disabled={isLocked}
            className="ac-card text-left w-full transition-all"
            style={{
                borderLeft: `3px solid ${selected ? 'var(--ac-secondary)' : 'var(--ac-border)'}`,
                cursor:     isLocked ? 'not-allowed' : 'pointer',
                background: selected ? 'var(--ac-surface-alt)' : 'var(--ac-surface)',
                opacity:    isLocked ? 0.45 : 1,
            }}>
            <div className="flex items-start justify-between gap-2">
                <span style={{ fontFamily: 'var(--ac-font-heading)', fontWeight: 700, fontSize: '0.78rem', color: 'var(--ac-text)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t.label}</span>
                {selected && <span style={{ color: 'var(--ac-secondary)', fontSize: '0.8rem', flexShrink: 0 }}>✓</span>}
            </div>
            <div className="flex flex-wrap gap-1 mt-1 mb-2">
                {t.keywords.map(kw => (
                    <span key={kw} style={{ fontSize: '0.6rem', fontFamily: 'var(--ac-font-heading)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', background: 'var(--ac-primary)', color: 'var(--ac-bg)', borderRadius: 3, padding: '1px 5px' }}>{KEYWORD_LABELS[kw] ?? kw}</span>
                ))}
            </div>
            <p style={{ fontSize: '0.76rem', color: 'var(--ac-text-muted)', lineHeight: 1.5, margin: 0 }}>{t.description}</p>
            {isLocked && (
                <p style={{ fontSize: '0.7rem', color: 'var(--ac-accent)', fontWeight: 600, marginTop: '0.4rem' }}>
                    🔒 Nécessite {SKILL_LABEL[advReq.skillKey]} 3+ (actuel : {advReq.currentRank})
                </p>
            )}
        </button>
    );
};

const FocusPill = ({ label, selected, onToggle, disabled }) => (
    <button onClick={onToggle} disabled={disabled && !selected}
            style={{ padding: '3px 10px', borderRadius: 20, border: `1px solid ${selected ? 'var(--ac-secondary)' : 'var(--ac-border)'}`, background: selected ? 'var(--ac-secondary)' : 'transparent', color: selected ? 'var(--ac-bg)' : disabled ? 'var(--ac-muted)' : 'var(--ac-text)', fontSize: '0.72rem', fontFamily: 'var(--ac-font-heading)', fontWeight: 600, letterSpacing: '0.06em', cursor: disabled && !selected ? 'not-allowed' : 'pointer', transition: 'all 0.15s' }}>
        {label}
    </button>
);

const BonusDisplay = ({ attrBonus, skillBonus }) => {
    const attrs  = attrBonus  ? Object.entries(attrBonus).filter(([,v]) => v)  : [];
    const skills = skillBonus ? Object.entries(skillBonus).filter(([,v]) => v) : [];
    if (!attrs.length && !skills.length) return null;
    return (
        <div className="grid grid-cols-2 gap-3 mt-3">
            {attrs.length > 0 && (
                <div>
                    <div className="ac-label mb-1">Attributs</div>
                    <div className="flex flex-wrap gap-1">
                        {attrs.map(([k, v]) => (
                            <span key={k} style={{ fontSize: '0.72rem', fontFamily: 'var(--ac-font-heading)', background: 'var(--ac-surface-alt)', border: '1px solid var(--ac-border)', borderRadius: 4, padding: '2px 8px', color: 'var(--ac-text)' }}>
                                {ATTR_LABEL[k] ?? k} <span style={{ color: 'var(--ac-secondary)', fontWeight: 700 }}>+{v}</span>
                            </span>
                        ))}
                    </div>
                </div>
            )}
            {skills.length > 0 && (
                <div>
                    <div className="ac-label mb-1">Compétences</div>
                    <div className="flex flex-wrap gap-1">
                        {skills.map(([k, v]) => (
                            <span key={k} style={{ fontSize: '0.72rem', fontFamily: 'var(--ac-font-heading)', background: 'var(--ac-surface-alt)', border: '1px solid var(--ac-border)', borderRadius: 4, padding: '2px 8px', color: 'var(--ac-text)' }}>
                                {SKILL_LABEL[k] ?? k} <span style={{ color: 'var(--ac-secondary)', fontWeight: 700 }}>+{v}</span>
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const AttrFreeSelect = ({ value, onChange, label = '+1 attribut libre' }) => (
    <div>
        <div className="ac-label mb-1">{label}</div>
        <select value={value ?? ''} onChange={e => onChange(e.target.value || null)} className="ac-input" style={{ fontSize: '0.8rem' }}>
            <option value=''>— Choisir un attribut —</option>
            {ATTRIBUTES.map(a => <option key={a.key} value={a.key}>{a.label}</option>)}
        </select>
    </div>
);

const SkillFreeSelect = ({ count, selected, onChange, exclude = [], label, noDouble = true }) => {
    const available = SKILLS.filter(s => !exclude.includes(s.key));
    return (
        <div>
            <div className="ac-label mb-1">{label ?? `+1 à ${count} compétence${count > 1 ? 's' : ''} libre${count > 1 ? 's' : ''}`}</div>
            <div className="flex flex-col gap-1">
                {Array.from({ length: count }).map((_, i) => (
                    <select key={i} value={selected[i] ?? ''} onChange={e => { const next = [...selected]; next[i] = e.target.value || null; onChange(next.slice(0, count)); }} className="ac-input" style={{ fontSize: '0.8rem' }}>
                        <option value=''>— Choisir —</option>
                        {available.filter(s => !noDouble || !selected.includes(s.key) || selected[i] === s.key).map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                    </select>
                ))}
            </div>
        </div>
    );
};

const FocusSelector = ({ focusPool, count, selected, onChange, label = 'Choisissez vos focuses', takenElsewhere = new Set() }) => (
    <div>
        <div className="ac-section-header" style={{ marginTop: '0.75rem' }}>
            {label} <span style={{ color: 'var(--ac-muted)', fontWeight: 400 }}>({selected.length}/{count})</span>
        </div>
        <p style={{ fontSize: '0.74rem', color: 'var(--ac-text-muted)', margin: '0.25rem 0 0.5rem' }}>
            Vous pouvez prendre deux focuses parmi les compétences suivantes. Deux focuses peuvent être sur la même compétence, mais un focus déjà acquis ne peut pas être repris.
        </p>
        {focusPool.map(skillKey => {
            const skill = SKILLS.find(s => s.key === skillKey);
            if (!skill) return null;
            return (
                <div key={skillKey} className="mb-3">
                    <div className="ac-label mb-1">{skill.label}</div>
                    <div className="flex flex-wrap gap-1">
                        {skill.focuses.map(f => {
                            const focusId   = `${skillKey}:${f}`;
                            const isSelected      = selected.includes(focusId);
                            const atMax           = selected.length >= count;
                            const alreadyTaken    = takenElsewhere.has(focusId);
                            const isDisabled      = (!isSelected && atMax) || alreadyTaken;
                            return (
                                <FocusPill key={focusId} label={f} selected={isSelected}
                                           disabled={isDisabled}
                                           onToggle={() => {
                                               if (alreadyTaken) return;
                                               if (isSelected) onChange(selected.filter(x => x !== focusId));
                                               else if (!atMax) onChange([...selected, focusId]);
                                           }} />
                            );
                        })}
                    </div>
                </div>
            );
        })}
    </div>
);

// ── Focuses déjà pris toutes étapes confondues ───────────────────────────────
function getAllTakenFocuses(ws) {
    return new Set([
        ...(ws.archFocuses ?? []),
        ...(ws.bgFocus     ? [ws.bgFocus]     : []),
        ...(ws.bgFocusFree ? [ws.bgFocusFree] : []),
    ].filter(Boolean));
}

// ── FieldRow — niveau module (évite remount au render) ───────────────────────
const FieldRow = ({ label, children }) => (
    <div>
        <div className="ac-label mb-0.5">{label}</div>
        {children}
    </div>
);

// ── SpellCard — carte de sort sélectionnable ──────────────────────────────────
const SpellCard = ({ spell, selected, onSelect, flawed = false }) => {
    const skillLabel = SKILL_LABEL[spell.skill] ?? spell.skill;
    return (
        <button onClick={() => onSelect(spell.key)} className="ac-card text-left w-full transition-all"
                style={{ borderLeft: `3px solid ${selected ? 'var(--ac-secondary)' : 'var(--ac-border)'}`, cursor: 'pointer', background: selected ? 'var(--ac-surface-alt)' : 'var(--ac-surface)' }}>
            <div className="flex items-start justify-between gap-2">
                <div>
                    <span style={{ fontFamily: 'var(--ac-font-heading)', fontWeight: 700, fontSize: '0.78rem', color: 'var(--ac-text)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{spell.label}</span>
                    {flawed && <span style={{ marginLeft: 6, fontSize: '0.6rem', fontFamily: 'var(--ac-font-heading)', fontWeight: 700, background: 'var(--ac-accent)', color: '#fff', borderRadius: 3, padding: '1px 5px', textTransform: 'uppercase' }}>Imparfait</span>}
                </div>
                {selected && <span style={{ color: 'var(--ac-secondary)', fontSize: '0.8rem', flexShrink: 0 }}>✓</span>}
            </div>
            <div className="flex flex-wrap gap-2 mt-1 mb-2" style={{ fontSize: '0.68rem', fontFamily: 'var(--ac-font-heading)', color: 'var(--ac-muted)' }}>
                <span>Comp. : <strong style={{ color: 'var(--ac-text)' }}>{skillLabel}</strong></span>
                <span>Diff. : <strong style={{ color: 'var(--ac-text)' }}>{spell.difficulty}</strong></span>
                <span>Coût : <strong style={{ color: 'var(--ac-accent)' }}>{spell.cost}</strong></span>
                <span>Durée : <strong style={{ color: 'var(--ac-text)' }}>{spell.duration}</strong></span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--ac-text-muted)', lineHeight: 1.5, margin: 0 }}>{spell.effect}</p>
        </button>
    );
};

// ══════════════════════════════════════════════════════════════════════════════
// ÉTAPE 1 — Attributs (informatif)
// ══════════════════════════════════════════════════════════════════════════════

const Step1Attributes = () => (
    <div className="grid grid-cols-1 gap-6">
        <div className="ac-card" style={{ borderLeft: '3px solid var(--ac-secondary)' }}>
            <div className="ac-section-header">Briefing de recrutement</div>
            <p style={{ fontSize: '0.85rem', color: 'var(--ac-text-muted)', fontFamily: 'var(--ac-font-title)', lineHeight: 1.7, margin: '0.5rem 0' }}>
                "La Guerre Secrète fait appel à des individus audacieux venus de tous les pays et de toutes les conditions.
                Ces héros sont tirés des rangs de la Section M britannique, des agents inexpérimentés mais bien équipés de
                Majestic américaine, ou des nombreux résistants courageux qui défient les occupations nazies dans toute l'Europe."
            </p>
            <div style={{ fontSize: '0.75rem', color: 'var(--ac-muted)', textAlign: 'right', fontFamily: 'var(--ac-font-heading)' }}>— Briefing d'intégration, Section M</div>
        </div>
        <div className="ac-card">
            <div className="ac-section-header">Valeurs de départ</div>
            <p style={{ fontSize: '0.8rem', color: 'var(--ac-text-muted)', marginBottom: '0.75rem' }}>
                Tous les personnages commencent avec les mêmes aptitudes de base. C'est votre archétype, votre histoire et votre personnalité qui vous distingueront.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                {ATTRIBUTES.map(a => (
                    <div key={a.key} className="ac-card-alt" style={{ padding: '0.6rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                            <span className="ac-label">{a.label}</span>
                            <span style={{ fontFamily: 'var(--ac-font-title)', fontSize: '1.3rem', color: 'var(--ac-secondary)', fontWeight: 700 }}>6</span>
                        </div>
                        <p style={{ fontSize: '0.72rem', color: 'var(--ac-text-muted)', margin: 0, lineHeight: 1.5 }}>{a.description}</p>
                    </div>
                ))}
            </div>
        </div>
        <div className="ac-card">
            <div className="ac-section-header">Compétences</div>
            <p style={{ fontSize: '0.8rem', color: 'var(--ac-text-muted)', marginBottom: '0.75rem' }}>
                Toutes les compétences commencent à <strong style={{ color: 'var(--ac-text)' }}>rang 0</strong>.
                Votre archétype et votre background y ajouteront des points. Total visé à la création : <strong style={{ color: 'var(--ac-secondary)' }}>17 rangs</strong>.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                {SKILLS.map(s => (
                    <div key={s.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.35rem 0.6rem', background: 'var(--ac-surface-alt)', borderRadius: 4 }}>
                        <span style={{ fontSize: '0.78rem', fontFamily: 'var(--ac-font-heading)', color: 'var(--ac-text)' }}>{s.label}</span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--ac-muted)', fontFamily: 'var(--ac-font-heading)' }}>
                            {s.focuses.slice(0, 3).join(', ')}{s.focuses.length > 3 ? '…' : ''}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

// ══════════════════════════════════════════════════════════════════════════════
// ÉTAPE 2 — Archétype
// ══════════════════════════════════════════════════════════════════════════════

const Step2Archetype = ({ ws, patch }) => {
    const archetypeKeys = Object.keys(ARCHETYPE_DATA);
    const selected = ws.archetype;
    const ad = selected ? ARCHETYPE_DATA[selected] : null;
    const attrBonus  = ad ? (ad.variants ? ad.variants[ws.occultistVariant ?? 'A'].attrBonus  : ad.attrBonus)  : null;
    const skillBonus = ad ? (ad.variants ? ad.variants[ws.occultistVariant ?? 'A'].skillBonus : ad.skillBonus) : null;

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '1.5rem', alignItems: 'start' }}>
            <div className="flex flex-col gap-2" style={{ position: 'sticky', top: '1rem' }}>
                <div className="ac-section-header">Choisissez votre archétype</div>
                {archetypeKeys.map(key => {
                    const a = ARCHETYPE_DATA[key];
                    return (
                        <button key={key} onClick={() => patch({ archetype: key, archFocuses: [], archTalent: null, occultistVariant: 'A' })} className="text-left transition-all"
                                style={{ padding: '0.6rem 0.75rem', borderRadius: 6, border: `1px solid ${key === selected ? 'var(--ac-secondary)' : 'var(--ac-border)'}`, background: key === selected ? 'var(--ac-surface-alt)' : 'var(--ac-surface)', cursor: 'pointer' }}>
                            <div style={{ fontFamily: 'var(--ac-font-heading)', fontWeight: 700, fontSize: '0.8rem', color: key === selected ? 'var(--ac-secondary)' : 'var(--ac-text)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{a.labelFr}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--ac-text-muted)', marginTop: 2 }}>{a.tagline}</div>
                        </button>
                    );
                })}
            </div>
            <div>
                {!ad ? (
                    <div className="ac-card" style={{ opacity: 0.5 }}>
                        <p style={{ color: 'var(--ac-text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '2rem 0' }}>← Sélectionnez un archétype pour voir ses détails</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        <div className="ac-card" style={{ borderLeft: '4px solid var(--ac-secondary)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                                <div>
                                    <h2 style={{ fontFamily: 'var(--ac-font-heading)', fontWeight: 700, fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--ac-secondary)', margin: 0 }}>{ad.labelFr}</h2>
                                    <p style={{ fontSize: '0.82rem', color: 'var(--ac-text-muted)', margin: '0.5rem 0 0', lineHeight: 1.6 }}>{ad.description}</p>
                                </div>
                                <div style={{ flexShrink: 0, background: '#000', color: '#fff', fontFamily: 'var(--ac-font-heading)', fontWeight: 900, fontSize: '0.65rem', letterSpacing: '0.15em', padding: '4px 10px', textTransform: 'uppercase', borderRadius: 2 }}>CLASSIFIÉ</div>
                            </div>
                            {ad.playIf?.length > 0 && (
                                <div style={{ marginTop: '0.75rem', borderTop: '1px solid var(--ac-border)', paddingTop: '0.5rem' }}>
                                    <div className="ac-label mb-1">Jouez cet archétype si vous voulez…</div>
                                    <ul style={{ margin: 0, paddingLeft: '1.25rem', listStyle: 'disc' }}>
                                        {ad.playIf.map((item, i) => <li key={i} style={{ fontSize: '0.78rem', color: 'var(--ac-text)', marginBottom: 2 }}>{item}</li>)}
                                    </ul>
                                </div>
                            )}
                        </div>
                        {selected === 'occultist' && (
                            <div className="ac-card">
                                <div className="ac-section-header">Choisissez votre orientation</div>
                                <div className="grid grid-cols-2 gap-3 mt-2">
                                    {Object.entries(ad.variants).map(([vKey, v]) => (
                                        <button key={vKey} onClick={() => patch({ occultistVariant: vKey })} className="ac-card-alt text-left transition-all"
                                                style={{ border: `1px solid ${ws.occultistVariant === vKey ? 'var(--ac-secondary)' : 'var(--ac-border)'}`, cursor: 'pointer' }}>
                                            <div style={{ fontFamily: 'var(--ac-font-heading)', fontWeight: 700, fontSize: '0.78rem', color: ws.occultistVariant === vKey ? 'var(--ac-secondary)' : 'var(--ac-text)' }}>{v.label}</div>
                                            <BonusDisplay attrBonus={v.attrBonus} skillBonus={v.skillBonus} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div className="ac-card">
                            <div className="ac-section-header">Bonus accordés</div>
                            <BonusDisplay attrBonus={attrBonus} skillBonus={skillBonus} />
                        </div>
                        <div className="ac-card">
                            <FocusSelector focusPool={ad.focusPool} count={ad.focusCount ?? 2} selected={ws.archFocuses ?? []}
                                           onChange={val => patch({ archFocuses: val })}
                                           label="Choisissez vos 2 focuses d'archétype"
                                           takenElsewhere={new Set()} />
                        </div>
                        <div className="ac-card">
                            <div className="ac-section-header">Choisissez 1 talent</div>
                            {ad.talentNote && <p style={{ fontSize: '0.74rem', color: 'var(--ac-muted)', marginBottom: '0.5rem', fontStyle: 'italic' }}>{ad.talentNote}</p>}
                            <div className="flex flex-col gap-3 mt-2">
                                {ad.talentPool.map(tk => (
                                    <TalentCard key={tk} talentKey={tk} selected={ws.archTalent === tk} ws={ws}
                                                onSelect={val => patch({ archTalent: ws.archTalent === val ? null : val })} />
                                ))}
                            </div>
                        </div>
                        {(ad.belongings?.length > 0 || ad.belongingsNote) && (
                            <div className="ac-card">
                                <div className="ac-section-header">Équipement de départ</div>
                                {ad.belongingsNote && <p style={{ fontSize: '0.76rem', color: 'var(--ac-text-muted)', marginBottom: '0.5rem', fontStyle: 'italic' }}>{ad.belongingsNote}</p>}
                                <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                                    {ad.belongings.map((item, i) => <li key={i} style={{ fontSize: '0.78rem', color: 'var(--ac-text)', marginBottom: 2 }}>{item}</li>)}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

// ══════════════════════════════════════════════════════════════════════════════
// ÉTAPE 3 — Nationalité
// ══════════════════════════════════════════════════════════════════════════════

const Step3Nationality = ({ ws, patch }) => {
    const selected = ws.nationality;
    const nd = selected ? NATIONALITIES.find(n => n.key === selected) : null;
    return (
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '1.5rem', alignItems: 'start' }}>
            <div className="flex flex-col gap-2" style={{ position: 'sticky', top: '1rem' }}>
                <div className="ac-section-header">Nationalité</div>
                {NATIONALITIES.map(n => (
                    <button key={n.key} onClick={() => patch({ nationality: n.key, nationalityCustom: '', nationalityLangs: n.languages })} className="text-left transition-all"
                            style={{ padding: '0.5rem 0.75rem', borderRadius: 6, border: `1px solid ${n.key === selected ? 'var(--ac-secondary)' : 'var(--ac-border)'}`, background: n.key === selected ? 'var(--ac-surface-alt)' : 'var(--ac-surface)', cursor: 'pointer' }}>
                        <div style={{ fontFamily: 'var(--ac-font-heading)', fontWeight: 700, fontSize: '0.78rem', color: n.key === selected ? 'var(--ac-secondary)' : 'var(--ac-text)', textTransform: 'uppercase' }}>{n.label}</div>
                        {n.languages.length > 0 && <div style={{ fontSize: '0.67rem', color: 'var(--ac-muted)', marginTop: 1 }}>{n.languages.join(', ')}</div>}
                    </button>
                ))}
            </div>
            <div>
                {!nd ? (
                    <div className="ac-card" style={{ opacity: 0.5 }}><p style={{ color: 'var(--ac-text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '2rem 0' }}>← Sélectionnez une nationalité</p></div>
                ) : (
                    <div className="flex flex-col gap-4">
                        <div className="ac-card" style={{ borderLeft: '4px solid var(--ac-secondary)' }}>
                            <h2 style={{ fontFamily: 'var(--ac-font-heading)', fontWeight: 700, fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--ac-secondary)', margin: '0 0 0.5rem' }}>{nd.label}</h2>
                            <p style={{ fontSize: '0.82rem', color: 'var(--ac-text-muted)', margin: 0, lineHeight: 1.6 }}>{nd.description}</p>
                        </div>
                        <div className="ac-card">
                            <div className="ac-section-header">Langue(s) de départ</div>
                            <p style={{ fontSize: '0.76rem', color: 'var(--ac-text-muted)', marginBottom: '0.5rem' }}>
                                Votre nationalité et votre langue maternelle comptent comme vos deux premières vérités du personnage.
                            </p>
                            {nd.key === 'other' ? (
                                <div className="flex flex-col gap-2">
                                    <div>
                                        <div className="ac-label mb-1">Nationalité personnalisée</div>
                                        <input className="ac-input" value={ws.nationalityCustom ?? ''} onChange={e => patch({ nationalityCustom: e.target.value })} placeholder="Ex : Néo-Zélandais, Espagnol républicain…" />
                                    </div>
                                    <div>
                                        <div className="ac-label mb-1">Langue de départ</div>
                                        <input className="ac-input" value={ws.nationalityLangs?.[0] ?? ''} onChange={e => patch({ nationalityLangs: [e.target.value] })} placeholder="Ex : Anglais, Espagnol…" />
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {nd.languages.map(lang => (
                                        <span key={lang} style={{ padding: '3px 12px', borderRadius: 20, background: 'var(--ac-primary)', color: 'var(--ac-bg)', fontSize: '0.78rem', fontFamily: 'var(--ac-font-heading)', fontWeight: 600 }}>{lang}</span>
                                    ))}
                                </div>
                            )}
                            {nd.languageNote && <p style={{ fontSize: '0.72rem', color: 'var(--ac-muted)', marginTop: '0.5rem', fontStyle: 'italic' }}>{nd.languageNote}</p>}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// ══════════════════════════════════════════════════════════════════════════════
// ÉTAPE 4 — Background
// ══════════════════════════════════════════════════════════════════════════════

// Pool de talents génériques par clé de compétence (Chapitre 6, p.87-96 du livre).
// Clés alignées sur SKILLS + 'fortune'/'weird'/'skill'/'any' (cf. KEYWORD_LABELS).
const TALENT_POOL_BY_SKILL = {
    academia:    ['book_smart','deep_expertise','did_the_reading','dedication','library_dweller','polyglot','studious'],
    athletics:   ['athletic_prodigy','fighting_fit','hail_mary','might_makes_right','sure_footed','serpentine'],
    engineering: ['demolitions','elbow_grease','gunsmith','jury_rig','saboteur','make_do_and_mend'],
    fighting:    ['defensive','five_rounds_rapid','guardian','mean_right_hook','sharpshooter','they_dont_like_it_up_em'],
    medicine:    ['long_term_care','medic','make_do_mend_medicine','out_of_harms_way','reassuring','seen_worse'],
    observation: ['constantly_watching','forward_observer','lights_out','ransack','scout','scrutinise'],
    persuasion:  ['an_answer_for_everything','hog_the_spotlight','imposing_presence','reasoned_discourse','rousing_speaker','subtle_cues'],
    resilience:  ['a_stiff_drink','courageous','dauntless','extra_effort','hard_as_nails','second_wind','tough'],
    stealth:     ['all_the_best_hiding_spots','exploit_weakness','face_in_the_crowd','hit_and_run','like_a_shadow','perfect_timing'],
    survival:    ['companion','dig_for_victory','everything_i_need_is_here','fieldcraft','survive_and_thrive','tracker'],
    tactics:     ['band_of_brothers','call_to_action','convey_intent','decisive_plan','direct','teamwork'],
    vehicles:    ['combat_gunner','drive_all_night','off_road','smuggler','still_in_control','strafing_run'],
    weird:       ['bizarre_insight','foreboding_survival','minor_pact','mystical_power','numb_to_the_horrors','occult_dabbler'],
    // Fortune en keyword secondaire (livre p.87) : seulement ces 2 talents.
    fortune:     ['second_wind','cool_under_pressure'],
    skill:       ['advisor','bold','cautious','cool_under_pressure'],
};

// Accepte un tableau de clés anglaises (relation "ou") et fusionne les pools
// correspondants, sans doublon. 'any' = tous les talents génériques confondus.
function getTalentPoolByKeyword(keys) {
    if (!keys?.length) return [];
    if (keys.includes('any')) {
        return [...new Set(Object.values(TALENT_POOL_BY_SKILL).flat())];
    }
    const merged = new Set();
    for (const key of keys) {
        for (const tk of (TALENT_POOL_BY_SKILL[key] ?? [])) merged.add(tk);
    }
    return [...merged];
}

const Step4Background = ({ ws, patch }) => {
    const bgKeys   = Object.keys(BACKGROUND_DATA);
    const selected = ws.background;
    const bd       = selected ? BACKGROUND_DATA[selected] : null;
    const talentPool = bd ? getTalentPoolByKeyword(bd.talentKeyword) : [];
    const fixedFocusSkill = bd?.focusFixed ? SKILLS.find(s => s.key === bd.focusFixed) : null;
    const focusChoiceSkills = bd?.focusFixedChoice?.map(k => SKILLS.find(s => s.key === k)).filter(Boolean) ?? [];
    // Focuses déjà pris à l'étape archétype — ne peuvent pas être repris
    const takenByArch = new Set(ws.archFocuses ?? []);

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '1.5rem', alignItems: 'start' }}>
            <div style={{ position: 'sticky', top: '1rem' }}>
                <div className="ac-section-header mb-2">Background</div>
                <div className="flex flex-col gap-1" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
                    {bgKeys.map(key => (
                        <button key={key} onClick={() => patch({ background: key, bgFocus: '', bgFocusFree: '', bgTalent: null, bgAttrFree: null, bgSkillsFree: [] })} className="text-left transition-all"
                                style={{ padding: '0.5rem 0.75rem', borderRadius: 6, border: `1px solid ${key === selected ? 'var(--ac-secondary)' : 'var(--ac-border)'}`, background: key === selected ? 'var(--ac-surface-alt)' : 'var(--ac-surface)', cursor: 'pointer' }}>
                            <div style={{ fontFamily: 'var(--ac-font-heading)', fontWeight: 700, fontSize: '0.76rem', color: key === selected ? 'var(--ac-secondary)' : 'var(--ac-text)', textTransform: 'uppercase' }}>{BACKGROUND_DATA[key].label}</div>
                        </button>
                    ))}
                </div>
            </div>
            <div>
                {!bd ? (
                    <div className="ac-card" style={{ opacity: 0.5 }}><p style={{ color: 'var(--ac-text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '2rem 0' }}>← Sélectionnez un background</p></div>
                ) : (
                    <div className="flex flex-col gap-4">
                        <div className="ac-card" style={{ borderLeft: '4px solid var(--ac-secondary)' }}>
                            <h2 style={{ fontFamily: 'var(--ac-font-heading)', fontWeight: 700, fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--ac-secondary)', margin: '0 0 0.5rem' }}>{bd.label}</h2>
                            <p style={{ fontSize: '0.82rem', color: 'var(--ac-text-muted)', margin: 0, lineHeight: 1.6 }}>{bd.description}</p>
                        </div>
                        <div className="ac-card">
                            <div className="ac-section-header">Bonus accordés</div>
                            <BonusDisplay attrBonus={bd.attrBonus} skillBonus={bd.skillBonus} />
                            {bd.attrBonusFree > 0 && <div className="mt-3"><AttrFreeSelect value={ws.bgAttrFree} onChange={val => patch({ bgAttrFree: val })} /></div>}
                            {bd.skillBonusFree > 0 && <div className="mt-3"><SkillFreeSelect count={bd.skillBonusFree} selected={ws.bgSkillsFree ?? []} onChange={val => patch({ bgSkillsFree: val })} noDouble /></div>}
                        </div>
                        <div className="ac-card">
                            <div className="ac-section-header">Focuses de background</div>
                            <div className="flex flex-col gap-3">
                                {fixedFocusSkill && (
                                    <div>
                                        <div className="ac-label mb-1">Focus imposé — {fixedFocusSkill.label}</div>
                                        <div className="flex flex-wrap gap-1">
                                            {fixedFocusSkill.focuses.map(f => {
                                                const fid = `${fixedFocusSkill.key}:${f}`;
                                                const alreadyTaken = takenByArch.has(fid);
                                                return <FocusPill key={fid} label={f} selected={ws.bgFocus === fid}
                                                                  disabled={alreadyTaken && ws.bgFocus !== fid}
                                                                  onToggle={() => { if (!alreadyTaken) patch({ bgFocus: ws.bgFocus === fid ? '' : fid }); }} />;
                                            })}
                                        </div>
                                    </div>
                                )}
                                {focusChoiceSkills.length > 0 && (
                                    <div>
                                        <div className="ac-label mb-1">1er focus — {focusChoiceSkills.map(s => s.label).join(' ou ')}</div>
                                        {focusChoiceSkills.map(skill => (
                                            <div key={skill.key} className="mb-2">
                                                <div style={{ fontSize: '0.7rem', color: 'var(--ac-muted)', marginBottom: 3 }}>{skill.label}</div>
                                                <div className="flex flex-wrap gap-1">
                                                    {skill.focuses.map(f => {
                                                        const fid = `${skill.key}:${f}`;
                                                        const alreadyTaken = takenByArch.has(fid);
                                                        return <FocusPill key={fid} label={f} selected={ws.bgFocus === fid}
                                                                          disabled={alreadyTaken && ws.bgFocus !== fid}
                                                                          onToggle={() => { if (!alreadyTaken) patch({ bgFocus: ws.bgFocus === fid ? '' : fid }); }} />;
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <div>
                                    <div className="ac-label mb-1">Focus libre (n'importe quelle compétence)</div>
                                    {SKILLS.map(skill => (
                                        <div key={skill.key} className="mb-2">
                                            <div style={{ fontSize: '0.7rem', color: 'var(--ac-muted)', marginBottom: 3 }}>{skill.label}</div>
                                            <div className="flex flex-wrap gap-1">
                                                {skill.focuses.map(f => {
                                                    const fid = `${skill.key}:${f}`;
                                                    const alreadyTaken = takenByArch.has(fid) || ws.bgFocus === fid;
                                                    return <FocusPill key={fid} label={f} selected={ws.bgFocusFree === fid}
                                                                      disabled={alreadyTaken && ws.bgFocusFree !== fid}
                                                                      onToggle={() => { if (!alreadyTaken) patch({ bgFocusFree: ws.bgFocusFree === fid ? '' : fid }); }} />;
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="ac-card">
                            <div className="ac-section-header">Choisissez 1 talent <span style={{ color: 'var(--ac-muted)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(keyword : {formatKeywordList(bd.talentKeyword)})</span></div>
                            <div className="flex flex-col gap-3 mt-2">
                                {talentPool.map(tk => (
                                    <TalentCard key={tk} talentKey={tk} selected={ws.bgTalent === tk} ws={ws} onSelect={val => patch({ bgTalent: ws.bgTalent === val ? null : val })} />
                                ))}
                            </div>
                        </div>
                        <div className="ac-card">
                            <div className="ac-section-header">Vérité de background</div>
                            <div className="flex flex-wrap gap-2 mb-3">
                                {bd.truthSuggestions?.map(t => (
                                    <button key={t} onClick={() => patch({ bgTruth: t })}
                                            style={{ padding: '3px 10px', borderRadius: 20, border: `1px solid ${ws.bgTruth === t ? 'var(--ac-secondary)' : 'var(--ac-border)'}`, background: ws.bgTruth === t ? 'var(--ac-secondary)' : 'transparent', color: ws.bgTruth === t ? 'var(--ac-bg)' : 'var(--ac-text)', fontSize: '0.74rem', cursor: 'pointer' }}
                                    >{t}</button>
                                ))}
                            </div>
                            <input className="ac-input" value={ws.bgTruth ?? ''} onChange={e => patch({ bgTruth: e.target.value })} placeholder="Votre vérité personnalisée…" />
                        </div>
                        {bd.belongings && (
                            <div className="ac-card">
                                <div className="ac-section-header">Équipement de départ</div>
                                <p style={{ fontSize: '0.78rem', color: 'var(--ac-text)', marginTop: '0.25rem' }}>{bd.belongings}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

// ══════════════════════════════════════════════════════════════════════════════
// ÉTAPE 5 — Caractéristique
// ══════════════════════════════════════════════════════════════════════════════

const Step5Characteristic = ({ ws, patch }) => {
    const charKeys = Object.keys(CHARACTERISTIC_DATA);
    const selected = ws.characteristic;
    const cd       = selected ? CHARACTERISTIC_DATA[selected] : null;
    const activeChar = cd?.isChoice ? (cd.options[ws.charVariant] ?? null) : cd;
    const talentPool = activeChar ? getTalentPoolByKeyword(activeChar.talentKeyword) : [];

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '1.5rem', alignItems: 'start' }}>
            <div style={{ position: 'sticky', top: '1rem' }}>
                <div className="ac-section-header mb-2">Caractéristique</div>
                <div className="flex flex-col gap-1" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
                    {charKeys.map(key => (
                        <button key={key} onClick={() => patch({ characteristic: key, charTalent: null, charAttrFree: null, charSkillsFree: [], charVariant: null, charSkillChoice: null })} className="text-left transition-all"
                                style={{ padding: '0.5rem 0.75rem', borderRadius: 6, border: `1px solid ${key === selected ? 'var(--ac-secondary)' : 'var(--ac-border)'}`, background: key === selected ? 'var(--ac-surface-alt)' : 'var(--ac-surface)', cursor: 'pointer' }}>
                            <div style={{ fontFamily: 'var(--ac-font-heading)', fontWeight: 700, fontSize: '0.76rem', color: key === selected ? 'var(--ac-secondary)' : 'var(--ac-text)', textTransform: 'uppercase' }}>{CHARACTERISTIC_DATA[key].label}</div>
                        </button>
                    ))}
                </div>
            </div>
            <div>
                {!cd ? (
                    <div className="ac-card" style={{ opacity: 0.5 }}><p style={{ color: 'var(--ac-text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '2rem 0' }}>← Sélectionnez une caractéristique</p></div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {cd.isChoice && (
                            <div className="ac-card" style={{ borderLeft: '4px solid var(--ac-secondary)' }}>
                                <div className="ac-section-header">Choisissez une option</div>
                                <div className="grid grid-cols-2 gap-3 mt-2">
                                    {Object.entries(cd.options).map(([vKey, v]) => (
                                        <button key={vKey} onClick={() => patch({ charVariant: vKey })} className="ac-card-alt text-left"
                                                style={{ border: `1px solid ${ws.charVariant === vKey ? 'var(--ac-secondary)' : 'var(--ac-border)'}`, cursor: 'pointer' }}>
                                            <div style={{ fontFamily: 'var(--ac-font-heading)', fontWeight: 700, fontSize: '0.78rem', color: ws.charVariant === vKey ? 'var(--ac-secondary)' : 'var(--ac-text)' }}>{v.label}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div className="ac-card" style={{ borderLeft: '4px solid var(--ac-secondary)' }}>
                            <h2 style={{ fontFamily: 'var(--ac-font-heading)', fontWeight: 700, fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--ac-secondary)', margin: '0 0 0.5rem' }}>{activeChar?.label ?? cd.label}</h2>
                            <p style={{ fontSize: '0.82rem', color: 'var(--ac-text-muted)', margin: 0, lineHeight: 1.6 }}>{cd.description}</p>
                        </div>
                        {activeChar && (
                            <>
                                <div className="ac-card">
                                    <div className="ac-section-header">Bonus accordés</div>
                                    <BonusDisplay attrBonus={activeChar.attrBonus} skillBonus={activeChar.skillBonus} />
                                    {activeChar.specialRule === 'dilettante' && <p style={{ fontSize: '0.76rem', color: 'var(--ac-secondary)', marginTop: '0.5rem', fontWeight: 600 }}>Règle spéciale : toutes les compétences actuellement à 0 passent à rang 1.</p>}
                                    {activeChar.attrBonusFree > 0 && <div className="mt-3"><AttrFreeSelect value={ws.charAttrFree} onChange={val => patch({ charAttrFree: val })} /></div>}
                                    {activeChar.skillBonusFree > 0 && !activeChar.specialRule && (
                                        <div className="mt-3">
                                            <SkillFreeSelect count={activeChar.skillBonusFree} selected={ws.charSkillsFree ?? []} onChange={val => patch({ charSkillsFree: val })} exclude={activeChar.skillExclude ?? []} noDouble />
                                        </div>
                                    )}
                                    {activeChar.skillBonusChoice?.length > 0 && (
                                        <div className="mt-3">
                                            <div className="ac-label mb-1">+1 à l'une de ces compétences</div>
                                            <div className="flex flex-wrap gap-2">
                                                {activeChar.skillBonusChoice.map(sk => {
                                                    const s = SKILLS.find(x => x.key === sk);
                                                    return (
                                                        <button key={sk} onClick={() => patch({ charSkillChoice: sk })}
                                                                style={{ padding: '3px 10px', borderRadius: 20, cursor: 'pointer', border: `1px solid ${ws.charSkillChoice === sk ? 'var(--ac-secondary)' : 'var(--ac-border)'}`, background: ws.charSkillChoice === sk ? 'var(--ac-secondary)' : 'transparent', color: ws.charSkillChoice === sk ? 'var(--ac-bg)' : 'var(--ac-text)', fontSize: '0.74rem' }}
                                                        >{s?.label ?? sk}</button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="ac-card">
                                    <div className="ac-section-header">Choisissez 1 talent <span style={{ color: 'var(--ac-muted)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(keyword : {formatKeywordList(activeChar.talentKeyword)})</span></div>
                                    <div className="flex flex-col gap-3 mt-2">
                                        {talentPool.slice(0, 6).map(tk => (
                                            <TalentCard key={tk} talentKey={tk} selected={ws.charTalent === tk} ws={ws} onSelect={val => patch({ charTalent: ws.charTalent === val ? null : val })} />
                                        ))}
                                    </div>
                                </div>
                                <div className="ac-card">
                                    <div className="ac-section-header">Vérité de caractéristique</div>
                                    <div className="flex gap-2 mb-2">
                                        <button onClick={() => patch({ charTruth: activeChar.truthDefault })}
                                                style={{ padding: '3px 10px', borderRadius: 20, cursor: 'pointer', border: `1px solid ${ws.charTruth === activeChar.truthDefault ? 'var(--ac-secondary)' : 'var(--ac-border)'}`, background: ws.charTruth === activeChar.truthDefault ? 'var(--ac-secondary)' : 'transparent', color: ws.charTruth === activeChar.truthDefault ? 'var(--ac-bg)' : 'var(--ac-text)', fontSize: '0.74rem' }}
                                        >{activeChar.truthDefault}</button>
                                    </div>
                                    <input className="ac-input" value={ws.charTruth ?? ''} onChange={e => patch({ charTruth: e.target.value })} placeholder="Votre vérité personnalisée…" />
                                </div>
                                {activeChar.belongings && (
                                    <div className="ac-card">
                                        <div className="ac-section-header">Équipement de départ</div>
                                        <p style={{ fontSize: '0.78rem', color: 'var(--ac-text)', marginTop: '0.25rem' }}>{activeChar.belongings}</p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

// ══════════════════════════════════════════════════════════════════════════════
// ÉTAPE 6 — Magie (conditionnelle)
// ══════════════════════════════════════════════════════════════════════════════

const Step6Magic = ({ ws, patch, attrs }) => {
    const spellcasterTalentKey = detectSpellcasterTalent(ws);
    const talentLabel          = spellcasterTalentKey ? TALENTS[spellcasterTalentKey]?.label : '—';

    // Pratique choisie LIBREMENT par le joueur — indépendante du talent précis pris
    const practice       = ws.spellcasterPractice ?? null;
    const isDabbler       = practice === 'dabbler';
    const castAttr        = practice ? getCastAttribute(practice) : null;
    const castAttrValue   = castAttr ? (attrs[castAttr] ?? ATTR_BASE) : 0;
    const powerRating      = practice ? getPowerRating(practice) : 0;
    const bonusDice        = practice ? getBonusPowerDice(castAttrValue) : 0;
    const totalDice        = powerRating + bonusDice;
    const startingSpells   = practice ? getStartingSpellCount(practice) : 0;
    const accessibleTraditions = practice ? getAccessibleTraditions(practice) : [];

    const TRADITION_INFO = {
        celtic:  { label: 'Celtique',  desc: 'Druides et femmes sages celtes. Magie animiste, protection et forces naturelles destructrices.' },
        runic:   { label: 'Runique',   desc: 'Voyants et tisserands de runes nordiques et germaniques. Magie de guerre et de divination.' },
        psychic: { label: 'Psychique', desc: 'Pouvoirs de l\'esprit — ESP, télékinésie, perception extra-sensorielle. Pas de tradition formelle, juste un don brut.' },
    };

    // Sorts disponibles : si une seule tradition accessible (Traditionnaliste), on l'impose ;
    // sinon le joueur choisit parmi les traditions accessibles à sa pratique.
    const availableSpells = useMemo(() => {
        if (!ws.spellTradition) return [];
        return SPELLS[ws.spellTradition] ?? [];
    }, [ws.spellTradition]);

    const selectedSpells = ws.selectedSpells ?? [];
    const maxSpells = isDabbler && ws.dabblerMode === 'two_flawed' ? 2 : startingSpells;

    const toggleSpell = (key) => {
        if (selectedSpells.includes(key)) {
            patch({ selectedSpells: selectedSpells.filter(k => k !== key) });
        } else if (selectedSpells.length < maxSpells) {
            patch({ selectedSpells: [...selectedSpells, key] });
        }
    };

    const selectPractice = (p) => {
        // Changer de pratique réinitialise tradition + sorts sélectionnés (cohérence)
        patch({ spellcasterPractice: p, spellTradition: null, dabblerMode: null, selectedSpells: [] });
    };

    const castAttrLabel = castAttr ? (ATTR_LABEL[castAttr] ?? castAttr) : '—';

    return (
        <div className="flex flex-col gap-6">
            {/* ── Talent déclencheur (information) ── */}
            <div className="ac-card" style={{ borderLeft: '4px solid var(--ac-secondary)' }}>
                <div className="ac-section-header">Accès à la magie</div>
                <p style={{ fontSize: '0.78rem', color: 'var(--ac-text-muted)', margin: '0.5rem 0' }}>
                    Talent déclencheur : <strong style={{ color: 'var(--ac-secondary)' }}>{talentLabel}</strong>.
                    Choisissez librement votre pratique ci-dessous — elle détermine votre attribut de cast et les traditions accessibles, indépendamment du talent précis pris.
                </p>
            </div>

            {/* ── Choix de la pratique ── */}
            <div className="ac-card">
                <div className="ac-section-header">Pratique</div>
                <div className="flex gap-3 mt-2">
                    {SPELLCASTER_PRACTICES.map(p => (
                        <button key={p.key} onClick={() => selectPractice(p.key)}
                                className="ac-card-alt text-left flex-1 transition-all"
                                style={{ border: `2px solid ${practice === p.key ? 'var(--ac-secondary)' : 'var(--ac-border)'}`, cursor: 'pointer' }}>
                            <div style={{ fontFamily: 'var(--ac-font-heading)', fontWeight: 700, fontSize: '0.85rem', color: practice === p.key ? 'var(--ac-secondary)' : 'var(--ac-text)', textTransform: 'uppercase', marginBottom: 4 }}>{p.label}</div>
                            <p style={{ fontSize: '0.72rem', color: 'var(--ac-text-muted)', margin: 0 }}>
                                Attribut : {ATTR_LABEL[p.attribute]} · {p.startingSpells} sort{p.startingSpells > 1 ? 's' : ''} de départ
                            </p>
                        </button>
                    ))}
                </div>
            </div>

            {practice && (
                <>
                    {/* ── Puissance ── */}
                    <div className="ac-card">
                        <div className="ac-section-header">Puissance & Power Rating</div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginTop: '0.5rem' }}>
                            <div className="ac-card-alt" style={{ textAlign: 'center', padding: '0.75rem' }}>
                                <div className="ac-label">Power Rating (manteau)</div>
                                <div style={{ fontFamily: 'var(--ac-font-title)', fontSize: '2rem', fontWeight: 700, color: 'var(--ac-secondary)' }}>{powerRating}</div>
                                <div style={{ fontSize: '0.65rem', color: 'var(--ac-muted)', fontFamily: 'var(--ac-font-heading)' }}>Sorts max dans le manteau</div>
                            </div>
                            <div className="ac-card-alt" style={{ textAlign: 'center', padding: '0.75rem' }}>
                                <div className="ac-label">Dés de base</div>
                                <div style={{ fontFamily: 'var(--ac-font-title)', fontSize: '2rem', fontWeight: 700, color: 'var(--ac-primary)' }}>{powerRating}⚄</div>
                                <div style={{ fontSize: '0.65rem', color: 'var(--ac-muted)', fontFamily: 'var(--ac-font-heading)' }}>+ {bonusDice}⚄ bonus ({castAttrLabel} {castAttrValue})</div>
                            </div>
                            <div className="ac-card-alt" style={{ textAlign: 'center', padding: '0.75rem' }}>
                                <div className="ac-label">Total dés Challenge</div>
                                <div style={{ fontFamily: 'var(--ac-font-title)', fontSize: '2rem', fontWeight: 700, color: 'var(--ac-accent)' }}>{totalDice}⚄</div>
                                <div style={{ fontSize: '0.65rem', color: 'var(--ac-muted)', fontFamily: 'var(--ac-font-heading)' }}>Coût du sort</div>
                            </div>
                        </div>
                    </div>

                    {/* ── Objet fétiche ── */}
                    <div className="ac-card">
                        <div className="ac-section-header">Manteau / Objet fétiche</div>
                        <p style={{ fontSize: '0.76rem', color: 'var(--ac-text-muted)', marginBottom: '0.5rem' }}>
                            Tout lanceur de sorts possède un objet physique qui sert de focus pour ses sorts liés — baguette, pierre runique, sigil tatoué, poupée de tissu, bouteille de sorcière…
                        </p>
                        <input className="ac-input" value={ws.spellMantle ?? ''} onChange={e => patch({ spellMantle: e.target.value })} placeholder="Décrivez votre manteau ou objet fétiche (optionnel)…" />
                    </div>

                    {/* ── Tradition — filtrée selon la pratique ── */}
                    <div className="ac-card">
                        <div className="ac-section-header">Tradition magique</div>
                        <p style={{ fontSize: '0.76rem', color: 'var(--ac-text-muted)', marginBottom: '0.75rem' }}>
                            Traditions accessibles à votre pratique ({SPELLCASTER_PRACTICES.find(p => p.key === practice)?.label}).
                        </p>
                        <div className="flex gap-3">
                            {accessibleTraditions.map(trad => {
                                const info = TRADITION_INFO[trad];
                                if (!info) return null;
                                return (
                                    <button key={trad} onClick={() => patch({ spellTradition: trad, selectedSpells: [] })}
                                            className="ac-card-alt text-left flex-1 transition-all"
                                            style={{ border: `2px solid ${ws.spellTradition === trad ? 'var(--ac-secondary)' : 'var(--ac-border)'}`, cursor: 'pointer' }}>
                                        <div style={{ fontFamily: 'var(--ac-font-heading)', fontWeight: 700, fontSize: '0.85rem', color: ws.spellTradition === trad ? 'var(--ac-secondary)' : 'var(--ac-text)', textTransform: 'uppercase', marginBottom: 4 }}>{info.label}</div>
                                        <p style={{ fontSize: '0.74rem', color: 'var(--ac-text-muted)', margin: 0, lineHeight: 1.5 }}>{info.desc}</p>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* ── Mode Amateur : 1 normal vs 2 imparfaits ── */}
                    {isDabbler && (
                        <div className="ac-card">
                            <div className="ac-section-header">Mode d'apprentissage</div>
                            <p style={{ fontSize: '0.76rem', color: 'var(--ac-text-muted)', marginBottom: '0.75rem' }}>
                                Les Amateurs apprennent leurs sorts de sources douteuses. Vous pouvez choisir 1 sort maîtrisé ou 2 sorts imparfaits (plus dangereux, moins contrôlables).
                            </p>
                            <div className="flex gap-3">
                                {[
                                    { key: 'one_normal', label: '1 sort normal',      desc: 'Maîtrisé, pleinement sous contrôle.' },
                                    { key: 'two_flawed', label: '2 sorts imparfaits', desc: 'Flawed — complication automatique à chaque lancer, pas de Momentum.' },
                                ].map(m => (
                                    <button key={m.key} onClick={() => patch({ dabblerMode: m.key, selectedSpells: [] })}
                                            className="ac-card-alt text-left flex-1 transition-all"
                                            style={{ border: `2px solid ${ws.dabblerMode === m.key ? 'var(--ac-secondary)' : 'var(--ac-border)'}`, cursor: 'pointer' }}>
                                        <div style={{ fontFamily: 'var(--ac-font-heading)', fontWeight: 700, fontSize: '0.82rem', color: ws.dabblerMode === m.key ? 'var(--ac-secondary)' : 'var(--ac-text)', marginBottom: 4 }}>{m.label}</div>
                                        <p style={{ fontSize: '0.74rem', color: 'var(--ac-text-muted)', margin: 0 }}>{m.desc}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ── Sélection des sorts ── */}
                    {ws.spellTradition && (!isDabbler || ws.dabblerMode) && (
                        <div className="ac-card">
                            <div className="ac-section-header">
                                Sorts de départ
                                <span style={{ marginLeft: '0.5rem', fontSize: '0.65rem', color: selectedSpells.length >= maxSpells ? 'var(--ac-success)' : 'var(--ac-muted)', fontWeight: 700 }}>
                                    {selectedSpells.length}/{maxSpells}
                                </span>
                            </div>
                            <div className="flex flex-col gap-3 mt-2">
                                {availableSpells.map(spell => (
                                    <SpellCard key={spell.key} spell={spell}
                                               selected={selectedSpells.includes(spell.key)}
                                               flawed={isDabbler && ws.dabblerMode === 'two_flawed'}
                                               onSelect={toggleSpell} />
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

// ══════════════════════════════════════════════════════════════════════════════
// ÉTAPE 7 — Finishing Touches (identité + récap + validation)
// ══════════════════════════════════════════════════════════════════════════════

const Step7FinishingTouches = ({ ws, patch }) => {
    const { attrs, skills } = useMemo(() => computeFinalValues(ws), [ws]);
    const attrArray  = ATTRIBUTES.map(a => ({ key: a.key, value: attrs[a.key] ?? ATTR_BASE }));
    const skillArray = SKILLS.map(s     => ({ key: s.key, rank: skills[s.key] ?? 0 }));
    const attrSum    = attrArray.reduce((acc, a) => acc + a.value, 0);
    const skillSum   = skillArray.reduce((acc, s) => acc + s.rank, 0);
    const stress     = computeStress(attrArray, skillArray);
    const armour     = computeArmour(attrArray);
    const courage    = computeCourage(attrArray);
    const bonusLang  = getBonusLanguages(attrArray);
    const attrOk     = attrSum === TARGET_ATTR_SUM && attrArray.every(a => a.value >= ATTR_MIN && a.value <= ATTR_MAX);
    const skillOk    = skillSum === TARGET_SKILL_SUM;
    const baseLangs  = (ws.nationalityLangs ?? []).filter(Boolean);

    return (
        <div className="flex flex-col gap-6">
            <div className="ac-card">
                <div className="ac-section-header">Identité du personnage</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginTop: '0.5rem' }}>
                    <FieldRow label="Prénom *"><input className="ac-input" value={ws.prenom ?? ''} onChange={e => patch({ prenom: e.target.value })} placeholder="Prénom…" /></FieldRow>
                    <FieldRow label="Nom *"><input className="ac-input" value={ws.nom ?? ''} onChange={e => patch({ nom: e.target.value })} placeholder="Nom…" /></FieldRow>
                    <FieldRow label="Nom du joueur *"><input className="ac-input" value={ws.playerName ?? ''} onChange={e => patch({ playerName: e.target.value })} placeholder="Votre prénom…" /></FieldRow>
                    <FieldRow label="Grade / Rang"><input className="ac-input" value={ws.rank ?? ''} onChange={e => patch({ rank: e.target.value })} placeholder="Ex : Sergeant, Dr., Agent…" /></FieldRow>
                    <FieldRow label="Sexe"><input className="ac-input" value={ws.sexe ?? ''} onChange={e => patch({ sexe: e.target.value })} placeholder="Optionnel…" /></FieldRow>
                    <FieldRow label="Âge"><input className="ac-input" type="number" min={16} max={80} value={ws.age ?? ''} onChange={e => patch({ age: e.target.value })} placeholder="Ex : 28" /></FieldRow>
                </div>
                <div style={{ marginTop: '0.75rem' }}>
                    <FieldRow label="Biographie">
                        <textarea className="ac-input" rows={4} value={ws.biography ?? ''} onChange={e => patch({ biography: e.target.value })}
                                  placeholder="Qui êtes-vous ? Qu'est-ce qui vous a amené dans la Guerre Secrète ?"
                                  style={{ resize: 'vertical', fontFamily: 'var(--ac-font-title)', fontSize: '0.82rem' }} />
                    </FieldRow>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="ac-card">
                    <div className="ac-section-header">
                        Attributs finaux
                        <span style={{ marginLeft: '0.5rem', fontSize: '0.65rem', color: attrOk ? 'var(--ac-success)' : 'var(--ac-accent)', fontWeight: 700 }}>
                            {attrOk ? `✓ Total : ${attrSum}` : `⚠ Total : ${attrSum} / ${TARGET_ATTR_SUM}`}
                        </span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginTop: '0.5rem' }}>
                        {attrArray.map(a => {
                            const inRange = a.value >= ATTR_MIN && a.value <= ATTR_MAX;
                            return (
                                <div key={a.key} className="ac-card-alt" style={{ padding: '0.4rem 0.6rem', border: `1px solid ${!inRange ? 'var(--ac-accent)' : 'var(--ac-border)'}` }}>
                                    <div className="ac-label">{ATTR_LABEL[a.key]}</div>
                                    <div style={{ fontFamily: 'var(--ac-font-title)', fontSize: '1.3rem', fontWeight: 700, color: inRange ? 'var(--ac-secondary)' : 'var(--ac-accent)' }}>{a.value}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
                <div className="ac-card">
                    <div className="ac-section-header">
                        Compétences
                        <span style={{ marginLeft: '0.5rem', fontSize: '0.65rem', color: skillOk ? 'var(--ac-success)' : 'var(--ac-accent)', fontWeight: 700 }}>
                            {skillOk ? `✓ Total : ${skillSum}` : `⚠ Total : ${skillSum} / ${TARGET_SKILL_SUM}`}
                        </span>
                    </div>
                    <div style={{ marginTop: '0.5rem' }}>
                        {skillArray.filter(s => s.rank > 0).map(s => (
                            <div key={s.key} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.2rem 0.4rem', borderBottom: '1px solid var(--ac-border)' }}>
                                <span style={{ fontSize: '0.78rem', fontFamily: 'var(--ac-font-heading)', color: 'var(--ac-text)' }}>{SKILL_LABEL[s.key]}</span>
                                <span style={{ fontFamily: 'var(--ac-font-title)', fontWeight: 700, color: 'var(--ac-secondary)' }}>{s.rank}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="ac-card">
                <div className="ac-section-header">Résistances calculées automatiquement</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginTop: '0.5rem' }}>
                    {[
                        { label: 'Stress',  value: stress,  note: 'max(Force, Volonté) + Résilience', color: 'var(--ac-accent)' },
                        { label: 'Armure',  value: armour,  note: 'Basé sur Force',                   color: 'var(--ac-secondary)' },
                        { label: 'Courage', value: courage, note: 'Basé sur Volonté',                 color: 'var(--ac-primary)' },
                    ].map(item => (
                        <div key={item.label} className="ac-card-alt" style={{ textAlign: 'center', padding: '0.75rem' }}>
                            <div className="ac-label">{item.label}</div>
                            <div style={{ fontFamily: 'var(--ac-font-title)', fontSize: '2rem', fontWeight: 700, color: item.color }}>{item.value}</div>
                            <div style={{ fontSize: '0.65rem', color: 'var(--ac-muted)', fontFamily: 'var(--ac-font-heading)', marginTop: 2 }}>{item.note}</div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="ac-card">
                <div className="ac-section-header">Vérités personnelles & Cicatrices</div>
                <p style={{ fontSize: '0.76rem', color: 'var(--ac-text-muted)', marginBottom: '0.5rem' }}>
                    Vos vérités de background et de caractéristique sont pré-remplies. Les deux cases restantes sont libres.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                    {[
                        { key: 'truth_bg',     label: 'Vérité — Background',       value: ws.bgTruth ?? '',    fixed: true  },
                        { key: 'truth_char',   label: 'Vérité — Caractéristique',  value: ws.charTruth ?? '', fixed: true  },
                        { key: 'truth_extra1', label: 'Vérité supplémentaire 1',   value: ws.truths?.[0] ?? '', fixed: false },
                        { key: 'truth_extra2', label: 'Vérité supplémentaire 2',   value: ws.truths?.[1] ?? '', fixed: false },
                    ].map(t => (
                        <div key={t.key}>
                            <div className="ac-label mb-0.5">{t.label}</div>
                            <input className="ac-input" value={t.value} readOnly={t.fixed}
                                   onChange={!t.fixed ? (e => { const next = [...(ws.truths ?? ['', ''])]; next[t.key === 'truth_extra1' ? 0 : 1] = e.target.value; patch({ truths: next }); }) : undefined}
                                   style={{ opacity: t.fixed ? 0.7 : 1 }} />
                        </div>
                    ))}
                </div>
            </div>

            <div className="ac-card">
                <div className="ac-section-header">Langues</div>
                <p style={{ fontSize: '0.74rem', color: 'var(--ac-text-muted)', marginBottom: '0.5rem' }}>
                    Langue(s) de départ selon votre nationalité{bonusLang > 0 && <span style={{ color: 'var(--ac-secondary)', fontWeight: 600 }}> + {bonusLang} langue{bonusLang > 1 ? 's' : ''} bonus (Raisonnement {attrs['reason'] ?? 6})</span>}.
                </p>
                <div className="flex flex-wrap gap-2 mb-3">
                    {baseLangs.map(lang => (
                        <span key={lang} style={{ padding: '3px 12px', borderRadius: 20, background: 'var(--ac-primary)', color: 'var(--ac-bg)', fontSize: '0.78rem', fontFamily: 'var(--ac-font-heading)', fontWeight: 600 }}>{lang}</span>
                    ))}
                </div>
                {Array.from({ length: Math.max(1, bonusLang + (ws.extraLangs?.length ?? 0) + 1) }).map((_, i) => (
                    <div key={i} className="mb-1">
                        <input className="ac-input" value={ws.extraLangs?.[i] ?? ''}
                               onChange={e => { const next = [...(ws.extraLangs ?? [])]; next[i] = e.target.value; patch({ extraLangs: next }); }}
                               placeholder={i < bonusLang ? `Langue bonus ${i + 1}…` : 'Langue supplémentaire…'} style={{ fontSize: '0.8rem' }} />
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="ac-card">
                    <div className="ac-section-header">Talents (3)</div>
                    {[ws.archTalent, ws.bgTalent, ws.charTalent].map((tk, i) => {
                        const t = tk ? TALENTS[tk] : null;
                        return (
                            <div key={i} style={{ padding: '0.4rem 0', borderBottom: '1px solid var(--ac-border)' }}>
                                {t ? (
                                    <div>
                                        <span style={{ fontFamily: 'var(--ac-font-heading)', fontWeight: 700, fontSize: '0.78rem', color: 'var(--ac-text)', textTransform: 'uppercase' }}>{t.label}</span>
                                        <div style={{ fontSize: '0.67rem', color: 'var(--ac-muted)' }}>{t.keywords.join(', ')}</div>
                                    </div>
                                ) : <span style={{ fontSize: '0.78rem', color: 'var(--ac-muted)' }}>— Non sélectionné</span>}
                            </div>
                        );
                    })}
                </div>
                <div className="ac-card">
                    <div className="ac-section-header">Choix du wizard</div>
                    <div style={{ fontSize: '0.78rem', lineHeight: 1.7 }}>
                        <div><span className="ac-label">Archétype : </span>{ARCHETYPE_DATA[ws.archetype]?.labelFr ?? '—'}</div>
                        <div><span className="ac-label">Nationalité : </span>{NATIONALITIES.find(n => n.key === ws.nationality)?.label ?? ws.nationalityCustom ?? '—'}</div>
                        <div><span className="ac-label">Background : </span>{BACKGROUND_DATA[ws.background]?.label ?? '—'}</div>
                        <div><span className="ac-label">Caractéristique : </span>{CHARACTERISTIC_DATA[ws.characteristic]?.label ?? '—'}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ══════════════════════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ══════════════════════════════════════════════════════════════════════════════

const Creation = ({ darkMode, onToggleDarkMode }) => {
    const { apiBase, slug } = useSystem();
    const navigate          = useNavigate();

    const [step,       setStep]       = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const [error,      setError]      = useState('');
    const [accessCode, setAccessCode] = useState(null);
    const [accessUrl,  setAccessUrl]  = useState(null);

    const [ws, setWs] = useState({
        archetype: null, occultistVariant: 'A', archFocuses: [], archTalent: null,
        nationality: null, nationalityCustom: '', nationalityLangs: [],
        background: null, bgFocus: '', bgFocusFree: '', bgTalent: null, bgTruth: '', bgAttrFree: null, bgSkillsFree: [],
        characteristic: null, charVariant: null, charTalent: null, charTruth: '', charAttrFree: null, charSkillsFree: [], charSkillChoice: null,
        // Magie
        spellTradition: null, dabblerMode: 'one_normal', selectedSpells: [], spellMantle: '',
        // Identité
        playerName: '', prenom: '', nom: '', rank: '', sexe: '', age: '', biography: '',
        truths: ['', ''], extraLangs: [],
    });

    const patch = useCallback((partial) => setWs(prev => ({ ...prev, ...partial })), []);

    // ── Steps dynamiques selon présence d'un talent Spellcaster ──────────────
    const isSpellcaster = useMemo(() => !!detectSpellcasterTalent(ws), [ws.archTalent, ws.bgTalent, ws.charTalent]);

    const steps = useMemo(() => {
        if (isSpellcaster) return BASE_STEPS;
        // Sans magie : on retire l'étape 6 et on renumérote
        return BASE_STEPS
            .filter(s => s.id !== 6)
            .map((s, i) => ({ ...s, id: i + 1 }));
    }, [isSpellcaster]);

    // Mapping step visuel → step réel (avec ou sans magie)
    // step 6 dans BASE_STEPS = Magie, step 7 = Identité
    // Sans magie step 6 = Identité
    const totalSteps = steps.length;

    // Attrs calculés pour l'étape magie
    const { attrs } = useMemo(() => computeFinalValues(ws), [ws.archetype, ws.occultistVariant, ws.background, ws.bgAttrFree, ws.bgSkillsFree, ws.characteristic, ws.charVariant, ws.charAttrFree, ws.charSkillsFree]);

    // ── Validation par étape ─────────────────────────────────────────────────
    const canAdvance = useMemo(() => {
        // Retrouver le "vrai" id de l'étape courante
        const currentStepDef = steps[step - 1];
        const realId = currentStepDef?.id ?? step;

        switch (realId) {
            case 1: return true;
            case 2: return ws.archetype && (ws.archFocuses?.length ?? 0) >= 2 && ws.archTalent;
            case 3: return ws.nationality && (ws.nationality !== 'other' || ws.nationalityCustom?.trim());
            case 4: {
                if (!ws.background || !ws.bgTalent) return false;
                const bd = BACKGROUND_DATA[ws.background];
                if (!bd) return false;
                const hasPrimaryFocus = (bd.focusFixed || bd.focusFixedChoice) ? !!ws.bgFocus : true;
                if (bd.attrBonusFree > 0 && !ws.bgAttrFree) return false;
                if (bd.skillBonusFree > 0 && (ws.bgSkillsFree?.filter(Boolean).length ?? 0) < bd.skillBonusFree) return false;
                return hasPrimaryFocus && !!ws.bgFocusFree && !!ws.bgTruth?.trim();
            }
            case 5: {
                if (!ws.characteristic || !ws.charTalent) return false;
                const cd = CHARACTERISTIC_DATA[ws.characteristic];
                if (!cd) return false;
                const activeChar = cd.isChoice ? cd.options[ws.charVariant] : cd;
                if (!activeChar) return false;
                if (cd.isChoice && !ws.charVariant) return false;
                if (activeChar.attrBonusFree > 0 && !ws.charAttrFree) return false;
                if (activeChar.skillBonusFree > 0 && !activeChar.specialRule && (ws.charSkillsFree?.filter(Boolean).length ?? 0) < activeChar.skillBonusFree) return false;
                return !!ws.charTruth?.trim();
            }
            case 6: { // Magie (seulement si isSpellcaster)
                if(isSpellcaster) {
                    const practice = ws.spellcasterPractice;
                    if (!practice) return false;
                    const isDabbler = practice === 'dabbler';
                    if (!ws.spellTradition) return false;
                    if (isDabbler && !ws.dabblerMode) return false;
                    const maxSpells = isDabbler && ws.dabblerMode === 'two_flawed' ? 2 : getStartingSpellCount(practice);
                    return (ws.selectedSpells?.length ?? 0) >= maxSpells;
                } else {
                    return ws.playerName?.trim() && ws.nom?.trim() && ws.prenom?.trim();
                }
            }
            case 7: return ws.playerName?.trim() && ws.nom?.trim() && ws.prenom?.trim();
            default: return true;
        }
    }, [step, steps, ws]);

    // ── Soumission ────────────────────────────────────────────────────────────
    const handleSubmit = async () => {
        setSubmitting(true);
        setError('');

        const { attrs: finalAttrs, skills: finalSkills } = computeFinalValues(ws);

        const attributes = ATTRIBUTES.map(a => ({
            key: a.key, value: finalAttrs[a.key] ?? ATTR_BASE,
            bonusDamage: getBonusDamage(finalAttrs[a.key] ?? ATTR_BASE),
        }));

        const skillArray = SKILLS.map(s => ({ key: s.key, rank: finalSkills[s.key] ?? 0, focus: '' }));
        const allFocuses = [...(ws.archFocuses ?? []), ws.bgFocus ? [ws.bgFocus] : [], ws.bgFocusFree ? [ws.bgFocusFree] : []].flat().filter(Boolean);
        const skillsWithFocuses = skillArray.map(s => {
            const myFocuses = allFocuses.filter(f => f.startsWith(s.key + ':')).map(f => f.split(':')[1]);
            return { ...s, focus: myFocuses.join(', ') };
        });

        const talents = [ws.archTalent, ws.bgTalent, ws.charTalent].filter(Boolean).map(tk => {
            const t = TALENTS[tk] ?? {};
            return { name: t.label ?? tk, keywords: (t.keywords ?? []).join(', '), effect: t.description ?? '' };
        });

        const adData     = ws.archetype      ? ARCHETYPE_DATA[ws.archetype]      : null;
        const bdData     = ws.background     ? BACKGROUND_DATA[ws.background]    : null;
        const activeChar = ws.characteristic
            ? (CHARACTERISTIC_DATA[ws.characteristic]?.isChoice ? CHARACTERISTIC_DATA[ws.characteristic]?.options?.[ws.charVariant] : CHARACTERISTIC_DATA[ws.characteristic])
            : null;

        const items = [
            ...(adData?.belongings ?? []).map(name => ({ name, description: 'Équipement d\'archétype', effect: '' })),
            ...(bdData?.belongings  ? [{ name: bdData.belongings,  description: 'Équipement de background', effect: '' }] : []),
            ...(activeChar?.belongings ? [{ name: activeChar.belongings, description: 'Équipement de caractéristique', effect: '' }] : []),
        ];

        // Sorts
        const spellcasterTk = detectSpellcasterTalent(ws);
        const practice      = ws.spellcasterPractice ?? null;
        const isDabbler      = practice === 'dabbler';
        const isFlawed       = isDabbler && ws.dabblerMode === 'two_flawed';
        const allSpellsList  = [...(SPELLS.celtic ?? []), ...(SPELLS.runic ?? []), ...(SPELLS.psychic ?? [])];

        // Calcul de la puissance (power rating) à persister
        const castAttr      = practice ? getCastAttribute(practice) : null;
        const castAttrValue = castAttr ? (finalAttrs[castAttr] ?? ATTR_BASE) : 0;
        const powerValue    = spellcasterTk && practice
            ? getPowerRating(practice) + getBonusPowerDice(castAttrValue)
            : 0;

        const spells = (ws.selectedSpells ?? []).map(key => {
            const sp = allSpellsList.find(s => s.key === key) ?? {};
            const tradition = SPELLS.celtic.some(s => s.key === key)  ? 'celtic'
                : SPELLS.runic.some(s => s.key === key)   ? 'runic'
                    : SPELLS.psychic.some(s => s.key === key) ? 'psychic'
                        : null;
            return {
                name:           sp.label      ?? key,
                skillUsed:      sp.skill      ?? '',
                difficulty:     sp.difficulty ?? 0,
                cost:           sp.cost       ?? '',
                duration:       sp.duration   ?? '',
                effect:         sp.effect     ?? '',
                momentumSpends: '',
                spellKey:       key,
                tradition,
                flawed:         isFlawed,
            };
        });

        const languages = [...(ws.nationalityLangs ?? []).filter(Boolean), ...(ws.extraLangs ?? []).filter(Boolean)];
        const nationalityLabel = ws.nationality === 'other' ? ws.nationalityCustom : NATIONALITIES.find(n => n.key === ws.nationality)?.label ?? '';

        const payload = {
            playerName: ws.playerName.trim(), nom: ws.nom.trim(), prenom: ws.prenom.trim(),
            sexe: ws.sexe ?? '', age: ws.age ? parseInt(ws.age) : null,
            rank: ws.rank ?? '', nationality: nationalityLabel, biography: ws.biography ?? '',
            archetype: ws.archetype ?? '', background: ws.background ?? '', characteristic: ws.characteristic ?? '',
            truths: [ws.bgTruth ?? '', ws.charTruth ?? '', ...(ws.truths ?? [])].filter(Boolean),
            languages, attributes, skills: skillsWithFocuses, talents, items, weapons: [],
            spells, isSpellcaster: !!spellcasterTk,
            power:               powerValue,
            spellcasterPractice: practice,
            spellTradition:      ws.spellTradition ?? null,
            spellMantle:          ws.spellMantle ?? '',
        };

        try {
            const res = await fetch(`${apiBase}/characters`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
            });
            if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.error ?? 'Erreur lors de la création'); }
            const char = await res.json();
            setAccessCode(char.accessCode);
            setAccessUrl(char.accessUrl);
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    // ── Écran post-création ───────────────────────────────────────────────────
    if (accessCode) {
        return (
            <div className="min-h-screen bg-default text-default flex items-center justify-center p-4">
                <div className="ac-card" style={{ maxWidth: 420, width: '100%', textAlign: 'center' }}>
                    <div style={{ fontFamily: 'var(--ac-font-heading)', fontSize: '1.1rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ac-secondary)', marginBottom: '1rem' }}>✓ Agent enregistré</div>
                    <div className="ac-label mb-1">Code d'accès</div>
                    <div style={{ fontFamily: 'var(--ac-font-heading)', fontWeight: 700, letterSpacing: '0.25em', color: 'var(--ac-secondary)', fontSize: '1.6rem', marginBottom: '0.5rem' }}>{accessCode}</div>
                    <p style={{ fontSize: '0.76rem', color: 'var(--ac-text-muted)', marginBottom: '1.5rem' }}>Notez ce code — il est votre seule façon de retrouver votre fiche.</p>
                    <div className="flex flex-col gap-2">
                        <button onClick={() => navigate(`/${slug}/${accessUrl}`)} className="ac-btn ac-btn-primary w-full">Accéder à ma fiche →</button>
                        <button onClick={() => navigate(`/${slug}/`)} className="ac-btn ac-btn-ghost w-full">Retour à l'accueil</button>
                    </div>
                </div>
            </div>
        );
    }

    // ── Rendu de l'étape courante ─────────────────────────────────────────────
    const currentStepDef = steps[step - 1];
    const realId = currentStepDef?.id ?? step;

    const stepContent = {
        1: <Step1Attributes />,
        2: <Step2Archetype ws={ws} patch={patch} />,
        3: <Step3Nationality ws={ws} patch={patch} />,
        4: <Step4Background ws={ws} patch={patch} />,
        5: <Step5Characteristic ws={ws} patch={patch} />,
        6: isSpellcaster ? <Step6Magic ws={ws} patch={patch} attrs={attrs} /> : <Step7FinishingTouches ws={ws} patch={patch} />,
        7: <Step7FinishingTouches ws={ws} patch={patch} />,
    };

    return (
        <div className="min-h-screen bg-default text-default" style={{ fontFamily: 'var(--ac-font-body)' }}>
            <header className="ac-header">
                <div className="ac-page-title">Achtung! Cthulhu</div>
                <div style={{ fontFamily: 'var(--ac-font-heading)', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ac-secondary)' }}>
                    Création de personnage
                </div>
                <ThemeToggle darkMode={darkMode} onToggle={onToggleDarkMode} />
            </header>

            <div style={{ maxWidth: '100%', padding: '1.5rem 2rem' }}>
                <StepBar steps={steps} current={step} />

                {error && (
                    <div className="mb-4 px-3 py-2 rounded" style={{ background: 'var(--ac-accent)', color: '#fff', fontSize: '0.85rem' }}>{error}</div>
                )}

                {stepContent[realId]}

                <div className="flex gap-3 mt-8">
                    {step > 1 && (
                        <button onClick={() => setStep(s => s - 1)} className="ac-btn ac-btn-ghost" style={{ minWidth: 120 }}>← Retour</button>
                    )}
                    <div style={{ flex: 1 }} />
                    {step < totalSteps && (
                        <button onClick={() => setStep(s => s + 1)} disabled={!canAdvance} className="ac-btn ac-btn-primary"
                                style={{ minWidth: 140, opacity: canAdvance ? 1 : 0.35, cursor: canAdvance ? 'pointer' : 'not-allowed' }}>
                            Suivant →
                        </button>
                    )}
                    {step === totalSteps && (
                        <button onClick={handleSubmit} disabled={submitting || !canAdvance} className="ac-btn ac-btn-primary"
                                style={{ minWidth: 180, opacity: (submitting || !canAdvance) ? 0.35 : 1 }}>
                            {submitting ? '⏳ Création en cours…' : '✓ Créer mon agent'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Creation;