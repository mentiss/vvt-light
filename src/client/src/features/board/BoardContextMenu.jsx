// src/client/src/features/board/BoardContextMenu.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Menu contextuel du tableau (documentations/spec_tableau.md §14.4) : au point du
// clic droit, sur un objet ou dans le vide. Board décide des entrées selon le rôle
// et la sélection ; ce composant les affiche, sous-menus compris (« Couleur ▸ »,
// « Ajouter ici ▸ »), avec le menu générique (RowMenu : habillage vtt-menu du slug,
// rendu dans l'emplacement à modales, clavier, Échap et clic extérieur).
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { RowMenu, MenuItem, MenuLabel, MenuSeparator } from '@/features/audio/panel/RowMenu.jsx';
import { BOARD_PALETTE } from './tools/boardRights.js';

/**
 * Entrée : { label, onSelect, danger?, disabled?, hint? } ; { separator: true } ;
 * { label, children: [entrées] } (sous-menu) ; { label, palette: (couleur) => void } (couleurs).
 * @param {object} props
 * @param {{ x: number, y: number }} props.at point de l'écran
 * @param {object[]} props.entries
 * @param {Function} props.onClose
 */
const BoardContextMenu = ({ at, entries, onClose }) => {
    const [sub, setSub] = useState(null);   // entrée dont le sous-menu est ouvert
    const run = (fn) => () => { onClose(); fn(); };

    const renderEntry = (entry, index) => {
        if (entry.separator) return <MenuSeparator key={`sep-${index}`} />;
        if (entry.children || entry.palette) {
            return (
                <MenuItem key={entry.label} disabled={entry.disabled} onSelect={() => setSub(entry)}>
                    {entry.label} ▸
                </MenuItem>
            );
        }
        return (
            <MenuItem key={entry.label} danger={entry.danger} disabled={entry.disabled} hint={entry.hint} onSelect={run(entry.onSelect)}>
                {entry.label}
            </MenuItem>
        );
    };

    return (
        <RowMenu anchor={at} onClose={onClose}>
            {sub ? (
                <>
                    <MenuItem onSelect={() => setSub(null)}>‹ Retour</MenuItem>
                    <MenuLabel>{sub.label}</MenuLabel>
                    {sub.palette ? (
                        <li role="none" className="vtt-board-menu-palette">
                            {BOARD_PALETTE.map(c => (
                                <button key={c.color} type="button" role="menuitem" aria-label={c.name} title={c.name}
                                        className="vtt-board-swatch" style={{ background: c.color }}
                                        onClick={run(() => sub.palette(c.color))} />
                            ))}
                        </li>
                    ) : sub.children.map(renderEntry)}
                </>
            ) : entries.map(renderEntry)}
        </RowMenu>
    );
};

export default BoardContextMenu;
