// Ligne directive
import {Tag, TagAdder} from "./TagManager.jsx";

export const DirectiveRow = ({ directive, editMode, onChange }) => (
    <div
        className="flex items-start gap-2 rounded-lg px-3 py-2"
        style={{
            background: directive.completed ? 'rgba(32,192,96,0.08)' : 'var(--color-surface-alt)',
            border:     `1px solid ${directive.completed ? 'var(--color-success)' : 'var(--color-border)'}`,
        }}
    >
        <input
            type="checkbox"
            checked={!!directive.completed}
            onChange={e => onChange({ completed: e.target.checked })}
            className="mt-0.5 flex-shrink-0"
            style={{ accentColor: 'var(--color-success)' }}
        />
        {editMode ? (
            <input
                type="text"
                value={directive.text ?? ''}
                onChange={e => onChange({ text: e.target.value })}
                placeholder="Directive…"
                className="flex-1 bg-transparent text-sm outline-none"
                style={{ color: 'var(--color-text)' }}
            />
        ) : (
            <span
                className="text-sm flex-1"
                style={{
                    color:          directive.completed ? 'var(--color-success)' : 'var(--color-text)',
                    textDecoration: directive.completed ? 'line-through' : 'none',
                }}
            >
                {directive.text || '—'}
                {directive.blankValue && (
                    <span className="ml-1 font-semibold" style={{ color: 'var(--color-primary)' }}>
                        {directive.blankValue}
                    </span>
                )}
            </span>
        )}
    </div>
);

// Ligne relation avec score de lien et tags
export const RelationRow = ({ relation, editMode, onChange, onRemove, onRemoveTag, onAddTag }) => {
    const score = relation.link_score ?? 1;
    const scoreColor = score > 0
        ? 'var(--color-success)'
        : score < 0 ? 'var(--color-danger)' : 'var(--color-text-muted)';

    return (
        <div
            className="rounded-lg p-3 flex flex-col gap-2"
            style={{ background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)' }}
        >
            <div className="flex items-center gap-2">
                {/* Score de lien */}
                <div
                    className="font-mono font-bold text-sm w-8 text-center flex-shrink-0"
                    style={{ color: scoreColor }}
                >
                    {score > 0 ? `+${score}` : score}
                </div>

                {editMode ? (
                    <>
                        <input
                            type="text"
                            value={relation.name ?? ''}
                            onChange={e => onChange({ name: e.target.value })}
                            placeholder="Nom de la relation…"
                            className="flex-1 bg-transparent text-sm font-semibold outline-none"
                            style={{ color: 'var(--color-text)' }}
                        />
                        <input
                            type="number"
                            min="-3" max="3"
                            value={score}
                            onChange={e => onChange({ link_score: parseInt(e.target.value) || 0 })}
                            className="w-12 text-center rounded px-1 py-0.5 text-xs font-mono"
                            style={{
                                background: 'var(--color-surface)',
                                border:     '1px solid var(--color-border)',
                                color:      scoreColor,
                            }}
                        />
                        {/* ← Bouton supprimer ajouté */}
                        <button
                            onClick={onRemove}
                            title="Supprimer cette relation"
                            className="w-6 h-6 rounded flex items-center justify-center text-xs flex-shrink-0"
                            style={{ color: 'var(--color-danger)', background: 'var(--color-surface)', border: '1px solid var(--color-danger)', cursor: 'pointer' }}
                        >
                            ✕
                        </button>
                    </>
                ) : (
                    <span className="font-semibold text-sm flex-1" style={{ color: 'var(--color-text)' }}>
                        {relation.name || 'Relation'}
                    </span>
                )}
            </div>

            {(editMode || relation.description) && (
                editMode ? (
                    <input
                        type="text"
                        value={relation.description ?? ''}
                        onChange={e => onChange({ description: e.target.value })}
                        placeholder="Description courte…"
                        className="bg-transparent text-xs outline-none w-full"
                        style={{ color: 'var(--color-text-muted)' }}
                    />
                ) : (
                    <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                        {relation.description}
                    </p>
                )
            )}

            {(relation.tags ?? []).length > 0 && (
                <div className="flex flex-wrap gap-1">
                    {(relation.tags ?? []).map((tag, i) => (
                        <Tag key={i} tag={tag} editMode={editMode} onRemove={() => onRemoveTag(i)} alwaysRemovable={true} />
                    ))}
                </div>
            )}
            <TagAdder onAdd={onAddTag} compact existingTags={relation.tags ?? []} entityType="relation" />
        </div>
    );
};

// Ligne cyberware avec tags
export const CyberwareRow = ({ item, editMode, onChange, onRemove, onRemoveTag, onAddTag }) => (
    <div
        className="rounded-lg p-3 flex flex-col gap-2"
        style={{
            background: 'var(--color-surface-alt)',
            border:     '1px solid var(--color-border)',
        }}
    >
        <div className="flex items-start gap-2">
            <span className="text-base flex-shrink-0" style={{ color: 'var(--color-primary)' }}>⬡</span>
            <div className="flex-1 min-w-0">
                {editMode ? (
                    <input
                        type="text"
                        value={item.name ?? ''}
                        onChange={e => onChange({ name: e.target.value })}
                        placeholder="Nom de l'implant…"
                        className="bg-transparent text-sm font-semibold outline-none w-full"
                        style={{ color: 'var(--color-text)' }}
                    />
                ) : (
                    <span className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>{item.name}</span>
                )}
                {(editMode || item.option_text) && (
                    editMode ? (
                        <input
                            type="text"
                            value={item.option_text ?? ''}
                            onChange={e => onChange({ option_text: e.target.value })}
                            placeholder="Option choisie…"
                            className="bg-transparent text-xs outline-none w-full mt-0.5"
                            style={{ color: 'var(--color-text-muted)' }}
                        />
                    ) : (
                        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{item.option_text}</p>
                    )
                )}
            </div>
            {editMode && (
                <button onClick={onRemove} className="text-xs" style={{ color: 'var(--color-danger)' }}>✕</button>
            )}
        </div>
        {/* Tags */}
        {(item.tags ?? []).length > 0 && (
            <div className="flex flex-wrap gap-1">
                {(item.tags ?? []).map((tag, i) => (
                    <Tag key={i} tag={tag} editMode={editMode} onRemove={() => onRemoveTag(i)} />
                ))}
            </div>
        )}
        {editMode && <TagAdder onAdd={onAddTag} compact entityType="cyberware" />}
    </div>
);

// Ligne inventaire avec tags
export const ItemRow = ({ item, editMode, onChange, onRemove, onRemoveTag, onAddTag }) => (
    <div
        className="rounded-lg p-3 flex flex-col gap-2"
        style={{
            background: 'var(--color-surface-alt)',
            border:     '1px solid var(--color-border)',
        }}
    >
        <div className="flex items-center gap-2">
            {editMode ? (
                <>
                    <input
                        type="text"
                        value={item.name ?? ''}
                        onChange={e => onChange({ name: e.target.value })}
                        placeholder="Objet…"
                        className="flex-1 bg-transparent text-sm font-semibold outline-none"
                        style={{ color: 'var(--color-text)' }}
                    />
                    <input
                        type="number"
                        min="1"
                        value={item.quantity ?? 1}
                        onChange={e => onChange({ quantity: parseInt(e.target.value) || 1 })}
                        className="w-12 text-center rounded px-1 py-0.5 text-xs"
                        style={{
                            background: 'var(--color-surface)',
                            border:     '1px solid var(--color-border)',
                            color:      'var(--color-text)',
                        }}
                    />
                    <button onClick={onRemove} className="text-xs" style={{ color: 'var(--color-danger)' }}>✕</button>
                </>
            ) : (
                <>
                    <span className="flex-1 text-sm" style={{ color: 'var(--color-text)' }}>{item.name}</span>
                    {item.quantity > 1 && (
                        <span className="text-xs font-mono" style={{ color: 'var(--color-text-muted)' }}>×{item.quantity}</span>
                    )}
                </>
            )}
        </div>
        {(item.tags ?? []).length > 0 && (
            <div className="flex flex-wrap gap-1">
                {(item.tags ?? []).map((tag, i) => (
                    <Tag key={i} tag={tag} editMode={editMode} onRemove={() => onRemoveTag(i)} />
                ))}
            </div>
        )}
        {editMode && <TagAdder onAdd={onAddTag} compact entityType="item" />}
    </div>
);

