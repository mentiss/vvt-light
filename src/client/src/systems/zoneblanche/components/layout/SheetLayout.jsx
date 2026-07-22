// src/client/src/systems/zoneblanche/components/layout/SheetLayout.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Corps de la fiche Zone Blanche — assemblage complet des sections.
//
// C'est LE composant partagé entre l'interface joueur (Sheet.jsx) et
// l'interface GM (gm/tabs/TabSession.jsx) : les deux montent exactement le
// même arbre, dans le même ordre, avec le même comportement. Seuls diffèrent
// la provenance de `char` et l'implémentation de `set`/`patchImmediate`.
//
// Layout deux colonnes :
//   Principale (large)  — Identité (+ Vérités) · Principes (+ Maximes)
//                          · Compétences (+ Focus) · Matériel d'équipe
//   Secondaire (étroite) — Prime Time · Talents
//
// Props :
//   char             — personnage affiché (buffer d'édition si editMode)
//   editMode         — booléen
//   set              — (field, value) → buffer d'édition
//   patchImmediate   — (patch) → écriture immédiate (actions de jeu)
//   onRoll           — (key) → ouverture de la modale de jet, préremplie
//   onAvatarClick    — optionnel
//   sessionId        — session active (matériel)
//   readOnlyEquipment— true côté MJ (consultation + reset, pas d'ajout d'items)
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';

import IdentitySection  from './IdentitySection.jsx';
import PrincipesCard    from './PrincipesCard.jsx';
import CompetencesCard  from './CompetencesCard.jsx';
import PrimeTimePanel   from './PrimeTimePanel.jsx';
import TalentsPanel     from './TalentsPanel.jsx';
import EquipmentSection from './EquipmentSection.jsx';

const SheetLayout = ({
                         char,
                         editMode = false,
                         set,
                         patchImmediate,
                         onRoll,
                         onAvatarClick,
                         sessionId = null,
                         readOnlyEquipment = false,
                     }) => {
    if (!char) return null;

    return (
        <div className="zb-sheet-layout">

            {/* ── COLONNE PRINCIPALE ──────────────────────────────────────── */}
            <div className="zb-sheet-main">

                <div className="zb-panel zb-grain rounded-sm p-5">
                    <IdentitySection
                        char={char}
                        editMode={editMode}
                        set={set}
                        onAvatarClick={onAvatarClick}
                    />
                </div>

                <div className="zb-panel zb-grain rounded-sm p-5">
                    <PrincipesCard
                        char={char}
                        editMode={editMode}
                        set={set}
                        onRoll={key => onRoll?.({ principeKey: key })}
                    />
                </div>

                <div className="zb-panel zb-grain rounded-sm p-5">
                    <CompetencesCard
                        char={char}
                        editMode={editMode}
                        set={set}
                        onRoll={key => onRoll?.({ competenceKey: key })}
                    />
                </div>

                <div className="zb-panel zb-grain rounded-sm p-5">
                    <EquipmentSection
                        sessionId={sessionId}
                        characterId={char.id}
                        readOnly={readOnlyEquipment}
                    />
                </div>
            </div>

            {/* ── COLONNE SECONDAIRE ──────────────────────────────────────── */}
            <div className="zb-sheet-side">

                <div className="zb-panel zb-grain rounded-sm p-5">
                    {/* Action de jeu : passe toujours par patchImmediate,
                        y compris hors mode édition. */}
                    <PrimeTimePanel
                        value={char.prime_time ?? char.primeTime ?? 0}
                        onChange={val => patchImmediate?.({ primeTime: val })}
                    />
                </div>

                <div className="zb-panel zb-grain rounded-sm p-5">
                    <TalentsPanel
                        char={char}
                        editMode={editMode}
                        set={set}
                    />
                </div>
            </div>
        </div>
    );
};

export default SheetLayout;