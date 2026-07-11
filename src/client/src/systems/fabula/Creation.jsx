// src/client/src/systems/fabula/Creation.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Wizard de création de personnage Fabula Ultima — PUBLIC, sans auth.
//
// Ordre (révisé — l'identité/le joueur passent en dernier, juste avant la
// création réelle, plutôt qu'en ouverture) :
//   1 — Classes & Compétences (2-3 classes, 5 niveaux à répartir, NC par classe)
//   2 — Répartition des Dés d'Attributs (3 profils)
//   3 — Statistiques Dérivées (calculées, lecture seule)
//   4 — Équipement Initial (budget 500 zénits, catalogue + saisie libre enrichie)
//   5 — Jet des économies (2d6 × 10 zénits, ajoutés au reliquat du budget)
//   6 — Points Fabula de départ (fixe : 3)
//   7 — Liens Initiaux
//   8 — Concept Évocateur (Identité / Origine / Thème + compte joueur) — DERNIER
//
// Garde-fous : les steppers +/- empêchent nativement tout état invalide
// (niveau de classe > ce que ses compétences peuvent absorber, rang de
// compétence > NC disponible) — plus de blocage silencieux après coup.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useMemo, useCallback } from 'react';
import './theme.css';
import { useSystem }   from '../../hooks/useSystem.js';
import { useFetch }    from '../../hooks/useFetch.js';
import { useNavigate } from 'react-router-dom';
import { roll }        from '../../tools/diceEngine.js';
import ThemeToggle      from '../../components/ui/ThemeToggle.jsx';
import fabulaConfig, { CLASSES, CLASS_ORDER, SPELL_LISTS, ARCANA_LISTS, equipItem, unequipItem, classAtoutBonuses } from './config.jsx';
import EquipmentEditForm, { EquipmentItemSummary, EMPLACEMENT_LABELS, createEmptyItem } from './components/layout/EquipmentEditForm.jsx';
import EquipmentCatalogModal from './components/modals/EquipmentCatalogModal.jsx';

// ══════════════════════════════════════════════════════════════════════════════
// CONSTANTES
// ══════════════════════════════════════════════════════════════════════════════

const STEPS = [
    { id: 1, label: 'Classes' },
    { id: 2, label: 'Attributs' },
    { id: 3, label: 'Statistiques' },
    { id: 4, label: 'Équipement' },
    { id: 5, label: 'Économies' },
    { id: 6, label: 'Points Fabula' },
    { id: 7, label: 'Liens' },
    { id: 8, label: 'Identité' },
];

const NIVEAU_TOTAL_DEPART = 5;
const BUDGET_EQUIPEMENT   = 500;
const POINTS_FABULA_DEPART = 3;

const ATTRS = [
    { key: 'dex', label: 'Dextérité' },
    { key: 'int', label: 'Intuition' },
    { key: 'pui', label: 'Puissance' },
    { key: 'vol', label: 'Volonté' },
];

const DIE_PROFILES = {
    equilibre:  { label: 'Équilibré (d8 / d8 / d8 / d8)',    dice: [8, 8, 8, 8] },
    specialise: { label: 'Spécialisé (d10 / d10 / d6 / d6)', dice: [10, 10, 6, 6] },
    polyvalent: { label: 'Polyvalent (d10 / d8 / d8 / d6)',  dice: [10, 8, 8, 6] },
};

const SENTIMENT_PAIRS = [
    ['admiration', 'inferiorite'],
    ['loyaute', 'mefiance'],
    ['affection', 'haine'],
];
const SENTIMENT_LABELS = {
    admiration: 'Admiration', inferiorite: 'Infériorité',
    loyaute: 'Loyauté', mefiance: 'Méfiance',
    affection: 'Affection', haine: 'Haine',
};

const CIBLE_TYPES = [
    { key: 'pj', label: 'PJ' },
    { key: 'pnj', label: 'PNJ' },
    { key: 'lieu', label: 'Lieu' },
    { key: 'organisation', label: 'Organisation' },
];

// ══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════════════════════════

const sum = (arr) => arr.reduce((a, b) => a + b, 0);

function computeStats(ws) {
    const { attrDice, classes, equipment } = ws;
    const dexDe = attrDice.dex ?? 8;
    const intDe = attrDice.int ?? 8;
    const puiDe = attrDice.pui ?? 8;
    const volDe = attrDice.vol ?? 8;

    const niveauGlobal = sum(classes.map(c => c.niveau || 0)) || NIVEAU_TOTAL_DEPART;

    // Atouts gratuits de classe : bonus PV/PM/PI max (même logique que
    // computeDerivedStats dans utils.js).
    const atouts  = classAtoutBonuses(classes);
    const pvMax   = puiDe * 5 + niveauGlobal + atouts.pv;
    const pmMax   = volDe * 5 + niveauGlobal + atouts.pm;
    const piMax   = 6 + atouts.pi;
    const seuilCrise = Math.floor(pvMax / 2);

    // Même logique que computeDerivedStats (utils.js) : un item est équipé
    // ssi emplacementEquipe != null ; une armure lourde (defFixe) remplace la
    // base dé DEX de la Défense, son propre mod est exclu, les mods des autres
    // pièces s'additionnent par-dessus.
    const equipes = equipment.filter(e => e.emplacementEquipe != null);
    const armure  = equipes.find(e => e.emplacementEquipe === 'armure');
    const defFixe = Number.isInteger(armure?.defFixe) ? armure.defFixe : null;

    const modInit   = sum(equipes.map(e => e.modInitiative ?? 0));
    const modDef    = sum(equipes.filter(e => !(defFixe !== null && e === armure)).map(e => e.modDefense ?? 0));
    const modDefMag = sum(equipes.map(e => e.modDefenseMagique ?? 0));

    const initiative     = Math.floor((dexDe + intDe) / 2) + modInit;
    const defense        = (defFixe ?? dexDe) + modDef;
    const defenseMagique = intDe + modDefMag;

    return { dexDe, intDe, puiDe, volDe, niveauGlobal, pvMax, pmMax, piMax, seuilCrise, initiative, defense, defenseMagique };
}

function classNiveauTotal(classes) {
    return sum(classes.map(c => c.niveau || 0));
}

function skillsForClass(skills, classKey) {
    return skills.filter(s => s.classKey === classKey);
}

function skillNiveauTotal(skills, classKey) {
    return sum(skillsForClass(skills, classKey).map(s => s.rang || 0));
}

// Total de NC absorbables par une classe (somme des ncMax de ses compétences)
function classAbsorbable(classKey) {
    return sum(CLASSES[classKey].competences.map(c => c.ncMax));
}

// ── Sous-composant : stepper +/- réutilisable ────────────────────────────────

const Stepper = ({ value, min, max, onChange, size = 'md' }) => {
    const dims = size === 'sm' ? 'w-6 h-6 text-xs' : 'w-7 h-7 text-sm';
    return (
        <div className="inline-flex items-center gap-2">
            <button type="button" disabled={value <= min}
                    onClick={() => onChange(Math.max(min, value - 1))}
                    className={`${dims} rounded-full border border-default bg-default flex items-center justify-center disabled:opacity-30 font-bold`}>
                −
            </button>
            <span className="text-sm font-semibold w-10 text-center">{value} / {max}</span>
            <button type="button" disabled={value >= max}
                    onClick={() => onChange(Math.min(max, value + 1))}
                    className={`${dims} rounded-full border border-default bg-default flex items-center justify-center disabled:opacity-30 font-bold`}>
                +
            </button>
        </div>
    );
};

// ══════════════════════════════════════════════════════════════════════════════
// COMPOSANT
// ══════════════════════════════════════════════════════════════════════════════

const Creation = ({ darkMode, onToggleDarkMode }) => {
    const { apiBase, slug } = useSystem();
    const fetchWithAuth     = useFetch();
    const navigate          = useNavigate();

    const [step, setStepRaw]    = useState(1);
    const [maxStepReached, setMaxStepReached] = useState(1);
    const setStep = (updater) => {
        setStepRaw(prev => {
            const next = typeof updater === 'function' ? updater(prev) : updater;
            setMaxStepReached(m => Math.max(m, next));
            return next;
        });
    };
    const [error, setError]     = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [statPool, setStatPool]         = useState([]); // [{id, value}] — dés du profil pas encore placés
    const [draggingChipId, setDraggingChipId] = useState(null);
    const [dragOverAttr, setDragOverAttr]     = useState(null);
    const [accessCode, setAccessCode] = useState(null);
    const [accessUrl, setAccessUrl]   = useState(null);
    const [copied, setCopied]         = useState(false);

    const [ws, setWs] = useState({
        // Étape 8 (dernière)
        playerName: '', nom: '', prenom: '',
        identite: '', origine: '', theme: '',
        // Étape 1
        classes: [],  // [{ classKey, niveau }]
        skills:  [],  // [{ classKey, skillKey, rang, spellsChoisis: [] }]
        arcana:  [],  // [{ arcanumKey, etat: 'lie' }]
        // Étape 2
        profil: null,
        attrDice: { dex: 8, int: 8, pui: 8, vol: 8 },
        // Étape 4
        equipment: [], // items à la forme createEmptyItem() — emplacementEquipe: null = non équipé
        // Étape 5
        economieRoll: null, // { values, total }
        // Étape 7
        bonds: [], // [{ cibleNom, cibleType, sentiments }]
    });

    const set = (patch) => setWs(w => ({ ...w, ...patch }));

    const stats = useMemo(() => computeStats(ws), [ws.attrDice, ws.classes, ws.equipment]);

    const budgetDepense = useMemo(() => sum(ws.equipment.map(e => e.prix || 0)), [ws.equipment]);
    const budgetRestant  = BUDGET_EQUIPEMENT - budgetDepense;

    // ── Étape 1 — Classes & compétences ─────────────────────────────────────────

    const toggleClass = (classKey) => {
        const already = ws.classes.some(c => c.classKey === classKey);
        if (already) {
            set({
                classes: ws.classes.filter(c => c.classKey !== classKey),
                skills:  ws.skills.filter(s => s.classKey !== classKey),
                arcana:  classKey === 'arcaniste' ? [] : ws.arcana,
            });
        } else {
            if (ws.classes.length >= 3) return;
            set({ classes: [...ws.classes, { classKey, niveau: 1 }] });
        }
    };

    // Plafond du niveau assignable à une classe : ce qu'il reste du budget de 5,
    // borné aussi par ce que ses compétences peuvent effectivement absorber
    // (empêche l'état bloqué "niveau investi > NC max disponibles").
    const classNiveauMax = useCallback((classKey) => {
        const usedByOthers = ws.classes.filter(c => c.classKey !== classKey).reduce((a, c) => a + c.niveau, 0);
        const remaining = NIVEAU_TOTAL_DEPART - usedByOthers;
        return Math.max(1, Math.min(remaining, classAbsorbable(classKey)));
    }, [ws.classes]);

    const setClassNiveau = (classKey, niveau) => {
        const max = classNiveauMax(classKey);
        const clamped = Math.max(1, Math.min(max, niveau));
        // Si on réduit le niveau en dessous des points déjà investis en compétences,
        // on retire l'excédent en partant des dernières compétences modifiées.
        let newSkills = ws.skills;
        const currentInvested = skillNiveauTotal(ws.skills, classKey);
        if (currentInvested > clamped) {
            let toRemove = currentInvested - clamped;
            newSkills = ws.skills.map(s => {
                if (s.classKey !== classKey || toRemove <= 0) return s;
                const reduction = Math.min(s.rang, toRemove);
                toRemove -= reduction;
                return { ...s, rang: s.rang - reduction, spellsChoisis: s.spellsChoisis.slice(0, s.rang - reduction) };
            });
        }
        set({
            classes: ws.classes.map(c => c.classKey === classKey ? { ...c, niveau: clamped } : c),
            skills: newSkills,
        });
    };

    // Plafond du rang assignable à une compétence : son NCMax propre, borné par
    // les points de classe restants une fois les autres compétences décomptées.
    const skillRangMax = useCallback((classKey, skillKey, ncMax) => {
        const classNiveau = ws.classes.find(c => c.classKey === classKey)?.niveau ?? 0;
        const usedByOtherSkills = skillsForClass(ws.skills, classKey)
            .filter(s => s.skillKey !== skillKey)
            .reduce((a, s) => a + s.rang, 0);
        return Math.max(0, Math.min(ncMax, classNiveau - usedByOtherSkills));
    }, [ws.classes, ws.skills]);

    const setSkillRang = (classKey, skillKey, rang) => {
        const existing = ws.skills.find(s => s.classKey === classKey && s.skillKey === skillKey);
        if (existing) {
            set({
                skills: ws.skills.map(s =>
                    (s.classKey === classKey && s.skillKey === skillKey)
                        ? { ...s, rang, spellsChoisis: s.spellsChoisis.slice(0, rang) }
                        : s
                ),
            });
        } else if (rang > 0) {
            set({ skills: [...ws.skills, { classKey, skillKey, rang, spellsChoisis: [] }] });
        }
    };

    const toggleSpellChoice = (classKey, skillKey, spellKey) => {
        set({
            skills: ws.skills.map(s => {
                if (s.classKey !== classKey || s.skillKey !== skillKey) return s;
                const has = s.spellsChoisis.includes(spellKey);
                if (has) return { ...s, spellsChoisis: s.spellsChoisis.filter(k => k !== spellKey) };
                if (s.spellsChoisis.length >= s.rang) return s; // limite atteinte
                return { ...s, spellsChoisis: [...s.spellsChoisis, spellKey] };
            }),
        });
    };

    const setArcanum = (arcanumKey) => set({ arcana: [{ arcanumKey, etat: 'lie' }] });

    // ── Étape 2 — Attributs : pool de dés à glisser-déposer (pattern Cyberpunk) ──

    const selectProfile = (key) => {
        const dice = DIE_PROFILES[key].dice;
        setDraggingChipId(null);
        setDragOverAttr(null);
        if (key === 'equilibre') {
            set({ profil: key, attrDice: { dex: 8, int: 8, pui: 8, vol: 8 } });
            setStatPool([]);
        } else {
            set({ profil: key, attrDice: { dex: null, int: null, pui: null, vol: null } });
            setStatPool(dice.map((v, i) => ({ id: `chip-${key}-${i}-${Date.now()}`, value: v })));
        }
    };

    const dropChipOnAttr = (attrKey, chipId) => {
        const chip = statPool.find(c => c.id === chipId);
        if (!chip || ws.attrDice[attrKey] != null) return; // slot déjà occupé
        set({ attrDice: { ...ws.attrDice, [attrKey]: chip.value } });
        setStatPool(pool => pool.filter(c => c.id !== chipId));
    };

    const returnChipFromAttr = (attrKey) => {
        const val = ws.attrDice[attrKey];
        if (val == null) return;
        setStatPool(pool => [...pool, { id: `chip-return-${attrKey}-${Date.now()}`, value: val }]);
        set({ attrDice: { ...ws.attrDice, [attrKey]: null } });
    };

    const attrsFullyAssigned = ATTRS.every(a => ws.attrDice[a.key] != null);

    const step1Valid = () => {
        if (ws.classes.length < 2 || ws.classes.length > 3) return false;
        if (classNiveauTotal(ws.classes) !== NIVEAU_TOTAL_DEPART) return false;
        for (const c of ws.classes) {
            if (skillNiveauTotal(ws.skills, c.classKey) !== c.niveau) return false;
            for (const s of skillsForClass(ws.skills, c.classKey)) {
                const def = CLASSES[c.classKey]?.competences.find(sk => sk.key === s.skillKey);
                if (!def || s.rang > def.ncMax) return false;
                if (def.learnsSpell && s.spellsChoisis.length !== s.rang && SPELL_LISTS[def.spellList]?.length > 0) return false;
                if (def.hasArcanaTable && s.rang > 0 && ws.arcana.length === 0) return false;
            }
        }
        return true;
    };

    // ── Étape 4 — Équipement ─────────────────────────────────────────────────

    const [catalogOpen, setCatalogOpen] = useState(false);

    const addEquipmentItem = () => {
        set({ equipment: [...ws.equipment, createEmptyItem()] });
    };
    // Le catalogue livre un item détaché prérempli, non équipé — le joueur
    // l'équipe explicitement ensuite (la modale reste ouverte : achats multiples).
    const addFromCatalog = (item) => {
        set({ equipment: [...ws.equipment, item] });
    };
    const updateEquipmentItem = (index, patch) => {
        set({ equipment: ws.equipment.map((e, i) => i === index ? { ...e, ...patch } : e) });
    };
    const removeEquipmentItem = (index) => {
        set({ equipment: ws.equipment.filter((_, i) => i !== index) });
    };

    // ── Étape 5 — Jet des économies ──────────────────────────────────────────

    const [rollingEconomie, setRollingEconomie] = useState(false);

    const rollEconomie = useCallback(async () => {
        if (rollingEconomie) return;
        setRollingEconomie(true);
        setError(null);
        try {
            const ctx = {
                apiBase, fetchFn: fetchWithAuth,
                characterId: null, characterName: ws.nom || 'Personnage',
                sessionId: null,
                label: 'Économies de départ', rollType: 'fabula_economie',
                systemData: { type: 'economie' },
            };
            const notation = fabulaConfig.dice.buildNotation(ctx);
            const result = await roll(notation, ctx, fabulaConfig.dice);
            set({ economieRoll: result });
        } catch (err) {
            setError(err.message ?? 'Erreur lors du jet de dés');
        } finally {
            setRollingEconomie(false);
        }
    }, [apiBase, fetchWithAuth, ws.nom, rollingEconomie]);

    const zenitFinal = (ws.economieRoll?.total ?? 0) + Math.max(0, budgetRestant);

    // ── Étape 7 — Liens ───────────────────────────────────────────────────────

    const addBond = () => {
        if (ws.bonds.length >= 6) return;
        set({ bonds: [...ws.bonds, { cibleNom: '', cibleType: 'pj', sentiments: [] }] });
    };
    const updateBond = (index, patch) => {
        set({ bonds: ws.bonds.map((b, i) => i === index ? { ...b, ...patch } : b) });
    };
    const removeBond = (index) => set({ bonds: ws.bonds.filter((_, i) => i !== index) });
    const toggleBondSentiment = (index, sentiment, pair) => {
        set({
            bonds: ws.bonds.map((b, i) => {
                if (i !== index) return b;
                const withoutPair = b.sentiments.filter(s => !pair.includes(s));
                const has = b.sentiments.includes(sentiment);
                return { ...b, sentiments: has ? withoutPair : [...withoutPair, sentiment].slice(0, 3) };
            }),
        });
    };

    // ── Navigation ────────────────────────────────────────────────────────────

    const canProceed = () => {
        switch (step) {
            case 1: return step1Valid();
            case 2: return !!ws.profil && (ws.profil === 'equilibre' || attrsFullyAssigned);
            case 3: return true;
            case 4: return budgetRestant >= 0;
            case 5: return !!ws.economieRoll;
            case 6: return true;
            case 7: return true;
            case 8: return ws.playerName.trim() && ws.nom.trim();
            default: return false;
        }
    };

    // Explique pourquoi le bouton Suivant est désactivé — évite les blocages
    // silencieux (ex : "pourquoi je ne peux pas avancer avec 1 seule classe ?").
    const getBlockReasons = () => {
        const reasons = [];
        if (step === 1) {
            if (ws.classes.length < 2) reasons.push('Sélectionnez au moins 2 classes (3 maximum).');
            else if (ws.classes.length > 3) reasons.push('3 classes maximum.');
            if (classNiveauTotal(ws.classes) !== NIVEAU_TOTAL_DEPART) {
                reasons.push(`Répartissez exactement ${NIVEAU_TOTAL_DEPART} niveaux entre vos classes (actuellement ${classNiveauTotal(ws.classes)}).`);
            }
            for (const c of ws.classes) {
                const skillTotal = skillNiveauTotal(ws.skills, c.classKey);
                if (skillTotal !== c.niveau) {
                    reasons.push(`${CLASSES[c.classKey].nom} : répartissez ${c.niveau} point(s) de compétence (actuellement ${skillTotal}).`);
                }
                for (const s of skillsForClass(ws.skills, c.classKey)) {
                    const def = CLASSES[c.classKey]?.competences.find(sk => sk.key === s.skillKey);
                    if (def?.learnsSpell && SPELL_LISTS[def.spellList]?.length > 0 && s.spellsChoisis.length !== s.rang) {
                        reasons.push(`${def.nom} : choisissez ${s.rang} sort(s) (${s.spellsChoisis.length} choisi(s)).`);
                    }
                    if (def?.hasArcanaTable && s.rang > 0 && ws.arcana.length === 0) {
                        reasons.push('Choisissez un Arcanum à lier au départ.');
                    }
                }
            }
        }
        if (step === 2) {
            if (!ws.profil) reasons.push('Choisissez un profil de répartition.');
            else if (ws.profil !== 'equilibre' && !attrsFullyAssigned) {
                reasons.push(`Placez le${statPool.length > 1 ? 's' : ''} ${statPool.length} dé${statPool.length > 1 ? 's' : ''} restant${statPool.length > 1 ? 's' : ''} sur un attribut.`);
            }
        }
        if (step === 4 && budgetRestant < 0) reasons.push(`Budget dépassé de ${-budgetRestant} zénits.`);
        if (step === 5 && !ws.economieRoll) reasons.push('Lancez les dés pour vos économies de départ.');
        if (step === 8) {
            if (!ws.playerName.trim()) reasons.push('Indiquez votre nom de joueur.');
            if (!ws.nom.trim()) reasons.push('Indiquez le nom du personnage.');
        }
        return reasons;
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        setError(null);
        try {
            const payload = {
                playerName: ws.playerName.trim(), nom: ws.nom.trim(), prenom: ws.prenom.trim(),
                identite: ws.identite, origine: ws.origine, theme: ws.theme,
                niveauGlobal: NIVEAU_TOTAL_DEPART,
                dexDe: stats.dexDe, intDe: stats.intDe, puiDe: stats.puiDe, volDe: stats.volDe,
                pvMax: stats.pvMax, pvActuel: stats.pvMax,
                pmMax: stats.pmMax, pmActuel: stats.pmMax,
                piMax: stats.piMax, piActuel: stats.piMax,
                seuilCrise: stats.seuilCrise,
                initiative: stats.initiative, defense: stats.defense, defenseMagique: stats.defenseMagique,
                zenit: zenitFinal, pointsFabula: POINTS_FABULA_DEPART,
                alterationsEtat: [],
                boostsAttributs: {}, // toujours vierge à la création — DEF/DEF.M du wizard
                                     // utilisent donc directement dexDe/intDe (équivalent à
                                     // effectiveAttrDie tant qu'aucun boost/altération n'existe)
                classes: ws.classes,
                skills:  ws.skills,
                arcana:  ws.arcana,
                bonds:   ws.bonds,
                equipment: ws.equipment,
            };

            const res = await fetch(`${apiBase}/characters`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error ?? 'Erreur lors de la création');
            }
            const character = await res.json();
            setAccessCode(character.accessCode);
            setAccessUrl(character.accessUrl);
            // Pas de navigate() immédiat — l'écran post-création affiche le code
            // d'accès en premier, sinon impossible de se reconnecter ensuite.
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const copyCode = () => {
        navigator.clipboard.writeText(accessCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // ══════════════════════════════════════════════════════════════════════════
    // ÉCRAN POST-CRÉATION — affiché avant toute navigation
    // ══════════════════════════════════════════════════════════════════════════

    if (accessCode) {
        return (
            <div className="min-h-screen bg-default text-default fu-font-body flex items-center justify-center p-4"
                 data-theme={darkMode ? 'dark' : 'light'}>
                <div className="bg-surface border border-default rounded-lg p-6 max-w-sm w-full text-center">
                    <div className="fu-font-title text-lg text-primary mb-1">✦ {ws.nom || 'Personnage'} est prêt·e !</div>
                    <p className="text-xs text-muted mb-4">Notez ce code — c'est votre seule façon de retrouver votre fiche.</p>
                    <div className="text-xs text-muted mb-1">Code d'accès</div>
                    <div className="fu-font-title text-3xl tracking-widest text-accent mb-3">{accessCode}</div>
                    <button onClick={copyCode} className="px-3 py-1 rounded border border-default text-sm mb-4">
                        {copied ? '✓ Copié !' : '⎘ Copier le code'}
                    </button>
                    <button onClick={() => navigate(`/${slug}/${accessUrl}`)}
                            className="px-4 py-2 rounded bg-primary text-white w-full">
                        Accéder à ma fiche →
                    </button>
                </div>
            </div>
        );
    }

    // ══════════════════════════════════════════════════════════════════════════
    // RENDU
    // ══════════════════════════════════════════════════════════════════════════

    return (
        <div className="min-h-screen bg-default text-default fu-font-body" data-theme={darkMode ? 'dark' : 'light'}>
            <div className="max-w-3xl mx-auto p-4">

                <div className="flex items-center justify-between mb-4">
                    <h1 className="fu-font-logo text-2xl text-primary">Création de personnage — Fabula Ultima</h1>
                    <ThemeToggle darkMode={darkMode} onToggle={onToggleDarkMode} />
                </div>

                {/* Barre d'étapes — cliquable pour revenir à une étape déjà atteinte */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {STEPS.map(s => {
                        const reachable = s.id <= maxStepReached;
                        return (
                            <button
                                key={s.id}
                                type="button"
                                disabled={!reachable}
                                onClick={() => reachable && setStep(s.id)}
                                className={`px-2 py-1 rounded text-xs border ${reachable ? 'cursor-pointer' : 'cursor-default'} ${
                                    s.id === step ? 'bg-primary text-white border-primary'
                                        : s.id < step ? 'bg-surface-alt border-default text-muted hover:border-primary'
                                            : 'bg-surface border-default text-muted opacity-50'
                                }`}
                            >
                                {s.id}. {s.label}
                            </button>
                        );
                    })}
                </div>

                {error && (
                    <div className="mb-4 p-3 rounded bg-danger/10 border border-danger text-danger text-sm">
                        {error}
                    </div>
                )}

                <div className="bg-surface border border-default rounded-lg p-4">

                    {/* ── Étape 1 — Classes & compétences ──────────────────────── */}
                    {step === 1 && (
                        <div className="flex flex-col gap-4">
                            <h2 className="fu-font-title text-lg">Classes & Compétences</h2>
                            <div className="text-sm">
                                Choisissez 2 à 3 classes et répartissez {NIVEAU_TOTAL_DEPART} niveaux entre elles.
                                Niveaux distribués :{' '}
                                <strong className={classNiveauTotal(ws.classes) === NIVEAU_TOTAL_DEPART ? 'text-success' : 'text-accent'}>
                                    {classNiveauTotal(ws.classes)} / {NIVEAU_TOTAL_DEPART}
                                </strong>
                            </div>

                            {/* Cartes de classe — nom + description toujours visibles */}
                            <div className="flex flex-wrap gap-2">
                                {CLASS_ORDER.map(key => {
                                    const selected = ws.classes.some(c => c.classKey === key);
                                    const canAdd = selected || ws.classes.length < 3;
                                    return (
                                        <button key={key} type="button" onClick={() => toggleClass(key)} disabled={!canAdd}
                                                className={`text-left px-3 py-2 rounded-lg border max-w-[240px] disabled:opacity-40 ${
                                                    selected ? 'bg-primary text-white border-primary' : 'bg-surface-alt border-default'
                                                }`}>
                                            <div className="font-semibold text-sm">{CLASSES[key].nom}</div>
                                            <div className={`text-xs italic mt-0.5 ${selected ? 'text-white/80' : 'text-muted'}`}>
                                                {CLASSES[key].tagline}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            {ws.classes.map(c => {
                                const def = CLASSES[c.classKey];
                                const skillTotal = skillNiveauTotal(ws.skills, c.classKey);
                                const niveauMax = classNiveauMax(c.classKey);
                                return (
                                    <div key={c.classKey} className="border border-default rounded p-3">
                                        <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                                            <h3 className="fu-font-title text-primary">{def.nom}</h3>
                                            <div className="flex items-center gap-2 text-sm">
                                                Niveau :
                                                <Stepper size="sm" value={c.niveau} min={1} max={niveauMax}
                                                         onChange={(v) => setClassNiveau(c.classKey, v)} />
                                            </div>
                                        </div>
                                        <p className="text-xs text-muted italic mb-2">{def.tagline}</p>
                                        {(def.atouts ?? []).map((a, idx) => (
                                            <div key={idx} className="text-[11px] text-muted flex items-start gap-1.5 mb-0.5">
                                                {a.type !== 'narratif' ? (
                                                    <span className="shrink-0 px-1.5 rounded-full bg-accent/10 text-accent border border-accent text-[10px] font-semibold">
                                                        {{ pv: 'PV', pm: 'PM', pi: 'PI' }[a.type]} +{a.valeur}
                                                    </span>
                                                ) : (
                                                    <span className="shrink-0 px-1.5 rounded-full bg-surface border border-default text-[10px]">
                                                        Atout
                                                    </span>
                                                )}
                                                <span>{a.label}</span>
                                            </div>
                                        ))}
                                        <div className="text-xs mb-2">
                                            Points de compétence à distribuer :{' '}
                                            <strong className={skillTotal === c.niveau ? 'text-success' : 'text-accent'}>
                                                {skillTotal} / {c.niveau}
                                            </strong>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            {def.competences.map(comp => {
                                                const skillEntry = ws.skills.find(s => s.classKey === c.classKey && s.skillKey === comp.key);
                                                const rang = skillEntry?.rang ?? 0;
                                                const rangMax = skillRangMax(c.classKey, comp.key, comp.ncMax);
                                                return (
                                                    <div key={comp.key} className="bg-surface-alt rounded p-2">
                                                        <div className="flex items-center justify-between flex-wrap gap-2">
                                                            <span className="text-sm font-semibold">{comp.nom} <span className="text-muted font-normal">(max {comp.ncMax})</span></span>
                                                            <Stepper size="sm" value={rang} min={0} max={rangMax}
                                                                     onChange={(v) => setSkillRang(c.classKey, comp.key, v)} />
                                                        </div>
                                                        <p className="text-xs text-muted mt-1 whitespace-pre-line">{comp.description}</p>

                                                        {/* Choix des sorts */}
                                                        {comp.learnsSpell && rang > 0 && SPELL_LISTS[comp.spellList]?.length > 0 && (
                                                            <div className="mt-2 pl-2 border-l-2 border-accent">
                                                                <div className="text-xs text-muted mb-1">
                                                                    Sorts choisis : {skillEntry?.spellsChoisis.length ?? 0} / {rang}
                                                                </div>
                                                                <div className="flex flex-wrap gap-1">
                                                                    {SPELL_LISTS[comp.spellList].map(sp => {
                                                                        const chosen = skillEntry?.spellsChoisis.includes(sp.key);
                                                                        return (
                                                                            <button key={sp.key} type="button"
                                                                                    onClick={() => toggleSpellChoice(c.classKey, comp.key, sp.key)}
                                                                                    className={`px-2 py-0.5 rounded text-xs border ${
                                                                                        chosen ? 'bg-accent text-white border-accent' : 'bg-default border-default'
                                                                                    }`}>
                                                                                {sp.nom}
                                                                            </button>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        )}
                                                        {comp.learnsSpell && rang > 0 && (!SPELL_LISTS[comp.spellList] || SPELL_LISTS[comp.spellList].length === 0) && (
                                                            <p className="text-xs text-muted italic mt-1">
                                                                Sorts appris en jeu (pas de catalogue fixe pour cette classe) — à noter avec le MJ.
                                                            </p>
                                                        )}

                                                        {/* Choix de l'Arcanum lié */}
                                                        {comp.hasArcanaTable && rang > 0 && (
                                                            <div className="mt-2 pl-2 border-l-2 border-accent">
                                                                <div className="text-xs text-muted mb-1">Arcanum lié au départ :</div>
                                                                <div className="flex flex-wrap gap-1">
                                                                    {ARCANA_LISTS[comp.arcanaList].map(arc => (
                                                                        <button key={arc.key} type="button" onClick={() => setArcanum(arc.key)}
                                                                                className={`px-2 py-0.5 rounded text-xs border ${
                                                                                    ws.arcana[0]?.arcanumKey === arc.key ? 'bg-accent text-white border-accent' : 'bg-default border-default'
                                                                                }`}>
                                                                            {arc.nom}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* ── Étape 2 — Attributs ──────────────────────────────────── */}
                    {step === 2 && (
                        <div className="flex flex-col gap-4">
                            <h2 className="fu-font-title text-lg">Répartition des Dés d'Attributs</h2>
                            <div className="flex flex-col gap-2">
                                {Object.entries(DIE_PROFILES).map(([key, p]) => (
                                    <button key={key} type="button" onClick={() => selectProfile(key)}
                                            className={`text-left px-3 py-2 rounded border ${
                                                ws.profil === key ? 'bg-primary text-white border-primary' : 'bg-surface-alt border-default'
                                            }`}>
                                        {p.label}
                                    </button>
                                ))}
                            </div>

                            {ws.profil && ws.profil !== 'equilibre' && (
                                <div className="flex flex-col gap-3">
                                    <p className="text-sm text-muted">
                                        Glissez chaque dé du pool sur l'attribut de votre choix.
                                        {' '}{statPool.length > 0
                                        ? `${statPool.length} dé${statPool.length > 1 ? 's' : ''} restant${statPool.length > 1 ? 's' : ''} à placer.`
                                        : 'Tous les dés sont placés ✓'}
                                    </p>

                                    {/* Pool des dés non placés */}
                                    <div className="flex flex-wrap gap-2 min-h-[2.5rem] p-2 border border-dashed border-default rounded">
                                        {statPool.length === 0 ? (
                                            <span className="text-xs text-success italic">Pool vide — tous les dés sont placés.</span>
                                        ) : statPool.map(chip => (
                                            <div key={chip.id}
                                                 draggable
                                                 onDragStart={e => { e.dataTransfer.setData('chipId', chip.id); setDraggingChipId(chip.id); }}
                                                 onDragEnd={() => setDraggingChipId(null)}
                                                 className="fu-die-badge bg-accent text-white border border-accent cursor-grab active:cursor-grabbing"
                                                 style={{ opacity: draggingChipId === chip.id ? 0.4 : 1 }}
                                                 title="Glissez sur un attribut">
                                                d{chip.value}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Zones de dépôt — une par attribut */}
                                    <div className="grid grid-cols-2 gap-2">
                                        {ATTRS.map(a => {
                                            const value = ws.attrDice[a.key];
                                            const isDragOver = dragOverAttr === a.key;
                                            return (
                                                <div key={a.key}
                                                     onDragOver={e => { e.preventDefault(); setDragOverAttr(a.key); }}
                                                     onDragLeave={() => setDragOverAttr(null)}
                                                     onDrop={e => {
                                                         e.preventDefault();
                                                         setDragOverAttr(null);
                                                         if (value == null) dropChipOnAttr(a.key, e.dataTransfer.getData('chipId'));
                                                     }}
                                                     onClick={() => value != null && returnChipFromAttr(a.key)}
                                                     className={`flex items-center justify-between rounded p-2 border transition-colors ${
                                                         isDragOver && value == null ? 'border-accent bg-accent/10'
                                                             : value != null ? 'border-default bg-surface-alt cursor-pointer' : 'border-dashed border-default bg-default'
                                                     }`}
                                                     title={value != null ? 'Cliquez pour renvoyer ce dé au pool' : 'Déposez un dé ici'}>
                                                    <span className="text-sm">{a.label}</span>
                                                    {value != null ? (
                                                        <span className="fu-die-badge bg-primary text-white border border-primary">d{value}</span>
                                                    ) : (
                                                        <span className="text-xs text-muted italic">vide</span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                            {ws.profil === 'equilibre' && (
                                <div className="grid grid-cols-2 gap-2">
                                    {ATTRS.map(a => (
                                        <div key={a.key} className="flex items-center justify-between rounded p-2 border border-default bg-surface-alt opacity-70">
                                            <span className="text-sm">{a.label}</span>
                                            <span className="fu-die-badge bg-default border border-default">d8</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── Étape 3 — Statistiques dérivées ─────────────────────── */}
                    {step === 3 && (
                        <div className="flex flex-col gap-3">
                            <h2 className="fu-font-title text-lg">Statistiques Dérivées</h2>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div className="bg-surface-alt rounded p-2">Points de Vie Max : <strong>{stats.pvMax}</strong></div>
                                <div className="bg-surface-alt rounded p-2">Seuil de Crise : <strong>{stats.seuilCrise}</strong></div>
                                <div className="bg-surface-alt rounded p-2">Points de Magie Max : <strong>{stats.pmMax}</strong></div>
                                <div className="bg-surface-alt rounded p-2">Points d'Inventaire Max : <strong>{stats.piMax}</strong></div>
                                <div className="bg-surface-alt rounded p-2">Initiative : <strong>{stats.initiative}</strong></div>
                                <div className="bg-surface-alt rounded p-2">Défense : <strong>{stats.defense}</strong></div>
                                <div className="bg-surface-alt rounded p-2">Défense Magique : <strong>{stats.defenseMagique}</strong></div>
                            </div>
                            <p className="text-xs text-muted">
                                Initiative/Défense/Défense Magique se mettront à jour automatiquement à l'étape suivante
                                selon les bonus manuels que vous indiquerez pour votre équipement.
                            </p>
                        </div>
                    )}

                    {/* ── Étape 4 — Équipement ─────────────────────────────────── */}
                    {step === 4 && (
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                                <h2 className="fu-font-title text-lg">Équipement Initial</h2>
                                <button type="button" onClick={() => setCatalogOpen(true)}
                                        className="px-3 py-1 rounded-full bg-primary text-white text-sm">
                                    📖 Catalogue
                                </button>
                            </div>
                            <div className="text-sm">
                                Budget : {BUDGET_EQUIPEMENT} zénits — Dépensé : {budgetDepense} —{' '}
                                <strong className={budgetRestant < 0 ? 'text-danger' : 'text-success'}>
                                    Restant : {budgetRestant}
                                </strong>
                            </div>

                            {ws.equipment.map((item, i) => (
                                <div key={i} className="bg-surface-alt rounded p-2 flex flex-col gap-2">
                                    <div className="flex items-start gap-2">
                                        <div className="flex-1 min-w-0">
                                            <EquipmentEditForm item={item} onChange={patch => updateEquipmentItem(i, patch)} />
                                        </div>
                                        <button type="button" onClick={() => removeEquipmentItem(i)} className="text-danger text-sm shrink-0">✕</button>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {item.emplacementEquipe != null ? (
                                            <>
                                                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary">
                                                    {EMPLACEMENT_LABELS[item.emplacementEquipe]}
                                                </span>
                                                <button type="button" onClick={() => set({ equipment: unequipItem(ws.equipment, i) })}
                                                        className="px-2 py-0.5 rounded-full text-xs border bg-default border-default">
                                                    Déséquiper
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <span className="text-[10px] text-muted italic">Non équipé — bonus non appliqués</span>
                                                <button type="button" onClick={() => set({ equipment: equipItem(ws.equipment, i) })}
                                                        className="px-2 py-0.5 rounded-full text-xs border bg-default border-default">
                                                    Équiper
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                            <button type="button" onClick={addEquipmentItem} className="px-3 py-1 rounded-full bg-primary text-white text-sm self-start">
                                + Ajouter un objet (saisie libre)
                            </button>

                            {/* includeRare=false : les objets rares ne sont pas des choix de
                                départ (décision MJ) — uniquement le catalogue de base ici. */}
                            <EquipmentCatalogModal open={catalogOpen} onClose={() => setCatalogOpen(false)}
                                                   onPick={addFromCatalog} includeRare={false} />
                        </div>
                    )}

                    {/* ── Étape 5 — Jet des économies ──────────────────────────── */}
                    {step === 5 && (
                        <div className="flex flex-col gap-3">
                            <h2 className="fu-font-title text-lg">Jet des Économies</h2>
                            <p className="text-sm text-muted">
                                Vous commencez avec 2d6 × 10 zénits, plus le reliquat de votre budget d'équipement ({Math.max(0, budgetRestant)} zénits).
                            </p>
                            {!ws.economieRoll ? (
                                <button type="button" onClick={rollEconomie} disabled={rollingEconomie}
                                        className="px-4 py-2 rounded bg-primary text-white self-start disabled:opacity-50">
                                    {rollingEconomie ? 'Lancer en cours...' : 'Lancer 2d6'}
                                </button>
                            ) : (
                                <div className="bg-surface-alt rounded p-3">
                                    <div className="text-sm">Résultat des dés : {ws.economieRoll.values.join(' + ')} × 10 = <strong>{ws.economieRoll.total} zénits</strong></div>
                                    <div className="text-sm mt-1">+ reliquat équipement : {Math.max(0, budgetRestant)} zénits</div>
                                    <div className="text-lg fu-font-title text-accent mt-2">Total : {zenitFinal} zénits</div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── Étape 6 — Points Fabula ──────────────────────────────── */}
                    {step === 6 && (
                        <div className="flex flex-col gap-3">
                            <h2 className="fu-font-title text-lg">Points Fabula de départ</h2>
                            <div className="fu-badge-fabula inline-flex items-center gap-2 px-3 py-2 rounded self-start">
                                <span className="text-2xl fu-font-title">{POINTS_FABULA_DEPART}</span>
                                <span className="text-sm">Points Fabula</span>
                            </div>
                            <p className="text-sm text-muted">Chaque personnage joueur commence la partie avec 3 Points Fabula.</p>
                        </div>
                    )}

                    {/* ── Étape 7 — Liens Initiaux ──────────────────────────────── */}
                    {step === 7 && (
                        <div className="flex flex-col gap-3">
                            <h2 className="fu-font-title text-lg">Liens Initiaux</h2>

                            <div className="flex items-center justify-between mt-2">
                                <span className="text-sm text-muted">Liens (optionnel, max 6)</span>
                                <button type="button" onClick={addBond} disabled={ws.bonds.length >= 6}
                                        className="px-2 py-1 rounded-full bg-primary text-white text-xs disabled:opacity-40">
                                    + Ajouter un lien
                                </button>
                            </div>

                            {ws.bonds.map((b, i) => (
                                <div key={i} className="bg-surface-alt rounded p-2 flex flex-col gap-1">
                                    <div className="flex gap-2 items-center">
                                        <input placeholder="Nom de la cible (PJ, PNJ, lieu...)" value={b.cibleNom}
                                               onChange={e => updateBond(i, { cibleNom: e.target.value })}
                                               className="bg-default border border-default rounded px-2 py-1 text-sm flex-1" />
                                        <div className="flex gap-1">
                                            {CIBLE_TYPES.map(t => (
                                                <button key={t.key} type="button"
                                                        onClick={() => updateBond(i, { cibleType: t.key })}
                                                        className={`px-2 py-1 rounded-full text-xs border ${
                                                            b.cibleType === t.key ? 'bg-primary text-white border-primary' : 'bg-default border-default'
                                                        }`}>
                                                    {t.label}
                                                </button>
                                            ))}
                                        </div>
                                        <button type="button" onClick={() => removeBond(i)} className="text-danger text-sm">✕</button>
                                    </div>
                                    <div className="flex gap-3 text-xs flex-wrap">
                                        {SENTIMENT_PAIRS.map(pair => (
                                            <div key={pair.join('-')} className="flex gap-1">
                                                {pair.map(s => (
                                                    <button key={s} type="button" onClick={() => toggleBondSentiment(i, s, pair)}
                                                            className={`px-2 py-0.5 rounded border ${
                                                                b.sentiments.includes(s) ? 'bg-accent text-white border-accent' : 'bg-default border-default'
                                                            }`}>
                                                        {SENTIMENT_LABELS[s]}
                                                    </button>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* ── Étape 8 — Concept Évocateur (dernière étape) ─────────── */}
                    {step === 8 && (
                        <div className="flex flex-col gap-3">
                            <h2 className="fu-font-title text-lg">Pour finir, qui êtes-vous ?</h2>
                            <p className="text-xs text-muted -mt-2">
                                Dernière étape : votre nom de joueur et l'identité narrative de votre personnage.
                            </p>
                            <label className="text-sm text-muted">Votre nom (joueur)</label>
                            <input className="bg-default border border-default rounded px-2 py-1"
                                   value={ws.playerName} onChange={e => set({ playerName: e.target.value })} />
                            <label className="text-sm text-muted">Nom du personnage</label>
                            <input className="bg-default border border-default rounded px-2 py-1"
                                   value={ws.nom} onChange={e => set({ nom: e.target.value })} />
                            <label className="text-sm text-muted">Prénom (optionnel)</label>
                            <input className="bg-default border border-default rounded px-2 py-1"
                                   value={ws.prenom} onChange={e => set({ prenom: e.target.value })} />
                            <label className="text-sm text-muted">Identité</label>
                            <input className="bg-default border border-default rounded px-2 py-1"
                                   placeholder="ex : Ancien chevalier du royaume en quête de rédemption"
                                   value={ws.identite} onChange={e => set({ identite: e.target.value })} />
                            <label className="text-sm text-muted">Origine</label>
                            <input className="bg-default border border-default rounded px-2 py-1"
                                   placeholder="ex : Le Royaume Céleste de Baron"
                                   value={ws.origine} onChange={e => set({ origine: e.target.value })} />
                            <label className="text-sm text-muted">Thème</label>
                            <input className="bg-default border border-default rounded px-2 py-1"
                                   placeholder="ex : Ambition, Justice, Culpabilité, Espoir"
                                   value={ws.theme} onChange={e => set({ theme: e.target.value })} />
                        </div>
                    )}

                </div>

                {/* Raisons du blocage — visibles dès que Suivant est désactivé */}
                {!canProceed() && getBlockReasons().length > 0 && (
                    <div className="mt-4 p-2 rounded bg-accent/10 border border-accent text-xs text-accent">
                        {getBlockReasons().map((r, i) => <div key={i}>• {r}</div>)}
                    </div>
                )}

                {/* Navigation */}
                <div className="flex justify-between mt-2">
                    {step > 1 ? (
                        <button type="button" onClick={() => setStep(s => Math.max(1, s - 1))}
                                className="px-4 py-2 rounded border border-default">
                            Précédent
                        </button>
                    ) : <span />}
                    {step < STEPS.length ? (
                        <button type="button" onClick={() => canProceed() && setStep(s => s + 1)} disabled={!canProceed()}
                                className="px-4 py-2 rounded bg-primary text-white disabled:opacity-40">
                            Suivant
                        </button>
                    ) : (
                        <button type="button" onClick={handleSubmit} disabled={!canProceed() || submitting}
                                className="px-4 py-2 rounded bg-accent text-white disabled:opacity-40">
                            {submitting ? 'Création...' : 'Créer le personnage'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Creation;