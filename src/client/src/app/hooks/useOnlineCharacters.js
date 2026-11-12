// src/client/src/app/hooks/useOnlineCharacters.js
// ─────────────────────────────────────────────────────────────────────────────
// Personnages en ligne du slug de la page : état initial par /api/online-characters
// (route globale), puis online-characters-update. Présences des autres slugs écartées :
// un même id peut exister dans un autre slug.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';
import { useSocket } from '../context/SocketContext.jsx';

/**
 * @param {string}  slug
 * @param {boolean} [enabled=true]
 * @returns {Array<object>} présences du slug ({ characterId, slug, name, playerName, socketId… })
 */
export function useOnlineCharacters(slug, enabled = true) {
    const socket = useSocket();
    const [online, setOnline] = useState([]);

    useEffect(() => {
        if (!socket || !enabled) return;
        const ofThisSlug = (chars) => setOnline((chars ?? []).filter(c => c.slug === slug));

        fetch('/api/online-characters')
            .then(r => r.json())
            .then(ofThisSlug)
            .catch(console.error);

        socket.on('online-characters-update', ofThisSlug);
        return () => socket.off('online-characters-update', ofThisSlug);
    }, [socket, slug, enabled]);

    return online;
}
