// src/client/tests/tools/utils.test.js
// ─────────────────────────────────────────────────────────────────────────────
// formatFullName (Vikings) — `nom` contient le nom du parent depuis le lot 2
// de la refonte ; « fils de / fille de » est déduit du sexe (spec_vikings D-17).
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import { formatFullName } from '../../src/tools/utils.js';

describe('formatFullName', () => {
    it('compose prénom, surnom et filiation selon le sexe', () => {
        expect(formatFullName({ prenom: 'Björn', surnom: 'Côtes-de-Fer', nom: 'Ragnar', sexe: 'homme' }))
            .toBe('Björn "Côtes-de-Fer" fils de Ragnar');
        expect(formatFullName({ prenom: 'Frida', surnom: '', nom: 'Bjarni', sexe: 'femme' }))
            .toBe('Frida fille de Bjarni');
    });

    it('omet la filiation quand le nom du parent est vide', () => {
        expect(formatFullName({ prenom: 'MJ', nom: '', sexe: null })).toBe('MJ');
    });
});
