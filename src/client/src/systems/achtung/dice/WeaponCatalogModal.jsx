// src/client/src/systems/achtung/dice/WeaponCatalogModal.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Catalogue d'armes Achtung sur la modale générique CatalogModal
// (documentations/spec_ui_catalogue.md) : deux rangées de filtres (type déduit
// du catalogue, faction), objet libre = arme complète (nom, focus, portée,
// dégâts, taille, effet, salve, qualités ; focus choisi parmi ceux des
// compétences ou saisi librement). onSelect reçoit l'arme. La modale
// reste ouverte après un ajout.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import CatalogModal from '../../../components/modals/CatalogModal.jsx';
import { normalizeText } from '../../../tools/catalog.js';
import { WEAPON_CATALOG, FACTION_LABELS } from '../config/weaponCatalog.js';
import {
    RANGE_LABELS, WEAPON_RANGES, WEAPON_SIZES,
    SALVO_EFFECTS, SALVO_HAS_VALUE, SALVO_LABELS, WEAPON_QUALITIES, QUALITY_LABELS,
} from '../config.jsx';
import { SKILLS } from '../config/base.js';

// Types tirés du contenu réel du catalogue : pas de liste fermée à maintenir
const FILTERS = [
    {
        key:      'type',
        getValue: w => w.type,
        options:  [...new Set(WEAPON_CATALOG.map(w => w.type))].sort().map(t => ({ value: t, label: t })),
    },
    {
        key:      'faction',
        getValue: w => w.faction,
        options:  Object.entries(FACTION_LABELS).map(([value, label]) => ({ value, label })),
    },
];

// Arme libre complète (colonnes de la table de la fiche, spec_achtung_cthulhu.md §3.9)
const CUSTOM_DEFAULTS = { name: '', focus: '', range: 'close', damage: 1, effect: [], salvo: [], size: 'Minor', qualities: [] };
const isCustomValid = (w) => !!w.name.trim() && !!w.focus.trim() && w.damage >= 1;

// Focus d'arme proposés : ceux des compétences (Combat sans Vigilance, Lancer d'Athlétisme,
// Explosifs d'Ingénierie) ; un focus hors liste reste possible en saisie libre
const focusesOf = (skillKey) => SKILLS.find(s => s.key === skillKey)?.focuses ?? [];
const WEAPON_FOCUSES = [
    ...focusesOf('fighting').filter(f => f !== 'Vigilance'),
    ...focusesOf('athletics').filter(f => f === 'Lancer'),
    ...focusesOf('engineering').filter(f => f === 'Explosifs'),
];

// « Zone, Perforant (2) » : effets ou salve avec leur valeur éventuelle
const effectsText = (list) => (list ?? []).map(e => `${SALVO_LABELS[e.key] ?? e.key}${e.value ? ` (${e.value})` : ''}`).join(', ');

// Une caractéristique de la ligne, omise si vide
const Stat = ({ label, children }) => (children
    ? <span><span className="ac-catalog-label">{label}</span> {children}</span>
    : null);

// Tout ce qui sert à comparer deux armes : focus, dégâts, portée, taille, effet, salve, qualités.
// Couleurs dans theme.css (ac-catalog-*) : la modale suit le papier du thème.
const renderItem = (w) => (
    <div className="flex flex-col gap-1">
        <div className="flex items-baseline justify-between gap-3">
            <div className="min-w-0">
                <span className="ac-font-title text-sm">{w.name}</span>
                <span className="ac-catalog-meta text-xs ml-2">{w.type} · {FACTION_LABELS[w.faction]}</span>
            </div>
            <div className="ac-catalog-meta flex gap-2 text-xs shrink-0">
                <span className="ac-catalog-damage">{w.damage}⚄</span>
                <span>{RANGE_LABELS[w.range] ?? w.range}</span>
                <span>{w.size}</span>
            </div>
        </div>
        <div className="ac-catalog-meta flex flex-wrap gap-x-4 gap-y-0.5 text-xs">
            <Stat label="Focus">{w.focus}</Stat>
            <Stat label="Effet">{effectsText(w.effect)}</Stat>
            <Stat label="Salve">{effectsText(w.salvo)}</Stat>
            <Stat label="Qualités">{(w.qualities ?? []).map(q => QUALITY_LABELS[q] ?? q).join(', ')}</Stat>
        </div>
    </div>
);

// Focus : saisie libre avec suggestions (focus des compétences), filtrées sans accents.
// Flèches pour parcourir, Entrée pour choisir (sans envoyer le formulaire), Échap pour fermer la liste.
const FocusCombobox = ({ value, onChange }) => {
    const [open,   setOpen]   = useState(false);
    const [active, setActive] = useState(0);
    const q = normalizeText(value).trim();
    const suggestions = WEAPON_FOCUSES.filter(f => !q || normalizeText(f).includes(q));
    const showList = open && suggestions.length > 0 && !(suggestions.length === 1 && suggestions[0] === value);

    const choose = (focus) => { onChange(focus); setOpen(false); };
    const onKeyDown = (e) => {
        if (!showList) return;
        if (e.key === 'ArrowDown') { e.preventDefault(); setActive(i => (i + 1) % suggestions.length); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(i => (i - 1 + suggestions.length) % suggestions.length); }
        else if (e.key === 'Enter') { e.preventDefault(); choose(suggestions[Math.min(active, suggestions.length - 1)]); }
        else if (e.key === 'Escape') { e.stopPropagation(); setOpen(false); }
    };

    return (
        <div className="relative">
            <input
                className="vtt-input"
                value={value}
                onChange={e => { onChange(e.target.value); setOpen(true); setActive(0); }}
                onFocus={() => setOpen(true)}
                onBlur={() => setOpen(false)}
                onKeyDown={onKeyDown}
                placeholder="Choisir ou saisir un focus…"
                role="combobox"
                aria-expanded={showList}
                aria-autocomplete="list"
            />
            {showList && (
                <ul className="ac-combo-list" role="listbox">
                    {suggestions.map((f, i) => (
                        <li key={f} role="option" aria-selected={i === active}
                            className={`ac-combo-option ${i === active ? 'is-active' : ''}`}
                            onMouseDown={e => { e.preventDefault(); choose(f); }}
                            onMouseEnter={() => setActive(i)}>
                            {f}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

// Choix unique en pills
const PillChoice = ({ options, labels, value, onChange }) => (
    <div className="flex flex-wrap gap-1.5">
        {options.map(opt => (
            <button key={opt} type="button" onClick={() => onChange(opt)} className={`vtt-pill ${value === opt ? 'is-selected' : ''}`}>
                {labels?.[opt] ?? opt}
            </button>
        ))}
    </div>
);

// Effets / salve : liste de { key, value? }, valeur réglable pour les effets qui en portent une
const EffectPills = ({ values, onChange }) => (
    <div className="flex flex-wrap gap-1.5">
        {SALVO_EFFECTS.map(key => {
            const entry = values.find(v => v.key === key);
            const withValue = SALVO_HAS_VALUE.includes(key);
            const toggle = () => onChange(entry
                ? values.filter(v => v.key !== key)
                : [...values, withValue ? { key, value: 1 } : { key }]);
            const setValue = (n) => onChange(values.map(v => v.key === key ? { ...v, value: Math.max(1, n) } : v));
            return (
                <span key={key} className="inline-flex items-center gap-0.5">
                    <button type="button" onClick={toggle} className={`vtt-pill ${entry ? 'is-selected' : ''}`}>{SALVO_LABELS[key] ?? key}</button>
                    {entry && withValue && (
                        <>
                            <button type="button" onClick={() => setValue((entry.value ?? 1) - 1)} className="ac-catalog-step">−</button>
                            <span className="w-4 text-center text-xs">{entry.value ?? 1}</span>
                            <button type="button" onClick={() => setValue((entry.value ?? 1) + 1)} className="ac-catalog-step">+</button>
                        </>
                    )}
                </span>
            );
        })}
    </div>
);

// Nom, focus et dégâts (au moins 1) obligatoires ; le reste a une valeur par défaut
const CustomForm = ({ value, onChange }) => (
    <>
        <label className="block">
            <span className="vtt-field-label">Nom *</span>
            <input className="vtt-input" value={value.name} onChange={e => onChange({ name: e.target.value })} autoFocus />
        </label>
        <div>
            <span className="vtt-field-label">Focus *</span>
            <FocusCombobox value={value.focus} onChange={focus => onChange({ focus })} />
        </div>
        <div>
            <span className="vtt-field-label">Portée</span>
            <PillChoice options={WEAPON_RANGES} labels={RANGE_LABELS} value={value.range} onChange={range => onChange({ range })} />
        </div>
        <div className="flex flex-wrap gap-6">
            <label className="block">
                <span className="vtt-field-label">Dégâts ⚄ *</span>
                <input type="number" min="1" className="vtt-input w-24" value={value.damage}
                       onChange={e => onChange({ damage: Math.max(0, parseInt(e.target.value, 10) || 0) })} />
            </label>
            <div>
                <span className="vtt-field-label">Taille</span>
                <PillChoice options={WEAPON_SIZES} value={value.size} onChange={size => onChange({ size })} />
            </div>
        </div>
        <div>
            <span className="vtt-field-label">Effet (inné)</span>
            <EffectPills values={value.effect} onChange={effect => onChange({ effect })} />
        </div>
        <div>
            <span className="vtt-field-label">Salve</span>
            <EffectPills values={value.salvo} onChange={salvo => onChange({ salvo })} />
        </div>
        <div>
            <span className="vtt-field-label">Qualités</span>
            <div className="flex flex-wrap gap-1.5">
                {WEAPON_QUALITIES.map(q => {
                    const active = value.qualities.includes(q);
                    return (
                        <button key={q} type="button" className={`vtt-pill ${active ? 'is-selected' : ''}`}
                                onClick={() => onChange({ qualities: active ? value.qualities.filter(k => k !== q) : [...value.qualities, q] })}>
                            {QUALITY_LABELS[q] ?? q}
                        </button>
                    );
                })}
            </div>
        </div>
    </>
);

const WeaponCatalogModal = ({ onClose, onSelect }) => {
    const pick = (w) => {
        const { type, faction, ...weaponData } = w;
        onSelect({
            ...weaponData,
            salvo:     [...(weaponData.salvo ?? [])],
            effect:    [...(weaponData.effect ?? [])],
            qualities: [...(weaponData.qualities ?? [])],
        });
    };

    return (
        <CatalogModal
            title="Catalogue d'armes"
            items={WEAPON_CATALOG}
            renderItem={renderItem}
            getKey={w => `${w.faction}:${w.name}`}
            filters={FILTERS}
            onAdd={pick}
            onAddCustom={draft => onSelect({ ...draft, name: draft.name.trim(), focus: draft.focus.trim() })}
            customDefaults={CUSTOM_DEFAULTS}
            isCustomValid={isCustomValid}
            renderCustomForm={props => <CustomForm {...props} />}
            onClose={onClose}
        />
    );
};

export default WeaponCatalogModal;
