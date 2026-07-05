// src/client/src/systems/achtung/config/weaponCatalog.js
// ─────────────────────────────────────────────────────────────────────────────
// Catalogue statique d'armes — dépouillé des tableaux du bouquin (Chapter 7 —
// Tools of the Trade, sections alliées et allemandes).
//
// `type`   : catégorie de classement, = section du bouquin (FR), indépendante
//            de la mécanique. 7 valeurs : 'Armes de mêlée', 'Armes de mêlée
//            exotiques', 'Armes de poing', 'Fusils', 'Mitraillettes et
//            mitrailleuses', 'Armes lourdes et ordonnance', 'Grenades et
//            bombes', 'Armes à distance exotiques'.
// `focus`  : colonne FOCUS du bouquin (mécanique réelle du jet d'attaque,
//            sans rapport avec `type`).
// `faction`: enum strict 'allied' | 'german'.
// `salvo`  : effet OPTIONNEL choisi par le joueur au moment du tir (coûte 1
//            munition).
// `effect` : effet INNÉ, toujours actif, gratuit (embarqué dans la colonne
//            STRESS du bouquin, ou armes de mêlée sans colonne SALVO).
// `size`   : 'Minor' | 'Major' ("Trivial" du bouquin mappé sur 'Minor').
//
// Hors scope : armure, accessoires (Suppressor, Minox Camera), "3 per Minor"
// des grenades (regroupement munitions, géré à table).
// ─────────────────────────────────────────────────────────────────────────────

export const FACTION_LABELS = {
    allied: 'Alliée',
    german: 'Allemande',
};

export const WEAPON_CATALOG = [

    // MÊLÉE — ALLIÉ (Common Melee Weapons)
    { name: 'Hache',                              type: 'Armes de mêlée', faction: 'allied', focus: 'Armes de mêlée',     range: 'contact', damage: 3, size: 'Minor', salvo: [], effect: [{ key: 'vicious' }], qualities: [] },
    { name: 'Matraque',                            type: 'Armes de mêlée', faction: 'allied', focus: 'Armes de mêlée',     range: 'contact', damage: 3, size: 'Minor', salvo: [], effect: [], qualities: ['subtle'] },
    { name: 'Baïonnette',                          type: 'Armes de mêlée', faction: 'allied', focus: 'Armes de mêlée',     range: 'contact', damage: 3, size: 'Minor', salvo: [], effect: [{ key: 'piercing', value: 1 }], qualities: [] },
    { name: 'Batte',                               type: 'Armes de mêlée', faction: 'allied', focus: 'Armes de mêlée',     range: 'contact', damage: 3, size: 'Major', salvo: [], effect: [{ key: 'stun' }], qualities: [] },
    { name: 'Poing américain',                     type: 'Armes de mêlée', faction: 'allied', focus: 'Main nue',          range: 'contact', damage: 2, size: 'Minor', salvo: [], effect: [{ key: 'stun' }], qualities: ['hidden'] },
    { name: 'Outil de tranchée',                   type: 'Armes de mêlée', faction: 'allied', focus: 'Armes de mêlée',     range: 'contact', damage: 3, size: 'Minor', salvo: [], effect: [], qualities: [] },
    { name: 'Couteau de combat Fairbairn-Sykes',   type: 'Armes de mêlée', faction: 'allied', focus: 'Armes de mêlée',     range: 'contact', damage: 2, size: 'Minor', salvo: [], effect: [{ key: 'piercing', value: 1 }], qualities: ['hidden', 'subtle'] },
    { name: 'Hache de pompier',                    type: 'Armes de mêlée', faction: 'allied', focus: 'Armes de mêlée',     range: 'contact', damage: 4, size: 'Major', salvo: [], effect: [{ key: 'vicious' }], qualities: [] },
    { name: 'Garrot',                              type: 'Armes de mêlée', faction: 'allied', focus: 'Main nue',          range: 'contact', damage: 3, size: 'Minor', salvo: [], effect: [{ key: 'snare' }], qualities: ['hidden', 'subtle'] },
    { name: 'Sabre',                               type: 'Armes de mêlée', faction: 'allied', focus: 'Armes de mêlée',     range: 'contact', damage: 3, size: 'Major', salvo: [], effect: [{ key: 'piercing', value: 1 }], qualities: ['parrying'] },
    { name: 'Crosse de fusil',                     type: 'Armes de mêlée', faction: 'allied', focus: 'Armes de mêlée',     range: 'contact', damage: 3, size: 'Minor', salvo: [], effect: [], qualities: [] },
    { name: 'Couteau de pouce',                    type: 'Armes de mêlée', faction: 'allied', focus: 'Armes de mêlée',     range: 'contact', damage: 1, size: 'Minor', salvo: [], effect: [{ key: 'piercing', value: 1 }], qualities: ['hidden', 'subtle'] },
    { name: 'Couteau de tranchée',                 type: 'Armes de mêlée', faction: 'allied', focus: 'Armes de mêlée',     range: 'contact', damage: 3, size: 'Minor', salvo: [], effect: [{ key: 'vicious' }], qualities: ['hidden'] },
    { name: "Couteau d'évasion M19",               type: 'Armes de mêlée', faction: 'allied', focus: 'Armes de mêlée',     range: 'contact', damage: 2, size: 'Minor', salvo: [], effect: [{ key: 'piercing', value: 1 }], qualities: ['hidden', 'subtle'] },

    // MÊLÉE EXOTIQUE — ALLIÉ (Exotic Melee Weapons)
    { name: 'Épée large (Broadsword)', type: 'Armes de mêlée exotiques', faction: 'allied', focus: 'Exotique', range: 'contact', damage: 5, size: 'Major', salvo: [], effect: [], qualities: [] },
    { name: 'Lance',                   type: 'Armes de mêlée exotiques', faction: 'allied', focus: 'Exotique', range: 'contact', damage: 4, size: 'Major', salvo: [], effect: [{ key: 'piercing', value: 1 }], qualities: [] },
    { name: 'Épée',                    type: 'Armes de mêlée exotiques', faction: 'allied', focus: 'Exotique', range: 'contact', damage: 4, size: 'Major', salvo: [], effect: [], qualities: ['parrying'] },

    // ARMES DE POING — ALLIÉ (Handguns)
    { name: 'Pistolet dissimulé',                       type: 'Armes de poing', faction: 'allied', focus: 'Armes de poing', range: 'close', damage: 3, size: 'Minor', salvo: [{ key: 'vicious' }], effect: [], qualities: ['close_quarters', 'hidden'] },
    { name: 'Browning Hi-Power Pistol',                 type: 'Armes de poing', faction: 'allied', focus: 'Armes de poing', range: 'close', damage: 5, size: 'Minor', salvo: [{ key: 'vicious' }], effect: [], qualities: ['close_quarters'] },
    { name: 'Enfield No.2 .38/200 Service Revolver',    type: 'Armes de poing', faction: 'allied', focus: 'Armes de poing', range: 'close', damage: 4, size: 'Minor', salvo: [{ key: 'vicious' }], effect: [], qualities: ['close_quarters', 'reliable'] },
    { name: 'Enpen Mk.I',                               type: 'Armes de poing', faction: 'allied', focus: 'Armes de poing', range: 'close', damage: 2, size: 'Minor', salvo: [{ key: 'vicious' }], effect: [], qualities: ['close_quarters', 'subtle'] },
    { name: 'High Standard HDM Pistol',                 type: 'Armes de poing', faction: 'allied', focus: 'Armes de poing', range: 'close', damage: 3, size: 'Minor', salvo: [{ key: 'vicious' }], effect: [], qualities: ['close_quarters', 'subtle'] },
    { name: 'M1911A1',                                  type: 'Armes de poing', faction: 'allied', focus: 'Armes de poing', range: 'close', damage: 4, size: 'Minor', salvo: [{ key: 'vicious' }], effect: [], qualities: ['close_quarters', 'hidden'] },
    { name: 'MAB Modèle D Pistol',                      type: 'Armes de poing', faction: 'allied', focus: 'Armes de poing', range: 'close', damage: 3, size: 'Minor', salvo: [{ key: 'vicious' }], effect: [], qualities: ['close_quarters'] },
    { name: 'MAS Modèle 1873 Revolver',                 type: 'Armes de poing', faction: 'allied', focus: 'Armes de poing', range: 'close', damage: 4, size: 'Minor', salvo: [{ key: 'vicious' }], effect: [], qualities: ['close_quarters'] },
    { name: 'Welrod Mk.IIA Pistol',                     type: 'Armes de poing', faction: 'allied', focus: 'Armes de poing', range: 'close', damage: 3, size: 'Minor', salvo: [{ key: 'vicious' }], effect: [], qualities: ['close_quarters', 'subtle'] },

    // FUSILS ET FUSILS À POMPE — ALLIÉ (Rifles and Shotguns)
    { name: 'Berthier Modèle 1892 M16 Carbine',  type: 'Fusils', faction: 'allied', focus: 'Fusils',      range: 'medium', damage: 5, size: 'Major', salvo: [{ key: 'vicious' }], effect: [], qualities: ['reliable'] },
    { name: 'De Lisle Commando Carbine Mk.I',    type: 'Fusils', faction: 'allied', focus: 'Fusils',      range: 'medium', damage: 4, size: 'Major', salvo: [{ key: 'vicious' }], effect: [], qualities: ['subtle'] },
    { name: 'Lee-Enfield Rifle',                 type: 'Fusils', faction: 'allied', focus: 'Fusils',      range: 'medium', damage: 6, size: 'Major', salvo: [{ key: 'vicious' }], effect: [], qualities: ['reliable'] },
    { name: 'M1 Carbine',                        type: 'Fusils', faction: 'allied', focus: 'Fusils',      range: 'medium', damage: 4, size: 'Major', salvo: [{ key: 'vicious' }], effect: [], qualities: ['reliable'] },
    { name: 'M1 Garand Rifle',                   type: 'Fusils', faction: 'allied', focus: 'Fusils',      range: 'medium', damage: 5, size: 'Major', salvo: [{ key: 'vicious' }], effect: [], qualities: ['reliable'] },
    { name: 'MAS Modèle 1936 Rifle',             type: 'Fusils', faction: 'allied', focus: 'Fusils',      range: 'medium', damage: 5, size: 'Major', salvo: [{ key: 'vicious' }], effect: [], qualities: ['reliable'] },
    { name: 'Springfield M1903',                 type: 'Fusils', faction: 'allied', focus: 'Fusils',      range: 'long',   damage: 5, size: 'Major', salvo: [{ key: 'vicious' }], effect: [], qualities: ['reliable', 'accurate'] },
    { name: 'Winchester M12 Shotgun',            type: 'Fusils', faction: 'allied', focus: 'Rapproché',   range: 'close',  damage: 5, size: 'Major', salvo: [{ key: 'vicious' }], effect: [], qualities: ['reliable', 'inaccurate'] },

    // MITRAILLETTES ET MITRAILLEUSES — ALLIÉ
    { name: 'Bren Machine Gun',                          type: 'Mitraillettes et mitrailleuses', faction: 'allied', focus: 'Fusils',      range: 'medium', damage: 5, size: 'Major', salvo: [{ key: 'area' }], effect: [], qualities: ['inaccurate', 'unwieldy'] },
    { name: 'Browning Automatic Rifle (BAR)',            type: 'Mitraillettes et mitrailleuses', faction: 'allied', focus: 'Fusils',      range: 'medium', damage: 5, size: 'Major', salvo: [{ key: 'area' }], effect: [], qualities: ['inaccurate', 'unwieldy'] },
    { name: 'Browning M1919 Machine Gun',                type: 'Mitraillettes et mitrailleuses', faction: 'allied', focus: 'Armes lourdes', range: 'medium', damage: 7, size: 'Major', salvo: [{ key: 'area' }], effect: [], qualities: ['escalation', 'inaccurate', 'unwieldy'] },
    { name: 'Johnson M1941 Machine Gun',                 type: 'Mitraillettes et mitrailleuses', faction: 'allied', focus: 'Fusils',      range: 'medium', damage: 5, size: 'Major', salvo: [{ key: 'area' }], effect: [], qualities: ['inaccurate', 'unwieldy'] },
    { name: 'MAC Modèle 1924 M29 Machine Gun',           type: 'Mitraillettes et mitrailleuses', faction: 'allied', focus: 'Fusils',      range: 'medium', damage: 5, size: 'Major', salvo: [{ key: 'area' }], effect: [], qualities: ['inaccurate', 'unwieldy'] },
    { name: 'Pistolet Mitrailleur Erma Modèle 1935 (EMP-35)', type: 'Mitraillettes et mitrailleuses', faction: 'allied', focus: 'Fusils', range: 'medium', damage: 5, size: 'Major', salvo: [{ key: 'stun' }], effect: [], qualities: ['inaccurate', 'unreliable'] },
    { name: 'Sten Mk IIS Suppressed SMG',                type: 'Mitraillettes et mitrailleuses', faction: 'allied', focus: 'Rapproché',   range: 'close',  damage: 3, size: 'Major', salvo: [{ key: 'stun' }], effect: [], qualities: ['inaccurate', 'subtle'] },
    { name: 'Sten Mk.V Submachine Gun',                  type: 'Mitraillettes et mitrailleuses', faction: 'allied', focus: 'Rapproché',   range: 'close',  damage: 4, size: 'Major', salvo: [{ key: 'stun' }], effect: [], qualities: ['inaccurate'] },
    { name: 'Thompson Submachine Gun',                   type: 'Mitraillettes et mitrailleuses', faction: 'allied', focus: 'Rapproché',   range: 'close',  damage: 4, size: 'Major', salvo: [{ key: 'stun' }], effect: [], qualities: ['inaccurate'] },
    { name: 'United Defence M42 Submachine Gun',         type: 'Mitraillettes et mitrailleuses', faction: 'allied', focus: 'Rapproché',   range: 'close',  damage: 4, size: 'Major', salvo: [{ key: 'stun' }], effect: [], qualities: ['inaccurate'] },
    { name: 'Vickers Machine Gun',                       type: 'Mitraillettes et mitrailleuses', faction: 'allied', focus: 'Armes lourdes', range: 'medium', damage: 7, size: 'Major', salvo: [{ key: 'area' }], effect: [], qualities: ['escalation', 'inaccurate', 'unwieldy'] },

    // ARMES LOURDES ET ORDONNANCE — ALLIÉ
    { name: 'Boys Anti-Tank Rifle',                          type: 'Armes lourdes et ordonnance', faction: 'allied', focus: 'Armes lourdes', range: 'long',    damage: 7, size: 'Major', salvo: [{ key: 'vicious' }], effect: [], qualities: ['accurate', 'cumbersome', 'escalation', 'heavy'] },
    { name: 'Lifebuoy Portable Flamethrower No.2 Mk.II',     type: 'Armes lourdes et ordonnance', faction: 'allied', focus: 'Armes lourdes', range: 'close', damage: 5, size: 'Major', salvo: [{ key: 'area' }], effect: [{ key: 'persistent', value: 4 }], qualities: ['escalation', 'debilitating'] },
    { name: 'M1A1 Bazooka',                                  type: 'Armes lourdes et ordonnance', faction: 'allied', focus: 'Armes lourdes', range: 'medium', damage: 6, size: 'Major', salvo: [], effect: [{ key: 'vicious' }], qualities: ['cumbersome', 'escalation', 'giant_killer', 'heavy', 'inaccurate', 'munition'] },
    { name: 'M2 Mortar',                                     type: 'Armes lourdes et ordonnance', faction: 'allied', focus: 'Armes lourdes', range: 'extreme', damage: 7, size: 'Major', salvo: [{ key: 'stun' }], effect: [{ key: 'area' }], qualities: ['escalation', 'heavy', 'indirect'] },
    { name: 'M9 Bazooka',                                    type: 'Armes lourdes et ordonnance', faction: 'allied', focus: 'Armes lourdes', range: 'medium', damage: 6, size: 'Major', salvo: [], effect: [{ key: 'piercing', value: 1 }, { key: 'vicious' }], qualities: ['cumbersome', 'escalation', 'giant_killer', 'heavy', 'inaccurate', 'munition'] },
    { name: 'PIAT Anti-Tank Weapon',                         type: 'Armes lourdes et ordonnance', faction: 'allied', focus: 'Armes lourdes', range: 'medium', damage: 6, size: 'Major', salvo: [], effect: [{ key: 'piercing', value: 1 }, { key: 'vicious' }], qualities: ['cumbersome', 'escalation', 'giant_killer', 'heavy', 'inaccurate', 'munition'] },
    { name: '2-Inch Mortar',                                 type: 'Armes lourdes et ordonnance', faction: 'allied', focus: 'Armes lourdes', range: 'extreme', damage: 6, size: 'Minor', salvo: [{ key: 'stun' }], effect: [{ key: 'area' }], qualities: ['escalation', 'heavy', 'indirect'] },

    // GRENADES ET BOMBES — ALLIÉ
    { name: '1½lbs/3lbs Standard Charge',         type: 'Grenades et bombes', faction: 'allied', focus: 'Démolition', range: 'close', damage: 10, size: 'Minor', salvo: [{ key: 'intense' }], effect: [{ key: 'area' }, { key: 'stun' }], qualities: [] },
    { name: 'GP Grenade',                         type: 'Grenades et bombes', faction: 'allied', focus: 'Lancer',     range: 'close', damage: 6,  size: 'Minor', salvo: [], effect: [{ key: 'area' }, { key: 'vicious' }], qualities: ['inaccurate', 'munition'] },
    { name: 'Mills Bomb (No.36M)',                type: 'Grenades et bombes', faction: 'allied', focus: 'Lancer',     range: 'close', damage: 6,  size: 'Minor', salvo: [], effect: [{ key: 'area' }, { key: 'stun' }], qualities: ['inaccurate', 'munition'] },
    { name: 'Mills Bomb, Rifle Variant',          type: 'Grenades et bombes', faction: 'allied', focus: 'Fusils',     range: 'medium', damage: 6, size: 'Minor', salvo: [], effect: [{ key: 'area' }, { key: 'stun' }], qualities: ['inaccurate', 'munition'] },
    { name: 'Pineapple Grenade (M17)',            type: 'Grenades et bombes', faction: 'allied', focus: 'Lancer',     range: 'close', damage: 6,  size: 'Minor', salvo: [], effect: [{ key: 'area' }, { key: 'stun' }], qualities: ['inaccurate', 'munition'] },
    { name: 'Pineapple Grenade, Rifle Variant',   type: 'Grenades et bombes', faction: 'allied', focus: 'Fusils',     range: 'medium', damage: 6, size: 'Minor', salvo: [], effect: [{ key: 'area' }, { key: 'stun' }], qualities: ['inaccurate', 'munition'] },
    { name: 'Tyrebuster',                         type: 'Grenades et bombes', faction: 'allied', focus: 'Lancer',     range: 'close', damage: 6,  size: 'Minor', salvo: [], effect: [{ key: 'area' }, { key: 'piercing', value: 1 }], qualities: ['cumbersome', 'inaccurate', 'munition'] },

    // ARMES À DISTANCE EXOTIQUES — ALLIÉ
    { name: 'Bow',       type: 'Armes à distance exotiques', faction: 'allied', focus: 'Exotique', range: 'medium', damage: 3, size: 'Major', salvo: [{ key: 'vicious' }], effect: [{ key: 'piercing', value: 1 }], qualities: ['reliable', 'subtle'] },
    { name: 'Longbow',   type: 'Armes à distance exotiques', faction: 'allied', focus: 'Exotique', range: 'long',   damage: 5, size: 'Major', salvo: [{ key: 'vicious' }], effect: [{ key: 'piercing', value: 1 }], qualities: ['reliable', 'subtle'] },
    { name: 'Crossbow',  type: 'Armes à distance exotiques', faction: 'allied', focus: 'Exotique', range: 'medium', damage: 4, size: 'Major', salvo: [], effect: [{ key: 'piercing', value: 1 }], qualities: ['reliable', 'subtle'] },

    // MÊLÉE — ALLEMAND (German Melee Weapons)
    { name: 'Kampfmesser 42 Knife',           type: 'Armes de mêlée', faction: 'german', focus: 'Armes de mêlée', range: 'contact', damage: 1, size: 'Minor', salvo: [], effect: [{ key: 'piercing', value: 1 }], qualities: ['hidden', 'subtle'] },
    { name: 'Luftwaffe Flight Utility Knife', type: 'Armes de mêlée', faction: 'german', focus: 'Armes de mêlée', range: 'contact', damage: 2, size: 'Minor', salvo: [], effect: [{ key: 'piercing', value: 1 }], qualities: ['hidden', 'subtle'] },
    { name: 'SS Dagger',                      type: 'Armes de mêlée', faction: 'german', focus: 'Armes de mêlée', range: 'contact', damage: 2, size: 'Minor', salvo: [], effect: [{ key: 'piercing', value: 1 }], qualities: ['subtle'] },

    // ARMES DE POING — ALLEMAND
    { name: 'Luger Pistol',                 type: 'Armes de poing', faction: 'german', focus: 'Armes de poing', range: 'close', damage: 4, size: 'Minor', salvo: [{ key: 'vicious' }], effect: [], qualities: ['close_quarters'] },
    { name: 'Walther P Series (P38)',       type: 'Armes de poing', faction: 'german', focus: 'Armes de poing', range: 'close', damage: 3, size: 'Minor', salvo: [{ key: 'vicious' }], effect: [], qualities: ['close_quarters', 'hidden', 'reliable'] },

    // FUSILS ET FUSILS D'ASSAUT — ALLEMAND
    { name: 'Fallschirmjägergewehr (FG 42)',         type: 'Fusils', faction: 'german', focus: 'Fusils', range: 'medium', damage: 5, size: 'Major', salvo: [{ key: 'stun' }],    effect: [], qualities: ['inaccurate'] },
    { name: 'Gewehr/Karabiner 43 (G/K43)',           type: 'Fusils', faction: 'german', focus: 'Fusils', range: 'medium', damage: 5, size: 'Major', salvo: [{ key: 'vicious' }], effect: [], qualities: ['reliable'] },
    { name: 'Karabiner 98k (Kar. 98k)',              type: 'Fusils', faction: 'german', focus: 'Fusils', range: 'medium', damage: 5, size: 'Major', salvo: [{ key: 'vicious' }], effect: [], qualities: ['reliable'] },
    { name: 'Karabiner 98k (Sniper Variant)',        type: 'Fusils', faction: 'german', focus: 'Fusils', range: 'long',  damage: 5, size: 'Major', salvo: [{ key: 'vicious' }], effect: [], qualities: ['accurate', 'reliable'] },
    { name: 'Sturmgewehr 44 (StG 44)',               type: 'Fusils', faction: 'german', focus: 'Fusils', range: 'medium', damage: 5, size: 'Major', salvo: [{ key: 'stun' }],    effect: [], qualities: ['unreliable'] },

    // MITRAILLETTES ET MITRAILLEUSES — ALLEMAND
    { name: 'Maschinengewehr 42 (MG 42)',   type: 'Mitraillettes et mitrailleuses', faction: 'german', focus: 'Fusils',       range: 'medium', damage: 6, size: 'Major', salvo: [{ key: 'area' }], effect: [], qualities: ['inaccurate'] },
    { name: 'Maschinenpistole 40 (MP 40)',  type: 'Mitraillettes et mitrailleuses', faction: 'german', focus: 'Rapproché',    range: 'close',  damage: 4, size: 'Major', salvo: [{ key: 'stun' }], effect: [], qualities: ['reliable'] },
    { name: 'Maschinengewehr 131 (MG 131)', type: 'Mitraillettes et mitrailleuses', faction: 'german', focus: 'Armes lourdes', range: 'medium', damage: 7, size: 'Major', salvo: [{ key: 'area' }], effect: [], qualities: ['reliable'] },

    // ARMES LOURDES — ALLEMAND
    { name: 'Flammenwerfer 41 (FmW 41)',           type: 'Armes lourdes et ordonnance', faction: 'german', focus: 'Armes lourdes', range: 'medium', damage: 5, size: 'Major', salvo: [{ key: 'area' }],  effect: [{ key: 'persistent', value: 4 }], qualities: ['debilitating', 'escalation'] },
    { name: 'Granatwerfer 36 (GrW 36) Mortier',    type: 'Armes lourdes et ordonnance', faction: 'german', focus: 'Armes lourdes', range: 'extreme', damage: 7, size: 'Major', salvo: [{ key: 'stun' }], effect: [{ key: 'area' }], qualities: ['escalation', 'heavy', 'indirect'] },
    { name: 'Panzerfaust 60',                      type: 'Armes lourdes et ordonnance', faction: 'german', focus: 'Armes lourdes', range: 'long',   damage: 5, size: 'Major', salvo: [], effect: [{ key: 'piercing', value: 1 }, { key: 'vicious' }], qualities: ['cumbersome', 'escalation', 'giant_killer', 'heavy', 'inaccurate', 'munition'] },

    // GRENADES — ALLEMAND
    { name: 'Stielhandgranate 24', type: 'Grenades et bombes', faction: 'german', focus: 'Lancer', range: 'close', damage: 5, size: 'Major', salvo: [], effect: [{ key: 'area' }, { key: 'stun' }], qualities: ['munition'] },
];