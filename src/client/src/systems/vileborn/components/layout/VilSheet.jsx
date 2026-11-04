// src/client/src/systems/vileborn/components/layout/VilSheet.jsx
// ─────────────────────────────────────────────────────────────────────────────
// La fiche (un seul onglet, page 1 des prétirés) assemblée à partir des
// sections partagées (VilSections, VilCircles). Fiche joueur et fiche MJ
// l'utilisent toutes deux ; les fenêtres de la fiche (VilSheetModals) sont
// rendues à côté de la feuille, jamais dedans.
// Props : c (personnage), act? (useVilActions ; absent : lecture seule),
//         onRoll? (clic sur une approche), onAvatar? (clic sur le portrait)
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { displayName } from '../../config/rules/character.js';
import VilCircles from './VilCircles.jsx';
import { VilApproaches, VilStates, VilOrigin, VilHeritage, VilBonds } from './VilSections.jsx';
import VilSheetModals from '../modals/VilSheetModals.jsx';

const VilSheet = ({ c, act, onRoll, onAvatar }) => {
    const [asked, setAsked] = useState(null);   // { kind, data } : fenêtre demandée par une section
    const ask = (kind, data) => setAsked({ kind, data });
    const props = { c, act, ask };
    return (
        <>
            <div className="vil-sheet vil-paper">
                <div className="vil-sheet-grid">
                    <div className="vil-col"><VilStates {...props} /></div>
                    <div className="vil-center">
                        <div className="vil-head">
                            <div className="vil-charname">{displayName(c)}</div>
                            {c.motto && <div className="vil-motto">« {c.motto} »</div>}
                        </div>
                        <VilApproaches c={c} onRoll={onRoll} />
                        <VilCircles c={c} onAvatar={onAvatar} />
                    </div>
                    <div className="vil-col vil-right"><VilOrigin {...props} /></div>
                </div>
                <VilHeritage {...props} />
                <VilBonds {...props} />
            </div>
            {act && <VilSheetModals asked={asked} c={c} act={act} onClose={() => setAsked(null)} />}
        </>
    );
};

export default VilSheet;
