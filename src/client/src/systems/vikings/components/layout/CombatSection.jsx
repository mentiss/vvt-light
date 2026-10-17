// src/client/src/systems/vikings/components/layout/CombatSection.jsx
// Pratique du combat hors système de combat (spec_vikings.md §8.2) :
// armure totale et boucliers, actions, seuil, posture passive par compétence.
// Valeurs recalculées depuis les traits et l'équipement (getCombatValues) ;
// l'ajustement bonus/malus n'apparaît qu'en mode édition (L3-6).

import React from 'react';
import { getCombatValues, getPassivePostures } from '../../config/rules.js';

const AdjustStepper = ({ value, onChange }) => (
    <div className="flex items-center justify-center gap-1 mt-1" title="Ajustement (bonus / malus)">
        <button onClick={() => onChange(value - 1)} className="w-4 h-4 bg-primary rounded-full text-xs font-bold text-default leading-none">-</button>
        <span className="text-[10px] text-muted w-6 text-center">{value > 0 ? `+${value}` : value}</span>
        <button onClick={() => onChange(value + 1)} className="w-4 h-4 bg-primary rounded-full text-xs font-bold text-default leading-none">+</button>
    </div>
);

const Value = ({ label, value, detail, editMode, mod, onModChange }) => (
    <div className="text-center p-1.5 bg-default rounded">
        <div className="text-xs text-muted">{label}</div>
        <div className="font-bold text-lg text-default">{value}</div>
        {detail && <div className="text-[10px] text-muted">{detail}</div>}
        {editMode && <AdjustStepper value={mod ?? 0} onChange={onModChange} />}
    </div>
);

const CombatSection = ({ char, editMode, set }) => {
    const v        = getCombatValues(char);
    const postures = getPassivePostures(char);
    const armureDetail = [
        v.armureNaturelle ? `naturelle ${v.armureNaturelle}` : null,
        v.armureEquipee   ? `portée ${v.armureEquipee}` : null,
    ].filter(Boolean).join(' · ');

    return (
        <div className="bg-surface rounded-lg p-3 border-2 border-default">
            <h3 className="text-sm font-bold text-default mb-2">Pratique du combat</h3>

            <div className="grid grid-cols-3 gap-1.5">
                <Value label="Armure"  value={v.armureTotale} detail={armureDetail}
                       editMode={editMode} mod={char.armureMod} onModChange={n => set('armureMod', n)} />
                <Value label="Actions" value={v.actions}
                       editMode={editMode} mod={char.actionsMod} onModChange={n => set('actionsMod', n)} />
                <Value label="Seuil"   value={v.seuil}
                       editMode={editMode} mod={char.seuilMod} onModChange={n => set('seuilMod', n)} />
            </div>
            {editMode && (
                <p className="text-[10px] text-muted mt-1">
                    Ajustement : effets conditionnels (en mer, armure légère…), objets ou situations particulières.
                </p>
            )}

            {v.boucliers.length > 0 && (
                <div className="mt-2 text-xs text-default">
                    🛡️ {v.boucliers.map(b => `${b.name} (${b.armorValue})`).join(', ')}
                    <span className="text-muted"> — encaisse en premier, se brise au-delà</span>
                </div>
            )}

            <div className="mt-3 pt-2 border-t border-default">
                <div className="text-xs font-semibold text-default mb-1">Posture passive</div>
                {postures.length === 0 ? (
                    <p className="text-xs text-muted italic">Aucune compétence de combat au contact.</p>
                ) : (
                    <div className="space-y-1">
                        {postures.map(p => (
                            <div key={`${p.skill.name}-${p.skill.specialization || 'default'}`}
                                 className="flex justify-between items-center text-xs bg-default rounded px-2 py-1">
                                <span className="text-default">{p.label} <span className="text-muted">(niv {p.skill.level})</span></span>
                                <span className="text-default">
                                    +{p.bonus} → seuil de défense <strong>{p.seuilDefense}</strong>
                                </span>
                            </div>
                        ))}
                        <p className="text-[10px] text-muted">Nécessite 1 action disponible.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CombatSection;
