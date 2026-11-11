// src/client/src/systems/woddavampire/components/layout/VdaCoterie.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Fiche de la coterie (spec_woddavampire.md §II.17.3, planche_coterie.html),
// même composant côté joueur et côté Conteur :
//   - en-tête : emblème, nom, description, table, membres, ancre ;
//   - Historiques communs : une carte par pool (total sur 10, encre = mises,
//     sang = histoire ; détail ; parts ; plafond ; « Retirer ma mise ») ;
//     Conteur : ajustement d'histoire (− / +), retrait au nom d'un joueur ;
//   - membres (la table entière, non-membres grisés), notes ;
//   - plume : édition des textes (joueurs de la table et Conteur) ; verser, retirer,
//     histoire, emblème : actions de jeu, enregistrées tout de suite.
// Les fenêtres sont rendues à côté de la feuille, pas dedans (les enfants de
// .vda-sheet sont en position relative, ce qui casserait leur fond fixe).
//
// Props : coterie, isGM, viewer (fiche du joueur, null côté Conteur),
//         characters (fiches de la table côté Conteur : { [id]: fiche }), send, error (useCoterie)
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import AvatarUploader from '@/ui/image/AvatarUploader.jsx';
import {
    POOL_MAX, backgroundLabel, poolCap, isOverAnchor, shownPools, stakeOf, isMember, memberStakes, isAtTable,
} from '../../config/rules/coterie.js';
import { VdaCorners, VdaSectionTitle, QuillIcon } from '../ui/VdaUi.jsx';
import { VdaContributeModal, VdaWithdrawModal, VdaAddPoolModal } from '../modals/VdaCoterieModals.jsx';

/** Points d'un pool : mises en encre, ajustement d'histoire positif en sang */
const PoolDots = ({ pool }) => {
    const staked = pool.contributions.reduce((s, c) => s + c.points, 0);
    const story = Math.max(0, pool.storyPoints);
    const ink = Math.min(pool.total, staked);
    return (
        <span className="vda-dots" aria-label={`${pool.total} sur ${POOL_MAX}`}>
            {Array.from({ length: POOL_MAX }, (_, i) => (
                <span key={i} className={`vda-dot${i < ink ? ' is-on' : i < ink + story && i < pool.total ? ' is-bonus' : ''}`} />
            ))}
        </span>
    );
};

/** Carte d'un Historique commun */
const PoolCard = ({ coterie, pool, isGM, viewerId, editing, detail, onDetail, onWithdraw, onStory }) => {
    const anchor = pool.backgroundKey === coterie.anchorKey;
    const name = (id) => coterie.table.find(t => t.characterId === id)?.name ?? `#${id}`;
    const myStake = viewerId ? stakeOf(coterie, viewerId, pool.backgroundKey) : 0;
    return (
        <div className={`vda-coterie-pool${anchor ? ' is-anchor' : ''}`}>
            <div className="vda-coterie-pool-head">
                <h4>{backgroundLabel(pool.backgroundKey)}{anchor && <span className="vda-coterie-anchor"><i aria-hidden="true" />Ancre</span>}</h4>
                <span className="vda-coterie-total">{pool.total} <small>/ {poolCap(coterie, pool.backgroundKey)}</small></span>
            </div>
            <PoolDots pool={pool} />
            {editing
                ? <input className="vda-input" placeholder="Détail (lieu, noms…)" value={detail} onChange={(e) => onDetail(e.target.value)} aria-label={`Détail : ${backgroundLabel(pool.backgroundKey)}`} />
                : pool.details && <p className="vda-coterie-detail">{pool.details}</p>}
            {isOverAnchor(coterie, pool) && <p className="vda-note is-negative">Au-dessus de l'ancre : échappe au contrôle de la coterie.</p>}
            <div className="vda-coterie-parts">
                {pool.contributions.map(c => (
                    <span key={c.characterId} className={c.characterId === viewerId ? 'is-me' : ''}>
                        <b>{name(c.characterId)}</b> {c.points}
                        {isGM && <button type="button" className="vda-coterie-x" onClick={() => onWithdraw(c.characterId)} title="Retirer cette mise" aria-label={`Retirer la mise de ${name(c.characterId)}`}>✕</button>}
                    </span>
                ))}
                {pool.storyPoints !== 0 && <span className="is-story">Histoire {pool.storyPoints > 0 ? '+' : ''}{pool.storyPoints}</span>}
            </div>
            <div className="vda-coterie-pool-actions">
                {myStake > 0 && <button type="button" className="vda-chip" onClick={() => onWithdraw(viewerId)}>Retirer ma mise</button>}
                {isGM && (
                    <span className="vda-coterie-story">Histoire
                        <button type="button" className="vtt-btn vtt-btn-sm" onClick={() => onStory(pool.storyPoints - 1)} aria-label="Histoire −1">−</button>
                        <b>{pool.storyPoints > 0 ? `+${pool.storyPoints}` : pool.storyPoints}</b>
                        <button type="button" className="vtt-btn vtt-btn-sm" onClick={() => onStory(pool.storyPoints + 1)} aria-label="Histoire +1">+</button>
                    </span>
                )}
            </div>
        </div>
    );
};

const VdaCoterie = ({ coterie, isGM, viewer = null, characters = {}, send, error }) => {
    const viewerId = viewer?.id ?? null;
    const canEdit = isGM || isAtTable(coterie, viewerId);   // la coterie est celle de toute la table (L-1)
    const [draft, setDraft] = useState(null);             // textes en édition, ou null
    const [modal, setModal] = useState(null);             // { kind: 'contribute' | 'withdraw' | 'pool', … }
    const [emblemOpen, setEmblemOpen] = useState(false);
    const pools = shownPools(coterie);
    const members = coterie.table.filter(t => isMember(coterie, t.characterId)).length;
    const anchorTotal = coterie.backgrounds.find(b => b.backgroundKey === coterie.anchorKey)?.total ?? 0;

    const startEdit = () => setDraft({
        name: coterie.name, description: coterie.description, notes: coterie.notes,
        details: Object.fromEntries(coterie.backgrounds.map(b => [b.backgroundKey, b.details])),
    });
    const saveEdit = async () => { if (await send('PATCH', '', draft)) setDraft(null); };
    // Fiche du personnage qui verse : la sienne côté joueur ; côté Conteur, choisie dans la fenêtre
    const characterOf = (id) => (id === viewerId ? viewer : characters[id]);

    return (
        <>
        <section className="vda-sheet vda-coterie">
            <VdaCorners />
            <div className="vda-coterie-id">
                <button type="button" className={`vda-coterie-emblem${canEdit ? ' is-editable' : ''}`} disabled={!canEdit}
                        onClick={() => canEdit && setEmblemOpen(true)} title={canEdit ? "Changer l'emblème" : undefined} aria-label="Emblème">
                    {coterie.emblem ? <img src={coterie.emblem} alt="" /> : <span aria-hidden="true">✠</span>}
                </button>
                <div className="min-w-0">
                    {draft ? <input className="vda-input vda-coterie-name-input" value={draft.name} onChange={(e) => setDraft(d => ({ ...d, name: e.target.value }))} aria-label="Nom de la coterie" />
                        : <h3 className="vda-coterie-name"><span className="vda-initial">{coterie.name.charAt(0)}</span>{coterie.name.slice(1)}</h3>}
                    {draft ? <textarea className="vda-textarea mt-1" rows={2} placeholder="Description" value={draft.description} onChange={(e) => setDraft(d => ({ ...d, description: e.target.value }))} />
                        : coterie.description && <p className="vda-coterie-desc">{coterie.description}</p>}
                    <div className="vda-coterie-facts">
                        <span><b>{members}</b> membre{members > 1 ? 's' : ''}</span>
                        <span>Ancre <b>{backgroundLabel(coterie.anchorKey)} {anchorTotal}</b></span>
                    </div>
                </div>
                {canEdit && (
                    <div className="vda-coterie-id-actions">
                        {draft ? <>
                            <button type="button" className="vtt-btn vtt-btn-sm" onClick={() => setDraft(null)}>Annuler</button>
                            <button type="button" className="vtt-btn vtt-btn-sm vtt-btn-primary" onClick={saveEdit}>Enregistrer</button>
                        </> : <button type="button" className="vtt-btn vtt-btn-sm vda-icon-btn" onClick={startEdit} title="Édition des textes" aria-label="Édition des textes"><QuillIcon /></button>}
                    </div>
                )}
            </div>

            <VdaSectionTitle>Historiques communs</VdaSectionTitle>
            <div className="vda-coterie-pools">
                {pools.map(pool => (
                    <PoolCard key={pool.backgroundKey} coterie={coterie} pool={pool} isGM={isGM} viewerId={viewerId} editing={!!draft}
                              detail={draft?.details?.[pool.backgroundKey] ?? ''}
                              onDetail={(text) => setDraft(d => ({ ...d, details: { ...d.details, [pool.backgroundKey]: text } }))}
                              onWithdraw={(characterId) => setModal({ kind: 'withdraw', characterId, backgroundKey: pool.backgroundKey })}
                              onStory={(storyPoints) => send('PUT', '/story', { backgroundKey: pool.backgroundKey, storyPoints })} />
                ))}
            </div>
            <div className="vda-coterie-btnrow">
                {isGM && <button type="button" className="vtt-btn" onClick={() => setModal({ kind: 'pool' })}>Ajouter un Historique</button>}
                {(isGM || viewer) && (
                    <button type="button" className="vtt-btn vtt-btn-primary" onClick={() => setModal({ kind: 'contribute' })}>
                        {isGM ? 'Verser pour un joueur' : 'Verser des points'}
                    </button>
                )}
            </div>

            <VdaSectionTitle>Membres</VdaSectionTitle>
            <div className="vda-coterie-members">
                {coterie.table.map(t => {
                    const stakes = memberStakes(coterie, t.characterId);
                    return (
                        <div key={t.characterId} className={`vda-coterie-member${stakes ? '' : ' is-out'}`}>
                            <span className="vda-coterie-av">{t.avatar ? <img src={t.avatar} alt="" /> : '✠'}</span>
                            <div className="min-w-0"><b>{t.name}</b><small>{t.playerName} · {stakes || 'pas encore membre'}</small></div>
                        </div>
                    );
                })}
            </div>

            <VdaSectionTitle>Notes</VdaSectionTitle>
            {draft
                ? <textarea className="vda-textarea" rows={4} value={draft.notes} onChange={(e) => setDraft(d => ({ ...d, notes: e.target.value }))} aria-label="Notes de la coterie" />
                : <p className="vda-coterie-notes">{coterie.notes || '—'}</p>}
        </section>

            {modal?.kind === 'contribute' && (
                <VdaContributeModal coterie={coterie} error={error} characters={isGM ? coterie.table.map(t => characters[t.characterId]).filter(Boolean) : [viewer]}
                                    onConfirm={(characterId, backgroundKey, points) => send('POST', `/contribute/${characterId}`, { backgroundKey, points })}
                                    onClose={() => setModal(null)} />
            )}
            {modal?.kind === 'withdraw' && (
                <VdaWithdrawModal coterie={coterie} error={error} character={characterOf(modal.characterId) ?? coterie.table.find(t => t.characterId === modal.characterId)}
                                  characterId={modal.characterId} backgroundKey={modal.backgroundKey}
                                  onConfirm={() => send('POST', `/withdraw/${modal.characterId}`, { backgroundKey: modal.backgroundKey })}
                                  onClose={() => setModal(null)} />
            )}
            {modal?.kind === 'pool' && (
                <VdaAddPoolModal coterie={coterie} error={error} onConfirm={(backgroundKey, storyPoints) => send('PUT', '/story', { backgroundKey, storyPoints })}
                                 onClose={() => setModal(null)} />
            )}
            {emblemOpen && (
                <AvatarUploader currentAvatar={coterie.emblem}
                                onAvatarChange={(emblem) => { send('PATCH', '', { emblem }); setEmblemOpen(false); }}
                                onClose={() => setEmblemOpen(false)} />
            )}
        </>
    );
};

export default VdaCoterie;
