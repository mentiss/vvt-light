// src/client/src/systems/maledictum/components/layout/MlConditions.jsx
// ─────────────────────────────────────────────────────────────────────────────
// États de la fiche en pastilles (spec_maledictum.md §15), sur le modèle des tags
// de Cyberpunk, par la brique Popover :
//   - clic sur un État posé : menu (description, Mineur / Majeur pour les États à
//     deux niveaux, Retirer) ;
//   - « + État » : petite fenêtre d'ajout (recherche, aperçu de l'effet au survol),
//     un clic pose l'État en mineur, la fenêtre reste ouverte.
// Actions de jeu : actives quel que soit le mode Édition (F-GAME-ACTIONS).
//
//   <ConditionList c act />   c : personnage ; act : useMlActions (setCondition)
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import Popover from '@/ui/panel/Popover.jsx';
import { CONDITIONS } from '../../config/tables.js';
import { Tip } from '../ui/MlUi.jsx';

const COND_BY_KEY = Object.fromEntries(CONDITIONS.map(k => [k.key, k]));
const LEVELS = [{ id: 'minor', label: 'Mineur' }, { id: 'major', label: 'Majeur' }];

/** Texte comparé sans accents ni casse (recherche) */
const fold = (s) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
/** Effet du niveau en cours (États à un niveau : la description) */
const levelText = (cond, level) => (level === 'major' ? cond?.major : cond?.minor) ?? cond?.summary ?? '';

// ── Menu d'un État posé ──────────────────────────────────────────────────────
const ConditionMenu = ({ anchor, condKey, level, onSet, onClose }) => {
    const cond = COND_BY_KEY[condKey] ?? { label: condKey };
    const choose = (next) => { onSet(next); onClose(); };
    return (
        <Popover anchor={anchor} onClose={onClose} className="im-pop is-menu">
            <div className="im-pop-head">{cond.label}</div>
            {cond.summary && <p className="im-menu-summary">{cond.summary}</p>}
            {cond.major && LEVELS.map(l => (
                <button key={l.id} type="button" className={`im-menu-item${level === l.id ? ' is-current' : ''}`} onClick={() => choose(l.id)}>
                    <b>{l.label}{level === l.id ? ' · en cours' : ''}</b>
                    <span>{l.id === 'major' ? cond.major : cond.minor}</span>
                </button>
            ))}
            <button type="button" className="im-menu-item is-danger" onClick={() => choose(null)}><b>Retirer l'État</b></button>
        </Popover>
    );
};

// ── Fenêtre d'ajout ──────────────────────────────────────────────────────────
const ConditionAdd = ({ anchor, active, onAdd, onClose }) => {
    const [query, setQuery] = useState('');
    const [preview, setPreview] = useState(null);
    const q = fold(query.trim());
    const list = q ? CONDITIONS.filter(k => fold([k.label, k.summary, k.minor, k.major].join(' ')).includes(q)) : CONDITIONS;
    const addFirst = () => { const first = list.find(k => !active[k.key]); if (first) onAdd(first.key); };

    return (
        <Popover anchor={anchor} onClose={onClose} className="im-pop">
            <div className="im-pop-head">Ajouter un État <small>clic : posé en mineur</small></div>
            <div className="im-pop-body">
                <input className="vtt-input" autoFocus value={query} placeholder="Rechercher un État…"
                       onChange={e => setQuery(e.target.value)}
                       onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addFirst(); } }} />
                <div className="im-pop-grid">
                    {list.length === 0 && <span className="im-pop-none">Aucun État ne correspond.</span>}
                    {list.map(k => (
                        <button key={k.key} type="button" className="im-state" disabled={!!active[k.key]}
                                onMouseEnter={() => setPreview(k)} onFocus={() => setPreview(k)} onClick={() => onAdd(k.key)}>
                            {k.label}{k.major && <small>2 niveaux</small>}
                        </button>
                    ))}
                </div>
                <div className="im-pop-preview vtt-scroll">
                    {preview ? (
                        <>
                            <b>{preview.label}</b> · {preview.summary}
                            {preview.minor && <><br /><b>Mineur</b> : {preview.minor}</>}
                            {preview.major && <><br /><b>Majeur</b> : {preview.major}</>}
                        </>
                    ) : <span className="im-pop-none">Survolez un État pour lire son effet.</span>}
                </div>
                <div className="im-pop-foot">Entrée : poser le premier · Échap : fermer</div>
            </div>
        </Popover>
    );
};

// ── Liste des États ──────────────────────────────────────────────────────────
export const ConditionList = ({ c, act }) => {
    const [menu, setMenu] = useState(null);       // { key, anchor }
    const [adding, setAdding] = useState(null);   // élément d'ancrage du « + État »
    const active = c.conditions ?? {};

    return (
        <div className="im-states">
            {Object.entries(active).map(([key, level]) => {
                const cond = COND_BY_KEY[key];
                return (
                    <Tip key={key} text={menu ? '' : levelText(cond, level)}>
                        <button type="button" className={`im-state${level === 'major' ? ' is-major' : ''}${menu?.key === key ? ' is-active' : ''}`}
                                onClick={e => setMenu(menu?.key === key ? null : { key, anchor: e.currentTarget })}>
                            {cond?.label ?? key}{cond?.major ? ` (${level === 'major' ? 'majeur' : 'mineur'})` : ''}
                        </button>
                    </Tip>
                );
            })}
            <button type="button" className={`im-state is-add${adding ? ' is-active' : ''}`}
                    onClick={e => setAdding(adding ? null : e.currentTarget)}>+ État</button>
            {menu && active[menu.key] && (
                <ConditionMenu anchor={menu.anchor} condKey={menu.key} level={active[menu.key]}
                               onSet={level => act.setCondition(menu.key, level)} onClose={() => setMenu(null)} />
            )}
            {adding && (
                <ConditionAdd anchor={adding} active={active}
                              onAdd={key => act.setCondition(key, 'minor')} onClose={() => setAdding(null)} />
            )}
        </div>
    );
};
