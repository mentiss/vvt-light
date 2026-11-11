// src/client/src/systems/dune/gm/tabs/TabHouse.jsx
// Onglet Maison de l'interface MJ : nom et description de la Maison de la table
// (ex-onglet Ressources ; les jauges sont dans la bande). Les joueurs la voient sur
// leur fiche. Pas de fiche de Maison plus complète : le livre de base n'en donne
// pas les règles (décision du MJ, spec_dune.md §6.6).

import React, { useState } from 'react';
import { useFetch }  from '@/app/hooks/useFetch.js';
import { useSystem } from '@/app/hooks/useSystem.js';
import { useSessionHouse } from '../../hooks/useSessionHouse.js';
import DuneIcon from '../../components/ui/DuneIcon.jsx';
import { DuneField, DuneFrame } from '../../components/ui/DuneFields.jsx';

const TabHouse = ({ activeSession }) => {
    const { apiBase } = useSystem();
    const fetchWithAuth = useFetch();
    const sessionId = activeSession?.id ?? null;
    const house = useSessionHouse(sessionId);
    const [draft, setDraft] = useState(null);

    if (!sessionId) return <div className="dn-empty"><p>Aucune table active</p></div>;

    const save = async () => {
        try {
            await fetchWithAuth(`${apiBase}/session-maison/${sessionId}`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(draft),
            });   // session-maison-update met la Maison à jour partout
            setDraft(null);
        } catch (err) {
            console.error('[dune/gm] maison :', err);
        }
    };

    return (
        <div className="p-6 max-w-3xl">
            <DuneFrame title="Maison de la table">
                {draft ? (
                    <div className="flex flex-col gap-3">
                        <DuneField label="Nom" value={draft.nom} onChange={v => setDraft(d => ({ ...d, nom: v }))} />
                        <DuneField label="Description" rows={6} value={draft.description} onChange={v => setDraft(d => ({ ...d, description: v }))} />
                        <div className="flex justify-end gap-2">
                            <button type="button" className="vtt-btn vtt-btn-sm" onClick={() => setDraft(null)}>Annuler</button>
                            <button type="button" className="vtt-btn vtt-btn-sm vtt-btn-primary" onClick={save}>Enregistrer</button>
                        </div>
                    </div>
                ) : (
                    <div className="flex gap-4 items-start">
                        <DuneIcon name="house" className="dn-ico w-12 h-12 text-secondary shrink-0" />
                        <div className="flex-1 min-w-0">
                            <div className="dn-name">{house?.nom?.trim() || 'Sans nom'}</div>
                            <p className="whitespace-pre-line text-muted mt-2">{house?.description?.trim() || 'Aucune description.'}</p>
                        </div>
                        <button type="button" className="vtt-btn vtt-btn-sm"
                                onClick={() => setDraft({ nom: house?.nom ?? '', description: house?.description ?? '' })}>
                            <DuneIcon name="quill" className="dn-ico w-4 h-4" />Édition
                        </button>
                    </div>
                )}
            </DuneFrame>
        </div>
    );
};

export default TabHouse;
