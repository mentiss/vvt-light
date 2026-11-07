// src/client/src/systems/maledictum/config/reference.js
// ─────────────────────────────────────────────────────────────────────────────
// Contenu de l'aide de jeu (brique ReferenceGuide, spec_ui_reference.md ;
// spec_maledictum.md lot 4) :
//   - règles : un fichier Markdown par section dans config/reference/ (les
//     sections MJ portent `visibility: gm`) ;
//   - catalogues de l'app (origines, factions, rôles, talents, pouvoirs,
//     équipement, États ; Blessures critiques, Patron et bestiaire pour le MJ),
//     construits ici depuis les données : rien n'est recopié ;
//   - réglages de la table (config/setup.js) en tête, et seulement le contenu
//     des livres disponibles.
// ─────────────────────────────────────────────────────────────────────────────

import { markdownToSections } from '../../../tools/reference.js';
import { ORIGINS, INQUISITION_ORIGINS } from './origins.js';
import { FACTIONS } from './factions.js';
import { ROLES } from './roles.js';
import { TALENTS } from './talents.js';
import { POWERS } from './powers.js';
import { CONDITIONS, CRITICAL_WOUNDS } from './tables.js';
import { BOONS, LIABILITIES, PHILOSOPHIES } from './patron.js';
import { BESTIARY } from './bestiary.js';
import { CATALOG, KIND_LABELS } from './rules/items.js';
import { SETUP, BOOKS, available, hasBook } from './setup.js';

const MARKDOWN = import.meta.glob('./reference/*.md', { query: '?raw', import: 'default', eager: true });

const text = (t) => ({ type: 'text', text: t });
const heading = (t) => ({ type: 'heading', text: t });
const table = (columns, rows) => ({ type: 'table', columns, rows });
const CHAR = { ws: 'CC', bs: 'CT', str: 'F', tgh: 'E', ag: 'Ag', int: 'Int', per: 'Per', wil: 'FM', fel: 'Soc' };
const chars = (o) => Object.entries(o ?? {}).map(([k, v]) => `+${v} ${CHAR[k] ?? k}`).join(', ');
const DISC = { minor: 'Pouvoirs mineurs', biomancy: 'Biomancie', divination: 'Divination', pyromancy: 'Pyromancie', telekinesis: 'Télékinésie', telepathy: 'Télépathie' };
const AVAIL = { common: 'Courante', scarce: 'Peu courante', rare: 'Rare', exotic: 'Exotique' };
const ROLE_NPC = { troop: 'Troupe', elite: 'Élite', leader: 'Meneur' };

const setupSection = () => {
    const xp = SETUP.creation.xp;
    const { base, points } = SETUP.chars;
    return {
        id: 'reglages-table', title: 'Réglages de la table',
        blocks: [
            text('Choix du MJ pour cette campagne, appliqués par l\'assistant de création et les catalogues.'),
            table(['Réglage', 'À cette table'], [
                ['Livres disponibles', BOOKS.filter(b => hasBook(b.key)).map(b => b.label).join(', ')],
                ['Caractéristiques tirées', `2d10 + ${base}`],
                ['Caractéristiques achetées', `${points.total} points sur une base de ${base}, de ${points.min} à ${points.max} par caractéristique`],
                ['Tirages au hasard de l\'assistant', SETUP.creation.randomDraws ? 'Proposés' : 'Non proposés'],
                ['XP de création', typeof xp === 'object' ? `${xp.fixed} XP pour chaque acolyte, les tirages au hasard n'en rapportent pas` : 'Celle des tirages au hasard (livre)'],
            ]),
        ],
    };
};

const originsSection = () => ({
    id: 'origines', title: 'Origines',
    blocks: [
        heading('Mondes d\'origine (livre de base)'),
        table(['d100', 'Origine', 'Bonus', 'Équipement'], ORIGINS.map(o => [`${o.roll[0]}-${o.roll[1]}`, `**${o.label}**`, `${chars(o.fixed)}, +5 au choix : ${(o.choice ?? []).map(k => CHAR[k]).join(', ')}`, (o.equipment ?? []).join(', ')])),
        ...(hasBook('ipg') ? [
            heading('Origines macharriennes (Inquisition)'),
            table(['d100', 'Origine', 'Résumé'], INQUISITION_ORIGINS.map(o => [`${o.roll[0]}-${o.roll[1]}`, `**${o.groupLabel ? `${o.groupLabel} — ` : ''}${o.label}**`, o.summary ?? ''])),
        ] : []),
    ],
});

const factionsSection = () => ({
    id: 'factions', title: 'Factions et Fonctions',
    blocks: available(FACTIONS).flatMap(f => [
        heading(f.label),
        text(f.summary ?? ''),
        text(`**Avantages.** ${chars(f.benefits?.fixed)}, +5 au choix (${(f.benefits?.choice ?? []).map(k => CHAR[k]).join(', ')}) ; ${f.benefits?.advances ?? 5} Avances parmi ${(f.benefits?.skills ?? []).join(', ')} ; ${f.benefits?.solars} Solars.`),
        table(['Fonction', 'Caractéristiques', 'Avances', 'Équipement'], (f.duties ?? []).map(d => [`**${d.label}**`, chars(d.chars), Object.entries(d.advances ?? {}).map(([k, v]) => `${k} ${v}`).join(', '), (d.equipment ?? []).join(', ')])),
    ]),
});

const rolesSection = () => ({
    id: 'roles', title: 'Rôles',
    blocks: available(ROLES).flatMap(r => [
        heading(r.label),
        text(r.summary ?? ''),
        text(`**Talents (${r.talents?.pick} au choix).** ${(r.talents?.from ?? []).map(k => TALENTS.find(t => t.key === k)?.label ?? k).join(', ')}.`),
        text(`**Avances.** ${r.skillAdvances?.pick} parmi ${(r.skillAdvances?.from ?? []).join(', ')} ; ${r.specAdvances?.pick} spécialisations de ${(r.specAdvances?.fromSkills ?? []).join(', ')}.`),
    ]),
});

const talentsSection = () => ({
    id: 'talents', title: 'Talents',
    blocks: [table(['Talent', 'Prérequis', 'Effet'], available(TALENTS).map(t => [`**${t.label}** (${t.labelEn})`, t.requirement?.text ?? '—', t.summary ?? '']))],
});

const powersSection = () => ({
    id: 'pouvoirs', title: 'Pouvoirs psychiques',
    blocks: Object.entries(DISC).flatMap(([k, label]) => [
        heading(label),
        ...available(POWERS).filter(p => p.discipline === k).map(p => text(`**${p.label}${p.overt ? ' *' : ''}** (${p.labelEn}). Indice Warp ${p.warpRating}, ${p.difficulty ? `${p.difficulty > 0 ? '+' : ''}${p.difficulty}` : 'Exigeant'}, portée ${p.range ?? '—'}, ${p.duration ?? ''}. ${p.summary ?? ''}`)),
    ]),
});

const equipmentSection = () => ({
    id: 'equipement-catalogue', title: 'Catalogue de l\'équipement',
    blocks: Object.entries(KIND_LABELS).flatMap(([kind, label]) => {
        const list = available(CATALOG).filter(e => e.kind === kind);
        return list.length ? [heading(label), table(['Objet', 'Profil', 'Coût', 'Disponibilité'], list.map(e => [
            `**${e.label}** (${e.labelEn})`,
            [e.damage !== undefined && e.damage !== null ? `Dégâts ${e.damage}${e.damageBonus === 'sb' ? '+BF' : ''}` : null, e.armour !== undefined ? `Armure ${e.armour}` : null, e.enc !== undefined ? `Enc. ${e.enc}` : null, e.summary].filter(Boolean).join(' · '),
            e.cost ?? '—', AVAIL[e.availability] ?? '—',
        ]))] : [];
    }),
});

const conditionsSection = () => ({
    id: 'etats', title: 'États',
    blocks: [table(['État', 'Mineur', 'Majeur'], CONDITIONS.map(c => [`**${c.label}**`, c.minor ?? c.summary ?? '', c.major ?? '—']))],
});

const criticalsSection = () => ({
    id: 'blessures-critiques-tables', title: 'Tables des Blessures critiques', visibility: 'gm',
    blocks: Object.entries({ head: 'Tête', arm: 'Bras', body: 'Corps', leg: 'Jambe' }).flatMap(([k, label]) => [
        heading(label),
        table(['1d10 + excès', 'Blessure', 'Effet', 'Soins'], (CRITICAL_WOUNDS?.[k] ?? []).map(w => [`${w.min}${w.max === null ? '+' : w.max !== w.min ? `-${w.max}` : ''}`, `**${w.label}**`, w.effect ?? '', w.treatment?.text ?? '—'])),
    ]),
});

const patronSection = () => ({
    id: 'patron-faveurs', title: 'Faveurs, Handicaps et Philosophies', visibility: 'gm',
    blocks: [
        heading('Faveurs'), table(['Faveur', 'Effet'], available(BOONS).map(b => [`**${b.label}**`, b.summary ?? ''])),
        heading('Handicaps'), table(['Handicap', 'Effet'], available(LIABILITIES).map(b => [`**${b.label}**`, b.summary ?? ''])),
        heading('Philosophies'), table(['Philosophie', 'Pente', 'Résumé'], (PHILOSOPHIES ?? []).map(p => [`**${p.label}**`, p.slant === 'puritan' ? 'Puritaine' : 'Radicale', p.summary ?? ''])),
    ],
});

const bestiarySection = () => ({
    id: 'bestiaire', title: 'Bestiaire', visibility: 'gm',
    blocks: [table(['Profil', 'Rôle', 'Caractéristiques', 'Armure · Blessures · Init.'], available(BESTIARY).filter(b => b.chars).map(b => [
        `**${b.label}** (${b.labelEn})`, ROLE_NPC[b.role] ?? b.role ?? '',
        Object.entries(b.chars).map(([k, v]) => `${CHAR[k]} ${v}`).join(' '),
        `${b.armour ?? '—'} · ${b.wounds ?? '—'} · ${b.initiative ?? '—'}`,
    ]))],
});

// Règle de Subtilité : Player's Guide
const RULES = markdownToSections(Object.entries(MARKDOWN).map(([path, t]) => ({ name: path.split('/').pop(), text: t })))
    .filter(s => s.id !== 'subtilite' || hasBook('ipg'));

// Règles de tous, puis les catalogues, puis les sections du MJ
export const REFERENCE_SECTIONS = [
    setupSection(),
    ...RULES.filter(s => s.visibility !== 'gm'),
    originsSection(), factionsSection(), rolesSection(), talentsSection(), powersSection(), equipmentSection(), conditionsSection(),
    ...RULES.filter(s => s.visibility === 'gm'),
    criticalsSection(), patronSection(), bestiarySection(),
];
