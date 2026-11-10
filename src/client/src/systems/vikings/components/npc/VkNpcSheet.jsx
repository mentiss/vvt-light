// src/client/src/systems/vikings/components/npc/VkNpcSheet.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Partie système d'un PNJ de Vikings (spec_pnj.md §10.2), posée par la brique
// NpcSystem (props { npc, state, onStateChange, hiddenRolls, sessionId, name }) :
//   - caractéristiques et compétences : un clic ouvre la fenêtre de jet MJ préremplie
//     (3d10 moins la Blessure, seuil, explosion, malus de succès ; jet secret repris de l'onglet) ;
//   - à la table : Blessure (jusqu'au maximum du PNJ, état et malus du barème humain par règle
//     de trois) et Malus (succès retirés du résultat) ; aucun jet une fois KO ;
//   - armes, traits (Armure, Seuil de combat et actions : résumé de la carte, config.jsx).
// En bibliothèque (pas d'état), mêmes informations et mêmes jets, sans les compteurs.
// Règles : config/npc.js.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import GMDiceModal from '../../gm/modals/GMDiceModal.jsx';
import VkIcon from '../ui/VkIcon.jsx';
import { CARACNAMES } from '../../config/competences.js';
import { CARAC_KEYS, blessureMalus, blessureMax, caracRoll, humanTokens, isOut, skillRoll } from '../../config/npc.js';

const BLESSURE_STATES = ['', 'Superficielle', 'Sérieuse', 'Critique', 'Incapacitante', 'Inconscient'];
const MALUS_MAX = 5;

const Counter = ({ label, value, max, onChange, hint }) => (
    <div className="vk-npc-counter">
        <span className="vk-label">{label}</span>
        <div className="vk-stepper">
            <button type="button" onClick={() => onChange(Math.max(0, value - 1))} disabled={value <= 0} aria-label={`${label} : un de moins`}><VkIcon name="minus" /></button>
            <span className="vk-num">{value}</span>
            <button type="button" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} aria-label={`${label} : un de plus`}><VkIcon name="plus" /></button>
        </div>
        {hint && <span className="vk-npc-hint">{hint}</span>}
    </div>
);

const VkNpcSheet = ({ npc, state, onStateChange, hiddenRolls, sessionId, name }) => {
    const sd = npc.systemData ?? {};
    const [roll, setRoll] = useState(null);
    const blessure = Number(state?.blessure ?? 0);
    const malus = Number(state?.malus ?? 0);
    const max = blessureMax(sd);
    const dice = blessureMalus(sd, blessure);
    const ko = isOut(sd, state);   // Blessure au maximum : KO, aucun jet (spec_vikings.md §2.1)

    return (
        <div className="vk-npc-body">
            <div className="vk-npc-caracs">
                {CARAC_KEYS.map(k => (
                    <button key={k} type="button" className="vk-npc-carac" title={`Jet de ${CARACNAMES[k]}`} disabled={ko}
                            onClick={() => setRoll(caracRoll(sd, k, state))}>
                        <span className="vk-label">{CARACNAMES[k]}</span><b className="vk-num">{sd.caracs?.[k] ?? 2}</b>
                    </button>
                ))}
            </div>
            {ko && <div className="vk-npc-hint">Hors de combat : aucun jet possible.</div>}
            {state ? (
                <div className="vk-npc-counters">
                    <Counter label={`Blessure / ${max}`} value={blessure} max={max} onChange={v => onStateChange({ blessure: v })}
                             hint={[BLESSURE_STATES[humanTokens(sd, blessure)], dice > 0 && !ko && `−${dice} dé${dice > 1 ? 's' : ''}`].filter(Boolean).join(' · ')} />
                    <Counter label="Malus" value={malus} max={MALUS_MAX} onChange={v => onStateChange({ malus: v })}
                             hint={malus > 0 ? `−${malus} succès` : ''} />
                </div>
            ) : (
                <div className="vk-npc-hint">Blessure : {max} tokens{sd.malus ? ` · malus de base −${sd.malus} succès` : ''}</div>
            )}
            {(sd.skills ?? []).length > 0 && (
                <div className="vk-npc-pills">
                    {sd.skills.map((s, i) => (
                        // relecture: F-KEY — compétences sans identifiant (même compétence possible avec deux spécialisations)
                        <button key={`${s.name}-${i}`} type="button" className="vk-pill" disabled={ko} onClick={() => setRoll(skillRoll(sd, s, state))}>
                            {s.name}{s.specialization ? ` (${s.specialization})` : ''} {s.level ?? 0}
                        </button>
                    ))}
                </div>
            )}
            {(sd.weapons ?? []).map((w, i) => (
                // relecture: F-KEY — armes sans identifiant, liste figée de la fiche
                <div key={`${w.name}-${i}`} className="vk-npc-line"><b>{w.name}</b>{w.damage ? ` · dégâts ${w.damage}` : ''}</div>
            ))}
            {(sd.traits ?? []).length > 0 && (
                <details className="vk-npc-fold">
                    <summary className="vk-label">Traits ({sd.traits.length})</summary>
                    {sd.traits.map((t, i) => <p key={`${t.name}-${i}`} className="vk-npc-line"><b>{t.name}.</b> {t.text}</p>)}
                </details>
            )}
            {roll && (
                <GMDiceModal sessionId={sessionId} name={name} label={roll.label} initial={roll} secret={hiddenRolls}
                             onClose={() => setRoll(null)} />
            )}
        </div>
    );
};

export default VkNpcSheet;
