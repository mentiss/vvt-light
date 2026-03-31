import React from "react";
import {Card} from "./Card.jsx";

/**
 *
 * @param {object} char
 * @param {boolean} editMode
 * @param {function} set
 * @param {boolean} showAvatar
 * @param {function} setShowAvatar
 * @returns {React.JSX.Element}
 * @constructor
 */
export const IdentityCard = ({ char, editMode, set, showAvatar, setShowAvatar }) => (
    <Card title="Identité">
        <div className="flex gap-3 items-start">
            {/* Avatar cliquable en édition */}
            <button
                onClick={() => editMode && setShowAvatar(true)}
                className="shrink-0 rounded-lg overflow-hidden bg-surface-alt border border-primary cp-neon-glow-el"
                style={{
                    width:      '56px',
                    height:     '56px',
                    cursor:     editMode ? 'pointer' : 'default',
                }}
            >
                {char?.avatar
                    ? <img src={char.avatar} alt="avatar" className="w-full h-full object-cover" />
                    : <span className="w-full h-full flex items-center justify-center text-2xl" style={{ color: 'var(--color-primary)' }}>⬡</span>
                }
            </button>

            <div className="flex-1 min-w-0 flex flex-col gap-2 ml-5">
                {/* Nom + Prénom */}
                {editMode ? (
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="text-xs cp-font-ui uppercase tracking-wide block mb-0.5" style={{ color: 'var(--color-text-muted)' }}>Prénom</label>
                            <input
                                type="text"
                                value={char?.prenom ?? ''}
                                onChange={e => set('prenom', e.target.value)}
                                placeholder="Prénom…"
                                className="w-full rounded-lg px-2 py-1 text-sm outline-none"
                                style={{ background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                            />
                        </div>
                        <div>
                            <label className="text-xs cp-font-ui uppercase tracking-wide block mb-0.5" style={{ color: 'var(--color-text-muted)' }}>Nom</label>
                            <input
                                type="text"
                                value={char?.nom ?? ''}
                                onChange={e => set('nom', e.target.value)}
                                placeholder="Nom…"
                                className="w-full rounded-lg px-2 py-1 text-sm outline-none"
                                style={{ background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                            />
                        </div>
                    </div>
                ) : (
                    <div>
                        <div className="font-bold text-base leading-tight" style={{ color: 'var(--color-text)' }}>
                            {[char?.prenom, char?.nom].filter(Boolean).join(' ') || 'Anonyme'}
                        </div>
                        <div className="text-xs cp-font-ui uppercase tracking-widest mt-0.5" style={{ color: 'var(--color-primary)' }}>
                            {char?.playbook || '—'}
                        </div>
                    </div>
                )}

                {/* Sexe */}
                {editMode ? (
                    <div>
                        <label className="text-xs cp-font-ui uppercase tracking-wide block mb-0.5" style={{ color: 'var(--color-text-muted)' }}>Sexe / Genre</label>
                        <input
                            type="text"
                            value={char?.sexe ?? ''}
                            onChange={e => set('sexe', e.target.value)}
                            placeholder="Libre…"
                            className="w-full rounded-lg px-2 py-1 text-sm outline-none"
                            style={{ background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                        />
                    </div>
                ) : char?.sexe ? (
                    <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{char.sexe}</div>
                ) : null}
            </div>
        </div>

        {/* Apparence — pleine largeur */}

        <div className="mt-4">
        {editMode ? (
            <>
                <label className="text-xs cp-font-ui uppercase tracking-wide block mb-0.5" style={{ color: 'var(--color-text-muted)' }}>Apparence</label>
                <textarea
                    value={char?.apparence ?? ''}
                    onChange={e => set('apparence', e.target.value)}
                    placeholder="Description physique, style vestimentaire, traits marquants…"
                    rows={2}
                    className="w-full rounded-lg px-2 py-1.5 text-xs resize-none outline-none"
                    style={{ background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                />
            </>
        ) : char?.apparence ? (
            <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>{char.apparence}</p>
        ) : null}
    </div>
    </Card>
);
