// src/client/src/systems/woddavampire/components/modals/VdaDiceModal.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Fenêtre de jet (spec_woddavampire.md §3.2, §3.3, §13.2) : Attribut + Capacité,
// difficulté 2 à 10, modificateurs libellés, Spécialité (trait ≥ 4), Volonté
// (+1 succès automatique, dépense le point), jet réflexe (sans malus de
// blessure), bonus permanent de la Discipline physique (décochable).
// Disposition : en tête la réserve et la difficulté ; à gauche le choix des
// traits (Attributs par groupes de 3 comme sur la fiche, Capacités en mini
// onglets) ; à droite les réglages, le détail et le résultat (même rendu que
// l'historique). Modale générique de la plateforme (Modal).
//
// Pouvoirs (lot 2b) : traits en plus (Volonté, Vertu, Route, Discipline), Attribut
// brut (Koldunisme), coût proposé à la dépense, activation de Puissance / Force
// d'âme (1 sang : dés en succès automatiques), difficulté « à fixer », rappel de
// l'échec critique d'un jet de Discipline.
//
// Props : character, sessionId, onPatch, onClose,
//   initial { attrKey, abilityKey, virtue, label, extras, rawAttributes, difficulty,
//             askDifficulty, diffNote, note, cost: { blood, willpower, text, spendByDefault }, discipline,
//             diceMod, diceModLabel, reflex, noArmorPenalty }   (combat, lot 2c)
// La faiblesse « rappel » du clan (Anda), cochée, s'affiche en tête.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import Modal from '@/ui/modal/Modal.jsx';

import { CLAN_WEAKNESS_STATES, ATTRIBUTE_GROUPS, ABILITY_GROUPS, ABILITY_LABELS, ABILITY_CATEGORY, BODY_CRAFTS, DISCIPLINES, ROLL_TYPES } from '../../config.jsx';
import { buildPool, difficultyLabel, physicalBonusFor, disciplineRating, abilityRating, traitLabel, traitValue, spendCost, costLabel } from '../../config/rules/sheetRules.js';
import { useVdaRoll } from '../../hooks/useVdaRoll.js';
import { VdaChip, VdaStepper, VdaToggle } from '../ui/VdaUi.jsx';
import VdaHistoryEntry from '../layout/VdaHistoryEntry.jsx';

/** Ligne choisissable : nom et valeur ; un second clic désélectionne */
const PickRow = ({ label, value, on, muted, onClick }) => (
    <button type="button" className={`vda-pick-row${on ? ' is-on' : ''}${muted ? ' is-muted' : ''}`} onClick={onClick} aria-pressed={on}>
        <span>{label}</span><b>{value}</b>
    </button>
);

const VdaDiceModal = ({ character, sessionId, initial = {}, onPatch, onClose }) => {
    const { launch: rollDice, rolling, error, entry } = useVdaRoll();

    const [attrKey, setAttrKey]       = useState(initial.attrKey ?? null);
    const [abilityKey, setAbilityKey] = useState(initial.abilityKey ?? null);
    const [abilityTab, setAbilityTab] = useState(ABILITY_CATEGORY[initial.abilityKey] ?? 'talent');
    const [difficulty, setDifficulty] = useState(initial.difficulty ?? 6);
    const [diceMod, setDiceMod]       = useState(initial.diceMod ?? 0);
    const [diceModLabel, setDiceModLabel] = useState(initial.diceModLabel ?? '');
    const [diffMod, setDiffMod]       = useState(0);
    const [diffModLabel, setDiffModLabel] = useState('');
    const [specialty, setSpecialty]   = useState(false);
    const [willpower, setWillpower]   = useState(false);
    const [reflex, setReflex]         = useState(!!initial.reflex);
    const [physicalBonus, setPhysicalBonus] = useState(true);
    const [extras, setExtras]         = useState(initial.extras ?? []);
    const [payCost, setPayCost]       = useState(!!initial.cost?.spendByDefault);
    const [activatePhysical, setActivatePhysical] = useState(false);

    const virtue = initial.virtue ?? null;   // jet de Vertu : la Vertu seule, plafonnée (§4.5)
    const pool = buildPool(character, {
        attrKey: virtue ? null : attrKey, abilityKey: virtue ? null : abilityKey, virtue, virtueLabel: initial.label,
        diceMod, diceModLabel, difficulty, diffMod, diffModLabel, reflex, physicalBonus, specialty, willpower,
        extras: virtue ? [] : extras, rawAttributes: !!initial.rawAttributes, activatePhysical, noArmorPenalty: !!initial.noArmorPenalty,
    });
    const cost = initial.cost ?? null;
    // Faiblesse « rappel » du clan (Anda) quand elle est cochée ; les autres faiblesses s'appliquent à la réserve
    const weakness = CLAN_WEAKNESS_STATES[character.clanKey];
    const reminders = weakness?.kind === 'reminder' && (character.states ?? []).includes('weakness') ? [weakness.reminder] : [];
    const hasCost = cost && (cost.blood > 0 || cost.willpower > 0);
    const phys = attrKey && !initial.rawAttributes ? physicalBonusFor(attrKey) : null;
    const hasPhys = phys && disciplineRating(character, phys) > 0;
    const canWillpower = (character.willpowerCurrent ?? 0) > 0;
    const label = initial.label || [attrKey && ATTRIBUTE_GROUPS.flatMap(g => g.attributes).find(([k]) => k === attrKey)?.[1], abilityKey && ABILITY_LABELS[abilityKey]]
        .filter(Boolean).join(' + ') || 'Jet';

    // Capacités de l'onglet ouvert (Artisanat corporel en Compétence s'il est connu)
    const group = ABILITY_GROUPS.find(g => g.key === abilityTab);
    const abilities = abilityTab === 'skill' && abilityRating(character, BODY_CRAFTS[0]) > 0 ? [...group.abilities, BODY_CRAFTS] : group.abilities;

    const launch = async () => {
        if (pool.blocked || pool.dice < 1) return;
        const result = await rollDice({
            characterId: character.id, characterName: character.nom || 'Personnage', sessionId: sessionId ?? null,
            label, rollType: ROLL_TYPES.pool,
            systemData: { type: 'pool', dice: pool.dice, difficulty: pool.difficulty, specialty: specialty && pool.specialtyAllowed, autoSuccesses: pool.autoSuccesses },
        });
        if (!result) return;
        // Dépenses : Volonté (+1 succès), coût du pouvoir, activation physique (1 sang)
        const blood = (payCost && hasCost ? cost.blood : 0) + (activatePhysical && pool.activatable ? 1 : 0);
        const will = (willpower ? 1 : 0) + (payCost && hasCost ? cost.willpower : 0);
        if (blood || will) onPatch?.(spendCost(character, { blood, willpower: will }));
        setWillpower(false);
    };

    return (
        <Modal onClose={onClose} title={label} size="xl"
               footer={<>
                   <button type="button" className="vtt-btn" onClick={onClose}>Fermer</button>
                   <button type="button" className="vtt-btn vtt-btn-primary" disabled={rolling || !!pool.blocked || pool.dice < 1} onClick={launch}>
                       {entry ? 'Relancer' : 'Lancer'} {pool.dice} dé{pool.dice > 1 ? 's' : ''}
                   </button>
               </>}>
            {/* En tête : ce qui compte, toujours visible */}
            <div className="vda-roll-head">
                <div><span className="vda-label">Réserve</span><b>{pool.dice}</b> dé{pool.dice > 1 ? 's' : ''}{pool.autoSuccesses > 0 && <small> + 1 succès auto</small>}</div>
                <div><span className="vda-label">Difficulté</span><b>{pool.difficulty}</b> {difficultyLabel(pool.difficulty)}</div>
                <div className="vda-roll-head-step">
                    <VdaStepper value={difficulty} min={2} max={10} onChange={setDifficulty} label="Difficulté" />
                </div>
            </div>
            {reminders.map(r => <div key={r} className="vda-todo"><b>Faiblesse :</b> {r}</div>)}
            {initial.askDifficulty && <div className="vda-todo is-warning"><b>Difficulté à fixer :</b> {initial.diffNote}</div>}
            {!initial.askDifficulty && initial.diffNote && <div className="vda-todo is-warning"><b>Difficulté :</b> {initial.diffNote}</div>}
            {initial.note && <div className="vda-todo is-warning"><b>{initial.discipline ? 'Jet du livre :' : 'À noter :'}</b> {initial.note}</div>}
            {pool.blocked && <div className="vda-error-list mt-2">{pool.blocked}</div>}

            <div className="vda-roll-body">
                {/* ── Choix des traits ── */}
                <div className="min-w-0">
                    {virtue ? (
                        <p className="vda-note">Jet de Vertu : jamais au-delà de la Route{virtue === 'virtueControl' ? ' ni de la réserve de sang actuelle' : ''} ; pas de malus de blessure.</p>
                    ) : (
                        <>
                            <div className="vda-label">Attribut</div>
                            <div className="vda-three is-tight">
                                {ATTRIBUTE_GROUPS.map(g => (
                                    <div key={g.key}>
                                        <div className="vda-roll-group">{g.label}</div>
                                        {g.attributes.map(([k, l]) => (
                                            <PickRow key={k} label={l} value={character[k] ?? 0} on={attrKey === k} onClick={() => setAttrKey(attrKey === k ? null : k)} />
                                        ))}
                                    </div>
                                ))}
                            </div>

                            <div className="vda-label mt-3">Capacité{abilityKey ? ` : ${ABILITY_LABELS[abilityKey]}` : ''}</div>
                            <div className="vda-mini-tabs" role="tablist">
                                {ABILITY_GROUPS.map(g => (
                                    <button key={g.key} type="button" role="tab" aria-selected={abilityTab === g.key}
                                            className={`vda-mini-tab${abilityTab === g.key ? ' is-active' : ''}`} onClick={() => setAbilityTab(g.key)}>
                                        {g.label}
                                    </button>
                                ))}
                            </div>
                            <div className="vda-two is-tight">
                                {abilities.map(([k, l]) => {
                                    const r = abilityRating(character, k);
                                    return <PickRow key={k} label={l} value={r} muted={r === 0} on={abilityKey === k} onClick={() => setAbilityKey(abilityKey === k ? null : k)} />;
                                })}
                            </div>
                            {extras.length > 0 && (
                                <>
                                    <div className="vda-label mt-3">En plus</div>
                                    <div className="vda-chips">
                                        {extras.map((t, i) => (
                                            <VdaChip key={`${t.kind}-${t.key}`} on onClick={() => setExtras(extras.filter((_, j) => j !== i))} title="Retirer de la réserve">
                                                {traitLabel(character, t)} {traitValue(character, t)} ✕
                                            </VdaChip>
                                        ))}
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </div>

                {/* ── Réglages, détail, résultat ── */}
                <div className="vda-roll-side">
                    <div className="vda-label">Modificateurs</div>
                    <div className="vda-trait">
                        <input className="vda-input" placeholder="Dés en plus ou en moins (ex. Atout, Couvert…)" value={diceModLabel} onChange={(e) => setDiceModLabel(e.target.value)} />
                        <VdaStepper value={diceMod} min={-10} max={10} onChange={setDiceMod} label="Modificateur de dés" />
                    </div>
                    <div className="vda-trait">
                        <input className="vda-input" placeholder="Difficulté en plus ou en moins (ex. Action multiple)" value={diffModLabel} onChange={(e) => setDiffModLabel(e.target.value)} />
                        <VdaStepper value={diffMod} min={-5} max={5} onChange={setDiffMod} label="Modificateur de difficulté" />
                    </div>

                    <div className="vda-label mt-3">Options</div>
                    <div className="flex flex-col gap-2">
                        {pool.specialtyAllowed && <VdaToggle on={specialty} onChange={setSpecialty}>Spécialité{pool.specialties.length ? ` (${pool.specialties.join(', ')})` : ''} : un 10 compte 2 succès</VdaToggle>}
                        <VdaToggle on={willpower && canWillpower} onChange={(v) => canWillpower && setWillpower(v)}>Volonté : +1 succès {canWillpower ? `(${character.willpowerCurrent} restante${character.willpowerCurrent > 1 ? 's' : ''})` : '(épuisée)'}</VdaToggle>
                        <VdaToggle on={reflex} onChange={setReflex}>Jet réflexe (sans malus de blessure)</VdaToggle>
                        {hasPhys && <VdaToggle on={physicalBonus} onChange={setPhysicalBonus}>{DISCIPLINES[phys].label} (bonus permanent)</VdaToggle>}
                        {pool.activatable && physicalBonus && (
                            <VdaToggle on={activatePhysical} onChange={setActivatePhysical}>Activer {DISCIPLINES[pool.activatable].label} (1 sang) : ses dés deviennent des succès automatiques</VdaToggle>
                        )}
                        {hasCost && (
                            <VdaToggle on={payCost} onChange={setPayCost}>Dépenser le coût : {costLabel(cost.text, cost)}</VdaToggle>
                        )}
                    </div>

                    <div className="vda-label mt-3">Détail</div>
                    <div className="vda-roll-meta">
                        {pool.lines.length === 0 && <span>Choisissez un Attribut et une Capacité.</span>}
                        {pool.lines.map((l, i) => <span key={i}>{i > 0 && l.value >= 0 ? '+ ' : ''}{l.value < 0 ? '− ' : ''}{l.label} {Math.abs(l.value)}</span>)}
                    </div>
                    {pool.diffLines.length > 0 && (
                        <div className="vda-roll-meta">Difficulté {difficulty}{pool.diffLines.map((l, i) => <span key={i}>{l.value > 0 ? '+' : '−'}{Math.abs(l.value)} ({l.label})</span>)} = {pool.difficulty}</div>
                    )}

                    {error && <div className="vda-error-list mt-2">{error}</div>}
                    {entry && <div className="vtt-history-entry mt-3 p-3"><VdaHistoryEntry roll={entry} /></div>}
                    {entry && initial.discipline && entry.roll_result?.botch && (
                        <div className="vda-error-list mt-2">Échec critique sur un pouvoir : la Bête se déchaîne (conséquence choisie par le Conteur).</div>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default VdaDiceModal;
