// src/client/src/systems/vikings/components/layout/CombatSection.jsx
// Pratique du combat hors système de combat (spec_vikings.md §8.2) :
// armure totale et boucliers, actions, seuil, posture passive par compétence.
// Valeurs recalculées (getCombatValues) ; l'ajustement bonus/malus n'apparaît
// qu'en mode édition (L3-6).

import React from 'react';
import { getCombatValues, getPassivePostures } from '../../config/rules.js';
import VkPanel from '../ui/VkPanel.jsx';
import VkIcon from '../ui/VkIcon.jsx';

const Value = ({ label, value, sub, editMode, mod = 0, onModChange }) => (
    <div className="vk-stat">
        <div className="val">{value}</div>
        <div className="lbl">{label}</div>
        {sub && <div className="sub">{sub}</div>}
        {editMode && (
            <div className="mt-1" title="Ajustement (bonus / malus)">
                <div className="vk-stepper">
                    <button type="button" onClick={() => onModChange(mod - 1)}><VkIcon name="minus" /></button>
                    <span className="vk-num">{mod > 0 ? `+${mod}` : mod}</span>
                    <button type="button" onClick={() => onModChange(mod + 1)}><VkIcon name="plus" /></button>
                </div>
            </div>
        )}
    </div>
);

const CombatSection = ({ char, editMode, set }) => {
    const v        = getCombatValues(char);
    const postures = getPassivePostures(char);
    const armureSub = [
        v.armureNaturelle ? `nat. ${v.armureNaturelle}` : null,
        v.armureEquipee   ? `portée ${v.armureEquipee}` : null,
    ].filter(Boolean).join(' · ');

    return (
        <VkPanel>
            <div className="vk-section-title">Combat</div>

            <div className="grid grid-cols-3 gap-2 mb-3">
                <Value label="Armure"  value={v.armureTotale} sub={armureSub}
                       editMode={editMode} mod={char.armureMod ?? 0} onModChange={n => set('armureMod', n)} />
                <Value label="Actions" value={v.actions}
                       editMode={editMode} mod={char.actionsMod ?? 0} onModChange={n => set('actionsMod', n)} />
                <Value label="Seuil"   value={v.seuil}
                       editMode={editMode} mod={char.seuilMod ?? 0} onModChange={n => set('seuilMod', n)} />
            </div>
            {editMode && (
                <p className="text-xs text-muted mb-2">
                    Ajustement : effets conditionnels (en mer, armure légère…), objets ou situations particulières.
                </p>
            )}

            {v.boucliers.length > 0 && (
                <div className="text-sm mb-2 flex items-center gap-2 flex-wrap">
                    <VkIcon name="shield" className="text-primary" />
                    {v.boucliers.map(b => `${b.name} (${b.armorValue})`).join(', ')}
                    <span className="text-muted">— encaisse en premier, se brise au-delà</span>
                </div>
            )}

            <div className="vk-sep-line" />
            <div className="vk-label text-primary mb-1">Posture passive</div>
            {postures.length === 0 ? (
                <p className="text-sm text-muted italic">Aucune compétence de combat au contact.</p>
            ) : (
                <>
                    {postures.map(p => (
                        <div key={`${p.skill.name}-${p.skill.specialization || 'default'}`} className="vk-row text-sm">
                            <span className="flex-1">{p.label} <span className="text-muted">niv {p.skill.level}</span></span>
                            <span>+{p.bonus} → seuil de défense <strong className="vk-row-val">{p.seuilDefense}</strong></span>
                        </div>
                    ))}
                    <p className="text-xs text-muted mt-1">Nécessite 1 action disponible.</p>
                </>
            )}
        </VkPanel>
    );
};

export default CombatSection;
