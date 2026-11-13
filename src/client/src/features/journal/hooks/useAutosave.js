// features/journal/hooks/useAutosave.js
// ─────────────────────────────────────────────────────────────────────────────
// Enregistrement automatique d'une note (documentations/plateforme/spec_journal.md J2-1) :
// les champs modifiés s'accumulent et partent après une courte pause dans la frappe,
// et tout de suite quand on change de note, quitte l'éditeur, cache l'onglet ou démonte
// le journal. État affiché : 'saved' | 'saving' | 'error' (un échec garde la saisie,
// qui repart au prochain enregistrement ou par retry()).
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const DELAY_MS = 1200;

/**
 * @param {(id: number, fields: object) => Promise<any>} save lève une erreur en cas d'échec
 */
export function useAutosave(save) {
    const pending = useRef(null);   // { id, fields } en attente
    const timer = useRef(null);
    const saveRef = useRef(save);
    const [status, setStatus] = useState('saved');

    useEffect(() => { saveRef.current = save; }, [save]);

    const flush = useCallback(async () => {
        clearTimeout(timer.current);
        const job = pending.current;
        if (!job) return;
        pending.current = null;
        setStatus('saving');
        try {
            await saveRef.current(job.id, job.fields);
            if (!pending.current) setStatus('saved');
        } catch (error) {
            console.error('[useAutosave] Error saving entry:', error);
            // La saisie n'est pas perdue : elle repart avec la suivante (ou par retry)
            const next = pending.current?.id === job.id ? pending.current.fields : {};
            if (!pending.current || pending.current.id === job.id) pending.current = { id: job.id, fields: { ...job.fields, ...next } };
            setStatus('error');
        }
    }, []);

    /** Met des champs en attente pour l'entrée id (une autre entrée en attente part d'abord). */
    const queue = useCallback((id, fields) => {
        if (pending.current && pending.current.id !== id) flush();
        pending.current = { id, fields: { ...(pending.current?.id === id ? pending.current.fields : {}), ...fields } };
        setStatus('saving');
        clearTimeout(timer.current);
        timer.current = setTimeout(flush, DELAY_MS);
    }, [flush]);

    // Onglet caché ou page quittée : on n'attend pas la pause ; démontage : idem
    useEffect(() => {
        const onHide = () => { if (document.visibilityState === 'hidden') flush(); };
        document.addEventListener('visibilitychange', onHide);
        window.addEventListener('pagehide', flush);
        return () => {
            document.removeEventListener('visibilitychange', onHide);
            window.removeEventListener('pagehide', flush);
            flush();
        };
    }, [flush]);

    return useMemo(() => ({ status, queue, flush, retry: flush }), [status, queue, flush]);
}
