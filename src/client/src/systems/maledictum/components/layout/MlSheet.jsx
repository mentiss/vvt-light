// src/client/src/systems/maledictum/components/layout/MlSheet.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Fiche sur un seul onglet (planche_themes.html), assemblée de la même façon pour
// le joueur et pour le MJ : trois colonnes (identité, Patron, ressources ·
// caractéristiques, compétences, armes, armure, inventaire · talents, pouvoirs,
// Influence, Blessures critiques, Corruption, objectifs et XP), litanies en marge,
// crâne-serviteur et encensoir. Les fenêtres (act.ask) s'ouvrent à côté de la grille.
//
// Props : c, patch, patron, sessionId, theme, onAvatar (facultatif)
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { derived } from '../../config/rules/character.js';
import { useMlActions } from '../../hooks/useMlActions.js';
import MlSheetModals, { traitLabel } from '../modals/MlSheetModals.jsx';
import { Orn } from '../ui/MlUi.jsx';
import {
    IdentitySection, PatronSection, WoundsSection, ResourcesSection, CharacteristicsSection, SkillsSection, WeaponsSection, ArmourSection,
    InventorySection, TalentsSection, PowersSection, InfluenceSection, CorruptionSection, GoalsSection,
} from './MlSections.jsx';

const LITANIES = {
    hereticus: 'INNOCENTIA NIHIL PROBAT · SUSPICIO EST VIRTUS · ',
    malleus: 'DAEMONIUM DELEBO · PURITAS · ',
    xenos: 'XENOS DELENDA EST · VIGILATE · ',
    ecclesiarchy: 'AVE IMPERATOR · DEUS IMPERATOR · ',
    sororitas: 'A MORTE PERPETUA DOMINE LIBERA NOS · FIDES · ',
    mechanicus: '01001111 01001101 01001110 01001001 · OMNISSIAH · ',
    militarum: 'PRO IMPERATORE · NON CEDIMUS · ',
    administratum: 'ORDO EST LEX · REGISTRUM · ',
    telepathica: 'ANIMA LUMEN · CHORUS ASTRALIS · ',
    navy: 'PER ASTRA · NAVIS IMPERIALIS · ',
    roguetrader: 'MERCATOR IMPERII · LUCRUM · ',
    underhive: 'SUB RUCHA · NEMO VIDET · ',
};

const MlSheet = ({ c, patch, patron, sessionId, theme, onAvatar }) => {
    const [asked, setAsked] = useState(null);
    const act = useMlActions({ character: c, patch, ask: (kind, data) => setAsked({ kind, data }) });
    const d = derived(c);
    const litany = (LITANIES[theme] ?? LITANIES.hereticus).repeat(12);
    return (
        <>
            <div className="im-page">
                <div className="im-litany is-left" aria-hidden="true"><span>{litany}</span></div>
                <div className="im-litany is-right" aria-hidden="true"><span>{litany}</span></div>
                <span className="im-servo"><Orn name="servo" /></span>
                <span className="im-censer"><Orn name="censer" /></span>
                <div className="im-body">
                    <div className="im-col">
                        <IdentitySection c={c} onAvatar={onAvatar} />
                        <PatronSection patron={patron} />
                        <WoundsSection c={c} d={d} act={act} />
                        <ResourcesSection c={c} d={d} act={act} />
                    </div>
                    <div className="im-col is-mid">
                        <CharacteristicsSection c={c} act={act} />
                        <SkillsSection c={c} d={d} act={act} />
                        <div className="im-mid-cols">
                            <WeaponsSection c={c} act={act} traitLabel={traitLabel} />
                            <ArmourSection c={c} />
                        </div>
                        <InventorySection c={c} d={d} act={act} />
                    </div>
                    <div className="im-col">
                        <TalentsSection c={c} act={act} />
                        <PowersSection c={c} d={d} act={act} />
                        <InfluenceSection c={c} act={act} />
                        <CorruptionSection c={c} d={d} act={act} />
                        <GoalsSection c={c} act={act} />
                    </div>
                </div>
            </div>
            <MlSheetModals asked={asked} c={c} act={act} patron={patron} sessionId={sessionId} theme={theme} onClose={() => setAsked(null)} />
        </>
    );
};

export default MlSheet;
