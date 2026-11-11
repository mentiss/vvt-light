// src/client/src/systems/dune/components/layout/DuneAssets.jsx
// Atouts = l'inventaire (fiche joueur et MJ, spec_dune.md §6.1, Q-14).
// Hors édition (actions de jeu, enregistrées tout de suite) : quantité, ajout depuis
// le catalogue du livre ou en atout libre, retrait (confirmé).
// Mode Édition : nom, description, qualité, mots-clefs.
// Qualité et mots-clefs sont facultatifs : un atout d'avant la refonte n'en a pas.

import React, { useState } from 'react';
import useConfirm from '../../../../hooks/useConfirm.jsx';
import ExpandableText from '../../../../components/ui/ExpandableText.jsx';
import DuneIcon from '../ui/DuneIcon.jsx';
import { DuneField, DuneFrame } from '../ui/DuneFields.jsx';
import DuneAssetCatalog, { QualityPills } from '../modals/DuneAssetCatalog.jsx';

const splitKeywords = (s) => (s ?? '').split(',').map(k => k.trim()).filter(Boolean);

/**
 * @param {object}   props.c         personnage affiché (brouillon en édition)
 * @param {boolean}  props.editing
 * @param {Function} props.onDraft   (patch) => void : brouillon du mode Édition
 * @param {Function} props.onPatch   (patch) => void : action de jeu, enregistrée tout de suite
 * @param {Function} props.onAddRow  (field, row) => void : ajout d'une ligne (id réel du serveur)
 */
const DuneAssets = ({ c, editing, onDraft, onPatch, onAddRow }) => {
    const [catalogOpen, setCatalogOpen] = useState(false);
    const { confirm, confirmEl } = useConfirm();
    const items = c.items ?? [];

    const setItems = (next) => (editing ? onDraft : onPatch)({ items: next });
    const updateItem = (index, fields) => setItems(items.map((it, i) => (i === index ? { ...it, ...fields } : it)));
    const removeItem = async (index) => {
        const ok = editing || await confirm({
            title: 'Retirer un atout', message: `Retirer « ${items[index].nom} » de la fiche ?`, confirmText: 'Retirer', danger: true,
        });
        if (ok) setItems(items.filter((_, i) => i !== index));
    };

    return (
        <DuneFrame title="Atouts">
            {items.length === 0 && <p className="text-sm text-muted">Aucun atout.</p>}
            {items.map((it, i) => editing ? (
                <div key={it.id ?? `new-${i}`} className="dn-item">
                    <div className="flex flex-col gap-2 col-span-2">
                        <div className="flex gap-2 items-end">
                            <DuneField className="flex-1" label="Nom" value={it.nom} onChange={v => updateItem(i, { nom: v })} />
                            <button type="button" className="dn-iconbtn text-danger" onClick={() => removeItem(i)} title="Retirer l'atout">
                                <DuneIcon name="trash" />
                            </button>
                        </div>
                        <DuneField label="Description" rows={3} value={it.description} onChange={v => updateItem(i, { description: v })} />
                        <QualityPills value={it.qualite ?? null} onChange={q => updateItem(i, { qualite: q })} />
                        <DuneField label="Mots-clefs" value={it.motsCles} onChange={v => updateItem(i, { motsCles: v })} placeholder="Arme, Fremen…" />
                    </div>
                </div>
            ) : (
                <div key={it.id ?? `new-${i}`} className="dn-item group">
                    <div className="dn-item-name">
                        {it.nom}
                        {it.qualite != null && <span className="dn-q">Q {it.qualite}</span>}
                        {splitKeywords(it.motsCles).map(k => <span key={k} className="dn-kw">{k}</span>)}
                    </div>
                    <div className="dn-qty">
                        <button type="button" onClick={() => updateItem(i, { quantite: Math.max(1, (it.quantite ?? 1) - 1) })} disabled={(it.quantite ?? 1) <= 1} aria-label="Quantité −1">−</button>
                        {it.quantite ?? 1}
                        <button type="button" onClick={() => updateItem(i, { quantite: (it.quantite ?? 1) + 1 })} aria-label="Quantité +1">+</button>
                        <button type="button" className="opacity-0 group-hover:opacity-100" onClick={() => removeItem(i)} title="Retirer l'atout" aria-label="Retirer l'atout">
                            <DuneIcon name="trash" className="dn-ico w-3.5 h-3.5" />
                        </button>
                    </div>
                    {it.description?.trim() && (
                        <ExpandableText text={it.description} maxLength={140} className="dn-item-desc whitespace-pre-line" />
                    )}
                </div>
            ))}
            {!editing && (
                <button type="button" className="dn-add mt-3" onClick={() => setCatalogOpen(true)}>
                    <DuneIcon name="plus" className="dn-ico w-3.5 h-3.5" />Ajouter un atout
                </button>
            )}

            {catalogOpen && <DuneAssetCatalog onAdd={item => onAddRow('items', item)} onClose={() => setCatalogOpen(false)} />}
            {confirmEl}
        </DuneFrame>
    );
};

export default DuneAssets;
