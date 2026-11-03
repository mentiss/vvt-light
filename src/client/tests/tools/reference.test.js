// tests/tools/reference.test.js
// Aide de jeu : conversion du Markdown, visibilité, recherche (spec_ui_reference.md §3, §4).
import { describe, it, expect } from 'vitest';
import { markdownToSection, markdownToSections, isVisible, matchingBlocks, inlineSegments } from '../../src/tools/reference.js';
import { normalizeText } from '../../src/tools/catalog.js';

const MD = `# Combat

Le tour se déroule en trois temps.
Suite du même paragraphe.

## Manœuvres

| Manœuvre | Difficulté |
|---|---|
| Coup de poing | 6 |
| Saisie \\| prise | 6 |

- Premier point
- Second point
  qui continue

<!-- gm -->
## Conseils au Conteur
Un PNJ compétent : 5 dés.
<!-- /gm -->

<!-- player -->
Passage des joueurs.
<!-- /player -->
`;

describe('markdownToSection', () => {
    const s = markdownToSection('02-combat.md', MD);

    it('titre et identifiant tirés du fichier', () => {
        expect(s.title).toBe('Combat');
        expect(s.id).toBe('combat');
        expect(s.visibility).toBeUndefined();
    });

    it('paragraphe, intertitre, tableau (barre échappée), liste (suite d’élément)', () => {
        expect(s.blocks[0]).toEqual({ type: 'text', text: 'Le tour se déroule en trois temps. Suite du même paragraphe.' });
        expect(s.blocks[1]).toEqual({ type: 'heading', text: 'Manœuvres' });
        expect(s.blocks[2]).toEqual({ type: 'table', columns: ['Manœuvre', 'Difficulté'], rows: [['Coup de poing', '6'], ['Saisie | prise', '6']] });
        expect(s.blocks[3]).toEqual({ type: 'list', items: ['Premier point', 'Second point qui continue'] });
    });

    it('commentaires de visibilité : chaque bloc encadré porte sa visibilité', () => {
        expect(s.blocks[4]).toEqual({ type: 'heading', text: 'Conseils au Conteur', visibility: 'gm' });
        expect(s.blocks[5]).toMatchObject({ type: 'text', visibility: 'gm' });
        expect(s.blocks[6]).toEqual({ type: 'text', text: 'Passage des joueurs.', visibility: 'player' });
    });

    it('en-tête de fichier : visibility, mj accepté pour gm', () => {
        expect(markdownToSection('07-conteur.md', '---\nvisibility: mj\n---\n# Conteur\n\nTexte').visibility).toBe('gm');
        expect(markdownToSection('x.md', '---\nvisibility: player\n---\n# X').visibility).toBe('player');
        expect(markdownToSection('x.md', '<!-- mj -->\nSecret\n<!-- /mj -->').blocks[0].visibility).toBe('gm');
    });
});

describe('markdownToSections', () => {
    it('ordre des préfixes numériques (10 après 2)', () => {
        const files = [{ name: '10-fin.md', text: '# Fin' }, { name: '02-debut.md', text: '# Début' }];
        expect(markdownToSections(files).map(s => s.id)).toEqual(['debut', 'fin']);
    });
});

describe('isVisible', () => {
    it('sans visibilité : partout ; gm : MJ seulement ; player : joueur seulement', () => {
        expect(isVisible({}, false)).toBe(true);
        expect(isVisible({ visibility: 'gm' }, true)).toBe(true);
        expect(isVisible({ visibility: 'gm' }, false)).toBe(false);
        expect(isVisible({ visibility: 'player' }, false)).toBe(true);
        expect(isVisible({ visibility: 'player' }, true)).toBe(false);
    });
});

describe('matchingBlocks', () => {
    const s = markdownToSection('02-combat.md', MD);
    it('insensible aux accents et à la casse ; l’intertitre suit le bloc trouvé', () => {
        const kept = matchingBlocks(s, s.blocks, normalizeText('MANOEUVRE'));
        expect(kept[0]).toEqual({ type: 'heading', text: 'Manœuvres' });
        expect(kept[1].type).toBe('table');
        expect(matchingBlocks(s, s.blocks, normalizeText('deroule'))).toHaveLength(1);
    });
    it('titre de section trouvé : section entière', () => {
        expect(matchingBlocks(s, s.blocks, normalizeText('combat'))).toHaveLength(s.blocks.length);
    });
});

describe('inlineSegments', () => {
    it('gras et italique', () => {
        expect(inlineSegments('Un **+2 diff** et *iso*.')).toEqual([
            { text: 'Un ' }, { text: '+2 diff', bold: true }, { text: ' et ' }, { text: 'iso', italic: true }, { text: '.' },
        ]);
    });
});
