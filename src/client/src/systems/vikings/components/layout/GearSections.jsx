// src/client/src/systems/vikings/components/layout/GearSections.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Équipement et bourse (spec_vikings_pierre_peinte.md D-10, planche ; retours MJ du
// 2026-11-07) :
//   EquipmentSection : objets équipés ; une arme se lance d'un clic sur son dé
//     (compétence liée par getWeaponSkill, ou choisie dans le plateau) ;
//     « Inventaire » ouvre l'inventaire complet (filtre, rangement, ajout).
//   PurseSection : argent, puis le contenu du sac et de la réserve, lisibles sur la
//     fiche ; un clic sur un objet ouvre sa modification ; « Inventaire » comme à côté.
// L'inventaire est une action de jeu, toujours active (comme avant).
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { getWeaponSkill } from '../../config/rules.js';
import VkPanel from '../ui/VkPanel.jsx';
import VkModal from '../ui/VkModal.jsx';
import VkIcon from '../ui/VkIcon.jsx';
import InventorySection, { EditItemModal } from './InventorySection.jsx';

const isSilver = (item) => /once/i.test(item.name ?? '') && /argent/i.test(item.name ?? '');

const shortDetails = (item) => {
    if (item.category === 'weapon') return [item.weaponType, item.damage && `dégâts ${item.damage}`].filter(Boolean).join(' · ');
    if (item.category === 'armor' && item.armorValue > 0) return `armure ${item.armorValue}`;
    return '';
};

// Fenêtres partagées par les deux cartes : inventaire complet, modification d'un objet
const useGearWindows = (char, onItemsChange) => {
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const windows = (
        <>
            {open && (
                <VkModal title="Inventaire" icon="pouch" size="max-w-6xl" onClose={() => setOpen(false)}>
                    <InventorySection character={char} onUpdate={(next) => onItemsChange(next.items)} />
                </VkModal>
            )}
            {editing && (
                <EditItemModal character={char} item={editing} onClose={() => setEditing(null)}
                               onUpdate={(next) => onItemsChange(next.items)} />
            )}
        </>
    );
    return { openInventory: () => setOpen(true), editItem: setEditing, windows };
};

const InventoryButton = ({ onClick }) => (
    <div className="vk-slab-aside">
        <button type="button" className="vk-btn vk-btn-sm" onClick={onClick}><VkIcon name="pouch" />Inventaire</button>
    </div>
);

const ItemLine = ({ item, onEdit, children }) => (
    <div className="vk-row text-sm">
        <button type="button" className="vk-item-link flex-1 min-w-0 text-left truncate" onClick={() => onEdit(item)} title="Modifier">
            {item.name}{item.quantity > 1 && <span className="text-muted"> ×{item.quantity}</span>}
        </button>
        <span className="text-muted text-xs text-right">{shortDetails(item)}</span>
        {children}
    </div>
);

/**
 * @param {function} props.onItemsChange (items) → reporte les objets sur la fiche à jour
 * @param {function} props.onRoll        ouvre le plateau de jet (contexte de DiceModal)
 */
export const EquipmentSection = ({ char, onItemsChange, onRoll }) => {
    const { openInventory, editItem, windows } = useGearWindows(char, onItemsChange);
    const equipped = (char.items ?? []).filter(i => i.location === 'equipped');

    const attack = (weapon) => {
        const { skill, candidates, carac } = getWeaponSkill(char, weapon);
        if (skill) onRoll({ type: 'skill', data: skill, weapon });
        else if (carac) onRoll({ type: 'carac', data: carac, weapon });
        else onRoll({ type: 'skill', data: null, candidates, weapon });
    };

    return (
        <VkPanel>
            <h3 className="vk-band-title">Équipement</h3>
            <InventoryButton onClick={openInventory} />
            {equipped.length === 0
                ? <p className="text-sm text-muted italic m-0">Rien d'équipé.</p>
                : equipped.map(item => (
                    <ItemLine key={item.id} item={item} onEdit={editItem}>
                        {item.category === 'weapon' && (
                            <button type="button" className="vk-roll" onClick={() => attack(item)} title={`Attaquer : ${item.name}`}>
                                <VkIcon name="die" />
                            </button>
                        )}
                    </ItemLine>
                ))}
            {windows}
        </VkPanel>
    );
};

// Sac et réserve repliables, fermés par défaut (retour MJ : la fiche reste courte)
const Group = ({ label, items, onEdit }) => {
    const [open, setOpen] = useState(false);
    return (
        <div className="vk-purse-group">
            <button type="button" className="vk-purse-label" onClick={() => setOpen(o => !o)} aria-expanded={open}>
                <VkIcon name="down" className={open ? '' : 'vk-chevron-closed'} />{label} <span className="text-muted">({items.length})</span>
            </button>
            {open && (items.length === 0
                ? <p className="text-xs text-muted italic m-0 py-1">Vide.</p>
                : items.map(item => <ItemLine key={item.id} item={item} onEdit={onEdit} />))}
        </div>
    );
};

export const PurseSection = ({ char, onItemsChange }) => {
    const { openInventory, editItem, windows } = useGearWindows(char, onItemsChange);
    const items = char.items ?? [];
    const silver = items.filter(isSilver).reduce((sum, i) => sum + (i.quantity ?? 0), 0);
    const at = (location) => items.filter(i => i.location === location && !isSilver(i));
    return (
        <VkPanel>
            <h3 className="vk-band-title">Bourse et bagages</h3>
            <InventoryButton onClick={openInventory} />
            <div className="vk-row text-sm"><span className="flex-1">Bourse</span><span className="vk-num"><strong>{silver}</strong> oz d'argent</span></div>
            <Group label="Sac" items={at('bag')} onEdit={editItem} />
            <Group label="Réserve" items={at('stash')} onEdit={editItem} />
            {windows}
        </VkPanel>
    );
};
