# Stockage navigateur de la plateforme

## Statut

**Validée par le MJ le 2026-11-01** (décisions P-1 à P-6, N-1, N-2 au §1 ; reprise au démarrage au §5). **Implémentée le 2026-11-01**, vérification en dev par le MJ en attente (§9). La brique audio y passera avec `FloatingPanel`.

Brique de plateforme : concerne tous les slugs et la plateforme (accueil, pages outils).

Objectif : un seul point d'accès à ce que l'application garde dans le navigateur (`localStorage`) — réglages, état d'interface, état de travail du MJ — avec des clés nommées de la même façon partout, des valeurs regroupées par fonction, une version, la reprise des anciennes clés et la mise à jour entre composants et entre onglets. Les composants ne touchent plus jamais `localStorage` directement.

Origine : relecture du code de la brique audio par le MJ (`spec_audio.md` §11.16), qui a mis au jour l'absence de système commun.

Hors périmètre :
- les données des bases (serveur) ;
- la synchronisation des réglages avec un compte joueur (refonte de la plateforme) : elle viendra au-dessus de cette brique, qui restera le stockage local ;
- l'action « Réinitialiser mes réglages » (P-6) : plus tard ; le préfixe des clés la rend triviale.

---

## 1. Décisions (phase 1, 2026-10-31)

| # | Sujet | Décision |
|---|---|---|
| P-1 | Regroupement | Un objet par **fonction** et par **portée** : ni une clé par réglage, ni un objet unique pour toute l'application (chaque écriture réécrirait tout ; deux onglets s'écraseraient). |
| P-2 | Clés | `vtt:<portée>:<fonction>`. Portées : `platform` (tout le navigateur), `<slug>` (un jeu), `<slug>:<table>` (une table d'un jeu). |
| P-3 | Clés existantes | Reprises maintenant (thème, dés, barre de session, table active), avec reprise automatique des anciennes valeurs, dans un chantier « Général » à part. |
| P-4 | Défauts trouvés | Corrigés au passage : suppression d'une mauvaise clé dans `TableManagementModal`, clé morte `currentCharacterId_<slug>` retirée. |
| P-5 | Onglets | Synchronisation entre onglets du même navigateur. |
| P-6 | Réinitialisation | Plus tard. |
| N-1 | Nommage | `tools/browserStorage.js` (dit où c'est rangé : ce navigateur, pas le serveur, pas les autres appareils) et `hooks/usePersistedState.js` (dit l'usage : un `useState` qui survit au rechargement). Pas « preferences » : on y range aussi de l'état d'interface et de travail. |
| N-2 | Portée réservée | **Aucun slug ne peut s'appeler `platform`** (ses clés se mêleraient à celles de la plateforme). Déjà vrai pour les dés, désormais écrit et contrôlé (§7). |

---

## 2. Constat (inventaire du 2026-10-31)

| Clé actuelle | Contenu | Où | Remarque |
|---|---|---|---|
| `vtt_theme_global` | Thème de l'accueil | `tools/utils.js` (`saveTheme`, `loadTheme`) | Sans protection d'erreur |
| `vtt_theme_<slug>` | Thème d'un jeu | idem | idem |
| `pureVikingsTheme` | Ancien thème Vikings | `tools/utils.js` (`loadTheme`) | Encore lu en secours |
| `<slug>_vtt-dice_config` | Configuration des dés (`platform` pour l'accueil) | `hooks/useDiceConfig.js` (`diceStorageKey`, `readDiceConfig`, `writeDiceConfig`), `tools/diceEngine.js` (`roll`) | |
| `<slug>_player_session_bar` | Mode de la barre de session (`panel`, `rail`, `hidden` ; anciennement `1` / `0`) | `components/layout/SessionPlayersBar.jsx` | Reprend déjà `1` / `0` |
| `activeSessionId_<slug>` | Table active du MJ | `hooks/useGMSession.js` | Sans protection d'erreur |
| `activeSessionId` | — | `components/gm/modals/TableManagementModal.jsx:86` | **Bug** : supprime une clé qui n'existe pas au lieu de `activeSessionId_<slug>` ; une table supprimée reste « active » au rechargement |
| `currentCharacterId_<slug>` | Personnage connecté | `context/AuthContext.jsx` | **Clé morte** : écrite et effacée, jamais lue |
| `vtt-audio-…` (6 clés) | Brique audio | `components/audio/`, `tools/audioVolume.js` | Jamais en prod : pas de reprise nécessaire |

Quatre conventions de nommage différentes, la moitié des accès sans protection (navigation privée, stockage plein).

---

## 3. Module `tools/browserStorage.js`

Logique pure, sans React, testée sous Vitest (le stockage est passé en paramètre dans les tests ; `window.localStorage` par défaut).

### 3.1 Clés

- `storageKey(scope, name)` → `vtt:<scope>:<name>`.
- `tableScope(slug, sessionId)` → `<slug>:<sessionId>` (portée d'une table).
- `PLATFORM_SCOPE = 'platform'`.

### 3.2 Format enregistré

Chaque clé contient `{ "v": <version>, "data": <valeur> }`. La version permet de relire une ancienne forme et de la convertir.

### 3.3 Fonctions

| Fonction | Rôle |
|---|---|
| `readStored(key, options)` | Valeur lue, ou `defaults` : clé absente, illisible, version inconnue sans conversion, valeur refusée par `validate`. Jamais d'erreur levée. |
| `writeStored(key, value, { version })` | Écrit `{ v, data }` ; renvoie `false` si le stockage est indisponible (le réglage vaut alors pour la page seulement). Prévient les abonnés de la page (§4). |
| `removeStored(key)` | Efface la clé. |
| `listStoredKeys()` | Clés `vtt:` présentes (base de la future réinitialisation, P-6). |

Options de `readStored` :

| Option | Rôle |
|---|---|
| `defaults` | Valeur par défaut ; pour un objet, les champs manquants de la valeur lue sont complétés depuis `defaults`. |
| `version` | Version attendue (1 par défaut). |
| `migrate(data, fromVersion)` | Conversion d'une version antérieure ; sans elle, une version différente donne `defaults`. |
| `validate(data)` | Refuse une valeur abîmée (renvoie `false`) → `defaults`. |

`readStored` ne connaît que les nouvelles clés : la reprise des anciennes est faite une fois pour toutes au démarrage (§5).

---

## 4. Hook `hooks/usePersistedState.js`

```js
const [audio, setAudio] = usePersistedState('platform', 'audio', { defaults: AUDIO_DEFAULTS, version: 1 });
setAudio(prev => ({ ...prev, volumes: { ...prev.volumes, master: 80 } }));
```

- S'utilise comme `useState` : valeur, et fonction de mise à jour (valeur ou fonction de la précédente). Les options sont celles de `readStored`.
- **Tous les composants qui lisent la même clé sont mis à jour** (abonnement interne à la page), et **les autres onglets** aussi (événement `storage` du navigateur), via `useSyncExternalStore`, l'outil prévu par React pour une source externe. La valeur lue est mise en cache tant que le texte enregistré ne change pas (référence stable, pas de rendu inutile).
- Hors de React (ex. `diceEngine.js`), on utilise directement `readStored`.

---

## 5. Reprise des anciennes clés (au démarrage)

Sans reprise, joueurs et MJ perdraient leurs réglages actuels (thème, dés, barre de session, table active) à la mise à jour. La reprise est faite **une fois, au démarrage de l'application**, dans un seul fichier, plutôt qu'à la première lecture de chaque clé (conversion éparpillée, et clés d'un jeu non visité laissées en l'état) :

- `tools/browserStorageMigration.js`, fonction pure (stockage en paramètre), appelée une fois dans `main.jsx` avant l'affichage ;
- elle parcourt les clés présentes, reconnaît chaque ancien format **par la forme de la clé** (pas par la liste des slugs actifs : un jeu retiré depuis est repris aussi, sans gêne), le convertit, écrit la nouvelle clé, efface l'ancienne ;
- **elle ne remplace jamais une nouvelle clé déjà présente** ; une ancienne valeur abîmée est ignorée (et effacée) sans erreur ;
- sans rien à reprendre, elle ne fait rien : elle peut tourner à chaque démarrage.

| Ancienne clé | Nouvelle clé | Conversion |
|---|---|---|
| `vtt_theme_global` (`dark` / `light`) | `vtt:platform:theme` | `{ dark: valeur === 'dark' }` |
| `vtt_theme_<slug>` | `vtt:<slug>:theme` | idem |
| `pureVikingsTheme` | `vtt:vikings:theme` | idem, seulement en l'absence de `vtt_theme_vikings` et de la nouvelle clé |
| `<slug>_vtt-dice_config` (`platform_vtt-dice_config` compris) | `vtt:<slug>:dice` / `vtt:platform:dice` | configuration JSON reprise telle quelle |
| `<slug>_player_session_bar` | `vtt:<slug>:session-bar` | `1` → `hidden`, `0` → `panel` ; `panel`, `rail`, `hidden` gardés |
| `activeSessionId_<slug>` | `vtt:<slug>:gm` | `{ activeSessionId: nombre }` |
| `currentCharacterId_<slug>` | — | effacée (clé morte, P-4) |
| `activeSessionId` (sans slug) | — | effacée (reste du bug de `TableManagementModal`, P-4) |

Testée sous Vitest avec des navigateurs simulés : chaque ancien format, ancienne et nouvelle clé présentes ensemble (la nouvelle gagne), valeur abîmée, second passage sans effet.

---

## 6. Clés de la plateforme après reprise

| Nouvelle clé | Contenu (`data`) | Reprend | Utilisée par |
|---|---|---|---|
| `vtt:platform:theme` | `{ dark }` | `vtt_theme_global` | `AppRouter`, `HomePage` |
| `vtt:<slug>:theme` | `{ dark }` | `vtt_theme_<slug>`, puis `pureVikingsTheme` (Vikings) | `SystemLayout` |
| `vtt:platform:dice` | configuration des dés de l'accueil | `platform_vtt-dice_config` | `useDiceConfig`, `diceEngine` |
| `vtt:<slug>:dice` | configuration des dés du jeu | `<slug>_vtt-dice_config` | idem |
| `vtt:<slug>:session-bar` | `{ mode }` | `<slug>_player_session_bar` (`1` → `hidden`, `0` → `panel`) | `SessionPlayersBar` |
| `vtt:<slug>:gm` | `{ activeSessionId }` | `activeSessionId_<slug>` | `useGMSession`, `TableManagementModal` (bug corrigé) |
| `vtt:platform:audio` | volumes, réglages du son dépliés, panneau MJ ouvert | — (jamais en prod) | brique audio |
| `vtt:<slug>:<table>:audio` | dernière playlist consultée | — | brique audio |
| `vtt:platform:panel:<id>` | position, taille, réduction d'une fenêtre flottante | — | `FloatingPanel` (`spec_ui_panneaux.md`) |

`currentCharacterId_<slug>` n'est plus écrite ; l'ancienne valeur est effacée par la reprise (§5).

`saveTheme` / `loadTheme` (`tools/utils.js`) restent comme façade, réécrits sur `browserStorage` ; `readStorage` / `writeStorage`, ajoutés au rangement de la brique audio, disparaissent au profit de `readStored` / `writeStored`.

---

## 7. Portée réservée `platform` (N-2)

- Le Loader serveur (`src/server/systems/Loader.js`) refuse un slug nommé `platform` au démarrage (message explicite), comme il refuse déjà un `config.js` invalide.
- La règle est notée dans le CLAUDE.md racine (création d'un slug) et dans `/new-slug`.

---

## 8. Fichiers touchés

| Fichier | Changement |
|---|---|
| `src/client/src/tools/browserStorage.js` | Nouveau (§3) |
| `src/client/src/hooks/usePersistedState.js` | Nouveau (§4) |
| `src/client/src/tools/browserStorageMigration.js` | Nouveau (§5) |
| `src/client/src/main.jsx` | Appel de la reprise avant l'affichage |
| `src/client/tests/tools/browserStorage.test.js` | Nouveau : clés, format, défauts, validation, version et conversion, stockage indisponible |
| `src/client/tests/tools/browserStorageMigration.test.js` | Nouveau : cas du §5 |
| `src/client/src/tools/utils.js` | `saveTheme` / `loadTheme` sur `browserStorage` ; retrait de `readStorage` / `writeStorage` |
| `src/client/src/AppRouter.jsx`, `pages/SystemLayout.jsx` | Thème (si l'appel change) |
| `src/client/src/hooks/useDiceConfig.js`, `tools/diceEngine.js` | Dés |
| `src/client/src/components/layout/SessionPlayersBar.jsx` | Mode de la barre |
| `src/client/src/hooks/useGMSession.js`, `components/gm/modals/TableManagementModal.jsx` | Table active, correction du bug |
| `src/client/src/context/AuthContext.jsx` | Retrait de la clé morte |
| `src/server/systems/Loader.js` | Refus du slug `platform` |
| `CLAUDE.md`, `src/client/CLAUDE.md`, `/new-slug` | Règle : tout passe par `browserStorage` / `usePersistedState` ; clés `vtt:<portée>:<fonction>` ; slug `platform` interdit |

La brique audio passe ensuite sur ces fonctions (`spec_audio.md`), avec `FloatingPanel`.

---

## 9. Vérifications

- `npm test`, `npm run lint`, `npm run build` (depuis `src/client`).
- En dev, sur un navigateur qui a déjà des réglages : thème (accueil et un jeu), dés (accueil et un jeu), mode de la barre de session, table active du MJ **conservés** après la mise à jour, anciennes clés effacées.
- Deux onglets ouverts : un réglage changé dans l'un se retrouve dans l'autre.
- Navigation privée : aucune erreur, réglages valables pour la page.
- Suppression de la table active depuis la gestion des tables : elle n'est plus active au rechargement.
