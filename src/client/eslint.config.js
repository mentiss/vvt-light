import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'
import { builtinRules } from 'eslint/use-at-your-own-risk'

// ── Règles de la grille front (code-rules/front.md) ──────────────────────────
// Chaque contrôle est une copie de no-restricted-syntax nommée par l'identifiant
// de la grille : le message cite la règle, une exception vise une seule règle
// (`// eslint-disable-next-line vtt/F-CONTROLS -- raison`).
const GRID_IDS = [
  'F-STORAGE', 'F-SOCK-INFRA', 'F-SOCK-EMIT', 'F-THEME', 'F-THEME-IMPORT',
  'F-TOKENS', 'F-SHRINK', 'F-CONTROLS',
]
const restrictedSyntax = builtinRules.get('no-restricted-syntax')
const vtt = { rules: Object.fromEntries(GRID_IDS.map(id => [id, restrictedSyntax])) }

// Sélecteur sur les chaînes de classes : littéraux et morceaux de gabarits
const inStrings = (regex, message) => [
  { selector: `Literal[value=${regex}]`, message },
  { selector: `TemplateElement[value.raw=${regex}]`, message },
]
const BASE_TOKENS = inStrings('/\\b(bg|border|ring)-base\\b/',
  'F-TOKENS : alias legacy `xxx-base`, utiliser `xxx-default` (code-rules/front.md).')
const STORAGE_MESSAGE = 'F-STORAGE : passer par usePersistedState ou readStored / writeStored (tools/browserStorage.js).'
const VIKING_CLASSES = inStrings('/\\bviking-/',
  'F-TOKENS : classe du slug vikings hors de ce slug (code-rules/front.md).')

// ── Dette : fichiers existants en écart, par règle ───────────────────────────
// On retire un fichier quand on le touche et qu'on le met d'aplomb. Le but est
// une liste vide, pas une campagne de rattrapage. Chaque liste couvre la dette
// réelle de sa règle, pas plus.
const LEGACY = {
  'F-THEME': [
    'src/systems/noctis/Creation.jsx',
    'src/systems/noctis/Sheet.jsx',
    'src/systems/noctis/gm/GMView.jsx',
  ],
  'F-SHRINK': [
    'src/systems/deltagreen/components/layout/BondSection.jsx',
    'src/systems/deltagreen/components/layout/MotivationsSection.jsx',
    'src/systems/tecumah/Creation.jsx',
    'src/systems/tecumah/Sheet.jsx',
    'src/systems/tecumah/components/InventoryTab.jsx',
    'src/systems/tecumah/components/gm/GMView.jsx',
    'src/systems/tecumah/components/gm/tabs/TabSession.jsx',
  ],
  'F-THEME-IMPORT': [
    'src/systems/achtung/Creation.jsx',
    'src/systems/achtung/Sheet.jsx',
    'src/systems/deltagreen/Creation.jsx',
    'src/systems/deltagreen/GMApp.jsx',
    'src/systems/deltagreen/Sheet.jsx',
    'src/systems/deltagreen/gm/tabs/TabSession.jsx',
    'src/systems/fabula/Creation.jsx',
    'src/systems/fabula/Sheet.jsx',
    'src/systems/noctis/GMApp.jsx',
    'src/systems/tecumah/Creation.jsx',
    'src/systems/tecumah/GMApp.jsx',
    'src/systems/tecumah/Sheet.jsx',
    'src/systems/zoneblanche/Creation.jsx',
  ],
  'F-SOCK-EMIT': [ // ressources de session 2D20 / D6 (dette connue), réserve de groupe noctis
    'src/systems/achtung/Sheet.jsx',
    'src/systems/achtung/dice/AchtungDiceModal.jsx',
    'src/systems/achtung/gm/tabs/TabSession.jsx',
    'src/systems/dune/hooks/useDuneRoll.js',
    'src/systems/dune/hooks/useSessionResources.js',
    'src/systems/noctis/hooks/useGroupReserve.jsx',
    'src/systems/tecumah/components/gm/tabs/TabResource.jsx',
    'src/systems/tecumah/components/modals/TecumahDiceModal.jsx',
  ],
  // F-CONTROLS est une préférence (avertissement) : pas d'exception à tenir.
}

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['warn', { varsIgnorePattern: '^[A-Z_]' }],
      'react-refresh/only-export-components': 'off',
      // catch (_) {} volontaires (localStorage, nettoyage dice-box…)
      'no-empty': ['error', { allowEmptyCatch: true }],
      // Règles React Compiler (react-hooks v7) : le projet n'utilise pas le
      // compilateur, ce sont des optimisations manquées, pas des bugs.
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/preserve-manual-memoization': 'warn',
      'react-hooks/immutability': 'warn',
      'react-hooks/static-components': 'warn',
      'react-hooks/purity': 'warn',
    },
  },
  {
    // Scripts Node exécutés hors navigateur (copy-dice-assets, genmap-bench…)
    files: ['scripts/**/*.js'],
    languageOptions: { globals: globals.node },
  },

  // ── Grille front ───────────────────────────────────────────────────────────
  {
    files: ['src/**/*.{js,jsx}'],
    plugins: { vtt },
    rules: {
      'vtt/F-STORAGE': ['error',
        // localStorage, window.localStorage… mais pas une clé d'objet { localStorage: … }
        { selector: 'Identifier[name=/^(localStorage|sessionStorage)$/]:not(Property > .key)', message: STORAGE_MESSAGE },
        // window['localStorage']
        { selector: 'MemberExpression[computed=true][property.value=/^(localStorage|sessionStorage)$/]', message: STORAGE_MESSAGE },
      ],
      'vtt/F-SOCK-INFRA': ['error', {
        selector: "CallExpression[callee.property.name='emit'][arguments.0.value=/^(join-session|leave-session|character-loaded|character-left|gm-set-active-session|gm-clear-session)$/]",
        message: "F-SOCK-INFRA : les emits d'infrastructure restent dans useGMSession, usePlayerSession, SessionContext.",
      }],
      'vtt/F-THEME': ['error',
        // dark:bg-x, et aussi derrière une autre variante (md:dark:bg-x)
        ...inStrings('/(^|[\\s:])dark:/', 'F-THEME : `dark:` ne suit pas le jour / nuit de l\'app (data-theme) ; passer par les variables de [data-theme="dark"].'),
        { selector: "JSXAttribute[name.name='data-theme']", message: 'F-THEME : data-theme est posé par la plateforme sur <html>, pas sur une page.' },
      ],
      'vtt/F-TOKENS': ['error', ...BASE_TOKENS, ...VIKING_CLASSES],
      'vtt/F-SHRINK': ['error',
        ...inStrings('/\\bflex-shrink-0\\b/', 'F-SHRINK : Tailwind v4, `shrink-0`.'),
      ],
      'vtt/F-CONTROLS': ['warn',
        { selector: "JSXOpeningElement[name.name='select']", message: 'F-CONTROLS (préférence) : bouton « pill » plutôt que <select>, ou justifier en commentaire.' },
        { selector: "JSXAttribute[name.name='type'][value.value='checkbox']", message: 'F-CONTROLS (préférence) : bouton « pill » plutôt qu\'une case à cocher, ou justifier en commentaire.' },
      ],
    },
  },
  {
    files: ['src/systems/**/*.{js,jsx}'],
    rules: {
      'vtt/F-SOCK-EMIT': ['error', {
        selector: "CallExpression[callee.property.name='emit']",
        message: "F-SOCK-EMIT : un slug n'émet pas vers le serveur (écriture par HTTP) ; un nouvel emit se discute d'abord.",
      }],
      'vtt/F-THEME-IMPORT': ['error', {
        selector: 'ImportDeclaration[source.value=/theme\\.css$/]',
        message: 'F-THEME-IMPORT : theme.css est chargé par la page, pas importé par le slug.',
      }],
    },
  },
  { files: ['src/app/tools/browserStorage.js'], rules: { 'vtt/F-STORAGE': 'off' } },
  { files: ['src/app/hooks/**', 'src/app/context/**', 'src/features/*/hooks/**', 'src/ui/hooks/**'], rules: { 'vtt/F-SOCK-INFRA': 'off' } },
  { files: ['src/systems/vikings/**'], rules: { 'vtt/F-TOKENS': ['error', ...BASE_TOKENS] } },

  // Dette (voir LEGACY en tête du fichier)
  ...Object.entries(LEGACY).map(([rule, files]) => ({ files, rules: { [`vtt/${rule}`]: 'off' } })),
])
