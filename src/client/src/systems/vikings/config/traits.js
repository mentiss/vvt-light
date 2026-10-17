// src/client/src/systems/vikings/config/traits.js
// ─────────────────────────────────────────────────────────────────────────────
// Traits et backgrounds (65). Référence : spec_vikings.md, annexe B.
// Conditions : requirements (carac min), maxCarac (carac max), requiresSkill (compétence
// min), requiresSaga (SAGA totale min), requiresAny (au moins une des alternatives).
// Vérifiées par checkTraitConditions (rules.js). Incompatibilités réciproques.
// ─────────────────────────────────────────────────────────────────────────────

export const TRAITS = [
    {
        name: "Bons réflexes",
        description: "Vous avez naturellement d'excellents réflexes et pouvez réagir avec une rapidité surprenante, même lorsque vous êtes pris au dépourvu.",
        effects: { actions: 1 },
        requirements: { agilite: 3 },
        incompatible: []
    },
    {
        name: "Peau dure",
        description: "Après avoir passé de longues périodes à affronter les éléments en extérieur, votre peau s'est tannée et endurcie, vous offrant une protection naturelle.",
        effects: { armure: 1 },
        requirements: { force: 2, agilite: 2 },
        incompatible: ["Tatouage", "Sang de troll", "Survivant miraculeux", "Insaisissable"]
    },
    {
        name: "Vue perçante",
        description: "Votre acuité visuelle est bien supérieure à la moyenne. Vous voyez plus loin que quiconque et les détails les plus infimes ne vous échappent pas.",
        effects: { description: "Pas de malus lié à la distance" },
        requirements: { perception: 2 },
        incompatible: ["Aveugle", "Borgne", "Enfant des nuits blanches", "Enfant de l'hiver noir"]
    },
    {
        name: "Aveugle",
        description: "Que ce soit une punition ou une épreuve divine, vous avez perdu la vue. En contrepartie, vos autres sens se sont aiguisés pour compenser ce handicap.",
        effects: { description: "Échec auto Perception (vue). +1 succès auto sur les autres sens" },
        requirements: { perception: 2, agilite: 2 },
        incompatible: ["Vue perçante", "Borgne", "Marin", "Huskarl", "Leader né", "Berserk", "Tatouage", "Foudre de guerre", "Duelliste"]
    },
    {
        name: "Foudre de guerre",
        description: "Le combat est une seconde nature pour vous. Quelle que soit l'arme en main, vous êtes dangereux, mais vous devenez un véritable maître avec vos armes de prédilection.",
        effects: { actions: 1, description: "Pas de malus de localisation" },
        requirements: { force: 2, agilite: 2 },
        requiresSkill: { "Combat CàC (armé)": 2 },
        incompatible: ["Aveugle", "Huskarl", "Leader né", "Godi", "Insaisissable", "Volva"]
    },
    {
        name: "Tatouage",
        description: "Votre corps est couvert de motifs complexes qui effraient les chrétiens et les âmes sensibles, tout en vous assurant la bénédiction des Dieux. Certains motifs peuvent receler des pouvoirs cachés.",
        effects: { description: "Intimidation chrétien (+1 suc auto), Chance (+1 suc auto)" },
        requirements: { charisme: 2 },
        incompatible: ["Peau dure", "Aveugle"]
    },
    {
        name: "Borgne",
        description: "Vous avez sacrifié un œil (ou l'avez perdu au combat). Cette blessure inspire la crainte ou le respect, car beaucoup y voient la marque d'Odin lui-même et vous pensent sous protection divine.",
        effects: { description: "Intimidation (+1 suc auto), Perception (-1 suc auto)", sagaBonus: 1 },
        requirements: { force: 2, charisme: 2 },
        incompatible: ["Aveugle", "Vue perçante"]
    },
    {
        name: "Huskarl",
        description: "Vous avez juré fidélité à un Jarl ou un Roi. En tant que garde du corps d'élite, vos réflexes sont conditionnés pour protéger votre seigneur, ce qui limite parfois votre liberté de mouvement.",
        effects: { actions: 1, description: "Arme 1 main+bouclier (+1 suc auto)" },
        requirements: { force: 2 },
        requiresSkill: { "Combat CàC (armé)": 2 },
        incompatible: ["Aveugle", "Foudre de guerre", "Skald", "Vaurien", "Volva", "Berserk", "Insaisissable"]
    },
    {
        name: "Volva",
        description: "Vous possédez la rare connaissance des runes et savez manipuler le heidl pour éveiller leur magie. Souvent craint et respecté, cet art est traditionnellement féminin. Vous savez enchanter des objets ou lancer des rituels.",
        effects: { description: "Chance (+1 suc auto)", runePoints: 8 },
        requirements: { chance: 2 },
        requiresSkill: { "Divination": 3, "Folklore": 2 },
        incompatible: ["Foudre de guerre", "Huskarl", "Berserk", "Marin", "Godi", "Duelliste"]
    },
    {
        name: "Berserk",
        description: "Guerrier-fauve voué à Odin, vous combattez torse nu ou vêtu d'une simple peau de bête. Vous pouvez entrer dans une transe furieuse où la douleur n'existe plus, frappant tout ce qui bouge, ami comme ennemi.",
        effects: { description: "Transe (5 tours): Action +2, Armure +2, SEUIL +1, Arme 2 mains (+2 suc auto), ignore douleur. Fin: 4 tokens fatigue. Test Chance pour ciblage." },
        requirements: { force: 2, chance: 2 },
        incompatible: ["Aveugle", "Huskarl", "Leader né", "Godi", "Volva", "Marin", "Insaisissable", "Sang de troll", "Sous le regard de Tyr", "Skald", "Noble lignée", "Sous le regard d'Odin"]
    },
    {
        name: "Skald",
        description: "Gardien de la mémoire et poète, vous connaissez de nombreuses sagas que vous narrez lors des banquets, toujours accompagné d'une bonne corne de bière.",
        effects: { description: "Charisme (+1 suc auto), Folklore (+1 suc auto)" },
        requiresSkill: { "Folklore": 2 },
        incompatible: ["Berserk", "Huskarl", "Langue de serpent", "Sang de troll", "Porte-poisse", "Né sous mauvais augure", "Duelliste"]
    },
    {
        name: "Taille imposante",
        description: "Vous êtes une montagne de muscles, bien plus grand et massif que vos contemporains, ce qui suffit souvent à calmer les ardeurs adverses.",
        effects: { description: "Intimidation (+1 suc auto)" },
        requirements: {},
        incompatible: ["Insaisissable"]
    },
    {
        name: "Marin",
        description: "La mer est votre véritable foyer. Vous ne souffrez ni du mal de mer, ni de la promiscuité à bord, et ignorez le tangage. Vous savez entretenir un navire instinctivement.",
        effects: { actions: 1, description: "Action +1 (en mer), Charpentier marine (+1 suc auto)" },
        requirements: { force: 2, agilite: 2 },
        requiresSkill: { "Combat CàC (armé)": 1 },
        incompatible: ["Volva", "Aveugle", "Berserk"]
    },
    {
        name: "Leader né",
        description: "Guerrier charismatique, vous maîtrisez les runes orales (Galdr) pour hurler des ordres qui galvanisent vos troupes ou terrifient vos ennemis au cœur de la mêlée.",
        effects: { actions: 1, runePoints: 3 },
        requirements: { charisme: 2 },
        incompatible: ["Berserk", "Aveugle", "Godi", "Foudre de guerre", "Duelliste", "Vaurien"]
    },
    {
        name: "Godi",
        description: "Expert des lois et prêtre respecté, votre impartialité est renommée. Les nobles vous consultent pour les querelles et vous êtes habitué à parler devant le Thing et les Dieux.",
        effects: { description: "Loi (+1 suc auto), Charisme (+1 suc auto)" },
        requiresSkill: { "Loi": 2 },
        requiresSaga: 1,
        incompatible: ["Berserk", "Volva", "Foudre de guerre", "Leader né", "Langue de serpent", "Vaurien", "Duelliste", "Sous le regard d'Odin", "Sous le regard de Thor", "Sous le regard de Tyr", "Sous le regard de Freyr", "Sous le regard de Freyja", "Sous le regard de Loki"]
    },
    {
        name: "Impistable",
        description: "Fantôme des bois, vous avez appris à ne laisser aucune trace derrière vous et savez parfaitement effacer celles de vos compagnons.",
        effects: { description: "+2 succès lors de traque (défense)" },
        requiresSkill: { "Traque/Chasse": 2 },
        incompatible: []
    },
    {
        name: "Grande concentration",
        description: "Rien ne peut perturber votre esprit. Vous restez focalisé sur votre tâche quel que soit le chaos environnant.",
        effects: { description: "+1 succès auto sur une compétence de votre choix" },
        requirements: {},
        incompatible: []
    },
    {
        name: "Infatigable",
        description: "Vous semblez inépuisable. Même exténué, vous tenez bon. Vous supportez les longues nuits de veille bien mieux que le commun des mortels.",
        effects: { description: "Pas de malus lié à la fatigue" },
        requirements: {},
        incompatible: []
    },
    {
        name: "Force de géant",
        description: "On vous dit descendant des Jötnar. Sans être nécessairement plus musclé, vous soulevez sans effort des charges qui briseraient le dos de deux hommes normaux.",
        effects: { description: "Force (+2 suc auto)" },
        requirements: { force: 2 },
        incompatible: ["Grand guérisseur", "Insaisissable"]
    },
    {
        name: "Virtuose de l'arc",
        description: "Votre maîtrise est telle que l'encochage, la visée et le tir ne forment qu'un seul mouvement fluide et mortel.",
        effects: { description: "Viser devient une action gratuite" },
        requiresSkill: { "Combat distance": 3 },
        incompatible: []
    },
    {
        name: "Sanglant",
        description: "Vous avez la fâcheuse tendance à démembrer vos ennemis. Vos exactions rendent les cadavres méconnaissables et vous donnent une réputation terrifiante.",
        effects: { description: "+1 token blessure sur dégâts, Charisme (-1 suc auto)", sagaBonus: 1 },
        requirements: { force: 3 },
        incompatible: ["Grand guérisseur", "Lien avec les Landvættir", "Sous le regard de Freyr"]
    },
    {
        name: "Ancien esclave",
        description: "Vous avez connu les fers et acheté votre liberté à la sueur de votre front. Vous savez survivre avec rien et endurez la misère mieux que les nés-libres.",
        effects: { description: "Survie (+1 suc auto), Chance (-1 suc auto)" },
        requirements: {},
        incompatible: ["Noble lignée", "Dernier de la lignée", "Bâtard reconnu", "Orphelin aguerri", "Marqué par les Nornes"]
    },
    {
        name: "Noble lignée",
        description: "Le sang des Jarls coule dans vos veines. Même si votre famille a perdu son influence, vous gardez une prestance et un statut naturel qui imposent le respect.",
        effects: { description: "Charisme (+1 suc auto)", sagaBonus: 1 },
        requirements: {},
        incompatible: ["Berserk", "Ancien esclave", "Langue de serpent", "Dette de sang", "Serment rompu", "Porte-poisse", "Marqué par les Nornes", "Né sous mauvais augure", "Dernier de la lignée", "Bâtard reconnu", "Orphelin aguerri", "Sang de troll", "Duelliste"]
    },
    {
        name: "Grand guérisseur",
        description: "Formé à soigner les plaies de guerre les plus hideuses, vous avez acquis votre renommée en sauvant la vie d'un personnage important.",
        effects: { description: "Soin (-1 tokens de blessure gratuit)", sagaBonus: 1 },
        requiresSkill: { "Docteur": 2 },
        incompatible: ["Force de géant", "Sanglant", "Duelliste", "Serment rompu", "Porte-poisse", "Né sous mauvais augure"]
    },
    {
        name: "Ambidextre",
        description: "Vous ne faites aucune différence entre votre main gauche et votre main droite, capable de manier deux armes avec une efficacité redoutable.",
        effects: { actions: 1, description: "Combat 2 armes à une main possible" },
        requirements: {},
        incompatible: []
    },
    {
        name: "Langue de serpent",
        description: "Menteur pathologique et séducteur invétéré, vous n'avez aucun scrupule à manipuler les gens. Votre éloquence est votre meilleure arme.",
        effects: { description: "Charisme (+2 suc auto)" },
        incompatible: ["Noble lignée", "Skald", "Godi", "Tueur de monstre", "Sous le regard de Tyr", "Connaissance des runes", "Vaurien"]
    },
    {
        name: "Sommeil léger",
        description: "Vous ne dormez jamais vraiment. Toujours sur le qui-vive, le moindre craquement de brindille suffit à vous réveiller prêt au combat.",
        effects: { description: "Perception (+1 suc auto la nuit)" },
        requirements: {},
        incompatible: ["Rêveur prophétique"]
    },
    {
        name: "Campeur",
        description: "Vous vivez en harmonie avec la nature, capable de dormir n'importe où et de vous nourrir de ce que la forêt vous offre.",
        effects: { description: "Survie (+1 suc auto), Chance (+1 suc auto)" },
        requiresSkill: { "Survie": 1 },
        incompatible: []
    },
    {
        name: "Duelliste",
        description: "Habitué des Holmgang, vous utilisez le défi rituel pour dépouiller vos adversaires. Votre entraînement est spécifique au combat singulier.",
        effects: { description: "Combat CàC (+1 suc auto)" },
        requirements: {},
        incompatible: ["Noble lignée", "Skald", "Godi", "Grand guérisseur", "Leader né", "Volva", "Aveugle"]
    },
    {
        name: "Boxeur",
        description: "Vous vous battez à mains nues depuis l'enfance. Vous savez où frapper pour briser les os et assommer rapidement vos adversaires.",
        effects: { description: "Combat sans arme (+1 suc auto). KO auto sur seuil+1" },
        requirements: {},
        incompatible: []
    },
    {
        name: "Divorcé",
        description: "Votre mariage arrangé fut un échec retentissant. L'union a été dissoute pour incompatibilité, vous laissant une certaine débrouillardise solitaire.",
        effects: { description: "Survie (+1 suc auto)" },
        requirements: {},
        incompatible: ["Veuf/Veuve"]
    },
    {
        name: "Sens de l'orientation",
        description: "Les étoiles et le soleil sont vos guides. Vous savez instinctivement où se trouve le Nord et comment diriger un navire vers sa destination.",
        effects: { actions: 1, description: "Navigation (+1 suc auto), Action (en mer) +1" },
        requirements: {},
        incompatible: []
    },
    {
        name: "Rameur fou",
        description: "Vous êtes une machine inépuisable sur un banc de nage. Vous propulsez le navire plus vite et maniez la rame comme une arme contondante.",
        effects: { description: "+3km/h lorsque vous ramez" },
        requirements: { force: 2 },
        incompatible: []
    },
    {
        name: "Banni",
        description: "Jugé coupable par le Thing, vous êtes un hors-la-loi. Vous ne pouvez revenir sur vos terres natales qu'en conquérant, ce qui vous a appris à survivre en marge.",
        effects: { description: "Survie (+1 suc auto)", sagaBonus: 1 },
        maxCarac: { chance: 1 },   // vault : « Chance 1 (max) »
        incompatible: []
    },
    {
        name: "Troublé",
        description: "Un mal inconnu ronge votre esprit. Entre pertes de mémoire et confusion, vous êtes assailli de visions prophétiques que vous ne contrôlez pas.",
        effects: { description: "+1 succès difficulté, Divination (+2 succès auto)" },
        requirements: {},
        incompatible: []
    },
    {
        name: "Veuf/Veuve",
        description: "Votre moitié a quitté ce monde, vous laissant seul(e). Parfois, vous sentez que son fantôme veille encore sur vous ou vous hante.",
        effects: { description: "Survie (+1 suc auto), Chance (-1 suc auto)" },
        requirements: {},
        incompatible: ["Divorcé"]
    },
    {
        name: "Fin négociant",
        description: "Marchand vétéran, vous avez l'œil pour estimer la valeur des choses. Vous savez exactement quand conclure une affaire ou quand partir en courant.",
        effects: { description: "Marchandage (+1 suc auto)" },
        requiresSkill: { "Marchandage": 1 },
        incompatible: []
    },
    {
        name: "Vaurien",
        description: "La ruse et la tromperie coulent dans vos veines. Vous savez mentir avec un aplomb tel que même les Dieux pourraient vous croire.",
        effects: { description: "Larcin (+1 suc auto), Langue Orale - Mentir (+1 suc auto)" },
        requiresSkill: { "Larcin": 2 },
        incompatible: ["Godi", "Leader né", "Huskarl", "Langue de serpent", "Connaissance des runes"]
    },
    {
        name: "Maître des bêtes",
        description: "Vous imposez votre dominance aux animaux. Vous commencez le jeu avec un animal fidèle (chien, faucon...) validé par le MJ.",
        effects: { description: "Dressage (+1 suc auto). Le compagnon agit à votre Initiative (1 Action propre)" },
        requiresSkill: { "Dressage": 2, "Amis des animaux": 1 },
        incompatible: []
    },
    {
        name: "Briseur de boucliers",
        description: "Votre style brutal vise à détruire la protection adverse. Vous savez exactement où frapper pour faire éclater le bois.",
        effects: { description: "Dégâts +1 Token contre boucliers. Si bouclier détruit: Intimidation (+1 suc auto) gratuit" },
        requirements: { force: 3 },
        incompatible: []
    },
    {
        name: "Insaisissable",
        description: "Anguille sur le champ de bataille, vous misez tout sur la mobilité, refusant les armures lourdes qui vous ralentiraient.",
        effects: { seuil: 1, description: "Si Armure légère/nulle: SEUIL +1 contre CàC" },
        requirements: { agilite: 3 },
        incompatible: ["Peau dure", "Berserk", "Huskarl", "Force de géant", "Foudre de guerre", "Taille imposante"]
    },
    {
        name: "Sang de troll",
        description: "On murmure que votre lignée est souillée. Laid, peau grisâtre, vous effrayez les gens mais vos plaies se referment à une vitesse surnaturelle.",
        effects: { armure: 1, description: "Armure +1. Récupération Blessure divisée par 2. Charisme (-1 suc auto)" },
        requirements: { force: 3 },
        incompatible: ["Noble lignée", "Skald", "Berserk", "Peau dure", "Marqué par les Nornes"]
    },
    {
        name: "Sang de glace",
        description: "L'hiver est votre élément. Le froid mordant ne vous atteint pas, là où d'autres mourraient gelés.",
        effects: { description: "Immunisé malus/dégâts du froid naturel. Survie en hiver (+1 suc auto)" },
        requiresSkill: { "Survie": 2 },
        incompatible: []
    },
    {
        name: "Connaissance des runes",
        description: "Vous avez appris ou avez eu une révélation pendant un rêve sur la signification et l'utilisation des Runes. Votre savoir vous permet de maîtriser en partie les runes et leurs pouvoirs.",
        effects: { runePoints: 5 },
        // vault : Chant 2 OU Divination 2 OU Folklore 3
        requiresAny: [
            { requiresSkill: { "Chant": 2 } },
            { requiresSkill: { "Divination": 2 } },
            { requiresSkill: { "Folklore": 3 } },
        ],
        incompatible: ["Langue de serpent", "Vaurien"]
    },
    {
        name: "Marqué par les Nornes",
        description: "Une marque physique singulière (difformité, tache de naissance, hétérochromie, six doigts) présente depuis ta naissance trahit que les Nornes ont tissé un destin exceptionnel pour toi. Tu es promis à la grandeur ou à la tragédie, mais jamais à l'oubli.",
        effects: { sagaBonus: 2, description: "Chance (+1 suc auto), Charisme (-1 suc auto). Obligation narrative MJ" },
        requirements: {},
        incompatible: ["Ancien esclave", "Sang de troll", "Noble lignée", "Né sous mauvais augure", "Porte-poisse"]
    },
    {
        name: "Né sous mauvais augure",
        description: "Ta naissance fut accompagnée de présages funestes : éclipse, corbeau mort sur le seuil, mère morte en couches. Les völvas murmurent ton nom avec inquiétude.",
        effects: { description: "Chance (+1 suc auto), Charisme (-1 suc auto), Intimidation (+1 suc auto)" },
        requirements: {},
        incompatible: ["Marqué par les Nornes", "Noble lignée", "Skald", "Grand guérisseur", "Porte-poisse"]
    },
    {
        name: "Rêveur prophétique",
        description: "Tes rêves sont d'une précision troublante. Tu as rêvé de la mort d'un voisin la veille de sa noyade, du retour d'un raid avant que le drakkar soit visible.",
        effects: { description: "1 fois/session: Pressentiment. MJ donne indice vague mais vrai. Perception (+1 suc auto). +1 Token Fatigue/nuit (sommeil agité)" },
        requirements: { perception: 2 },
        incompatible: ["Sommeil léger"]
    },
    {
        name: "Survivant miraculeux",
        description: "Tu as survécu à quelque chose qui aurait dû te tuer : noyade, incendie, chute de falaise, massacre. Ton corps porte les cicatrices mais ton esprit refuse de céder.",
        effects: { armure: 1, description: "Armure +1 (peau endurcie), Survie (+1 suc auto)", sagaBonus: 1 },
        // vault : Force 2+ OU Chance 2+
        requiresAny: [
            { requirements: { force: 2 } },
            { requirements: { chance: 2 } },
        ],
        incompatible: ["Peau dure"]
    },
    {
        name: "Porte-poisse",
        description: "Les malheurs semblent te coller à la peau. Deux compagnons sont morts à tes côtés. La ferme a brûlé. Le bateau a coulé. Toi, tu survies toujours.",
        effects: { description: "Charisme (-2 suc auto), Chance (+2 suc auto). Tu survies, mais les autres attirent le malheur" },
        requirements: {},
        incompatible: ["Noble lignée", "Skald", "Grand guérisseur", "Marqué par les Nornes", "Né sous mauvais augure"]
    },
    {
        name: "Tueur de monstre",
        description: "Tu as tué une créature légendaire : ours colossal, loup immense aux yeux de braise, géant de glace. Tu portes un trophée bien visible.",
        effects: { description: "Intimidation (+1 suc auto)", sagaBonus: 1 },
        requirements: { force: 3 },
        requiresSkill: { "Combat CàC (armé)": 3 },
        incompatible: ["Langue de serpent"]
    },
    {
        name: "Sous le regard d'Odin",
        description: "Le Père-de-Tout semble t'observer. Les corbeaux te suivent, tes intuitions se révèlent justes. Coïncidence ou faveur du dieu borgne ?",
        effects: { description: "Intelligence (+1 suc auto)", sagaBonus: 1 },
        requirements: { intelligence: 2 },
        incompatible: ["Godi", "Berserk", "Sous le regard de Thor", "Sous le regard de Tyr", "Sous le regard de Freyr", "Sous le regard de Freyja", "Sous le regard de Loki"]
    },
    {
        name: "Sous le regard de Thor",
        description: "Le Tonnerre semble te protéger. Tu as survécu à des orages mortels. Tes coups frappent avec une force surprenante.",
        effects: { description: "Force (+1 suc auto)", sagaBonus: 1 },
        requirements: { force: 3 },
        incompatible: ["Godi", "Sous le regard d'Odin", "Sous le regard de Tyr", "Sous le regard de Freyr", "Sous le regard de Freyja", "Sous le regard de Loki"]
    },
    {
        name: "Sous le regard de Tyr",
        description: "Tu es un parangon d'honneur et de courage. Ton bras ne tremble jamais, même face à la mort certaine. Tyr le Manchot semble guider ta lame.",
        effects: { description: "Agilité (+1 suc auto)", sagaBonus: 1 },
        requirements: { agilite: 2 },
        incompatible: ["Godi", "Langue de serpent", "Berserk", "Sous le regard d'Odin", "Sous le regard de Thor", "Sous le regard de Freyr", "Sous le regard de Freyja", "Sous le regard de Loki", "Serment rompu"]
    },
    {
        name: "Sous le regard de Freyr",
        description: "La fertilité et la prospérité te suivent. Tes champs donnent mieux, les animaux t'aiment, les affaires prospèrent. Le Seigneur des Récoltes te bénit.",
        effects: { description: "Charisme (+1 suc auto)", sagaBonus: 1 },
        requirements: { charisme: 2 },
        incompatible: ["Godi", "Sanglant", "Sous le regard d'Odin", "Sous le regard de Thor", "Sous le regard de Tyr", "Sous le regard de Freyja", "Sous le regard de Loki"]
    },
    {
        name: "Sous le regard de Freyja",
        description: "La Maîtresse de la Magie et de la Beauté t'a remarqué. Tu es charismatique, ton intuition troublante, tes perceptions dépassent le commun.",
        effects: { description: "Perception (+1 suc auto)", sagaBonus: 1 },
        requirements: { perception: 2 },
        incompatible: ["Godi", "Sous le regard d'Odin", "Sous le regard de Thor", "Sous le regard de Tyr", "Sous le regard de Freyr", "Sous le regard de Loki"]
    },
    {
        name: "Sous le regard de Loki",
        description: "Le Dieu du Chaos et de la Ruse trouve ton existence amusante. Les coïncidences impossibles se multiplient : corde qui cède, ennemi qui trébuche. Chance pure ou manipulation divine ?",
        effects: { description: "Chance (+1 suc auto)", sagaBonus: 1 },
        requirements: { chance: 2 },
        incompatible: ["Godi", "Sous le regard d'Odin", "Sous le regard de Thor", "Sous le regard de Tyr", "Sous le regard de Freyr", "Sous le regard de Freyja"]
    },
    {
        name: "Lien avec les Landvættir",
        description: "Tu respectes profondément les esprits de la terre. Tu laisses toujours des offrandes, ne souilles jamais les sources sacrées. En retour, ils te guident.",
        effects: { description: "Survie (+1 suc auto) en nature, Dressage (+1 suc auto)" },
        requiresSkill: { "Survie": 2 },
        incompatible: ["Sanglant"]
    },
    {
        name: "Jumeau/Jumelle",
        description: "Tu es né avec un frère ou sœur jumelle. Ce lien est mystique. Vous partagez une connexion troublante, une intuition qui permet de sentir l'état de l'autre.",
        effects: { description: "Perception (+1 suc auto). Si jumeau mort: Chance (+1 suc auto) supplémentaire" },
        requirements: {},
        incompatible: []
    },
    {
        name: "Enfant des nuits blanches",
        description: "Né lors du solstice d'été, sous le soleil de minuit. Béni par la lumière éternelle. Tu te sens vivant sous le jour sans fin, mais l'obscurité t'oppresse.",
        effects: { description: "Perception (+1 suc auto) en plein jour, Charisme (+1 suc auto). Perception (-1 suc auto) dans obscurité" },
        requirements: {},
        incompatible: ["Enfant de l'hiver noir", "Vue perçante"]
    },
    {
        name: "Enfant de l'hiver noir",
        description: "Né lors du solstice d'hiver, dans la nuit polaire. Tu portes l'ombre en toi. Tu vois dans le noir mais le soleil éclatant te brûle les yeux.",
        effects: { description: "Perception (+1 suc auto) dans obscurité, Intimidation (+1 suc auto). Perception (-1 suc auto) en pleine lumière" },
        requirements: {},
        incompatible: ["Enfant des nuits blanches", "Vue perçante"]
    },
    {
        name: "Orphelin aguerri",
        description: "Grandi seul, sans famille. Tu as appris à survivre : voler, mentir, te cacher. Mais cette enfance a laissé des cicatrices. Tu ne sais pas faire confiance.",
        effects: { description: "Survie (+1 suc auto), Larcin (+1 suc auto), Charisme (-1 suc auto)" },
        // vault : Agilité 2+ OU (Survie 1+ ET Larcin 1+)
        requiresAny: [
            { requirements: { agilite: 2 } },
            { requiresSkill: { "Survie": 1, "Larcin": 1 } },
        ],
        incompatible: ["Noble lignée", "Dernier de la lignée", "Bâtard reconnu", "Ancien esclave"]
    },
    {
        name: "Dernier de la lignée",
        description: "Dernier descendant d'une famille autrefois puissante. Le poids de perpétuer le nom repose sur tes épaules. Chaque échec est une trahison envers tes ancêtres.",
        effects: { description: "Chance (-1 suc auto). Obligation narrative: pressions familiales/ennemis anciens", sagaBonus: 1 },
        requirements: { charisme: 2 },
        incompatible: ["Orphelin aguerri", "Ancien esclave", "Bâtard reconnu", "Noble lignée"]
    },
    {
        name: "Bâtard reconnu",
        description: "Enfant illégitime d'un noble. Ton père t'a reconnu publiquement, te donnant son nom mais pas son héritage. Les héritiers légitimes te méprisent.",
        effects: { sagaBonus: 1 },
        requirements: {},
        incompatible: ["Noble lignée", "Ancien esclave", "Orphelin aguerri", "Dernier de la lignée"]
    },
    {
        name: "Serment rompu",
        description: "Tu as trahi un serment sacré. Par nécessité, lâcheté, ou force. Ton honneur est souillé, ton nom sali. Les gens te méprisent. Les dieux t'ont tourné le dos.",
        effects: { description: "Charisme (-2 suc auto), Intimidation (+1 suc auto), Chance (-1 suc auto)" },
        requirements: {},
        incompatible: ["Noble lignée", "Sous le regard de Tyr", "Grand guérisseur"]
    },
    {
        name: "Dette de sang",
        description: "Ta famille doit une compensation massive (wergild) pour un meurtre. Cette dette est colossale, impayable en une vie. Les créanciers peuvent apparaître n'importe quand.",
        effects: { description: "Charisme (-1 suc auto), Survie (+1 suc auto). Motivation narrative: remboursement" },
        requirements: {},
        incompatible: ["Noble lignée"]
    }
];
