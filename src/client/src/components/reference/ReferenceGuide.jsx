// src/client/src/components/reference/ReferenceGuide.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Brique « Aide de jeu » (documentations/spec_ui_reference.md) : sommaire,
// sections repliables, recherche insensible à la casse et aux accents,
// visibilité MJ / joueur, rendu des blocs standard (intertitre, texte, liste,
// tableau). Le slug fournit le contenu (markdownToSections, ou des sections en
// données), ses blocs propres (renderBlock) et l'habillage (classes vtt-reference-*).
//
// Props : sections [{ id, title, gm?, visibility?, blocks }], isGM,
//         renderBlock?(block) → ReactNode | undefined, placeholder?
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { normalizeText } from '../../tools/catalog.js';
import { isVisible, matchingBlocks, inlineSegments } from '../../tools/reference.js';

const anchor = (id) => `vtt-ref-${id}`;

/** Retours à la ligne (`<br>` des notes Obsidian, devenus `\n`) */
const Lines = ({ text }) => text.split('\n').map((part, i) => (
    <React.Fragment key={i}>{i > 0 && <br />}{part}</React.Fragment>
));

/** Texte avec gras, italique, barré et retours à la ligne */
const Inline = ({ text }) => inlineSegments(text).map((s, i) => {
    if (s.bold) return <strong key={i}><Lines text={s.text} /></strong>;
    if (s.italic) return <em key={i}><Lines text={s.text} /></em>;
    if (s.strike) return <s key={i}><Lines text={s.text} /></s>;
    return <Lines key={i} text={s.text} />;
});

const Table = ({ columns, rows }) => (
    <div className="vtt-reference-table-wrap">
        <table className="vtt-reference-table">
            <thead><tr>{columns.map((c, i) => <th key={i}><Inline text={c} /></th>)}</tr></thead>
            <tbody>
                {rows.map((row, r) => (
                    <tr key={r}>{row.map((cell, i) => <td key={i}><Inline text={cell} /></td>)}</tr>
                ))}
            </tbody>
        </table>
    </div>
);

const StandardBlock = ({ block }) => {
    switch (block.type) {
        case 'heading': return <h4 className="vtt-reference-heading"><Inline text={block.text} /></h4>;
        case 'text':    return <p className="vtt-reference-text"><Inline text={block.text} /></p>;
        case 'list':    return <ul className="vtt-reference-list">{block.items.map((item, i) => <li key={i}><Inline text={item} /></li>)}</ul>;
        case 'table':   return <Table columns={block.columns} rows={block.rows} />;
        default:        return null;
    }
};

/** Badge « MJ » : section marquée pour tous (gm: true), ou contenu réservé vu côté MJ */
const GmBadge = () => <span className="vtt-reference-badge">MJ</span>;

const Section = ({ section, blocks, open, onToggle, isGM, renderBlock }) => (
    <section id={anchor(section.id)} className="vtt-reference-section">
        <button type="button" className="vtt-reference-section-head" onClick={onToggle} aria-expanded={open}>
            <span className="vtt-reference-section-name">
                <span className="vtt-reference-section-title">{section.title}</span>
                {(section.gm || (isGM && section.visibility === 'gm')) && <GmBadge />}
            </span>
            <span className="vtt-reference-chevron" aria-hidden="true">{open ? '▾' : '▸'}</span>
        </button>
        {open && (
            <div className="vtt-reference-body">
                {blocks.map((block, i) => (
                    <div key={i} className={block.visibility === 'gm' ? 'vtt-reference-block is-gm' : 'vtt-reference-block'}>
                        {renderBlock?.(block) ?? <StandardBlock block={block} />}
                    </div>
                ))}
            </div>
        )}
    </section>
);

const ReferenceGuide = ({ sections, isGM = false, renderBlock, placeholder = 'Rechercher une règle…' }) => {
    const [search, setSearch] = useState('');
    const [openIds, setOpenIds] = useState(() => new Set());
    const query = normalizeText(search.trim());

    const shown = sections.filter(s => isVisible(s, isGM));
    const toggle = (id) => setOpenIds(prev => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id); else next.add(id);
        return next;
    });
    // Ouvre la section puis y défile, une fois son contenu affiché (sinon la page, encore trop
    // courte, ne peut pas l'amener en haut)
    const goTo = (id) => {
        setOpenIds(prev => new Set(prev).add(id));
        requestAnimationFrame(() => document.getElementById(anchor(id))?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    };

    // Pendant une recherche : sections trouvées ouvertes, sans toucher à openIds
    const visible = shown
        .map(section => ({ section, blocks: matchingBlocks(section, section.blocks.filter(b => isVisible(b, isGM)), query) }))
        .filter(({ blocks }) => blocks.length > 0);

    return (
        <div className="vtt-reference">
            <aside className="vtt-reference-aside">
                <nav className="vtt-reference-nav">
                    {shown.map(s => (
                        <button key={s.id} type="button" className="vtt-reference-nav-item" onClick={() => goTo(s.id)}>{s.title}</button>
                    ))}
                </nav>
            </aside>
            <div className="vtt-reference-main">
                <input type="search" className="vtt-reference-search" value={search} onChange={e => setSearch(e.target.value)} placeholder={placeholder} />
                {visible.length === 0 && <p className="vtt-reference-empty">Aucune règle ne correspond à « {search} ».</p>}
                {visible.map(({ section, blocks }) => (
                    <Section key={section.id} section={section} blocks={blocks} isGM={isGM} renderBlock={renderBlock}
                             open={query ? true : openIds.has(section.id)} onToggle={() => toggle(section.id)} />
                ))}
            </div>
        </div>
    );
};

export default ReferenceGuide;
