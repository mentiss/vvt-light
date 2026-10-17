// src/client/tests/systems/vikings/data.test.js
// ─────────────────────────────────────────────────────────────────────────────
// Cohérence des données Vikings (systems/vikings/config/*.js).
// Référence : documentations/spec_vikings.md, annexes A à D.
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import { CARACNAMES, COMPETENCES, TRAITS, RUNES, ITEMS } from '../../../src/systems/vikings/config.jsx';

const CARACS = Object.keys(CARACNAMES);
const SKILLS = new Set(COMPETENCES.map(c => c.name));
const unique = (list) => new Set(list).size === list.length;

// Tous les blocs de conditions d'un trait (le trait lui-même + ses alternatives)
const conditionBlocks = (t) => [t, ...(t.requiresAny ?? [])];

describe('compétences (annexe A)', () => {
    it('39 compétences aux noms uniques, liées à 2 caractéristiques existantes', () => {
        expect(COMPETENCES).toHaveLength(39);
        expect(unique(COMPETENCES.map(c => c.name))).toBe(true);
        for (const c of COMPETENCES) {
            expect(c.caracs, c.name).toHaveLength(2);
            c.caracs.forEach(k => expect(CARACS, `${c.name} → ${k}`).toContain(k));
        }
    });

    it('noms et caractéristiques du vault (D-13)', () => {
        const byName = Object.fromEntries(COMPETENCES.map(c => [c.name, c.caracs]));
        expect(byName['Combat CàC (armé)']).toEqual(['force', 'agilite']);
        expect(byName['Combat CàC (non armé)']).toEqual(['force', 'agilite']);
        expect(byName['Combat distance']).toEqual(['agilite', 'agilite']);
        expect(byName['Folklore']).toEqual(['intelligence', 'intelligence']);
        expect(byName['Esquive']).toBeUndefined();
    });
});

describe('traits (annexe B)', () => {
    it('65 traits aux noms uniques, sans les traits hors app (D-14)', () => {
        expect(TRAITS).toHaveLength(65);
        expect(unique(TRAITS.map(t => t.name))).toBe(true);
        for (const exclu of ['Forme de loup', 'Forme d\'ours', 'Maudit par une Völva', 'Hanté par les Draugr']) {
            expect(TRAITS.some(t => t.name === exclu), exclu).toBe(false);
        }
    });

    it('incompatibilités : traits existants et réciproques', () => {
        const names = new Set(TRAITS.map(t => t.name));
        for (const t of TRAITS) {
            for (const other of t.incompatible ?? []) {
                expect(names.has(other), `${t.name} → ${other}`).toBe(true);
                const back = TRAITS.find(x => x.name === other);
                expect(back.incompatible ?? [], `${other} doit exclure ${t.name}`).toContain(t.name);
            }
        }
    });

    it('conditions : caractéristiques et compétences existantes', () => {
        for (const t of TRAITS) {
            for (const block of conditionBlocks(t)) {
                Object.keys(block.requirements ?? {}).forEach(k => expect(CARACS, `${t.name} : ${k}`).toContain(k));
                Object.keys(block.maxCarac ?? {}).forEach(k => expect(CARACS, `${t.name} : ${k}`).toContain(k));
                Object.keys(block.requiresSkill ?? {}).forEach(s => expect(SKILLS.has(s), `${t.name} : ${s}`).toBe(true));
            }
        }
    });

    it('conditions alignées sur le vault (D-12)', () => {
        const t = (name) => TRAITS.find(x => x.name === name);
        expect(t('Banni').maxCarac).toEqual({ chance: 1 });
        expect(t('Banni').requirements).toBeUndefined();
        expect(t('Langue de serpent').requirements).toBeUndefined();
        expect(t('Connaissance des runes').requiresAny).toHaveLength(3);
        expect(t('Survivant miraculeux').requiresAny).toHaveLength(2);
        expect(t('Huskarl').requiresSkill).toEqual({ 'Combat CàC (armé)': 2 });
    });
});

describe('runes (annexe C)', () => {
    it('Futhark de 24 runes aux noms et symboles uniques', () => {
        expect(RUNES).toHaveLength(24);
        expect(unique(RUNES.map(r => r.name))).toBe(true);
        expect(unique(RUNES.map(r => r.symbol))).toBe(true);
    });
});

describe('équipement (annexe D)', () => {
    it('noms uniques, catégories valides, prérequis sur des caractéristiques existantes', () => {
        expect(unique(ITEMS.map(i => i.name))).toBe(true);
        for (const i of ITEMS) {
            expect(['weapon', 'armor', 'item'], i.name).toContain(i.category);
            Object.keys(i.requirements ?? {}).forEach(k => expect(CARACS, `${i.name} : ${k}`).toContain(k));
        }
    });

    it('armes : type et dégâts ; armures : valeur de protection', () => {
        for (const w of ITEMS.filter(i => i.category === 'weapon')) {
            expect(w.weaponType, w.name).toBeTruthy();
            expect(w.damage, w.name).toBeGreaterThan(0);
        }
        for (const a of ITEMS.filter(i => i.category === 'armor')) {
            expect(typeof a.armorValue, a.name).toBe('number');
        }
    });

    it('armes en acier du vault présentes (post 830)', () => {
        const acier = ITEMS.filter(i => i.material === 'Acier').map(i => i.name);
        expect(acier).toEqual(['Épée (Acier)', 'Scramasaxe (Acier)', 'Épée longue (Acier)', 'Grande hache (Acier)']);
    });
});
