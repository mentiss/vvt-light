// src/client/src/systems/cyberpunk/components/layout/SheetBody.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Corps de la fiche (spec_cyberpunk.md §4), commun à la fiche du joueur et à la vue
// MJ du personnage : une seule disposition, les mêmes composants.
//   - à gauche : identité, chrome, matos ;
//   - au centre : console stats × manœuvres, relations ;
//   - à droite : colonne des manœuvres, repliable ;
//   - en bas : directives.
// Différences selon `variant` :
//   player : bande des ressources en tête ; jets ; console réglable (glisser, épingle)
//   gm     : carte « Ressources et progression » (avec XP et avancements) ; pas de jet
//            (le MC ne lance pas les dés) ; console du joueur en lecture seule ;
//            case « accomplie » des directives
// État et écritures : useSheetEditor (editor).
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import AvatarUploader from '../../../../components/AvatarUploader.jsx';
import { usePersistedState } from '../../../../hooks/usePersistedState.js';
import { IdentityCard } from './IdentityCard.jsx';
import { Card } from './Card.jsx';
import { CyberwareRow, DirectiveRow, ItemRow, QuickAddItem, RelationRow } from './Rows.jsx';
import { MoveCard } from './MoveCard.jsx';
import { MoveConsole } from './MoveConsole.jsx';
import { ResourceStrip, ResourceCard } from './ResourceStrip.jsx';
import CyberpunkCatalogModal from '../modals/CyberpunkCatalogModal.jsx';
import CpIcon from '../ui/CpIcon.jsx';
import {
    STATS, consoleCandidates, resolveConsoleIds, groupConsole, placeInConsole, togglePinned,
} from '../../config.jsx';

// Disposition retenue par ce navigateur (colonne des manœuvres repliée ou non)
const LAYOUT_OPTIONS = {
    defaults: { movesOpen: true },
    validate: (v) => v !== null && typeof v === 'object' && typeof v.movesOpen === 'boolean',
};

const AIDER_INTERFERER = (linkScore) => ({
    name:        'Aider ou Interférer',
    description: 'Sur un succès en aide : +1 au jet. Sur un succès en interférence : -2 au jet. Tu t\'exposes aux mêmes conséquences.',
    stat:        'link',
    statValue:   linkScore,
});

const tmpId = () => `tmp_${Date.now()}_${Math.random()}`;

/**
 * @param {object}   editor       useSheetEditor(...)
 * @param {Array}    allMoves     bibliothèque des manœuvres (GET /moves)
 * @param {boolean}  movesLoading
 * @param {'player'|'gm'} variant
 * @param {function} [onRollStat] (stat) — joueur
 * @param {function} [onRollMove] (manœuvre) — joueur
 */
export const SheetBody = ({ editor, allMoves, movesLoading, variant = 'player', onRollStat, onRollMove }) => {
    const isGM = variant === 'gm';
    const { char, editMode, editableChar, setEditableChar, set, commit } = editor;

    const [layout, setLayout] = usePersistedState('cyberpunk', 'sheetLayout', LAYOUT_OPTIONS);
    const [dragMove, setDragMove] = useState(null);
    const [movesTab, setMovesTab] = useState('playbook');   // 'playbook' | 'base' | 'advancement'
    const [browseModal, setBrowseModal] = useState(null);   // 'cyberware' | 'items' | null
    const [showAvatar, setShowAvatar] = useState(false);

    const base = () => (editMode ? editableChar : char);   // fiche sur laquelle s'applique un changement

    // ── Manœuvres affichées dans la colonne ───────────────────────────────────
    const charMoveIds = new Set((char?.moves ?? []).map(m => m.id));
    const hasAdvancementUnlocked = (char?.baseAdvancements ?? 0) >= 5;
    const baseMovesAll = allMoves.filter(m => m.playbook === null && m.type === 'official');
    const playbookMovesAll = allMoves.filter(m => m.playbook === char?.playbook);
    // Hors édition : seulement les manœuvres débloquées. En édition : toutes.
    const playbookMovesShown = editMode ? playbookMovesAll : playbookMovesAll.filter(m => charMoveIds.has(m.id));
    const advancementMovesAll = allMoves.filter(m => m.type === 'official' && m.playbook !== null && m.playbook !== char?.playbook && !charMoveIds.has(m.id));
    const advancementMovesAcquired = (char?.moves ?? [])
        .filter(m => m.playbook !== null && m.playbook !== char?.playbook)
        .map(acquired => allMoves.find(m => m.id === acquired.id) ?? acquired);
    const movesDisplay = movesTab === 'base' ? baseMovesAll
        : movesTab === 'playbook' ? playbookMovesShown
            : (editMode ? advancementMovesAll : advancementMovesAcquired);
    const showAdvancementTab = advancementMovesAcquired.length > 0 || (editMode && hasAdvancementUnlocked);
    const playbookAcquiredCount = (char?.moves ?? []).filter(m => m.playbook && m.playbook === char?.playbook).length;

    // ── Console de manœuvres ──────────────────────────────────────────────────
    const consoleMoves = consoleCandidates(allMoves, char?.moves ?? []);
    const consoleIds = resolveConsoleIds(char?.moveConsole ?? null, consoleMoves);
    const consoleRows = groupConsole(consoleIds, consoleMoves);
    const canSetConsole = !isGM;   // préférence du joueur : lecture seule côté MJ

    // ── Ressources et tags du personnage ──────────────────────────────────────
    const tagHandlers = {
        onAdd:           (text, variantId) => editor.addTag('character', char.id, text, variantId),
        onRemove:        (i) => editor.removeTag('character', char.id, i),
        onChangeVariant: (i, v) => editor.updateTag('character', char.id, i, v),
    };

    const toggleMoveAcquired = (move, isAcquired) => setEditableChar(prev => ({
        ...prev,
        moves: isAcquired
            ? (prev.moves ?? []).filter(m => m.id !== move.id)
            // Ajouter la manœuvre (sans coût XP : c'est l'édition libre)
            : [...(prev.moves ?? []), { id: move.id, name: move.name, stat: move.stat, description: move.description, playbook: move.playbook, type: move.type, isApproved: true }],
    }));

    return (
        <div className="flex flex-col h-full">
            {!isGM && <ResourceStrip char={char} onPatch={editor.patchResource} tagHandlers={tagHandlers} />}

            <div className="flex flex-1 min-h-0">
                {/* Corps de la fiche — défile */}
                <div className="cp-body cp-scroll">
                    {/* Colonne 1 : identité, (ressources MJ), chrome, matos */}
                    <div className="cp-col">
                        <IdentityCard char={char} editMode={editMode} set={set} setShowAvatar={setShowAvatar} />

                        {isGM && <ResourceCard char={char} onPatch={editor.patchResource} tagHandlers={tagHandlers} />}

                        <Card
                            title="Chrome"
                            action={<button onClick={() => setBrowseModal('cyberware')} className="cp-icon-btn" title="Parcourir le cyberware"><CpIcon name="catalog" /></button>}
                        >
                            {(char?.cyberware ?? []).length === 0 && !editMode && <p className="cp-empty">Aucun implant.</p>}
                            {(char?.cyberware ?? []).map((c, idx) => (
                                <CyberwareRow
                                    key={c.id ?? `new_${idx}`}
                                    item={c}
                                    editMode={editMode}
                                    onChange={(updated) => setEditableChar({
                                        ...base(),
                                        cyberware: base().cyberware.map((x, i) => (c.id ? x.id === c.id : i === idx) ? { ...x, ...updated } : x),
                                    })}
                                    onRemove={() => setEditableChar({
                                        ...base(),
                                        cyberware: base().cyberware.filter((x, i) => (c.id ? x.id !== c.id : i !== idx)),
                                    })}
                                    onRemoveTag={(tagIdx) => editor.removeTag('cyberware', c.id, tagIdx)}
                                    onAddTag={(text, v) => editor.addTag('cyberware', c.id, text, v)}
                                    onChangeTag={(tagIdx, v) => editor.updateTag('cyberware', c.id, tagIdx, v)}
                                />
                            ))}
                            {editMode && (
                                <button
                                    onClick={() => setEditableChar(prev => ({ ...prev, cyberware: [...(prev.cyberware ?? []), { name: '', option_text: '', notes: '', tags: [] }] }))}
                                    className="cp-add"
                                >
                                    + Ajouter un implant
                                </button>
                            )}
                        </Card>

                        <Card
                            title="Matos"
                            action={<button onClick={() => setBrowseModal('items')} className="cp-icon-btn" title="Parcourir le matos"><CpIcon name="catalog" /></button>}
                        >
                            {(char?.items ?? []).length === 0 && !editMode && <p className="cp-empty">Inventaire vide.</p>}
                            {(char?.items ?? []).map((item, idx) => (
                                <ItemRow
                                    key={item.id ?? `new_${idx}`}
                                    item={item}
                                    editMode={editMode}
                                    onChange={(updated) => commit({
                                        ...base(),
                                        items: base().items.map((x, i) => (item.id ? x.id === item.id : i === idx) ? { ...x, ...updated } : x),
                                    })}
                                    onRemove={() => commit({ ...base(), items: base().items.filter((x, i) => (item.id ? x.id !== item.id : i !== idx)) })}
                                    onRemoveTag={(tagIdx) => editor.removeTag('item', item.id, tagIdx)}
                                    onAddTag={(text, v) => editor.addTag('item', item.id, text, v)}
                                    onChangeTag={(tagIdx, v) => editor.updateTag('item', item.id, tagIdx, v)}
                                />
                            ))}
                            {/* Ajout rapide — toujours visible */}
                            <QuickAddItem onAdd={(newItem) => commit({ ...base(), items: [...(base().items ?? []), newItem] })} />
                        </Card>
                    </div>

                    {/* Colonne 2 : console stats × manœuvres, relations */}
                    <div className="cp-col">
                        <MoveConsole
                            rows={consoleRows}
                            values={char}
                            editMode={editMode}
                            readOnly={!canSetConsole}
                            maxStat={(editableChar?.baseAdvancements ?? 0) >= 5 ? 3 : 2}
                            onStatChange={set}
                            dragMove={dragMove}
                            onDragStart={setDragMove}
                            onDragEnd={() => setDragMove(null)}
                            onDrop={(moveId, beforeId) => { setDragMove(null); editor.saveConsole(placeInConsole(consoleIds, moveId, beforeId)); }}
                            onUnpin={(moveId) => editor.saveConsole(consoleIds.filter(id => id !== moveId))}
                            onReset={() => editor.saveConsole(resolveConsoleIds(null, consoleMoves))}
                            onRollStat={onRollStat}
                            onRollMove={onRollMove}
                        />

                        <Card title="Relations">
                            {(char?.relations ?? []).length === 0 && !editMode && <p className="cp-empty">Aucune relation.</p>}
                            {(char?.relations ?? []).map((r) => {
                                const rKey = r._tempId ?? r.id;
                                return (
                                    <RelationRow
                                        key={rKey}
                                        relation={r}
                                        editMode={editMode}
                                        onChange={(updated) => setEditableChar(prev => ({
                                            ...prev,
                                            relations: prev.relations.map(x => ((x._tempId ?? x.id) === rKey ? { ...x, ...updated } : x)),
                                        }))}
                                        onRemoveTag={(tagIdx) => editor.removeTag('relation', r.id, tagIdx)}
                                        onAddTag={(text, v) => editor.addTag('relation', r.id, text, v)}
                                        onChangeTag={(tagIdx, v) => editor.updateTag('relation', r.id, tagIdx, v)}
                                        onRemove={() => setEditableChar(prev => ({ ...prev, relations: prev.relations.filter(x => (x._tempId ?? x.id) !== rKey) }))}
                                        onRoll={onRollMove ? (linkScore) => onRollMove(AIDER_INTERFERER(linkScore)) : undefined}
                                    />
                                );
                            })}
                            {editMode && (
                                <button
                                    onClick={() => setEditableChar(prev => ({
                                        ...prev,
                                        relations: [...(prev.relations ?? []), { _tempId: tmpId(), name: '', description: '', link_score: 1, tags: [] }],
                                    }))}
                                    className="cp-add"
                                >
                                    + Ajouter une relation
                                </button>
                            )}
                        </Card>
                    </div>

                    {/* Rangée du bas : directives, personnelles et de mission côte à côte */}
                    <div className="cp-bottom">
                        <Card title="Directives">
                            <div className="cp-dirs">
                                {[['personal', 'Personnelles'], ['mission', 'De mission']].map(([type, label]) => {
                                    const list = (char?.directives ?? []).filter(d => d.type === type);
                                    return (
                                        <div key={type} className="flex flex-col gap-1">
                                            <span className="cp-subh">{label}</span>
                                            {list.map((d, i) => (
                                                <DirectiveRow
                                                    key={d.id ?? d._tempId ?? i}
                                                    directive={d}
                                                    editMode={editMode}
                                                    onToggle={isGM ? () => editor.toggleDirective(d) : undefined}
                                                    onChange={(updated) => setEditableChar(prev => ({
                                                        ...prev,
                                                        directives: prev.directives.map(x => ((x._tempId ?? x.id) === (d._tempId ?? d.id) ? { ...x, ...updated } : x)),
                                                    }))}
                                                    onRemove={() => setEditableChar(prev => ({
                                                        ...prev,
                                                        directives: prev.directives.filter(x => (x._tempId ?? x.id) !== (d._tempId ?? d.id)),
                                                    }))}
                                                />
                                            ))}
                                            {list.length === 0 && !editMode && <p className="cp-empty">Aucune.</p>}
                                            {editMode && (
                                                <button
                                                    onClick={() => setEditableChar(prev => ({
                                                        ...prev,
                                                        directives: [...(prev.directives ?? []), { _tempId: tmpId(), type, text: '', blankValue: '', completed: false }],
                                                    }))}
                                                    className="cp-add"
                                                >
                                                    + Ajouter
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </Card>
                    </div>
                </div>

                {/* ── Colonne des manœuvres : toujours visible, repliable à droite ── */}
                <aside className={`cp-moves ${layout.movesOpen ? '' : 'is-closed'}`}>
                    {layout.movesOpen ? (
                        <>
                            <div className="cp-moves-head">
                                <div className="cp-panel-head">
                                    <h2 className="cp-panel-title">Manœuvres</h2>
                                    <span className="cp-panel-rule" />
                                    <button type="button" className="cp-icon-btn" title="Replier la colonne"
                                            onClick={() => setLayout(prev => ({ ...prev, movesOpen: false }))}>»</button>
                                </div>
                                <div className="cp-seg">
                                    {[
                                        { id: 'playbook', label: char?.playbook || 'Playbook' },
                                        { id: 'base', label: 'De base' },
                                        ...(showAdvancementTab ? [{ id: 'advancement', label: 'Avancement' }] : []),
                                    ].map(t => (
                                        <button key={t.id} type="button" onClick={() => setMovesTab(t.id)} className={movesTab === t.id ? 'is-on' : ''}>
                                            {t.label}
                                        </button>
                                    ))}
                                </div>
                                {!editMode && canSetConsole && movesTab !== 'advancement' && (
                                    <p className="cp-moves-hint">Glissez une manœuvre sur sa stat, ou épinglez-la.</p>
                                )}
                                {editMode && <p className="cp-moves-hint">Mode Édition : un clic ajoute ou retire une manœuvre, sans coût d'XP.</p>}
                            </div>

                            <div className="cp-moves-scroll cp-scroll">
                                {movesLoading && <p className="cp-empty text-center">Chargement…</p>}
                                {!movesLoading && movesDisplay.map(move => {
                                    const isAcquired = charMoveIds.has(move.id);
                                    const handleClick = () => {
                                        if (editMode) toggleMoveAcquired(move, isAcquired);
                                        else if (move.stat && onRollMove) onRollMove(move);   // hors édition : jet (joueur)
                                    };
                                    const pinnable = canSetConsole && consoleMoves.has(move.id);
                                    return (
                                        <MoveCard
                                            key={move.id}
                                            move={move}
                                            isUnlocked={isAcquired || move.playbook === null}
                                            isAcquired={isAcquired}
                                            isEditMode={editMode}
                                            showFull={movesTab === 'advancement'}
                                            statValue={STATS.includes(move.stat) ? (char?.[move.stat] ?? 0) : null}
                                            rollable={!!onRollMove}
                                            pinned={consoleIds.includes(move.id)}
                                            onTogglePin={pinnable ? (m) => editor.saveConsole(togglePinned(consoleIds, m.id)) : undefined}
                                            onDragStart={pinnable ? setDragMove : undefined}
                                            onDragEnd={() => setDragMove(null)}
                                            onClick={handleClick}
                                        />
                                    );
                                })}
                                {!movesLoading && movesDisplay.length === 0 && <p className="cp-empty text-center">Aucune manœuvre.</p>}
                            </div>
                        </>
                    ) : (
                        <button type="button" className="cp-rail" title="Déplier les manœuvres"
                                onClick={() => setLayout(prev => ({ ...prev, movesOpen: true }))}>
                            <span className="cp-icon-btn">«</span>
                            <span className="cp-rail-label">Manœuvres</span>
                            <span className="cp-rail-count" title="Manœuvres du playbook acquises">{playbookAcquiredCount}</span>
                        </button>
                    )}
                </aside>
            </div>

            {showAvatar && (
                <AvatarUploader
                    currentAvatar={char.avatar}
                    onAvatarChange={(newAvatar) => setEditableChar(prev => ({ ...prev, avatar: newAvatar }))}
                    onClose={() => setShowAvatar(false)}
                />
            )}
            {/* Catalogue cyberware / inventaire (browseModal = nom du champ du personnage) */}
            {browseModal && (
                <CyberpunkCatalogModal
                    kind={browseModal}
                    onAdd={(entry) => {
                        const next = { ...base(), [browseModal]: [...(base()[browseModal] ?? []), entry] };
                        setEditableChar(next);
                        if (!editMode) commit(next);
                    }}
                    onClose={() => setBrowseModal(null)}
                />
            )}
        </div>
    );
};
