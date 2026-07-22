// src/client/src/systems/zoneblanche/components/layout/EquipmentSection.jsx
// Matériel d'équipe — pool unique partagé au niveau de la session.
//
// Ce composant est le PORTEUR D'ÉTAT : il charge le pool, écoute les mises à
// jour temps réel et expose les actions. La modale n'est que de l'affichage —
// c'est ce qui garantit qu'un ajout fait par un joueur apparaît instantanément
// chez tous les autres, modale ouverte ou non.
//
// Règles retenues :
//   · Pool unique d'équipe, visible et éditable depuis n'importe quelle fiche
//   · JAMAIS derrière le mode édition : c'est une action de jeu, toujours active
//   · Tous les joueurs ajoutent/retirent librement, pas de validation collective
//   · Budget affiché mais jamais bloquant — il se règle dans la régie MJ
//   · Un lot est une simple entrée de catalogue avec son propre prix
//   · Reset complet en un clic, avec confirmation
//   · Le MJ consulte et réinitialise, mais n'achète pas
//
// Toutes les écritures passent par les routes REST (jamais d'émission socket
// depuis un composant) ; le socket ne sert qu'à la réception.
//
// Props :
//   sessionId   — session active (null → section informative)
//   characterId — personnage courant (traçabilité de l'ajout)
//   readOnly    — true côté MJ

import React, { useState, useEffect, useCallback } from 'react';
import { useSocket } from '../../../../context/SocketContext.jsx';
import { useFetch }  from '../../../../hooks/useFetch.js';
import { useSystem } from '../../../../hooks/useSystem.js';
import EquipmentCatalogModal from '../modals/EquipmentCatalogModal.jsx';

const EquipmentSection = ({ sessionId, characterId, readOnly = false }) => {
    const { apiBase }   = useSystem();
    const socket        = useSocket();
    const fetchWithAuth = useFetch();

    const [state, setState]               = useState({ budget: 0, total: 0, items: [] });
    const [catalogOpen, setCatalogOpen]   = useState(false);
    const [confirmClear, setConfirmClear] = useState(false);
    const [busy, setBusy]                 = useState(false);

    // ── Chargement initial ────────────────────────────────────────────────
    useEffect(() => {
        if (!sessionId) return;
        fetchWithAuth(`${apiBase}/session-equipment/${sessionId}`)
            .then(r => (r.ok ? r.json() : null))
            .then(data => { if (data) setState(data); })
            .catch(() => {});
    }, [sessionId, apiBase]);

    // ── Réception temps réel ──────────────────────────────────────────────
    useEffect(() => {
        if (!socket) return;
        const onUpdate = (data) => {
            if (!data || data.sessionId !== sessionId) return;
            setState(data);
        };
        socket.on('zoneblanche:equipment-update', onUpdate);
        return () => socket.off('zoneblanche:equipment-update', onUpdate);
    }, [socket, sessionId]);

    // ── Écritures REST ────────────────────────────────────────────────────
    const call = useCallback(async (url, options) => {
        setBusy(true);
        try {
            const r = await fetchWithAuth(url, options);
            if (r.ok) setState(await r.json());
            else console.error('[zoneblanche] matériel — refus serveur :', url);
        } catch (e) {
            console.error('[zoneblanche] matériel :', e);
        } finally {
            setBusy(false);
        }
    }, []);

    const postItem = (payload) => call(`${apiBase}/session-equipment/${sessionId}/items`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ quantity: 1, characterId, ...payload }),
    });

    const addFromCatalog = (item) => postItem({ itemKey: item.key, label: item.nom, cost: item.cost });
    const addFree        = (label, cost) => postItem({ label, cost });

    const adjustQuantity = (itemId, delta) => call(
        `${apiBase}/session-equipment/${sessionId}/items/${itemId}`,
        { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ delta }) },
    );

    const removeLine = (itemId) => call(
        `${apiBase}/session-equipment/${sessionId}/items/${itemId}`, { method: 'DELETE' },
    );

    const clearPool = () => {
        call(`${apiBase}/session-equipment/${sessionId}/clear`, { method: 'POST' });
        setConfirmClear(false);
    };

    if (!sessionId) {
        return (
            <section>
                <div className="zb-eyebrow mb-2">Matériel d'équipe</div>
                <p className="text-sm text-muted">Aucune session active — le matériel est géré par session.</p>
            </section>
        );
    }

    const overBudget = state.budget > 0 && state.total > state.budget;

    return (
        <section>
            <div className="flex items-center justify-between gap-3 mb-3">
                <div className="zb-eyebrow">Matériel d'équipe</div>
                <span className={`zb-counter zb-mono px-3 py-1 rounded-sm text-sm ${overBudget ? '' : 'is-complete'}`}
                      title={overBudget ? 'Budget dépassé — la table tranche' : 'Dans le budget'}>
                    {state.total} / {state.budget}
                </span>
            </div>

            {/* Aperçu — la gestion fine se fait dans la modale */}
            <div className="space-y-1.5">
                {state.items.length === 0 && (
                    <p className="text-sm text-muted">Le matériel n'a pas encore été choisi.</p>
                )}

                {state.items.map(item => (
                    <div key={item.id} className="zb-equip-row">
                        <span className="flex-1 min-w-0 truncate text-sm text-default">
                            {item.label}
                            {item.itemKey === null && <span className="zb-eyebrow ml-2">scénario</span>}
                        </span>
                        <span className="zb-mono text-sm text-default w-6 text-center shrink-0">×{item.quantity}</span>
                        <span className="zb-mono text-sm text-muted w-8 text-right shrink-0">{item.lineTotal}</span>
                    </div>
                ))}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2 mt-3">
                <button type="button" onClick={() => setCatalogOpen(true)}
                        className="zb-btn-ghost px-4 py-2 rounded-sm text-sm">
                    {readOnly ? "Voir l'inventaire" : 'Gérer le matériel'}
                </button>

                {state.items.length > 0 && (
                    confirmClear ? (
                        <span className="flex items-center gap-2">
                            <span className="text-sm text-muted">Vider tout le matériel ?</span>
                            <button type="button" onClick={clearPool} disabled={busy}
                                    className="zb-btn-accent px-3 py-2 rounded-sm text-sm">Confirmer</button>
                            <button type="button" onClick={() => setConfirmClear(false)}
                                    className="zb-btn-ghost px-3 py-2 rounded-sm text-sm">Annuler</button>
                        </span>
                    ) : (
                        <button type="button" onClick={() => setConfirmClear(true)}
                                className="zb-btn-ghost px-4 py-2 rounded-sm text-sm">
                            Vider l'inventaire
                        </button>
                    )
                )}
            </div>

            <EquipmentCatalogModal
                open={catalogOpen}
                onClose={() => setCatalogOpen(false)}
                state={state}
                readOnly={readOnly}
                busy={busy}
                onAdd={addFromCatalog}
                onAddFree={addFree}
                onAdjustQuantity={adjustQuantity}
                onRemove={removeLine}
            />
        </section>
    );
};

export default EquipmentSection;