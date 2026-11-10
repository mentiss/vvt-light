// src/client/src/components/board/BoardToolbar.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Barre d'outils du tableau (documentations/spec_tableau.md §10.8, §12.1) :
// - outils : sélection, main, trait, rectangle, gomme, règle (avec la grille) ;
// - contextuels : palette et épaisseur avec un outil de dessin, « Tout couvrir /
//   Tout dévoiler » avec un outil de brouillard ;
// - MJ : brouillard (diapositive avec brouillard), menu « Ajouter ▾ » (image, fond,
//   lien d'image, icône, jeton de PNJ) et « Jetons des PJ » juste après les outils,
//   tout effacer en bout de barre.
// Un outil interdit sur la diapositive est grisé (le serveur refuserait de toute façon).
// Le zoom et le recadrage sont dans le coin du tableau (BoardCanvas).
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect, useRef, useState } from 'react';
import Modal from '../ui/Modal.jsx';
import NpcAvatar from '../npc/NpcAvatar.jsx';
import { HostedModal } from '../ui/ModalHost.jsx';
import { RowMenu, MenuItem, MenuSeparator } from '../audio/panel/RowMenu.jsx';
import { BOARD_PALETTE, canDraw } from '../../tools/boardRights.js';

export const THICKNESSES = [{ label: 'Fin', value: 3 }, { label: 'Épais', value: 8 }];

const PATHS = {
    select: 'M5 3l13 8-6 1.5L9 19z',
    zoomIn: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM21 21l-5-5M8 11h6M11 8v6',
    zoomOut:'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM21 21l-5-5M8 11h6',
    hand:'M8 13V5.5a1.5 1.5 0 0 1 3 0V12m0-6.5v-1a1.5 1.5 0 0 1 3 0V12m0-6a1.5 1.5 0 0 1 3 0V13m0-4.5a1.5 1.5 0 0 1 3 0V15a6 6 0 0 1-6 6h-1.5a6 6 0 0 1-4.9-2.6L4.4 15a1.6 1.6 0 0 1 2.4-2l1.2 1.2',
    pen:    'M4 20l4-1 11-11-3-3L5 16l-1 4zM14 6l3 3',
    rect:   'M4 6h16v12H4z',
    line:   'M5 19L19 5M13 5h6v6',
    ellipse:'M12 19c4.4 0 8-3.1 8-7s-3.6-7-8-7-8 3.1-8 7 3.6 7 8 7z',
    halo:   'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1',
    text:   'M5 6V4h14v2M12 4v16M9 20h6',
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

export const Glyph = ({ name }) => (
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

/**
 * Jeton de PNJ : un PNJ de la table (son avatar ou son icône, spec_pnj.md P-21),
 * ou un jeton libre, nom (initiales sur le jeton) et couleur.
 * tableNpcs : [{ id, name, avatar, icon }] ; onOpen : recharge la liste à l'ouverture.
 */
export const NpcTokenModal = ({ onClose, onCreate, tableNpcs = [], onOpen = null }) => {
    const [label, setLabel] = useState('');
    const [color, setColor] = useState(BOARD_PALETTE[0].color);
    useEffect(() => { onOpen?.(); }, [onOpen]);
    const submit = (e) => {
        e.preventDefault();
        if (!label.trim()) return;
        onCreate({ label: label.trim(), color });
        onClose();
    };
    const pick = (npc) => {
        onCreate({ npcId: npc.id, label: npc.name.slice(0, 40), color: npc.icon?.color ?? color });
        onClose();
    };
    return (
        <HostedModal>
            <Modal title="Jeton de PNJ" size="sm" onClose={onClose}
                   footer={<>
                       <button type="button" className="vtt-btn" onClick={onClose}>Annuler</button>
                       <button type="submit" form="vtt-board-npc-form" className="vtt-btn vtt-btn-primary" disabled={!label.trim()}>Poser</button>
                   </>}>
                {tableNpcs.length > 0 && (
                    <div className="vtt-board-form vtt-board-npc-pick">
                        <span className="vtt-field-label">PNJ de la table</span>
                        <div className="vtt-board-pills">
                            {tableNpcs.map(npc => (
                                <button key={npc.id} type="button" className="vtt-pill" onClick={() => pick(npc)}>
                                    <NpcAvatar npc={{ nom: npc.name, avatar: npc.avatar, icon: npc.icon }} />{npc.name}
                                </button>
                            ))}
                        </div>
                        <span className="vtt-field-label">Ou un jeton libre</span>
                    </div>
                )}
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

/** Lien d'image (§12.1) : vérifie que l'adresse donne bien une image, et renvoie sa taille naturelle */
export const ImageLinkModal = ({ onClose, onCreate }) => {
    const [url, setUrl] = useState('');
    const [status, setStatus] = useState(null);   // null | 'loading' | 'error'
    const valid = /^https?:\/\/\S+$/.test(url.trim()) && url.trim().length <= 2000;
    const submit = (e) => {
        e.preventDefault();
        if (!valid || status === 'loading') return;
        setStatus('loading');
        const img = new Image();
        img.onload = () => { onCreate({ url: url.trim(), width: img.naturalWidth, height: img.naturalHeight }); onClose(); };
        img.onerror = () => setStatus('error');
        img.src = url.trim();
    };
    return (
        <HostedModal>
            <Modal title="Lien d'image" size="sm" onClose={onClose}
                   footer={<>
                       <button type="button" className="vtt-btn" onClick={onClose}>Annuler</button>
                       <button type="submit" form="vtt-board-link-form" className="vtt-btn vtt-btn-primary" disabled={!valid || status === 'loading'}>
                           {status === 'loading' ? 'Chargement…' : 'Poser'}
                       </button>
                   </>}>
                <form id="vtt-board-link-form" onSubmit={submit} className="vtt-board-form">
                    <label className="vtt-field-label" htmlFor="vtt-board-link-url">Adresse de l'image</label>
                    <input id="vtt-board-link-url" className="vtt-input" value={url} maxLength={2000} autoFocus
                           onChange={e => { setUrl(e.target.value); setStatus(null); }} placeholder="https://…" />
                    {status === 'error' && <p className="vtt-board-form-error">Aucune image trouvée à cette adresse.</p>}
                </form>
            </Modal>
        </HostedModal>
    );
};

export const Palette = ({ value, onChange }) => (
    <div className="vtt-board-palette" role="radiogroup" aria-label="Couleur">
        {BOARD_PALETTE.map(c => (
            <button key={c.color} type="button" role="radio" aria-checked={value === c.color} aria-label={c.name} title={c.name}
                    className={`vtt-board-swatch${value === c.color ? ' is-active' : ''}`} style={{ background: c.color }}
                    onClick={() => onChange(c.color)} />
        ))}
    </div>
);

const DRAW_TOOLS = ['pen', 'line', 'rect', 'ellipse', 'halo', 'text'];
const SHAPE_TOOLS = ['rect', 'ellipse'];

/** Option en pastille, avec ✓ quand elle est active */
const OptionToggle = ({ on, onClick, children }) => (
    <button type="button" className={`vtt-pill${on ? ' is-selected' : ''}`} aria-pressed={on} onClick={onClick}>
        {on ? '✓ ' : ''}{children}
    </button>
);

/** Outils de base : libellé et raccourci (§12.4, §13.1) */
export const TOOLS = [
    { id: 'select', label: 'Sélection : choisir, déplacer', key: 'V' },
    { id: 'hand',   label: 'Main : déplacer la vue', key: 'H' },
    { id: 'pen',    label: 'Trait', key: 'P', drawing: true },
    { id: 'line',   label: 'Ligne (Maj : pas de 15°)', key: 'L', drawing: true },
    { id: 'rect',   label: 'Rectangle (Maj : carré)', key: 'R', drawing: true },
    { id: 'ellipse', label: 'Ellipse (Maj : cercle)', key: 'O', drawing: true },
    { id: 'halo',   label: 'Halo : lumière', key: 'G', drawing: true },
    { id: 'text',   label: 'Texte', key: 'T', drawing: true },
    { id: 'eraser', label: 'Gomme', key: 'E', drawing: true },
    { id: 'ruler',  label: 'Règle : mesurer une distance', key: 'M', grid: true },
];

/** L'outil est-il proposé (règle : avec la grille) et permis (dessin) sur la diapositive ? */
export const toolState = (t, isGM, slide) => ({
    shown: !t.grid || !!slide.gridEnabled,
    enabled: !t.drawing || canDraw(isGM, slide),
});

/**
 * @param {object} props
 * @param {boolean} props.isGM
 * @param {object}  props.slide
 * @param {string}  props.tool
 * @param {object}  [props.gm] actions du MJ : onImage(file, background), onImageUrl({ url, width, height }),
 *                             onPcTokens(), pcMissing (PJ sans jeton), onNpcToken({ label, color }), onIcon(), onClear(),
 *                             onFogToggle(), onFogReset('cover'|'reveal')
 */
const BoardToolbar = ({ isGM, slide, tool, onTool, color, onColor, thickness, onThickness, options, onOption, gm }) => {
    const fileRef = useRef(null);
    const backgroundRef = useRef(false);
    const [npcOpen, setNpcOpen] = useState(false);
    const [linkOpen, setLinkOpen] = useState(false);
    const [addAnchor, setAddAnchor] = useState(null);   // bouton « Ajouter ▾ » quand son menu est ouvert
    const drawing = canDraw(isGM, slide);
    const fogTool = tool === 'fog-reveal' || tool === 'fog-cover';

    const pickImage = (background) => {
        backgroundRef.current = background;
        fileRef.current?.click();
    };
    const onFile = (e) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (file) gm.onImage(file, backgroundRef.current);
    };
    const closeAdd = () => setAddAnchor(null);

    return (
        <div className="vtt-board-toolbar" role="toolbar" aria-label="Outils du tableau">
            <div className="vtt-board-toolgroup">
                {TOOLS.map(t => {
                    const { shown, enabled } = toolState(t, isGM, slide);
                    return shown && (
                        <ToolButton key={t.id} icon={t.id} label={`${t.label} (${t.key})`} active={tool === t.id}
                                    disabled={!enabled} onClick={() => onTool(t.id)} />
                    );
                })}
            </div>

            {/* MJ : « Ajouter ▾ » et les jetons des PJ juste après les outils, avant les groupes
                contextuels (rien ne bouge quand la palette apparaît) ; jetons des PJ grisés
                quand tous sont posés */}
            {isGM && gm && (
                <div className="vtt-board-toolgroup">
                    <button type="button" className="vtt-btn vtt-btn-sm" aria-haspopup="menu" aria-expanded={!!addAnchor}
                            onClick={e => setAddAnchor(addAnchor ? null : e.currentTarget)}>
                        Ajouter ▾
                    </button>
                    <button type="button" className="vtt-btn vtt-btn-sm" onClick={gm.onPcTokens} disabled={gm.pcMissing === 0}
                            title={gm.pcMissing === 0 ? 'Tous les PJ sont sur la diapositive' : 'Poser les jetons des PJ qui manquent'}>
                        Jetons des PJ{gm.pcMissing > 0 ? ` · ${gm.pcMissing}` : ''}
                    </button>
                    <input ref={fileRef} type="file" accept="image/*" hidden onChange={onFile} />
                </div>
            )}

            {/* Dessin, contextuel (§13.1) : palette pour tous les outils de dessin ; épaisseur pour
                le trait, la ligne et un contour ; Plein / Contour, Flèche, Fond selon l'outil */}
            {drawing && DRAW_TOOLS.includes(tool) && (
                <div className="vtt-board-toolgroup">
                    <Palette value={color} onChange={onColor} />
                    {(tool === 'pen' || tool === 'line' || (SHAPE_TOOLS.includes(tool) && !options.filled)) && THICKNESSES.map(t => (
                        <button key={t.value} type="button" className={`vtt-pill${thickness === t.value ? ' is-selected' : ''}`}
                                onClick={() => onThickness(t.value)}>{t.label}</button>
                    ))}
                    {SHAPE_TOOLS.includes(tool) && (
                        <button type="button" className="vtt-pill is-selected" onClick={() => onOption('filled', !options.filled)}
                                title="Forme pleine ou seulement son contour">{options.filled ? 'Plein' : 'Contour'}</button>
                    )}
                    {tool === 'line' && <OptionToggle on={options.arrow} onClick={() => onOption('arrow', !options.arrow)}>Flèche</OptionToggle>}
                    {tool === 'text' && <OptionToggle on={options.background} onClick={() => onOption('background', !options.background)}>Fond</OptionToggle>}
                </div>
            )}

            {/* Brouillard (MJ, diapositive réglée avec brouillard) : dévoiler, recouvrir,
                l'afficher ou le masquer chez les joueurs sans toucher à son état (Q-33) ;
                tout couvrir / tout dévoiler avec un outil de brouillard actif (PA-4) */}
            {isGM && gm && slide.fogEnabled && (
                <div className="vtt-board-toolgroup">
                    <ToolButton icon="reveal" label="Dévoiler une zone" active={tool === 'fog-reveal'} onClick={() => onTool('fog-reveal')} />
                    <ToolButton icon="cover" label="Recouvrir une zone" active={tool === 'fog-cover'} onClick={() => onTool('fog-cover')} />
                    <button type="button" className={`vtt-pill${slide.fogShown ? ' is-selected' : ''}`} aria-pressed={slide.fogShown}
                            onClick={gm.onFogToggle} title="Brouillard visible des joueurs">
                        {slide.fogShown ? '✓ Brouillard affiché' : 'Brouillard masqué'}
                    </button>
                    {fogTool && (
                        <>
                            <button type="button" className="vtt-pill" onClick={() => gm.onFogReset('cover')}>Tout couvrir</button>
                            <button type="button" className="vtt-pill" onClick={() => gm.onFogReset('reveal')}>Tout dévoiler</button>
                        </>
                    )}
                </div>
            )}

            {/* « Tout effacer » à part, en bout de barre (PA-5) */}
            {isGM && gm && (
                <div className="vtt-board-toolgroup is-end">
                    <ToolButton icon="clear" label="Tout effacer (sauf verrouillé)" onClick={gm.onClear} />
                </div>
            )}

            {addAnchor && (
                <RowMenu anchor={addAnchor} onClose={closeAdd}>
                    <MenuItem onSelect={() => { closeAdd(); pickImage(false); }}>Image…</MenuItem>
                    <MenuItem onSelect={() => { closeAdd(); pickImage(true); }} hint="verrouillée">Image en fond…</MenuItem>
                    <MenuItem onSelect={() => { closeAdd(); setLinkOpen(true); }}>Lien d'image…</MenuItem>
                    <MenuSeparator />
                    <MenuItem onSelect={() => { closeAdd(); gm.onIcon(); }}>Icône…</MenuItem>
                    <MenuItem onSelect={() => { closeAdd(); setNpcOpen(true); }}>Jeton de PNJ…</MenuItem>
                </RowMenu>
            )}
            {npcOpen && <NpcTokenModal onClose={() => setNpcOpen(false)} onCreate={gm.onNpcToken} tableNpcs={gm.tableNpcs} onOpen={gm.reloadNpcs} />}
            {linkOpen && <ImageLinkModal onClose={() => setLinkOpen(false)} onCreate={gm.onImageUrl} />}
        </div>
    );
};

export default BoardToolbar;
