// src/client/src/systems/vikings/config/kits.js
// ─────────────────────────────────────────────────────────────────────────────
// Kits de départ de l'assistant de création (spec_vikings_pierre_peinte.md §9.5,
// tables corrigées par le MJ le 2026-11-07). Le métier donne ses outils, les traits
// et backgrounds complètent ; un peu d'argent, puis des achats libres.
// Une compétence de combat ne donne aucune arme (décision du MJ).
//
// Entrée d'un kit :
//   'Nom'                        objet du catalogue (config/equipment.js)
//   { choice: ['A', { silver }] } un objet (ou de l'argent) au choix
//   { heirloom: ['A', 'B'] }      arme de famille : une arme au choix, que le joueur nomme
//   { named, hint }               objet libre que le joueur nomme (animal, trophée…)
//   { silver: n }                 onces d'argent dans la bourse
// ─────────────────────────────────────────────────────────────────────────────

/** Compétences de métier (dès le niveau 1) → outils */
export const SKILL_KITS = {
    'Bûcheron':           ['Hache de bûcheron'],
    'Charpentier':        ['Outils de charpentier'],
    'Charpentier marine': ['Outils de charpentier'],
    'Sculpteur':          ['Outils de sculpteur'],
    'Ferronnerie':        ['Outils de forgeron'],
    'Orfèvre':            ['Outils d\'orfèvre'],
    'Potier':             ['Outils de potier'],
    'Couture':            ['Nécessaire de couture'],
    'Mineur':             ['Pic'],
    'Fermier':            ['Faucille'],
    'Pêche':              ['Filet et lignes'],
    'Traque/Chasse':      ['Couteau', 'Collets'],
    'Herboriste':         ['Herbes médicinales'],
    'Docteur':            ['Herbes médicinales', 'Bandes de lin'],
    'Cuisine':            ['Chaudron'],
    'Brasseur':           ['Matériel de brasseur', 'Corne à boire'],
    'Dressage':           ['Longe et licol'],
    'Survie':             ['Briquet et pierre à feu', 'Provisions (semaine)'],
    'Escalade':           ['Corde (10m)'],
    'Navigation':         ['Corde (10m)'],
    'Raquette':           ['Raquettes'],
    'Marchandage':        ['Marchandises de troc'],
    'Langue écrite':      ['Outils de graveur'],
    'Divination':         ['Runes de divination'],
    'Jeu':                ['Plateau de hnefatafl'],
};

/** Traits et backgrounds → objets, choix, argent */
export const TRAIT_KITS = {
    'Virtuose de l\'arc':         ['Arc', 'Flèches'],
    'Berserk':                   ['Peau de bête', 'Champignons de transe'],
    'Noble lignée':              [{ choice: ['Épée', { silver: 12 }] }],
    'Foudre de guerre':          ['Hache'],
    'Aveugle':                   ['Bâton'],
    'Campeur':                   ['Nécessaire de camping'],
    'Sous le regard d\'Odin':     ['Pendentif d\'Odin'],
    'Sous le regard de Thor':    ['Marteau de Thor'],
    'Sous le regard de Tyr':     ['Pendentif de Tyr'],
    'Sous le regard de Freyr':   ['Pendentif de Freyr'],
    'Sous le regard de Freyja':  ['Pendentif de Freyja'],
    'Sous le regard de Loki':    ['Pendentif de Loki'],
    'Bâtard reconnu':            ['Bracelet d\'argent'],
    'Dernier de la lignée':      [{ heirloom: ['Hache', 'Lance', 'Scramasaxe', 'Épée'] }],
    'Huskarl':                   [{ choice: ['Bouclier en bois', 'Casque'] }, { choice: ['Lance', 'Hache', 'Javelot', 'Scramasaxe'] }],
    'Duelliste':                 ['Scramasaxe'],
    'Briseur de boucliers':      ['Hache'],
    'Volva':                     ['Bâton de völva'],
    'Godi':                      ['Anneau du temple'],
    'Connaissance des runes':    ['Outils de graveur'],
    'Leader né':                 ['Corne d\'appel'],
    'Grand guérisseur':          ['Herbes médicinales', 'Bandes de lin', 'Runes de guérison'],
//    'Fin négociant':             ['Marchandises de troc'],
    'Rameur fou':                ['Rame'],
    'Marin':                     ['Corde (10m)'],
    'Maître des bêtes':          [{ named: 'Animal fidèle', hint: 'Chien, faucon…' }],
    'Tueur de monstre':          [{ named: 'Trophée', hint: 'Griffes de l\'ours géant…' }],
    'Veuf/Veuve':                [{ named: 'Objet du défunt', hint: 'Broche, peigne…' }],
    'Divorcé':                   [{ silver: 5 }],
    'Lien avec les Landvættir':  ['Offrandes'],
    'Orphelin aguerri':          ['Couteau'],
    'Vaurien':                   ['Dés pipés'],
    'Borgne':                    ['Cache-œil'],
};

/** Argent de départ (onces) et traits qui le changent */
export const STARTING_SILVER = 8;
export const NO_STARTING_SILVER = ['Ancien esclave', 'Dette de sang'];
export const DOUBLE_STARTING_SILVER = ['Fin négociant'];
