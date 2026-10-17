// src/client/src/systems/vikings/components/layout/InventorySection.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Inventaire (équipé / sac / réserve), section de la fiche complète — joueur
// et MJ. onUpdate reçoit le personnage avec ses items ; SheetLayout n'en
// reporte que les items sur la fiche à jour. L'armure est recalculée par la
// fiche avant écriture (withDerivedValues).
//
// Lot 4c : habillage de la planche (3 colonnes, lignes compactes, un filtre
// commun) et corrections : plus de useState dans une fonction de rendu (filtre
// par colonne), plus d'alerte appelée hors de son composant (setAlertMessage).
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from "react";
import { CARACNAMES } from "../../config/competences.js";
import { ITEMS } from "../../config/equipment.js";
import { getCombatValues } from "../../config/rules.js";
import VkModal from "../ui/VkModal.jsx";
import VkIcon from "../ui/VkIcon.jsx";
import VkQuantity from "../ui/VkQuantity.jsx";

const FILTERS = [['all', 'Tous'], ['weapon', 'Armes'], ['armor', 'Armures'], ['item', 'Objets']];
const CATEGORIES = [['item', 'Objet'], ['weapon', 'Arme'], ['armor', 'Armure']];
const WEAPON_TYPES = ['1 main', '2 mains', 'Distance', '1 main / Jet', '2 mains / Jet'];
const LOCATIONS = [
    { id: 'equipped', label: 'Équipé',  icon: 'shield',    moveLabel: 'Équiper' },
    { id: 'bag',      label: 'Sac',     icon: 'pouch',     moveLabel: 'Mettre dans le sac' },
    { id: 'stash',    label: 'Réserve', icon: 'longhouse', moveLabel: 'Mettre en réserve' },
];

const itemDetails = (item) => {
    const parts = [];
    if (item.category === 'weapon') {
        parts.push(item.weaponType || 'Arme');
        if (item.damage) parts.push(`dégâts ${item.damage}`);
        if (item.range) parts.push(`portée ${item.range}`);
    }
    if (item.category === 'armor' && item.armorValue > 0) parts.push(`armure +${item.armorValue}`);
    if (item.requirements && Object.keys(item.requirements).length > 0) {
        parts.push(`requis ${Object.entries(item.requirements).map(([k, v]) => `${CARACNAMES[k]} ${v}`).join(', ')}`);
    }
    return parts.join(' · ');
};

const Pills = ({ options, value, onChange }) => (
    <div className="flex flex-wrap gap-1.5">
        {options.map(([id, label]) => (
            <button key={id} type="button" className={`vk-pill ${value === id ? 'is-selected' : ''}`} onClick={() => onChange(id)}>{label}</button>
        ))}
    </div>
);

// ── Ligne d'objet ────────────────────────────────────────────────────────────
const ItemRow = ({ item, location, onMove, onChangeQty, onEdit }) => (
    <div className="vk-row text-sm items-start">
        <div className="flex-1 min-w-0">
            <div className="font-bold">
                {item.name}
                {item.customItem && <span className="vk-tag vk-tag-muted ml-1.5">libre</span>}
            </div>
            {itemDetails(item) && <div className="text-xs text-muted">{itemDetails(item)}</div>}
            {item.notes && <div className="text-xs italic">{item.notes}</div>}
        </div>
        <div className="flex items-center gap-1 shrink-0">
            <button type="button" className="vk-btn vk-btn-icon vk-btn-sm" onClick={() => onChangeQty(item.id, -1)} title="Retirer un (à 0, l'objet disparaît)"><VkIcon name="minus" /></button>
            <span className="vk-num text-xs w-6 text-center">×{item.quantity}</span>
            <button type="button" className="vk-btn vk-btn-icon vk-btn-sm" onClick={() => onChangeQty(item.id, 1)} title="Ajouter un"><VkIcon name="plus" /></button>
            {LOCATIONS.filter(l => l.id !== location).map(l => (
                <button key={l.id} type="button" className="vk-btn vk-btn-icon vk-btn-sm" onClick={() => onMove(item, l.id)} title={l.moveLabel}>
                    <VkIcon name={l.icon} />
                </button>
            ))}
            <button type="button" className="vk-btn vk-btn-icon vk-btn-sm" onClick={() => onEdit(item)} title="Modifier"><VkIcon name="quill" /></button>
        </div>
    </div>
);

// ── Colonne (emplacement) ────────────────────────────────────────────────────
const ItemColumn = ({ location, items, armor, onAdd, ...rowProps }) => (
    <div>
        <div className="flex justify-between items-center mb-1 gap-2">
            <span className="vk-label text-lg flex items-center gap-1.5">
                <VkIcon name={location.icon} />{location.label} ({items.length})
            </span>
            <button type="button" className="vk-btn vk-btn-sm" onClick={() => onAdd(location.id)}><VkIcon name="plus" />Ajouter</button>
        </div>
        {armor && <div className="text-xs text-muted mb-1">{armor}</div>}
        {items.length === 0
            ? <p className="text-sm text-muted italic py-2">Aucun objet</p>
            : items.map(item => <ItemRow key={item.id} item={item} location={location.id} {...rowProps} />)}
    </div>
);

// ── Champs d'un objet libre (ajout et modification) ──────────────────────────
const ItemFields = ({ fields, set }) => (
    <div className="space-y-3">
        <label className="block"><span className="vk-field-label">Nom *</span>
            <input className="vk-input" value={fields.name} onChange={e => set('name', e.target.value)} />
        </label>
        <div><div className="vk-field-label">Catégorie</div><Pills options={CATEGORIES} value={fields.category} onChange={v => set('category', v)} /></div>
        {fields.category === 'weapon' && (
            <>
                <div><div className="vk-field-label">Type d'arme</div><Pills options={WEAPON_TYPES.map(t => [t, t])} value={fields.weaponType} onChange={v => set('weaponType', v)} /></div>
                <div className="grid grid-cols-2 gap-2">
                    <label><span className="vk-field-label">Dégâts</span><input type="number" min="0" className="vk-input vk-num" value={fields.damage} onChange={e => set('damage', e.target.value)} /></label>
                    <label><span className="vk-field-label">Portée</span><input className="vk-input" value={fields.range} onChange={e => set('range', e.target.value)} placeholder="ex : 15m" /></label>
                </div>
            </>
        )}
        {fields.category === 'armor' && (
            <label className="block"><span className="vk-field-label">Valeur d'armure</span>
                <input type="number" min="0" className="vk-input vk-num" value={fields.armorValue} onChange={e => set('armorValue', e.target.value)} />
            </label>
        )}
        <div className="grid grid-cols-2 gap-2">
            <label><span className="vk-field-label">Force requise</span><input type="number" min="0" className="vk-input vk-num" value={fields.reqForce} onChange={e => set('reqForce', e.target.value)} /></label>
            <label><span className="vk-field-label">Agilité requise</span><input type="number" min="0" className="vk-input vk-num" value={fields.reqAgi} onChange={e => set('reqAgi', e.target.value)} /></label>
        </div>
        <label className="block"><span className="vk-field-label">Notes</span>
            <textarea className="vk-input" rows={2} value={fields.notes} onChange={e => set('notes', e.target.value)} />
        </label>
    </div>
);

const fieldsFrom = (item = {}) => ({
    name:       item.name ?? '',
    category:   item.category ?? 'item',
    weaponType: item.weaponType ?? '1 main',
    damage:     item.damage ?? '',
    range:      item.range ?? '',
    armorValue: item.armorValue || '',
    reqForce:   item.requirements?.force ?? '',
    reqAgi:     item.requirements?.agilite ?? '',
    notes:      item.notes ?? '',
});

const itemFromFields = (f) => {
    const requirements = {};
    if (f.reqForce) requirements.force = parseInt(f.reqForce);
    if (f.reqAgi) requirements.agilite = parseInt(f.reqAgi);
    return {
        name:       f.name.trim(),
        category:   f.category,
        notes:      f.notes.trim(),
        weaponType: f.category === 'weapon' ? f.weaponType : undefined,
        damage:     f.category === 'weapon' && f.damage ? parseInt(f.damage) : undefined,
        range:      f.category === 'weapon' && f.range ? String(f.range).trim() : undefined,
        armorValue: f.category === 'armor' && f.armorValue ? parseInt(f.armorValue) : 0,
        requirements,
    };
};

const QtyAndLocation = ({ quantity, setQuantity, location, setLocation }) => (
    <div className="grid sm:grid-cols-2 gap-4 pt-3 mt-3 border-t border-default">
        <div><div className="vk-field-label">Quantité</div><VkQuantity value={quantity} onChange={setQuantity} /></div>
        <div><div className="vk-field-label">Emplacement</div><Pills options={LOCATIONS.map(l => [l.id, l.label])} value={location} onChange={setLocation} /></div>
    </div>
);

// ── Ajout ────────────────────────────────────────────────────────────────────
const AddItemModal = ({ character, onClose, onUpdate, defaultLocation }) => {
    const [mode, setMode] = useState('list'); // 'list' | 'custom'
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [selected, setSelected] = useState(null);
    const [fields, setFields] = useState(fieldsFrom());
    const [quantity, setQuantity] = useState(1);
    const [location, setLocation] = useState(defaultLocation);

    const setField = (k, v) => setFields(prev => ({ ...prev, [k]: v }));
    const filteredItems = ITEMS.filter(item =>
        (!search || item.name.toLowerCase().includes(search.toLowerCase()))
        && (categoryFilter === 'all' || item.category === categoryFilter));
    const canAdd = mode === 'list' ? !!selected : !!fields.name.trim();

    const handleAdd = () => {
        if (!canAdd) return;
        const base = mode === 'list'
            ? { ...selected, notes: '', customItem: false }
            : { ...itemFromFields(fields), customItem: true };
        // id temporaire : le serveur insère tout id inconnu (lot 2)
        const newItem = { ...base, id: Date.now(), quantity, location };
        onUpdate({ ...character, items: [...(character.items || []), newItem] });
        onClose();
    };

    return (
        <VkModal title="Ajouter un objet" icon="pouch" onClose={onClose} size="max-w-2xl">
            <div className="mb-3"><Pills options={[['list', 'Catalogue'], ['custom', 'Objet libre']]} value={mode} onChange={setMode} /></div>

            {mode === 'list' ? (
                <>
                    <span className="vk-input-icon block mb-2">
                        <VkIcon name="eye" />
                        <input className="vk-input" value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher…" autoFocus />
                    </span>
                    <div className="mb-2"><Pills options={FILTERS} value={categoryFilter} onChange={setCategoryFilter} /></div>
                    <div className="grid sm:grid-cols-2 gap-1.5 max-h-72 overflow-y-auto pr-1">
                        {filteredItems.map(item => (
                            <button key={item.name} type="button" onClick={() => setSelected(item)}
                                    className={`vk-pill w-full justify-between text-left ${selected?.name === item.name ? 'is-selected' : ''}`}>
                                <span>{item.name}</span>
                                <span className="text-xs opacity-75">{item.damage ? `dégâts ${item.damage}` : item.armorValue > 0 ? `armure +${item.armorValue}` : ''}</span>
                            </button>
                        ))}
                    </div>
                </>
            ) : (
                <ItemFields fields={fields} set={setField} />
            )}

            <QtyAndLocation quantity={quantity} setQuantity={setQuantity} location={location} setLocation={setLocation} />

            <div className="flex gap-2 pt-3 mt-3 border-t border-default">
                <button type="button" className="vk-btn flex-1" onClick={onClose}>Annuler</button>
                <button type="button" className="vk-btn vk-btn-primary flex-1" onClick={handleAdd} disabled={!canAdd}><VkIcon name="plus" />Ajouter</button>
            </div>
        </VkModal>
    );
};

// ── Modification (et suppression) ────────────────────────────────────────────
const EditItemModal = ({ character, item, onClose, onUpdate }) => {
    const [fields, setFields] = useState(fieldsFrom(item));
    const [quantity, setQuantity] = useState(item.quantity);
    const [location, setLocation] = useState(item.location);
    const setField = (k, v) => setFields(prev => ({ ...prev, [k]: v }));

    const handleSave = () => {
        if (!fields.name.trim()) return;
        const updated = { ...item, ...itemFromFields(fields), quantity: Math.max(1, quantity), location };
        onUpdate({ ...character, items: character.items.map(i => i.id === item.id ? updated : i) });
        onClose();
    };
    const handleDelete = () => {
        if (!confirm(`Supprimer « ${item.name} » ?`)) return;
        onUpdate({ ...character, items: character.items.filter(i => i.id !== item.id) });
        onClose();
    };

    return (
        <VkModal title={`Modifier : ${item.name}`} icon="quill" onClose={onClose} size="max-w-2xl">
            <ItemFields fields={fields} set={setField} />
            <QtyAndLocation quantity={quantity} setQuantity={setQuantity} location={location} setLocation={setLocation} />
            <div className="flex gap-2 pt-3 mt-3 border-t border-default flex-wrap">
                <button type="button" className="vk-btn vk-btn-danger" onClick={handleDelete}><VkIcon name="close" />Supprimer</button>
                <div className="flex-1" />
                <button type="button" className="vk-btn" onClick={onClose}>Annuler</button>
                <button type="button" className="vk-btn vk-btn-success" onClick={handleSave} disabled={!fields.name.trim()}><VkIcon name="check" />Enregistrer</button>
            </div>
        </VkModal>
    );
};

// ── Section ──────────────────────────────────────────────────────────────────
const InventorySection = ({ character, onUpdate }) => {
    const [filter, setFilter] = useState('all');
    const [addLocation, setAddLocation] = useState(null);
    const [editItem, setEditItem] = useState(null);

    const items = character.items || [];
    const visible = filter === 'all' ? items : items.filter(i => i.category === filter);
    const { armureTotale, armureBoucliers } = getCombatValues(character);

    const moveItem = (item, newLocation) => onUpdate({
        ...character,
        items: items.map(i => i.id === item.id ? { ...i, location: newLocation } : i),
    });
    // À 0, l'objet est retiré
    const changeQuantity = (itemId, delta) => onUpdate({
        ...character,
        items: items
            .map(i => i.id === itemId ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i)
            .filter(i => i.quantity > 0),
    });

    const armorLine = `Armure totale ${armureTotale}${armureBoucliers > 0 ? ` (+ bouclier ${armureBoucliers})` : ''}`;

    return (
        <>
            <div className="flex justify-end mb-3"><Pills options={FILTERS} value={filter} onChange={setFilter} /></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {LOCATIONS.map(location => (
                    <ItemColumn key={location.id} location={location}
                                items={visible.filter(i => i.location === location.id)}
                                armor={location.id === 'equipped' ? armorLine : null}
                                onAdd={setAddLocation} onMove={moveItem} onChangeQty={changeQuantity} onEdit={setEditItem} />
                ))}
            </div>

            {addLocation && (
                <AddItemModal character={character} defaultLocation={addLocation}
                              onClose={() => setAddLocation(null)} onUpdate={onUpdate} />
            )}
            {editItem && (
                <EditItemModal character={character} item={editItem}
                               onClose={() => setEditItem(null)} onUpdate={onUpdate} />
            )}
        </>
    );
};

export default InventorySection;
