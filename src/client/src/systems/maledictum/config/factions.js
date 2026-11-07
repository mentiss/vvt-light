// Factions du setup Inquisition (Imperium Maledictum).
// Sources : livre de base (CORE) p.56-73 (9 factions, dont « The Inquisition » p.66-67, présente pour jouer sans le Player's Guide),
// table d100 « Faction » p.55 relue sur le PDF ; Inquisition Player's Guide (IPG) p.50-55 (les trois
// Ordos Majoris) et table d100 p.46 relue sur le PDF.
// Données seules : clés anglaises stables, libellés français, labelEn = nom VO.
//
// benefits : bloc « <Faction> Benefits » du livre (+5 fixe, +5 parmi choice, 5 Avances parmi skills,
//            Influence, talents fixes ou talentChoice (une option = liste de talents pris ensemble),
//            Solars, équipement fixe et choix d'équipement : une liste = un objet à choisir).
// duties   : paquets de création rapide (« Duty »). Décision D-2 : la Fonction REMPLACE le bloc
//            Avantages ; chaque Fonction porte donc son paquet complet (part commune du livre + part
//            propre) : chars (les deux +5), advances (compétences ou 'competence.specialisation'),
//            influence, talents, solars, equipment, equipmentChoices.
// Influence : clés de faction ; les trois Ordos donnent `inquisition`.
//
// À relire :
// - FACTION_TABLE (CORE p.55) : les Ordos remplacent la ligne « The Inquisition ». Partage « à parts
//   égales » impossible sur des plages de 1 ou 2 valeurs : attribuées dans l'ordre Hereticus, Malleus,
//   Xenos (Monde agricole 66 / 67, féodal 80 / 81, sauvage 83 / 84, ruche 70 / 71, sanctuaire 72 / 73,
//   Né du vide 53 / 54 : pas d'Ordo Xenos ; Monde-forge 75 : Ordo Hereticus seul) ; Schola Progenium
//   68-87 : 68-74 / 75-81 / 82-87. L'Ordo Xenos n'est donc tirable que depuis la Schola.
//   Alternative du livre : INQUISITION_FACTION_TABLE (IPG p.46), une seule colonne, Ordos 51-100.
// - FACTION_TABLE : deux chevauchements dans le livre corrigés : Monde féodal, Infractionniste
//   « 86-99 » lu 86-98 (Libre-Marchand 99-00) ; Schola Progenium, Flotte impériale « 88-99 » lu 88-94
//   (Libre-Marchand 95-00, pas d'Infractionniste dans cette colonne).
// - D-3 appliquée : talents de Fonction inexistants remplacés (Stalwart → drilled pour l'Astra
//   Militarum, Fanaticism → faithful pour l'Adeptus Ministorum, Scrounger → well_prepared pour
//   l'Infractionniste).
// - D-4 appliquée : Fonctions hors des listes de leur faction prises telles qu'imprimées (Missionnaire :
//   F, Navigation, Mêlée ; Sœur novice : Distance ; Officier de la Navis : Soc et « Leadership (2) » lu
//   Présence (Commandement) 2, au-delà du plafond de création d'une Avance par spécialisation ;
//   Aventurier : CT, Athlétisme, Distance) ; « Navigation (10) » du Missionnaire lu 1.
// - Adeptus Astra Telepathica : l'Influence peut, à la discrétion du MJ, aller à une autre faction
//   pour refléter la fonction (influenceNote). Fonction Psyker sanctionné : Influence Astra Militarum.
// - Adeptus Mechanicus : les augmétiques des Fonctions (Bras bionique, mécadendrites…) ne figurent pas
//   parmi les choix des Avantages ; reprises telles qu'imprimées. « Augery Array » lu Réseau augural.
// - Infractionniste : Solars des Avantages « 5d10 » (chaîne, à lancer).
// - Ordo Hereticus : talent au choix « Cult Infiltrator », talent de l'IPG p.64 (clé cult_infiltrator,
//   homonyme de l'origine macharienne). L'intro des Fonctions Hereticus parle de « hunting daemonic
//   entities » (coquille copiée du Malleus), sans effet de règle.
// - Ordo Xenos, « Lore: Xenos » (Analyticus, Xénologue, Xénolinguiste) : pas de spécialisation Xenos
//   en Savoir ; rattaché à Savoir (Interdit) avec le sujet Xenos en specNote (règle D-11). Autre
//   lecture possible : Savoir (Ordos Majoris : Xenos).
// - Xénolinguiste : 2 Avances en Rapport (Xeno-Cant), au-delà du plafond de création d'une Avance par
//   spécialisation, prises telles qu'imprimées.
// - Libellés d'objets provisoires, à aligner sur equipment.js et equipmentInquisition.js.
// - Inquisition (CORE) : « Glow-globe » et « Auspex » rattachés aux entrées combinées du catalogue
//   (Globe lumineux / Lampe-torche, Auspex / Scanner) ; « Armoured Bodyglove » repris sous le libellé
//   du catalogue (Combinaison moulante blindée), alors que les Ordos écrivent « Combinaison blindée ».
// - Inquisition (CORE) : Exorciste et Sage reçoivent tous deux un Auspex, aucune Fonction ne reçoit
//   l'Enregistreur picto du choix des Avantages ; pris tels qu'imprimés.
// - Inquisition (CORE) : faction et Ordos (IPG) coexistent dans FACTIONS ; FACTION_TABLE et
//   INQUISITION_FACTION_TABLE ne tirent que les Ordos, la faction du livre se choisit seulement.

export const FACTIONS = [
    {
        key: 'adeptus_astra_telepathica', label: 'Adeptus Astra Telepathica', labelEn: 'Adeptus Astra Telepathica', source: 'core', page: 56,
        theme: 'telepathica',
        benefits: {
            fixed: { wil: 5 }, choice: ['int', 'per', 'tgh'],
            skills: ['awareness', 'discipline', 'intuition', 'linguistics', 'navigation', 'psychic_mastery'], advances: 5,
            influence: { adeptus_astra_telepathica: 1 },
            influenceNote: 'À la discrétion du MJ, +1 Influence avec une autre faction pour refléter votre fonction.',
            talents: [], talentChoice: [['psyker', 'sanctioned_psyker'], ['blank'], ['condemn_the_witch', 'mental_fortress']],
            solars: 500,
            equipment: ['Couteau (modification Monolame)', 'Robe', 'Instrument de divination'], equipmentChoices: [],
        },
        duties: [
            {
                key: 'black_ship_crewmember', label: 'Membre d\'équipage d\'un Vaisseau noir', labelEn: 'Black Ship Crewmember',
                chars: { wil: 5, tgh: 5 }, advances: { awareness: 1, discipline: 2, intuition: 2 }, influence: { adeptus_astra_telepathica: 1 },
                talents: ['condemn_the_witch', 'mental_fortress'], solars: 100,
                equipment: ['Couteau (modification Monolame)', 'Robe', 'Instrument de divination'], equipmentChoices: [], theme: null,
            },
            {
                key: 'sanctioned_psyker', label: 'Psyker sanctionné', labelEn: 'Sanctioned Psyker',
                chars: { wil: 5, per: 5 }, advances: { awareness: 1, discipline: 2, psychic_mastery: 2 }, influence: { astra_militarum: 1 },
                talents: ['psyker', 'sanctioned_psyker'], solars: 100,
                equipment: ['Couteau (modification Monolame)', 'Robe', 'Instrument de divination'], equipmentChoices: [], theme: null,
            },
            {
                key: 'sister_in_waiting', label: 'Sœur en attente', labelEn: 'Sister-in-Waiting',
                chars: { wil: 5, tgh: 5 }, advances: { awareness: 2, discipline: 2, navigation: 1 }, influence: { adeptus_astra_telepathica: 1 },
                talents: ['blank'], solars: 100,
                equipment: ['Couteau (modification Monolame)', 'Robe', 'Instrument de divination'], equipmentChoices: [], theme: null,
            },
        ],
        summary: 'Traque, formation et emploi des psykers de l\'Imperium (Ligue des Vaisseaux noirs, Scholastica Psykana) ; accueille aussi les rares Intouchables.',
    },
    {
        key: 'adeptus_mechanicus', label: 'Adeptus Mechanicus', labelEn: 'Adeptus Mechanicus', source: 'core', page: 58,
        theme: 'mechanicus',
        benefits: {
            fixed: { int: 5 }, choice: ['tgh', 'ag', 'per'],
            skills: ['dexterity', 'logic', 'lore', 'medicae', 'piloting', 'tech'], advances: 5,
            influence: { adeptus_mechanicus: 1 }, talents: [], talentChoice: null, solars: 100,
            equipment: ['Robe', 'Ardoise de données', 'Fiole d\'onguents sacrés'],
            equipmentChoices: [
                ['Implant vocal', 'Système respiratoire bionique', 'Organes sensoriels bioniques'],
                ['Réseau augural', 'Implant vocal', 'Système respiratoire augmétique', 'Organes sensoriels augmétiques'],
                ['Bras augmétique', 'Locomotion augmétique', 'Cœur augmétique'],
            ],
        },
        duties: [
            {
                key: 'apprentice_enginseer', label: 'Apprenti enginseer', labelEn: 'Apprentice Enginseer',
                chars: { int: 5, ag: 5 }, advances: { logic: 1, piloting: 2, tech: 2 }, influence: { adeptus_mechanicus: 1 },
                talents: [], solars: 50,
                equipment: ['Robe', 'Ardoise de données', 'Fiole d\'onguents sacrés', 'Système respiratoire bionique', 'Bras bionique', 'Mécadendrite utilitaire'],
                equipmentChoices: [], theme: null,
            },
            {
                key: 'apprentice_genetor', label: 'Apprenti génétor', labelEn: 'Apprentice Genetor',
                chars: { int: 5, tgh: 5 }, advances: { logic: 1, medicae: 2, tech: 2 }, influence: { adeptus_mechanicus: 1 },
                talents: [], solars: 50,
                equipment: ['Robe', 'Ardoise de données', 'Fiole d\'onguents sacrés', 'Organe sensoriel bionique (œil)', 'Cœur bionique', 'Mécadendrite médicae'],
                equipmentChoices: [], theme: null,
            },
            {
                key: 'apprentice_logis', label: 'Apprenti logis', labelEn: 'Apprentice Logis',
                chars: { int: 5, per: 5 }, advances: { logic: 2, lore: 1, tech: 2 }, influence: { adeptus_mechanicus: 1 },
                talents: [], solars: 50,
                equipment: ['Robe', 'Ardoise de données', 'Fiole d\'onguents sacrés', 'Organe sensoriel bionique (œil)', 'Locomotion bionique', 'Mécadendrite optique'],
                equipmentChoices: [], theme: null,
            },
        ],
        summary: 'Culte de Mars, adorateurs de l\'Omnimessie et gardiens de la technologie de l\'Imperium, maîtres des mondes-forges.',
    },
    {
        key: 'adeptus_administratum', label: 'Adeptus Administratum', labelEn: 'Adeptus Administratum', source: 'core', page: 60,
        theme: 'administratum',
        benefits: {
            fixed: { int: 5 }, choice: ['per', 'wil', 'fel'],
            skills: ['dexterity', 'linguistics', 'logic', 'lore', 'medicae', 'navigation'], advances: 5,
            influence: { adeptus_administratum: 1 }, talents: ['data_delver'], talentChoice: null, solars: 700,
            equipment: ['Robe', 'Ardoise de données', 'Nécessaire d\'écriture'],
            equipmentChoices: [['Plume automatique', 'Instruments de chirurgien', 'Enregistreur picto', 'Vox-caster']],
        },
        duties: [
            {
                key: 'clerk', label: 'Commis', labelEn: 'Clerk',
                chars: { int: 5, fel: 5 }, advances: { dexterity: 1, linguistics: 1, lore: 2, navigation: 1 }, influence: { adeptus_administratum: 1 },
                talents: ['data_delver'], solars: 250,
                equipment: ['Robe', 'Ardoise de données', 'Nécessaire d\'écriture', 'Enregistreur picto'], equipmentChoices: [], theme: null,
            },
            {
                key: 'officio_medicae', label: 'Officio Medicae', labelEn: 'Officio Medicae',
                chars: { int: 5, per: 5 }, advances: { dexterity: 1, logic: 1, lore: 1, medicae: 2 }, influence: { adeptus_administratum: 1 },
                talents: ['data_delver'], solars: 250,
                equipment: ['Robe', 'Ardoise de données', 'Nécessaire d\'écriture', 'Instruments de chirurgien'], equipmentChoices: [], theme: null,
            },
            {
                key: 'scrivener', label: 'Scribe', labelEn: 'Scrivener',
                chars: { int: 5, wil: 5 }, advances: { dexterity: 1, linguistics: 2, lore: 2 }, influence: { adeptus_administratum: 1 },
                talents: ['data_delver'], solars: 250,
                equipment: ['Robe', 'Ardoise de données', 'Nécessaire d\'écriture', 'Plume automatique'], equipmentChoices: [], theme: null,
            },
        ],
        summary: 'L\'immense bureaucratie qui fait tourner l\'Imperium : une pièce mal classée peut changer la vie de milliards d\'âmes.',
    },
    {
        key: 'astra_militarum', label: 'Astra Militarum', labelEn: 'Astra Militarum', source: 'core', page: 62,
        theme: 'militarum',
        benefits: {
            fixed: { tgh: 5 }, choice: ['ws', 'bs', 'str'],
            skills: ['athletics', 'discipline', 'fortitude', 'melee', 'ranged', 'stealth'], advances: 5,
            influence: { astra_militarum: 1 }, talents: ['drilled'], talentChoice: null, solars: 300,
            equipment: ['Couteau', 'Armure pare-éclats de l\'Astra Militarum', 'Grenade à fragmentation'],
            equipmentChoices: [['Fusil laser', 'Pistolet laser et Épée tronçonneuse']],
        },
        duties: [
            {
                key: 'melee_specialist', label: 'Spécialiste du corps à corps', labelEn: 'Melee Specialist',
                chars: { tgh: 5, ws: 5 }, advances: { athletics: 1, discipline: 1, fortitude: 1, melee: 2 }, influence: { astra_militarum: 1 },
                talents: ['drilled'], solars: 100,
                equipment: ['Couteau', 'Armure pare-éclats de l\'Astra Militarum', 'Grenade à fragmentation', 'Pistolet laser', 'Épée'],
                equipmentChoices: [], theme: null,
            },
            {
                key: 'scout', label: 'Éclaireur', labelEn: 'Scout',
                chars: { tgh: 5, bs: 5 }, advances: { athletics: 1, melee: 1, ranged: 1, stealth: 2 }, influence: { astra_militarum: 1 },
                talents: ['drilled'], solars: 100,
                equipment: ['Couteau', 'Armure pare-éclats de l\'Astra Militarum', 'Grenade à fragmentation', 'Fusil laser long (Longlas)', 'Cape de caméléoline'],
                equipmentChoices: [], theme: null,
            },
            {
                key: 'trooper', label: 'Soldat', labelEn: 'Trooper',
                chars: { tgh: 5, bs: 5 }, advances: { athletics: 1, discipline: 2, ranged: 2 }, influence: { astra_militarum: 1 },
                talents: ['drilled'], solars: 100,
                equipment: ['Couteau', 'Armure pare-éclats de l\'Astra Militarum', 'Grenade à fragmentation', 'Fusil laser'],
                equipmentChoices: [], theme: null,
            },
        ],
        summary: 'La Garde impériale, plus grande armée de la galaxie : des milliards de soldats qui tiennent la ligne au nom de l\'Empereur.',
    },
    {
        key: 'adeptus_ministorum', label: 'Adeptus Ministorum', labelEn: 'Adeptus Ministorum', source: 'core', page: 64,
        theme: 'ecclesiarchy',
        benefits: {
            fixed: { wil: 5 }, choice: ['int', 'per', 'fel'],
            skills: ['discipline', 'intuition', 'lore', 'medicae', 'presence', 'rapport'], advances: 5,
            influence: { adeptus_ministorum: 1 }, talents: ['faithful'], talentChoice: null, solars: 600,
            equipment: ['Robe', 'Robe (Ornementée)', 'Icône sacrée', 'Porte-voix', 'Bretelles d\'arme'], equipmentChoices: [],
        },
        duties: [
            {
                key: 'preacher', label: 'Prêcheur', labelEn: 'Preacher',
                chars: { wil: 5, fel: 5 }, advances: { intuition: 1, lore: 1, presence: 2, rapport: 1 }, influence: { adeptus_ministorum: 1 },
                talents: ['faithful'], solars: 350,
                equipment: ['Robe', 'Icône sacrée', 'Porte-voix', 'Livre d\'extraits du Lectitio Divinatus', 'Bâton'],
                equipmentChoices: [], theme: null,
            },
            {
                key: 'missionary', label: 'Missionnaire', labelEn: 'Missionary',
                chars: { str: 5, wil: 5 }, advances: { discipline: 1, lore: 1, navigation: 1, melee: 2 }, influence: { adeptus_ministorum: 1 },
                talents: ['faithful'], solars: 350,
                equipment: ['Robe', 'Icône sacrée', 'Porte-voix', 'Icône de l\'Empereur', 'Épée tronçonneuse'],
                equipmentChoices: [], theme: null,
            },
            {
                key: 'sister_novitiate', label: 'Sœur novice', labelEn: 'Sister Novitiate',
                chars: { wil: 5, int: 5 }, advances: { discipline: 1, lore: 1, medicae: 2, ranged: 1 }, influence: { adeptus_ministorum: 1 },
                talents: ['faithful'], solars: 350,
                equipment: ['Robe', 'Icône sacrée', 'Porte-voix', 'Trousse de chirurgien', 'Armure carapace'],
                equipmentChoices: [['Fusil automatique', 'Pistolet automatique']], theme: 'sororitas',
            },
        ],
        summary: 'L\'Ecclésiarchie, qui répand et garde le Credo impérial, des chaires des cathédrales aux champs de bataille.',
    },
    {
        key: 'imperial_navy', label: 'Flotte impériale', labelEn: 'The Imperial Navy', source: 'core', page: 68,
        theme: 'navy',
        benefits: {
            fixed: { ag: 5 }, choice: ['str', 'tgh', 'per'],
            skills: ['awareness', 'logic', 'navigation', 'piloting', 'reflexes', 'tech'], advances: 5,
            influence: { imperial_navy: 1 }, talents: ['void_legs'], talentChoice: null, solars: 300,
            equipment: ['Pistolet laser', 'Combinaison de vide', 'Découpeur laser'], equipmentChoices: [],
        },
        duties: [
            {
                key: 'aeronautica_pilot', label: 'Pilote de l\'Aeronautica', labelEn: 'Aeronautica Pilot',
                chars: { ag: 5, per: 5 }, advances: { awareness: 1, navigation: 1, piloting: 2, reflexes: 1 }, influence: { imperial_navy: 1 },
                talents: ['void_legs'], solars: 200,
                equipment: ['Pistolet laser', 'Photo-visières'], equipmentChoices: [], theme: null,
            },
            {
                key: 'navis_officer', label: 'Officier de la Navis', labelEn: 'Navis Officer',
                chars: { ag: 5, fel: 5 }, advances: { awareness: 1, 'presence.leadership': 2, navigation: 1, reflexes: 1 }, influence: { imperial_navy: 1 },
                talents: ['void_legs'], solars: 200,
                equipment: ['Combinaison de vide', 'Uniforme d\'officier'], equipmentChoices: [], theme: null,
            },
            {
                key: 'armsman', label: 'Homme d\'armes', labelEn: 'Armsman',
                chars: { ag: 5, tgh: 5 }, advances: { awareness: 1, logic: 1, navigation: 1, piloting: 1, reflexes: 1 }, influence: { imperial_navy: 1 },
                talents: ['void_legs'], solars: 200,
                equipment: ['Armure pare-éclats', 'Fusil de chasse', 'Bottes magnétiques'], equipmentChoices: [], theme: null,
            },
        ],
        summary: 'La Navis Imperialis, dont les vaisseaux titanesques relient les mondes, livrent bataille dans le vide et abritent des sociétés entières.',
    },
    {
        key: 'rogue_trader', label: 'Dynastie de Libre-Marchand', labelEn: 'Rogue Trader Dynasty', source: 'core', page: 70,
        theme: 'roguetrader',
        benefits: {
            fixed: { fel: 5 }, choice: ['ag', 'int', 'per'],
            skills: ['intuition', 'linguistics', 'navigation', 'presence', 'piloting', 'rapport'], advances: 5,
            influence: { rogue_trader: 1 }, talents: ['dealmaker'], talentChoice: null, solars: 1200,
            equipment: ['Combinaison blindée', 'Multiboussole'], equipmentChoices: [],
        },
        duties: [
            {
                key: 'diplomat', label: 'Diplomate', labelEn: 'Diplomat',
                chars: { fel: 5, per: 5 }, advances: { intuition: 1, presence: 1, linguistics: 1, rapport: 2 }, influence: { rogue_trader: 1 },
                talents: ['dealmaker'], solars: 500,
                equipment: ['Combinaison blindée', 'Multiboussole'], equipmentChoices: [], theme: null,
            },
            {
                key: 'catalogist', label: 'Cataloguiste', labelEn: 'Catalogist',
                chars: { fel: 5, ag: 5 }, advances: { intuition: 1, linguistics: 1, navigation: 2, piloting: 1 }, influence: { rogue_trader: 1 },
                talents: ['dealmaker'], solars: 500,
                equipment: ['Combinaison blindée', 'Multiboussole'], equipmentChoices: [], theme: null,
            },
            {
                key: 'adventurer', label: 'Aventurier', labelEn: 'Adventurer',
                chars: { fel: 5, bs: 5 }, advances: { athletics: 1, intuition: 1, ranged: 2, rapport: 1 }, influence: { rogue_trader: 1 },
                talents: ['dealmaker'], solars: 500,
                equipment: ['Combinaison blindée', 'Multiboussole'], equipmentChoices: [], theme: null,
            },
        ],
        summary: 'Dynasties détentrices d\'une Lettre de marque, libres de commercer et d\'explorer aux confins de l\'Imperium.',
    },
    {
        key: 'infractionist', label: 'Infractionniste', labelEn: 'Infractionist', source: 'core', page: 72,
        theme: 'underhive',
        benefits: {
            fixed: { ag: 5 }, choice: ['tgh', 'per', 'fel'],
            skills: ['athletics', 'dexterity', 'fortitude', 'rapport', 'reflexes', 'stealth'], advances: 5,
            influence: { infractionist: 1 }, talents: ['well_prepared'], talentChoice: null, solars: '5d10',
            equipment: ['Couteau', 'Sac à dos', 'Arme ordinaire au choix (Médiocre, Laide)', 'Outil courant au choix (Médiocre, Laid)'],
            equipmentChoices: [['Pistolet à balles automatique', 'Revolver à balles'], ['Cuirs légers', 'Cuirs lourds']],
        },
        duties: [
            {
                key: 'hiverunner', label: 'Coursier de la ruche', labelEn: 'Hiverunner',
                chars: { ag: 5, per: 5 }, advances: { athletics: 2, fortitude: 1, reflexes: 1, stealth: 1 }, influence: { infractionist: 1 },
                talents: ['well_prepared'], solars: 10,
                equipment: ['Couteau', 'Sac à dos', 'Pistolet à balles automatique', 'Cuirs légers', 'Couteau (Médiocre, Laid)', 'Enregistreur picto (Médiocre, Laid)'],
                equipmentChoices: [], theme: null,
            },
            {
                key: 'ganger', label: 'Gangster', labelEn: 'Ganger',
                chars: { ag: 5, tgh: 5 }, advances: { dexterity: 1, rapport: 1, reflexes: 1, stealth: 2 }, influence: { infractionist: 1 },
                talents: ['well_prepared'], solars: 10,
                equipment: ['Couteau', 'Sac à dos', 'Pistolet à balles automatique', 'Cuirs légers', 'Coup-de-poing américain (Médiocre, Laid)', 'Étouffeur (Stummer) (Médiocre, Laid)'],
                equipmentChoices: [], theme: null,
            },
            {
                key: 'fixer', label: 'Arrangeur', labelEn: 'Fixer',
                chars: { ag: 5, fel: 5 }, advances: { athletics: 1, dexterity: 1, rapport: 2, stealth: 1 }, influence: { infractionist: 1 },
                talents: ['well_prepared'], solars: 10,
                equipment: ['Couteau', 'Sac à dos', 'Pistolet à balles automatique', 'Cuirs légers', 'Couteau (Médiocre, Laid)', 'Découpeur laser (Médiocre, Laid)'],
                equipmentChoices: [], theme: null,
            },
        ],
        summary: 'Gangs, cartels et hors-la-loi des bas-fonds, qui vivent en marge des lois de l\'Imperium.',
    },
    {
        key: 'inquisition', label: 'Inquisition', labelEn: 'The Inquisition', source: 'core', page: 66,
        theme: 'hereticus',
        benefits: {
            fixed: { per: 5 }, choice: ['tgh', 'int', 'wil'],
            skills: ['awareness', 'discipline', 'intuition', 'logic', 'lore', 'presence'], advances: 5,
            influence: { inquisition: 1 }, talents: ['ever_vigilant'], talentChoice: null, solars: 400,
            equipment: ['Pistolet laser', 'Combinaison moulante blindée', 'Globe lumineux / Lampe-torche', 'Menottes'],
            equipmentChoices: [['Auspex / Scanner', 'Sangsue de communication', 'Enregistreur picto']],
        },
        duties: [
            {
                key: 'acolyte', label: 'Acolyte', labelEn: 'Acolyte',
                chars: { per: 5, tgh: 5 }, advances: { awareness: 1, discipline: 1, intuition: 1, logic: 1, presence: 1 }, influence: { inquisition: 1 },
                talents: ['ever_vigilant'], solars: 100,
                equipment: ['Pistolet laser', 'Combinaison moulante blindée', 'Globe lumineux / Lampe-torche', 'Menottes', 'Sangsue de communication'],
                equipmentChoices: [], theme: null,
            },
            {
                key: 'exorcist', label: 'Exorciste', labelEn: 'Exorcist',
                chars: { per: 5, wil: 5 }, advances: { awareness: 1, discipline: 1, intuition: 1, lore: 1, presence: 1 }, influence: { inquisition: 1 },
                talents: ['ever_vigilant'], solars: 100,
                equipment: ['Pistolet laser', 'Combinaison moulante blindée', 'Globe lumineux / Lampe-torche', 'Menottes', 'Auspex / Scanner'],
                equipmentChoices: [], theme: null,
            },
            {
                key: 'sage', label: 'Sage', labelEn: 'Sage',
                chars: { per: 5, int: 5 }, advances: { intuition: 1, logic: 2, lore: 2 }, influence: { inquisition: 1 },
                talents: ['ever_vigilant'], solars: 100,
                equipment: ['Pistolet laser', 'Combinaison moulante blindée', 'Globe lumineux / Lampe-torche', 'Menottes', 'Auspex / Scanner'],
                equipmentChoices: [], theme: null,
            },
        ],
        summary: 'La main gauche de l\'Empereur : des Inquisiteurs autonomes et leurs suites, ultime rempart contre les menaces extérieures comme intérieures à l\'Imperium.',
    },
    {
        key: 'ordo_hereticus', label: 'Ordo Hereticus', labelEn: 'The Ordo Hereticus', source: 'ipg', page: 50,
        theme: 'hereticus',
        benefits: {
            fixed: { per: 5 }, choice: ['fel', 'str', 'wil'],
            skills: ['awareness', 'intuition', 'logic', 'melee', 'rapport', 'presence'], advances: 5,
            influence: { inquisition: 1 }, talents: [], talentChoice: [['ever_vigilant'], ['cult_infiltrator']], solars: 400,
            equipment: ['Combinaison blindée'],
            equipmentChoices: [['Pistolet laser', 'Pistolet à grenaille (Shotpistol)'], ['Passe-partout', 'Masse énergétique', 'Scanner de culpabilité (Soulguilt Scanner)']],
        },
        duties: [
            {
                key: 'deceptor', label: 'Trompeur', labelEn: 'Deceptor',
                chars: { per: 5, fel: 5 }, advances: { awareness: 1, intuition: 2, rapport: 1, 'rapport.deception': 1 }, influence: { inquisition: 1 },
                talents: ['ever_vigilant'], solars: 400,
                equipment: ['Pistolet à grenaille (Shotpistol)', 'Combinaison blindée', 'Passe-partout'], equipmentChoices: [], theme: null,
            },
            {
                key: 'querent', label: 'Questionneur', labelEn: 'Querent',
                chars: { per: 5, wil: 5 }, advances: { intuition: 1, presence: 1, 'presence.interrogation': 1, rapport: 2 }, influence: { inquisition: 1 },
                talents: ['ever_vigilant'], solars: 400,
                equipment: ['Pistolet à grenaille (Shotpistol)', 'Combinaison blindée', 'Scanner de culpabilité (Soulguilt Scanner)'], equipmentChoices: [], theme: null,
            },
            {
                key: 'militant', label: 'Militant', labelEn: 'Militant',
                chars: { per: 5, str: 5 }, advances: { awareness: 1, melee: 2, 'melee.one_handed': 1, presence: 1 }, influence: { inquisition: 1 },
                talents: ['ever_vigilant'], solars: 400,
                equipment: ['Pistolet à grenaille (Shotpistol)', 'Combinaison blindée', 'Masse énergétique'], equipmentChoices: [], theme: null,
            },
        ],
        summary: 'L\'Ordo qui traque l\'hérésie, les cultes et les sorcières parmi les sujets de l\'Imperium, souvent aux côtés du Ministorum et du Militarum.',
    },
    {
        key: 'ordo_malleus', label: 'Ordo Malleus', labelEn: 'The Ordo Malleus', source: 'ipg', page: 52,
        theme: 'malleus',
        benefits: {
            fixed: { wil: 5 }, choice: ['str', 'tgh', 'per'],
            skills: ['awareness', 'discipline', 'fortitude', 'intuition', 'logic', 'presence'], advances: 5,
            influence: { inquisition: 1 }, talents: [], talentChoice: [['ever_vigilant'], ['unwavering_will']], solars: 400,
            equipment: ['Combinaison blindée'],
            equipmentChoices: [['Lance-flammes de poing', 'Pistolet laser'], ['Instrument de divination', 'Psyocculum', 'Brouilleur de signal']],
        },
        duties: [
            {
                key: 'admonitor', label: 'Admoniteur', labelEn: 'Admonitor',
                chars: { wil: 5, tgh: 5 }, advances: { awareness: 1, discipline: 1, 'discipline.fear': 1, intuition: 2 }, influence: { inquisition: 1 },
                talents: ['ever_vigilant'], solars: 400,
                equipment: ['Lance-flammes de poing', 'Combinaison blindée', 'Brouilleur de signal'], equipmentChoices: [], theme: null,
            },
            {
                key: 'crusader', label: 'Croisé', labelEn: 'Crusader',
                chars: { wil: 5, str: 5 }, advances: { discipline: 2, intuition: 1, presence: 1, 'presence.leadership': 1 }, influence: { inquisition: 1 },
                talents: ['ever_vigilant'], solars: 400,
                equipment: ['Lance-flammes de poing', 'Combinaison blindée', 'Masse énergétique'], equipmentChoices: [], theme: null,
            },
            {
                key: 'sensor', label: 'Senseur', labelEn: 'Sensor',
                chars: { wil: 5, per: 5 }, advances: { discipline: 1, 'discipline.psychic': 1, intuition: 2, 'fortitude.endurance': 1 }, influence: { inquisition: 1 },
                talents: ['ever_vigilant'], solars: 400,
                equipment: ['Lance-flammes de poing', 'Combinaison blindée', 'Instrument de divination'], equipmentChoices: [], theme: null,
            },
        ],
        summary: 'L\'Ordo secret qui combat les démons et les puissances du Warp ; ses acolytes taisent leur appartenance, même entre eux.',
    },
    {
        key: 'ordo_xenos', label: 'Ordo Xenos', labelEn: 'The Ordo Xenos', source: 'ipg', page: 54,
        theme: 'xenos',
        benefits: {
            fixed: { fel: 5 }, choice: ['tgh', 'int', 'per'],
            skills: ['intuition', 'linguistics', 'logic', 'lore', 'rapport', 'tech'], advances: 5,
            influence: { inquisition: 1 }, talents: [], talentChoice: [['ever_vigilant'], ['logical_liar']], solars: 400,
            equipment: ['Combinaison blindée'],
            equipmentChoices: [['Canon de poing', 'Pistolet à aiguilles'], ['Auspex', 'Extracteur de bio-échantillons', 'Enregistreur picto']],
        },
        duties: [
            {
                key: 'analyticus', label: 'Analyticus', labelEn: 'Analyticus',
                chars: { fel: 5, int: 5 }, advances: { intuition: 1, logic: 2, 'lore.forbidden': 1, tech: 1 }, influence: { inquisition: 1 },
                specNote: 'Savoir (Interdit) : Xenos (« Lore: Xenos » dans le livre)',
                talents: ['ever_vigilant'], solars: 400,
                equipment: ['Pistolet à aiguilles', 'Combinaison blindée', 'Auspex'], equipmentChoices: [], theme: null,
            },
            {
                key: 'xenologist', label: 'Xénologue', labelEn: 'Xenologist',
                chars: { fel: 5, tgh: 5 }, advances: { intuition: 2, logic: 1, 'lore.forbidden': 1, tech: 1 }, influence: { inquisition: 1 },
                specNote: 'Savoir (Interdit) : Xenos (« Lore: Xenos » dans le livre)',
                talents: ['ever_vigilant'], solars: 400,
                equipment: ['Pistolet à aiguilles', 'Combinaison blindée', 'Extracteur de bio-échantillons'], equipmentChoices: [], theme: null,
            },
            {
                key: 'xenolinguist', label: 'Xénolinguiste', labelEn: 'Xenolinguist',
                chars: { fel: 5, per: 5 }, advances: { linguistics: 2, 'lore.forbidden': 1, 'rapport.xeno_cant': 2 }, influence: { inquisition: 1 },
                specNote: 'Savoir (Interdit) : Xenos (« Lore: Xenos » dans le livre)',
                talents: ['ever_vigilant'], solars: 400,
                equipment: ['Pistolet à aiguilles', 'Combinaison blindée', 'Enregistreur picto'], equipmentChoices: [], theme: null,
            },
        ],
        summary: 'L\'Ordo qui surveille les xenos et leurs technologies impures, envoyé aux confins du secteur, souvent depuis des vaisseaux.',
    },
];

// d100 « faction selon l'origine » (CORE p.55) : [faction, min, max], 00 = 100.
// Ligne « The Inquisition » remplacée par les trois Ordos (voir « À relire » en tête).
export const FACTION_TABLE = {
    agri_world: [
        ['adeptus_astra_telepathica', 1, 1], ['adeptus_mechanicus', 2, 11], ['adeptus_administratum', 12, 37],
        ['astra_militarum', 38, 51], ['adeptus_ministorum', 52, 65], ['ordo_hereticus', 66, 66], ['ordo_malleus', 67, 67],
        ['imperial_navy', 68, 79], ['infractionist', 80, 98], ['rogue_trader', 99, 100],
    ],
    feudal_world: [
        ['adeptus_astra_telepathica', 1, 1], ['adeptus_mechanicus', 2, 3], ['adeptus_administratum', 4, 29],
        ['astra_militarum', 30, 63], ['adeptus_ministorum', 64, 79], ['ordo_hereticus', 80, 80], ['ordo_malleus', 81, 81],
        ['imperial_navy', 82, 85], ['infractionist', 86, 98], ['rogue_trader', 99, 100],
    ],
    feral_world: [
        ['adeptus_astra_telepathica', 1, 1], ['adeptus_mechanicus', 2, 3], ['adeptus_administratum', 4, 17],
        ['astra_militarum', 18, 69], ['adeptus_ministorum', 70, 82], ['ordo_hereticus', 83, 83], ['ordo_malleus', 84, 84],
        ['imperial_navy', 85, 94], ['infractionist', 95, 99], ['rogue_trader', 100, 100],
    ],
    forge_world: [
        ['adeptus_astra_telepathica', 1, 1], ['adeptus_mechanicus', 2, 51], ['adeptus_administratum', 52, 71],
        ['astra_militarum', 72, 72], ['adeptus_ministorum', 73, 74], ['ordo_hereticus', 75, 75],
        ['imperial_navy', 76, 85], ['infractionist', 86, 99], ['rogue_trader', 100, 100],
    ],
    hive_world: [
        ['adeptus_astra_telepathica', 1, 1], ['adeptus_mechanicus', 2, 13], ['adeptus_administratum', 14, 37],
        ['astra_militarum', 38, 57], ['adeptus_ministorum', 58, 69], ['ordo_hereticus', 70, 70], ['ordo_malleus', 71, 71],
        ['imperial_navy', 72, 81], ['infractionist', 82, 98], ['rogue_trader', 99, 100],
    ],
    shrine_world: [
        ['adeptus_astra_telepathica', 1, 1], ['adeptus_mechanicus', 2, 3], ['adeptus_administratum', 4, 17],
        ['astra_militarum', 18, 31], ['adeptus_ministorum', 32, 71], ['ordo_hereticus', 72, 72], ['ordo_malleus', 73, 73],
        ['imperial_navy', 74, 85], ['infractionist', 86, 99], ['rogue_trader', 100, 100],
    ],
    schola_progenium: [
        ['adeptus_astra_telepathica', 1, 1], ['adeptus_mechanicus', 2, 3], ['adeptus_administratum', 4, 23],
        ['astra_militarum', 24, 45], ['adeptus_ministorum', 46, 67], ['ordo_hereticus', 68, 74], ['ordo_malleus', 75, 81],
        ['ordo_xenos', 82, 87], ['imperial_navy', 88, 94], ['rogue_trader', 95, 100],
    ],
    voidborn: [
        ['adeptus_astra_telepathica', 1, 10], ['adeptus_mechanicus', 11, 20], ['adeptus_administratum', 21, 34],
        ['astra_militarum', 35, 48], ['adeptus_ministorum', 49, 52], ['ordo_hereticus', 53, 53], ['ordo_malleus', 54, 54],
        ['imperial_navy', 55, 84], ['infractionist', 85, 89], ['rogue_trader', 90, 100],
    ],
};

// d100 « Faction » du Player's Guide (IPG p.46) : une seule colonne, indépendante de l'origine,
// avec les trois Ordos. Alternative à FACTION_TABLE, au choix du MJ.
export const INQUISITION_FACTION_TABLE = [
    ['adeptus_administratum', 1, 6], ['adeptus_astra_telepathica', 7, 12], ['adeptus_mechanicus', 13, 18],
    ['adeptus_ministorum', 19, 24], ['astra_militarum', 25, 31], ['imperial_navy', 32, 37],
    ['infractionist', 38, 43], ['rogue_trader', 44, 50], ['ordo_hereticus', 51, 75],
    ['ordo_malleus', 76, 85], ['ordo_xenos', 86, 100],
];
