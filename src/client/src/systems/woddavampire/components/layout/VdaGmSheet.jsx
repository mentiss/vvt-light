// src/client/src/systems/woddavampire/components/layout/VdaGmSheet.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Fiche du Conteur (lot 3, spec §II.14, planche_conteur.html) : les mêmes
// informations que la fiche joueur, réorganisées pour suivre et contrôler.
// Assemble les sections partagées (VdaTraits, VdaCombat, VdaConditions) en
// présentation compacte, et les blocs propres au Conteur, définis ici :
//   - identité, actions (Note, Copier le code, Modifier) ;
//   - cadre d'état : sang, Volonté, santé, XP (+), états imposés ;
//   - Disciplines résumées (une ligne : valeur et pouvoirs connus).
// Disposition : Attributs et Capacités (Capacités à 0 en grisé), puis
// Disciplines et Vertus | Historiques, Atouts et Handicaps, faiblesse,
// Dérangements, liens | Équipement (bourse : catalogue).
// Les actions de jeu (jauges, états, équipement) s'enregistrent tout de suite.
//
// Props : c, onPatch(patch), onRoll(setup), onModify(), onNote(), onGiveXp()
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import CopyAccessButton from '../../../../components/ui/CopyAccessButton.jsx';
import { DISCIPLINES, IMPOSED_STATES, IMPOSED_STATE_ORDER } from '../../config.jsx';
import { characterProfile, archetypeLabel, traitMaxFor, disciplineSummary } from '../../config/rules/character.js';
import { woundSummary, xpAvailable } from '../../config/rules/sheetRules.js';
import { VdaCorners, VdaChip } from '../ui/VdaUi.jsx';
import { TraitLine, Boxes, HealthTable } from './VdaSheetParts.jsx';
import { VdaAttributes, VdaAbilities, VdaBackgrounds, VdaVirtues, VdaMeritsFlaws } from './VdaTraits.jsx';
import { VdaEquipment } from './VdaCombat.jsx';
import { VdaWeakness, VdaDerangements, VdaBloodBonds } from './VdaConditions.jsx';

const noEdit = () => {};

/** Identité en une ligne de faits, avec les actions du Conteur sur ce personnage */
const GmIdentity = ({ c, onNote, onModify }) => {
    const { clanLabel, bloodMax, perTurn, road, roadStatus } = characterProfile(c);
    return (
        <div className="vda-gm-id">
            <div className="vda-avatar is-small">{c.avatar ? <img src={c.avatar} alt="" /> : <span aria-hidden="true">✠</span>}</div>
            <div className="min-w-0">
                <h3 className="vda-gm-name">{c.nom}</h3>
                <div className="vda-gm-facts">
                    <span>Joueur <b>{c.playerName}</b></span>
                    <span>Clan <b>{clanLabel || '—'}</b></span>
                    <span><b>{c.generation}ᵉ</b> Génération ({bloodMax} sang, {perTurn}/tour)</span>
                    <span>{road?.label} <b>{c.roadRating}</b> · {roadStatus}</span>
                    <span>Nature <b>{archetypeLabel(c.natureKey) || '—'}</b> · Attitude <b>{archetypeLabel(c.demeanorKey) || '—'}</b></span>
                    {c.sire && <span>Sire <b>{c.sire}</b></span>}
                </div>
            </div>
            <div className="vda-gm-id-actions">
                <button type="button" className="vtt-btn vtt-btn-sm" onClick={onNote}>✉ Note</button>
                <CopyAccessButton character={c} className="vtt-btn-sm" />
                <button type="button" className="vtt-btn vtt-btn-sm" onClick={onModify}>Modifier</button>
            </div>
        </div>
    );
};

/** Cadre d'état : en grand et contrôlable (sang, Volonté, santé, XP, état imposé) */
const GmState = ({ c, onPatch, onGiveXp }) => {
    const { bloodMax } = characterProfile(c);
    const blood = Math.min(c.bloodCurrent ?? 0, bloodMax);
    const health = woundSummary(c);
    const states = c.states ?? [];
    // Un seul état imposé à la fois : en choisir un remplace le précédent, le recliquer l'ôte
    // (les autres entrées de states, comme la faiblesse de clan, sont conservées)
    const toggleState = (k) => {
        const others = states.filter(x => !IMPOSED_STATE_ORDER.includes(x));
        onPatch({ states: states.includes(k) ? others : [...others, k] });
    };
    return (
        <div className="vda-gm-state">
            <div>
                <h4>Réserve de sang <small>{blood} / {bloodMax}</small></h4>
                <Boxes count={bloodMax} filled={blood} label="Point de sang" onPick={(v) => onPatch({ bloodCurrent: v })} />
            </div>
            <div>
                <h4>Volonté <small>{c.willpowerCurrent ?? 0} / {c.willpowerPermanent ?? 0}</small></h4>
                <Boxes count={10} filled={c.willpowerCurrent ?? 0} cap={c.willpowerPermanent ?? 0} ink label="Volonté temporaire"
                       onPick={(v) => onPatch({ willpowerCurrent: v })} />
            </div>
            <div>
                <h4>Santé <small className={health.hurt ? 'is-hurt' : ''}>{health.text}</small></h4>
                <HealthTable c={c} onQuick={onPatch} />
            </div>
            <div>
                <h4 className="vda-title-act">Expérience
                    <button type="button" className="vda-title-ico" onClick={onGiveXp} title="Donner de l'XP" aria-label="Donner de l'XP">+</button></h4>
                <div className="vda-gm-big">{xpAvailable(c)} <small>disponible</small></div>
                <div className="vda-note">{c.xpTotal ?? 0} gagnée · {c.xpSpent ?? 0} dépensée</div>
            </div>
            <div className="vda-gm-states">
                <h4>États</h4>
                {IMPOSED_STATE_ORDER.map(k => <VdaChip key={k} on={states.includes(k)} onClick={() => toggleState(k)}>{IMPOSED_STATES[k].label}</VdaChip>)}
            </div>
        </div>
    );
};

/** Disciplines résumées : valeur et, dessous, pouvoirs connus (ou voies de la magie du sang) */
const GmDisciplines = ({ c }) => {
    const traitMax = traitMaxFor(c);
    return (
        <>
            <div className="vda-col-title vda-gm-h">Disciplines</div>
            {(c.disciplines ?? []).filter(d => d.rating > 0).map(d => (
                <TraitLine key={d.id ?? d.disciplineKey} label={DISCIPLINES[d.disciplineKey]?.label ?? d.disciplineKey} value={d.rating} max={traitMax}
                           below={<div className="vda-gm-powers">{disciplineSummary(c, d)}</div>} />
            ))}
        </>
    );
};

const VdaGmSheet = ({ c, onPatch, onRoll, onModify, onNote, onGiveXp }) => (
    <section className="vda-sheet vda-gm-sheet">
        <VdaCorners />
        <GmIdentity c={c} onNote={onNote} onModify={onModify} />
        <GmState c={c} onPatch={onPatch} onGiveXp={onGiveXp} />

        <div className="vda-col-title vda-gm-h">Attributs</div>
        <VdaAttributes c={c} onRoll={onRoll} compact />
        <div className="vda-col-title vda-gm-h">Capacités</div>
        <VdaAbilities c={c} onRoll={onRoll} compact mutedZero />

        <div className="vda-three mt-3">
            <div>
                <GmDisciplines c={c} />
                <VdaVirtues c={c} onRoll={onRoll} compact />
            </div>
            <div>
                <VdaBackgrounds c={c} compact />
                <VdaMeritsFlaws c={c} compact />
                <VdaWeakness c={c} onQuick={onPatch} compact />
                <div className="mt-2"><VdaDerangements c={c} editMode={false} onArray={noEdit} /></div>
                <div className="mt-2"><VdaBloodBonds c={c} editMode={false} onArray={noEdit} /></div>
            </div>
            <div>
                <VdaEquipment c={c} onQuick={onPatch} onRoll={onRoll} />
            </div>
        </div>
    </section>
);

export default VdaGmSheet;
