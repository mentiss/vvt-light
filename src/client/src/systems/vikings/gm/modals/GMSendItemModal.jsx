// src/client/src/systems/vikings/gm/modals/GMSendItemModal.jsx
// Modale d'envoi d'un objet MJ → joueur (catalogue Vikings ou objet libre).
// Habillage : planche du lot 4 (pastilles au lieu des listes déroulantes).
import React, { useState } from 'react';
import { ITEMS } from '../../config/equipment.js';
import { CARACNAMES } from '../../config/competences.js';
import VkModal from '../../components/ui/VkModal.jsx';
import VkIcon  from '../../components/ui/VkIcon.jsx';
import VkQuantity from '../../components/ui/VkQuantity.jsx';

const TOAST_ANIMATIONS = [
    { id: 'default', label: 'Classique' },
    { id: 'shake',   label: 'Tremblement' },
    { id: 'flash',   label: 'Éclair' },
    { id: 'glitter', label: 'Doré' },
];
const CATEGORY_FILTERS = [['all', 'Tout'], ['weapon', 'Armes'], ['armor', 'Armures'], ['item', 'Objets']];
const CATEGORIES       = [['item', 'Objet'], ['weapon', 'Arme'], ['armor', 'Armure']];
const WEAPON_TYPES     = ['1 main', '2 mains', 'Distance', '2 mains / Jet'];
const CATEGORY_LABEL   = { weapon: 'Arme', armor: 'Armure', item: 'Objet' };

const Pills = ({ options, value, onChange }) => (
    <div className="flex flex-wrap gap-1.5">
        {options.map(([id, label]) => (
            <button key={id} type="button" className={`vk-pill ${value === id ? 'is-selected' : ''}`} onClick={() => onChange(id)}>{label}</button>
        ))}
    </div>
);

const GMSendItemModal = ({ onClose, onSend, sessionCharacters = [], preSelectedCharId = null }) => {
    // Destinataire unique
    const [targetCharId, setTargetCharId] = useState(preSelectedCharId || (sessionCharacters[0]?.id ?? null));

    // Mode sélection : catalogue ou objet libre
    const [mode, setMode] = useState('list'); // 'list' | 'custom'

    // Catalogue
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [selectedItem, setSelectedItem] = useState(null);

    // Objet libre
    const [customName, setCustomName] = useState('');
    const [customCategory, setCustomCategory] = useState('item');
    const [customWeaponType, setCustomWeaponType] = useState('1 main');
    const [customDamage, setCustomDamage] = useState('');
    const [customRange, setCustomRange] = useState('');
    const [customArmorValue, setCustomArmorValue] = useState('');
    const [customReqForce, setCustomReqForce] = useState('');
    const [customReqAgi, setCustomReqAgi] = useState('');
    const [customNotes, setCustomNotes] = useState('');

    // Commun
    const [quantity, setQuantity] = useState(1);
    const [note, setNote] = useState('');
    const [toastAnimation, setToastAnimation] = useState('default');
    const [sending, setSending] = useState(false);

    const filteredItems = ITEMS.filter(item => {
        const matchSearch = !search || item.name.toLowerCase().includes(search.toLowerCase());
        const matchCategory = categoryFilter === 'all' || item.category === categoryFilter;
        return matchSearch && matchCategory;
    });

    // Objet à envoyer
    const buildItem = () => {
        if (mode === 'list') {
            if (!selectedItem) return null;
            return { ...selectedItem, quantity, location: 'bag', customItem: false };
        }
        if (!customName.trim()) return null;
        const requirements = {};
        if (customReqForce) requirements.force = parseInt(customReqForce);
        if (customReqAgi) requirements.agilite = parseInt(customReqAgi);
        return {
            name: customName.trim(),
            category: customCategory,
            quantity,
            location: 'bag',
            notes: customNotes.trim() || null,
            weaponType: customCategory === 'weapon' ? customWeaponType : undefined,
            damage: customCategory === 'weapon' && customDamage ? parseInt(customDamage) : undefined,
            range: customCategory === 'weapon' && customRange ? customRange.trim() : undefined,
            armorValue: customCategory === 'armor' && customArmorValue ? parseInt(customArmorValue) : 0,
            requirements,
            customItem: true,
        };
    };

    const handleSend = async () => {
        const item = buildItem();
        if (!item || !targetCharId) return;
        setSending(true);
        try {
            await onSend({ targetCharacterId: targetCharId, item, note: note.trim() || null, toastAnimation });
            onClose();
        } catch (error) {
            console.error('[GMSendItemModal] Error:', error);
            setSending(false);
        }
    };

    const canSend = targetCharId && (mode === 'list' ? !!selectedItem : !!customName.trim());

    const getItemDetails = (item) => {
        const parts = [];
        if (item.weaponType) parts.push(item.weaponType);
        if (item.damage) parts.push(`dégâts ${item.damage}`);
        if (item.range) parts.push(`portée ${item.range}`);
        if (item.armorValue) parts.push(`armure +${item.armorValue}`);
        if (item.requirements && Object.keys(item.requirements).length > 0) {
            parts.push(`requis ${Object.entries(item.requirements).map(([k, v]) => `${CARACNAMES[k] || k} ${v}`).join(', ')}`);
        }
        return parts.join(' · ');
    };

    return (
        <VkModal title="Envoyer un objet" icon="pouch" onClose={onClose} size="max-w-xl">
            <div className="space-y-4">
                <div>
                    <div className="vk-field-label">Destinataire</div>
                    <div className="flex flex-wrap gap-1.5">
                        {sessionCharacters.map(char => (
                            <button key={char.id} type="button" onClick={() => setTargetCharId(char.id)}
                                    className={`vk-pill ${targetCharId === char.id ? 'is-selected' : ''}`}>
                                {char.avatar
                                    ? <img src={char.avatar} alt="" className="w-5 h-5 rounded-full object-cover" />
                                    : <VkIcon name="portrait" />}
                                {char.name}
                            </button>
                        ))}
                    </div>
                </div>

                <Pills options={[['list', 'Catalogue'], ['custom', 'Objet libre']]} value={mode} onChange={setMode} />

                {mode === 'list' && (
                    <div className="space-y-2">
                        <span className="vk-input-icon block">
                            <VkIcon name="eye" />
                            <input className="vk-input" value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher…" />
                        </span>
                        <Pills options={CATEGORY_FILTERS} value={categoryFilter} onChange={setCategoryFilter} />
                        <div className="max-h-56 overflow-y-auto border border-default">
                            {filteredItems.map(item => (
                                <button key={item.name} type="button" onClick={() => setSelectedItem(item)}
                                        className={`vk-row w-full text-left px-3 ${selectedItem?.name === item.name ? 'bg-primary/15' : ''}`}>
                                    <span className="flex-1 min-w-0">
                                        <span className="font-bold">{item.name}</span>
                                        <span className="vk-tag vk-tag-muted ml-2">{CATEGORY_LABEL[item.category] ?? 'Objet'}</span>
                                        {getItemDetails(item) && <span className="block text-xs text-muted">{getItemDetails(item)}</span>}
                                    </span>
                                    {selectedItem?.name === item.name && <VkIcon name="check" className="text-primary" />}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {mode === 'custom' && (
                    <div className="space-y-3">
                        <label className="block"><span className="vk-field-label">Nom de l'objet *</span>
                            <input className="vk-input" value={customName} onChange={e => setCustomName(e.target.value)} />
                        </label>
                        <div><div className="vk-field-label">Catégorie</div><Pills options={CATEGORIES} value={customCategory} onChange={setCustomCategory} /></div>

                        {customCategory === 'weapon' && (
                            <>
                                <div><div className="vk-field-label">Type d'arme</div><Pills options={WEAPON_TYPES.map(t => [t, t])} value={customWeaponType} onChange={setCustomWeaponType} /></div>
                                <div className="grid grid-cols-2 gap-2">
                                    <label><span className="vk-field-label">Dégâts</span><input type="number" min="0" className="vk-input vk-num" value={customDamage} onChange={e => setCustomDamage(e.target.value)} /></label>
                                    <label><span className="vk-field-label">Portée</span><input className="vk-input" value={customRange} onChange={e => setCustomRange(e.target.value)} /></label>
                                </div>
                            </>
                        )}
                        {customCategory === 'armor' && (
                            <label className="block"><span className="vk-field-label">Valeur d'armure</span>
                                <input type="number" min="0" className="vk-input vk-num" value={customArmorValue} onChange={e => setCustomArmorValue(e.target.value)} />
                            </label>
                        )}

                        <div className="grid grid-cols-2 gap-2">
                            <label><span className="vk-field-label">Force requise</span><input type="number" min="0" className="vk-input vk-num" value={customReqForce} onChange={e => setCustomReqForce(e.target.value)} /></label>
                            <label><span className="vk-field-label">Agilité requise</span><input type="number" min="0" className="vk-input vk-num" value={customReqAgi} onChange={e => setCustomReqAgi(e.target.value)} /></label>
                        </div>
                        <label className="block"><span className="vk-field-label">Notes sur l'objet</span>
                            <input className="vk-input" value={customNotes} onChange={e => setCustomNotes(e.target.value)} />
                        </label>
                    </div>
                )}

                <div className="flex items-center gap-3">
                    <span className="vk-label text-lg">Quantité</span>
                    <VkQuantity value={quantity} onChange={setQuantity} />
                </div>

                <label className="block"><span className="vk-field-label">Note (optionnel)</span>
                    <textarea className="vk-input" rows={2} value={note} onChange={e => setNote(e.target.value)} placeholder="Message accompagnant l'objet…" />
                </label>

                <div><div className="vk-field-label">Animation de notification</div>
                    <Pills options={TOAST_ANIMATIONS.map(a => [a.id, a.label])} value={toastAnimation} onChange={setToastAnimation} />
                </div>
            </div>

            <div className="flex gap-2 pt-3 mt-4 border-t border-default">
                <button type="button" className="vk-btn flex-1" onClick={onClose}>Annuler</button>
                <button type="button" className="vk-btn vk-btn-primary flex-1" onClick={handleSend} disabled={!canSend || sending}>
                    <VkIcon name="pouch" />{sending ? 'Envoi…' : 'Envoyer'}
                </button>
            </div>
        </VkModal>
    );
};

export default GMSendItemModal;
