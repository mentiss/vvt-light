// src/client/src/systems/cyberpunk/gm/GMCharacterView.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Vue MJ d'un personnage (spec_cyberpunk.md §6) : la même fiche que le joueur
// (SheetBody, useSheetEditor), en variante MJ :
//   - carte « Ressources et progression » (ressources, XP, avancements, tags) ;
//   - console du joueur en lecture seule ; aucun jet (le MC ne lance pas les dés) ;
//   - corrections par le même mode Édition que le joueur ;
//   - case « accomplie » des directives ;
//   - barre d'actions : copier les accès, envoyer un objet, envoyer une note.
// Montée avec key = id du personnage : changer de personnage repart d'un état propre.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import CopyAccessButton from '@/features/table/CopyAccessButton.jsx';
import { SheetBody } from '../components/layout/SheetBody.jsx';
import { Card } from '../components/layout/Card.jsx';
import { useSheetEditor } from '../hooks/useSheetEditor.js';
import CpIcon from '../components/ui/CpIcon.jsx';

const EMPTY_ITEM = { name: '', description: '', quantity: 1 };

/**
 * @param {object}   character   fiche complète
 * @param {function} onSave      (fiche) → enregistrement (PUT)
 * @param {Array}    allMoves
 * @param {boolean}  isOnline
 * @param {function} onSendItem  ({ name, description, quantity }) → Promise<boolean>
 * @param {function} onSendNote  ouvre l'envoi de note (GMSendModal)
 */
const GMCharacterView = ({ character, onSave, allMoves, isOnline, onSendItem, onSendNote }) => {
    const editor = useSheetEditor(character, onSave);
    const [itemForm, setItemForm] = useState(null);   // null = formulaire fermé
    const [itemMsg, setItemMsg] = useState(null);

    const sendItem = async () => {
        if (!itemForm?.name.trim()) return;
        const ok = await onSendItem(itemForm);
        setItemMsg(ok ? { type: 'success', text: `« ${itemForm.name} » envoyé.` } : { type: 'error', text: 'Envoi impossible.' });
        if (ok) setItemForm({ ...EMPTY_ITEM });
    };

    return (
        <div className="flex-1 min-w-0 flex flex-col h-full">
            {/* ── Barre d'actions du MJ ── */}
            <div className="cp-gm-actions">
                <span className={`cp-gm-online ${isOnline ? 'is-on' : ''}`} title={isOnline ? 'En ligne' : 'Hors ligne'} />
                <span className="cp-gm-name">{[character.prenom, character.nom].filter(Boolean).join(' ') || 'Anonyme'}</span>
                <span className="cp-gm-pb">{character.playbook || '—'}</span>
                <span className="flex-1" />
                {editor.editMode ? (
                    <>
                        <button type="button" className="cp-btn is-ghost is-sm" onClick={editor.cancel}>Annuler</button>
                        <button type="button" className="cp-btn is-primary is-sm" onClick={editor.save}>Sauvegarder</button>
                    </>
                ) : (
                    <button type="button" className="cp-btn is-sm" onClick={() => editor.setEditMode(true)}><CpIcon name="edit" size="sm" /> Édition</button>
                )}
                <CopyAccessButton character={character} className="cp-btn is-sm" />
                <button type="button" className="cp-btn is-sm" onClick={() => { setItemForm(f => (f ? null : { ...EMPTY_ITEM })); setItemMsg(null); }}>
                    <CpIcon name="catalog" size="sm" /> Envoyer un objet
                </button>
                <button type="button" className="cp-btn is-primary is-sm" onClick={onSendNote}>
                    <CpIcon name="journal" size="sm" /> Envoyer une note
                </button>
            </div>

            {/* ── Envoi d'un objet ── */}
            {itemForm && (
                <div className="cp-gm-send">
                    <Card title="Envoyer un objet">
                        {itemMsg && <p className={`text-xs ${itemMsg.type === 'success' ? 'text-success' : 'text-danger'}`}>{itemMsg.text}</p>}
                        <div className="cp-form-row">
                            <input className="cp-input flex-1" placeholder="Nom de l'objet *" value={itemForm.name} autoFocus
                                   onChange={e => setItemForm(p => ({ ...p, name: e.target.value }))} />
                            <input className="cp-input flex-1" placeholder="Description…" value={itemForm.description}
                                   onChange={e => setItemForm(p => ({ ...p, description: e.target.value }))} />
                            <span className="cp-stepper">
                                <button type="button" className="cp-step" onClick={() => setItemForm(p => ({ ...p, quantity: Math.max(1, p.quantity - 1) }))}>−</button>
                                <b className="cp-qty">×{itemForm.quantity}</b>
                                <button type="button" className="cp-step" onClick={() => setItemForm(p => ({ ...p, quantity: p.quantity + 1 }))}>+</button>
                            </span>
                            <button type="button" className="cp-btn is-ghost is-sm" onClick={() => setItemForm(null)}>Annuler</button>
                            <button type="button" className="cp-btn is-primary is-sm" disabled={!itemForm.name.trim()} onClick={sendItem}>Envoyer</button>
                        </div>
                    </Card>
                </div>
            )}

            <div className="flex-1 min-h-0">
                <SheetBody editor={editor} allMoves={allMoves} movesLoading={false} variant="gm" />
            </div>
        </div>
    );
};

export default GMCharacterView;
