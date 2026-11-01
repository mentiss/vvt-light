// src/client/src/systems/fabula/components/layout/ProjectCalculator.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Calculateur de projet du Bricoleur (spec_fabula_reference.md §5.4).
// Calcul dans config/projects.js (computeProject, testé) ; ici le formulaire.
// Côté joueur, niveau, rang de Visionnaire et Bricoleur pré-remplis depuis la
// fiche ; tout reste modifiable. Rien n'est mémorisé.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { PROJECT_POWERS, PROJECT_AREAS, PROJECT_USAGES, computeProject } from '../../config.jsx';

const formatZenits = (n) => `${n.toLocaleString('fr-FR')} z`;

// Valeurs de départ lues sur la fiche (absente côté MJ)
const initialInputs = (character) => {
    const classes  = character?.classes ?? [];
    const level    = classes.reduce((sum, c) => sum + (c.niveau || 0), 0) || character?.niveauGlobal || 5;
    const isTinker = classes.some(c => c.classKey === 'bricoleur' && (c.niveau || 0) > 0);
    const visionary = (character?.skills ?? [])
        .find(s => s.classKey === 'bricoleur' && s.skillKey === 'visionnaire')?.rang ?? 0;
    return {
        power: 'mineure', area: 'individuelle', usage: 'consommable', defect: false,
        players: 0, tinkerers: isTinker ? 1 : 0, assistants: 0, visionaryRanks: visionary, level,
    };
};

// Choix exclusif en boutons « pill » (pas de <select>, src/client/CLAUDE.md)
const Pills = ({ label, options, value, onChange }) => (
    <div className="flex flex-wrap items-center gap-1">
        <span className="text-xs text-muted w-24 shrink-0">{label}</span>
        {options.map(o => (
            <button key={String(o.key)} type="button" onClick={() => onChange(o.key)}
                    className={`px-2 py-1 rounded-full text-xs border cursor-pointer ${
                        value === o.key ? 'bg-primary text-white border-primary' : 'bg-default border-default'
                    }`}>
                {o.label}
            </button>
        ))}
    </div>
);

const NumberField = ({ label, value, onChange, min = 0 }) => (
    <label className="text-xs flex items-center justify-between gap-2">
        <span className="text-muted">{label}</span>
        <input type="number" min={min} value={value}
               onChange={e => onChange(Math.max(min, parseInt(e.target.value, 10) || 0))}
               className="w-14 bg-default border border-default rounded px-1 text-right" />
    </label>
);

const ResultRow = ({ label, value, strong = false }) => (
    <div className="flex justify-between gap-2 text-sm">
        <span className="text-muted">{label}</span>
        <span className={strong ? 'font-bold text-primary' : 'font-semibold'}>{value}</span>
    </div>
);

const DEFECT_OPTIONS = [{ key: false, label: 'Aucun' }, { key: true, label: 'Grave défaut (−25 %)' }];

const ProjectCalculator = ({ character }) => {
    const [inputs, setInputs] = useState(() => initialInputs(character));
    const set = (field) => (value) => setInputs(prev => ({ ...prev, [field]: value }));
    const r = computeProject(inputs);

    return (
        <div className="bg-surface-alt border border-default rounded-lg p-3 flex flex-col gap-3">
            <h4 className="fu-font-title text-primary text-sm">Calculateur de projet</h4>

            <div className="flex flex-col gap-1.5">
                <Pills label="Puissance"   options={PROJECT_POWERS} value={inputs.power}  onChange={set('power')} />
                <Pills label="Zone"        options={PROJECT_AREAS}  value={inputs.area}   onChange={set('area')} />
                <Pills label="Utilisation" options={PROJECT_USAGES} value={inputs.usage}  onChange={set('usage')} />
                <Pills label="Défaut"      options={DEFECT_OPTIONS} value={inputs.defect} onChange={set('defect')} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5">
                <NumberField label="PJ (sans Bricoleur) au travail" value={inputs.players}        onChange={set('players')} />
                <NumberField label="PJ Bricoleurs au travail"       value={inputs.tinkerers}      onChange={set('tinkerers')} />
                <NumberField label="Assistants"                     value={inputs.assistants}     onChange={set('assistants')} />
                <NumberField label="Rangs de Visionnaire cumulés"   value={inputs.visionaryRanks} onChange={set('visionaryRanks')} />
                <NumberField label="Niveau de l’inventeur"          value={inputs.level}          onChange={set('level')} min={1} />
            </div>

            <div className="border-t border-default pt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
                <ResultRow label="Coût total"            value={formatZenits(r.totalCost)} strong />
                <ResultRow label="Points de Progression" value={r.progressRequired} strong />
                <ResultRow label="Payé par Visionnaire"  value={formatZenits(r.paidByVisionary)} />
                <ResultRow label="PP par jour"           value={r.progressPerDay} />
                <ResultRow label="Reste à payer"         value={formatZenits(r.materialsToPay)} />
                <ResultRow label="Durée"                 value={r.days === null ? '—' : `${r.days} jour${r.days > 1 ? 's' : ''}`} />
                {inputs.assistants > 0 && (
                    <ResultRow label="Salaire des assistants" value={formatZenits(r.assistantsWage)} />
                )}
            </div>

            <ul className="text-xs text-muted flex flex-col gap-0.5 list-disc pl-4">
                {r.specialIngredient && <li>Le MJ exige un ingrédient ou matériau spécial, introuvable dans le commerce.</li>}
                <li>
                    Dégâts / soins : {r.amount === null
                        ? 'non disponibles à cette puissance.'
                        : `${r.damage.toLowerCase()}, soit ${r.amount} au niveau ${inputs.level}.`}
                </li>
                <li>Protection : {r.protection.toLowerCase()}.</li>
            </ul>
        </div>
    );
};

export default ProjectCalculator;
