// src/client/src/systems/cyberpunk/components/layout/IdentityCard.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Identité (spec_cyberpunk.md §4) : portrait en « scan d'identité », prénom et nom
// (deux champs), genre, apparence, dark secret flouté jusqu'au survol.
// Partagée avec la vue MJ (TabSession, en lecture).
// ─────────────────────────────────────────────────────────────────────────────

import React from "react";
import { Card } from "./Card.jsx";
import ExpandableText from "../../../../components/ui/ExpandableText.jsx";

const Field = ({ label, children }) => (
    <label className="cp-field">
        <span className="cp-field-label">{label}</span>
        {children}
    </label>
);

/**
 * @param {object}   char
 * @param {boolean}  editMode
 * @param {function} set            (champ, valeur)
 * @param {function} setShowAvatar  ouvre le choix d'avatar (mode Édition)
 */
export const IdentityCard = ({ char, editMode, set, setShowAvatar }) => (
    <Card title="Identité">
        <div className="cp-id">
            <button
                type="button" className="cp-avatar" disabled={!editMode}
                onClick={() => editMode && setShowAvatar(true)}
                title={editMode ? 'Changer le portrait' : undefined}
            >
                {char?.avatar
                    ? <img src={char.avatar} alt="" />
                    : <svg viewBox="0 0 96 116" aria-hidden="true"><circle cx="48" cy="42" r="20" /><path d="M14 116c4-28 18-38 34-38s30 10 34 38" /></svg>}
            </button>

            <div className="flex-1 min-w-0 flex flex-col gap-2">
                {editMode ? (
                    <div className="grid grid-cols-2 gap-2">
                        <Field label="Prénom">
                            <input type="text" value={char?.prenom ?? ''} onChange={e => set('prenom', e.target.value)} placeholder="Prénom…" className="cp-input" />
                        </Field>
                        <Field label="Nom">
                            <input type="text" value={char?.nom ?? ''} onChange={e => set('nom', e.target.value)} placeholder="Nom…" className="cp-input" />
                        </Field>
                        <Field label="Sexe / Genre">
                            <input type="text" value={char?.sexe ?? ''} onChange={e => set('sexe', e.target.value)} placeholder="Libre…" className="cp-input" />
                        </Field>
                    </div>
                ) : (
                    <>
                        <div className="cp-name">
                            {char?.prenom && <small>{char.prenom}</small>}
                            {char?.nom || (!char?.prenom && 'Anonyme')}
                        </div>
                        <dl className="cp-fields">
                            <dt>Playbook</dt><dd className="cp-fields-pb">{char?.playbook || '—'}</dd>
                            {char?.sexe && <><dt>Genre</dt><dd>{char.sexe}</dd></>}
                        </dl>
                    </>
                )}
            </div>
        </div>

        {editMode ? (
            <>
                <Field label="Apparence">
                    <textarea value={char?.apparence ?? ''} onChange={e => set('apparence', e.target.value)} rows={2}
                              placeholder="Description physique, style vestimentaire, traits marquants…" className="cp-input resize-none" />
                </Field>
                <Field label="Dark secret (facultatif)">
                    <textarea value={char?.darkSecret ?? ''} onChange={e => set('darkSecret', e.target.value)} rows={2}
                              placeholder="Ce que personne ne doit savoir…" className="cp-input resize-none" />
                </Field>
            </>
        ) : (
            <>
                {char?.apparence && <p className="cp-line-desc"><ExpandableText text={char.apparence} /></p>}
                {char?.darkSecret && (
                    <div className="cp-secret" title="Survoler pour lire">
                        <b>Dark secret</b>
                        <span>{char.darkSecret}</span>
                    </div>
                )}
            </>
        )}
    </Card>
);
