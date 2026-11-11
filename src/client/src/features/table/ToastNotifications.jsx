// src/client/src/features/table/ToastNotifications.jsx
// Toasts génériques : jets de dés, messages GM, objets GM.
//
// Props :
//   sessionId        — filtre les jets sur la session active
//
// Rendu d'un jet : celui du slug, déclaré une fois dans son config.jsx
// (dice.renderHistoryEntry, dice.renderAllRollTypes), le même que l'historique
// (spec_ui_actions.md §6.4) ; absent ou null → rendu générique.
// Pile placée au-dessus de la zone d'actions (--vtt-actions-offset, ActionZone.jsx).
//
// ⚠️ Aucune classe CSS viking-* ici.
//    Les couleurs utilisent exclusivement les variables CSS génériques :
//    --color-surface, --color-border, --color-text, --color-text-muted,
//    --color-accent, --color-success, --color-danger, --color-bg.
//    Chaque slug définit ces variables dans son theme.css.

import React, { useState, useEffect } from 'react';
import { useSocket } from '@/app/context/SocketContext.jsx';
import { useAuth }   from '@/app/context/AuthContext.jsx';
import {stripHtml, firstImageSrc} from "@/ui/text/RichTextEditor.jsx";
import useSlugConfig from '@/app/hooks/useSlugConfig.js';
import { PLATFORM_ROLL_TYPES } from '@/features/dice/tools/diceHistory.js';
import GenericRollEntry from '@/features/dice/history/GenericRollEntry.jsx';

const TOAST_DICE_TTL    = 5000;
const TOAST_MESSAGE_TTL = 8000;

const ToastNotifications = ({
                                sessionId          = null,
                            }) => {
    const [toasts, setToasts] = useState([]);
    const socket              = useSocket();
    const { user }            = useAuth();
    const myCharacterId       = user?.character?.id;
    const slugDice            = useSlugConfig()?.dice;
    const renderDiceToast     = slugDice?.renderHistoryEntry ?? null;
    const renderAllRollTypes  = !!slugDice?.renderAllRollTypes;

    const add = (toast, ttl) => {
        setToasts(prev => [toast, ...prev].slice(0, 3));
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== toast.id)), ttl);
    };

    useEffect(() => {
        if (!socket) return;

        const onDice = (rollData) => {
            // Filtre session si précisée
            if (sessionId && rollData.session_id !== sessionId) return;

            add({
                id:        Date.now(),
                type:      'dice',
                animation: rollData.roll_result?.toastAnimation ?? 'default',
                ...rollData,
            }, TOAST_DICE_TTL);
        };

        const onGMMessage = (data) => {
            if (myCharacterId && data.characterId !== myCharacterId) return;
            add({
                id:        Date.now(),
                type:      'gm_message',
                animation: data.toastAnimation ?? 'default',
                title:     data.entry?.title   ?? 'Message du MJ',
                body:      data.entry?.body    ?? '',
                // Image jointe (anciens messages) ou première image du texte (spec_journal.md §2.8)
                imageUrl:  data.entry?.metadata?.imageUrl ?? firstImageSrc(data.entry?.body),
            }, TOAST_MESSAGE_TTL);
        };

        const onGMItem = (data) => {
            if (myCharacterId && data.characterId !== myCharacterId) return;
            add({
                id:           Date.now(),
                type:         'gm_item',
                animation:    data.toastAnimation ?? 'default',
                itemName:     data.item?.name     ?? 'Objet',
                itemCategory: data.item?.category ?? 'misc',
            }, TOAST_MESSAGE_TTL);
        };

        // Initiative (spec_initiative.md §4.5, Q-11) : « À toi de jouer » quand le personnage
        // du joueur devient actif ; éphémère, rien dans l'historique
        const myKey = myCharacterId ? `c${myCharacterId}` : null;
        let lastActive = null;
        const onInitiative = (payload) => {
            if (sessionId && payload?.sessionId !== sessionId) return;
            const active = payload?.state?.activeKey ?? null;
            if (myKey && active === myKey && lastActive !== myKey) {
                add({ id: Date.now(), type: 'turn', animation: 'default' }, TOAST_DICE_TTL);
            }
            lastActive = active;
        };

        socket.on('dice-roll',          onDice);
        socket.on('gm-message-received', onGMMessage);
        socket.on('gm-item-received',    onGMItem);
        socket.on('initiative-state',    onInitiative);

        return () => {
            socket.off('dice-roll',           onDice);
            socket.off('gm-message-received', onGMMessage);
            socket.off('gm-item-received',    onGMItem);
            socket.off('initiative-state',    onInitiative);
        };
    }, [socket, sessionId, myCharacterId]);

    const remove = (id) => setToasts(prev => prev.filter(t => t.id !== id));

    const animClass = (a) => ({
        default:  'animate-slide-in-right',
        shake:    'animate-toast-shake',
        flash:    'animate-toast-flash',
        glitter:  'animate-toast-glitter',
    }[a] ?? 'animate-slide-in-right');

    if (!toasts.length) return null;

    return (
        <div className="vtt-toasts fixed right-4 z-50 flex flex-col gap-2">
            {toasts.map(toast => (
                <div key={toast.id} className={animClass(toast.animation)}>

                    {/* ── Message GM ──────────────────────────────────────── */}
                    {toast.type === 'gm_message' && (
                        <ToastShell
                            onClose={() => remove(toast.id)}
                            accent={toast.animation === 'glitter'}
                        >
                            <div className="flex items-start gap-2">
                                <span style={{ fontSize: '1.2rem' }}>📩</span>
                                <div className="min-w-0">
                                    <p style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--color-text)' }}>
                                        {toast.title}
                                    </p>
                                    {toast.body && (
                                        <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: 2 }}>
                                            {stripHtml(toast.body).slice(0, 120)}{stripHtml(toast.body).length > 120 ? '…' : ''}
                                        </p>
                                    )}
                                    {toast.imageUrl && (
                                        <img
                                            src={toast.imageUrl}
                                            alt=""
                                            className="mt-2 rounded max-h-24 object-cover"
                                        />
                                    )}
                                </div>
                            </div>
                        </ToastShell>
                    )}

                    {/* ── Initiative : à toi de jouer ─────────────────────── */}
                    {toast.type === 'turn' && (
                        <ToastShell onClose={() => remove(toast.id)} accent>
                            <p className="vtt-initiative-toast">À toi de jouer !</p>
                        </ToastShell>
                    )}

                    {/* ── Objet GM ────────────────────────────────────────── */}
                    {toast.type === 'gm_item' && (
                        <ToastShell onClose={() => remove(toast.id)}>
                            <div className="flex items-center gap-2">
                                <span style={{ fontSize: '1.2rem' }}>🎁</span>
                                <div>
                                    <p style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--color-text)' }}>
                                        Objet reçu !
                                    </p>
                                    <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-accent)' }}>
                                        {toast.itemName}
                                    </p>
                                    <p style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                                        Consultez votre inventaire
                                    </p>
                                </div>
                            </div>
                        </ToastShell>
                    )}

                    {/* ── Jet de dés ──────────────────────────────────────── */}
                    {toast.type === 'dice' && (
                        <ToastShell onClose={() => remove(toast.id)}>
                            {/* Header commun */}
                            <div className="flex items-center gap-2 mb-2">
                                <span style={{ fontSize: '1.1rem' }}>🎲</span>
                                <div className="min-w-0">
                                    <p style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {toast.character_name}
                                    </p>
                                    <p style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                                        {toast.label ?? toast.roll_type ?? 'Jet'}
                                    </p>
                                </div>
                            </div>

                            {/* Rendu slug-spécifique ou fallback générique */}
                            {(() => {
                                // Types plateforme → rendu générique, sauf opt-in slug
                                const isPlatformType = PLATFORM_ROLL_TYPES.includes(toast.roll_type);

                                // roll_result et raw_result arrivent en objets (route /dice/roll)
                                if (renderDiceToast && (!isPlatformType || renderAllRollTypes)) {
                                    const custom = renderDiceToast(toast);
                                    if (custom) return custom;
                                }

                                // Rendu de secours commun (libellé déjà dans l'en-tête)
                                return <GenericRollEntry roll={toast} showLabel={false} />;
                            })()}
                        </ToastShell>
                    )}
                </div>
            ))}
        </div>
    );
};

// ── Shell de toast — fond + bordure + bouton fermer ───────────────────────────
// Cadre habillable par le slug : .vtt-toast (et .is-accent), styles dans app/styles/index.css.

const ToastShell = ({ children, onClose, accent }) => (
    <div className={`vtt-toast p-3 min-w-64 max-w-sm relative ${accent ? 'is-accent' : ''}`}>
        <button
            onClick={onClose}
            style={{
                position: 'absolute', top: 6, right: 8,
                color: 'var(--color-text-muted)', fontSize: '1rem', lineHeight: 1,
            }}
        >
            ✕
        </button>
        {children}
    </div>
);

export default ToastNotifications;