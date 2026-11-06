// src/client/src/systems/fabula/components/group/ClockDrawer.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Volet des cadrans sur la fiche du joueur (spec_fabula.md §11.3) : languette
// au bord droit, présente seulement s'il y a au moins un cadran visible des
// joueurs et pas plein. Elle porte leur nombre ; un clic ouvre le volet, qui
// s'ouvre aussi tout seul quand un cadran avance (fabula-groupe-update).
// Ouvert ou fermé : retenu par le navigateur. Cadrans en version compacte,
// modifiables comme dans l'onglet Groupe (clic, −1 / +1), sans les réglages.
//
// Props : sessionId (table active ; sans table, rien n'est rendu)
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect, useRef } from 'react';
import FuIcon from '../ui/FuIcon.jsx';
import { Clock } from './GroupSheet.jsx';
import { useGroupe } from '../../hooks/useGroupe.js';
import { useSocket } from '../../../../context/SocketContext.jsx';
import { usePersistedState } from '../../../../hooks/usePersistedState.js';

const DRAWER_OPTIONS = { defaults: { open: false }, version: 1 };

const isActive = (c) => !c.cache && c.remplies < c.sections;

const ClockDrawer = ({ sessionId }) => {
    const { groupe, send } = useGroupe(sessionId);
    const socket = useSocket();
    const [drawer, setDrawer] = usePersistedState('fabula', 'clockDrawer', DRAWER_OPTIONS);
    const open = !!drawer?.open;

    // Avancée d'un cadran visible : comparée à la dernière fiche reçue
    const lastRef = useRef(null);
    useEffect(() => { lastRef.current = groupe; }, [groupe]);
    useEffect(() => {
        if (!socket || !sessionId) return undefined;
        const onUpdate = (payload) => {
            if (String(payload?.sessionId) !== String(sessionId)) return;
            const before = new Map((lastRef.current?.cadrans ?? []).map(c => [c.id, c.remplies]));
            const advanced = (payload.groupe?.cadrans ?? []).some(c => !c.cache && before.has(c.id) && c.remplies > before.get(c.id));
            if (advanced) setDrawer({ open: true });
        };
        socket.on('fabula-groupe-update', onUpdate);
        return () => socket.off('fabula-groupe-update', onUpdate);
    }, [socket, sessionId, setDrawer]);

    const cadrans = (groupe?.cadrans ?? []).filter(isActive);
    if (!sessionId || cadrans.length === 0) return null;

    return (
        <div className={`fu-drawer${open ? ' is-open' : ''}`}>
            <button type="button" className="fu-drawer-tab" onClick={() => setDrawer({ open: !open })}
                    aria-expanded={open} title={open ? 'Fermer le volet des cadrans' : 'Ouvrir le volet des cadrans'}>
                <span className="fu-drawer-count">{cadrans.length}</span>
                <span className="fu-drawer-label">Cadrans</span>
            </button>
            {open && (
                <div className="fu-win fu-drawer-panel">
                    <div className="fu-win-head">
                        <h3 className="fu-title">Cadrans<span className="fu-kana" aria-hidden="true">時計</span></h3>
                        <span className="fu-rule" />
                        <button type="button" className="fu-clock-gear" onClick={() => setDrawer({ open: false })} title="Fermer">
                            <FuIcon name="close" className="fu-ico-sm" />
                        </button>
                    </div>
                    <div className="fu-drawer-clocks">
                        {cadrans.map(c => (
                            <Clock key={c.id} cadran={c} compact onPatch={patch => send('PATCH', `/cadrans/${c.id}`, patch)} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClockDrawer;
