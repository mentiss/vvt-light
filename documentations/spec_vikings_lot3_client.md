# Refonte Vikings — Lot 3 : structure client et interface MJ

## Statut

**Validée par le MJ le 2026-10-17** (L3-1 à L3-7, §1 et §12). **3a implémenté le 2026-10-17** (écarts en §14) ; 3b à venir.

Spec fonctionnelle de référence : `documentations/spec_vikings.md` (§8 écrans joueur, §8.1 runes, §8.2 pratique du combat, §9 interface MJ, décisions D-, Q-, C-). Lot précédent : `documentations/spec_vikings_lot2_serveur.md` (serveur, base, données et règles dans le slug).

Objectif : donner au slug `vikings` la structure client des slugs récents (référence : `zoneblanche`, `fabula`), une interface MJ conforme au contrat standard, et les règles Pure Saga encore absentes de l'interface.

Hors périmètre :
- **refonte graphique** (lot 4) : les nouveaux composants utilisent les tokens génériques (`bg-surface`, `text-default`, `border-default`…) et gardent l'aspect actuel ; aucun asset du UI kit n'est intégré ici ;
- **système de combat** (§7 de la spec) : déplacé tel quel, sans changement de comportement ;
- défauts propres à l'inventaire (`setAlertMessage`, `useState` dans `renderSection`) : lot 5 ;
- schéma de base : seul ajout, les trois colonnes d'ajustement des valeurs de combat (§6.1, §9).

---

## 1. Décisions du diagnostic (validées le 2026-10-17)

| # | Sujet | Décision |
|---|---|---|
| L3-1 | Gain de SAGA quand la réserve est déjà à 5 | Seul le gain **réellement reçu** (plafond 5) compte dans la SAGA totale. |
| L3-2 | « SAGA +N » d'un trait | Appliqué à la **création** et à l'**évolution** (nouveau trait), **pas** en mode édition (correction). |
| L3-3 | Fonctions MJ de table | Une modale « Actions de table » : choix des personnages, puis attribuer +N SAGA, fin d'arc (points de compétence restaurés), repos (fatigue −N, blessures −N, raccourci « remettre à 0 »). |
| L3-4 | « Supprimer ce personnage » côté joueur | **Retiré** (la route exige le MJ, l'action échouait en 403). |
| L3-5 | Livraison | Une spec, **deux commits** : 3a structure, 3b règles et fonctions Pure Saga (§11). |

---

## 2. Défauts corrigés par le lot

| # | Défaut | Correction |
|---|---|---|
| B-1 | `DiceModal` enchaîne plusieurs mises à jour à partir du même personnage périmé : en assurance/héroïque **avec** succès auto, la SAGA n'est jamais dépensée ; la « restitution » après un jet SAGA réussi annule aussi la dépense des points de compétence. | Mises à jour **fonctionnelles** (`prev => next`) et calcul unique des effets du jet (§7). |
| B-2 | `Experience.jsx` augmente la SAGA totale quand on dépense (contraire à D-10). | La dépense ne touche plus la SAGA totale. |
| B-3 | Le menu joueur propose une suppression qui échoue (403) et déconnecte quand même. | Entrée et modale retirées (L3-4). |
| B-4 | `CombatPanel` reçoit `activeGMSession?.id` alors que `activeGMSession` est déjà un identifiant → toujours `null`. | Passer `activeGMSession`. Seule retouche au point d'entrée du combat. |
| B-5 | `usePlayerSession` écoute `character-light-update`, que plus aucun serveur n'émet (supprimé au lot 2). | Listener et callback associé retirés (§8). |
| B-6 | Jauge de fatigue plafonnée à 9 (fiche, carte MJ, sélecteur MJ « /9 »), étiquette « Épuisé » à 9. | Jauge 0–10, paliers et KO de `rules.js` (D-2). |
| B-7 | `TabSession` MJ écoute lui-même `character-full-update` / `character-update`. | Supprimé : le temps réel passe par `characterUpdates` (règle client). |
| B-8 | Valeurs de combat incohérentes : la création n'applique **aucun** effet de trait (Bons réflexes, Peau dure…) ; le mode édition les applique à l'ajout mais pas au retrait ; l'inventaire **écrase** `armure` avec la somme de l'équipement, effaçant l'armure naturelle des traits. De plus, trois effets **conditionnels** sont comptés en permanence : *Marin* et *Sens de l'orientation* (Action +1 « en mer »), *Insaisissable* (Seuil +1 « si armure légère/nulle, contre CàC »). | Valeurs dérivées recalculées, effets conditionnels sortis du calcul, ajustement éditable (L3-6, §6.1). |

---

## 3. Structure cible des fichiers (`src/client/src/systems/vikings/`)

| Fichier | Statut | Rôle |
|---|---|---|
| `Sheet.jsx` | réécrit (enveloppe) | Bandeau, onglets, menu, modales. Le corps de fiche vient de `SheetLayout`. |
| `GMApp.jsx` | réécrit | Interface MJ complète (bandeau, onglets, modales globales), sans indirection. |
| `components/layout/SheetLayout.jsx` | nouveau | Corps de fiche, **partagé à l'identique** entre joueur et MJ. |
| `components/layout/*Section.jsx` | nouveaux | Sections de la fiche (§3.1). Découpage par section, comme Zone Blanche. |
| `components/layout/VikingsHistoryEntry.jsx` | nouveau | Rendu d'un jet dans l'historique et les toasts. |
| `components/tabs/InventoryTab.jsx` | déplacé depuis `gm/tabs/` | Onglet inventaire (utilisé par le joueur, mal rangé). Contenu inchangé hors B-8. |
| `components/tabs/RunesTab.jsx` | supprimé | Remplacé par la section Runes (§3.1). |
| `gm/tabs/TabSession.jsx` | réécrit | Liste des personnages + fiche complète (§5.2). |
| `gm/tabs/TabCombat.jsx` | conservé | Inchangé. |
| `gm/useCombat.js` | nouveau | État et handlers de combat **déplacés tels quels** depuis `GMView.jsx`. |
| `gm/modals/TableActionsModal.jsx` | nouveau | Actions de table Pure Saga (§5.3). |
| `gm/modals/GMDiceModal.jsx`, `GMSendItemModal.jsx` | conservés | Jet MJ existant, envoi d'objet. |
| `gm/GMView.jsx`, `gm/layout/GMHeader.jsx`, `gm/pj/GMCharacterCard.jsx`, `gm/layout/TokenRow.jsx`, `gm/layout/CollapsibleSection.jsx` | supprimés | Remplacés par `GMApp`, `TabSession` et `SheetLayout` (à confirmer à l'implémentation : suppression seulement si plus aucun import). |
| `config/rules.js` | complété | Fonctions pures de §6. |
| `components/modals/ExperienceModal.jsx` | déplacé depuis `Experience.jsx` (3a) | Modale d'évolution, rangée avec les autres modales ; coûts lus dans `XP_COSTS` ; un nouveau trait doit remplir ses conditions et ne pas être incompatible (D-12). |
| `Creation.jsx`, `components/modals/ExperienceModal.jsx`, `components/modals/EditModals.jsx`, `DiceModal.jsx` | patchés | §6 et §7. |

### 3.1 `SheetLayout` — sections, dans cet ordre

1. **Identité** : avatar, « Prénom "Surnom" fils/fille de Nom », joueur, sexe, âge, taille, poids, activité ; champs éditables en mode édition.
2. **Caractéristiques** : niveau 1–5, explosion ; clic → modale de jet.
3. **Compétences** : niveau, carac utilisée, seuil, explosion, points (succès auto) restants ; clic → modale de jet ; « Récup » / « Récup tous » toujours actifs ; ajout/retrait/niveaux en édition.
4. **SAGA et état** : SAGA actuelle (stepper 0–5), SAGA totale (lecture ; éditable en mode édition pour corriger), blessures 0–5, fatigue 0–10 avec palier courant (« En nage, +1 succès requis »…), étiquettes KO.
5. **Traits et backgrounds** : nom, description, effets ; ajout/retrait en édition.
6. **Pratique du combat** (§8.2) : armure totale et bouclier(s), actions par tour, seuil de combat, puis **une ligne de posture passive par compétence de combat au contact** (§6.2).
7. **Runes** (§8.1), affichée seulement si le personnage a un livre de sort ou au moins une rune : runes connues (symbole, nom, niveau, sens ésotérique, capacité du niveau), rappel « la rune est une permission, le jet se fait sur une compétence pratique », points disponibles, Futhark complet repliable ; niveaux modifiables en mode édition.

Contrat de props (identique joueur / MJ) :

| Prop | Rôle |
|---|---|
| `char` | personnage affiché (buffer d'édition en mode édition) |
| `editMode` | bool |
| `set(field, value)` | modification du buffer d'édition |
| `update(updater)` | action de jeu immédiate (jauges, SAGA, récupération) ; `updater` = `prev => next` |
| `onRoll(ctx)` | ouvre la modale de jet préremplie (`{ type: 'carac' | 'skill', data }`) |
| `onAvatarClick()` | ouvre l'upload d'avatar |
| `onOpenEditModal(type)` | ouvre `EditModals` (ajout de compétence / trait) |

Les actions de jeu restent actives hors mode édition (règle client).

---

## 4. Interface joueur (`Sheet.jsx`)

- **Onglets** : Fiche · Inventaire · Journal (badge non lus) · Historique. Les onglets « Lanceur de dés » et « Runes » disparaissent ; un ancien hash (`#dice`, `#runes`) retombe sur Fiche.
- **Historique** : `DiceHistoryPage` avec `VikingsHistoryEntry` ; le `HistoryPanel` et le bouton flottant 📜 sont retirés.
- **Menu** (aligné sur Zone Blanche) : Créer un personnage · Changer de personnage · Changer l'avatar · Code d'accès (`AccessCodeModal`) · Jet de dés libre (`FreeDiceModal`) · Config animations dés · Interface MJ · Déconnexion.
- Le bandeau garde le titre runique et le nom ; le code et le bouton « Copier lien » passent dans la modale Code d'accès.
- Nom de la session : `activeSessionName` de `useSession` (plus de requête propre à la fiche).
- `SessionPlayersBar`, `ToastNotifications` (avec `renderDiceToast` → `VikingsHistoryEntry` compact) et le `CombatPanel` sous la fiche sont conservés.
- Boutons « Soigner » / « Repos » du mode édition : conservés.

---

## 5. Interface MJ

### 5.1 `GMApp.jsx`
- **Onglets** : Session (par défaut) · Combat · Journal · Historique ; hash conservé.
- **Bandeau** : titre, table active, jet libre (`FreeDiceModal`, `isGM`), jet MJ existant (`GMDiceModal`), actions de table, thème, menu (gestion des tables, config dés, accueil, déconnexion).
- **Historique** : `DiceHistoryPage` + `VikingsHistoryEntry`. **Toasts** : `VikingsHistoryEntry` compact.
- **Combat** : `useCombat()` fournit à `TabCombat` exactement les props passées aujourd'hui par `GMView`.

### 5.2 `gm/tabs/TabSession.jsx` (contrat MJ standard, §9.1)
- **Liste** des personnages de la table : avatar, nom, joueur, présence en ligne, blessures / fatigue (`x/5`, `x/10`).
- **Fiche complète** du personnage sélectionné via `SheetLayout`, avec bascule **Fiche / Inventaire** (même `InventoryTab` que le joueur).
- Barre d'actions : Note (`GMSendModal` avec ses props réelles : `onClose`, `onSend`, `sessionCharacters`, `preSelectedCharId`), Objet (`GMSendItemModal`), Copier lien + code, Éditer / Annuler / Enregistrer.
- Jet **pour le personnage** depuis sa fiche : la même `DiceModal` que le joueur, sur la session active.
- Avatar : `AvatarUploader`.
- Écritures : `PUT` à l'enregistrement du mode édition ; `update(updater)` applique l'updater au dernier état connu et envoie un `PUT` complet (comme `patchImmediate` de Fabula, avec recalcul des valeurs dérivées, §6.1).
- Temps réel : uniquement `characterUpdates` (B-7).

### 5.3 `TableActionsModal` (§9.3, L3-3)
- Sélection des personnages : pastilles, « toute la table » par défaut ou personnage sélectionné.
- **Attribuer de la SAGA** : +N (stepper) ; plafond 5 ; SAGA totale augmentée du gain réellement reçu (L3-1).
- **Fin d'arc** : points de compétence restaurés (`currentPoints = level`) pour chaque compétence.
- **Repos** : fatigue −N, blessures −N (steppers, plancher 0), raccourci « remettre à 0 ».
- Une écriture par personnage : `PATCH /api/vikings/characters/:id` avec les seuls champs modifiés (route du lot 2), calculés depuis l'état chargé côté MJ. Pas de nouvelle route.

### 5.4 Signalement du triple 10 (D-15)
Visible dans l'historique et les toasts (« Triple 10 — +1 SAGA », ou « Triple 10 — SAGA déjà au maximum »). Le gain est appliqué par la modale de jet (§7).

---

## 6. Règles ajoutées à `config/rules.js` (fonctions pures, testées)

### 6.1 Valeurs dérivées — `getCombatValues(character)` (L3-6)
- **actions** = 1 + Σ `effects.actions` des traits + `actionsMod` ;
- **seuil** = 1 + Σ `effects.seuil` des traits + `seuilMod` ;
- **armure naturelle** = Σ `effects.armure` des traits ;
- **armure équipée** = Σ `armorValue` des objets `armor` équipés **hors boucliers** ;
- **boucliers** = objets `armor` équipés dont le nom commence par « Bouclier » (pas de colonne dédiée) ;
- **armure totale** (affichée) = naturelle + équipée + `armureMod` ; boucliers affichés à part.

Avant chaque écriture (joueur et MJ), les colonnes `actionsDisponibles`, `seuilCombat` et `armure` sont recalculées. `armure` = armure totale **+ boucliers**, comme aujourd'hui, pour que le système de combat garde son comportement. Les anciennes incrémentations (création, édition, évolution, inventaire) sont supprimées.

**Effets conditionnels** (vérifié sur les 65 traits) : aucune armure de trait n'est conditionnelle (*Peau dure*, *Sang de troll*, *Survivant miraculeux* : armure naturelle +1 sans condition ; l'armure +2 de la transe *Berserk* relève du système de combat). Trois effets d'**action** ou de **seuil** le sont : *Marin* et *Sens de l'orientation* (Action +1 en mer), *Insaisissable* (Seuil +1 si armure légère/nulle, contre CàC). Ils sont **retirés du calcul automatique** (leur valeur chiffrée est retirée des données, la condition reste dans la description du trait) ; quand la situation s'applique, on passe par l'ajustement.

**Ajustement** (`armureMod`, `actionsMod`, `seuilMod`, entiers positifs ou négatifs, 0 par défaut) : champ **masqué en lecture** (seul le total est affiché), **éditable en mode édition** (stepper −/+) sous chaque valeur de la section Pratique du combat. Sert aux effets conditionnels, aux objets ou situations particulières (blessure, objet runique…). Modifiable par le joueur comme par le MJ.

### 6.2 Posture passive — `getPassivePostures(character)`
Une ligne par compétence `Combat CàC (armé)` (chaque spécialisation) et `Combat CàC (non armé)` : bonus = `min(3, floor(niveau / 2))`, seuil de défense = seuil + bonus. Libellés « Parade (arme) » / « Esquive ». Rappel affiché : nécessite 1 action disponible. Traits non comptés (C-2).

### 6.3 Runes — `getRunePoints(character)`
Livre de sort = Σ `effects.runePoints` des traits ; répartis = Σ niveaux des runes ; disponibles = livre − répartis. Capacité par niveau (0 à 5) : table de §3.6 de la spec, ajoutée à `config/runes.js`.

### 6.4 SAGA — `gainSaga(character, n)`
Renvoie `{ sagaActuelle, sagaTotale }` : `sagaActuelle = min(5, actuelle + n)`, `sagaTotale += gain réellement reçu` (L3-1). Utilisée par le triple 10, l'attribution MJ et les traits « SAGA +N ».

### 6.5 Prise d'un trait — « SAGA +N » (D-9, L3-2)
À la **création** (somme des `effects.sagaBonus` des traits choisis, appliquée à la SAGA de départ 1) et à l'**évolution** (nouveau trait), via `gainSaga`. Pas en mode édition.

### 6.6 Effets d'un jet — `applyRollOutcome(character, outcome)`
`outcome = { sagaSpent, sagaRestored, skill, skillPointsSpent, tripleTen }` → personnage mis à jour : dépense SAGA, restitution après jet héroïque/épique réussi (pas un gain, D-10), dépense des points de compétence, puis +1 SAGA si triple 10 (via `gainSaga`).

---

## 7. Modale de jet (`DiceModal`)

- `onUpdate` reçoit un **updater** (`prev => next`) : `onCharacterUpdate` de `PlayerPage` l'accepte déjà ; côté MJ, `update` de `TabSession` (§5.2).
- Dépense optimiste avant le jet (SAGA, points de compétence) en **une** mise à jour ; après le jet, **une** mise à jour avec `applyRollOutcome` (restitution, triple 10) ; en cas d'erreur de validation, annulation de la dépense par updater inverse (B-1).
- **Viser** (C-5) : stepper « Actions de visée » (0+, sans limite imposée) ; +1 succès auto par action, sans coût en points de compétence. Transmis à `afterRoll` (`systemData.aimBonus`), compté dans le total **et** dans la barre d'entrée du jet héroïque (D-5), affiché dans le détail du résultat et de l'historique.
- Résultat : bandeau « Triple 10 ! +1 SAGA » quand `meta.tripleTen`.
- `meta` enregistré dans l'historique : `tripleTen`, `sagaGained` (0 ou 1), `aimBonus`.

---

## 8. Fichiers plateforme touchés

| Fichier | Modification |
|---|---|
| `hooks/usePlayerSession.js` | Retrait du listener `character-light-update` et du paramètre `onCharacterHasUpdated` (B-5). |
| `pages/PlayerPage.jsx` | Retrait de `handleCharacterHasUpdated` (plus utilisé). |

Aucun autre fichier générique n'est modifié. `cyberpunk/Sheet.jsx` écoute aussi `character-light-update` en direct (listener mort) : signalé, non traité (§13).

---

## 9. Données, routes et sockets

- **Base** : trois colonnes ajoutées à `characters` — `armure_mod`, `actions_mod`, `seuil_mod` (`INTEGER NOT NULL DEFAULT 0`) — dans `database-template/vikings-schema.sql` **et** dans une migration `database-template/migrations/DDMMYYYY_vikings_combat_mods.sql` (`ALTER TABLE … ADD COLUMN`, pas de reconstruction de table). Côté serveur : `FLAT_COLUMNS` et `loadFullCharacter` du `CharacterController` (`armureMod`, `actionsMod`, `seuilMod`). Valeur initiale 0 pour les personnages existants (L3-7).
- **Routes** : celles du lot 2 (`GET`/`PUT`/`PATCH /characters/:id`, `POST /:id/avatar`, routes génériques `dice`, `journal`, `sessions`). Aucune nouvelle route.
- **Sockets** : aucun nouvel événement. Chaque écriture diffuse `character-full-update` aux rooms des sessions du personnage (lot 2) ; le MJ le reçoit via `useGMSession` → `characterUpdates`, le joueur via `usePlayerSession` (rechargement).
- **Historique** : `roll_result` porte déjà `meta` ; `VikingsHistoryEntry` lit `meta.tripleTen`, `meta.sagaGained`, `detail`. Les jets à l'ancien format (R-5) sont réduits à une ligne minimale (nom, libellé, succès si disponibles).

---

## 10. Tests (`src/client/tests/systems/vikings/`)

Principe (demande du MJ) : un test seulement quand il protège une **règle de calcul** ou un **défaut corrigé** ; pas de test sur les dictionnaires et données de configuration. En conséquence, `tests/systems/vikings/data.test.js` (cohérence des données) est **supprimé** en 3a.

Ajouts dans `rules.test.js` :
- `getCombatValues` : traits + équipement + ajustement (Bons réflexes → 2 actions ; Peau dure + Broigne équipée → armure 2 ; bouclier à part, mais compté dans la colonne `armure` ; objet en sac ignoré ; ajustement négatif) — protège B-8 ;
- `getPassivePostures` : barème `min(3, floor(niveau/2))`, une ligne par spécialisation ;
- `gainSaga` : plafond 5 et SAGA totale limitée au gain reçu (L3-1) ;
- `applyRollOutcome` : assurance + succès auto → SAGA **et** points dépensés (régression B-1) ; héroïque réussi → SAGA inchangée, totale inchangée ; triple 10 à 5 SAGA → aucun gain.

Ajout dans `dice.test.js` : visée comptée dans le total et dans la barre d'entrée du jet héroïque.

Pas de test pour `getRunePoints` (simple somme) ni pour les composants.

---

## 11. Livraison

**3a — structure** : §3 (hors runes et pratique du combat), §4, §5.1, §5.2, §8, B-1 à B-7, `VikingsHistoryEntry` (sans signalement du triple 10). Fiche identique à l'actuelle en contenu.

**3b — règles et fonctions Pure Saga** : sections Pratique du combat et Runes, §5.3, §5.4, §6, §7 (viser, triple 10), B-8 (avec la migration des colonnes d'ajustement, à jouer sur DEV puis en PROD comme au lot 2).

Avant chaque commit : `npm run lint`, `npm test`, `npm run build` (depuis `src/client`). Pas de test navigateur de mon côté : liste de vérifications fournie au MJ à la fin de chaque sous-lot.

---

## 12. Questions

| # | Question | Proposition | Réponse MJ |
|---|---|---|---|
| L3-6 | Valeurs de combat (B-8) : les **recalculer** depuis les traits et l'équipement à chaque écriture, ou garder les valeurs **stockées** et seulement corriger les incrémentations ? | **Recalculer** (§6.1) : une seule règle, testée, qui corrige aussi les personnages existants à leur prochaine écriture. | Recalcul, avec un champ d'ajustement bonus/malus (positif ou négatif), masqué en lecture et éditable en mode édition, pris en compte dans le calcul automatique. |
| L3-7 | Valeur initiale de l'ajustement pour les personnages existants | **0** : les valeurs stockées aujourd'hui sont faussées (B-8) et n'étaient éditables nulle part ; après migration, le MJ vérifie les fiches et ajuste au besoin. Alternative écartée : initialiser l'ajustement à « valeur stockée − valeur recalculée », qui conserverait les erreurs. | 0 |

---

## 13. Signalé, hors périmètre

- `fabula/gm/tabs/TabSession.jsx` **et `zoneblanche/gm/tabs/TabSession.jsx`** passent à `GMSendModal` des props inexistantes (`isOpen`, `preSelectedCharacterId`, `sessionId`, `characters`) et pas `onSend` : l'envoi d'une note MJ y est probablement cassé.
- `DiceModal` Vikings, vue résultat en **assurance** : quand le 2e jet est retenu, le 1er jet est affiché deux fois (dés lus au mauvais endroit). L'historique (`VikingsHistoryEntry`) affiche correctement le jet retenu. À corriger au lot 5.
- `cyberpunk/Sheet.jsx` écoute `character-light-update`, jamais émis.
- Combat (§7 de la spec) : Berserk, pool d'attaque des PNJ, initiative — inchangés.

---

## 14. Écarts d'implémentation (3a, 2026-10-17)

- **Onglet Runes conservé** jusqu'à 3b : la section Runes de la fiche arrive en 3b, retirer l'onglet en 3a aurait rendu les runes inaccessibles entre les deux commits.
- **Code et « Copier lien » restent dans le bandeau joueur** : `AccessCodeModal` ne copie que le code, pas le lien.
- **Enregistrement du mode édition** : seuls les champs édités (`SHEET_EDITABLE_FIELDS` de `config/utils.js`) sont reportés sur la fiche à jour. Les actions de jeu faites pendant l'édition (inventaire, jauges, jets, avatar) ne sont donc plus écrasées par le buffer.
- **Modale d'évolution** (demande du MJ) : `Experience.jsx` → `components/modals/ExperienceModal.jsx`. Coûts affichés et contrôlés depuis `XP_COSTS` (ils étaient écrits en dur) ; la liste des nouveaux traits applique désormais conditions et incompatibilités (raison affichée), comme la création. Constat pour 3b : les évolutions de runes (`rune`, `newRune`) existent dans la logique mais n'ont aucun bouton.
- **Défaut supplémentaire corrigé (B-9)** : `AddSkillModal` (`EditModals`) remettait l'erreur à `null` à chaque rendu ; ses messages (spécialisation manquante, doublon) ne s'affichaient jamais.
- `config.jsx` : `renderHistoryEntry` renvoie `VikingsHistoryEntry` ; les jets libres gardent le rendu générique de la plateforme.
- B-5 vérifié : aucun code serveur ni client n'émet `character-light-update` ; `PlayerPage` est le seul appelant de `usePlayerSession`.