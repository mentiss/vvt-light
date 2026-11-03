// src/client/src/systems/woddavampire/config/descriptions.js
// ─────────────────────────────────────────────────────────────────────────────
// Textes d'aide de l'assistant de création (spec_woddavampire.md §II.6) :
// reformulations courtes des livres V20 Dark Ages, relues par le MJ.
// Un seul fichier pour faciliter la relecture ; les clés sont celles des
// catalogues (clans.js, roads.js, traits.js, disciplines.js, roads.js).
//   hook : une ligne affichée sur la carte ; text : la présentation complète.
// ─────────────────────────────────────────────────────────────────────────────

// ── Clans et lignées ─────────────────────────────────────────────────────────

export const CLAN_TEXT = {
    assamites: {
        hook: 'Juges, sorciers et assassins d’Alamut.',
        text: 'Les Enfants de Haqim veillent depuis leur forteresse d’Alamut sur le Moyen-Orient. Ils se disent juges des Caïnites et prélèvent le sang de leurs aînés comme un dû. Trois castes : les Vizirs, savants et artisans ; les Sorciers, gardiens d’une magie du sang ancienne ; les Guerriers, dont les contrats font trembler les princes d’Europe. Les croisades les mettent face aux Francs.',
    },
    brujah: {
        hook: 'Rois-philosophes devenus zélotes.',
        text: 'Héritiers de Carthage, rêveurs d’une cité idéale où Caïnites et mortels vivraient ensemble, les Brujah sont devenus des agitateurs passionnés. Penseurs, poètes, chefs de révolte : leur sang bouillonne, et la colère les emporte plus vite que les autres. On les dit braillards ; eux se savent les derniers à croire encore à quelque chose.',
    },
    cappadocians: {
        hook: 'Moines de la mort, chercheurs de Dieu.',
        text: 'Les Cappadociens étudient la mort pour comprendre le dessein de Dieu et la nature de l’âme. Savants, ermites ou pilleurs de tombes, ils ressemblent à des cadavres et se réunissent tous les dix ans en Cappadoce. Leur sang porte la Nécromancie, et leurs cousins Giovani, marchands vénitiens, les regardent avec trop d’appétit.',
    },
    gangrel: {
        hook: 'Bêtes des terres sauvages.',
        text: 'Les Gangrel vivent loin des villes, dans les forêts, les steppes et les landes. Chasseurs et voyageurs, ils prennent la forme des loups et des chauves-souris, et chaque frénésie laisse sur eux une marque animale. Peu soucieux des intrigues des cités, ils servent souvent d’éclaireurs, de messagers ou de mercenaires aux princes.',
    },
    lasombra: {
        hook: 'Princes de l’ombre et de l’Église.',
        text: 'Aristocrates d’Espagne, d’Italie et des rives de la Méditerranée, les Lasombra tirent les fils de l’Église et des cours. Ils commandent aux ténèbres elles-mêmes et ne se reflètent dans aucun miroir. Leur foi est souvent réelle : ils se voient comme les bergers sévères d’un troupeau que Dieu leur aurait confié.',
    },
    malkavians: {
        hook: 'Voyants et fous, oracles de la nuit.',
        text: 'Chaque Malkavien porte une folie que rien ne guérit, mais aussi des éclairs de vérité que les autres n’entrevoient pas. Prophètes, saints errants, conseillers inquiétants, ils lisent ce qui se cache derrière les visages et brisent les esprits par la Démence. Les princes les écoutent en tremblant, et rarement assez.',
    },
    nosferatu: {
        hook: 'Monstres difformes, maîtres des secrets.',
        text: 'L’Étreinte déforme le corps des Nosferatu : nul ne peut regarder longtemps leur visage, et leur Apparence est nulle. Cachés dans les égouts, les cimetières et les monastères, ils voient tout sans être vus. Beaucoup cherchent la rédemption dans la prière ; tous vendent cher ce qu’ils ont appris dans l’ombre.',
    },
    ravnos: {
        hook: 'Vagabonds venus d’Inde, maîtres de l’illusion.',
        text: 'Venus d’Inde, les Ravnos voyagent de pays en pays, organisés en jati qui fixent le devoir de chacun. Les Occidentaux les prennent pour des charlatans : leurs illusions trompent les sens, et chacun est poussé par un vice qu’il ne peut refuser. Leur code, la Route du Paradoxe, reste incompréhensible aux étrangers.',
    },
    followers_of_set: {
        hook: 'Serpents d’Égypte, prêtres d’un dieu des ténèbres.',
        text: 'Les Disciples de Set vénèrent leur fondateur comme un dieu et préparent son retour. Venus d’Égypte, ils s’installent dans les ports et les marchés où ils offrent à chacun ce qu’il désire, contre un peu de son âme. La lumière les brûle plus que tout autre Caïnite, et leur foi les rend patients.',
    },
    toreador: {
        hook: 'Esthètes et artisans, amants de la beauté.',
        text: 'Les Toreador cherchent dans la beauté une raison d’exister encore. Poètes, bâtisseurs, troubadours, courtisans des cours d’amour, ils font et défont les modes des Caïnites. Leur faiblesse les fige devant ce qui les émeut. Les plus sombres traquent la beauté comme une proie.',
    },
    tremere: {
        hook: 'Mages devenus vampires, usurpateurs.',
        text: 'Mages humains qui ont volé l’immortalité en 1022, les Trémères ont diablerisé l’Antédiluvien Saulot et se sont imposés comme clan. Tout le monde les hait ou les craint. Ils s’organisent en chantries hiérarchiques, sous le Conseil des Sept, et leur Thaumaturgie fait d’eux les rivaux les plus inquiétants des Tzimisce.',
    },
    tzimisce: {
        hook: 'Seigneurs-démons de l’Est, sculpteurs de chair.',
        text: 'Voïvodes de Transylvanie et des terres de l’Est, les Tzimisce règnent sur leurs domaines en seigneurs absolus. Hôtes d’une courtoisie parfaite, ils sculptent pourtant la chair et l’os de leurs serviteurs par la Vicissitude. Ils doivent dormir sur la terre de leur patrie, et leur guerre contre les Trémères embrase l’Est.',
    },
    ventrue: {
        hook: 'Seigneurs nés, gardiens de l’ordre féodal.',
        text: 'Les Ventrue se voient comme les rois légitimes des Caïnites. Seigneurs, prélats et marchands, ils tiennent les fiefs, les guildes et les serments, et défendent l’ordre féodal qui le leur rend bien. Leur sang est difficile : chacun ne peut se nourrir que d’un seul type de mortels.',
    },
    salubri: {
        hook: 'Guérisseurs et guerriers marqués d’un troisième œil.',
        text: 'Les Salubri portent un troisième œil au front, et la calomnie des Trémères les fait passer pour des démons voleurs d’âmes. Les Guérisseurs soignent les corps et cherchent la Golconde ; les Guerriers traquent le mal par le fer et le feu. Pourchassés depuis la mort de Saulot, ils vivent cachés.',
    },
    caitiff: {
        hook: 'Sans clan, rejetés par tous.',
        text: 'Les Caïtifs ne portent la marque d’aucun clan : sang trop dilué, sire inconnu, Étreinte sauvage. Ils n’ont pas de faiblesse de clan, mais personne ne les protège ni ne les respecte. Leurs Disciplines se choisissent avec l’accord du Conteur, et aucun Statut ne leur est reconnu à la création.',
    },
    // Lignées
    ahrimanes: {
        hook: 'Sœurs guerrières et chamanes, nées des Gangrel.',
        text: 'Lignée de femmes issue des Gangrel, les Ahrimanes, ou Valkyrjer, parlent aux esprits et protègent les terres sauvages. Leur sang les lie au monde invisible par le Spiritus.',
    },
    anda: {
        hook: 'Gangrel des steppes, cavaliers des Mongols.',
        text: 'Les Anda suivent les hordes mongoles à travers les steppes. Fiers de leur lignage et de la Route du Yasa, ils méprisent la vie des cités et ne vivent que pour la famille et la conquête.',
    },
    baali: {
        hook: 'Infernalistes cachés, adorateurs des démons.',
        text: 'Les Baali vénèrent des puissances infernales et se cachent parmi les autres clans. Ils manient le Daimonion. Leur présence en jeu est une décision lourde, à discuter avec le Conteur.',
    },
    bonsam: {
        hook: 'Traqueurs invisibles des forêts d’Afrique.',
        text: 'Laibon des forêts équatoriales, les Bonsam traquent leurs proies sans être vus. Leur Abombwe, Discipline des ténèbres africaines, les rend redoutables.',
    },
    danava: {
        hook: 'Enfants de Danu, seigneurs d’Inde.',
        text: 'Lignée ancienne d’Inde, les Danava règnent par la Domination et la Thaumaturgie. Les Occidentaux les croient issus des Ventrue, ce qu’eux contestent.',
    },
    children_of_osiris: {
        hook: 'Pénitents qui servent la lumière d’Osiris.',
        text: 'Secte venue d’Égypte, les Enfants d’Osiris cherchent à se racheter en servant les mortels dans des temples communautaires. Chacun garde deux Disciplines et la faiblesse de son clan d’origine, plus le Bardo.',
    },
    gargoyles: {
        hook: 'Créatures des Trémères (non jouables).',
        text: 'Les Gargouilles ont été façonnées par les Trémères comme serviteurs et soldats. Elles ne sont pas jouables.',
    },
    giovani: {
        hook: 'Marchands vénitiens, nécromanciens en famille.',
        text: 'Famille de marchands vénitiens étreinte par Cappadocius, les Giovani mêlent commerce, Nécromancie et ambitions familiales. Ils sont jeunes, peu nombreux et déjà inquiétants.',
    },
    impundulu: {
        hook: 'Sorciers liges du sud de l’Afrique.',
        text: 'Laibon du sud-est de l’Afrique, les Impundulu sont des nécromanciens qui commandent aux esprits et séduisent les vivants par la Présence.',
    },
    kiasyd: {
        hook: 'Êtres étranges au sang de fée.',
        text: 'Grands, pâles, aux yeux noirs, les Kiasyd portent du sang de fée. Érudits reclus, ils gardent deux Disciplines et la faiblesse de leur clan d’origine, plus la Mytherceria. Le fer froid les blesse.',
    },
    lamiae: {
        hook: 'Gorgones gardiennes, prêtresses de Lilith.',
        text: 'Issues des Cappadociens, les Lamiae sont des guerrières et prêtresses de la Route de Lilith. Leur sang porte une maladie qui ronge les mortels qu’elles mordent.',
    },
    lhiannan: {
        hook: 'Sorcières des collines, fidèles à la Vieille.',
        text: 'Les Lhiannan vivent dans les collines des terres celtiques, près des anciens cercles de pierre. Gardiennes des vieux cultes, elles pratiquent l’Ogham et se nourrissent de leurs fidèles.',
    },
    nagaraja: {
        hook: 'Mangeurs de chair, nécromanciens de l’Himalaya.',
        text: 'Créés par des sorciers himalayens, les Nagaraja doivent manger de la chair en plus du sang. Nécromanciens, ils fréquentent les routes de la soie et le monde des morts.',
    },
    niktuku: {
        hook: 'Les Affamés, sorcières de Baba Yaga.',
        text: 'Lignée obscure liée aux Nosferatu et aux contes de Baba Yaga, les Niktuku sont rongés par une faim perpétuelle et une beauté qui se fane avec les siècles.',
    },
    ramanga: {
        hook: 'Marionnettistes de Madagascar.',
        text: 'Laibon de l’océan Indien, les Ramanga manipulent les mortels comme des marionnettes, dans l’ombre de l’Obténébration.',
    },
    true_brujah: {
        hook: 'Érudits froids, maîtres du temps.',
        text: 'Les Vrais Brujah se disent les héritiers légitimes de Brujah, trahi par son infant Troile. Froids, détachés, ils maîtrisent le Temporis et méprisent la passion de leurs cousins.',
    },
};

// ── Routes et Voies ──────────────────────────────────────────────────────────

export const ROAD_TEXT = {
    road_of_the_beast: {
        hook: 'La Bête est une alliée : survivre avant tout.',
        text: 'Les Apostats acceptent la Bête au lieu de la combattre. Survivre est le but, la civilisation affaiblit, et ce que l’on prend on le garde. On vit à côté des mortels, jamais parmi eux. Prisée des Gangrel et de nombreux solitaires.',
    },
    road_of_heaven: {
        hook: 'Le vampire, instrument d’un plan divin.',
        text: 'Pour les adeptes de la Route du Ciel, l’Étreinte est un appel : Dieu (ou les dieux) a un dessein pour les damnés. On enchaîne la Bête par la loi divine et la prière. La Route ne se suit qu’à travers une Voie : celle du Christ, du Prophète, la Derech Chaim, la Roue ou les Dieux vigilants.',
    },
    road_of_humanity: {
        hook: 'Rester humain pour sauver son âme.',
        text: 'La Route de l’Humanité tient que la compassion et la raison séparent le vampire de la Bête. Nous avons tous été humains ; violer les limites d’autrui ronge l’âme. C’est la Route la plus répandue chez les jeunes Caïnites, encore proches de leur vie mortelle.',
    },
    road_of_kings: {
        hook: 'Se maîtriser pour régner sur les autres.',
        text: 'Les Rois voient le monde comme une hiérarchie de maîtres et de serviteurs. La parole donnée est sacrée, le pouvoir se prend et se garde, mais on ne le mérite qu’en se gouvernant soi-même. Route des seigneurs, des chevaliers et des Ventrue.',
    },
    road_of_lilith: {
        hook: 'La souffrance enseigne et la création est sacrée.',
        text: 'Les adeptes de Lilith tiennent Caïn pour un menteur et la première femme d’Adam pour la vraie mère des vampires. Ils créent avec audace, enseignent par la douleur et vénèrent la souffrance comme un chemin vers la sagesse. Route secrète et persécutée.',
    },
    road_of_metamorphosis: {
        hook: 'Dépasser la condition vampirique.',
        text: 'Les Métamorphes cherchent à transcender leur nature par l’expérience, surtout sur leur propre corps. Ils satisfont et nient la Bête pour la comprendre. Route presque exclusivement tzimisce.',
    },
    road_of_sin: {
        hook: 'Déjà damné, rien n’est interdit.',
        text: 'Les Pécheurs embrassent leur damnation : la Bête leur appartient, et ni loi humaine ni loi divine ne les retiennent. Ce n’est pas la sauvagerie : c’est la liberté de tout oser, sans hésitation ni remords.',
    },
    road_of_bones: {
        hook: 'Comprendre la mort, sans passion.',
        text: 'Route mineure, surtout cappadocienne. On étudie la vie, la mort et la non-mort avec un détachement de savant, sans être esclave de ses passions, et on protège le savoir de ceux qui le détruiraient.',
    },
    road_of_yasa: {
        hook: 'La loi du clan et de la famille.',
        text: 'Route mineure née des Mongols, suivie par les Anda. On honore sa famille, choisie plus encore que de sang, on exige le respect et on le rend à qui le mérite.',
    },
    road_of_blood: {
        hook: 'Le sang de Caïn se mérite (Assamites).',
        text: 'Route de clan des Assamites : le sang de Caïn est un don qui se mérite, par la pureté, l’honneur et la discipline. Céder à la Bête est une faiblesse indigne.',
    },
    road_of_the_abyss: {
        hook: 'Les ténèbres sont une vérité (Lasombra).',
        text: 'Route de clan des mystiques lasombra : l’Abîme, les ténèbres d’où naît l’Obténébration, est la seule vérité. On le contemple pour s’y dissoudre.',
    },
    road_of_paradox: {
        hook: 'Chacun son devoir, le svadharma (Ravnos).',
        text: 'Route de clan des Ravnos : chacun a un svadharma, un devoir assigné par la roue des renaissances. On suit le sien, on aide les autres à suivre le leur, et on renvoie au samsara ceux qui le refusent.',
    },
    road_of_set: {
        hook: 'Le chemin de Set (Disciples de Set).',
        text: 'Route de clan des Disciples de Set : servir le dieu, éveiller les autres à leurs désirs et préparer son retour.',
    },
    code_of_samiel: {
        hook: 'Saigner pour que d’autres ne saignent pas (Salubri Guerriers).',
        text: 'Code des Salubri Guerriers : le mal se purifie par le fer et le feu avant que les Guérisseurs pansent la plaie. On protège ceux que le mal frappe, au prix de son propre sang.',
    },
};

/** Voies : une phrase chacune (§11 ; l’éthique de la Route parente s’applique) */
export const PATH_TEXT = {
    hunter: 'Tout ce qui n’est pas la chasse est une distraction ; la faim est la faute du mauvais chasseur.',
    journeys: 'La stagnation est pire que la mort : on part dès qu’un lieu devient familier.',
    liberation: 'Libérer les esprits, ceux des mortels comme des Caïnites, comme au temps de Nod.',
    christ: 'Christianisme : servir Dieu par la foi et la pénitence, malgré la damnation.',
    derech_chaim: 'Judaïsme : la Loi et la vie sont sacrées ; on la respecte même mort.',
    prophet: 'Islam : la soumission à Dieu et l’enseignement du Prophète.',
    eight_spoked_wheel: 'Paganisme druidique et chamanique : la roue des saisons et les esprits du monde.',
    watchful_gods: 'Anciennes religions grecque et romaine : honorer les dieux qui regardent encore.',
    breath: 'Rester parmi les mortels plutôt qu’avec les Caïnites ; l’isolement livre à la Bête.',
    community: 'Les besoins du groupe valent les siens ; protéger le peuple sans qu’il le sache.',
    illumination: 'La sainteté qui reste en soi peut équilibrer la Bête.',
    chivalry: 'L’honneur et le devoir avant tout ; protéger ses inférieurs, punir l’injustice.',
    devaraja: 'Agir comme un dieu : châtier ses ennemis, secourir ses fidèles (Inde, Malaisie).',
    daena: 'Zoroastrisme : la loi est suprême, et le bien rendu au décuple.',
    thorns: 'La création repose sur l’étude ; les élèves viendront d’eux-mêmes, brisés.',
    veils: 'Punir les enfants de Caïn et détruire le mensonge, sans se faire prendre.',
    creation: 'Trouver et protéger les descendants de Lilith ; créer sans distinguer l’horrible du divin.',
    pleasure: 'Apaiser la Bête par le plaisir ; la honte est un blasphème.',
    devil: 'Le libre arbitre est l’arme suprême ; toute chaîne est un défi.',
    screams: 'Servir l’Enfer (Baali, infernalistes). À valider avec le Conteur.',
    apep: 'Variante des Disciples de Set tournée vers le serpent du chaos.',
};

// ── Attributs, Capacités ─────────────────────────────────────────────────────

export const ATTRIBUTE_SCALE = ['Faible', 'Moyen', 'Bon', 'Exceptionnel', 'Remarquable'];
export const ABILITY_SCALE = ['Novice', 'Pratiquant', 'Compétent', 'Expert', 'Maître'];

export const ATTRIBUTE_GROUP_TEXT = {
    physical: 'Ce que le corps sait faire : frapper, esquiver, encaisser. Les combattants en ont besoin.',
    social: 'L’effet produit sur les autres : séduire, manipuler, impressionner. Essentiel à la cour.',
    mental: 'L’esprit : remarquer, comprendre, réagir vite. Utile à tous, indispensable aux érudits.',
};

export const ATTRIBUTE_TEXT = {
    strength: 'Force brute : frapper, soulever, briser. S’ajoute aux dégâts au corps à corps.',
    dexterity: 'Adresse et réflexes : esquiver, viser, se faufiler, manier une arme.',
    stamina: 'Endurance et résistance : encaisser les coups (absorption), tenir la distance.',
    charisma: 'Le charme naturel : inspirer, convaincre sincèrement, être suivi.',
    manipulation: 'L’art d’amener les autres à faire ce que l’on veut, par la ruse ou le mensonge.',
    appearance: 'Beauté et présence physique : la première impression. Nulle chez les Nosferatu.',
    perception: 'Remarquer ce qui se cache : un détail, un mensonge, une embuscade.',
    intelligence: 'Comprendre, raisonner, apprendre et retenir.',
    wits: 'La vivacité : réagir vite, improviser, trouver la réplique. Sert à l’initiative.',
};

export const ABILITY_GROUP_TEXT = {
    talent: 'Talents : ce que l’on sait d’instinct. À 0, on peut quand même tenter sa chance sans pénalité.',
    skill: 'Compétences : ce qui s’apprend par la pratique. À 0, la difficulté augmente de 1.',
    knowledge: 'Connaissances : ce qui s’apprend dans les livres ou auprès d’un maître. À 0, le jet est impossible.',
};

/** text : à quoi sert la Capacité ; specialties : spécialités suggérées (annexe divers §2) */
export const ABILITY_TEXT = {
    alertness: { text: 'Rester sur ses gardes, entendre le pas dans le couloir, sentir l’embuscade.', specialties: 'Embuscades, foules, forêts, bruits, pièges' },
    athletics: { text: 'Courir, sauter, grimper, nager, lancer.', specialties: 'Escalade, course, natation, lancer, acrobaties' },
    awareness: { text: 'Sentir le surnaturel : la magie, un fantôme, une présence divine ou démoniaque.', specialties: 'Magie, fantômes, manifestations angéliques ou démoniaques' },
    brawl: { text: 'Se battre à mains nues : coups, morsure, lutte.', specialties: 'Lutte, pugilat, projections, clés de bras' },
    empathy: { text: 'Comprendre ce que ressentent les autres, deviner leurs motifs.', specialties: 'Émotions cachées, personnalités, vérités' },
    expression: { text: 'Bien parler et bien écrire : poésie, prêche, conte, conversation.', specialties: 'Poésie, prêche, conte, improvisation' },
    subterfuge: { text: 'Mentir, séduire, cacher ses intentions, débusquer les failles des autres.', specialties: 'Flatterie, boniment, séduction, omissions' },
    intimidation: { text: 'Faire plier par la peur, la menace ou le rang.', specialties: 'Menaces voilées, regards, chantage, rang' },
    legerdemain: { text: 'Tours de main : vol à la tire, dissimulation, passe-passe.', specialties: 'Vol à la tire, dissimulation, jonglerie' },
    leadership: { text: 'Se faire obéir et suivre, au combat comme à la cour.', specialties: 'Ordres, art oratoire, sévère, pieux' },
    animal_ken: { text: 'Comprendre, dresser et calmer les animaux, qui craignent d’instinct les vampires.', specialties: 'Dressage, chevaux, chiens, rapaces' },
    archery: { text: 'Tirer à l’arc ou à l’arbalète.', specialties: 'Arc long, arbalète, tir à cheval' },
    etiquette: { text: 'Connaître les usages : cour, Église, coutumes étrangères, héraldique.', specialties: 'Manières de cour, héraldique, coutumes religieuses' },
    melee: { text: 'Se battre avec une arme : épée, hache, dague, bâton.', specialties: 'Épées, haches, couteaux, désarmer' },
    ride: { text: 'Monter à cheval, voyager, combattre en selle.', specialties: 'Saut, chasse, vitesse, combat monté' },
    stealth: { text: 'Se cacher, se déplacer sans bruit, suivre quelqu’un.', specialties: 'Rôder, foules, nature' },
    survival: { text: 'Vivre hors des villes : s’abriter, pister, trouver son chemin.', specialties: 'Pistage, forêts, déserts, en mer' },
    commerce: { text: 'Acheter, vendre, estimer, connaître les routes marchandes. Domaine d’expertise obligatoire.', specialties: 'Négociation, estimation, routes commerciales' },
    crafts: { text: 'Fabriquer de ses mains. Domaine d’expertise obligatoire (forge, couture, maçonnerie…).', specialties: 'Commandes, rapidité, innovation' },
    performance: { text: 'Se produire en public : chant, théâtre, musique, danse. Domaine d’expertise obligatoire.', specialties: 'Chansons de cour, de taverne, sentir le public' },
    academics: { text: 'Le savoir des lettrés : arts libéraux, philosophie, sciences. Domaine d’expertise obligatoire.', specialties: 'Enseignement, recherche, ésotérisme' },
    enigmas: { text: 'Résoudre les énigmes, déchiffrer les prophéties, les codes et les mystères.', specialties: 'Prophéties, cryptographie, reliques, devinettes' },
    investigation: { text: 'Enquêter, interroger, recouper les indices.', specialties: 'Interrogatoire, confessions, pistage' },
    law: { text: 'Connaître les lois : canonique, royale, coutumière, et les Traditions caïnites.', specialties: 'Contrats, plaidoiries, successions' },
    linguistics: { text: 'Langues étrangères et écritures : 1 langue par point.', specialties: 'Famille de langues, dialectes, écritures anciennes' },
    occult: { text: 'Le savoir caché : magie, fées, sorcières, vampires, démons.', specialties: 'Vampires, fées, divination, invocations' },
    theology: { text: 'La doctrine religieuse, l’orthodoxie et les hérésies.', specialties: 'Orthodoxie, hérésie, confession, conversion' },
    politics: { text: 'Le jeu du pouvoir : féodal, urbain, ecclésiastique, caïnite.', specialties: 'Diplomatie, corruption, cour' },
    medicine: { text: 'Soigner les mortels, connaître le corps, les poisons et les remèdes.', specialties: 'Premiers soins, chirurgie, accouchement' },
    seneschal: { text: 'Administrer un domaine, un fief ou un monastère.', specialties: 'Féodale, urbaine, agricole, ordres religieux' },
    body_crafts: { text: 'Tzimisce : sculpter la chair et l’os par la Vicissitude avec art.', specialties: 'Visages, armes d’os, œuvres de chair' },
};

// ── Historiques (annexe divers §3) ───────────────────────────────────────────

export const BACKGROUND_TEXT = {
    allies: { text: 'Mortels qui l’aident de leur plein gré et peuvent demander des faveurs en retour.', scale: ['Un allié d’influence moyenne', 'Deux alliés', 'Trois alliés, dont un influent', 'Quatre, dont un très influent', 'Cinq, dont un extrêmement influent'] },
    alternate_identity: { text: 'Une seconde identité complète, avec documents et réputation.', scale: ['Novice, se trahit parfois', 'Peut jouer un médecin, prêtre, noble', 'Réputation dans la région', 'Respect et confiance', 'Commande le respect, un peu d’influence'] },
    contacts: { text: 'Informateurs que l’on manipule ou que l’on paie.', scale: ['Un contact majeur', 'Deux', 'Trois', 'Quatre', 'Cinq'] },
    domain: { text: 'Territoire de chasse reconnu par les Caïnites. Chaque point facilite la chasse et s’ajoute à la réserve de sang de départ.', scale: ['Une petite maison', 'Une église, un manoir', 'Un quartier', 'Des catacombes, une enclave', 'Un quartier entier, un village'] },
    fame: { text: 'Célébrité parmi les mortels. Facilite la chasse et certains jets sociaux, mais attire les regards.', scale: ['Connu d’un milieu', 'Petite célébrité locale', 'Renom', 'Célébrité', 'Nom connu de tous'] },
    generation: { text: 'La pureté du sang : chaque point rapproche de Caïn (12ᵉ Génération au départ). Plus de sang, des traits plus élevés possibles.', scale: ['11ᵉ Génération', '10ᵉ', '9ᵉ', '8ᵉ', '7ᵉ'] },
    herd: { text: 'Des mortels dont on se nourrit sans risque. S’ajoute à la réserve de sang de départ.', scale: ['3 vaisseaux', '7', '15', '30', '60'] },
    influence: { text: 'Poids politique parmi les mortels : conseils, cours, Église, guildes.', scale: ['Politique locale', 'Bien introduit', 'Régional', 'Grande échelle', 'Le monde connu'] },
    mentor: { text: 'Un Caïnite qui guide de loin. Indispensable pour apprendre une Discipline hors clan.', scale: ['Ancilla sans influence', 'Aîné respecté', 'Conseiller du Prince', 'Sénéchal, shérif', 'Prince'] },
    resources: { text: 'Biens et revenus, sous forme d’une allocation mensuelle.', scale: ['Suffisant', 'Aisé (marchand)', 'Confortable (terres, maison)', 'Riche', 'Très riche'] },
    retainers: { text: 'Serviteurs, goules ou animaux, jamais parfaitement loyaux.', scale: ['Un serviteur', 'Deux', 'Trois', 'Quatre', 'Cinq'] },
    status: { text: 'Le rang dans la société caïnite locale. Interdit aux Caïtifs à la création.', scale: ['Jeune reconnu', 'Ancilla respecté', 'Aîné influent', 'Aîné puissant', 'Prince ou dirigeant'] },
};

// ── Disciplines ──────────────────────────────────────────────────────────────

export const DISCIPLINE_TEXT = {
    abombwe: 'Ténèbres africaines (Laibon) : se fondre dans l’ombre, la manipuler.',
    animalism: 'Parler aux bêtes, les appeler, les commander, et dompter la Bête en soi ou chez les autres.',
    auspex: 'Sens surnaturels : voir l’aura, lire les pensées, projeter son esprit hors du corps.',
    bardo: 'Enfants d’Osiris : repousser la Bête et les morts-vivants par la foi et la parole.',
    celerity: 'Vitesse surnaturelle. Chaque point ajoute un dé aux jets de Dextérité (initiative comprise) ; 1 sang permet d’agir plusieurs fois sans pénalité ou de courir bien plus vite.',
    chimerstry: 'Illusions : tromper les sens, faire voir et entendre ce qui n’existe pas.',
    daimonion: 'Pouvoirs infernaux : lire le péché, maudire, appeler les flammes de l’Enfer.',
    dementation: 'Semer la folie : troubler les sens, les passions et l’esprit.',
    dominate: 'Imposer sa volonté par le regard : commander, effacer des souvenirs, posséder.',
    flight: 'Gargouilles : voler sur leurs ailes de pierre.',
    fortitude: 'Résistance surnaturelle. Chaque point ajoute un dé aux jets de Vigueur (absorption comprise) et permet d’absorber les dégâts aggravés.',
    mytherceria: 'Kiasyd : magie féerique, voler les secrets, poser des pièges.',
    obfuscate: 'Ne pas être vu : disparaître du regard, prendre un autre visage.',
    obtenebration: 'Commander aux ténèbres : ombres, tentacules, nuit surnaturelle.',
    potence: 'Force surnaturelle. Chaque point ajoute un dé aux jets de Force ; 1 sang les change en succès automatiques.',
    presence: 'Fasciner, attirer, terrifier : agir sur les émotions d’une foule ou d’une personne.',
    protean: 'Changer de forme : griffes, fusion dans la terre, loup, chauve-souris, brume.',
    quietus: 'Assamites : l’art de tuer, le silence, le sang empoisonné.',
    serpentis: 'Disciples de Set : regard hypnotique, langue de serpent, cœur arraché.',
    spiritus: 'Parler aux esprits de la nature et les lier.',
    temporis: 'Vrais Brujah : ralentir, figer ou accélérer le temps.',
    valeren: 'Salubri : soigner (Guérisseurs) ou combattre (Guerriers) grâce au troisième œil.',
    vicissitude: 'Tzimisce : sculpter la chair et l’os, les siens comme ceux des autres.',
    thaumaturgy: 'La magie du sang des Trémères : une voie principale et des rituels.',
    assamite_sorcery: 'La magie du sang des Sorciers assamites, ancienne et secrète.',
    setite_sorcery: 'La magie du sang des Disciples de Set, liée au culte du dieu.',
    necromancy: 'Commander aux morts : fantômes, cadavres, passage vers l’au-delà.',
    koldunism: 'Magie des éléments des Tzimisce koldun : la terre, l’eau, le feu, le vent. Jamais de clan.',
    ogham: 'Magie celtique des Lhiannan, gravée en signes et liée aux lieux sacrés.',
};

// ── Vertus ───────────────────────────────────────────────────────────────────

/** Disciplines physiques sur la fiche : bonus permanent et activation (§13.2) */
export const PHYSICAL_DISCIPLINE_TEXT = {
    celerity:  'Bonus permanent aux jets de Dextérité. Activée (1 S) : actions multiples sans pénalité jusqu’à sa valeur, ou vitesse × (1 + Célérité).',
    fortitude: 'Bonus permanent aux jets de Vigueur, absorbe l’aggravé. Activée (1 S, au jet) : ses dés deviennent des succès automatiques d’absorption (sauf feu et soleil).',
    potence:   'Bonus permanent aux jets de Force. Activée (1 S, au jet) : ses dés deviennent des succès automatiques pour le tour.',
};

export const VIRTUE_TEXT = {
    conscience: 'Le sens du bien et du mal. Sert à éviter la chute quand on commet un péché.',
    conviction: 'La force de ses principes, même terribles. Remplace la Conscience sur certaines Routes.',
    self_control: 'La maîtrise de la Bête : résister à la faim et à la colère (frénésie).',
    instinct: 'Chevaucher la Bête plutôt que la retenir : guider la frénésie au lieu de l’empêcher.',
    courage: 'Affronter le feu, le soleil et la terreur (Rötschreck). Fixe la Volonté de départ.',
};

// ── Archétypes : regain de Volonté de la Nature (annexe divers §1) ──────────

export const ARCHETYPE_REGAIN = {
    Architecte: 'Fonder quelque chose d’important ou de durable.',
    Autocrate: 'Exercer son contrôle sur un groupe ou une organisation.',
    'Bon vivant': 'Vraiment prendre du plaisir.',
    Bravache: 'Obtenir ce qu’on veut par la brutalité ou l’intimidation.',
    Protecteur: 'Protéger ou soigner quelqu’un avec succès.',
    Fervent: 'Servir sa cause ou y convertir quelqu’un.',
    Caméléon: 'Duper quelqu’un en se faisant passer pour un autre.',
    Enfant: 'Convaincre quelqu’un de l’aider sans contrepartie.',
    Compétiteur: 'Triompher dans une situation dramatique.',
    Conformiste: 'Le groupe ou le chef soutenu atteint un but grâce à lui.',
    Intrigant: 'Manipuler quelqu’un pour qu’il agisse contre son intérêt.',
    Épouvantail: 'Quelqu’un recule d’horreur ou de peur devant lui.',
    Grincheux: 'Quelqu’un échoue exactement comme il l’avait prédit.',
    Dilettante: 'Trouver un nouvel engouement et abandonner l’ancien.',
    Défenseur: 'Défendre sa cause avec succès.',
    Déviant: 'Bafouer les conventions sans en subir les conséquences.',
    Énigme: 'Une action incompréhensible se révèle fructueuse.',
    'Œil du cyclone': 'Un tumulte ou un chaos éclate autour de lui.',
    Fanatique: 'Accomplir quelque chose qui sert directement sa cause.',
    Galant: 'Impressionner quelqu’un.',
    Gourou: 'Ses conseils poussent quelqu’un à un acte éclairé.',
    Idéaliste: 'Une action rapproche son idéal de sa réalisation.',
    Bouffon: 'Remonter le moral de malheureux, ou ridiculiser un tyran.',
    Juge: 'Résoudre un problème par les preuves, ou réconcilier des adversaires.',
    Solitaire: 'Accomplir seul quelque chose qui profite à la coterie.',
    Martyr: 'Subir une perte pour ses idéaux ou pour autrui.',
    Masochiste: 'Sa souffrance lui rapporte un gain concret.',
    Mercenaire: 'Réussir une vente, quelle qu’elle soit.',
    Monstre: 'Commettre une atrocité précise (regain limité par le Conteur).',
    Pédagogue: 'Voir quelqu’un profiter de la sagesse partagée.',
    Pénitent: 'Obtenir l’absolution d’un péché.',
    Perfectionniste: 'Son exemple pousse quelqu’un à réussir.',
    Philosophe: 'Une approche logique résout un problème.',
    Rebelle: 'Ses actions nuisent à l’opposition qu’il s’est choisie.',
    Canaille: 'Son égoïsme lui rapporte un profit.',
    Sadique: 'Infliger de la douleur pour son seul plaisir.',
    Soldat: 'Atteindre l’objectif de ses ordres.',
    Survivant: 'Survivre à une menace par pure ténacité.',
    'Casse-cou': 'Réussir une tâche dangereuse entreprise délibérément.',
    Traditionaliste: 'La méthode éprouvée s’avère la meilleure.',
    Tyran: 'Guider un groupe dans une tâche difficile.',
    Visionnaire: 'Convaincre d’autres de croire en sa vision de l’avenir.',
};

// ── Aide par défaut de chaque onglet (quand rien n'est survolé) ──────────────

export const TAB_HELP = {
    lineage: { title: 'Lignée et Route', text: 'Le clan donne trois Disciplines et une faiblesse ; la Route est la morale qui retient la Bête et fixe les Vertus. Les lignées sont plus rares : à garder pour un concept précis, avec le Conteur.' },
    attributes: { title: 'Attributs', text: 'Classez les trois catégories : 7 points pour la principale, 5 pour la secondaire, 3 pour la dernière. Chaque Attribut a déjà 1 point gratuit, maximum 5.' },
    abilities: { title: 'Capacités', text: 'Classez Talents, Compétences et Connaissances : 13, 9 et 5 points. Aucune Capacité au-dessus de 3 à ce stade (les points bonus peuvent dépasser).' },
    advantages: { title: 'Avantages', text: '4 points de Disciplines (de clan, plus Célérité, Augure et Puissance), 5 points d’Historiques, 7 points de Vertus (1 gratuit dans chacune). La Route et la Volonté en découlent.' },
    finishing: { title: 'Finitions', text: '15 points bonus pour ajuster ce que vous voulez. Les Handicaps rapportent des points (7 au plus), les Atouts en coûtent. Le Conteur valide ensuite.' },
    identity: { title: 'Identité', text: 'Qui était-il avant la nuit ? La Nature dit comment il regagne de la Volonté ; l’Attitude est le masque qu’il montre.' },
    blood: { title: 'Sang et résumé', text: 'La réserve de départ se tire au dé (1d10 + Domaine + Troupeau). Vérifiez le récapitulatif avant de valider.' },
};
