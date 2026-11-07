// src/client/src/systems/vikings/gm/components/Hall.jsx
// ─────────────────────────────────────────────────────────────────────────────
// La halle du MJ (spec_vikings_pierre_peinte.md D-12, planche) :
//   HallCard : un personnage de la table en colonne à gauche : nom (ruban), avatar,
//     joueur et présence, SAGA, blessures et fatigue (cliquables), points de
//     compétence restants, actions rapides +1 Saga, Repos (fatigue à 0), Jet.
//     Un clic sur la carte affiche sa fiche à droite.
//   ArcRecap : fin d'arc en récapitulatif validé d'un coup : SAGA attribuée
//     (plafond 5, gain compté dans la légende), points de compétence restaurés,
//     blessures et fatigue remises à 0, par personnage. Remplace « Actions de table ».
// Écritures : onPatch(id, patch) → PATCH des seuls champs (TabSession.patchCharacter),
// rediffusé aux joueurs par la route.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import {
    BLESSURE_MAX, FATIGUE_MAX, SAGA_MAX, gainSaga, getBlessureMalus, getFatigueMalus, getFatigueState,
} from '../../config/rules.js';
import { formatFullName } from '../../config/utils.js';
import VkPanel from '../../components/ui/VkPanel.jsx';
import VkIcon from '../../components/ui/VkIcon.jsx';
import { SagaBeads, Tokens, nextTokens } from '../../components/layout/SagaStateSection.jsx';

const BLESSURE_STATES = ['Indemne', 'Superficielle', 'Sérieuse', 'Critique', 'Incapacitante', 'KO'];

const pointsOf = (c) => {
    const skills = c.skills ?? [];
    return { left: skills.reduce((s, k) => s + (k.currentPoints ?? 0), 0), total: skills.reduce((s, k) => s + (k.level ?? 0), 0) };
};
const restoredSkills = (c) => (c.skills ?? []).map(s => ({ ...s, currentPoints: s.level }));
const stop = (fn) => (e) => { e.stopPropagation(); fn(); };

export const HallCard = ({ sessionChar, char, selected, online, onSelect, onPatch, onRoll }) => {
    const name = char ? formatFullName(char) : sessionChar.name;
    if (!char) {
        return (
            <VkPanel variant="sm" className="vk-hall-card">
                <h3 className="vk-band-title">{name}</h3>
                <p className="text-sm text-muted italic m-0">Chargement de la fiche…</p>
            </VkPanel>
        );
    }
    const b = char.tokensBlessure ?? 0, f = char.tokensFatigue ?? 0;
    const bm = getBlessureMalus(b), fm = getFatigueMalus(f);
    const pts = pointsOf(char);
    const patch = (p) => onPatch(char.id, p);

    return (
        <VkPanel variant="sm" className={`vk-hall-card ${selected ? 'is-selected' : ''}`}
                 role="button" tabIndex={0} onClick={onSelect}
                 onKeyDown={(e) => { if (e.key === 'Enter') onSelect(); }}>
            <h3 className="vk-band-title" title={name}>{name}</h3>
            <div className="vk-hall-head">
                <span className="relative shrink-0">
                    <span className="vk-avatar w-10 h-10 overflow-hidden">
                        {char.avatar ? <img src={char.avatar} alt="" className="w-full h-full object-cover" /> : (char.prenom?.[0]?.toUpperCase() || '?')}
                    </span>
                    <span className={`vk-presence absolute -bottom-0.5 -right-0.5 ${online ? 'is-online' : ''}`} />
                </span>
                <span className="min-w-0">
                    <span className="block text-sm text-muted truncate">{char.playerName || '—'}</span>
                    <SagaBeads saga={char.sagaActuelle ?? 0} />
                </span>
            </div>

            <div className="vk-hall-line"><span>Blessures</span>
                <span className={bm || b >= BLESSURE_MAX ? 'vk-text-warn font-bold' : 'text-muted'}>{b >= BLESSURE_MAX ? 'KO' : bm ? `−${bm} dé${bm > 1 ? 's' : ''}` : BLESSURE_STATES[b]}</span>
            </div>
            <div onClick={(e) => e.stopPropagation()}>
                <Tokens value={b} max={BLESSURE_MAX} kind="blessure" onToggle={(i) => patch({ tokensBlessure: nextTokens(b, i, BLESSURE_MAX) })} />
            </div>
            <div className="vk-hall-line"><span>Fatigue</span>
                <span className={fm || f >= FATIGUE_MAX ? 'vk-text-warn font-bold' : 'text-muted'}>{f >= FATIGUE_MAX ? 'Inconscient' : fm ? `+${fm} requis` : (getFatigueState(f) || 'Reposé')}</span>
            </div>
            <div onClick={(e) => e.stopPropagation()}>
                <Tokens value={f} max={FATIGUE_MAX} kind="fatigue" onToggle={(i) => patch({ tokensFatigue: nextTokens(f, i, FATIGUE_MAX) })} />
            </div>
            <div className="vk-hall-line"><span>Points de compétence</span><span className="vk-num">{pts.left}/{pts.total}</span></div>

            <div className="vk-hall-acts">
                <button type="button" className="vk-btn vk-btn-sm" disabled={(char.sagaActuelle ?? 0) >= SAGA_MAX}
                        onClick={stop(() => patch(gainSaga(char, 1)))}><span className="vk-rune">ᛟ</span> +1 Saga</button>
                <button type="button" className="vk-btn vk-btn-sm" disabled={!f} onClick={stop(() => patch({ tokensFatigue: 0 }))}>Repos</button>
                <button type="button" className="vk-btn vk-btn-sm" onClick={stop(onRoll)}><VkIcon name="die" />Jet</button>
            </div>
        </VkPanel>
    );
};

const Stepper = ({ value, onChange }) => (
    <div className="vk-stepper">
        <button type="button" onClick={() => onChange(Math.max(0, value - 1))} disabled={value <= 0}><VkIcon name="minus" /></button>
        <span className="vk-num">{value}</span>
        <button type="button" onClick={() => onChange(Math.min(SAGA_MAX, value + 1))} disabled={value >= SAGA_MAX}><VkIcon name="plus" /></button>
    </div>
);

/** @param {object[]} props.characters fiches complètes de la table ; onPatch ; onDone (retour à la fiche) */
export const ArcRecap = ({ characters, onPatch, onDone }) => {
    const [rows, setRows] = useState(() => Object.fromEntries(characters.map(c => [c.id, { saga: 1, points: true, rest: true }])));
    const [busy, setBusy] = useState(false);
    const row = (id) => rows[id] ?? { saga: 1, points: true, rest: true };
    const setRow = (id, change) => setRows(prev => ({ ...prev, [id]: { ...row(id), ...change } }));

    const close = async () => {
        setBusy(true);
        await Promise.all(characters.map(c => {
            const r = row(c.id);
            const patch = {
                ...(r.saga > 0 ? gainSaga(c, r.saga) : {}),
                ...(r.points ? { skills: restoredSkills(c) } : {}),
                ...(r.rest ? { tokensFatigue: 0, tokensBlessure: 0 } : {}),
            };
            return Object.keys(patch).length ? onPatch(c.id, patch) : null;
        }));
        setBusy(false);
        onDone();
    };

    return (
        <VkPanel className="vk-arc">
            <h3 className="vk-band-title">Fin d'arc</h3>
            <p className="text-sm text-muted mt-0 mb-3">Tout est appliqué en une fois. La Saga attribuée compte dans la légende ; le plafond de {SAGA_MAX} est respecté.</p>
            <div className="overflow-x-auto">
                <table className="vk-arc-table">
                    <thead><tr><th>Personnage</th><th>Saga attribuée</th><th>Points de compétence</th><th>Repos</th></tr></thead>
                    <tbody>
                        {characters.map(c => {
                            const r = row(c.id), saga = c.sagaActuelle ?? 0, pts = pointsOf(c);
                            return (
                                <tr key={c.id}>
                                    <td><strong>{formatFullName(c)}</strong> <span className="text-muted text-sm">· Saga {saga}/{SAGA_MAX}</span></td>
                                    <td>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <Stepper value={r.saga} onChange={(n) => setRow(c.id, { saga: n })} />
                                            {saga + r.saga > SAGA_MAX && <span className="text-xs text-muted">plafond : +{Math.max(0, SAGA_MAX - saga)} retenu</span>}
                                        </div>
                                    </td>
                                    <td><button type="button" className={`vk-pill ${r.points ? 'is-selected' : ''}`} onClick={() => setRow(c.id, { points: !r.points })}>Restaurer ({pts.left}/{pts.total})</button></td>
                                    <td><button type="button" className={`vk-pill ${r.rest ? 'is-selected' : ''}`} onClick={() => setRow(c.id, { rest: !r.rest })}>Blessures et fatigue à 0</button></td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            <div className="flex justify-end gap-2 mt-4">
                <button type="button" className="vk-btn" onClick={onDone}>Annuler</button>
                <button type="button" className="vk-btn vk-btn-primary" onClick={close} disabled={busy || !characters.length}>
                    <span className="vk-rune">ᛟ</span>{busy ? 'La saga se grave…' : 'Clore l’arc'}
                </button>
            </div>
        </VkPanel>
    );
};
