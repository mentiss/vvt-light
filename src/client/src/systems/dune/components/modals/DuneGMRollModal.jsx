// src/client/src/systems/dune/components/modals/DuneGMRollModal.jsx
// Jet du MJ (spec_dune.md §2.4), sur la modale générique, au format de la fenêtre
// du joueur : seuil, difficulté et dés en tête, résultat sur place.
// Même résolution que le joueur (config/rules/roll.js, MJ 2026-11-04) : dé ≤ seuil = 1 succès,
// un 1 = 2 succès, 20 = complication ; pas de Détermination (3 Menace, à la table).
// Utilisée par la bande du MJ et par l'onglet PNJ (spec_pnj.md §7, D-2, D-3) : pour un PNJ,
// seuil et libellé préremplis, spécialisation proposée si sa compétence en a, dés achetés
// payés en Menace (1, puis 2, puis 3), excédent versé en Menace après le jet.

import React, { useState } from 'react';
import Modal from '../../../../components/ui/Modal.jsx';
import { roll, RollError } from '../../../../tools/diceEngine.js';
import { useFetch }  from '../../../../hooks/useFetch.js';
import { useSystem } from '../../../../hooks/useSystem.js';
import DuneIcon from '../ui/DuneIcon.jsx';
import DuneDie  from '../ui/DuneDie.jsx';
import { DuneStepper } from '../ui/DuneFields.jsx';
import { BASE_DICE, MAX_DICE, MAX_DIFFICULTY, resolveRoll } from '../../config/rules/roll.js';
import { threatCost } from '../../config/rules/npc.js';
import { useSessionResources } from '../../hooks/useSessionResources.js';

const MAX_THRESHOLD = 20;

// Hooks du moteur pour le jet du MJ
const GM_DICE_HOOKS = {
    buildNotation: (ctx) => `${ctx.systemData.nbDes}d20`,
    beforeRoll: (ctx) => {
        if (ctx.systemData.nbDes < 1) throw new RollError('NO_DICE', 'Aucun dé à lancer');
        return ctx;
    },
    afterRoll: (raw, ctx) => {
        const { rang, difficulte, specialisationThreshold = 0 } = ctx.systemData;
        const results = raw.groups[0].values;
        const r = resolveRoll({ values: results, threshold: rang, specialisationThreshold, difficulty: difficulte });
        return {
            results, dice: r.dice, rang, difficulte, succes: r.successes, complications: r.complications, label: ctx.label,
            reussite: r.success, excedent: r.excess, successes: r.successes,
        };
    },
    buildAnimationSequence: (raw, ctx) => ({
        mode: 'single',
        // Une seule vague (pas d'explosion en 2d20) : le moteur ne fournit pas de waves dans raw
        groups: [{ id: 'gm-roll', diceType: 'd20', color: 'default', label: ctx.label, waves: [{ dice: raw.groups[0].values }] }],
    }),
};

/**
 * @param {Function} props.onClose
 * @param {number|null} [props.sessionId]
 * @param {number}   [props.initialRang=3]
 * @param {string}   [props.initialLabel]   ex. « Garde Harkonnen · Combat + Devoir » (PNJ)
 * @param {object}   [props.npc]            jet d'un PNJ : { specialisation: rang de la compétence | null,
 *                                          hidden: jets des PNJ cachés (réglage de l'onglet) }
 */
const DuneGMRollModal = ({ onClose, sessionId = null, initialRang = 3, initialLabel = null, npc = null }) => {
    const fetchWithAuth = useFetch();
    const { apiBase }   = useSystem();
    const { resources, updateResource } = useSessionResources(npc ? sessionId : null, true);
    const [rang, setRang]             = useState(initialRang);
    const [difficulte, setDifficulte] = useState(1);
    const [nbDes, setNbDes]           = useState(BASE_DICE);
    const [broadcast, setBroadcast]   = useState(npc ? !npc.hidden : false);
    const [specialisation, setSpecialisation] = useState(false);
    const [rolling, setRolling]       = useState(false);
    const [result, setResult]         = useState(null);
    const [threatPaid, setThreatPaid] = useState(false);   // excédent déjà versé en Menace

    const label = initialLabel ?? `Meneur — ${nbDes}d20`;
    // PNJ : dés achetés payés en Menace (le PNJ n'a pas d'Impulsion)
    const cost = npc ? threatCost(nbDes - BASE_DICE) : 0;
    const tooExpensive = npc && sessionId && cost > resources.menace;

    const handleRoll = async () => {
        if (rolling || tooExpensive) return;
        setRolling(true);
        try {
            const ctx = {
                apiBase, fetchFn: fetchWithAuth, characterId: null, characterName: 'Meneur', sessionId,
                rollType: 'dune_gm_2d20', label, persistHistory: broadcast,
                systemData: { nbDes, rang, difficulte, specialisationThreshold: specialisation ? (npc?.specialisation ?? 0) : 0 },
            };
            const res = await roll(GM_DICE_HOOKS.buildNotation(ctx), ctx, GM_DICE_HOOKS);
            if (cost > 0 && sessionId) updateResource('menace', -cost);
            setThreatPaid(false);
            setResult(res);
        } catch (err) {
            console.error('[DuneGMRollModal] jet :', err);
        } finally {
            setRolling(false);
        }
    };

    const footer = result ? (
        <>
            {npc && sessionId && result.excedent > 0 && (
                <button type="button" className="vtt-btn" disabled={threatPaid}
                        onClick={() => { updateResource('menace', result.excedent); setThreatPaid(true); }}>
                    {threatPaid ? `Menace +${result.excedent} versée` : `Verser l'excédent en Menace (+${result.excedent})`}
                </button>
            )}
            <button type="button" className="vtt-btn" onClick={() => setResult(null)}>
                <DuneIcon name="reroll" className="dn-ico w-4 h-4" />Nouveau jet
            </button>
            <button type="button" className="vtt-btn vtt-btn-primary" onClick={onClose}>Fermer</button>
        </>
    ) : (
        <>
            <button type="button" className="vtt-btn" onClick={onClose}>Annuler</button>
            <button type="button" className="vtt-btn vtt-btn-primary" onClick={handleRoll} disabled={rolling || tooExpensive}>
                <DuneIcon name="d20" className="dn-ico w-4 h-4" />{rolling ? 'Lancement…' : <>Lancer <span className="normal-case">{nbDes}d20</span></>}
            </button>
        </>
    );

    return (
        <Modal onClose={onClose} title="Jet du meneur" subtitle={initialLabel ?? `Seuil ${rang} · difficulté ${difficulte}`}
               icon={<DuneIcon name="d20" className="dn-ico w-7 h-7" />} size="md" footer={footer}>
            {result ? (
                <div className="flex flex-col gap-4">
                    <div className={`dn-verdict${result.reussite ? '' : ' is-fail'}`}>
                        <strong>{result.reussite ? 'Réussite' : 'Échec'}</strong>
                        <span>{result.succes} succès sur {result.difficulte}{result.excedent > 0 && ` · excédent ${result.excedent}`}</span>
                    </div>
                    <div className="dn-dice">{result.dice.map((d, i) => <DuneDie key={i} die={d} withLabel />)}</div>
                    {result.complications > 0 && (
                        <div className="dn-callout">{result.complications} complication{result.complications > 1 ? 's' : ''}.</div>
                    )}
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    <div className="dn-pool">
                        <div className="dn-pool-big"><DuneStepper value={rang} min={1} max={MAX_THRESHOLD} label="Seuil" onChange={setRang} /><span>Seuil</span></div>
                        <div className="dn-pool-big"><DuneStepper value={nbDes} min={BASE_DICE} max={MAX_DICE} label="Dés" onChange={setNbDes} /><span>Dés</span></div>
                        <div className="dn-pool-big"><DuneStepper value={difficulte} min={0} max={MAX_DIFFICULTY} label="Difficulté" onChange={setDifficulte} /><span>Difficulté</span></div>
                    </div>
                    {npc && (
                        <p className="dn-callout">
                            {cost > 0
                                ? `${nbDes - BASE_DICE} dé${nbDes - BASE_DICE > 1 ? 's' : ''} en plus : ${cost} Menace${sessionId ? ` (réserve : ${resources.menace})` : ''}${tooExpensive ? ', Menace insuffisante' : ''}.`
                                : 'Dés en plus : payés en Menace (1, puis 2, puis 3).'}
                        </p>
                    )}
                    {npc?.specialisation != null && (
                        <button type="button" className={`dn-switch${specialisation ? ' is-on' : ''}`} onClick={() => setSpecialisation(s => !s)}>
                            <span className="dn-switch-knob" />
                            <span>
                                <b>Spécialisation</b>
                                <small>Chaque dé ≤ {npc.specialisation} (la compétence) compte double.</small>
                            </span>
                        </button>
                    )}
                    <button type="button" className={`dn-switch${broadcast ? ' is-on' : ''}`} onClick={() => setBroadcast(b => !b)}>
                        <span className="dn-switch-knob" />
                        <span>
                            <b>Visible par la table</b>
                            <small>{broadcast ? 'Le jet part dans l’historique et les notifications.' : 'Jet secret : seul le meneur voit le résultat.'}</small>
                        </span>
                    </button>
                </div>
            )}
        </Modal>
    );
};

export default DuneGMRollModal;
