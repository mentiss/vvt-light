// src/client/src/systems/maledictum/gm/tabs/TabSession.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Onglet Session de l'interface MJ (spec_maledictum.md §11.4) : musique et tableau
// partagé en tête de la colonne, « Début de séance » (Destin rechargé pour toute
// la table), agents de la table en vignettes de flux (présence, santé), fiche de
// l'agent choisi dans un pict-écran (planche_pict_ecran.html : cadre au thème du
// MJ, écran au thème de l'agent ; même assemblage que le joueur, jets à son nom),
// copie des accès et mode Édition dans le bandeau de l'écran. Tout part en envoi partiel (patchCharacter), le joueur le
// voit aussitôt.
// Supériorité du groupe réglable ici aussi (spec §13.2).
// Props : activeSession, onlineCharacters, patron, patronState, characters, order, loading, patchCharacter
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import TableSessionTools from '@/features/table/TableSessionTools.jsx';
import CopyAccessButton from '@/features/table/CopyAccessButton.jsx';
import TableManagementButton from '@/features/table/TableManagementButton.jsx';
import ConfirmModal from '@/ui/modal/ConfirmModal.jsx';
import MlSheet from '../../components/layout/MlSheet.jsx';
import MlEditForm from '../../components/layout/MlEditForm.jsx';
import SuperiorityControl from '../../components/ui/SuperiorityControl.jsx';
import { EditIcon, Orn, Tip } from '../../components/ui/MlUi.jsx';
import { displayName, derived } from '../../config/rules/character.js';
import { themeFor } from '../../config/rules/themes.js';
import { refillFate, isDying } from '../../config/rules/actions.js';
import { FACTION_BY_KEY, ROLE_BY_KEY } from '../../config/rules/creation.js';

const pad = (n) => String(n).padStart(2, '0');

/** Vignette de flux : un mini pict-écran par agent, à ses couleurs dans l'écran seulement */
const FeedRow = ({ c, online, selected, onSelect }) => {
    const d = derived(c);
    const dying = isDying(c);
    return (
        <Tip text={online ? 'En ligne' : 'Hors ligne'}>
            <button type="button" className={`im-feed${selected ? ' is-selected' : ''}${online ? ' is-online' : ''}${dying ? ' is-dying' : ''}`}
                    onClick={onSelect}>
                <span className="im-feed-led" aria-hidden="true" />
                <span className="im-feed-glass" data-livery={themeFor(c)}>{c.avatar ? <img src={c.avatar} alt="" /> : <Orn name="sigil" />}</span>
                <span className="min-w-0">
                    <b>{displayName(c)}</b>
                    <i>{FACTION_BY_KEY[c.factionKey]?.label ?? 'Sans faction'}{c.playerName ? ` · ${c.playerName}` : ''}</i>
                    <em>{dying ? 'À L\'AGONIE' : `BLS ${c.wounds ?? 0}/${d.woundsMax} · DST ${c.fate ?? 0} · COR ${c.corruption ?? 0}`}</em>
                </span>
            </button>
        </Tip>
    );
};

/** Pict-écran (planche_pict_ecran.html) : cadre au thème du MJ, écran au thème de l'agent */
const PictScreen = ({ c, index, patron, editing, tools, children }) => {
    const theme = themeFor(c);
    const p = patron?.data ?? {};
    const owner = [p.ordoLabel ?? 'Inquisition', [p.title, p.name].filter(Boolean).join(' ')].filter(Boolean).join(' · ');
    return (
        <div className="im-pict min-w-0">
            <div className="im-pict-head">
                <span className="im-pict-led" aria-hidden="true" />
                <span className="im-pict-kicker">Flux pict {pad(index + 1)} · {editing ? 'Correction du dossier' : 'Dossier d\'agent'}</span>
                <span className="im-pict-sigil" data-livery={theme}><Orn name="sigil" /></span>
                <span className="im-pict-id min-w-0">
                    <b>{displayName(c)}</b>
                    <small>{[FACTION_BY_KEY[c.factionKey]?.label, ROLE_BY_KEY[c.roleKey]?.label].filter(Boolean).join(' · ')}</small>
                </span>
                <span className="im-pict-tools">{tools}</span>
            </div>
            <div className="im-pict-glass im-gm-sheet" data-livery={theme}>{children}</div>
            <div className="im-pict-foot"><span>Cogitateur · {owner}</span><span className="im-pict-grille" aria-hidden="true" /></div>
        </div>
    );
};

const TabSession = ({ activeSession, onlineCharacters, patron, patronState, characters, order, loading, patchCharacter, onSessionChange }) => {
    const [selectedId, setSelectedId] = useState(null);
    const [draft, setDraft] = useState(null);           // brouillon du mode Édition de l'acolyte affiché
    const [refill, setRefill] = useState(false);

    const currentId = characters[selectedId] ? selectedId : order[0];
    const current = characters[currentId];

    if (!activeSession) return (
        <div className="im-tab-page flex flex-col items-start gap-3">
            <p className="im-empty">Aucune table active.</p>
            {/* Appel à choisir une table (spec_ui_menu.md §12) */}
            <TableManagementButton activeSessionId={null} onSelectTable={(session) => onSessionChange?.(session)} />
        </div>
    );

    const online = new Set((onlineCharacters ?? []).map(o => o.characterId));
    const select = (id) => { setSelectedId(id); setDraft(null); };
    const saveEdit = () => { patchCharacter(currentId, { ...draft }); setDraft(null); };

    return (
        <div className="im-tab-page im-gm-layout">
            <aside className="im-gm-table">
                <TableSessionTools sessionId={activeSession.id} className="vtt-btn vtt-btn-sm w-full" />
                {order.length > 0 && <button type="button" className="vtt-btn vtt-btn-sm w-full" onClick={() => setRefill(true)}>Début de séance (Destin)</button>}
                {patronState && <SuperiorityControl patronState={patronState} compact />}
                {loading && <p className="im-empty">Chargement…</p>}
                {!loading && order.length === 0 && <p className="im-empty">Aucun acolyte à cette table.</p>}
                {order.length > 0 && <div className="im-feed-label">Flux des agents</div>}
                {order.map(id => (
                    <FeedRow key={id} c={characters[id]} online={online.has(id)} selected={id === currentId} onSelect={() => select(id)} />
                ))}
            </aside>
            {current && (
                <PictScreen c={draft ?? current} index={order.indexOf(currentId)} patron={patron} editing={!!draft}
                            tools={draft ? (
                                <>
                                    <button type="button" className="im-pict-btn" onClick={() => setDraft(null)}>Annuler</button>
                                    <button type="button" className="im-pict-btn is-primary" onClick={saveEdit}>Enregistrer</button>
                                </>
                            ) : (
                                <>
                                    <CopyAccessButton character={current} className="im-pict-btn" />
                                    <Tip text="Mode Édition"><button type="button" className="im-pict-btn" onClick={() => setDraft({ ...current })}><EditIcon /> Édition</button></Tip>
                                </>
                            )}>
                    {draft
                        ? <MlEditForm draft={draft} setDraft={setDraft} />
                        : <MlSheet c={current} patch={(p) => patchCharacter(currentId, p)} patron={patron} sessionId={activeSession.id} theme={themeFor(current)} />}
                </PictScreen>
            )}
            {refill && (
                <ConfirmModal title="Début de séance" message="Le Destin de chaque acolyte de la table revient à son maximum." confirmText="Recharger"
                              onConfirm={() => { order.forEach(id => patchCharacter(id, refillFate(characters[id]))); setRefill(false); }} onCancel={() => setRefill(false)} />
            )}
        </div>
    );
};

export default TabSession;
