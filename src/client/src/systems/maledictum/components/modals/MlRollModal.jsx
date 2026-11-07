// src/client/src/systems/maledictum/components/modals/MlRollModal.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Fenêtre de jet (spec_maledictum.md §11.2) : seuil en tête, Difficulté, Avantage /
// Désavantage, DR ajoutés après le jet (Supériorité du groupe, Influence, talents) ;
// attaque : défense de la cible (opposée, esquive), dégâts ; pouvoir : Forcer,
// Charge Warp reportée sur la fiche ; tirage sur table (Mutation, Malignité…).
// Après le jet : le rendu de l'historique, et le Destin (relancer, +1 DR).
//
// Props : c, asked { mode, label, base, damage, ranged, power, tableKey, purge },
//         patron, sessionId, act, theme, onClose
// ─────────────────────────────────────────────────────────────────────────────

import React, { useMemo, useState } from 'react';
import Modal from '../../../../components/ui/Modal.jsx';
import { DIFFICULTIES } from '../../config/tables.js';
import { charBonus, displayName, derived } from '../../config/rules/character.js';
import { applySlBonus, slBand, formatSl, signed, edgeTargetBonus, overWarpThreshold } from '../../config/rules/dice.js';
import { useMlRoll } from '../../hooks/useMlRoll.js';
import MlHistoryEntry from '../layout/MlHistoryEntry.jsx';
import { Pill, Pills, Stepper, Toggle, Field } from '../ui/MlUi.jsx';
import { factionLabel } from '../layout/MlSections.jsx';

const EDGE_LABEL = (e) => (e > 0 ? `Avantage ×${e}` : e < 0 ? `Désavantage ×${-e}` : 'Aucun');
const TABLE_FIELD = { mutation: 'mutations', malignancy: 'malignancies' };

const MlRollModal = ({ c, asked, patron, sessionId, act, theme, onClose }) => {
    const mode = asked.mode;
    const d = useMemo(() => derived(c), [c]);
    const power = asked.power ?? null;
    const [difficulty, setDifficulty] = useState(asked.purge ? 0 : (power?.difficulty ?? 0));
    const [edge, setEdge] = useState(0);
    const [extraSl, setExtraSl] = useState(0);
    const [useSuperiority, setUseSuperiority] = useState(false);
    const [influenceKey, setInfluenceKey] = useState(null);
    const [opposed, setOpposed] = useState(mode === 'attack' && !asked.ranged);
    const [opposedSl, setOpposedSl] = useState(0);
    const [burst, setBurst] = useState(false);
    const [push, setPush] = useState(false);
    const [result, setResult] = useState(null);
    const [fateSl, setFateSl] = useState(0);
    const { launch, rolling, error, entry } = useMlRoll();

    const superiority = patron?.superiorityEnabled === false ? 0 : Number(patron?.superiority) || 0;   // désactivée à la table : rien
    const influence = Object.entries(c.influence ?? {}).filter(([, v]) => v !== 0);
    const target = Math.max(0, Number(asked.base ?? 0) + Number(difficulty));
    const burstTrait = (asked.item?.data?.traits ?? []).some(t => ['burst', 'rapid_fire'].includes(t?.key ?? t));
    const slBonus = extraSl + (useSuperiority ? superiority : 0) + (influenceKey ? Number(c.influence?.[influenceKey]) || 0 : 0) + (burst ? 1 : 0);

    const roll = async (reroll = false) => {
        const label = `${asked.label}${reroll ? ' (relance)' : ''}`;
        const common = { characterId: c.id, characterName: displayName(c), sessionId, label };
        let r;
        if (mode === 'table') {
            r = await launch({ ...common, type: 'table', systemData: { tableKey: asked.tableKey, bonus: asked.bonus ?? 0, theme } });
        } else if (mode === 'attack') {
            r = await launch({ ...common, type: 'attack', systemData: {
                target, edge, slBonus, difficulty, base: asked.base, damage: asked.damage, ranged: !!asked.ranged, weapon: asked.weapon,
                opposedSl: opposed ? opposedSl : null, theme, note: burst ? 'Rafale (+1 DR, 1 munition)' : null,
            } });
        } else if (mode === 'power') {
            r = await launch({ ...common, type: 'power', systemData: {
                target, edge, slBonus, difficulty, base: asked.base, warpRating: power.warpRating, wilB: charBonus(c, 'wil'), push, power: power.key, theme,
            } });
            if (r) act.setWarpCharge((Number(c.warpCharge) || 0) + r.charge);
        } else {
            r = await launch({ ...common, type: 'test', systemData: { target, edge, slBonus, difficulty, base: asked.base, theme } });
        }
        if (r) { setResult(r); setFateSl(0); }
    };

    const rerollWithFate = () => { act.spendFate(); roll(true); };
    const plusOneWithFate = () => { act.spendFate(); setFateSl(n => n + 1); };
    const adjusted = result && fateSl ? applySlBonus(result, fateSl) : result;

    const purgeAmount = asked.purge && adjusted?.success ? Math.min(Number(c.warpCharge) || 0, charBonus(c, 'wil') + adjusted.sl) : 0;

    const footer = result ? (
        <>
            {mode !== 'table' && Number(c.fate) > 0 && !adjusted.success && <button type="button" className="vtt-btn" onClick={rerollWithFate} disabled={rolling}>Relancer · 1 Destin</button>}
            {mode !== 'table' && Number(c.fate) > 0 && <button type="button" className="vtt-btn" onClick={plusOneWithFate}>+1 DR · 1 Destin</button>}
            <button type="button" className="vtt-btn vtt-btn-primary" onClick={onClose}>Fermer</button>
        </>
    ) : (
        <>
            <button type="button" className="vtt-btn" onClick={onClose}>Annuler</button>
            <button type="button" className="vtt-btn vtt-btn-primary" onClick={() => roll(false)} disabled={rolling}>
                {rolling ? 'Lancer…' : mode === 'power' && push ? 'Lancer le d100 et le d10' : 'Lancer le d100'}
            </button>
        </>
    );

    return (
        <Modal title={asked.label} subtitle={`${displayName(c)} · ${mode === 'table' ? 'table d100' : 'd100'}`} onClose={onClose} footer={footer} size="md">
            {!result && mode !== 'table' && (
                <div className="im-roll-form">
                    <div className="im-target">
                        <div><b className="im-label-sm">Seuil</b><br /><small>{asked.label} {asked.base}{difficulty ? ` ${signed(difficulty)}` : ''}{edgeTargetBonus(edge) ? ` ${signed(edgeTargetBonus(edge))} (Avantages en plus)` : ''}</small></div>
                        <span className="im-target-val">{target + edgeTargetBonus(edge)}</span>
                    </div>
                    <Field label="Difficulté">
                        <Pills>
                            {DIFFICULTIES.map(df => (
                                <Pill key={df.key} on={difficulty === df.modifier} onClick={() => setDifficulty(df.modifier)} title={df.example}>
                                    {df.label} {signed(df.modifier)}
                                </Pill>
                            ))}
                        </Pills>
                    </Field>
                    <Field label="Avantage / Désavantage">
                        <Stepper value={edge} onChange={setEdge} min={-3} max={3} label={signed(edge)} text={EDGE_LABEL(edge)} />
                    </Field>
                    {mode === 'attack' && (
                        <Field label={asked.ranged ? 'Défense de la cible' : 'Mêlée : attaque opposée'}>
                            <Toggle on={opposed} onChange={setOpposed}>{asked.ranged ? 'La cible esquive (Réflexes (Esquive))' : 'La cible se défend (test opposé)'}</Toggle>
                            {opposed && <Stepper value={opposedSl} onChange={setOpposedSl} min={-10} max={10} label={signed(opposedSl)} text="DR de la cible" />}
                            {burstTrait && asked.ranged && <Toggle on={burst} onChange={setBurst}>Rafale : +1 DR (1 munition)</Toggle>}
                            <small className="im-note">Dégâts de base {asked.damage} {opposed ? '+ écart de DR' : '+ DR'} ; double réussi : Critique.</small>
                        </Field>
                    )}
                    {mode === 'power' && (
                        <Field label="Pouvoir">
                            <small className="im-note">Indice Warp {power.warpRating} · Charge actuelle {c.warpCharge ?? 0} / seuil {d.warpThreshold}{power.summary ? ` — ${power.summary}` : ''}</small>
                            <Toggle on={push} onChange={setPush}>Forcer : Avantage, mais +1d10 de Charge Warp (Maladresse : Périls)</Toggle>
                        </Field>
                    )}
                    <Field label="Après le jet">
                        {superiority > 0 && <Toggle on={useSuperiority} onChange={setUseSuperiority}>Supériorité du groupe (+{superiority} DR, une fois par tour)</Toggle>}
                        {influence.length > 0 && (
                            <Pills>
                                <span className="im-note">Influence (test social) :</span>
                                {influence.map(([f, v]) => (
                                    <Pill key={f} on={influenceKey === f} onClick={() => setInfluenceKey(influenceKey === f ? null : f)}>{factionLabel(f)} {signed(v)}</Pill>
                                ))}
                            </Pills>
                        )}
                        <Stepper value={extraSl} onChange={setExtraSl} min={-6} max={6} label={signed(extraSl)} text="Autres DR (talents…)" />
                    </Field>
                </div>
            )}
            {!result && mode === 'table' && <p className="im-note">Un d100 sur la table des {asked.label === 'Mutation' ? 'Mutations' : asked.label === 'Malignité' ? 'Malignités' : asked.label}.</p>}
            {error && <p className="im-alert">{error}</p>}
            {result && entry && (
                <div className="im-roll-result">
                    <div className="vtt-history-entry"><MlHistoryEntry roll={entry} /></div>
                    {fateSl > 0 && (
                        <p className="im-alert is-info">Destin : {signed(fateSl)} DR → <b>{formatSl(adjusted.sl, adjusted.success)} DR</b>, {slBand(adjusted.sl, adjusted.success)}.</p>
                    )}
                    {mode === 'power' && (
                        <p className={`im-alert${overWarpThreshold((Number(c.warpCharge) || 0), d.warpThreshold) ? '' : ' is-info'}`}>
                            Charge Warp reportée sur la fiche : {c.warpCharge ?? 0} / seuil {d.warpThreshold}.
                            {result.perils && ' Périls du Warp : tirez sur la table des Périls.'}
                        </p>
                    )}
                    {mode === 'power' && (result.perils || overWarpThreshold(Number(c.warpCharge) || 0, d.warpThreshold)) && (
                        <button type="button" className="vtt-btn vtt-btn-sm" onClick={() => act.ask('roll', { mode: 'table', tableKey: 'perils', label: 'Périls du Warp', bonus: Math.max(0, (Number(c.warpCharge) || 0) - d.warpThreshold) * 10 })}>Tirer les Périls du Warp</button>
                    )}
                    {mode === 'attack' && result.fumble && (
                        <button type="button" className="vtt-btn vtt-btn-sm" onClick={() => act.ask('d10', { tableKey: 'fumble', label: 'Maladresse' })}>Tirer la Maladresse (d10)</button>
                    )}
                    {asked.purge && (
                        adjusted.success ? (
                            <div className="im-row">
                                <span className="im-note">Purge : jusqu'à {charBonus(c, 'wil') + adjusted.sl} de Charge retirée ({purgeAmount} possible), puis un Phénomène psychique (+10 par point retiré).</span>
                                <button type="button" className="vtt-btn vtt-btn-sm" onClick={() => { act.setWarpCharge((Number(c.warpCharge) || 0) - purgeAmount); act.ask('roll', { mode: 'table', tableKey: 'phenomena', label: 'Phénomène psychique', bonus: purgeAmount * 10 }); }}>
                                    Retirer {purgeAmount} et tirer le Phénomène
                                </button>
                            </div>
                        ) : <p className="im-note">Purge ratée : la Charge Warp reste.</p>
                    )}
                    {mode === 'table' && TABLE_FIELD[asked.tableKey] && result.entry && (
                        <button type="button" className="vtt-btn vtt-btn-sm vtt-btn-primary"
                                onClick={() => { act.addListEntry(TABLE_FIELD[asked.tableKey], result.entry.label); onClose(); }}>
                            Ajouter « {result.entry.label} » à la fiche
                        </button>
                    )}
                    {mode === 'table' && result.entry?.summary && <p className="im-note">{result.entry.summary}</p>}
                </div>
            )}
        </Modal>
    );
};

export default MlRollModal;
