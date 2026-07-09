// src/client/src/systems/fabula/config/spells.js
// ─────────────────────────────────────────────────────────────────────────────
// Catalogue statique des sorts par liste de classe.
// Référencé par classes.js via le flag learnsSpell/spellList sur les
// compétences "Magie élémentaire" (Élémentaliste), "Magie Entropiste"
// (Entropiste) et "Magie spirituelle" (Spirite).
//
// Le Chimériste n'a PAS de liste fixe : ses sorts sont appris en jeu en
// imitant une créature bête/monstre/plante (compétence "Imitation de sort").
// SPELL_LISTS.chimeriste reste donc vide par construction — les sorts
// mémorisés par un Chimériste seront stockés directement sur le personnage
// (nom + description libres), pas référencés depuis ce catalogue.
// ─────────────────────────────────────────────────────────────────────────────

export const SPELL_LISTS = {

    elementaliste: [
        {
            key: 'arme_elementaire', nom: 'Arme élémentaire', offensif: false, testMagie: null,
            cout: 10, cible: 'Une arme', duree: 'Scène',
            description: 'Vous imprégnez une arme d\'énergie magique. Choisissez un type de dégâts : air, foudre, terre, feu ou glace. Tant que ce sort fait effet, tous les dégâts infligés par l\'arme sont du type choisi. Si vous êtes équipé de l\'arme lorsque vous lancez ce sort, vous pouvez l\'utiliser pour réaliser une attaque gratuite dans la même action. Ce sort ne peut être lancé que sur l\'arme d\'une créature volontaire.',
        },
        {
            key: 'eclair', nom: 'Éclair', offensif: true, testMagie: '[INT + VOL]',
            cout: 20, cible: 'Une créature', duree: 'Instantanée',
            description: 'Vous lancez un éclair sur votre adversaire. La cible subit [VH + 25] dégâts de foudre. Les dégâts infligés par ce sort ignorent les résistances.',
        },
        {
            key: 'frappe_volante', nom: 'Frappe Volante', offensif: false, testMagie: null,
            cout: 10, cible: 'Soi', duree: 'Instantanée',
            description: 'Le vent porte vos attaques à l\'autre bout du champ de bataille. Vous pouvez immédiatement réaliser une attaque gratuite avec une arme de corps à corps dont vous êtes équipé, pouvant cibler des créatures normalement visables uniquement à distance. Avec une arme de catégorie lutte ou lance, l\'attaque inflige 5 dégâts de plus. Si vous touchez une cible volante, vous pouvez la forcer à atterrir immédiatement.',
        },
        {
            key: 'fulgur', nom: 'Fulgur', offensif: true, testMagie: '[INT + VOL]',
            cout: '10 PM par cible', cible: 'Jusqu\'à trois créatures', duree: 'Instantanée',
            description: 'Vous agencez l\'électricité en une vague d\'éclairs qui crépitent. Chaque cible touchée subit aussitôt [VH + 15] dégâts de foudre. Aubaine : chaque cible touchée par le sort subit l\'état étourdi.',
        },
        {
            key: 'glacies', nom: 'Glacies', offensif: true, testMagie: '[INT + VOL]',
            cout: '10 PM par cible', cible: 'Jusqu\'à trois créatures', duree: 'Instantanée',
            description: 'Vous couvrez vos adversaires d\'une épaisse couche de givre. Chaque cible touchée subit aussitôt [VH + 15] dégâts de glace. Aubaine : chaque cible touchée par le sort subit l\'état ralenti.',
        },
        {
            key: 'iceberg', nom: 'Iceberg', offensif: true, testMagie: '[INT + VOL]',
            cout: 20, cible: 'Une créature', duree: 'Instantanée',
            description: 'Un pilier de magie de glace enveloppe votre adversaire, dont la température tombe à un seuil critique. La cible subit [VH + 25] dégâts de glace. Les dégâts infligés par ce sort ignorent les résistances.',
        },
        {
            key: 'ignis', nom: 'Ignis', offensif: true, testMagie: '[INT + VOL]',
            cout: '10 PM par cible', cible: 'Jusqu\'à trois créatures', duree: 'Instantanée',
            description: 'Vous lâchez un déluge ardent sur vos adversaires en faisant apparaître spontanément des flammes. Chaque cible touchée subit [VH + 15] dégâts de feu. Aubaine : chaque cible touchée par le sort subit l\'état traumatisé.',
        },
        {
            key: 'terra', nom: 'Terra', offensif: true, testMagie: '[INT + VOL]',
            cout: '10 PM par cible', cible: 'Jusqu\'à trois créatures', duree: 'Instantanée',
            description: 'Des spires de roche pointues jaillissent du sol sous vos adversaires et se referment sur eux. Chaque cible touchée subit [VH + 15] dégâts de terre. Ne peut pas viser des créatures qui volent, lévitent, tombent ou se trouvent dans les airs. Aubaine : chaque cible touchée effectue une action de moins à son prochain tour (minimum 0).',
        },
        {
            key: 'trait_feu', nom: 'Trait de feu', offensif: true, testMagie: '[INT + VOL]',
            cout: 20, cible: 'Une créature', duree: 'Instantanée',
            description: 'Vous faites jaillir vers votre adversaire un trait de feu si chaud qu\'il perce la plupart des défenses. La cible subit [VH + 25] dégâts de feu. Les dégâts infligés par ce sort ignorent les résistances.',
        },
        {
            key: 'ventus', nom: 'Ventus', offensif: true, testMagie: '[INT + VOL]',
            cout: '10 PM par cible', cible: 'Jusqu\'à trois créatures', duree: 'Instantanée',
            description: 'Vous invoquez la puissance des vents contre votre ennemi. Chaque cible touchée subit [VH + 15] dégâts d\'air. Aubaine : chaque cible volante touchée est immédiatement forcée d\'atterrir.',
        },
        {
            key: 'voile_elementaire', nom: 'Voile élémentaire', offensif: false, testMagie: null,
            cout: '5 PM par cible', cible: 'Jusqu\'à trois créatures', duree: 'Scène',
            description: 'Vous tissez un voile d\'énergie magique qui protège les cibles des éléments déchaînés. Choisissez un type de magie : air, foudre, terre, feu ou glace. Tant que ce sort fait effet, chaque cible bénéficie d\'une résistance face au type de dégâts choisi.',
        },
        {
            key: 'vortex', nom: 'Vortex', offensif: false, testMagie: null,
            cout: 10, cible: 'Soi', duree: 'Scène',
            description: 'Un véritable ouragan vous entoure, déviant flèches et balles. Jusqu\'à ce que les effets de ce sort s\'achèvent, vous bénéficiez d\'un bonus de +2 à la Défense contre les attaques à distance.',
        },
    ],

    entropiste: [
        {
            key: 'absorption_vigueur', nom: 'Absorption de vigueur', offensif: true, testMagie: '[INT + VOL]',
            cout: 10, cible: 'Une créature', duree: 'Instantanée',
            description: 'Vous volez l\'énergie vitale d\'une créature. La cible subit [VH + 15] dégâts de ténèbres. Ensuite, vous récupérez un nombre de Points de Vie égal à la moitié des points perdus (rien si la perte a été réduite à 0).',
        },
        {
            key: 'absorption_spirituelle', nom: 'Absorption spirituelle', offensif: true, testMagie: '[INT + VOL]',
            cout: 5, cible: 'Une créature', duree: 'Instantanée',
            description: 'Vous absorbez l\'énergie psychique d\'une créature. La cible perd [VH + 15] Points de Magie. Ensuite, vous récupérez un nombre de PM égal à la moitié des points perdus (rien si la perte a été réduite à 0).',
        },
        {
            key: 'acceleration', nom: 'Accélération', offensif: false, testMagie: null,
            cout: 20, cible: 'Une créature', duree: 'Scène',
            description: 'Vous altérez la trame du temps. Jusqu\'à la fin de l\'effet, la cible peut effectuer une action de plus à chacun de ses tours. Une fois deux actions supplémentaires réalisées au total, l\'effet s\'achève.',
        },
        {
            key: 'anomalie', nom: 'Anomalie', offensif: true, testMagie: '[INT + VOL]',
            cout: 20, cible: 'Une créature', duree: 'Scène',
            description: 'Vous altérez la nature de votre cible. Jusqu\'à ce que l\'effet cesse, lorsqu\'elle subit des dégâts d\'un type qu\'elle absorbe ou contre lequel elle est immunisée, ils sont traités comme si elle y était vulnérable. Une fois cela produit, l\'effet s\'achève.',
        },
        {
            key: 'arme_tenebreuse', nom: 'Arme ténébreuse', offensif: false, testMagie: null,
            cout: 10, cible: 'Une arme équipée', duree: 'Scène',
            description: 'Vous imprégnez une arme d\'énergie ténébreuse. Tant que ce sort fait effet, tous les dégâts infligés par l\'arme sont de type ténèbres. Si vous êtes équipé de l\'arme lorsque vous lancez ce sort, vous pouvez l\'utiliser pour une attaque gratuite dans la même action. Uniquement sur l\'arme d\'une créature volontaire.',
        },
        {
            key: 'arret', nom: 'Arrêt', offensif: true, testMagie: '[INT + VOL]',
            cout: 10, cible: 'Une créature', duree: 'Instantanée',
            description: 'Vous enfermez un adversaire dans un cercle de temps et d\'espace altérés. La cible effectue une action de moins à son prochain tour (minimum 0).',
        },
        {
            key: 'dissipation', nom: 'Dissipation', offensif: false, testMagie: null,
            cout: 10, cible: 'Une créature', duree: 'Instantanée',
            description: 'Vous libérez une vague d\'énergie négative qui dissipe toute magie d\'une créature. Si la cible était sous l\'effet d\'un ou plusieurs sorts de durée scène, leur effet sur elle s\'arrête immédiatement.',
        },
        {
            key: 'divination', nom: 'Divination', offensif: false, testMagie: null,
            cout: 10, cible: 'Soi', duree: 'Scène',
            description: 'Vous avez un bref aperçu de l\'avenir. Jusqu\'à la fin de l\'effet, lorsqu\'une créature que vous voyez effectue un test qui n\'est ni un échec critique ni une réussite critique, vous pouvez la forcer à relancer les deux dés. Deux relances forcées maximum, ensuite l\'effet s\'achève.',
        },
        {
            key: 'jeu_hasard', nom: 'Jeu de hasard', offensif: false, testMagie: null,
            cout: 'Jusqu\'à 20', cible: 'Spécial', duree: 'Instantanée',
            description: 'Vous invoquez un vortex d\'énergie chaotique. Lancez votre dé actuel de Volonté une fois par tranche de 10 points dépensés, gardez un seul dé : 1 → vous perdez la moitié de vos PV/PM actuels. 2-3 → chaque créature présente (vous inclus) subit empoisonné. 4-6 → chaque créature présente (vous inclus) subit ralenti. 7-8 → jusqu\'à 3 créatures visibles récupèrent 50 PV et se débarrassent de tous leurs états. 9+ → autant de créatures visibles que voulu subissent 30 dégâts d\'un type tiré au hasard (d6 : air/foudre/ténèbres/terre/feu/poison).',
        },
        {
            key: 'miroir', nom: 'Miroir', offensif: false, testMagie: null,
            cout: 10, cible: 'Une créature', duree: 'Scène',
            description: 'Vous déformez les lois de la magie. Jusqu\'à ce que l\'effet s\'achève, si un sort offensif est lancé sur votre sujet, son lanceur est pris pour cible à sa place (les autres cibles sont visées normalement). Une fois cela produit, l\'effet s\'achève.',
        },
        {
            key: 'omega', nom: 'Oméga', offensif: true, testMagie: '[INT + VOL]',
            cout: 20, cible: 'Une créature', duree: 'Instantanée',
            description: 'Vous invoquez le mauvais sort contre votre adversaire pour transformer sa force en fragilité. La cible perd un nombre de PV égal à [20 + la moitié de son niveau].',
        },
        {
            key: 'umbra', nom: 'Umbra', offensif: true, testMagie: '[INT + VOL]',
            cout: '10 PM par cible', cible: 'Jusqu\'à 3 créatures', duree: 'Instantanée',
            description: 'Une tempête d\'énergie noire transforme la matière en cendres. Chaque cible touchée subit [VH + 15] dégâts de ténèbres. Aubaine : chaque cible touchée subit l\'état affaibli.',
        },
    ],

    spirite: [
        {
            key: 'arme_spirituelle', nom: 'Arme spirituelle', offensif: false, testMagie: null,
            cout: 10, cible: 'Une arme équipée', duree: 'Scène',
            description: 'Vous imprégnez une arme de l\'énergie purificatrice de votre âme. Tant que ce sort fait effet, tous les dégâts infligés par l\'arme deviennent des dégâts de lumière. Si vous êtes équipé de l\'arme lorsque vous lancez ce sort, vous pouvez l\'utiliser pour une attaque gratuite dans la même action. Uniquement sur l\'arme d\'une créature volontaire.',
        },
        {
            key: 'aura', nom: 'Aura', offensif: false, testMagie: null,
            cout: '5 PM par cible', cible: 'Jusqu\'à 3 créatures', duree: 'Scène',
            description: 'Vous projetez votre âme hors de votre corps afin qu\'elle entoure les cibles et les protège contre la magie néfaste. Jusqu\'à la fin des effets, chaque cible fait comme si sa Défense magique était de 12 contre tout effet qui la prend pour cible (ou sa valeur normale si supérieure).',
        },
        {
            key: 'barriere', nom: 'Barrière', offensif: false, testMagie: null,
            cout: '5 PM par cible', cible: 'Jusqu\'à 3 créatures', duree: 'Scène',
            description: 'Vous projetez votre âme hors de votre corps afin d\'en faire une barrière protégeant les cibles contre les attaques. Jusqu\'à la fin des effets, chaque cible fait comme si sa Défense était de 12 contre tout effet qui la prend pour cible (ou sa valeur normale si supérieure).',
        },
        {
            key: 'eveil', nom: 'Éveil', offensif: false, testMagie: null,
            cout: 20, cible: 'Une créature', duree: 'Scène',
            description: 'Vous permettez à une créature de concentrer son énergie vitale. Choisissez un attribut (DEX/INT/PUI/VOL) : jusqu\'à la fin de l\'effet, la cible fait comme si la taille de dé de cet attribut était supérieure d\'un cran (max d12).',
        },
        {
            key: 'hallucination', nom: 'Hallucination', offensif: true, testMagie: '[INT + VOL]',
            cout: '5 PM par cible', cible: 'Jusqu\'à 3 créatures', duree: 'Instantanée',
            description: 'Vous altérez les perceptions de vos ennemis, provoquant des hallucinations bizarres ou effrayantes. Choisissez étourdi ou traumatisé : vous infligez cet état à chaque cible touchée.',
        },
        {
            key: 'lux', nom: 'Lux', offensif: true, testMagie: '[INT + VOL]',
            cout: '10 PM par cible', cible: 'Jusqu\'à 3 créatures', duree: 'Instantanée',
            description: 'Vous focalisez votre énergie interne dans une rafale d\'aveuglants rayons spirituels. Chaque cible touchée subit [VH + 15] dégâts de lumière. Aubaine : chaque cible touchée subit l\'état étourdi.',
        },
        {
            key: 'misericorde', nom: 'Miséricorde', offensif: false, testMagie: null,
            cout: 20, cible: 'Une créature', duree: 'Scène',
            description: 'Vous renforcez le cœur d\'une créature contre la souffrance et le désespoir. Tant que ce sort fait effet, si la cible est réduite à 0 PV, il lui reste exactement 1 PV à la place. Une fois cela produit, l\'effet s\'achève.',
        },
        {
            key: 'purification', nom: 'Purification', offensif: false, testMagie: null,
            cout: '5 PM par cible', cible: 'Jusqu\'à 3 créatures', duree: 'Instantanée',
            description: 'Vous renforcez et purifiez l\'énergie spirituelle qui parcourt vos compagnons. Chaque cible se débarrasse de tous les états qui l\'affectent.',
        },
        {
            key: 'rage', nom: 'Rage', offensif: true, testMagie: '[INT + VOL]',
            cout: 10, cible: 'Une créature', duree: 'Instantanée',
            description: 'Vous faites perdre son sang-froid à une créature, qui abandonne toute prudence. La cible subit l\'état enragé et ne peut plus réaliser les actions Garde ou Sort à son prochain tour.',
        },
        {
            key: 'renforcement', nom: 'Renforcement', offensif: false, testMagie: null,
            cout: '5 PM par cible', cible: 'Jusqu\'à 3 créatures', duree: 'Scène',
            description: 'Vous protégez les cibles contre les attaques qui pourraient corrompre leur corps ou leur âme. Choisissez un état parmi étourdi/enragé/empoisonné/traumatisé/ralenti/affaibli : jusqu\'à la fin de l\'effet, chaque cible y est immunisée.',
        },
        {
            key: 'soins', nom: 'Soins', offensif: false, testMagie: null,
            cout: '10 PM par cible', cible: 'Jusqu\'à 3 créatures', duree: 'Instantanée',
            description: 'Vous revigorez vos compagnons, apaisant leur douleur et leur fatigue. Chaque cible récupère 40 Points de Vie (50 si vous êtes niveau 20+, 60 si niveau 40+).',
        },
        {
            key: 'torpeur', nom: 'Torpeur', offensif: true, testMagie: '[INT + VOL]',
            cout: '5 PM par cible', cible: 'Jusqu\'à 3 créatures', duree: 'Instantanée',
            description: 'Vous étouffez l\'énergie qui parcourt le corps de vos adversaires afin de gêner leurs mouvements. Choisissez ralenti ou affaibli : vous infligez cet état à chaque cible touchée.',
        },
    ],

    // Pas de liste fixe — sorts appris en jeu par imitation (voir CLASSES.chimeriste.imitation_sort)
    chimeriste: [],
};