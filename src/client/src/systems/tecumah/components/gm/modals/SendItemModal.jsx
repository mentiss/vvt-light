// src/client/src/systems/tecumah/components/gm/tabs/SendItemModal.jsx
// Envoi d'un item du GM vers un joueur (ajout dans son inventaire).
// Appelle POST /api/tecumah/characters/:id/send-item
// Le serveur insère l'item et émet gm-item-received → toast côté joueur.

import React, { useState } from 'react';
import { useFetch }  from '../../../../../hooks/useFetch.js';
import { useSystem } from '../../../../../hooks/useSystem.js';
import Modal         from '../../../../../components/ui/Modal.jsx';

const CATEGORIES = [
    { value: 'misc',          label: 'Objet'       },
    { value: 'weapon_melee',  label: 'Arme CàC'    },
    { value: 'weapon_ranged', label: 'Arme à dist.' },
];

const SendItemModal = ({ characterId, characterName, onClose }) => {
    const { apiBase }   = useSystem();
    const fetchWithAuth = useFetch();

    const [name,        setName]        = useState('');
    const [description, setDescription] = useState('');
    const [category,    setCategory]    = useState('misc');
    const [quantity,    setQuantity]    = useState(1);
    const [damage,      setDamage]      = useState(0);
    const [sending,     setSending]     = useState(false);
    const [sent,        setSent]        = useState(false);

    const isWeapon = category !== 'misc';

    const handleSend = async () => {
        if (!name.trim() || sending) return;
        setSending(true);
        try {
            const r = await fetchWithAuth(`${apiBase}/characters/${characterId}/send-item`, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name:        name.trim(),
                    description: description.trim(),
                    category,
                    quantity:    Math.max(1, quantity),
                    damage:      isWeapon ? damage : 0,
                }),
            });
            if (r.ok) { setSent(true); setTimeout(onClose, 1200); }
        } catch (e) {
            console.error('[SendItemModal/tecumah]', e);
        } finally {
            setSending(false);
        }
    };

    return (
        <Modal title={`Envoyer un item → ${characterName}`} size="sm" onClose={onClose}>
                <div className="flex flex-col gap-3">
                    {sent ? (
                        <div className="text-center py-4" style={{ color: 'var(--color-success)', fontWeight: 700 }}>
                            ✓ Item envoyé !
                        </div>
                    ) : (
                        <>
                            <Field label="Nom *">
                                <input type="text" value={name} onChange={e => setName(e.target.value)}
                                       placeholder="Nom de l'item" autoFocus
                                       className="w-full rounded px-2 py-1 text-sm" style={inputSt} />
                            </Field>

                            <Field label="Catégorie">
                                <select value={category} onChange={e => setCategory(e.target.value)}
                                        className="w-full rounded px-2 py-1 text-sm" style={inputSt}>
                                    {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                                </select>
                            </Field>

                            <div className="grid grid-cols-2 gap-3">
                                <Field label="Quantité">
                                    <input type="number" min={1} value={quantity} onChange={e => setQuantity(Number(e.target.value))}
                                           className="w-full rounded px-2 py-1 text-sm" style={inputSt} />
                                </Field>
                                {isWeapon && (
                                    <Field label="Dégâts fixes">
                                        <input type="number" min={0} value={damage} onChange={e => setDamage(Number(e.target.value))}
                                               className="w-full rounded px-2 py-1 text-sm" style={inputSt} />
                                    </Field>
                                )}
                            </div>

                            <Field label="Description">
                                <textarea value={description} onChange={e => setDescription(e.target.value)}
                                          rows={2} placeholder="Optionnel…"
                                          className="w-full rounded px-2 py-1 text-sm" style={inputSt} />
                            </Field>

                            <div className="flex gap-2 pt-1">
                                <button onClick={onClose}
                                        className="flex-1 px-3 py-2 rounded text-sm"
                                        style={{ background: 'var(--color-surface-alt)', color: 'var(--color-text-muted)' }}>
                                    Annuler
                                </button>
                                <button onClick={handleSend} disabled={!name.trim() || sending}
                                        className="flex-1 px-3 py-2 rounded text-sm font-semibold"
                                        style={{ background: name.trim() ? 'var(--color-accent)' : 'var(--color-border)', color: 'var(--color-bg)', opacity: sending ? 0.6 : 1 }}>
                                    {sending ? 'Envoi…' : '🎁 Envoyer'}
                                </button>
                            </div>
                        </>
                    )}
                </div>
        </Modal>
    );
};

const Field = ({ label, children }) => (
    <label className="flex flex-col gap-1">
        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{label}</span>
        {children}
    </label>
);

const inputSt = {
    background: 'var(--color-surface-alt)',
    border:     '1px solid var(--color-border)',
    color:      'var(--color-text)',
};

export default SendItemModal;