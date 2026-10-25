# Modale de catalogue générique

## Statut

**Proposée le 2026-10-25.** Diagnostic validé par le MJ le 2026-10-25 (D-1 à D-8). Questions Q-1 à Q-8 tranchées par le MJ le 2026-10-25 (§9), décisions reportées au §1 (D-9 à D-13). **Lot pilote implémenté et validé le 2026-10-25** (Cyberpunk, Achtung). Retours du MJ intégrés au lot : arme libre d'Achtung complète (focus avec suggestions tirées des compétences, saisie libre possible), lignes du catalogue d'armes avec toutes les caractéristiques, pills compactes de la forme de la fiche, cadre de la zone recherche / filtres (`vtt-catalog-controls`), onglets soulignés, pli de la feuille retiré du catalogue, version nuit des modales d'Achtung (spec_ui_modales.md §11), focus du catalogue d'armes alignés sur les compétences (Rapproché → Corps à corps, Démolition → Explosifs).

Brique de plateforme : concerne les catalogues d'objets de Cyberpunk, Delta Green, Fabula, Achtung et Vikings ; Zone Blanche ne prend que la modale générique.

Objectif : une **seule modale générique** pour ajouter un objet à un inventaire, depuis un catalogue ou en objet libre. La plateforme porte la fenêtre, la recherche, les filtres, la liste, les onglets et le comportement de l'ajout ; le slug pilote le contenu du catalogue, le rendu de chaque objet, les champs de l'objet libre et ce que fait l'ajout.

Hors périmètre :
- l'envoi d'objet par le MJ (Vikings `GMSendItemModal`) : rattaché au chantier « session MJ générique », qui pourra réutiliser cette modale ;
- l'inventaire de groupe de Zone Blanche (deux colonnes, budget, objet de scénario) : propre au slug ;
- les listes de recherche qui ne sont pas des catalogues d'objets (talents et sorts d'Achtung, moves de Cyberpunk) ;
- l'ajout sur place en mode édition (« + Ajouter » des fiches) : chaque slug le garde s'il l'a.

---

## 1. Décisions

| # | Sujet | Décision |
|---|---|---|
| D-1 | Approche | **Une modale générique unique**, pas des briques assemblables. Le slug fournit les objets, le rendu d'un objet et l'action d'ajout. |
| D-2 | Ajout | **Clic = ajout immédiat.** Pas de mode « sélection puis réglages puis Valider ». Vikings ajoute désormais l'objet avec une quantité de 1, dans l'emplacement de la section d'où la modale a été ouverte ; la quantité se règle ensuite sur la ligne. |
| D-3 | Recherche | Générique : elle cherche **directement dans le texte des objets fournis par le slug** (champs imbriqués compris), insensible à la casse et aux accents (« epee » trouve « Épée »). **Textes seulement**, pas les nombres (Q-2). Le slug n'a rien à déclarer ; il peut restreindre les champs cherchés. |
| D-4 | Filtres | Flexibles : **une ou plusieurs rangées** de filtres en pills, déclarées par le slug (Achtung : type et faction). Les rangées se combinent. Groupement optionnel de la liste par intertitres (Cyberpunk). |
| D-5 | Cas particuliers | Restent au slug, sans rien ajouter au générique : choix de l'emplacement quand les 7 emplacements d'armes de Delta Green sont pris (le slug l'ouvre lui-même par-dessus) ; catalogue rare de Fabula et son badge (le slug fournit la liste et rend le badge). |
| D-6 | Zone Blanche | Sa modale de matériel passe sur la modale générique de la plateforme (`Modal`, spec_ui_modales.md) **et rien d'autre** : contenu, deux colonnes et logique de groupe inchangés. |
| D-7 | Vikings | Dans le périmètre (slug moderne depuis sa refonte). |
| D-8 | Envoi d'objet par le MJ | Hors chantier, rattaché à la session MJ générique (backlog). |
| D-9 | Déclencheur (Q-1) | **Porté par la plateforme** : toute la ligne est cliquable, avec un bouton + qui passe à ✓ un court instant. Le slug ne rend que le contenu de la ligne (sans bouton à lui) ; il habille la ligne et le bouton par son `theme.css`, et peut masquer le +. |
| D-10 | Après un ajout (Q-4) | **La modale reste ouverte** partout (ajouts multiples). Fermeture par ✕, Échap ou clic sur le fond. Delta Green, Achtung et Vikings changent de comportement. |
| D-11 | Objet libre (Q-5) | **Standard de la plateforme** : onglets « Catalogue » et « Objet libre », le second seulement si le slug gère l'ajout libre. La plateforme porte les onglets, l'objet en cours de saisie, le bouton « Ajouter » (grisé tant que l'objet n'est pas valide), la remise à zéro après l'ajout et le retour ✓. Formulaire de base fourni (nom obligatoire, description) ; le slug peut fournir ses propres champs (tags de Cyberpunk, dégâts et armure de Vikings…) et sa règle de validité. Pas de quantité : 1, réglable ensuite. |
| D-12 | Emplacements libres de Delta Green (Q-7) | **Information abandonnée** : non primordiale, propre à un slug. Les emplacements restent visibles sur la fiche, et le choix de l'emplacement à remplacer apparaît quand ils sont tous pris. |
| D-13 | Fenêtre (Q-3, Q-6, Q-8) | Grande (`lg`) et agrandissable partout. Compteur d'objets affichés en pied. Ligne d'en-tête de liste optionnelle fournie par le slug (tableau de Delta Green). |

---

## 2. Constat

| Slug | Catalogue (appelants) | Fenêtre | Après un ajout | Particularités |
|---|---|---|---|---|
| Cyberpunk | `BrowseModal` : cyberware et inventaire, fiche et `TabSession` MJ (4 appels) | `Modal` générique | reste ouverte | Catégories déduites des données, intertitres par catégorie, bouton + qui passe à ✓ pendant 1,5 s, hauteur fixe, agrandissable |
| Delta Green | `EquipmentCatalogModal` (`EquipmentSection`) | maison | se ferme | Tableau à colonnes (désignation, catégorie, coût), clic sur la ligne, compteur en pied |
| Delta Green | `WeaponCatalogModal` (`WeaponsSection`) | maison | se ferme | Même tableau (arme, compétence, portée, dégâts, perforation, létalité), bandeau de remplacement quand les 7 emplacements sont pris |
| Fabula | `EquipmentCatalogModal` (`BackpackCard`, `EquipmentPanel`, `Creation`) | maison | reste ouverte | Recherche sans accents, filtres fixes (armes, armures, boucliers, accessoires), catalogue de base + rare (badge, rare exclu à la création), prix |
| Achtung | `WeaponCatalogModal` (`WeaponsTable`) | maison | se ferme | Deux rangées de filtres (type déduit des données, faction) |
| Vikings | `AddItemModal` (`InventorySection`) | `VkModal` | se ferme | Sélection puis quantité, emplacement et Ajouter ; onglet « Objet libre » dans la même modale |
| Zone Blanche | `EquipmentCatalogModal` (`EquipmentSection`) | maison | reste ouverte | Inventaire de groupe à deux colonnes : hors chantier, sauf la fenêtre (D-6) |

Commun à tous : recherche, filtres en pills, liste qui défile, état vide, ajout. Objet libre en modale : Vikings seul ; Cyberpunk, Delta Green, Fabula et Achtung ajoutent une ligne vide à remplir sur la fiche.

---

## 3. Comportement de la modale

- **Fenêtre** : la modale générique (`Modal`), donc habillée par le `theme.css` du slug. Grande et agrandissable. Hauteur fixe : la recherche et les filtres restent en place, seule la liste défile, la fenêtre ne saute pas quand on filtre.
- **Onglets** : « Catalogue » et « Objet libre », seulement si le slug gère l'objet libre (sinon, pas d'onglets).
- **Recherche** : champ en tête, focus à l'ouverture. Cherche dans le texte de chaque objet (D-3).
- **Filtres** : sous la recherche, une rangée par filtre déclaré, chacune avec « Tous » en premier. Un second clic sur un filtre actif le désactive. Les options d'une rangée sont fournies par le slug ou déduites des objets (ordre d'apparition).
- **Liste** : un objet par ligne, rendu par le slug, toute la ligne cliquable avec le bouton + / ✓ (D-9). Intertitres par groupe si le slug le demande. « Aucun résultat. » quand rien ne correspond. Ligne d'en-tête optionnelle, fixe en haut de la liste.
- **Objet libre** : le formulaire (de base ou du slug), puis « Ajouter ». Après l'ajout, le formulaire se vide et un ✓ confirme ; la modale reste ouverte.
- **Pied** : compteur d'objets affichés (onglet Catalogue) ; bouton « Ajouter » (onglet Objet libre).

---

## 4. Contrat du composant (pour le slug)

Composant `CatalogModal` (`src/client/src/components/modals/CatalogModal.jsx`), filtrage dans `src/client/src/tools/catalog.js` (fonctions pures, testées dans `tests/tools/catalog.test.js`).

| Prop | Rôle |
|---|---|
| `title`, `subtitle` | Titre et sous-titre de la fenêtre. |
| `items` | Les objets du catalogue, dans la forme du slug. |
| `renderItem(item)` | Contenu d'une ligne (nom, détails, badges, prix…), sans bouton. |
| `onAdd(item)` | Ajout d'un objet du catalogue (le slug construit l'objet d'inventaire et l'enregistre). |
| `onClose` | Fermeture. |
| `filters` | Optionnel. Rangées de filtres : `[{ key, getValue(item), options? }]`, `options` = `[{ value, label }]` ; sans `options`, déduites des objets (libellé = valeur). |
| `groupBy` | Optionnel. `{ getValue(item), getLabel?(value) }` : intertitres. |
| `searchFields` | Optionnel. Champs cherchés (défaut : tout le texte de l'objet). |
| `listHeader` | Optionnel. Ligne d'en-tête de la liste. |
| `getKey(item)` | Optionnel. Identifiant stable d'un objet (défaut : `item.name`). |
| `onAddCustom(draft)` | Optionnel. Ajout d'un objet libre ; sa présence affiche l'onglet « Objet libre ». |
| `renderCustomForm({ value, onChange })` | Optionnel. Champs propres au slug ; `onChange(patch)` fusionne dans l'objet en cours. Défaut : nom et description. |
| `customDefaults` | Optionnel. Objet libre de départ (défaut : `{ name: '', description: '' }`). |
| `isCustomValid(draft)` | Optionnel. Validité (défaut : nom non vide). |

Classes stables, style par défaut dans `index.css`, habillables par le `theme.css` de chaque slug : `vtt-catalog`, `vtt-catalog-tabs`, `vtt-catalog-controls` (zone recherche et filtres), `vtt-catalog-search`, `vtt-catalog-filters`, `vtt-catalog-list`, `vtt-catalog-list-header`, `vtt-catalog-group`, `vtt-catalog-item` (`is-added`), `vtt-catalog-item-body`, `vtt-catalog-add`, `vtt-catalog-empty`, `vtt-catalog-count`, `vtt-catalog-custom`.

---

## 5. Par slug

| Slug | Changement |
|---|---|
| Cyberpunk | `BrowseModal` remplacée par `CatalogModal` dans les 4 appels (fiche et `TabSession` MJ). Filtre et intertitres par catégorie (`ITEM_AND_CYBERWARE_CATEGORY_LABEL`), rendu actuel (description, indication d'option, tags) dans `renderItem`. Objet libre : nom, description (notes pour le cyberware) et tags (`TagAdder` existant). `BrowseModal.jsx` supprimé. |
| Achtung | `WeaponCatalogModal` réécrite autour de `CatalogModal` : deux rangées (type déduit du catalogue, trié ; faction `FACTION_LABELS`), rendu nom · type · faction · dégâts · portée. Objet libre : nom, portée, dégâts ; le reste (focus, salve, qualités) se règle sur la fiche. Reste ouverte après un ajout (D-10). |
| Delta Green | Les deux catalogues réécrits autour de `CatalogModal`, tableau conservé (`renderItem` en colonnes + `listHeader`). Armes : quand tout est pris, le slug ouvre son choix d'emplacement par-dessus (D-5) ; plus de compteur d'emplacements (D-12). Objet libre : à définir au lot 2. |
| Fabula | `EquipmentCatalogModal` réécrite autour de `CatalogModal` : filtre par type d'emplacement, liste de base + rare (sans le rare à la création), badge « Rare » et prix dans `renderItem` (`EquipmentItemSummary` réutilisé). Objet libre : à définir au lot 2. |
| Vikings | `AddItemModal` remplacée par `CatalogModal` : ajout immédiat, quantité 1, emplacement de la section. Objet libre : ses champs actuels (catégorie, dégâts, armure, prérequis, notes) en formulaire propre. |
| Zone Blanche | `EquipmentCatalogModal` passe sur `Modal` (D-6), le reste ne bouge pas. |

---

## 6. Habillage

Chaque slug habille `vtt-catalog*` dans son `theme.css`, dans l'identité de ses modales (déjà habillées le 2026-10-18, spec_ui_modales.md §11). Les fenêtres maison (bandeau `dg-header` de Delta Green, `ac-modal` d'Achtung, `zb-modal` de Zone Blanche) laissent place à l'habillage `vtt-modal*` du slug.

---

## 7. Découpage

| Lot | Contenu |
|---|---|
| **Pilote** | `CatalogModal`, fonctions de filtrage et tests, style par défaut. Migration de **Cyberpunk** (part de `BrowseModal`, objet libre avec tags) et d'**Achtung** (deux rangées de filtres). Habillage de ces deux slugs. |
| **Lot 2** | Delta Green, Fabula, Vikings, et la fenêtre de Zone Blanche. Habillage compris. |

---

## 8. Tests

Fonctions de filtrage seulement (pas de composant) : recherche insensible aux accents et à la casse, recherche dans les champs imbriqués, nombres ignorés, restriction par `searchFields`, combinaison de deux rangées de filtres, filtre désactivé, options déduites des objets, groupement dans l'ordre d'apparition, catalogue vide.

---

## 9. Questions (tranchées le 2026-10-25)

| # | Question | Proposition | Réponse MJ |
|---|---|---|---|
| Q-1 | Déclencheur de l'ajout : bouton + à droite de chaque ligne, ligne entière cliquable, ou les deux ? | Les deux. | « C'est pas un truc lié au rendu du slug ? » Après discussion : **porté par la plateforme** (comportement standard), apparence par le `theme.css` (D-9). |
| Q-2 | La recherche inclut-elle les nombres ? | Textes seulement. | **Textes** (D-3). |
| Q-3 | Compteur d'objets affichés en pied, partout ? | Oui, discret. | **Oui** (D-13). |
| Q-4 | Après un ajout, la modale reste ouverte ou se ferme ? | Reste ouverte par défaut, option par slug. | **On unifie : reste ouverte**, achats multiples (D-10). |
| Q-5 | Vikings : où va l'« objet libre » ? | Bouton à part dans la section. | Après discussion : **standard de la plateforme**, onglet « Objet libre » avec formulaire de base ou champs du slug (D-11). |
| Q-6 | Delta Green : garder les en-têtes de colonnes ? | Oui, par `listHeader`. | **Oui** (D-13). |
| Q-7 | Delta Green armes : indication « N emplacements libres » ? | Dans le titre. | Après discussion : **abandonnée** (D-12). |
| Q-8 | Fenêtre grande et agrandissable partout ? | Oui. | **Oui, agrandissable** (D-13). |
