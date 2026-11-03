// src/client/src/systems/woddavampire/components/creation/CreationHelp.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Colonne d'aide de l'assistant (spec_woddavampire.md §II.6) : décrit l'élément
// survolé, touché ou focalisé. Les onglets annoncent leurs éléments par
// helpProps(show, topic) ; le texte vient de config/descriptions.js.
//   topic : { kind, key } — kind : tab, clan, road, path, attribute, attributeGroup,
//           ability, abilityGroup, background, discipline, virtue, merit, archetype, bonus
// ─────────────────────────────────────────────────────────────────────────────

import React, { createContext, useContext } from 'react';
import {
    CLANS, ROADS, VIRTUE_LABELS, DISCIPLINES, MERITS_FLAWS, MERIT_CATEGORY_LABELS, costOptions, BONUS_COSTS, CREATION_BUDGET, CHRONICLE,
    ATTRIBUTE_LABELS, ATTRIBUTE_GROUPS, ABILITY_LABELS, ABILITY_GROUPS, ABILITY_CATEGORY, BACKGROUNDS, ARCHETYPES,
    CLAN_TEXT, ROAD_TEXT, PATH_TEXT, ATTRIBUTE_TEXT, ATTRIBUTE_GROUP_TEXT, ATTRIBUTE_SCALE, ABILITY_TEXT, ABILITY_GROUP_TEXT,
    ABILITY_SCALE, BACKGROUND_TEXT, DISCIPLINE_TEXT, VIRTUE_TEXT, ARCHETYPE_REGAIN, TAB_HELP,
} from '../../config.jsx';
import {
    isStartingDiscipline, isCommonDiscipline, computeGeneration, roadRating, willpowerRating, disciplineValue, bonusRemaining,
} from '../../config/rules/creationRules.js';
import { clanProfile, clanDisciplines } from '../../config/rules/character.js';
import { VdaCorners } from '../ui/VdaUi.jsx';

const HelpContext = createContext(() => {});
export const HelpProvider = HelpContext.Provider;
export const useHelp = () => useContext(HelpContext);

/** Props à poser sur un élément pour qu'il affiche son aide (survol, focus, clic) */
export const helpProps = (show, topic) => ({ onMouseEnter: () => show(topic), onFocus: () => show(topic) });

const discList = (keys) => keys.map(k => DISCIPLINES[k]?.label ?? k).join(', ');

/** Résumé du Caïnite en cours, affiché sous l'aide de l'onglet */
const summary = (ws) => {
    const profile = clanProfile(ws.clanKey, ws.casteKey);
    const road = ROADS[ws.roadKey];
    const discs = Object.keys(DISCIPLINES).filter(k => disciplineValue(ws, k) > 0).map(k => `${DISCIPLINES[k].label} ${disciplineValue(ws, k)}`);
    return [
        ['Clan', profile ? `${profile.label}${profile.caste ? ` (${profile.caste.label})` : ''}` : 'à choisir'],
        ['Route', road ? `${road.label} ${roadRating(ws)}${road.paths?.[ws.roadPathKey] ? ` (${road.paths[ws.roadPathKey].label})` : ''}` : 'à choisir'],
        ['Génération', `${computeGeneration(ws)}ᵉ`],
        ['Volonté', String(willpowerRating(ws))],
        ['Disciplines', discs.join(', ') || 'aucune'],
        ['Points bonus', `${bonusRemaining(ws)} restants`],
    ];
};

/** Contenu de l'aide : { title, kicker?, text?, facts: [[libellé, valeur]], scale? } */
export const helpEntry = (topic, ws) => {
    const { kind, key } = topic ?? {};
    switch (kind) {
    case 'clan': {
        const clan = CLANS[key];
        const profile = clanProfile(key, key === ws.clanKey ? ws.casteKey : undefined);
        const discs = profile.anyDisciplines ? 'Au choix, avec l’accord du Conteur'
            : clan.castes ? Object.values(clan.castes).map(c => `${c.label} : ${discList(c.disciplines)}`).join(' · ')
                : discList(clanDisciplines(key, null, key === ws.clanKey ? ws.originClanKey : null)) + (clan.originClan ? ' + 2 du clan d’origine' : '');
        return {
            title: clan.label, kicker: clan.kind === 'bloodline' ? 'Lignée' : 'Clan', text: CLAN_TEXT[key]?.text,
            facts: [['Disciplines de clan', discs], ['Faiblesse', profile.weakness || 'Aucune']],
        };
    }
    case 'road': {
        const road = ROADS[key];
        const paths = Object.values(road.paths ?? {}).map(p => p.label);
        return {
            title: road.label, kicker: road.latin, text: ROAD_TEXT[key]?.text,
            facts: [['Vertus', road.virtues.map(v => VIRTUE_LABELS[v]).join(' et ') + ', Courage'], ['Aura', road.aura],
                ...(paths.length ? [['Voies', paths.join(', ')]] : [])],
        };
    }
    case 'path': {
        const road = ROADS[topic.road];
        const path = road?.paths?.[key];
        return {
            title: path?.label, kicker: road?.label, text: PATH_TEXT[key],
            facts: [['Vertus', (path?.virtues ?? road?.virtues ?? []).map(v => VIRTUE_LABELS[v]).join(' et ') + ', Courage'], ...(path?.aura ? [['Aura', path.aura]] : [])],
        };
    }
    case 'attributeGroup':
        return { title: `Attributs ${ATTRIBUTE_GROUPS.find(g => g.key === key)?.label.toLowerCase()}`, text: ATTRIBUTE_GROUP_TEXT[key], facts: [] };
    case 'attribute':
        return {
            title: ATTRIBUTE_LABELS[key], kicker: 'Attribut', text: ATTRIBUTE_TEXT[key], scale: ATTRIBUTE_SCALE,
            facts: [['Points bonus', `${BONUS_COSTS.attribute} par point`]],
        };
    case 'abilityGroup':
        return { title: ABILITY_GROUPS.find(g => g.key === key)?.label, text: ABILITY_GROUP_TEXT[key], facts: [] };
    case 'ability': {
        const a = ABILITY_TEXT[key] ?? {};
        return {
            title: ABILITY_LABELS[key], kicker: ABILITY_GROUPS.find(g => g.key === ABILITY_CATEGORY[key])?.label.replace(/s$/, ''),
            text: a.text, scale: ABILITY_SCALE,
            facts: [['Spécialités (à 4 et plus)', a.specialties], ['Points bonus', `${BONUS_COSTS.ability} par point (peuvent dépasser 3)`]],
        };
    }
    case 'background': {
        const b = BACKGROUND_TEXT[key] ?? {};
        return { title: BACKGROUNDS[key], kicker: 'Historique', text: b.text, scale: b.scale, facts: [['Points bonus', `${BONUS_COSTS.background} par point`]] };
    }
    case 'discipline': {
        const access = !ws.clanKey ? null
            : isCommonDiscipline(ws, key) ? 'Accessible à tous'
                : isStartingDiscipline(ws, key) ? 'De clan'
                    : 'Hors clan : points bonus seulement, avec l’accord du Conteur';
        return {
            title: DISCIPLINES[key]?.label, kicker: DISCIPLINES[key]?.bloodMagic ? 'Magie du sang' : 'Discipline', text: DISCIPLINE_TEXT[key],
            facts: [...(access ? [['Accès', access]] : []), ['Points bonus', `${BONUS_COSTS.discipline} par point`]],
        };
    }
    case 'virtue':
        return { title: VIRTUE_LABELS[key], kicker: 'Vertu', text: VIRTUE_TEXT[key], facts: [['Points bonus', `${BONUS_COSTS.virtue} par point (sans effet sur la Route ni la Volonté)`]] };
    case 'merit': {
        const e = MERITS_FLAWS[key];
        return {
            title: e?.label, kicker: `${e?.kind === 'flaw' ? 'Handicap' : 'Atout'} ${MERIT_CATEGORY_LABELS[e?.category]?.toLowerCase() ?? ''}`, text: e?.effect,
            facts: [['Coût', costOptions(e ?? {}).join(' ou ') + (e?.kind === 'flaw' ? ' (rapporte des points bonus)' : ' (coûte des points bonus)')]],
        };
    }
    case 'archetype': {
        const a = ARCHETYPES.find(x => x.key === key);
        return { title: a?.label, kicker: 'Archétype', text: 'En Nature, il regagne 1 point de Volonté quand :', facts: [['Regain', ARCHETYPE_REGAIN[a?.label]]] };
    }
    case 'bonus':
        return {
            title: 'Points bonus', kicker: `${CREATION_BUDGET.bonusPoints} au départ`,
            text: 'Une fois les priorités réparties, les points bonus achètent ce que vous voulez en plus. Activez « Dépenser des points bonus » en haut de l’assistant : chaque point cliqué est alors pris sur cette réserve, en rouge sang sur les points.',
            facts: [
                ['Attribut', `${BONUS_COSTS.attribute} par point`], ['Capacité', `${BONUS_COSTS.ability} par point`],
                ['Discipline', `${BONUS_COSTS.discipline} par point`], ['Historique', `${BONUS_COSTS.background} par point`],
                ['Vertu', `${BONUS_COSTS.virtue} par point`], ['Route', `${BONUS_COSTS.road} par point`], ['Volonté', `${BONUS_COSTS.willpower} par point`],
                ['Handicaps', `rapportent leur coût, ${CHRONICLE.flawCap} au plus`],
            ],
        };
    default: {
        const t = TAB_HELP[key] ?? { title: '', text: 'Survolez ou touchez un élément : sa description s’affiche ici.' };
        return { title: t.title, text: t.text, facts: [], summary: summary(ws) };
    }
    }
};

/** La colonne d'aide elle-même ; onBack : revenir à l'aide de l'onglet */
export const HelpPanel = ({ topic, ws, onBack }) => {
    const entry = helpEntry(topic, ws);
    return (
        <aside className="vda-help" aria-live="polite">
            <VdaCorners small />
            {topic?.kind !== 'tab' && (
                <button type="button" className="vda-link vda-help-back" onClick={onBack}>← Aide de l'onglet</button>
            )}
            {entry.kicker && <div className="vda-label">{entry.kicker}</div>}
            <div className="vda-card-title">{entry.title}</div>
            {entry.text && <p className="vda-help-text">{entry.text}</p>}
            {entry.facts.filter(([, v]) => v).map(([label, value]) => (
                <p key={label} className="vda-help-fact"><b>{label} :</b> {value}</p>
            ))}
            {entry.summary && (
                <div className="vda-help-summary">
                    <div className="vda-label">Votre Caïnite</div>
                    {entry.summary.map(([label, value]) => <p key={label} className="vda-help-fact"><b>{label} :</b> {value}</p>)}
                </div>
            )}
            {entry.scale && (
                <ol className="vda-help-scale">
                    {entry.scale.map((s, i) => <li key={s}><span>{'●'.repeat(i + 1)}</span> {s}</li>)}
                </ol>
            )}
        </aside>
    );
};
