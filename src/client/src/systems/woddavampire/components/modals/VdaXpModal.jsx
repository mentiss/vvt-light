// src/client/src/systems/woddavampire/components/modals/VdaXpModal.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Dépenser son XP (spec_woddavampire.md §6, §II.13 C-9) : modale générique de la
// plateforme. En tête l'XP disponible (négative en rouge : la dépense ne bloque
// pas) et l'ajout de l'XP gagnée ; puis les achats possibles par onglet, chacun
// avec sa valeur, la suivante et son coût calculé (§6.1, modulations §6.2).
// Chaque achat s'enregistre tout de suite (onPatch).
//
// Props : character, onPatch(patch), onClose
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import Modal from '../../../../components/ui/Modal.jsx';
import {
    ATTRIBUTE_GROUPS, ABILITY_GROUPS, BACKGROUNDS, DISCIPLINES, DISCIPLINE_ORDER, PATHS, KRAINA,
    VIRTUE_LABELS, roadVirtues, availableRituals, CLANS,
} from '../../config.jsx';
import { traitMaxFor, clanDisciplines } from '../../config/rules/character.js';
import { xpCost, purchasePatch, xpAvailable, abilityRating, disciplineRating } from '../../config/rules/sheetRules.js';
import { VdaChip, VdaStepper, VdaToggle } from '../ui/VdaUi.jsx';

const TABS = [
    ['traits', 'Attributs et Vertus'], ['abilities', 'Capacités'], ['disciplines', 'Disciplines'],
    ['backgrounds', 'Historiques'], ['blood', 'Magie du sang'],
];

/** Une ligne d'achat : nom, valeur → valeur + 1, coût, bouton */
const BuyRow = ({ label, current, max, cost, onBuy, note }) => (
    <div className="vda-xp-row">
        <span className="flex-1 min-w-0">{label}{note && <small className="vda-note"> · {note}</small>}</span>
        <span className="vda-power-meta">{current} → {current + 1}</span>
        <span className="vda-xp-cost">{cost} XP</span>
        <button type="button" className="vda-chip" disabled={current >= max} onClick={onBuy}>{current >= max ? 'Maximum' : 'Acheter'}</button>
    </div>
);

const VdaXpModal = ({ character: c, onPatch, onClose }) => {
    const [tab, setTab] = useState('traits');
    const [abilityTab, setAbilityTab] = useState('talent');
    const [gain, setGain] = useState(1);
    const [mentorRoad, setMentorRoad] = useState(0);
    const [moment, setMoment] = useState(false);

    const traitMax = traitMaxFor(c);
    const available = xpAvailable(c);
    const buy = (p) => onPatch(purchasePatch(c, p));
    const row = (label, p, max = traitMax, note) => (
        <BuyRow key={`${p.kind}-${p.discipline ?? ''}-${p.key}`} label={label} current={p.current ?? 0} max={max} cost={xpCost(c, p)} note={note} onBuy={() => buy(p)} />
    );

    const [moralKey, controlKey] = roadVirtues(c.roadKey, c.roadPathKey);
    const clanDiscs = clanDisciplines(c.clanKey, c.casteKey, c.originClanKey);
    const known = (c.disciplines ?? []).filter(d => d.rating > 0).map(d => d.disciplineKey);

    return (
        <Modal onClose={onClose} title="Dépenser son XP" size="lg"
               footer={<button type="button" className="vtt-btn" onClick={onClose}>Fermer</button>}>
            <div className="vda-roll-head">
                <div><span className="vda-label">Disponible</span><b className={available < 0 ? 'is-negative' : ''}>{available}</b> XP</div>
                <div><span className="vda-label">Historique</span>{c.xpTotal ?? 0} gagnée · {c.xpSpent ?? 0} dépensée</div>
                <div className="vda-roll-head-step flex items-center gap-2">
                    <VdaStepper value={gain} min={1} max={50} onChange={setGain} label="XP gagnée" />
                    <button type="button" className="vda-chip" onClick={() => onPatch({ xpTotal: (c.xpTotal ?? 0) + gain })}>Ajouter l'XP gagnée</button>
                </div>
            </div>
            <p className="vda-note mt-2">Rappel : +1 au plus par trait et par histoire. Le mode Édition de la fiche reste libre, sans coût.</p>

            <div className="vda-mini-tabs mt-3" role="tablist">
                {TABS.map(([k, l]) => (
                    <button key={k} type="button" role="tab" aria-selected={tab === k} className={`vda-mini-tab${tab === k ? ' is-active' : ''}`} onClick={() => setTab(k)}>{l}</button>
                ))}
            </div>

            {tab === 'traits' && (
                <div className="vda-two is-tight">
                    <div>
                        {ATTRIBUTE_GROUPS.map(g => (
                            <div key={g.key}>
                                <div className="vda-roll-group mt-2">{g.label}</div>
                                {g.attributes.map(([k, l]) => row(l, { kind: 'attribute', key: k, current: c[k] ?? 0 },
                                    k === 'appearance' && CLANS[c.clanKey]?.effects?.appearanceZero ? 0 : traitMax))}
                            </div>
                        ))}
                    </div>
                    <div>
                        <div className="vda-roll-group mt-2">Vertus <small className="vda-note">(ne changent ni la Route ni la Volonté)</small></div>
                        {row(VIRTUE_LABELS[moralKey], { kind: 'virtue', key: 'virtueMoral', current: c.virtueMoral ?? 0 }, 5)}
                        {row(VIRTUE_LABELS[controlKey], { kind: 'virtue', key: 'virtueControl', current: c.virtueControl ?? 0 }, 5)}
                        {row('Courage', { kind: 'virtue', key: 'virtueCourage', current: c.virtueCourage ?? 0 }, 5)}
                        <div className="vda-roll-group mt-2">Volonté</div>
                        {row('Volonté', { kind: 'willpower', key: 'willpower', current: c.willpowerPermanent ?? 0 }, 10)}
                        <div className="vda-roll-group mt-2">Route</div>
                        {row('Route', { kind: 'road', key: 'road', current: c.roadRating ?? 0, mentorRoad, momentOfTruth: moment }, 10)}
                        <div className="flex flex-col gap-2 mt-1">
                            <div className="flex items-center gap-2"><span className="vda-note flex-1">Route du mentor (0 : aucun)</span>
                                <VdaStepper value={mentorRoad} min={0} max={10} onChange={setMentorRoad} label="Route du mentor" /></div>
                            <VdaToggle on={moment} onChange={setMoment}>Moment de vérité dans cette histoire (÷ 2)</VdaToggle>
                        </div>
                    </div>
                </div>
            )}

            {tab === 'abilities' && (
                <>
                    <div className="vda-chips my-2">
                        {ABILITY_GROUPS.map(g => <VdaChip key={g.key} on={abilityTab === g.key} onClick={() => setAbilityTab(g.key)}>{g.label}</VdaChip>)}
                    </div>
                    <div className="vda-two is-tight">
                        {ABILITY_GROUPS.find(g => g.key === abilityTab).abilities.map(([k, l]) => {
                            const cur = abilityRating(c, k);
                            return row(l, { kind: 'ability', key: k, current: cur }, traitMax, cur === 0 ? 'nouvelle Capacité' : null);
                        })}
                    </div>
                </>
            )}

            {tab === 'disciplines' && (
                <>
                    {known.map(k => row(DISCIPLINES[k].label, { kind: 'discipline', key: k, current: disciplineRating(c, k) }, traitMax,
                        clanDiscs.includes(k) ? 'de clan' : 'hors clan'))}
                    <div className="vda-label mt-3">Nouvelle Discipline (10 XP ; hors clan : un mentor est nécessaire, à la table)</div>
                    <div className="vda-chips">
                        {DISCIPLINE_ORDER.filter(k => !known.includes(k)).map(k => (
                            <VdaChip key={k} onClick={() => buy({ kind: 'discipline', key: k, current: 0 })}>{DISCIPLINES[k].label}</VdaChip>
                        ))}
                    </div>
                </>
            )}

            {tab === 'backgrounds' && (
                <div className="vda-two is-tight">
                    {Object.entries(BACKGROUNDS).map(([k, l]) => {
                        const cur = (c.backgrounds ?? []).find(b => b.backgroundKey === k)?.rating ?? 0;
                        return row(l, { kind: 'background', key: k, current: cur }, 5, cur === 0 ? 'nouvel Historique, accord du Conteur' : 'accord du Conteur');
                    })}
                </div>
            )}

            {tab === 'blood' && (
                <BloodMagicPurchases c={c} buy={buy} row={row} />
            )}
        </Modal>
    );
};

/** Magie du sang : voies (montée, nouvelle voie) et rituels, par Discipline connue */
const BloodMagicPurchases = ({ c, buy, row }) => {
    const discs = (c.disciplines ?? []).filter(d => d.rating > 0 && DISCIPLINES[d.disciplineKey]?.bloodMagic);
    if (!discs.length) return <p className="vda-note mt-2">Aucune Discipline de magie du sang.</p>;
    return discs.map(d => {
        const def = DISCIPLINES[d.disciplineKey];
        const list = def.bloodMagic === 'kraina' ? KRAINA[d.disciplineKey] ?? {} : PATHS[def.pathSet] ?? {};
        const owned = (c.bloodPaths ?? []).filter(p => p.disciplineKey === d.disciplineKey);
        const rituals = def.bloodMagic === 'paths'
            ? availableRituals(def.pathSet, d.rating, c.clanKey).filter(r => !(c.rituals ?? []).some(x => x.ritualKey === r.key)) : [];
        return (
            <div key={d.disciplineKey} className="mt-2">
                <div className="vda-roll-group">{def.label} {d.rating}</div>
                {owned.filter(p => !p.isPrimary).map(p => row(list[p.pathKey] ?? p.pathKey,
                    { kind: 'path', discipline: d.disciplineKey, key: p.pathKey, current: p.rating }, d.rating, 'voie secondaire, ≤ Discipline'))}
                {owned.some(p => p.isPrimary) && <p className="vda-note">La voie principale monte avec la Discipline.</p>}
                <div className="vda-chips mt-1">
                    {Object.entries(list).filter(([k]) => !owned.some(p => p.pathKey === k)).map(([k, l]) => (
                        <VdaChip key={k} onClick={() => buy({ kind: 'newPath', discipline: d.disciplineKey, key: k })}>Nouvelle voie : {l} (7 XP)</VdaChip>
                    ))}
                </div>
                {rituals.length > 0 && (
                    <div className="vda-chips mt-1">
                        {rituals.map(r => (
                            <VdaChip key={r.key} onClick={() => buy({ kind: 'ritual', discipline: d.disciplineKey, key: r.key, level: r.level })}>
                                Rituel {r.level} : {r.label} ({r.level * 2} XP)
                            </VdaChip>
                        ))}
                    </div>
                )}
            </div>
        );
    });
};

export default VdaXpModal;
