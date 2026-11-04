// src/client/src/systems/dune/components/creation/CreationSteps.jsx
// Onglets de l'assistant de création (spec_dune.md §6.5) : Guide, Identité, Compétences,
// Principes, Points libres, Talents et atouts, Récapitulatif, puis l'écran du code d'accès.
// Chaque onglet reçoit { state, setState, setHelp } ; setHelp(aide | null) remplit la colonne
// d'aide contextuelle au survol ou au focus d'un élément.

import React, { useState } from 'react';
import CopyAccessButton from '../../../../components/ui/CopyAccessButton.jsx';
import DuneIcon from '../ui/DuneIcon.jsx';
import DuneWorm from '../ui/DuneWorm.jsx';
import { DuneField, DuneFrame, DuneStepper } from '../ui/DuneFields.jsx';
import DuneAssetCatalog from '../modals/DuneAssetCatalog.jsx';
import DuneTalentCatalog, { talentRestriction } from '../modals/DuneTalentCatalog.jsx';
import { COMPETENCES, PRINCIPES, traitLabel } from '../../config/traits.js';
import { COMPETENCE_HELP, PRINCIPE_HELP, COMPETENCE_RANKS, PRINCIPE_RANKS, GUIDE } from '../../config/descriptions.js';
import {
    finalRank, freePointsLeft, rankMax, textUnlocked, canChangeBase, canChangeBonus,
    TEXT_UNLOCK_RANK, FREE_POINTS,
} from '../../config/rules/creation.js';

// ── Aides contextuelles ─────────────────────────────────────────────────────

const traitHelp = (group, key, entry) => {
    const isPrincipe = group === 'principes';
    const h = (isPrincipe ? PRINCIPE_HELP : COMPETENCE_HELP)[key];
    const ranks = isPrincipe ? PRINCIPE_RANKS : COMPETENCE_RANKS;
    const rank = finalRank(entry);
    return {
        title: traitLabel(key),
        text: h.text,
        use: h.use,
        rank: ranks[rank] ? `Rang ${rank} : ${ranks[rank]}` : null,   // échelle du livre : 4 à 8
        examples: isPrincipe ? h.maximes : null,
    };
};

// Rend un élément sensible au survol et au focus (aide contextuelle)
const hoverHelp = (setHelp, help) => ({
    onMouseEnter: () => setHelp(help),
    onFocus: () => setHelp(help),
});

// ── Guide ───────────────────────────────────────────────────────────────────

export const GuideStep = () => (
    <DuneFrame title="Le chemin du personnage">
        <ol className="flex flex-col gap-3">
            {GUIDE.map((g, i) => (
                <li key={g.title} className="flex gap-4 items-start">
                    <span className="dn-hex"><span>{i + 1}</span></span>
                    <span>
                        <span className="dn-row-name">{g.title}</span>
                        <span className="block text-sm text-muted">{g.text}</span>
                    </span>
                </li>
            ))}
        </ol>
    </DuneFrame>
);

// ── Identité ────────────────────────────────────────────────────────────────

const IDENTITY_FIELDS = [
    { key: 'prenom',             label: 'Prénom' },
    { key: 'nom',                label: 'Nom du personnage *' },
    { key: 'playerName',         label: 'Nom du joueur *' },
    { key: 'statutSocial',       label: 'Statut social', placeholder: 'Mentat, Fremen, noble de Maison…' },
    { key: 'role',               label: 'Rôle', placeholder: 'Maître d’armes, Émissaire, Héritier…' },
    { key: 'faction',            label: 'Faction', placeholder: 'Maison, Sietch, Guilde…' },
    { key: 'traitsPersonnalite', label: 'Traits de personnalité', placeholder: '« Juste et sage », « impitoyable »…' },
    { key: 'ambition',           label: 'Ambition' },
    { key: 'motto',              label: 'Devise' },
    { key: 'age',                label: 'Âge' },
    { key: 'taille',             label: 'Taille' },
    { key: 'poids',              label: 'Poids' },
    { key: 'sexe',               label: 'Sexe' },
];

export const IdentityStep = ({ state, setState }) => {
    const set = (key, value) => setState(s => ({ ...s, identity: { ...s.identity, [key]: value } }));
    return (
        <DuneFrame title="Identité">
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
                {IDENTITY_FIELDS.map(f => (
                    <DuneField key={f.key} label={f.label} value={state.identity[f.key]} placeholder={f.placeholder}
                               onChange={v => set(f.key, v)} />
                ))}
                <DuneField className="sm:col-span-2" label="Description" rows={4} value={state.identity.description}
                           placeholder="Apparence, origine, motivations…" onChange={v => set('description', v)} />
            </div>
        </DuneFrame>
    );
};

// ── Compétences et principes (rangs de base) ────────────────────────────────

const TraitBaseRow = ({ group, traitKey, entry, onChange, setHelp }) => {
    const isPrincipe = group === 'principes';
    const textKey = isPrincipe ? 'maxime' : 'specialisation';
    return (
        <div className="dn-row is-static" {...hoverHelp(setHelp, traitHelp(group, traitKey, entry))}>
            <DuneStepper value={entry.rang} label={traitLabel(traitKey)} min={1} max={rankMax(group) - entry.bonus}
                         onChange={rang => canChangeBase(entry, group, rang - entry.rang) && onChange({ ...entry, rang })} />
            <span className="dn-row-main flex flex-col gap-1">
                <span className="dn-row-name">
                    {traitLabel(traitKey)}
                    {entry.bonus > 0 && <span className="dn-q ml-2">+{entry.bonus} libre{entry.bonus > 1 ? 's' : ''}</span>}
                </span>
                {textUnlocked(entry) ? (
                    <input className="vtt-input" value={entry[textKey]} placeholder={isPrincipe ? 'Maxime…' : 'Spécialisation…'}
                           onChange={e => onChange({ ...entry, [textKey]: e.target.value })} />
                ) : (
                    <span className="dn-row-sub">{isPrincipe ? 'Maxime' : 'Spécialisation'} au rang {TEXT_UNLOCK_RANK}</span>
                )}
            </span>
        </div>
    );
};

export const TraitsStep = ({ group, state, setState, setHelp }) => {
    const traits = group === 'principes' ? PRINCIPES : COMPETENCES;
    const set = (key, entry) => setState(s => ({ ...s, [group]: { ...s[group], [key]: entry } }));
    return (
        <DuneFrame title={group === 'principes' ? 'Principes' : 'Compétences'} hint={group === 'principes' ? 'De 1 à 8' : 'Rang 1 au minimum'}>
            {traits.map(({ key }) => (
                <TraitBaseRow key={key} group={group} traitKey={key} entry={state[group][key]}
                              onChange={entry => set(key, entry)} setHelp={setHelp} />
            ))}
        </DuneFrame>
    );
};

// ── Points libres ───────────────────────────────────────────────────────────

const PointsColumn = ({ group, state, setState, setHelp }) => {
    const traits = group === 'principes' ? PRINCIPES : COMPETENCES;
    const change = (key, delta) => setState(s => {
        const entry = s[group][key];
        if (!canChangeBonus(s, entry, group, delta)) return s;
        return { ...s, [group]: { ...s[group], [key]: { ...entry, bonus: entry.bonus + delta } } };
    });
    return (
        <DuneFrame title={group === 'principes' ? 'Principes' : 'Compétences'}>
            {traits.map(({ key }) => {
                const entry = state[group][key];
                return (
                    <div key={key} className="dn-row is-static" {...hoverHelp(setHelp, traitHelp(group, key, entry))}>
                        <span className="dn-hex"><span>{finalRank(entry)}</span></span>
                        <span className="dn-row-main">
                            <span className="dn-row-name">{traitLabel(key)}</span>
                            <span className="dn-row-sub">Base {entry.rang}{entry.bonus > 0 && ` · +${entry.bonus}`}</span>
                        </span>
                        <div className="dn-stepper">
                            <button type="button" onClick={() => change(key, -1)} disabled={!canChangeBonus(state, entry, group, -1)} aria-label={`${traitLabel(key)} −1`}>
                                <DuneIcon name="minus" className="dn-ico w-3.5 h-3.5" />
                            </button>
                            <button type="button" onClick={() => change(key, 1)} disabled={!canChangeBonus(state, entry, group, 1)} aria-label={`${traitLabel(key)} +1`}>
                                <DuneIcon name="plus" className="dn-ico w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                );
            })}
        </DuneFrame>
    );
};

export const PointsStep = (props) => {
    const left = freePointsLeft(props.state);
    return (
        <div className="flex flex-col gap-6">
            <div className="dn-pool">
                <div className="dn-pool-eq">Un point = un rang. Les principes restent plafonnés à 8.</div>
                <div className="dn-pool-big"><strong>{left}<small>/{FREE_POINTS}</small></strong><span>Points libres</span></div>
            </div>
            <div className="dn-traits">
                <PointsColumn group="competences" {...props} />
                <PointsColumn group="principes" {...props} />
            </div>
        </div>
    );
};

// ── Talents et atouts ───────────────────────────────────────────────────────

export const ExtrasStep = ({ state, setState }) => {
    const [catalog, setCatalog] = useState(null);   // 'talents' | 'items' | null
    const add = (field, row) => setState(s => ({ ...s, [field]: [...s[field], row] }));
    const remove = (field, index) => setState(s => ({ ...s, [field]: s[field].filter((_, i) => i !== index) }));

    return (
        <div className="dn-traits">
            <DuneFrame title="Talents">
                {state.talents.length === 0 && <p className="text-sm text-muted">Aucun talent.</p>}
                {state.talents.map((t, i) => (
                    <div key={`${t.talentName}-${i}`} className="dn-item">
                        <div className="dn-item-name">
                            {t.talentName}
                            {talentRestriction(t.talentName) && <span className="dn-restr">{talentRestriction(t.talentName)}</span>}
                        </div>
                        <div className="dn-qty">
                            <button type="button" onClick={() => remove('talents', i)} title="Retirer"><DuneIcon name="close" className="dn-ico w-3 h-3" /></button>
                        </div>
                        {t.description && <div className="dn-item-desc line-clamp-2">{t.description}</div>}
                    </div>
                ))}
                <button type="button" className="dn-add mt-3" onClick={() => setCatalog('talents')}>
                    <DuneIcon name="plus" className="dn-ico w-3.5 h-3.5" />Ajouter un talent
                </button>
            </DuneFrame>
            <DuneFrame title="Atouts">
                {state.items.length === 0 && <p className="text-sm text-muted">Aucun atout.</p>}
                {state.items.map((a, i) => (
                    <div key={`${a.nom}-${i}`} className="dn-item">
                        <div className="dn-item-name">
                            {a.nom}
                            {a.qualite != null && <span className="dn-q">Q {a.qualite}</span>}
                        </div>
                        <div className="dn-qty">
                            <button type="button" onClick={() => remove('items', i)} title="Retirer"><DuneIcon name="close" className="dn-ico w-3 h-3" /></button>
                        </div>
                        {a.description && <div className="dn-item-desc line-clamp-2">{a.description}</div>}
                    </div>
                ))}
                <button type="button" className="dn-add mt-3" onClick={() => setCatalog('items')}>
                    <DuneIcon name="plus" className="dn-ico w-3.5 h-3.5" />Ajouter un atout
                </button>
            </DuneFrame>

            {catalog === 'talents' && <DuneTalentCatalog onAdd={t => add('talents', t)} onClose={() => setCatalog(null)} />}
            {catalog === 'items' && <DuneAssetCatalog onAdd={a => add('items', a)} onClose={() => setCatalog(null)} />}
        </div>
    );
};

// ── Récapitulatif ───────────────────────────────────────────────────────────

const RecapTraits = ({ title, traits, group, state }) => (
    <DuneFrame title={title}>
        {traits.map(({ key }) => {
            const e = state[group][key];
            const text = textUnlocked(e) ? (group === 'principes' ? e.maxime : e.specialisation).trim() : '';
            return (
                <div key={key} className="dn-row is-static">
                    <span className="dn-hex"><span>{finalRank(e)}</span></span>
                    <span className="dn-row-main">
                        <span className="dn-row-name">{traitLabel(key)}</span>
                        <span className={`dn-row-sub${group === 'principes' && text ? ' is-quote' : ''}`}>
                            {text ? (group === 'principes' ? text : <span className="dn-spec">{text}</span>) : '—'}
                        </span>
                    </span>
                </div>
            );
        })}
    </DuneFrame>
);

export const RecapStep = ({ state, error }) => {
    const id = state.identity;
    return (
        <div className="flex flex-col gap-6">
            <DuneFrame>
                <div className="dn-name">{id.prenom || id.nom || 'Sans nom'}{id.prenom && id.nom && <span>{id.nom}</span>}</div>
                {id.motto && <div className="dn-motto">« {id.motto} »</div>}
                <div className="dn-physical mt-3">
                    {id.playerName && <span>Joueur <b>{id.playerName}</b></span>}
                    {id.statutSocial && <span>Statut <b>{id.statutSocial}</b></span>}
                    {id.role && <span>Rôle <b>{id.role}</b></span>}
                    {id.faction && <span>Faction <b>{id.faction}</b></span>}
                    <span>Talents <b>{state.talents.length}</b></span>
                    <span>Atouts <b>{state.items.length}</b></span>
                </div>
            </DuneFrame>
            <div className="dn-traits">
                <RecapTraits title="Principes" traits={PRINCIPES} group="principes" state={state} />
                <RecapTraits title="Compétences" traits={COMPETENCES} group="competences" state={state} />
            </div>
            {error && <div className="dn-callout">{error}</div>}
        </div>
    );
};

// ── Écran du code d'accès ───────────────────────────────────────────────────

export const CreatedScreen = ({ created, onEnter }) => {
    return (
        <div className="dn-empty">
            <DuneWorm />
            <div className="dn-name">{[created.prenom, created.nom].filter(Boolean).join(' ')}</div>
            <p>Votre code d’accès</p>
            <div className="dn-access-code">{created.accessCode}</div>
            <div className="flex gap-2 flex-wrap justify-center">
                <CopyAccessButton character={created} codeOnly icon={<DuneIcon name="key" className="dn-ico w-4 h-4" />} />
                <button type="button" className="vtt-btn vtt-btn-primary" onClick={() => onEnter(created)}>Accéder à la fiche</button>
            </div>
            <p>Conservez ce code : c’est votre clé d’accès.</p>
        </div>
    );
};
