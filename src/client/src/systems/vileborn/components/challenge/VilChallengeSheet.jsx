// src/client/src/systems/vileborn/components/challenge/VilChallengeSheet.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Fiche de défi (spec_vileborn_defis.md §II.5, planche vileborn/planche_defis.html),
// en deux modes :
//   - play : défi en cours (piste cochable, base de difficulté, ajustements en
//     jeu, complications appliquées à un Paria, dé d'obscurité, notes) ;
//   - read : fiche de la bibliothèque (lecture, difficultés pour une base Normale).
// Les actions (barre en tête) sont fournies par l'onglet.
//
// Props : sheet, mode ('play' | 'read'), actions (nœud de la barre d'actions)
//   play seulement : progress, adjust, notes, base, onBase(n), onProgress(n),
//   onAdjust(adjust), onNotes(text), onEffect(effectKey, anchorEl), onDark(),
//   trigger (déclencheur mis en avant ou null), onCloseTrigger()
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { APPROACHES } from '../../config/approaches.js';
import { DIFFICULTIES, DEFAULT_DIFFICULTY } from '../../config/rules/test.js';
import { familyLabel, sourceLabel, effectLabel } from '../../config/challenges.js';
import { finalDifficulty, triggerAt, darkActive, isDone, MAX_SHIFT } from '../../config/rules/challenge.js';
import { VilLabel, VilPill } from '../ui/VilUi.jsx';

const signed = (n) => (n > 0 ? `+${n}` : n < 0 ? `−${-n}` : '0');

/** Piste de progression : cases cliquables en jeu, cases à déclencheur en rouge */
const Track = ({ sheet, progress, onProgress }) => (
    <div className="vil-ch-track">
        {Array.from({ length: sheet.track }, (_, i) => {
            const box = i + 1;
            const cls = `vil-ch-box${box <= progress ? ' is-on' : ''}${triggerAt(sheet, box) ? ' is-trig' : ''}`;
            return onProgress
                ? <button key={box} type="button" className={cls} onClick={() => onProgress(box)} aria-pressed={box <= progress}
                          title={triggerAt(sheet, box) ? 'Case à déclencheur' : undefined}>{box}</button>
                : <span key={box} className={cls}>{box}</span>;
        })}
        {onProgress && isDone(sheet, progress) && <span className="vil-ch-done">Défi surmonté</span>}
    </div>
);

/** Difficulté d'une approche : finale en gros, écart de la fiche, ajustement en jeu (−/+) */
const Difficulty = ({ approach, sheet, adjust, base, onAdjust }) => {
    const shift = sheet.difficulty?.[approach.key] ?? 0;
    const adj = adjust?.[approach.key] ?? 0;
    const set = (v) => onAdjust({ ...adjust, [approach.key]: v });
    return (
        <div className={`vil-ch-diff${adj ? ' is-adjusted' : ''}`}>
            <span>{approach.label}</span>
            <strong>{finalDifficulty(sheet, adjust, approach.key, base)}</strong>
            <small>fiche {signed(shift)}</small>
            {onAdjust && (
                <div className="vil-ch-adj">
                    <button type="button" onClick={() => set(adj - 1)} disabled={adj <= -MAX_SHIFT} aria-label={`${approach.label} : −1 en jeu`}>−</button>
                    {adj ? signed(adj) : 'en jeu'}
                    <button type="button" onClick={() => set(adj + 1)} disabled={adj >= MAX_SHIFT} aria-label={`${approach.label} : +1 en jeu`}>+</button>
                </div>
            )}
        </div>
    );
};

/** Notes du défi en cours : enregistrées en quittant le champ (la fiche est remontée à chaque défi : clé de l'onglet) */
const Notes = ({ notes, onNotes }) => {
    const [text, setText] = useState(notes ?? '');
    return (
        <textarea className="vil-textarea" rows={3} value={text} onChange={e => setText(e.target.value)}
                  onBlur={() => { if (text !== (notes ?? '')) onNotes(text); }} placeholder="Qui a touché Igritte, ce qui a changé…" />
    );
};

const VilChallengeSheet = ({
    sheet, mode = 'read', actions,
    progress = 0, adjust = {}, notes = '', base = DEFAULT_DIFFICULTY,
    onBase, onProgress, onAdjust, onNotes, onEffect, onDark, trigger, onCloseTrigger,
}) => {
    const play = mode === 'play';
    const dark = sheet.dark ?? { when: 'none', rows: [] };
    const shownBase = play ? base : DEFAULT_DIFFICULTY;

    return (
        <section className="vil-ch-card vil-paper">
            {actions && <div className="vil-ch-bar">{actions}</div>}

            <div className="vil-ch-head">
                <div>
                    <div className="vil-ch-kind">{[sheet.kind, `${sourceLabel(sheet.source)}${sheet.page ? `, p. ${sheet.page}` : ''}`].filter(Boolean).join(' · ')}</div>
                    <h2 className="vil-ch-title">{sheet.name}</h2>
                    {sheet.quote && <div className="vil-ch-quote">{sheet.quote}</div>}
                </div>
                <div className="vil-ch-block">
                    <VilLabel align="right">Réussites</VilLabel>
                    <Track sheet={sheet} progress={play ? progress : 0} onProgress={play ? onProgress : null} />
                </div>
            </div>

            {play && trigger && (
                <div className="vil-ch-alert" role="status">
                    <div><b>Déclencheur — case {trigger.box}</b>{trigger.text}</div>
                    <button type="button" onClick={onCloseTrigger} aria-label="Fermer">×</button>
                </div>
            )}
            {sheet.description && <p className="vil-ch-desc">{sheet.description}</p>}

            <div className="vil-ch-grid">
                <div className="vil-ch-block">
                    <VilLabel>Difficulté</VilLabel>
                    {play
                        ? <div className="vil-pills">{DIFFICULTIES.map(d => <VilPill key={d.value} on={base === d.value} onClick={() => onBase(d.value)}>{d.label} {d.value}</VilPill>)}</div>
                        : <p className="vil-note">Difficultés pour une base Normale ({DEFAULT_DIFFICULTY}).</p>}
                    <div className="vil-ch-diffs">
                        {APPROACHES.map(a => <Difficulty key={a.key} approach={a} sheet={sheet} adjust={play ? adjust : {}} base={shownBase} onAdjust={play ? onAdjust : null} />)}
                    </div>
                    {(sheet.resistances?.length > 0 || sheet.vulnerabilities?.length > 0) && (
                        <div className="vil-ch-tags">
                            {(sheet.resistances ?? []).map(r => <span key={`r-${r}`}><span className="vil-sc vil-red">Résistance</span> {r} <span className="vil-note">+1</span></span>)}
                            {(sheet.vulnerabilities ?? []).map(v => <span key={`v-${v}`}><span className="vil-sc vil-red">Vulnérabilité</span> {v} <span className="vil-note">−1</span></span>)}
                        </div>
                    )}

                    <VilLabel>Déclencheurs</VilLabel>
                    <div className="vil-ch-rows">
                        {(sheet.triggers ?? []).length === 0 && <p className="vil-note">Aucun.</p>}
                        {(sheet.triggers ?? []).map(t => (
                            <div key={`${t.box}-${t.text}`} className={`vil-ch-row${play && progress >= t.box ? ' is-reached' : ''}`}>
                                <span className="vil-ch-num">{t.box}</span><span>{t.text}</span>
                            </div>
                        ))}
                    </div>

                    <VilLabel>Complications</VilLabel>
                    <div className="vil-ch-rows">
                        {(sheet.complications ?? []).length === 0 && <p className="vil-note">Aucune.</p>}
                        {(sheet.complications ?? []).map((c, i) => {
                            const label = <>{effectLabel(c.effect)}{c.bookEffect && <em> ({c.bookEffect})</em>}</>;
                            return (
                                // Lignes de texte libre sans identifiant (F-KEY : pas d'id stable), liste figée à l'affichage
                                <div key={i} className="vil-ch-row is-text">
                                    <span>{c.text}</span>
                                    {play
                                        ? <button type="button" className="vil-ch-effect" onClick={e => onEffect(c.effect, e.currentTarget)} title="Appliquer à un Paria">{label}</button>
                                        : <span className="vil-ch-effect">{label}</span>}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="vil-ch-block">
                    <VilLabel>Dé d'obscurité</VilLabel>
                    {dark.when === 'none' ? <p className="vil-note">Pas de dé d'obscurité pour ce défi.</p> : (
                        <>
                            <div className="vil-ch-dark-head">
                                <span className="vil-effect">
                                    {dark.when === 'always' ? 'À chaque test.' : `À chaque test à partir de la case ${dark.fromBox}${play && !darkActive(sheet, progress) ? ' (pas encore atteinte)' : ''}.`}
                                    {dark.threshold ? ` Complication sur ${dark.threshold}+, ou :` : ''}
                                </span>
                                {play && <button type="button" className="vtt-btn vtt-btn-sm vtt-btn-primary" onClick={onDark}>Lancer le d12</button>}
                            </div>
                            <div className="vil-ch-rows">
                                {(dark.rows ?? []).map(r => (
                                    <div key={`${r.min}-${r.text}`} className="vil-ch-row"><span className="vil-ch-num">{r.min}+</span><span>{r.text}</span></div>
                                ))}
                            </div>
                        </>
                    )}

                    <VilLabel>Règles spéciales</VilLabel>
                    {(sheet.rules ?? []).length === 0 && <p className="vil-note">Aucune.</p>}
                    {(sheet.rules ?? []).map(r => <p key={r}>{r}</p>)}
                    {(sheet.familyRules ?? []).length > 0 && (
                        <details className="vil-ch-fam">
                            <summary>Règles communes : {familyLabel(sheet.family)}</summary>
                            {sheet.familyRules.map(r => <p key={r.name}><span className="vil-sc vil-red">{r.name}</span> — {r.text}</p>)}
                        </details>
                    )}

                    {play && (
                        <>
                            <VilLabel>Notes</VilLabel>
                            <Notes notes={notes} onNotes={onNotes} />
                        </>
                    )}
                </div>
            </div>
        </section>
    );
};

export default VilChallengeSheet;
