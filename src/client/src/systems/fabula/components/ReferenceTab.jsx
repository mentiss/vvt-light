// src/client/src/systems/fabula/components/ReferenceTab.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Onglet Référence (aide de jeu), joueur et MJ (spec_fabula_reference.md §5).
// Brique de la plateforme ReferenceGuide (spec_ui_reference.md) : sommaire,
// sections, recherche et blocs standard. Ici : le contenu (config/reference.js)
// et les blocs propres à Fabula, tables des projets et calculateur, lus dans
// config/projects.js (une seule source). Même contenu pour tous, sections MJ
// comprises (gm: true, simple badge). Habillage : theme.css (titres).
//
// Props : character (fiche du joueur, absente côté MJ : sert au pré-remplissage
// du calculateur).
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import ReferenceGuide from '@/features/reference/ReferenceGuide.jsx';
import { REFERENCE_SECTIONS } from '../config/reference.js';
import {
    PROJECT_POWERS, PROJECT_AREAS, PROJECT_USAGES, PROJECT_AMOUNTS, PROJECT_AMOUNT_LABELS,
} from '../config.jsx';
import ProjectCalculator from './layout/ProjectCalculator.jsx';

// ── Rendu des blocs ──────────────────────────────────────────────────────────

/** Tableau des projets (mêmes classes que les tableaux de la brique) */
const Table = ({ columns, rows }) => (
    <div className="vtt-reference-table-wrap">
        <table className="vtt-reference-table">
            <thead>
                <tr>{columns.map(c => <th key={c}>{c}</th>)}</tr>
            </thead>
            <tbody>
                {rows.map(row => (
                    <tr key={row.join('|')}>
                        {row.map((cell, i) => <td key={columns[i]}>{cell}</td>)}
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const ProjectTables = () => (
    <div className="flex flex-col gap-2">
        <Table columns={['Puissance', 'Coût', 'L’invention peut…', 'Dégâts / soins', 'Protection']}
               rows={PROJECT_POWERS.map(p => [p.label, `${p.cost} z`, p.can, p.damage, p.protection])} />
        <Table columns={['Zone', '×', 'Peut affecter…']}
               rows={PROJECT_AREAS.map(a => [a.label, `×${a.multiplier}`, a.examples])} />
        <Table columns={['Utilisation', '×', 'Une fois activée, l’invention…']}
               rows={PROJECT_USAGES.map(u => [u.label, `×${u.multiplier}`, u.description])} />
        <Table columns={['Niveau de l’inventeur', ...PROJECT_AMOUNT_LABELS]}
               rows={PROJECT_AMOUNTS.map(a => [`${a.minLevel}+`, ...a.values.map(String)])} />
        <p className="text-xs text-muted">
            Coût total = puissance × zone × utilisation. Quantités : mineure pour des dégâts mineurs (puissance moyenne), majeure pour des dégâts lourds (majeure), énorme pour des dégâts massifs (extrême).
        </p>
    </div>
);

// ── Onglet ───────────────────────────────────────────────────────────────────

const ReferenceTab = ({ character }) => (
    <ReferenceGuide
        sections={REFERENCE_SECTIONS}
        placeholder="Rechercher une règle (ex. inoculation, qualité, cadran)…"
        renderBlock={(block) => {
            if (block.type === 'projectTables') return <ProjectTables />;
            if (block.type === 'projectCalculator') return <ProjectCalculator character={character} />;
            return undefined;
        }}
    />
);

export default ReferenceTab;
