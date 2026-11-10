// src/client/src/systems/nimble/components/npc/NbNpcForm.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Formulaire de la partie système d'un monstre de Nimble (spec_pnj.md §8, L3-5),
// posé par la brique NpcForm (props { value, onChange }) : niveau, taille, sbire
// ou légendaire, PV (par héros pour un légendaire), armure, vitesse, sauvegardes,
// attaques, capacités, sections (légendaires : En sang, Baroud d'honneur…).
// Même format que le bestiaire (documentations/nimble/format_catalogues.md §7).
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { MONSTER_SIZES } from '../../config/bestiary.js';
import { ARMOR_LABELS } from '../../config/rules/encounter.js';

// Liste éditable : une ligne par entrée, champs simples puis texte
const ItemList = ({ items, onChange, fields, newItem, addLabel }) => (
    <div className="nb-npc-list">
        {items.map((item, i) => (
            // relecture: F-KEY — lignes sans identifiant stable, éditées en place
            <div key={i} className="nb-npc-list-row">
                <div className="nb-npc-list-fields">
                    {fields.filter(f => !f.multiline).map(f => (f.toggle ? (
                        <button key={f.key} type="button" className={`vtt-pill${item[f.key] ? ' is-selected' : ''}`}
                                onClick={() => onChange(items.map((x, j) => (j === i ? { ...x, [f.key]: !x[f.key] } : x)))}>{f.label}</button>
                    ) : (
                        <input key={f.key} className={`nb-input${f.narrow ? ' is-num' : ''}`} type={f.type ?? 'text'} placeholder={f.placeholder}
                               aria-label={f.placeholder} value={item[f.key] ?? ''}
                               onChange={e => onChange(items.map((x, j) => (j === i ? { ...x, [f.key]: f.type === 'number' ? Number(e.target.value) || 0 : e.target.value } : x)))} />
                    )))}
                    <button type="button" className="vtt-btn vtt-btn-sm vtt-btn-icon vtt-npc-icon-btn" aria-label="Retirer" title="Retirer"
                            onClick={() => onChange(items.filter((_, j) => j !== i))}>✕</button>
                </div>
                {fields.filter(f => f.multiline).map(f => (
                    <textarea key={f.key} className="nb-input" rows={2} placeholder={f.placeholder} aria-label={f.placeholder} value={item[f.key] ?? ''}
                              onChange={e => onChange(items.map((x, j) => (j === i ? { ...x, [f.key]: e.target.value } : x)))} />
                ))}
            </div>
        ))}
        <button type="button" className="vtt-btn vtt-btn-sm" onClick={() => onChange([...items, newItem()])}>{addLabel}</button>
    </div>
);

const ARMORS = [{ v: null, l: 'Sans armure' }, { v: 'medium', l: ARMOR_LABELS.medium }, { v: 'heavy', l: ARMOR_LABELS.heavy }];

const NbNpcForm = ({ value, onChange }) => {
    const m = value;
    const set = (patch) => onChange({ ...m, ...patch });
    return (
        <div className="nb-fields">
            <div className="nb-name-fields">
                <label className="block"><span className="vtt-field-label">Niveau</span>
                    <input className="nb-input" value={m.level ?? ''} placeholder="1, 1/2…" onChange={e => set({ level: e.target.value })} /></label>
                <label className="block"><span className="vtt-field-label">{m.minion ? 'PV (sbire : tout dégât en tue un)' : m.hpPerHero ? 'PV par héros' : 'PV'}</span>
                    <input className="nb-input" type="number" min="0" value={m.hp ?? ''} disabled={!!m.minion} onChange={e => set({ hp: Number(e.target.value) || 0 })} /></label>
                <label className="block"><span className="vtt-field-label">Vitesse</span>
                    <input className="nb-input" value={m.speed ?? ''} placeholder="6, Vol 8…" onChange={e => set({ speed: e.target.value || null })} /></label>
                <label className="block"><span className="vtt-field-label">Sauvegardes</span>
                    <input className="nb-input" value={m.saves ?? ''} placeholder="FOR+, INT–" onChange={e => set({ saves: e.target.value || null })} /></label>
            </div>
            <div className="nb-pills">
                <button type="button" className={`vtt-pill${m.minion ? ' is-selected' : ''}`} onClick={() => set({ minion: !m.minion, legendary: false, hpPerHero: false })}>Sbire</button>
                <button type="button" className={`vtt-pill${m.legendary ? ' is-selected' : ''}`} onClick={() => set({ legendary: !m.legendary, minion: false, hpPerHero: m.legendary ? false : m.hpPerHero })}>Légendaire</button>
                {m.legendary && <button type="button" className={`vtt-pill${m.hpPerHero ? ' is-selected' : ''}`} onClick={() => set({ hpPerHero: !m.hpPerHero })}>PV par héros</button>}
            </div>
            <div className="nb-pills">
                {ARMORS.map(o => <button key={String(o.v)} type="button" className={`vtt-pill${(m.armor ?? null) === o.v ? ' is-selected' : ''}`} onClick={() => set({ armor: o.v })}>{o.l}</button>)}
            </div>
            <div className="nb-pills">
                {Object.entries(MONSTER_SIZES).map(([k, l]) => <button key={k} type="button" className={`vtt-pill${m.size === k ? ' is-selected' : ''}`} onClick={() => set({ size: k })}>{l}</button>)}
            </div>

            <span className="vtt-field-label">Attaques</span>
            <ItemList items={m.attacks ?? []} onChange={attacks => set({ attacks })} addLabel="+ Attaque"
                      newItem={() => ({ name: '', dice: '1d6', bonus: 0, noCrit: !!m.minion, text: '' })}
                      fields={[{ key: 'name', placeholder: 'Nom' }, { key: 'dice', placeholder: 'Dés (1d8)', narrow: true },
                               { key: 'bonus', placeholder: 'Bonus', type: 'number', narrow: true }, { key: 'noCrit', label: 'Sans critique', toggle: true },
                               { key: 'text', placeholder: 'Effet', multiline: true }]} />

            <span className="vtt-field-label">Capacités</span>
            <ItemList items={m.abilities ?? []} onChange={abilities => set({ abilities })} addLabel="+ Capacité"
                      newItem={() => ({ name: '', text: '' })}
                      fields={[{ key: 'name', placeholder: 'Nom' }, { key: 'text', placeholder: 'Effet', multiline: true }]} />

            {(m.legendary || (m.sections ?? []).length > 0) && (
                <>
                    <span className="vtt-field-label">Sections (légendaire : En sang, Baroud d'honneur…)</span>
                    <ItemList items={m.sections ?? []} onChange={sections => set({ sections })} addLabel="+ Section"
                              newItem={() => ({ title: '', text: '' })}
                              fields={[{ key: 'title', placeholder: 'Titre' }, { key: 'text', placeholder: 'Texte', multiline: true }]} />
                </>
            )}
        </div>
    );
};

export default NbNpcForm;
