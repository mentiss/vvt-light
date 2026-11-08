# Relecture croisée par Codex (`/relecture`)

> Statut : **validée** (2026-11-08), implémentée. Ticket 2 sur 3 après l'audit de novembre 2026. Le ticket 1 a posé les grilles (`code-rules/`, `spec_grilles_relecture.md`) ; le ticket 3 (défauts de l'audit) sera le premier chantier relu.

## 1. Objectif

Faire relire le code que Claude écrit par un autre modèle, d'un autre éditeur (Codex, `gpt-6-astra`), pour ne pas laisser le même système juger son propre travail. Ce n'est pas du contrôle : c'est une boucle d'amélioration du process. Une correction veut dire qu'une règle a été ratée à l'écriture ; quand ça se répète, on améliore la règle ou la façon de coder.

## 2. Décisions (validées en phase 1)

| # | Sujet | Décision |
|---|---|---|
| 1 | Déclenchement | Claude lance la relecture lui-même à la fin de chaque implémentation, une fois lint, tests et build verts, avant de dire « tu peux tester ». L'utilisateur peut aussi la lancer (`/relecture`). |
| 2 | Périmètre | Les fichiers de code du chantier, en diff : `src/`, `database-template/`, `scripts/`, `tests/`, configurations (`package.json`, `eslint.config.js`, `vite.config.js`…). La spec du chantier est donnée en contexte (C-SPEC). Hors périmètre : doc, planches, images, et la dette des fichiers touchés hors des lignes modifiées. |
| 3 | Modèle | `gpt-6-astra`, effort de raisonnement `high`. |
| 4 | Correction contestée | Claude n'applique jamais en silence une correction qu'il juge fausse : elle est présentée comme « contestée », avec son argument, et la règle de la grille est précisée. |
| 5 | Passes | Une seconde passe seulement si les corrections ont touché la logique ; deux passes au plus. |
| 6 | Suivi | Journal `code-rules/relecture-log.md` ; un identifiant qui revient trois fois déclenche une proposition d'amélioration (règle ou façon de coder). |
| 7 | Emplacement | `.claude/commands/relecture.md` et `.claude/commands/relecture.schema.json`. |

## 3. Déroulé

1. **Liste des fichiers.** Claude connaît les fichiers de son chantier : il les liste. Lancée à la main sans argument, la commande prend les fichiers de code modifiés ou nouveaux de l'arbre de travail (suivis et non suivis, filtrés sur le périmètre du §2). Si l'arbre contient des modifications sans rapport (retouches manuelles de l'utilisateur), Claude demande la liste plutôt que de deviner.
2. **Consigne.** Claude écrit la consigne de relecture dans un fichier du dossier temporaire de la session (§4) : fichiers, commande pour voir leur diff, spec du chantier, rappel des règles du jeu de la relecture.
3. **Lancement** en arrière-plan, Codex en lecture seule :
   ```bash
   codex exec -m gpt-6-astra -c model_reasoning_effort=high -s read-only --ephemeral \
     -C <dépôt> --output-schema .claude/commands/relecture.schema.json \
     -o <temp>/relecture.json - < <temp>/consigne.md
   ```
   La consigne passe par l'entrée standard : elle contient des accents, qui cassent une commande shell sous Windows.
4. **Lecture du résultat** (`relecture.json`, au format du §5).
5. **Corrections.** Claude applique chaque correction acceptée, ou la marque « contestée » avec son argument. Puis lint, tests, build.
6. **Seconde passe**, si une correction a touché la logique (pas un renommage, une classe CSS, un commentaire) : même commande, limitée aux fichiers corrigés.
7. **Journal** : une ligne ajoutée à `code-rules/relecture-log.md`.
8. **Compte rendu à l'utilisateur** (§6).

## 4. Consigne donnée à Codex

Contenu (le gabarit vit dans `relecture.md`, Claude le remplit) :
- **Rôle** : relecteur du chantier, en lecture seule. Lire `AGENTS.md`, puis les grilles `code-rules/common.md`, `front.md`, `back.md`, et la spec du chantier.
- **Ce qu'on relit** : les lignes ajoutées ou modifiées des fichiers listés (`git diff HEAD -- <fichiers>` ; pour un fichier nouveau, tout le fichier). Le reste du dépôt sert de contexte : lire les composants appelés, les routes visées, les contrats.
- **Correction** : seulement un écart à une règle de niveau « Règle » d'une grille, et chaque correction cite son identifiant. Pas d'identifiant applicable = pas de correction. Une « Préférence » non justifiée est une **suggestion**, jamais une correction.
- **Suggestion** : performance, logique, maintenabilité, ergonomie, sécurité au sens des grilles ; préférence non justifiée. Chaque suggestion porte un argument.
- **À ne pas remonter** : les « choix assumés » des grilles ; la dette hors des lignes modifiées ; ce que le lint contrôle déjà (règles marquées `lint`, le lint est vert) ; le style personnel (nommage, formatage) hors règle.
- **Hésitation** sur une règle : la remonter en suggestion, en précisant la règle qui manque de clarté.
- Réponse en français, au format du §5.

## 5. Format du résultat (`relecture.schema.json`)

```json
{
  "corrections": [
    { "rule": "B-AUTH-USER", "file": "src/server/routes/dice.js", "line": 197,
      "problem": "…", "fix": "…" }
  ],
  "suggestions": [
    { "category": "logique", "file": "…", "line": 42,
      "proposal": "…", "argument": "…" }
  ],
  "unclearRules": [
    { "rule": "F-BRICKS", "why": "…" }
  ],
  "summary": "…"
}
```

- `category` : `performance`, `logique`, `maintenabilité`, `ergonomie`, `sécurité`, `préférence`.
- `unclearRules` : les règles sur lesquelles Codex a hésité ; elles nourrissent l'amélioration des grilles.
- Listes vides permises. `line` vaut `0` quand le point concerne tout le fichier.

## 6. Compte rendu à l'utilisateur

Dans le chat, après la relecture :
1. **Corrections faites** : une ligne chacune (identifiant, fichier, ce qui a changé).
2. **Corrections contestées** : la correction, l'argument de Claude, la précision proposée pour la grille. L'utilisateur tranche.
3. **Suggestions** : en liste numérotée, chacune avec l'argument de Codex et l'avis de Claude (« à faire », « pas utile », « à voir »). L'utilisateur tranche ; une suggestion retenue se code dans le même chantier.
4. **Règles peu claires** remontées par Codex, avec la précision proposée.
5. **Récurrences** : tout identifiant qui atteint trois corrections dans le journal, avec une proposition (règle mieux placée ou mieux écrite, contrôle mécanique, ou habitude de code).

## 7. Journal (`code-rules/relecture-log.md`)

Versionné : les corrections sont faites avant le commit, il ne décrit pas de faille ouverte.

```md
| Date | Chantier | Corrections (identifiants) | Contestées | Suggestions retenues / proposées |
|---|---|---|---|---|
| 2026-11-10 | Défauts de l'audit | B-AUTH-USER ×2, B-COALESCE | — | 2 / 5 |
```

Sous le tableau, un décompte par identifiant tenu à jour, pour voir les récurrences d'un coup d'œil.

## 8. Limites

- Une relecture prend quelques minutes et consomme du quota Codex : une par chantier, pas par fichier.
- Codex peut se tromper, dans les deux sens. Le lint et les tests restent le filet mécanique ; la relecture complète, elle ne remplace rien.
- Codex ne voit pas la conversation : ce qui n'est ni dans les grilles, ni dans la spec, ni dans le code, il ne peut pas le savoir. Une décision prise en discussion et absente de la spec peut ressortir en suggestion.

## 9. Fichiers touchés (implémentation)

- Nouveaux : `.claude/commands/relecture.md`, `.claude/commands/relecture.schema.json`, `code-rules/relecture-log.md`.
- Modifiés : `CLAUDE.md` (méthode : la relecture fait partie de la phase 3), `code-rules/common.md` (renvoi au journal).
- Test de bout en bout : une relecture du ticket 1 (grilles, `useFetch`, lint), avant son commit.
