// src/client/src/systems/woddavampire/components/layout/VdaCombat.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Combat sur la fiche (spec_woddavampire.md §10, §II.13 C-1 à C-3), en deux briques
// posées par VdaSheet dans la section « Combat et pouvoirs » :
//   - VdaCombatActions : barre d'actions (Initiative, Esquive, Blocage, Parade,
//     Absorber ▾ avec le type de dégâts) ;
//   - VdaEquipment : l'inventaire, une seule liste (une arme est un objet qui
//     permet un jet) : armes en tête (mains nues toujours là) avec Attaque et
//     Dégâts, puis armure, bouclier, puis les objets (quantité, note). Ajout par la modale de catalogue de la plateforme (CatalogModal,
//     spec_ui_catalogue.md : recherche, filtres, objet libre) sur le catalogue de
//     l'annexe divers §4 ; équiper, retirer : actions de jeu, enregistrées tout de
//     suite, sans le mode Édition (réservé aux corrections). Dégâts cochés à la main.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import CatalogModal from '@/ui/catalog/CatalogModal.jsx';
import { UNARMED, ABILITY_LABELS, SOAK_TYPES, EQUIPMENT_CATALOG, EQUIPMENT_FILTERS } from '../../config.jsx';
import {
    initiativeValue, initiativeBase, attackSetup, damageSetup, defenseSetup, soakSetup, parseDamage,
    damageText, toWeapon, toEquipmentRow,
} from '../../config/rules/sheetRules.js';
import { VdaChip, VdaStepper, VdaToggle, PurseIcon } from '../ui/VdaUi.jsx';

/** Barre d'actions de combat — props : c, onRoll(setup), onInitiative() */
export const VdaCombatActions = ({ c, onRoll, onInitiative }) => {
    const [soakOpen, setSoakOpen] = useState(false);
    return (
        <div className="vda-combat-bar">
            <button type="button" className="vtt-btn vtt-btn-sm" onClick={onInitiative} title={`1d10 + ${initiativeBase(c)}`}>Initiative ({initiativeValue(c)})</button>
            <button type="button" className="vtt-btn vtt-btn-sm" onClick={() => onRoll(defenseSetup(c, 'dodge'))}>Esquive</button>
            <button type="button" className="vtt-btn vtt-btn-sm" onClick={() => onRoll(defenseSetup(c, 'block'))}>Blocage</button>
            <button type="button" className="vtt-btn vtt-btn-sm" onClick={() => onRoll(defenseSetup(c, 'parry'))}>Parade</button>
            <button type="button" className="vtt-btn vtt-btn-sm" onClick={() => setSoakOpen(o => !o)} aria-expanded={soakOpen}>Absorber {soakOpen ? '▴' : '▾'}</button>
            {soakOpen && (
                <span className="vda-chips">
                    {SOAK_TYPES.map(([k, l]) => <VdaChip key={k} onClick={() => { onRoll(soakSetup(c, k)); setSoakOpen(false); }}>{l}</VdaChip>)}
                </span>
            )}
        </div>
    );
};

const renderCatalogItem = (i) => (
    <div className="flex items-baseline justify-between gap-3">
        <span><b>{i.name}</b> <span className="vda-power-meta">{i.type}</span></span>
        <span className="vda-power-meta">
            {i.kind === 'weapon' && <>{damageText(i.damage)}{i.range ? ` · ${i.range} m` : ''}{i.minStrength ? ` · For ${i.minStrength}` : ''}{i.piercing ? ` · perforant ${i.piercing}` : ''}{i.diffMod ? ` · +${i.diffMod} diff` : ''}</>}
            {i.kind === 'armor' && <>absorption +{i.rating}{i.penalty ? `, pénalité ${i.penalty}` : ''}</>}
            {i.kind === 'shield' && <>parade {i.parryDifficulty}{i.attackerPenalty ? `, attaquant +${i.attackerPenalty} diff` : ''}</>}
        </span>
    </div>
);

// Objet libre : un objet (nom, quantité, note) ou une arme (nom, dégâts « For + 1 L »)
const CUSTOM_DEFAULTS = { kind: 'item', name: '', quantity: 1, notes: '', damage: 'For + 1 L' };
const isCustomValid = (d) => !!d.name.trim() && (d.kind !== 'weapon' || !!parseDamage(d.damage));
const renderCustomForm = ({ value, onChange }) => (
    <>
        <div className="vtt-catalog-filters">
            {[['item', 'Objet'], ['weapon', 'Arme']].map(([k, l]) => (
                <button key={k} type="button" className={`vtt-pill ${value.kind === k ? 'is-selected' : ''}`} onClick={() => onChange({ kind: k })}>{l}</button>
            ))}
        </div>
        <label className="block">
            <span className="vtt-field-label">Nom</span>
            <input className="vtt-input" value={value.name} onChange={e => onChange({ name: e.target.value })} autoFocus />
        </label>
        {value.kind === 'weapon' ? (
            <label className="block">
                <span className="vtt-field-label">Dégâts (ex. « For + 1 L », « 3 C »)</span>
                <input className="vtt-input" value={value.damage} onChange={e => onChange({ damage: e.target.value })} />
            </label>
        ) : (
            <>
                <label className="block">
                    <span className="vtt-field-label">Quantité</span>
                    <input className="vtt-input" type="number" min={1} value={value.quantity} onChange={e => onChange({ quantity: Math.max(1, Number(e.target.value) || 1) })} />
                </label>
                <label className="block">
                    <span className="vtt-field-label">Note</span>
                    <input className="vtt-input" value={value.notes} onChange={e => onChange({ notes: e.target.value })} />
                </label>
            </>
        )}
    </>
);

/** Équipement de combat — props : c, onQuick(patch), onRoll(setup) */
export const VdaEquipment = ({ c, onQuick, onRoll }) => {
    const equipment = c.equipment ?? [];
    const weapons = equipment.filter(e => e.kind === 'weapon');
    const protections = equipment.filter(e => e.kind === 'armor' || e.kind === 'shield');
    const items = equipment.filter(e => e.kind === 'item');
    const update = (e, patch) => save(equipment.map(x => (x === e ? { ...x, ...patch } : x)));
    const [catalogOpen, setCatalogOpen] = useState(false);

    const save = (list) => onQuick({ equipment: list });
    const add = (item) => save([...equipment, { ordre: equipment.length, ...item }]);
    const remove = (e) => save(equipment.filter(x => x !== e));
    // Une seule armure et un seul bouclier équipés à la fois
    const equip = (e, on) => save(equipment.map(x => (x === e ? { ...x, equipped: on } : (on && x.kind === e.kind && e.kind !== 'weapon' ? { ...x, equipped: false } : x))));

    const weaponRow = (w, e) => (
        <div key={e?.id ?? e?.ordre ?? 'unarmed'} className="vda-power-row">
            <div className="vda-power-head">
                {e && <VdaToggle on={!!e.equipped} onChange={(v) => equip(e, v)} label="En main" />}
                <span className="flex-1 min-w-0"><b>{w.name}</b> <span className="vda-power-meta">
                    {ABILITY_LABELS[w.ability]} · {damageText(w.damage)}{w.range ? ` · ${w.range} m` : ''}{w.diffMod ? ` · diff ${w.diffMod > 0 ? '+' : ''}${w.diffMod}` : ''}
                </span></span>
                {(!e || e.equipped) && <>
                    <button type="button" className="vda-chip" onClick={() => onRoll(attackSetup(c, w))}>Attaque</button>
                    {w.damage && <button type="button" className="vda-chip" onClick={() => onRoll(damageSetup(w))}>Dégâts</button>}
                </>}
                {e && <button type="button" className="vda-chip" onClick={() => remove(e)} aria-label={`Retirer ${w.name}`} title="Retirer">✕</button>}
            </div>
            {w.notes && <div className="vda-power-effect vda-note">{w.notes}</div>}
        </div>
    );

    return (
        <div>
            <div className="vda-col-title vda-title-act">Équipement
                <button type="button" className="vda-title-ico" onClick={() => setCatalogOpen(true)} title="Ajouter de l'équipement" aria-label="Ajouter de l'équipement"><PurseIcon /></button>
            </div>
            {weaponRow({ name: UNARMED.label, ability: UNARMED.ability, damage: UNARMED.damage, diffMod: 0, minStrength: 0 }, null)}
            {weapons.map(e => weaponRow(toWeapon(e), e))}
            {protections.map(e => (
                <div key={e.id ?? e.ordre} className="vda-power-row">
                    <div className="vda-power-head">
                        <VdaToggle on={!!e.equipped} onChange={(v) => equip(e, v)} label="Porté" />
                        <span className="flex-1"><b>{e.name}</b> <span className="vda-power-meta">
                            {e.kind === 'armor' ? `absorption +${e.rating ?? 0}${e.penalty ? `, pénalité ${e.penalty}` : ''}` : `parade diff ${e.difficulty ?? 6}${e.penalty ? `, attaquant +${e.penalty} diff` : ''}`}
                        </span></span>
                        <button type="button" className="vda-chip" onClick={() => remove(e)} aria-label={`Retirer ${e.name}`} title="Retirer">✕</button>
                    </div>
                </div>
            ))}

            {items.length > 0 && <div className="vda-inventory-sep">Objets</div>}
            {items.map(e => (
                <div key={e.id ?? e.ordre} className="vda-power-row">
                    <div className="vda-power-head">
                        <b className="shrink-0">{e.name}</b>
                        <input className="vda-input vda-inventory-note" placeholder="Note" value={e.notes ?? ''}
                               onChange={(ev) => update(e, { notes: ev.target.value })} aria-label={`Note : ${e.name}`} />
                        <VdaStepper value={e.quantity ?? 1} min={0} max={999} onChange={(v) => update(e, { quantity: v })} label={`Quantité : ${e.name}`} />
                        <button type="button" className="vda-chip" onClick={() => remove(e)} aria-label={`Retirer ${e.name}`} title="Retirer">✕</button>
                    </div>
                </div>
            ))}
            {catalogOpen && (
                <CatalogModal
                    title="Équipement" subtitle="Armes, armures, boucliers ; les autres objets par « Objet libre »"
                    items={EQUIPMENT_CATALOG} getKey={i => `${i.kind}-${i.key}`} renderItem={renderCatalogItem} filters={EQUIPMENT_FILTERS}
                    onAdd={(i) => add(toEquipmentRow(i, equipment))}
                    onAddCustom={(d) => add(d.kind === 'weapon'
                        ? { kind: 'weapon', itemKey: null, name: d.name.trim(), damage: d.damage, difficulty: 6, equipped: true }
                        : { kind: 'item', itemKey: null, name: d.name.trim(), quantity: d.quantity, notes: d.notes.trim(), equipped: true })}
                    renderCustomForm={renderCustomForm} customDefaults={CUSTOM_DEFAULTS} isCustomValid={isCustomValid}
                    onClose={() => setCatalogOpen(false)}
                />
            )}
        </div>
    );
};
