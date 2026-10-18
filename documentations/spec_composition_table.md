# Composition d'une table en temps réel

## Statut

**Validée par le MJ le 2026-10-18** (option complète retenue au diagnostic). Implémentée le 2026-10-18.

Brique de plateforme, tous les slugs : ajout et retrait d'un personnage à une table (`TableCharactersModal`, générique).

Hors périmètre : plusieurs tables actives sur un même slug, remplacement d'un personnage par un autre sans changement du nombre de personnages (voir §5).

---

## 1. Constat

Quand le MJ ajoute ou retire un personnage d'une table, rien n'est diffusé : il faut recharger la page.

| Où | Défaut | Cause |
|---|---|---|
| Interface MJ (onglet Session de chaque slug) | Le personnage ajouté n'apparaît pas | La modale ne recharge que sa liste de tables ; la table active (`useGMSession`) n'est pas mise à jour. Les onglets Session lisent `activeSession.characters`. |
| Barre des joueurs déjà à la table | Le nouveau venu n'apparaît pas | `SessionPlayersBar` ne charge la composition qu'à l'ouverture. |
| Joueur ajouté (ou retiré) | Sa fiche ignore son entrée (ou sa sortie) : pas de barre, pas de session active | Ses tables ne sont chargées qu'au chargement de la fiche (`usePlayerSession`). |

---

## 2. Comportement attendu

Après un ajout ou un retrait par le MJ, sans recharger :

- l'onglet Session du MJ montre la nouvelle composition si la table modifiée est sa table active ;
- la barre des joueurs déjà à la table ajoute ou retire le personnage ;
- le joueur ajouté rejoint la table si elle est active : sa barre apparaît ; le joueur retiré la quitte : sa barre disparaît.

---

## 3. Événements socket

Émis par le serveur dans les routes `POST` et `DELETE /api/:slug/sessions/:sessionId/characters/:characterId`, après l'écriture en base.

| Événement | Destinataires | Charge | Effet |
|---|---|---|---|
| `session-characters-update` | Room de la table `${slug}_session_${sessionId}` (MJ si la table est active, joueurs déjà présents) | `{ system, sessionId, session }`, `session` au même format que `GET /sessions/:id` | MJ : remplace sa table active si c'est la même ; barre : remplace sa liste de personnages |
| `character-sessions-changed` | Le personnage ajouté ou retiré, s'il est en ligne sur ce slug (socket retrouvé par la présence `onlineCharacters`) | `{ system, characterId }` | La fiche recharge les tables du personnage ; la logique existante de `SessionContext` le fait rejoindre ou quitter la table active |

Pas d'émission globale (`io.emit`) : la room pour la table, le socket du personnage pour lui seul.

---

## 4. Impact

| Fichier | Changement |
|---|---|
| `src/server/routes/sessions.js` | Émission des deux événements après l'ajout et le retrait |
| `src/client/src/hooks/useGMSession.js` | Écoute de `session-characters-update` (table active) |
| `src/client/src/components/layout/SessionPlayersBar.jsx` | Écoute de `session-characters-update` (sa table) |
| `src/client/src/hooks/usePlayerSession.js` | Écoute de `character-sessions-changed` (rechargement des tables du personnage) |
| `src/client/src/context/SessionContext.jsx` | Distinction « tables pas encore chargées » / « aucune table » : un joueur retiré de sa seule table quitte bien la table active (constaté à l'implémentation) |

Aucun changement de base de données. Aucun slug modifié : les onglets Session suivent `activeSession.characters`, déjà mis à jour par `useGMSession`.

---

## 5. Limite connue

Les onglets Session des slugs rechargent leurs fiches quand le **nombre** de personnages change (dépendance sur `activeSession.characters.length`). Retirer un personnage puis en ajouter un autre fait deux changements successifs, donc fonctionne ; seul un remplacement atomique (inexistant aujourd'hui) passerait inaperçu.
