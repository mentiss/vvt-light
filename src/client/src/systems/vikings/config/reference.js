// src/client/src/systems/vikings/config/reference.js
// ─────────────────────────────────────────────────────────────────────────────
// Contenu de l'aide de jeu (spec_vikings.md §14, brique ReferenceGuide,
// spec_ui_reference.md) : les notes du vault du MJ, recopiées telles quelles
// dans config/reference/ sous des noms fixes (un fichier = une section, ordre
// des préfixes). Mise à jour : recopier les fichiers depuis le vault.
//
//   01-guide.md               ← STORIES/Guide du joueur.md
//   02-cosmologie.md          ← COSMOLOGIE/Une cosmologie sans Hel.md
//   03-systeme-saga.md        ← PURE SAGA/01 - Mécanique générale.md
//   04-combat.md              ← PURE SAGA/02 - Combat.md
//   05-sante-fatigue.md       ← PURE SAGA/03 - Santé et fatigue.md
//   06-traits-competences.md  ← PURE SAGA/04 - Compétences, traits et backgrounds.md
//   07-equipement.md          ← PURE SAGA/05 - Équipement et économie.md
//   08-runes.md               ← PURE SAGA/06 - Runes et magie.md
//   09-personnage.md          ← PURE SAGA/07 - Personnage et évolution.md
//   10-navigation.md          ← PURE SAGA/08 - Navigation maritime.md
//   11-jokulheimr.md          ← COSMOLOGIE/Mondes/Jokulheimr.md
//
// Visibilité MJ : marqueurs posés dans le vault (conseils de 07, en-tête de
// Jokulheimr). Du guide du joueur, seul le cadre est repris (monde, personnages) :
// règles, création et traits sont dans les autres sections.
// ─────────────────────────────────────────────────────────────────────────────

import { markdownToSections } from '../../../tools/reference.js';

const MARKDOWN = import.meta.glob('./reference/*.md', { query: '?raw', import: 'default', eager: true });

const RUNES_TITLE = 'Runes et magie';

/** La note 06 s'ouvre sur l'intro « La réalité subjective… » : elle reste en tête, en intertitre, sous le titre Runes et magie */
const runesSection = (section) => ({
    ...section,
    title: RUNES_TITLE,
    blocks: [
        { type: 'heading', text: section.title },
        ...section.blocks.filter(b => !(b.type === 'heading' && b.text === RUNES_TITLE)),
    ],
});

/** Premier intertitre du guide qui n'est plus du cadre (système de jeu, création, annexe des traits) */
const GUIDE_RULES_HEADING = 'Le système de jeu';

/** Guide du joueur : le cadre seulement, jusqu'au premier intertitre de règles */
const guideSection = (section) => {
    const end = section.blocks.findIndex(b => b.type === 'heading' && b.text === GUIDE_RULES_HEADING);
    return end < 0 ? section : { ...section, blocks: section.blocks.slice(0, end) };
};

const ADAPT = { guide: guideSection, runes: runesSection };

export const REFERENCE_SECTIONS = markdownToSections(
    Object.entries(MARKDOWN).map(([path, text]) => ({ name: path.split('/').pop(), text })),
).map(s => ADAPT[s.id]?.(s) ?? s);

/**
 * Paragraphes du Guide du joueur sous un intertitre (jusqu'au suivant) : textes repris
 * par l'accueil de l'assistant de création (spec_vikings_pierre_peinte.md §9.4).
 * @returns {string[]} Markdown simple (gras, italique)
 */
export const guideParagraphs = (heading) => {
    const blocks = REFERENCE_SECTIONS.find(s => s.id === 'guide')?.blocks ?? [];
    const start = blocks.findIndex(b => b.type === 'heading' && b.text === heading);
    if (start < 0) return [];
    const end = blocks.findIndex((b, i) => i > start && b.type === 'heading');
    return blocks.slice(start + 1, end < 0 ? undefined : end).filter(b => b.type === 'text').map(b => b.text);
};
