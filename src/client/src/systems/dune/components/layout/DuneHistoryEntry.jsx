// src/client/src/systems/dune/components/layout/DuneHistoryEntry.jsx
// Rendu d'une entrée d'historique Dune : onglet, panneau et notifications (même rendu,
// sans marge extérieure). Reçoit un objet roll de dice_history (roll_result parsé).
// Planche documentations/dune/planche_dune.html §6.
//
// Jets d'avant la refonte : pas de roll_result.dice → dés reconstruits depuis results.

import React from 'react';
import { parseFreeRoll } from '@/features/dice/tools/freeRoll.js';
import DuneDie from '../ui/DuneDie.jsx';
import { resolveDie } from '../../config/rules/roll.js';

// Jet libre (FreeDiceModal) : libellé, total, dés neutres par type
// (le nom du lanceur et la date sont portés par la plateforme)
const FreeRollEntry = ({ free }) => (
    <div>
        <div className="dn-hist-head"><span>{free.label}</span><span>= {free.total}</span></div>
        <div className="dn-hist-row">
            {free.groups.map((g, gi) => (
                <React.Fragment key={gi}>
                    <span className="dn-hist-notation">{g.notation}</span>
                    {g.values.map((v, i) => <DuneDie key={i} die={{ value: v }} small />)}
                </React.Fragment>
            ))}
            {free.modifier !== 0 && <span className="dn-hist-notation">{free.modifier > 0 ? '+' : ''}{free.modifier}</span>}
        </div>
    </div>
);

// Dés d'un ancien jet : seuil, spécialisation choisie, un 1 compte double
const legacyDice = (r) => {
    const specialisationThreshold = r.hasSpec && r.selectedSpecialization ? (r.rang ?? 0) : 0;
    return (r.results ?? []).map(value => ({ value, forced: false, ...resolveDie(value, { threshold: r.rang ?? 0, specialisationThreshold }) }));
};

/**
 * @param {object} props.roll - Entrée dice_history (roll_result déjà parsé)
 */
const DuneHistoryEntry = ({ roll }) => {
    const free = parseFreeRoll(roll);
    if (free) return <FreeRollEntry free={free} />;

    const r          = roll.roll_result ?? {};
    const dice       = Array.isArray(r.dice) ? r.dice : legacyDice(r);
    const succes     = r.succes ?? r.successes ?? 0;
    const difficulte = r.difficulte ?? 1;
    const reussite   = r.reussite ?? (succes >= difficulte);
    const excedent   = Math.max(0, succes - difficulte);

    return (
        <div>
            <div className="dn-hist-label">
                {r.label ?? roll.label}
                {r.rang != null && ` · seuil ${r.rang}`} · difficulté {difficulte}
                {r.selectedSpecialization && r.hasSpec && ' · spécialisation'}
            </div>
            <div className="dn-hist-row">
                {dice.map((d, i) => <DuneDie key={i} die={d} small />)}
                <span className={`dn-hist-sum${reussite ? '' : ' is-fail'}`}>
                    {reussite ? 'Réussite' : 'Échec'} · {succes}
                </span>
            </div>
            {(excedent > 0 || r.complications > 0 || r.impulsionsDepensees > 0 || r.menaceGeneree > 0 || r.useDetermination) && (
                <div className="dn-hist-meta">
                    {excedent > 0 && <span>Excédent {excedent}</span>}
                    {r.complications > 0 && <span className="text-danger">{r.complications} complication{r.complications > 1 ? 's' : ''}</span>}
                    {r.impulsionsDepensees > 0 && <span>{r.impulsionsDepensees} dé{r.impulsionsDepensees > 1 ? 's' : ''} d'Impulsion</span>}
                    {r.menaceGeneree > 0 && <span>+{r.menaceGeneree} Menace</span>}
                    {r.useDetermination && <span className="text-accent">Détermination</span>}
                </div>
            )}
        </div>
    );
};

export default DuneHistoryEntry;
