// src/client/src/features/board/IconPicker.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Sélecteur d'icônes du tableau (documentations/spec_tableau.md §10.7, Q-44) :
// recherche (en anglais en v1) sur le nom et les tags, catégories = groupes de
// tags de l'index, plus « Divers » ; couleur de la palette fixe (Q-42). Un clic pose
// l'icône. Aperçus en masque CSS (couleur choisie, aucune requête en JavaScript).
// Rendu dans l'emplacement à modales : la fenêtre flottante du tableau le rognerait.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import Modal from '@/ui/modal/Modal.jsx';
import { HostedModal } from '@/ui/modal/ModalHost.jsx';
import { iconUrl, useBoardIconIndex } from './hooks/useBoardIcons.js';
import { iconGroups, iconName, searchIcons } from './tools/boardIcons.js';
import { BOARD_PALETTE } from './tools/boardRights.js';

const PAGE = 120;

/**
 * @param {object} props
 * @param {Function} props.onPick  ({ icon, color }) icône choisie
 * @param {Function} props.onClose
 * @param {string}   [props.title]  titre de la fenêtre (avatar d'un PNJ : spec_pnj.md §6.5)
 */
const IconPicker = ({ onPick, onClose, title = 'Poser une icône' }) => {
    const index = useBoardIconIndex();
    const [query, setQuery] = useState('');
    const [group, setGroup] = useState(null);
    const [color, setColor] = useState(BOARD_PALETTE[0].color);
    const [limit, setLimit] = useState(PAGE);

    const results = index ? searchIcons(index, { group, query }) : [];
    const resetPaging = () => setLimit(PAGE);

    return (
        <HostedModal>
            <Modal title={title} size="lg" expandable onClose={onClose}
                   subtitle={index ? `${results.length} icône${results.length > 1 ? 's' : ''} · recherche en anglais` : 'Chargement…'}>
                <div className="vtt-board-picker">
                    <input className="vtt-input" type="search" value={query} autoFocus placeholder="horse, campfire, grenade, door…"
                           aria-label="Rechercher une icône" onChange={e => { setQuery(e.target.value); resetPaging(); }} />
                    {index && (
                        <div className="vtt-board-pills">
                            <button type="button" className={`vtt-pill${group === null ? ' is-selected' : ''}`}
                                    onClick={() => { setGroup(null); resetPaging(); }}>Toutes</button>
                            {iconGroups(index).map(label => (
                                <button key={label} type="button" className={`vtt-pill${group === label ? ' is-selected' : ''}`}
                                        onClick={() => { setGroup(label); resetPaging(); }}>{label}</button>
                            ))}
                        </div>
                    )}
                    <div className="vtt-board-palette" role="radiogroup" aria-label="Couleur">
                        {BOARD_PALETTE.map(c => (
                            <button key={c.color} type="button" role="radio" aria-checked={color === c.color} aria-label={c.name} title={c.name}
                                    className={`vtt-board-swatch${color === c.color ? ' is-active' : ''}`} style={{ background: c.color }}
                                    onClick={() => setColor(c.color)} />
                        ))}
                    </div>

                    <div className="vtt-board-picker-grid" style={{ color }}>
                        {results.slice(0, limit).map(icon => (
                            <button key={icon.id} type="button" className="vtt-board-picker-item" title={iconName(icon.id)}
                                    onClick={() => { onPick({ icon: icon.id, color }); onClose(); }}>
                                <span className="vtt-board-icon-mask" aria-hidden="true"
                                      style={{ WebkitMaskImage: `url(${iconUrl(icon.id)})`, maskImage: `url(${iconUrl(icon.id)})` }} />
                                <span className="vtt-board-picker-name">{iconName(icon.id)}</span>
                            </button>
                        ))}
                    </div>
                    {index && results.length === 0 && <p className="vtt-board-empty">Aucune icône ne correspond.</p>}
                    {results.length > limit && (
                        <button type="button" className="vtt-btn vtt-btn-sm" onClick={() => setLimit(l => l + PAGE)}>
                            Voir plus ({results.length - limit})
                        </button>
                    )}
                </div>
            </Modal>
        </HostedModal>
    );
};

export default IconPicker;
