// src/client/src/systems/vikings/components/layout/IdentitySection.jsx
// En-tête de la fiche : avatar, nom complet, informations, états (KO, malus).
// En mode édition : champs d'identité.

import React from 'react';
import { formatFullName } from '../../config/utils.js';
import { BLESSURE_MAX, getBlessureMalus, getFatigueMalus, getFatigueState, isFatigueKO } from '../../config/rules.js';
import VkIcon from '../ui/VkIcon.jsx';

const Field = ({ label, className = '', children }) => (
    <label className={className}>
        <span className="vk-field-label">{label}</span>
        {children}
    </label>
);

// États visibles d'un coup d'œil (rappelés aussi au moment du jet)
export const StatusTags = ({ char }) => {
    const blessureMalus = getBlessureMalus(char.tokensBlessure);
    const fatigueMalus  = getFatigueMalus(char.tokensFatigue);
    return (
        <div className="flex flex-wrap gap-2">
            {char.tokensBlessure >= BLESSURE_MAX
                ? <span className="vk-tag vk-tag-danger">KO / Mourant</span>
                : blessureMalus > 0 && <span className="vk-tag vk-tag-warn"><VkIcon name="blood" />Blessures : −{blessureMalus} dé{blessureMalus > 1 ? 's' : ''}</span>}
            {isFatigueKO(char.tokensFatigue)
                ? <span className="vk-tag vk-tag-danger">Inconscient (épuisement)</span>
                : fatigueMalus > 0 && <span className="vk-tag vk-tag-warn"><VkIcon name="moon" />{getFatigueState(char.tokensFatigue)} : +{fatigueMalus} succès requis</span>}
        </div>
    );
};

const Avatar = ({ avatar, initial, onClick }) => (
    <button type="button" onClick={onClick} disabled={!onClick}
            className="vk-avatar w-16 h-16 text-2xl shrink-0 overflow-hidden disabled:cursor-default"
            title={onClick ? "Changer l'avatar" : undefined}>
        {avatar ? <img src={avatar} alt="" className="w-full h-full object-cover" /> : (initial || '?')}
    </button>
);

const IdentitySection = ({ char, editMode, set, onAvatarClick }) => {
    const num = (field, fallback) => (e) => set(field, parseInt(e.target.value) || fallback);
    const initial = char.prenom?.[0]?.toUpperCase();

    if (editMode) {
        return (
            <div className="flex items-start gap-4 flex-wrap pr-6">
                <Avatar avatar={char.avatar} initial={initial} onClick={onAvatarClick} />
                <div className="flex-1 min-w-0 grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Field label="Prénom *"><input className="vk-input" value={char.prenom ?? ''} onChange={e => set('prenom', e.target.value)} /></Field>
                    <Field label="Surnom"><input className="vk-input" value={char.surnom ?? ''} onChange={e => set('surnom', e.target.value)} placeholder="Le Brave" /></Field>
                    <Field label="Nom du parent (fils / fille de)"><input className="vk-input" value={char.nom ?? ''} onChange={e => set('nom', e.target.value)} placeholder="Ragnar" /></Field>
                    <Field label="Joueur"><input className="vk-input" value={char.playerName ?? ''} onChange={e => set('playerName', e.target.value)} /></Field>
                    <Field label="Âge"><input className="vk-input vk-num" type="number" value={char.age ?? ''} onChange={num('age', 25)} /></Field>
                    <Field label="Taille (cm)"><input className="vk-input vk-num" type="number" value={char.taille ?? ''} onChange={num('taille', undefined)} /></Field>
                    <Field label="Poids (kg)"><input className="vk-input vk-num" type="number" value={char.poids ?? ''} onChange={num('poids', undefined)} /></Field>
                    <Field label="Activité"><input className="vk-input" value={char.activite ?? ''} onChange={e => set('activite', e.target.value)} /></Field>
                </div>
            </div>
        );
    }

    const details = [
        `${char.sexe === 'homme' ? 'Homme' : 'Femme'}, ${char.age} ans`,
        char.taille ? `${char.taille} cm${char.poids ? `, ${char.poids} kg` : ''}` : null,
        char.activite || null,
    ].filter(Boolean).join(' · ');

    return (
        <div className="flex items-center gap-4 flex-wrap pr-6">
            <Avatar avatar={char.avatar} initial={initial} onClick={onAvatarClick} />
            <div className="flex-1 min-w-0">
                <div className="vk-title text-2xl">{formatFullName(char)}</div>
                <div className="text-sm text-muted">
                    {details}{char.playerName && <> · <em>joué par {char.playerName}</em></>}
                </div>
            </div>
            <StatusTags char={char} />
        </div>
    );
};

export default IdentitySection;
