// src/client/src/components/board/SlideList.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Diapositives de la table, côté MJ (documentations/spec_tableau.md §10.8, §12.5) :
// ordre par glisser-déposer (poignée ⠿, rail compris), renommage (✎ ou double clic),
// œil « Montrer / Cacher aux joueurs » (l'activation du tableau est dans l'en-tête de la vue),
// réglages (dessin et déplacement des joueurs), copie, suppression ; en tête,
// poids des images, prolongation (P-5) et « À conserver » (Q-25).
// Trois modes, comme la barre de session, mémorisés par slug (vtt:<slug>:board-slides) :
// panneau, rail (numéros seuls), masquée (un bouton pour rouvrir).
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { useDragOrder } from '../../hooks/useDragOrder.js';
import { usePersistedState } from '../../hooks/usePersistedState.js';
import { getSystemFromPath } from '../../hooks/useSystem.js';
import { GRID_UNITS } from '../../tools/boardGrid.js';

const MODES = ['panel', 'rail', 'hidden'];
const LIST_DEFAULTS = { mode: 'panel', lastVisible: 'panel' };
const isListPrefs = (value) => MODES.includes(value?.mode);

const ICONS = {
    rail:   'M11 17l-5-5 5-5M18 17l-5-5 5-5',
    panel:  'M13 7l5 5-5 5M6 7l5 5-5 5',
    hidden: 'M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 5.1A9.8 9.8 0 0 1 12 5c5 0 9 4.5 10 7a12.8 12.8 0 0 1-3.2 4.2M6.6 6.6C4.3 8 2.7 10.2 2 12c1 2.5 5 7 10 7a9.7 9.7 0 0 0 5.4-1.6',
    reopen: 'M9 5l7 7-7 7',
    rename: 'M4 20l4-1 11-11-3-3L5 16l-1 4zM14 6l3 3',
    shown:  'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
};

const Icon = ({ name }) => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d={ICONS[name]} />
    </svg>
);

const formatSize = (bytes) => (bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} Ko` : `${(bytes / 1024 / 1024).toFixed(1).replace('.', ',')} Mo`);
const formatDate = (iso) => new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });

/** Champ de renommage : Entrée ou sortie du champ valide, Échap annule */
const RenameField = ({ name, onDone }) => {
    const [value, setValue] = useState(name);
    const commit = () => onDone(value.trim() && value.trim() !== name ? value.trim() : null);
    return (
        <input className="vtt-input vtt-board-slide-input" value={value} maxLength={100} autoFocus aria-label="Nom de la diapositive"
               onChange={e => setValue(e.target.value)} onBlur={commit} onClick={e => e.stopPropagation()}
               onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') onDone(null); }} />
    );
};

/** Bascule en pastille, avec ✓ quand elle est active */
const Toggle = ({ on, onClick, children }) => (
    <button type="button" className={`vtt-pill${on ? ' is-selected' : ''}`} aria-pressed={on} onClick={onClick}>
        {on ? '✓ ' : ''}{children}
    </button>
);

/** Nombre validé à la sortie du champ ou par Entrée ; vide = null */
const NumberField = ({ value, placeholder, min = 0, onCommit }) => {
    const [text, setText] = useState(value ?? '');
    const [prev, setPrev] = useState(value);
    if (prev !== value) { setPrev(value); setText(value ?? ''); }   // valeur changée ailleurs
    const commit = () => {
        const parsed = text === '' ? null : Number(String(text).replace(',', '.'));
        if (parsed !== null && (!Number.isFinite(parsed) || parsed <= 0 || parsed < min)) { setText(value ?? ''); return; }
        if (parsed !== value) onCommit(parsed);
    };
    return (
        <input className="vtt-input vtt-board-number" inputMode="decimal" value={text} placeholder={placeholder}
               onChange={e => setText(e.target.value)} onBlur={commit} onKeyDown={e => { if (e.key === 'Enter') e.currentTarget.blur(); }} />
    );
};

/**
 * Valeur et unité d'une case (Q-35, Q-43) ; vide = valeur du niveau au-dessus, en indication.
 * @param {{ value: number, unit: string }} props.inherited valeur reprise quand ce niveau n'en a pas
 */
const GridValue = ({ label, value, unit, inherited, onChange }) => (
    <div className="vtt-board-setting">
        {label}
        <NumberField value={value} placeholder={String(inherited.value).replace('.', ',')} onCommit={gridValue => onChange({ gridValue })} />
        {GRID_UNITS.map(u => (
            <button key={u.id} type="button" className={`vtt-pill${(unit ?? inherited.unit) === u.id ? ' is-selected' : ''}`}
                    onClick={() => onChange({ gridUnit: u.id })}>{u.label}</button>
        ))}
        {(value !== null || unit !== null) && (
            <button type="button" className="vtt-board-link" onClick={() => onChange({ gridValue: null, gridUnit: null })}
                    title={`Reprendre ${String(inherited.value).replace('.', ',')} ${inherited.unit}`}>par défaut</button>
        )}
    </div>
);

/**
 * @param {object} props
 * @param {object} props.board       retour de useBoardSession
 * @param {number|null} props.selectedId diapositive éditée par le MJ
 * @param {Function} props.onSelect
 * @param {Function} props.confirm   confirmation générique (useConfirm)
 * @param {{ value: number, unit: string }} props.slugGrid  grille par défaut du slug (plateforme comprise)
 * @param {{ value: number, unit: string }} props.tableGrid grille de la table (cascade résolue)
 */
const SlideList = ({ board, selectedId, onSelect, confirm, slugGrid, tableGrid }) => {
    const ids = board.slides.map(s => s.id);
    const dragProps = useDragOrder(ids, board.orderSlides);
    const [prefs, setPrefs] = usePersistedState(getSystemFromPath(), 'board-slides', { defaults: LIST_DEFAULTS, validate: isListPrefs });
    const [renamingId, setRenamingId] = useState(null);
    const selected = board.slides.find(s => s.id === selectedId) ?? null;

    const setMode = (mode) => setPrefs(prev => ({ mode, lastVisible: mode === 'hidden' ? prev.lastVisible : mode }));

    const create = async () => {
        const slide = await board.createSlide();
        if (slide) onSelect(slide.id);
    };
    const duplicate = async (id) => {
        const slide = await board.duplicateSlide(id);
        if (slide) onSelect(slide.id);
    };
    const remove = async (slide) => {
        const ok = await confirm({ title: 'Supprimer la diapositive', message: `« ${slide.name} » et tout son contenu seront supprimés.`, confirmText: 'Supprimer', danger: true });
        if (ok) await board.deleteSlide(slide.id);
    };
    const rename = (slide, name) => {
        setRenamingId(null);
        if (name) board.updateSlide(slide.id, { name });
    };
    const toggle = (key) => board.updateSlide(selected.id, { [key]: !selected[key] });

    // Grille : la diapositive suit le défaut de la table tant qu'elle n'a pas sa propre valeur
    const followsTable = !!selected && selected.gridValue === null && selected.gridUnit === null;
    const toggleTableDefault = async () => {
        if (followsTable) {
            // Désactivé : la diapositive garde la valeur actuelle comme la sienne
            await board.updateSlide(selected.id, { gridValue: tableGrid.value, gridUnit: tableGrid.unit });
        } else {
            // Activé : sa valeur devient le défaut de la table, et elle le suit désormais
            await board.setGrid({ gridValue: selected.gridValue ?? tableGrid.value, gridUnit: selected.gridUnit ?? tableGrid.unit });
            await board.updateSlide(selected.id, { gridValue: null, gridUnit: null });
        }
    };

    // ── Masquée : un bouton pour rouvrir, dans le dernier mode visible ──────
    if (prefs.mode === 'hidden') {
        return (
            <button type="button" className="vtt-board-slides-reopen" onClick={() => setMode(prefs.lastVisible)}
                    title="Afficher les diapositives" aria-label="Afficher les diapositives">
                <Icon name="reopen" />
            </button>
        );
    }

    // ── Rail : numéros des diapositives ─────────────────────────────────────
    if (prefs.mode === 'rail') {
        return (
            <aside className="vtt-board-slides is-rail">
                <div className="vtt-board-slides-toggles">
                    <button type="button" className="vtt-board-icon-btn" onClick={() => setMode('panel')} title="Déplier" aria-label="Déplier la liste"><Icon name="panel" /></button>
                    <button type="button" className="vtt-board-icon-btn" onClick={() => setMode('hidden')} title="Masquer" aria-label="Masquer la liste"><Icon name="hidden" /></button>
                </div>
                <ol className="vtt-board-slide-list">
                    {board.slides.map((slide, index) => (
                        <li key={slide.id} {...dragProps(slide.id)} className="vtt-board-rail-item">
                            <button type="button" onClick={() => onSelect(slide.id)} title={slide.name}
                                    aria-label={`${slide.name}${board.shownSlideId === slide.id ? ' (montrée)' : ''}`}
                                    aria-current={slide.id === selectedId ? 'true' : undefined}
                                    className={`vtt-board-rail-slide${slide.id === selectedId ? ' is-selected' : ''}${board.shownSlideId === slide.id ? ' is-shown' : ''}`}>
                                {index + 1}
                            </button>
                        </li>
                    ))}
                </ol>
                <button type="button" className="vtt-board-rail-slide is-add" onClick={create} title="Nouvelle diapositive" aria-label="Nouvelle diapositive">+</button>
            </aside>
        );
    }

    // ── Panneau ─────────────────────────────────────────────────────────────
    return (
        <aside className="vtt-board-slides">
            <div className="vtt-board-slides-head">
                <span className="vtt-board-slides-title">Diapositives</span>
                <div className="vtt-board-slides-toggles">
                    <button type="button" className="vtt-board-icon-btn" onClick={() => setMode('rail')} title="Réduire en rail" aria-label="Réduire en rail"><Icon name="rail" /></button>
                    <button type="button" className="vtt-board-icon-btn" onClick={() => setMode('hidden')} title="Masquer" aria-label="Masquer la liste"><Icon name="hidden" /></button>
                </div>
            </div>
            <div className="vtt-board-slides-head">
                <button type="button" className="vtt-btn vtt-btn-sm vtt-btn-primary" onClick={create}>+ Diapositive</button>
                <button type="button" className={`vtt-pill${board.keep ? ' is-selected' : ''}`} aria-pressed={board.keep}
                        onClick={() => board.setKeep(!board.keep)} title="Jamais supprimé automatiquement">À conserver</button>
            </div>
            {board.prolongedFrom && (
                <p className="vtt-board-notice">Ce tableau devait être supprimé le {formatDate(board.prolongedFrom)} : il est prolongé de 3 mois.</p>
            )}

            <ul className="vtt-board-slide-list">
                {board.slides.map(slide => {
                    const shown = board.shownSlideId === slide.id;
                    const renaming = renamingId === slide.id;
                    return (
                        <li key={slide.id} {...(renaming ? {} : dragProps(slide.id))}
                            className={`vtt-board-slide${slide.id === selectedId ? ' is-selected' : ''}${shown ? ' is-shown' : ''}`}>
                            {/* Pas un <button> : il contient le champ de renommage */}
                            <div role="button" tabIndex={0} className="vtt-board-slide-select" onClick={() => onSelect(slide.id)}
                                 onKeyDown={e => { if (e.key === 'Enter' && e.target === e.currentTarget) onSelect(slide.id); }}
                                 aria-current={slide.id === selectedId ? 'true' : undefined}>
                                <span className="vtt-board-slide-grip" aria-hidden="true" title="Glisser pour réordonner">⠿</span>
                                {renaming
                                    ? <RenameField name={slide.name} onDone={name => rename(slide, name)} />
                                    : <span className="vtt-board-slide-name" onDoubleClick={() => setRenamingId(slide.id)}>{slide.name}</span>}
                            </div>
                            <div className="vtt-board-slide-actions">
                                {/* L'œil dit l'état : ouvert et en couleur = montrée ; barré = pas montrée */}
                                <button type="button" className={`vtt-board-icon-btn${shown ? ' is-on' : ''}`} aria-pressed={shown}
                                        onClick={() => board.show(shown ? null : slide.id)}
                                        aria-label={shown ? 'Cacher aux joueurs' : 'Montrer aux joueurs'} title={shown ? 'Cacher aux joueurs' : 'Montrer aux joueurs'}>
                                    <Icon name={shown ? 'shown' : 'hidden'} />
                                </button>
                                <button type="button" className="vtt-board-icon-btn" onClick={() => setRenamingId(slide.id)} aria-label="Renommer" title="Renommer"><Icon name="rename" /></button>
                                <button type="button" className="vtt-board-icon-btn" onClick={() => duplicate(slide.id)} aria-label="Dupliquer" title="Dupliquer">⧉</button>
                                <button type="button" className="vtt-board-icon-btn is-danger" onClick={() => remove(slide)} aria-label="Supprimer" title="Supprimer">✕</button>
                            </div>
                        </li>
                    );
                })}
            </ul>
            {board.slides.length === 0 && <p className="vtt-board-empty">Aucune diapositive pour cette table.</p>}

            {selected && (
                <div className="vtt-board-slide-settings">
                    <span className="vtt-field-label">Joueurs sur « {selected.name} »</span>
                    <div className="vtt-board-pills">
                        <Toggle on={selected.playersDraw} onClick={() => toggle('playersDraw')}>Dessin</Toggle>
                        <Toggle on={selected.playersMove} onClick={() => toggle('playersMove')}>Déplacer les jetons</Toggle>
                    </div>
                    <span className="vtt-field-label">Carte</span>
                    <div className="vtt-board-pills">
                        <Toggle on={selected.fogEnabled} onClick={() => toggle('fogEnabled')}>Brouillard</Toggle>
                        <Toggle on={selected.gridEnabled} onClick={() => toggle('gridEnabled')}>Grille</Toggle>
                    </div>
                    {selected.gridEnabled && (
                        <>
                            <label className="vtt-board-setting">
                                Case
                                <NumberField value={selected.gridSize} min={5} onCommit={gridSize => gridSize && board.updateSlide(selected.id, { gridSize })} />
                                unités du tableau
                            </label>
                            {/* Une seule ligne de valeur (retour du MJ) : soit la diapositive suit le défaut
                                de la table et la ligne règle ce défaut, soit elle a sa propre valeur */}
                            <GridValue label="1 case =" inherited={followsTable ? slugGrid : tableGrid}
                                       value={followsTable ? board.grid.value : selected.gridValue}
                                       unit={followsTable ? board.grid.unit : selected.gridUnit}
                                       onChange={patch => (followsTable ? board.setGrid(patch) : board.updateSlide(selected.id, patch))} />
                            <div className="vtt-board-pills">
                                <span title="Activé : cette valeur vaut pour toute la table ; les autres diapositives avec grille la reprennent">
                                    <Toggle on={followsTable} onClick={toggleTableDefault}>Défaut de la table</Toggle>
                                </span>
                            </div>
                        </>
                    )}
                </div>
            )}

            {board.size > 0 && <p className="vtt-board-size">Images : {formatSize(board.size)}</p>}
        </aside>
    );
};

export default SlideList;
