// src/client/src/systems/nimble/config/reference.js
// ─────────────────────────────────────────────────────────────────────────────
// Contenu de l'aide de jeu (brique ReferenceGuide, spec_ui_reference.md ;
// spec_nimble.md §3 lot 4) :
//   - règles : un fichier Markdown par section dans config/reference/ (les
//     sections MJ portent `visibility: gm`) ;
//   - catalogues de l'app (classes, ascendances, historiques, motivations,
//     sorts, équipement ; bestiaire pour le MJ), construits ici : rien n'est recopié.
// ─────────────────────────────────────────────────────────────────────────────

import { markdownToSections } from '../../../tools/reference.js';
import { STAT_BY_KEY } from './basics.js';
import { CLASS_LIST } from './catalog.js';
import { ANCESTRIES } from './ancestries.js';
import { BACKGROUNDS } from './backgrounds.js';
import { MOTIVATIONS } from './motivations.js';
import { SCHOOLS, SPELLS } from './spells.js';
import { WEAPONS, ARMORS, GEAR, MAGIC_ITEMS } from './equipment.js';
import { FAMILIES, MONSTERS, MONSTER_SIZES } from './bestiary.js';

const MARKDOWN = import.meta.glob('./reference/*.md', { query: '?raw', import: 'default', eager: true });

const text = (t) => ({ type: 'text', text: t });
const heading = (t) => ({ type: 'heading', text: t });
const stat = (k) => STAT_BY_KEY[k]?.label ?? k;
const feat = (f) => text(`**${f.name}**${f.cost ? ` (${f.cost})` : ''}. ${String(f.text ?? '').replace(/\n+/g, ' ')}`);
const RARITY = { common: 'Commune', uncommon: 'Peu commune', exotic: 'Exotique' };
const SIZE = { small: 'Petite', medium: 'Moyenne', large: 'Grande' };
const ITEM_RARITY = { uncommon: 'Peu commun', rare: 'Rare', very_rare: 'Très rare', legendary: 'Légendaire', varies: 'Variable' };

/** Une section par classe : fiche technique, 20 niveaux, listes, sous-classes */
const classSection = (c) => ({
    id: `classe-${c.key}`, title: `Classe : ${c.name}`,
    blocks: [
        text(`*${c.tagline}.* ${c.summary}`),
        { type: 'table', columns: ['Caractéristiques clés', 'Dé de vie', 'PV de départ', 'Sauvegardes', 'Armures', 'Armes'],
            rows: [[c.keyStats.map(stat).join(', '), `d${c.hitDie}`, String(c.startingHp), `${stat(c.saves.adv)} ▲, ${stat(c.saves.dis)} ▼`, c.armor?.text ?? '', c.weapons?.text ?? '']] },
        ...Object.entries(c.levels).flatMap(([lvl, list]) => [heading(`Niveau ${lvl}`), ...list.map(feat)]),
        ...Object.values(c.options ?? {}).flatMap(o => [heading(o.label), ...(o.text ? [text(o.text)] : []), ...o.items.map(feat)]),
        ...(c.subclasses ?? []).flatMap(s => [
            heading(`Sous-classe : ${s.name}`), text(s.summary ?? ''),
            ...Object.entries(s.levels ?? {}).flatMap(([lvl, list]) => list.map(f => text(`*Niv. ${lvl}.* **${f.name}**${f.cost ? ` (${f.cost})` : ''}. ${String(f.text ?? '').replace(/\n+/g, ' ')}`))),
            ...Object.values(s.options ?? {}).flatMap(o => [text(`**${o.label}**`), ...o.items.map(feat)]),
        ]),
        ...((c.spells ?? []).length ? [heading('Sorts de la classe'), ...c.spells.map(s => text(`**${s.name}** (${s.tier ? `rang ${s.tier}` : 'tour de magie'}, ${s.cost ?? ''}). ${s.target ? `${s.target}. ` : ''}${String(s.text).replace(/\n+/g, ' ')}`))] : []),
        ...((c.faq ?? []).length ? [heading('FAQ'), { type: 'table', columns: ['Question', 'Réponse'], rows: c.faq.map(q => [q.q, q.a]) }] : []),
    ],
});

const ancestriesSection = () => ({
    id: 'ascendances', title: 'Ascendances',
    blocks: ['common', 'uncommon', 'exotic'].flatMap(r => [
        heading(RARITY[r]),
        { type: 'table', columns: ['Ascendance', 'Taille', 'Trait'],
            rows: ANCESTRIES.filter(a => a.rarity === r).map(a => [`**${a.name}** (${a.vo})`, String(a.size).split('|').map(s => SIZE[s] ?? s).join(' ou '), `**${a.trait?.name}.** ${a.trait?.text ?? ''}`]) },
    ]),
});

const backgroundsSection = () => ({
    id: 'historiques', title: 'Historiques',
    blocks: [{ type: 'table', columns: ['Historique', 'Effet'], rows: BACKGROUNDS.map(b => [`**${b.name}** (${b.vo})`, String(b.text).replace(/\n+/g, ' ')]) }],
});

const motivationsSection = () => ({
    id: 'motivations', title: 'Motivations d\'aventurier',
    blocks: [{ type: 'list', items: MOTIVATIONS.map(m => `**${m.name}** ${m.text ?? ''}`) }],
});

const spellLine = (s) => text(`**${s.name}** (${s.tier ? `rang ${s.tier}` : 'tour de magie'}${s.utility ? ', utilitaire' : ''}, ${s.cost ?? '—'}). ${s.target ? `${s.target}. ` : ''}${String(s.text).replace(/\n+/g, ' ')}${s.upcast ? ` *Amplification :* ${s.upcast}` : ''}${s.highLevels?.text ? ` *Hauts niveaux :* ${s.highLevels.text}` : ''}`);

const spellSections = () => SCHOOLS.map(sch => ({
    id: `sorts-${sch.key}`, title: `Sorts : ${sch.name}`,
    ...(sch.key === 'secret' ? { visibility: 'gm' } : {}),
    blocks: [text(sch.text ?? ''), ...SPELLS.filter(s => s.school === sch.key).map(spellLine)],
}));

const equipmentSection = () => ({
    id: 'catalogue-equipement', title: 'Catalogue de l\'équipement',
    blocks: [
        heading('Armes'),
        { type: 'table', columns: ['Arme', 'Dégâts', 'Propriétés', 'Coût'],
            rows: WEAPONS.map(w => [`**${w.name}**`, `${w.damage}+${stat(w.stat.split('/')[0])}${w.stat.includes('/') ? `/${stat(w.stat.split('/')[1])}` : ''}`,
                (w.props ?? []).map(p => `${p.key}${p.value ? ` ${p.value}` : ''}`).join(', ') + (w.twoHanded ? ' · 2 mains' : ''), w.cost]) },
        heading('Armures et boucliers'),
        { type: 'table', columns: ['Armure', 'Défense', 'Prérequis', 'Coût'],
            rows: ARMORS.map(a => [`**${a.name}**`, a.type === 'shield' ? `+${a.defense}` : `${a.defense}${a.addDex !== false ? `+DEX${a.dexMax ? ` (max ${a.dexMax})` : ''}` : ''}`,
                a.req ? Object.entries(a.req).map(([k, v]) => `${stat(k)} ${v}`).join(', ') : '—', a.cost]) },
        heading('Équipement d\'aventure'),
        { type: 'table', columns: ['Objet', 'Description', 'Coût'], rows: GEAR.map(g => [`**${g.name}**`, g.text ?? '', g.cost ?? '']) },
        heading('Objets magiques'),
        ...MAGIC_ITEMS.map(m => text(`**${m.name}** (${ITEM_RARITY[m.rarity] ?? m.rarity}). ${String(m.text).replace(/\n+/g, ' ')}`)),
    ],
});

const monsterLine = (m) => {
    const head = [`niv. ${m.level}`, MONSTER_SIZES[m.size], m.minion ? 'sbire' : null, m.hp ? `${m.hp} PV${m.hpPerHero ? ' par héros' : ''}` : null,
        m.armor === 'medium' ? 'armure moyenne' : m.armor === 'heavy' ? 'armure lourde' : null, m.speed ? `vitesse ${m.speed}` : null, m.saves].filter(Boolean).join(', ');
    const parts = [
        ...(m.abilities ?? []).map(a => `**${a.name}.** ${a.text}`),
        ...(m.attacks ?? []).map(a => `**${a.name}.** ${a.dice ?? ''}${a.bonus ? `+${a.bonus}` : ''} ${a.text ?? ''}`),
    ];
    return text(`**${m.name}** (${head}). ${parts.join(' ').replace(/\n+/g, ' ')}`);
};

const bestiarySection = () => ({
    id: 'bestiaire', title: 'Bestiaire', visibility: 'gm',
    blocks: FAMILIES.flatMap(f => {
        const list = MONSTERS.filter(m => m.family === f.name || m.family === f.key);
        return list.length ? [heading(f.name), ...(f.text ? [text(f.text)] : []), ...list.map(monsterLine)] : [];
    }),
});

const RULES = markdownToSections(Object.entries(MARKDOWN).map(([path, t]) => ({ name: path.split('/').pop(), text: t })));

// Règles de tous, puis les catalogues, puis les sections du MJ
export const REFERENCE_SECTIONS = [
    ...RULES.filter(s => s.visibility !== 'gm'),
    ancestriesSection(),
    backgroundsSection(),
    motivationsSection(),
    ...CLASS_LIST.map(classSection),
    ...spellSections(),
    equipmentSection(),
    ...RULES.filter(s => s.visibility === 'gm'),
    bestiarySection(),
];
