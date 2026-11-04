// src/client/src/systems/nimble/components/layout/NbSheet.jsx
// ─────────────────────────────────────────────────────────────────────────────
// La fiche (un seul onglet, spec_nimble.md §6.2) assemblée à partir des bandes
// (NbBands) et des sections partagées (NbSections). Fiche joueur et fiche MJ
// l'utilisent toutes deux ; ses fenêtres (NbSheetModals) sont rendues à côté
// de la feuille, jamais dedans.
// Props : c (personnage), act? (useNbActions ; absent : lecture seule),
//         sessionId, onAvatar?, extraModal? ({ kind, data } demandé de l'extérieur)
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { NbStatBand, NbSkillBand } from './NbBands.jsx';
import { NbCombat, NbResources, NbConditions, NbFeatures, NbSpells, NbInventory, NbNotes } from './NbSections.jsx';
import NbSheetModals from '../modals/NbSheetModals.jsx';

const NbSheet = ({ c, act, sessionId, onAvatar }) => {
    const [asked, setAsked] = useState(null);   // { kind, data } : fenêtre demandée par une section
    const ask = act ? (kind, data) => setAsked({ kind, data }) : null;
    const props = { c, act, ask };
    return (
        <>
            <div className="nb-sheet">
                <NbStatBand c={c} ask={ask} act={act} onAvatar={onAvatar} />
                <NbSkillBand c={c} ask={ask} />
                <div className="nb-cols nb-paper p-4">
                    <div className="nb-col">
                        <NbCombat {...props} />
                        <NbResources {...props} />
                        <NbConditions {...props} />
                    </div>
                    <div className="nb-col"><NbFeatures {...props} /></div>
                    <div className="nb-col">
                        <NbSpells {...props} />
                        <NbInventory {...props} />
                    </div>
                </div>
                <div className="nb-paper p-4"><NbNotes c={c} /></div>
            </div>
            {act && <NbSheetModals asked={asked} c={c} act={act} sessionId={sessionId} onClose={() => setAsked(null)} />}
        </>
    );
};

export default NbSheet;
