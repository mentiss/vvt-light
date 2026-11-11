// src/client/src/features/initiative/InitiativeLayer.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Couche « initiative » des pages génériques (documentations/spec_initiative.md §9.6),
// montée par GMPage et PlayerPage avec la table active, comme BoardLayer.
// Rien si le slug n'a pas de bloc `initiative` dans son config.jsx (§9.8).
// - MJ : bouton de la zone d'actions (« Lancer » sans initiative en cours, sinon
//   réduire / agrandir la bande), bande avec ses commandes, menu d'un participant,
//   fenêtre de lancement et d'ajout, reprise de la copie de secours.
// - Joueur : la bande en lecture seule dès qu'une initiative est en cours (vue filtrée
//   par visibleTo), réductible par le même bouton.
// Disposition mémorisée par slug et par rôle (vtt:<slug>:initiative-<rôle>).
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect, useRef, useState } from 'react';
import { SESSION_NPC_EVENT } from '@/features/npc/hooks/useNpcs.js';
import InitiativeNpcSheet from './InitiativeNpcSheet.jsx';
import useSlugConfig from '@/app/hooks/useSlugConfig.js';
import { useInitiativeSession } from './hooks/useInitiativeSession.js';
import { usePersistedState } from '@/app/hooks/usePersistedState.js';
import { getSystemFromPath } from '@/app/hooks/useSystem.js';
import { useAuth } from '@/app/context/AuthContext.jsx';
import { useSocket } from '@/app/context/SocketContext.jsx';
import { useFetch } from '@/app/hooks/useFetch.js';
import { ZoneAction } from '@/features/table/ActionZone.jsx';
import Modal from '@/ui/modal/Modal.jsx';
import InitiativeStrip from './InitiativeStrip.jsx';
import InitiativeEntryMenu from './InitiativeEntryMenu.jsx';
import InitiativeLaunchModal from './InitiativeLaunchModal.jsx';
import {
    createInitiative, start, addParticipants, next, keepHand, keepableSide, delay, designate,
    enter, toReserve, removeParticipant, updateParticipant, moveParticipant, sortByInitiative, visibleTo, applyNpcChange,
} from './tools/initiative.js';

const LAYOUT_DEFAULTS = { orientation: 'horizontal', minimized: false, pos: null };

const InitiativeIcon = () => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="5" cy="6" r="2" /><circle cx="12" cy="6" r="2" /><circle cx="19" cy="6" r="2" />
        <path d="M3 14h18M15 10l4 4-4 4M4 20h8" />
    </svg>
);

/**
 * @param {object} props
 * @param {'gm'|'player'} props.role
 * @param {number|null}   props.sessionId   table active
 * @param {Array}         [props.characters] PJ de la table (MJ : activeSession.characters)
 */
const InitiativeLayer = ({ role, sessionId, characters }) => {
    const isGM = role === 'gm';
    const slugConfig = useSlugConfig();
    const ini = slugConfig?.initiative ?? null;
    const session = useInitiativeSession(ini ? sessionId : null, isGM);
    const [layout, setLayout] = usePersistedState(getSystemFromPath(), `initiative-${role}`, { defaults: LAYOUT_DEFAULTS });
    const { user } = useAuth();
    const socket = useSocket();
    const fetchWithAuth = useFetch();
    const [launch, setLaunch] = useState(false);
    const [menu, setMenu] = useState(null);          // { key, anchor }
    const [ending, setEnding] = useState(false);
    // Bande masquée par le bouton de la zone d'actions (pas mémorisé) ; une initiative qui se
    // termine la fait réapparaître pour la suivante (ajustement pendant le rendu, motif React)
    const [hidden, setHidden] = useState(false);
    const [notice, setNotice] = useState(null);      // refus de garder la main (réserve insuffisante…)
    const [keeping, setKeeping] = useState(false);   // paiement de « garder la main » en cours
    const [wasRunning, setWasRunning] = useState(false);
    const running = !!session.state;
    if (running !== wasRunning) {
        setWasRunning(running);
        if (!running) setHidden(false);
    }
    const [sheetFor, setSheetFor] = useState(null);   // id de la ligne session_npcs dont la fiche est ouverte

    // PNJ de la table modifié ou retiré dans ce navigateur (onglet PNJ, fiche ouverte d'ici) :
    // la bande suit sa blessure et son nom, ou le retire (spec_initiative.md §12). MJ seulement.
    const latest = useRef(null);
    useEffect(() => { latest.current = { state: session.state, save: session.save, woundOf: ini?.npcWound }; });
    useEffect(() => {
        if (!isGM || !ini || !sessionId) return undefined;
        const onChange = (e) => {
            const { state, save, woundOf } = latest.current ?? {};
            if (!state || e.detail?.sessionId !== sessionId) return;
            const nextState = applyNpcChange(state, e.detail, woundOf);
            if (nextState !== state) save(nextState);
        };
        window.addEventListener(SESSION_NPC_EVENT, onChange);
        return () => window.removeEventListener(SESSION_NPC_EVENT, onChange);
    }, [isGM, ini, sessionId]);

    if (!ini || !sessionId || !session.loaded) return null;

    const { state, avatars } = session;
    const label = ini.label ?? 'Initiative';
    const sides = { players: 'Joueurs', gm: 'Adversaires', ...ini.sides };
    const onLayout = (patch) => setLayout(prev => ({ ...prev, ...patch }));
    const myKey = !isGM && user?.character?.id ? `c${user.character.id}` : null;

    // ── Bouton de la zone d'actions ─────────────────────────────────────────
    // Sans initiative (MJ) : lancer. Pendant une initiative : masquer / afficher la bande ;
    // masquée, le bouton est mis en avant (halo de la zone d'actions) : quelque chose est en cours.
    const zone = (state || isGM) && (
        <ZoneAction id="initiative" icon={<InitiativeIcon />} order={40}
                    label={!state ? `Lancer : ${label}` : (hidden ? `${label} en cours : afficher` : `${label} : masquer`)}
                    active={!!state && !hidden}
                    highlighted={!!state && hidden}
                    onSelect={() => (state ? setHidden(h => !h) : setLaunch(true))} />
    );

    // ── Actions du MJ : chaque geste calcule l'état suivant et l'envoie ─────
    const save = (nextState, newAvatars) => session.save(nextState, newAvatars);
    // Garder la main : une ou plusieurs façons de payer par camp (Dune, côté PJ : Impulsion ou Menace).
    // `run(ctx)` débite la ressource ; { ok: false, error } : la main n'est pas gardée, message affiché.
    const keepSide = isGM && state ? keepableSide(state) : null;
    const keepCfg = keepSide ? ini.keepInitiative?.[keepSide] : null;
    // Verrou pendant le paiement (pas de double débit) ; la transition part de l'état le plus récent
    const keepOptions = (Array.isArray(keepCfg) ? keepCfg : keepCfg ? [keepCfg] : []).map(option => ({
        label: option.label,
        disabled: keeping,
        onClick: async () => {
            if (keeping) return;
            setKeeping(true);
            try {
                const result = await option.run?.({ socket, fetchWithAuth, sessionId, side: keepSide });
                if (result && result.ok === false) { setNotice(result.error ?? 'La main n\'a pas pu être gardée.'); return; }
                setNotice(null);
                const current = latest.current?.state;
                if (current) save(keepHand(current));
            } finally {
                setKeeping(false);
            }
        },
    }));
    const gm = isGM && state ? {
        next: () => save(next(state)),
        keepOptions,
        delay: ini.delay && state.mode === 'order' ? () => save(delay(state)) : null,
        add: () => setLaunch(true),
        sort: () => save(sortByInitiative(state)),
        undo: session.undo,
        canUndo: session.canUndo,
        end: () => setEnding(true),
        designate: (key) => save(designate(state, key)),
        move: (key, target) => save(moveParticipant(state, key, target)),
        menu: (key, anchor) => setMenu(prev => (prev?.key === key ? null : { key, anchor })),
    } : null;

    const onLaunchConfirm = async ({ participants, avatars: newAvatars, opening, enemyOrder }) => {
        const nextState = state
            ? addParticipants(state, participants)
            : start(addParticipants(createInitiative({ mode: ini.mode, alternate: ini.alternate ?? true, opening, enemyOrder }), participants));
        const ok = await save(nextState, newAvatars);
        if (ok) setLaunch(false);   // refusé : la fenêtre reste ouverte, sélection gardée
        return ok;
    };

    const menuParticipant = menu && state ? state.participants.find(p => p.key === menu.key) : null;
    const onMenuAction = (action) => {
        const key = menu.key;
        if (action === 'designate') save(designate(state, key));
        if (action === 'enter') save(enter(state, key));
        if (action === 'reserve') save(toReserve(state, key));
        if (action === 'remove') { save(removeParticipant(state, key)); setMenu(null); }
        if (action === 'sheet') { setSheetFor(menuParticipant.refId); setMenu(null); }
    };

    return (
        <>
            {zone}

            {state && !hidden && (
                <InitiativeStrip state={visibleTo(state, role)} role={role} label={label} sides={sides} avatars={avatars}
                                 myKey={myKey} layout={layout} onLayout={onLayout} gm={gm} />
            )}

            {isGM && state && notice && (
                <div className="vtt-initiative-resume" role="alert">
                    <span>{notice}</span>
                    <button type="button" className="vtt-btn vtt-btn-sm" onClick={() => setNotice(null)}>OK</button>
                </div>
            )}

            {isGM && !state && session.backup?.state && (
                <div className="vtt-initiative-resume" role="status">
                    <span>{label} en cours avant le redémarrage du serveur (tour {session.backup.state.round}) : la reprendre ?</span>
                    <button type="button" className="vtt-btn vtt-btn-sm vtt-btn-primary" onClick={() => session.resume(true)}>Reprendre</button>
                    <button type="button" className="vtt-btn vtt-btn-sm" onClick={() => session.resume(false)}>Oublier</button>
                </div>
            )}

            {menuParticipant && !hidden && (
                <InitiativeEntryMenu participant={menuParticipant} state={state} anchor={menu.anchor} sides={sides}
                                     woundLabels={ini.woundLabels} hasSheet={!!slugConfig.npc?.Sheet} onClose={() => setMenu(null)}
                                     onPatch={(patch) => save(updateParticipant(state, menu.key, patch))} onAction={onMenuAction} />
            )}

            {sheetFor && slugConfig.npc && (
                <InitiativeNpcSheet sessionId={sessionId} instanceId={sheetFor} config={slugConfig.npc} onClose={() => setSheetFor(null)} />
            )}

            {launch && (
                <InitiativeLaunchModal sessionId={sessionId} slugConfig={slugConfig} characters={characters}
                                       existing={new Set(state?.participants.map(p => p.key) ?? [])} launching={!state}
                                       onConfirm={onLaunchConfirm} onClose={() => setLaunch(false)} />
            )}

            {ending && (
                <Modal title={`Terminer : ${label}`} size="sm" onClose={() => setEnding(false)}
                       footer={<>
                           <button type="button" className="vtt-btn" onClick={() => setEnding(false)}>Continuer</button>
                           <button type="button" className="vtt-btn vtt-btn-primary" onClick={() => { session.end(); setEnding(false); setMenu(null); }}>Terminer</button>
                       </>}>
                    <p>La bande disparaît pour toute la table.</p>
                </Modal>
            )}
        </>
    );
};

export default InitiativeLayer;
