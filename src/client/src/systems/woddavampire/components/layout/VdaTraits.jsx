// src/client/src/systems/woddavampire/components/layout/VdaTraits.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Sections de traits de la fiche, assemblées par la fiche joueur (VdaSheet) et
// par la fiche du Conteur (VdaGmSheet) : Attributs, Capacités, Historiques,
// Vertus, Atouts et Handicaps (spec_woddavampire.md §4).
//   - hors édition : une ligne cliquable lance le jet pré-rempli (onRoll) ;
//   - en édition : points et précisions modifiables (fiche libre) ;
//   - compact : présentation de la fiche du Conteur (intertitres plus discrets,
//     Atouts et Handicaps sur une ligne, effet au survol).
// Props communes : c (personnage affiché), editMode, onRoll(setup), compact ;
// selon la section : onField(field, value), onArray(field, list), mutedZero.
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { ATTRIBUTE_GROUPS, ABILITY_GROUPS, ABILITY_LABELS, ABILITY_DOMAINS, BODY_CRAFTS, BACKGROUNDS, DISCIPLINES, VIRTUE_LABELS, MERITS_FLAWS } from '../../config.jsx';
import { characterProfile, traitMaxFor, upsertByKey } from '../../config/rules/character.js';
import { physicalBonusFor, disciplineRating } from '../../config/rules/sheetRules.js';
import { TraitLine } from './VdaSheetParts.jsx';

const colTitle = (compact) => `vda-col-title${compact ? ' vda-gm-h' : ''}`;
const groupTitle = (compact) => (compact ? 'vda-gm-sub' : 'vda-col-title');

/** Attributs par groupes (Physiques, Sociaux, Mentaux) ; bonus permanent des Disciplines physiques en note */
export const VdaAttributes = ({ c, editMode = false, onField, onRoll, compact = false }) => {
    const traitMax = traitMaxFor(c);
    return (
        <div className="vda-three">
            {ATTRIBUTE_GROUPS.map(g => (
                <div key={g.key}>
                    <div className={groupTitle(compact)}>{g.label}</div>
                    {g.attributes.map(([k, label]) => {
                        const phys = physicalBonusFor(k);
                        const bonus = phys ? disciplineRating(c, phys) : 0;
                        return (
                            <TraitLine key={k} label={label} note={bonus ? `+${bonus} ${DISCIPLINES[phys].label}` : null} value={c[k] ?? 0} max={traitMax}
                                       editMode={editMode} onSet={(v) => onField(k, v)} onRoll={() => onRoll({ attrKey: k, label })} />
                        );
                    })}
                </div>
            ))}
        </div>
    );
};

/** Capacités par catégories ; Artisanat corporel (Tzimisce) en Compétence ; mutedZero : Capacités à 0 grisées */
export const VdaAbilities = ({ c, editMode = false, onArray, onRoll, compact = false, mutedZero = false }) => {
    const traitMax = traitMaxFor(c);
    const { clan } = characterProfile(c);
    const abilityOf = (k) => (c.abilities ?? []).find(a => a.abilityKey === k);
    const setAbility = (k, rating) => onArray('abilities', upsertByKey(c.abilities, 'abilityKey', k, { rating, specialties: abilityOf(k)?.specialties ?? [], domains: abilityOf(k)?.domains ?? [] }));
    const setAbilityField = (k, field, list) => onArray('abilities', upsertByKey(c.abilities, 'abilityKey', k, { [field]: list }));
    const withBodyCrafts = !!abilityOf(BODY_CRAFTS[0]) || !!clan?.effects?.bodyCrafts;

    return (
        <div className="vda-three">
            {ABILITY_GROUPS.map(g => (
                <div key={g.key}>
                    <div className={groupTitle(compact)}>{g.label}</div>
                    {[...g.abilities, ...(g.key === 'skill' && withBodyCrafts ? [BODY_CRAFTS] : [])].map(([k, label]) => {
                        const a = abilityOf(k);
                        const rating = a?.rating ?? 0;
                        const note = [a?.domains?.filter(Boolean).join(', '), a?.specialties?.filter(Boolean).length ? `spé. ${a.specialties.filter(Boolean).join(', ')}` : null].filter(Boolean).join(' · ');
                        // En édition : domaine d'expertise (Capacités qui l'exigent) et spécialité (à 4 et plus)
                        const below = editMode && rating > 0 && (ABILITY_DOMAINS[k] || rating >= 4) ? (
                            <div className="vda-trait-below">
                                {ABILITY_DOMAINS[k] && <input className="vda-input" placeholder="Domaine d'expertise" value={a?.domains?.[0] ?? ''}
                                                               onChange={(e) => setAbilityField(k, 'domains', [e.target.value])} aria-label={`Domaine : ${label}`} />}
                                {rating >= 4 && <input className="vda-input" placeholder="Spécialité" value={a?.specialties?.[0] ?? ''}
                                                       onChange={(e) => setAbilityField(k, 'specialties', [e.target.value])} aria-label={`Spécialité : ${label}`} />}
                            </div>
                        ) : null;
                        return (
                            <TraitLine key={k} label={label} note={note || null} value={rating} max={traitMax} below={below} muted={mutedZero && !rating}
                                       editMode={editMode} onSet={(v) => setAbility(k, v)} onRoll={() => onRoll({ abilityKey: k, label: ABILITY_LABELS[k] })} />
                        );
                    })}
                </div>
            ))}
        </div>
    );
};

/** Historiques : ceux qui ont des points (tous en édition), précision en note ou en saisie */
export const VdaBackgrounds = ({ c, editMode = false, onArray, compact = false }) => {
    const setBackground = (k, patch) => onArray('backgrounds', upsertByKey(c.backgrounds, 'backgroundKey', k, patch));
    return (
        <div>
            <div className={colTitle(compact)}>Historiques</div>
            {Object.entries(BACKGROUNDS).map(([k, label]) => {
                const b = (c.backgrounds ?? []).find(x => x.backgroundKey === k);
                if (!editMode && !b?.rating) return null;
                return (
                    <TraitLine key={k} label={label} note={!editMode ? b?.details || null : null} value={b?.rating ?? 0} editMode={editMode} onSet={(v) => setBackground(k, { rating: v })}
                               below={editMode && b?.rating ? (
                                   <div className="vda-trait-below"><input className="vda-input" placeholder="Précision (nom de l'allié, du mentor…)" value={b?.details ?? ''}
                                                                             onChange={(e) => setBackground(k, { details: e.target.value })} aria-label={`Précision : ${label}`} /></div>
                               ) : null} />
                );
            })}
        </div>
    );
};

/** Vertus (libellés selon la Route), cliquables pour un jet de Vertu */
export const VdaVirtues = ({ c, editMode = false, onField, onRoll, compact = false }) => {
    const { moralKey, controlKey } = characterProfile(c);
    const virtues = [['virtueMoral', VIRTUE_LABELS[moralKey]], ['virtueControl', VIRTUE_LABELS[controlKey]], ['virtueCourage', 'Courage']];
    return (
        <div>
            <div className={colTitle(compact)}>Vertus</div>
            {virtues.map(([field, label]) => (
                <TraitLine key={field} label={label} value={c[field] ?? 0} editMode={editMode} onSet={(v) => onField(field, v)}
                           onRoll={() => onRoll({ label, virtue: field })} />
            ))}
        </div>
    );
};

/** Atouts et Handicaps : effet affiché (compact : au survol) ; retrait en édition. Validation : autour de la table */
export const VdaMeritsFlaws = ({ c, editMode = false, onArray, compact = false }) => {
    const list = c.meritsFlaws ?? [];
    const name = (m) => MERITS_FLAWS[m.entryKey]?.label ?? m.entryKey;
    const kindCost = (m) => ` (${m.kind === 'merit' ? 'Atout' : 'Handicap'} ${m.cost})`;
    return (
        <div>
            <div className={colTitle(compact)}>Atouts et Handicaps</div>
            {list.length === 0 && <p className="vda-note text-center">Aucun</p>}
            {list.map(m => (compact ? (
                <div key={m.id ?? m.entryKey} className="vda-trait" title={MERITS_FLAWS[m.entryKey]?.effect}>
                    <span className="vda-trait-name">{name(m)}<small>{kindCost(m)}</small></span>
                </div>
            ) : (
                <div key={m.id ?? m.entryKey} className="vda-power-row">
                    <div className="vda-power-head">
                        <span className="flex-1">{name(m)}<small className="vda-note">{kindCost(m)}</small></span>
                        {editMode && <button type="button" className="vda-chip" onClick={() => onArray('meritsFlaws', list.filter(x => x !== m))}
                                             aria-label={`Retirer ${name(m)}`}>✕</button>}
                    </div>
                    {MERITS_FLAWS[m.entryKey]?.effect && <div className="vda-power-effect vda-note">{MERITS_FLAWS[m.entryKey].effect}</div>}
                </div>
            )))}
        </div>
    );
};
