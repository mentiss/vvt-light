// src/client/src/systems/fabula/components/layout/TraitsPanel.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Identité complète du personnage, en carte de héros (planche §3) : portrait
// avec le niveau global, prénom et nom (deux champs), joueur, classes en
// pastilles, concept évocateur, mensurations (colonnes plateforme, base.sql).
// L'avatar vit ici (pas dans la bande — elle ne porte que le titre du jeu).
// Le champ "Groupe" a été retiré (doublon avec la notion de session/table).
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import FuIcon from '../ui/FuIcon.jsx';
import { CLASSES } from '../../config.jsx';

const INPUT = 'bg-default border border-default rounded px-2 py-1 text-sm w-full min-w-0';

/** Pastille de classe → défile jusqu'à la classe (ClassesSkillsPanel) et la fait briller. */
const goToClass = (classKey) => {
    const card = document.getElementById(`fu-job-${classKey}`);
    if (!card) return;
    card.scrollIntoView({ behavior: 'smooth', block: 'start' });
    card.classList.remove('is-flash');
    void card.offsetWidth; // relance l'animation sur un second clic
    card.classList.add('is-flash');
    card.addEventListener('animationend', () => card.classList.remove('is-flash'), { once: true });
};

const TraitsPanel = ({ character, editMode, onFieldChange, onAvatarClick }) => {
    const classes = character.classes ?? [];
    const level = classes.reduce((t, c) => t + (c.niveau || 0), 0);

    const textField = (field, placeholder = '') => editMode ? (
        <input value={character[field] ?? ''} placeholder={placeholder}
               onChange={e => onFieldChange(field, e.target.value)} className={INPUT} />
    ) : (
        <p className="text-sm">{character[field] || '—'}</p>
    );

    const numberField = (field) => editMode ? (
        <input type="number" value={character[field] ?? ''}
               onChange={e => onFieldChange(field, e.target.value === '' ? null : parseInt(e.target.value))}
               className={`${INPUT} text-center`} />
    ) : (
        <b>{character[field] ?? '—'}</b>
    );

    return (
        <div className="fu-win">
            <div className="fu-win-head">
                <h3 className="fu-title">Héros<span className="fu-kana" aria-hidden="true">キャラクター</span></h3>
                <span className="fu-rule" />
            </div>

            {/* Bandeau en pleine largeur : trois zones côte à côte (identité ·
                concept évocateur · mensurations), empilées sur écran étroit. */}
            <div className="fu-hero-body">
            {/* Portrait + prénom, nom, joueur, classes */}
            <div className="flex gap-3">
                <button type="button" onClick={() => editMode && onAvatarClick?.()}
                        className={`fu-portrait${editMode ? ' is-editable' : ''}`}
                        title={editMode ? "Changer l'avatar" : undefined}>
                    {character.avatar
                        ? <img src={character.avatar} alt="" />
                        : <FuIcon name="hero" className="fu-ico text-muted" />}
                    {level > 0 && <span className="fu-lv">NIV {level}</span>}
                </button>
                <div className="flex-1 min-w-0">
                    {editMode ? (
                        <div className="flex flex-col gap-1">
                            <input value={character.prenom ?? ''} onChange={e => onFieldChange('prenom', e.target.value)}
                                   placeholder="Prénom" className={INPUT} />
                            <input value={character.nom ?? ''} onChange={e => onFieldChange('nom', e.target.value)}
                                   placeholder="Nom du personnage" className={INPUT} />
                            <input value={character.playerName ?? ''} onChange={e => onFieldChange('playerName', e.target.value)}
                                   placeholder="Nom du joueur" className={INPUT} />
                        </div>
                    ) : (
                        <>
                            <div className="fu-hero-name">{[character.prenom, character.nom].filter(Boolean).join(' ') || 'Sans nom'}</div>
                            <div className="fu-hero-player">{character.playerName || '—'}</div>
                        </>
                    )}
                    {classes.length > 0 && (
                        <div className="fu-jobs">
                            {classes.map(c => (
                                <button key={c.classKey} type="button" onClick={() => goToClass(c.classKey)}
                                        className="fu-job is-link" title="Aller à la classe">
                                    <i>{c.niveau}</i>{CLASSES[c.classKey]?.nom ?? c.classKey}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="fu-hero-zone">
            <div className="fu-label mb-2">Concept évocateur</div>
            <div className="fu-concept-line"><span className="fu-label">Identité</span>{textField('identite', 'ex : Ancien chevalier en quête de rédemption')}</div>
            <div className="fu-concept-line"><span className="fu-label">Origine</span>{textField('origine', 'ex : Le Royaume Céleste de Baron')}</div>
            <div className="fu-concept-line"><span className="fu-label">Thème</span>{textField('theme', 'ex : Ambition, Justice, Espoir')}</div>
            </div>

            <div className="fu-hero-zone fu-mini-grid">
                <div className="fu-mini"><span className="fu-label">Sexe</span>{editMode ? textField('sexe') : <b>{character.sexe || '—'}</b>}</div>
                <div className="fu-mini"><span className="fu-label">Âge</span>{numberField('age')}</div>
                <div className="fu-mini"><span className="fu-label">Taille (cm)</span>{numberField('taille')}</div>
                <div className="fu-mini"><span className="fu-label">Poids (kg)</span>{numberField('poids')}</div>
            </div>
            </div>
        </div>
    );
};

export default TraitsPanel;
