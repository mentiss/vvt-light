// src/client/src/systems/zoneblanche/components/modals/EquipmentCatalogModal.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Modale matériel — deux colonnes, pensée comme un poste d'équipement :
//
//   GAUCHE  : le catalogue — pills de catégorie, recherche insensible aux
//             accents, cartes cliquables (un clic = un ajout).
//   DROITE  : l'inventaire de l'équipe EN DIRECT — quantités ajustables,
//             retrait, compteur budget, et création d'objet de scénario.
//
// Composant PUREMENT PRÉSENTATIONNEL : aucun appel réseau, aucun socket ici.
// L'état et sa synchronisation temps réel vivent dans EquipmentSection, qui
// écoute zoneblanche:equipment-update et redescend `state` en props. Résultat :
// tout ce qui est affiché à droite se met à jour chez tous les joueurs et chez
// le MJ au même instant, sans que cette modale n'ait à s'en occuper.
//
// Props :
//   open, onClose
//   state    — { budget, total, items[] }
//   readOnly — true côté MJ (consultation ; le MJ n'achète pas)
//   busy     — écriture en cours
//   onAdd(item) · onAddFree(label, cost) · onAdjustQuantity(id, delta) · onRemove(id)
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useMemo } from 'react';
import { EQUIPMENT_CATALOG, EQUIPMENT_CATEGORY_ORDER } from '../../config.jsx';

// Recherche insensible à la casse ET aux accents ("detecteur" trouve "Détecteur").
const norm = (s) => (s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

// ── Colonne gauche : une entrée de catalogue ─────────────────────────────────

const CatalogCard = ({ item, dejaPris, disabled, onAdd }) => (
    <button type="button" disabled={disabled} onClick={onAdd}
            className="zb-card w-full p-3 rounded-r-sm">
        <div className="flex items-center justify-between gap-2">
            <span className="font-semibold text-sm">{item.nom}</span>
            <span className="zb-mono text-sm shrink-0">{item.cost}</span>
        </div>

        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
            <span className="zb-eyebrow">{item.categoryLabel}</span>
            {item.isKit && <span className="zb-eyebrow">Kit</span>}
            {item.isLot && <span className="zb-eyebrow">Lot</span>}
            {dejaPris > 0 && <span className="zb-eyebrow">Déjà pris ×{dejaPris}</span>}
        </div>

        <p className="text-xs opacity-85 mt-1.5 leading-relaxed">{item.description}</p>

        {item.piecesMaitresses && (
            <p className="zb-eyebrow normal-case mt-1.5">{item.piecesMaitresses}</p>
        )}
    </button>
);

// ── Colonne droite : une ligne d'inventaire ──────────────────────────────────

const InventoryRow = ({ item, readOnly, busy, onAdjustQuantity, onRemove }) => (
    <div className="zb-equip-row">
        <span className="flex-1 min-w-0 truncate text-sm text-default">
            {item.label}
            {item.itemKey === null && <span className="zb-eyebrow ml-2">scénario</span>}
        </span>

        {!readOnly && (
            <button type="button" onClick={() => onAdjustQuantity(item.id, -1)} disabled={busy}
                    className="zb-btn-ghost w-7 h-7 rounded-sm text-xs shrink-0" title="Retirer un exemplaire">−</button>
        )}
        <span className="zb-mono text-sm text-default w-6 text-center shrink-0">×{item.quantity}</span>
        {!readOnly && (
            <button type="button" onClick={() => onAdjustQuantity(item.id, 1)} disabled={busy}
                    className="zb-btn-ghost w-7 h-7 rounded-sm text-xs shrink-0" title="Ajouter un exemplaire">+</button>
        )}

        <span className="zb-mono text-sm text-muted w-8 text-right shrink-0">{item.lineTotal}</span>

        {!readOnly && (
            <button type="button" onClick={() => onRemove(item.id)} disabled={busy}
                    className="zb-btn-ghost px-2 py-1 rounded-sm text-xs shrink-0" title="Retirer la ligne">✕</button>
        )}
    </div>
);

// ── Modale ───────────────────────────────────────────────────────────────────

const EquipmentCatalogModal = ({
                                   open, onClose,
                                   state = { budget: 0, total: 0, items: [] },
                                   readOnly = false,
                                   busy = false,
                                   onAdd, onAddFree, onAdjustQuantity, onRemove,
                               }) => {
    const [filtre, setFiltre]       = useState('toutes');
    const [search, setSearch]       = useState('');
    const [freeLabel, setFreeLabel] = useState('');
    const [freeCost, setFreeCost]   = useState('');

    // Aplatissement une seule fois : la recherche filtre dessus.
    const entries = useMemo(
        () => EQUIPMENT_CATEGORY_ORDER.flatMap(categoryKey =>
            EQUIPMENT_CATALOG[categoryKey].items.map(item => ({
                ...item,
                categoryKey,
                categoryLabel: EQUIPMENT_CATALOG[categoryKey].label,
            }))
        ),
        [],
    );

    // Quantités déjà au pool, par clé de catalogue.
    const quantites = useMemo(() => {
        const map = {};
        for (const i of state.items) if (i.itemKey) map[i.itemKey] = i.quantity;
        return map;
    }, [state.items]);

    if (!open) return null;

    const q = norm(search);
    const filtered = entries.filter(item => {
        if (filtre !== 'toutes' && item.categoryKey !== filtre) return false;
        if (!q) return true;
        return norm(item.nom).includes(q)
            || norm(item.description).includes(q)
            || norm(item.categoryLabel).includes(q);
    });

    const ajouterLibre = () => {
        const label = freeLabel.trim();
        if (!label) return;
        onAddFree(label, Number(freeCost) || 0);
        setFreeLabel('');
        setFreeCost('');
    };

    const depasse = state.budget > 0 && state.total > state.budget;

    return (
        <div className="zb-modal-backdrop" onClick={onClose}>
            <div className="zb-modal zb-modal-lg zb-grain" onClick={e => e.stopPropagation()}>

                <div className="zb-modal-header">
                    <div className="flex items-center gap-3">
                        <span className="zb-rec-dot" />
                        <span className="zb-display text-lg">Matériel de l'équipe</span>
                    </div>
                    <button type="button" onClick={onClose} className="zb-btn-ghost px-3 py-1 rounded-sm">✕</button>
                </div>

                <div className="zb-equip-modal-body">

                    {/* ═══════════ COLONNE GAUCHE — CATALOGUE ═══════════ */}
                    <div className="zb-equip-col">
                        <div className="zb-catalog-filters">
                            <div className="flex flex-wrap gap-1.5">
                                <button type="button" onClick={() => setFiltre('toutes')}
                                        className={`zb-pill px-3 py-1.5 rounded-sm text-xs ${filtre === 'toutes' ? 'is-selected' : ''}`}>
                                    Toutes
                                </button>
                                {EQUIPMENT_CATEGORY_ORDER.map(key => (
                                    <button key={key} type="button" onClick={() => setFiltre(key)}
                                            className={`zb-pill px-3 py-1.5 rounded-sm text-xs ${filtre === key ? 'is-selected' : ''}`}>
                                        {EQUIPMENT_CATALOG[key].label}
                                    </button>
                                ))}
                            </div>

                            <input value={search} onChange={e => setSearch(e.target.value)}
                                   className="zb-input w-full px-3 py-2 rounded-sm text-sm mt-2"
                                   placeholder="Rechercher un objet, une catégorie…" />
                        </div>

                        <div className="zb-equip-scroll">
                            {filtered.length === 0 && <p className="text-sm text-muted">Aucun résultat.</p>}

                            <div className="grid grid-cols-1 gap-1.5">
                                {filtered.map(item => (
                                    <CatalogCard key={item.key} item={item}
                                                 dejaPris={quantites[item.key] ?? 0}
                                                 disabled={readOnly || busy}
                                                 onAdd={() => onAdd(item)} />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ═══════════ COLONNE DROITE — INVENTAIRE ═══════════ */}
                    <div className="zb-equip-col zb-equip-col-side">
                        <div className="zb-catalog-filters flex items-center justify-between gap-3">
                            <span className="zb-eyebrow">Inventaire de l'équipe</span>
                            <span className={`zb-counter zb-mono px-3 py-1 rounded-sm text-sm ${depasse ? '' : 'is-complete'}`}
                                  title={depasse ? 'Budget dépassé — la table tranche' : 'Dans le budget'}>
                                {state.total} / {state.budget}
                            </span>
                        </div>

                        <div className="zb-equip-scroll">
                            {state.items.length === 0 && (
                                <p className="text-sm text-muted">Rien dans le camion pour l'instant.</p>
                            )}

                            <div className="space-y-1.5">
                                {state.items.map(item => (
                                    <InventoryRow key={item.id} item={item}
                                                  readOnly={readOnly} busy={busy}
                                                  onAdjustQuantity={onAdjustQuantity}
                                                  onRemove={onRemove} />
                                ))}
                            </div>
                        </div>

                        {/* Objet de scénario — hors catalogue */}
                        {!readOnly && (
                            <div className="zb-equip-free">
                                <div className="zb-eyebrow mb-2">Matériel fourni par le scénario</div>
                                <div className="flex flex-wrap gap-2 items-center">
                                    <input value={freeLabel} onChange={e => setFreeLabel(e.target.value)}
                                           onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); ajouterLibre(); } }}
                                           className="zb-input flex-1 px-3 py-2 rounded-sm text-sm"
                                           placeholder="Nom de l'objet…" />
                                    <input type="number" min="0" value={freeCost}
                                           onChange={e => setFreeCost(e.target.value)}
                                           onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); ajouterLibre(); } }}
                                           className="zb-input zb-mono w-20 px-3 py-2 rounded-sm text-sm"
                                           placeholder="Coût" />
                                    <button type="button" onClick={ajouterLibre}
                                            disabled={busy || !freeLabel.trim()}
                                            className="zb-btn-ghost px-4 py-2 rounded-sm text-sm">
                                        Ajouter
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="zb-modal-footer">
                    <span className="zb-eyebrow">
                        {filtered.length} objet{filtered.length > 1 ? 's' : ''} au catalogue
                        {' · '}
                        {state.items.length} ligne{state.items.length > 1 ? 's' : ''} dans l'inventaire
                    </span>
                    <button type="button" onClick={onClose} className="zb-btn-primary px-6 py-2.5 rounded-sm zb-display">
                        Terminé
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EquipmentCatalogModal;