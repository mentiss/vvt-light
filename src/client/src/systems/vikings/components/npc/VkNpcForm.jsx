// src/client/src/systems/vikings/components/npc/VkNpcForm.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Formulaire de la partie système d'un PNJ de Vikings (spec_pnj.md §10.2), posé par
// la brique NpcForm (props { value, onChange }) : caractéristiques (1 à 5), Armure,
// Seuil de combat, actions, tokens de Blessure (5 pour un humain), malus de base (succès), compétences (liste du jeu en suggestion, niveau 0 à 5,
// spécialisation), armes, traits (dont les traits réservés au MJ).
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import NpcItemList from '@/features/npc/NpcItemList.jsx';
import VkIcon from '../ui/VkIcon.jsx';
import { CARACNAMES, COMPETENCES } from '../../config/competences.js';
import { CARAC_KEYS } from '../../config/npc.js';

const SKILL_NAMES = COMPETENCES.map(c => c.name);
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

const Stepper = ({ label, value, min, max, onChange }) => (
    <div className="vk-npc-counter">
        <span className="vk-label">{label}</span>
        <span className="vk-stepper">
            <button type="button" onClick={() => onChange(clamp(value - 1, min, max))} disabled={value <= min} aria-label={`${label} : un de moins`}><VkIcon name="minus" /></button>
            <span className="vk-num">{value}</span>
            <button type="button" onClick={() => onChange(clamp(value + 1, min, max))} disabled={value >= max} aria-label={`${label} : un de plus`}><VkIcon name="plus" /></button>
        </span>
    </div>
);

const VkNpcForm = ({ value, onChange }) => {
    const sd = value;
    const set = (patch) => onChange({ ...sd, ...patch });
    // Niveau de compétence borné 0 à 5 (saisie libre sinon)
    const setSkills = (skills) => set({ skills: skills.map(s => ({ ...s, level: s.level == null ? null : clamp(Math.trunc(s.level), 0, 5) })) });

    return (
        <div className="vk-npc-form">
            <span className="vk-field-label">Caractéristiques</span>
            <div className="vk-npc-grid">
                {CARAC_KEYS.map(k => (
                    <Stepper key={k} label={CARACNAMES[k]} value={sd.caracs?.[k] ?? 2} min={1} max={5}
                             onChange={v => set({ caracs: { ...(sd.caracs ?? {}), [k]: v } })} />
                ))}
            </div>
            <div className="vk-npc-grid">
                <Stepper label="Armure" value={sd.armure ?? 0} min={0} max={10} onChange={v => set({ armure: v })} />
                <Stepper label="Seuil de combat" value={sd.seuil ?? 1} min={1} max={10} onChange={v => set({ seuil: v })} />
                <Stepper label="Actions" value={sd.actions ?? 1} min={1} max={5} onChange={v => set({ actions: v })} />
                <Stepper label="Tokens de Blessure" value={sd.blessureMax ?? 5} min={1} max={20} onChange={v => set({ blessureMax: v })} />
                <Stepper label="Malus de base (succès)" value={sd.malus ?? 0} min={0} max={5} onChange={v => set({ malus: v })} />
            </div>

            <span className="vk-field-label">Compétences</span>
            <NpcItemList items={sd.skills ?? []} onChange={setSkills} addLabel="+ Compétence"
                         newItem={() => ({ name: '', level: 1, specialization: '' })}
                         fields={[{ key: 'name', placeholder: 'Compétence', list: SKILL_NAMES },
                                  { key: 'specialization', placeholder: 'Spécialisation' },
                                  { key: 'level', placeholder: 'Niveau', type: 'number', narrow: true }]} />

            <span className="vk-field-label">Armes</span>
            <NpcItemList items={sd.weapons ?? []} onChange={weapons => set({ weapons })} addLabel="+ Arme"
                         newItem={() => ({ name: '', damage: '' })}
                         fields={[{ key: 'name', placeholder: 'Arme' }, { key: 'damage', placeholder: 'Dégâts', narrow: true }]} />

            <span className="vk-field-label">Traits</span>
            <NpcItemList items={sd.traits ?? []} onChange={traits => set({ traits })} addLabel="+ Trait"
                         newItem={() => ({ name: '', text: '' })}
                         fields={[{ key: 'name', placeholder: 'Trait' }, { key: 'text', placeholder: 'Effet', multiline: true }]} />
        </div>
    );
};

export default VkNpcForm;
