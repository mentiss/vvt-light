// src/client/src/systems/woddavampire/config/rules/creationRules.js
// ─────────────────────────────────────────────────────────────────────────────
// Règles de calcul de la création (spec_woddavampire.md §5, §7.1, §II.6).
// Fonctions pures, sans React ; testées dans tests/systems/woddavampire/.
//
// État de l'assistant (ws) — chaque trait sépare ses sources de points :
//   attrPriority   { physical, social, mental } : 7 | 5 | 3 | null
//   attributes     { strength: n, … }           : points des priorités (hors point gratuit)
//   abilityPriority{ talent, skill, knowledge } : 13 | 9 | 5 | null
//   abilities      { melee: n, … }              : points des priorités (max 3)
//   domains        { crafts: ['Forge'], … }     : domaines d'expertise
//   disciplines    { dominate: n, … }           : points de Disciplines (4)
//   backgrounds    { herd: n, … }               : points d'Historiques (5)
//   virtues        { moral, control, courage }  : points de Vertus (7, hors point gratuit)
//   bonus          { attributes, abilities, disciplines, backgrounds, virtues : {clé: n},
//                    road, willpower : n, secondaryPaths : {pathKey: n}, extraRituals : [clé] }
//   paths          { thaumaturgy: 'potestas_vitae', … }  voie ou kraina principale par Discipline
//   kraina         { koldunism: { transylvania: n } }    répartition des points de kraina
//   rituals        { thaumaturgy: [clé, …] }             rituels gratuits (un par point)
//   meritsFlaws    [{ entryKey, cost }]
//   bloodRoll      résultat du 1d10 de la réserve de départ (ou null)
// ─────────────────────────────────────────────────────────────────────────────

import { CHRONICLE, CREATION_BUDGET, BONUS_COSTS } from '../chronicle.js';
import { CLANS } from '../clans.js';
import { DISCIPLINES } from '../disciplines.js';
import { ATTRIBUTE_GROUPS, ABILITY_GROUPS, ABILITY_CATEGORY, ABILITY_DOMAINS, ABILITY_LABELS } from '../traits.js';
import { MERITS_FLAWS, costOptions } from '../meritsFlaws.js';
import { RITUALS, NEVER_PRIMARY } from '../bloodMagic.js';
import { ROADS, roadVirtues } from '../roads.js';
import { generationStats, clanProfile, clanDisciplines } from './character.js';

const sum = (obj) => Object.values(obj ?? {}).reduce((s, v) => s + (Number(v) || 0), 0);

// ── Clic sur un point de trait ───────────────────────────────────────────────

/**
 * Le point n (1-based) fixe les points de priorité, ou les points bonus en mode
 * bonus ; cliquer le dernier point de la couche courante le retire.
 * @param {{ n:number, free:number, base:number, bonus:number, max:number,
 *           baseCap:number, baseRemaining:number, bonusMode:boolean }} p
 *   baseCap : plafond des points de priorité du trait (ex. 3 aux Capacités)
 *   baseRemaining : points de priorité encore disponibles dans le budget
 * @returns {{ base:number, bonus:number }}
 */
export const pickDot = ({ n, free, base, bonus, max, baseCap, baseRemaining, bonusMode }) => {
    if (bonusMode) {
        const target = n - free - base;
        const next = target === bonus ? bonus - 1 : target;
        return { base, bonus: Math.max(0, Math.min(next, max - free - base)) };
    }
    const target = n - free;
    const next = target === base ? base - 1 : target;
    return { base: Math.max(0, Math.min(next, baseCap, base + Math.max(0, baseRemaining), max - free - bonus)), bonus };
};

// ── Génération et sang (§7.1) — table des Générations : character.js ─────────

const hasEntry = (ws, key) => (ws.meritsFlaws ?? []).some(e => e.entryKey === key);

/** Génération = départ − Historique Génération (plancher 4ᵉ) ; Treizième Génération : 13ᵉ */
export const computeGeneration = (ws, chronicle = CHRONICLE) => {
    if (hasEntry(ws, 'thirteenth_generation')) return 13;
    const points = (ws.backgrounds?.generation ?? 0) + (ws.bonus?.backgrounds?.generation ?? 0);
    return Math.max(chronicle.generationFloor, chronicle.startingGeneration - points);
};

/** Réserve de départ : 1d10 + Domaine + Troupeau, plafonnée par la Génération (§5.3) */
export const startingBlood = (roll, domain, herd, bloodMax) => Math.min(bloodMax, Math.max(0, roll + domain + herd));

// ── Attributs ────────────────────────────────────────────────────────────────

/** Apparence bloquée à 0 : Nosferatu ou Handicap Monstrueux */
export const appearanceLocked = (ws) => !!clanProfile(ws.clanKey, ws.casteKey)?.effects?.appearanceZero || hasEntry(ws, 'monstrous');

export const attributeFree = (ws, attrKey) => (attrKey === 'appearance' && appearanceLocked(ws) ? 0 : 1);

export const attributeMax = (ws, attrKey) => {
    if (attrKey === 'appearance' && appearanceLocked(ws)) return 0;
    if ((attrKey === 'strength' || attrKey === 'stamina') && hasEntry(ws, 'child')) return 2;
    return CREATION_BUDGET.attributeMax;
};

export const attributeValue = (ws, attrKey) =>
    attributeFree(ws, attrKey) + (ws.attributes?.[attrKey] ?? 0) + (ws.bonus?.attributes?.[attrKey] ?? 0);

/** Points de priorité restants par catégorie d'Attributs */
export const attributeRemaining = (ws) => Object.fromEntries(ATTRIBUTE_GROUPS.map(g => [
    g.key,
    (ws.attrPriority?.[g.key] ?? 0) - g.attributes.reduce((s, [k]) => s + (ws.attributes?.[k] ?? 0), 0),
]));

// ── Capacités ────────────────────────────────────────────────────────────────

export const abilityValue = (ws, key) => (ws.abilities?.[key] ?? 0) + (ws.bonus?.abilities?.[key] ?? 0);

export const abilityRemaining = (ws) => {
    const spent = { talent: 0, skill: 0, knowledge: 0 };
    for (const [k, v] of Object.entries(ws.abilities ?? {})) spent[ABILITY_CATEGORY[k]] += v;
    return Object.fromEntries(ABILITY_GROUPS.map(g => [g.key, (ws.abilityPriority?.[g.key] ?? 0) - spent[g.key]]));
};

/** Capacités à domaine obligatoire achetées sans domaine */
export const missingDomains = (ws) => Object.keys(ABILITY_DOMAINS)
    .filter(k => abilityValue(ws, k) > 0 && !(ws.domains?.[k] ?? []).some(d => d?.trim()));

// ── Avantages ────────────────────────────────────────────────────────────────

/** Une Discipline s'achète-t-elle avec les 4 points de départ ? (§5.1, §15.4 : de clan + communes) */
export const isStartingDiscipline = (ws, key, chronicle = CHRONICLE) => {
    const profile = clanProfile(ws.clanKey, ws.casteKey);
    if (!profile || DISCIPLINES[key]?.alwaysOutOfClan) return false;
    if (profile.anyDisciplines) return true;
    return clanDisciplines(ws.clanKey, ws.casteKey, ws.originClanKey).includes(key)
        || (chronicle.commonDisciplines ?? []).includes(key);
};

/** Discipline commune (règle maison) qui n'est pas de clan pour ce personnage */
export const isCommonDiscipline = (ws, key, chronicle = CHRONICLE) =>
    (chronicle.commonDisciplines ?? []).includes(key) && !clanDisciplines(ws.clanKey, ws.casteKey, ws.originClanKey).includes(key);

export const disciplineValue = (ws, key) => (ws.disciplines?.[key] ?? 0) + (ws.bonus?.disciplines?.[key] ?? 0);
export const backgroundValue = (ws, key) => (ws.backgrounds?.[key] ?? 0) + (ws.bonus?.backgrounds?.[key] ?? 0);

/** Vertus : 1 point gratuit chacune ; Route et Volonté figées sur les points de création (§5.2) */
export const virtueValue = (ws, slot) => 1 + (ws.virtues?.[slot] ?? 0) + (ws.bonus?.virtues?.[slot] ?? 0);
export const creationVirtue = (ws, slot) => 1 + (ws.virtues?.[slot] ?? 0);
export const roadRating = (ws) => creationVirtue(ws, 'moral') + creationVirtue(ws, 'control') + (ws.bonus?.road ?? 0);
export const willpowerRating = (ws) => creationVirtue(ws, 'courage') + (ws.bonus?.willpower ?? 0);

/** Route proposée à ce personnage ? Les Routes de clan sont réservées à leur clan (et caste) */
export const roadAllowed = (ws, roadKey) => {
    const road = ROADS[roadKey];
    if (!road) return false;
    if (!road.only) return true;
    if (!road.only.includes(ws.clanKey)) return false;
    return !road.onlyCaste || (ws.casteKey ?? CLANS[ws.clanKey]?.defaultCaste) === road.onlyCaste;
};

/** Libellés des Vertus imposées par la Route (§4.5) */
export const virtueKeys = (ws) => {
    const [moral, control] = roadVirtues(ws.roadKey, ws.roadPathKey);
    return { moral, control, courage: 'courage' };
};

// ── Atouts et Handicaps (§5.2, §16) ──────────────────────────────────────────

/** Coût effectif d'une entrée (coût de clan, Handicaps imposés sans points) */
export const meritFlawCost = (ws, item) => {
    const entry = MERITS_FLAWS[item.entryKey];
    if (!entry) return 0;
    if ((clanProfile(ws.clanKey, ws.casteKey)?.effects?.imposedFlaws ?? []).includes(item.entryKey)) return 0;
    if (entry.clanCost?.[ws.clanKey] !== undefined) return entry.clanCost[ws.clanKey];
    const options = costOptions(entry);
    return options.includes(item.cost) ? item.cost : options[0];
};

/** Raisons qui interdisent une entrée pour ce personnage ([] si permise) */
export const meritFlawProblems = (ws, entryKey, chronicle = CHRONICLE) => {
    const entry = MERITS_FLAWS[entryKey];
    if (!entry) return ['Entrée inconnue'];
    const problems = [];
    if (entry.forbidden?.includes(ws.clanKey)) problems.push('Interdit à ce clan');
    if (entry.only && !entry.only.includes(ws.clanKey)) problems.push('Réservé à d’autres clans');
    if (entry.chronicle === 'literacy_merit' && chronicle.literacyAssumed) problems.push('Alphabétisation supposée dans cette chronique');
    if (entry.chronicle === 'literacy_flaw' && !chronicle.literacyAssumed) problems.push("L'alphabétisation n'est pas supposée dans cette chronique");
    if (entry.requires && disciplineValue(ws, entry.requires.discipline) < entry.requires.min) {
        problems.push(`Exige ${DISCIPLINES[entry.requires.discipline]?.label ?? entry.requires.discipline} ${entry.requires.min}`);
    }
    const taken = (ws.meritsFlaws ?? []).map(e => e.entryKey).filter(k => k !== entryKey);
    const clash = taken.find(k => entry.excludes?.includes(k) || MERITS_FLAWS[k]?.excludes?.includes(entryKey));
    if (clash) problems.push(`Incompatible avec ${MERITS_FLAWS[clash].label}`);
    return problems;
};

/** Points de Handicaps (bruts) et points rapportés (plafonnés) */
export const flawPoints = (ws, chronicle = CHRONICLE) => {
    const raw = (ws.meritsFlaws ?? []).filter(e => MERITS_FLAWS[e.entryKey]?.kind === 'flaw')
        .reduce((s, e) => s + meritFlawCost(ws, e), 0);
    return { raw, granted: Math.min(raw, chronicle.flawCap) };
};

export const meritPoints = (ws) => (ws.meritsFlaws ?? []).filter(e => MERITS_FLAWS[e.entryKey]?.kind === 'merit')
    .reduce((s, e) => s + meritFlawCost(ws, e), 0);

// ── Magie du sang ────────────────────────────────────────────────────────────

const ritualLevel = (pathSet, key) => (RITUALS[pathSet] ?? []).find(x => x.key === key)?.level ?? 0;

/** Coût en points bonus des rituels supplémentaires (niveau du rituel) */
export const extraRitualsCost = (ws) => (ws.bonus?.extraRituals ?? [])
    .reduce((s, { pathSet, key }) => s + ritualLevel(pathSet, key), 0);

// ── Points bonus ─────────────────────────────────────────────────────────────

/** Détail des dépenses en points bonus (§5.2) */
export const bonusSpent = (ws) => {
    const b = ws.bonus ?? {};
    return BONUS_COSTS.attribute * sum(b.attributes)
        + BONUS_COSTS.ability * sum(b.abilities)
        + BONUS_COSTS.discipline * sum(b.disciplines)
        + BONUS_COSTS.background * sum(b.backgrounds)
        + BONUS_COSTS.virtue * sum(b.virtues)
        + BONUS_COSTS.road * (b.road ?? 0)
        + BONUS_COSTS.willpower * (b.willpower ?? 0)
        + BONUS_COSTS.secondaryPath * sum(b.secondaryPaths)
        + extraRitualsCost(ws)
        + meritPoints(ws);
};

/**
 * Détail des points bonus, pour l'affichage : [{ tab, label, points }] (dépenses
 * positives, Handicaps négatifs), lignes à 0 omises.
 */
export const bonusBreakdown = (ws, chronicle = CHRONICLE) => {
    const b = ws.bonus ?? {};
    return [
        { tab: 'attributes', label: 'Attributs', points: BONUS_COSTS.attribute * sum(b.attributes) },
        { tab: 'abilities', label: 'Capacités', points: BONUS_COSTS.ability * sum(b.abilities) },
        { tab: 'advantages', label: 'Disciplines', points: BONUS_COSTS.discipline * sum(b.disciplines) + BONUS_COSTS.secondaryPath * sum(b.secondaryPaths) + extraRitualsCost(ws) },
        { tab: 'advantages', label: 'Historiques', points: BONUS_COSTS.background * sum(b.backgrounds) },
        { tab: 'advantages', label: 'Vertus', points: BONUS_COSTS.virtue * sum(b.virtues) },
        { tab: 'finishing', label: 'Route', points: BONUS_COSTS.road * (b.road ?? 0) },
        { tab: 'finishing', label: 'Volonté', points: BONUS_COSTS.willpower * (b.willpower ?? 0) },
        { tab: 'finishing', label: 'Atouts', points: meritPoints(ws) },
        { tab: 'finishing', label: 'Handicaps', points: -flawPoints(ws, chronicle).granted },
    ].filter(l => l.points !== 0);
};

/** Points bonus restants : 15 + Handicaps (plafonnés) − dépenses */
export const bonusRemaining = (ws, chronicle = CHRONICLE) =>
    CREATION_BUDGET.bonusPoints + flawPoints(ws, chronicle).granted - bonusSpent(ws);

// ── Traits devenus interdits ─────────────────────────────────────────────────

/**
 * Rend les points d'un trait devenu interdit après coup (clan changé, Atout ou
 * Handicap ajouté) : sans cela ils restent comptés mais impossibles à retirer.
 * Points bonus rendus d'abord (les plus chers), puis ceux des priorités.
 * Renvoie le même objet si rien ne change.
 */
export const sanitizeCreation = (ws, chronicle = CHRONICLE) => {
    let changed = false;
    const attributes = { ...ws.attributes };
    const bonusAttributes = { ...ws.bonus?.attributes };
    for (const [key] of ATTRIBUTE_GROUPS.flatMap(g => g.attributes)) {
        const room = attributeMax(ws, key) - attributeFree(ws, key);
        const base = attributes[key] ?? 0;
        const bonus = bonusAttributes[key] ?? 0;
        const excess = base + bonus - room;
        if (excess <= 0) continue;
        const fromBonus = Math.min(bonus, excess);
        bonusAttributes[key] = bonus - fromBonus;
        attributes[key] = base - (excess - fromBonus);
        changed = true;
    }

    const disciplines = { ...ws.disciplines };
    for (const key of Object.keys(disciplines)) {
        if (disciplines[key] && !isStartingDiscipline(ws, key, chronicle)) { disciplines[key] = 0; changed = true; }
    }

    const backgrounds = { ...ws.backgrounds };
    const bonusBackgrounds = { ...ws.bonus?.backgrounds };
    if (clanProfile(ws.clanKey, ws.casteKey)?.effects?.forbidStatus && backgroundValue(ws, 'status') > 0) {
        backgrounds.status = 0;
        bonusBackgrounds.status = 0;
        changed = true;
    }

    // Route de clan devenue interdite (clan ou caste changés) : retour à la Route de l'Humanité
    const road = ws.roadKey && !roadAllowed(ws, ws.roadKey) ? { roadKey: 'road_of_humanity', roadPathKey: null } : null;
    if (road) changed = true;

    if (!changed) return ws;
    return { ...ws, ...road, attributes, disciplines, backgrounds, bonus: { ...ws.bonus, attributes: bonusAttributes, backgrounds: bonusBackgrounds } };
};

// ── Validation ───────────────────────────────────────────────────────────────

/**
 * Bilan par onglet : erreurs bloquantes et avertissements non bloquants.
 * @returns {{ lineage, attributes, abilities, advantages, finishing, identity, blood }}
 *          chaque entrée : { errors: string[], warnings: string[] }
 */
export const validateCreation = (ws, chronicle = CHRONICLE) => {
    const tab = () => ({ errors: [], warnings: [] });
    const out = { lineage: tab(), attributes: tab(), abilities: tab(), advantages: tab(), finishing: tab(), identity: tab(), blood: tab() };
    const profile = clanProfile(ws.clanKey, ws.casteKey);

    // Lignée et Route
    if (!profile) out.lineage.errors.push('Choisir un clan ou une lignée');
    if (profile?.originClan && !ws.originClanKey) out.lineage.errors.push("Choisir le clan d'origine");
    if (!ws.roadKey) out.lineage.errors.push('Choisir une Route');

    // Attributs
    const prios = Object.values(ws.attrPriority ?? {});
    if (prios.filter(Boolean).length < 3) out.attributes.errors.push('Attribuer les priorités 7 / 5 / 3');
    for (const [group, left] of Object.entries(attributeRemaining(ws))) {
        if (left !== 0 && ws.attrPriority?.[group]) out.attributes.errors.push(`${ATTRIBUTE_GROUPS.find(g => g.key === group).label} : ${left} point(s) à répartir`);
    }

    // Capacités
    if (Object.values(ws.abilityPriority ?? {}).filter(Boolean).length < 3) out.abilities.errors.push('Attribuer les priorités 13 / 9 / 5');
    for (const [group, left] of Object.entries(abilityRemaining(ws))) {
        if (left !== 0 && ws.abilityPriority?.[group]) out.abilities.errors.push(`${ABILITY_GROUPS.find(g => g.key === group).label} : ${left} point(s) à répartir`);
    }
    for (const k of missingDomains(ws)) out.abilities.errors.push(`Domaine d'expertise à préciser : ${ABILITY_LABELS[k]}`);

    // Avantages
    const discLeft = CREATION_BUDGET.disciplines - sum(ws.disciplines);
    const bgLeft   = CREATION_BUDGET.backgrounds - sum(ws.backgrounds);
    const virLeft  = CREATION_BUDGET.virtues - sum(ws.virtues);
    if (discLeft) out.advantages.errors.push(`Disciplines : ${discLeft} point(s) à répartir`);
    if (bgLeft)   out.advantages.errors.push(`Historiques : ${bgLeft} point(s) à répartir`);
    if (virLeft)  out.advantages.errors.push(`Vertus : ${virLeft} point(s) à répartir`);
    if (profile?.effects?.forbidStatus && backgroundValue(ws, 'status') > 0) out.advantages.errors.push('Statut interdit aux Caïtifs');
    if (profile?.anyDisciplines && sum(ws.disciplines) > 0) out.advantages.warnings.push('Caïtif : Disciplines à faire valider par le Conteur');
    for (const [key, def] of Object.entries(DISCIPLINES)) {
        const value = disciplineValue(ws, key);
        if (!value || !def.bloodMagic) continue;
        if (def.bloodMagic === 'paths') {
            if (!ws.paths?.[key]) out.advantages.errors.push(`${def.label} : choisir la voie principale`);
            const rituals = ws.rituals?.[key] ?? [];
            if (rituals.length !== value) out.advantages.errors.push(`${def.label} : choisir ${value} rituel(s) (un par point)`);
            if (rituals.some(r => ritualLevel(def.pathSet, r) > value)) out.advantages.errors.push(`${def.label} : rituel de niveau trop élevé`);
        }
        if (def.bloodMagic === 'kraina') {
            const spread = sum(ws.kraina?.[key]);
            if (spread !== value) out.advantages.errors.push(`${def.label} : répartir ${value} point(s) entre les kraina`);
            if (!ws.paths?.[key] || NEVER_PRIMARY.includes(ws.paths[key])) out.advantages.errors.push(`${def.label} : choisir la kraina principale`);
        }
    }

    // Finitions
    const left = bonusRemaining(ws, chronicle);
    if (left < 0) out.finishing.errors.push(`Points bonus dépassés de ${-left}`);
    else if (left > 0) out.finishing.warnings.push(`${left} point(s) bonus non dépensé(s)`);
    const { raw } = flawPoints(ws, chronicle);
    if (raw > chronicle.flawCap) out.finishing.warnings.push(`Handicaps au-delà de ${chronicle.flawCap} : seuls ${chronicle.flawCap} points comptent`);
    for (const e of ws.meritsFlaws ?? []) {
        const problems = meritFlawProblems(ws, e.entryKey, chronicle);
        if (problems.length) out.finishing.errors.push(`${MERITS_FLAWS[e.entryKey]?.label ?? e.entryKey} : ${problems.join(', ')}`);
    }

    // Identité
    if (!ws.nom?.trim()) out.identity.errors.push('Nom du personnage');
    if (!ws.playerName?.trim()) out.identity.errors.push('Nom du joueur');

    // Sang et résumé
    if (ws.bloodRoll == null) out.blood.errors.push('Lancer le dé de la réserve de départ');
    const minGen = profile?.effects?.minGenerationBackground;
    if (minGen && backgroundValue(ws, 'generation') < minGen) {
        out.blood.warnings.push(`${profile.label} : en général au moins ${minGen} point d'Historique Génération (règle de table)`);
    }
    return out;
};

/** La création peut-elle être validée ? */
export const isCreationValid = (report) => Object.values(report).every(t => t.errors.length === 0);

// ── Fiche finale ─────────────────────────────────────────────────────────────

/** Corps de POST /characters (contrat CharacterController) à partir de l'assistant */
export const buildCharacterPayload = (ws, chronicle = CHRONICLE) => {
    const generation = computeGeneration(ws, chronicle);
    const { bloodMax } = generationStats(generation);
    const keys = (obj) => Object.keys(obj ?? {});
    const merge = (base, extra) => [...new Set([...keys(base), ...keys(extra)])];

    const attributes = Object.fromEntries(ATTRIBUTE_GROUPS.flatMap(g => g.attributes.map(([k]) => [k, attributeValue(ws, k)])));
    const willpower = willpowerRating(ws);

    const bloodPaths = [];
    for (const [discKey, def] of Object.entries(DISCIPLINES)) {
        const rating = disciplineValue(ws, discKey);
        if (!rating || !def.bloodMagic) continue;
        if (def.bloodMagic === 'paths' && ws.paths?.[discKey]) {
            bloodPaths.push({ disciplineKey: discKey, pathKey: ws.paths[discKey], rating, isPrimary: true });
        }
        if (def.bloodMagic === 'kraina') {
            for (const [pathKey, r] of Object.entries(ws.kraina?.[discKey] ?? {})) {
                if (r > 0) bloodPaths.push({ disciplineKey: discKey, pathKey, rating: r, isPrimary: ws.paths?.[discKey] === pathKey });
            }
        }
    }
    for (const [key, r] of Object.entries(ws.bonus?.secondaryPaths ?? {})) {
        const [disciplineKey, pathKey] = key.split(':');
        if (r > 0) bloodPaths.push({ disciplineKey, pathKey, rating: r, isPrimary: false });
    }

    const rituals = [
        ...Object.entries(ws.rituals ?? {}).flatMap(([discKey, list]) =>
            list.map(ritualKey => ({ disciplineKey: discKey, ritualKey, level: ritualLevel(DISCIPLINES[discKey]?.pathSet, ritualKey) }))),
        ...(ws.bonus?.extraRituals ?? []).map(({ disciplineKey, pathSet, key }) =>
            ({ disciplineKey, ritualKey: key, level: ritualLevel(pathSet, key) })),
    ];

    return {
        playerName: ws.playerName?.trim(), nom: ws.nom?.trim(), avatar: ws.avatar ?? null,
        chronicle: ws.chronicle ?? '', concept: ws.concept ?? '',
        natureKey: ws.natureKey ?? null, demeanorKey: ws.demeanorKey ?? null, sire: ws.sire ?? '',
        clanKey: ws.clanKey, casteKey: ws.casteKey ?? null, originClanKey: ws.originClanKey ?? null,
        weaknessDetail: ws.weaknessDetail ?? '',
        generation,
        bloodCurrent: startingBlood(ws.bloodRoll ?? 0, backgroundValue(ws, 'domain'), backgroundValue(ws, 'herd'), bloodMax),
        roadKey: ws.roadKey, roadPathKey: ws.roadPathKey ?? null, roadRating: roadRating(ws),
        virtueMoral: virtueValue(ws, 'moral'), virtueControl: virtueValue(ws, 'control'), virtueCourage: virtueValue(ws, 'courage'),
        willpowerPermanent: willpower, willpowerCurrent: willpower,
        ...attributes,
        historyLife: ws.historyLife ?? '', historySire: ws.historySire ?? '', historyNights: ws.historyNights ?? '',
        languages: ws.languages ?? '', description: ws.description ?? '',
        abilities: merge(ws.abilities, ws.bonus?.abilities).filter(k => abilityValue(ws, k) > 0)
            .map(k => ({ abilityKey: k, rating: abilityValue(ws, k), specialties: [], domains: (ws.domains?.[k] ?? []).filter(d => d?.trim()) })),
        backgrounds: merge(ws.backgrounds, ws.bonus?.backgrounds).filter(k => backgroundValue(ws, k) > 0)
            .map(k => ({ backgroundKey: k, rating: backgroundValue(ws, k), details: '' })),
        disciplines: merge(ws.disciplines, ws.bonus?.disciplines).filter(k => disciplineValue(ws, k) > 0)
            .map(k => ({ disciplineKey: k, rating: disciplineValue(ws, k), powers: [] })),
        bloodPaths,
        rituals,
        meritsFlaws: (ws.meritsFlaws ?? []).map(e => ({
            entryKey: e.entryKey, kind: MERITS_FLAWS[e.entryKey]?.kind ?? 'merit',
            cost: meritFlawCost(ws, e), details: '',
        })),
    };
};
