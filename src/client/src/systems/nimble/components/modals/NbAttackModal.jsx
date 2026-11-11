// src/client/src/systems/nimble/components/modals/NbAttackModal.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Fenêtre d'attaque (spec_nimble.md §1.1, §5) : arme, sort ou capacité.
//   - avantage / désavantage net en tête (attaques précipitées proposées en combat) ;
//   - Évaluer : ouverture (+1 face au dé primaire) ; « ne peut pas rater » ;
//   - dégâts en plus (marque du chasseur, Renforcé…) ;
//   - sort : amplification (mana en plus jusqu'au rang débloqué), mana dépensé,
//     zone (ni raté ni critique), sauvegarde rappelée (DD 10 + CLÉ) ;
//   - les actions du coût sont dépensées en combat.
// Capacité « heal » / « plain » : somme simple des dés.
//
// Props : c, mode ({ kind: 'weapon', attack } | { kind: 'spell', spell } | { kind: 'feature', entry }),
//         sessionId, act, onClose
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import Modal from '@/ui/modal/Modal.jsx';
import { STAT_BY_KEY } from '../../config/basics.js';
import { SCHOOL_BY_KEY } from '../../config/catalog.js';
import { evalFormula, parseDice, diceLabel, signed } from '../../config/rules/formula.js';
import { displayName, formulaVars, resourcesOf, maxSpellTier, cantripBonus, classOf } from '../../config/rules/character.js';
import { rushedEdge } from '../../config/rules/actions.js';
import { MAX_EDGE } from '../../config/rules/dice.js';
import { useNbRoll } from '../../hooks/useNbRoll.js';
import { NbToggle, NbStepper, NbRich } from '../ui/NbUi.jsx';
import NbHistoryEntry from '../layout/NbHistoryEntry.jsx';

const edgeLabel = (e) => (e > 0 ? `Avantage ${e}` : e < 0 ? `Désavantage ${-e}` : 'Normal');
const DAMAGE_TYPES = { fire: 'feu', ice: 'glace', lightning: 'foudre', wind: 'vent', radiant: 'radiant', necrotic: 'nécrotique', psychic: 'psychique',
    bludgeoning: 'contondant', piercing: 'perforant', slashing: 'tranchant' };

/** Nombre d'actions d'un coût (« 2 actions » → 2, « 0 action » → 0, « 1 minute » → 0) */
const actionCount = (cost) => {
    const m = /^(\d+)\s*action/i.exec(String(cost ?? ''));
    return m ? Number(m[1]) : 0;
};

/** Tout ce que la fenêtre doit savoir, selon l'arme, le sort ou la capacité */
const describe = (c, mode, vars) => {
    if (mode.kind === 'weapon') {
        const a = mode.attack;
        return {
            label: a.name, dice: parseDice(a.dice, vars), bonus: a.mod, vicious: a.vicious, canCrit: a.proficient, canMiss: true,
            actions: 1, attack: true, kindPlain: false, damageType: DAMAGE_TYPES[a.item?.data?.damageType] ?? null,
            note: a.proficient ? null : 'Arme non maîtrisée : pas de critique.',
        };
    }
    if (mode.kind === 'spell') {
        const s = mode.spell;
        const aoe = (s.tags ?? []).includes('aoe');
        const dice = parseDice(s.damage?.dice, vars);
        return {
            label: s.name, dice, bonus: evalFormula(s.damage?.bonus, vars) + (s.tier === 0 ? cantripBonus(s, vars.LVL) : 0),
            vicious: false, canCrit: !aoe, canMiss: !aoe, actions: actionCount(s.cost), attack: !!dice, kindPlain: false,
            damageType: DAMAGE_TYPES[s.damage?.type] ?? null, spell: s, aoe,
            note: s.save ? `Moitié sur sauvegarde de ${STAT_BY_KEY[s.save]?.label} (DD ${10 + vars.KEY})` : null,
        };
    }
    const f = mode.entry.feature;
    const kind = f.roll?.kind ?? 'attack';
    return {
        label: f.roll?.label ?? f.name, dice: parseDice(f.roll?.dice, vars), bonus: evalFormula(f.roll?.bonus, vars),
        vicious: false, canCrit: true, canMiss: true, actions: actionCount(f.cost), attack: kind === 'attack', kindPlain: kind !== 'attack',
        damageType: null, note: kind === 'heal' ? 'Soins' : null,
    };
};

const NbAttackModal = ({ c, mode, sessionId, act, onClose }) => {
    const vars = formulaVars(c);
    const d = describe(c, mode, vars);
    const { launch, rolling, error, entry } = useNbRoll();
    const [edge, setEdge] = useState(d.attack ? rushedEdge(c) : 0);
    const [opening, setOpening] = useState(false);
    const [cannotMiss, setCannotMiss] = useState(false);
    const [extra, setExtra] = useState(0);
    const [spendActions, setSpendActions] = useState(!!c.inCombat);
    const [spent, setSpent] = useState(false);

    // Sort : rang lancé (amplification) et mana
    const spell = d.spell;
    const mana = resourcesOf(c).find(r => r.key === 'mana') ?? null;
    const maxTier = maxSpellTier(c) ?? 0;
    const [castTier, setCastTier] = useState(spell?.tier ?? 0);
    const usesMana = !!spell && spell.tier > 0 && !!mana;
    const manaCost = usesMana ? castTier : 0;
    const notEnough = usesMana && mana.value < manaCost;

    const roll = async () => {
        // Mana et actions dépensés au premier lancer seulement (pas en relançant)
        if (!spent && act) {
            if (manaCost) act.setResource('mana', mana.value - manaCost);
            if (spendActions && d.actions) act.spend(d.actions, { attack: d.attack });
            setSpent(true);
        }
        if (!d.dice || d.dice.count <= 0) { onClose(); return; }
        const common = { characterId: c.id, characterName: displayName(c), sessionId: sessionId ?? null, label: d.label };
        if (d.kindPlain) {
            await launch({ ...common, type: 'plain', systemData: { count: d.dice.count, sides: d.dice.sides, bonus: d.bonus + extra, note: d.note } });
            return;
        }
        await launch({
            ...common, type: 'attack',
            systemData: {
                count: d.dice.count, sides: d.dice.sides, special: d.dice.special, edge, vicious: d.vicious,
                canCrit: d.canCrit, canMiss: d.canMiss && !cannotMiss, opening, bonus: d.bonus + extra,
                source: spell ? (castTier > spell.tier ? `amplifié rang ${castTier}` : (SCHOOL_BY_KEY[spell.school]?.name ?? classOf(c)?.name)) : null,
                damageType: d.damageType, note: d.note,
            },
        });
    };

    const subtitle = d.dice ? `${diceLabel(d.dice)}${d.bonus + extra ? ` ${signed(d.bonus + extra)}` : ''} · ${displayName(c)}` : displayName(c);
    const rollLabel = !d.dice || d.dice.count <= 0 ? 'Lancer le sort' : `${entry ? 'Relancer' : 'Lancer'} ${d.dice.special ?? `${d.dice.count + (d.kindPlain ? 0 : Math.abs(edge))}d${d.dice.sides}`}`;

    return (
        <Modal onClose={onClose} title={d.label} subtitle={subtitle} size="md"
               footer={<>
                   <button type="button" className="vtt-btn" onClick={onClose}>Fermer</button>
                   <button type="button" className="vtt-btn vtt-btn-primary" disabled={rolling || notEnough} onClick={roll}>{rollLabel}</button>
               </>}>
            <div className="nb-fields">
                {d.attack && !d.dice?.special && (
                    <div className="nb-field-row">
                        <b>Avantage</b>
                        <NbStepper value={edge} onChange={setEdge} min={-MAX_EDGE} max={MAX_EDGE} format={edgeLabel} label="Avantage" />
                    </div>
                )}
                {d.attack && c.inCombat && Number(c.turnAttacks) > 0 && <p className="nb-note">Attaque précipitée : {c.turnAttacks} attaque(s) déjà faite(s) ce tour.</p>}
                {spell && usesMana && (
                    <div className="nb-field-row">
                        <b>Rang lancé</b>
                        <span className="flex items-center gap-3 flex-wrap">
                            <NbStepper value={castTier} onChange={setCastTier} min={spell.tier} max={Math.max(spell.tier, maxTier)} label="Rang" />
                            <span className="nb-line-meta">{manaCost} mana · {mana.value} / {mana.max} restant{notEnough ? ' : pas assez' : ''}</span>
                        </span>
                    </div>
                )}
                {spell?.upcast && castTier > spell.tier && <p className="nb-note">Amplification (×{castTier - spell.tier}) : {spell.upcast}</p>}
                {d.attack && !d.dice?.special && !d.aoe && (
                    <>
                        <NbToggle on={opening} onChange={setOpening} hint="Évaluer : le dé primaire monte d'une face (ne rate pas, critique plus souvent).">Ouverture créée</NbToggle>
                        <NbToggle on={cannotMiss} onChange={setCannotMiss} hint="Capacité qui ne peut pas rater : un 1 touche quand même.">Ne peut pas rater</NbToggle>
                    </>
                )}
                {d.aoe && <p className="nb-note">Zone : ni raté ni critique, un seul jet pour toutes les cibles.</p>}
                {d.dice && (
                    <div className="nb-field-row">
                        <b>{d.kindPlain ? 'Bonus' : 'Dégâts en plus'}</b>
                        <NbStepper value={extra} onChange={setExtra} min={-20} max={60} signedValue label="Dégâts en plus" />
                    </div>
                )}
                {d.actions > 0 && (
                    <NbToggle on={spendActions} onChange={setSpendActions} hint={c.inCombat ? `${c.actions ?? 0} action(s) restante(s).` : 'Hors combat : rien à dépenser.'}>
                        Dépenser {d.actions} action{d.actions > 1 ? 's' : ''}
                    </NbToggle>
                )}
                {d.note && <p className="nb-note">{d.note}</p>}
                {spell && !d.dice && <NbRich text={spell.text} />}
                {error && <div className="nb-todo is-error">{error}</div>}
                {entry && <div className="vtt-history-entry"><NbHistoryEntry roll={entry} /></div>}
            </div>
        </Modal>
    );
};

export default NbAttackModal;
