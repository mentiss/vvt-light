// src/client/src/systems/fabula/components/layout/ResourceBar.jsx
// ─────────────────────────────────────────────────────────────────────────────
// PV/PM/PI + stats dérivées compactes — se place directement sous
// AttributesPanel dans la même colonne (Rangée 1). Points Fabula vit dans son
// propre panneau (FabulaPointsPanel), pas ici.
// Steppers PV/PM/PI toujours actifs, même hors mode édition — persistance
// immédiate via onQuickUpdate. Seuil de Crise/Défense/Déf.Magique/Initiative :
// lecture seule, valeurs dérivées — jamais éditables directement.
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import Stepper from './Stepper.jsx';

// Ajustements rapides ±5/±10 (soins et dégâts par paquets) — PV/PM uniquement,
// les PI restent en ±1 (valeurs trop petites pour justifier des paliers).
const QuickAdjust = ({ value, max, onChange }) => (
    <div className="flex gap-1">
        {[-10, -5, 5, 10].map(d => (
            <button key={d} type="button"
                    onClick={() => onChange(Math.max(0, Math.min(max, value + d)))}
                    className="px-1.5 py-0.5 rounded text-[10px] border bg-default border-default text-muted hover:text-default cursor-pointer">
                {d > 0 ? `+${d}` : d}
            </button>
        ))}
    </div>
);

const ResourceBar = ({ character, onQuickUpdate }) => {
    const pvCrise = character.pvActuel <= character.seuilCrise;

    return (
        <div className="bg-surface border border-default rounded-lg p-3 flex flex-col gap-3">
            <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted">PV {pvCrise && <span className="text-danger font-bold">(Crise)</span>}</span>
                    <Stepper size="sm" value={character.pvActuel} min={0} max={character.pvMax}
                             onChange={(v) => onQuickUpdate({ pvActuel: v })} />
                    <QuickAdjust value={character.pvActuel} max={character.pvMax}
                                 onChange={(v) => onQuickUpdate({ pvActuel: v })} />
                </div>
                <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted">PM</span>
                    <Stepper size="sm" value={character.pmActuel} min={0} max={character.pmMax}
                             onChange={(v) => onQuickUpdate({ pmActuel: v })} />
                    <QuickAdjust value={character.pmActuel} max={character.pmMax}
                                 onChange={(v) => onQuickUpdate({ pmActuel: v })} />
                </div>
                <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted">PI</span>
                    <Stepper size="sm" value={character.piActuel} min={0} max={character.piMax}
                             onChange={(v) => onQuickUpdate({ piActuel: v })} />
                </div>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 text-xs border-t border-default pt-2">
                <div className="bg-surface-alt rounded p-1.5 text-center">
                    <div className="text-muted">Crise</div>
                    <div className="font-bold text-sm">{character.seuilCrise}</div>
                </div>
                <div className="bg-surface-alt rounded p-1.5 text-center">
                    <div className="text-muted">Déf.</div>
                    <div className="font-bold text-sm">{character.defense}</div>
                </div>
                <div className="bg-surface-alt rounded p-1.5 text-center">
                    <div className="text-muted">Déf.Mag.</div>
                    <div className="font-bold text-sm">{character.defenseMagique}</div>
                </div>
                <div className="bg-surface-alt rounded p-1.5 text-center">
                    <div className="text-muted">Init.</div>
                    <div className="font-bold text-sm">{character.initiative}</div>
                </div>
                <div className="bg-surface-alt rounded p-1.5 text-center flex flex-col items-center">
                    <div className="text-muted">Zénits</div>
                    <input type="number" value={character.zenit}
                           onChange={(e) => onQuickUpdate({ zenit: parseInt(e.target.value) || 0 })}
                           className="font-bold text-sm w-16 text-center bg-transparent" />
                </div>
            </div>
        </div>
    );
};

export default ResourceBar;