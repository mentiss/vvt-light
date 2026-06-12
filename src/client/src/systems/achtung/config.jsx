// src/client/src/systems/achtung/config.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Configuration CLIENT du système Achtung! Cthulhu (2D20 Modiphius).
// ⚠️  Module ES — uniquement importé par le frontend React.
// ─────────────────────────────────────────────────────────────────────────────

import { RollError } from '../../tools/diceEngine.js';
import AchtungHistoryEntry from './components/AchtungHistoryEntry.jsx';

// ── Données système — attributs ───────────────────────────────────────────────

export const ATTRIBUTES = [
    { key: 'agility',      label: 'Agilité' },
    { key: 'brawn',        label: 'Force' },
    { key: 'coordination', label: 'Coordination' },
    { key: 'insight',      label: 'Intuition' },
    { key: 'reason',       label: 'Raisonnement' },
    { key: 'will',         label: 'Volonté' },
];

// ── Données système — compétences ─────────────────────────────────────────────

export const SKILLS = [
    { key: 'academia',    label: 'Érudition',    focuses: ['Art', 'Cryptographie', 'Finance', 'Histoire', 'Linguistique', 'Occultisme', 'Science'] },
    { key: 'athletics',   label: 'Athlétisme',   focuses: ['Escalade', 'Force', 'Entraînement physique', 'Course', 'Natation', 'Lancer'] },
    { key: 'engineering', label: 'Ingénierie',   focuses: ['Architecture', 'Génie de combat', 'Électronique', 'Explosifs', 'Génie mécanique'] },
    { key: 'fighting',    label: 'Combat',       focuses: ['Corps à corps', 'Armes de poing', 'Main nue', 'Armes lourdes', 'Armes de mêlée', 'Fusils', 'Vigilance', 'Exotique'] },
    { key: 'medicine',    label: 'Médecine',     focuses: ['Premiers secours', 'Maladies infectieuses', 'Pharmacologie', 'Psychiatrie', 'Chirurgie', 'Toxicologie'] },
    { key: 'observation', label: 'Observation',  focuses: ['Ouïe', 'Instinct', 'Vue', 'Odorat et goût'] },
    { key: 'persuasion',  label: 'Persuasion',   focuses: ['Charme', 'Insinuation', 'Intimidation', 'Négociation', 'Rhétorique', 'Tromperie', 'Invocation'] },
    { key: 'resilience',  label: 'Résilience',   focuses: ['Endurance', 'Discipline', 'Immunité'] },
    { key: 'stealth',     label: 'Discrétion',   focuses: ['Camouflage', 'Déguisement', 'Discrétion rurale', 'Discrétion urbaine'] },
    { key: 'survival',    label: 'Survie',       focuses: ['Dressage', 'Cueillette', 'Chasse', 'Mysticisme', 'Orientation', 'Pistage'] },
    { key: 'tactics',     label: 'Tactique',     focuses: ['Aviation', 'Armée de terre', 'Opérations clandestines', 'Commandement', 'Marine', 'Projets techniques'] },
    { key: 'vehicles',    label: 'Véhicules',    focuses: ['Voitures', 'Motos', 'Véhicules lourds', 'Chars', 'Aéronefs', 'Embarcations'] },
];

// ── Données système — archetypes ──────────────────────────────────────────────

export const ARCHETYPES = [
    { key: 'boffin',       label: 'Boffin' },
    { key: 'commander',    label: 'Commander' },
    { key: 'con_artist',   label: 'Con Artist' },
    { key: 'grease_monkey',label: 'Grease Monkey' },
    { key: 'infiltrator',  label: 'Infiltrator' },
    { key: 'investigator', label: 'Investigator' },
    { key: 'occultist',    label: 'Occultist' },
    { key: 'soldier',      label: 'Soldier' },
];

// ── Données système — backgrounds ─────────────────────────────────────────────

export const BACKGROUNDS = [
    { key: 'academic',          label: 'Academic' },
    { key: 'air_force',         label: 'Air Force' },
    { key: 'army',              label: 'Army' },
    { key: 'athlete',           label: 'Athlete' },
    { key: 'covert_operative',  label: 'Covert Operative' },
    { key: 'criminal',          label: 'Criminal' },
    { key: 'driver',            label: 'Driver' },
    { key: 'engineer',          label: 'Engineer' },
    { key: 'entertainer',       label: 'Entertainer' },
    { key: 'journalist',        label: 'Journalist' },
    { key: 'labourer',          label: 'Labourer' },
    { key: 'military_officer',  label: 'Military Officer' },
    { key: 'navy',              label: 'Navy' },
    { key: 'physician',         label: 'Physician' },
    { key: 'police',            label: 'Police' },
    { key: 'politician',        label: 'Politician' },
    { key: 'resistance',        label: 'Resistance' },
    { key: 'spiritual_leader',  label: 'Spiritual Leader' },
];

// ── Données système — characteristics ────────────────────────────────────────

export const CHARACTERISTICS = [
    { key: 'bookworm',               label: 'Bookworm' },
    { key: 'born_behind_wheel',      label: 'Born Behind the Wheel' },
    { key: 'built_brick_outhouse',   label: 'Built Like a Brick Outhouse' },
    { key: 'conscientious_objector', label: 'Conscientious Objector' },
    { key: 'criminal_mindset',       label: 'Criminal Mindset' },
    { key: 'dilettante',             label: 'Dilettante' },
    { key: 'dreamwalker',            label: 'Dreamwalker' },
    { key: 'escaped_europe',         label: 'Escaped from Europe' },
    { key: 'experimental_subject',   label: 'Experimental Subject' },
    { key: 'my_war_started_early',   label: 'My War Started Early' },
    { key: 'nomadic',                label: 'Nomadic' },
    { key: 'own_occult_artefact',    label: 'Own an Occult Artefact' },
    { key: 'raised_by_cult',         label: 'Raised by a Cult' },
    { key: 'raised_colonies',        label: 'Raised in the Colonies' },
    { key: 'read_occult_book',       label: 'Read from an Occult Book' },
    { key: 'scientific_visionary',   label: 'Scientific Visionary' },
    { key: 'street_kid',             label: 'Street Kid' },
    { key: 'the_lucky_one',          label: 'The Lucky One' },
    { key: 'veteran_great_war',      label: 'Veteran of the Great War' },
    { key: 'wanted_authorities',     label: 'Wanted by the Authorities' },
    { key: 'young_at_heart',         label: 'Young at Heart' },
];

// ── Données système — ranges armes ───────────────────────────────────────────

export const WEAPON_RANGES = ['Close', 'Short', 'Medium', 'Long'];
export const WEAPON_SIZES  = ['Minor', 'Major'];

// ── Table Bonus Damage ────────────────────────────────────────────────────────

export function getBonusDamage(value) {
    if (value <= 8)  return 0;
    if (value === 9) return 1;
    if (value <= 11) return 2;
    if (value <= 13) return 3;
    if (value <= 15) return 4;
    return 5;
}

// ── Coût des dés supplémentaires (cumulatif global) ───────────────────────────
// 1er dé supplémentaire = 1, 2e = 2, 3e = 3 (Momentum ou Threat, source mixable)
export const EXTRA_DIE_COST = [1, 2, 3];

// ── Calcul succès — jet de compétence 2D20 ────────────────────────────────────
// expertiseApplied : déclaré explicitement par le joueur après le jet
// (la compétence peut avoir un focus sans que celui-ci soit applicable à l'action)

export function countSuccesses(results, target, skillRank, expertiseApplied) {
    let successes     = 0;
    let complications = 0;
    for (const val of results) {
        if (val === 20) {
            complications++;
        } else if (val === 1) {
            // 1 naturel = toujours 2 succès, même sans expertise, même compétence à 0
            successes += 2;
        } else if (val <= target) {
            // Double succès uniquement si l'expertise est déclarée applicable ET val ≤ rang
            successes += (expertiseApplied && val <= skillRank) ? 2 : 1;
        }
    }
    return { successes, complications };
}

// ── Calcul dommages — dés de Challenge (d6) ───────────────────────────────────

export function countChallengeDice(results, salvo = '') {
    let stress  = 0;
    let effects = 0;
    const salvoUpper = salvo.toUpperCase();
    for (const val of results) {
        if (val === 1)      { stress += 1; }
        else if (val === 2) { stress += 2; }
        else if (val === 3 || val === 4) { /* 0 */ }
        else if (val === 5 || val === 6) {
            if (salvoUpper.includes('VICIOUS') && val === 5) {
                stress += 2;
            } else {
                stress += 1;
                effects += 1;
            }
        }
    }
    return { stress, effects };
}

// ── Hooks dés — jet de compétence (2D20) ─────────────────────────────────────
// Passé à roll() par AchtungDiceModal pour les jets de compétence.

const skillDiceHooks = {
    buildNotation: (ctx) => {
        const { nbDes } = ctx.systemData;
        if (!nbDes || nbDes < 1) throw new RollError('NO_DICE', 'Aucun dé à lancer');
        return `${nbDes}d20`;
    },

    beforeRoll: (ctx) => {
        const { nbDes, momentumSpent = 0, threatGenerated = 0, isAssist = false } = ctx.systemData;
        if (nbDes < 1 || nbDes > 5)
            throw new RollError('INVALID_DICE', `Nombre de dés invalide : ${nbDes}`);
        const base      = isAssist ? 1 : 2;
        const extraDice = nbDes - base;
        if (extraDice > 0) {
            const expectedCost = EXTRA_DIE_COST.slice(0, extraDice).reduce((a, b) => a + b, 0);
            if (momentumSpent + threatGenerated !== expectedCost)
                throw new RollError('RESOURCE_MISMATCH', 'Incohérence ressources / dés achetés');
        }
        return ctx;
    },

    afterRoll: (raw, ctx) => {
        const {
            target, skillRank, hasFocus,
            difficulty = 1,
            momentumSpent = 0, threatGenerated = 0,
            isAssist = false,
        } = ctx.systemData;

        const results = raw.groups[0].values;
        const { successes, complications } = countSuccesses(results, target, skillRank, hasFocus);
        const success  = successes >= difficulty;
        const momentum = Math.max(0, successes - difficulty);

        return {
            results,
            target,
            skillRank,
            hasFocus:        !!hasFocus,
            successes,
            complications,
            difficulty,
            success,
            momentum,
            momentumSpent,
            threatGenerated,
            isAssist:        !!isAssist,
            label:           ctx.label,
        };
    },

    buildAnimationSequence: (raw, ctx) => ({
        mode: 'single',
        groups: raw.groups.map((g, i) => ({
            id:       `skill-${i}`,
            diceType: 'd20',
            color:    'default',
            label:    ctx.label || `${g.values.length}d20`,
            waves:    [{ dice: g.values }],
        })),
    }),

    renderHistoryEntry: (entry) => <AchtungHistoryEntry roll={entry} />,
};

// ── Hooks dés — dommages (dés de Challenge d6) ────────────────────────────────
// Passé à roll() par AchtungDiceModal pour les jets de dommages.
// Entité distincte car le type de dé, la notation et l'interprétation diffèrent.

const challengeDiceHooks = {
    buildNotation: (ctx) => {
        const { nbDice } = ctx.systemData;
        if (!nbDice || nbDice < 1) throw new RollError('NO_DICE', 'Aucun dé de Challenge à lancer');
        return `${nbDice}d6`;
    },

    beforeRoll: (ctx) => {
        if (ctx.systemData.nbDice < 1 || ctx.systemData.nbDice > 10)
            throw new RollError('INVALID_DICE', `Nombre de dés invalide : ${ctx.systemData.nbDice}`);
        return ctx;
    },

    afterRoll: (raw, ctx) => {
        const { salvo = '' } = ctx.systemData;
        const results = raw.groups[0].values;
        const { stress, effects } = countChallengeDice(results, salvo);
        return { results, stress, effects, salvo, label: ctx.label, successes: stress };
    },

    buildAnimationSequence: (raw, ctx) => ({
        mode: 'single',
        groups: raw.groups.map((g, i) => ({
            id:       `damage-${i}`,
            diceType: 'd6',
            color:    'default',
            label:    ctx.label || `${g.values.length}d6`,
            waves:    [{ dice: g.values }],
        })),
    }),

    renderHistoryEntry: (entry) => <AchtungHistoryEntry roll={entry} />,
};

// ── Config principale ─────────────────────────────────────────────────────────

const achtungConfig = {
    slug:  'achtung',
    label: 'Achtung! Cthulhu',

    // Hooks dés de compétence — passés à roll() pour les jets 2D20
    dice: skillDiceHooks,

    // Hooks dés de dommages — passés à roll() pour les jets de Challenge dice
    // Le composant choisit explicitement quel bloc utiliser :
    //   roll(notation, ctx, achtungConfig.dice)          → jet de compétence
    //   roll(notation, ctx, achtungConfig.challengeDice) → jet de dommages
    challengeDice: challengeDiceHooks,

    // Style par défaut des dés (lu par useDiceConfig)
    diceConfigDefault: {
        mode:   'custom',
        custom: {
            foreground: '#e5dcc0',   // papier jauni — faces
            background: '#3d3d28',   // vert kaki sombre — corps
            outline:    '#6b7c45',   // kaki — contour
            edge:       '#2f2f1e',   // bord très sombre
            texture:    '',
            material:   'metal',
        },
        lightColor:       '#b5a96a',  // sable
        strength:         6,
        gravity:          400,
        sounds:           false,
        animationEnabled: true,
    },
};

export default achtungConfig;