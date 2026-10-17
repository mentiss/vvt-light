// src/client/src/systems/vikings/gm/modals/GMDiceModal.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Modale de jet MJ Vikings (diceEngine async) : pool de d10, seuil, explosion.
// Broadcast : le MJ peut rendre le jet visible dans l'historique
// (ctx.persistHistory = broadcast ; false = jet secret).
// Habillage : planche du lot 4 (pastille au lieu de la case à cocher).
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useCallback } from 'react';
import { roll } from '../../../../tools/diceEngine.js';
import { splitDiceWaves } from '../../config/rules.js';
import { useFetch }  from '../../../../hooks/useFetch.js';
import { useSystem } from '../../../../hooks/useSystem.js';
import VkModal from '../../components/ui/VkModal.jsx';
import VkIcon  from '../../components/ui/VkIcon.jsx';

// Hooks MJ inline — minimalistes, pas de logique Vikings
const GM_DICE_HOOKS = {
    buildNotation: (ctx) => {
        const { pool, explosionMin, threshold } = ctx.systemData;
        return `${pool}d10!>=${explosionMin}>=${threshold}`;
    },
    afterRoll: (raw, ctx) => ({
        allDice:   raw.allDice,
        successes: raw.groups[0].values.filter(v => v >= ctx.systemData.threshold).length,
        total:     null,
        flags:     raw.flags,
        detail: {
            pool:      ctx.systemData.pool,
            threshold: ctx.systemData.threshold,
            explosionMin: ctx.systemData.explosionMin,
        },
        meta: {},
    }),
    // Le moteur ne fournit plus raw.groups[i].waves : les vagues d'explosion se
    // reconstruisent depuis les faces, comme pour les jets joueurs (splitDiceWaves).
    buildAnimationSequence: (raw, ctx) => {
        const { explosionMin } = ctx.systemData;
        const thresholds = Array.from({ length: 11 - explosionMin }, (_, i) => explosionMin + i);
        return {
            mode: 'single',
            groups: [{ id: 'main', diceType: 'd10', color: 'default', label: 'Jet MJ', waves: splitDiceWaves(raw.groups[0].values, thresholds) }],
        };
    },
};

const Row = ({ label, value, onMinus, onPlus }) => (
    <div className="flex items-center justify-between gap-4">
        <span className="vk-label text-lg">{label}</span>
        <div className="vk-stepper">
            <button type="button" onClick={onMinus}><VkIcon name="minus" /></button>
            <span className="vk-num">{value}</span>
            <button type="button" onClick={onPlus}><VkIcon name="plus" /></button>
        </div>
    </div>
);

const GMDiceModal = ({ onClose, sessionId = null }) => {
    const [pool,      setPool]      = useState(3);
    const [threshold, setThreshold] = useState(7);
    const [explosion, setExplosion] = useState(10);
    const [rolling,   setRolling]   = useState(false);
    const [result,    setResult]    = useState(null);
    const [broadcast, setBroadcast] = useState(false);

    const fetchWithAuth = useFetch();
    const { apiBase }   = useSystem();

    const handleRoll = useCallback(async () => {
        if (rolling) return;
        setRolling(true);
        setResult(null);
        try {
            const ctx = {
                apiBase,
                fetchFn:        fetchWithAuth,
                characterId:    null,
                characterName:  'MJ',
                sessionId,
                rollType:       'vikings_gm',
                label:          'Jet MJ',
                persistHistory: broadcast,
                systemData: { pool, threshold, explosionMin: explosion },
            };
            const res = await roll(GM_DICE_HOOKS.buildNotation(ctx), ctx, GM_DICE_HOOKS);
            setResult(res);
        } catch (err) {
            console.error('[GMDiceModal] handleRoll error:', err);
        } finally {
            setRolling(false);
        }
    }, [rolling, pool, threshold, explosion, broadcast, sessionId, apiBase, fetchWithAuth]);

    return (
        <VkModal title="Jet MJ" icon="die" onClose={onClose} size="max-w-md">
            <div className="space-y-3 mb-4">
                <Row label="Pool d10"     value={pool}           onMinus={() => setPool(p => Math.max(1, p - 1))}                     onPlus={() => setPool(p => Math.min(10, p + 1))} />
                <Row label="Seuil succès" value={`${threshold}+`} onMinus={() => setThreshold(t => Math.max(1, t - 1))}               onPlus={() => setThreshold(t => Math.min(10, t + 1))} />
                <Row label="Explosion"    value={`${explosion}+`} onMinus={() => setExplosion(e => Math.max(threshold + 1, e - 1))}   onPlus={() => setExplosion(e => Math.min(10, e + 1))} />
                <div className="flex gap-1.5">
                    <button type="button" className={`vk-pill ${!broadcast ? 'is-selected' : ''}`} onClick={() => setBroadcast(false)}>Jet secret</button>
                    <button type="button" className={`vk-pill ${broadcast ? 'is-selected' : ''}`} onClick={() => setBroadcast(true)}>Visible dans l'historique</button>
                </div>
            </div>

            {result && (
                <div className="vk-callout text-center mb-4">
                    <div className="vk-title text-2xl mb-2">{result.successes} succès</div>
                    <div className="flex flex-wrap gap-2 justify-center mb-2">
                        {(result.allDice || []).map((die, idx) => (
                            <span key={idx} className={`vk-die ${die >= explosion ? 'is-explode' : die >= threshold ? 'is-success' : ''}`}>{die}</span>
                        ))}
                    </div>
                    <div className="text-xs text-muted">{pool}d10 · seuil {threshold}+ · explosion {explosion}+</div>
                </div>
            )}

            <button type="button" onClick={handleRoll} disabled={rolling} className="vk-btn vk-btn-primary w-full py-2.5">
                <VkIcon name="die" />{rolling ? 'Les dés roulent…' : 'Lancer'}
            </button>
        </VkModal>
    );
};

export default GMDiceModal;
