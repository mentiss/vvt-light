// src/client/src/systems/woddavampire/config/clans.js
// ─────────────────────────────────────────────────────────────────────────────
// Clans, castes, branches et lignées (annexe vda20-catalogue-clans.md, §15).
// Faiblesses reformulées ; noms français provisoires.
//
//   kind           : 'clan' | 'bloodline' | 'clanless'
//   disciplines    : les 3 Disciplines de clan (clés de disciplines.js)
//   weakness       : rappel de la faiblesse
//   weaknessField  : libellé du champ personnalisé de la faiblesse (§15.1), ou null
//   castes         : sous-groupes { label, disciplines, weakness?, weaknessField? } ;
//                    defaultCaste : caste choisie par défaut
//   originClan     : la lignée prend 2 Disciplines et la faiblesse du clan d'origine
//   effects        : effets appliqués par la fiche (§15.2)
//   playable       : false = PNJ seulement (§15.4)
// ─────────────────────────────────────────────────────────────────────────────

export const CLANS = {
    // ── Clans majeurs ────────────────────────────────────────────────────────
    assamites: {
        label: 'Assamites', kind: 'clan', defaultCaste: 'viziers',
        castes: {
            viziers:   { label: 'Vizirs', disciplines: ['auspex', 'presence', 'quietus'],
                         weakness: "Obsession pour sa Capacité intellectuelle ou créative la plus élevée, qui agit comme un Dérangement ; l'aura trahit alors sa Nature et l'objet de son obsession. La peau noircit avec les siècles.",
                         weaknessField: "Capacité objet de l'obsession", quietusBranch: 'hematus' },
            sorcerers: { label: 'Sorciers', disciplines: ['assamite_sorcery', 'auspex', 'celerity'],
                         weakness: 'Toute tentative mystique de détecter leur magie se fait à −2 diff, et leur magie compte comme 2 niveaux plus haut face aux pouvoirs opposés.' },
            warriors:  { label: 'Guerriers', disciplines: ['celerity', 'obfuscate', 'quietus'],
                         weakness: "Détectés comme diabolistes par tout pouvoir surnaturel, même sans avoir commis de diablerie.",
                         quietusBranch: 'cruscitus' },
        },
    },
    brujah: {
        label: 'Brujah', kind: 'clan', disciplines: ['celerity', 'potence', 'presence'],
        weakness: '+2 en difficulté pour résister à la frénésie ou la guider ; ne peut jamais dépenser de Volonté pour éviter une frénésie (1 Volonté peut y mettre fin).',
    },
    cappadocians: {
        label: 'Cappadociens', kind: 'clan', disciplines: ['auspex', 'fortitude', 'necromancy'],
        weakness: "Aspect cadavérique, de plus en plus marqué avec l'âge ; impossible d'imiter la vie par le sang ; +2 diff aux jets sociaux que cette apparence gênerait.",
        effects: { noMimicLife: true },
    },
    gangrel: {
        label: 'Gangrel', kind: 'clan', disciplines: ['animalism', 'fortitude', 'protean'],
        weakness: "Une frénésie peut laisser un trait animal : +1 diff et un échec automatique sur une réserve en rapport, jusqu'à ce que le joueur accepte cet échec.",
        weaknessField: 'Traits animaux en cours',
    },
    lasombra: {
        label: 'Lasombra', kind: 'clan', disciplines: ['dominate', 'obtenebration', 'potence'],
        weakness: 'Aucun reflet ; ne supportent pas la lumière vive : +1 niveau aggravé à chaque exposition au soleil.',
    },
    malkavians: {
        label: 'Malkaviens', kind: 'clan', disciplines: ['auspex', 'dementation', 'obfuscate'],
        weakness: "Un Dérangement choisi à la création, incurable ; la Volonté ne l'écarte que pour un tour.",
        weaknessField: 'Dérangement incurable',
    },
    nosferatu: {
        label: 'Nosferatu', kind: 'clan', disciplines: ['animalism', 'obfuscate', 'potence'],
        weakness: 'Apparence 0, jamais augmentable ; échec automatique sur toute première impression (sauf pour intimider).',
        effects: { appearanceZero: true },
    },
    ravnos: {
        label: 'Ravnos', kind: 'clan', disciplines: ['animalism', 'chimerstry', 'fortitude'],
        weakness: "Un trait de personnalité clé (vertu ou vice) : quand l'occasion se présente, il y cède, sauf jet de Maîtrise/Instinct (diff 6).",
        weaknessField: 'Trait de personnalité clé',
    },
    followers_of_set: {
        label: 'Disciples de Set', kind: 'clan', defaultCaste: 'priests',
        castes: {
            priests:            { label: 'Prêtres', disciplines: ['obfuscate', 'presence', 'serpentis'],
                                  weakness: 'Dégâts aggravés du soleil doublés.' },
            warriors_of_glycon: { label: 'Guerriers de Glycon', disciplines: ['obfuscate', 'potence', 'serpentis'],
                                  weakness: "Une source de pouvoir choisie ; doivent accepter la reddition d'un adversaire ; jet de Volonté (diff 6) pour ne pas poursuivre exclusivement toute occasion d'acquérir du pouvoir.",
                                  weaknessField: 'Source de pouvoir' },
            witches_of_echidna: { label: "Sorcières d'Échidna", disciplines: ['animalism', 'presence', 'setite_sorcery'],
                                  weakness: "À chaque test de frénésie, test de Maîtrise à la même difficulté : un échec fait tomber l'Apparence à 0 pour la scène ; Échidna prélève 1 sang de plus en fin de scène à chaque dépense ou absorption de sang (sauf sorcellerie)." },
        },
    },
    toreador: {
        label: 'Toreador', kind: 'clan', disciplines: ['auspex', 'celerity', 'presence'],
        weakness: "Fasciné par la beauté : jet de Maîtrise/Instinct (diff 5), sinon la contemplation dure jusqu'à la fin de la scène ou le départ de l'objet.",
    },
    tremere: {
        label: 'Trémères', kind: 'clan', disciplines: ['auspex', 'dominate', 'thaumaturgy'],
        weakness: "La première gorgée de sang de vampire compte double pour le lien de sang ; une fiole de son sang est remise au Conseil des Sept.",
    },
    tzimisce: {
        label: 'Tzimisce', kind: 'clan', defaultCaste: 'tzimisce',
        castes: {
            tzimisce: { label: 'Tzimisce', disciplines: ['animalism', 'auspex', 'vicissitude'] },
            dracul:   { label: 'Dracul', disciplines: ['animalism', 'auspex', 'dominate'] },
            koldun:   { label: 'Koldun', disciplines: ['animalism', 'auspex', 'vicissitude'], koldunism: true },
        },
        weakness: "Doit dormir avec au moins deux poignées de terre natale ; chaque jour sans elle, toutes les réserves sont divisées par 2 (cumulatif, minimum 1 dé).",
        effects: { bodyCrafts: true },
    },
    ventrue: {
        label: 'Ventrue', kind: 'clan', disciplines: ['dominate', 'fortitude', 'presence'],
        weakness: "Proie restreinte à un type de mortel ; le sang des autres ne nourrit pas et n'apaise pas la Bête.",
        weaknessField: 'Type de proie',
    },
    salubri: {
        label: 'Salubri', kind: 'clan', defaultCaste: 'healers',
        castes: {
            healers:   { label: 'Guérisseurs', disciplines: ['auspex', 'presence', 'valeren'],
                         weakness: "Jet de Volonté (diff 6) pour se nourrir d'une victime non consentante, sinon −2 dés à tous les jets pour la nuit." },
            warriors:  { label: 'Guerriers', disciplines: ['auspex', 'fortitude', 'valeren'],
                         weakness: "Jet de Volonté (diff 6) pour se nourrir de quelqu'un qu'il n'a pas vaincu au combat, sinon −2 dés pour la nuit." },
            watchers:  { label: 'Veilleurs', disciplines: ['auspex', 'obfuscate', 'valeren'],
                         weakness: "Jet de Volonté (diff 6) pour laisser passer une occasion d'étudier son domaine, sinon −2 dés pour la nuit.",
                         weaknessField: "Domaine d'étude" },
        },
        commonWeakness: 'Troisième œil : bosse au 1er point de Valeren, œil ouvert au 3ᵉ.',
    },
    caitiff: {
        label: 'Caïtifs', kind: 'clanless', disciplines: [], anyDisciplines: true,
        weakness: 'Aucune ; mépris de la société caïnite.',
        effects: { forbidStatus: true },
    },

    // ── Lignées ──────────────────────────────────────────────────────────────
    ahrimanes: {
        label: 'Ahrimanes', kind: 'bloodline', disciplines: ['animalism', 'potence', 'spiritus'],
        weakness: 'Ne peuvent créer ni lien de sang ni goule. Lignée exclusivement féminine.',
    },
    anda: {
        label: 'Anda', kind: 'bloodline', disciplines: ['animalism', 'fortitude', 'protean'],
        weakness: "Pendant la première heure après le coucher du soleil et la dernière avant l'aube, réserves plafonnées par la Route comme en plein jour.",
    },
    baali: {
        label: 'Baali', kind: 'bloodline', disciplines: ['daimonion', 'presence', 'obfuscate'],
        weakness: 'Toute personne qui brandit un symbole religieux contre eux compte comme ayant +1 en Foi véritable.',
    },
    bonsam: {
        label: 'Bonsam', kind: 'bloodline', disciplines: ['abombwe', 'obfuscate', 'potence'],
        weakness: 'Les mortels qui le voient sous sa vraie forme et ratent un jet de Courage (diff 7) fuient ou s’arment contre lui.',
    },
    danava: {
        label: 'Danava', kind: 'bloodline', disciplines: ['dominate', 'fortitude', 'thaumaturgy'],
        weakness: "Le sang animal ne les nourrit pas ; sans un rituel d'offrande, le sang humain ne nourrit qu'à moitié.",
    },
    children_of_osiris: {
        label: "Enfants d'Osiris", kind: 'bloodline', disciplines: ['bardo'], originClan: true,
        weakness: "Celle du clan d'origine ; ne peuvent plus étreindre.",
    },
    gargoyles: {
        label: 'Gargouilles', kind: 'bloodline', disciplines: ['flight', 'fortitude', 'potence'], playable: false,
        weakness: 'Seule au monde, toutes ses réserves sont divisées par 2 ; Volonté −2 pour résister au contrôle mental.',
    },
    giovani: {
        label: 'Giovani', kind: 'bloodline', disciplines: ['auspex', 'fortitude', 'necromancy'],
        weakness: 'Teint cendreux qui trahit leur nature aux humains ; le Baiser des plus proches d’Augustus est atrocement douloureux.',
        // P-2 : 11ᵉ Génération ou plus puissante — rappel non bloquant
        effects: { minGenerationBackground: 1 },
    },
    impundulu: {
        label: 'Impundulu', kind: 'bloodline', disciplines: ['necromancy', 'fortitude', 'presence'],
        weakness: 'Ne se nourrit que des sorcières Bomkazi, ses égales et non ses servantes.',
    },
    kiasyd: {
        label: 'Kiasyd', kind: 'bloodline', disciplines: ['mytherceria'], originClan: true,
        weakness: 'Marque féerique visible ; le fer froid leur inflige des dégâts aggravés et déclenche un jet de frénésie ou de Rötschreck.',
    },
    lamiae: {
        label: 'Lamiae', kind: 'bloodline', disciplines: ['fortitude', 'necromancy', 'potence'],
        weakness: 'Leur morsure transmet la Graine de Lilith (1 létal par nuit pendant quinze jours, Vigueur diff 7 pour résister).',
    },
    lhiannan: {
        label: 'Lhiannan', kind: 'bloodline', disciplines: ['animalism', 'presence', 'ogham'],
        weakness: "À chaque Étreinte, la Génération du sire augmente de 1 ; hors de la nature, −1 dé par semaine (cumulatif, sans descendre sous la Vigueur).",
    },
    nagaraja: {
        label: 'Nagaraja', kind: 'bloodline', disciplines: ['auspex', 'dominate', 'necromancy'],
        weakness: 'Doivent manger de la chair crue ; Handicaps Morsure déchirée et Mangeur de chair sans points ; +2 dés de dégâts en morsure.',
        effects: { imposedFlaws: ['ragged_bite', 'flesh_eater'] },
    },
    niktuku: {
        label: 'Niktuku', kind: 'bloodline', disciplines: ['auspex', 'celerity', 'potence'],
        weakness: "Le sang humain ne nourrit qu'au tiers ; tous les cent ans, −1 Apparence reporté sur un Attribut physique.",
    },
    ramanga: {
        label: 'Ramanga', kind: 'bloodline', disciplines: ['obtenebration', 'obfuscate', 'presence'],
        weakness: "Présence et Aizina contre autrui à +1 diff, sauf s'il possède un morceau physique de la victime.",
    },
    true_brujah: {
        label: 'Vrais Brujah', kind: 'bloodline', disciplines: ['potence', 'presence', 'temporis'],
        weakness: '+2 diff à tous les jets de Conscience et de Conviction (max 9) ; Conscience, Conviction et Route coûtent le double en XP.',
        effects: { xpDouble: ['virtue_moral', 'road'] },
    },
};

export const CLAN_ORDER = Object.keys(CLANS);

/** Clans dont on peut être le clan d'origine (Enfants d'Osiris, Kiasyd) */
export const ORIGIN_CLAN_CHOICES = CLAN_ORDER.filter(k => CLANS[k].kind === 'clan' && k !== 'caitiff');
