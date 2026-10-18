// components/gm/OnlinePlayersPanel.jsx - Panel des joueurs en ligne
import React from 'react';
import useSystem from "../../hooks/useSystem.js";
import {useSession} from "../../context/SessionContext.jsx";

// sessionId : session active du MJ, fournie par le GMApp du slug (ne pas instancier
// useGMSession ici : son démontage ferait quitter la session au MJ)
const OnlinePlayersPanel = ({
                                onlineCharacters,
                                combatState,
                                onAddPlayerToCombat,
                                sessionId,
                            }) => {
    // Hooks avant tout return anticipé (règle des hooks)
    const { slug } = useSystem();
    if (onlineCharacters.length === 0 || combatState.active) {
        return null;
    }
    const combatants = combatState.combatants ?? [];
    const currentOnlineCharacters = onlineCharacters.filter((c) => c.slug === slug && c.sessionId === sessionId);
    return (
        <div className="bg-white dark:bg-viking-brown rounded-lg shadow-lg border-2 border-viking-bronze p-4 mb-4">
            <h2 className="text-xl font-bold text-viking-brown dark:text-viking-parchment mb-4">
                👥 Joueurs en ligne ({currentOnlineCharacters.length})
            </h2>
            <div className="space-y-2">
                {currentOnlineCharacters.map(char => {
                    const alreadyAdded = combatants.some(c => c.characterId === char.characterId);

                    return (
                        <div
                            key={char.characterId}
                            className="flex justify-between items-center p-2 bg-viking-parchment dark:bg-gray-800 rounded"
                        >
                            <div>
                                <div className="font-bold text-viking-brown dark:text-viking-parchment">
                                    {char.name}
                                </div>
                                <div className="text-xs text-viking-leather dark:text-viking-bronze">
                                    Joueur: {char.playerName} | Agilité: {char.agilite} | Actions: {char.actionsMax}
                                </div>
                            </div>
                            <button
                                onClick={() => onAddPlayerToCombat(char)}
                                disabled={alreadyAdded}
                                className="px-3 py-1 bg-viking-bronze text-viking-brown rounded text-sm font-semibold hover:bg-viking-leather disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                {alreadyAdded ? '✓ Ajouté' : '+ Ajouter au combat'}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default OnlinePlayersPanel;