# Spec — Slug `achtung` : Achtung! Cthulhu

> Version 1.1 — Spécification fonctionnelle complète
> Statut : **Prêt pour Phase 3 (implémentation)**
> Dernière mise à jour : juin 2026

---

## Sommaire

1. [Identité du système](#1-identité-du-système)
2. [Deltas vs Dune](#2-deltas-vs-dune)
3. [Données — Structure de la fiche](#3-données--structure-de-la-fiche)
4. [Mécanique de dés — 2D20](#4-mécanique-de-dés--2d20)
5. [Interface joueur — Fiche](#5-interface-joueur--fiche)
6. [Thème visuel](#6-thème-visuel)
7. [Création de personnage — Wizard](#7-création-de-personnage--wizard)
8. [Ressources de session](#8-ressources-de-session)
9. [Checklist finale](#9-checklist-finale)

---

## 1. Identité du système

| Propriété | Valeur |
|---|---|
| **Slug** | `achtung` |
| **Label** | `Achtung! Cthulhu` |
| **URL joueur** | `/achtung/` |
| **URL GM** | `/achtung/gm` |
| **Thème** | WWII Secret War — kaki militaire, papier jauni, rouge sang, noir encre |
| **Moteur** | 2D20 Modiphius — proche de Dune, avec divergences |

---

## 2. Deltas vs Dune

Ce qui justifie un slug séparé plutôt qu'une extension de Dune.

| Dimension | Dune | Achtung! Cthulhu |
|---|---|---|
| Stats de base | Compétences + Principes | **Attributs** + **Compétences** (deux couches distinctes) |
| Nombre de stats | 5 comp + 5 principes | **6 attributs** + **12 compétences** |
| Rang du jet | compétence + principe | **attribut + compétence** |
| Double succès | rang compétence si spécialisation | rang compétence si **focus** renseigné |
| Bonus Damage | — | valeur par attribut (table fixe) |
| Ressource perso | Détermination | **Fortune** |
| Santé | — | **Stress** (jauge) + **Injuries** (cases libres) |
| Défense mentale | — | **Courage** |
| Armure physique | — | **Armour** |
| Momentum pool | Impulsions (max 6) | **Momentum** (max 6) — même mécanique |
| Menace | Menace | **Threat** — même mécanique |
| Jets de dommages | — | **Dés de Challenge (d6)** avec table de résultat |
| Armes | Atouts libres | Table dédiée : Focus, Range, Damage, Salvo, Size, Qualities |
| Magie | — | Section Spells + stat Power (optionnel, spellcasters uniquement) |
| Archétype | — | Liste fixe de 8 archétypes (avec bonus prédéfinis) |
| Background | — | Liste fixe de 20 backgrounds (avec bonus prédéfinis) |
| Characteristic | — | Liste fixe de 20 caractéristiques (avec bonus prédéfinis) |
| Vérités / Cicatrices | — | Jusqu'à 5 cases **Personal Truths & Scars** |
| Langues | — | Pills/tags texte libre |

---

## 3. Données — Structure de la fiche

### 3.1 Identité du personnage

| Champ | Type | Note |
|---|---|---|
| Nom | texte | |
| Prénom (player name) | texte | |
| Nationalité | texte libre | |
| Rang | texte libre | grade militaire ou civil |
| Archétype | texte | sélectionné dans la liste des 8 |
| Background | texte | sélectionné dans la liste des 20 |
| Characteristic | texte | sélectionnée dans la liste des 20 |
| Biographie | texte long | |
| Avatar | image | |

### 3.2 Attributs (6 — fixes pour tous les personnages)

Agility, Brawn, Coordination, Insight, Reason, Will.

Plage typique à la création : 6 à 11, total 51. Chaque attribut a un **Bonus Damage** associé, affiché en lecture seule sur la fiche et calculé par table :

| Valeur attribut | Bonus Damage |
|---|---|
| 8 ou moins | — |
| 9 | +1 dé de Challenge |
| 10–11 | +2 dés de Challenge |
| 12–13 | +3 dés de Challenge |
| 14–15 | +4 dés de Challenge |
| 16+ | +5 dés de Challenge |

### 3.3 Compétences (12 — fixes pour tous les personnages)

Chaque compétence a un **rang** (0 à 5) et un **focus** (texte libre, ex : "Handguns, Melee Weapons"). Le focus active la règle du double succès.

| Compétence | Focuses possibles (liste de référence) |
|---|---|
| Academia | Art, Cryptography, Finance, History, Linguistics, Occultism, Science |
| Athletics | Climbing, Lifting, Physical Training, Running, Swimming, Throwing |
| Engineering | Architecture, Combat Engineering, Electronics, Explosives, Mechanical Engineering |
| Fighting | Close Quarters, Handguns, Hand-to-Hand, Heavy Weapons, Melee Weapons, Rifles, Threat Awareness, Exotic |
| Medicine | First Aid, Infectious Diseases, Pharmacology, Psychiatry, Surgery, Toxicology |
| Observation | Hearing, Instincts, Sight, Smell and Taste |
| Persuasion | Charm, Innuendo, Intimidation, Negotiation, Rhetoric, Deceive, Invocation |
| Resilience | Fortitude, Discipline, Immunity |
| Stealth | Camouflage, Disguise, Rural Stealth, Urban Stealth |
| Survival | Animal Handling, Foraging, Hunting, Mysticism, Orienteering, Tracking |
| Tactics | Air Force, Army, Covert Operations, Leadership, Navy, Technical Projects |
| Vehicles | Cars, Motorcycles, Heavy Vehicles, Tanks, Aircraft, Watercraft |

Total des rangs à la création : 17 (sauf Dilettante characteristic : +1 à toutes les compétences à 0).

### 3.4 Santé & Défenses

| Champ | Type | Note |
|---|---|---|
| Stress | jauge cochable | max 12, fixe |
| Injuries | cases texte libres | blessures nommées, pas de compteur |
| Armour | valeur numérique | résistance physique |
| Courage | valeur numérique | résistance mentale, acquis via talents/background |

### 3.5 Fortune

Ressource individuelle, cases cochables. Valeur de départ : 3. Usages : obtenir automatiquement un 1 sur un d20, relancer un dé de Challenge, introduire une vérité narrative. Usage géré manuellement par le joueur et le GM.

### 3.6 Langues

Pills/tags texte libre. Minimum deux langues attendues à la création (langue natale + au moins une autre).

### 3.7 Personal Truths & Scars

Jusqu'à 5 cases texte courtes, libres. Au moins 4 attendues en fin de création (une du background, une de la characteristic, deux de nationalité/langue).

### 3.8 Talents

Liste libre, chaque talent a :
- un nom
- des mots-clés (Keywords), ex : "Soldier, Fighting"
- une description de l'effet

3 talents attendus en fin de création (un de l'archétype, un du background, un de la characteristic).

### 3.9 Armes

Table avec les colonnes suivantes :

| Colonne | Note |
|---|---|
| Nom | |
| Focus | expertise Fighting associée, ex : "Handguns" |
| Range | Close / Short / Medium / Long |
| Damage | nb de dés de Challenge, ex : "4" |
| Salvo | qualité de salve, ex : "Vicious" |
| Size | Minor ou Major |
| Qualities | ex : "Reliable, Hidden 1" |
| Munitions | optionnel — null si pas de gestion |
| Attribut d'attaque | Brawn (CàC) ou Coordination (distance), pré-rempli mais modifiable |

### 3.10 Équipement notable

Liste simple : nom + description + effet. Correspond à "Equipment of Note" sur la fiche officielle.

### 3.11 Magie (optionnel)

Section masquée par défaut. Visible uniquement si le personnage est spellcaster (activé manuellement sur la fiche ou lors de la création).

Champs spellcaster :
- **Power** : valeur numérique (nombre de dés de Puissance)

Chaque sort a :
- Nom
- Compétence utilisée (ex : "Will + Medicine")
- Difficulté
- Coût (en dés de Challenge de stress mental pour le lanceur)
- Durée
- Effet
- Dépenses de Momentum disponibles

---

## 4. Mécanique de dés — 2D20

### 4.1 Constitution du jet

Le joueur sélectionne **un attribut** et **une compétence**. Leur somme = nombre cible.

Exemple : Coordination (9) + Fighting (4) → nombre cible **13**

### 4.2 Résolution

On lance **2d20** par défaut. Des dés supplémentaires peuvent être achetés (voir 4.3), jusqu'à **5d20** au total.

**Lecture de chaque dé :**

| Résultat d20 | Succès générés |
|---|---|
| ≤ nombre cible | 1 succès |
| ≤ rang de la compétence ET un focus est renseigné | 2 succès |
| 1 naturel | 2 succès (toujours, même sans focus, même compétence à 0) |
| 20 | Complication (0 succès) |

La règle du focus fonctionne ainsi : si le joueur a renseigné un focus sur la compétence utilisée, tout dé dont le résultat est inférieur ou égal au rang de la compétence (et non pas au nombre cible) génère **2 succès** au lieu d'1.

**Résolution et Momentum :**

Si le total de succès obtenus ≥ difficulté → jet réussi. Chaque succès au-delà de la difficulté est **automatiquement ajouté au pool de Momentum partagé**, dans la limite de 6. Les succès excédentaires qui porteraient le pool au-delà de 6 sont perdus.

### 4.3 Achats de dés (uniquement ce qui est géré dans la modale)

Seuls les achats de dés sont gérés dans l'interface. Toutes les autres dépenses de Momentum sont gérées manuellement autour de la table.

Les dés supplémentaires peuvent être achetés de deux façons, combinables :
- en **dépensant du Momentum** (réduit le pool partagé)
- en **générant de la Menace** (augmente le pool du GM d'autant)

| Achat | Coût |
|---|---|
| +1 d20 supplémentaire | 1 Momentum ou 1 Menace générée (1er dé) |
| +1 d20 supplémentaire | 2 Momentum ou 2 Menace générée (2e dé) |
| +1 d20 supplémentaire | 3 Momentum ou 3 Menace générée (3e dé) |
| +1 dé de Challenge bonus (dommages) | 1 Momentum ou 1 Menace générée par dé (max +3) |

Le coût augmente par dé acheté, quelle que soit la source. Si le joueur mélange les deux sources sur un même jet, le coût progressif reste global (ex : 1er dé via Menace, 2e dé coûte 2 — Momentum ou Menace).

### 4.4 Jet assisté

Un ou plusieurs joueurs peuvent assister un autre joueur. Un joueur qui assiste lance **1d20** au lieu de 2d20 (il peut aussi acheter des dés supplémentaires). Chaque succès d'un joueur assistant s'ajoute aux succès du joueur principal, à condition que ce dernier obtienne au moins 1 succès.

Dans la modale de jet, il faut pouvoir choisir de lancer **1d20 ou 2d20** comme base (switch "j'assiste" ou simple sélection du nombre de dés de base). Les achats de dés supplémentaires fonctionnent de la même façon.

### 4.5 Dés de Challenge (d6) — Jets de dommages

Après un jet de compétence réussi, le joueur peut enchaîner avec un jet de dommages. La modale propose alors de lancer le pool de dés de Challenge de l'arme sélectionnée (avec possibilité d'en acheter des supplémentaires via Momentum).

**Table de résolution standard :**

| Face d6 | Résultat |
|---|---|
| 1 | 1 point de stress |
| 2 | 2 points de stress |
| 3 | 0 |
| 4 | 0 |
| 5 | 1 point de stress + **Effet** |
| 6 | 1 point de stress + **Effet** |

L'**Effet** dépend de la qualité Salvo de l'arme. Exemples :

| Qualité Salvo | Effet sur 5 ou 6 |
|---|---|
| **Vicious** | Les 5 comptent pour 2 points de stress (pas 1+Effet) |
| **Area** | L'effet s'applique à toutes les cibles dans la zone |
| **Stun** | La cible est étourdissante |
| **Piercing X** | Ignore X points d'Armour |

Le calcul du total de stress est affiché dans l'interface. L'application des effets reste à la discrétion du GM et des joueurs autour de la table.

---

## 5. Interface joueur — Fiche

### Sections affichées

| Section | Contenu |
|---|---|
| **En-tête** | Avatar, nom, nationalité, rang, archétype, background, characteristic, code d'accès |
| **Personal Truths & Scars** | Jusqu'à 5 cases texte courtes inline |
| **Attributs** | 6 colonnes : valeur éditable + Bonus Damage calculé automatiquement |
| **Compétences** | 12 lignes : rang (0–5) + focus (texte libre) + bouton jet |
| **Stress** | Jauge de cases cochables (actuel / max 12) |
| **Injuries** | Cases texte libres nommées |
| **Courage / Armour** | Valeurs numériques éditables |
| **Fortune** | Cases cochables |
| **Langues** | Pills/tags éditables, saisie libre |
| **Talents** | Nom + keywords + effet, liste éditable |
| **Armes** | Table complète + bouton lancer les dommages par arme |
| **Equipment of Note** | Nom + description + effet, liste simple |
| **Sorts** | Masqué si non-spellcaster. Power + table des sorts si actif. |

---

## 6. Thème visuel

Palette WWII "Secret War" — documents opérationnels tamponnés, nuit européenne.

| Token | Valeur | Usage |
|---|---|---|
| `--ac-bg` | `#1a1a14` | Fond principal — noir encre |
| `--ac-surface` | `#252518` | Surface carte |
| `--ac-surface-alt` | `#2f2f1e` | Surface secondaire |
| `--ac-primary` | `#6b7c45` | Kaki militaire — accents, titres |
| `--ac-secondary` | `#b5a96a` | Sable — labels, valeurs |
| `--ac-accent` | `#8b1a1a` | Rouge sang — danger, stress, blessures |
| `--ac-success` | `#4a6741` | Vert terrain — succès, Momentum |
| `--ac-muted` | `#5c5840` | Texte atténué |
| `--ac-text` | `#e5dcc0` | Texte principal — papier jauni |
| `--ac-border` | `#3d3d28` | Bordures |

Typographie : **Special Elite** (machine à écrire) pour les titres et en-têtes, police système pour le corps. Mode nuit uniquement.

---

## 7. Création de personnage — Wizard

### 7.1 Vue d'ensemble

La création suit **6 étapes officielles** (Archetype → Background → Characteristic → Finishing Touches). Le wizard guide le joueur dans cet ordre et applique les bonus automatiquement à chaque sélection.

À la fin, les valeurs finales doivent respecter :
- Total des attributs = 51 (tous entre 6 et 11)
- Total des rangs de compétences = 17
- 4 focuses (2 de l'archétype, 2 du background)
- 4+ Personal Truths & Scars (1 background, 1 characteristic, 2 nationalité/langue)
- 3 talents (1 archétype, 1 background, 1 characteristic)

### 7.2 Étape 1 — Archétype

Sélection dans la liste fixe de 8 archétypes. Chaque archétype applique des **bonus fixes d'attributs et de compétences**, propose des focuses à choisir, et oriente vers des talents à sélectionner.

| Archétype | Bonus Attributs | Bonus Compétences | Focuses |
|---|---|---|---|
| **Boffin** | Brawn +1, Coordination +2, Insight +1, Reason +2 | Academia +1, Engineering +2, Medicine +2, Observation +1, Stealth +1, Vehicles +2 | 2 parmi Engineering, Medicine, Vehicles |
| **Commander** | Coordination +2, Insight +1, Reason +2, Will +1 | Academia +1, Fighting +2, Persuasion +1, Stealth +1, Survival +2, Tactics +2 | 2 parmi Fighting, Survival, Tactics |
| **Con Artist** | Coordination +1, Insight +2, Reason +1, Will +2 | Academia +1, Observation +2, Persuasion +2, Resilience +1, Stealth +2, Tactics +1 | 2 parmi Observation, Persuasion, Stealth |
| **Grease Monkey** | Brawn +1, Coordination +2, Insight +1, Reason +2 | Athletics +1, Engineering +2, Persuasion +2, Resilience +1, Survival +1, Vehicles +2 | 2 parmi Engineering, Persuasion, Vehicles |
| **Infiltrator** | Agility +2, Brawn +1, Coordination +2, Insight +1 | Athletics +2, Engineering +1, Fighting +2, Observation +1, Stealth +2, Survival +1 | 2 parmi Athletics, Fighting, Stealth |
| **Investigator** | Agility +1, Coordination +1, Insight +2, Reason +2 | Academia +2, Engineering +1, Medicine +2, Observation +2, Persuasion +1, Stealth +1 | 2 parmi Academia, Medicine, Observation |
| **Occultist** | Brawn +1, Will +2, + choix Insight/Reason | Observation +1, Persuasion +2, Resilience +2, Stealth +1, + choix Academia/Survival | 2 parmi Academia, Persuasion, Resilience, Survival |
| **Soldier** | Agility +1, Brawn +2, Coordination +2, Insight +1 | Athletics +1, Fighting +2, Observation +1, Resilience +2, Survival +2, Tactics +1 | 2 parmi Fighting, Resilience, Survival |

Le joueur choisit ensuite **1 talent** parmi ceux proposés par l'archétype (liste affichée avec nom, keywords et effet).

### 7.3 Étape 2 — Background

Sélection dans la liste fixe de 20 backgrounds. Chaque background applique des **bonus fixes d'attributs et de compétences**, propose des focuses, un talent, une Truth et des Belongings.

| Background | Bonus Attributs | Bonus Compétences | Focus |
|---|---|---|---|
| **Academic** | Coordination +2, Insight +1, Reason +2, Will +1 | Academia +2, Observation +1, Persuasion +1 | 1 Academia + 1 libre |
| **Air Force** | Agility +1, Coordination +2, Insight +2, Reason +1 | Engineering +1, Tactics +1, Vehicles +2 | 1 Vehicles + 1 libre |
| **Army** | Agility +2, Brawn +2, Coordination +1, Will +1 | Athletics +1, Fighting +2, Tactics +1 | 1 Fighting + 1 libre |
| **Athlete** | Agility +2, Brawn +2, Coordination +1, Insight +1 | Athletics +2, Fighting +1, Resilience +1 | 1 Athletics + 1 libre |
| **Covert Operative** | Agility +2, Coordination +1, Insight +1, Will +2 | Persuasion +1, Stealth +2, Tactics +1 | 1 Stealth + 1 libre |
| **Criminal** | Agility +2, Brawn +1, Insight +2, Will +1 | Persuasion +2, Stealth +1, Tactics +1 | 1 Persuasion + 1 libre |
| **Driver** | Brawn +1, Coordination +2, Insight +2, Reason +1 | Athletics +1, Engineering +1, Vehicles +2 | 1 Vehicles + 1 libre |
| **Engineer** | Agility +1, Coordination +2, Insight +1, Reason +2 | Academia +1, Engineering +2, Observation +1 | 1 Engineering + 1 libre |
| **Entertainer** | Agility +2, Coordination +1, Insight +1, Will +2 | Athletics +1, Observation +1, Persuasion +2 | 1 Persuasion + 1 libre |
| **Journalist** | Coordination +1, Insight +2, Reason +1, Will +2 | Academia +1, Observation +2, Persuasion +1 | 1 Observation + 1 libre |
| **Labourer** | Agility +1, Brawn +2, Coordination +2, Will +1 | Athletics +1, Resilience +2, Survival +1 | 1 Resilience + 1 libre |
| **Military Officer** | Agility +1, Insight +1, Reason +2, Will +2 | Fighting +1, Persuasion +1, Tactics +2 | 1 Tactics + 1 libre |
| **Navy** | Agility +2, Brawn +1, Coordination +2, Reason +1 | Engineering +1, Tactics +1, Vehicles +2 | 1 Vehicles + 1 libre |
| **Physician** | Coordination +2, Insight +1, Reason +2, Will +1 | Academia +1, Medicine +2, Resilience +1 | 1 Medicine + 1 libre |
| **Police** | Agility +1, Brawn +1, Coordination +2, Insight +2 | Fighting +1, Observation +2, Persuasion +1 | 1 Observation + 1 libre |
| **Politician** | Coordination +1, Insight +2, Reason +1, Will +2 | Academia +1, Persuasion +2, Tactics +1 | 1 Persuasion + 1 libre |
| **Resistance** | Agility +1, Coordination +1, Reason +2, Will +2 | Persuasion +1, Stealth +2, Tactics +1 | 1 Stealth + 1 libre |
| **Spiritual Leader** | Agility +1, Insight +2, Reason +1, Will +2 | Academia +2, Persuasion +1, Resilience +1 | 1 Academia + 1 libre |
| **Veteran of the Great War** | Brawn +1, Coordination +1, Will +1 | Fighting +1, Survival +1, +1 à 2 autres | 1 Fighting ou Survival + 1 libre |
| **Wanted by Authorities** | Agility +1, Insight +1, + 1 libre | Persuasion +1, Stealth +1, +1 à 2 autres | 1 Persuasion ou Stealth + 1 libre |

Le joueur choisit aussi la **Truth** proposée par le background (ou en crée une libre), et note les **Belongings** de départ.

### 7.4 Étape 3 — Characteristic

Sélection dans la liste fixe de 20 caractéristiques. Chaque caractéristique applique des bonus d'attributs et de compétences, propose un talent et une Truth.

| Characteristic | Bonus Attributs | Bonus Compétences |
|---|---|---|
| Bookworm | Insight +1, Reason +1, + 1 libre | Academia +1, + 3 autres libres |
| Born Behind the Wheel | Coordination +1, Reason +1, + 1 libre | Engineering +1, Vehicles +1, + 2 autres |
| Built Like a Brick Outhouse | Brawn +1, Coordination +1, + 1 libre | Athletics +1, Fighting +1, Resilience +1, + 1 autre |
| Conscientious Objector | Reason +1, Will +1, + 1 libre | Resilience +1, + 3 autres (hors Fighting/Tactics) |
| Criminal Mindset | Insight +1, Agility +1, + 1 libre | Observation +1, Stealth +1, + 2 autres |
| Dilettante | Coordination +1, Insight +1, + 1 libre | +1 à toutes les compétences à 0 |
| Dreamwalker | Insight +1, Will +1, + 1 libre | Resilience +1, Observation +1, + 2 autres |
| Escaped from Europe | Insight +1, Will +1, + 1 libre | Academia +1, Athletics +1, Persuasion +1, Survival +1 |
| Experimental Subject | Agility +1, Brawn +1, + 1 libre | +1 à 4 compétences libres |
| My War Started Early | Agility +1, Brawn +1, Coordination +1 | Fighting +1, Medicine +1, + 2 autres |
| Nomadic | Brawn +1, Coordination +1, Reason +1 | Survival +1, Vehicles +1, + 2 autres |
| Own an Occult Artefact | Reason +1, Will +1, + 1 libre | +1 Observation ou Persuasion ou Stealth, Resilience +1, + 2 autres |
| Raised by a Cult | Brawn +1, Insight +1, + 1 libre | Academia +1, Resilience +1, Stealth +1, + 1 autre |
| Raised in the Colonies | Agility +1, Brawn +1, Will +1 | Athletics +1, Survival +1, + 2 autres |
| Read from an Occult Book | Insight +1, Will +1, + 1 libre | Observation +1, Resilience +1, + 2 autres |
| Scientific Visionary | Insight +1, Reason +1, + 1 libre | Academia +1, Engineering +1, + 2 autres |
| Street Kid | Brawn +1, Coordination +1, Reason +1 | Resilience +1, Survival +1, Stealth +1, + 1 autre |
| The Lucky One | Agility +1, Brawn +1, Will +1 | Athletics +1, Tactics +1, + 2 autres |
| Veteran of the Great War | Brawn +1, Coordination +1, Will +1 | Fighting +1, Survival +1, + 2 autres |
| Wanted by the Authorities / Young at Heart | variable | variable |

### 7.5 Étape 4 — Truths, Langues & Finalisation

- Saisie ou confirmation des **Personal Truths & Scars** (nationalité, langue maternelle, celles issues du background et de la characteristic)
- Saisie des **langues** parlées (pills)
- Saisie des **Belongings / équipement de départ** issus des étapes précédentes
- Vérification des valeurs finales : total attributs = 51, total compétences = 17, 4 focuses, 3 talents

### 7.6 Étape 5 — Magie (optionnelle)

Case à cocher "Ce personnage est un lanceur de sorts". Si cochée : saisie de **Power** et des sorts initiaux. Cette section peut aussi être activée plus tard directement sur la fiche.

### 7.7 Étape 6 — Récapitulatif & Code d'accès

Aperçu complet de la fiche avant validation. Affichage du code d'accès généré et de l'URL personnelle. L'URL thématique utilise des termes évocateurs du setting (noms d'opérations WWII, lieux, termes occultistes).

---

## 8. Ressources de session

| Ressource | Visible | Max | Géré par |
|---|---|---|---|
| **Momentum** | Joueurs + GM | 6 | Joueurs + GM |
| **Threat** | Joueurs + GM (lecture) | — | GM (les joueurs en génèrent via jets) |
| **Fortune** | Joueur uniquement | variable | Joueur + GM |

---

## 9. Checklist finale

- [ ] `database-template/achtung-schema.sql`
- [ ] Backend : config, controller, routes
- [ ] Frontend : config (2D20 + Challenge dice), theme.css
- [ ] Fiche joueur (Sheet)
- [ ] Modale de jet de dés (2d20 / 1d20 assist, achat de dés)
- [ ] Modale de dommages (dés de Challenge, affichage résultats)
- [ ] Historique de jets (AchtungHistoryEntry)
- [ ] Wizard de création (6 étapes, pré-remplissage archétype + background + characteristic)
- [ ] Interface GM (GMApp / GMView)