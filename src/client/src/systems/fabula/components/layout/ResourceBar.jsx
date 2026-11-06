// src/client/src/systems/fabula/components/layout/ResourceBar.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Statut (planche §3) : jauges PV / PM / PI et stats dérivées. Points Fabula
// vit dans son propre panneau (FabulaPointsPanel), pas ici.
// - Jauge PV : seuil de Crise posé sur la jauge ; sous le seuil, elle passe au
//   rouge et pulse, et « Crise » s'affiche dans l'en-tête.
// - Ajustements −10 −5 −1 / +1 +5 +10 (PI : ±1, valeurs trop petites pour des
//   paliers), toujours actifs même hors mode édition : persistance immédiate via
//   onQuickUpdate, bornés à [0, max].
// - « Utiliser un objet » près des PI : objets de la fiche de groupe payés en PI
//   (UseItemMenu, spec_fabula.md §7), avec trace dans l'historique.
// - Crise, Défense, Déf. mag., Initiative : valeurs dérivées en lecture seule ;
//   Zénits modifiable directement.
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import FuGauge from '../ui/FuGauge.jsx';
import FuIcon from '../ui/FuIcon.jsx';
import { isInCrisis } from '../../config.jsx';
import UseItemMenu from '../group/UseItemMenu.jsx';

const STEPS_BIG   = [-10, -5, -1, 1, 5, 10];
const STEPS_SMALL = [-1, 1];

const Resource = ({ k, label, value, max, crisis, inCrisis, steps, onChange, extra }) => (
    <div className={`fu-res${inCrisis ? ' is-crisis' : ''}`} data-k={k}>
        <span className="fu-res-key">{label}</span>
        <FuGauge value={value} max={max} crisis={crisis} />
        <span className="fu-res-val">{value}<small> / {max}</small></span>
        <div className="fu-quick">
            {steps.map(d => (
                <React.Fragment key={d}>
                    {d === 1 && <>{extra}<span className="fu-gap" /></>}
                    <button type="button" className={d < 0 ? 'is-dmg' : 'is-heal'}
                            disabled={d < 0 ? value <= 0 : value >= max}
                            onClick={() => onChange(Math.max(0, Math.min(max, value + d)))}>
                        {d > 0 ? `+${d}` : `−${-d}`}
                    </button>
                </React.Fragment>
            ))}
        </div>
    </div>
);

const STATS = [
    { key: 'seuilCrise',     label: 'Crise',     icon: 'crisis',  tone: 'is-crisis' },
    { key: 'defense',        label: 'Défense',   icon: 'shield' },
    { key: 'defenseMagique', label: 'Déf. mag.', icon: 'mshield', tone: 'is-magic' },
    { key: 'initiative',     label: 'Initiative', icon: 'boot' },
];

const ResourceBar = ({ character, onQuickUpdate, sessionId }) => {
    const crisis = isInCrisis(character);

    return (
        <div className="fu-win">
            <div className="fu-win-head">
                <h3 className="fu-title">Statut<span className="fu-kana" aria-hidden="true">ステータス</span></h3>
                <span className="fu-rule" />
                {crisis && <span className="fu-tag text-danger">Crise</span>}
            </div>

            <Resource k="pv" label="PV" value={character.pvActuel ?? 0} max={character.pvMax ?? 0}
                      crisis={character.seuilCrise} inCrisis={crisis} steps={STEPS_BIG}
                      onChange={(v) => onQuickUpdate({ pvActuel: v })} />
            <Resource k="pm" label="PM" value={character.pmActuel ?? 0} max={character.pmMax ?? 0}
                      steps={STEPS_BIG} onChange={(v) => onQuickUpdate({ pmActuel: v })} />
            <Resource k="pi" label="PI" value={character.piActuel ?? 0} max={character.piMax ?? 0}
                      steps={STEPS_SMALL} onChange={(v) => onQuickUpdate({ piActuel: v })}
                      extra={<UseItemMenu character={character} sessionId={sessionId} onQuickUpdate={onQuickUpdate} />} />

            <div className="fu-sep" />
            <div className="fu-derived">
                {STATS.map(s => (
                    <div key={s.key} className={`fu-stat${s.tone ? ` ${s.tone}` : ''}`}>
                        <FuIcon name={s.icon} className="fu-ico-sm" />
                        <b>{character[s.key] ?? '—'}</b>
                        <span className="fu-label">{s.label}</span>
                    </div>
                ))}
                <div className="fu-stat">
                    <FuIcon name="coin" className="fu-ico-sm" />
                    <input type="number" value={character.zenit ?? 0} aria-label="Zénits"
                           onChange={(e) => onQuickUpdate({ zenit: parseInt(e.target.value) || 0 })} />
                    <span className="fu-label">Zénits</span>
                </div>
            </div>
        </div>
    );
};

export default ResourceBar;
