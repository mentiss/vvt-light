// src/client/src/systems/vileborn/components/layout/VilSections.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Sections de la fiche, partagées par la fiche joueur et la fiche MJ.
// Disposition de la page 1 des prétirés (planche validée) :
//   VilApproaches  arc des six approches (clic = fenêtre de jet, joueur)
//   VilStates      états et blessures (colonne gauche)
//   VilOrigin      origine, mobiles, ressources (colonne droite)
//   VilHeritage    bandeau du bas : don · héritage et pulsion · don
//   VilBonds       liens
// Interactions (lot 2) : `act` vient de useVilActions ; absent → lecture seule.
// Les choix (état coché, devoir, confirmations) remontent par `ask(kind, data)`
// à VilSheet, qui rend les fenêtres à côté de la fiche.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { APPROACHES, STATES, WOUNDS } from '../../config/approaches.js';
import { statePenalty } from '../../config/rules/test.js';
import { mobilesBlocked, checkedStates } from '../../config/rules/character.js';
import { VilLabel, VilCheck, VilTick } from '../ui/VilUi.jsx';
import { runeText } from './VilCircles.jsx';

export const VilApproaches = ({ c, onRoll }) => (
    <div className="vil-approaches">
        {APPROACHES.map(a => {
            const penalty = statePenalty(c, a.key);
            const Box = onRoll ? 'button' : 'div';
            return (
                <Box key={a.key} className="vil-approach" {...(onRoll ? { type: 'button', onClick: () => onRoll(a.key), title: `Lancer ${a.label}` } : {})}>
                    <b>{a.label}</b>
                    <span>d{c[a.field] ?? 6}</span>
                    {penalty < 0 && <small>{penalty}</small>}
                </Box>
            );
        })}
    </div>
);

/** Description d'une blessure : saisie libre, enregistrée en quittant le champ */
const WoundNote = ({ value, onSave }) => {
    const [text, setText] = useState(value ?? '');
    const [prev, setPrev] = useState(value);
    if (prev !== value) { setPrev(value); setText(value ?? ''); }   // mise à jour venue d'ailleurs
    return (
        <input className="vil-wound-note vil-wound-input" value={text} placeholder="Décrivez la blessure"
               onChange={(e) => setText(e.target.value)} onBlur={() => text !== (value ?? '') && onSave(text)} />
    );
};

export const VilStates = ({ c, act, ask }) => (
    <>
        <div>
            <VilLabel>États</VilLabel>
            {STATES.map(s => (
                <div key={s.key} className="vil-row">
                    <VilCheck on={!!c[s.field]} label={s.label}
                              onClick={act ? () => (c[s.field] ? ask('state', s.key) : act.sufferState(s.key)) : undefined} />
                    <span className="vil-name">{s.label}</span>
                    <span className="vil-effect">{s.effect}</span>
                </div>
            ))}
        </div>
        <div>
            <VilLabel>Blessures</VilLabel>
            {WOUNDS.map((w, i) => (
                <div key={w.field} className="vil-row">
                    <VilCheck on={!!c[w.field]} label={`Blessure ${i + 1}`} onClick={act ? () => act.toggleWound(w) : undefined} />
                    {act && c[w.field]
                        ? <WoundNote value={c[w.note]} onSave={(text) => act.setWoundNote(w, text)} />
                        : <span className="vil-wound-note">{c[w.note]}</span>}
                </div>
            ))}
            <div className="vil-row vil-row-out">
                <VilCheck on={!!c.outOfPlay} label="Hors jeu" onClick={act ? act.toggleOutOfPlay : undefined} />
                <span className="vil-name">Hors jeu</span>
                <span className="vil-effect">Vous ne pouvez ni agir ni effectuer de tests.</span>
            </div>
        </div>
    </>
);

export const VilOrigin = ({ c, act, ask }) => {
    const blocked = mobilesBlocked(c);
    // Un mobile se coche une fois (le réinitialiser passe par le mode Édition) ; bloqué, il reste grisé
    const canUse = (checked) => act && !checked && !blocked;
    const takeDuty = () => (checkedStates(c).length ? ask('duty') : act.spendDuty(null));
    return (
        <>
            <div>
                <VilLabel align="right">Origine</VilLabel>
                <div className="vil-name">{c.originName}</div>
                {c.originEffect && <div className="vil-effect">{c.originEffect}</div>}
            </div>
            <div className={blocked ? 'vil-blocked' : undefined} title={blocked ?? undefined}>
                <VilLabel align="right">Mobiles</VilLabel>
                <div className="vil-row">
                    <span><span className="vil-name">Aspiration</span>{c.aspiration ? <> · <i>{c.aspiration}</i></> : null}</span>
                    <VilCheck on={!!c.aspirationChecked} label="Aspiration" onClick={canUse(c.aspirationChecked) ? act.spendAspiration : undefined} />
                    <span className="vil-effect">Cochez pour guérir une blessure.</span>
                </div>
                <div className="vil-row vil-row-gap">
                    <span><span className="vil-name">Devoir</span>{c.duty ? <> · <i>{c.duty}</i></> : null}</span>
                    <VilCheck on={!!c.dutyChecked} label="Devoir" onClick={canUse(c.dutyChecked) ? takeDuty : undefined} />
                    <span className="vil-effect">Cochez pour guérir un état.</span>
                </div>
                {blocked && act && <div className="vil-effect vil-red">{blocked}</div>}
            </div>
            <div>
                <VilLabel align="right">Ressources</VilLabel>
                {(c.resources ?? []).map(r => (
                    <div key={r.id ?? r.name} className="vil-resource">
                        <div className="vil-name">{r.name}</div>
                        {r.effect && <div className="vil-effect">{r.effect}</div>}
                    </div>
                ))}
            </div>
        </>
    );
};

const Gift = ({ g, onToggle }) => (
    <div className={g?.checked ? 'vil-gift is-on' : 'vil-gift'}>
        <VilLabel align="center">Don</VilLabel>
        {g ? (
            <>
                <div className="vil-gift-title">{g.name}</div>
                <div className="vil-ticks"><VilTick on={g.checked} label={g.checked ? `Décocher ${g.name}` : `Cocher ${g.name}`} onClick={onToggle} /></div>
                <p>{g.effect}</p>
                {g.drawback && <p><i className="vil-red">Cependant,</i> {g.drawback}</p>}
            </>
        ) : <div className="vil-ticks"><VilTick /></div>}
    </div>
);

export const VilHeritage = ({ c, act, ask }) => {
    const gifts = c.gifts ?? [];
    const ticks = c.heritageTicks ?? 0;
    return (
        <>
            <div className="vil-arc" aria-hidden="true">
                <svg viewBox="0 0 1000 70" preserveAspectRatio="none">
                    <path id="vil-arc-path" className="line" d="M0 68 Q500 -12 1000 68" />
                    <text className="runes"><textPath href="#vil-arc-path" startOffset="2%">{runeText(140, 2)}</textPath></text>
                </svg>
            </div>
            <div className="vil-band">
                <Gift g={gifts[0]} onToggle={act ? () => act.toggleGift(0) : undefined} />
                <div>
                    <div className="vil-heritage-name">{c.heritageName}</div>
                    <div className="vil-ticks">
                        {[1, 2, 3].map(n => <VilTick key={n} on={ticks >= n} label={`Coche ${n}`} onClick={act ? () => act.setTicks(n) : undefined} />)}
                    </div>
                    <p>Effectuez un <span className="vil-sc">test</span> et explorez votre <span className="vil-sc">sombre héritage</span>. Ajoutez un d12 à votre réserve : avec un résultat de 9+ à la première coche, 6+ à la deuxième et 3+ à la troisième, vous serez aussi confronté à une <span className="vil-sc">complication</span>.</p>
                    {c.heritageExamples && <p className="vil-effect">Exemples : {c.heritageExamples}</p>}
                    <div className="vil-mt"><VilLabel align="center">Pulsion</VilLabel></div>
                    <div className="vil-gift-title">{c.urge}</div>
                    <p>Quand vous le faites, retirez toutes les coches de votre <span className="vil-sc">sombre héritage</span> et de vos <span className="vil-sc">dons</span>.</p>
                    {act && (
                        <div className="vil-band-actions">
                            <button type="button" className="vtt-btn vtt-btn-sm" onClick={() => ask('urge')}>Céder à la pulsion</button>
                            <button type="button" className="vtt-btn vtt-btn-sm vtt-btn-primary" onClick={() => ask('reverie')}>Consommer la Rêverie</button>
                        </div>
                    )}
                </div>
                <Gift g={gifts[1]} onToggle={act ? () => act.toggleGift(1) : undefined} />
            </div>
        </>
    );
};

const LEVELS = [{ value: -1, label: '−1' }, { value: 0, label: '0' }, { value: 1, label: '+1' }];

export const VilBonds = ({ c, act, ask }) => {
    const bonds = c.bonds ?? [];
    if (!bonds.length && !act) return null;
    const setLevel = (id, level) => act.setBonds(bonds.map(b => (b.id === id ? { ...b, level } : b)));
    return (
        <div className="vil-bonds-block">
            <VilLabel align="center">Liens</VilLabel>
            <div className="vil-bonds">
                {bonds.map(b => (
                    <div key={b.id} className="vil-bond">
                        <span><b className="vil-name">{b.name}</b> {b.description && <em>{b.description}</em>}</span>
                        <span className="vil-level" role="group" aria-label={`Niveau du lien avec ${b.name}`}>
                            {LEVELS.map(l => (act
                                ? <button key={l.value} type="button" className={l.value === b.level ? 'is-on' : ''} onClick={() => setLevel(b.id, l.value)}>{l.label}</button>
                                : <span key={l.value} className={l.value === b.level ? 'is-on' : ''}>{l.label}</span>))}
                        </span>
                        {act && <button type="button" className="vil-bond-remove" onClick={() => ask('removeBond', b)} title="Retirer ce lien" aria-label={`Retirer le lien avec ${b.name}`}>×</button>}
                    </div>
                ))}
                {act && <button type="button" className="vtt-btn vtt-btn-sm" onClick={() => ask('addBond')}>+ Lien</button>}
            </div>
        </div>
    );
};
