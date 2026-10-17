// src/client/tests/systems/tecumah/xpCosts.test.js
// ─────────────────────────────────────────────────────────────────────────────
// Barème de dépense des PP (spec_tecumah_gulch §5.4) et conversion pips → XD+Y.
// Import via config.jsx, comme le fait le code applicatif.
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import { getCost, pipsToNotation } from '../../../src/systems/tecumah/config.jsx';

describe('getCost', () => {
    it('débloquer une compétence coûte 8 PP', () => {
        expect(getCost('new_skill')).toBe(8);
    });

    it('+1 pip de compétence = dés de la compétence seule × 2', () => {
        expect(getCost('skill_pip', 3)).toBe(2);    // 1D   → 1D+1
        expect(getCost('skill_pip', 5)).toBe(2);    // 1D+2 → 2D
        expect(getCost('skill_pip', 6)).toBe(4);    // 2D   → 2D+1
    });

    it('+1 pip d\'attribut = dés de l\'attribut × 3', () => {
        expect(getCost('attr_pip', 9)).toBe(9);     // 3D → 3D+1
        expect(getCost('attr_pip', 11)).toBe(9);    // 3D+2 → 4D
        expect(getCost('attr_pip', 12)).toBe(12);   // 4D → 4D+1
    });

    it('+1 niveau de background = niveau actuel × 2', () => {
        expect(getCost('background', 1)).toBe(2);
        expect(getCost('background', 3)).toBe(6);
    });

    it('type inconnu → null (bouton désactivé par canAfford)', () => {
        expect(getCost('inconnu', 9)).toBeNull();
    });
});

describe('pipsToNotation', () => {
    it('convertit les pips en XD+Y', () => {
        expect(pipsToNotation(3)).toBe('1D');
        expect(pipsToNotation(4)).toBe('1D+1');
        expect(pipsToNotation(5)).toBe('1D+2');
        expect(pipsToNotation(36)).toBe('12D');
    });

    it('affiche un tiret pour 0, négatif ou absent', () => {
        expect(pipsToNotation(0)).toBe('—');
        expect(pipsToNotation(-3)).toBe('—');
        expect(pipsToNotation(undefined)).toBe('—');
    });
});
