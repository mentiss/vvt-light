// src/client/tests/systems/vikings/utils.test.js
// ─────────────────────────────────────────────────────────────────────────────
// Fonctions d'affichage Vikings. `nom` contient le nom du parent ;
// « fils de / fille de » est déduit du sexe (spec_vikings D-17).
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import {
    formatFullName, formatSkillName, isSpecializableSkill, getSkillExamples,
} from '../../../src/systems/vikings/config.jsx';

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

describe('compétences spécialisables', () => {
    it('reconnaît les compétences cumulables par spécialisation (noms du vault)', () => {
        expect(isSpecializableSkill('Combat CàC (armé)')).toBe(true);
        expect(isSpecializableSkill('Combat distance')).toBe(true);
        expect(isSpecializableSkill('Combat CàC (non armé)')).toBe(false);
        expect(getSkillExamples('Combat CàC (armé)')).toContain('Hache');
    });

    it('affiche la spécialisation entre parenthèses', () => {
        expect(formatSkillName({ name: 'Combat CàC (armé)', specialization: 'Hache' })).toBe('Combat CàC (armé) (Hache)');
        expect(formatSkillName({ name: 'Survie' })).toBe('Survie');
    });
});
