// src/client/src/pages/AudioProtoPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
// PROTOTYPE TEMPORAIRE (documentations/spec_audio.md §9.9), page /tools/audio sans
// connexion. Passe 2 : synchronisation entre plusieurs clients.
// - Meneur : choisit les vidéos et commande la lecture (relais socket/audioProto.js).
// - Auditeur : applique l'état reçu avec l'algorithme durable (components/audio/audioSync.js).
// Tous les clients affichent l'écart avec la position attendue et les recalages.
// À supprimer une fois la brique en place.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { applyTheme } from '../tools/utils.js';
import useSlugGuard from '../hooks/useSlugGuard.js';
import { useSocket } from '../context/SocketContext.jsx';
import { parseYouTubeLink } from '../components/audio/youtubeApi.js';
import { useYouTubePlayer, PLAYER_STATES } from '../components/audio/useYouTubePlayer.js';
import { clockSample, bestOffset, expectedPosition, planSync } from '../components/audio/audioSync.js';

const THRESHOLDS = [0.5, 1, 1.5, 3];
const SYNC_INTERVAL_MS = 1000;   // contrôle de l'écart
const COOLDOWN_MS = 3000;        // pas de nouveau recalage juste après un chargement ou un saut
const LOCAL_PAUSE_MS = 10000;    // simulation d'une pub ou d'une coupure
const PING_INTERVAL_MS = 10000;
const MAX_SAMPLES = 10;

// Lecteur caché : 1 × 1 px hors écran (un lecteur 0 × 0 reste affiché, §9.9)
const OFFSCREEN = { position: 'fixed', left: '-10000px', top: 0 };

const STATE_LABELS = {
    loading: 'Chargement de l\'API…', 'api-error': 'API YouTube injoignable', ready: 'Prêt',
    unstarted: 'Non démarré', ended: 'Terminé', playing: 'Lecture', paused: 'Pause', buffering: 'Mise en mémoire', cued: 'Chargé',
};
const STATUS_LABELS = { playing: 'en lecture', paused: 'en pause', stopped: 'arrêté' };

const formatTime = (s) => {
    const total = Math.max(0, Math.floor(s || 0));
    return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
};

const AudioProtoPage = ({ darkMode }) => {
    const mustReload = useSlugGuard();
    useEffect(() => { applyTheme(darkMode); }, [darkMode]);

    const socket = useSocket();
    const { containerRef: mainRef, player, state: mainState, error: mainError } = useYouTubePlayer({ width: 1, height: 1 });
    // Lecteur auxiliaire : import de playlist (meneur)
    const { containerRef: helperRef, player: helperPlayer, state: helperState } = useYouTubePlayer({ width: 1, height: 1 });

    const [role, setRole]           = useState('listener');
    const [unlocked, setUnlocked]   = useState(false);
    const [threshold, setThreshold] = useState(1.5);
    const [volume, setVolume]       = useState(50);
    const [server, setServer]       = useState(null);   // { state, serverTime, receivedAt }
    const [stats, setStats]         = useState({ offset: 0, rtt: null, expected: 0, actual: 0, drift: null, resyncs: 0, title: '' });
    const [queue, setQueue]         = useState([]);     // identifiants de vidéo (meneur)
    const [link, setLink]           = useState('');
    const [pendingList, setPendingList] = useState(false);
    const [log, setLog]             = useState([]);

    const note = useCallback((line) => setLog(prev => [`${new Date().toLocaleTimeString()} ${line}`, ...prev].slice(0, 40)), []);

    // Valeurs lues par la boucle de synchronisation, hors cycle de rendu
    const stateRef     = useRef(null);
    const samplesRef   = useRef([]);
    const loadedIdRef  = useRef(null);
    const cooldownRef  = useRef(0);
    const pauseUntilRef = useRef(0);
    const resyncsRef   = useRef(0);
    const settingsRef  = useRef({ unlocked, threshold });
    useEffect(() => { settingsRef.current = { unlocked, threshold }; }, [unlocked, threshold]);

    // ── Relais : entrée dans la room, état, heure du serveur ────────────────
    useEffect(() => {
        if (!socket) return;
        const onState = ({ state, serverTime }) => {
            stateRef.current = state;
            setServer({ state, serverTime, receivedAt: Date.now() });
        };
        const ping = () => {
            const sentAt = Date.now();
            socket.emit('proto-audio-ping', (serverTime) => {
                const sample = clockSample(sentAt, serverTime, Date.now());
                samplesRef.current = [...samplesRef.current, sample].slice(-MAX_SAMPLES);
            });
        };
        const join = () => { socket.emit('proto-audio-join'); for (let i = 0; i < 5; i++) setTimeout(ping, i * 300); };

        socket.on('proto-audio-state', onState);
        socket.on('connect', join);
        if (socket.connected) join();
        const pingId = setInterval(ping, PING_INTERVAL_MS);
        return () => {
            socket.off('proto-audio-state', onState);
            socket.off('connect', join);
            socket.emit('proto-audio-leave');
            clearInterval(pingId);
        };
    }, [socket]);

    // ── Boucle de synchronisation ───────────────────────────────────────────
    const runSync = useCallback((reason) => {
        const state = stateRef.current;
        if (!player || !state || !settingsRef.current.unlocked) return;

        const now = Date.now();
        const offset = bestOffset(samplesRef.current);
        const serverNow = now + offset;
        const currentTime = player.getCurrentTime?.() ?? 0;
        const playerState = PLAYER_STATES[player.getPlayerState?.()] ?? 'unstarted';

        const plan = planSync({ state, serverNow, loadedId: loadedIdRef.current, playerState, currentTime, threshold: settingsRef.current.threshold });
        const samples = samplesRef.current;
        const best = samples.length ? samples.reduce((a, s) => (s.rtt < a.rtt ? s : a)) : null;
        setStats(prev => ({
            ...prev, offset, rtt: best?.rtt ?? null,
            expected: expectedPosition(state, serverNow), actual: currentTime, drift: plan.drift ?? null,
            title: player.getVideoData?.()?.title ?? '',
        }));

        if (now < pauseUntilRef.current) return;                              // pause locale simulée
        if (plan.type !== 'load' && plan.type !== 'stop' && now < cooldownRef.current) return;

        switch (plan.type) {
            case 'stop':
                player.stopVideo();
                loadedIdRef.current = null;
                note(`Arrêt (${reason})`);
                break;
            case 'load':
                if (plan.autoplay) player.loadVideoById({ videoId: state.youtubeId, startSeconds: plan.position });
                else player.cueVideoById({ videoId: state.youtubeId, startSeconds: plan.position });
                loadedIdRef.current = state.youtubeId;
                cooldownRef.current = now + COOLDOWN_MS;
                note(`Chargement ${state.youtubeId} à ${formatTime(plan.position)}${plan.autoplay ? ', lecture' : ''} (${reason})`);
                break;
            case 'play':
                player.seekTo(plan.position, true);
                player.playVideo();
                cooldownRef.current = now + COOLDOWN_MS;
                note(`Lecture à ${formatTime(plan.position)} (${reason})`);
                break;
            case 'pause':
                player.pauseVideo();
                player.seekTo(plan.position, true);
                note(`Pause à ${formatTime(plan.position)} (${reason})`);
                break;
            case 'seek':
                player.seekTo(plan.position, true);
                cooldownRef.current = now + COOLDOWN_MS;
                resyncsRef.current += 1;
                setStats(prev => ({ ...prev, resyncs: resyncsRef.current }));
                note(`Recalage : écart ${plan.drift.toFixed(2)} s (${reason})`);
                break;
            default:
        }
    }, [player, note]);

    useEffect(() => { runSync('état reçu'); }, [server, runSync]);
    useEffect(() => {
        const id = setInterval(() => runSync('contrôle'), SYNC_INTERVAL_MS);
        return () => clearInterval(id);
    }, [runSync]);

    useEffect(() => { player?.setVolume(volume); }, [player, volume]);
    useEffect(() => { if (mainError) note(`Erreur YouTube ${mainError}`); }, [mainError, note]);

    useEffect(() => {
        const onVisibility = () => note(`Onglet ${document.visibilityState === 'visible' ? 'visible' : 'en arrière-plan'}`);
        document.addEventListener('visibilitychange', onVisibility);
        return () => document.removeEventListener('visibilitychange', onVisibility);
    }, [note]);

    // ── Meneur ──────────────────────────────────────────────────────────────
    const command = (action, extra = {}) => socket?.emit('proto-audio-command', { action, ...extra });
    const state = server?.state;
    const currentIndex = state?.youtubeId ? queue.indexOf(state.youtubeId) : -1;

    const playNext = useCallback(() => {
        const next = queue[currentIndex + 1];
        if (next) socket?.emit('proto-audio-command', { action: 'play', youtubeId: next });
        else socket?.emit('proto-audio-command', { action: 'stop' });
    }, [queue, currentIndex, socket]);

    // Enchaînement (le vrai serveur le fera par minuteur, §9.3)
    useEffect(() => {
        if (role === 'leader' && mainState === 'ended' && state?.status === 'playing') playNext();
    }, [role, mainState, state?.status, playNext]);

    // Import de playlist : le lecteur auxiliaire donne la liste des identifiants
    useEffect(() => {
        if (!pendingList || !helperPlayer || (helperState !== 'cued' && helperState !== 'unstarted')) return;
        const ids = helperPlayer.getPlaylist?.() ?? [];
        if (!ids.length) return;
        setQueue(prev => [...prev, ...ids.filter(id => !prev.includes(id))]);
        setPendingList(false);
        note(`Playlist importée : ${ids.length} vidéo(s)`);
    }, [pendingList, helperPlayer, helperState, note]);

    const addLink = () => {
        const parsed = parseYouTubeLink(link);
        if (!parsed) return;
        if (parsed.listId && helperPlayer) {
            setPendingList(true);
            helperPlayer.cuePlaylist({ listType: 'playlist', list: parsed.listId });
        } else if (parsed.videoId) {
            setQueue(prev => (prev.includes(parsed.videoId) ? prev : [...prev, parsed.videoId]));
        }
        setLink('');
    };

    const unlock = () => {
        setUnlocked(true);
        settingsRef.current = { ...settingsRef.current, unlocked: true };
        note('Son activé (clic)');
        runSync('activation');   // dans le geste de l'utilisateur
    };

    const localPause = () => {
        player?.pauseVideo();
        pauseUntilRef.current = Date.now() + LOCAL_PAUSE_MS;
        note('Pause locale de 10 s (simulation de pub)');
    };

    if (mustReload) return null;

    const ready = !!player;
    const isLeader = role === 'leader';

    return (
        <div className="vtt-platform flex flex-col">
            <header className="vtt-page-header">
                <div>
                    <h1 className="vtt-brand-name">Lecteur audio <span>prototype</span></h1>
                    <p className="text-xs text-muted mt-0.5">Synchronisation entre plusieurs clients</p>
                </div>
                <a className="vtt-btn vtt-btn-sm" href="/">Accueil</a>
            </header>

            <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
                <section className="vtt-panel p-4 space-y-2 text-sm">
                    <h2 className="vtt-section-title">Marche à suivre</h2>
                    <ol className="list-decimal pl-5 space-y-1">
                        <li>Un seul <strong>Meneur</strong> (toi), les autres en <strong>Auditeur</strong>. Chacun clique « Activer le son ».</li>
                        <li>Meneur : ajoute des liens (vidéo ou playlist), clique sur une vidéo pour la lancer.</li>
                        <li>Sur un même PC, laisse le son de toutes les pages : un décalage s'entend en écho.</li>
                        <li>Essaie : arrivée d'un auditeur en cours de morceau, pause, reprise, sauts, vidéo suivante, « Pause locale 10 s », onglet en arrière-plan.</li>
                        <li>Note par navigateur l'écart affiché en régime établi et le nombre de recalages.</li>
                    </ol>
                </section>

                <section className="vtt-panel p-4 space-y-4">
                    <div className="flex flex-wrap gap-4">
                        <div>
                            <span className="vtt-field-label">Rôle</span>
                            <div className="vtt-segmented">
                                {[['listener', 'Auditeur'], ['leader', 'Meneur']].map(([id, label]) => (
                                    <button key={id} type="button" className={`vtt-segment${role === id ? ' is-active' : ''}`} onClick={() => setRole(id)}>{label}</button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <span className="vtt-field-label">Tolérance avant recalage</span>
                            <div className="vtt-segmented">
                                {THRESHOLDS.map(t => (
                                    <button key={t} type="button" className={`vtt-segment${threshold === t ? ' is-active' : ''}`} onClick={() => setThreshold(t)}>{t} s</button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <button type="button" className="vtt-btn vtt-btn-primary" disabled={!ready || unlocked} onClick={unlock}>
                            {unlocked ? 'Son activé' : 'Activer le son'}
                        </button>
                        <button type="button" className="vtt-btn" disabled={!ready || !unlocked} onClick={localPause}>Pause locale 10 s</button>
                    </div>

                    <div>
                        <span className="vtt-field-label">Volume local : {volume}</span>
                        <input type="range" min="0" max="100" value={volume} onChange={e => setVolume(Number(e.target.value))} className="w-full" />
                    </div>

                    <div className="text-sm grid sm:grid-cols-2 gap-x-6 gap-y-1">
                        <div><strong>Relais :</strong> {socket?.connected ? 'connecté' : 'déconnecté'}</div>
                        <div><strong>Serveur :</strong> {state ? `${STATUS_LABELS[state.status]}${state.youtubeId ? ` · ${state.youtubeId}` : ''}` : '—'}</div>
                        <div><strong>Horloge :</strong> écart {Math.round(stats.offset)} ms · aller-retour {stats.rtt ?? '—'} ms</div>
                        <div><strong>Lecteur :</strong> {STATE_LABELS[mainState] ?? mainState}</div>
                        <div><strong>Attendu :</strong> {formatTime(stats.expected)} · <strong>local :</strong> {formatTime(stats.actual)}</div>
                        <div><strong>Écart :</strong> {stats.drift === null ? '—' : `${stats.drift >= 0 ? '+' : ''}${stats.drift.toFixed(2)} s`} · <strong>recalages :</strong> {stats.resyncs}</div>
                        <div className="sm:col-span-2"><strong>Titre :</strong> {stats.title || '—'}</div>
                    </div>
                </section>

                {isLeader && (
                    <section className="vtt-panel p-4 space-y-4">
                        <h2 className="vtt-section-title">Meneur</h2>
                        <div className="flex gap-2">
                            <input className="vtt-input flex-1" value={link} onChange={e => setLink(e.target.value)} placeholder="Lien de vidéo ou de playlist YouTube" />
                            <button type="button" className="vtt-btn vtt-btn-primary" disabled={!parseYouTubeLink(link)} onClick={addLink}>Ajouter</button>
                        </div>
                        {pendingList && <p className="text-xs text-muted">Lecture de la playlist…</p>}

                        <div className="flex flex-wrap gap-2">
                            <button type="button" className="vtt-btn" disabled={state?.status !== 'playing'} onClick={() => command('pause')}>Pause</button>
                            <button type="button" className="vtt-btn" disabled={state?.status !== 'paused'} onClick={() => command('resume')}>Reprise</button>
                            <button type="button" className="vtt-btn" disabled={!state?.youtubeId} onClick={() => command('seek', { position: Math.max(0, stats.expected - 30) })}>−30 s</button>
                            <button type="button" className="vtt-btn" disabled={!state?.youtubeId} onClick={() => command('seek', { position: stats.expected + 30 })}>+30 s</button>
                            <button type="button" className="vtt-btn" disabled={!state?.youtubeId} onClick={playNext}>Suivante</button>
                            <button type="button" className="vtt-btn vtt-btn-danger" disabled={!state?.youtubeId} onClick={() => command('stop')}>Arrêt</button>
                        </div>

                        <ul className="text-sm space-y-1">
                            {queue.map((id, i) => (
                                <li key={id}>
                                    <button type="button" className={`vtt-btn vtt-btn-sm w-full justify-start${id === state?.youtubeId ? ' vtt-btn-primary' : ''}`}
                                            onClick={() => command('play', { youtubeId: id })}>
                                        {i + 1}. {id}
                                    </button>
                                </li>
                            ))}
                            {!queue.length && <li className="text-muted">Aucune vidéo : ajoute un lien.</li>}
                        </ul>
                    </section>
                )}

                <section className="vtt-panel p-4">
                    <h2 className="vtt-section-title">Journal</h2>
                    <ul className="text-xs font-mono space-y-0.5">
                        {log.map((line, i) => <li key={`${i}-${line}`}>{line}</li>)}
                    </ul>
                </section>

                {/* Lecteurs cachés */}
                <div ref={mainRef} style={OFFSCREEN} />
                <div ref={helperRef} style={OFFSCREEN} />
            </main>
        </div>
    );
};

export default AudioProtoPage;
