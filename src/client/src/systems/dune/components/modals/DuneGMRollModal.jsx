// src/client/src/systems/dune/components/modals/DuneGMRollModal.jsx
// Jet du MJ (spec_dune.md §2.4), sur la modale générique, au format de la fenêtre
// du joueur : seuil, difficulté et dés en tête, résultat sur place.
// Même résolution que le joueur (config/rules/roll.js, MJ 2026-11-04) : dé ≤ seuil = 1 succès,
// un 1 = 2 succès, 20 = complication ; pas de spécialisation ni de Détermination.
// Utilisée par la bande du MJ et par l'onglet PNJ (props initialRang, initialLabel).

import React, { useState } from 'react';
import Modal from '../../../../components/ui/Modal.jsx';
import { roll, RollError } from '../../../../tools/diceEngine.js';
import { useFetch }  from '../../../../hooks/useFetch.js';
import { useSystem } from '../../../../hooks/useSystem.js';
import DuneIcon from '../ui/DuneIcon.jsx';
import DuneDie  from '../ui/DuneDie.jsx';
import { DuneStepper } from '../ui/DuneFields.jsx';
import { BASE_DICE, MAX_DICE, MAX_DIFFICULTY, resolveRoll } from '../../config/rules/roll.js';

const MAX_THRESHOLD = 20;

// Hooks du moteur pour le jet du MJ
const GM_DICE_HOOKS = {
    buildNotation: (ctx) => `${ctx.systemData.nbDes}d20`,
    beforeRoll: (ctx) => {
        if (ctx.systemData.nbDes < 1) throw new RollError('NO_DICE', 'Aucun dé à lancer');
        return ctx;
    },
    afterRoll: (raw, ctx) => {
        const { rang, difficulte } = ctx.systemData;
        const results = raw.groups[0].values;
        const r = resolveRoll({ values: results, threshold: rang, difficulty: difficulte });
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
 * @param {string}   [props.initialLabel]   ex. « Garde Harkonnen — Combat » (PNJ)
 */
const DuneGMRollModal = ({ onClose, sessionId = null, initialRang = 3, initialLabel = null }) => {
    const fetchWithAuth = useFetch();
    const { apiBase }   = useSystem();
    const [rang, setRang]             = useState(initialRang);
    const [difficulte, setDifficulte] = useState(1);
    const [nbDes, setNbDes]           = useState(BASE_DICE);
    const [broadcast, setBroadcast]   = useState(false);
    const [rolling, setRolling]       = useState(false);
    const [result, setResult]         = useState(null);

    const label = initialLabel ?? `Meneur — ${nbDes}d20`;

    const handleRoll = async () => {
        if (rolling) return;
        setRolling(true);
        try {
            const ctx = {
                apiBase, fetchFn: fetchWithAuth, characterId: null, characterName: 'Meneur', sessionId,
                rollType: 'dune_gm_2d20', label, persistHistory: broadcast,
                systemData: { nbDes, rang, difficulte },
            };
            setResult(await roll(GM_DICE_HOOKS.buildNotation(ctx), ctx, GM_DICE_HOOKS));
        } catch (err) {
            console.error('[DuneGMRollModal] jet :', err);
        } finally {
            setRolling(false);
        }
    };

    const footer = result ? (
        <>
            <button type="button" className="vtt-btn" onClick={() => setResult(null)}>
                <DuneIcon name="reroll" className="dn-ico w-4 h-4" />Nouveau jet
            </button>
            <button type="button" className="vtt-btn vtt-btn-primary" onClick={onClose}>Fermer</button>
        </>
    ) : (
        <>
            <button type="button" className="vtt-btn" onClick={onClose}>Annuler</button>
            <button type="button" className="vtt-btn vtt-btn-primary" onClick={handleRoll} disabled={rolling}>
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
