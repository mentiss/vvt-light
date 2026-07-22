// src/client/src/systems/zoneblanche/Creation.jsx
// Wizard de création de personnage — public, sans authentification.
// 9 étapes : Archétype → Principes → Compétences → Maximes → Vérité →
//            Talents → Focus → Identité → Récapitulatif
//
// L'identité passe en dernier (le joueur découvre le système par ce qu'il
// incarne, pas par une fiche d'état civil) — même logique que Fabula Ultima.
//
// Chargé dynamiquement par PlayerPage via import.meta.glob('../systems/*/Creation.jsx').
// Contrat props : { onCreated, onCancel, darkMode, onToggleDarkMode }
//
// Pas d'étape Matériel (hors scope création — pool d'équipe géré en session).

import React, { useState, useMemo, useEffect, useRef } from 'react';
import './theme.css';
import { useSystem } from '../../hooks/useSystem.js';
import ThemeToggle from '../../components/ui/ThemeToggle.jsx';
import {
    PRINCIPES, COMPETENCES, ARCHETYPES, getArchetype,
    FOCUS_CATALOG, getMaximesForArchetype, VERITES_CATALOG, TALENTS_CATALOG,
} from './config.jsx';

// ── Constantes de répartition (cf. spec §10 — même échelle Principes/Compétences) ──

const SOCLE_MAJEUR = 5, SOCLE_MINEUR = 4, SOCLE_AUTRE = 3;
const PLAFOND_MAJEUR = 7, PLAFOND_MINEUR = 6, PLAFOND_AUTRE = 5;
const FREEBIES_PAR_AXE = 4;
const SEUIL_MAXIME_SUPPLEMENTAIRE = 6;
const PRIME_TIME_DEPART = 3;
const FOCUS_MAJEUR_COUNT = 2, FOCUS_MINEUR_COUNT = 1;
const TALENTS_COUNT = 2;

function socleFor(key, majeurKey, mineurKey) {
    if (key === majeurKey) return SOCLE_MAJEUR;
    if (key === mineurKey) return SOCLE_MINEUR;
    return SOCLE_AUTRE;
}
function plafondFor(key, majeurKey, mineurKey) {
    if (key === majeurKey) return PLAFOND_MAJEUR;
    if (key === mineurKey) return PLAFOND_MINEUR;
    return PLAFOND_AUTRE;
}

const STEPS = [
    { id: 1, label: 'Archétype' },
    { id: 2, label: 'Principes' },
    { id: 3, label: 'Compétences' },
    { id: 4, label: 'Maximes' },
    { id: 5, label: 'Vérité' },
    { id: 6, label: 'Talents' },
    { id: 7, label: 'Focus' },
    { id: 8, label: 'Identité' },
    { id: 9, label: 'Récapitulatif' },
];

// ── Timecode live — signature du thème (found footage : toujours en tournage) ──

function useTimecode() {
    const [seconds, setSeconds] = useState(0);
    useEffect(() => {
        const id = setInterval(() => setSeconds(s => s + 1), 1000);
        return () => clearInterval(id);
    }, []);
    const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
}

// ── Bandeau de diffusion — habillage de chaîne ───────────────────────────────

const BroadcastBar = ({ darkMode, onToggleDarkMode, subtitle }) => {
    const timecode = useTimecode();
    return (
        <div className="zb-broadcast-bar px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <span className="zb-channel-bug">Ch. 13</span>
                <div>
                    <div className="zb-title text-2xl leading-none">Zone Blanche</div>
                    <div className="zb-eyebrow mt-1">{subtitle}</div>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <span className="flex items-center gap-2 zb-timecode text-sm">
                    <span className="zb-rec-dot" />
                    REC {timecode}
                </span>
                {onToggleDarkMode && <ThemeToggle darkMode={darkMode} onToggle={onToggleDarkMode} />}
            </div>
        </div>
    );
};

// ── Barre de progression ──────────────────────────────────────────────────────

const StepBar = ({ current, onJump }) => (
    <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
        {STEPS.map((s, i) => (
            <React.Fragment key={s.id}>
                <button
                    type="button"
                    onClick={() => s.id < current && onJump(s.id)}
                    className={`flex flex-col items-center shrink-0 ${s.id < current ? 'cursor-pointer' : 'cursor-default'}`}
                >
                    <div className={`zb-step-badge w-9 h-9 flex items-center justify-center text-sm font-bold ${
                        s.id < current ? 'is-done' : s.id === current ? 'is-current' : 'is-todo'
                    }`}>
                        {s.id < current ? '✓' : String(s.id).padStart(2, '0')}
                    </div>
                    <span className={`zb-eyebrow zb-step-label mt-1 hidden md:block ${s.id === current ? 'is-current' : 'is-other'}`}>
                        {s.label}
                    </span>
                </button>
                {i < STEPS.length - 1 && (
                    <div className={`zb-step-line flex-1 h-0.5 ${s.id < current ? 'is-done' : ''}`} style={{ minWidth: 24 }} />
                )}
            </React.Fragment>
        ))}
    </div>
);

// ── Pill de sélection générique (jamais de <select>/<checkbox>, cf. convention plateforme) ──

const Pill = ({ active, onClick, children, disabled = false }) => (
    <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={`zb-pill w-full px-4 py-3 rounded-sm text-sm font-medium ${active ? 'is-selected' : ''}`}
    >
        {children}
    </button>
);

// ── Jauge de répartition façon potard de console ─────────────────────────────

const AllocationMeter = ({ value, plafond }) => (
    <div className="flex gap-1">
        {Array.from({ length: plafond }, (_, i) => (
            <div key={i} className={`zb-gauge-seg w-2.5 h-6 rounded-sm ${i < value ? 'is-filled' : ''}`} />
        ))}
    </div>
);

// ── Composant principal ───────────────────────────────────────────────────────

const Creation = ({ onCreated, onCancel, darkMode, onToggleDarkMode }) => {
    const { apiBase } = useSystem();

    const [showIntro, setShowIntro] = useState(true);
    const [step, setStep] = useState(1);

    const [playerName, setPlayerName] = useState('');
    const [prenom, setPrenom]         = useState('');
    const [nom, setNom]               = useState('');
    const [sexe, setSexe]             = useState('');
    const [age, setAge]               = useState('');
    const [taille, setTaille]         = useState('');
    const [description, setDescription] = useState('');

    const [archetypeKey, setArchetypeKey] = useState(null);
    const archetype = useMemo(() => getArchetype(archetypeKey), [archetypeKey]);

    const [freebiesPrincipes, setFreebiesPrincipes]     = useState({});
    const [freebiesCompetences, setFreebiesCompetences] = useState({});

    const [maximes, setMaximes] = useState({});
    const [maximeCustom, setMaximeCustom] = useState({});

    const [veriteChoice, setVeriteChoice] = useState(null);
    const [veriteCustomNom, setVeriteCustomNom]     = useState('');
    const [veriteCustomTexte, setVeriteCustomTexte] = useState('');

    const [talents, setTalents] = useState([]);

    const [focusMajeur, setFocusMajeur] = useState([]);
    const [focusMineur, setFocusMineur] = useState([]);

    const [creating, setCreating]     = useState(false);
    const [createError, setCreateError] = useState(null);
    const [created, setCreated]       = useState(null);
    const [copied, setCopied]         = useState(false);

    const principeRang = (key) => {
        const socle = socleFor(key, archetype?.principeMajeur, archetype?.principeMineur);
        return socle + (freebiesPrincipes[key] ?? 0);
    };
    const competenceRang = (key) => {
        const socle = socleFor(key, archetype?.competenceMajeure, archetype?.competenceMineure);
        return socle + (freebiesCompetences[key] ?? 0);
    };

    const freebiesPrincipesUsed   = Object.values(freebiesPrincipes).reduce((a, b) => a + b, 0);
    const freebiesCompetencesUsed = Object.values(freebiesCompetences).reduce((a, b) => a + b, 0);
    const freebiesPrincipesLeft   = FREEBIES_PAR_AXE - freebiesPrincipesUsed;
    const freebiesCompetencesLeft = FREEBIES_PAR_AXE - freebiesCompetencesUsed;

    const adjustFreebiePrincipe = (key, delta) => {
        const current = freebiesPrincipes[key] ?? 0;
        const socle   = socleFor(key, archetype?.principeMajeur, archetype?.principeMineur);
        const plafond = plafondFor(key, archetype?.principeMajeur, archetype?.principeMineur);
        const next = current + delta;
        if (next < 0) return;
        if (socle + next > plafond) return;
        if (delta > 0 && freebiesPrincipesLeft <= 0) return;
        setFreebiesPrincipes(prev => ({ ...prev, [key]: next }));
    };
    const adjustFreebieCompetence = (key, delta) => {
        const current = freebiesCompetences[key] ?? 0;
        const socle   = socleFor(key, archetype?.competenceMajeure, archetype?.competenceMineure);
        const plafond = plafondFor(key, archetype?.competenceMajeure, archetype?.competenceMineure);
        const next = current + delta;
        if (next < 0) return;
        if (socle + next > plafond) return;
        if (delta > 0 && freebiesCompetencesLeft <= 0) return;
        setFreebiesCompetences(prev => ({ ...prev, [key]: next }));
    };

    const principesDebloques = useMemo(() => {
        if (!archetype) return [];
        return PRINCIPES.filter(p => p.key === archetype.principeMajeur || principeRang(p.key) >= SEUIL_MAXIME_SUPPLEMENTAIRE);
    }, [archetype, freebiesPrincipes]);

    const canNext = () => {
        switch (step) {
            case 1: return !!archetypeKey;
            case 2: return freebiesPrincipesLeft === 0;
            case 3: return freebiesCompetencesLeft === 0;
            case 4: return principesDebloques.every(p => (maximes[p.key] ?? '').trim().length > 0);
            case 5: return veriteChoice !== null && (veriteChoice !== 'custom' || veriteCustomNom.trim().length > 0);
            case 6: return talents.length === TALENTS_COUNT;
            case 7: return focusMajeur.length === FOCUS_MAJEUR_COUNT && focusMineur.length === FOCUS_MINEUR_COUNT;
            case 8: return playerName.trim().length > 0 && prenom.trim().length > 0 && nom.trim().length > 0;
            default: return true;
        }
    };
    const goNext = () => setStep(s => Math.min(STEPS.length, s + 1));
    const goPrev = () => setStep(s => Math.max(1, s - 1));

    const toggleTalent = (key) => {
        setTalents(prev => {
            if (prev.includes(key)) return prev.filter(k => k !== key);
            if (prev.length >= TALENTS_COUNT) return prev;
            return [...prev, key];
        });
    };

    const addFocus = (slot, texte) => {
        if (!texte.trim()) return;
        if (slot === 'majeur') {
            if (focusMajeur.length >= FOCUS_MAJEUR_COUNT || focusMajeur.includes(texte)) return;
            setFocusMajeur(prev => [...prev, texte]);
        } else {
            if (focusMineur.length >= FOCUS_MINEUR_COUNT || focusMineur.includes(texte)) return;
            setFocusMineur(prev => [...prev, texte]);
        }
    };
    const removeFocus = (slot, texte) => {
        if (slot === 'majeur') setFocusMajeur(prev => prev.filter(t => t !== texte));
        else setFocusMineur(prev => prev.filter(t => t !== texte));
    };

    const handleCreate = async () => {
        setCreating(true);
        setCreateError(null);
        try {
            const verite = veriteChoice === 'custom'
                ? { nom: veriteCustomNom.trim(), texte: veriteCustomTexte.trim() }
                : VERITES_CATALOG[archetypeKey][veriteChoice];

            const payload = {
                playerName: playerName.trim(),
                prenom:     prenom.trim(),
                nom:        nom.trim(),
                sexe:       sexe || null,
                age:        age    !== '' ? Number(age)    : null,
                taille:     taille !== '' ? Number(taille) : null,
                description,
                archetype:  archetypeKey,
                principes:   PRINCIPES.map(p => ({ key: p.key, rang: principeRang(p.key), maxime: maximes[p.key] ?? '' })),
                competences: COMPETENCES.map(c => ({ key: c.key, rang: competenceRang(c.key) })),
                verites: [verite],
                focus: [
                    ...focusMajeur.map(texte => ({ competenceKey: archetype.competenceMajeure, texte })),
                    ...focusMineur.map(texte => ({ competenceKey: archetype.competenceMineure, texte })),
                ],
                talents,
            };

            const res = await fetch(`${apiBase}/characters`, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify(payload),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error || 'Erreur lors de la création');
            }
            const newChar = await res.json();
            setCreated(newChar);
        } catch (err) {
            setCreateError(err.message);
        } finally {
            setCreating(false);
        }
    };

    const copyCode = () => {
        navigator.clipboard.writeText(created.accessCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (created) {
        return (
            <div className="zb-root zb-grain relative min-h-screen bg-default text-default"
                 data-theme={darkMode ? 'dark' : 'light'}>
                <BroadcastBar darkMode={darkMode} onToggleDarkMode={onToggleDarkMode} subtitle="Fiche enregistrée" />
                <div className="max-w-2xl mx-auto py-16 px-6 text-center space-y-6">
                    <div className="text-6xl">📼</div>
                    <h1 className="text-3xl font-bold text-default">{created.nom} rejoint l'équipe.</h1>
                    <div className="rounded-xl p-6 mx-auto max-w-sm bg-surface-alt border border-default">
                        <div className="text-sm text-muted mb-2">Votre code d'accès</div>
                        <div className="font-mono text-4xl font-bold tracking-widest text-default mb-4">{created.accessCode}</div>
                        <button onClick={copyCode} className="px-4 py-2 text-sm rounded-full bg-primary text-white">
                            {copied ? '✅ Copié !' : '📋 Copier le code'}
                        </button>
                        <p className="text-xs text-muted mt-3">Conservez ce code — c'est votre clé d'accès permanente à la fiche.</p>
                    </div>
                    <button onClick={() => onCreated?.(created)} className="px-6 py-3 rounded-sm bg-accent text-white font-semibold zb-display">
                        Ouvrir ma fiche
                    </button>
                </div>
            </div>
        );
    }

    // ── Étape 0 — Brief : ce qu'est le jeu, ce qu'on va choisir ────────────
    if (showIntro) {
        return (
            <div className="zb-root zb-grain relative min-h-screen bg-default text-default"
                 data-theme={darkMode ? 'dark' : 'light'}>
                <BroadcastBar darkMode={darkMode} onToggleDarkMode={onToggleDarkMode} subtitle="Brief de production" />

                <div className="max-w-4xl mx-auto py-10 px-6 space-y-8">
                    <div className="zb-panel zb-grain rounded-sm p-8 space-y-5">
                        <div className="zb-eyebrow">Le pitch</div>
                        <p className="text-lg leading-relaxed">
                            Vous faites partie de l'équipe d'une émission d'investigation paranormale. Vous passez vos nuits
                            dans des lieux qu'on dit hantés, caméra au poing, à chercher ce que personne ne veut vraiment trouver.
                        </p>
                        <p className="leading-relaxed text-muted">
                            Le jeu ne tranche jamais si le surnaturel existe. Vos instruments mesurent, vos caméras enregistrent,
                            et c'est à la table de décider ce que ça veut dire. Vous êtes filmés en permanence : tout ce que vous
                            faites finit au montage.
                        </p>
                    </div>

                    <div className="zb-panel zb-grain rounded-sm p-8 space-y-5">
                        <div className="zb-eyebrow">Comment on joue</div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <div className="zb-brief-card p-4 rounded-r-sm">
                                <div className="zb-tag-label mb-2">Les jets</div>
                                <p className="text-sm leading-relaxed">
                                    Un Principe (ce que vous êtes) + une Compétence (ce que vous savez faire).
                                    Vous lancez 2d20 et cherchez à faire <span className="zb-mono">bas</span> : chaque dé
                                    sous votre total est un succès.
                                </p>
                            </div>
                            <div className="zb-brief-card p-4 rounded-r-sm">
                                <div className="zb-tag-label mb-2">L'Audimat</div>
                                <p className="text-sm leading-relaxed">
                                    Votre réserve commune. Vous la gagnez en réussissant du beau spectacle, vous la dépensez
                                    pour acheter des dés — ou pour déclencher vos meilleurs coups.
                                </p>
                            </div>
                            <div className="zb-brief-card is-alert p-4 rounded-r-sm">
                                <div className="zb-tag-label mb-2">Le Stress</div>
                                <p className="text-sm leading-relaxed">
                                    La réserve du MJ. Elle monte quand vous prenez des risques ou fouillez trop loin,
                                    et elle finit toujours par vous revenir en pleine face.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="zb-panel zb-grain rounded-sm p-8 space-y-5">
                        <div className="zb-eyebrow">Ce que vous allez choisir</div>
                        <div className="space-y-3">
                            {[
                                ['Archétype',   "Votre poste dans l'équipe. Il fixe vos points forts et débloque tout le reste."],
                                ['Principes',   'Logique, Instinct, Technique, Présence — votre tempérament, chiffré.'],
                                ['Compétences', "Investigation, Opération, Déplacement, Ésotérisme — votre savoir-faire."],
                                ['Maximes',     'Ce en quoi vous croyez. Une phrase que vous invoquez pour relancer les dés.'],
                                ['Vérité',      "Un fait durable sur votre personnage. Le MJ s'engage : c'est vrai, toujours."],
                                ['Talents',     "Deux capacités propres à votre poste, qui débloquent des actions que les autres n'ont pas."],
                                ['Focus',       'Vos spécialités pointues. Là où vous réussissez mieux que quiconque.'],
                                ['Identité',    'Le nom et le visage du personnage que vous venez de construire.'],
                            ].map(([titre, texte], i) => (
                                <div key={titre} className="flex gap-4 items-baseline">
                                    <span className="zb-mono text-sm shrink-0 text-accent" style={{ minWidth: '2rem' }}>
                                        {String(i + 1).padStart(2, '0')}
                                    </span>
                                    <div>
                                        <span className="zb-display">{titre}</span>
                                        <span className="text-sm ml-3 text-muted">{texte}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <p className="text-sm pt-2 text-muted">
                            Rien n'est définitif : votre MJ peut tout ajuster ensuite.
                        </p>
                    </div>

                    <div className="flex items-center justify-between">
                        <button type="button" onClick={onCancel}
                                className="zb-btn-ghost zb-display px-5 py-2.5 rounded-sm">
                            Annuler
                        </button>
                        <button type="button" onClick={() => setShowIntro(false)}
                                className="zb-btn-accent zb-display px-8 py-3 rounded-sm font-semibold">
                            Lancer le tournage →
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="zb-root zb-grain relative min-h-screen bg-default text-default"
             data-theme={darkMode ? 'dark' : 'light'}>
            <BroadcastBar darkMode={darkMode} onToggleDarkMode={onToggleDarkMode} subtitle="Création de personnage" />
            <div className="max-w-5xl mx-auto py-8 px-6">
                <StepBar current={step} onJump={setStep} />

                <div className="zb-panel zb-grain rounded-sm p-8 min-h-[480px]">

                    {step === 1 && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-default">Choisissez votre archétype</h2>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {ARCHETYPES.map(a => (
                                    <button key={a.key} type="button" onClick={() => setArchetypeKey(a.key)}
                                            className={`zb-card p-5 rounded-r-sm ${archetypeKey === a.key ? 'is-selected' : ''}`}>
                                        <div className="zb-tag-label mb-1">Archétype</div>
                                        <div className="font-bold text-lg mb-2">{a.label}</div>
                                        <p className="text-sm opacity-90 mb-3">{a.description}</p>
                                        <div className="zb-eyebrow flex flex-wrap gap-x-4 gap-y-1">
                                            <span>{PRINCIPES.find(p => p.key === a.principeMajeur)?.label} / {PRINCIPES.find(p => p.key === a.principeMineur)?.label}</span>
                                            <span>{COMPETENCES.find(c => c.key === a.competenceMajeure)?.label} / {COMPETENCES.find(c => c.key === a.competenceMineure)?.label}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 2 && archetype && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-default">Répartissez vos Principes</h2>
                                <span className={`zb-counter px-4 py-1.5 rounded-sm font-bold text-lg ${freebiesPrincipesLeft === 0 ? 'is-complete' : ''}`}>
                                {freebiesPrincipesLeft} pt{freebiesPrincipesLeft !== 1 ? 's' : ''} à placer
                            </span>
                            </div>
                            <p className="text-sm text-muted">Le socle dépend de votre archétype. Placez les {FREEBIES_PAR_AXE} points libres avant de continuer.</p>
                            <div className="space-y-4">
                                {PRINCIPES.map(p => {
                                    const socle   = socleFor(p.key, archetype.principeMajeur, archetype.principeMineur);
                                    const plafond = plafondFor(p.key, archetype.principeMajeur, archetype.principeMineur);
                                    const rang    = principeRang(p.key);
                                    return (
                                        <div key={p.key} className="flex items-center justify-between p-4 rounded-lg bg-surface-alt border border-default">
                                            <div>
                                                <div className="font-semibold text-default">{p.label}</div>
                                                <div className="zb-eyebrow">Socle {socle} · Plafond {plafond}</div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <AllocationMeter value={rang} plafond={plafond} />
                                                <button type="button" onClick={() => adjustFreebiePrincipe(p.key, -1)}
                                                        disabled={rang <= socle}
                                                        className="w-9 h-9 rounded-full bg-surface text-default font-bold disabled:opacity-30">−</button>
                                                <span className="zb-mono text-2xl font-bold w-8 text-center text-default">{rang}</span>
                                                <button type="button" onClick={() => adjustFreebiePrincipe(p.key, 1)}
                                                        disabled={rang >= plafond || freebiesPrincipesLeft <= 0}
                                                        className="w-9 h-9 rounded-full bg-surface text-default font-bold disabled:opacity-30">+</button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {step === 3 && archetype && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-default">Répartissez vos Compétences</h2>
                                <span className={`zb-counter px-4 py-1.5 rounded-sm font-bold text-lg ${freebiesCompetencesLeft === 0 ? 'is-complete' : ''}`}>
                                {freebiesCompetencesLeft} pt{freebiesCompetencesLeft !== 1 ? 's' : ''} à placer
                            </span>
                            </div>
                            <p className="text-sm text-muted">Même règle, pool séparé — aucun transfert entre Principes et Compétences.</p>
                            <div className="space-y-4">
                                {COMPETENCES.map(c => {
                                    const socle   = socleFor(c.key, archetype.competenceMajeure, archetype.competenceMineure);
                                    const plafond = plafondFor(c.key, archetype.competenceMajeure, archetype.competenceMineure);
                                    const rang    = competenceRang(c.key);
                                    return (
                                        <div key={c.key} className="flex items-center justify-between p-4 rounded-lg bg-surface-alt border border-default">
                                            <div>
                                                <div className="font-semibold text-default">{c.label}</div>
                                                <div className="zb-eyebrow">Socle {socle} · Plafond {plafond}</div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <AllocationMeter value={rang} plafond={plafond} />
                                                <button type="button" onClick={() => adjustFreebieCompetence(c.key, -1)}
                                                        disabled={rang <= socle}
                                                        className="w-9 h-9 rounded-full bg-surface text-default font-bold disabled:opacity-30">−</button>
                                                <span className="zb-mono text-2xl font-bold w-8 text-center text-default">{rang}</span>
                                                <button type="button" onClick={() => adjustFreebieCompetence(c.key, 1)}
                                                        disabled={rang >= plafond || freebiesCompetencesLeft <= 0}
                                                        className="w-9 h-9 rounded-full bg-surface text-default font-bold disabled:opacity-30">+</button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {step === 4 && archetype && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-default">Vos Maximes</h2>
                            <p className="text-sm text-muted">
                                Une maxime par Principe débloqué : le Principe majeur ({PRINCIPES.find(p => p.key === archetype.principeMajeur)?.label}) l'est toujours ;
                                {' '}tout autre Principe à rang {SEUIL_MAXIME_SUPPLEMENTAIRE}+ en débloque une supplémentaire.
                            </p>
                            <div className="space-y-6">
                                {principesDebloques.map(p => {
                                    const options = getMaximesForArchetype(archetypeKey, p.key);
                                    const isCustom = maximeCustom[p.key];
                                    return (
                                        <div key={p.key} className="p-4 rounded-lg bg-surface-alt border border-default space-y-3">
                                            <div className="font-semibold text-default">{p.label}</div>
                                            {!isCustom && (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                    {options.map(text => (
                                                        <Pill key={text} active={maximes[p.key] === text}
                                                              onClick={() => setMaximes(prev => ({ ...prev, [p.key]: text }))}>
                                                            « {text} »
                                                        </Pill>
                                                    ))}
                                                    <Pill active={false} onClick={() => setMaximeCustom(prev => ({ ...prev, [p.key]: true }))}>
                                                        ✎ Écrire ma propre maxime (validation MJ)
                                                    </Pill>
                                                </div>
                                            )}
                                            {isCustom && (
                                                <div className="space-y-2">
                                                <textarea value={maximes[p.key] ?? ''} rows={2}
                                                          onChange={e => setMaximes(prev => ({ ...prev, [p.key]: e.target.value }))}
                                                          className="zb-input w-full px-3 py-2 rounded-sm"
                                                          placeholder="Votre maxime…" />
                                                    <Pill active={false} onClick={() => setMaximeCustom(prev => ({ ...prev, [p.key]: false }))}>
                                                        ← Revenir aux exemples
                                                    </Pill>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {step === 5 && archetype && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-default">Votre Vérité</h2>
                            <p className="text-sm text-muted">Un fait durable et contractualisé — le MJ s'engage, il est toujours vrai. Une seule à la création.</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {VERITES_CATALOG[archetypeKey].map((v, i) => (
                                    <button key={i} type="button" onClick={() => setVeriteChoice(i)}
                                            className={`zb-card p-4 rounded-r-sm ${veriteChoice === i ? 'is-selected' : ''}`}>
                                        <div className="zb-tag-label mb-1">Vérité</div>
                                        <div className="font-bold mb-1">{v.nom}</div>
                                        <div className="text-sm opacity-90">{v.description}</div>
                                    </button>
                                ))}
                                <button type="button" onClick={() => setVeriteChoice('custom')}
                                        className={`zb-card-dashed p-4 rounded-sm ${veriteChoice === 'custom' ? 'is-selected' : ''}`}>
                                    <div className="font-bold mb-1">✎ Sur mesure</div>
                                    <div className="text-sm opacity-90">Créez votre propre Vérité (validation MJ).</div>
                                </button>
                            </div>
                            {veriteChoice === 'custom' && (
                                <div className="space-y-3 p-4 rounded-lg bg-surface-alt border border-default">
                                    <input value={veriteCustomNom} onChange={e => setVeriteCustomNom(e.target.value)}
                                           className="zb-input w-full px-3 py-2 rounded-sm"
                                           placeholder="Nom de la Vérité" />
                                    <textarea value={veriteCustomTexte} onChange={e => setVeriteCustomTexte(e.target.value)} rows={3}
                                              className="zb-input w-full px-3 py-2 rounded-sm"
                                              placeholder="Description…" />
                                </div>
                            )}
                        </div>
                    )}

                    {step === 6 && archetype && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-default">Vos Talents</h2>
                                <span className="px-4 py-1.5 rounded-full font-bold text-sm bg-accent text-white">
                                {talents.length} / {TALENTS_COUNT} choisis
                            </span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {TALENTS_CATALOG[archetypeKey].map(t => {
                                    const active = talents.includes(t.key);
                                    return (
                                        <button key={t.key} type="button" onClick={() => toggleTalent(t.key)}
                                                disabled={!active && talents.length >= TALENTS_COUNT}
                                                className={`zb-card p-4 rounded-r-sm ${active ? 'is-selected' : ''}`}>
                                            <div className="zb-tag-label mb-1">Talent</div>
                                            <div className="font-bold mb-1">{t.nom}</div>
                                            <div className="text-sm opacity-90">{t.description}</div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {step === 7 && archetype && (
                        <div className="space-y-8">
                            <h2 className="text-xl font-bold text-default">Vos Focus</h2>
                            <p className="text-sm text-muted">2 sur votre compétence majeure, 1 sur votre compétence mineure. Texte libre — le catalogue ci-dessous ne fait que préremplir.</p>

                            {['majeur', 'mineur'].map(slot => {
                                const competenceKey = slot === 'majeur' ? archetype.competenceMajeure : archetype.competenceMineure;
                                const count         = slot === 'majeur' ? FOCUS_MAJEUR_COUNT : FOCUS_MINEUR_COUNT;
                                const selected      = slot === 'majeur' ? focusMajeur : focusMineur;
                                const options       = FOCUS_CATALOG[competenceKey] ?? [];
                                return (
                                    <div key={slot} className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="font-semibold text-default">
                                                {COMPETENCES.find(c => c.key === competenceKey)?.label} ({slot === 'majeur' ? 'majeure' : 'mineure'})
                                            </div>
                                            <span className="text-sm text-muted">{selected.length} / {count}</span>
                                        </div>
                                        {selected.length > 0 && (
                                            <div className="flex flex-wrap gap-2">
                                                {selected.map(texte => (
                                                    <span key={texte} className="zb-chip px-3 py-1.5 rounded-sm text-sm flex items-center gap-2">
                                                    {texte}
                                                        <button type="button" onClick={() => removeFocus(slot, texte)}>✕</button>
                                                </span>
                                                ))}
                                            </div>
                                        )}
                                        {selected.length < count && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                {options.filter(o => !selected.includes(o.nom)).map(o => (
                                                    <Pill key={o.nom} active={false} onClick={() => addFocus(slot, o.nom)}>
                                                        <span className="font-semibold">{o.nom}</span>
                                                        <span className="block text-xs opacity-80 mt-0.5">{o.description}</span>
                                                    </Pill>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {step === 8 && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-default">Qui incarnez-vous ?</h2>
                            <p className="text-sm text-muted">Le personnage que vous venez de construire a maintenant besoin d'un nom. Les champs marqués <span className="zb-required">*</span> sont obligatoires, le reste est libre.</p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm text-muted mb-1">
                                        Votre prénom (joueur) <span className="zb-required">*</span>
                                    </label>
                                    <input value={playerName} onChange={e => setPlayerName(e.target.value)}
                                           className="zb-input w-full px-4 py-3 rounded-sm"
                                           placeholder="Ex : Camille" />
                                </div>
                                <div>
                                    <label className="block text-sm text-muted mb-1">
                                        Prénom du personnage <span className="zb-required">*</span>
                                    </label>
                                    <input value={prenom} onChange={e => setPrenom(e.target.value)}
                                           className="zb-input w-full px-4 py-3 rounded-sm"
                                           placeholder="Ex : Alex" />
                                </div>
                                <div>
                                    <label className="block text-sm text-muted mb-1">
                                        Nom du personnage <span className="zb-required">*</span>
                                    </label>
                                    <input value={nom} onChange={e => setNom(e.target.value)}
                                           className="zb-input w-full px-4 py-3 rounded-sm"
                                           placeholder="Ex : Ferrand" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm text-muted mb-1">Sexe</label>
                                    <div className="flex flex-wrap gap-2">
                                        {['Femme', 'Homme', 'Autre'].map(opt => (
                                            <button key={opt} type="button"
                                                    onClick={() => setSexe(sexe === opt ? '' : opt)}
                                                    className={`zb-pill px-4 py-3 rounded-sm text-sm ${sexe === opt ? 'is-selected' : ''}`}>
                                                {opt}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm text-muted mb-1">Âge</label>
                                    <input type="number" min="0" max="120" value={age}
                                           onChange={e => setAge(e.target.value)}
                                           className="zb-input zb-mono w-full px-4 py-3 rounded-sm"
                                           placeholder="Ex : 42" />
                                </div>
                                <div>
                                    <label className="block text-sm text-muted mb-1">Taille (cm)</label>
                                    <input type="number" min="0" max="250" value={taille}
                                           onChange={e => setTaille(e.target.value)}
                                           className="zb-input zb-mono w-full px-4 py-3 rounded-sm"
                                           placeholder="Ex : 175" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-muted mb-1">Description libre</label>
                                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={6}
                                          className="zb-input w-full px-4 py-3 rounded-sm"
                                          placeholder="Apparence, passé, ce qui l'a mené jusqu'ici…" />
                            </div>
                        </div>
                    )}

                    {step === 9 && archetype && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-default">Récapitulatif</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2 p-4 rounded-lg bg-surface-alt border border-default">
                                    <div className="font-semibold text-default">{prenom} {nom} — {archetype.label}</div>
                                    {(sexe || age || taille) && (
                                        <div className="zb-eyebrow">
                                            {[sexe, age ? `${age} ans` : null, taille ? `${taille} cm` : null].filter(Boolean).join(' · ')}
                                        </div>
                                    )}
                                    <div className="text-sm text-muted">{description || '—'}</div>
                                </div>
                                <div className="space-y-2 p-4 rounded-lg bg-surface-alt border border-default">
                                    <div className="font-semibold text-default mb-1">Principes</div>
                                    {PRINCIPES.map(p => <div key={p.key} className="text-sm text-muted flex justify-between"><span>{p.label}</span><span className="text-default font-bold">{principeRang(p.key)}</span></div>)}
                                </div>
                                <div className="space-y-2 p-4 rounded-lg bg-surface-alt border border-default">
                                    <div className="font-semibold text-default mb-1">Compétences</div>
                                    {COMPETENCES.map(c => <div key={c.key} className="text-sm text-muted flex justify-between"><span>{c.label}</span><span className="text-default font-bold">{competenceRang(c.key)}</span></div>)}
                                </div>
                                <div className="space-y-2 p-4 rounded-lg bg-surface-alt border border-default">
                                    <div className="font-semibold text-default mb-1">Prime Time</div>
                                    <div className="text-sm text-muted">{PRIME_TIME_DEPART} au départ (pas de plafond)</div>
                                </div>
                                <div className="space-y-1 p-4 rounded-lg bg-surface-alt border border-default md:col-span-2">
                                    <div className="font-semibold text-default mb-1">Maximes</div>
                                    {principesDebloques.map(p => <div key={p.key} className="text-sm text-muted">« {maximes[p.key]} » <span className="opacity-60">({p.label})</span></div>)}
                                </div>
                                <div className="space-y-1 p-4 rounded-lg bg-surface-alt border border-default md:col-span-2">
                                    <div className="font-semibold text-default mb-1">Vérité</div>
                                    <div className="text-sm text-muted">
                                        {veriteChoice === 'custom' ? veriteCustomNom : VERITES_CATALOG[archetypeKey][veriteChoice]?.nom}
                                    </div>
                                </div>
                                <div className="space-y-1 p-4 rounded-lg bg-surface-alt border border-default">
                                    <div className="font-semibold text-default mb-1">Talents</div>
                                    {talents.map(k => <div key={k} className="text-sm text-muted">{TALENTS_CATALOG[archetypeKey].find(t => t.key === k)?.nom}</div>)}
                                </div>
                                <div className="space-y-1 p-4 rounded-lg bg-surface-alt border border-default">
                                    <div className="font-semibold text-default mb-1">Focus</div>
                                    {[...focusMajeur, ...focusMineur].map(t => <div key={t} className="text-sm text-muted">{t}</div>)}
                                </div>
                            </div>
                            {createError && <div className="text-sm text-danger">{createError}</div>}
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-between mt-6">
                    <button type="button" onClick={step === 1 ? () => setShowIntro(true) : goPrev}
                            className="zb-btn-ghost zb-display px-5 py-2.5 rounded-sm">
                        ← {step === 1 ? 'Le brief' : 'Précédent'}
                    </button>
                    {step < STEPS.length ? (
                        <button type="button" onClick={goNext} disabled={!canNext()}
                                className="zb-btn-accent zb-display px-6 py-2.5 rounded-sm font-semibold">
                            Suivant →
                        </button>
                    ) : (
                        <button type="button" onClick={handleCreate} disabled={creating}
                                className="zb-btn-primary zb-display px-6 py-2.5 rounded-sm font-semibold">
                            {creating ? 'Enregistrement…' : 'Enregistrer la fiche'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Creation;