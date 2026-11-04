// src/client/src/systems/nimble/config/descriptions.js
// ─────────────────────────────────────────────────────────────────────────────
// Textes de l'assistant de création (spec_nimble.md §6.3) : Guide et aide de
// chaque onglet. D'après Core Rules 3.3 p.4, 19-21.
// ─────────────────────────────────────────────────────────────────────────────

export const GUIDE = [
    { title: 'Nimble', text: 'Un jeu de rôle d\'heroic fantasy rapide : pas de jet pour toucher, on lance directement les dégâts. Un 1 sur le dé primaire rate, son maximum critique et explose. Trois actions par tour, et chacun se défend avec ses réactions.' },
    { title: 'Votre héros en sept étapes', text: '1. La classe, qui pèse le plus sur la façon de jouer. 2. L\'ascendance. 3. L\'historique. 4. Les caractéristiques, par un tableau de valeurs. 5. L\'équipement : le paquetage de la classe, ou 25 po à dépenser. 6. L\'identité, la motivation et les langues. 7. Créer : notez votre code d\'accès.' },
    { title: 'Au niveau 1', text: 'Tout héros commence au niveau 1. Pour démarrer plus haut, créez-le puis montez de niveau depuis la fiche, autant de fois que le MJ l\'accorde : chaque étape guide les choix.' },
    { title: 'La règle d\'or', text: 'Bon sens et bonne humeur. Si quelque chose n\'a pas de sens, ça ne marche pas ; en cas de doute, le MJ tranche.' },
];

export const TAB_HELP = {
    class:     { title: 'La classe', text: 'Elle donne vos deux caractéristiques clés, votre dé de vie et vos PV de départ, une sauvegarde avantagée et une désavantagée, les armes et armures que vous maîtrisez, et vos capacités niveau par niveau. La complexité indique combien la classe demande de suivi.' },
    ancestry:  { title: 'L\'ascendance', text: 'Comment vous êtes né et comment les autres vous voient au premier regard. Chaque ascendance donne un trait. Les ascendances peu communes et exotiques dépendent du cadre de jeu : demandez au MJ. L\'habillage est libre : un trait peut être porté par une autre ascendance si le MJ est d\'accord.' },
    background:{ title: 'L\'historique', text: 'Ce que vous faisiez avant l\'aventure, ou un trait marquant. Certains demandent une caractéristique à 0 ou moins à la création. Libre à vous de les réinterpréter avec le MJ.' },
    stats:     { title: 'Les caractéristiques', text: 'Choisissez un tableau, puis placez les plus hautes valeurs dans les caractéristiques clés de la classe. Chaque compétence vaut sa caractéristique au départ. Les compétences héroïques (règle optionnelle, au choix du MJ) donnent 1 à 4 points à placer.' },
    equipment: { title: 'L\'équipement', text: 'Le paquetage de la classe, porté d\'office, ou 25 po pour tout acheter vous-même. Le reste de l\'or reste dans la bourse.' },
    identity:  { title: 'L\'identité', text: 'Prénom et nom, portrait, motivation (pourquoi partir à l\'aventure, et pourquoi avec ce groupe ?). Tout le monde parle le Commun ; chaque point d\'INT donne une langue de plus, et l\'ascendance donne la sienne si votre INT n\'est pas négative.' },
};

export const ARRAY_HELP = {
    standard: 'Deux forces, une moyenne, une faiblesse.',
    balanced: 'Aucune vraie faiblesse.',
    minmax: 'Un point fort marqué, deux faiblesses.',
};

export const COMPLEXITY = ['', 'Simple', 'Abordable', 'Exigeante', 'Complexe'];
