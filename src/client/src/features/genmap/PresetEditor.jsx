// src/client/src/features/genmap/PresetEditor.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Éditeur d'un preset personnel du générateur de plans (spec_genmap.md §41, M6, S-6, S-7).
// Version fonctionnelle, sans travail de présentation : nom, contexte (époque, rang), pièces
// obligatoires et de complément (type ou famille, quantité, étage, libellé libre, hôte), escaliers
// (dispositions et cages), réglages par défaut repris de la page.
// Les listes déroulantes sont des <select> natifs : 45 types de pièces rangés par catégorie, une
// rangée de pastilles serait illisible (F-CONTROLS, préférence assumée pour cet outil).
// ─────────────────────────────────────────────────────────────────────────────

/* eslint-disable vtt/F-CONTROLS -- listes longues (types, étages, niveaux) dans un outil fonctionnel, §41 */

import React, { useState } from 'react';
import library from './data/library.json';
import { fitsContext } from './tools/generate.js';

const FLOORS = [
    { id: 'ground', label: 'RDC' }, { id: 'upper', label: 'Étage (tiré)' }, { id: 'top', label: 'Dernier étage' },
    { id: 'basement', label: 'Sous-sol' }, { id: 'any', label: 'Libre' },
    ...[1, 2, 3, 4].map(n => ({ id: String(n), label: `Étage ${n}` })),
];
const LEVELS = [
    { id: 'basement', label: 'Sous-sol' }, { id: 'ground', label: 'RDC' },
    ...[1, 2, 3, 4].map(n => ({ id: String(n), label: `Étage ${n}` })), { id: 'top', label: 'Dernier étage' },
];
const KINDS = [{ id: 'straight', label: 'Droit' }, { id: 'spiral', label: 'Colimaçon' }, { id: 'trap', label: 'Trappe' }];

const range = (q) => (Array.isArray(q) ? q : [q ?? 1, q ?? 1]);
const quantity = (min, max) => (min === max ? min : [min, max]);
const without = (list, i) => list.filter((_, k) => k !== i);
const replace = (list, i, value) => list.map((v, k) => (k === i ? value : v));

// Liste des types, par catégorie ; hors contexte masqués sauf demande (« toutes les pièces »,
// §36.8) ; le type déjà choisi reste toujours proposé
const TypeSelect = ({ value, onChange, roomTypes, ctx, all }) => (
    <select className="vtt-input" value={value} onChange={e => onChange(e.target.value)}>
        {library.categories.map(c => {
            const types = roomTypes.filter(t => t.category === c.id && (all || t.id === value || fitsContext(t, ctx)));
            return types.length ? (
                <optgroup key={c.id} label={c.label}>
                    {types.map(t => <option key={t.id} value={t.id}>{t.label}{fitsContext(t, ctx) ? '' : ' (hors époque)'}</option>)}
                </optgroup>
            ) : null;
        })}
    </select>
);

// Une entrée du programme : type ou famille, quantité, étage, libellé libre, hôte (complément)
const RoomRow = ({ entry, onChange, onRemove, roomTypes, ctx, all, hosts }) => {
    const [min, max] = range(entry.quantity);
    const set = (patch) => onChange(Object.fromEntries(Object.entries({ ...entry, ...patch }).filter(([, v]) => v !== '' && v != null)));
    const model = roomTypes.find(t => t.id === entry.type);
    return (
        <li className="vtt-panel p-2 space-y-1">
            <div className="flex gap-1">
                {entry.family ? (
                    <select className="vtt-input" value={entry.family} onChange={e => set({ family: e.target.value })}>
                        {library.families.map(f => <option key={f.id} value={f.id}>Famille : {f.label}</option>)}
                    </select>
                ) : (
                    <TypeSelect value={entry.type} onChange={type => set({ type })} roomTypes={roomTypes} ctx={ctx} all={all} />
                )}
                <button type="button" className="vtt-btn vtt-btn-sm" onClick={onRemove} title="Retirer">×</button>
            </div>
            <div className="grid grid-cols-3 gap-1 text-xs">
                <label>Min <input type="number" min={0} className="vtt-input" value={min} onChange={e => set({ quantity: quantity(Number(e.target.value), Math.max(max, Number(e.target.value))) })} /></label>
                <label>Max <input type="number" min={0} className="vtt-input" value={max} onChange={e => set({ quantity: quantity(Math.min(min, Number(e.target.value)), Number(e.target.value)) })} /></label>
                <label>Étage
                    <select className="vtt-input" value={entry.floor ?? ''} onChange={e => set({ floor: e.target.value })}>
                        <option value="">Celui du type</option>
                        {FLOORS.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
                    </select>
                </label>
            </div>
            {!entry.family && (
                // Pièce libre (S-7) : un type existant sert de modèle, sous un autre nom
                <input className="vtt-input text-xs" placeholder={`Nom libre (sinon « ${model?.label ?? ''} »)`} value={entry.label ?? ''} onChange={e => set({ label: e.target.value })} />
            )}
            {hosts && (
                <select className="vtt-input text-xs" value={entry.per ?? ''} onChange={e => set({ per: e.target.value })}>
                    <option value="">Pièce seule (tirée selon la place)</option>
                    {hosts.map(t => <option key={t.id} value={t.id}>Annexe de chaque {t.label.toLowerCase()}</option>)}
                </select>
            )}
        </li>
    );
};

// Une cage d'escalier : nom, plage de niveaux, genre, taille (§38.5)
const CageRow = ({ cage, onChange, onRemove }) => {
    const set = (patch) => onChange({ ...cage, ...patch });
    return (
        <li className="grid grid-cols-2 gap-1 text-xs vtt-panel p-2">
            <input className="vtt-input col-span-2" value={cage.label} onChange={e => set({ label: e.target.value })} />
            <label>De <select className="vtt-input" value={cage.from} onChange={e => set({ from: e.target.value })}>{LEVELS.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}</select></label>
            <label>À <select className="vtt-input" value={cage.to} onChange={e => set({ to: e.target.value })}>{LEVELS.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}</select></label>
            <label>Genre <select className="vtt-input" value={Array.isArray(cage.kind) ? cage.kind[0] : cage.kind} onChange={e => set({ kind: e.target.value, size: e.target.value === 'spiral' ? 4 : e.target.value === 'trap' ? 2 : 6 })}>{KINDS.map(k => <option key={k.id} value={k.id}>{k.label}</option>)}</select></label>
            <label>Cases <input type="number" min={2} className="vtt-input" value={typeof cage.size === 'object' ? 6 : cage.size} onChange={e => set({ size: Number(e.target.value) })} /></label>
            <button type="button" className="vtt-btn vtt-btn-sm col-span-2" onClick={onRemove}>Retirer la cage</button>
        </li>
    );
};

/**
 * @param {object}   preset      preset personnel (format des fichiers de data/presets)
 * @param {Function} onChange    (preset) => void, preset modifié
 * @param {object[]} roomTypes   bibliothèque
 * @param {string}   era         époque choisie dans la page (types proposés d'abord)
 * @param {Function} onTakeParams () => void : reprendre les réglages de la page comme réglages par défaut
 */
const PresetEditor = ({ preset, onChange, roomTypes, era, onTakeParams }) => {
    const [all, setAll] = useState(false);
    const set = (patch) => onChange({ ...preset, ...patch });
    const ctx = { era, traits: preset.context?.traits?.default ?? [], rank: preset.context?.rank ?? null };
    const context = preset.context ?? { era: null, traits: { accepted: [], default: [] }, rank: null };
    const setContext = (patch) => set({ context: { ...context, ...patch } });
    const eraRange = context.era ?? { from: null, to: null, default: null };
    const setEra = (patch) => setContext({ era: Object.values({ ...eraRange, ...patch }).some(Boolean) ? { ...eraRange, ...patch } : null });
    // Pièce ajoutée : la première pièce ordinaire qui a un sens à cette époque (pas l'entrée)
    const firstType = roomTypes.find(t => t.role === 'room' && fitsContext(t, ctx)) ?? roomTypes[0];
    const hosts = roomTypes.filter(t => (preset.rooms ?? []).some(e => e.type === t.id));
    const stairs = preset.stairs ?? [];

    const eraSelect = (key, empty) => (
        <select className="vtt-input" value={eraRange[key] ?? ''} onChange={e => setEra({ [key]: e.target.value || null })}>
            <option value="">{empty}</option>
            {library.eras.map(e => <option key={e.id} value={e.id}>{e.label}</option>)}
        </select>
    );

    return (
        <div className="space-y-4 text-sm">
            <label className="block">
                <span className="vtt-field-label">Nom du preset</span>
                <input className="vtt-input" value={preset.label} onChange={e => set({ label: e.target.value })} />
            </label>

            <section className="space-y-1">
                <span className="vtt-field-label">Contexte</span>
                <div className="grid grid-cols-3 gap-1 text-xs">
                    <label>Époque de {eraSelect('from', 'Toutes')}</label>
                    <label>à {eraSelect('to', 'Toutes')}</label>
                    <label>Référence {eraSelect('default', 'Aucune')}</label>
                </div>
                <label className="block text-xs">Rang
                    <select className="vtt-input" value={context.rank ?? ''} onChange={e => setContext({ rank: e.target.value || null })}>
                        <option value="">Aucun</option>
                        {library.ranks.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
                    </select>
                </label>
            </section>

            <section className="space-y-1">
                <span className="vtt-field-label">Réglages par défaut</span>
                <p className="text-xs text-muted">
                    {preset.params.width} × {preset.params.length}, {preset.params.floors} étage(s){preset.params.basement ? ', sous-sol' : ''}, {preset.params.density}
                    {preset.params.outline === 'shape' ? `, gabarit ${preset.params.shape}` : ''}
                </p>
                <button type="button" className="vtt-btn vtt-btn-sm" onClick={onTakeParams}>Reprendre les réglages de la page</button>
            </section>

            <label className="flex items-center gap-2 text-xs">
                <input type="checkbox" checked={all} onChange={e => setAll(e.target.checked)} />
                Proposer toutes les pièces, même hors de l'époque choisie
            </label>

            <section className="space-y-1">
                <span className="vtt-field-label">Pièces obligatoires</span>
                <ul className="space-y-1">
                    {preset.rooms.map((entry, i) => (
                        <RoomRow key={i} entry={entry} roomTypes={roomTypes} ctx={ctx} all={all}
                            onChange={next => set({ rooms: replace(preset.rooms, i, next) })}
                            onRemove={() => set({ rooms: without(preset.rooms, i) })} />
                    ))}
                </ul>
                <button type="button" className="vtt-btn vtt-btn-sm" onClick={() => set({ rooms: [...preset.rooms, { type: firstType.id, quantity: 1 }] })}>Ajouter une pièce</button>
            </section>

            <section className="space-y-1">
                <span className="vtt-field-label">Complément, selon la place</span>
                <ul className="space-y-1">
                    {(preset.optionalRooms ?? []).map((entry, i) => (
                        <RoomRow key={i} entry={entry} roomTypes={roomTypes} ctx={ctx} all={all} hosts={hosts}
                            onChange={next => set({ optionalRooms: replace(preset.optionalRooms, i, next) })}
                            onRemove={() => set({ optionalRooms: without(preset.optionalRooms, i) })} />
                    ))}
                </ul>
                <div className="flex gap-2">
                    <button type="button" className="vtt-btn vtt-btn-sm" onClick={() => set({ optionalRooms: [...(preset.optionalRooms ?? []), { type: firstType.id, quantity: [0, 1] }] })}>Ajouter une pièce</button>
                    <button type="button" className="vtt-btn vtt-btn-sm" onClick={() => set({ optionalRooms: [...(preset.optionalRooms ?? []), { family: library.families[0].id, quantity: [0, 1] }] })}>Ajouter une famille</button>
                </div>
            </section>

            <section className="space-y-2">
                <span className="vtt-field-label">Escaliers (la graine tire une disposition)</span>
                {stairs.map((d, i) => (
                    <div key={i} className="space-y-1">
                        <div className="flex justify-between text-xs">
                            <span>Disposition {i + 1}</span>
                            <button type="button" className="vtt-btn vtt-btn-sm" onClick={() => set({ stairs: without(stairs, i) })}>Retirer</button>
                        </div>
                        <ul className="space-y-1">
                            {d.cages.map((cage, k) => (
                                <CageRow key={k} cage={cage}
                                    onChange={next => set({ stairs: replace(stairs, i, { cages: replace(d.cages, k, next) }) })}
                                    onRemove={() => set({ stairs: replace(stairs, i, { cages: without(d.cages, k) }) })} />
                            ))}
                        </ul>
                        <button type="button" className="vtt-btn vtt-btn-sm" onClick={() => set({ stairs: replace(stairs, i, { cages: [...d.cages, { label: 'Escalier', from: 'ground', to: 'top', kind: 'straight', size: 6 }] }) })}>Ajouter une cage</button>
                    </div>
                ))}
                <button type="button" className="vtt-btn vtt-btn-sm" onClick={() => set({ stairs: [...stairs, { cages: [{ label: 'Escalier', from: 'ground', to: 'top', kind: 'straight', size: 6 }] }] })}>Ajouter une disposition</button>
                {!stairs.length && <p className="text-xs text-muted">Sans disposition, le moteur ajoute un escalier par étage et un escalier de cave.</p>}
            </section>
        </div>
    );
};

export default PresetEditor;
