// src/client/src/components/initiative/InitiativeLaunchModal.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Lancer l'initiative, ou y ajouter des participants en cours (même fenêtre)
// (documentations/spec_initiative.md §9.7, §9.11). Rien n'est coché d'office (Q-17) :
// - PJ de la table, en ligne ou non (raccourci « Tous les PJ ») ;
// - PNJ de la table et de la bibliothèque (si le slug a un bloc `npc`), chacun
//   Non / Visible / Caché / Réserve ; un PNJ de la bibliothèque est ajouté à la table ;
// - entrées libres (nom seul) ;
// - au lancement : camp qui ouvre (mode camps), initiative ennemie (si le slug la propose).
// Les valeurs, actions et blessures viennent des fonctions du bloc `initiative` du slug.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import Modal from '../ui/Modal.jsx';
import { useNpcs } from '../../hooks/useNpcs.js';
import { useFetch } from '../../hooks/useFetch.js';
import { makeParticipant } from '../../tools/initiative.js';

const NPC_CHOICES = [['', 'Non'], ['visible', 'Visible'], ['hidden', 'Caché'], ['reserve', 'Réserve']];

/** Une ligne de PNJ : choix explicite. */
const NpcPick = ({ label, value, onChange }) => (
    <div className="vtt-initiative-pick">
        <span title={label}>{label}</span>
        <div className="vtt-segmented">
            {NPC_CHOICES.map(([v, l]) => (
                <button key={v || 'none'} type="button" className={`vtt-segment${(value ?? '') === v ? ' is-active' : ''}`}
                        onClick={() => onChange(v || null)}>{l}</button>
            ))}
        </div>
    </div>
);

/** PNJ de la table et de la bibliothèque (slug avec un bloc `npc`). */
const NpcPicks = ({ npcs, existing, picks, setPick }) => {
    const table = npcs.table.filter(n => !existing.has(`n${n.id}`));
    return (
        <>
            <div className="vtt-initiative-pick-section">
                <div className="vtt-initiative-pick-title">PNJ de la table</div>
                {table.length ? table.map(n => (
                    <NpcPick key={n.id} label={n.name} value={picks[`n${n.id}`]} onChange={(v) => setPick(`n${n.id}`, v)} />
                )) : <p className="vtt-initiative-pick-empty">{npcs.loading ? 'Chargement…' : 'Aucun'}</p>}
            </div>
            {npcs.library.length > 0 && <LibraryPicks library={npcs.library} picks={picks} setPick={setPick} />}
        </>
    );
};

const LIBRARY_RESULTS = 8;
/** Texte comparable : minuscules, sans accents */
const fold = (text) => String(text ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const libraryName = (n) => [n.prenom, n.nom].filter(Boolean).join(' ');

/**
 * Bibliothèque (retour du MJ : interminable sur Dune) : recherche par nom, rôle ou étiquette ;
 * les PNJ déjà choisis restent affichés en tête, les résultats se limitent aux premiers trouvés.
 */
const LibraryPicks = ({ library, picks, setPick }) => {
    const [query, setQuery] = useState('');
    const chosen = library.filter(n => picks[`l${n.id}`]);
    const words = fold(query).split(/\s+/).filter(Boolean);
    const matches = words.length
        ? library.filter(n => !picks[`l${n.id}`]
            && words.every(w => fold([libraryName(n), n.role, ...(n.tags ?? [])].join(' ')).includes(w)))
        : [];
    const row = (n) => (
        <NpcPick key={n.id} label={libraryName(n)} value={picks[`l${n.id}`]} onChange={(v) => setPick(`l${n.id}`, v)} />
    );
    return (
        <div className="vtt-initiative-pick-section">
            <div className="vtt-initiative-pick-title">Bibliothèque (ajouté aussi à la table)</div>
            {chosen.map(row)}
            <input className="vtt-input" type="search" value={query} onChange={(e) => setQuery(e.target.value)}
                   placeholder={`Chercher parmi ${library.length} PNJ : nom, rôle, étiquette…`} aria-label="Chercher dans la bibliothèque" />
            {words.length > 0 && (matches.length
                ? <>
                    {matches.slice(0, LIBRARY_RESULTS).map(row)}
                    {matches.length > LIBRARY_RESULTS && (
                        <p className="vtt-initiative-pick-empty">… et {matches.length - LIBRARY_RESULTS} autres : précisez la recherche.</p>
                    )}
                </>
                : <p className="vtt-initiative-pick-empty">Aucun PNJ ne correspond.</p>)}
        </div>
    );
};

/**
 * @param {object}   props
 * @param {number}   props.sessionId
 * @param {object}   props.slugConfig    config du slug (blocs `initiative` et `npc`)
 * @param {Array}    props.characters    PJ de la table (activeSession.characters : id, name, avatar)
 * @param {Set}      props.existing      clés déjà dans la bande
 * @param {boolean}  props.launching     lancement (sinon : ajout en cours)
 * @param {Function} props.onConfirm     ({ participants, avatars, opening, enemyOrder }) → Promise
 * @param {Function} props.onClose
 */
const InitiativeLaunchModal = ({ sessionId, slugConfig, characters, existing, launching, onConfirm, onClose }) => {
    const ini = slugConfig.initiative;
    const fetchWithAuth = useFetch();
    // PNJ de la table et bibliothèque (route du MJ) ; affichés seulement si le slug a des PNJ
    const npcs = useNpcs(sessionId);
    const [pcs, setPcs] = useState(() => new Set());
    const [picks, setPicks] = useState({});           // clé PNJ → 'visible' | 'hidden' | 'reserve'
    const [free, setFree] = useState([]);
    const [freeName, setFreeName] = useState('');
    const [opening, setOpening] = useState('players');
    const [enemyOrder, setEnemyOrder] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState(null);

    const sides = { players: 'Joueurs', gm: 'Adversaires', ...ini.sides };
    const availablePcs = (characters ?? []).filter(c => !existing.has(`c${c.id}`));
    const togglePc = (id) => setPcs(prev => { const s = new Set(prev); if (s.has(id)) s.delete(id); else s.add(id); return s; });
    const setPick = (key, value) => setPicks(prev => { const next = { ...prev }; if (value) next[key] = value; else delete next[key]; return next; });
    const addFree = () => { const name = freeName.trim().slice(0, 120); if (name) setFree(prev => [...prev, name]); setFreeName(''); };
    const count = pcs.size + Object.keys(picks).length + free.length;

    // Participant tiré d'un PNJ de la table (fonctions du slug pour valeur, actions, blessure)
    const fromInstance = (instance, choice) => makeParticipant({
        key: `n${instance.id}`, kind: 'npc', refId: instance.id, name: instance.name,
        initiative: ini.npcInitiative?.(instance) ?? null,
        actions: ini.npcActions?.(instance) ?? 1,
        wound: ini.npcWound?.(instance) ?? null,
        hidden: choice === 'hidden', reserve: choice === 'reserve',
    });

    const confirm = async () => {
        setBusy(true);
        setError(null);
        const placed = {};   // PNJ de la bibliothèque déjà posés à la table : un nouvel essai reprend leur instance
        try {
            const participants = [];
            const avatars = {};
            // PJ : valeur fournie par le slug, lue sur la fiche complète
            for (const c of availablePcs.filter(c => pcs.has(c.id))) {
                let initiative = null;
                if (ini.characterInitiative) {
                    const res = await fetchWithAuth(`/api/characters/${c.id}`);
                    if (res.ok) initiative = ini.characterInitiative(await res.json()) ?? null;
                }
                participants.push(makeParticipant({ key: `c${c.id}`, kind: 'character', refId: c.id, name: c.name, initiative }));
                if (c.avatar) avatars[`c${c.id}`] = c.avatar;
            }
            // PNJ de la table, puis de la bibliothèque (ajoutés à la table au passage)
            for (const [key, choice] of Object.entries(picks)) {
                if (key.startsWith('n')) {
                    const instance = npcs.table.find(n => `n${n.id}` === key);
                    if (!instance) continue;
                    participants.push(fromInstance(instance, choice));
                    if (instance.sheet?.avatar) avatars[key] = instance.sheet.avatar;
                } else {
                    const npc = npcs.library.find(n => `l${n.id}` === key);
                    if (!npc) continue;
                    // Données de la table pour l'état de départ (Nimble : nombre de héros), Q-44
                    const context = ini.npcContext?.(characters ?? []) ?? {};
                    const state = slugConfig.npc?.initialState?.(npc, { quantity: 1, context }) ?? {};
                    const added = await npcs.addToTable(npc.id, 1, state);
                    for (const instance of added ?? []) {
                        participants.push(fromInstance(instance, choice));
                        if (instance.sheet?.avatar) avatars[`n${instance.id}`] = instance.sheet.avatar;
                        placed[key] = `n${instance.id}`;
                    }
                }
            }
            free.forEach((name, i) => participants.push(makeParticipant({ key: `f${Date.now().toString(36)}${i}`, kind: 'free', name })));
            const ok = await onConfirm({ participants, avatars, opening, enemyOrder });
            if (!ok) setError('Le serveur a refusé l\'enregistrement (60 participants au plus, ou serveur injoignable) : rien n\'a été ajouté à la bande.');
        } finally {
            // Refus : les PNJ de la bibliothèque déjà posés à la table restent choisis par leur instance
            if (Object.keys(placed).length) {
                setPicks(prev => Object.fromEntries(Object.entries(prev).map(([k, v]) => [placed[k] ?? k, v])));
            }
            setBusy(false);
        }
    };

    const footer = (
        <>
            <button type="button" className="vtt-btn" onClick={onClose}>Annuler</button>
            <button type="button" className="vtt-btn vtt-btn-primary" disabled={!count || busy} onClick={confirm}>
                {launching ? 'Lancer' : 'Ajouter'}
            </button>
        </>
    );

    return (
        <Modal onClose={onClose} title={`${launching ? 'Lancer' : 'Ajouter à'} : ${ini.label ?? 'Initiative'}`}
               subtitle="Rien n'est coché d'office : vous choisissez qui entre" footer={footer} className="vtt-initiative-launch">
            <div className="vtt-initiative-pick-section">
                <div className="vtt-initiative-pick-title">
                    PJ de la table
                    {availablePcs.length > 1 && (
                        <button type="button" className="vtt-pill" onClick={() => setPcs(new Set(availablePcs.map(c => c.id)))}>Tous les PJ</button>
                    )}
                </div>
                <div className="vtt-initiative-pick-pills">
                    {availablePcs.length ? availablePcs.map(c => (
                        <button key={c.id} type="button" className={`vtt-pill${pcs.has(c.id) ? ' is-selected' : ''}`} aria-pressed={pcs.has(c.id)}
                                onClick={() => togglePc(c.id)}>{c.name}</button>
                    )) : <p className="vtt-initiative-pick-empty">{characters?.length ? 'Tous déjà dans la bande' : 'Aucun PJ à la table'}</p>}
                </div>
            </div>

            {slugConfig.npc && <NpcPicks npcs={npcs} existing={existing} picks={picks} setPick={setPick} />}

            <div className="vtt-initiative-pick-section">
                <div className="vtt-initiative-pick-title">Entrée libre</div>
                <div className="vtt-initiative-pick-free">
                    <input className="vtt-input" value={freeName} placeholder="Ex. Renforts, L'incendie" maxLength={120}
                           onChange={(e) => setFreeName(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') addFree(); }} />
                    <button type="button" className="vtt-btn vtt-btn-sm" onClick={addFree} disabled={!freeName.trim()}>Ajouter</button>
                </div>
                {free.length > 0 && (
                    <div className="vtt-initiative-pick-pills">
                        {free.map((name, i) => (
                            <button key={`${name}-${i}`} type="button" className="vtt-pill is-selected" title="Retirer"
                                    onClick={() => setFree(prev => prev.filter((_, j) => j !== i))}>{name} ✕</button>
                        ))}
                    </div>
                )}
            </div>

            {launching && ini.mode === 'sides' && (
                <div className="vtt-initiative-pick-section">
                    <div className="vtt-initiative-pick-title">{ini.opening === 'choose' ? 'Camp qui ouvre chaque tour (test d\'initiative de groupe)' : 'Camp qui ouvre'}</div>
                    <div className="vtt-segmented">
                        <button type="button" className={`vtt-segment${opening === 'players' ? ' is-active' : ''}`} onClick={() => setOpening('players')}>
                            {sides.players}{ini.opening === 'choose' ? ' (réussi)' : ''}
                        </button>
                        <button type="button" className={`vtt-segment${opening === 'gm' ? ' is-active' : ''}`} onClick={() => setOpening('gm')}>
                            {sides.gm}{ini.opening === 'choose' ? ' (raté)' : ' (surprise)'}
                        </button>
                    </div>
                </div>
            )}

            {launching && ini.enemyOrder && (
                <button type="button" className={`vtt-pill${enemyOrder ? ' is-selected' : ''}`} aria-pressed={enemyOrder}
                        onClick={() => setEnemyOrder(v => !v)}>
                    Initiative ennemie : les adversaires jouent par initiative décroissante
                </button>
            )}

            {error && <p className="vtt-initiative-pick-error" role="alert">{error}</p>}

            <p className="vtt-modal-subtitle">Visible : vu de tous. Caché : agit sans être vu des joueurs. Réserve : prévu, ni vu ni compté, jusqu'à ce que vous le fassiez entrer.</p>
        </Modal>
    );
};

export default InitiativeLaunchModal;
