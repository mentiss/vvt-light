// src/client/src/components/board/BoardToolbar.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Barre d'outils du tableau (documentations/spec_tableau.md §10.8) : main, trait,
// rectangle, gomme, règle (avec la grille), palette fixe, épaisseur, recadrage ; pour
// le MJ, image, fond, jetons des PJ, jeton de PNJ, icône, tout effacer, brouillard.
// Un outil interdit sur la diapositive
// est grisé (le serveur refuserait de toute façon).
// ─────────────────────────────────────────────────────────────────────────────

import React, { useRef, useState } from 'react';
import Modal from '../ui/Modal.jsx';
import { HostedModal } from '../ui/ModalHost.jsx';
import { BOARD_PALETTE, canDraw } from '../../tools/boardRights.js';

export const THICKNESSES = [{ label: 'Fin', value: 3 }, { label: 'Épais', value: 8 }];

const PATHS = {
    hand:   'M8 13V5.5a1.5 1.5 0 0 1 3 0V12m0-6.5v-1a1.5 1.5 0 0 1 3 0V12m0-6a1.5 1.5 0 0 1 3 0V13m0-4.5a1.5 1.5 0 0 1 3 0V15a6 6 0 0 1-6 6h-1.5a6 6 0 0 1-4.9-2.6L4.4 15a1.6 1.6 0 0 1 2.4-2l1.2 1.2',
    pen:    'M4 20l4-1 11-11-3-3L5 16l-1 4zM14 6l3 3',
    rect:   'M4 6h16v12H4z',
    eraser: 'M7 20h13M5.5 14.5l7-7a2 2 0 0 1 2.8 0l2.2 2.2a2 2 0 0 1 0 2.8L12 18H8.5l-3-3a.7.7 0 0 1 0-.5z',
    fit:    'M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5',
    image:  'M3 5h18v14H3zM8.5 10.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM21 15l-5-5L5 19',
    pcs:    'M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM3 20a6 6 0 0 1 12 0M16 11a3 3 0 1 0 0-6M21 20a6 6 0 0 0-4-5.6',
    token:  'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 8v8M8 12h8',
    clear:  'M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3',
    ruler:  'M3 17L17 3l4 4L7 21zM7 13l2 2M10 10l2 2M13 7l2 2',
    reveal: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
    cover:  'M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 5.1A9.8 9.8 0 0 1 12 5c5 0 9 4.5 10 7a12.8 12.8 0 0 1-3.2 4.2M6.6 6.6C4.3 8 2.7 10.2 2 12c1 2.5 5 7 10 7a9.7 9.7 0 0 0 5.4-1.6',
    icon:   'M12 2l2.9 6.3 6.9.7-5.2 4.6 1.5 6.8L12 17l-6.1 3.4 1.5-6.8L2.2 9l6.9-.7z',
};

const Glyph = ({ name }) => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d={PATHS[name]} />
    </svg>
);

const ToolButton = ({ icon, label, active = false, disabled = false, onClick }) => (
    <button type="button" className={`vtt-board-tool${active ? ' is-active' : ''}`} onClick={onClick}
            disabled={disabled} aria-pressed={active} aria-label={label} title={label}>
        <Glyph name={icon} />
    </button>
);

/** Jeton de PNJ : nom (initiales sur le jeton) et couleur */
const NpcTokenModal = ({ onClose, onCreate }) => {
    const [label, setLabel] = useState('');
    const [color, setColor] = useState(BOARD_PALETTE[0].color);
    const submit = (e) => {
        e.preventDefault();
        if (!label.trim()) return;
        onCreate({ label: label.trim(), color });
        onClose();
    };
    return (
        <HostedModal>
            <Modal title="Jeton de PNJ" size="sm" onClose={onClose}
                   footer={<>
                       <button type="button" className="vtt-btn" onClick={onClose}>Annuler</button>
                       <button type="submit" form="vtt-board-npc-form" className="vtt-btn vtt-btn-primary" disabled={!label.trim()}>Poser</button>
                   </>}>
                <form id="vtt-board-npc-form" onSubmit={submit} className="vtt-board-form">
                    <label className="vtt-field-label" htmlFor="vtt-board-npc-label">Nom</label>
                    <input id="vtt-board-npc-label" className="vtt-input" value={label} maxLength={40} autoFocus
                           onChange={e => setLabel(e.target.value)} placeholder="Garde, loup, marchand…" />
                    <span className="vtt-field-label">Couleur</span>
                    <Palette value={color} onChange={setColor} />
                </form>
            </Modal>
        </HostedModal>
    );
};

const Palette = ({ value, onChange }) => (
    <div className="vtt-board-palette" role="radiogroup" aria-label="Couleur">
        {BOARD_PALETTE.map(c => (
            <button key={c.color} type="button" role="radio" aria-checked={value === c.color} aria-label={c.name} title={c.name}
                    className={`vtt-board-swatch${value === c.color ? ' is-active' : ''}`} style={{ background: c.color }}
                    onClick={() => onChange(c.color)} />
        ))}
    </div>
);

/**
 * @param {object} props
 * @param {boolean} props.isGM
 * @param {object}  props.slide
 * @param {string}  props.tool
 * @param {object}  [props.gm] actions du MJ : onImage(file, background), onPcTokens(), onNpcToken({ label, color }),
 *                             onIcon(), onClear(), onFogToggle(), onFogReset('cover'|'reveal')
 */
const BoardToolbar = ({ isGM, slide, tool, onTool, color, onColor, thickness, onThickness, onFit, gm }) => {
    const fileRef = useRef(null);
    const backgroundRef = useRef(false);
    const [npcOpen, setNpcOpen] = useState(false);
    const drawing = canDraw(isGM, slide);

    const pickImage = (background) => {
        backgroundRef.current = background;
        fileRef.current?.click();
    };
    const onFile = (e) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (file) gm.onImage(file, backgroundRef.current);
    };

    return (
        <div className="vtt-board-toolbar" role="toolbar" aria-label="Outils du tableau">
            <div className="vtt-board-toolgroup">
                <ToolButton icon="hand" label="Main : déplacer" active={tool === 'hand'} onClick={() => onTool('hand')} />
                <ToolButton icon="pen" label="Trait" active={tool === 'pen'} disabled={!drawing} onClick={() => onTool('pen')} />
                <ToolButton icon="rect" label="Rectangle" active={tool === 'rect'} disabled={!drawing} onClick={() => onTool('rect')} />
                <ToolButton icon="eraser" label="Gomme" active={tool === 'eraser'} disabled={!drawing} onClick={() => onTool('eraser')} />
                {slide.gridEnabled && (
                    <ToolButton icon="ruler" label="Règle : mesurer une distance" active={tool === 'ruler'} onClick={() => onTool('ruler')} />
                )}
            </div>

            {drawing && (
                <div className="vtt-board-toolgroup">
                    <Palette value={color} onChange={onColor} />
                    {THICKNESSES.map(t => (
                        <button key={t.value} type="button" className={`vtt-pill${thickness === t.value ? ' is-selected' : ''}`}
                                onClick={() => onThickness(t.value)}>{t.label}</button>
                    ))}
                </div>
            )}

            {isGM && gm && (
                <div className="vtt-board-toolgroup">
                    <ToolButton icon="image" label="Ajouter une image" onClick={() => pickImage(false)} />
                    <button type="button" className="vtt-pill" onClick={() => pickImage(true)} title="Image en fond, verrouillée">Fond</button>
                    <ToolButton icon="pcs" label="Poser les jetons des PJ" onClick={gm.onPcTokens} />
                    <ToolButton icon="token" label="Jeton de PNJ" onClick={() => setNpcOpen(true)} />
                    <ToolButton icon="icon" label="Poser une icône" onClick={gm.onIcon} />
                    <ToolButton icon="clear" label="Tout effacer (sauf verrouillé)" onClick={gm.onClear} />
                    <input ref={fileRef} type="file" accept="image/*" hidden onChange={onFile} />
                </div>
            )}

            {/* Brouillard (MJ, diapositive réglée avec brouillard) : dévoiler, recouvrir,
                l'afficher ou le masquer chez les joueurs sans toucher à son état (Q-33) */}
            {isGM && gm && slide.fogEnabled && (
                <div className="vtt-board-toolgroup">
                    <ToolButton icon="reveal" label="Dévoiler une zone" active={tool === 'fog-reveal'} onClick={() => onTool('fog-reveal')} />
                    <ToolButton icon="cover" label="Recouvrir une zone" active={tool === 'fog-cover'} onClick={() => onTool('fog-cover')} />
                    <button type="button" className={`vtt-pill${slide.fogShown ? ' is-selected' : ''}`} aria-pressed={slide.fogShown}
                            onClick={gm.onFogToggle} title="Brouillard visible des joueurs">
                        {slide.fogShown ? '✓ Brouillard affiché' : 'Brouillard masqué'}
                    </button>
                    <button type="button" className="vtt-pill" onClick={() => gm.onFogReset('cover')}>Tout couvrir</button>
                    <button type="button" className="vtt-pill" onClick={() => gm.onFogReset('reveal')}>Tout dévoiler</button>
                </div>
            )}

            <div className="vtt-board-toolgroup is-end">
                <ToolButton icon="fit" label="Recadrer sur le contenu" onClick={onFit} />
            </div>

            {npcOpen && <NpcTokenModal onClose={() => setNpcOpen(false)} onCreate={gm.onNpcToken} />}
        </div>
    );
};

export default BoardToolbar;
