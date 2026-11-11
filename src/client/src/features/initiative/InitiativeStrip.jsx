// src/client/src/features/initiative/InitiativeStrip.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Bande d'initiative (documentations/spec_initiative.md §9.6, planche validée
// documentations/initiative/planche_initiative.html).
// - Flottante par-dessus la page, sans la pousser ; en haut au centre par défaut ;
//   déplacée par la poignée, le titre ou son fond ; horizontale ou verticale ;
//   réductible (tour + portrait actif). Disposition mémorisée par l'appelant.
// - MJ : clic sur un portrait = le faire agir ; ⋯ = réglages ; glisser-déposer pour
//   réordonner (en mode camps, l'autre groupe change le camp ; la réserve sort du compte).
// - Joueur : lecture seule, état déjà filtré (visibleTo) ; son personnage signalé.
// Classes vtt-initiative-* : style par défaut dans features/initiative/initiative.css, habillage par theme.css.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useLayoutEffect, useRef, useState } from 'react';
import { canAct, isOutNpc } from './tools/initiative.js';

const MARGIN = 8;

/** Initiales (deux au plus) ; « ? » pour un PNJ dont le joueur ne connaît pas le nom. */
const initials = (name) => (name ? name.split(/\s+/).filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase() : '?');

/** Un portrait de la bande. */
const Entry = ({ p, state, isGM, isMe, avatar, extraClass, onDesignate, onMenu, onHover }) => {
    const done = !p.reserve && !canAct(p) && !isOutNpc(p);
    const clickable = isGM && canAct(p) && p.key !== state.activeKey && (state.mode === 'order' || p.side === state.hand);
    const attrs = {
        'data-key': p.key,
        'data-side': p.side,
        'data-active': p.key === state.activeKey ? '' : undefined,
        'data-done': done ? '' : undefined,
        'data-me': isMe ? '' : undefined,
        'data-wound': p.kind !== 'character' && p.wound ? p.wound : undefined,
        'data-down': p.kind === 'character' && p.down ? '' : undefined,
    };
    const label = p.name || '';
    return (
        <div {...attrs} className={`vtt-initiative-entry${clickable ? ' is-clickable' : ''}${extraClass}`} draggable={isGM || undefined}
             title={label || undefined}
             onClick={clickable ? () => onDesignate(p.key) : undefined}
             onMouseEnter={isGM ? (e) => onHover(p, e.currentTarget) : undefined}
             onMouseLeave={isGM ? () => onHover(null) : undefined}>
            <div className="vtt-initiative-frame">
                <div className={`vtt-initiative-avatar${!avatar && !label ? ' is-unknown' : ''}`}>
                    {avatar ? <img src={avatar} alt="" /> : initials(label)}
                </div>
                {isGM && p.initiative !== null && state.mode === 'order' && <span className="vtt-initiative-badge is-value" title="Initiative">{p.initiative}</span>}
                {p.actions > 1 && <span className="vtt-initiative-badge is-actions" title="Actions restantes ce tour">{p.actions - p.acted}/{p.actions}</span>}
                {done && <span className="vtt-initiative-badge is-done" title="A agi">✓</span>}
                {p.delayed
                    ? <span className="vtt-initiative-badge is-delayed" title="Action retardée">⏸</span>
                    : isGM && p.hidden && <span className="vtt-initiative-badge is-hidden" title="Caché aux joueurs">⊘</span>}
            </div>
            <span className="vtt-initiative-name">{label || ' '}</span>
            {isGM && (
                <button type="button" className="vtt-initiative-more" aria-label={`Réglages de ${label}`}
                        onClick={(e) => { e.stopPropagation(); onMenu(p.key, e.currentTarget); }}>⋯</button>
            )}
        </div>
    );
};

/** Carte au survol (MJ). */
const Card = ({ card }) => {
    const ref = useRef(null);
    const [pos, setPos] = useState(null);
    useLayoutEffect(() => {
        const r = card.anchor.getBoundingClientRect();
        const box = ref.current.getBoundingClientRect();
        let top = r.bottom + MARGIN;
        if (top + box.height > window.innerHeight - MARGIN) top = r.top - box.height - MARGIN;
        const left = Math.min(Math.max(MARGIN, r.left + r.width / 2 - box.width / 2), window.innerWidth - box.width - MARGIN);
        setPos({ left, top });
    }, [card]);
    const p = card.p;
    return (
        <div ref={ref} className="vtt-initiative-card" style={pos ?? { visibility: 'hidden' }}>
            <div className="vtt-initiative-card-title">{p.name}</div>
            {p.initiative !== null && <div className="vtt-initiative-card-line">Initiative <b>{p.initiative}</b></div>}
            <div className="vtt-initiative-card-line">Actions <b>{p.actions - p.acted} / {p.actions}</b></div>
            {p.kind !== 'character' && (
                <div className="vtt-initiative-card-line">Vu des joueurs <b>{p.reserve ? 'en réserve' : p.hidden ? 'caché' : (p.publicName || 'portrait seul')}</b></div>
            )}
        </div>
    );
};

/**
 * @param {object}   props
 * @param {object}   props.state        état (déjà filtré pour un joueur)
 * @param {'gm'|'player'} props.role
 * @param {string}   props.label        nom à l'écran (config du slug)
 * @param {{players: string, gm: string}} props.sides libellés des camps
 * @param {object}   props.avatars      { clé: data URL }
 * @param {string|null} props.myKey     participant du joueur
 * @param {object}   props.layout       { orientation, minimized, pos }
 * @param {Function} props.onLayout     (patch) → mémorisé par l'appelant
 * @param {object}   [props.gm]         actions du MJ : next, keepOptions ([{ label, onClick, disabled }]), delay, add, sort, undo, canUndo, end, designate, move, menu
 */
const InitiativeStrip = ({ state, role, label, sides, avatars, myKey, layout, onLayout, gm }) => {
    const isGM = role === 'gm';
    const boxRef = useRef(null);
    const [drag, setDrag] = useState(null);       // position pendant un déplacement
    const [card, setCard] = useState(null);       // carte au survol (MJ)
    const [dragKey, setDragKey] = useState(null); // portrait glissé (MJ)
    const [drop, setDrop] = useState(null);       // repère de dépôt

    const vertical = layout.orientation === 'vertical';
    const [placed, setPlaced] = useState(null);

    // Position : mémorisée, sinon en haut au centre ; toujours dans la fenêtre (poignée atteignable)
    useLayoutEffect(() => {
        const place = () => {
            const box = boxRef.current;
            if (!box) return;
            const { width, height } = box.getBoundingClientRect();
            const wanted = drag ?? layout.pos ?? { left: (window.innerWidth - width) / 2, top: MARGIN };
            const left = Math.max(MARGIN, Math.min(wanted.left, window.innerWidth - width - MARGIN));
            const top = Math.max(MARGIN, Math.min(wanted.top, window.innerHeight - height - MARGIN));
            setPlaced(prev => (prev && prev.left === left && prev.top === top ? prev : { left, top }));
        };
        place();
        window.addEventListener('resize', place);
        return () => window.removeEventListener('resize', place);
    });

    // Déplacement : poignée, titre ou fond de la bande ; geste capturé (pas de sélection de texte)
    const onPointerDown = (e) => {
        if (e.button !== 0) return;
        const grip = e.target.closest('.vtt-initiative-handle, .vtt-initiative-head') ?? (e.target === boxRef.current ? e.target : null);
        if (!grip) return;
        e.preventDefault();
        setCard(null);
        const r = boxRef.current.getBoundingClientRect();
        const dx = e.clientX - r.left;
        const dy = e.clientY - r.top;
        grip.setPointerCapture(e.pointerId);
        let last = null;
        const move = (ev) => { last = { left: ev.clientX - dx, top: ev.clientY - dy }; setDrag(last); };
        const up = () => {
            grip.removeEventListener('pointermove', move);
            grip.removeEventListener('pointerup', up);
            grip.removeEventListener('pointercancel', up);
            if (last) onLayout({ pos: last });
            setDrag(null);
        };
        grip.addEventListener('pointermove', move);
        grip.addEventListener('pointerup', up);
        grip.addEventListener('pointercancel', up);
    };

    // Glisser-déposer des portraits (MJ)
    const dropTarget = (e) => {
        const en = e.target.closest('.vtt-initiative-entry');
        if (en && en.dataset.key !== dragKey) {
            const r = en.getBoundingClientRect();
            const after = vertical ? e.clientY > r.top + r.height / 2 : e.clientX > r.left + r.width / 2;
            return { targetKey: en.dataset.key, after };
        }
        const group = e.target.closest('.vtt-initiative-group');
        if (!group) return null;
        return group.hasAttribute('data-reserve') ? { reserve: true } : { side: group.dataset.side };
    };
    const dnd = isGM ? {
        onDragStart: (e) => {
            const en = e.target.closest('.vtt-initiative-entry');
            if (!en) return;
            setCard(null);
            setDragKey(en.dataset.key);
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', en.dataset.key);
        },
        onDragEnd: () => { setDragKey(null); setDrop(null); },
        onDragOver: (e) => {
            if (!dragKey) return;
            const t = dropTarget(e);
            if (!t) return;
            e.preventDefault();
            setDrop(prev => (JSON.stringify(prev) === JSON.stringify(t) ? prev : t));
        },
        onDrop: (e) => {
            if (!dragKey) return;
            const t = dropTarget(e);
            if (!t) return;
            e.preventDefault();
            gm.move(dragKey, t);
            setDragKey(null);
            setDrop(null);
        },
    } : {};

    const dropClass = (key) => {
        if (key === dragKey) return ' is-dragging';
        if (drop?.targetKey !== key) return '';
        return drop.after ? ' is-drop-after' : ' is-drop-before';
    };
    const entry = (p) => (
        <Entry key={p.key} p={p} state={state} isGM={isGM} isMe={p.key === myKey} avatar={avatars[p.key]}
               extraClass={dropClass(p.key)} onDesignate={gm?.designate} onMenu={gm?.menu}
               onHover={(hp, anchor) => setCard(hp && !dragKey ? { p: hp, anchor } : null)} />
    );

    const inPlay = state.participants.filter(p => !p.reserve);
    const reserve = isGM ? state.participants.filter(p => p.reserve) : [];
    const groupClass = (side) => `vtt-initiative-group${drop?.side === side ? ' is-drop-into' : ''}`;
    const sideGroup = (side) => (
        <div className={groupClass(side)} data-side={side} data-hand={state.hand === side ? '' : undefined}>
            <span className="vtt-initiative-group-title">{sides[side]}<span className="vtt-initiative-hand"> · la main</span></span>
            <div className="vtt-initiative-group-list">{inPlay.filter(p => p.side === side).map(entry)}</div>
        </div>
    );
    const first = state.opening === 'gm' ? 'gm' : 'players';

    const active = state.participants.find(p => p.key === state.activeKey) ?? null;
    const waiting = state.mode === 'sides' && !state.activeKey;

    return (
        <>
            <section ref={boxRef} className={`vtt-initiative${layout.minimized ? ' is-minimized' : ''}`}
                     data-orientation={layout.orientation} data-mode={state.mode} role="region" aria-label={label}
                     style={placed ? { left: placed.left, top: placed.top } : { visibility: 'hidden' }}
                     onPointerDown={onPointerDown}>
                <span className="vtt-initiative-handle" title="Déplacer" />
                <div className="vtt-initiative-head" title="Déplacer">
                    <span className="vtt-initiative-label">{label}</span>
                    <span className="vtt-initiative-round">Tour {state.round}</span>
                </div>

                <div className="vtt-initiative-list" {...dnd}>
                    {state.mode === 'sides'
                        ? <>{sideGroup(first)}<span className="vtt-initiative-sep" />{sideGroup(first === 'gm' ? 'players' : 'gm')}</>
                        : inPlay.map(entry)}
                    {isGM && (
                        <>
                            <span className="vtt-initiative-sep" />
                            <div className={`vtt-initiative-group vtt-initiative-reserve${drop?.reserve ? ' is-drop-into' : ''}`} data-reserve=""
                                 title="En réserve : invisibles des joueurs, ne comptent pas encore">
                                <span className="vtt-initiative-group-title">Réserve</span>
                                <div className="vtt-initiative-group-list">{reserve.map(entry)}</div>
                            </div>
                        </>
                    )}
                </div>

                <div className="vtt-initiative-mini">
                    {active
                        ? <><div className="vtt-initiative-frame"><div className="vtt-initiative-avatar">{avatars[active.key] ? <img src={avatars[active.key]} alt="" /> : initials(active.name)}</div></div>
                            <span className="vtt-initiative-name">{active.name}</span></>
                        : waiting && <span className="vtt-initiative-wait">{sides[state.hand]}</span>}
                </div>

                {isGM ? (
                    <div className="vtt-initiative-controls">
                        {waiting && <span className="vtt-initiative-wait">{sides[state.hand]} : à qui ?</span>}
                        <button type="button" className="vtt-initiative-btn is-primary" onClick={gm.next} disabled={waiting}
                                title={state.mode === 'sides' ? 'Fin de l\'action : la main passe à l\'autre camp' : 'Fin de l\'action : au suivant'}>Suivant ▸</button>
                        {gm.keepOptions.map(option => (
                            <button key={option.label} type="button" className="vtt-initiative-btn is-keep" onClick={option.onClick} disabled={option.disabled}
                                    title="Fin de l'action en gardant la main : un autre personnage du camp agit (une fois par tour et par camp)">Garder la main · {option.label}</button>
                        ))}
                        {gm.delay && active && <button type="button" className="vtt-initiative-btn" onClick={gm.delay} title="Agir plus tard dans le tour">Retarder</button>}
                        <button type="button" className="vtt-initiative-btn" onClick={gm.add} title="Ajouter des participants">＋</button>
                        {state.mode === 'order' && <button type="button" className="vtt-initiative-btn" onClick={gm.sort} title="Ranger par initiative">Trier</button>}
                        <button type="button" className="vtt-initiative-btn" onClick={gm.undo} disabled={!gm.canUndo} title="Annuler le dernier geste">↶</button>
                        <button type="button" className="vtt-initiative-btn" onClick={gm.end} title="Terminer">■</button>
                    </div>
                ) : waiting && (
                    <div className="vtt-initiative-controls"><span className="vtt-initiative-wait">{sides[state.hand]} ont la main</span></div>
                )}

                <div className="vtt-initiative-tools">
                    <button type="button" className="vtt-initiative-btn is-icon" onClick={() => onLayout({ orientation: vertical ? 'horizontal' : 'vertical' })}
                            title={vertical ? 'Passer en horizontal' : 'Passer en vertical'} aria-label={vertical ? 'Passer en horizontal' : 'Passer en vertical'}>{vertical ? '⇆' : '⇅'}</button>
                    <button type="button" className="vtt-initiative-btn is-icon" onClick={() => onLayout({ minimized: !layout.minimized })}
                            title={layout.minimized ? 'Agrandir' : 'Réduire'} aria-label={layout.minimized ? 'Agrandir' : 'Réduire'}>{layout.minimized ? '▢' : '–'}</button>
                </div>
            </section>
            {card && <Card card={card} />}
        </>
    );
};

export default InitiativeStrip;
