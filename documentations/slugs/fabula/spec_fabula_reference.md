# Fabula Ultima : onglet « Référence » (aide de jeu)

> Statut : **validée et implémentée** (2026-11-01). Questions du cadrage tranchées au §4, écarts relevés au §5.7.

## 1. Besoin

Un onglet de consultation des règles dans le slug `fabula`, côté joueur (`Sheet.jsx`) et côté MJ (`GMApp.jsx`), centré sur les règles qu'on va chercher en pleine partie, en priorité la **création d'objets du Bricoleur**.

## 2. État des lieux

### 2.1 Code

| Élément | Constat |
|---|---|
| Onglets joueur | `Sheet.jsx` : Fiche, Journal, Historique (onglet mémorisé dans le hash de l'URL) |
| Onglets MJ | `GMApp.jsx` : Session, Journal, Historique |
| Précédent | `cyberpunk/components/ReferenceTab.jsx` : contenu statique en dur, partagé joueur / MJ, filtré par playbook. Pas de brique plateforme réutilisable. |
| Données déjà en config | `config/classes.js` : compétences du Bricoleur (Gadgets, Visionnaire…) en **texte libre** dans `description`, pas en tables. `config/equipmentRare.js` : catalogue des objets rares. |
| Absent du code | Table des **qualités par défaut** (coûts), règles de **projets**. |

### 2.2 Règles disponibles

| Source | Contenu | Utilisable |
|---|---|---|
| `specifications_fonctionnelles_fabula_ultima.md` | Tests, ND, critiques, aubaines, états, Bricoleur complet (mélanges, cibles, effets, inoculations, magicanon, magisphère), conflits, points Fabula / Ultima, cadrans, équipement | Oui |
| `fabula_ultima_conception_des_objets_rare.md` | Qualités par défaut (type, coût, effet) et objets rares d'exemple | Oui |
| PDF `X:\jdr\fabula\Fabula Ultima - FR - Livre de Base-153-220_compressed.pdf` | Extrait p. 152-220 seulement (création de groupe, classes) | Partiel |
| **Livre de base complet** `X:\jdr\fabula\Fabula Ultima FR\Fabula Ultima - FR - Livre de Base.pdf` | Tout le livre (page imprimée = page PDF − 1) | Oui |
| **Errata 06/2024** (même dossier) | Corrige notamment le tableau « Dégâts et protection » des projets (p. 136) | Oui |

### 2.3 Règles retrouvées pour la création d'objets (à reporter dans la spec, R-7)

**Projets** (p. 134-139), ouverts au Bricoleur par son atout gratuit :

1. Décrire l'invention ; le MJ juge de sa faisabilité.
2. Le MJ peut diviser une invention complexe en plusieurs projets.
3. Coût total en matériaux = coût de puissance × multiplicateur de zone × multiplicateur d'utilisation, payé immédiatement. Puissance moyenne ou plus : le MJ impose un ingrédient spécial introuvable dans le commerce (une ou deux séances de recherche).
4. Défaut grave négocié avec le MJ : −25 % sur le coût total.
5. Points de Progression requis = 1 par tranche de 100 z du coût (minimum 1). Chaque jour : +1 par PJ qui a travaillé, +1 de plus s'il a au moins un niveau de Bricoleur.
6. Terminé quand le total est atteint (en quelques heures si la journée en génère plus que nécessaire).

| Puissance | Coût | L'invention peut… | Dégâts / soins | Protection (errata appliqué) |
|---|---|---|---|---|
| Mineure | 100 z | éclairer, transporter, protection limitée | non disponibles | une résistance (consommable) |
| Moyenne | 200 z | voyager sous l'eau, contenir un sort, transmettre le son, faire une opération, énergie courte | mineurs | une résistance |
| Majeure | 400 z | voler, altérer une zone brièvement, annuler un sort, intelligence élémentaire, combattre, énergie longue, immobiliser | lourds | une immunité ou deux résistances |
| Extrême | 800 z | altérer une zone longtemps, contenir un démon, empêcher une catastrophe, intelligence et personnalité normales | massifs | deux immunités ou trois résistances |

| Zone | × | Exemples | | Utilisation | × |
|---|---|---|---|---|---|
| Individuelle | 1 | une créature humaine, une porte, une arme | | Consommable | 1 |
| Petite | 2 | quelques créatures, une pièce, une cabane | | Permanente | 5 |
| Grande | 3 | une foule, un galion, une maison, une créature géante | | | |
| Immense | 4 | une forteresse, un lac, un village | | | |

Quantité de dégâts / soins selon le niveau de l'inventeur : niveau 5+ : 10 / 30 / 40 ; 20+ : 20 / 40 / 60 ; 40+ : 30 / 50 / 80 (colonnes « mineure / majeure / énorme », voir R-8). Pas d'immunité aux dégâts physiques ; un effet multiple = plusieurs projets.

Compléments : matériaux trouvés en aventure acceptés en paiement (sauf l'ingrédient imposé à l'étape 3) ; assistant = salaire de la moitié du coût total, +1 PP par jour ; chaque exemplaire est un projet distinct ; Visionnaire : NC × 100 z de matériaux payés et +NC PP par jour.

Les 9 exemples du livre recoupent la formule (ex. Golem Gatling : 400 × 1 × 5 × 0,75 = 1 500 z, 15 PP ; minitank : 1 000 + 750 = 1 750 z, **17** PP, donc arrondi à l'inférieur).

**Version améliorée** (compétence héroïque, Bricoleur maîtrisé, p. 241) : une fois par repos, ajouter ou remplacer la qualité d'une arme, armure ou bouclier par une qualité de la liste par défaut à +1 000 z au plus, pour le double de ce coût. Prêt à la fin du repos. Donne accès à l'option « Acheter des qualités » (p. 267 : même règle chez un artisan, un jour par objet).

**Concevoir des objets rares** (MJ, p. 266-284) : procédure par étapes pour les armes (arme de base, type de dégâts non physique +100 z, une main / deux mains ±4 dégâts, +1 précision +100 z, +4 dégâts +200 z, attributs identiques +50 z, une qualité, martiale d'office à +10 dégâts ou plus) ; armures et boucliers = objet de base + une qualité ; accessoires = prix de la qualité. Notre `fabula_ultima_conception_des_objets_rare.md` n'a que les qualités et les exemples, pas ces étapes.

## 3. Proposition (à valider)

- **Un composant** `systems/fabula/components/ReferenceTab.jsx`, monté dans les deux interfaces (onglet « 📖 Référence »), une prop `isGM` pour les éventuelles sections MJ.
- **Données dans** `systems/fabula/config/reference.js` (tables structurées), sans toucher à `classes.js`.
- **Navigation** : sommaire + sections repliables, recherche plein texte sans accents.
- **Sections pressenties** :
  1. Tests : ND, valeur haute, critiques, aubaines, états
  2. Conflits : actions du tour, fin de conflit
  3. **Bricoleur** : projets, gadgets (alchimie avec ses trois tables, inoculations, technomagie), compétences liées (Formule secrète, Pluie de potions, Visionnaire)
  4. **Objets rares** : règle de conception et table des qualités par défaut
  5. Points Fabula / Ultima, cadrans
- **Option** : calculateur de coût de projet (zénits, points de progression, déduction Visionnaire), en fonction pure testée, une fois les règles de projets récupérées.

Aucune base, aucune route, aucun événement socket : contenu statique côté client.

## 4. Questions

| # | Question | Proposition | Réponse MJ |
|---|---|---|---|
| R-1 | Peux-tu récupérer les pages des **projets** (p. 134 et la suite, chapitre « Jouer ») ? Un PDF ou des captures suffisent. | Indispensable pour la partie Bricoleur. En attendant, je peux faire tout le reste. | Fait : livre complet et errata dans `X:\jdr\fabula\Fabula Ultima FR` (voir §2.3). |
| R-2 | Les sections du §3 te conviennent ? À ajouter / retirer ? (ex. sorts, arcana, liste des classes, équipement de base, voyages, repos) | Rester sur les règles consultées en partie ; pas de recopie des sorts ni du catalogue, déjà sur la fiche. | Validé. |
| R-3 | Visibilité : des sections réservées au MJ ? (Points Ultima, conception des objets rares, PNJ) | Tout visible pour tous : le Bricoleur a besoin des qualités pour proposer ses projets. Filtrage client par `isGM` si tu veux en masquer. | Tout visible pour tous, sections MJ comprises. |
| R-4 | Côté joueur, mettre en avant les sections de ses classes (comme cyberpunk filtre par playbook) ? | Non : sommaire identique pour tous, plus simple ; la recherche suffit. | Selon la reco : pas de mise en avant, sommaire identique pour tous. |
| R-5 | Calculateur de coût de projet (§3, option) : utile, ou lecture seule uniquement ? | Oui, petit et testable ; c'est le calcul qu'on refait à chaque projet. | Oui. |
| R-6 | Aide aux mélanges d'alchimie : un bouton qui lance les d20 et affiche cible / effet possibles ? | Hors périmètre de ce ticket (jet de dés = autre chantier) ; les tables suffisent. | Non. |
| R-7 | Où ranger la spec finale ? | Ce fichier pour l'onglet, et les règles de projets ajoutées à `specifications_fonctionnelles_fabula_ultima.md` (section Bricoleur). | Selon la reco : onglet ici ; projets, Version améliorée et Acheter des qualités dans la spec fonctionnelle (Bricoleur) ; étapes de conception dans `fabula_ultima_conception_des_objets_rare.md`. |
| R-8 | Le livre nomme les dégâts « mineurs / lourds / massifs » puis les quantités « mineure / majeure / énorme » : je les apparie dans l'ordre (mineurs = 10, lourds = 30, massifs = 40 au niveau 5) ? | Oui, c'est la seule lecture cohérente (même ordre de colonnes). | Oui. |
| R-9 | L'onglet couvre aussi « Version améliorée », « Acheter des qualités » et les étapes de conception des objets rares (§2.3) ? | Oui : c'est la boîte à outils complète d'un Bricoleur qui veut un objet sur mesure. | Oui. |
| R-10 | Le calculateur (R-5) couvre les projets seulement, ou aussi le prix d'une arme rare conçue par étapes ? | Projets d'abord ; l'arme rare en second si tu en as l'usage (même principe, autre barème). | Projets seulement. |

## 5. Spécification

### 5.1 Emplacement

- Onglet **« 📖 Référence »**, ajouté en dernière position dans la fiche joueur (`Sheet.jsx`, après Historique, mémorisé dans le hash `#reference` comme les autres) et dans l'interface MJ (`GMApp.jsx`, après Historique).
- Même contenu des deux côtés, sections MJ comprises (R-3). Rien n'est écrit en base, aucun événement socket.

### 5.2 Mise en page

- **Barre du haut** : champ de recherche (casse et accents ignorés).
- **Sommaire** à gauche (en haut sur petit écran) : un lien par section, clic = défilement vers la section et ouverture.
- **Sections repliables**, fermées par défaut. Une recherche non vide n'affiche que les blocs qui contiennent le texte, sections concernées ouvertes ; effacer la recherche rétablit l'état précédent.
- **Même sommaire et même ordre pour tous** (R-4) : pas de mise en avant selon les classes du personnage.

### 5.3 Sections et contenu

| # | Section | Contenu | Source |
|---|---|---|---|
| 1 | Tests | Structure d'un test, ND (7 / 10 / 13 / 16, ±2), valeur haute, réussite et échec critiques, aubaines, états | spec fonctionnelle §1.1, §2.6 |
| 2 | Conflits | Déroulé d'un tour, actions disponibles, fin de conflit et zéro PV | §5 |
| 3 | Bricoleur | **Inventions** : étapes d'un projet, tables puissance / zone / utilisation, dégâts et protection (errata), quantités par niveau, matériaux, assistants, conseils, puis le **calculateur** (§5.4). **Gadgets** : alchimie (mélanges, cibles, effets), inoculations, technomagie (prise de contrôle, magicanon, magisphère). **Compétences liées** : Formule secrète, Pluie de potions, Visionnaire, Accessoire d'urgence. **Améliorer un objet** : Version améliorée, Acheter des qualités. | §2.3 ci-dessus, spec fonctionnelle Bricoleur, errata |
| 4 | Objets rares *(MJ)* | Conseils (bonus, pas de copie de sort), étapes de conception des armes, armures et boucliers, accessoires ; table des qualités par défaut (type, coût, effet) | livre p. 266-284, `fabula_ultima_conception_des_objets_rare.md` §1 |
| 5 | Points Fabula et Ultima | Gain et dépense des PF, réserve et usage des PU | §4 |
| 6 | Cadrans | Types, interactions, résolution | §7 |

Les textes sont repris des specs validées, pas réécrits ; aucune règle absente des sources.

### 5.4 Calculateur de projet

Saisies, toutes modifiables :

| Champ | Valeurs | Pré-rempli côté joueur |
|---|---|---|
| Puissance | Mineure / Moyenne / Majeure / Extrême | — |
| Zone | Individuelle / Petite / Grande / Immense | — |
| Utilisation | Consommable / Permanente | — |
| Défaut grave | oui / non | non |
| Travailleurs par jour | PJ sans Bricoleur, PJ Bricoleurs, assistants | 0 / 1 si le perso est Bricoleur / 0 |
| Rangs de Visionnaire cumulés | 0 à … | rang du personnage |
| Niveau de l'inventeur | nombre | niveau global du personnage |

Résultats :

- **Coût total** = puissance × zone × utilisation, × 0,75 si défaut.
- **Payé par Visionnaire** = min(coût, rangs × 100 z) ; **reste à payer** en matériaux.
- **Salaire des assistants** = nombre × coût total / 2.
- **Points de Progression requis** = max(1, arrondi inférieur de coût / 100).
- **PP par jour** = PJ + PJ Bricoleurs × 2 + assistants + rangs de Visionnaire ; **jours** = arrondi supérieur de requis / PP par jour (« — » si 0 PP par jour).
- **Rappels** affichés selon la puissance : ingrédient spécial exigé (moyenne et plus), dégâts / soins possibles et leur quantité au niveau saisi (R-8 : moyenne = mineure, majeure = majeure, extrême = énorme ; « non disponibles » en mineure), protection autorisée.

Le calcul n'est pas mémorisé : on suit un projet en cours ailleurs (journal, notes).

### 5.5 Technique

| Fichier | Rôle |
|---|---|
| `src/client/src/systems/fabula/config/projects.js` *(nouveau)* | Tables puissance / zone / utilisation / quantités et fonction pure `computeProject(saisies)` ; lues aussi par la section Bricoleur pour afficher les tables (une seule source) |
| `src/client/src/systems/fabula/config/reference.js` *(nouveau)* | Contenu des sections : `{ id, title, gmLabel?, blocks: [{ type: 'text' \| 'list' \| 'table', … }] }` |
| `src/client/src/systems/fabula/components/ReferenceTab.jsx` *(nouveau)* | Recherche, sommaire, sections, rendu des blocs ; prop `character` (absente côté MJ), transmise au calculateur pour le pré-remplissage |
| `src/client/src/systems/fabula/components/layout/ProjectCalculator.jsx` *(nouveau)* | Formulaire du calculateur, appelle `computeProject` |
| `Sheet.jsx`, `GMApp.jsx` | Une entrée dans `TABS` et le rendu de l'onglet |
| `src/client/tests/systems/fabula/config/projects.test.js` *(nouveau)* | Les 9 exemples du livre (coût et PP), Visionnaire plafonné au coût, minimum 1 PP, jours avec 0 PP |
| Docs | Spec fonctionnelle (Bricoleur : projets, Version améliorée, Acheter des qualités) ; `fabula_ultima_conception_des_objets_rare.md` (étapes de conception) |

Réutilisé : `normalizeText` (`ui/tools/catalog.js`) pour la recherche ; `character.classes` (`classKey`, `niveau`) et `character.skills` (`classKey: 'bricoleur'`, `skillKey: 'visionnaire'`, `rang`) pour le pré-remplissage. Classes de couleurs existantes du thème Fabula, pas de nouvelle identité graphique.

### 5.6 Hors périmètre

Lanceur de mélanges d'alchimie (R-6), prix d'une arme rare conçue par étapes (R-10), suivi des projets en cours sur la fiche (idée possible pour le backlog).

### 5.7 Écarts entre la spec fonctionnelle et le livre

La spec fonctionnelle a été écrite par le MJ de Fabula : ses écarts avec le livre (0 PV en « Sacrifice / Défaite », cadrans par opportunités, Méchant sans Point Ultima qui meurt ou est capturé…) sont des règles de la table. **L'onglet suit la spec du MJ** ; le livre ne complète que ce qu'elle ne couvre pas (projets, Version améliorée, Acheter des qualités, conception des objets rares, conseils sur les cadrans). La spec n'est pas modifiée.
