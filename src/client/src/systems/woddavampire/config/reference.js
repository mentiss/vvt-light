// src/client/src/systems/woddavampire/config/reference.js
// ─────────────────────────────────────────────────────────────────────────────
// Contenu de l'aide de jeu (spec_woddavampire.md §II.17.2, brique ReferenceGuide,
// spec_ui_reference.md) :
//   - sections de règles : un fichier Markdown par section dans config/reference/
//     (ordre des préfixes, visibilité gm / player dans les fichiers) ;
//   - puis les sections tirées des catalogues déjà dans l'app (Disciplines, magie
//     du sang, clans, Atouts et Handicaps), construites ici : rien n'est recopié.
// ─────────────────────────────────────────────────────────────────────────────

import { markdownToSections } from '@/features/reference/tools/reference.js';
import { CLANS, CLAN_ORDER } from './clans.js';
import { DISCIPLINES, DISCIPLINE_ORDER } from './disciplines.js';
import { PATHS, KRAINA, RITUALS } from './bloodMagic.js';
import { MERITS_FLAWS, MERIT_FLAW_ORDER, MERIT_CATEGORY_LABELS } from './meritsFlaws.js';
import { DISCIPLINE_TEXT, PHYSICAL_DISCIPLINE_TEXT } from './descriptions.js';
import { DISCIPLINE_POWERS } from './powers/disciplines.js';
import { PATH_POWERS, KRAINA_POWERS, RITUAL_INFO } from './powers/bloodMagic.js';
import { costLabel } from './rules/sheetRules.js';

const MARKDOWN = import.meta.glob('./reference/*.md', { query: '?raw', import: 'default', eager: true });

const POWER_COLUMNS = ['Niv.', 'Pouvoir', 'Coût', 'Jet', 'Effet'];
const capitalize = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '');
const powerRow = (p, prefix = '') => [String(p.level ?? ''), `${prefix}${p.label}`, costLabel(p.costText, p.cost) || '—', p.rollText || '—', p.effect ?? ''];
const disciplineLabels = (keys) => (keys ?? []).map(k => DISCIPLINES[k]?.label ?? k).join(', ');

/** Disciplines (hors magie du sang) : texte, puis pouvoirs par niveau (branches préfixées) */
const disciplinesSection = () => ({
    id: 'disciplines', title: 'Disciplines',
    blocks: DISCIPLINE_ORDER.filter(k => !DISCIPLINES[k].bloodMagic).flatMap(k => {
        const powers = DISCIPLINE_POWERS[k] ?? [];
        const branched = powers.some(p => p.branch);
        return [
            { type: 'heading', text: DISCIPLINES[k].label },
            ...[DISCIPLINE_TEXT[k], PHYSICAL_DISCIPLINE_TEXT[k]].filter(Boolean).map(text => ({ type: 'text', text })),
            ...(powers.length ? [{ type: 'table', columns: POWER_COLUMNS, rows: powers.map(p => powerRow(p, branched && p.branch ? `${capitalize(p.branch)} : ` : '')) }] : []),
        ];
    }),
});

/** Magie du sang : voies (pouvoirs, ou effets par niveau pour les voies mineures), kraina, rituels */
const bloodMagicSection = () => {
    const blocks = [];
    for (const k of DISCIPLINE_ORDER.filter(key => DISCIPLINES[key].bloodMagic)) {
        const def = DISCIPLINES[k];
        blocks.push({ type: 'heading', text: def.label });
        if (DISCIPLINE_TEXT[k]) blocks.push({ type: 'text', text: DISCIPLINE_TEXT[k] });
        // Plusieurs Disciplines partagent un jeu de voies (Thaumaturgie, sorcelleries) : détaillé une seule fois
        const firstOfSet = def.bloodMagic === 'kraina' || DISCIPLINE_ORDER.find(x => DISCIPLINES[x].pathSet === def.pathSet) === k;
        if (!firstOfSet) { blocks.push({ type: 'text', text: `Voies et rituels : voir ${DISCIPLINES[DISCIPLINE_ORDER.find(x => DISCIPLINES[x].pathSet === def.pathSet)].label}.` }); continue; }
        const paths = def.bloodMagic === 'kraina' ? KRAINA[k] ?? {} : PATHS[def.pathSet] ?? {};
        for (const [pathKey, name] of Object.entries(paths)) {
            const data = def.bloodMagic === 'kraina' ? { powers: KRAINA_POWERS[pathKey] } : PATH_POWERS[pathKey] ?? {};
            if (data.levels) {
                blocks.push({ type: 'text', text: `**${name}** — ${data.text ?? ''}` });
                blocks.push({ type: 'table', columns: ['Niv.', 'Effet'], rows: data.levels.map(l => [String(l.level), l.text]) });
            } else if (data.powers?.length) {
                blocks.push({ type: 'text', text: `**${name}**` });
                blocks.push({ type: 'table', columns: POWER_COLUMNS, rows: data.powers.map(p => powerRow(p)) });
            }
        }
        const rituals = def.bloodMagic === 'paths' ? RITUALS[def.pathSet] ?? [] : [];
        if (rituals.length) {
            blocks.push({ type: 'text', text: `**Rituels (${def.label})**` });
            blocks.push({
                type: 'table', columns: POWER_COLUMNS,
                rows: rituals.map(r => { const info = RITUAL_INFO[def.pathSet]?.[r.key] ?? {}; return powerRow({ ...info, level: r.level, label: r.label }); }),
            });
        }
    }
    return { id: 'magie-du-sang', title: 'Magie du sang', blocks };
};

/** Clans et lignées : Disciplines de clan et faiblesse, caste par caste */
const clansSection = () => ({
    id: 'clans', title: 'Clans et lignées',
    blocks: [{
        type: 'table', columns: ['Clan', 'Disciplines', 'Faiblesse'],
        rows: CLAN_ORDER.flatMap(k => {
            const clan = CLANS[k];
            if (!clan.castes) return [[clan.label, disciplineLabels(clan.disciplines) || '—', clan.weakness ?? '']];
            return Object.values(clan.castes).map(c => [`${clan.label} (${c.label})`, disciplineLabels(c.disciplines ?? clan.disciplines) || '—', c.weakness ?? clan.weakness ?? '']);
        }),
    }],
});

/** Atouts et Handicaps par catégorie */
const meritsFlawsSection = () => ({
    id: 'atouts-handicaps', title: 'Atouts et Handicaps',
    blocks: Object.entries(MERIT_CATEGORY_LABELS).flatMap(([cat, label]) => {
        const entries = MERIT_FLAW_ORDER.map(k => MERITS_FLAWS[k]).filter(e => e.category === cat);
        if (!entries.length) return [];
        return [
            { type: 'heading', text: label },
            { type: 'table', columns: ['Nom', 'Type', 'Coût', 'Effet'], rows: entries.map(e => [e.label, e.kind === 'merit' ? 'Atout' : 'Handicap', String(e.costText ?? e.cost ?? ''), e.effect ?? '']) },
        ];
    }),
});

export const REFERENCE_SECTIONS = [
    ...markdownToSections(Object.entries(MARKDOWN).map(([path, text]) => ({ name: path.split('/').pop(), text }))),
    disciplinesSection(),
    bloodMagicSection(),
    clansSection(),
    meritsFlawsSection(),
];
