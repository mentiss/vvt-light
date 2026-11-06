# Imperium Maledictum — contrat des catalogues et glossaire

Contrat imposé aux transcriptions (agents) : fichiers ES modules dans
`src/client/src/systems/maledictum/config/`, données seules (aucune logique), commentaire d'en-tête
qui cite la source et les pages. Spec : `documentations/spec_maledictum.md`.

## 1. Règles communes

- **Clés** : anglais, `snake_case`, stables, tirées du nom VO (`ever_vigilant`, `ordo_hereticus`,
  `laspistol`). Jamais renommées ensuite (elles vont en base).
- **Libellés** : `label` en **français** (glossaire §3), `labelEn` = nom VO exact du livre.
- **Source** : `source: 'core' | 'ipg' | 'igmg'` (livre de base, Inquisition Player's Guide,
  Inquisition Gamemaster's Guide) et `page` (numéro **imprimé** dans le livre).
- **Textes** : résumé **structuré et exact** en français (`summary`, une à trois phrases), chiffres
  et conditions du livre, sans paraphrase approximative ni ajout. Pas de reprise intégrale du texte.
- **Rien d'inventé** : une valeur illisible ou absente se note `null` et le cas est listé dans
  le commentaire d'en-tête (`// À relire : …`). Les tables mélangées par l'extraction texte se
  relisent **sur la page du PDF en image** :
  `pdftoppm -f <n> -l <n> -r 110 -png "<pdf>" <sortie>` puis lecture de l'image (outil Read).
- Sources : `X:\jdr\w40k\Imperium Maledictum\` (CORE, Rule cheets, Inquisition Players / Gamemasters
  Guide, versions `Compressed` plus légères). Texte extrait :
  `C:/Users/mentiss/AppData/Local/Temp/claude/20aa7440df8b6157/fd9f0688-5735-40c3-954e-89a246a28308/scratchpad/im/`
  (`core.txt`, `inq_players.txt`, `inq_gm.txt`, `cheets.txt`) et relevés `notes_*.md` (même dossier).
- Décisions de règles déjà prises (spec §6) : la Fonction (Duty) **remplace** le bloc Avantages de
  faction ; talents de Fonction inexistants remplacés (Stalwart → `drilled`, Fanaticism →
  `faithful`, Scrounger → `well_prepared`) ; spécialisations mal nommées rattachées à l'existante
  (Awareness (Sound) → `hearing`, Intuition (People) → `human`, Lore (Imperium) → `adeptus_terra`) ;
  talents non définis (« I Am The Law ») retirés et signalés ; en setup Inquisition la faction
  « The Inquisition » du livre est remplacée par les trois Ordos du PG.
- Format JS : `export const NOM = [ { … }, … ];`, guillemets simples, une entrée par objet,
  indentation 4 espaces, virgule finale. Fichier en UTF-8, fins de ligne LF.

## 2. Formes par fichier

### `characteristics.js`, `skills.js`

```js
export const CHARACTERISTICS = [ { key: 'ws', label: 'Capacité de Combat', short: 'CC', labelEn: 'Weapon Skill' }, … ];
export const SKILLS = [
  { key: 'awareness', label: 'Vigilance', labelEn: 'Awareness', char: 'per', restricted: null, page: 93,
    summary: '…',
    specs: [ { key: 'sight', label: 'Vue', labelEn: 'Sight' },
             { key: 'psyniscience', label: 'Psyniscience', labelEn: 'Psyniscience', restricted: 'Talent Psyker' } ] },
];
```
`restricted` : texte du prérequis, ou `null`. Spécialisations « (Various) » : `various: true`
(saisie libre du nom, ex. Savoir (Planète : Macharia)). Ajouter les 4 spécialisations du PG avec
`source: 'ipg'`.

### `talents.js`

```js
{ key: 'ever_vigilant', label: 'Toujours vigilant', labelEn: 'Ever Vigilant', source: 'core', page: 107,
  requirement: { text: '2 Avances en Vigilance', chars: {}, skills: { awareness: 2 }, specs: {}, talents: [], notTalents: [], creationOnly: false, gm: false },
  summary: '…',
  repeatable: false,          // ou nombre max, ou true (illimité)
  repeatNotes: null,          // texte des prises suivantes, ou liste d'options { key, label, summary }
  options: null,              // choix à la prise (ex. art pour Artistique, environnement pour Terrain familier) : [{ key, label }] ou 'free'
  effects: null }             // seulement si mécanique simple et sûre : { fate: 1 } (Fated), { maxAugmetics: '2xTB' }…
```
`skills` / `specs` : clés de `skills.js` (spécialisation : `'skill.spec'`, ex. `'logic.investigation'`).

### `origins.js`

```js
export const ORIGINS = [
  { key: 'hive_world', label: 'Monde-ruche', labelEn: 'Hive World', source: 'core', page: 53, roll: [41, 70],
    fixed: { ag: 5 }, choice: ['bs', 'per', 'fel'], equipment: ['Paire de bouchons filtrants (Laids)'],
    summary: '…', worlds: ['Persepolis', 'Voll'] } ];
export const INQUISITION_ORIGINS = [ /* 20 origines macharriennes du PG : roll [a, b], group (Damned Useful…), même forme ;
   bonus hors caractéristiques en clair : talents: ['blank'], specs: {…}, items: […], noInfluence: true (Tabula Rasa) */ ];
```

### `factions.js`

```js
export const FACTIONS = [
  { key: 'adeptus_mechanicus', label: 'Adeptus Mechanicus', labelEn: 'Adeptus Mechanicus', source: 'core', page: 58,
    theme: 'mechanicus',
    benefits: { fixed: { int: 5 }, choice: ['tgh', 'ag', 'per'], skills: ['dexterity', 'logic', 'lore', 'medicae', 'piloting', 'tech'], advances: 5,
                influence: { adeptus_mechanicus: 1 }, talents: [], talentChoice: null, solars: 100,
                equipment: ['Robes', …], equipmentChoices: [ ['Implant vocal', 'Système respiratoire bionique', 'Organes sensoriels bioniques'], … ] },
    duties: [ { key: 'apprentice_enginseer', label: 'Apprenti enginseer', labelEn: 'Apprentice Enginseer',
                chars: { int: 5, ag: 5 }, advances: { logic: 1, piloting: 2, tech: 2 }, influence: { adeptus_mechanicus: 1 },
                talents: [], solars: 50, equipment: [ … ], theme: null } ],
    summary: '…' } ];
export const FACTION_TABLE = { hive_world: [ ['adeptus_astra_telepathica', 1, 1], ['adeptus_mechanicus', 2, 13], … ], … };   // d100 par origine (core p.55)
```
Clés de faction (setup Inquisition) : `adeptus_astra_telepathica`, `adeptus_mechanicus`,
`adeptus_administratum`, `astra_militarum`, `adeptus_ministorum`, `imperial_navy`,
`rogue_trader`, `infractionist`, `ordo_hereticus`, `ordo_malleus`, `ordo_xenos`.
`theme` : clé de thème (spec §8.2) ; la Fonction Sœur novice porte `theme: 'sororitas'`.
Influence : clés de faction d'Influence, mêmes clés, plus `inquisition` (les trois Ordos donnent
`inquisition`).

### `roles.js`

```js
{ key: 'savant', label: 'Savant', labelEn: 'Savant', source: 'core', page: 77,
  talents: { pick: 2, from: ['artistic', 'attentive_assistant', …] },
  skillAdvances: { pick: 3, from: ['logic', 'lore', …] },
  specAdvances: { pick: 2, fromSkills: ['lore', 'medicae', 'tech'], extra: [] },
  equipment: ['Couteau', …], equipmentChoices: [ ['Pistolet laser', 'Revolver à balles'], { pick: 2, from: [ … ] } ],
  summary: '…' }
```

### `equipment.js` (CORE) et `equipmentInquisition.js` (PG)

```js
export const WEAPONS = [ { key: 'laspistol', label: 'Pistolet laser', labelEn: 'Laspistol', kind: 'ranged', group: 'las',
  spec: 'ranged.pistol', damage: 4, damageBonus: null, range: 'medium', mag: 15, enc: 0, cost: 400, availability: 'common',
  traits: [ { key: 'close' }, { key: 'reliable' } ], source: 'core', page: 130, summary: null } ];
// mêlée : damage = valeur fixe, damageBonus: 'sb' (+BF) ; range null ; mag null
export const AMMO = [ … ]; export const GRENADES = [ … ]; export const WEAPON_MODS = [ … ];
export const ARMOUR = [ { key: 'flak_armour', label: 'Armure pare-éclats', labelEn: 'Flak Armour', locations: ['body', 'arms', 'legs'], armour: 3, enc: 2, cost: …, availability: …, traits: [], source, page } ];
export const FORCE_FIELDS = [ … ]; export const GEAR = [ { key, label, labelEn, category: 'clothing' | 'tool' | 'personal', enc, cost, availability, summary, source, page } ];
export const AUGMETICS = [ … ];
```
Disponibilité : `common` (Courante), `scarce` (Peu courante), `rare` (Rare), `exotic` (Exotique).
Localisations : `head`, `left_arm`, `right_arm`, `body`, `left_leg`, `right_leg` (raccourcis
`arms`, `legs`, `all` admis dans `locations`).

### `traits.js`

`export const WEAPON_TRAITS = [ { key: 'rapid_fire', label: 'Tir rapide', labelEn: 'Rapid Fire', rated: true, summary } ]`
(idem `ARMOUR_TRAITS`, qualités et défauts `ITEM_QUALITIES`, `ITEM_FLAWS`).

### `powers.js`

```js
{ key: 'smite', label: 'Châtiment', labelEn: 'Smite', discipline: 'minor', overt: true, warpRating: 1, difficulty: 0,
  range: 'medium', target: '1 créature', duration: 'instant', spec: null, source: 'core', page: 166, summary: '…' }
```
`discipline` : `minor`, `biomancy`, `divination`, `pyromancy`, `telekinesis`, `telepathy`.
`difficulty` : modificateur (0 Exigeant, -10 Difficile…).

### `tables.js`

`CONDITIONS` (mineur / majeur), `HIT_LOCATIONS` (unités → localisation), `CRITICAL_WOUNDS`
(`{ head: [ { min, max, key, label, labelEn, effect, injury, treatment: { difficulty, needs } } ], arm, body, leg }`),
`FUMBLES` (d10), `MUTATIONS`, `MALIGNANCIES` (d100, `min`, `max`), `PERILS` (`min`, `max`,
`corruption`, `effect`), `PSYCHIC_PHENOMENA`, `DIFFICULTIES`, `SL_BANDS` (paliers de DR).

### `patron.js`

Facteurs de création du Patron (CORE ch. II, PG ch. II) : `PATRON_FACTIONS`, `PATRON_DUTIES`
(Boon gratuit), `MOTIVATIONS`, `DEMEANOURS`, `PHILOSOPHIES` (PG + GMG, `slant: 'puritan' | 'radical'`),
`BOONS`, `LIABILITIES` (`influence: { faction: ±n }` si marqués *, `summary`), `PAYMENT_GRADES`,
`ORDO_TABLES` (d10 par Ordo : boons / liabilities puritan / radical), `INQUISITORS` (les 6 du GMG,
fiche Patron préremplie), `SUBTLETY_LEVELS` (paliers 1-10 et effets).

### `bestiary.js`

```js
{ key: 'ganger', label: 'Gangster', labelEn: 'Ganger', size: 'medium', type: 'Humain (Infractionniste)', role: 'troop',
  chars: { ws: 35, bs: 35, str: 30, tgh: 40, ag: 40, int: 20, per: 30, wil: 20, fel: 20 },
  armour: 2, wounds: 13, criticalWounds: 0, initiative: 7, speed: 'normal', resolve: 1, warpThreshold: null,
  skills: { melee: 40, presence: 40, ranged: 40, stealth: 50 },
  traits: [ { label: 'Embuscade', summary: '…' } ],
  attacks: [ { label: 'Fusil automatique', skill: 'ranged.long_gun', value: 40, damage: '6 + DR', range: 'long', traits: 'Bruyant, Deux mains' } ],
  powers: [], possessions: '…', faction: 'infractionist', source: 'core', page: 340 }
```

## 3. Glossaire imposé (VO → VF)

Caractéristiques : Weapon Skill **Capacité de Combat (CC)**, Ballistic Skill **Capacité de Tir (CT)**,
Strength **Force (F)**, Toughness **Endurance (E)**, Agility **Agilité (Ag)**, Intelligence
**Intelligence (Int)**, Perception **Perception (Per)**, Willpower **Force Mentale (FM)**, Fellowship
**Sociabilité (Soc)**. Bonus : **BCC, BCT, BF, BE, BAg, BInt, BPer, BFM, BSoc**.

Tests : Test **Test**, Success Level (SL) **Degré de réussite (DR)**, Advantage / Disadvantage
**Avantage / Désavantage**, Opposed **opposé**, Extended **étendu**, Very Easy **Très facile (+60)**,
Easy **Facile (+40)**, Routine **Routinier (+20)**, Challenging **Exigeant (+0)**, Difficult
**Difficile (−10)**, Hard **Ardu (−20)**, Very Hard **Très ardu (−30)**, Critical **Critique**, Fumble
**Maladresse**.

Compétences : Athletics **Athlétisme**, Awareness **Vigilance**, Dexterity **Dextérité**, Discipline
**Discipline**, Fortitude **Robustesse**, Intuition **Intuition**, Linguistics **Linguistique**, Logic
**Logique**, Lore **Savoir**, Medicae **Médicae**, Melee **Mêlée**, Navigation **Navigation**, Piloting
**Pilotage**, Presence **Présence**, Psychic Mastery **Maîtrise psychique**, Ranged **Distance**,
Rapport **Rapport**, Reflexes **Réflexes**, Stealth **Discrétion**, Tech **Tech**. Specialisation
**spécialisation**, Advance **Avance**. Spécialisations courantes : Sight **Vue**, Hearing **Ouïe**,
Smell **Odorat**, Taste **Goût**, Touch **Toucher**, Human **Humains**, Group **Groupe**, Surroundings
**Environs**, Investigation **Enquête**, Evaluation **Évaluation**, Forbidden **Interdit**, High Gothic
**Haut Gothique**, Cypher **Chiffres**, Theology **Théologie**, Academics **Érudition**, One-handed
**Une main**, Two-handed **Deux mains**, Brawling **Pugilat**, Pistol **Pistolet**, Long Gun **Arme
longue**, Ordnance **Artillerie**, Thrown **Lancer**, Dodge **Esquive**, Interrogation
**Interrogatoire**, Intimidation **Intimidation**, Leadership **Commandement**, Charm **Charme**,
Deception **Tromperie**, Haggle **Marchandage**, Inquiry **Renseignement**, Engineering
**Ingénierie**, Security **Sécurité**, Augmetics **Augmétique**.

Personnage : Origin **Origine**, Faction **Faction**, Duty **Fonction**, Role **Rôle**, Talent
**Talent**, Fate **Destin** (Spend **Dépenser**, Burn **Brûler**), Wounds **Blessures**, Critical
Wound **Blessure critique**, Injury **Séquelle**, Corruption **Corruption**, Mutation **Mutation**,
Malignancy **Malignité**, Influence **Influence**, Contact **Contact**, Solars **Solars**,
Encumbrance **Encombrement**, Initiative **Initiative**, Speed **Vitesse** (Slow / Normal / Fast
**Lente / Normale / Rapide**), Handedness **Latéralité**, Goals **Objectifs**, Connections
**Connexions**, Divination **Divination**, Superiority **Supériorité**, Subtlety **Subtilité**
(Covert / Suspicious / Overt / Exposed **Clandestin / Suspect / Manifeste / Exposé**).

Patron : Patron **Patron**, Boon **Faveur**, Liability **Handicap**, Motivation **Motivation**,
Demeanour **Attitude**, Payment Grade **Grade de solde**, Philosophy **Philosophie** (Puritan /
Radical **Puritain / Radical**), Endeavour **Entreprise**.

Rôles : Interlocutor **Interlocuteur**, Mystic **Mystique**, Savant **Savant**, Penumbra
**Pénombre**, Warrior **Guerrier**, Zealot **Zélote**, Assassin **Assassin**, Cruciator
**Cruciateur**, Explicator **Explicateur**, Seeker **Traqueur**.

Psy : Psyker **Psyker**, Psychic Power **Pouvoir psychique**, Minor **mineur**, Discipline
**Discipline**, Biomancy **Biomancie**, Divination **Divination**, Pyromancy **Pyromancie**,
Telekinesis **Télékinésie**, Telepathy **Télépathie**, Manifest **Manifester**, Warp Charge **Charge
Warp**, Warp Rating **Indice Warp**, Warp Threshold **Seuil Warp**, Push **Forcer**, Sustained
**Maintenu**, Overt **Manifeste**, Purgation **Purge**, Perils of the Warp **Périls du Warp**,
Psychic Phenomena **Phénomènes psychiques**, Deny the Witch **Contrer la sorcière**.

Combat : Hit Location **Localisation** (Head **Tête**, Left / Right Arm **Bras gauche / droit**,
Body **Corps**, Left / Right Leg **Jambe gauche / droite**), Armour **Armure**, Damage **Dégâts**,
Cover **Couvert** (Partial / Total **partiel / total**), Engaged **Engagé**, Zone **Zone**, Range
(Immediate / Short / Medium / Long / Extreme) **Portée (Contact / Courte / Moyenne / Longue /
Extrême)**, Move **Mouvement**, Action **Action**, Reaction **Réaction**, Free Action **Action
gratuite**.

États : Ablaze **En feu**, Bleeding **Hémorragie**, Blinded **Aveuglé**, Deafened **Assourdi**,
Fatigued **Épuisé**, Frightened **Effrayé**, Incapacitated **Neutralisé**, Overburdened
**Surchargé**, Poisoned **Empoisonné**, Prone **À terre**, Restrained **Entravé**, Stunned
**Hébété**, Unconscious **Inconscient** ; Minor / Major **mineur / majeur**.

Traits d'arme : Blast **Explosion**, Burst **Rafale**, Close **Proche**, Defensive **Défensive**,
Flamer **Lance-flammes**, Heavy **Lourde**, Ineffective **Inefficace**, Inflict **Inflige**, Loud
**Bruyante**, Penetrating **Perforante**, Rapid Fire **Tir rapide**, Reach **Allonge**, Reliable
**Fiable**, Rend **Déchirante**, Shield **Bouclier**, Spread **Dispersion**, Subtle **Discrète**,
Supercharge **Surcharge**, Thrown **Lancer**, Two-handed **Deux mains**, Unstable **Instable**.
Qualités et défauts : Shoddy **Médiocre**, Ugly **Laid**, Ornamental **Ornementé**, Lightweight
**Léger**, Master Crafted **De maître**, Durable **Robuste**, Bulky **Encombrant**. Disponibilité :
Common **Courante**, Scarce **Peu courante**, Rare **Rare**, Exotic **Exotique**.

PNJ : Troop **Troupe**, Elite **Élite**, Leader **Meneur**, Resolve **Détermination**, Traits
**Traits**, Attacks **Attaques**, Possessions **Possessions**.

Noms propres et institutions : on garde la forme française d'usage quand elle existe (Garde
impériale → **Astra Militarum** reste en VO comme faction ; Imperial Navy **Flotte impériale** ;
Rogue Trader **Libre-Marchand** ; Infractionist **Infractionniste** ; Ecclesiarchy **Ecclésiarchie** ;
Hive **ruche**, Underhive **sous-ruche**, Hab-block **hab-bloc**). Les noms d'Ordos, d'Adeptus et
d'objets typés 40K très connus restent en VO francisée sobre (Ordo Hereticus, Adeptus Mechanicus,
Auspex, Lasgun → **Fusil laser**, Laspistol → **Pistolet laser**, Bolter → **Bolter**, Chainsword →
**Épée tronçonneuse**, Stub Revolver → **Revolver à balles**, Autogun → **Fusil automatique**,
Autopistol → **Pistolet automatique**, Flak → **pare-éclats**, Carapace → **carapace**, Servo-skull
→ **Crâne-serviteur**, Dataslate → **Ardoise de données**, Vox → **Vox**). Doute de traduction : garder
la VO entre parenthèses dans `summary` et le signaler en en-tête.
