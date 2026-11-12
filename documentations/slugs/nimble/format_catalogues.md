# Nimble : format des catalogues (contrat de données)

Document de travail du slug `nimble` (spec : `documentations/spec_nimble.md`). Il fixe la forme des
catalogues JavaScript transcrits depuis les PDF Nimble 3.x et le glossaire français commun. Tout
fichier de catalogue le respecte : le code de la fiche lit ces champs tels quels.

## 0. Règles générales

- **Source qui fait foi** : PDF Nimble 3.x (`X:\jdr\Nimble\CoreBooks3.0\` : Core Rules 3.3, livrets de
  classe 3.0, Zephyr 3.1, GM's Guide 3.0). Textes extraits en UTF-8 dans
  `C:\Users\mentiss\AppData\Local\Temp\claude\20aa7440df8b6157\b67a6bd7-a17b-4ca1-a3c2-ca177431e658\scratchpad\nimble\*.txt`
  (même nom que le PDF). Le vault Obsidian (`X:\jdr\Nimble\Nimble Vault\`) est en **2.0.3** : il ne sert
  qu'à comprendre une mise en page cassée, jamais à reprendre une valeur qui diffère des PDF 3.x.
- **Langue** : tout texte affiché est **traduit en français** (tutoiement exclu : textes de règles à la 2ᵉ
  personne du pluriel, « vous »). Chaque élément nommé garde son nom anglais dans `vo`.
  Traduction fidèle et complète (pas de résumé), sobre, sans ajout de règle.
- **Code** : clés en anglais `snake_case` tirées du nom VO (`hunters_mark`, `flame_dart`).
- Fichiers ES modules (`export default …` ou `export const …`), indentation 4 espaces, chaînes entre
  apostrophes simples (échapper `\'`) ou backticks si plusieurs lignes. Un commentaire d'en-tête :
  chemin du fichier, source (PDF + pages), une ligne sur le contenu.
- Mise en forme autorisée dans les textes : `**gras**` (noms de capacités), `*italique*`, retour à la
  ligne `\n`, puces `• `. Rien d'autre (pas de HTML).
- Notation des **formules** (chaînes évaluées par l'app) : nombres, `+ - * ( )`, et les jetons
  `STR DEX INT WIL` (valeur de la caractéristique), `KEY` (la meilleure des deux caractéristiques
  clés), `LVL` (niveau). Ex. `'3*INT+LVL'`, `'2*WIL'`, `'KEY'`, `'1'`.
- Notation des **dés** : `'1d8'`, `'2d6'`, `'3d4'`, `'1d20'`, `'d66'`, `'d44'`, `'d88'` ; nombre de dés
  tiré d'une formule : `'WILd8'`, `'KEYd6'`, `'LVLd4'` (le jeton remplace le nombre).

## 1. Glossaire (imposé)

| VO | FR | | VO | FR |
|---|---|---|---|---|
| STR / DEX / INT / WIL | FOR / DEX / INT / VOL | | Key Stat / KEY | caractéristique clé / CLÉ |
| Secondary Stat | caractéristique secondaire | | LVL / level | NIV / niveau |
| Arcana | Arcanes | | Examination | Examen |
| Finesse | Finesse | | Influence | Influence |
| Insight | Intuition | | Lore | Savoir |
| Might | Puissance | | Naturecraft | Nature |
| Perception | Perception | | Stealth | Discrétion |
| Hit Points (HP) | points de vie (PV) | | Temp HP | PV temporaires |
| Wounds | Blessures | | Hit Dice | dés de vie |
| Defense / Armor | Défense / armure | | Initiative / Speed | Initiative / Vitesse |
| Save | sauvegarde (jet de) | | skill check | test de compétence |
| advantage / disadvantage | avantage / désavantage | | DC | DD |
| Primary Die | dé primaire | | crit / critical hit | critique |
| miss | raté | | Vicious | Féroce |
| Rushed Attacks | attaques précipitées | | Reach / Range | Allonge / Portée |
| AoE | zone | | Cone / Line | cône / ligne |
| Action / Reaction | action / réaction | | Free (action) | gratuit(e) |
| Defend | Se défendre | | Interpose | S'interposer |
| Opportunity Attack | attaque d'opportunité | | Help | Aider |
| Assess | Évaluer | | Move | Se déplacer |
| encounter | rencontre | | round / turn | round / tour |
| Safe Rest | repos sûr | | Field Rest | repos de terrain |
| Catch Breath / Make Camp | Reprendre son souffle / Monter le camp | | downtime | intermède |
| Cantrip | tour de magie | | Tier (spell) | rang |
| Upcast | amplification | | mana | mana |
| Concentration | concentration | | spell school | école de magie |
| Bloodied | en sang | | Dying | mourant |
| Blind | aveuglé | | Dazed | étourdi |
| Empowered / Weakened X | renforcé / affaibli X | | Frightened | effrayé |
| Incapacitated | neutralisé | | Invisible | invisible |
| Poisoned | empoisonné | | Prone | à terre |
| Restrained | immobilisé | | Grappled / Grapple | agrippé / agripper |
| Silenced | réduit au silence | | Slowed | ralenti |
| Taunted / Taunt | provoqué / provoquer | | Charmed | charmé |
| Hampered | entravé | | Smoldering | fumant |
| Charged | chargé | | Distracted | distrait |
| Knockback | repousser (repoussé de X) | | Difficult Terrain | terrain difficile |
| Cover / Full Cover | abri / abri total | | Teleport | se téléporter |
| Resistant / Vulnerable | résistant / vulnérable | | minion | sbire |
| Legendary monster | monstre légendaire | | Last Stand | Baroud d'honneur |
| Boon / Epic Boon | faveur / faveur épique | | Quarry | proie |
| gp / sp | po / pa | | inventory slots | emplacements |
| bludgeoning / piercing / slashing | contondant / perforant / tranchant | | fire / ice / lightning | feu / glace / foudre |
| radiant / necrotic / psychic | radiant / nécrotique / psychique | | wind | vent |

Classes : Berserker → **Berserker** ; The Cheat → **le Tricheur** ; Commander → **Commandant** ;
Hunter → **Chasseur** ; Mage → **Mage** ; Oathsworn → **Assermenté** ; Shadowmancer → **Ombromancien** ;
Shepherd → **Berger** ; Songweaver → **Tisse-chant** ; Stormshifter → **Mue-tempête** ; Zephyr → **Zéphyr**.
Noms de capacités, sorts, sous-classes, objets, monstres : traduction libre mais évocatrice et
cohérente d'un fichier à l'autre (ex. Thrill of the Hunt → « Frisson de la traque »).

## 2. Classes — `config/classes/<key>.js`

Un fichier par classe (`berserker`, `cheat`, `commander`, `hunter`, `mage`, `oathsworn`, `shadowmancer`,
`shepherd`, `songweaver`, `stormshifter`, `zephyr`), `export default { … }` :

```js
export default {
    key: 'hunter', name: 'Chasseur', vo: 'Hunter',
    tagline: 'Gardien de la Nature',            // sous-titre du livret (« Keeper of the Wild »)
    summary: '…',                               // 2-3 phrases : le pitch du livret (les 3 phrases d'accroche)
    complexity: 2,                              // nombre de cases pleines [f] de « Class complexity »
    keyStats: ['dex', 'wil'],                   // clés : str dex int wil
    hitDie: 8, startingHp: 13,
    saves: { adv: 'dex', dis: 'int' },
    armor:   { text: 'Armures de cuir', types: ['cloth', 'leather'] },   // types : cloth leather mail plate shield
    weapons: { text: 'Armes de DEX', rule: { stats: ['dex'] } },
    startingGear: [{ key: 'shortbow' }, { key: 'cheap_hides' }, { key: 'dagger' }, { key: 'hunting_trap' }],
    resources: [ … ],                           // §2.3
    spellcasting: null,                         // §2.4
    levels: { 1: [ …features ], 2: [ … ], …, 20: [ … ] },   // les 20 niveaux, dans l'ordre du livret
    options: { … },                             // §2.2 : listes de choix de la classe
    subclasses: [ … ],                          // §2.5
    spells: [ … ],                              // sorts propres à la classe (format §3), sinon []
    faq: [{ q: '…', a: '…' }],                  // FAQ du livret, traduite
};
```

**Règle d'armes** (`weapons.rule`), maîtrise de l'arme : `{ all: true }` (toutes, ex. « All Martial
Weapons ») ; `{ stats: ['dex'] }` (armes de DEX : arme dont la stat de dégâts est DEX, ou STR/DEX) ;
`{ stats: ['str'], range: 'melee' }` (armes de mêlée de FOR) ; `{ tags: ['blade', 'staff', 'wand'] }` ;
`{ range: 'melee', unarmed: true }` (Zéphyr : mêlée et mains nues). Champs combinables : la maîtrise
est acquise si l'une des conditions est vraie (`tags` OU `stats`+`range`). `wand: true` si la classe
maîtrise les baguettes.

**Équipement de départ** : `{ key }` quand l'objet existe dans `config/equipment.js` (§5, clés listées),
sinon `{ name: 'Rations (viande)', qty?: 4 }`. Quantité : `{ key: 'javelins', qty: 4 }`.

### 2.1 Capacité (feature)

```js
{
    key: 'hunters_mark', name: 'Marque du chasseur', vo: "Hunter's Mark",
    cost: '1 action',          // facultatif : '1 action', '2 actions', '0 action', 'réaction', 'réaction gratuite', 'gratuit'
    text: '…',                 // texte complet traduit (sans le nom ni le coût)
    uses: { count: '1', per: 'encounter' },    // facultatif, seulement « (N/encounter) », « (N/Safe Rest) »,
                                               //   « N times/Safe Rest », « (1/day) » : per = encounter | safeRest | day
                                               //   count = formule (« 2×WIL times » → '2*WIL')
    roll: { dice: '1d4', bonus: 'LVL', kind: 'attack', label: 'Morsure' },   // facultatif : jet que l'app peut lancer
                                               //   kind : attack (règles du dé primaire) | heal | plain (somme simple)
    choice: { pool: 'toth', count: 2 },        // facultatif : « choisissez N … » dans options[pool]
    statIncrease: { from: 'key', count: 1 },   // facultatif : « Key Stat Increase » (key) / « Secondary » (secondary)
                                               //   / « +1 to any 2 of your stats » ({ from: 'any', count: 2 })
    subclass: true,                            // facultatif : « Subclass. Choose a … subclass »
    subclassFeature: true,                     // facultatif : « Gain your … subclass feature »
    epicBoon: true,                            // facultatif : « Choose an Epic Boon »
    upgrades: 'toth',                          // facultatif : capacité qui augmente le nombre de choix d'une liste
}
```
Une ligne du livret = une capacité. « Thrill of the Hunt (2). Choose a 3rd ability » →
`{ key: 'thrill_of_the_hunt_3', name: 'Frisson de la traque (3ᵉ)', text: '…', choice: { pool: 'toth', count: 1 } }`.
Les augmentations de caractéristique (« Key Stat Increase. +1 DEX or WIL ») sont des capacités avec
`statIncrease` et un texte. Ne pas inventer de `roll` : seulement quand le texte donne une formule
de dégâts ou de soin explicite (« Attack your Quarry for 1d8+(3×LVL) damage » → `{ dice: '1d8', bonus: '3*LVL', kind: 'attack' }`).

### 2.2 Listes de choix (`options`)

```js
options: {
    toth: { label: 'Frisson de la traque', vo: 'Thrill of the Hunt', text: 'note générale traduite', items: [ …features ] },
}
```
Toute liste où le livret dit « choose » : capacités au choix, manœuvres, chants, etc. Les items sont
des capacités (§2.1). Une liste propre à une sous-classe va dans la sous-classe (`options`).

### 2.3 Ressources (`resources`)

Jauges suivies sur la fiche : mana, charges, dés de classe, usages globaux.
```js
{ key: 'mana', label: 'Mana', max: '3*INT+LVL', fromLevel: 2, reset: 'safeRest' }
{ key: 'toth', label: 'Charges de Frisson', max: null, fromLevel: 2, reset: 'encounter' }   // max null : compteur sans plafond
{ key: 'fury', label: 'Dés de Furie', max: 'KEY', die: 'd6', reset: 'encounter' }           // die : dés posés de côté
```
`maxByLevel: { 1: '…', 5: '…' }` si le plafond change par paliers. N'y mettre que ce que le joueur
coche ou compte vraiment en jeu.

### 2.4 Lanceurs de sorts (`spellcasting`)

```js
spellcasting: { schools: ['fire', 'ice', 'lightning'], tiers: { 2: 1, 4: 2, 6: 3, 8: 4, 10: 5, 12: 6, 14: 7, 16: 8, 18: 9 },
                note: 'texte FR si particularité' }
```
`tiers` : niveau du personnage → rang maximal débloqué (d'après le tableau de la classe). Écoles :
`fire ice lightning wind radiant necrotic`. Les cantrips sont connus dès que l'école l'est.
Une classe qui n'apprend que quelques sorts (pas une école entière) les met dans `spells` (§3).

### 2.5 Sous-classes (`subclasses`)

```js
{ key: 'shadowpath', name: 'Gardien de la Voie des ombres', vo: 'Keeper of the Shadowpath', summary: '…',
  complexity: 2, levels: { 3: [ … ], 7: [ … ], 11: [ … ], 15: [ … ] }, options?: { … }, spells?: [ … ],
  story: true? }   // story : sous-classe « story-based » (ex. Beastmaster), transcrite comme les autres
```

## 3. Sorts — format commun

```js
{
    key: 'flame_dart', name: 'Dard de flamme', vo: 'Flame Dart',
    school: 'fire',                 // fire ice lightning wind radiant necrotic | 'secret' | clé de classe pour un sort de classe
    tier: 0,                        // 0 = tour de magie
    utility: false,                 // true : sort utilitaire
    cost: '1 action',               // '1 action' … '5 actions', '0 action', '1 minute', 'réaction'
    tags: ['aoe'],                  // facultatif : aoe, concentration, reaction, multi (« 1+ target »)
    target: 'Portée 10',            // la ligne de ciblage (Portée/Allonge/Cône…), traduite
    damage: { dice: '1d10', bonus: '', type: 'fire' },   // facultatif ; d66/d44/d88 : { dice: 'd66' }
    save: 'dex',                    // facultatif : « half on DEX save »
    text: '…',                      // effet complet traduit, sans les lignes d'amplification ni de hauts niveaux
    upcast: '+10 dégâts.',          // facultatif, traduit (sans « Upcast : »)
    highLevels: { text: '+5 dégâts tous les 5 niveaux.', every: 5, bonus: 5 },   // facultatif (tours de magie)
    notes: '…',                     // facultatif : encadrés de règle liés (Fumant, D66, Chargé…)
}
```

## 4. Ascendances, historiques, motivations — `config/ancestries.js`, `config/backgrounds.js`, `config/motivations.js`

```js
export const ANCESTRIES = [
  { key: 'dwarf', name: 'Nain', vo: 'Dwarf', rarity: 'common', size: 'medium',   // rarity : common uncommon exotic ; size : small medium large ou 'small|medium'
    text: 'présentation traduite',
    trait: { name: 'Robuste', vo: 'Stout', text: '…' },
    uses: { count: '1', per: 'safeRest' },      // facultatif, comme §2.1
    language: 'dwarvish',                        // facultatif
    effects: { maxHitDice: 2, maxWounds: 1, speed: -1 } },
];
```
Effets automatisables (le reste reste en texte) : `skills: { all: 1 }` ou `{ stealth: 1 }` (clés de
compétences §6), `speed`, `maxWounds`, `maxHitDice`, `defense`, `initiativeAdvantage: true`,
`hitDieStep: 1`, `saves: 'neutralToAdv' | 'disToNeutral'`, `shiftingPoints: 2`.
Historiques : `{ key, name, vo, text, req: { stat: 'int', max: 0 } (facultatif), uses?, effects? }`
(mêmes effets, plus `initiative: 1`, `defense: -1`, `utilitySpell: 1`). Motivations :
`{ key, name, vo, text }` (la phrase en gras = name, les questions = text). Langues : `LANGUAGES`
dans `ancestries.js`, `{ key, name, vo, speakers }`.

## 5. Équipement — `config/equipment.js`

Clés **imposées** (les classes y renvoient) :
- armes de mêlée : `dagger sickle club_mace hand_axe spear short_sword rapier staff longsword battleaxe pole_hammer glaive great_spear greatmaul greataxe greatsword`
- armes à distance : `sling javelins throwing_hammers shortbow longbow crossbow handheld_ballista`
- armures : `adventurers_garb minor_enchantment major_enchantment epic_enchantment cheap_hides ox_hide hard_leather wyrmhide rusty_mail chain_shirt scale_mail dragonscale rusty_plate half_plate full_plate adamantine_plate`
- boucliers : `wooden_buckler iron_shield tower_shield dragon_shield`
- objets clés : `healing_potion greater_healing_potion supreme_healing_potion torch lantern_oil medical_kit`
- divers : nom VO en snake_case (`bell blanket bucket caltrops camping_supplies chain chalk crowbar dice grappling_hook hand_drill hunting_trap instrument iron_tongs large_sack lock_pick magnifying_glass manacles mirror monster_part net padlock_key pitons pulley quiver_ammo rope saw shiny_object shovel soap strange_plant telescope useful_book vial_of_pitch`)

```js
export const WEAPONS = [{ key: 'dagger', name: 'Dague', vo: 'Dagger', range: 'melee', damage: '1d4', stat: 'dex',   // stat : str | dex | 'str/dex'
    damageType: 'piercing', props: [{ key: 'light' }, { key: 'thrown', value: 4 }], req: null,   // req : { str: 2 }
    twoHanded: false, oneHandedReq: null, tags: ['blade'], cost: '3 po', slots: 1 }];
// props.key : light thrown vicious reach range load stack ; tags : blade (lames), staff ; slots : 2 si 2-handed
export const ARMORS = [{ key: 'rusty_mail', name: 'Maille rouillée', vo: 'Rusty Mail', type: 'mail',
    defense: 6, addDex: true, dexMax: 2, req: null, cost: '15 po', slots: 1 }];   // bouclier : type 'shield', defense = bonus
export const GEAR = [{ key: 'rope', name: 'Corde (15 m)', vo: 'Rope (50 ft.)', text: '…', cost: '1 po', slots: 1,
    heal: '2d4+4'? , kind: 'potion'|'light'|'kit'|'gear' }];
export const MAGIC_ITEMS = [{ key, name, vo, rarity: 'uncommon'|'rare'|'very_rare'|'legendary'|'varies', kind: 'weapon'|'armor'|'shield'|'wand'|'wondrous', text }];
export const SCROLL_COSTS / WAND_COSTS = [{ tier: 0, cost: '10 po' }, …];
```
Distances : garder les cases (« Portée 12 ») ; 5 ft. = 1 case = 1,5 m quand une distance est en pieds.

## 6. Compétences (clés)

`arcana examination finesse influence insight lore might naturecraft perception stealth`

## 7. Bestiaire — `config/bestiary.js`

```js
export const MONSTERS = [{
    key: 'kobold_sneak', name: 'Kobold sournois', vo: 'Kobold Sneak',
    family: 'Kobolds',              // titre de la page du bestiaire, traduit
    level: '1', size: 'small',      // level en chaîne ('1/3', '1/2', '12')
    minion: false, legendary: false,
    hp: 20, armor: null,            // armor : null | 'medium' | 'heavy'
    speed: null,                    // null = 6 ; sinon texte (« 8, vol 12 »)
    saves: null,                    // texte (« FOR+, VOL– ») ou null
    abilities: [{ name: 'Sournois !', text: '…' }],
    attacks: [{ name: 'Coup de dague', dice: '2d4', bonus: 0, noCrit: false, text: '(ou Fronde, Portée 8).' }],
    notes: '',                      // facultatif
    sections: [{ title: 'Baroud d\'honneur', text: '…' }],   // légendaires : actions, baroud, etc.
}];
```
`attacks[].dice` seulement si une formule de dégâts est donnée ; une attaque sans dés reste en
`abilities`. Monstres d'aventure (pas dans le bestiaire) : non transcrits.
