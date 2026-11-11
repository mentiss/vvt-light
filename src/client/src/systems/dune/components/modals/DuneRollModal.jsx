// src/client/src/systems/dune/components/modals/DuneRollModal.jsx
// Fenêtre de test 2D20 du joueur, sur un seul écran (spec_dune.md §6.2, planche §4) :
// réserve et difficulté en tête, principe et compétence, spécialisation, dépenses
// (Impulsion, Menace, Détermination), puis le résultat dans la même fenêtre.
// Le jet passe par le hook useDuneRoll ; les règles par config/rules/roll.js.

import React, { useState } from 'react';
import Modal from '@/ui/modal/Modal.jsx';
import DuneIcon from '../ui/DuneIcon.jsx';
import DuneDie from '../ui/DuneDie.jsx';
import { useDuneRoll } from '../../hooks/useDuneRoll.js';
import { COMPETENCES, PRINCIPES, traitLabel, characterFullName } from '../../config/traits.js';
import { BASE_DICE, MAX_DICE, MAX_DIFFICULTY, impulsionCost, poolSize, impulsionGain } from '../../config/rules/roll.js';

// Sous-composant : rangée de pills d'un groupe de traits
const TraitPills = ({ title, traits, entries, selectedKey, onSelect }) => (
    <div>
        <div className="dn-group-title">{title}</div>
        <div className="flex flex-wrap gap-1.5">
            {traits.map(({ key }) => {
                const entry = entries.find(e => e.key === key);
                return (
                    <button key={key} type="button" onClick={() => onSelect(key)}
                            className={`vtt-pill${selectedKey === key ? ' is-selected' : ''}`}>
                        {traitLabel(key)} <b>{entry?.rang ?? 0}</b>
                    </button>
                );
            })}
        </div>
    </div>
);

/**
 * @param {object}   props.character
 * @param {{ type: 'competence'|'principe', key: string }|null} props.preselect  ligne cliquée sur la fiche
 * @param {Function} props.onClose
 * @param {Function} props.onCharacterUpdate
 * @param {{ impulsions: number, menace: number }} props.sessionResources
 */
const DuneRollModal = ({ character, preselect = null, onClose, onCharacterUpdate, sessionResources }) => {
    const { rollTest, addExcessToImpulsion, rolling } = useDuneRoll(character, onCharacterUpdate);
    const competences = character.competences ?? [];
    const principes   = character.principes   ?? [];

    const [competenceKey, setCompetenceKey] = useState(preselect?.type === 'competence' ? preselect.key : null);
    const [principeKey,   setPrincipeKey]   = useState(preselect?.type === 'principe'   ? preselect.key : null);
    const [difficulty,    setDifficulty]    = useState(1);
    const [useSpecialisation, setUseSpecialisation] = useState(false);
    const [impulsionDice, setImpulsionDice] = useState(0);
    const [threatDice,    setThreatDice]    = useState(0);
    const [useDetermination, setUseDetermination] = useState(false);
    const [result,        setResult]        = useState(null);
    const [impulsionAdded, setImpulsionAdded] = useState(null);

    const competence = competences.find(c => c.key === competenceKey) ?? null;
    const principe   = principes.find(p => p.key === principeKey) ?? null;
    const threshold  = (competence?.rang ?? 0) + (principe?.rang ?? 0);
    const specialisation = competence?.specialisation?.trim() ?? '';
    const dice       = poolSize(impulsionDice, threatDice);
    const available  = sessionResources?.impulsions ?? 0;
    const determination = character.determination ?? 0;
    const ready      = !!principe;   // un principe peut être lancé seul, la compétence est facultative

    // Un second clic sur la compétence choisie la retire
    const selectCompetence = (key) => {
        setCompetenceKey(k => (k === key ? null : key));
        setUseSpecialisation(false);   // la spécialisation dépend de la compétence
    };

    const handleRoll = async () => {
        const res = await rollTest({
            competence, principe, useSpecialisation: useSpecialisation && !!specialisation, difficulty,
            impulsionDice, threatDice, useDetermination,
        });
        if (res) { setResult(res); setImpulsionAdded(null); }
    };

    const handleAddImpulsion = () => {
        setImpulsionAdded(addExcessToImpulsion(result.excedent, available));
    };

    const resetForNewRoll = () => {
        setResult(null);
        setImpulsionDice(0);
        setThreatDice(0);
        setUseDetermination(false);
    };

    // « Combat 8 + Foi 8 », ou le principe seul
    const poolLabel = [competence, principe].filter(Boolean).map(t => `${traitLabel(t.key)} ${t.rang}`);
    const subtitle = result
        ? `${poolLabel.join(' + ')} · difficulté ${difficulty}`
        : characterFullName(character);

    const footer = result ? (
        <>
            <button type="button" className="vtt-btn" onClick={resetForNewRoll}>
                <DuneIcon name="reroll" className="dn-ico w-4 h-4" />Nouveau jet
            </button>
            <button type="button" className="vtt-btn vtt-btn-primary" onClick={onClose}>Fermer</button>
        </>
    ) : (
        <>
            <button type="button" className="vtt-btn" onClick={onClose}>Annuler</button>
            <button type="button" className="vtt-btn vtt-btn-primary" onClick={handleRoll} disabled={!ready || rolling}>
                <DuneIcon name="d20" className="dn-ico w-4 h-4" />{rolling ? 'Lancement…' : <>Lancer <span className="normal-case">{dice}d20</span></>}
            </button>
        </>
    );

    return (
        <Modal onClose={onClose} title="Test de compétence" subtitle={subtitle}
               icon={<DuneIcon name="d20" className="dn-ico w-7 h-7" />} size="lg" footer={footer}>
            {result ? (
                /* ── Résultat ─────────────────────────────────────────────── */
                <div className="flex flex-col gap-4">
                    <div className={`dn-verdict${result.reussite ? '' : ' is-fail'}`}>
                        <strong>{result.reussite ? 'Réussite' : 'Échec'}</strong>
                        <span>
                            {result.succes} succès sur {result.difficulte}
                            {result.excedent > 0 && ` · excédent ${result.excedent}`}
                        </span>
                    </div>
                    <div className="dn-dice">
                        {(result.dice ?? []).map((d, i) => <DuneDie key={i} die={d} withLabel />)}
                    </div>
                    {result.complications > 0 && (
                        <div className="dn-callout">
                            {result.complications} complication{result.complications > 1 ? 's' : ''}, transmise{result.complications > 1 ? 's' : ''} au meneur.
                        </div>
                    )}
                    {result.reussite && result.excedent > 0 && (
                        <div className="flex flex-col items-center gap-2">
                            {impulsionAdded === null ? (
                                <button type="button" className="vtt-btn vtt-btn-primary" onClick={handleAddImpulsion}
                                        disabled={impulsionGain(result.excedent, available) === 0}>
                                    <DuneIcon name="spice" className="dn-ico w-4 h-4" />
                                    Verser {impulsionGain(result.excedent, available)} Impulsion
                                </button>
                            ) : (
                                <p className="dn-group-title">{impulsionAdded} Impulsion versée{impulsionAdded > 1 ? 's' : ''} à la réserve</p>
                            )}
                            {impulsionAdded === null && impulsionGain(result.excedent, available) < result.excedent && (
                                <p className="text-sm text-muted">
                                    Excédent {result.excedent}, mais la réserve est à {available} sur 6 : seuls {impulsionGain(result.excedent, available)} points entrent.
                                </p>
                            )}
                        </div>
                    )}
                </div>
            ) : (
                /* ── Préparation ──────────────────────────────────────────── */
                <div className="flex flex-col gap-4">
                    <div className="dn-pool">
                        <div className="dn-pool-eq">
                            {ready
                                ? poolLabel.map((l, i) => <React.Fragment key={l}>{i > 0 && ' + '}<b>{l}</b></React.Fragment>)
                                : 'Choisissez un principe, et une compétence si elle s’applique'}
                            {competence && useSpecialisation && specialisation && <><br />Spécialisation : dés ≤ {competence.rang} comptent double</>}
                        </div>
                        <div className="dn-pool-big"><strong>{ready ? threshold : '—'}</strong><span>Seuil</span></div>
                        <div className="dn-pool-big"><strong>{dice}<small>/{MAX_DICE}</small></strong><span>Dés</span></div>
                        <div className="dn-pool-big">
                            <div className="dn-stepper">
                                <button type="button" onClick={() => setDifficulty(d => Math.max(0, d - 1))} disabled={difficulty <= 0} aria-label="Difficulté −1">
                                    <DuneIcon name="minus" className="dn-ico w-3.5 h-3.5" />
                                </button>
                                <b>{difficulty}</b>
                                <button type="button" onClick={() => setDifficulty(d => Math.min(MAX_DIFFICULTY, d + 1))} disabled={difficulty >= MAX_DIFFICULTY} aria-label="Difficulté +1">
                                    <DuneIcon name="plus" className="dn-ico w-3.5 h-3.5" />
                                </button>
                            </div>
                            <span>Difficulté</span>
                        </div>
                    </div>

                    <TraitPills title="Principe" traits={PRINCIPES} entries={principes} selectedKey={principeKey} onSelect={setPrincipeKey} />
                    <TraitPills title="Compétence · facultative" traits={COMPETENCES} entries={competences} selectedKey={competenceKey} onSelect={selectCompetence} />

                    {specialisation && (
                        <button type="button" className={`dn-switch${useSpecialisation ? ' is-on' : ''}`}
                                onClick={() => setUseSpecialisation(v => !v)}>
                            <span className="dn-switch-knob" />
                            <span>
                                <b>Spécialisation « {specialisation} »</b>
                                <small>Elle s'applique à l'action : les dés ≤ {competence.rang} comptent pour 2 succès.</small>
                            </span>
                        </button>
                    )}

                    <div>
                        <div className="dn-group-title">Dépenses</div>
                        <div className="dn-spend">
                            <div>
                                <span className="vtt-field-label block mb-1.5">Impulsion · {available} en réserve</span>
                                <div className="dn-seg">
                                    {[0, 1, 2, 3].map(n => {
                                        const affordable = impulsionCost(n) <= available;
                                        const fits = BASE_DICE + n + threatDice <= MAX_DICE;
                                        return (
                                            <button key={n} type="button" onClick={() => setImpulsionDice(n)}
                                                    disabled={n > 0 && (!affordable || !fits)}
                                                    className={impulsionDice === n ? 'is-selected' : ''}>
                                                {n === 0 ? '0' : `+${n}`}
                                                {n > 0 && <small>{impulsionCost(n)} pt{impulsionCost(n) > 1 ? 's' : ''}</small>}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                            <div>
                                <span className="vtt-field-label block mb-1.5">Menace générée</span>
                                <div className="dn-stepper">
                                    <button type="button" onClick={() => setThreatDice(t => Math.max(0, t - 1))} disabled={threatDice <= 0} aria-label="Menace −1">
                                        <DuneIcon name="minus" className="dn-ico w-3.5 h-3.5" />
                                    </button>
                                    <b>{threatDice}</b>
                                    <button type="button" onClick={() => setThreatDice(t => t + 1)} disabled={dice >= MAX_DICE} aria-label="Menace +1">
                                        <DuneIcon name="plus" className="dn-ico w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                            <div>
                                <span className="vtt-field-label block mb-1.5">Détermination · {determination}</span>
                                <button type="button" className={`dn-switch is-ibad is-compact${useDetermination ? ' is-on' : ''}`}
                                        onClick={() => setUseDetermination(v => !v)} disabled={determination <= 0}>
                                    <span className="dn-switch-knob" />
                                    <span className="text-sm">Un dé sur 1</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Modal>
    );
};

export default DuneRollModal;
