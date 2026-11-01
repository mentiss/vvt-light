# Vampire : L'Âge des Ténèbres – V20 Dark Ages
## Spécification fonctionnelle – Règles et fiche

> Version 1.0 – gravure issue de la consolidation validée.
> Adaptation **iso** de *Vampire: The Dark Ages 20th Anniversary Edition*, avec des **règles maison** explicitement signalées (la règle iso figure alors en encadré).
> Noms français **provisoires** : ils seront alignés sur le livre VF (glossaire hors scope de cette version).

### Documents liés

| Fichier                                              | Contenu |
|------------------------------------------------------|---|
| `spec_woddavampire.md`                               | Ce document : règles, fiche, systèmes, paramètres, référence MJ |
| `annexe_woddavampire/vda20-catalogue-disciplines.md` | Disciplines et Disciplines combinées |
| `annexe_woddavampire/vda20-catalogue-magie-sang.md`                      | Thaumaturgie, Nécromancie, Koldunisme, Ogham, Mysticisme de l'Abîme, rituels |
| `annexe_woddavampire/vda20-catalogue-clans.md`                           | Clans, castes, lignées, revenants |
| `annexe_woddavampire/vda20-catalogue-routes.md`                          | Routes, Voies, auras, hiérarchies des péchés |
| `annexe_woddavampire/vda20-catalogue-atouts-handicaps.md`                | Atouts et Handicaps |
| `annexe_woddavampire/vda20-catalogue-divers.md`                          | Archétypes, Historiques, armes, armures, manœuvres, Dérangements, tables de référence, animaux |

---

## 1. Principes

1. L'app gère **la fiche et les systèmes propres au jeu**. Toute interaction trop complexe se joue **à la table** ; ce document les signale « À la table » et les garde en référence.
2. **Tout jet est modifiable** : modificateur de dés et modificateur de difficulté libres. Aucune automatisation n'empêche le MJ de trancher.
3. **Création contrôlée** : pendant la création, l'app bloque ce qui sort des règles (répartition, plafonds, coûts).
4. **Hors création, fiche libre** : le joueur et le MJ peuvent modifier n'importe quelle valeur sans dépenser de points. La dépense d'expérience calcule le coût mais ne bloque rien.
5. Le **MJ a le dernier mot** : il peut imposer une Génération, un clan, valider un Atout, déclencher une Étreinte.
6. Les Routes, l'aura et la frénésie se jouent **simplement**, de manière narrative ; l'app fournit la référence, pas la contrainte.

---

## 2. Paramètres de chronique

Réglés par le MJ pour une chronique (ou un slug).

| Paramètre | Valeur iso | Effet |
|---|---|---|
| Génération de départ | 12ᵉ | Point de départ de l'Historique Génération et de la réserve de sang |
| Plafond Atouts et Handicaps | 7 | Le livre propose 5, 7 ou 10 points |
| Alphabétisation supposée | Non | Non : « Lettré » est un Atout (1). Oui : « Illettré » devient un Handicap (1) et « Lettré » disparaît |

---

## 3. Résolution des actions

### 3.1 Le jet

- **Réserve** : un d10 par point. En général Attribut + Capacité ; aussi Vertu, Volonté, Route ou tout trait demandé.
- **Difficulté** : 6 par défaut, **bornée de 2 à 10**. Toute formule de difficulté du livre est ramenée dans ces bornes.

| Difficulté | Repère |
|---|---|
| 3 | Triviale |
| 4 | Facile |
| 5 | Simple |
| 6 | Standard |
| 7 | Exigeante |
| 8 | Difficile |
| 9 | Très difficile |
| 10 | Quasi impossible |

- **Succès** : chaque dé dont le résultat est supérieur ou égal à la difficulté.
- **Règle maison – les 1 n'annulent rien.** Exemple : 6, 5, 1, 7 à difficulté 6 = 2 succès.
  > *Iso : chaque 1 annule un succès.*
- **Échec** : aucun succès.
- **Échec critique** : aucun succès **et** au moins un 1.
- **Degrés de réussite** : 1 marginale · 2 modérée · 3 complète · 4 exceptionnelle · 5+ phénoménale.

### 3.2 Options d'un jet

| Option | Règle |
|---|---|
| Modificateur de dés | ± dés, avec libellé facultatif (« Atout : Ouïe fine », « Action multiple », « Couvert »…) |
| Modificateur de difficulté | ± difficulté, avec libellé facultatif |
| Spécialité | Proposée si le trait concerné vaut **4 ou plus** ; chaque 10 compte pour **2 succès** |
| Volonté | 1 point au maximum par tour, déclaré avant le jet : **+1 succès** (décrémente la Volonté temporaire) |
| Jet réflexe | Le malus de blessure ne s'applique pas (absorption, Vertus, Volonté, résistance aux Disciplines) |
| Célérité | Appliquée par défaut aux réserves basées sur la Dextérité ; **décochable** (usage discret) |

- **Malus de blessure** : appliqué automatiquement d'après la santé (§9), sauf jet réflexe.
- **Bonus permanents** de Célérité, Force d'âme et Puissance : appliqués automatiquement (§13.2).

### 3.3 Capacité à 0

| Catégorie | Règle |
|---|---|
| Talent | On lance l'Attribut seul, sans pénalité |
| Compétence | On lance l'Attribut seul, difficulté +1 |
| Connaissance | Jet impossible (sauf savoir commun, au jugement du MJ) |

### 3.4 Action prolongée

- Compteur de succès cumulés et seuil à atteindre (en général 15 à 20 au maximum).
- Un échec critique **remet le compteur à zéro** (ou met fin à l'action, au choix du MJ).

### 3.5 Jets qui ne peuvent pas échouer critiquement

Jets de dégâts et jets d'absorption : un échec critique compte comme un simple échec.

### 3.6 À la table

- **Actions en opposition** : le MJ annonce la difficulté.
- **Actions en équipe**, **nouvelle tentative** (+1 difficulté par essai, impossible à 10), **succès automatique** (au choix du MJ, jamais pour la Route), **actions multiples** (1ʳᵉ action −1 dé / +1 diff, 2ᵉ −2 / +2…, une seule attaque par tour sans Célérité) : via les modificateurs.
- **Temps** : tour (3 secondes à 3 minutes), scène, chapitre (une séance), histoire, chronique, intervalle.

---

## 4. Fiche de personnage

### 4.1 Agencement

La fiche est organisée en blocs. L'ordre ci-dessous est l'ordre de lecture recommandé.

| Bloc | Contenu |
|---|---|
| **En-tête** | Nom, joueur, chronique, concept, Nature, Attitude, clan ou lignée, caste/branche, clan d'origine (si applicable), Génération, sire, Route (+ Voie) |
| **Attributs** | 3 colonnes : Physiques (Force, Dextérité, Vigueur) · Sociaux (Charisme, Manipulation, Apparence) · Mentaux (Perception, Intelligence, Astuce) |
| **Capacités** | 3 colonnes de 10 : Talents · Compétences · Connaissances, avec spécialités et domaines d'expertise |
| **Avantages** | Historiques · Disciplines · Vertus |
| **Bloc vital** | Route (valeur, statut) · Volonté (permanente / temporaire) · Réserve de sang (actuelle / max, sang par tour) · Santé · Expérience |
| **Pouvoirs** | Disciplines détaillées (pouvoirs connus, lancer), magie du sang (voies, kraina, rituels), Disciplines combinées |
| **Combat** | Initiative, armes, armure, bouclier, absorption calculée, raccourcis d'attaque et de défense |
| **Traits particuliers** | Atouts et Handicaps · Dérangements · Faiblesse de clan (+ champ personnalisé) · Liens de sang · États |
| **Histoire** | Trois phrases d'historique · Langues · Description · Notes |
| **Onglet Référence** | Séparé de la fiche : rappels de règles (faiblesse du clan, hiérarchie des péchés de sa Route, tables de frénésie et de Rötschreck, effets des états, aura…) |

**Les trois phrases d'historique** (champs texte) :
- « De mon vivant, j'étais… »
- « Mon sire m'a choisi parce que… »
- « Désormais, je passe mes nuits… »

**Boutons d'action** sur la fiche : **Réveil** (§7) et **Fin d'histoire** (§8).

### 4.2 Attributs

Valeur de 1 à 5 (au-delà selon la Génération). Exceptions : Apparence bloquée à 0 (Nosferatu, Handicap Monstrueux).

### 4.3 Capacités

| Talents | Compétences | Connaissances |
|---|---|---|
| Vigilance | Animaux | Érudition* |
| Athlétisme | Archerie | Énigmes |
| Conscience | Étiquette | Investigation |
| Bagarre | Mêlée | Droit |
| Empathie | Équitation | **Linguistique** (règle maison) |
| Expression | Furtivité | Occultisme |
| Subterfuge | Survie | Théologie |
| Intimidation | Commerce* | Politique |
| Escamotage | Artisanat* | Médecine |
| Commandement | Représentation* | Intendance |

\* **Domaine d'expertise obligatoire** : la Capacité s'achète pour un domaine précis (ex. Artisanat : forge). Hors domaine, elle compte comme 0 ; Artisanat hors domaine ajoute en plus +1 en difficulté. Un personnage peut avoir plusieurs domaines (coût §6).

- **Artisanat corporel** (Body Crafts) : Compétence propre aux Tzimisce, hors liste commune, affichée sur la fiche des Tzimisce. Sans elle, les jets de Vicissitude utilisent Médecine à +2 diff.
- **Étiquette** : on connaît les usages de sa classe et de sa culture même à 0.
- **Spécialités** : une ou plusieurs par Capacité, à partir de 4 points (liste de suggestions au catalogue divers).

**Règle maison – Linguistique** (remplace Sagesse populaire)
- Capacité de jet : Intelligence + Linguistique pour traduire, reconnaître un dialecte, déchiffrer un texte, passer pour un local.
- **Nombre de langues** : 1 langue en plus de la langue maternelle par point (indicatif, le MJ peut ajuster).
- L'Atout **Polyglotte** donne une facilité (narrative) pour apprendre et utiliser les langues.
> *Iso : la Connaissance « Sagesse populaire » (remèdes, superstitions, savoir paysan) ; les langues passent par l'Atout Polyglotte.*

Le champ **Langues** liste les langues connues.

### 4.4 Historiques

Liste : Alliés, Identité d'emprunt, Contacts, Domaine, Renommée, Génération, Troupeau, Influence, Mentor, Ressources, Serviteurs, Statut. Descriptions et échelles au catalogue divers.

Effets chiffrés utilisés par l'app :
- **Génération** : §5.4.
- **Domaine**, **Troupeau** : réserve de sang de départ (§5.3).

### 4.5 Vertus

- Trois Vertus, de 1 à 5 : **Conscience** *ou* **Conviction** · **Maîtrise** *ou* **Instinct** · **Courage**.
- Le couple de Vertus est **imposé par la Route** (ou la Voie) choisie.
- **Maîtrise / Instinct** : on ne lance jamais plus de dés que **la plus petite valeur entre la Vertu, la Route et la réserve de sang actuelle** (calcul automatique).
- Aucun jet de Vertu ne dépasse la valeur de Route.

### 4.6 Route

- Valeur de 0 à 10. **Statut** affiché : Initié (1-3), Adepte (4-7), Parangon (8+).
- Voie facultative (branche de la Route).
- Accès à la hiérarchie des péchés de la Route/Voie (onglet Référence).
- Détails §11.

---

## 5. Création de personnage

Les cinq étapes peuvent être faites **dans n'importe quel ordre**. L'app **bloque** toute répartition ou tout achat hors des règles.

### 5.1 Étapes

| Étape | Contenu | Règles |
|---|---|---|
| 1. Concept | Concept, clan, Route, Nature, Attitude | Archétypes : catalogue divers (« Bête » exclu). Clan : catalogue clans. Route : catalogue routes |
| 2. Attributs | Priorités 7 / 5 / 3 entre Physiques, Sociaux, Mentaux | 1 point gratuit dans chaque Attribut (sauf Apparence 0 des Nosferatu) ; max 5 |
| 3. Capacités | Priorités 13 / 9 / 5 entre Talents, Compétences, Connaissances | **Max 3** par Capacité à cette étape ; domaines d'expertise |
| 4. Avantages | 4 points de Disciplines, 5 points d'Historiques, 7 points de Vertus | Disciplines **de clan** uniquement (Caïtif : au choix, accord MJ) ; 1 point gratuit dans chaque Vertu |
| 5. Finitions | Route, Volonté, réserve de sang, points bonus, Atouts et Handicaps | Voir ci-dessous |

### 5.2 Finitions

- **Route** = Conscience/Conviction + Maîtrise/Instinct (calculée à la fin de l'étape 4).
- **Volonté** = Courage (calculée à la fin de l'étape 4).
- **15 points bonus** :

| Trait | Coût par point |
|---|---|
| Attribut | 5 |
| Capacité | 2 |
| Discipline | 7 |
| Voie secondaire (magie du sang) | 4 |
| Rituel | niveau du rituel |
| Historique | 1 |
| Vertu | 2 |
| Route | 2 |
| Volonté | 1 |

Les points bonus dépensés en Vertus **ne recalculent pas** la Route ni la Volonté (celles-ci s'achètent séparément).
- **Atouts et Handicaps** : facultatifs ; total des Handicaps limité par le paramètre de chronique ; les Handicaps donnent des points bonus supplémentaires. Chaque Atout/Handicap porte un statut **« validé MJ »**.
- Les **contraintes de clan** s'appliquent (§14.4).

### 5.3 Réserve de sang de départ

- Calculée par l'app : **1d10 + Domaine + Troupeau**, plafonnée par le maximum de la Génération.
- **Modifiable** par le joueur et le MJ.

### 5.4 Génération

- Génération du personnage = **Génération de départ** de la chronique − points de l'**Historique Génération** (1 point = 1 Génération de moins).
  - Exemple iso (départ 12ᵉ) : 1 → 11ᵉ, 2 → 10ᵉ, 3 → 9ᵉ, 4 → 8ᵉ, 5 → 7ᵉ.
- **Plancher : 4ᵉ Génération.**
- Les points d'Historiques à la création restent 5, quelle que soit la Génération de départ.
- Le MJ peut **imposer** une Génération (raison narrative : sire, clan, monde).
- La Génération fixe le **plafond des traits**, la **réserve de sang** et le **sang par tour** (§7.1).

---

## 6. Expérience

### 6.1 Coûts

| Achat | Coût en XP |
|---|---|
| Nouveau domaine d'expertise | 1 |
| Nouvelle Capacité | 3 |
| Nouvelle Discipline | 10 |
| Nouvelle voie (Thaumaturgie, Nécromancie) | 7 |
| Voie secondaire | valeur actuelle × 4 |
| Quietus : branche autre que celle de sa culture | nouvelle valeur × 4 |
| Rituel | niveau × 2 |
| Rituel du Mysticisme de l'Abîme | niveau × 3 |
| Attribut | valeur actuelle × 4 |
| Capacité | valeur actuelle × 2 |
| Discipline de clan | valeur actuelle × 5 |
| Autre Discipline | valeur actuelle × 7 |
| Vertu | valeur actuelle × 2 (ne modifie ni la Route ni la Volonté) |
| Volonté | valeur actuelle |
| Route | valeur actuelle × 2 |
| Historique | valeur actuelle × 2 (accord du MJ) |
| Discipline combinée | coût fixe (catalogue) |

### 6.2 Modulations

- **Multiplicateurs de coût** déclarés par un clan ou un pouvoir (catalogues) :
  - Vrais Brujah : Conscience, Conviction et Route coûtent le double.
  - Valeren : la voie « opposée » à sa caste coûte valeur actuelle × 6.
  - Serpentis, Avatar typhonique : la seconde forme coûte moitié prix.
- **Dépense sur la Route** : deux cases à cocher.
  - **Mentor** (Route plus haute que celle du personnage) : −1 XP par point d'écart, sans descendre sous la moitié du coût.
  - **Moment de vérité** dans la même histoire : coût divisé par 2 (après la réduction du mentor), arrondi à l'inférieur, minimum 1.

### 6.3 Comportement

- La dépense **ne bloque pas** : l'app calcule le coût et le déduit, rien de plus.
- Rappel non bloquant : **+1 au maximum par trait et par histoire**.

### 6.4 À la table

Gain d'XP (le livre suggère 2 à 5 par séance, 3 à 5 en fin d'histoire, 1 à 3 par décennie d'intervalle), besoin d'un mentor pour apprendre une Discipline hors clan.

---

## 7. Sang

### 7.1 Génération et sang

| Génération | Traits max | Réserve max | Sang par tour |
|---|---|---|---|
| 3ᵉ | 10 | ??? | ??? |
| 4ᵉ | 9 | 50 | 10 |
| 5ᵉ | 8 | 40 | 8 |
| 6ᵉ | 7 | 30 | 6 |
| 7ᵉ | 6 | 20 | 4 |
| 8ᵉ | 5 | 15 | 3 |
| 9ᵉ | 5 | 14 | 2 |
| 10ᵉ | 5 | 13 | 1 |
| 11ᵉ | 5 | 12 | 1 |
| 12ᵉ | 5 | 11 | 1 |
| 13ᵉ et + | 5 | 10 | 1 |

- **Traits max** : plafond des Attributs, Capacités, Historiques et Disciplines.
- La 3ᵉ Génération n'est pas jouable (valeurs volontairement inconnues).
- Le sang par tour est **affiché**, pas bloquant.

### 7.2 Dépenses

| Usage | Règle |
|---|---|
| **Réveil** (bouton) | −1 sang chaque nuit, +1 Volonté (sans dépasser la permanente) |
| **Soins** | 1 sang = 1 niveau contondant ou létal guéri |
| **Soins aggravés** | 5 sang + une journée de repos par niveau ; les 5 points peuvent être versés sur plusieurs jours |
| **Booster un Attribut physique** | 1 sang = +1 Force, Dextérité ou Vigueur pour la scène, annoncé avant le jet ; jusqu'à Traits max + 1 ; au-delà, temporaire, s'estompe 3 tours après la dernière dépense. Affiché comme modificateur temporaire |
| **Imiter la vie** | Coût affiché = 8 − Route (0 si Route ≥ 8) ; indisponible pour les Cappadociens ; le MJ peut l'interdire sur certaines Routes |
| **Disciplines** | Coût indiqué par le pouvoir, proposé à la dépense au lancer |
| **Nourrir un autre** | 1 pour 1 ; crée une étape de lien de sang (§12) |

### 7.3 Se nourrir

- On boit au maximum **3 points par tour**.
- Ajout manuel à la réserve (sans dépasser le maximum).

### 7.4 À la table (référence)

- **Chasse** : un jet par heure de recherche, réserve selon la méthode (ex. Apparence + Subterfuge). Difficulté selon le lieu (bas-fonds 4 · quartier pauvre 5 · marché 6 · quartier marchand 7 · zone surveillée 8). Domaine et Renommée : −1 diff par point (minimum 3). Troupeau : +1 dé par point.
- **Faim** : si la réserve est inférieure à 7 − Maîtrise/Instinct au moment de se nourrir, test de frénésie.
- **Vaisseaux** : vampire 10+, loup-garou 20, humain 10, enfant 5, vache 5, chien 2, chat 1, oiseau ½, chauve-souris/rat ¼.
- Sang hors du corps : divisé par 2 toutes les 10 minutes. Mortel vidé de plus de 2 points : jet de Vigueur −1 dé par point au-delà du 2ᵉ. Le Baiser : extase, les mortels à Volonté 9+ peuvent résister ; un Caïnite mordu peut résister (Maîtrise/Instinct diff 8).

---

## 8. Volonté

- **Permanente** (1 à 10) et **temporaire** (jamais au-dessus de la permanente).
- **Dépenses** :
  - +1 succès sur un jet (1 par tour, §3.2) ;
  - ignorer les malus de blessure pendant 1 tour (impossible si Neutralisé ou en torpeur) ;
  - 1 tour de contrôle en frénésie ou Rötschreck ;
  - 1 tour de lucidité face à un Dérangement ;
  - résister à une impulsion instinctive (peut devoir être renouvelé).
- **Regain** :
  - +1 au **Réveil** (bouton) ;
  - **Fin d'histoire** (bouton) : remise à la valeur permanente ;
  - +1 à +3 quand le personnage agit selon sa **Nature** (saisie manuelle) ;
  - +1 sur un exploit ou un objectif accompli (saisie manuelle).
- La Volonté permanente ne monte qu'avec l'expérience.

---

## 9. Santé et dégâts

### 9.1 Piste de santé

| Niveau | Malus | Déplacement |
|---|---|---|
| Contusionné | 0 | Normal |
| Blessé | −1 | Normal |
| Touché | −1 | Vitesse de course divisée par 2 |
| Blessé gravement | −2 | Marche uniquement |
| Mutilé | −2 | Clopine 3 m par tour |
| Infirme | −5 | Rampe 1 m par tour |
| Neutralisé | – | Immobile, aucune action normale |
| Torpeur | – | Aucune action |
| Mort ultime | – | Détruit |

- **Seul le malus du niveau le plus grave** s'applique, à toutes les réserves actives et à l'**initiative**, jamais aux jets réflexes.
- La piste est **extensible** (Atout Robuste : +1 niveau Contusionné).

### 9.2 Types de dégâts

| Type | Marque | Vampire | Mortel |
|---|---|---|---|
| Contondant | / | Absorbé par la Vigueur ; **divisé par 2 après absorption** (arrondi inférieur) | Absorbé par la Vigueur |
| Létal | X | Absorbé par la Vigueur | Absorbable seulement avec une armure |
| Aggravé | * | Absorbé par la Force d'âme (et l'armure, sauf feu et soleil) | Traité comme létal |

- **Rangement automatique** : aggravé en haut de la piste, puis létal, puis contondant.
- **Débordement** : piste pleine → un nouveau contondant devient létal ; piste pleine de létal → un nouveau létal devient aggravé.
- **Vampire** :
  - piste pleine de contondant : continue d'agir comme Infirme (−5) ;
  - piste pleine de létal : **torpeur** ;
  - piste pleine d'aggravé : **mort ultime** ;
  - un niveau aggravé subi en étant Neutralisé ou en torpeur : **mort ultime**.
- **Mortel** : piste pleine de contondant → inconscient ; pleine de létal → mort.

### 9.3 Torpeur

| Route | Durée | Route | Durée |
|---|---|---|---|
| 10 | 1 jour | 4 | 1 décennie |
| 9 | 3 jours | 3 | 5 décennies |
| 8 | 1 semaine | 2 | 1 siècle |
| 7 | 2 semaines | 1 | 5 siècles |
| 6 | 1 mois | 0 | 1 millénaire et plus |
| 5 | 1 an | | |

- Torpeur volontaire : on peut tenter de se réveiller après la moitié de la durée.
- Torpeur due aux blessures : réveil après la durée, et seulement avec du sang venu de l'extérieur.
- Réveil : 1 sang + jet de Route difficulté 8 ; en cas d'échec, nouvelle tentative la nuit suivante (1 sang de plus). Sans sang : impossible. Au réveil, le personnage est Infirme.
- Pas de perte de sang pendant la torpeur.

### 9.4 Figurants

Les PNJ sans nom (gardes, brigands, paysans) n'ont que **4 niveaux** : Blessé (−1), Mutilé (−3), Neutralisé, Mort.

### 9.5 À la table (référence, catalogue divers)

Guérison des mortels (tables), feu (dégâts par tour selon la taille, difficulté d'absorption selon la chaleur, brûlures : Apparence −1 au niveau Mutilé, −2 à Infirme/Neutralisé), soleil (dégâts selon l'exposition, difficulté selon l'intensité, sans Force d'âme pas d'absorption), chute (1 dé contondant par 3 m, 10 dés létaux au-delà de 30 m, armure à moitié).

---

## 10. Combat

### 10.1 Initiative

- **Valeur d'initiative** = Dextérité + Astuce + Célérité.
- **Initiative du tour** = valeur + 1d10 − malus de blessure − pénalité d'armure.
- Égalité : la valeur d'initiative la plus haute agit d'abord ; égalité parfaite : simultané.
- **Tracker d'initiative** : ordre décroissant ; un personnage peut retarder son action ; une défense peut intervenir à tout moment ; les actions supplémentaires (actions multiples) se résolvent en fin de tour.

### 10.2 Attaque

| Type | Réserve | Portée |
|---|---|---|
| Mains nues | Dextérité + Bagarre | 1 m |
| Arme de mêlée | Dextérité + Mêlée | 2 m |
| Arc, arbalète, fronde | Dextérité + Archerie | Portée de l'arme |
| Arme de jet | Dextérité + Athlétisme | Portée de l'arme |

- Difficulté 6 de base, modifiée par l'arme et les circonstances.
- Portée : normale jusqu'à la portée de l'arme, +1 diff jusqu'au double, +2 jusqu'au triple, impossible au-delà.

### 10.3 Défense

Déclarée **avant** le jet d'attaque ; ses succès sont retirés à ceux de l'attaquant.

| Défense | Réserve | Remarque |
|---|---|---|
| Blocage | Dextérité + Bagarre | Contondant uniquement, sauf Force d'âme ou armure adaptée |
| Esquive | Dextérité + Athlétisme | +2 diff contre les flèches (Célérité active l'annule) |
| Parade | Dextérité + Mêlée | Contre une attaque à mains nues, l'excédent de succès devient une attaque contre l'agresseur |

- **Défense totale** : le personnage renonce à agir ; réserve complète contre la 1ʳᵉ attaque, puis −1 dé cumulatif par défense suivante, sans pénalité de difficulté.

### 10.4 Dégâts et absorption

- **Dégâts** = valeur de l'arme + succès nets de l'attaque ; difficulté 6 ; chaque succès = 1 niveau.
- **Absorption** (jet réflexe, difficulté 6, toujours possible) : Vigueur + Force d'âme + armure, selon le type (§9.2).
- **Armure** : valeur ajoutée à l'absorption ; pénalité à l'initiative et aux actions basées sur la Dextérité ; « Perforant X » retire X dés d'armure ; viser une faille : +2 diff à l'attaque, l'armure est ignorée ; armure détruite si le jet de dégâts atteint le double de sa valeur. Le feu et le soleil ignorent l'armure.
- **Bouclier, arme de parade** : modifient la difficulté pour toucher et la difficulté de parade (catalogue).

### 10.5 Raccourcis sur la fiche

Pour chaque arme équipée : lancer d'attaque (réserve et difficulté pré-remplies), lancer de dégâts. Raccourcis Blocage, Esquive, Parade. Absorption calculée par type de dégâts.

### 10.6 À la table

- Manœuvres (catalogue divers) : réserve, difficulté et dégâts appliqués via modificateurs. **En cas d'écart entre la table et le texte du livre, le texte fait foi.**
- Localisation : membre/bouclier +1 diff ; tête/main +2 diff, +1 dégât ; œil/cœur +3 diff, +2 dégâts.
- Couvert : léger +1 / bon +2 / excellent +3 à la difficulté pour toucher.
- Adversaires multiples : +1 diff par adversaire au-delà du premier (max +4).
- Complications : aveuglé, membre estropié, sonné, immobilisé, renversé.
- Poursuite, embuscade, diversion, tactique, combat monté.

---

## 11. Routes et aura

### 11.1 Règles

- Chaque vampire suit une **Route** ; par défaut, un nouvel Étreint suit la **Route de l'Humanité**.
- La Route impose le couple de Vertus (§4.5) et donne une aura et une hiérarchie des péchés (catalogue routes).
- **Plafonds** :
  - aucun jet de Vertu ni de résistance à la Bête au-delà de la valeur de Route ;
  - **éveillé de jour** : aucune réserve au-delà de la valeur de Route.
- Les Routes et Voies se jouent **simplement** : l'app affiche, la table interprète.

### 11.2 Aura

- **Effet narratif** : la description de l'aura de la Route (catalogue) indique dans quelles situations elle joue.
- Table iso en référence, appliquée par le MJ via modificateur s'il le souhaite :

| Route | Modificateur de difficulté |
|---|---|
| 10 | −2 |
| 8-9 | −1 |
| 4-7 | 0 |
| 2-3 | +1 |
| 1 | +2 |

- Atouts/Handicaps « Aura faible », « Aura puissante », « Initié de la Route » : narratifs (référence).

### 11.3 À la table (référence)

- **Dégénérescence** : on ne risque sa Route que sur un péché de niveau ≤ à sa valeur. Jet de Conscience/Conviction, difficulté 6 + (Route − niveau du péché). Échec : −1 Route ou −1 Vertu. Baisse volontaire possible sans jet.
- **Moments de vérité**, **changement de Route** (descendre les Vertus à changer à 1, descendre la Route à 1, puis jet de Volonté prolongé à difficulté 10 − total des Vertus, 1 Volonté par jet, 10 succès ; passer d'une Route à une de ses Voies : 5 succès), **excommunication**, **Golconde**.
- **Réveil en journée** : Perception + Augure (diff 8) pour remarquer, puis jet de Route (diff 8) : 1 succès = 1 tour, 5 = la scène.

---

## 12. Liens de sang

### 12.1 Sur la fiche

Liste des liens : **régnant**, **niveau** (1 à 3), **date de la dernière gorgée**.

| Niveau | Effet (rappel) |
|---|---|
| 1 | Aucun effet mécanique (préoccupation) |
| 2 | Jets sociaux du régnant contre le lié : −1 diff ; agir contre lui demande un jet de Volonté |
| 3 | Lien complet : jets sociaux du régnant −2 diff ; Domination sans contact visuel ; le lié résiste à +2 ; tous les autres liens disparaissent |

Exceptions (catalogues) : Trémères (1ʳᵉ gorgée compte double), Ahrimanes (ne créent ni lien ni goule), Atout Inféodable.

### 12.2 À la table

Résistance temporaire (Volonté diff 8 modifiée par la Nature, le comportement du régnant et le nombre de gorgées, puis 1 Volonté), rupture (−1 niveau après 12 − Volonté mois sans boire).

---

## 13. Disciplines

### 13.1 Règles générales

- Chaque clan, caste ou lignée a **3 Disciplines de clan** (catalogue clans) ; elles fixent le coût d'expérience (§6).
- Une Discipline a une valeur de 1 à 5 ; **au-delà de 5** uniquement à partir de la **7ᵉ Génération**. À ces niveaux, un vampire peut connaître **plusieurs pouvoirs du même niveau**.
- **Pouvoirs connus** : de 1 à 5, déduits de la valeur ; 6 et plus, choisis dans le catalogue (ou créés avec le MJ).
- **Lancer depuis un pouvoir** : réserve et difficulté pré-remplies (modifiables), **coût en sang ou en Volonté proposé à la dépense**.

### 13.2 Disciplines physiques

Elles n'ont pas de pouvoirs nommés de 1 à 5 ; leurs **bonus permanents** sont appliqués automatiquement.

| Discipline | Bonus permanent | Activation (1 sang, rappel + dépense proposée) |
|---|---|---|
| Célérité | + valeur aux réserves basées sur la Dextérité (initiative comprise) et au déplacement ; décochable par jet | Ignorer la pénalité de difficulté des actions multiples jusqu'à la valeur de Célérité (dont la moitié, arrondie au supérieur, peuvent être des attaques) ; ou multiplier la vitesse par (1 + Célérité) |
| Force d'âme | + valeur aux réserves basées sur la Vigueur (absorption comprise) ; absorbe l'aggravé | Une fois par tour, la valeur devient des succès automatiques d'absorption (sauf feu et soleil) |
| Puissance | + valeur aux réserves basées sur la Force | Les dés de Puissance deviennent des succès automatiques pour le tour (dégâts au corps à corps compris) |

Au-delà de 5 : progression chiffrée **ou** pouvoirs nommés (catalogue).

### 13.3 Disciplines combinées

Prérequis (plusieurs Disciplines à un niveau minimum) et coût fixe en XP (catalogue). Les prérequis sont vérifiés à l'achat.

### 13.4 Troisième œil (Valeren)

Bosse au front dès le 1er point, œil ouvert au 3ᵉ.

### 13.5 À la table

Apprentissage (Disciplines physiques et de clan sans mentor ; les autres demandent un mentor qui connaît le niveau ; un diaboliste peut apprendre les Disciplines de sa victime), échec critique sur un jet de Discipline (la Bête se déchaîne, conséquence dramatique choisie par le MJ), confrontations Augure / Occultation / Chimérie.

---

## 14. Magie du sang

Règles générales ; voies, kraina et rituels au catalogue magie du sang.

### 14.1 Thaumaturgie et Nécromancie

- Une valeur de Discipline. **Chaque point** donne **1 point dans la voie principale et 1 rituel** de niveau inférieur ou égal.
- **Voies secondaires** : leur valeur ne dépasse jamais celle de la Discipline. Achat §6.
- **Rituels** : en nombre libre, de niveau ≤ à la valeur de la Discipline.
- **Jet de voie de Thaumaturgie** : 1 sang + Volonté, difficulté niveau du pouvoir + 3.
- **Jet de rituel de Thaumaturgie** : Intelligence + Occultisme, difficulté niveau + 3 (max 9).
- Nécromancie : jets propres à chaque pouvoir.
- Sorcellerie assamite et sorcellerie sétite : fonctionnent comme la Thaumaturgie.

### 14.2 Koldunisme

- Toujours **hors clan**.
- Une **kraina principale** ; chaque point donne le pouvoir suivant d'une kraina connue ou le 1er pouvoir d'une nouvelle. Le Genius Loci n'est jamais la kraina principale.
- Jet : 1 sang + Attribut (valeur **non modifiée** par le sang ou les Disciplines) + Occultisme, difficulté niveau + 4 ; **−2** pour la kraina principale.

### 14.3 Ogham

Même logique que le Koldunisme (Genius Loci, « talamh », en voie secondaire).

### 14.4 Mysticisme de l'Abîme

Rituels uniquement. Occultisme 3 requis ; niveau du rituel ≤ Obténébration et ≤ Occultisme ; sans spécialité Occultisme (Abîme), +1 diff. Coût §6. Certains rituels infligent des Handicaps qui ne rapportent aucun point.

### 14.5 Sur la fiche

Voie principale, voies secondaires (valeurs), kraina principale, liste des rituels (niveau), lancer pré-rempli.

---

## 15. Clans et lignées

### 15.1 Fiche

- **Clan ou lignée** (catalogue), **caste/branche** si elle existe, **clan d'origine** pour les Enfants d'Osiris et les Kiasyd (il fournit 2 Disciplines et la faiblesse).
- Disciplines de clan déduites de cette sélection.
- **Faiblesse** : texte de rappel + **champ personnalisé** quand elle se choisit :

| Clan / caste | Champ |
|---|---|
| Malkaviens | Dérangement incurable (catalogue) |
| Ventrue | Type de proie |
| Ravnos | Trait de personnalité clé |
| Assamites (Vizirs) | Capacité objet de l'obsession |
| Gangrel | Traits animaux en cours (texte) |
| Guerriers de Glycon | Source de pouvoir |
| Salubri Veilleurs | Domaine d'étude |

### 15.2 Effets appliqués par la fiche

- Apparence bloquée à 0 : Nosferatu.
- Imiter la vie indisponible : Cappadociens.
- Multiplicateurs d'XP : Vrais Brujah.
- Plafond de Génération : Giovani (11ᵉ au plus).
- **État de faiblesse** (§17).

### 15.3 Modifications manuelles

Lhiannan (la Génération du sire augmente de 1 à chaque Étreinte), Niktuku (−1 Apparence par siècle depuis l'Étreinte, reporté sur un Attribut physique).

### 15.4 Contraintes à la création

- Disciplines de départ : de clan uniquement (Caïtif : au choix avec accord du MJ).
- Statut interdit aux Caïtifs.
- Giovani : 11ᵉ Génération au plus.
- Les Gargouilles et les goules ne sont **pas jouables**.

### 15.5 À la table

Clans hauts et bas (varient selon la région ; champ texte facultatif), lignées autorisées dans la chronique (annoncées par le MJ ; réglées au niveau du slug).

---

## 16. Atouts et Handicaps

- Liste sur la fiche avec **statut « validé MJ »** ; total plafonné par le paramètre de chronique.
- Effets via **modificateurs manuels**, sauf les Atouts/Handicaps **structurants**, appliqués par la fiche :

| Atout / Handicap | Effet appliqué |
|---|---|
| Robuste | +1 niveau Contusionné |
| Enfant | Force et Vigueur plafonnées à 2 |
| Monstrueux | Apparence 0, non augmentable |
| Sang faible | Disciplines plafonnées à 4 ; coût en sang des pouvoirs doublé |
| Treizième Génération | Génération 13ᵉ ; +1 diff pour activer les Disciplines |

- Restrictions de clan, prérequis et exclusions : vérifiés à la création (catalogue).
- Usages limités (Chanceux, Neuf vies, Amour véritable) : **à la table**.
- **Barème de référence** pour juger un Atout ou Handicap maison :
  - 1 point : effet ponctuel ou −1 diff dans des cas précis ;
  - 3 points : effet régulier ou jusqu'à −3 diff, ou bénéfice pour les proches ;
  - 5 points : contourne une règle ou affecte tout l'entourage.

---

## 17. États

Cochables sur la fiche. Ce sont des **indicateurs** : leurs effets sont rappelés dans l'onglet Référence et s'appliquent via modificateurs, **sauf l'état de faiblesse**.

| État | Rappel |
|---|---|
| Frénésie | Ignore les malus de blessure ; Domination +2 diff contre lui ; immunisé au Rötschreck ; 1 Volonté = 1 tour de contrôle |
| Rötschreck | Fuite de la source de peur ; 1 Volonté = 1 tour de contrôle |
| Éveillé de jour | Réserves plafonnées par la Route |
| Torpeur | §9.3 |
| Empalé | Paralysé ; −1 sang par nuit ; sans sang, −1 niveau de santé par jour ; torpeur au 7ᵉ jour |
| **État de faiblesse** | **Appliqué** : réduction des réserves définie par le clan, avec compteur si besoin |

**États de faiblesse définis par les clans**

| Clan / lignée | Déclencheur | Effet appliqué |
|---|---|---|
| Tzimisce | Jours de repos sans terre natale (compteur) | Toutes les réserves divisées par 2 par jour, cumulatif, minimum 1 dé ; une journée de repos avec la terre remet à zéro |
| Gargouilles | Seule au monde | Toutes les réserves divisées par 2 |
| Lhiannan | Semaines hors de la nature (compteur) | −1 dé par semaine, cumulatif, sans descendre sous la Vigueur non modifiée |
| Anda | Première heure après le coucher et dernière heure avant l'aube | Comme « Éveillé de jour » |

---

## 18. La Bête : frénésie et Rötschreck

- **Jets normaux**, joués à la table :
  - frénésie : Maîtrise (résister) ou Instinct (guider) ;
  - Rötschreck : Courage.
- Plafonds §4.5 et §11.1. Prolongée : **5 succès** pour résister complètement ; chaque succès en dessous = 1 tour de répit.

**Difficultés de référence – frénésie**

| Provocation | Diff. |
|---|---|
| Odeur du sang, affamé | 3 |
| Vue du sang, affamé | 4 |
| Harcèlement | 4 |
| Situation mortelle | 4 |
| Moqueries malveillantes | 4 |
| Provocation physique | 6 |
| Goût du sang, affamé | 6 |
| Être cher en danger | 7 |
| Humiliation publique | 8 |
| Risque d'atrocité | 9 − Conscience/Conviction |

**Difficultés de référence – Rötschreck**

| Provocation | Diff. |
|---|---|
| Allumer une lampe | 3 |
| Vue d'une torche | 5 |
| Feu de joie | 6 |
| Soleil voilé | 7 |
| Être brûlé | 7 |
| Soleil direct | 8 |
| Pris dans un bâtiment en feu | 9 |

- Échec critique : frénésie jusqu'à décision du MJ, Dérangement possible.
- Faiblesses et Atouts qui modifient ces jets (Brujah, Initié de la Route…) : via modificateurs.

---

## 19. Dérangements

- Liste sur la fiche (catalogue divers) : **Dyscrasie** (Mélancolique, Flegmatique, Sanguin, Colérique), **Courroux divin** (Compulsion, Lunatisme, Mal sacré, Danse de Saint-Guy), **Péchés de l'âme** (Animisme sanguinaire, Visions, Voix).
- Marque **incurable** pour un Dérangement de clan (Malkaviens).
- Déclenchement en situation de stress (tout ce qui appelle un jet de Maîtrise/Instinct), effet pour la nuit ; 1 Volonté = 1 tour de lucidité. Effets via modificateurs.

---

## 20. Coterie

- Élément de **table** (chronique), pas de la fiche. **Optionnelle** : créée par le MJ (scénario, campagne) ou à l'initiative des personnages.
- **Historiques mis en commun** : chaque personnage choisit de verser ou non des points d'Historique (Alliés, Contacts, Domaine, Troupeau, Influence, Ressources, Serviteurs, Mentor).
- Un Historique **ancre** est désigné ; aucun Historique commun ne peut dépasser l'ancre ; plafond recommandé : 10.
- **Retrait** à tout moment : on récupère un point de moins que ce qu'on a versé.
- Les Historiques communs évoluent par l'histoire, pas par les points bonus ni l'expérience ; l'ancre ne change pas.
- Accès réservé aux **contributeurs**.

---

## 21. Mortels et Étreinte (optionnel, à implémenter en dernier)

- Un personnage peut commencer **mortel** (prélude) :
  - pas de clan, de Génération, de réserve de sang ni de Disciplines ;
  - Vertus Conscience et Maîtrise, Route de l'Humanité ;
  - guérison des mortels ; létal non absorbable sans armure.
- **Étreinte** : déclenchée par le **MJ**, qui fixe le clan, la Génération et le sire. La fiche bascule en vampire (réserve de sang, Disciplines) ; les acquis mortels sont conservés.
- Choix des Disciplines par le joueur à l'Étreinte : **option du MJ**.
- Les goules ne sont pas jouables.

---

## 22. Référence MJ

Consultable, sans mécanique dans l'app. Tables détaillées au catalogue divers.

- **Prouesses physiques** : déplacement (marche 7 m/tour, trot 12 + Dex, course 20 + 3 × Dex), charge (10 kg par point de Force), escalade, conduite, intrusion, saut, soulever/briser (table de Force), ouvrir/forcer, poursuite, équitation, filature, discrétion, natation, lancer.
- **Prouesses mentales** : création, investigation, réparation, recherche, pistage.
- **Prouesses sociales** : beuverie, crédibilité, baratin, interrogatoire, intimidation, éloquence, représentation, séduction (3 jets).
- **Diablerie** : vider le sang, puis Force prolongée diff 9 (chaque succès = 1 aggravé non absorbable) ; euphorie (Maîtrise/Instinct diff 10 − Route) ; −1 Génération si la victime était de Génération plus basse ; traces dans l'aura (années = écart de Génération) ; Potestas Vitae la détecte.
- **Golconde**, devenir mortel, maladies, poisons et drogues, températures extrêmes.
- **Goules** (règles PNJ), **revenants** Tzimisce, **animaux**, **nuées**, **combat monté**, **démons et esprits** (Volonté, Rage, Gnose, Essence).

---

## Annexe A – Règles maison

| Règle | Iso |
|---|---|
| Les 1 n'annulent pas les succès | Chaque 1 annule un succès |
| Linguistique remplace Sagesse populaire ; 1 langue par point | Sagesse populaire ; langues par l'Atout Polyglotte |
| Aura, Routes, frénésie joués de façon narrative | Mécaniques iso (gardées en référence) |
| Historique Génération calculé depuis la Génération de départ de la chronique, plancher 4ᵉ | Départ fixe 12ᵉ |

## Annexe B – Écarts du livre corrigés

| Écart | Traitement |
|---|---|
| Capacités de la V20 moderne dans des exemples (Persuasion, Connaissance de la rue) | Remplacées par la Capacité Dark Ages la plus proche |
| « Path of Blood » (détection de la diablerie) | Potestas Vitae |
| Table d'XP : Vertu en double | Fusionnée (Vertu : valeur × 2) |
| Manœuvres : table ≠ texte | Le texte fait foi |
| Renvoi « jet de réveil p. 360 » (torpeur) | Jet de Route diff 8 |
| Troisième œil au 1er ou au 3ᵉ point | Bosse au 1er, œil au 3ᵉ |
| Formules de difficulté hors bornes | Bornées de 2 à 10 |
| Archétype « Beast » absent de la liste rapide | Écarté |
| Mentor absent de l'encadré des Historiques communs | Inclus |