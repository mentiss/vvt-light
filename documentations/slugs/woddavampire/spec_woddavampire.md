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
| `woddavampire/planche_woddavampire.html`                                 | Planche graphique validée (identité, feuille, assistant, jet, menus, boutons, jauges, marque) |
| `woddavampire/planche_*.html`                                            | Planches d'arbitrage : polices, ornements, sang, marque, réserve de sang |

La **partie II** (en fin de document) porte la spécification d'implémentation du lot 1, issue des phases 1 et 2 du 2026-11-01.

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
  > Option du slug (`CHRONICLE.onesCancelSuccesses`, `config/chronicle.js`) : `false` = règle maison (par défaut), `true` = règle du livre. Dans la règle du livre, un 1 n'annule que les succès lancés (jamais un succès automatique, comme la Volonté), et des 1 qui annulent tous les succès donnent un simple échec : l'échec critique reste « aucun succès et au moins un 1 » dans les deux règles.
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
| 4. Avantages | 4 points de Disciplines, 5 points d'Historiques, 7 points de Vertus | Disciplines **de clan**, plus **Célérité, Augure et Puissance** (règle maison, §15.4) ; Caïtif : au choix, accord MJ ; 1 point gratuit dans chaque Vertu |
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
- **Atouts et Handicaps** : facultatifs ; total des Handicaps limité par le paramètre de chronique ; les Handicaps donnent des points bonus supplémentaires. Validation par le Conteur autour de la table (pas de statut sur la fiche).
- Les **contraintes de clan** s'appliquent (§15.4).

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
| Historique | valeur actuelle × 2 (accord du MJ) ; nouvel Historique : 10 (P-6) |
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
- Plafond de Génération : Giovani (11ᵉ au plus, c'est-à-dire 11ᵉ ou plus puissante : au moins 1 point d'Historique Génération avec un départ en 12ᵉ).
- **État de faiblesse** (§17).

### 15.3 Modifications manuelles

Lhiannan (la Génération du sire augmente de 1 à chaque Étreinte), Niktuku (−1 Apparence par siècle depuis l'Étreinte, reporté sur un Attribut physique).

### 15.4 Contraintes à la création

- Disciplines de départ : de clan, plus **Célérité, Augure et Puissance**, accessibles à tous (règle maison du MJ, points de départ comme points bonus) ; Caïtif : au choix avec accord du MJ. Le coût en XP reste celui d'une Discipline hors clan si elle n'est pas de clan (§6).
- Statut interdit aux Caïtifs.
- Giovani : 11ᵉ Génération au plus (au moins 1 point d'Historique Génération) ; rappel non bloquant, c'est une règle de table.
- Les Gargouilles et les goules ne sont **pas jouables**.

### 15.5 À la table

Clans hauts et bas (varient selon la région ; champ texte facultatif), lignées autorisées dans la chronique (annoncées par le MJ ; réglées au niveau du slug).

---

## 16. Atouts et Handicaps

- Liste sur la fiche (nom, coût, effet) ; total plafonné par le paramètre de chronique. **Validation par le Conteur autour de la table**, sans statut sur la fiche (MJ, 2026-11-03).
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

**Décision du MJ (2026-11-03)** : les états ci-dessous **se règlent à la table**, sans bascule sur la fiche (ils n'y changeaient rien et brouillaient la lecture). Seul **l'état de faiblesse du clan** est sur la fiche, dans le bloc Faiblesse, car il est appliqué aux réserves.

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

---
---

# Partie II – Spécification d'implémentation

> Phases 1 (cadrage) et 2 (spécification) du 2026-11-01, validées par le MJ. La partie I reste la référence des règles ; cette partie dit ce que l'app en fait, dans quel ordre, et sous quelle forme.

## II.1 Décisions de cadrage

| Sujet | Décision |
|---|---|
| Slug | `woddavampire`, libellé « Vampire : l'Âge des Ténèbres », préfixe CSS `vda-`, **visible** à l'accueil dès sa création |
| Philosophie | Pas de sur-ingénierie : beaucoup se joue à la table ; on n'automatise que ce qui est pénible à gérer à la table. Chaque automatisme est justifié. |
| Paramètres de chronique (§2) | Constantes du slug (`config/chronicle.js`), sans table ni écran MJ. Un autre décor (ex. Rome by Night) sera un **slug dérivé** qui reprend le parent et change ces constantes et le style : le slug reste séparable (catalogues en données, composants sans valeur de chronique en dur). |
| Budget de création | Unique, celui du livre (15 points bonus, 5 Historiques, 4 Disciplines, 7 Vertus). La fiche reste libre après la création. |
| Clés et libellés | Clés stables en anglais (VO : `auspex`, `true_brujah`, `via_humanitas`), libellés français à part : le glossaire VF ne touchera que les libellés, sans migration. |
| Catalogues | Structurés au maximum, conditions des jets comprises (voir II.5) ; texte seulement quand ce n'est vraiment pas structurable, avec la liste exacte de ces cas. |
| Fiche | **Un seul onglet**, sur le modèle de la fiche officielle ; les détails (pouvoirs, descriptions) s'ouvrent d'un clic sans changer d'onglet. Ergonomie avant tout. Autre onglet : Journal. |
| Onglet Référence (§4.1) | Devient une **aide de jeu côté Conteur** avec recherche (lot « extra ») ; un onglet « Mon clan » côté joueur est rangé en bonus. |
| Ressources de session | Aucune : tout passe par HTTP (sauvegarde puis diffusion par le serveur), aucun échange socket propre au slug. La coterie (fiche de groupe) suivra le même chemin. |
| Combat | Bloc `combat` minimal au lot 1 ; le combat générique (`spec_combat.md`) sera rediscuté plus tard. |
| Cases à cocher | L'interdiction vise les `<input type="checkbox">` de formulaire : les pistes de la fiche (santé, réserves) sont des cases cliquables habillées ; les options (spécialité, Volonté…) sont des bascules. |
| Largeur | Toutes les interfaces exploitent toute la largeur (aucune largeur maximale centrée). |

## II.2 Lots

| Lot | Contenu |
|---|---|
| **1. Création** | Serveur, schéma complet, assistant de création contrôlé, catalogues utiles à la création, feuille provisoire en lecture seule, menus, thème, marque |
| **2. Fiche** | Feuille complète et libre, jet de réserve et ses options, jauges, Réveil et Fin d'histoire, pouvoirs et lancer, raccourcis de combat, états, liens de sang, dépense d'XP calculée ; malus de blessure et bonus permanents (Célérité, Force d'âme, Puissance) appliqués |
| **3. MJ** | Onglets Session (avec la musique), Journal, Historique ; panneau d'historique côté MJ |
| **4. Extra** | Coterie, mortels et Étreinte (§21), aide de jeu du Conteur |
| **5. Bonus** | Panneau d'historique côté joueur, onglet « Mon clan », combat générique éventuel |

Le schéma est conçu dès le lot 1 pour tous les lots (colonnes *(L2)* ou *(L4)* inutilisées jusque-là), pour ne pas le refaire.

## II.3 Résolution des jets (rappels pour l'app)

- Réserve de d10 contre une difficulté de 2 à 10 ; les 1 n'annulent rien (règle maison) ; échec critique = aucun succès et au moins un 1 ; spécialité : un 10 compte 2 succès.
- **Succès automatiques** (Volonté, Puissance ou Force d'âme activées) : ils **ne roulent pas**. Les dés concernés sortent de la réserve lancée et s'ajoutent au résultat ; le rendu les montre à part.
- Animation : tous les dés lancés en une seule vague.

## II.4 Schéma SQLite (`database-template/woddavampire-schema.sql`)

Bâti sur `base.sql` (tables partagées reprises telles quelles, compte MJ `id = -1`).

**`characters`**, colonnes propres :

| Groupe | Colonnes |
|---|---|
| Identité | `chronicle`, `concept`, `nature_key`, `demeanor_key`, `sire` |
| Clan | `clan_key`, `caste_key` (caste ou branche), `origin_clan_key` (Enfants d'Osiris, Kiasyd), `weakness_detail` |
| Sang | `generation`, `blood_current` |
| Route | `road_key`, `road_path_key`, `road_rating` |
| Vertus | `virtue_moral` (Conscience ou Conviction), `virtue_control` (Maîtrise ou Instinct), `virtue_courage` ; libellés déduits de la Route |
| Volonté | `willpower_permanent`, `willpower_current` |
| Attributs | `strength`, `dexterity`, `stamina`, `charisma`, `manipulation`, `appearance`, `perception`, `intelligence`, `wits` |
| Santé *(L2)* | `damage_bashing`, `damage_lethal`, `damage_aggravated` (rangement automatique : trois compteurs suffisent) |
| États *(L2)* | `states` (JSON), `weakness_counter` |
| Histoire | `history_life`, `history_sire`, `history_nights` (les trois phrases), `languages`, `description`, `notes` |
| XP *(L2)* | `xp_total`, `xp_spent` |
| *(L4)* | `is_mortal` |

Non stockés (calculés) : sang maximum, sang par tour, plafond des traits, statut de Route, malus de blessure.

**Sous-tables** (une ligne par trait acquis) :

| Table | Colonnes | Lot |
|---|---|---|
| `character_abilities` | `ability_key`, `rating`, `specialties` (JSON), `domains` (JSON) | 1 |
| `character_backgrounds` | `background_key`, `rating`, `details` | 1 |
| `character_disciplines` | `discipline_key`, `rating`, `powers` (JSON : pouvoirs au-delà de 5, kraina acquises) | 1 |
| `character_blood_paths` | `discipline_key`, `path_key`, `rating`, `is_primary` | 1 |
| `character_rituals` | `discipline_key`, `ritual_key`, `level`, `custom_name` | 1 |
| `character_merits_flaws` | `entry_key`, `kind` (atout / handicap), `cost`, `details` (validation par le Conteur autour de la table, sans statut : colonne `gm_validated` retirée le 2026-11-03) | 1 |
| `character_derangements` | `derangement_key`, `incurable`, `details` | 2 |
| `character_blood_bonds` | `regnant`, `level`, `last_drink` | 2 |
| `character_equipment` | armes, armure, bouclier | 2 |

Capacités en sous-table (et non en 30 colonnes) : spécialités et domaines par Capacité, Artisanat corporel propre aux Tzimisce, liste propre à un slug dérivé.

## II.5 Catalogues (`src/client/src/systems/woddavampire/config/`)

| Fichier | Lot 1 |
|---|---|
| `chronicle.js` | Génération de départ 12, plafond des Handicaps 7, alphabétisation non supposée, lignées autorisées (toutes les lignées jouables par défaut) |
| `clans.js` | Clans, castes, branches : 3 Disciplines, faiblesse, champ personnalisé, effets appliqués, contraintes, jouable |
| `roads.js` | Routes et Voies : Vertus imposées, aura (hiérarchies des péchés au lot 2) |
| `archetypes.js`, `backgrounds.js`, `abilities.js` | Spécialités suggérées, domaines d'expertise, règles de la Capacité à 0 |
| `meritsFlaws.js` | Coût fixe, au choix ou en échelle ; restrictions, prérequis, exclusions ; entrées structurantes |
| `disciplines.js` | Liste, Disciplines physiques, magie du sang (pouvoirs détaillés au lot 2) |
| `bloodMagic.js` | Voies, kraina, rituels (clé, nom, niveau, forme) ; jets structurés au lot 2 |

**Structure d'un jet de pouvoir** (fixée dès maintenant) :
- `roll.pool` : traits (`['perception', 'empathy']`), ou choix parmi plusieurs, avec `rawAttributes` (Attribut brut du Koldunisme) ;
- `roll.difficulty` : nombre, `{ formula: 'level + 3', max: 9 }`, `{ input: 'target_willpower', label }`, bonus conditionnel (`primaryKraina: -2`) ;
- `cost` : `blood`, `willpower`, niveaux de santé, `when`, `freeWhen` ;
- `inputs` : saisies de contexte au lancer (ex. mystiques assistants : −1 diff, max Occultisme) ;
- `note` : ce qui ne se structure pas.

## II.6 Assistant de création (lot 1)

Un onglet **Guide** puis sept onglets en **navigation libre** (§5.1), chacun avec son compteur (rouge : points restants ; vert : terminé), et un résumé qui liste ce qui manque.

| Onglet | Contenu | Contrôles et calculs |
|---|---|---|
| **Guide** | Ce qu'est un Caïnite en 1242, les étapes de création, le principe d'un jet (d10, difficulté, succès), priorités et points bonus (conseil : les bonus en dernier) | Page courte, renvois vers les onglets |
| **Lignée et Route** | Clan, caste ou branche, clan d'origine ; Route et Voie | Clans majeurs affichés, **lignées repliées** par défaut ; lignées limitées par `chronicle.js`, Gargouilles et goules exclues ; le clan fixe les Disciplines de clan, la Route le couple de Vertus ; **Routes de clan** proposées seulement à leur clan (Sang : Assamites ; Abîme : Lasombra ; Paradoxe : Ravnos ; Set : Disciples de Set ; Code de Samiel : Salubri Guerriers), retour à la Route de l'Humanité si le clan change ; une ligne d'accroche sur chaque carte |
| **Attributs** | Priorités 7 / 5 / 3, répartition | 1 point gratuit partout (Apparence 0 : Nosferatu, Monstrueux) ; maximum 5 |
| **Capacités** | Priorités 13 / 9 / 5 | Maximum 3 ; domaine obligatoire (Érudition, Commerce, Artisanat, Représentation) ; Artisanat corporel pour les Tzimisce |
| **Avantages** | 4 Disciplines, 5 Historiques, 7 Vertus | Disciplines de clan, plus Célérité, Augure et Puissance (§15.4) ; les autres en mode points bonus seulement (Caïtif : toutes, rappel « accord du Conteur ») ; Statut interdit aux Caïtifs ; Thaumaturgie et Nécromancie : voie principale et un rituel par point ; Koldunisme hors clan (points bonus ou XP seulement) |
| **Finitions** | 15 points bonus, Atouts et Handicaps | Barème §5.2 ; Handicaps plafonnés à 7 ; restrictions, prérequis, exclusions ; validation par le Conteur autour de la table |
| **Identité** | Nom, joueur, chronique, concept, Nature, Attitude (« Bête » exclue), sire, trois phrases d'historique | Placé entre Finitions et Sang (demande du MJ) |
| **Sang et résumé** | Génération, réserve de départ, Route, Volonté, récapitulatif | Génération = 12 − Historique Génération (plancher 4ᵉ) ; jet animé 1d10 + Domaine + Troupeau, plafonné ; Route = Vertu morale + Vertu de maîtrise, Volonté = Courage, figées à la fin des Avantages |

- Validation bloquée tant qu'il reste des points de priorités, de Disciplines, d'Historiques ou de Vertus ; points bonus restants : simple avertissement.
- Chaque trait distingue les points gratuits, ceux des priorités et ceux des points bonus (plafond de 3 aux Capacités, remboursement quand on retire un point). À l'écran : gris, encre, sang.
- **Aide** : colonne fixe à droite (sous l'onglet sur téléphone) qui décrit l'élément survolé ou cliqué : clan, Route, Voie, Attribut, Capacité, Historique, Discipline, Vertu, Atout ou Handicap ; description, sens des points de 1 à 5 quand il existe, coût. Textes courts reformulés des livres, réunis dans `config/descriptions.js` (un seul fichier à relire, clés des catalogues), relus par le MJ.
- **Points bonus** : compteur toujours visible dans l'en-tête de l'assistant ; interrupteur « Dépenser des points bonus » (Attributs, Capacités, Avantages), suivi d'une phrase qui dit ce que fait un clic, coupé ou activé, dans l'onglet en cours. Pas de colonne d'aide sur le Guide ; un lien « Aide de l'onglet » ramène à l'aide de l'onglet.
- **Navigation** : sous la barre des points bonus, une ligne « À faire » (erreurs puis avertissements de l'onglet, ou « Étape terminée ») ; boutons Précédent / Suivant en bas de chaque onglet. Compteur de chaque colonne sous ses priorités (« Reste 3 à répartir », « Réparti », « Dépassement ») ; un clic sur un point sans priorité allume le rappel « Choisissez d'abord une priorité ». Le détail des points bonus dépensés (par poste, Handicaps en positif) s'affiche sous le compteur, chaque poste menant à son onglet.
- **Lignée et Route** : une fois choisis, le clan et la Route se replient sur leur fiche (caste, clan d'origine, Disciplines, faiblesse ; Voie, Vertus, aura), avec un bouton « Changer ».
- **Atouts et Handicaps** : une catégorie à la fois ; chaque entrée montre son coût et son effet, un bouton « Prendre », et la raison quand elle est interdite.
- **Résumé** : sans élément survolé, la colonne d'aide montre « Votre Caïnite » (clan, Route, Génération, Volonté, Disciplines, points bonus) sous l'aide de l'onglet. Portrait facultatif dans l'onglet Identité.
- Un trait devenu interdit (clan changé, Atout ou Handicap ajouté) rend ses points automatiquement (priorités ou points bonus) ; une Route de clan devenue interdite revient à la Route de l'Humanité.
- Le Conteur n'impose rien dans l'assistant : il corrige la fiche ensuite.
- Le lot 1 ne crée que des vampires (prélude mortel au lot 4).
- Règles de calcul en fonctions pures, rangées dans `config/rules/` (`character.js` : Génération, clan, profil affiché, pouvoirs connus ; `creationRules.js`, `sheetRules.js`, `dicePool.js`, `powerRoll.js`), testées en miroir dans `src/client/tests/systems/woddavampire/config/rules/`. Les catalogues (données) sont dans `config/`.
- Organisation du code (refonte du 2026-11-03, sans changement d'écran) :
  - `hooks/` : `useVdaRoll` (seul lancement d'un jet : fiche, fenêtres de jet, assistant) et `useTableCharacters` (personnages de la table du Conteur) ;
  - `components/ui/` : briques d'interface (`VdaUi`) et bande fixe commune (`VdaTopBar`) ;
  - `components/layout/` : sections partagées par la fiche joueur et la fiche du Conteur (`VdaTraits`, `VdaPowers`, `VdaCombat`, `VdaConditions`, `VdaSheetParts`), avec une option `compact` pour la présentation du Conteur ; assemblages `VdaSheet` (joueur) et `VdaGmSheet` (Conteur), qui gardent chacun leurs blocs propres ; `VdaGmTableRow` (ligne de la table du Conteur) ;
  - `components/modals/` : toutes les fenêtres, joueur et Conteur ;
  - `gm/tabs/` : les onglets du Conteur seulement.

## II.7 Serveur

- `config.js` : `{ slug: 'woddavampire', label, dbPath, schemaPath, generateAccessUrl }`, sans `hidden`. Adresses d'accès tirées dans trois vocabulaires : Église et foi, Caïnites, nuit et sang (ex. `prince-ostensoir-0412`, `vitae-matines-7731`).
- `routes/characters.js` et `CharacterController.js` : sur le modèle normalisé de master (v5.9.x) : COALESCE sur les colonnes à plat, `_syncSubTable` en transaction pour les sous-tables, diffusion de la mise à jour par HTTP, droits habituels (`authenticate, requireOwnerOrGM`, `requireGM` en suppression, `GET /characters` public).
- Aucune autre route, aucun échange socket propre au slug ; les catalogues ne vivent que côté client.
- Contrat serveur : `tests/server/systems/woddavampire/fixture.js` (le contrat `/characters` teste tout slug découvert).

## II.8 Client (lot 1)

| Élément | Lot 1 |
|---|---|
| `Creation.jsx` | L'assistant complet, puis l'écran du code d'accès |
| `Sheet.jsx` | Feuille provisoire en lecture seule, menu joueur complet (création, changer de personnage, jet libre, code d'accès, configuration des dés, interface MJ, déconnexion) |
| `GMApp.jsx` | Menu MJ (gestion des tables, configuration des dés, déconnexion) et liste des personnages |
| `config.jsx` | 5 hooks de dés et bloc `combat` minimal ; au lot 1 : jet de sang de départ et jet libre ; `diceConfigDefault` aux couleurs du slug |
| `VdaHistoryEntry.jsx` | Jet libre en premier (`parseFreeRoll`), puis le jet de sang de départ |
| `theme.css`, `Brand.jsx`, `Brand.css` | Repris de la planche validée |

### II.8.1 Fiche (lot 2a, feuille vivante)

- **Bande fixe** : header (titre du jeu seulement, jamais le nom du personnage ; thème ; menu) et sous-header (onglets Fiche / Journal / Historique, bouton de jet en icône de d10, Édition en icône de plume, ou Annuler / Enregistrer) forment une bande collée en haut, fermée par un double filet et une ombre. Onglet actif : intercalaire à l'encre, liseré de sang.
- **Édition** : la fiche est libre en mode Édition ; Volonté temporaire, sang et santé restent cliquables hors édition et s'enregistrent tout de suite. Portrait en médaillon, changé en mode Édition (outil d'avatar de la plateforme).
- **Jets** : un clic sur un trait, une Discipline ou une Vertu ouvre la fenêtre de jet pré-remplie ; le bouton d10 ouvre une fenêtre vide. Fenêtre : réserve et difficulté en tête ; Attributs par groupes de 3 et Capacités en mini-onglets à gauche ; modificateurs libellés, options (Spécialité, Volonté, réflexe, bonus de Discipline physique), détail et résultat à droite. Règles en fonctions pures (`config/rules/sheetRules.js`, testées).
- **Réveil** près du sang (−1 sang, +1 Volonté) ; **Fin d'histoire** dans le menu, avec confirmation (Volonté remise à la permanente).
- **Santé** : un clic fait passer une case de vide à contondant, létal, aggravé, puis vide ; rangement automatique ; pire niveau mis en évidence ; Robuste ajoute une case. Taches de sang séché : une par clic (contondant 1, létal 2, aggravé 3), à places fixes pour le personnage, réparties sur la feuille.
- **Soif** : filtre devant la fiche, sous la bande fixe, plus sombre à mesure que la réserve baisse, battement sous le seuil de la faim ; onglet Fiche seulement, coupé en mode Édition.

## II.9 Identité graphique (planche validée)

Référence : `documentations/woddavampire/planche_woddavampire.html`. Direction : manuscrit gothique de nuit, le poids de l'Église et le sang, **dosé** (discret, jamais envahissant).

| Élément | Décision |
|---|---|
| Polices | **DeRoos Caps** (titres du livre) pour la marque et les titres ; **Lombardic** pour les lettrines ; **Sorts Mill Goudy** (reprise libre de Goudy Old Style, texte du livre) pour le texte, chiffres alignés. DeRoos et Lombardic **complétées de leurs accents** : `src/client/public/fonts/DeRoosCaps-FR.ttf`, `Lombardic-FR.ttf`, fabriquées par `scripts/fonts/add_french_accents.py` |
| Couleurs | Nuit (principal) : crypte presque noire, vélin à la chandelle, sang, or, améthyste. Jour : vélin, encre brune, rouge rubrique, or liturgique |
| Coins | Ferronnerie à épines générée (`ornements/a1-ferronnerie-coin.png`), une image retournée pour les quatre angles, éclaircie la nuit par filtre |
| Titres | Grands titres : fleurons de fer à roses (`ornements/t1-titre-fleuron-gauche.png`), **taille fixe** ; titres de colonne : doubles filets rouges |
| Sang | **Pas de coulures.** La page **boit le sang** : imprégnation depuis un bord ou un coin (jamais le haut d'une carte de jet), lente, plus chargée à l'origine, puis séchage du bordeaux au brun mat (échec critique, historique et notification). Taches séchées plates (`sang/seche-*`, sans la tache ronde) qui **suivent les blessures** sur la fiche, une par niveau perdu, à place fixe |
| Santé | Cases à marques : vide, / contondant, X létal, ✱ aggravé (case noircie) ; rangement automatique |
| Réserve de sang | **Carrés gravés** dans le vélin, sang « sombre et épais » ; niveau qui se vide vers le bas et se remplit par le bas ; clic : remplir jusqu'au carré ou vider à partir de lui |
| Volonté temporaire | Mêmes carrés gravés, remplis d'encre (sombre le jour, pâle la nuit), plafonnés par la Volonté permanente |
| Effet de soif | Vignette rouge, flou et désaturation des bords selon la réserve ; battement sous le seuil de la faim (7 − Maîtrise/Instinct) ; centre lisible ; coupé si moins d'animations ; fiche du joueur seulement |
| Boutons | Plaques de fer forgé rivetées ; principal émaillé rouge sang ; « supprimer » en fer chauffé au rouge |
| Bascules | Sceau de cire frappé du tau (`ornements/sceau-cire-tau.png`) ; éteinte : empreinte vide |
| Onglets | Une seule ligne ; flèches de fer de part et d'autre s'ils débordent, bord estompé |
| Menus | Panneau à double filet sang, séparateur en double filet ; icône unique, la croix pattée ✠, pour tous les éléments |
| Ascenseurs, jauges, curseurs | Ascenseur à poignée de fer rivetée ; jauges où le sang monte dans une gorge de fer ; rail de fer, part jouée en sang, bouton en rivet |
| Marque | Carte d'accueil : un Caïnite sous le capuchon, **marqué au front du tau de sang** (la marque de Caïn), sans coins de fer, tache séchée (`marque/e1-tete-capuchon.png`) ; titre, « Reprendre » et icône : le **tau marqué** (`marque/tau-marque.png`) |
| Mis de côté | « Plus de gothique » (pierre, vélin texturé, lumière de vitrail) : à juger sur pièce, la ferronnerie risquant déjà d'alourdir |

À l'intégration : images réduites (environ 300 px, double taille pour les écrans haute résolution) et converties en WebP ; essais écartés retirés de `ornements/`, `sang/` et `marque/` (fait le 2026-11-03 : 25 images supprimées ; restent celles de la planche validée, de la spec et les sources des taches séchées). Les planches de comparaison (`planche_ornements.html`, `planche_marque.html`) gardent la trace des choix mais n'affichent plus les pistes écartées.

## II.10 Points ouverts

| # | Point | État |
|---|---|---|
| P-2 | Giovani « 11ᵉ Génération au plus » | **Tranché (MJ, 2026-11-01)** : lignée issue d'une diablerie et peu nombreuse, son sang reste puissant ; le livre dit « *never going above the Eleventh* ». Donc 11ᵉ ou plus puissante : **au moins 1 point d'Historique Génération** (départ 12ᵉ). Règle de table, à ne pas surdimensionner : simple **rappel non bloquant** dans l'assistant (onglet Sang et résumé), porté par une donnée du catalogue des clans (`minGenerationBackground: 1`). |
| — | Icônes des menus | **Tranché (MJ, 2026-11-01)** : la croix pattée ✠ de la planche, **la même pour tous les éléments**, des menus joueur et MJ (passée en `icon` à chaque `HamburgerMenuItemXXX`, couleur or `--color-accent`) |
| P-5 | Coût d'XP des Disciplines des Caïtifs | **Tranché (MJ, 2026-11-02)** : toutes au tarif hors clan, **valeur actuelle × 7** (nouvelle Discipline : 10). |
| P-6 | Nouvel Historique acheté à l'XP | **Tranché (MJ, 2026-11-02)** : **10 XP**, comme ouvrir une nouvelle Discipline ; ensuite valeur actuelle × 2. |

## II.11 Lot 2b : pouvoirs (cadrage, questions au MJ)

Volume des annexes : **234 pouvoirs de Disciplines** (dont ~40 % avec un jet au format simple « Attribut + Capacité, diff N ») et **138 entrées de magie du sang** (voies, kraina, rituels). Le reste : jets à table, à saisie (« diff = Volonté de la cible »), prolongés, ou pas de jet.

| # | Question | Proposition (reco) | Réponse MJ |
|---|---|---|---|
| B-1 | Comment produire les catalogues ? | Un script lit les tableaux des annexes et génère `config/powers/*.js` (une fois, le fichier généré est versionné ; le script reste dans `scripts/`). Le jet est structuré automatiquement quand il suit le format simple ; sinon il reste en `note` texte, avec la liste exacte de ces cas en fin de spec. L'effet garde le texte de l'annexe (déjà reformulé). Les annexes restent la source : on les corrige, on regénère. | Reco validée (MJ, 2026-11-02) |
| B-2 | Tout le catalogue d'un coup, ou par vagues ? | D'un coup pour les données (le script fait le gros), mais vérification fine par vagues : d'abord les Disciplines des clans majeurs, puis lignées, puis magie du sang. | Reco validée (MJ, 2026-11-02) |
| B-3 | Affichage sur la fiche | Chaque Discipline se déplie (accordéon, sans changer d'onglet) : pouvoirs connus (1 à la valeur), avec nom, coût, durée ; un clic sur le nom montre l'effet ; bouton d10 « Lancer » si le pouvoir a un jet. | Reco validée (MJ, 2026-11-02) |
| B-4 | Coût d'un pouvoir | Avec jet : la fenêtre de jet propose la dépense (bascule « Dépenser 1 sang », cochée par défaut) et la retire au lancer. Sans jet : bouton « Utiliser (1 S) » qui retire le coût, avec rappel de l'effet. | Reco validée (MJ, 2026-11-02) |
| B-5 | Réserves non standard (Volonté, Vertu, Route, Discipline dans la réserve, « Maîtrise/Instinct ») | La fenêtre de jet accepte n'importe quel trait (Attribut, Capacité, Vertu, Route, Volonté, Discipline), pré-rempli par le pouvoir et modifiable ; une difficulté « à saisir » (ex. Volonté de la cible) s'affiche comme un champ à remplir avant de lancer. | Reco validée (MJ, 2026-11-02) |
| B-6 | Activation des Disciplines physiques (1 sang) | Puissance : bascule « Activer (1 sang) » dans la fenêtre de jet, qui transforme les dés de Puissance en succès automatiques (§II.3) ; Force d'âme : idem sur les jets de Vigueur (absorption) ; Célérité : bouton « Activer (1 sang) » sur la fiche avec rappel de l'effet (pas d'effet sur le jet). | Reco validée (MJ, 2026-11-02) |
| B-7 | Pouvoirs de niveau 6 et plus | Choix dans le catalogue en mode Édition, possible seulement à la 7ᵉ Génération ou mieux (stockés dans `powers`) ; pouvoir libre créé avec le MJ : nom + effet en texte. | Reco validée (MJ, 2026-11-02) |
| B-8 | Magie du sang sur la fiche | Sous la Discipline : voie principale et voies secondaires avec leurs pouvoirs connus et le jet générique (Thaumaturgie : 1 S + Volonté, diff niveau + 3 ; Koldunisme : 1 S + Attribut brut + Occultisme, diff niveau + 4, −2 kraina principale) ; rituels avec leur jet (Int + Occultisme, diff niveau + 3, max 9). Ajout de voies secondaires et de rituels en mode Édition. | Reco validée (MJ, 2026-11-02) |
| B-9 | Échec critique sur un jet de Discipline | Le résultat rappelle « La Bête se déchaîne (conséquence choisie par le Conteur) ». Rien d'autre d'automatique. | Reco validée (MJ, 2026-11-02) |
| B-10 | Disciplines combinées | Au lot 2c, avec la dépense d'XP (prérequis vérifiés à l'achat) ; au 2b, rien. | Reco validée (MJ, 2026-11-02) |

## II.12 Lot 2b : jets restés en texte

Liste exacte des jets que le script (`scripts/woddavampire/generate-powers.mjs`) ne structure pas : jets opposés, prolongés, conditionnels ou formulés librement. Sur la fiche, le bouton de jet ouvre la fenêtre avec le texte du livre en rappel, la réserve se compose à la main. Tous les autres jets sont pré-remplis (réserve, difficulté fixe ou « à fixer » avec sa précision). Le script réaffiche cette liste à chaque passage (à recopier ici si les annexes changent).

| Discipline ou voie | Pouvoir | Jet du livre |
|---|---|---|
| Animalisme | Murmures sauvages (Whispers to the Wild) | Man + Animaux pour commander (diff selon la table) |
| Animalisme | Chant de sérénité (Song of Serenity) | Man + Intimidation (peur) ou Man + Empathie (apaisement), diff 7, prolongé jusqu'à succès = Volonté de la cible |
| Animalisme | Griffes du Diable (The Devil's Claws) | Pour finir : 1 V + Instinct/Maîtrise (diff de la provocation, min 4) |
| Augure | Anticiper la victoire (Anticipate Victory) | Per + Capacité utilisée par l'adversaire, diff = Man + Capacité de l'adversaire |
| Augure | Rassemblement d'âmes (A Gathering of Souls) | Contre un non-consentant : Int + Intimidation, diff = Volonté actuelle, prolongé jusqu'à succès = Volonté |
| Augure | Omniscience (Omniscience) | Un seul Per + Conscience pour tous les pouvoirs à jet |
| Augure | Épée de l'âme (Soul's Sword) | Int + Intimidation contre Volonté de la cible |
| Célérité | Défi physique (Physical Defiance) | Traverser quelqu'un : Dex + Athlétisme + Célérité (esquive seulement) |
| Chimérie | Fantasme (Phantasm) | Volonté pour une action complexe en la maintenant |
| Chimérie | Réalité atroce (Horrid Reality) | Pour blesser : Man + Subterfuge, diff = Per + Maîtrise/Instinct de la victime |
| Daimonion | Psychomachie (Psychomachia) | La cible lance sa Vertu la plus basse, diff = Volonté du Baali |
| Daimonion | Apporter la peste (Bring the Plague) | Man + Occultisme contre Vig + Force d'âme |
| Démence | Prison de l'esprit (Prison of the Mind) | Cha + Intimidation contre Ast + Courage, diff 8 |
| Domination | Conditionnement (Conditioning) | Cha + Commandement, prolongé jusqu'à 5 × Maîtrise/Instinct |
| Domination | Possession (Possession) | Duel : Cha + Intimidation contre Volonté, diff 7 (succès nets = Volonté perdue) ; à 0, Man + Intimidation |
| Domination | Manipulation de masse (Mass Manipulation) | Selon le pouvoir, contre la cible la plus forte |
| Mytherceria | Absorption d'aura (Aura Absorption) | Per + Empathie, diff selon l'âge et la force des impressions |
| Occultation | Disparaître de l'œil de l'esprit (Vanish from the Mind's Eye) | Int + Furtivité contre Ast + Vigilance (la plus haute) |
| Occultation | Forteresse de silence (Fortress of Silence) | Contre autrui : Vig + Occultisme, diff = Volonté de la cible |
| Occultation | Faucheur du cœur (Reaper of the Heart) | Masque aux mille visages, diff = Ast + Conscience de la cible (max 9) |
| Obténébration | Arpenter l'Abîme (Walk the Abyss) | Int + Furtivité (passer) ou Int + Bagarre (saisir), diff 7 |
| Obténébration | Oubliette (Oubliette) | Ast + Intimidation contre Dex + Occultisme, diff 7 |
| Quietus | Caresse de Baal (Baal's Caress) | Volonté ; cracher : Dex + Athlétisme diff 6 |
| Quietus | Purifié dans le sang (Cleansed in Blood) | Le sujet : Volonté, diff = niveau du pouvoir + 4 (7 pour un pouvoir inné) |
| Quietus | Endiguer le fleuve du cœur (Dam the Heart's River) | Défense : Volonté, diff = sang bloqué + 5 ; contrôle : Man + Médecine, diff = Vigueur + 3 (max 9) |
| Serpentis | Gueule typhonique (Typhonic Maw) | Langue : diff 7 |
| Serpentis | Forme de la tempête (Form of the Storm) | Éclair : Per + Occultisme |
| Temporis | Contemplation figée (Locked Contemplation) | Soi : Ast + Vigilance, diff 6 ; autrui : Man + Occultisme, diff = Volonté |
| Temporis | Patience des Nornes (Patience of the Norns) | Comme Mouvement de plomb |
| Valeren | Don du sommeil (Gift of Sleep) | Consentant : Volonté diff 6 ; endormir : Volonté contre Volonté, diff 8 |
| Valeren | Garde du berger (Shepherd's Watch) | Franchir : Volonté contre Volonté, diff 8, prolongé (3 succès nets) |
| Valeren | Coup de Morphée (Morphean Blow) | Comme Don du sommeil |
| Valeren | Toucher brûlant (Burning Touch) | Saisie : Dex + Bagarre |
| Valeren | Combat onirique (Dream Combat) | Volonté contre Volonté, diff 7 |
| Valeren | Pacificateur (Peacemaker) | Insulter ou attaquer : Volonté, diff = Route du Salubri |
| Valeren | Libre passage (Safe Passage) | Rencontre fortuite : Volonté contre Volonté, diff 6 |
| Valeren | Purification (Purification) | Volonté contre Volonté, diff 8, jusqu'à 3 succès d'écart |
| Vicissitude | Transmuer l'argile mortelle (Transmogrify the Mortal Clay) | Dex + Artisanat corporel, diff variable (réduire l'Apparence : 5 ; armure : 8) |
| Vicissitude | Le corps impolitique (The Body Impolitic) | Dex + Artisanat corporel pour la détacher sans 1 létal |
| Vicissitude | Maraudeur chiroptère (Chiropteran Marauder) | Griffes ou gueule : For + Artisanat corporel, diff 7 |
| Rituel abyss | Yeux de l'Abîme (Eyes of the Abyss) | Rötschreck diff 4, puis Int + Occultisme, diff 6 |
| Rituel abyss | Serres de l'Abîme (Talons of the Abyss) | Idem |
| Rituel abyss | Révélation de Balthazar (Balthazar's Revelation) | Porteur : Volonté, diff 9 − son Obténébration |
| Rituel abyss | Convocation de l'Abîme (Summoning of the Abyss) | Idem |
| Voie des Os (Path of Bone) | Exorcisme funeste (Baleful Exorcism) | Volonté contre Volonté |
| Voie des Os (Path of Bone) | Possession démoniaque (Daemonic Possession) | Corps d'un vampire sur le point de tomber en cendres : 5 succès en Volonté contre Volonté de l'ancien occupant |
| Voie du Cadavre dans le monstre (Path of the Corpse in the Monster) | Mortuus in Vultus | Sur autrui : toucher (Dex + Bagarre si opposé), puis Vig + Médecine, diff = Vigueur cible + 3 |
| Voie de la Tombe pourrissante (The Grave's Decay) | Étreinte de la Dame de cendres (Ashen Lady's Embrace) | Toucher (Dex + Bagarre si esquive) |
| Voie de la Hantise (Path of Haunting) | Tourment nocturne (Harrowing) | Contact visuel ; Man + Occultisme, diff = Volonté permanente cible |
| Voie du Sépulcre (Path of the Sepulchre) | Contraindre une âme (Compel Soul) | Man + Occultisme contre Volonté du fantôme, diff 6 |
| Voie du Jardin du crépuscule (Path of the Twilight Garden, Lamies) | Murmures à l'âme (Whispers to the Soul) | Cible : Volonté, diff 8 |
| Voie du Jardin du crépuscule (Path of the Twilight Garden, Lamies) | Coiffe des Jamais-nés (Caul of the Neverborn) | Voir les morts : Per + Occultisme, diff 7 |
| Voie vitreuse (The Vitreous Path, Nagaraja) | Festin de Pischacha (Pischacha's Feast) | Fantôme qui veut fuir : Volonté contre Volonté, diff 6 |

## II.13 Lot 2c : combat, états, liens, Dérangements, XP (cadrage, questions au MJ)

Principe appliqué à chaque ligne : l'app fait ce qui est pénible à la table (calculer une réserve, un coût, appliquer une faiblesse permanente) ; le reste reste à la table (dégâts reportés à la main, manœuvres, résistance aux liens). Le schéma prévoit déjà `character_equipment`, `character_blood_bonds`, `character_derangements`, `states`, `weakness_counter`, `xp_total`, `xp_spent`.

| # | Question | Proposition (reco) | Réponse MJ |
|---|---|---|---|
| C-1 | Équipement | Catalogue `config/equipment.js` tiré de l'annexe divers §4 (armes de mêlée, de tir et de jet, armures, boucliers). Sur la fiche, un bloc **Combat** : armes, armure, bouclier, chacun « équipé » ou non ; ajout depuis le catalogue ou en saisie libre (mode Édition). | Reco validée (MJ, 2026-11-02) ; **précisé (MJ, 2026-11-03)** : un **inventaire unique** (une arme est un objet qui permet un jet) : armes en tête, puis armure et bouclier, puis les objets (nom, quantité, note) ; ajout par la modale de catalogue de la plateforme (`CatalogModal`), onglet « Objet libre » pour un objet ou une arme libre ; tout hors mode Édition. Stockage : `character_equipment` (type `item`, colonne `quantity`, migration `03112026_woddavampire_equipment_items.sql`). |
| C-2 | Raccourcis de combat | Pour chaque arme équipée : **Attaque** (Dex + Bagarre, Mêlée, Archerie ou Athlétisme selon l'arme ; diff 6 + modificateur de l'arme, +1 par point de Force manquant) et **Dégâts** (For + bonus ou valeur fixe, type C/L/A, diff 6). Boutons **Blocage**, **Esquive**, **Parade** (diff de parade du bouclier). **Absorption** par type : contondant et létal = Vigueur + Force d'âme + armure ; aggravé = Force d'âme + armure ; feu et soleil = Force d'âme seule. Le résultat donne le nombre de niveaux : **la santé se coche à la main** (la table arbitre défense et absorption). | Reco validée (MJ, 2026-11-02) |
| C-3 | Initiative | Bouton « Initiative » : 1d10 + Dex + Astuce + Célérité − malus de blessure − pénalité d'armure, jet historisé. Pas de tracker : le combat générique de la plateforme sera rediscuté plus tard. | Reco validée (MJ, 2026-11-02) |
| C-4 | Manœuvres, localisation, couvert | Référence seulement, appliquées par les modificateurs libellés de la fenêtre de jet ; leur table ira dans l'aide de jeu du Conteur (lot 4). | Reco validée (MJ, 2026-11-02) |
| C-5 | États (Frénésie, Rötschreck, Éveillé de jour, Torpeur, Empalé) | Bascules à la cire près de la santé. **Indicateurs** (§17) : un état actif affiche son rappel dans la fenêtre de jet (ex. « Éveillé de jour : réserve plafonnée à la Route, 6 »), sans rien appliquer. | Reco validée (2026-11-02), puis **retirée** (MJ, 2026-11-03) : les états se règlent à la table ; seule la faiblesse du clan reste, dans le bloc Faiblesse |
| C-6 | État de faiblesse du clan | **Appliqué** (§17), affiché dans le bloc Faiblesse des Traits particuliers : Tzimisce (jours sans terre natale, compteur : réserves ÷ 2 par jour, minimum 1), Lhiannan (semaines hors nature, compteur : −1 dé par semaine, sans descendre sous la Vigueur), Gargouilles (÷ 2), Anda (rappel « Éveillé de jour »). Compteur sur la fiche pour les clans concernés ; la réduction apparaît comme une ligne « Faiblesse » dans le détail de chaque jet. | Reco validée (MJ, 2026-11-02) |
| C-7 | Liens de sang | Liste sous les Atouts : régnant, niveau 1 à 3, dernière gorgée (texte libre), avec le rappel de l'effet du niveau. Modifiable en mode Édition. Résistance et rupture : à la table. | Reco validée (MJ, 2026-11-02) |
| C-8 | Dérangements | Catalogue (annexe divers §6) ; liste sur la fiche avec l'effet rappelé, « incurable » (Malkaviens) et une précision ; ajout en mode Édition. Effets par modificateurs. | Reco validée (MJ, 2026-11-02) |
| C-9 | Expérience | Bloc **Expérience** : gagnée, dépensée, disponible ; le joueur ajoute l'XP gagnée (+N ; le MJ le pourra aussi au lot 3). Bouton **Dépenser** : fenêtre qui liste les achats possibles avec leur coût calculé (§6.1, modulations §6.2 : clan ou hors clan, Vrais Brujah, voie opposée de Valeren, cases Mentor et Moment de vérité pour la Route) ; valider monte le trait de 1 et ajoute le coût au dépensé. Non bloquant : XP disponible négative affichée en rouge. Rappel « +1 au plus par trait et par histoire », sans suivi. Le mode Édition reste libre (sans coût). | Validé : une **modale** « Dépenser son XP » (MJ, 2026-11-02) |
| C-10 | Journal des dépenses d'XP | Aucun : le total dépensé suffit (le suivi par histoire reste à la table). | Reco validée (MJ, 2026-11-02) |
| C-11 | Disciplines combinées | Catalogue généré depuis l'annexe (même script) ; achat dans la fenêtre d'XP si les prérequis sont remplis ; affichées dans le bloc Pouvoirs avec leur jet. Stockage : **nouvelle colonne JSON `combined_powers`** sur `characters` (schéma + migration `-- systems: woddavampire`). | **Reporté** (MJ, 2026-11-02) : « franchement pour plus tard » ; noté au backlog |
| C-12 | Frénésie et Rötschreck | Rien de plus : les jets de Vertu existent déjà (clic sur la Vertu) ; les tables de difficultés iront dans l'aide de jeu (lot 4). | Reco validée (MJ, 2026-11-02) |

## II.14 Lot 3 : interface du Conteur (cadrage, questions au MJ)

Aujourd'hui : menu MJ (tables, dés, déconnexion) et liste des personnages. Modèle de référence : Fabula (liste de la table à gauche, fiche du personnage choisi à droite, Journal et Historique génériques). Principes repris du lot 2 : UX d'abord, « table ou app ? » pour chaque fonction, briques de la plateforme avant tout code maison.

| # | Question | Proposition (reco) | Réponse MJ |
|---|---|---|---|
| M-1 | Structure de l'interface | Même bande fixe que la fiche joueur : header (« Vampire », thème, menu) et sous-header (onglets **Session**, **Journal**, **Historique** ; actions de page en icônes : jet du Conteur d10). Pas d'onglet Référence : l'aide de jeu est au lot 4. La liste actuelle des personnages disparaît (la gestion des tables du menu suffit). | Validé : la liste de tous les personnages disparaît (MJ, 2026-11-03). |
| M-2 | Onglet Session : disposition | Colonne de gauche : les personnages de la table (avatar, présence, nom, joueur, clan), en tête la musique (`AudioSessionToggle`). À droite : la **fiche du personnage choisi**, le même composant que côté joueur (jets, jauges, Édition), avec une barre d'actions MJ : Note (`GMSendModal`), Copier le code d'accès. Les jets lancés depuis la fiche sont attribués au personnage. | **Revu (MJ, 2026-11-03)** : pas la fiche joueur telle quelle, mais une **fiche MJ** : mêmes informations, réorganisées pour suivre et contrôler (état en grand et contrôlable, caractéristiques compactes, validations sur place), « Modifier » ouvre la fiche complète en Édition. « Simple » ne veut pas dire appauvrie : sens, hiérarchie de l'information, UX et fonctions conservés. Planche HTML avant le code. |
| M-3 | Vue d'ensemble de la table | Dans la liste de gauche, sous chaque nom, un résumé de ce qu'on demande sans cesse aux joueurs : **sang** (x / max), **Volonté** temporaire, **pire blessure** (et malus). Mis à jour en direct (`characterUpdates`). | |
| M-4 | Distribuer de l'XP | Action « Donner de l'XP » dans l'onglet Session : +N à toute la table ou au personnage choisi (ajoute à l'XP gagnée ; chacun dépense ensuite dans sa modale). | Validé, avec **ciblage** : fenêtre qui liste la table en pills (toutes cochées), on décoche pour cibler ; « Donner » aussi depuis la fiche MJ. |
| M-5 | Fin d'histoire collective | Action « Fin d'histoire » pour toute la table (Volonté remise à la permanente pour chacun), avec confirmation. Le Réveil reste au joueur. | Validé, ciblable comme M-4 ; **Réveil collectif** ajouté (MJ). |
| M-6 | Validation des Atouts et Handicaps | Sur la fiche, en mode Édition comme aujourd'hui (bascule « validé MJ ») ; en plus, la liste de gauche signale un personnage qui a des entrées à valider (pastille). | **Retiré (MJ, 2026-11-03)** : la validation se fait autour de la table, plus de statut ni de pastille. |
| M-7 | Jet du Conteur (PNJ) | Bouton d10 de la bande : fenêtre de jet libre au format Vampire (nombre de dés, difficulté, spécialité, succès automatiques, libellé), avec une bascule **« Jet secret »** (non diffusé ni historisé). Le jet libre générique de la plateforme reste dans le menu. | Validé : jets plus simples, bascule **Public / Caché** (MJ). |
| M-8 | Journal | `TabJournal` de la plateforme (`characterId = -1`), pleine largeur. | |
| M-9 | Historique | Onglet `DiceHistoryPage` (jets de la table) **et** panneau flottant `DiceHistoryPanel` monté à la racine, ouvert depuis la zone d'actions (standard plateforme, spec_ui_actions.md). | |
| M-10 | PNJ et combat | Hors lot 3 : les PNJ et le combat générique de la plateforme (`spec_combat.md`) seront rediscutés (lot 4 ou 5). | **Hors périmètre** tant que les systèmes PNJ et combat ne sont pas finalisés ou refondus (MJ, 2026-11-03). |
| M-11 | Habillage | Celui de la fiche joueur (planche validée) : rien de nouveau à valider. | |
**Implémentation (2026-11-03)**, d'après `documentations/woddavampire/planche_conteur.html` :
- `GMApp.jsx` : bande fixe, onglets Session / Journal / Historique, actions de table ciblables (Donner de l'XP, Réveil, Fin d'histoire), jet du Conteur (d10), `DiceHistoryPanel` à la racine.
- `hooks/useTableCharacters.js` (personnages de la table, envoi partiel PATCH), `gm/tabs/TabSession.jsx` (table à gauche, fiche MJ à droite, « Modifier » = fiche complète en Édition), `components/layout/VdaGmSheet.jsx` (fiche MJ : état en grand, États imposés, caractéristiques par catégories, Disciplines, Avantages, Équipement avec catalogue), `components/modals/VdaTableActionModal.jsx` (ciblage en pills, XP saisi), `components/modals/VdaGmDiceModal.jsx` (Public / Caché).
- **États imposés** (Frénésie, Rötschreck, Torpeur ; `config/conditions.js`) : basculés par le Conteur, ils couvrent la page du joueur (voile de sang et Bête floue ; braises ; sépia le jour, cendre la nuit) et remplacent l'effet de soif ; animations coupées si `prefers-reduced-motion`.
- `components/layout/VdaSheetParts.jsx` : briques de fiche partagées par la fiche joueur et la fiche MJ.

## II.15 Lot 4 : extra (cadrage, questions au MJ)

Trois sujets de la partie I : aide de jeu du Conteur (§22 et tables du catalogue divers), coterie (§20), mortels et Étreinte (§21, « optionnel, à implémenter en dernier »). Ordre proposé : aide de jeu (le plus utile en partie, sans serveur), coterie, puis mortels. Même filtre que les lots précédents : « table ou app ? ».

### Aide de jeu du Conteur

| # | Question | Proposition (reco) | Réponse MJ |
|---|---|---|---|
| E-1 | Où | Un onglet **Aide de jeu** dans l'interface du Conteur, après Session. Côté joueur : rien à ce lot (voir X-2). | Reco validée (MJ, 2026-11-03) ; côté joueur : voir X-2 |
| E-2 | Contenu | Les tables « à la table » de la partie I et du catalogue divers : prouesses physiques, mentales, sociales ; manœuvres, localisation et couvert, complications (C-4) ; difficultés de frénésie et de Rötschreck (C-12) ; feu, soleil, chute ; chasse et vaisseaux ; soulever et briser ; guérison des mortels ; déplacements ; poisons et drogues ; diablerie, Golconde ; goules, animaux, nuées, combat monté, démons et esprits. | Validé, et **avec les tables de combat (et autres) qu'on ne trouve aujourd'hui que dans les PDF** (MJ, 2026-11-03) |
| E-3 | Catalogues déjà dans l'app | La recherche porte **aussi** sur les catalogues déjà chargés : pouvoirs de Disciplines et de magie du sang, rituels, Atouts et Handicaps, Dérangements, clans. Le Conteur retrouve en deux frappes le pouvoir qu'un joueur annonce. Lus depuis `config/`, rien de recopié. | Reco validée (MJ, 2026-11-03) |
| E-4 | Recherche et navigation | Sur le modèle de l'onglet Référence de Fabula : sommaire, champ de recherche sans casse ni accents, seuls les blocs trouvés restent avec leur intertitre. Pleine largeur. | Reco validée (MJ, 2026-11-03) |
| E-5 | Mécanique : brique ou copie | Fabula a déjà la mécanique (sections, blocs texte / liste / table, recherche). **Reco : l'extraire en brique de la plateforme** (rendu et recherche), chaque slug gardant son contenu et son habillage ; Fabula la reprend sans changement visible. Alternative : copier le composant dans le slug (plus rapide, mais deux codes à maintenir). | **Brique de la plateforme** (MJ, 2026-11-03) |
| E-6 | Source du contenu | Générée depuis les annexes par le script existant (`scripts/woddavampire/`), comme les pouvoirs : une correction dans l'annexe se reporte en relançant le script. | Reco validée (MJ, 2026-11-03) |

### Coterie

| # | Question | Proposition (reco) | Réponse MJ |
|---|---|---|---|
| K-1 | Table ou app ? | L'app tient le **registre** (qui a versé quoi, totaux, plafond de l'ancre), pénible à suivre à la table et sur la durée ; l'usage des Historiques communs reste narratif. | Utile : rend la coterie visible, « une fiche de personnage pour le groupe », pas un registre qui traîne (MJ, 2026-11-03) |
| K-2 | Rattachement | **Une coterie par table** (optionnelle), créée par le Conteur depuis l'onglet Session : nom, Historique ancre, notes. | Reco validée (MJ, 2026-11-03) |
| K-3 | Verser et retirer | Action de jeu du joueur, hors édition, depuis sa fiche : **verser** déplace des points de son Historique vers la coterie (fiche −N, coterie +N) ; **retirer** rend un point de moins que versé. Le Conteur peut corriger. | Reco validée (MJ, 2026-11-03) |
| K-4 | Ancre et plafond | Verser au-delà de l'ancre (ou de 10) est **refusé** avec un message ; l'ancre ne change pas après création. | Reco validée (MJ, 2026-11-03) |
| K-5 | Affichage | Joueur : encart **Coterie** dans les Avantages, visible des seuls contributeurs (totaux par Historique, sa part). Conteur : bloc sous la table de l'onglet Session (totaux et parts de chacun). | Reco validée, à revoir en spécification : une vraie fiche de groupe (MJ, 2026-11-03) |
| K-6 | Données | Deux tables propres au slug : `coteries` (table de jeu, nom, ancre, notes) et `coterie_backgrounds` (coterie, personnage, Historique, points) ; schéma + migration ; une route `routes/coterie.js` ; le serveur diffuse la coterie mise à jour à la room de la table après chaque écriture HTTP. | Reco validée (MJ, 2026-11-03) |

### Mortels et Étreinte

| # | Question | Proposition (reco) | Réponse MJ |
|---|---|---|---|
| T-1 | Maintenant ou plus tard ? | §21 dit « en dernier ». **Reco : le faire seulement si un prélude mortel est prévu** dans une prochaine chronique ; sinon au backlog (la colonne `is_mortal` existe déjà). | **Backlog** (MJ, 2026-11-03) |
| T-2 | Création d'un mortel | Bascule **Mortel** dans l'assistant : pas de clan, de Génération, de sang ni de Disciplines ; Vertus Conscience et Maîtrise, Route de l'Humanité. Budget : celui des vampires sans les Disciplines ? (à confirmer) | Sans objet (backlog) |
| T-3 | Fiche d'un mortel | Les blocs vampiriques disparaissent (sang, Disciplines, Réveil, soif) ; santé de mortel (létal non absorbable sans armure). | Sans objet (backlog) |
| T-4 | Étreinte | Bouton **Étreinte** sur la fiche MJ : clan, Génération, sire ; la fiche bascule, les acquis restent. Les Disciplines (option du MJ) s'ajoutent ensuite en Édition ou par l'XP, sans écran dédié. | Sans objet (backlog) |

## II.16 Lot 5 : bonus (cadrage, questions au MJ)

| # | Question | Proposition (reco) | Réponse MJ |
|---|---|---|---|
| X-1 | Panneau d'historique côté joueur | `DiceHistoryPanel` monté à la racine de la fiche, bouton dans la zone d'actions (standard plateforme, déjà fait côté Conteur). | Reco validée (MJ, 2026-11-03) |
| X-2 | Onglet « Mon clan » | Lecture seule, depuis les catalogues : description du clan, faiblesse, Disciplines de clan avec **tous** leurs pouvoirs (pour préparer ses achats d'XP), Routes possibles. Alternative : ouvrir au joueur l'aide de jeu du lot 4 sans les sections du Conteur. | **Aide de jeu ouverte au joueur** plutôt qu'un onglet « Mon clan », plus simple (MJ, 2026-11-03) |
| X-3 | Combat générique | **Retiré** du lot 5 : hors périmètre tant que le combat de la plateforme n'est pas refondu (M-10). | Reco validée (MJ, 2026-11-03) |
| X-4 | Disciplines combinées (C-11) | Restent au backlog (« franchement pour plus tard ») ; à rouvrir seulement si une combinaison arrive en jeu. | Reco validée (MJ, 2026-11-03) |

## II.17 Lots 4 et 5 : spécification (proposée le 2026-11-03, à valider)

Décisions du cadrage (§II.15, §II.16) : aide de jeu en brique de la plateforme, ouverte au joueur ; coterie tenue par l'app comme une **fiche de groupe** ; mortels et Étreinte au backlog ; panneau d'historique côté joueur ; combat générique et Disciplines combinées hors lots.

### II.17.1 Onglets

| Interface | Onglets |
|---|---|
| Joueur | Fiche · **Coterie** (si la table en a une) · **Aide de jeu** · Journal · Historique |
| Conteur | Session · **Coterie** · **Aide de jeu** · Journal · Historique |

Plus le **panneau d'historique** côté joueur (`DiceHistoryPanel` à la racine de la fiche, bouton dans la zone d'actions), comme côté Conteur (X-1).

### II.17.2 Aide de jeu

- Brique de la plateforme `ReferenceGuide` (spec `spec_ui_reference.md`), onglet « Aide de jeu » côté joueur et côté Conteur. Contenu réservé au Conteur : en-tête `visibility: gm` (fichier) ou `<!-- gm -->` … `<!-- /gm -->` (passage), masqué côté joueur (décision du 2026-11-03 : Foi véritable, exorcisme, fantômes, démons côté Conteur seulement).
- Habillage du slug : sections en cartes de vélin, titres DeRoos, tableaux à filets (vocabulaire de la feuille, rien de nouveau à valider).
- **Contenu** (une section par thème, ordre d'usage en partie) :

| # | Section | Contenu | Source |
|---|---|---|---|
| 1 | Jets | Difficultés, succès, échec critique, options, Capacité à 0, actions prolongées, en équipe, multiples | partie I §3 |
| 2 | Combat | Déroulé du tour, initiative, attaque et défense, **manœuvres** (corps à corps, distance, générales), localisation et couvert, complications, dégâts et absorption, **armes, armures, boucliers** | partie I §10, annexe divers §4 et §5, **tables du livre** |
| 3 | Santé et dégâts | Piste de santé et malus, types de dégâts, guérison (vampires, mortels), torpeur, feu, soleil, chute | partie I §9, annexe divers §7.4 à §7.6, **tables du livre** |
| 4 | Sang et Volonté | Génération (table complète), dépenses, se nourrir, chasse, vaisseaux, Volonté | partie I §7, §8, annexe divers §7.1, §7.2 |
| 5 | La Bête | Frénésie et Rötschreck (difficultés), Routes et aura, Dérangements | partie I §11, §18, §19, **tables du livre** |
| 6 | Prouesses | Physiques (déplacement, soulever et briser…), mentales, sociales ; voyages, poisons et drogues | partie I §22, annexe divers §7.3, §7.7, §7.8 |
| 7 | Conteur *(MJ seulement)* | Diablerie, Golconde, goules, revenants, animaux, nuées, combat monté, démons et esprits | partie I §22, annexe divers §8 à §10 |
| 8 | Disciplines | Chaque Discipline : pouvoirs par niveau (nom, coût, jet, effet), branches comprises | `config/powers/disciplines.js` (déjà dans l'app) |
| 9 | Magie du sang | Voies, kraina et rituels | `config/powers/bloodMagic.js`, `config/bloodMagic.js` |
| 10 | Clans et lignées | Disciplines de clan, faiblesse, Routes possibles | `config/clans.js`, `config/descriptions.js` |
| 11 | Atouts et Handicaps | Coût, effet, restrictions | `config/meritsFlaws.js` |

- Les sections 1 à 7 sont des **fichiers Markdown** du slug, `config/reference/01-jets.md` à `07-conteur.md` (un fichier par section, ordre des préfixes), rédigés depuis la partie I, l'annexe divers et les tables du livre qui manquaient (inventaire du 2026-11-03) ; ils se corrigent directement, sans script (remplace E-6). Capacités modernes du livre remplacées par la plus proche (annexe B) : [Persuasion] → Commandement (exemple d'action prolongée), [Streetwise] → Survie (chasse), Sagesse populaire → Linguistique.
- Les sections 8 à 11 sont construites à l'exécution depuis les catalogues de l'app (`config/reference.js`, E-3), rien n'est recopié.
- **Implémenté le 2026-11-03** (contenu à relire par le MJ).

### II.17.3 Coterie : la fiche du groupe

**Règles appliquées** (partie I §20) : Historiques mis en commun parmi Alliés, Contacts, Domaine, Troupeau, Influence, Mentor, Ressources, Serviteurs ; un Historique **ancre**, qu'aucun autre ne dépasse ; plafond 10 ; verser prend des points de la fiche ; retirer rend un point de moins que versé ; les Historiques communs évoluent ensuite par l'histoire (le Conteur les ajuste), pas par l'XP.

**La fiche** (onglet Coterie, joueur et Conteur, même composant ; actions du Conteur en plus) :
- en-tête : emblème (image, outil d'avatar de la plateforme), nom, description courte ;
- **Historiques communs** : pour chacun, total en points (ancre marquée), détail libre (ex. « Domaine : le quartier des tanneurs »), et la part de chaque membre ; actions **Verser** et **Retirer** pour le joueur (sur ses propres points), **ajustement d'histoire** (+ / −) pour le Conteur ;
- **membres** (contributeurs) avec leur portrait ;
- notes du groupe.
- Les textes (nom, description, détails, notes) et l'emblème se modifient par tous les joueurs de la table et le Conteur (la coterie est celle de la table, L-1) ; textes en mode Édition (plume) ; verser, retirer, ajuster sont des actions de jeu, enregistrées tout de suite.
- Le Conteur crée la coterie (nom, ancre) depuis l'onglet Coterie. Pas de dissolution pour l'instant (L-2).

**Données** (schéma + migration, `-- systems: woddavampire`) :

| Table | Colonnes |
|---|---|
| `coteries` | `id`, `session_id` (unique : une coterie par table), `name`, `description`, `emblem`, `anchor_key`, `notes`, `created_at`, `updated_at` |
| `coterie_backgrounds` | `id`, `coterie_id`, `background_key` (unique par coterie), `story_points` (ajustement du Conteur), `details` |
| `coterie_contributions` | `id`, `coterie_id`, `character_id`, `background_key`, `points` (unique par coterie, personnage et Historique) |

Total d'un Historique commun = somme des contributions + `story_points`.

**Serveur** : `routes/coterie.js` (monté sur `/api/woddavampire/coterie`), règles dans `CoterieController.js` :

| Route | Droits | Effet |
|---|---|---|
| `GET /:sessionId` | authentifié | Coterie de la table (ou `null`), totaux calculés, table complète |
| `POST /:sessionId` | Conteur | Création `{ name, anchorKey }` (une par table) |
| `PATCH /:sessionId` | joueur de la table ou Conteur | Textes (`name`, `description`, `notes`, `details` par Historique), `emblem` |
| `PUT /:sessionId/story` | Conteur | `{ backgroundKey, storyPoints }` : ajustement d'histoire, ajoute l'Historique s'il manque ; total borné de 0 à 10 |
| `POST /:sessionId/contribute/:characterId` | propriétaire ou Conteur | `{ backgroundKey, points }` : vérifie la table, les points de la fiche, l'ancre et le plafond ; retire les points de la fiche ; en transaction |
| `POST /:sessionId/withdraw/:characterId` | propriétaire ou Conteur | `{ backgroundKey }` : retire toute la mise, rend points − 1 à la fiche |

Après chaque écriture, le serveur diffuse `vda-coterie-update { sessionId, coterie }` à la room de la table, et `character-full-update` pour la fiche dont les points ont bougé. Côté client : `hooks/useCoterie` (lecture, écoute, écritures), `config/rules/coterie.js` (plafonds et aperçus, testés), `components/layout/VdaCoterie.jsx` (fiche), `components/modals/VdaCoterieModals.jsx` (verser, retirer, ajouter un Historique, créer). Migration `03112026_woddavampire_coterie.sql`. Tests serveur : `tests/server/systems/woddavampire/coterie.test.js`.

**Implémenté le 2026-11-03** (planche `documentations/woddavampire/planche_coterie.html` validée). Écart à la planche : la plume d'édition des textes est dans l'en-tête de la fiche de coterie (le Conteur n'a pas de plume dans sa bande).

### II.17.4 Questions

| # | Question | Proposition (reco) | Réponse MJ |
|---|---|---|---|
| L-1 | Qui voit la fiche de coterie ? | Toute la table (même les non-membres, qui peuvent ainsi verser pour la rejoindre) ; les bénéfices restent aux membres, à la table. | Toute la table, évidemment : la coterie concerne l'ensemble des joueurs de la table (MJ, 2026-11-03) |
| L-2 | Dissolution | Chaque membre récupère ses parts moins un point par Historique, comme un retrait ; les ajustements d'histoire sont perdus. | **Pas de dissolution pour l'instant** : événement rare (MJ, 2026-11-03) |
| L-3 | Retrait partiel | Non : on retire toute sa part d'un Historique (un point perdu), comme le dit la règle. | Selon la règle (livre p. 181 : « pull his stake out of the pool ») : on retire toute sa mise d'un Historique, un point perdu ; pas de retrait partiel (2026-11-03) |
| L-4 | Planche avant le code | Oui, une planche HTML de la fiche de coterie (nouvel écran) ; l'aide de jeu reprend le vocabulaire existant, pas de planche. | Oui, planche puis contenu proposé (MJ, 2026-11-03) |
| L-5 | Ordre de réalisation | 1. brique d'aide de jeu et reprise de Fabula ; 2. contenu Vampire (après relecture de la nouvelle annexe) ; 3. planche puis coterie ; 4. panneau d'historique joueur. | Fait jusqu'au point 2 et le 4 ; reste la coterie (2026-11-03) |
