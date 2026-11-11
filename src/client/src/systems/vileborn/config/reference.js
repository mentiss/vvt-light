// src/client/src/systems/vileborn/config/reference.js
// ─────────────────────────────────────────────────────────────────────────────
// Contenu de l'aide de jeu (spec_vileborn.md Q28, brique ReferenceGuide,
// spec_ui_reference.md) :
//   - sections de règles : un fichier Markdown par section dans config/reference/
//     (ordre des préfixes ; Obscurité et Défis réservés au MJ, `visibility: gm`) ;
//   - puis les sections tirées des catalogues de l'app (sombres héritages et
//     leurs dons, origines), construites ici : rien n'est recopié.
// ─────────────────────────────────────────────────────────────────────────────

import { markdownToSections } from '@/features/reference/tools/reference.js';
import { HERITAGES, HERITAGE_ORDER } from './heritages.js';
import { ORIGINS, ORIGIN_ORDER } from './origins.js';

const MARKDOWN = import.meta.glob('./reference/*.md', { query: '?raw', import: 'default', eager: true });

/** Les sept sombres héritages : présentation, exemples, pulsion, dons */
const heritagesSection = () => ({
    id: 'heritages', title: 'Les sombres héritages',
    blocks: HERITAGE_ORDER.flatMap(k => {
        const h = HERITAGES[k];
        return [
            { type: 'heading', text: h.name },
            { type: 'text', text: h.text },
            { type: 'text', text: `*Exemples :* ${h.examples}` },
            { type: 'text', text: `**Pulsion :** ${h.urge}` },
            { type: 'table', columns: ['Don', 'Effet', 'Cependant,'], rows: h.gifts.map(g => [g.name, g.effect, g.drawback]) },
        ];
    }),
});

/** Les sept origines et leur effet */
const originsSection = () => ({
    id: 'origines', title: 'Les origines',
    blocks: [{ type: 'table', columns: ['Origine', 'Effet'], rows: ORIGIN_ORDER.map(k => [ORIGINS[k].name, ORIGINS[k].effect]) }],
});

const RULES = markdownToSections(Object.entries(MARKDOWN).map(([path, text]) => ({ name: path.split('/').pop(), text })));

// Règles de tous, puis héritages et origines, puis les sections du MJ
export const REFERENCE_SECTIONS = [
    ...RULES.filter(s => s.visibility !== 'gm'),
    heritagesSection(),
    originsSection(),
    ...RULES.filter(s => s.visibility === 'gm'),
];
