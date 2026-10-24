// src/client/src/pages/GenMapPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Générateur de plans, prototype P0 (spec_genmap.md §11, §14) : page de la plateforme
// accessible sans connexion. Choix du preset, programme en lecture seule, réglages de
// l'enveloppe, génération et aperçu du rez-de-chaussée, messages d'échec (§6.2).
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect, useMemo, useState } from 'react';
import { applyTheme } from '../tools/utils.js';
import useSlugGuard from '../hooks/useSlugGuard.js';
import { generate, resolvePreset } from '../genmap/generate.js';
import { renderSvg, floorLabel } from '../genmap/renderSvg.js';
import roomTypes from '../genmap/data/roomTypes.json';
import inn from '../genmap/data/presets/inn.json';
import manor from '../genmap/data/presets/manor.json';
import temple from '../genmap/data/presets/temple.json';
import warehouse from '../genmap/data/presets/warehouse.json';
import house from '../genmap/data/presets/house.json';
import tower from '../genmap/data/presets/tower.json';
import engine from '../genmap/data/engine.json';

// Presets disponibles (§5, §14.3), résolus une fois pour toutes
const PRESETS = [inn, manor, temple, warehouse, house, tower].map(preset => ({ id: preset.id, label: preset.label, ...resolvePreset(preset, roomTypes) }));

const DENSITIES = [
    { id: 'dense',    label: 'Dense' },
    { id: 'balanced', label: 'Équilibré' },
    { id: 'spacious', label: 'Aéré' },
];

// Largeur maximale du couloir (§13, O-5)
const CORRIDOR_WIDTHS = [1, 2, 3];

// Nombre d'étages au-dessus du RDC (§4.2)
const FLOOR_COUNTS = [0, 1, 2, 3, 4];

// Contour du bâtiment, expérimental (§13, O-4)
const OUTLINES = [
    { id: false, label: 'Rectangle' },
    { id: true,  label: 'Libre' },
];

// Schéma de circulation (§18.2) : celui du preset, ou imposé pour comparer
const SCHEMES = [
    { id: 'preset',   label: 'Preset' },
    { id: 'free',     label: 'Libre' },
    { id: 'spine',    label: 'Traversant' },
    { id: 'gallery',  label: 'Galerie' },
    { id: 'enfilade', label: 'Enfilade' },
];
const SCHEME_LABELS = { spine: 'traversant', gallery: 'galerie', enfilade: 'enfilade' };
const LEVEL_NAMES = { ground: 'RDC', upper: 'étages', basement: 'sous-sol' };

const FLOOR_LABELS = { ground: 'RDC', upper: 'Étage', basement: 'Sous-sol', any: 'Libre', top: 'Dernier étage' };

// Messages d'échec et suggestions (§6.2)
const FAILURES = {
    envelope:  { message: 'Le bâtiment est trop petit pour accueillir toutes les pièces.', hint: 'Augmentez la largeur ou la longueur.', grow: true },
    overload:  { message: 'Trop de pièces pour la surface définie.', hint: 'Réduisez le nombre de pièces ou augmentez la surface.', grow: true },
    adjacency: { message: 'Certaines contraintes de placement sont incompatibles.', hint: 'Vérifiez les règles de voisinage.' },
    seed:      { message: 'La génération n\'a pas abouti avec cette graine.', hint: 'Essayez avec une nouvelle graine.' },
    // §17, S-2 : aucune graine ne peut réussir, on ne propose pas d'en changer
    oversize:  { message: 'Le bâtiment est trop grand pour son programme.', hint: 'Réduisez la largeur ou la longueur, ou passez en contour libre pour que le bâtiment se resserre.', shrink: true, noSeed: true },
    // §19, D-3 : dégagement plus large que le couloir autorisé
    unfilled:  { message: 'Il reste de la place que les pièces n\'arrivent pas à occuper.', hint: 'Essayez une nouvelle graine, autorisez un couloir plus large ou réduisez les dimensions.', shrink: true, widen: true },
};

const MIN_SIDE = 4;
const MAX_SIDE = 40;

const typeLabel = (id) => roomTypes.find(t => t.id === id)?.label ?? id;

// Règles de voisinage et d'accès du programme (§23), limitées aux types présents
const rulesOf = (program) => {
    const all = [...program.rooms, ...program.optionalRooms];
    const present = new Set(all.map(r => r.id));
    return [...new Map(all.map(r => [r.id, r])).values()].flatMap(room => [
        ...room.mustBeAdjacentTo.filter(t => present.has(t)).map(t => ({ key: `${room.id}+${t}`, text: `${room.label} touche ${typeLabel(t)}` })),
        ...room.cannotBeAdjacentTo.filter(t => present.has(t)).map(t => ({ key: `${room.id}-${t}`, text: `${room.label} ne touche pas ${typeLabel(t)}` })),
        ...room.access.required.filter(t => present.has(t)).map(t => ({ key: `${room.id}>${t}`, text: `${room.label} ouvre sur ${typeLabel(t)}` })),
        ...room.access.forbidden.filter(t => present.has(t)).map(t => ({ key: `${room.id}/${t}`, text: `${room.label} sans porte vers ${typeLabel(t)}` })),
        ...(room.circulationAccess === 'required' ? [{ key: `${room.id}=c`, text: `${room.label} donne sur la circulation` }] : []),
        ...(room.outsideAccess === 'optional' && room.serviceDoorChance ? [{ key: `${room.id}=s`, text: `${room.label} : porte de service possible` }] : []),
    ]);
};

const randomSeed = () => Math.floor(Math.random() * 1_000_000_000);
const clampSide  = (value) => Math.min(MAX_SIDE, Math.max(MIN_SIDE, Math.round(value) || MIN_SIDE));
const quantityOf = (q) => (Array.isArray(q) ? `${q[0]}–${q[1]}` : q);

// Ligne du programme : pièce, quantité, tailles, étage
const ProgramRoom = ({ room }) => (
    <li className="flex justify-between gap-2">
        <span>{room.label} ×{quantityOf(room.quantity)}{room.per && ` par ${typeLabel(room.per).toLowerCase()}`}</span>
        <span className="text-muted">
            {room.sizeMin}–{room.sizeMax} cases · {FLOOR_LABELS[room.floor] ?? `Étage ${room.floor}`}
        </span>
    </li>
);

const Icon = ({ d, children }) => (
    <svg className="vtt-icon-line" viewBox="0 0 24 24" aria-hidden="true">{d ? <path d={d} /> : children}</svg>
);

const GenMapPage = ({ darkMode, onToggleDarkMode }) => {
    const mustReload = useSlugGuard();
    const [presetId,  setPresetId]  = useState(PRESETS[0].id);
    const { label: presetLabel, program, params: defaults } = PRESETS.find(p => p.id === presetId);
    const [width,     setWidth]     = useState(defaults.width);
    const [length,    setLength]    = useState(defaults.length);
    const [density,   setDensity]   = useState(defaults.density);
    const [maxWidth,  setMaxWidth]  = useState(engine.corridorMaxWidth);
    const [freeOutline, setFreeOutline] = useState(false);
    const [scheme,    setScheme]    = useState('preset');
    const [floors,    setFloors]    = useState(defaults.floors);
    const [basement,  setBasement]  = useState(defaults.basement);
    const [seedInput, setSeedInput] = useState('');
    const [result,    setResult]    = useState(null);
    const [level,     setLevel]     = useState(0);

    // Jour / nuit de la plateforme sur <html>
    useEffect(() => {
        applyTheme(darkMode);
    }, [darkMode]);

    const run = (seed, overrides = {}) => {
        const params = {
            ...defaults, width: clampSide(width), length: clampSide(length), density,
            corridorMaxWidth: maxWidth, freeOutline, scheme, floors, basement, ...overrides, seed,
        };
        setWidth(params.width);
        setLength(params.length);
        setResult({ ...generate(program, params), seed });
        // Le niveau affiché est conservé s'il existe encore, sinon retour au RDC
        if (level > params.floors || (level < 0 && !params.basement)) setLevel(0);
    };

    const onGenerate = () => {
        const typed = parseInt(seedInput, 10);
        run(Number.isFinite(typed) ? typed : randomSeed());
    };

    const onNewSeed = () => {
        setSeedInput('');
        run(randomSeed());
    };

    // Changer de preset reprend ses dimensions et sa densité, et efface le plan affiché
    const selectPreset = (id) => {
        const { params } = PRESETS.find(p => p.id === id);
        setPresetId(id);
        setWidth(params.width);
        setLength(params.length);
        setDensity(params.density);
        setFloors(params.floors);
        setBasement(params.basement);
        setLevel(0);
        setResult(null);
    };

    // Niveau affiché (§4.3, §20, E2-10) : un onglet par niveau du plan
    const shownIndex = result?.ok ? Math.max(0, result.plan.floors.findIndex(f => f.level === level)) : -1;
    const svg = useMemo(() => (shownIndex >= 0 ? renderSvg(result.plan, shownIndex) : null), [result, shownIndex]);
    const rules = rulesOf(program);
    // Schémas du preset, avec ses surcharges par niveau (§25, CN-1) : « libre, étages traversant »
    const schemesText = (layout) => layout?.schemes
        ?.map(s => (s === 'hub' ? `autour de la pièce « ${typeLabel(layout.hub.room).toLowerCase()} »` : SCHEME_LABELS[s])).join(' ou ') ?? 'libre';
    const presetSchemes = [schemesText(program.layout), ...Object.entries(program.layoutByLevel ?? {})
        .map(([level, layout]) => `${LEVEL_NAMES[level] ?? `étage ${level}`} ${schemesText(layout)}`)].join(', ');
    const failure = result && !result.ok ? FAILURES[result.reason] : null;

    // Arrivée par navigation interne depuis un slug : rechargement en cours
    if (mustReload) return null;

    return (
        <div className="vtt-platform flex flex-col">
            {/* ── En-tête ──────────────────────────────────────────────────── */}
            <header className="vtt-page-header">
                <div>
                    <h1 className="vtt-brand-name">Générateur <span>de plans</span></h1>
                    <p className="text-xs text-muted mt-0.5">Prototype : étages et sous-sol</p>
                </div>
                <div className="flex items-center gap-2">
                    <a className="vtt-btn vtt-btn-sm" href="/">
                        <Icon d="M15 6l-6 6 6 6" />
                        <span className="hidden sm:inline">Accueil</span>
                    </a>
                    <button type="button" className="vtt-btn vtt-btn-sm vtt-btn-icon" onClick={onToggleDarkMode} title={darkMode ? 'Mode jour' : 'Mode nuit'}>
                        {darkMode
                            ? <Icon><circle cx="12" cy="12" r="4.5" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9 7 7M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1" /></Icon>
                            : <Icon d="M16 3.5A8.5 8.5 0 1 0 20.5 16 7 7 0 0 1 16 3.5z" />}
                    </button>
                </div>
            </header>

            <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 grid gap-6 lg:grid-cols-[20rem_1fr] items-start">
                {/* ── Composition ──────────────────────────────────────────── */}
                <aside className="space-y-6">
                    <section>
                        <h2 className="vtt-section-title">Preset</h2>
                        <div className="flex flex-wrap gap-2">
                            {PRESETS.map(p => (
                                <button key={p.id} type="button" className={`vtt-pill${presetId === p.id ? ' is-selected' : ''}`} onClick={() => selectPreset(p.id)}>
                                    {p.label}
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Actions en haut du panneau (§18, P-4) */}
                    <div className="flex gap-2">
                        <button type="button" className="vtt-btn vtt-btn-primary flex-1" onClick={onGenerate}>Générer</button>
                        <button type="button" className="vtt-btn flex-1" onClick={onNewSeed}>Nouvelle graine</button>
                    </div>

                    <section className="space-y-3">
                        <h2 className="vtt-section-title">Paramètres</h2>
                        <div>
                            <span className="vtt-field-label">Étages au-dessus du RDC</span>
                            <div className="vtt-segmented">
                                {FLOOR_COUNTS.map(n => (
                                    <button key={n} type="button" className={`vtt-segment${floors === n ? ' is-active' : ''}`} onClick={() => setFloors(n)}>{n}</button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <span className="vtt-field-label">Sous-sol</span>
                            <div className="vtt-segmented">
                                {[false, true].map(b => (
                                    <button key={String(b)} type="button" className={`vtt-segment${basement === b ? ' is-active' : ''}`} onClick={() => setBasement(b)}>{b ? 'Oui' : 'Non'}</button>
                                ))}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <label>
                                <span className="vtt-field-label">Largeur</span>
                                <input type="number" className="vtt-input" min={MIN_SIDE} max={MAX_SIDE} value={width} onChange={e => setWidth(Number(e.target.value))} />
                            </label>
                            <label>
                                <span className="vtt-field-label">Longueur</span>
                                <input type="number" className="vtt-input" min={MIN_SIDE} max={MAX_SIDE} value={length} onChange={e => setLength(Number(e.target.value))} />
                            </label>
                        </div>
                        <div>
                            <span className="vtt-field-label">Circulation</span>
                            <div className="flex flex-wrap gap-2">
                                {SCHEMES.map(s => (
                                    <button key={s.id} type="button" className={`vtt-pill${scheme === s.id ? ' is-selected' : ''}`} onClick={() => setScheme(s.id)}>
                                        {s.id === 'preset' ? `Preset (${presetSchemes})` : s.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <span className="vtt-field-label">Densité</span>
                            <div className="vtt-segmented">
                                {DENSITIES.map(d => (
                                    <button key={d.id} type="button" className={`vtt-segment${density === d.id ? ' is-active' : ''}`} onClick={() => setDensity(d.id)}>
                                        {d.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <span className="vtt-field-label">Largeur max. du couloir</span>
                            <div className="vtt-segmented">
                                {CORRIDOR_WIDTHS.map(w => (
                                    <button key={w} type="button" className={`vtt-segment${maxWidth === w ? ' is-active' : ''}`} onClick={() => setMaxWidth(w)}>
                                        {w} case{w > 1 ? 's' : ''}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <span className="vtt-field-label">Contour</span>
                            <div className="vtt-segmented">
                                {OUTLINES.map(o => (
                                    <button key={o.label} type="button" className={`vtt-segment${freeOutline === o.id ? ' is-active' : ''}`} onClick={() => setFreeOutline(o.id)}>
                                        {o.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <label className="block">
                            <span className="vtt-field-label">Graine (facultative)</span>
                            <input type="number" className="vtt-input" placeholder="Aléatoire" value={seedInput} onChange={e => setSeedInput(e.target.value)} />
                        </label>
                    </section>

                    {/* Programme et liens, repliables (§18, P-4) */}
                    <details className="vtt-panel p-3">
                        <summary className="vtt-section-title cursor-pointer mb-0">Programme : {presetLabel}</summary>
                        <ul className="mt-3 space-y-1 text-sm">
                            {program.rooms.map(room => <ProgramRoom key={room.id} room={room} />)}
                        </ul>
                        {program.optionalRooms.length > 0 && (
                            <>
                                <p className="mt-3 text-xs font-semibold text-muted">Complément, selon la place</p>
                                <ul className="mt-1 space-y-1 text-sm">
                                    {program.optionalRooms.map(room => <ProgramRoom key={`${room.id}:${room.per ?? room.floor}`} room={room} />)}
                                </ul>
                            </>
                        )}
                        {rules.length > 0 && (
                            <ul className="mt-3 space-y-0.5 text-xs text-muted">
                                {rules.map(rule => <li key={rule.key}>{rule.text}</li>)}
                            </ul>
                        )}
                    </details>

                    <details className="vtt-panel p-3">
                        <summary className="vtt-section-title cursor-pointer mb-0">Liens verticaux</summary>
                        <ul className="mt-3 space-y-1 text-sm">
                            {program.verticalLinks.map(link => (
                                <li key={link.label} className="flex justify-between gap-2">
                                    <span>{link.label}</span>
                                    <span className="text-muted">{link.kind === 'spiral' && 'colimaçon · '}{link.sizeInCells} cases</span>
                                </li>
                            ))}
                        </ul>
                    </details>
                </aside>

                {/* ── Prévisualisation ─────────────────────────────────────── */}
                <section className="space-y-3 min-w-0">
                    {!result && (
                        <div className="vtt-panel p-10 text-center text-muted">
                            Choisissez les dimensions puis lancez « Générer ».
                        </div>
                    )}

                    {failure && (
                        <div className="vtt-callout vtt-callout-danger space-y-2">
                            <p className="font-semibold">{failure.message}</p>
                            <p>{failure.hint}</p>
                            <div className="flex flex-wrap gap-2">
                                {!failure.noSeed && (
                                    <button type="button" className="vtt-btn vtt-btn-sm vtt-btn-primary" onClick={onNewSeed}>Nouvelle graine</button>
                                )}
                                {failure.widen && maxWidth < CORRIDOR_WIDTHS.at(-1) && (
                                    <button type="button" className="vtt-btn vtt-btn-sm" onClick={() => { setMaxWidth(maxWidth + 1); run(result.seed, { corridorMaxWidth: maxWidth + 1 }); }}>
                                        Couloir jusqu'à {maxWidth + 1} cases
                                    </button>
                                )}
                                {failure.grow && (
                                    <>
                                        <button type="button" className="vtt-btn vtt-btn-sm" onClick={() => run(result.seed, { width: clampSide(width + 2) })}>Largeur +2</button>
                                        <button type="button" className="vtt-btn vtt-btn-sm" onClick={() => run(result.seed, { length: clampSide(length + 2) })}>Longueur +2</button>
                                    </>
                                )}
                                {failure.shrink && (
                                    <>
                                        <button type="button" className="vtt-btn vtt-btn-sm" onClick={() => run(result.seed, { width: clampSide(width - 2) })}>Largeur −2</button>
                                        <button type="button" className="vtt-btn vtt-btn-sm" onClick={() => run(result.seed, { length: clampSide(length - 2) })}>Longueur −2</button>
                                        <button type="button" className="vtt-btn vtt-btn-sm" onClick={() => { setFreeOutline(true); run(result.seed, { freeOutline: true }); }}>Contour libre</button>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {svg && (
                        <>
                            {result.plan.floors.length > 1 && (
                                <div className="vtt-segmented">
                                    {/* Du sous-sol à gauche aux étages supérieurs à droite */}
                                    {result.plan.floors.map(f => (
                                        <button key={f.level} type="button" className={`vtt-segment${result.plan.floors[shownIndex].level === f.level ? ' is-active' : ''}`} onClick={() => setLevel(f.level)}>
                                            {floorLabel(f.level)}
                                        </button>
                                    ))}
                                </div>
                            )}
                            <div className="vtt-plan-preview" dangerouslySetInnerHTML={{ __html: svg }} />
                            <p className="text-sm text-muted">Graine : <span className="font-semibold text-default">{result.seed}</span></p>
                        </>
                    )}
                </section>
            </main>
        </div>
    );
};

export default GenMapPage;
