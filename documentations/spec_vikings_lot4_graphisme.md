# Refonte Vikings — Lot 4 : graphisme

## Statut

**Décisions du diagnostic validées par le MJ le 2026-10-17** (L4-1 à L4-7, recommandations suivies). **4a validé** par le MJ le 2026-10-17 (planche `documentations/refonte_vikings/UIkit_complet.html`). **4b implémenté** le 2026-10-17 (voir §6), **4c implémenté** le 2026-10-18 (voir §7).

Références : `documentations/spec_vikings.md` §10 (direction graphique), UI kit `documentations/refonte_vikings/UIkit_preview.html` (inchangé), remarques du MJ après test du lot 3 (`spec_vikings_lot3_client.md` §14.1).

---

## 1. Décisions (validées le 2026-10-17)

| # | Sujet | Décision |
|---|---|---|
| L4-1 | Mode jour | Deux thèmes **sombres** : bois et or le jour, fer la nuit (palettes du kit). Plus de thème clair. |
| L4-2 | Polices | **Alegreya** pour le texte courant, les chiffres et les saisies ; **Eagle Lake** pour les titres ; **Grenze Gotisch** pour les intitulés courts : onglets, titres de section, libellés de valeurs et de champs, bouton principal (élargi à la demande du MJ sur la planche) ; jamais pour le texte courant. Ajout constaté sur la planche : **Noto Sans Runic** pour les symboles runiques, absents d'Eagle Lake. |
| L4-3 | Organisation de la fiche | Toute la largeur. Écran large : 3 colonnes (caractéristiques + Saga et état + combat / compétences / traits — section « Pratique du combat » renommée « Combat » et déplacée à gauche, retour MJ après 4b), puis l'inventaire sur 3 colonnes (équipé, sac, réserve), puis les runes. Tablette : 2 colonnes ; mobile : 1 colonne. |
| L4-4 | Séparateurs | Ligne fine en dégradé partout ; double filet fin entre les grandes zones. **Aucune image** (le motif du kit, même réduit, est jugé trop lourd — retour MJ sur la planche). |
| L4-5 | Éléments absents du kit | Planche de prévisualisation (4a), validée par le MJ avant application. |
| L4-6 | Périmètre | Tout ce qui est dans le slug (fiche, création, modales, interface MJ). Les composants de combat génériques gardent leur aspect, avec les couleurs du nouveau thème (classes `viking-*` conservées et rebranchées). |
| L4-7 | Corrections restantes | Intégrées au lot 4 : `InventorySection` (hook dans `renderSection`, alerte cassée), affichage de l'assurance dans la modale de jet. Plus de lot 5. |

Demandes du MJ reportées du lot 3 : malus de fatigue visible avant le jet et détaillé dans le résultat ; inventaire qui n'écrase plus la page ; page sur toute la largeur.

---

## 2. Système CSS (rappel, à respecter)

- `systems/vikings/theme.css` définit les **variables plateforme** (`--color-primary`, `--color-secondary`, `--color-accent`, `--color-danger`, `--color-success`, `--color-bg`, `--color-surface`, `--color-surface-alt`, `--color-text`, `--color-text-muted`, `--color-border`) dans `:root` (jour) et dans `.dark, [data-theme="dark"]` (nuit).
- Les classes génériques (`bg-*`, `text-*`, `border-*`, opacités `/N`, états `hover:`…, `ring-*`, `glow-*`, `placeholder-*`) viennent de `generated-css-utils.css` (script `scripts/generate-opacity-utils.js`) : on ne les redéfinit pas.
- Le spécifique Vikings se limite à des **variables `--vk-*`** et des **classes `.vk-*`** (modèle : `cp-` de cyberpunk, `dg-` de deltagreen). Mise en page : Tailwind.
- Le bloc `<style id="theme">` de la planche **est** le futur `theme.css` (seules les images, embarquées dans la planche, deviendront des fichiers). Pour s'ouvrir de n'importe où (aperçu de l'IDE compris), la planche est autonome : les règles de `generated-css-utils.css` qu'elle utilise y sont copiées telles quelles dans `<style id="generated-utils">`.

## 3. Images

8 PNG extraits du kit dans `documentations/refonte_vikings/assets/` (4 coins lourds, 4 coins légers ; le séparateur n'est plus utilisé). Copiés dans `systems/vikings/assets/` en 4b.

**Icônes** : plus d'emojis (hors contexte du 9ᵉ siècle, retour MJ). Jeu d'icônes au trait (sprite SVG de la planche → composant `VkIcon` en 4b) : dé long en os, hache, bouclier rond, bourse, maison longue, parchemin, clé, Yggdrasil, plume, casque, portrait, porte, soleil, lune, goutte de sang, flèche, œil, corne… Runes comme symboles quand elles ont du sens (ᛟ Saga, ᛊ triple 10).

**Fichiers de la planche** : `UIkit_complet.html` (autonome, à ouvrir) est généré depuis `UIkit_complet.source.html` (chemins relatifs vers `assets/` et `generated-css-utils.css`), qui reste la référence pour écrire `theme.css` en 4b.

## 4. Découpage

1. **4a** — planche `UIkit_complet.html` : palette et typographie, cadres et séparateurs, boutons et champs, bandeau / onglets / menu, jauges, fiche complète (mise en page L4-3), modale de jet (fatigue lisible), historique et notifications, interface MJ. Bascule jour / nuit.
2. **4b** — thème, images, panneaux, mise en page de la fiche (joueur et MJ), chargement des polices (avec retrait de `index.html`, fichier générique : à confirmer au moment de le faire).
3. **4c** — habillage des modales, de la création et de l'interface MJ, lisibilité des jets, corrections L4-7.

## 5. Titre runique animé (demande du MJ sur la planche)

Le titre en futhark du bandeau joueur (liste `RUNE_TITLES` de `Sheet.jsx` : Odin, Viking, Jarl, Volva, Skald, Pure) change de mot toutes les 7 s, au hasard et sans répéter le mot affiché. Transition : sortie floue et étirée, volutes de fumée, distorsion « mirage » (filtre SVG `feTurbulence` + `feDisplacementMap`), puis entrée avec un éclat doré. Largeur fixe pour que le nom à côté ne bouge pas. Désactivée si le système demande de réduire les animations (`prefers-reduced-motion`). Dans l'app : un petit composant `RuneTitle` (4b).

## 6. Implémentation 4b (2026-10-17)

- `systems/vikings/theme.css` généré depuis le bloc `<style id="theme">` de la planche (images en `./assets/`), plus `.vk-font-body` et `.vk-text-warn` (au lieu de `style=`), et la couche de compatibilité `viking-*` (combat générique, modales jusqu'en 4c). Polices chargées par `@import` dans le thème.
- Images : `systems/vikings/assets/` (8 coins).
- Composants : `components/ui/VkIcon.jsx` (icônes de la planche), `VkPanel.jsx` (cadres heavy / light / sm), `RuneTitle.jsx` (titre runique animé, §5).
- Fiche partagée (joueur et MJ) : cadre lourd pleine largeur, en-tête d'identité avec les états, 3 colonnes sur grand écran, inventaire sur 3 colonnes, runes en bas ; sections habillées selon la planche (losanges de Saga cliquables, jauges avec paliers, valeurs cliquables pour le jet).
- Enveloppes `Sheet.jsx` et `GMApp.jsx` : bandeau et onglets collants, menus à icônes, `data-theme` sur la racine, plus d'import de `theme.css` (chargé par les pages). `TabSession` MJ : vignettes, boutons et états vides habillés.
- Règle confirmée : une classe `.vk-*` qui fixe `display` ne se combine pas avec `hidden` / `flex` (envelopper l'élément).
- Restent pour 4c : modales (jet, évolution, édition, MJ), création, interface de jet et historique, `InventorySection` (habillage + corrections L4-7).

### 6.1 Retours du MJ après 4b (2026-10-17)

- Nom retiré du bandeau (déjà dans l'en-tête de la fiche).
- `SessionPlayersBar` (générique) : au défilement, la liste fixée se place sous `headerHeight` s'il est fourni (elle passait au-dessus des bandeaux collants) ; la fiche Vikings mesure la hauteur réelle de son bandeau. Effet aussi pour tecumah, dune, cyberpunk, achtung (qui passent `headerHeight`).
- Notifications rendues en dernier (devant les modales au même z-index) et jet libre rendu par `VikingsHistoryEntry` (`renderAllRollTypes`) : la notification d'un jet libre était masquée par sa propre modale.
- Polices Vikings retirées de `src/client/index.html` (chargées par le thème).
- Section « Pratique du combat » renommée « Combat », placée à gauche après Saga & état ; traits seuls à droite.

## 7. Implémentation 4c (2026-10-18)

- `components/ui/VkModal.jsx` : fond, cadre orné, en-tête, fermeture à l'écart des coins ; utilisé par toutes les modales du slug.
- Modale de jet : habillage, malus de blessures et de fatigue annoncés avant le jet (palier nommé), calcul détaillé ligne par ligne dans le résultat, bandeau du triple 10, jet de Saga séparé ; assurance : jet retenu et jet écarté distincts (corrige l'affichage du premier jet en double).
- Historique et notifications (`VikingsHistoryEntry`) : dés `vk-die`, malus en couleur d'alerte, rune ᛊ du triple 10, jet libre.
- Modales habillées : évolution (erreur dans la fenêtre au lieu d'une seconde modale), ajout de compétence / trait, actions de table, jet MJ (pastilles au lieu de la case à cocher), envoi d'objet (pastilles au lieu des listes déroulantes), posture défensive ; jetons de combat sans couleurs codées en dur.
- Inventaire (`InventorySection`) réécrit en composants de module : un filtre commun, lignes compactes (quantité, rangement, modification), fenêtre unique d'ajout libre et de modification (suppression dans la modification). Corrige L4-7 : plus de `useState` dans une fonction de rendu, plus de `setAlertMessage` hors portée (6 erreurs de lint en moins).
- Création : habillage, pastilles et recherche au lieu des listes déroulantes ; le choix « fils de / fille de », non enregistré et redondant avec le sexe, est retiré (formule déduite du sexe, D-17) ; le texte du code personnalisé est corrigé (le code doit être libre, il ne se partage pas).
- Restent hors périmètre avec les classes `viking-*` : `gm/tabs/TabCombat.jsx` et la partie combat de `config.jsx` (système de combat non refondu).