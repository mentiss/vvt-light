// src/client/src/systems/cyberpunk/config/referenceGuide.js
// ─────────────────────────────────────────────────────────────────────────────
// Contenu de l'aide de jeu (brique ReferenceGuide, spec_ui_reference.md ;
// spec_cyberpunk.md §9.9) :
//   - règles : un fichier Markdown par section dans config/reference/ ;
//   - puis les sections tirées des données de l'app, sans recopie : listes des
//     playbooks (REFERENCE_LISTS, aussi utilisées par la création), catalogues du
//     chrome et du matos.
// ─────────────────────────────────────────────────────────────────────────────

import { markdownToSections } from '../../../tools/reference.js';
import { REFERENCE_LISTS } from './reference.js';
import { CYBERWARE_ALL } from './cyberware.js';
import { ITEMS_ALL } from './items.js';
import { ITEM_AND_CYBERWARE_CATEGORY_LABEL } from './catalog.js';
import { PLAYBOOKS } from './playbooks.js';

const MARKDOWN = import.meta.glob('./reference/*.md', { query: '?raw', import: 'default', eager: true });

// Options et Retenues propres aux moves de playbook (anciennement dans ReferenceTab)
const PLAYBOOK_LISTS = {
    Assassin: [
        ['Retenues — Contrôler le terrain', ['Identifier la menace prioritaire dans l\'espace', 'Savoir qui peut être manipulé ou intimidé', 'Passer inaperçu dans cet espace pour cette scène', 'Créer une ouverture sur une cible précise', 'Sortir sans laisser de trace mémorable']],
    ],
    Edgerunner: [
        ['Retenues — Stratégie opérationnelle', ['Éviter une complication anticipée', 'Contourner un piège identifié', 'Sortir d\'une situation impossible par une issue préparée']],
    ],
    Fixer: [
        ['Retenues — Mobiliser mon équipe', ['Surveiller une cible ou un lieu', 'Récupérer ou livrer un objet', 'Exercer une pression discrète sur quelqu\'un', 'Extraire ou protéger une personne', 'Créer une diversion ou une couverture']],
        ['Retenues — Réputation', ['Il te doit quelque chose', 'Il veut te garder dans ses bonnes grâces', 'Il a peur de ta réputation', 'Il t\'ouvre une porte qu\'il aurait gardée fermée']],
    ],
    Investigator: [
        ['Retenues — Constituer un dossier', ['Anticiper le prochain mouvement de la cible', 'Identifier son point faible ou sa vulnérabilité', 'Savoir à qui elle fait confiance', 'Comprendre ce qu\'elle cherche à cacher']],
        ['Retenues — I need backup', ['Couverture policière ou officielle sur une scène', 'Barrage ou bouclage d\'une zone', 'Intervention rapide sur place', 'Protection d\'un témoin ou d\'une personne']],
    ],
    Media: [
        ['Options — En direct live', ['La pression publique force un PNJ à reculer ou à parler', 'Quelqu\'un dans l\'audience intervient physiquement', 'L\'info se propage et atteint quelqu\'un d\'important', 'La position du personnage est protégée tant que la diffusion est active']],
    ],
    Netrunner: [
        ['Retenues — Pénétrer un système', ['Ouvrir ou verrouiller un accès', 'Couper les caméras', 'Localiser un fichier ou une personne dans le système', 'Briser une ICE', 'Bloquer une routine de sécurité']],
    ],
    Rockerboy: [
        ['Retenues — Visionnaire', ['La cible adhère à ta vision et agit dans ton sens', 'Elle te protège ou t\'aide activement', 'Elle se retourne contre quelqu\'un que tu désignes']],
    ],
};

const table = (columns, rows) => ({ type: 'table', columns, rows });
const tagsText = (tags = []) => tags.map(t => t.text).join(' · ');
const catLabel = (c) => ITEM_AND_CYBERWARE_CATEGORY_LABEL[c] ?? c;
// Options à choisir (tagChoices ; liste de l'aide de jeu pour les daemons), sinon l'indication d'option
const optionsText = (c) => (c.tagChoices ?? []).map(ch => `${ch.label} (${ch.pick} au choix) : ${typeof ch.from === 'string' ? ch.from : ch.from.map(f => f.option ? `${f.option} ${f.text}` : f.text).join(', ')}`).join(' ; ')
    || c.optionHint || '—';

/** Playbooks : contacts (ou informateurs), spécialisations, expertises, daemons, Retenues. */
const playbooksSection = () => ({
    id: 'playbooks', title: 'Playbooks : contacts, spécialisations, Retenues',
    blocks: PLAYBOOKS.flatMap(pb => {
        const blocks = [{ type: 'heading', text: pb.label }, { type: 'text', text: pb.description }];
        const contacts = REFERENCE_LISTS.contacts[pb.id];
        if (contacts) blocks.push({ type: 'text', text: pb.id === 'Investigator' ? '**Informateurs**' : '**Contacts**' }, table(['Contact', 'Description'], contacts));
        if (pb.id === 'Edgerunner') blocks.push({ type: 'text', text: '**Spécialisations opérationnelles**' }, table(['Spécialisation', 'Description'], REFERENCE_LISTS.specialisations));
        if (pb.id === 'Techie') blocks.push({ type: 'text', text: '**Expertises (sphères)**' }, table(['Expertise', 'Description'], REFERENCE_LISTS.expertises));
        if (pb.id === 'Netrunner') blocks.push({ type: 'text', text: '**Daemons**' }, table(['Daemon', 'Description'], REFERENCE_LISTS.daemons));
        for (const [title, items] of PLAYBOOK_LISTS[pb.id] ?? []) blocks.push({ type: 'text', text: `**${title}**` }, { type: 'list', items });
        return blocks;
    }),
});

/** Catalogue du chrome, par catégorie. */
const chromeSection = () => ({
    id: 'catalogue-chrome', title: 'Catalogue du chrome',
    blocks: [...new Set(CYBERWARE_ALL.map(c => c.category))].flatMap(cat => [
        { type: 'heading', text: catLabel(cat) },
        table(['Implant', 'Effet', 'Options', 'Tags'], CYBERWARE_ALL.filter(c => c.category === cat).map(c => [c.name, c.description ?? '', optionsText(c), tagsText(c.tags)])),
    ]),
});

/** Catalogue du matos, par catégorie ; prix de création seulement. */
const gearSection = () => ({
    id: 'catalogue-matos', title: 'Catalogue du matos',
    blocks: [
        { type: 'text', text: 'Prix en Cred valables **à la création seulement** ; en jeu, le prix se négocie à la table.' },
        ...[...new Set(ITEMS_ALL.map(i => i.category))].flatMap(cat => [
            { type: 'heading', text: catLabel(cat) },
            table(['Objet', 'Description', 'Tags', 'Prix (création)'], ITEMS_ALL.filter(i => i.category === cat).map(i => [
                i.name, i.description ?? '', tagsText(i.tags),
                Number.isFinite(i.price) ? `${i.price} Cred${(i.quantity ?? 1) > 1 ? ` (×${i.quantity})` : ''}` : '—',
            ])),
        ]),
    ],
});

export const REFERENCE_SECTIONS = [
    ...markdownToSections(Object.entries(MARKDOWN).map(([path, text]) => ({ name: path.split('/').pop(), text }))),
    playbooksSection(),
    chromeSection(),
    gearSection(),
];
