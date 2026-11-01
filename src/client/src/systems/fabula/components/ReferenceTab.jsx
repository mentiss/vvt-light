// src/client/src/systems/fabula/components/ReferenceTab.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Onglet Référence (aide de jeu), joueur et MJ (spec_fabula_reference.md §5).
// Contenu dans config/reference.js ; tables des projets et calculateur lus
// dans config/projects.js (une seule source). Même contenu pour tous, sections
// MJ comprises (simple badge). Recherche sans casse ni accents : seuls les
// blocs qui contiennent le texte restent, avec leur intertitre.
//
// Props : character (fiche du joueur, absente côté MJ : sert au pré-remplissage
// du calculateur).
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { normalizeText, searchableText } from '../../../tools/catalog.js';
import { REFERENCE_SECTIONS } from '../config/reference.js';
import {
    PROJECT_POWERS, PROJECT_AREAS, PROJECT_USAGES, PROJECT_AMOUNTS, PROJECT_AMOUNT_LABELS,
} from '../config.jsx';
import ProjectCalculator from './layout/ProjectCalculator.jsx';

const SEARCH_FIELDS = ['text', 'items', 'columns', 'rows', 'keywords'];
const sectionAnchor = (id) => `fu-ref-${id}`;

// Blocs d'une section qui correspondent à la recherche ; un intertitre suit
// le premier bloc retenu sous lui. Titre de section trouvé = section entière.
const matchingBlocks = (section, query) => {
    if (!query || normalizeText(section.title).includes(query)) return section.blocks;
    const kept = [];
    let heading = null;
    for (const block of section.blocks) {
        if (block.type === 'heading') { heading = block; continue; }
        if (!searchableText(block, SEARCH_FIELDS).includes(query)) continue;
        if (heading) { kept.push(heading); heading = null; }
        kept.push(block);
    }
    return kept;
};

// ── Rendu des blocs ──────────────────────────────────────────────────────────

const Table = ({ columns, rows }) => (
    <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
            <thead>
                <tr>{columns.map(c => <th key={c} className="text-left font-semibold border-b border-default px-2 py-1">{c}</th>)}</tr>
            </thead>
            <tbody>
                {rows.map(row => (
                    <tr key={row.join('|')} className="align-top">
                        {row.map((cell, i) => (
                            <td key={columns[i]} className={`border-b border-default/40 px-2 py-1 ${i === 0 ? 'font-semibold whitespace-nowrap' : ''}`}>{cell}</td>
                        ))}
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

const Block = ({ block, character }) => {
    switch (block.type) {
        case 'heading':           return <h4 className="fu-font-title text-secondary text-sm mt-1">{block.text}</h4>;
        case 'text':              return <p className="text-sm">{block.text}</p>;
        case 'list':              return (
            <ul className="text-sm flex flex-col gap-1 list-disc pl-5">
                {block.items.map(item => <li key={item}>{item}</li>)}
            </ul>
        );
        case 'table':             return <Table columns={block.columns} rows={block.rows} />;
        case 'projectTables':     return <ProjectTables />;
        case 'projectCalculator': return <ProjectCalculator character={character} />;
        default:                  return null;
    }
};

// Clé stable d'un bloc : son type et son premier texte
const blockKey = (block) => `${block.type}:${block.text ?? block.items?.[0] ?? block.columns?.join('|') ?? ''}`;

const Section = ({ section, blocks, open, onToggle, character }) => (
    <section id={sectionAnchor(section.id)} className="bg-surface border border-default rounded-lg scroll-mt-4">
        <button type="button" onClick={onToggle}
                className="w-full flex items-center justify-between gap-2 px-3 py-2 text-left cursor-pointer">
            <span className="flex items-center gap-2">
                <span className="fu-font-title text-primary">{section.title}</span>
                {section.gm && <span className="text-[10px] px-1.5 py-0.5 rounded-full border border-default text-muted">MJ</span>}
            </span>
            <span className="text-muted text-xs">{open ? '▾' : '▸'}</span>
        </button>
        {open && (
            <div className="px-3 pb-3 flex flex-col gap-2">
                {blocks.map(block => <Block key={blockKey(block)} block={block} character={character} />)}
            </div>
        )}
    </section>
);

// ── Onglet ───────────────────────────────────────────────────────────────────

const ReferenceTab = ({ character }) => {
    const [search, setSearch]   = useState('');
    const [openIds, setOpenIds] = useState(() => new Set());
    const query = normalizeText(search.trim());

    const toggle = (id) => setOpenIds(prev => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id); else next.add(id);
        return next;
    });
    const goTo = (id) => {
        setOpenIds(prev => new Set(prev).add(id));
        document.getElementById(sectionAnchor(id))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    // Pendant une recherche : sections trouvées ouvertes, sans toucher à openIds
    const visible = REFERENCE_SECTIONS
        .map(section => ({ section, blocks: matchingBlocks(section, query) }))
        .filter(({ blocks }) => blocks.length > 0);

    return (
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-4">
            <aside className="md:w-48 shrink-0">
                <nav className="md:sticky md:top-4 flex md:flex-col flex-wrap gap-1">
                    {REFERENCE_SECTIONS.map(s => (
                        <button key={s.id} type="button" onClick={() => goTo(s.id)}
                                className="text-left text-sm px-2 py-1 rounded hover:bg-surface-alt cursor-pointer">
                            {s.title}
                        </button>
                    ))}
                </nav>
            </aside>

            <div className="flex-1 min-w-0 flex flex-col gap-3">
                <input type="search" value={search} onChange={e => setSearch(e.target.value)}
                       placeholder="Rechercher une règle (ex. inoculation, qualité, cadran)…"
                       className="w-full bg-default border border-default rounded px-3 py-1.5 text-sm" />

                {visible.length === 0 && (
                    <p className="text-sm text-muted">Aucune règle ne correspond à « {search} ».</p>
                )}
                {visible.map(({ section, blocks }) => (
                    <Section key={section.id} section={section} blocks={blocks} character={character}
                             open={query ? true : openIds.has(section.id)}
                             onToggle={() => toggle(section.id)} />
                ))}
            </div>
        </div>
    );
};

export default ReferenceTab;
