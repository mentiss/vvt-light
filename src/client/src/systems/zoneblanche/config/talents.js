// src/client/src/systems/zoneblanche/config/talents.js
// Catalogue Talents complet (cf. spec §9) — pools fixes de 6 par archétype.
// Même forme que verites.js/focus.js : un dictionnaire { archetype: [...] }.
// Chaque talent porte sa propre clé explicite (`key`), stockée telle quelle
// en base (character_talents.talent_key).

export const TALENTS_CATALOG = {
    ingenieur: [
        { key: 'systeme_d',            nom: 'Système D',             description: "Quand l'Ingénieur répare, rafistole ou détourne du matériel avec des moyens de fortune, réduisez la difficulté de 1 (min 0). Une fois par scène, si le jet réussit, l'objet réparé fonctionne sans complication possible jusqu'à la fin de la scène." },
        { key: 'diagnostic_eclair',    nom: 'Diagnostic éclair',     description: "Une fois par scène, quand du matériel tombe en panne ou se comporte anormalement, demandez au MJ la cause réelle de la panne (naturelle ou non), sans jet. Si la cause est paranormale, générez 3 Stress." },
        { key: 'ceinture_bretelles',   nom: 'Ceinture et bretelles', description: "Une fois par scène, quand une complication technique frappe l'équipe (panne, batterie vide, signal perdu), dépensez 2 Audimat pour l'annuler : le dispositif de secours prévu prend le relais." },
        { key: 'overclocking',         nom: 'Overclocking',          description: "Avant un jet d'Opération utilisant du matériel, poussez l'appareil au-delà de ses specs : le jet gagne un d20 gratuit, mais tout dé affichant 16-20 génère une complication sur ce jet. À volonté." },
        { key: 'le_manuel_cest_moi',   nom: "Le manuel, c'est moi",  description: "Une fois par scène, quand un allié en ligne de communication avec l'Ingénieur effectue un jet d'Opération, dépensez 1 Audimat : l'allié utilise le rang d'Opération de l'Ingénieur à la place du sien." },
        { key: 'deuxieme_lecture',     nom: 'Deuxième lecture',      description: "Une fois par scène, après un jet d'Opération raté, relancez un seul d20 en re-vérifiant les réglages. Si le jet échoue encore, le MJ gagne 1 Stress." },
    ],
    operateur: [
        { key: 'oeil_du_monteur',      nom: "L'œil du monteur",    description: "Une fois par scène, quand l'Opérateur dépouille des rushs (images, sons, mesures enregistrées), il peut relancer jusqu'à deux d20 sur ce jet d'analyse." },
        { key: 'camera_a_lepaule',     nom: "Caméra à l'épaule",   description: "Une fois par scène, quand l'Opérateur filme en pleine action physique (course, poursuite, escalade), il utilise son rang de Déplacement à la place d'Opération sur ce jet." },
        { key: 'le_bon_angle',         nom: 'Le bon angle',        description: "Dépensez 3 Audimat : un allié relance un d20 sur un jet effectué dans le champ d'une caméra de l'Opérateur. À volonté." },
        { key: 'reperage_instinctif',  nom: 'Repérage instinctif', description: 'Une fois par scène, en entrant dans un nouvel espace, demandez au MJ le principal danger physique du lieu. Générez 1 Stress.' },
        { key: 'le_matos_encaisse',    nom: 'Le matos encaisse',   description: "Une fois par scène, quand une complication frappe un jet de l'Opérateur, il peut la faire porter par son matériel : l'équipement concerné est hors service jusqu'à réparation, la complication est absorbée." },
        { key: 'au_plus_pres',         nom: 'Au plus près',        description: "Une fois par scène, avant un jet d'Opération pour filmer un phénomène en cours, gagnez un d20 gratuit ; toute complication sur ce jet touche physiquement l'Opérateur ou son matériel." },
    ],
    scientifique: [
        { key: 'methode_experimentale',  nom: 'Méthode expérimentale',  description: "Dépensez 1 Prime Time avant un jet d'Investigation : réussite automatique, sans marge (aucun Audimat généré). Exclusif : le seul succès automatique du jeu." },
        { key: 'esprit_universel',       nom: 'Esprit universel',       description: "Une fois par scène, dépensez 2 Audimat : gagnez un focus supplémentaire jusqu'à la fin de la scène, choisi sur une compétence de rang 4+ (pas de focus improvisé sur un domaine délaissé)." },
        { key: 'explication_naturelle',  nom: 'Explication naturelle',  description: "Une fois par scène, demandez au MJ si le phénomène observé a une explication naturelle possible. Si la réponse est non, générez 2 Stress. Un « oui » ne dit pas que c'est la bonne explication." },
        { key: 'ecoutez_la_raison',      nom: 'Écoutez la raison',      description: "Quand le Scientifique expose un plan d'action argumenté, dépensez 1 Audimat par allié concerné : jusqu'à la fin de la scène, ceux qui suivent ses directives réduisent de 1 la difficulté de leurs jets directement liés au plan (min 0)." },
        { key: 'cartographie_mentale',   nom: 'Cartographie mentale',   description: "Une fois par session, le Scientifique révèle qu'il a étudié les plans du lieu en amont : jusqu'à la fin de la scène en cours, l'équipe réduit de 1 la difficulté de ses jets d'orientation dans le bâtiment." },
        { key: 'directeur_de_recherche', nom: 'Directeur de recherche', description: "Quand le Scientifique assiste le jet d'Investigation d'un allié, son d20 d'assistance déclenche des critiques sur un résultat ≤ son rang d'Investigation, même sans focus applicable. Si ce d20 n'obtient aucun succès, la difficulté du jet assisté augmente de 1." },
    ],
    producteur: [
        { key: 'instinct_du_direct',         nom: 'Instinct du direct',           description: "Le Producteur peut à tout moment céder son tour d'action à un autre membre de l'équipe, qui agit à sa place." },
        { key: 'dans_loreillette',           nom: "Dans l'oreillette",            description: "Une fois par scène, dépensez 1 Audimat : un allié qui vient de rater un jet relance un d20, à condition que le Producteur puisse lui parler." },
        { key: 'optimisation_budgetaire',    nom: 'Optimisation budgétaire',      description: "Une fois par session, une dépense d'Audimat de l'équipe est réduite de 2 (min 1)." },
        { key: 'mon_assistant_soccupe',      nom: "Mon assistant s'en occupe",    description: "Une fois par session, le Producteur délègue une tâche hors site à son équipe de production (recherche, course, appel, vérification) : le résultat arrive à la fin de la scène suivante, sans jet. Générez 1 Stress." },
        { key: 'le_nez_du_fait_divers',      nom: 'Le nez du fait divers',        description: "Une fois par scène, face à un témoin ou un document, demandez au MJ s'il dissimule quelque chose d'important. Générez 1 Stress." },
        { key: 'la_sequence_quil_nous_faut', nom: "La séquence qu'il nous faut",  description: "Une fois par session, le Producteur commande discrètement un trucage à un membre de l'équipe (qui l'exécute — ou refuse) : s'il est réalisé, gagnez 3 Audimat, générez 2 Stress. Mécanique d'exposition commune (cf. §9) ; si le trucage est exposé, le complice porte le chapeau dans la fiction — sauf si le Producteur assume publiquement." },
    ],
    animateur: [
        { key: 'confessionnal',     nom: 'Confessionnal',    description: "Dépensez 2 Audimat : le témoin que l'Animateur interroge se livre comme s'ils étaient seuls au monde. Réduisez de 1 la difficulté des jets d'Investigation par interaction avec lui jusqu'à la fin de la scène." },
        { key: 'tenir_lantenne',    nom: "Tenir l'antenne",   description: 'Une fois par scène, dépensez 1 Audimat : un allié ou un PNJ paniqué, tétanisé ou socialement affecté par une complication reprend immédiatement ses moyens.' },
        { key: 'question_piege',    nom: 'Question piège',   description: "Une fois par scène, demandez au MJ si le dernier propos tenu par un PNJ était sincère. Générez 1 Stress." },
        { key: 'tout_est_animable', nom: 'Tout est animable', description: "Quand l'Animateur aborde une action en la jouant pour la caméra, il utilise Présence à la place du Principe normalement requis sur ce jet (le MJ arbitre la pertinence)." },
        { key: 'suivez_le_guide',   nom: 'Suivez le guide',   description: "Dépensez 1 Audimat par allié concerné : jusqu'à la fin de la scène, ceux qui suivent les instructions de déplacement de l'Animateur réduisent de 1 la difficulté de leurs jets de Déplacement liés à l'évacuation ou au regroupement (min 0)." },
        { key: 'le_grand_frisson',  nom: 'Le grand frisson',  description: "Une fois par scène, l'Animateur amplifie à l'antenne un non-événement (courant d'air, craquement, silence trop long) pour en faire un moment de télévision : gagnez 2 Audimat, générez 2 Stress. Mécanique d'exposition commune (cf. §9)." },
    ],
    guest_star: [
        { key: 'la_baraka',              nom: 'La baraka',              description: "Une fois par session, après un jet raté de la Guest Star, l'échec reste un échec mais ne peut générer ni complication ni Stress." },
        { key: 'regard_neuf',            nom: 'Regard neuf',            description: "Une fois par scène, la Guest Star pose sa question naïve : demandez au MJ quel élément de la situation l'équipe tient à tort pour acquis. Générez 2 Stress." },
        { key: 'etoile_montante',        nom: 'Étoile montante',        description: "Une fois par session, quand la Guest Star obtient un critique naturel (dé à 1 ou dé ≤ rang avec focus — hors Prime Time et talents), le prochain d20 acheté par l'équipe est gratuit." },
        { key: 'montee_dadrenaline',     nom: "Montée d'adrénaline",    description: "Après avoir été témoin ou victime d'un événement paranormal, le prochain jet de Déplacement de la Guest Star gagne un d20 gratuit." },
        { key: 'pas_prevu_au_programme', nom: 'Pas prévu au programme', description: "Une fois par scène, quand un effet présenté comme paranormal cible directement la Guest Star, elle peut immédiatement tenter un jet de Déplacement pour s'y soustraire avant sa résolution." },
        { key: 'sous_les_projecteurs',   nom: 'Sous les projecteurs',   description: "Quand la Guest Star agit dans le champ d'une caméra qui tourne, dépensez 1 Audimat pour réduire la difficulté de son jet de 1 (min 0). À volonté." },
    ],
    medium: [
        { key: 'puissance_en_bovis',  nom: 'Puissance en Bovis',  description: "Lors d'un événement paranormal, le Médium calcule la puissance en bovis : le prochain d20 acheté est gratuit. Une fois par scène." },
        { key: 'transe',              nom: 'Transe',              description: "Avant un jet d'Ésotérisme, le Médium entre en transe : le jet gagne un d20 gratuit ; en cas d'échec du jet, le contrecoup frappe le Médium — le MJ gagne 2 Stress et décrit l'effet du retour. À volonté." },
        { key: 'empreinte_des_lieux', nom: 'Empreinte des lieux', description: "Une fois par scène, au contact d'un objet ou d'un lieu, posez une question au MJ sur son passé émotionnel. Payez 3 Audimat OU générez 2 Stress (au choix du joueur)." },
        { key: 'canal_protecteur',    nom: 'Canal protecteur',    description: "Une fois par scène, dépensez 1 Audimat : le Médium détourne sur lui une complication présentée comme paranormale qui visait un allié." },
        { key: 'sonder_autrement',    nom: 'Sonder autrement',    description: "Une fois par scène, quand le Médium explore par ses sens plutôt que par l'examen, il utilise son rang d'Ésotérisme à la place d'Investigation sur ce jet." },
        { key: 'apaisement',         nom: 'Apaisement',          description: "Une fois par session, dépensez 2 Audimat : le Médium apaise la scène — toute activité hostile ou perturbatrice cesse jusqu'à la fin de la scène, ou jusqu'à ce qu'on la provoque." },
    ],
    exorciste: [
        { key: 'sanctuaire',                nom: 'Sanctuaire',                  description: "L'Exorciste peut consacrer une zone restreinte (une pièce, un cercle, un véhicule) : dans cette zone, le MJ dépense 2 Stress de plus pour déclencher un événement paranormal. La première consécration de la session est gratuite ; l'entretenir coûte 2 Audimat au début de chaque scène suivante, sinon elle s'éteint. Consacrer une nouvelle zone (ou re-consacrer une zone éteinte) coûte 3 Audimat, puis le loyer normal. Une seule zone consacrée à la fois." },
        { key: 'au_nom_de_ce_qui_est_saint', nom: 'Au nom de ce qui est saint',  description: "Après un jet d'Ésotérisme visant à protéger, purifier ou bannir, dépensez 2 Audimat pour ajouter 1 succès au résultat. Ce succès ne compte pas dans la marge (ne génère pas d'Audimat)." },
        { key: 'nommer_le_mal',             nom: 'Nommer le Mal',               description: "Une fois par scène, face à une manifestation, demandez au MJ ce qu'il y a réellement derrière. Générez 2 Stress." },
        { key: 'preparatifs_minutieux',      nom: 'Préparatifs minutieux',       description: "Une fois par session, déclarez qu'un rituel a été préparé à l'avance (temps et matériel réunis) : le premier jet d'Ésotérisme lié à ce rituel réduit sa difficulté de 2 (min 0)." },
        { key: 'rempart_de_foi',            nom: 'Rempart de foi',              description: "Une fois par scène, quand un effet présenté comme paranormal cible directement un allié, l'Exorciste peut s'interposer : l'effet est annulé. Générez 2 Stress." },
        { key: 'trousse_du_praticien',       nom: 'Trousse du praticien',        description: "Une fois par scène, l'Exorciste révèle qu'un objet utilisé (par lui ou un allié) avait été béni ou préparé de sa main — le sel, l'eau, mais aussi le pendule du Médium, la caméra de l'Opérateur... éventuellement à l'insu de son propriétaire : le jet concerné gagne un d20 gratuit." },
    ],
};