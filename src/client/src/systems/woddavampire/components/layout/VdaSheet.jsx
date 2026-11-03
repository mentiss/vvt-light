// src/client/src/systems/woddavampire/components/layout/VdaSheet.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Feuille du personnage (fiche joueur, et fiche complète en Édition côté Conteur),
// sur un seul onglet, disposée comme la page 1 de la fiche officielle
// (spec_woddavampire.md §4.1, §II.9 ; planche validée). Assemble les sections
// partagées (VdaTraits, VdaPowers, VdaCombat, VdaConditions) et les blocs propres
// à la fiche joueur, définis ici : identité, Route et Volonté, sang, santé, histoire.
//
// - Hors édition : clic sur un trait (nom ou points) = jet pré-rempli, Volonté et
//   Route comprises ; jauges (Volonté temporaire, sang, santé), soins, états
//   toujours cliquables, enregistrés tout de suite.
// - Traits au-delà de 5 : autant de points que le permet la Génération.
// - « Combat et pouvoirs » : barre d'actions de combat, équipement à gauche,
//   Disciplines à droite ; la dépense d'XP est une action de page (sous-header).
// - En édition : points et textes modifiables (fiche libre, §1.4).
//
// Props : c (personnage affiché), editMode, onField(field, value),
//         onArray(field, array), onQuick(patch), onRoll({ attrKey, abilityKey, label }), onWake,
//         onAvatar() : ouvre l'outil d'avatar (mode édition), onInitiative()
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { characterProfile, archetypeLabel, nextValue } from '../../config/rules/character.js';
import { stainSpots, stainCount, healWithBlood, healAggravated } from '../../config/rules/sheetRules.js';
import { VdaCorners, VdaDots, VdaSectionTitle } from '../ui/VdaUi.jsx';
import { Field, Boxes, HealthTable } from './VdaSheetParts.jsx';
import { VdaAttributes, VdaAbilities, VdaBackgrounds, VdaVirtues, VdaMeritsFlaws } from './VdaTraits.jsx';
import VdaPowers from './VdaPowers.jsx';
import { VdaCombatActions, VdaEquipment } from './VdaCombat.jsx';
import { VdaWeakness, VdaDerangements, VdaBloodBonds } from './VdaConditions.jsx';
import stain1 from '../../assets/stain-1.webp';
import stain3 from '../../assets/stain-3.webp';
import stain4 from '../../assets/stain-4.webp';
import stain5 from '../../assets/stain-5.webp';
import stain6 from '../../assets/stain-6.webp';

const STAIN_IMAGES = { 1: stain1, 3: stain3, 4: stain4, 5: stain5, 6: stain6 };
const HISTORY_FIELDS = [['historyLife', "De mon vivant, j'étais…"], ['historySire', "Mon sire m'a choisi parce que…"], ['historyNights', 'Désormais, je passe mes nuits…']];

// ── Blocs propres à la fiche joueur ─────────────────────────────────────────

/** Taches séchées : une par niveau de santé perdu, à place fixe */
const Stains = ({ c }) => stainSpots(c.id, stainCount(c)).map((s, i) => (
    <span key={i} className="vda-stain" aria-hidden="true"
          style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.size, height: s.size, backgroundImage: `url(${STAIN_IMAGES[s.kind]})`, '--rot': `rotate(${s.rot}deg)`, transform: `rotate(${s.rot}deg)` }} />
));

/** Identité : portrait en médaillon (en édition, un clic ouvre l'outil d'avatar) et champs d'en-tête */
const Identity = ({ c, editMode, onField, onAvatar }) => {
    const { clanLabel } = characterProfile(c);
    return (
        <div className="vda-identity">
            <button type="button" className={`vda-avatar${editMode ? ' is-editable' : ''}`} disabled={!editMode}
                    onClick={() => editMode && onAvatar?.()} title={editMode ? 'Changer le portrait' : undefined} aria-label="Portrait">
                {c.avatar ? <img src={c.avatar} alt="" /> : <span aria-hidden="true">✠</span>}
            </button>
            <div className="vda-header-grid">
                <Field label="Nom" value={c.nom} editMode={editMode} onChange={(v) => onField('nom', v)} />
                <Field label="Nature" value={archetypeLabel(c.natureKey)} />
                <Field label="Clan" value={clanLabel} />
                <Field label="Joueur" value={c.playerName} editMode={editMode} onChange={(v) => onField('playerName', v)} />
                <Field label="Attitude" value={archetypeLabel(c.demeanorKey)} />
                <Field label="Génération" value={editMode ? c.generation : `${c.generation ?? ''}ᵉ`} editMode={editMode}
                       onChange={(v) => onField('generation', Math.max(4, Math.min(15, Number(v) || 12)))} />
                <Field label="Chronique" value={c.chronicle} editMode={editMode} onChange={(v) => onField('chronicle', v)} />
                <Field label="Concept" value={c.concept} editMode={editMode} onChange={(v) => onField('concept', v)} />
                <Field label="Sire" value={c.sire} editMode={editMode} onChange={(v) => onField('sire', v)} />
            </div>
        </div>
    );
};

/** Points d'une jauge permanente : modifiables en édition, sinon un clic lance le jet */
const RollableDots = ({ value, label, rollTitle, editMode, onSet, onRoll, className }) => (
    <div className={`flex justify-center ${className}`}>
        {editMode
            ? <VdaDots max={10} base={value} onPick={(n) => onSet(nextValue(value, n))} label={label} />
            : <button type="button" className="vda-dots-roll" title={rollTitle} onClick={onRoll}>
                <VdaDots max={10} base={value} label={label} /></button>}
    </div>
);

/** Route (statut, aura) et Volonté (permanente, temporaire) */
const RoadWillpower = ({ c, editMode, onField, onQuick, onRoll }) => {
    const { road, roadLabel, roadStatus } = characterProfile(c);
    return (
        <div>
            <VdaSectionTitle small>Route</VdaSectionTitle>
            <div className="text-center">{roadLabel} <small className="vda-note">· {roadStatus}</small></div>
            <RollableDots value={c.roadRating ?? 0} label="Route" rollTitle="Lancer la Route" className="my-1" editMode={editMode} onSet={(v) => onField('roadRating', v)}
                          onRoll={() => onRoll({ label: 'Route', extras: [{ kind: 'road', key: 'road' }], reflex: true })} />
            <div className="text-center vda-note">Aura : <i>{road?.aura}</i></div>
            <VdaSectionTitle small>Volonté</VdaSectionTitle>
            <RollableDots value={c.willpowerPermanent ?? 0} label="Volonté permanente" rollTitle="Lancer la Volonté" className="mb-1" editMode={editMode} onSet={(v) => onField('willpowerPermanent', v)}
                          onRoll={() => onRoll({ label: 'Volonté', extras: [{ kind: 'willpower', key: 'willpower' }], reflex: true })} />
            <Boxes count={10} filled={c.willpowerCurrent ?? 0} cap={c.willpowerPermanent ?? 0} ink label="Volonté temporaire"
                   onPick={(v) => onQuick({ willpowerCurrent: v })} />
        </div>
    );
};

/** Réserve de sang (bornée au maximum de la Génération), Réveil et soins */
const BloodPool = ({ c, onQuick, onWake }) => {
    const { bloodMax, perTurn } = characterProfile(c);
    const shown = Math.min(c.bloodCurrent ?? 0, bloodMax);
    const heal = healWithBlood(c);
    const healAgg = healAggravated(c);
    return (
        <div>
            <VdaSectionTitle small>Réserve de sang</VdaSectionTitle>
            <Boxes count={bloodMax} filled={shown} label="Point de sang" onPick={(v) => onQuick({ bloodCurrent: v })} />
            <p className="text-center vda-note mt-1">{shown} / {bloodMax} · {perTurn} par tour</p>
            {(c.bloodCurrent ?? 0) > bloodMax && (
                <p className="text-center vda-note is-negative">Réserve enregistrée : {c.bloodCurrent}, au-dessus du maximum de la Génération (un clic la corrige).</p>
            )}
            <div className="vda-combat-actions justify-center mt-2">
                <button type="button" className="vtt-btn vtt-btn-sm" onClick={onWake} title="−1 sang, +1 Volonté">Réveil</button>
                <button type="button" className="vtt-btn vtt-btn-sm" disabled={!heal} onClick={() => heal && onQuick(heal)}
                        title="1 sang soigne 1 niveau létal (sinon contondant)">Soigner (1 S)</button>
                <button type="button" className="vtt-btn vtt-btn-sm" disabled={!healAgg} onClick={() => healAgg && onQuick(healAgg)}
                        title="5 sang et une journée de repos soignent 1 niveau aggravé">Aggravé (5 S)</button>
            </div>
        </div>
    );
};

/** Histoire : les trois phrases, langues, description, notes */
const History = ({ c, editMode, onField }) => (
    <>
        <div className="vda-three">
            {HISTORY_FIELDS.map(([k, label]) => (
                <label key={k} className="block">
                    <span className="vda-label">{label}</span>
                    {editMode ? <textarea className="vda-textarea" rows={3} value={c[k] ?? ''} onChange={(e) => onField(k, e.target.value)} /> : <p>{c[k] || '—'}</p>}
                </label>
            ))}
        </div>
        <div className="vda-two mt-2">
            <Field label="Langues" value={c.languages} editMode={editMode} onChange={(v) => onField('languages', v)} />
            <Field label="Description" value={c.description} editMode={editMode} onChange={(v) => onField('description', v)} />
        </div>
        {editMode && (
            <label className="block mt-2">
                <span className="vda-label">Notes</span>
                <textarea className="vda-textarea" rows={3} value={c.notes ?? ''} onChange={(e) => onField('notes', e.target.value)} />
            </label>
        )}
        {!editMode && c.notes && <p className="vda-note mt-2">{c.notes}</p>}
    </>
);

// ── Feuille ─────────────────────────────────────────────────────────────────

const VdaSheet = ({ c, editMode, onField, onArray, onQuick, onRoll, onWake, onAvatar, onInitiative }) => (
    <div className="vda-sheet">
        <VdaCorners />
        <Stains c={c} />
        <Identity c={c} editMode={editMode} onField={onField} onAvatar={onAvatar} />

        <VdaSectionTitle>Attributs</VdaSectionTitle>
        <VdaAttributes c={c} editMode={editMode} onField={onField} onRoll={onRoll} />

        <VdaSectionTitle>Capacités</VdaSectionTitle>
        <VdaAbilities c={c} editMode={editMode} onArray={onArray} onRoll={onRoll} />

        <VdaSectionTitle>Avantages</VdaSectionTitle>
        {/* Les Disciplines sont dans « Combat et pouvoirs » (une seule fois sur la fiche) */}
        <div className="vda-three">
            <VdaBackgrounds c={c} editMode={editMode} onArray={onArray} />
            <VdaVirtues c={c} editMode={editMode} onField={onField} onRoll={onRoll} />
            <VdaMeritsFlaws c={c} editMode={editMode} onArray={onArray} />
        </div>

        <div className="vda-three mt-4">
            <RoadWillpower c={c} editMode={editMode} onField={onField} onQuick={onQuick} onRoll={onRoll} />
            <BloodPool c={c} onQuick={onQuick} onWake={onWake} />
            <div>
                <VdaSectionTitle small>Santé</VdaSectionTitle>
                <HealthTable c={c} onQuick={onQuick} />
                <p className="vda-note mt-1">Clic : / contondant → X létal → ✱ aggravé → vide.</p>
            </div>
        </div>

        <VdaSectionTitle>Combat et pouvoirs</VdaSectionTitle>
        <VdaCombatActions c={c} onRoll={onRoll} onInitiative={onInitiative} />
        <div className="vda-combat-layout">
            <VdaEquipment c={c} onQuick={onQuick} onRoll={onRoll} />
            <div>
                <div className="vda-col-title">Disciplines</div>
                <VdaPowers c={c} editMode={editMode} onArray={onArray} onQuick={onQuick} onRoll={onRoll} />
            </div>
        </div>

        <VdaSectionTitle>Traits particuliers</VdaSectionTitle>
        <div className="vda-three">
            <VdaWeakness c={c} editMode={editMode} onField={onField} onQuick={onQuick} />
            <div><VdaDerangements c={c} editMode={editMode} onArray={onArray} /></div>
            <div><VdaBloodBonds c={c} editMode={editMode} onArray={onArray} /></div>
        </div>

        <VdaSectionTitle>Histoire</VdaSectionTitle>
        <History c={c} editMode={editMode} onField={onField} />
    </div>
);

export default VdaSheet;
