// src/client/src/systems/deltagreen/components/layout/WeaponCatalogModal.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Catalogue d'armement Delta Green.
// Clic sur une arme → ajout dans le prochain slot libre.
// Si tous les slots sont pris → choix du slot à remplacer.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useMemo } from 'react';
import { WEAPON_CATALOG } from '../../config.jsx';

const SLOTS = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];

const EXPENSE_LABELS = {
    Incidental: 'Incident.',
    Standard:   'Standard',
    Unusual:    'Inhabituel',
    Major:      'Majeur',
    Extreme:    'Extrême',
};

const WeaponCatalogModal = ({ existingWeapons, onAdd, onClose }) => {
    const [search,      setSearch]      = useState('');
    const [category,    setCategory]    = useState(null);
    const [replaceFor,  setReplaceFor]  = useState(null); // weaponData en attente de slot

    const takenSlots = existingWeapons.map(w => w.slot);
    const freeSlots  = SLOTS.filter(s => !takenSlots.includes(s));

    // ── Liste filtrée ──────────────────────────────────────────────────────────
    const filtered = useMemo(() => {
        const q = search.toLowerCase().trim();
        return WEAPON_CATALOG
            .filter(cat => !category || cat.key === category)
            .flatMap(cat => cat.items.map(item => ({ ...item, _catKey: cat.key, _catLabel: cat.label })))
            .filter(item => !q ||
                item.name.toLowerCase().includes(q) ||
                item.skill_label?.toLowerCase().includes(q)
            );
    }, [search, category]);

    // ── Sélection d'une arme ───────────────────────────────────────────────────
    const buildWeaponData = (item) => ({
        name:            item.name,
        category:        'weapon',
        expense:         item.expense         ?? 'Standard',
        isRestricted:    item.is_restricted   ?? false,
        restrictionNote: item.restriction_note ?? '',
        notes:           item.notes           ?? '',
        jsonDetails: {
            skill_ref:     item.skill_ref     ?? null,
            range:         item.range         ?? null,
            damage:        item.damage        ?? null,
            armor_piercing: item.armor_piercing ?? null,
            lethality:     item.lethality     ?? null,
            ammo_capacity: item.ammo_capacity ?? null,
            ammo_current:  item.ammo_capacity ?? null,
        },
    });

    const handleSelect = (item) => {
        const data = buildWeaponData(item);
        if (freeSlots.length > 0) {
            onAdd(data, freeSlots[0]);
        } else {
            setReplaceFor(data);
        }
    };

    const handleReplace = (slot) => {
        onAdd(replaceFor, slot);
        setReplaceFor(null);
    };

    // ── Rendu ─────────────────────────────────────────────────────────────────
    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div
                className="bg-default border border-default shadow-4xl w-full max-w-4xl max-h-[85vh] flex flex-col"
                style={{ fontFamily: 'var(--dg-font-body)' }}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="dg-header px-4 py-3 flex items-center justify-between shrink-0">
                    <h2 className="text-xs font-black uppercase tracking-widest text-white">
                        Catalogue d'armement — Delta Green
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white shrink-0 ml-2">✕</button>
                </div>

                {/* Bandeau remplacement */}
                {replaceFor && (
                    <div className="shrink-0 bg-danger/10 border-b border-danger/30 px-4 py-3">
                        <p className="text-xs font-mono text-danger mb-2">
                            Tous les slots sont occupés. Sélectionner le slot à remplacer :
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {SLOTS.map(slot => {
                                const w = existingWeapons.find(x => x.slot === slot);
                                return (
                                    <button
                                        key={slot}
                                        onClick={() => handleReplace(slot)}
                                        className="px-3 py-1 border border-danger/50 text-danger text-xs font-mono hover:bg-danger/20 transition-colors"
                                    >({slot}) {w?.name || '—'}</button>
                                );
                            })}
                            <button
                                onClick={() => setReplaceFor(null)}
                                className="px-3 py-1 border border-default text-muted text-xs font-mono hover:bg-surface-alt transition-colors"
                            >Annuler</button>
                        </div>
                    </div>
                )}

                {/* Recherche + filtres */}
                <div className="shrink-0 px-4 py-3 border-b border-default space-y-2">
                    <input
                        className="dg-field-input w-full px-3 py-1.5 text-sm"
                        placeholder="Rechercher…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        autoFocus
                    />
                    <div className="flex flex-wrap gap-1">
                        <button
                            onClick={() => setCategory(null)}
                            className={[
                                'px-2 py-0.5 text-[10px] font-mono border transition-colors',
                                !category ? 'border-accent text-accent bg-accent/10' : 'border-default text-muted hover:text-default',
                            ].join(' ')}
                        >Tout</button>
                        {WEAPON_CATALOG.map(cat => (
                            <button
                                key={cat.key}
                                onClick={() => setCategory(category === cat.key ? null : cat.key)}
                                className={[
                                    'px-2 py-0.5 text-[10px] font-mono border transition-colors',
                                    category === cat.key ? 'border-accent text-accent bg-accent/10' : 'border-default text-muted hover:text-default',
                                ].join(' ')}
                            >{cat.label}</button>
                        ))}
                    </div>
                </div>

                {/* Liste */}
                <div className="overflow-x-hidden overflow-y-auto max-w-full">
                    {/* En-têtes */}
                    <div className="grid grid-cols-[35%_20%_10%_10%_10%_10%] gap-x-3 px-1 py-1 border-b border-default/40 sticky top-0 bg-default z-10 w-full">
                        {['ARME', 'COMP.', 'PORTÉE', 'DÉGÂTS', 'PERF.', 'LÉTAL.'].map(h => (
                            <span key={h} className="dg-section-label text-[9px]">{h}</span>
                        ))}
                    </div>

                    {filtered.length === 0 && (
                        <p className="text-sm text-muted font-mono italic px-4 py-8 text-center">
                            Aucune arme trouvée.
                        </p>
                    )}

                    {filtered.map((item, i) => (
                        <button
                            key={i}
                            onClick={() => handleSelect(item)}
                            className="grid grid-cols-[35%_20%_10%_10%_10%_10%] gap-x-3 px-1 py-1.5 border-b border-default/20 w-full text-left hover:bg-surface-alt transition-colors group"                        >
                            <div>
                                <span className="text-xs font-mono group-hover:text-accent transition-colors">
                                    {item.name}
                                </span>
                                {item.is_restricted && (
                                    <span className="dg-stamp dg-stamp-red ml-1 text-[8px]">R</span>
                                )}
                                {item.notes && (
                                    <p className="text-[9px] text-muted font-mono leading-tight truncate">{item.notes}</p>
                                )}
                            </div>
                            <span className="text-xs font-mono text-muted self-center">{item.skill_label ?? '—'}</span>
                            <span className="text-xs font-mono text-muted self-center">{item.range ?? '—'}</span>
                            <span className="text-xs font-mono text-muted self-center">{item.damage ? item.damage.toUpperCase() : '—'}</span>
                            <span className="text-xs font-mono text-muted self-center">{item.armor_piercing ?? '—'}</span>
                            <span className="text-xs font-mono text-muted self-center">
                                {item.lethality != null ? `${item.lethality}%` : '—'}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Footer */}
                <div className="shrink-0 px-4 py-2 border-t border-default flex items-center justify-between">
                    <p className="text-[10px] font-mono text-muted">
                        {freeSlots.length > 0
                            ? `${freeSlots.length} slot(s) libre(s) — cliquer pour ajouter`
                            : 'Tous les slots sont occupés — cliquer pour remplacer'
                        }
                    </p>
                    <p className="text-[10px] font-mono text-muted">{filtered.length} arme(s)</p>
                </div>
            </div>
        </div>
    );
};

export default WeaponCatalogModal;