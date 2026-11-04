// src/client/src/systems/vileborn/hooks/useVilActions.js
// ─────────────────────────────────────────────────────────────────────────────
// Actions de jeu d'une fiche (lot 2) : chacune applique une règle pure
// (config/rules/character.js), enregistre le patch tout de suite et, au besoin,
// lance le d6 d'un don ou poste une ligne d'événement dans l'historique (Q32).
// Sert à la fiche joueur et à la fiche MJ (sans jets ni lignes d'historique).
//
// const actions = useVilActions({ character, sessionId, patch, isPlayer });
//   patch(objet) : enregistre les champs modifiés (PUT joueur ou PATCH MJ)
// ─────────────────────────────────────────────────────────────────────────────

import { useSystem } from '../../../hooks/useSystem.js';
import { useFetch } from '../../../hooks/useFetch.js';
import { ROLL_TYPES } from '../config.jsx';
import {
    displayName, sufferState, healState, addWound, spendAspiration, spendDuty, setGiftChecked, giftInfo,
    giftRollPatch, yieldToUrge, consumeReverie, REVERIE_TEXT, URGE_TEXT,
} from '../config/rules/character.js';
import { useVilRoll } from './useVilRoll.js';

export const useVilActions = ({ character: c, sessionId, patch, isPlayer = true }) => {
    const { apiBase } = useSystem();
    const fetchWithAuth = useFetch();
    const { launch } = useVilRoll();
    const name = displayName(c);

    // Ligne d'événement (Rêverie, Pulsion) : enregistrée comme un jet sans dé, diffusée à la table
    const postEvent = (label, text) => {
        if (!isPlayer || !sessionId) return;
        fetchWithAuth(`${apiBase}/dice/roll`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                session_id: sessionId, character_id: c.id, character_name: name, roll_type: ROLL_TYPES.event,
                notation: '—', roll_result: JSON.stringify({ type: 'event', label, text }), successes: 0, pool: 0,
            }),
        }).catch(err => console.error('[vileborn] événement :', err));
    };

    return {
        sufferState:  (key) => patch(sufferState(c, key)),
        healState:    (key) => patch(healState(key)),
        addWound:     () => patch(addWound(c)),
        toggleWound:  (w) => patch(c[w.field] ? { [w.field]: false, [w.note]: '' } : { [w.field]: true }),
        setWoundNote: (w, text) => patch({ [w.note]: text }),
        toggleOutOfPlay: () => patch({ outOfPlay: !c.outOfPlay }),
        spendAspiration: () => patch(spendAspiration(c)),
        spendDuty:    (stateKey) => patch(spendDuty(stateKey)),
        setTicks:     (n) => patch({ heritageTicks: c.heritageTicks === n ? n - 1 : n }),

        // Cocher un don : le joueur lance aussitôt le d6 de sa contrepartie s'il en a une
        toggleGift: async (index) => {
            const gift = c.gifts?.[index];
            if (!gift) return;
            if (gift.checked) { patch(setGiftChecked(c, index, false)); return; }
            const checked = setGiftChecked(c, index, true);
            const roll = giftInfo(gift)?.roll;
            if (!roll || !isPlayer) { patch(checked); return; }
            const result = await launch({
                characterId: c.id, characterName: name, sessionId: sessionId ?? null, label: gift.name, rollType: ROLL_TYPES.gift,
                systemData: { type: 'gift', giftName: gift.name, on: roll.on, effect: roll.effect },
            });
            patch({ ...checked, ...(result?.triggered ? giftRollPatch({ ...c, ...checked }, roll.effect) : {}) });
        },

        yieldToUrge: () => { patch(yieldToUrge(c)); postEvent(`Pulsion : ${c.urge}`, URGE_TEXT); },
        consumeReverie: () => { patch(consumeReverie(c)); postEvent('Rêverie consommée', REVERIE_TEXT); },

        setBonds: (bonds) => patch({ bonds }),
    };
};
