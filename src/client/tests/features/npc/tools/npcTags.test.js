import { describe, it, expect } from 'vitest';
import { syncSystemTags, systemTagsOf, isSystemTag } from '@/features/npc/tools/npcTags.js';

// Groupes à la Fabula : rang + méchant pilotés, espèce pilotée, faction libre
const GROUPS = [
    { label: 'Rang', tags: ['Soldat', 'Élite', 'Champion', 'Méchant'],
      of: sd => [{ soldat: 'Soldat', elite: 'Élite', champion: 'Champion' }[sd.rank], sd.villain ? 'Méchant' : null] },
    { label: 'Espèce', tags: ['Bête', 'Monstre'], of: sd => sd.species },
    { label: 'Faction', tags: ['Empire'] },
];

describe('syncSystemTags', () => {
    it('pose les étiquettes de la fiche sur une fiche sans étiquette', () => {
        expect(syncSystemTags([], { rank: 'elite', species: 'Bête' }, GROUPS)).toEqual(['Élite', 'Bête']);
    });

    it('remplace l’ancien rang et garde les étiquettes libres', () => {
        expect(syncSystemTags(['Soldat', 'Bête', 'Empire', 'Boss'], { rank: 'elite', species: 'Bête' }, GROUPS))
            .toEqual(['Élite', 'Bête', 'Empire', 'Boss']);
    });

    it('retire une étiquette pilotée saisie à la main qui contredit la fiche', () => {
        expect(syncSystemTags(['Méchant', 'Monstre'], { rank: 'soldat', villain: null, species: 'Bête' }, GROUPS))
            .toEqual(['Soldat', 'Bête']);
    });

    it('ne touche à rien sans groupe piloté', () => {
        const tags = ['Soldat', 'X'];
        expect(syncSystemTags(tags, { rank: 'elite' }, [{ label: 'Rang', tags: ['Soldat'] }])).toBe(tags);
        expect(syncSystemTags(undefined, {}, undefined)).toEqual([]);
    });

    it('accepte un test d’appartenance propre au groupe (niveaux libres)', () => {
        const groups = [{ label: 'Niveau', tags: ['Niv. 1'], of: sd => `Niv. ${sd.level}`, owns: t => t.startsWith('Niv. ') }];
        expect(syncSystemTags(['Niv. 25', 'Gobelins'], { level: '3' }, groups)).toEqual(['Niv. 3', 'Gobelins']);
    });
});

describe('systemTagsOf / isSystemTag', () => {
    it('liste les étiquettes de la fiche et reconnaît celles des groupes pilotés', () => {
        expect(systemTagsOf({ rank: 'champion', villain: 'majeur', species: 'Monstre' }, GROUPS)).toEqual(['Champion', 'Méchant', 'Monstre']);
        expect(isSystemTag('Élite', GROUPS)).toBe(true);
        expect(isSystemTag('Empire', GROUPS)).toBe(false);
    });
});
