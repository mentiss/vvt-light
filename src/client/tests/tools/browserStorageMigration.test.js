// Reprise des anciennes clés du navigateur au démarrage (spec_browser_storage.md §5)
import { describe, it, expect } from 'vitest';
import { migrateLegacyStorage } from '../../src/tools/browserStorageMigration.js';
import { memoryStorage } from './memoryStorage.js';

const stored = (s, key) => (key in s.data ? JSON.parse(s.data[key]) : undefined);

describe('migrateLegacyStorage', () => {
    it('reprend chaque ancien format et efface les anciennes clés', () => {
        const dice = { theme: 'diceOfRolling', animationEnabled: false, custom: { foreground: '#fff' } };
        const s = memoryStorage({
            vtt_theme_global: 'dark',
            vtt_theme_achtung: 'light',
            vikings_player_session_bar: '1',
            fabula_player_session_bar: '0',
            dune_player_session_bar: 'rail',
            'vikings_vtt-dice_config': JSON.stringify(dice),
            'platform_vtt-dice_config': JSON.stringify({ animationEnabled: true }),
            activeSessionId_vikings: '12',
            currentCharacterId_vikings: '4',
            activeSessionId: '9',
            autre_cle: 'garder',
        });

        const handled = migrateLegacyStorage(s);

        expect(stored(s, 'vtt:platform:theme')).toEqual({ v: 1, data: { dark: true } });
        expect(stored(s, 'vtt:achtung:theme')).toEqual({ v: 1, data: { dark: false } });
        expect(stored(s, 'vtt:vikings:session-bar').data).toEqual({ mode: 'hidden' });
        expect(stored(s, 'vtt:fabula:session-bar').data).toEqual({ mode: 'panel' });
        expect(stored(s, 'vtt:dune:session-bar').data).toEqual({ mode: 'rail' });
        expect(stored(s, 'vtt:vikings:dice').data).toEqual(dice);
        expect(stored(s, 'vtt:platform:dice').data).toEqual({ animationEnabled: true });
        expect(stored(s, 'vtt:vikings:gm').data).toEqual({ activeSessionId: 12 });

        expect(handled).toHaveLength(10);
        expect(Object.keys(s.data).filter(k => !k.startsWith('vtt:'))).toEqual(['autre_cle']);
    });

    it('ne remplace jamais une nouvelle clé déjà présente', () => {
        const s = memoryStorage({
            vtt_theme_vikings: 'light',
            'vtt:vikings:theme': JSON.stringify({ v: 1, data: { dark: true } }),
        });
        migrateLegacyStorage(s);
        expect(stored(s, 'vtt:vikings:theme').data).toEqual({ dark: true });
        expect(s.data.vtt_theme_vikings).toBeUndefined();
    });

    it('reprend l’ancien thème Vikings seulement s’il n’y a rien de plus récent', () => {
        const seul = memoryStorage({ pureVikingsTheme: 'dark' });
        migrateLegacyStorage(seul);
        expect(stored(seul, 'vtt:vikings:theme').data).toEqual({ dark: true });

        const doublon = memoryStorage({ pureVikingsTheme: 'dark', vtt_theme_vikings: 'light' });
        migrateLegacyStorage(doublon);
        expect(stored(doublon, 'vtt:vikings:theme').data).toEqual({ dark: false });
        expect(doublon.data.pureVikingsTheme).toBeUndefined();
    });

    it('efface une ancienne valeur abîmée sans rien écrire', () => {
        const s = memoryStorage({ 'achtung_vtt-dice_config': '{abîmé', activeSessionId_dune: 'abc', tecumah_player_session_bar: 'n’importe' });
        migrateLegacyStorage(s);
        expect(Object.keys(s.data)).toEqual([]);
    });

    it('ne fait rien au second passage, ni sans stockage', () => {
        const s = memoryStorage({ vtt_theme_global: 'dark' });
        migrateLegacyStorage(s);
        const after = { ...s.data };
        expect(migrateLegacyStorage(s)).toEqual([]);
        expect(s.data).toEqual(after);
        expect(migrateLegacyStorage(null)).toEqual([]);
    });
});
