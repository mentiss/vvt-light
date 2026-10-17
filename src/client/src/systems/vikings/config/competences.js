// src/client/src/systems/vikings/config/competences.js
// ─────────────────────────────────────────────────────────────────────────────
// Compétences Pure Saga (39) et noms des caractéristiques.
// Référence : documentations/spec_vikings.md, annexe A (vault, D-13) + 4 compétences
// conservées (Q-1).
// ─────────────────────────────────────────────────────────────────────────────

export const CARACNAMES = {
    force: "Force",
    agilite: "Agilité",
    perception: "Perception",
    intelligence: "Intelligence",
    charisme: "Charisme",
    chance: "Chance"
};

export const COMPETENCES = [
    { 
        name: "Combat CàC (armé)",
        caracs: ["force", "agilite"],
        description: "Votre aisance au combat avec une arme déterminée de corps à corps (cf les notes). Cette compétence est cumulable pour plusieurs armes différentes. Vous permet aussi d'effectuer des parades en combat (bonus au SEUIL)"
    },
    {
        name: "Combat CàC (non armé)",
        caracs: ["force", "agilite"],
        description: "Votre aisance au combat à main nue. Permet d'effectuer des esquives (bonus au SEUIL)"
    },
    { 
        name: "Combat distance",
        caracs: ["agilite", "agilite"],   // vault : Agilité / Agilité (D-13)
        description: "Manier l'arc, la fronde, lancer javelot ou hache. Toucher une cible éloignée avec précision."
    },
    { 
        name: "Langue orale", 
        caracs: ["intelligence", "charisme"],
        description: "Identique à l'écrit mais concerne l'oral. On considère toujours que vous savez vous exprimez et vous faire comprendre de vos contemporains. En revanche la langue peut aussi être une barrière si vous êtes dans un pays étranger. Compétence cumulable pour d'autres langues. Nécessite une justification RP."
    },
    {
        name: "Langue écrite",
        caracs: ["intelligence", "intelligence"],
        description: "Compétence déterminant votre compréhension d'une langue écrite autre que les runes (cf page des runes). Compétence cumulable pour différentes langues. Nécessite une justification RP."
    },
    {
        name: "Divination",
        caracs: ["chance", "chance"],
        description: "Vous êtes une passerelle entre les Hommes et les Dieux. De ce fait les Dieux vous permettent d'avoir des visions du futur ou encore une compréhension plus globale d'une situation. Parfois les Dieux vous confient leurs secrets."
    },
    {
        name: "Loi", 
        caracs: ["intelligence", "intelligence"],
        description: "Connaître les lois, coutumes et précédents juridiques. Plaider une cause au Thing, arbitrer des conflits."
    },
    { 
        name: "Folklore", 
        caracs: ["intelligence", "intelligence"],   // vault : Intelligence / Intelligence (D-13)
        description: "Connaître les mythes, sagas, légendes, généalogies des Jarls et récits des Dieux."
    },
    {
        name: "Herboriste",
        caracs: ["intelligence", "agilite"],
        description: "Connaissances des plantes et de leurs pouvoirs. Il ne s'agit pas d'une compétence de soins !"
    },
    { 
        name: "Traque/Chasse", 
        caracs: ["perception", "intelligence"],
        description: "Pister, chasser, poser des pièges, lire les traces d'animaux ou d'hommes."
    },
    { 
        name: "Docteur", 
        caracs: ["intelligence", "chance"],
        description: "Détermine votre aptitude à soigner les blessures de tout type, une connaissance accru des plantes est un plus."
    },
    { 
        name: "Ferronnerie", 
        caracs: ["agilite", "agilite"],
        description: "Aptitude du joueur à forger des armes et des armures pour le combat et le pillage. Permet aussi de réparer des pièces d'armures ou des armes endommagés."
    },
    { 
        name: "Connaissance Outgard", 
        caracs: ["intelligence", "intelligence"],
        description: "Savoir sur les autres peuples : Saxons, Francs, Celtes, Slaves. Leurs croyances, coutumes, langues."
    },
    { 
        name: "Ombre", 
        caracs: ["agilite", "agilite"],
        description: "Se déplacer sans bruit, se fondre dans l'obscurité, éviter d'être repéré."
    },
    { 
        name: "Survie", 
        caracs: ["intelligence", "intelligence"],
        description: "Se débrouiller en nature : faire feu, trouver nourriture, construire abri, s'orienter."
    },
    { 
        name: "Raquette", 
        caracs: ["agilite", "agilite"],
        description: "Se déplacer sur neige profonde avec raquettes sans s'enfoncer ni s'épuiser."
    },
    { 
        name: "Amis des animaux", 
        caracs: ["charisme", "charisme"],
        description: "Communiquer avec animaux, comprendre leurs intentions, gagner leur confiance, être averti d'un danger."
    },
    { 
        name: "Orfèvre", 
        caracs: ["agilite", "intelligence"],
        description: "Créer bijoux précieux : modèle en cire, moule en terre, coulée d'or ou argent."
    },
    { 
        name: "Potier", 
        caracs: ["agilite", "intelligence"],
        description: "Manier l'argile, façonner récipients, amphores, objets du quotidien."
    },
    { 
        name: "Bûcheron", 
        caracs: ["intelligence", "force"],
        description: "Choisir arbres, les abattre proprement, faire offrandes aux Dieux, transporter troncs."
    },
    { 
        name: "Charpentier marine", 
        caracs: ["agilite", "intelligence"],
        description: "Votre compétence à la création et l'entretient des langskip. Cela va de la sélection du bois en passant par la coupe et l'assemblage du bateau. Un bon charpentier de marine est généralement aussi un bon marin et ne souffre pas du mal de mer."
    },
    { 
        name: "Fermier", 
        caracs: ["intelligence", "force"],
        description: "Retourner terre, planter, récolter, nourrir famille. Préparer hydromel et bières."
    },
    { 
        name: "Charpentier", 
        caracs: ["intelligence", "force"],
        description: "Bâtir maisons durables : choix arbres, charpente, toiture, assemblage."
    },
    { 
        name: "Pillage", 
        caracs: ["perception", "chance"],
        description: "Trouver objets de valeur dans habitations, repérer cachettes, dénicher trésors."
    },
    { 
        name: "Danse", 
        caracs: ["agilite", "agilite"],
        description: "Qualité du jeu de jambes lors des fêtes et soirées alcoolisées."
    },
    { 
        name: "Jeu", 
        caracs: ["chance", "intelligence"],
        description: "Expertise aux jeux de hasard et stratégie (hnefatafl, dés) joués l'hiver."
    },
    { 
        name: "Pêche", 
        caracs: ["chance", "agilite"],
        description: "Appâter poisson, connaître bons coins. Immunité au mal de mer."
    },
    { 
        name: "Sculpteur", 
        caracs: ["agilite", "agilite"],
        description: "Sculpter pièces en bois, créer couverts, objets décoratifs, mâts de navire."
    },
    { 
        name: "Navigation", 
        caracs: ["intelligence", "chance"],
        description: "Piloter bateau dans direction voulue, lire étoiles et vents, éviter récifs."
    },
    { 
        name: "Mineur", 
        caracs: ["intelligence", "force"],
        description: "Localiser minerai, extraire fer ou métaux précieux, soutenir galeries."
    },
    {
        name: "Escalade",
        caracs: ["agilite", "force"],
        description: "Vous savez reconnaître les bonnes prises des mauvaises et utiliser votre savoir faire pour gravir des parois verticale ou des chemin très escarpés."
    },
    {
        name: "Intimidation",
        caracs: ["charisme", "force"],
        description: "Vous savez utiliser le langage corporel pour intimider les autres et vous servez de votre physique pour faire passer des messages simple.. comme \"si tu continues... je te pète la gueule\""
    },
    {
        name: "Chant",
        caracs: ["charisme", "chance"],
        description: "Détermine si vous chantez comme un canard boiteux ou comme une Diva. Permet aussi de chanter les runes (en combat ou non)."
    },
    {
        name: "Marchandage",
        caracs: ["charisme", "perception"],
        description: "Votre compétence à négocier le bon prix lors d'un achat ou d'une vente. Etre un fin marchand est un véritable art."
    },
    { 
        name: "Larcin", 
        caracs: ["agilite", "perception"],
        description: "Voler bourse, crocheter serrure rudimentaire, tours de passe-passe, tricher aux jeux."
    },
    { 
        name: "Dressage", 
        caracs: ["charisme", "force"],
        description: "Soumettre la volonté d'un animal (chien, faucon, cheval) pour qu'il obéisse à des ordres complexes, au-delà de la simple amitié."
    },
    { 
        name: "Cuisine", 
        caracs: ["intelligence", "perception"],
        description: "Préparer gibier, reconnaître ingrédients comestibles, cuisiner repas qui remonte moral."
    },
    { 
        name: "Brasseur", 
        caracs: ["intelligence", "agilite"],
        description: "L'art complexe de la fermentation de haute qualité. Bien au-delà du tord-boyaux fermier, vous créez des hydromels et bières d'exception."
    },
    { 
        name: "Couture", 
        caracs: ["intelligence", "agilite"],
        description: "Maîtrise art textile : tissage, teinture, coupe, assemblage. Protéger du froid, afficher rang social."
    }
];
