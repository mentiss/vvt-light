// src/client/src/systems/zoneblanche/components/layout/IdentitySection.jsx
// Identité du personnage + Vérités (contractualisées avec le MJ).
// Réutilisé tel quel côté joueur (Sheet.jsx) et côté GM (TabSession.jsx).
//
// Props :
//   char           — personnage courant (buffer d'édition si editMode)
//   editMode       — booléen
//   set            — (field, value) → écrit dans le buffer d'édition
//   onAvatarClick  — ouverture de l'uploader d'avatar (optionnel)
//
// Le code d'accès n'apparaît pas ici : il est géré par AccessCodeModal
// depuis le menu hamburger (standard plateforme).

import React from 'react';
import { ARCHETYPES } from '../../config.jsx';

const archetypeLabel = (key) => ARCHETYPES.find(a => a.key === key)?.label ?? '—';

// ── Vérités ──────────────────────────────────────────────────────────────────

const VeritesBlock = ({ verites, editMode, set }) => {
    const list = verites ?? [];

    const update = (index, field, value) => {
        set('verites', list.map((v, i) => (i === index ? { ...v, [field]: value } : v)));
    };
    const remove = (index) => set('verites', list.filter((_, i) => i !== index));
    const add    = () => set('verites', [...list, { nom: '', texte: '' }]);

    return (
        <div className="mt-4">
            <div className="zb-eyebrow mb-2">Vérités</div>

            {list.length === 0 && !editMode && (
                <p className="text-sm text-muted">Aucune vérité enregistrée.</p>
            )}

            <div className="space-y-3">
                {list.map((v, i) => (
                    <div key={v.id ?? `verite-${i}`} className="zb-brief-card p-3 rounded-r-sm">
                        {editMode ? (
                            <div className="space-y-2">
                                <div className="flex gap-2">
                                    <input
                                        value={v.nom ?? ''}
                                        onChange={e => update(i, 'nom', e.target.value)}
                                        className="zb-input flex-1 px-3 py-2 rounded-sm text-sm font-semibold"
                                        placeholder="Nom de la vérité"
                                    />
                                    <button type="button" onClick={() => remove(i)}
                                            className="zb-btn-ghost px-3 rounded-sm text-sm" title="Supprimer">
                                        ✕
                                    </button>
                                </div>
                                <textarea
                                    value={v.texte ?? ''}
                                    onChange={e => update(i, 'texte', e.target.value)}
                                    rows={2}
                                    className="zb-input w-full px-3 py-2 rounded-sm text-sm"
                                    placeholder="Ce que cette vérité garantit…"
                                />
                            </div>
                        ) : (
                            <>
                                <div className="font-semibold text-default">{v.nom || '—'}</div>
                                {v.texte && <p className="text-sm text-muted mt-1">{v.texte}</p>}
                            </>
                        )}
                    </div>
                ))}
            </div>

            {editMode && (
                <button type="button" onClick={add}
                        className="zb-btn-ghost mt-3 px-4 py-2 rounded-sm text-sm">
                    + Ajouter une vérité
                </button>
            )}
        </div>
    );
};

// ── Section principale ───────────────────────────────────────────────────────

const IdentitySection = ({ char, editMode, set, onAvatarClick }) => {
    const nomComplet = [char?.prenom, char?.nom].filter(Boolean).join(' ') || 'Sans nom';
    const meta = [
        char?.sexe,
        char?.age    ? `${char.age} ans` : null,
        char?.taille ? `${char.taille} cm` : null,
    ].filter(Boolean).join(' · ');

    return (
        <section>
            <div className="flex items-start gap-4">
                {/* Avatar */}
                <button
                    type="button"
                    onClick={onAvatarClick}
                    disabled={!onAvatarClick}
                    className="zb-avatar shrink-0 rounded-sm overflow-hidden"
                    title={onAvatarClick ? "Changer l'avatar" : undefined}
                >
                    {char?.avatar
                        ? <img src={char.avatar} alt={nomComplet} className="w-full h-full object-cover" />
                        : <span className="zb-mono text-2xl text-muted">?</span>}
                </button>

                {/* Identité */}
                <div className="flex-1 min-w-0">
                    {editMode ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <input value={char?.prenom ?? ''} onChange={e => set('prenom', e.target.value)}
                                   className="zb-input px-3 py-2 rounded-sm" placeholder="Prénom" />
                            <input value={char?.nom ?? ''} onChange={e => set('nom', e.target.value)}
                                   className="zb-input px-3 py-2 rounded-sm" placeholder="Nom" />
                            <input value={char?.sexe ?? ''} onChange={e => set('sexe', e.target.value)}
                                   className="zb-input px-3 py-2 rounded-sm" placeholder="Sexe" />
                            <div className="grid grid-cols-2 gap-2">
                                <input type="number" value={char?.age ?? ''} onChange={e => set('age', e.target.value === '' ? null : Number(e.target.value))}
                                       className="zb-input zb-mono px-3 py-2 rounded-sm" placeholder="Âge" />
                                <input type="number" value={char?.taille ?? ''} onChange={e => set('taille', e.target.value === '' ? null : Number(e.target.value))}
                                       className="zb-input zb-mono px-3 py-2 rounded-sm" placeholder="Taille" />
                            </div>
                        </div>
                    ) : (
                        <>
                            <h2 className="zb-display text-2xl text-default leading-tight">{nomComplet}</h2>
                            <div className="zb-eyebrow mt-1">
                                {archetypeLabel(char?.archetype)}{meta ? ` · ${meta}` : ''}
                            </div>
                            {char?.playerName && (
                                <div className="text-sm text-muted mt-1">Joué par {char.playerName}</div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Description */}
            <div className="mt-4">
                <div className="zb-eyebrow mb-2">Description</div>
                {editMode ? (
                    <textarea
                        value={char?.description ?? ''}
                        onChange={e => set('description', e.target.value)}
                        rows={4}
                        className="zb-input w-full px-3 py-2 rounded-sm text-sm"
                        placeholder="Apparence, passé, ce qui l'a mené jusqu'ici…"
                    />
                ) : (
                    <p className="text-sm text-muted whitespace-pre-wrap">
                        {char?.description || '—'}
                    </p>
                )}
            </div>

            <VeritesBlock verites={char?.verites} editMode={editMode} set={set} />
        </section>
    );
};

export default IdentitySection;