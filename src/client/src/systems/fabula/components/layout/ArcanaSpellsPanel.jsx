// src/client/src/systems/fabula/components/layout/ArcanaSpellsPanel.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Panneau MAÎTRE pour tout ce qui est magie — sorts connus ET Arcana liés.
//   - Combien d'emplacements de sort un personnage a (dérivé du rang investi
//     dans chaque compétence "apprend un sort", ex. Magie Élémentaire).
//   - Quels sorts remplissent ces emplacements — ajout/retrait direct ici en
//     mode édition. ClassesSkillsPanel ne gère QUE le rang (= nombre d'emplacements).
//   - Sorts dépliables (Q-7) : la description s'ouvre au clic ; « Lancer »
//     seulement pour un sort à test de magie (pas de bouton pour un sort sans test).
//   - Arcana : cycle Lié → Fusionné → Renvoi → Lié (spec_fabula.md §3.2).
//     « Fusionner » retire 40 PM (35… en Crise avec Arcanum d'urgence) en une
//     seule mise à jour avec l'état ; un seul Arcanum fusionné ou en renvoi à la
//     fois ; « Renvoyer sans effet » ramène directement à Lié ; un Arcanum sans
//     effet de renvoi passe de Fusionné à Lié. Actions de jeu : actives hors
//     mode édition, persistance immédiate via onQuickUpdate.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { CLASSES, SPELL_LISTS, ARCANA_LISTS, arcanumFusionCost, nextArcanumState, isInCrisis, skillRank } from '../../config.jsx';
import FuIcon from '../ui/FuIcon.jsx';

// ── Parse testMagie ("[INT + VOL]") → { attr1, attr2 } ou null ──────────────
const ATTR_MAP = { DEX: 'dex', INT: 'int', PUI: 'pui', VOL: 'vol' };
const parseTestMagie = (testMagie) => {
    if (!testMagie) return null;
    const match = testMagie.match(/\[(\w+)\s*\+\s*(\w+)\]/);
    if (!match) return null;
    const a1 = ATTR_MAP[match[1].toUpperCase()];
    const a2 = ATTR_MAP[match[2].toUpperCase()];
    return (a1 && a2) ? { attr1: a1, attr2: a2 } : null;
};

const STAGES = [['lie', 'Lié', '#AEB8EC'], ['fusionne', 'Fusionné', '#C58BFF'], ['renvoi', 'Renvoi', '#F2D27A']];

const ArcanumCard = ({ arc, locked, cost, canPay, urgence, editMode, onStage, onFuse, onRemove }) => {
    const steps = STAGES.map(([k, label, color], n) => (
        <React.Fragment key={k}>
            {n > 0 && <i />}
            <span className={arc.etat === k ? 'is-on' : ''} style={{ '--stc': color }}>{label}</span>
        </React.Fragment>
    ));

    let text, actions;
    if (arc.etat === 'fusionne') {
        text = <><b>Fusion</b>{arc.effetFusion}</>;
        actions = (
            <>
                <button type="button" className="fu-btn fu-btn-sm fu-btn-gold" onClick={() => onStage(arc.key, nextArcanumState('fusionne', !!arc.effetRenvoi))}>Renvoyer</button>
                {arc.effetRenvoi && (
                    <button type="button" className="fu-btn fu-btn-sm" onClick={() => onStage(arc.key, 'lie')}
                            title="Fin de scène, perte de connaissance, sortie de scène : pas d'effet de renvoi">Renvoyer sans effet</button>
                )}
            </>
        );
    } else if (arc.etat === 'renvoi') {
        text = <><b>Renvoi</b>{arc.effetRenvoi}</>;
        actions = (
            <>
                <button type="button" className="fu-btn fu-btn-sm fu-btn-gold" onClick={() => onStage(arc.key, 'lie')}>Effet utilisé</button>
                <small>retour à Lié</small>
            </>
        );
    } else {
        const why = locked ? 'Un autre Arcanum est déjà fusionné' : !canPay ? 'PM insuffisants' : '';
        text = <><b>Domaines</b>{(arc.domaines ?? []).join(', ')}</>;
        actions = (
            <>
                <button type="button" className="fu-btn fu-btn-sm fu-btn-gold" onClick={() => onFuse(arc.key)} disabled={!!why} title={why || undefined}>
                    Fusionner · {cost} PM
                </button>
                {why ? <small>{why}</small> : urgence > 0 && <small>Arcanum d'urgence : −{urgence} PM en Crise</small>}
            </>
        );
    }

    return (
        <div className={`fu-arcanum${locked ? ' is-locked' : ''}`} data-stage={arc.etat}>
            <FuIcon name="sigil" className="fu-arcanum-sigil" />
            <div className="flex flex-col gap-1.5 min-w-0">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold flex-1">{arc.nom}</span>
                    {editMode && (
                        <button type="button" onClick={() => onRemove(arc.key)} className="fu-btn fu-btn-sm fu-btn-danger" aria-label="Retirer l'Arcanum">
                            <FuIcon name="close" className="fu-ico-sm" />
                        </button>
                    )}
                </div>
                <div className="fu-arc-steps">{steps}</div>
            </div>
            <p className="fu-arc-text">{text}</p>
            <div className="fu-arc-actions">{actions}</div>
        </div>
    );
};

const ArcanaSpellsPanel = ({ character, editMode, onArrayChange, onQuickUpdate, onCastSpell }) => {
    const [open, setOpen] = useState(() => new Set());
    const classes = character.classes ?? [];
    const skills  = character.skills ?? [];
    const arcana  = character.arcana ?? [];

    const toggleOpen = (key) => setOpen(prev => {
        const next = new Set(prev);
        if (next.has(key)) next.delete(key); else next.add(key);
        return next;
    });

    // ── Sorts : un groupe par compétence "apprend un sort" investie ─────────

    const spellSlotGroups = classes.flatMap(c => {
        const def = CLASSES[c.classKey];
        return def.competences
            .filter(comp => comp.learnsSpell && (SPELL_LISTS[comp.spellList]?.length ?? 0) > 0)
            .map(comp => {
                const skillEntry = skills.find(s => s.classKey === c.classKey && s.skillKey === comp.key);
                const rang = skillEntry?.rang ?? 0;
                if (rang === 0) return null;
                return {
                    classKey:   c.classKey,
                    skillKey:   comp.key,
                    className:  def.nom,
                    skillName:  comp.nom,
                    spellList:  comp.spellList,
                    rang,
                    chosen:     skillEntry?.spellsChoisis ?? [],
                };
            })
            .filter(Boolean);
    });

    const addSpell = (classKey, skillKey, spellKey) => {
        onArrayChange('skills', skills.map(s => (s.classKey === classKey && s.skillKey === skillKey)
            ? { ...s, spellsChoisis: [...(s.spellsChoisis ?? []), spellKey] }
            : s));
    };
    const removeSpell = (classKey, skillKey, spellKey) => {
        onArrayChange('skills', skills.map(s => (s.classKey === classKey && s.skillKey === skillKey)
            ? { ...s, spellsChoisis: (s.spellsChoisis ?? []).filter(k => k !== spellKey) }
            : s));
    };

    // ── Arcana ────────────────────────────────────────────────────────────

    const cost    = arcanumFusionCost(character);
    const urgence = isInCrisis(character) ? skillRank(character, 'arcaniste', 'arcanum_urgence') * 5 : 0;
    const pm      = character.pmActuel ?? 0;
    const busy    = arcana.some(a => a.etat === 'fusionne' || a.etat === 'renvoi');

    const withStage = (arcanumKey, etat) => arcana.map(a => a.arcanumKey === arcanumKey ? { ...a, etat } : a);
    const setStage  = (arcanumKey, etat) => onQuickUpdate({ arcana: withStage(arcanumKey, etat) });
    const fuse      = (arcanumKey) => onQuickUpdate({ arcana: withStage(arcanumKey, 'fusionne'), pmActuel: Math.max(0, pm - cost) });
    const removeArcanum = (arcanumKey) => onArrayChange('arcana', arcana.filter(a => a.arcanumKey !== arcanumKey));

    const boundArcana = arcana
        .map(a => {
            const def = ARCANA_LISTS.arcaniste?.find(arc => arc.key === a.arcanumKey);
            return def ? { ...def, etat: a.etat } : null;
        })
        .filter(Boolean);

    const nothingToShow = spellSlotGroups.length === 0 && boundArcana.length === 0;

    return (
        <div className="fu-win">
            <div className="fu-win-head">
                <h3 className="fu-title">Sorts &amp; Arcana<span className="fu-kana" aria-hidden="true">魔法</span></h3>
                <span className="fu-rule" />
            </div>

            {nothingToShow && (
                <p className="text-xs text-muted italic">Aucun sort ou Arcanum accessible pour l'instant.</p>
            )}

            {spellSlotGroups.map(group => (
                <div key={`${group.classKey}-${group.skillKey}`} className="mb-3">
                    <div className="flex items-center justify-between mb-1 px-1">
                        <span className="fu-label">{group.className} — {group.skillName}</span>
                        <span className="fu-aside">Emplacements <b>{group.chosen.length}</b> / {group.rang}</span>
                    </div>

                    <div className="flex flex-col gap-0.5">
                        {group.chosen.map(spellKey => {
                            const sp = SPELL_LISTS[group.spellList].find(s => s.key === spellKey);
                            if (!sp) return null;
                            const castAttrs = parseTestMagie(sp.testMagie);
                            const canCast   = !editMode && !!castAttrs && !!onCastSpell;
                            const key = `${group.classKey}:${sp.key}`;
                            const isOpen = open.has(key);
                            const meta = [sp.cible, sp.duree, sp.testMagie ?? 'sans test'].filter(Boolean).join(' · ');
                            return (
                                <div key={sp.key} className={`fu-fold${isOpen ? ' is-open' : ''}`}>
                                    <div className="flex items-center gap-2">
                                        <button type="button" onClick={() => toggleOpen(key)} aria-expanded={isOpen} className="fu-fold-toggle flex-1 min-w-0">
                                            <FuIcon name="chev" className="fu-ico-sm fu-fold-chev" />
                                            <FuIcon name={sp.offensif ? 'bolt' : 'spark'} className={`fu-ico-sm ${sp.offensif ? 'text-accent' : 'text-secondary'}`} />
                                            <span className="fu-fold-name">{sp.nom}<small>{meta}</small></span>
                                            <span className="fu-mp-cost">{typeof sp.cout === 'number' ? `${sp.cout} PM` : sp.cout}</span>
                                        </button>
                                        {canCast && (
                                            <button type="button" className="fu-btn fu-btn-sm shrink-0"
                                                    onClick={() => onCastSpell(castAttrs.attr1, castAttrs.attr2, `Sort : ${sp.nom}`, sp)}>
                                                Lancer
                                            </button>
                                        )}
                                        {editMode && (
                                            <button type="button" onClick={() => removeSpell(group.classKey, group.skillKey, sp.key)}
                                                    className="fu-btn fu-btn-sm fu-btn-danger shrink-0" aria-label="Retirer le sort">
                                                <FuIcon name="close" className="fu-ico-sm" />
                                            </button>
                                        )}
                                    </div>
                                    {isOpen && <div className="fu-fold-body">{sp.description}</div>}
                                </div>
                            );
                        })}
                    </div>

                    {/* Ajout / remplacement — toujours accessible en édition, même emplacements pleins
                        (retirer un sort libère un emplacement, autant pouvoir enchaîner directement) */}
                    {editMode && (
                        <div className="mt-2 pl-2 border-l-2 border-accent">
                            {group.chosen.length < group.rang ? (
                                <>
                                    <div className="fu-label mb-1">
                                        Ajouter ({group.rang - group.chosen.length} emplacement(s) libre(s)) :
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                        {SPELL_LISTS[group.spellList]
                                            .filter(sp => !group.chosen.includes(sp.key))
                                            .map(sp => (
                                                <button key={sp.key} type="button" title={sp.description}
                                                        onClick={() => addSpell(group.classKey, group.skillKey, sp.key)}
                                                        className="fu-pill">
                                                    + {sp.nom}
                                                </button>
                                            ))}
                                    </div>
                                </>
                            ) : (
                                <p className="text-[10px] text-muted italic">Tous les emplacements sont pourvus — retirez un sort pour en choisir un autre.</p>
                            )}
                        </div>
                    )}
                </div>
            ))}

            {boundArcana.length > 0 && (
                <div>
                    {spellSlotGroups.length > 0 && <div className="fu-sep" />}
                    <div className="fu-label mb-2 px-1">Arcana liés · un seul fusionné à la fois</div>
                    {boundArcana.map(arc => (
                        <ArcanumCard key={arc.key} arc={arc}
                                     locked={busy && arc.etat === 'lie'}
                                     cost={cost} canPay={pm >= cost} urgence={urgence}
                                     editMode={editMode}
                                     onStage={setStage} onFuse={fuse} onRemove={removeArcanum} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default ArcanaSpellsPanel;
