# Spec — Refonte du slug `dune` (Dune: Adventures in the Imperium)

> Statut : **phase 2 répondue, planche validée le 2026-11-04** (`documentations/dune/planche_dune.html`, référence du thème) ; prochaine étape : lot 2
> Lancée le 2026-11-04, sur le modèle de la refonte Vikings.
> Cette spec rétro décrit le slug **tel que le code l'applique** et fixe la cible de la refonte. Elle remplace `spec_slug_dune.md` et `spec_slug_dune_metier.md` (specs d'origine, supprimées le 2026-11-04 après validation).

---

## 1. Cadrage validé (MJ, 2026-11-04)

| Sujet | Décision |
|---|---|
| Périmètre | L'aspect, l'UX, la manière de montrer les choses et de s'en servir. **Aucune règle du jeu n'est modifiée**, mais tout ce qui est cassé (code et interface) est corrigé. |
| Règles (2026-11-04) | **Le fonctionnement actuel de l'app prime**, y compris là où il s'écarte du livre ou de la spec d'origine. On ne touche pas à la résolution des jets. Sont permis : catalogues tirés du livre (atouts, talents), noms officiels, présentation. |
| Graphisme | Entièrement refait, **modales comprises** : l'habillage « Arrakis angulaire » de 2026-10-18 fait vieillot face aux slugs récents. Il faut sentir le désert, l'épice, le ver et le voyage interstellaire, **en puisant pleinement dans l'imagerie de l'univers**, sans se restreindre. |
| Sources | PDF français dans `X:\jdr\Dune\Dune - Adenture in the Imperium\FR\` (livre de base, kit « Le signe du ver », feuilles de personnage et de Maison, errata), lecture seule. Transcription : `documentations/dune/transcription_talents_atouts.md`. |
| Emojis | **Aucun.** Ils sont mignons et hors ton : remplacés par des icônes dessinées pour le slug. |
| Atouts | C'est l'inventaire : ils reviennent **en section de la fiche**, qui n'a plus qu'un seul onglet de jeu. |
| Identité | Tous les champs restent : prénom, nom, joueur, statut social, âge, taille, poids, sexe, devise, description, portrait. |
| Talents et atouts | Saisie libre conservée ; **catalogue tiré du livre** ajouté (atouts confirmés par le MJ, talents proposés : Q-11). |
| Serveur | Routes inchangées, sauf correctif. Schéma : seulement les champs facultatifs de Q-13 et Q-14 (§3.2). La dette socket des ressources de session (`dune:update-session-resources`, préfixé par le slug depuis le 2026-11-04, voir `src/client/CLAUDE.md`) reste telle quelle. |

---

## 2. Règles appliquées (rétro, inchangées)

### 2.1 Personnage
- **5 compétences** fixes : Analyse, Combat, Discipline, Mobilité, Rhétorique. Rang sans maximum, **spécialisation** en texte libre facultative.
- **5 principes** fixes : Devoir, Domination, Foi, Justice, Vérité. Rang de 1 à 8, **maxime** en texte libre facultative.
- **Détermination** : ressource personnelle, 1 au départ, modifiable par le joueur et par le MJ (`determination`, `determination_max`).
- **Talents** (nom, description) et **atouts** (nom, description, quantité).

### 2.2 Ressources de table (par session)
| Ressource | Vue par | Plafond | Modifiée par |
|---|---|---|---|
| Impulsions | tous | 6 (serveur) | joueurs et MJ |
| Menace | tous | aucun | MJ ; les joueurs seulement par un jet |
| Complications | MJ seul | aucun | MJ ; un 20 obtenu en jet l'augmente automatiquement |
| Maison (nom, description) | tous | — | MJ et joueurs (règle d'origine, **non appliquée côté joueur** : voir C-5). Deviendra une fiche de groupe (§6.6). |

### 2.3 Jet 2D20 du joueur (code actuel)
- **Rang** = rang de la compétence + rang du principe. **Un principe peut être lancé seul** (MJ, 2026-11-04) : la compétence est facultative, son rang compte alors pour 0 et la spécialisation ne s'applique pas.
- **2d20 de base**, 5 au plus. Dés en plus achetés en Impulsions selon un barème dégressif (+1 dé = 1, +2 dés = 3, +3 dés = 6), ou en générant de la Menace (1 Menace = +1 dé).
- Par dé : **20** = complication ; **≤ rang** = 1 succès ; **2 succès** si le dé vaut 1, ou si la spécialisation est activée pour ce jet et que le dé est ≤ au rang de la compétence.
- La **spécialisation** s'active jet par jet (le joueur juge si elle s'applique à l'action).
- **Difficulté** de 0 à 5, saisie par le joueur.
- **Détermination** : aujourd'hui, choix « Relancer » ou « Critique » dans la fenêtre, 1 point consommé, et dans les deux cas +1 succès. **Corrigé (MJ, Q-1)** : règle 2D20 de base, comme la Fortune d'Achtung : avant le jet, **un dé de la réserve est posé sur 1** (il n'est pas lancé), donc 2 succès ; il apparaît comme « dé forcé » dans le résultat et l'historique. La « Relance » du livre n'est pas reprise.
- Après le jet, l'**excédent** (succès au-delà de la difficulté) peut être versé dans les Impulsions.
- Les jets sont publics : notification et historique.

### 2.4 Jet du MJ
Rang libre, difficulté, 2 à 5 dés. Même résolution que le joueur, un 1 compris (2 succès ; MJ, 2026-11-04), sans spécialisation ni Détermination. Visible par la table ou secret, au choix.

---

## 3. Données (réelles, inchangées)

- `characters` : colonnes génériques, identité (`avatar`, `prenom`, `nom`, `sexe`, `age`, `taille`, `poids`, `motto`, `statut_social`, `description`), `determination`, `determination_max`, et pour chaque compétence ou principe `<clé>_rang` avec `<clé>_specialisation` ou `<clé>_maxime`.
- `character_talents` (`talent_name`, `description`), `character_items` (`nom`, `description`, `quantite`).
- `session_resources` (impulsions, menace, complications), `session_maison` (nom, description).
- Sous forme envoyée au client : `competences[]` et `principes[]` avec `key`, `rang`, `specialisation` / `maxime` ; `talents[]` ; `items[]`.

Écarts avec l'ancienne spec : elle ne connaissait que `statut_social` (pas les champs d'identité ajoutés), parlait de `skills` / `principles` au lieu de `competences` / `principes`, et utilisait la classe `.dark`.

### 3.1 Vocabulaire et catalogues (transcription du livre FR)
Source : `documentations/dune/transcription_talents_atouts.md` (55 talents, 95 atouts, vocabulaire, champs des feuilles officielles, errata appliqués).

**Vocabulaire** : l'app est déjà alignée sur le livre pour Menace, Complications, Détermination, les cinq compétences, les cinq principes, Maxime, Spécialisation, Talents, Atouts et Maison. Seuls écarts :
- « Impulsions » : le livre écrit **Impulsion** au singulier (« la réserve d'Impulsion », « 2 points d'Impulsion ») ; Q-12.
- « Statut social » n'existe pas dans le livre : la feuille officielle porte **Rôle**, **Faction**, **Traits de personnalité** et **Ambition**, que l'app n'a pas ; Q-13.

**Talents** : une seule liste alphabétique dans le livre, avec la restriction entre parenthèses (Compétence, Principe, Mentat, Bene Gesserit, Docteur Suk, Guilde Spatiale, Fremen). Catalogue en filtres par restriction, saisie libre conservée (Q-11).

**Atouts** : le livre les présente comme des **exemples**, pas comme une liste fermée. Il y en a quatre familles : personnels (33), de guerre (19), d'espionnage (24) et d'intrigue (19). Chaque atout porte une **qualité** (0 à 4) et des **mots-clefs** sans effet de règle ; l'app n'a qu'un nom, une description et une quantité. Catalogue en filtres par famille, ajout immédiat, saisie libre conservée ; Q-14 pour la qualité et les mots-clefs.

### 3.2 Champs ajoutés (Q-13, Q-14)
Tous facultatifs : les personnages et atouts existants restent valides sans reprise de données.

| Table | Colonnes | Usage |
|---|---|---|
| `characters` | `role`, `faction`, `traits_personnalite`, `ambition` (TEXT, défaut `''`) | Identité, texte libre ; « Statut social » conservé. |
| `character_items` | `qualite` (INTEGER, NULL = non renseignée, 0 à 4), `mots_cles` (TEXT, défaut `''`, liste séparée par des virgules) | Pastilles sur l'atout ; remplis par le catalogue, modifiables. |

Schéma `dune-schema.sql` + migration `DDMMYYYY_dune_identite_atouts.sql` (`-- systems: dune`) ; `CharacterController` (lecture, COALESCE, `_syncSubTable` des atouts) ; fixture du contrat serveur complétée. Côté client : `role`, `faction`, `traitsPersonnalite`, `ambition` ; atout `{ id, nom, description, quantite, qualite, motsCles }`.

**Règles du livre non appliquées par l'app, laissées telles quelles** (l'app prime) : une seule spécialisation par compétence, débloquée à un seuil de rang à la création (le livre en donne 4, sans seuil depuis l'errata) ; pas de points de progression ; Détermination sans plafond de 3.

---

## 4. Correctifs à faire

Ils sont appliqués pendant la refonte, sans changer de règle.

| # | Constat | Correctif |
|---|---|---|
| C-1 | Détermination : la fenêtre propose « Relancer » et « Critique », mais les deux donnent +1 succès ; les boutons n'ont jamais été branchés (code d'origine, 2026-03-07). | Un seul usage : dé forcé sur 1 avant le jet (§2.3), affiché dans le résultat et l'historique, testé. |
| C-2 | La case de spécialisation peut être ignorée : la fonction de lancement ne se recalcule pas quand on l'active (dépendance manquante). C'est un défaut de code, pas une règle : le calcul voulu par l'app (dés ≤ rang de la compétence comptés double) est rétabli à l'identique. | Calcul du jet sorti dans une fonction pure (`config/rules/`), à résultat identique, testée. |
| C-3 | L'excédent versé aux Impulsions dépasse silencieusement le plafond de 6. | Indiquer dans la fenêtre combien d'Impulsions entrent réellement. |
| C-4 | Le lanceur apparaît sous son seul nom de famille dans l'historique (`characterName = nom`). | Prénom et nom. |
| C-5 | La Maison de la session est invisible côté joueur (spec d'origine : visible et modifiable par tous). | Réglé par la fiche de Maison (§6.6). |
| C-6 | MJ : l'onglet gardé dans l'URL est mal lu ; sans tiret dans l'adresse, on revient toujours sur « Session ». | `useHashTab`. |
| C-7 | `TabSession` du MJ écoute `character-full-update`, qui appartient au générique. | Retiré. |
| C-8 | Code mort : `SessionResourcesBar`, `SendNoteModal`, import de `AchtungHistoryEntry` (composant d'un autre slug), `countSuccesses` inutilisé, `import './theme.css'`. | Supprimé. |
| C-9 | Code d'accès modifiable à la fois en mode Édition et par le menu. | Par le menu seulement. |
| C-10 | Thème : chaque couleur est en double (`--dune-*` et `--color-*`), la nuit passe par `.dark`, les couleurs secondaires de nuit sont incohérentes. | Thème réécrit (`data-theme`, une seule source par couleur). |
| C-11 | Composants en `style={{ var(--dune-…) }}` presque partout. | Classes générées et classes du slug. |
| C-12 | Header : nom du personnage et code d'accès affichés ; hauteur en dur (75 px) passée à la barre de session. | Bande fixe standard (titre du jeu seul), hauteur mesurée. |
| C-13 | Fiche dans un conteneur centré de 1200 / 1400 px. | Pleine largeur. |
| C-14 | Jauge de Menace plafonnée visuellement à 12 alors que la Menace n'a pas de maximum. | Colonne qui affiche aussi la valeur au-delà de la hauteur visible (§6.3). |
| C-15 | `GMApp.jsx` passe par `gm/GMView.jsx`. | Contenu MJ dans `GMApp.jsx`. |
| C-16 | La Détermination est consommée avant le jet, même si le lancement échoue. | Consommée une fois le jet obtenu. |

---

## 5. Direction graphique (proposition, à concrétiser sur planche)

Planche : `documentations/dune/planche_dune.html`, qui charge le vrai thème, en jour et en nuit, à valider avant tout code. Ce qui va au-delà de l'existant y sera marqué ✦.

### 5.1 Intention
Puiser pleinement dans l'imagerie du jeu, sans timidité. Le livre français fixe le langage :
- **Feuille de personnage officielle** : sable parcheminé, cadres ornés géométriques (entre l'art déco et l'entrelacs oriental), **médaillons hexagonaux** pour les rangs de principes et de compétences, capitales à empattements très espacées, logo DUNE en lettres fines et larges.
- **Couverture et illustrations** : fonds sombres, **halo de vitrail orange** derrière les figures de l'Imperium, peintures crépusculaires, ornithoptères, vaisseaux de la Guilde.

D'où deux registres :
- **Jour = la feuille impériale** : parchemin sable, cadres ornés, médaillons hexagonaux, encre brune.
- **Nuit = le vitrail et l'espace** : noir profond, rosace de vitrail orange en halo, or et épice lumineux.

Les quatre motifs de l'univers s'y greffent :

| Motif | Usage proposé |
|---|---|
| **Désert** | Lignes de crête de dunes en SVG (fines ondulations) en bas de la bande fixe et des fenêtres ; aplats de sable. |
| **Épice** | Orange cannelle comme couleur d'action (boutons, survol, sélection) ; poussière d'épice très discrète en dérive dans le fond de la bande fixe ✦ (coupée si l'utilisateur réduit les animations). Bleu Ibad (« les yeux bleus dans le bleu ») réservé à la **Détermination** ✦. |
| **Ver** | Anneaux concentriques et bouche en rosace dentée : emblème des fenêtres, du chargement et du jet en cours ✦ ; rides de sable « qui montent » quand la Menace augmente ✦. |
| **Voyage interstellaire** | Crochets d'angle fins (au lieu de cadres complets), arcs de trajectoire et repères de coordonnées façon affichage de la Guilde dans les en-têtes, références de rang en chiffres tabulaires. |

**Plus d'arrondis**, plus d'emojis, plus d'ombres molles.

**Visuels propres** (MJ, Q-10) : on **s'inspire** du livre, on ne le reprend pas. Ornements, cadres, médaillons, rosace et icônes sont dessinés en SVG pour le slug. Les images peintes (en-tête, fond de la création, écrans vides comme « aucune session », vitrail de nuit) sont générées avec GPT par le MJ, à partir de prompts fournis avec la planche ; la planche les montre d'abord en esquisses SVG.

### 5.2 Palette (à affiner sur planche)
- **Jour, le désert à midi** : fond sable pâle, surfaces sable plus soutenues, encre brun-noir, or terne pour les filets, orange épice pour l'action, rouge sombre pour la Menace et les complications, bleu Ibad pour la Détermination.
- **Nuit, le désert sous deux lunes et l'espace** : fond bleu-noir profond, surfaces ardoise, texte sable lunaire, épice lumineuse, bleu Ibad plus vif, filets or atténués.
- Contraste vérifié pour les deux thèmes ; l'onglet actif reste lisible de jour comme de nuit.

### 5.3 Typographie (voir Q-6)
- **DuneRise** (déjà en place) : marque et intitulés très courts seulement (DUNE, titres de section).
- **Capitales espacées à empattements** pour les intitulés de section, comme la feuille officielle (« PRINCIPE », « COMPÉTENCE ») : une capitale romaine libre (Cinzel ou Marcellus SC, déjà chez Vileborn) ✦.
- **Chiffres et libellés techniques** (rangs, compteurs, dés) : une linéale large façon affichage de la Guilde (*Rajdhani*, déjà dans `public/fonts`, ou Michroma) ✦.
- **Texte et saisies** : **Spectral** (empattements fins, ton de chronique impériale), retenue par le MJ (Q-6).

### 5.4 Icônes
Un composant `DuneIcon` (SVG maison, une famille cohérente, trait fin) remplace tous les emojis : jet (d20 stylisé), édition, ver, goutte d'épice (Impulsions), œil Ibad (Détermination), rides (Menace), éclair de complication, sceau de Maison, journal, historique, envoyer, PNJ, carte, horloge.

### 5.5 Éléments habillés
Bande fixe, onglets, sections de fiche, lignes lançables, jauges, boutons (plein, contour, danger), champs, pills, **toutes les modales génériques** (`vtt-modal-*`, contrôles, journal, catalogue), menu, zone d'actions, barre et carte de session, panneau flottant, notifications et historique (`DuneHistoryEntry`), marque (`Brand.css`, si elle doit suivre : Q-7).

---

## 6. Cible UX

### 6.1 Fiche joueur (un seul onglet de jeu)
**Bande fixe**
- Header : marque DUNE seule.
- Sous-header : onglets **Fiche · Journal · Historique** (onglets conservés, MJ Q-3), puis actions en icônes (jet, Édition). Le **panneau d'historique** flottant est ajouté en plus de l'onglet.

**Jauges en colonnes** (MJ, Q-5) : l'esprit actuel est gardé. Impulsions à gauche et Menace à droite, en colonnes sur toute la hauteur, qui **encadrent la fiche** ; redessinées dans la nouvelle direction (§6.3), collées sous la bande fixe.

**Corps entre les deux colonnes, pleine largeur, 3 colonnes sur grand écran** (2 sur écran moyen, 1 sur mobile ; sur mobile, les jauges passent en bandeau)
1. **Identité** : portrait rectangulaire à crochets d'angle, prénom et nom, joueur, statut social, devise, physique en ligne discrète, description repliable ; **Détermination** (cases cliquables hors édition) ; nom et blason de la **Maison** de la table, qui ouvre sa fiche (§6.6).
2. **Compétences et principes** : deux listes face à face. Chaque ligne entière est lançable (même survol partout). Sous la ligne : spécialisation ou maxime en petit. Un clic ouvre la fenêtre de jet avec cette ligne déjà choisie.
3. **Atouts** (inventaire, une liste, ajout par la modale d'ajout libre hors édition, quantité réglable hors édition) puis **Talents**.

**Mode Édition** : corrections hors règles (identité, rangs, spécialisations, maximes, textes des talents et atouts). Les jauges, la Détermination et les quantités restent cliquables hors édition.

### 6.2 Fenêtre de jet (un seul écran, plus d'étapes)
- **En tête** : la réserve en grand, « Analyse 5 + Devoir 7 = **12** · **3d20** · difficulté **2** », avec la difficulté réglable sur place.
- **Choix** : deux rangées de pills (principe, compétence) ; la spécialisation en interrupteur avec son nom et une vraie phrase d'effet (« Spécialisation *Couteau* : les dés ≤ 5 comptent double »).
- **Dépenses** groupées sur une ligne : Impulsions (0, +1, +2, +3 avec leur coût), Menace (− / +), Détermination (un dé posé sur 1, montré parmi les dés de la réserve). Compteur de dés « 3 / 5 » sous la réserve.
- **Lancer**, puis le résultat **dans la même fenêtre** : dés colorés (2 succès, 1 succès, échec, complication), bilan réussite / échec, complications annoncées, bouton « Verser N Impulsions » en un clic (C-3). Bouton « Relancer un jet » pour recommencer sans fermer ✦.

### 6.3 Ressources et Menace
- Impulsions (colonne de gauche) : 6 cases empilées en forme de goutte d'épice, + / − pour tous.
- Menace (colonne de droite) : rides de sable qui montent, nombre en grand en tête de colonne, sans plafond (C-14), en lecture pour les joueurs.
- Complications (MJ seul) : compteur à éclairs.

### 6.4 Interface MJ
- Même bande fixe ; sous-header avec les ressources (Impulsions, Menace, Complications) toujours visibles et réglables.
- Onglets : **Table** (personnages, musique), **Maison** (§6.6), **PNJ**, **Journal**, **Historique**, plus le panneau d'historique déjà en place. L'onglet « Ressources » disparaît : ses jauges vont dans la bande.
- Onglet Table : bandeau des personnages (en ligne / hors ligne), puis **la même fiche que le joueur** (sections partagées, jouable, mode Édition), sans la bande du joueur (Q-2). Envoyer un atout ou une note reste en actions du MJ au-dessus de la fiche.
- Fenêtre de jet MJ au même format que celle du joueur (réserve en tête, Menace dépensée, résultat sur place).

### 6.5 Assistant de création
Mise aux standards de l'assistant (`/new-slug`) sans toucher aux règles de création (freebies, plafonds, seuil de spécialisation) :
- onglet **Guide** d'abord ;
- colonne d'aide contextuelle (description de chaque compétence et principe, textes dans un seul fichier) ;
- compteurs à côté de ce qu'ils comptent, Précédent / Suivant, ligne « À faire » ;
- pleine largeur.

### 6.6 Fiche de Maison (fiche de groupe)
Demande du MJ (Q-4) : la Maison est une **fiche de groupe**, comme la coterie de Vampire, avec ses propres règles. Le livre (chap. 3, et la « Feuille de Maison » officielle) lui donne : nom, armoiries, devise, historique, monde d'origine, **type** (naissante, mineure, majeure, Grande Maison), traits, **domaines**, **rôles** tenus par les personnages (Seigneur, Consort, Héritier, Argentier, Chambellan, Connétable, Conseiller, Émissaire, Érudit, Maître-espion, Maître d'armes, Maître de guerre, Premier médecin) et **ennemis** (nom, type, haine, raison, notes). Le type fixe notamment la Menace de départ du MJ (0 à 3 par joueur).

C'est une fonction nouvelle, qui touche au schéma (la table `session_maison` actuelle ne tient que le nom et la description). Cadrage ci-dessous (lot 6).

> **Décision du MJ (2026-11-04) : lot 6 abandonné.** Le livre de base ne donne presque pas de règles de Maison (il les renvoie à de futurs suppléments) : on ne s'y aventure pas. La Maison reste ce qu'elle est (nom et description, visibles sur la fiche joueur, modifiables par le MJ dans son onglet Maison). Le cadrage ci-dessous est gardé pour mémoire, si un supplément apporte un jour ces règles.

#### 6.6.1 Ce que dit le livre (chap. 3, p. 85-97)
Le livre annonce lui-même des règles de Maison plus complètes « dans les prochains suppléments » : le livre de base n'en donne que des **outils narratifs** et quelques effets.

| Élément | Contenu | Effet de jeu |
|---|---|---|
| **Type** | Naissante, mineure, majeure, Grande Maison. | **Menace de départ du MJ à chaque session** : 0, 1, 2 ou 3 points **par joueur**. |
| **Domaines** | Primaires (ce qui fait la renommée) et secondaires. Choisis dans 9 **secteurs de pointe** : Agriculture, Armée, Arts, Espionnage, Industrie, Kanly, Politique, Religion, Science ; chacun en 5 sections : Conception, Experts, Machines, Main-d'œuvre, Production (ex. « Arts : poésie (Production) »). | Nombre selon le type : naissante 0 + 1 secondaire ; mineure 1 + 1 ; majeure 1 + 2 ; Grande 2 + 3. |
| **Monde d'origine** | Texte, avec des questions guides (climat, habitat, criminalité, satisfaction, redistribution). | Aucun. |
| **Armoiries** | Une figure (animal, objet…) sur une ou deux couleurs, et une devise. | Aucun. |
| **Traits** | Un trait par domaine primaire (son secteur, ex. « Artistique ») et un trait de réputation (« Honorable », « Brutale »). Ils évoluent en jeu. | Un PJ peut **emprunter un trait de la Maison pour la scène en dépensant 1 Impulsion**. |
| **Rôles** | 13 postes : Seigneur, Consort, Héritier, Argentier, Chambellan, Connétable, Conseiller, Émissaire, Érudit, Maître-espion, Maître d'armes, Maître de guerre, Premier médecin. Chacun avec un titulaire (nom et un ou deux traits). | Aucun. |
| **Ennemis** | Nombre selon le type (naissante : aucun ; mineure : une Maison mineure ; majeure : une majeure et une mineure ; Grande : une Grande ou deux majeures ou une faction, et des mineures). Chacun avec un type, une **haine** et une **raison**. | **Haine (1d20)** : 1-5 Aversion (+1 à la Difficulté des interactions avec elle) ; 6-10 Rivalité ; 11-15 Haine ; 16-20 Kanly. **Raison (1d20)** : Concurrence, Affront, Dette, Ancienne querelle, Moralité, Servitude, Liens familiaux, Vol, Jalousie, Aucune raison (par tranche de 2). **Menace de Maison** : le MJ dépense 1 Menace pour faire surgir un ennemi. |

#### 6.6.2 Proposition
Une **fiche de Maison** par table, comme la coterie de Vampire. Les joueurs y accèdent par un onglet **Maison** dans leur bande, et le MJ par son onglet Maison. Le même composant sert des deux côtés.

**Rendu proposé** : une feuille de Maison dans l'esprit de la feuille officielle. En tête, les armoiries (image et couleurs), le nom, la devise, le type et le monde d'origine. Au centre, les domaines et les traits. Puis les rôles, en liste des 13 postes, et les ennemis en cartes, avec haine et raison.

#### 6.6.3 Questions

| # | Question | Proposition | Réponse MJ |
|---|---|---|---|
| H-1 | **Qui modifie quoi ?** La coterie de Vampire est modifiable par tous les joueurs et le MJ. | Tout visible par tous. Textes, domaines, traits, rôles et ennemis modifiables par tous (le livre fait de la Maison une décision collégiale), en mode Édition. Le **type** de Maison réservé au MJ, puisqu'il règle la Menace. | |
| H-2 | **Menace de départ** (type × joueurs) : table ou app ? | App, légèrement : la Maison affiche « Menace de départ : N par joueur, soit X à cette table ». Côté MJ, un bouton dans la bande pose cette valeur en début de session (il remplace la Menace courante, avec confirmation). | |
| H-3 | **Domaines** : saisie | Secteur de pointe en pills (les 9 du livre et « Autre »), section en pills (les 5), libellé libre (« poésie »), primaire ou secondaire. Le nombre attendu selon le type est affiché comme repère (« 1 / 1 primaire »), sans blocage. | |
| H-4 | **Traits** : le trait de domaine se propose tout seul ? | Oui : ajouter un domaine primaire propose son trait de secteur (« Artistique »…), modifiable. Le trait de réputation reste libre. | |
| H-5 | **Emprunt d'un trait de Maison** (1 Impulsion, pour la scène) : bouton ou à la table ? | À la table. Le joueur clique sur le −1 de la jauge d'Impulsion, la fiche n'a rien à suivre. | |
| H-6 | **Rôles** : titulaire | Liste fixe des 13 postes, plus des postes libres (« Maître des assassins »…). Le titulaire est un PJ de la table (choisi en pill) ou un PNJ (nom et traits en texte libre). Un poste peut rester vacant. | |
| H-7 | **Lien avec le champ Rôle de la fiche** (Q-13) | Un PJ titulaire d'un poste le voit sur sa fiche, à côté de son Rôle libre (« Maître d'armes de la Maison Molay »). Les deux champs restent distincts : le Rôle de la fiche est le trait de rôle du livre, le poste est la charge dans la Maison. | |
| H-8 | **Ennemis : haine et raison** | Choisies en pills (niveaux et raisons du livre), avec un bouton « Tirer » (1d20) pour chacune, qui ne sert qu'à choisir et ne part pas dans l'historique. L'effet de l'Aversion (+1 Difficulté) est rappelé en une ligne. | |
| H-9 | **Menace de Maison** (1 Menace pour faire surgir un ennemi) | À la table. | |
| H-10 | **Armoiries** | Une image (outil de portrait de la plateforme, comme l'emblème de la coterie), deux couleurs et une figure en texte. Tu pourras générer l'image avec GPT ; je fournirai un prompt type. | |
| H-11 | **Données existantes** | La Maison actuelle (nom, description) est conservée : la description devient l'« Historique » de la feuille officielle. Les nouvelles colonnes et sous-tables se créent par migration, toutes vides au départ. | |
| H-12 | **Planche** | Une planche dédiée (`documentations/dune/planche_maison.html`) avant le code, jour et nuit, à partir de la planche validée. | |

#### 6.6.4 Données (selon les réponses)
- `session_maison` reçoit de nouvelles colonnes : `type`, `devise`, `monde_origine`, `armoiries` (image), `couleurs`, `figure`. La `description` existante sert d'historique.
- Sous-tables par table de jeu :
  - `maison_domaines` (`kind` primaire / secondaire, `secteur`, `section`, `libelle`) ;
  - `maison_traits` (`libelle`, `origine` domaine / réputation / libre) ;
  - `maison_roles` (`poste`, `character_id` ou `titulaire`, `traits`) ;
  - `maison_ennemis` (`nom`, `type`, `haine`, `raison`, `notes`).
- Routes `session-maison` étendues (lecture complète, écritures, droits selon H-1), diffusion `session-maison-update` à la room après chaque écriture. Règles pures (attendus par type, niveaux de haine, raisons, Menace de départ) dans `config/rules/house.js`, testées ; catalogues (secteurs, sections, postes, raisons) dans `config/house.js`.

---

## 7. Organisation du code cible

Reprise de `/new-slug` (« Organisation du code ») :

```
systems/dune/
  config.jsx · Sheet.jsx · GMApp.jsx · Creation.jsx · Brand.jsx · Brand.css · theme.css
  config/            libellés et textes (compétences, principes, aide de la création)
  config/rules/      résolution du jet, barème des Impulsions, versement de l'excédent : testés
  hooks/             useDuneRoll (un seul hook de lancement : fiche, MJ, PNJ), useSessionResources
  components/ui/     DuneIcon, bande fixe, jauges, crochets, filets de dunes
  components/layout/ sections partagées joueur / MJ (identité, compétences et principes, atouts, talents), DuneHistoryEntry
  components/modals/ fenêtre de jet (joueur et MJ), envoi d'atout, modales du slug
  components/creation/ onglets de l'assistant
  gm/tabs/           TabSession (Table), et ce qui reste propre au MJ
```

Tests (`src/client/tests/systems/dune/`) : résolution du jet (spécialisation, 1 et 20, dé forcé de la Détermination), barème des Impulsions, excédent plafonné. Aucun test de données ni de composant. Contrat serveur : la fixture existante doit continuer de passer.

---

## 8. Lots proposés

| Lot | Contenu |
|---|---|
| 1 | Planche (§5) : bande fixe, fiche, fenêtre de jet, modales génériques, menu, barre de session, historique, jour et nuit. **Validation avant tout code.** |
| 2 | Fondations : `theme.css` réécrit, polices, `DuneIcon`, organisation du code (`config/rules`, hooks), correctifs C-1 à C-16, champs §3.2 (schéma, migration, contrôleur), catalogues (`config/`), tests. |
| 3 | Fiche joueur et fenêtre de jet. |
| 4 | Interface MJ (bande, onglet Table, jet MJ, PNJ habillés). |
| 5 | Assistant de création. |
| 6 | ~~Fiche de Maison~~ : abandonné (MJ, 2026-11-04), faute de règles dans le livre de base (§6.6). |

**Lot 2 implémenté le 2026-11-04** :
- **Serveur** : colonnes §3.2 (schéma et migration `04112026_dune_identite_atouts.sql`), sous-tables talents et atouts en `_syncSubTable`, diffusion `character-full-update` une seule fois par table (la boucle était imbriquée), envoi d'atout avec qualité et mots-clefs. Tests : `tests/server/systems/dune/characters.test.js`.
- **Client** :
  - `theme.css` réécrit d'après la planche, avec un bloc de compatibilité `--dune-*` / `dune-*` à retirer à la fin du lot 5 ;
  - `components/ui/DuneIcon` et `DuneDie` ;
  - `config/traits.js`, `config/rules/roll.js` (testé), catalogues `config/assets.js` (95) et `config/talents.js` (55) ;
  - `hooks/useDuneRoll` ;
  - fenêtre de jet refaite sur `Modal` (`components/modals/DuneRollModal.jsx`) ; `DuneHistoryEntry` refait, qui relit aussi les anciens jets.
- **Correctifs faits** : C-1, C-2, C-3 (fenêtre), C-4, C-6, C-8, C-10, C-15, C-16.
- **Reportés** : C-7 au lot 4, parce qu'il faut d'abord que la fiche du MJ reçoive les mises à jour par le générique. C-5, C-9, C-11 à C-14 au lot 3 (fiche).
**Lots 3 et 4 implémentés le 2026-11-04** :
- **Bande partagée** (`components/ui/DuneBand`) pour le joueur et le MJ ; la carte de la marque reprend son fond (demande du MJ).
- **Fiche joueur** : un seul onglet de jeu, colonnes de jauges, `components/layout/` (Identité, Principes et compétences, Atouts, Talents, assemblage `DuneSheetBody` partagé avec le MJ), catalogues d'atouts et de talents sur `CatalogModal`.
- **Fenêtre de jet** : un principe se lance seul, la compétence est facultative (MJ).
- **MJ** : onglets Table · Maison · PNJ · Journal · Historique, ressources dans la bande, même fiche que le joueur (C-7 réglé par `useTableCharacters`), jet du meneur et envoi d'atout refaits.
- **Serveur** : `POST /characters/:id/items` et `/talents`, qui renvoient la ligne avec son id ; elles évitent que deux ajouts rapides s'écrasent.
**Lot 5 implémenté le 2026-11-04** :
- **Assistant de création refait** : Guide d'abord, aide contextuelle tirée du livre (`config/descriptions.js`), ligne « À faire », Précédent / Suivant, pleine largeur, prénom et champs de la feuille officielle, catalogues. Règles inchangées dans `config/rules/creation.js` (testé). Correction au passage : une spécialisation ou une maxime s'ouvre aussi quand les points libres font atteindre le rang 6. La création enregistre toute l'identité (avant : nom, statut et description seulement).
- **Rangement aux standards** : PNJ dans `components/layout/` (`gm/` réduit à `tabs/`), formulaire de PNJ sans écriture pendant le rendu, `diceConfigDefault`, bloc `combat` et `actionIcons` dans `config.jsx`, rosace du ver en composant, bloc de compatibilité CSS retiré, anciennes specs supprimées, CLAUDE.md à jour.
- **Lot 6 (fiche de Maison) abandonné** par le MJ (§6.6) : la refonte est terminée avec le lot 5.

- **Restent à trancher** :
  - Ténacité porte deux restrictions dans le livre (Compétence ; Fremen) : rangée sous Compétence.
  - Jet du MJ : réglé (MJ, 2026-11-04), un 1 y compte aussi pour 2 succès.

Ordre fiche avant création, comme pour Vikings : les personnages existent déjà, et c'est la fiche qui sert à chaque séance (Q-8).

---

## 9. Questions au MJ

Réponds directement dans la colonne de droite.

| # | Question | Proposition | Réponse MJ |
|---|---|---|---|
| Q-1 | **Détermination** (C-1). Faits : l'historique git montre que le « +1 succès » date de la toute première version (2026-03-07) et n'a jamais été modifié ; les boutons « Relancer » / « Critique » n'ont jamais été branchés. Livre (p. 157) : **1 automatique** (avant le jet, un dé est posé sur 1, donc réussite critique) ou **Relance** (après le jet, relancer autant de dés qu'on veut). A : garder +1 succès, un seul bouton qui le dit. B : appliquer les deux modes du livre (ce que la fenêtre annonce depuis le début). | B : c'était l'intention de la fenêtre ; « 1 automatique » est simple, « Relance » ajoute une étape après le jet (choix des dés à relancer). A si tu préfères ne rien changer au calcul. | Règle 2D20 de base, comme sur les autres slugs : Détermination avant le jet = un dé à 1, donc double succès. À corriger. (2026-11-04) |
| Q-2 | **Fiche côté MJ** : aujourd'hui, une carte en lecture où seule la Détermination se modifie. On passe à la même fiche que le joueur (sections partagées, jouable, mode Édition), comme Vileborn et Vampire ? | Oui : même fiche, sans la bande du joueur. | Oui, reco. (2026-11-04) |
| Q-3 | **Onglet Historique** : on le garde, alors que le panneau d'historique flottant existe (déjà côté MJ) ? | Joueur : panneau flottant ajouté, onglet retiré. MJ : panneau seul, onglet retiré. | On garde les onglets (joueur et MJ) ; ajouter le panneau n'empêche pas d'avoir l'onglet. (2026-11-04) |
| Q-4 | **Maison** côté joueur (C-5) : affichée et modifiable sur la fiche, comme le prévoyait la spec d'origine, ou seulement affichée ? | Affichée dans la colonne Identité, modifiable en mode Édition. | La Maison est une fiche de groupe, comme la coterie de Vampire, avec ses propres règles : lot dédié, §6.6. (2026-11-04) |
| Q-5 | **Jauges des ressources** : dans la bande fixe (toujours visibles, compactes) au lieu des deux colonnes de 60 px sur les côtés de la fiche ? | Oui, dans la bande fixe. | Non : garder l'esprit des jauges en colonnes de chaque côté de l'écran, qui encadrent la fiche côté joueur. (2026-11-04) |
| Q-6 | **Typographie** : texte de la fiche en linéale sobre ou en serif fin (chronique impériale) ? | Montrer les deux sur la planche, tu choisis à l'œil. | Spectral. (2026-11-04) |
| Q-7 | **Marque** (carte de l'accueil, titre des pages d'accès) : on l'aligne sur la nouvelle direction ? | Oui, retouche légère (couleurs, filets de dunes), DuneRise conservée. | |
| Q-8 | **Ordre des lots** : planche, fondations, fiche, MJ, création ? | Oui. | |
| Q-10 | **Illustrations extraites des PDF** (peintures, ornements de la feuille) dans l'interface : d'accord ? Le VPS est en ligne, mais l'app reste privée à ta table. | Oui pour les ornements de la feuille et deux ou trois peintures (en-tête, création, écran vide) ; le reste en SVG. | S'inspirer, pas reprendre littéralement : nos propres visuels, générés avec GPT en soutien. (2026-11-04) |
| Q-11 | **Catalogues** : les atouts sont confirmés. On ajoute aussi un catalogue de talents (la saisie libre reste possible dans les deux cas) ? | Oui, les deux, sur `CatalogModal`. | Les talents ne sont pas un catalogue de base, mais on peut détourner la modale de catalogue pour eux : à tester. (2026-11-04) |
| Q-12 | **Impulsion au singulier**, comme le livre (« Impulsion : 4 », « 2 points d'Impulsion ») ? | Oui : libellés de l'interface seulement, le code et la base ne changent pas. | Oui. (2026-11-04) |
| Q-13 | **Rôle, Faction, Traits de personnalité, Ambition** (feuille officielle, absents de l'app) : on les ajoute à l'identité ? « Statut social » reste (on n'enlève rien). | Oui pour les quatre, en texte libre : nouvelles colonnes + migration, c'est léger. Le Rôle sera relié à la fiche de Maison au lot 6. | Reco ; Statut social gardé. (2026-11-04) |
| Q-14 | **Atouts : qualité et mots-clefs** du livre. A : ajoutés au début de la description à l'ajout depuis le catalogue (aucun changement de base). B : vraies colonnes `qualite` et `mots_cles`, affichées en pastilles et modifiables. | B : la qualité se lit d'un coup d'œil sur la fiche ; colonnes + migration, la quantité reste. | Reco, en vrais champs **facultatifs** : les atouts existants restent valides tels quels. (2026-11-04) |
| Q-9 | **Animations d'ambiance** (poussière d'épice dans la bande, rides de Menace, ver pendant le jet) : d'accord sur le principe, discrètes et coupées si le système réduit les animations ? | Oui, à juger sur la planche. | Ambiance animée, jour et nuit (coupée seulement si le système réduit les animations). (2026-11-04) |
