// src/client/src/systems/vikings/components/layout/IdentitySection.jsx
// ─────────────────────────────────────────────────────────────────────────────
// En-tête du personnage (spec_vikings_pierre_peinte.md D-4, D-9 ; planche) :
// pierre gravée encadrée du ruban-serpent, qui porte son nom en runes ; avatar,
// nom, détails ; traits en épithètes sous le nom, un clic ouvre la description.
// Berserk : « Entrer en transe » (compteur dans la dalle État, C-4).
// Mode Édition : champs d'identité, épithètes retirables et ajout d'un trait.
// L'état du personnage (malus, KO) est dans la dalle État, plus ici.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { formatFullName } from '../../config/utils.js';
import { toRunes } from '../../config/runes.js';
import { TRAITS } from '../../config/traits.js';
import VkSerpent from '../ui/VkSerpent.jsx';
import VkIcon from '../ui/VkIcon.jsx';

const Field = ({ label, className = '', children }) => (
    <label className={className}>
        <span className="vk-field-label">{label}</span>
        {children}
    </label>
);

const Avatar = ({ avatar, initial, onClick }) => (
    <button type="button" onClick={onClick} disabled={!onClick}
            className="vk-avatar vk-stone-avatar shrink-0 overflow-hidden disabled:cursor-default"
            title={onClick ? "Changer l'avatar" : undefined}>
        {avatar ? <img src={avatar} alt="" className="w-full h-full object-cover" /> : (initial || '?')}
    </button>
);

// Effets d'un trait, en clair
export const effectsText = (effects = {}) => [
    effects.actions && `+${effects.actions} action`,
    effects.armure  && `+${effects.armure} armure`,
    effects.seuil   && `+${effects.seuil} seuil`,
    effects.runePoints && `livre de sort ${effects.runePoints}`,
    effects.description,
].filter(Boolean).join(' · ');

// Effet court affiché sur l'épithète (le détail est dans la description)
const shortEffect = (td) => {
    const text = effectsText(td?.effects);
    return text.length <= 26 ? text : '';
};

// Inscription du ruban : « Prénom fils / fille de Parent » en runes
const inscriptionOf = (char) => toRunes([
    char.prenom,
    char.nom ? `${char.sexe === 'homme' ? 'fils' : 'fille'} de ${char.nom}` : '',
].filter(Boolean).join(' '));

const Epithets = ({ char, editMode, set, transe, onTranse, onOpenEditModal }) => {
    const [open, setOpen] = useState(null);
    const traits = char.traits ?? [];
    const td = open && TRAITS.find(t => t.name === open);

    return (
        <>
            <div className="vk-epithets">
                {traits.map(trait => {
                    const def = TRAITS.find(t => t.name === trait.name);
                    const isTrance = trait.name === 'Berserk' && transe > 0;
                    return (
                        <span key={trait.name} className={`vk-epithet ${open === trait.name ? 'is-open' : ''} ${isTrance ? 'is-trance' : ''}`}>
                            <button type="button" onClick={() => setOpen(o => (o === trait.name ? null : trait.name))}>
                                {trait.name}
                                {shortEffect(def) && <small>{shortEffect(def)}</small>}
                            </button>
                            {editMode && (
                                <button type="button" className="vk-epithet-remove" title={`Retirer ${trait.name}`}
                                        onClick={() => set('traits', traits.filter(t => t.name !== trait.name))}>
                                    <VkIcon name="close" />
                                </button>
                            )}
                        </span>
                    );
                })}
                {editMode && (
                    <button type="button" className="vk-btn vk-btn-sm" onClick={() => onOpenEditModal('addTrait')}>
                        <VkIcon name="plus" />Ajouter un trait
                    </button>
                )}
            </div>
            {td && (
                <div className="vk-epithet-pop">
                    <div className="vk-label text-primary">{td.name}</div>
                    {td.description && <p className="text-sm m-0">{td.description}</p>}
                    {effectsText(td.effects) && <p className="text-sm text-success m-0 mt-1">{effectsText(td.effects)}</p>}
                    {td.name === 'Berserk' && !transe && onTranse && (
                        <button type="button" className="vk-btn vk-btn-primary vk-btn-sm mt-2"
                                onClick={() => { onTranse(1); setOpen(null); }}>
                            Entrer en transe
                        </button>
                    )}
                </div>
            )}
        </>
    );
};

/**
 * @param {object}   props.char, props.editMode, props.set, props.onAvatarClick, props.onOpenEditModal
 * @param {number}   [props.transe]   tour de transe berserk en cours (0 : aucune)
 * @param {function} [props.onTranse] démarre la transe (tour 1)
 */
const IdentitySection = ({ char, editMode, set, onAvatarClick, onOpenEditModal, transe = 0, onTranse }) => {
    const num = (field, fallback) => (e) => set(field, parseInt(e.target.value) || fallback);
    const initial = char.prenom?.[0]?.toUpperCase();

    // La filiation est déjà dans le nom complet (formatFullName)
    const details = [
        `${char.sexe === 'homme' ? 'Homme' : 'Femme'}, ${char.age} ans`,
        char.taille ? `${char.taille} cm${char.poids ? `, ${char.poids} kg` : ''}` : null,
        char.activite || null,
    ].filter(Boolean).join(' · ');

    return (
        <div className={`vk-stone ${transe ? 'is-trance' : ''}`}>
            <VkSerpent inscription={inscriptionOf(char)} characterId={char.id} />
            <div className="vk-stone-inner">
                <Avatar avatar={char.avatar} initial={initial} onClick={onAvatarClick} />
                <div className="flex-1 min-w-0">
                    {editMode ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <Field label="Prénom *"><input className="vk-input" value={char.prenom ?? ''} onChange={e => set('prenom', e.target.value)} /></Field>
                            <Field label="Surnom"><input className="vk-input" value={char.surnom ?? ''} onChange={e => set('surnom', e.target.value)} placeholder="Le Brave" /></Field>
                            <Field label="Nom du parent (fils / fille de)"><input className="vk-input" value={char.nom ?? ''} onChange={e => set('nom', e.target.value)} placeholder="Ragnar" /></Field>
                            <Field label="Joueur"><input className="vk-input" value={char.playerName ?? ''} onChange={e => set('playerName', e.target.value)} /></Field>
                            <Field label="Âge"><input className="vk-input vk-num" type="number" value={char.age ?? ''} onChange={num('age', 25)} /></Field>
                            <Field label="Taille (cm)"><input className="vk-input vk-num" type="number" value={char.taille ?? ''} onChange={num('taille', undefined)} /></Field>
                            <Field label="Poids (kg)"><input className="vk-input vk-num" type="number" value={char.poids ?? ''} onChange={num('poids', undefined)} /></Field>
                            <Field label="Activité"><input className="vk-input" value={char.activite ?? ''} onChange={e => set('activite', e.target.value)} /></Field>
                        </div>
                    ) : (
                        <>
                            <div className="vk-rune vk-stone-runes">{toRunes([char.prenom, char.surnom].filter(Boolean).join(' '))}</div>
                            <div className="vk-title vk-stone-name">{formatFullName(char)}</div>
                            <div className="text-sm text-muted">
                                {details}{char.playerName && <> · <em>joué par {char.playerName}</em></>}
                            </div>
                        </>
                    )}
                    <Epithets char={char} editMode={editMode} set={set} transe={transe} onTranse={onTranse} onOpenEditModal={onOpenEditModal} />
                </div>
            </div>
        </div>
    );
};

export default IdentitySection;
