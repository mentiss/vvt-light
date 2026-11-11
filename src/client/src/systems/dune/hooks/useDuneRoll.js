// src/client/src/systems/dune/hooks/useDuneRoll.js
// Lancement d'un test 2D20 du joueur (un seul hook : fiche, fenêtre de jet).
// Contexte du moteur de dés, notation, roll(), puis effets du jet :
//   - Détermination consommée une fois le jet obtenu (C-16) ;
//   - Impulsion dépensée, Menace générée, complications envoyées au MJ.
// Les ressources de session passent par le socket dune:update-session-resources :
// dette connue du pattern 2D20 (src/client/CLAUDE.md), reprise telle quelle.

import { useState, useCallback } from 'react';
import { roll } from '@/features/dice/tools/diceEngine.js';
import { useSocket }  from '@/app/context/SocketContext.jsx';
import { useSession } from '@/app/context/SessionContext.jsx';
import { useFetch }   from '@/app/hooks/useFetch.js';
import { useSystem }  from '@/app/hooks/useSystem.js';
import duneConfig from '../config.jsx';
import { impulsionCost, poolSize, impulsionGain } from '../config/rules/roll.js';
import { traitLabel, characterFullName } from '../config/traits.js';

/**
 * @param {object}   character
 * @param {Function} onCharacterUpdate  (character) => void, PUT de la fiche
 */
export function useDuneRoll(character, onCharacterUpdate) {
    const { apiBase }         = useSystem();
    const fetchWithAuth       = useFetch();
    const socket              = useSocket();
    const { activeGMSession } = useSession();
    const [rolling, setRolling] = useState(false);

    const emitResource = useCallback((field, delta) => {
        if (socket && activeGMSession && delta) {
            socket.emit('dune:update-session-resources', { sessionId: activeGMSession, field, delta });
        }
    }, [socket, activeGMSession]);

    /**
     * @param {object}  p
     * @param {object}  [p.competence]      { key, rang, specialisation } ; facultative : un principe peut être lancé seul
     * @param {object}  p.principe          { key, rang }
     * @param {boolean} p.useSpecialisation la spécialisation s'applique à l'action
     * @param {number}  p.difficulty
     * @param {number}  p.impulsionDice     dés achetés en Impulsion (0 à 3)
     * @param {number}  p.threatDice        dés achetés en générant de la Menace
     * @param {boolean} p.useDetermination  un dé posé sur 1
     * @returns {Promise<object|null>} résultat d'afterRoll, null si le jet a échoué
     */
    const rollTest = useCallback(async ({
        competence, principe, useSpecialisation = false, difficulty,
        impulsionDice = 0, threatDice = 0, useDetermination = false,
    }) => {
        if (rolling || !principe) return null;
        const competenceRang = competence?.rang ?? 0;
        const withDetermination = useDetermination && (character.determination ?? 0) > 0;
        setRolling(true);
        try {
            const ctx = {
                apiBase,
                fetchFn:       fetchWithAuth,
                characterId:   character.id,
                characterName: characterFullName(character),
                sessionId:     activeGMSession ?? null,
                rollType:      'dune_2d20',
                label: [
                    competence && `${traitLabel(competence.key)} (${competence.rang})`,
                    `${traitLabel(principe.key)} (${principe.rang})`,
                ].filter(Boolean).join(' + '),
                systemData: {
                    nbDes:                  poolSize(impulsionDice, threatDice),
                    rang:                   competenceRang + principe.rang,
                    hasSpec:                !!competence?.specialisation?.trim(),
                    competenceRang,
                    selectedSpecialization: !!competence && useSpecialisation,
                    difficulte:             difficulty,
                    impulsionsDepensees:    impulsionDice,
                    menaceGeneree:          threatDice,
                    useDetermination:       withDetermination,
                },
            };
            const notation = duneConfig.dice.buildNotation(ctx);
            const result   = await roll(notation, ctx, duneConfig.dice);

            if (withDetermination) {
                onCharacterUpdate(prev => ({ ...prev, determination: Math.max(0, (prev.determination ?? 0) - 1) }));
            }
            emitResource('impulsions', -impulsionCost(impulsionDice));
            emitResource('menace', threatDice);
            emitResource('complications', result.complications);
            return result;
        } catch (err) {
            console.error('[useDuneRoll] roll error:', err);
            return null;
        } finally {
            setRolling(false);
        }
    }, [rolling, character, onCharacterUpdate, apiBase, activeGMSession, emitResource]);

    /**
     * Verse l'excédent dans la réserve d'Impulsion, plafonnée à 6 (C-3).
     * @returns {number} Impulsion réellement versée
     */
    const addExcessToImpulsion = useCallback((excess, currentImpulsion) => {
        const gain = impulsionGain(excess, currentImpulsion);
        emitResource('impulsions', gain);
        return gain;
    }, [emitResource]);

    return { rollTest, addExcessToImpulsion, rolling };
}
