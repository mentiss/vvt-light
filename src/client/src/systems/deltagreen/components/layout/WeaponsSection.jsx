// src/client/src/systems/deltagreen/components/layout/WeaponsSection.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Table d'armement Delta Green (slots a→g + mains nues).
//
// En lecture  : cellules COMP.%, DÉGÂTS, LÉTALITÉ cliquables → DiceModal
//               MUNITIONS : boutons +/- inline
// En editMode : bouton ✎ par ligne → WeaponEditPanel (overlay)
//               Bouton "+ Catalogue" → WeaponCatalogModal
//
// Props :
//   char              — personnage courant
//   editMode          — boolean
//   setArr            — (key, value[]) => void
//   onRoll            — (ctx) => void  → déclenche DiceModal dans Sheet
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import {CARAC_KEYS, resolveSkillRef} from '../../config.jsx';
import WeaponEditPanel from "../ui/WeaponEditPanel.jsx";
import WeaponCatalogModal from "../modals/WeaponCatalogModal.jsx";

// ── Constantes ────────────────────────────────────────────────────────────────

const SLOTS       = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];

// Parse une notation de dommages en notation rpg-dice-roller (lowercase, sans espaces)
// Retourne null si pas de dé.
function parseDamageNotation(val) {
    if (!val || val === '—') return null;
    if (!/d/i.test(val))    return null;
    return val.toLowerCase().replace(/\s/g, '');
}

// Parse une valeur de létalité ("10%", 10, "10") → entier ou null
function parseLethality(val) {
    if (val == null || val === '' || val === '—') return null;
    const n = parseInt(String(val).replace('%', ''), 10);
    return isNaN(n) ? null : n;
}

// ── Composant ─────────────────────────────────────────────────────────────────

const COL = 'grid-cols-[1.5rem_2fr_1fr_1fr_1fr_1fr_1fr_1fr_1.5rem]';

const WeaponsSection = ({ char, editMode, setArr, onRoll, onPatchImmediate  }) => {
    const allEquip = char.equipment ?? [];

    const [panelSlot,   setPanelSlot]   = useState(null);  // null | slot key
    const [showCatalog, setShowCatalog] = useState(false);

    // ── Accès données ─────────────────────────────────────────────────────────
    const getWeapon = (slot) =>
        allEquip.find(e => e.slot === slot && e.category === 'weapon');

    // ── Mutations équipement ──────────────────────────────────────────────────
    const saveWeapon = (slot, weaponData) => {
        const existing = getWeapon(slot);
        if (existing) {
            setArr('equipment', allEquip.map(e =>
                e.slot === slot && e.category === 'weapon' ? { ...e, ...weaponData } : e
            ));
        } else {
            setArr('equipment', [...allEquip, {
                category: 'weapon', expense: 'Standard',
                isRestricted: false, restrictionNote: '',
                quantity: 1, ...weaponData, slot,
            }]);
        }
        setPanelSlot(null);
    };

    const removeWeapon = (slot) => {
        setArr('equipment', allEquip.filter(
            e => !(e.slot === slot && e.category === 'weapon')
        ));
        setPanelSlot(null);
    };

    const updateAmmo = (slot, delta) => {
        const w = getWeapon(slot);
        if (!w) return;
        const cur = w.jsonDetails?.ammo_current ?? w.jsonDetails?.ammo_capacity ?? 0;
        const cap = w.jsonDetails?.ammo_capacity ?? null;
        const next = Math.max(0, cap != null ? Math.min(cap, cur + delta) : cur + delta);
        const updatedEquipment = allEquip.map(e =>
            e.slot === slot && e.category === 'weapon'
                ? { ...e, jsonDetails: { ...e.jsonDetails, ammo_current: next } }
                : e
        );
        onPatchImmediate({ equipment: updatedEquipment });
    };

    // ── Jets depuis la table ──────────────────────────────────────────────────
    const rollSkill = (w) => {
        const ref = resolveSkillRef(char, w.jsonDetails?.skill_ref);
        if (!ref) return;
        const skillRef = w.jsonDetails?.skill_ref?.toLowerCase();

        // Cherche l'id de la compétence correspondante pour cocher la case d'échec
        const matchedSkill = CARAC_KEYS.has(skillRef)
            ? null  // une stat (DEX×5 etc.) n'a pas de case d'échec
            : (char.skills ?? []).find(s => s.skillKey === skillRef);

        onRoll({
            diceType:    'd100',
            targetScore: ref.score,
            rollLabel:   `${w.name} — ${ref.label}`,
            skillId:     matchedSkill?.id ?? null,
        });
    };

    const rollDamage = (w) => {
        const notation = parseDamageNotation(w.jsonDetails?.damage);
        if (!notation) return;
        onRoll({ diceType: notation, rollLabel: `Dégâts — ${w.name}` });
    };

    const rollLethality = (w) => {
        const lethal = parseLethality(w.jsonDetails?.lethality);
        if (lethal == null) return;
        onRoll({ diceType: 'd100', targetScore: lethal, rollLabel: `Létalité — ${w.name}` });
    };

    // ── Mains nues ────────────────────────────────────────────────────────────
    const unarmedScore = (char.skills ?? []).find(s => s.skillKey === 'combat_mains_nues')?.score ?? 40;

    // ── Rendu d'une ligne slot ────────────────────────────────────────────────
    const renderSlotRow = (slot) => {
        const w          = getWeapon(slot);
        const d          = w?.jsonDetails ?? {};
        const resolved   = w ? resolveSkillRef(char, d.skill_ref) : null;
        const damageStr  = d.damage ? String(d.damage).toUpperCase() : null;
        const notation   = parseDamageNotation(d.damage);
        const lethalNum  = parseLethality(d.lethality);
        const hasCap     = d.ammo_capacity != null && d.ammo_capacity !== '';
        const ammoCur    = d.ammo_current  ?? d.ammo_capacity ?? 0;

        return (
            <div key={slot} className={`grid ${COL} gap-x-2 border-b border-default/20 py-0.5 items-center min-h-[1.75rem]`}>

                {/* Slot */}
                <span className="text-[10px] text-muted font-mono">({slot})</span>

                {/* Nom */}
                <span className="text-xs font-mono truncate" title={w?.name}>{w?.name || '—'}</span>

                {/* COMP. % */}
                {!editMode && resolved && onRoll !== null ? (
                    <button
                        onClick={() => rollSkill(w)}
                        className="text-xs font-mono text-center hover:text-accent hover:underline transition-colors tabular-nums"
                        title={`Jet ${resolved.label}`}
                    >{resolved.score}%</button>
                ) : (
                    <span className="text-xs font-mono text-center text-muted tabular-nums">
                        {resolved ? `${resolved.score}%` : '—'}
                    </span>
                )}

                {/* Portée */}
                <span className="text-xs font-mono text-center text-muted">{d.range || '—'}</span>

                {/* Dégâts */}
                {!editMode && notation && onRoll !== null ? (
                    <button
                        onClick={() => rollDamage(w)}
                        className="text-xs font-mono text-center hover:text-accent hover:underline transition-colors"
                        title={`Lancer ${damageStr}`}
                    >{damageStr}</button>
                ) : (
                    <span className="text-xs font-mono text-center">{damageStr || '—'}</span>
                )}

                {/* Perf. */}
                <span className="text-xs font-mono text-center">
                    {d.armor_piercing != null && d.armor_piercing !== '' ? d.armor_piercing : '—'}
                </span>

                {/* Létalité */}
                {!editMode && lethalNum != null && onRoll !== null ? (
                    <button
                        onClick={() => rollLethality(w)}
                        className="text-xs font-mono text-center hover:text-accent hover:underline transition-colors tabular-nums"
                        title={`Jet de létalité (${lethalNum}%)`}
                    >{lethalNum}%</button>
                ) : (
                    <span className="text-xs font-mono text-center tabular-nums">
                        {lethalNum != null ? `${lethalNum}%` : '—'}
                    </span>
                )}

                {/* Munitions */}
                {hasCap ? (
                    <div className="flex items-center justify-center gap-0.5">
                        {!editMode && (
                            <button
                                onClick={() => updateAmmo(slot, -1)}
                                className="text-muted hover:text-danger font-mono text-xs w-3.5 leading-none"
                            >−</button>
                        )}
                        <span className="text-xs font-mono tabular-nums">{ammoCur}/{d.ammo_capacity}</span>
                        {!editMode && (
                            <button
                                onClick={() => updateAmmo(slot, +1)}
                                className="text-muted hover:text-success font-mono text-xs w-3.5 leading-none"
                            >+</button>
                        )}
                    </div>
                ) : (
                    <span className="text-xs font-mono text-center">—</span>
                )}

                {/* Action colonne */}
                {editMode ? (
                    <button
                        onClick={() => setPanelSlot(slot)}
                        className="text-muted hover:text-accent transition-colors text-sm"
                        title="Éditer"
                    >✎</button>
                ) : <span />}
            </div>
        );
    };

    // ── Rendu ─────────────────────────────────────────────────────────────────
    return (
        <div>
            {/* En-tête section */}
            <div className="flex items-center justify-between mb-2 border-b border-default pb-1">
                <p className="dg-section-label text-base">17. ARMES</p>
                {editMode && (
                    <button
                        onClick={() => setShowCatalog(true)}
                        className="text-[10px] font-mono border border-default px-2 py-0.5 hover:border-accent hover:text-accent transition-colors"
                    >
                        + Catalogue
                    </button>
                )}
            </div>

            {/* En-têtes colonnes */}
            <div className={`grid ${COL} gap-x-2 mb-0.5`}>
                <span />
                <span className="dg-section-label text-[9px] text-left">Arme</span>
                <span className="dg-section-label text-[9px] text-center">Comp.%</span>
                <span className="dg-section-label text-[9px] text-center">Portée</span>
                <span className="dg-section-label text-[9px] text-center">Dégâts</span>
                <span className="dg-section-label text-[9px] text-center">Perf.</span>
                <span className="dg-section-label text-[9px] text-center">Létalité</span>
                <span className="dg-section-label text-[9px] text-center">Munitions</span>
                <span />
            </div>

            {/* Slots a → g */}
            {SLOTS.map(renderSlotRow)}

            {/* Mains nues — ligne fixe */}
            <div className={`grid ${COL} gap-x-2 py-0.5 items-center`}>
                <span className="text-[10px] text-muted font-mono">(—)</span>
                <span className="text-xs font-mono italic text-muted">Mains nues</span>

                {/* COMP. % */}
                {!editMode && onRoll !== null ? (
                    <button
                        onClick={() => onRoll({ diceType: 'd100', targetScore: unarmedScore, rollLabel: 'Mains nues — Combat à mains nues' })}
                        className="text-xs font-mono text-center text-muted hover:text-accent hover:underline transition-colors tabular-nums"
                    >{unarmedScore}%</button>
                ) : (
                    <span className="text-xs font-mono text-center text-muted tabular-nums">{unarmedScore}%</span>
                )}

                <span className="text-xs font-mono text-center text-muted">—</span>

                {/* Dégâts */}
                {!editMode && onRoll !== null ? (
                    <button
                        onClick={() => onRoll({ diceType: '1d4-1', rollLabel: 'Dégâts — Mains nues' })}
                        className="text-xs font-mono text-center text-muted hover:text-accent hover:underline transition-colors"
                    >1D4−1</button>
                ) : (
                    <span className="text-xs font-mono text-center text-muted">1D4−1</span>
                )}

                <span className="text-xs font-mono text-center text-muted">—</span>
                <span className="text-xs font-mono text-center text-muted">—</span>
                <span className="text-xs font-mono text-center text-muted">—</span>
                <span />
            </div>

            {/* Panel d'édition */}
            {panelSlot !== null && (
                <WeaponEditPanel
                    slot={panelSlot}
                    weapon={getWeapon(panelSlot)}
                    char={char}
                    onSave={(data)  => saveWeapon(panelSlot, data)}
                    onDelete={()    => removeWeapon(panelSlot)}
                    onClose={()     => setPanelSlot(null)}
                />
            )}

            {/* Catalogue */}
            {showCatalog && (
                <WeaponCatalogModal
                    existingWeapons={allEquip.filter(e => e.slot && e.category === 'weapon')}
                    onAdd={(weaponData, slot) => { saveWeapon(slot, weaponData); setShowCatalog(false); }}
                    onClose={() => setShowCatalog(false)}
                />
            )}
        </div>
    );
};

export default WeaponsSection;