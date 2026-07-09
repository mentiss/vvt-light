// src/client/src/systems/fabula/components/layout/ArcanaSpellsPanel.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Panneau MAÎTRE pour tout ce qui est magie — sorts connus ET Arcana liés.
// Contrairement à une v1 purement affichage, celui-ci gère le cycle complet :
//   - Combien d'emplacements de sort un personnage a (dérivé du rang investi
//     dans chaque compétence "apprend un sort", ex. Magie Élémentaire).
//   - Quels sorts remplissent ces emplacements — ajout/retrait direct ici,
//     plus besoin de redescendre/remonter un rang dans ClassesSkillsPanel
//     pour changer un choix.
// ClassesSkillsPanel ne gère plus QUE le rang (= nombre d'emplacements) —
// zéro sélecteur de sort là-bas désormais.
//
// Deux sous-sections plutôt qu'un tableau unique façon fiche officielle : nos
// Arcana n'ont pas de PM/Cible/Durée au même sens qu'un sort (coût de fusion
// fixe à 40 PM, effets qui varient par Arcanum).
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { CLASSES, SPELL_LISTS, ARCANA_LISTS } from '../../config.jsx';

const ArcanaSpellsPanel = ({ character, editMode, onArrayChange }) => {
    const classes = character.classes ?? [];
    const skills  = character.skills ?? [];
    const arcana  = character.arcana ?? [];

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

    const toggleArcanaEtat = (arcanumKey) => {
        onArrayChange('arcana', arcana.map(a => a.arcanumKey === arcanumKey
            ? { ...a, etat: a.etat === 'fusionne' ? 'lie' : 'fusionne' }
            : a));
    };
    const removeArcanum = (arcanumKey) => {
        onArrayChange('arcana', arcana.filter(a => a.arcanumKey !== arcanumKey));
    };
    const boundArcana = arcana
        .map(a => {
            const def = ARCANA_LISTS.arcaniste?.find(arc => arc.key === a.arcanumKey);
            return def ? { ...def, etat: a.etat } : null;
        })
        .filter(Boolean);

    const nothingToShow = spellSlotGroups.length === 0 && boundArcana.length === 0;

    return (
        <div className="bg-surface border border-default rounded-lg p-3 flex flex-col gap-3">
            <h3 className="fu-font-title text-primary text-sm">Arcana & Sorts</h3>

            {nothingToShow && (
                <p className="text-xs text-muted italic">Aucun sort ou Arcanum accessible pour l'instant.</p>
            )}

            {spellSlotGroups.map(group => (
                <div key={`${group.classKey}-${group.skillKey}`}>
                    <div className="flex items-center justify-between mb-1 px-1">
                        <span className="text-xs font-semibold text-muted">{group.className} — {group.skillName}</span>
                        <span className="text-[10px] text-muted">{group.chosen.length} / {group.rang}</span>
                    </div>

                    <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-x-2 text-[10px] text-muted uppercase mb-1 px-1">
                        <span>Nom</span><span>PM</span><span>Cible</span><span>Durée</span><span />
                    </div>
                    <div className="flex flex-col gap-1">
                        {group.chosen.map(spellKey => {
                            const sp = SPELL_LISTS[group.spellList].find(s => s.key === spellKey);
                            if (!sp) return null;
                            return (
                                <div key={sp.key} className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-x-2 items-baseline bg-surface-alt rounded px-2 py-1 text-xs"
                                     title={sp.description}>
                                    <span className="font-semibold truncate">{sp.nom}</span>
                                    <span className="text-muted whitespace-nowrap">{sp.cout}</span>
                                    <span className="text-muted whitespace-nowrap">{sp.cible}</span>
                                    <span className="text-muted whitespace-nowrap">{sp.duree}</span>
                                    {editMode ? (
                                        <button type="button" onClick={() => removeSpell(group.classKey, group.skillKey, sp.key)}
                                                className="text-danger">✕</button>
                                    ) : <span />}
                                </div>
                            );
                        })}
                    </div>

                    {/* Ajout / remplacement — toujours accessible en édition, même emplacements pleins
                        (retirer un sort libère un emplacement, autant pouvoir enchaîner directement) */}
                    {editMode && (
                        <div className="mt-1 pl-2 border-l-2 border-accent">
                            {group.chosen.length < group.rang ? (
                                <>
                                    <div className="text-[10px] text-muted mb-0.5">
                                        Ajouter ({group.rang - group.chosen.length} emplacement(s) libre(s)) :
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                        {SPELL_LISTS[group.spellList]
                                            .filter(sp => !group.chosen.includes(sp.key))
                                            .map(sp => (
                                                <button key={sp.key} type="button" title={sp.description}
                                                        onClick={() => addSpell(group.classKey, group.skillKey, sp.key)}
                                                        className="px-2 py-0.5 rounded text-xs border bg-default border-default">
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
                <div className={spellSlotGroups.length > 0 ? 'border-t border-default pt-2' : ''}>
                    <div className="text-[10px] text-muted uppercase mb-1 px-1">Arcana liés</div>
                    <div className="flex flex-col gap-1">
                        {boundArcana.map(arc => (
                            <div key={arc.key} className="bg-surface-alt rounded px-2 py-1 text-xs">
                                <div className="flex items-center justify-between gap-2">
                                    <span className="font-semibold">{arc.nom}</span>
                                    <div className="flex items-center gap-1">
                                        <button type="button" onClick={() => toggleArcanaEtat(arc.key)}
                                                className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                                                    arc.etat === 'fusionne' ? 'bg-accent text-white' : 'bg-default text-muted border border-default'
                                                }`}>
                                            {arc.etat === 'fusionne' ? 'Fusionné' : 'Lié'}
                                        </button>
                                        {editMode && (
                                            <button type="button" onClick={() => removeArcanum(arc.key)} className="text-danger text-xs">✕</button>
                                        )}
                                    </div>
                                </div>
                                <p className="text-muted mt-0.5">{arc.effetFusion}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ArcanaSpellsPanel;