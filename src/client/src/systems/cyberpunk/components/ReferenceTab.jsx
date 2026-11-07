// src/client/src/systems/cyberpunk/components/ReferenceTab.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Onglet Référence (joueurs et MJ) : brique de la plateforme ReferenceGuide
// (spec_ui_reference.md), contenu dans config/referenceGuide.js (règles en
// Markdown, listes des playbooks, catalogues). spec_cyberpunk.md §9.9.
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import ReferenceGuide from '../../../components/reference/ReferenceGuide.jsx';
import { REFERENCE_SECTIONS } from '../config/referenceGuide.js';

const ReferenceTab = ({ isGM = false }) => (
    // Défile ici : sur la fiche, le conteneur de l'onglet ne défile pas (overflow-hidden)
    <div className="cp-ref-page h-full overflow-y-auto cp-scroll">
        <ReferenceGuide sections={REFERENCE_SECTIONS} isGM={isGM}
                        placeholder="Rechercher une règle, un implant, un objet (ex. Synth, Retenue, daemon, grenade)…" />
    </div>
);

export default ReferenceTab;
