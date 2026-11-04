// src/client/src/systems/dune/components/layout/DuneTalents.jsx
// Talents (fiche joueur et MJ). Ajout hors édition, depuis le catalogue des talents du
// livre ou en saisie libre ; mode Édition : nom, description, retrait.

import React, { useState } from 'react';
import DuneIcon from '../ui/DuneIcon.jsx';
import { DuneField, DuneFrame } from '../ui/DuneFields.jsx';
import DuneTalentCatalog, { talentRestriction } from '../modals/DuneTalentCatalog.jsx';

/**
 * @param {object}   props.c         personnage affiché (brouillon en édition)
 * @param {boolean}  props.editing
 * @param {Function} props.onDraft   (patch) => void
 * @param {Function} props.onAddRow  (field, row) => void
 */
const DuneTalents = ({ c, editing, onDraft, onAddRow }) => {
    const [catalogOpen, setCatalogOpen] = useState(false);
    const [openId, setOpenId] = useState(null);
    const talents = c.talents ?? [];

    const updateTalent = (index, fields) => onDraft({ talents: talents.map((t, i) => (i === index ? { ...t, ...fields } : t)) });
    const removeTalent = (index) => onDraft({ talents: talents.filter((_, i) => i !== index) });
    const toggleDesc = (key) => setOpenId(o => (o === key ? null : key));

    return (
        <DuneFrame title="Talents">
            {talents.length === 0 && <p className="text-sm text-muted">Aucun talent.</p>}
            {talents.map((t, i) => editing ? (
                <div key={t.id ?? `new-${i}`} className="dn-item">
                    <div className="flex flex-col gap-2 col-span-2">
                        <div className="flex gap-2 items-end">
                            <DuneField className="flex-1" label="Nom" value={t.talentName} onChange={v => updateTalent(i, { talentName: v })} />
                            <button type="button" className="dn-iconbtn text-danger" onClick={() => removeTalent(i)} title="Retirer le talent">
                                <DuneIcon name="trash" />
                            </button>
                        </div>
                        <DuneField label="Description" rows={3} value={t.description} onChange={v => updateTalent(i, { description: v })} />
                    </div>
                </div>
            ) : (
                <div key={t.id ?? `new-${i}`} className="dn-item">
                    <div className="dn-item-name">
                        {t.talentName}
                        {talentRestriction(t.talentName) && <span className="dn-restr">{talentRestriction(t.talentName)}</span>}
                    </div>
                    {t.description?.trim() && (
                        <button type="button" className={`dn-item-desc text-left whitespace-pre-line${openId === (t.id ?? i) ? '' : ' line-clamp-2'}`}
                                onClick={() => toggleDesc(t.id ?? i)}>
                            {t.description}
                        </button>
                    )}
                </div>
            ))}
            {!editing && (
                <button type="button" className="dn-add mt-3" onClick={() => setCatalogOpen(true)}>
                    <DuneIcon name="plus" className="dn-ico w-3.5 h-3.5" />Ajouter un talent
                </button>
            )}

            {catalogOpen && <DuneTalentCatalog onAdd={t => onAddRow('talents', t)} onClose={() => setCatalogOpen(false)} />}
        </DuneFrame>
    );
};

export default DuneTalents;
