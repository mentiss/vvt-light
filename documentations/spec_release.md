# Mise en production en une commande (release)

## Statut

**Validée par le MJ le 2026-10-18** (décisions du diagnostic au §1, réponses au §11, commande `/release` au §12, certificats au §13). Implémentée le 2026-10-18.

Brique d'outillage : une commande lancée depuis le poste de dev (Windows) fabrique une archive autonome de l'application, l'envoie sur le VPS (Linux) et l'y installe, migrations comprises. Le VPS ne fait ni build ni `git pull`.

Hors périmètre : intégration continue (GitHub Actions), mise à jour sans coupure, migrations inverses (« down »).

---

## 1. Décisions du diagnostic (validées le 2026-10-18)

| # | Sujet | Décision |
|---|---|---|
| R-1 | Lieu du build | Sur le poste de dev uniquement. Le VPS reçoit le front déjà buildé. |
| R-2 | Git sur le VPS | Aucun. Le VPS reçoit une archive. |
| R-3 | Commande | Une seule (`npm run release`) : vérifications, version, archive, envoi, installation, redémarrage. |
| R-4 | Migrations | L'archive porte elle-même la liste des migrations à jouer et leurs slugs. Aucun suivi dans les bases ; seules les bases visées sont ouvertes. |
| R-5 | Fichiers non commités | Pas de refus : avertissement et confirmation s'ils font partie de ce qui part. |
| R-6 | Version | Incrément à chaque release (patch par défaut). |
| R-7 | Commit après release | Oui : commit limité aux fichiers de la release (version, liste des migrations parties) et tag `vX.Y.Z`. Le chantier en cours n'est jamais commité. |
| R-8 | Version affichée | Pied de page de l'accueil : version de release **en plus** du hash et de la date. |
| R-9 | Accès au VPS | SSH par clé. Paramètres dans un fichier local non versionné. |
| R-10 | Rétention | Minimale : on privilégie le hotfix au rollback (§6, Q-2). |
| R-11 | Emplacement des bases | Inchangé : celui que donnent les `config.js` des slugs (`database/` à la racine de l'appli). L'installation se fait donc **sur place**, pas dans des dossiers de release séparés. |
| R-12 | Mise à jour en pleine partie | Possible (correctif bloquant) : une release sans migration ne coupe le serveur que le temps du redémarrage. |

---

## 2. La commande

```
npm run release              # 4.4.0 → 4.4.1
npm run release -- --minor   # 4.4.0 → 4.5.0
npm run release -- --major   # 4.4.0 → 5.0.0
```

Déroulé sur le poste de dev, arrêt au premier échec :

1. **Vérifications** : lint, tests et build du front.
2. **Migrations** : détection des nouvelles migrations (§4), contrôle de leur en-tête `-- systems:`.
3. **Fichiers non commités** : si des fichiers modifiés ou non suivis font partie de ce qui part, leur liste s'affiche avec « Continuer ? (o/N) ».
4. **Récapitulatif** : version, migrations et bases visées, puis confirmation.
5. **Version** : incrément dans `package.json`, build final avec cette version.
6. **Archive** : création de `vtt-X.Y.Z.tar.gz`.
7. **Envoi et installation** : une seule connexion SSH (donc une seule saisie de passphrase si la clé en a une et qu'aucun agent SSH ne tourne). L'archive est transmise puis son `install.sh` est exécuté. Sa sortie s'affiche en direct.
8. **Après succès** : mise à jour de la liste des migrations parties, commit de la release et tag `vX.Y.Z`.

En cas d'échec à l'étape 7, rien n'est commité et la version de `package.json` est remise à sa valeur d'avant.

---

## 3. Contenu de l'archive

| Contenu | Rôle |
|---|---|
| `src/server/` | code Node complet, configs des slugs comprises |
| `scripts/` | scripts des commandes npm racine, dont `migrate.js` exécuté sur le VPS |
| `database-template/` | schémas (création d'une base neuve) et migrations |
| `src/client/dist/` | front buildé |
| `package.json`, `package-lock.json` (racine) | dépendances du serveur |
| `release.json` | version, date, migrations à jouer avec leurs slugs |
| `install.sh` | installation sur le VPS (§5) |

Ne partent pas : `src/client/src`, `src/client/node_modules`, `documentations/`, tests, `database/`, `.env`.

---

## 4. Migrations

**Liste des migrations parties** : fichier versionné `database-template/migrations/released.txt`, un nom de fichier par ligne. Il est créé lors de la première release avec toutes les migrations actuelles (la prod les a toutes reçues).

**Détection** : toute migration du dossier absente de `released.txt` part avec la release.

**Slugs visés** : une ligne du bloc de commentaires d'en-tête du fichier SQL (avant la première instruction).

```sql
-- systems: vikings
-- systems: vikings,achtung
-- systems: all
```

Une nouvelle migration sans cette ligne **bloque la release** (pas de valeur par défaut, pour ne jamais jouer sur toutes les bases une migration propre à un slug). Les migrations déjà parties n'ont pas à être modifiées.

**Ordre** : date du nom de fichier (`DDMMYYYY`, relue en vraie date), puis ordre alphabétique pour une même date.

**Exécution** : par le `migrate.js` existant (`scripts/migrate.js`), une migration à la fois, sur les slugs indiqués. Chaque migration tourne déjà dans une transaction par base.

---

## 5. Installation sur le VPS (`install.sh`)

1. Décompression de l'archive dans un dossier temporaire.
2. **S'il y a des migrations ou si les dépendances changent** : arrêt du serveur (pm2).
3. Remplacement **complet** de `src/server/`, `scripts/`, `database-template/` et `src/client/dist/` (suppression puis copie). Un fichier supprimé en dev disparaît donc aussi en prod.
4. `npm ci --omit=dev` **uniquement si** les dépendances de `package-lock.json` diffèrent de celles en place (le module natif `better-sqlite3` doit être compilé sur Linux).
5. Migrations, dans l'ordre du §4 : sauvegarde des **seules bases visées**, puis exécution. Une base visée qui n'existe pas encore est ignorée (elle sera créée depuis le schéma, qui contient déjà la modification).
6. Démarrage ou redémarrage du serveur (pm2), puis contrôle qu'il répond.
7. Archive rangée dans `releases/`, purge selon la rétention (Q-2).

Jamais touchés : `database/` (hors migrations), `.env`, `node_modules/` (hors étape 4), `logs/`.

---

## 6. Échec et retour arrière

- **Échec d'une migration** : restauration automatique des sauvegardes des bases visées, réinstallation du code de l'archive précédente, redémarrage. La prod revient à l'état d'avant la release, et la commande signale l'échec.
- **Le serveur ne répond pas après redémarrage** : même retour arrière automatique.
- **Bug découvert plus tard** : on corrige et on fait une nouvelle release (hotfix). Le rollback manuel reste possible avec l'archive précédente (`--rollback`, sans migrations), si la rétention en garde une.

Coupure en pleine partie : Socket.io reconnecte les clients. Les connexions des joueurs survivent (même `JWT_SECRET`). Si le front a changé, les joueurs doivent faire F5.

---

## 7. Configuration locale

Fichier `deploy.config.json` à la racine, **ignoré par git** :

```json
{
  "host": "mon-vps.example",
  "port": 22,
  "user": "deploy",
  "identityFile": "C:/Users/<moi>/.ssh/id_ed25519",
  "appDir": "/home/deploy/vtt",
  "pm2Name": "vtt-jdr",
  "healthUrl": "https://localhost:3001/"
}
```

`identityFile` peut être omis si la clé est déjà chargée dans l'agent SSH ou déclarée dans `~/.ssh/config`. Outils utilisés côté Windows : `ssh` et `tar`, livrés avec Windows 10.

---

## 8. Version affichée

Le pied de page de l'accueil affiche la version de release en plus du hash et de la date : `v4.4.1 · 4fc8760 · 2026-10-18`. Hors release (dev), affichage inchangé.

---

## 9. Première release

- Créer `released.txt` avec toutes les migrations actuelles.
- Créer `deploy.config.json`.
- Sur le VPS : la première installation remplace le code déposé à la main. Le dossier `releases/` n'a pas encore d'archive précédente, donc pas de retour arrière automatique possible pour cette première fois : une sauvegarde manuelle du dossier de l'appli est conseillée avant.

---

## 10. Fichiers touchés (prévisionnel)

| Fichier | Nature |
|---|---|
| `scripts/release.js` | nouveau : la commande (Node, multi-plateforme) |
| `scripts/migrate.js` | déplacé depuis `src/server/` : `scripts/` racine regroupe les scripts des commandes npm racine (ceux du front restent dans `src/client/scripts/`) |
| `src/server/init-db.js` | supprimé avec `npm run init-db` (les bases se créent à la première ouverture) |
| `src/client/scripts/generate-css-utils.js` | renommé depuis `generate-opacity-utils.js` (nom cité par la doc) |
| `scripts/install.sh` | nouveau : copié dans l'archive |
| `scripts/certbot-deploy-hook.sh` | nouveau : hook certbot (§13) |
| `package.json` | script `release` |
| `.gitignore` | `deploy.config.json`, `release-tmp/` |
| `.gitattributes` | nouveau : scripts `.sh` toujours en LF |
| `deploy.config.example.json` | nouveau : modèle versionné de `deploy.config.json` |
| `.claude/commands/release.md` | nouveau : commande `/release` (§12) |
| `database-template/migrations/released.txt` | nouveau |
| `src/client/src/pages/HomePage.jsx` | version de release au pied de page (variable `VITE_RELEASE_VERSION` fournie au build) |
| `CLAUDE.md`, `README.md` | règle de l'en-tête `-- systems:` et procédure de release |

---

## 11. Questions ouvertes

| # | Question | Recommandation | Réponse |
|---|---|---|---|
| Q-1 | Hotfix en pleine partie : une option `--fast` qui saute lint et tests (le build reste obligatoire) ? | Oui : un correctif bloquant doit partir vite. Par défaut, toutes les vérifications. | Validé |
| Q-2 | Rétention sur le VPS | Archives : **1** (la précédente, pour le retour arrière automatique du §6). Sauvegardes : les **3** dernières par base. | Validé |
| Q-3 | Chemin de l'appli sur le VPS, utilisateur SSH, nom pm2 | À renseigner dans `deploy.config.json`, pas dans la spec. | Validé |
| Q-4 | Le serveur est lancé par pm2 depuis le dossier de l'appli (pour que `.env` soit trouvé) ? | À vérifier avant la première release (`pm2 describe vtt-jdr`). | Validé (vérification à faire) |

---

## 12. Commande Claude `/release`

Fichier `.claude/commands/release.md`, sur le modèle de `/new-slug`. Argument facultatif : `patch` (défaut), `minor`, `major`, `fast`.

Ce que Claude fait, dans l'ordre :

1. **Préparation** : liste les migrations qui partiraient, vérifie leur en-tête `-- systems:` et, s'il manque, propose la valeur d'après le contenu du SQL (tables touchées, nom du fichier) en demandant confirmation avant d'écrire.
2. **Contrôle du contenu** : liste les fichiers non commités qui partiraient et signale ceux qui ressemblent à un chantier inachevé (ex. un slug à moitié créé, un import vers un fichier absent).
3. **Message de release** : rédige le message du commit de release au format habituel des commits du dépôt (`Général (…) :` / `Slug X :` + puces), à partir des commits depuis le dernier tag, et le soumet au MJ.
4. **Lancement** : après validation explicite, exécute `npm run release` (avec l'option demandée) et commente la sortie.
5. **Échec** : explique l'étape en échec et l'état de la prod (retour arrière effectué ou non), sans relancer de lui-même.

Claude ne lance jamais une release sans validation explicite du MJ dans la conversation.

---

## 13. Renouvellement des certificats HTTPS

**Constat** : le serveur Node sert lui-même le HTTPS (port 9999), sans nginx ni apache. Certbot renouvelle dans `/etc/letsencrypt/live/jdr.grossak.fr/`, que Node (utilisateur `ubuntu`) ne peut pas lire. Il faut donc copier le certificat dans `/home/ubuntu/certs/` (chemins `SSL_CERT_PATH` / `SSL_KEY_PATH` du `.env`) puis redémarrer l'appli, qui ne lit le certificat qu'au démarrage.

**Décision** : hook de déploiement certbot + redémarrage pm2 (option A, validée).

- Script versionné `scripts/certbot-deploy-hook.sh`, installé une fois dans `/etc/letsencrypt/renewal-hooks/deploy/`.
- Certbot l'exécute en root **uniquement après un renouvellement réussi** du certificat `jdr.grossak.fr` : copie de `fullchain.pem` et `privkey.pem` vers `/home/ubuntu/certs/` (propriétaire `ubuntu`, clé privée en `600`), puis `pm2 restart` sous l'utilisateur `ubuntu`.
- Le renouvellement lui-même reste celui de certbot (minuteur système). Le port 80 étant libre (Node écoute sur 9999), la méthode `standalone` fonctionne sans arrêter l'appli.
- Le port 80 était occupé par un apache inutilisé, qui faisait échouer le renouvellement automatique : désactivé le 2026-10-18 (`systemctl disable --now apache2`), `certbot renew --dry-run` passe depuis. Si un serveur web doit un jour revenir sur le 80, passer certbot en `--apache`/`--nginx` ou `--webroot`.
- Coupure : quelques secondes tous les ~60 jours, au moment où le minuteur de certbot renouvelle.

**Installation (une fois, sur le VPS)** :

```bash
# 1. Installer le hook (depuis le dossier où le script a été envoyé)
sudo install -m 755 certbot-deploy-hook.sh /etc/letsencrypt/renewal-hooks/deploy/vtt-certs.sh

# 2. Vérifier que le renouvellement automatique est non interactif
sudo grep authenticator /etc/letsencrypt/renewal/jdr.grossak.fr.conf   # attendu : standalone
#    sinon, le refaire une fois en standalone :
#    sudo certbot certonly --standalone --cert-name jdr.grossak.fr -d jdr.grossak.fr

# 3. Vérifier que le minuteur de certbot existe et que le renouvellement passe
systemctl list-timers | grep -i certbot
sudo certbot renew --dry-run

# 4. Tester le hook une fois (copie + redémarrage)
sudo /etc/letsencrypt/renewal-hooks/deploy/vtt-certs.sh
```

Le script contient le domaine, le dossier des certificats, l'utilisateur et le nom pm2 en tête de fichier : à ajuster s'ils changent.
