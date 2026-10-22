import {useMemo, useState} from "react";
import {ITEM_AND_CYBERWARE_CATEGORY_LABEL, TAG_VARIANT_CLASS} from "../../config.jsx";
import Modal from "../../../../components/ui/Modal.jsx";

const BrowseModal = ({ title, items, groupKey, onAdd, onClose }) => {
    const [query,    setQuery]    = useState('');
    const [category, setCategory] = useState(null); // null = tous
    const [added,    setAdded]    = useState(new Set());

    // Catégories disponibles dans la liste fournie
    const categories = useMemo(() => {
        const seen = new Set();
        const result = [];
        for (const it of items) {
            const cat = it.category ?? it.type ?? null;
            if (cat && !seen.has(cat)) { seen.add(cat); result.push(cat); }
        }
        return result;
    }, [items]);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return items.filter(it => {
            const matchCat  = !category || (it.category ?? it.type) === category;
            const matchText = !q
                || it.name.toLowerCase().includes(q)
                || (it.description ?? '').toLowerCase().includes(q);
            return matchCat && matchText;
        });
    }, [items, query, category]);

    const grouped = useMemo(() => {
        if (!groupKey) return null;
        return filtered.reduce((acc, it) => {
            (acc[it[groupKey]] ??= []).push(it);
            return acc;
        }, {});
    }, [filtered, groupKey]);

    const handleAdd = (item) => {
        onAdd(item);
        setAdded(prev => new Set(prev).add(item.name));
        setTimeout(() => setAdded(prev => {
            const next = new Set(prev);
            next.delete(item.name);
            return next;
        }), 1500);
    };

    const renderItem = (item) => (
        <div
            key={item.name}
            className="flex items-start gap-3 px-4 py-3 transition-colors border-b border-default hover:bg-surface-alt"
        >
            <div className="flex-1 min-w-0 flex flex-col gap-1">
                <span className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                    {item.name}
                </span>
                {item.description && (
                    <span className="text-xs leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                        {item.description}
                    </span>
                )}
                {item.optionHint && (
                    <span className="text-xs italic" style={{ color: 'var(--color-accent)' }}>
                        {item.optionHint}
                    </span>
                )}
                {item.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-0.5">
                        {item.tags.map((t, i) => (
                            <span key={i} className={`cp-tag ${TAG_VARIANT_CLASS[t.variant] ?? 'cp-tag-neutral'}`}>
                                {t.text}
                            </span>
                        ))}
                    </div>
                )}
            </div>
            <button
                onClick={() => handleAdd(item)}
                className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold transition-all"
                style={{
                    background: added.has(item.name) ? 'var(--color-success)' : 'var(--color-surface-alt)',
                    border:     `1px solid ${added.has(item.name) ? 'var(--color-success)' : 'var(--color-border)'}`,
                    color:      added.has(item.name) ? 'var(--color-bg)' : 'var(--color-primary)',
                    cursor:     'pointer',
                    transition: 'all 0.2s',
                }}
                title="Ajouter"
            >
                {added.has(item.name) ? '✓' : '+'}
            </button>
        </div>
    );

    // Fenêtre à hauteur fixe (h-full) : la recherche et les filtres restent en
    // place, seule la liste défile, et la fenêtre ne saute pas quand on filtre.
    return (
        <Modal onClose={onClose} size="lg" expandable title={title} className="h-full">
            <div className="flex flex-col h-full min-h-0 gap-3">
                {/* Recherche */}
                <div className="shrink-0">
                    <input
                        type="text"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        placeholder="Rechercher…"
                        autoFocus
                        className="vtt-input"
                    />

                    {/* Filtres catégorie */}
                    {categories.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                            <button
                                type="button"
                                onClick={() => setCategory(null)}
                                className={`vtt-pill ${!category ? 'is-selected' : ''}`}
                            >
                                Tous
                            </button>
                            {categories.map(cat => (
                                <button
                                    type="button"
                                    key={cat}
                                    onClick={() => setCategory(prev => prev === cat ? null : cat)}
                                    className={`vtt-pill ${category === cat ? 'is-selected' : ''}`}
                                >
                                    {ITEM_AND_CYBERWARE_CATEGORY_LABEL[cat] ?? cat}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Liste scrollable */}
                <div className="flex-1 min-h-0 overflow-y-auto vtt-scroll -mx-5 border-t border-default">
                    {filtered.length === 0 && (
                        <p className="text-sm text-center py-8" style={{ color: 'var(--color-text-muted)' }}>
                            Aucun résultat.
                        </p>
                    )}
                    {grouped
                        ? Object.entries(grouped).map(([cat, catItems]) => (
                            <div key={cat}>
                                <div
                                    className="px-4 py-1.5 text-[10px] cp-font-ui uppercase tracking-widest sticky top-0"
                                    style={{
                                        color:        'var(--color-text-muted)',
                                        background:   'var(--color-surface)',
                                        borderBottom: '1px solid var(--color-border)',
                                    }}
                                >
                                    {ITEM_AND_CYBERWARE_CATEGORY_LABEL[cat] ?? cat}
                                </div>
                                {catItems.map(renderItem)}
                            </div>
                        ))
                        : filtered.map(renderItem)
                    }
                </div>
            </div>
        </Modal>
    );
};

export default BrowseModal;