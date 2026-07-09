// src/client/src/systems/fabula/config/arcana.js
// ─────────────────────────────────────────────────────────────────────────────
// Catalogue statique des Arcana (classe Arcaniste).
// Référencé par classes.js via CLASSES.arcaniste.competences['lier_invoquer'].
// Chaque Arcanum peut être "lié" (character_arcana.etat = 'lie', passif —
// effets de fusion inactifs) ou "fusionné" (etat = 'fusionne', invoqué en jeu
// pour 40 PM — effets de fusion actifs, effet de renvoi disponible au renvoi
// volontaire).
// ─────────────────────────────────────────────────────────────────────────────

export const ARCANA_LISTS = {

    arcaniste: [
        {
            key: 'chene', nom: 'Arcanum du Chêne', domaines: ['terre', 'plantes', 'poison'],
            effetFusion: 'Vous bénéficiez de la résistance aux dégâts de terre et de poison ainsi que de l\'immunité à l\'état empoisonné. Chaque fois que vous récupérez des Points de Vie, vous en récupérez 5 de plus.',
            effetRenvoi: 'Floraison — Choisissez autant de créatures que vous voulez parmi celles que vous voyez (vous inclus) : chacune se débarrasse de l\'état empoisonné et regagne 40 Points de Vie (50 si niveau 20+, 60 si niveau 40+).',
        },
        {
            key: 'ciel', nom: 'Arcanum du Ciel', domaines: ['brouillard', 'pluie', 'tempêtes'],
            effetFusion: 'Vous bénéficiez de la résistance aux dégâts d\'air et de foudre. Vous pouvez utiliser une action pour prédire les conditions météo du jour à venir dans un rayon de deux jours de trajet.',
            effetRenvoi: 'Orage — Choisissez autant de créatures que vous voulez parmi celles que vous voyez : chacune subit 30 dégâts de foudre. Ces dégâts ignorent les résistances.',
        },
        {
            key: 'epee', nom: 'Arcanum de l\'Épée', domaines: ['conquête', 'héroïsme', 'commandement'],
            effetFusion: 'Tous les dégâts infligés par vos attaques sont traités comme s\'ils n\'avaient aucun type et augmentent de 5 ; ils ne peuvent pas recevoir de type tant que vous restez fusionné avec cet Arcanum. Quand vous portez une attaque, vous pouvez lui affecter la propriété multi (n\'importe quel nombre de cibles) — l\'Arcanum est alors immédiatement renvoyé après résolution (pas considéré comme un renvoi délibéré).',
            effetRenvoi: null,
        },
        {
            key: 'forge', nom: 'Arcanum de la Forge', domaines: ['feu', 'chaleur', 'métal'],
            effetFusion: 'Vous bénéficiez d\'une résistance aux dégâts de feu. Tous les dégâts de feu que vous infligez ignorent les résistances.',
            effetRenvoi: 'Choisissez Forge ou Fournaise au renvoi. Forge — Vous créez une armure, un bouclier ou une arme de base de votre choix (l\'objet précédemment créé de cette façon disparaît si vous recommencez ; une arme ainsi créée inflige des dégâts de feu au lieu de physiques). Fournaise — Choisissez autant de créatures que vous voulez parmi celles que vous voyez : chacune subit 30 dégâts de feu, ignorant les résistances.',
        },
        {
            key: 'givre', nom: 'Arcanum du Givre', domaines: ['froid', 'glace', 'silence'],
            effetFusion: 'Vous bénéficiez d\'une résistance aux dégâts de glace et de l\'immunité à l\'état enragé. Tous les dégâts de glace que vous infligez ignorent les résistances.',
            effetRenvoi: 'Âge de glace — Choisissez autant de créatures que vous voulez parmi celles que vous voyez : chacune subit 30 dégâts de glace, ignorant les résistances.',
        },
        {
            key: 'grimoire', nom: 'Arcanum du Grimoire', domaines: ['savoir', 'révélations', 'compréhension'],
            effetFusion: 'Vous êtes capable de lire, d\'écrire et de comprendre toutes les langues. Vous faites comme si la taille de votre dé d\'Intuition était supérieure d\'un cran (maximum d12).',
            effetRenvoi: 'Oracle — Vous posez une seule question au meneur de jeu, qui doit y répondre sincèrement en décrivant la vision que vous montre le Grimoire. Indisponible avant la prochaine aube une fois utilisé ; on ne peut jamais poser la même question plus d\'une fois.',
        },
        {
            key: 'portail', nom: 'Arcanum du Portail', domaines: ['espace', 'voyage', 'vide'],
            effetFusion: 'Vous bénéficiez d\'une résistance aux dégâts de ténèbres. Vous bénéficiez d\'un bonus de +1 en Défense magique.',
            effetRenvoi: 'Choisissez Néant ou Téléportation au renvoi. Néant — Choisissez autant de créatures que vous voulez parmi celles que vous voyez : chacune subit 30 dégâts de ténèbres, ignorant les résistances. Téléportation — Vous vous téléportez ainsi que jusqu\'à 5 autres créatures consentantes à proximité vers un endroit déjà visité, à moins d\'une journée de voyage.',
        },
        {
            key: 'roue', nom: 'Arcanum de la Roue', domaines: ['destin', 'vitesse', 'temps'],
            effetFusion: 'Vous êtes immunisé contre l\'état ralenti. Vous bénéficiez d\'un bonus de +1 en Défense.',
            effetRenvoi: 'Interruption du temps — Choisissez autant de créatures que vous voulez parmi celles que vous voyez : chacune subit l\'état ralenti (ou, si déjà ralentie, effectue une action de moins à son tour suivant, minimum 0).',
        },
        {
            key: 'tour', nom: 'Arcanum de la Tour', domaines: ['jugement', 'protection', 'sacrifice'],
            effetFusion: 'Quand vous invoquez cet Arcanum, choisissez un type de dégât (air, foudre, ténèbres, terre, feu ou glace) : jusqu\'au renvoi, chacun de vos alliés présents dans la scène dispose de la résistance au type choisi (mais pas vous).',
            effetRenvoi: 'Jugement — Choisissez autant de créatures que vous voulez parmi celles que vous voyez : chacune subit 30 dégâts de lumière, ignorant les résistances.',
        },
    ],
};