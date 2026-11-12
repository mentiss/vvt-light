# Session MJ : personnages de la table et outils de table

Deux petites briques de plateforme pour l'onglet Session du MJ : un hook qui tient les fiches des personnages de la table, et un bloc qui pose les outils de table (musique, tableau, et les suivants). **Chaque slug garde son `TabSession`**, sa disposition et son contenu.

Statut : validée le 2026-11-12 (Q-1, Q-2 : recommandations retenues). Lots 1 et 2 implémentés le 2026-11-12. Correctif serveur ajouté au lot 2 : `POST /cyberpunk/characters/:id/send-item` diffuse la fiche (B-BROADCAST), la vue MJ n'a plus à la recharger.

---

## 1. Décisions (2026-11-12)

| # | Décision |
|---|---|
| D-1 | Pas de `TabSession` générique : le commun est mince (une trentaine de lignes), la disposition et le contenu varient trop d'un slug à l'autre. |
| D-2 | Pas de brique pour l'écran « Aucune table active ». |
| D-3 | L'envoi d'objet par le MJ est détaché de ce chantier (item à part du backlog). |
| D-4 | Migration des 11 slugs concernés (Noctis hors périmètre), en deux lots. |
| D-5 | Le hook n'expose qu'un enregistrement partiel avec retour arrière ; PUT complet, mode Édition et stats dérivées restent au slug. |
| D-6 | La brique des outils de table garde toute la personnalisation de chaque outil (libellé, icône, classes), même si aucun slug ne s'en sert aujourd'hui. |

---

## 2. Constat

Chargement et suivi des fiches de la table côté MJ, relevés le 2026-11-12 :

| Groupe | Slugs | Façon de faire | Défauts |
|---|---|---|---|
| A | Dune, Maledictum, Nimble, Vileborn, Vampire | Hook `useTableCharacters` recopié dans chaque slug (copies identiques) | Pas de retour arrière si l'envoi échoue ; commentaires périmés sur `fetchWithAuth` |
| B | Fabula, Vikings, Zone Blanche | Même logique écrite dans le `TabSession` (`characterUpdates`) | Rechargement sur l'id et le nombre de personnages seulement ; Fabula sans annulation au changement de table |
| C | Achtung, Cyberpunk, Tecumah | Écoute directe de `character-full-update` dans le `TabSession` | Écart à F-SOCK-LISTEN (dette du backlog) ; Cyberpunk et Tecumah écoutent aussi `character-update`, que seul Noctis émet (écouteur mort) ; pas d'annulation |
| D | Delta Green | Chargement seul | **Aucun temps réel** : ce que change un joueur n'apparaît chez le MJ qu'au rechargement |

Outils de table : `AudioSessionToggle` et `BoardSessionToggle` sont posés ensemble dans les 12 slugs, avec les mêmes classes ; seuls les placements varient (marges, `ml-auto` de Tecumah). Chaque nouvelle brique de ce genre oblige à toucher les 12 `TabSession`.

Serveur : `PUT /characters/:id` et `PATCH /characters/:id` font exactement la même chose (écriture des seuls champs fournis, puis diffusion `character-full-update`). Les routes d'ajout de Dune (`/items`, `/talents`) diffusent aussi.

---

## 3. Le hook `useTableCharacters`

Fichier : `features/table/hooks/useTableCharacters.js`.

```js
const { characters, order, loading, patchCharacter } = useTableCharacters(activeSession, characterUpdates);
```

| Élément | Contrat |
|---|---|
| `activeSession` | Table active telle que donnée par `GMPage` (`{ id, characters: [{ id, … }] }` ou `null`). |
| `characterUpdates` | Mises à jour en direct données par `GMPage` (`useGMSession`) ; le slug les transmet de son `GMApp` à qui appelle le hook. |
| `characters` | `{ [id]: fiche complète }` des personnages de la table. |
| `order` | Ids dans l'ordre de la table, limités aux fiches chargées. |
| `loading` | Vrai pendant le chargement des fiches. |
| `patchCharacter(id, champs)` | Envoi partiel (`PATCH`) : affichage immédiat, puis la fiche renvoyée par le serveur remplace la locale. **En cas d'échec, la fiche revient à son état d'avant.** Renvoie la fiche enregistrée, ou `null`. |

Comportement :
- les fiches se rechargent à chaque changement de la table active (autre table, composition modifiée), avec annulation du chargement en cours ;
- une mise à jour en direct ne touche que les personnages de la table ;
- aucune écoute de socket : tout passe par `characterUpdates`.

La fusion des mises à jour en direct est une fonction pure, `mergeCharacterUpdates(fiches, mises à jour)`, dans `features/table/tools/tableCharacters.js`, testée (`tests/features/table/tools/tableCharacters.test.js`) : fiche complète qui remplace, mise à jour partielle qui fusionne, personnage hors table ignoré, rien à changer qui renvoie le même objet.

Reste au slug :
- la sélection du personnage affiché (avec `order[0]` par défaut) ;
- le mode Édition et son brouillon ;
- le recalcul des stats dérivées (Fabula, Vikings) : le slug calcule la fiche puis la passe à `patchCharacter` ;
- les données propres au slug (PF dépensés de Fabula, ressources de session, manœuvres de Cyberpunk…) ;
- l'endroit où appeler le hook : dans `GMApp` si plusieurs onglets ont besoin des fiches, sinon dans le `TabSession`.

---

## 4. La brique `TableSessionTools`

Fichier : `features/table/TableSessionTools.jsx`. Elle pose les outils de table dans un ordre fixe (musique, puis tableau, puis les suivants), **sans conteneur** : elle rend un fragment, le slug garde la disposition (colonne, ligne, espacement).

```jsx
<TableSessionTools sessionId={activeSession.id} className="vtt-btn vtt-btn-sm w-full" />

<TableSessionTools sessionId={activeSession.id} className="vk-btn vk-btn-sm"
                   audio={{ icon: <VkIcon name="horn" />, label: on => (on ? 'Musique' : 'Sonner le cor') }}
                   board={{ className: 'vk-btn vk-btn-sm ml-2' }} />
```

| Prop | Contrat |
|---|---|
| `sessionId` | Table active. |
| `className?` | Classes communes à tous les boutons (défaut : celui de chaque outil, `vtt-btn vtt-btn-sm`). |
| `audio?` | `{ label?, icon?, className? }` : personnalisation de la musique, mêmes props que `AudioSessionToggle` ; son `className` remplace le commun. `false` : pas de musique pour ce slug. |
| `board?` | Idem pour le tableau (`BoardSessionToggle`). `false` : pas de tableau. |

Un nouvel outil de table s'ajoute dans la brique avec sa prop de personnalisation, et apparaît dans tous les slugs sans les toucher. `AudioSessionToggle` et `BoardSessionToggle` restent utilisables seuls.

---

## 5. Lots

| Lot | Contenu | Vérification |
|---|---|---|
| 1 | Hook, fonction pure et son test, brique `TableSessionTools` ; le groupe A passe au hook (copies supprimées ; `addRow` de Dune réduit au POST, la diffusion du serveur fait le reste) ; `TableSessionTools` posé dans les 12 slugs à la place des deux bascules | lint, tests, build ; à l'écran : un slug par groupe |
| 2 | Groupes B, C, D passent au hook : chargement et temps réel inline supprimés, écouteurs de socket retirés (Achtung, Cyberpunk, Tecumah), `characterUpdates` transmis par `GMApp` (et par le `GMView` de Delta Green et Tecumah, sans toucher à leur structure) ; leurs enregistrements passent par `patchCharacter` | lint, tests, build ; à l'écran : les 7 slugs, avec une modification côté joueur qui doit apparaître chez le MJ |

Un seul commit pour le chantier (bloc Général), après les deux lots.

---

## 6. Documentation touchée

- `src/client/CLAUDE.md` : contrats du hook et de `TableSessionTools` ; le slug pose `TableSessionTools` dans son `TabSession`.
- `code-rules/front.md` : `TableSessionTools` ajouté à F-BRICKS.
- `process/guide_new_slug.md` et la commande `/new-slug` : `TabSession` avec `TableSessionTools` et `useTableCharacters`.
- `backlog.md` : item « session MJ générique » et dette `character-full-update` sortis à la release (dette réglée, Noctis excepté).

---

## 7. Questions

| # | Question | Recommandation | Réponse |
|---|---|---|---|
| Q-1 | Forme de la personnalisation par outil : un objet par outil (`audio={{ label, icon, className }}`) ou des props à plat (`audioLabel`, `audioIcon`, `boardClassName`…) ? | Un objet par outil : il reprend tel quel le contrat de la bascule, et un nouvel outil n'ajoute qu'une prop. | |
| Q-2 | Delta Green gagne le temps réel (une modification du joueur s'affiche aussitôt chez le MJ) : c'est un changement visible à sa table. | Oui : c'est le comportement de tous les autres slugs, l'absence est un défaut. | |
