// src/client/src/systems/woddavampire/components/npc/VdaNpcForm.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Formulaire de la partie système d'un PNJ du Conteur (spec_pnj.md §10.3), posé par
// la brique NpcForm (props { value, onChange }) : la nature choisit les blocs.
//   - personnage, fantôme, animal : Attributs (6 pour un animal), Capacités, Disciplines,
//     Volonté, sang (Passion), santé saisie comme dans le livre, attaques ;
//   - nuée : dégâts, santé, initiative ; esprit : Volonté, Rage, Gnose, Essence, Charmes ;
//   - traits (pouvoirs, notes) pour tous.
// Capacités et Disciplines : nom du jeu reconnu (clé), sinon gardé tel quel.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import NpcItemList from '../../../../components/npc/NpcItemList.jsx';
import { ATTRIBUTE_GROUPS, ABILITY_LABELS } from '../../config/traits.js';
import { DISCIPLINES } from '../../config/disciplines.js';
import { DAMAGE_TYPE_SHORT } from '../../config/equipment.js';
import { NATURES, formatHealth, parseHealth } from '../../config/rules/npc.js';
import { VdaChip, VdaStepper } from '../ui/VdaUi.jsx';

const ABILITY_KEY = Object.fromEntries(Object.entries(ABILITY_LABELS).map(([k, l]) => [l, k]));
const DISCIPLINE_KEY = Object.fromEntries(Object.entries(DISCIPLINES).map(([k, d]) => [d.label, k]));
const toRows = (list, labels) => (list ?? []).map(x => ({ ...x, name: labels[x.key]?.label ?? labels[x.key] ?? x.key }));
const fromRows = (rows, keys) => rows.map(({ name, ...x }) => ({ ...x, key: keys[name] ?? name }));

const Num = ({ label, value, onChange, min = 0, max = 99 }) => (
    <span className="vda-npc-value"><b>{label}</b><VdaStepper value={value ?? 0} min={min} max={max} onChange={onChange} label={label} /></span>
);

const VdaNpcForm = ({ value, onChange }) => {
    const sd = value;
    const nature = sd.nature ?? 'character';
    const set = (patch) => onChange({ ...sd, ...patch });
    // Santé : texte saisi gardé ici, niveaux enregistrés au fil de la saisie (formulaire remonté par fiche)
    const [healthText, setHealthText] = useState(() => formatHealth(sd.health));
    const groups = nature === 'animal' ? ATTRIBUTE_GROUPS.filter(g => g.key !== 'social') : ATTRIBUTE_GROUPS;

    return (
        <div className="vda-npc-form">
            <div className="vda-chips">
                {Object.entries(NATURES).map(([k, l]) => <VdaChip key={k} on={nature === k} onClick={() => set({ nature: k })}>{l}</VdaChip>)}
            </div>

            {nature === 'swarm' && (
                <div className="vda-npc-values">
                    <Num label="Dégâts (dés)" value={sd.damage} onChange={v => set({ damage: v })} />
                    <Num label="Santé" value={sd.healthPoints} onChange={v => set({ healthPoints: v })} />
                    <Num label="Initiative" value={sd.initiative} onChange={v => set({ initiative: v })} />
                </div>
            )}

            {nature === 'spirit' && (
                <>
                    <div className="vda-npc-values">
                        <Num label="Volonté" value={sd.willpower} onChange={v => set({ willpower: v })} />
                        <Num label="Rage" value={sd.rage} onChange={v => set({ rage: v })} />
                        <Num label="Gnose" value={sd.gnosis} onChange={v => set({ gnosis: v })} />
                        <Num label="Essence" value={sd.essence} onChange={v => set({ essence: v })} max={200} />
                    </div>
                    <span className="vda-label">Charmes</span>
                    <NpcItemList items={sd.charms ?? []} onChange={charms => set({ charms })} addLabel="+ Charme"
                                 newItem={() => ({ name: '', cost: '', text: '' })}
                                 fields={[{ key: 'name', placeholder: 'Charme' }, { key: 'cost', placeholder: 'Coût', narrow: true },
                                          { key: 'text', placeholder: 'Effet', multiline: true }]} />
                </>
            )}

            {['character', 'ghost', 'animal'].includes(nature) && (
                <>
                    <span className="vda-label">Attributs</span>
                    {groups.map(g => (
                        <div key={g.key} className="vda-npc-values">
                            {g.attributes.map(([k, l]) => (
                                <Num key={k} label={l} value={sd.attributes?.[k]} max={10} onChange={v => set({ attributes: { ...(sd.attributes ?? {}), [k]: v } })} />
                            ))}
                        </div>
                    ))}
                    <span className="vda-label">Capacités</span>
                    <NpcItemList items={toRows(sd.abilities, ABILITY_LABELS)} onChange={rows => set({ abilities: fromRows(rows, ABILITY_KEY) })}
                                 addLabel="+ Capacité" newItem={() => ({ name: '', rating: 1, specialty: '' })}
                                 fields={[{ key: 'name', placeholder: 'Capacité', list: Object.values(ABILITY_LABELS) },
                                          { key: 'specialty', placeholder: 'Spécialité' },
                                          { key: 'rating', placeholder: 'Valeur', type: 'number', narrow: true }]} />
                    <span className="vda-label">Disciplines</span>
                    <NpcItemList items={toRows(sd.disciplines, DISCIPLINES)} onChange={rows => set({ disciplines: fromRows(rows, DISCIPLINE_KEY) })}
                                 addLabel="+ Discipline" newItem={() => ({ name: '', rating: 1 })}
                                 fields={[{ key: 'name', placeholder: 'Discipline', list: Object.values(DISCIPLINES).map(d => d.label) },
                                          { key: 'rating', placeholder: 'Niveau', type: 'number', narrow: true }]} />
                    <div className="vda-npc-values">
                        <Num label="Volonté" value={sd.willpower} max={10} onChange={v => set({ willpower: v })} />
                        <Num label={nature === 'ghost' ? 'Passion' : 'Sang'} value={sd.blood} max={50} onChange={v => set({ blood: v })} />
                    </div>
                    <label className="block">
                        <span className="vda-label">Santé (vide : les 7 niveaux du livre)</span>
                        <input className="vda-input" value={healthText} placeholder="OK, −1, −1, −2, −5, Neutralisé"
                               onChange={e => { setHealthText(e.target.value); set({ health: parseHealth(e.target.value) }); }} />
                    </label>
                    <span className="vda-label">Attaques</span>
                    <NpcItemList items={sd.attacks ?? []} onChange={attacks => set({ attacks })} addLabel="+ Attaque"
                                 newItem={() => ({ name: '', dice: 2, type: 'bashing', text: '' })}
                                 fields={[{ key: 'name', placeholder: 'Attaque' }, { key: 'dice', placeholder: 'Dés', type: 'number', narrow: true },
                                          { key: 'type', options: DAMAGE_TYPE_SHORT }, { key: 'text', placeholder: 'Effet', multiline: true }]} />
                </>
            )}

            <span className="vda-label">Traits, pouvoirs, notes</span>
            <NpcItemList items={sd.traits ?? []} onChange={traits => set({ traits })} addLabel="+ Trait"
                         newItem={() => ({ name: '', text: '' })}
                         fields={[{ key: 'name', placeholder: 'Trait' }, { key: 'text', placeholder: 'Effet', multiline: true }]} />
        </div>
    );
};

export default VdaNpcForm;
