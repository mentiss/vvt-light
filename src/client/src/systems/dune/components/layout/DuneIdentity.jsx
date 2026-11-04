// src/client/src/systems/dune/components/layout/DuneIdentity.jsx
// Colonne Identité de la fiche (joueur et MJ) : portrait, prénom et nom, devise,
// joueur, statut, champs de la feuille officielle (rôle, faction, traits, ambition),
// physique, description, Maison de la table, Détermination (spec_dune.md §6.1).
// Hors édition : la Détermination se joue (+ / −) et s'enregistre tout de suite.
// Mode Édition : tous les textes, le portrait d'un clic.

import React, { useState } from 'react';
import DuneIcon from '../ui/DuneIcon.jsx';
import { DuneField, DuneFrame } from '../ui/DuneFields.jsx';

const DETERMINATION_SHOWN = 3;   // yeux affichés au minimum (repère du livre, sans plafond dans l'app)

const KV_FIELDS = [
    { key: 'playerName',         label: 'Joueur' },
    { key: 'statutSocial',       label: 'Statut' },
    { key: 'role',               label: 'Rôle' },
    { key: 'faction',            label: 'Faction' },
    { key: 'traitsPersonnalite', label: 'Traits' },
    { key: 'ambition',           label: 'Ambition' },
];

const PHYSICAL = [
    { key: 'age',    label: 'Âge' },
    { key: 'taille', label: 'Taille' },
    { key: 'poids',  label: 'Poids' },
    { key: 'sexe',   label: 'Sexe' },
];

const Portrait = ({ avatar, editing, onAvatar }) => {
    const content = avatar ? <img src={avatar} alt="" /> : null;
    return editing && onAvatar ? (
        <button type="button" className="dn-portrait dn-brackets" onClick={onAvatar} title="Changer le portrait">{content}</button>
    ) : (
        <div className="dn-portrait dn-brackets">{content}</div>
    );
};

/**
 * @param {object}   props.c            personnage affiché (brouillon en édition)
 * @param {boolean}  props.editing
 * @param {Function} props.onDraft      (patch) => void : brouillon du mode Édition
 * @param {Function} props.onAvatar     ouvre l'outil de portrait
 * @param {Function} props.onDetermination (delta) => void : action de jeu
 * @param {{ nom, description }|null} props.house  Maison de la table
 */
const DuneIdentity = ({ c, editing, onDraft, onAvatar, onDetermination, house }) => {
    const [descOpen, setDescOpen] = useState(false);
    const determination = c.determination ?? 0;
    const eyes = Math.max(DETERMINATION_SHOWN, determination);
    const physical = PHYSICAL.filter(f => c[f.key]?.toString().trim());

    return (
        <DuneFrame>
            <div className="flex gap-4">
                <Portrait avatar={c.avatar} editing={editing} onAvatar={onAvatar} />
                <div className="min-w-0 flex-1">
                    {editing ? (
                        <div className="flex flex-col gap-2">
                            <DuneField label="Prénom" value={c.prenom} onChange={v => onDraft({ prenom: v })} />
                            <DuneField label="Nom" value={c.nom} onChange={v => onDraft({ nom: v })} />
                            <DuneField label="Devise" value={c.motto} onChange={v => onDraft({ motto: v })} placeholder="« … »" />
                        </div>
                    ) : (
                        <>
                            <div className="dn-name">{c.prenom || c.nom}{c.prenom && c.nom && <span>{c.nom}</span>}</div>
                            {c.motto && <div className="dn-motto">« {c.motto} »</div>}
                        </>
                    )}
                </div>
            </div>

            {editing ? (
                <div className="grid grid-cols-2 gap-2 mt-4">
                    {KV_FIELDS.map(f => (
                        <DuneField key={f.key} label={f.label} value={c[f.key]} onChange={v => onDraft({ [f.key]: v })} />
                    ))}
                    {PHYSICAL.map(f => (
                        <DuneField key={f.key} label={f.label} value={c[f.key]} onChange={v => onDraft({ [f.key]: v })} />
                    ))}
                    <DuneField className="col-span-2" label="Description" rows={4} value={c.description} onChange={v => onDraft({ description: v })} />
                </div>
            ) : (
                <>
                    <dl className="dn-kv mt-4">
                        {KV_FIELDS.filter(f => c[f.key]?.trim()).map(f => (
                            <React.Fragment key={f.key}><dt>{f.label}</dt><dd>{c[f.key]}</dd></React.Fragment>
                        ))}
                    </dl>
                    {physical.length > 0 && (
                        <div className="dn-physical mt-3">
                            {physical.map(f => <span key={f.key}>{f.label} <b>{c[f.key]}</b></span>)}
                        </div>
                    )}
                    {c.description?.trim() && (
                        <button type="button" className={`text-left text-sm text-muted mt-3 whitespace-pre-line${descOpen ? '' : ' line-clamp-3'}`}
                                onClick={() => setDescOpen(o => !o)} title={descOpen ? 'Replier' : 'Déplier'}>
                            {c.description}
                        </button>
                    )}
                </>
            )}

            {house?.nom?.trim() && (
                <div className="dn-house mt-4" title={house.description || undefined}>
                    <DuneIcon name="house" />
                    <span className="min-w-0">
                        <small>Maison de la table</small>
                        <b>{house.nom}</b>
                        {house.description?.trim() && <span className="block text-sm text-muted line-clamp-2">{house.description}</span>}
                    </span>
                </div>
            )}

            <div className="dn-det mt-4">
                <span className="dn-det-label">Détermination</span>
                <div className="dn-det-eyes" aria-label={`Détermination : ${determination}`}>
                    {Array.from({ length: eyes }, (_, i) => (
                        <DuneIcon key={i} name="eye" className={`dn-eye${i < determination ? ' is-full' : ''}`} />
                    ))}
                </div>
                <div className="dn-stepper ml-auto">
                    <button type="button" onClick={() => onDetermination(-1)} disabled={determination <= 0} title="Dépenser un point de Détermination">
                        <DuneIcon name="minus" className="dn-ico w-3.5 h-3.5" />
                    </button>
                    <button type="button" onClick={() => onDetermination(1)} title="Gagner un point de Détermination">
                        <DuneIcon name="plus" className="dn-ico w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
        </DuneFrame>
    );
};

export default DuneIdentity;
