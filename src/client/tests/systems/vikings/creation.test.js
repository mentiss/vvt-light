// src/client/tests/systems/vikings/creation.test.js
// ─────────────────────────────────────────────────────────────────────────────
// Règles de l'assistant de création (systems/vikings/config/creation.js).
// Cas tirés de documentations/spec_vikings.md §4 et spec_vikings_pierre_peinte.md §9
// (navigation libre : étapes « à finir » et « à revoir », ce qui manque avant de créer).
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import {
    TRAITS, getCreationBudget, getTraitState, getInvalidTraits, getCreationStepStatus,
    getCreationMissing, getStartingValues, matchesSearch, getCreationKit, getCreationInventory, STEP, EMPTY_GEAR,
} from '../../../src/systems/vikings/config.jsx';

const trait = (name) => TRAITS.find(t => t.name === name);

// Personnage complet : 14 points de caracs, 10 de compétences, Connaissance des runes (5 points)
const complete = () => ({
    prenom: 'Ragnhild', nom: 'Thorvald', sexe: 'femme',
    force: 3, agilite: 2, perception: 3, intelligence: 2, charisme: 2, chance: 2,
    skills: [
        { name: 'Combat CàC (armé)', specialization: 'hache', level: 3 },
        { name: 'Ferronnerie', level: 3 }, { name: 'Chant', level: 2 }, { name: 'Survie', level: 2 },
    ],
    traits: [trait('Berserk'), trait('Connaissance des runes')],
    runes: [{ name: 'Tiwaz', level: 2 }, { name: 'Algiz', level: 2 }, { name: 'Kauno', level: 1 }],
    sagaTotale: 1,
});

describe('getCreationBudget', () => {
    it('14 points de caractéristiques, 1 d’office dans chacune : 8 à placer au départ', () => {
        const b = getCreationBudget({ force: 1, agilite: 1, perception: 1, intelligence: 1, charisme: 1, chance: 1, skills: [], traits: [], runes: [] });
        expect(b.caracLeft).toBe(8);
        expect(b.skillLeft).toBe(10);
        expect(b.runeBook).toBe(0);
    });
    it('livre de sort = points de runes des traits choisis', () => {
        const b = getCreationBudget(complete());
        expect(b).toMatchObject({ caracLeft: 0, skillLeft: 0, runeBook: 5, runeSpent: 5, runeLeft: 0 });
    });
});

describe('getTraitState', () => {
    it('trait hors de portée : la raison est donnée', () => {
        const c = { ...complete(), force: 1, traits: [] };
        expect(getTraitState(c, trait('Borgne'))).toEqual({ unavailable: true, reason: 'Nécessite Force 2+' });
    });
    it('incompatibilité avec un trait choisi', () => {
        const s = getTraitState(complete(), trait('Insaisissable'));
        expect(s.unavailable).toBe(true);
        expect(s.reason).toBe('Incompatible avec Berserk');
    });
    it('4 traits au plus', () => {
        const c = { ...complete(), traits: ['Berserk', 'Connaissance des runes', 'Borgne', 'Tatouage'].map(trait) };
        expect(getTraitState(c, trait('Vue perçante')).reason).toBe('4 traits déjà choisis');
    });
    it('trait choisi devenu hors de portée après une baisse de carac : à revoir', () => {
        const c = { ...complete(), force: 1, traits: [trait('Borgne')] };
        expect(getTraitState(c, trait('Borgne'))).toEqual({ selected: true, invalid: true, reason: 'Nécessite Force 2+' });
        expect(getInvalidTraits(c).map(t => t.name)).toEqual(['Borgne']);
    });
});

describe('getCreationStepStatus', () => {
    it('personnage complet : toutes les étapes faites', () => {
        const steps = [STEP.caracs, STEP.skills, STEP.traits, STEP.runes, STEP.gear, STEP.identity];
        expect(steps.map(s => getCreationStepStatus(complete(), s))).toEqual(['done', 'done', 'done', 'done', 'done', 'done']);
    });
    it('sans livre de sort, l’étape Runes est sautée', () => {
        const c = { ...complete(), traits: [trait('Berserk'), trait('Borgne')], runes: [] };
        expect(getCreationStepStatus(c, STEP.runes)).toBe('skipped');
    });
    it('trait hors de portée ou trop de points de runes : à revoir', () => {
        expect(getCreationStepStatus({ ...complete(), skills: complete().skills.filter(s => s.name !== 'Chant') }, STEP.traits)).toBe('invalid');
        expect(getCreationStepStatus({ ...complete(), traits: [trait('Berserk'), trait('Borgne')] }, STEP.runes)).toBe('invalid');
    });
});

describe('getCreationMissing', () => {
    it('rien ne manque : la création est possible', () => {
        expect(getCreationMissing(complete())).toEqual([]);
    });
    it('liste ce qui manque, avec l’étape où le régler', () => {
        const c = { ...complete(), intelligence: 1, prenom: '', traits: [trait('Berserk')], runes: [] };
        expect(getCreationMissing(c).map(m => m.step)).toEqual([STEP.caracs, STEP.traits, STEP.identity]);
        expect(getCreationMissing(c)[0].text).toBe('1 point de caractéristiques à placer');
    });
});

describe('getStartingValues', () => {
    it('SAGA de départ 1 + les « SAGA +N » des traits (D-9, D-11)', () => {
        const v = getStartingValues({ ...complete(), traits: [trait('Berserk'), trait('Borgne')] });
        expect(v.bonus).toBe(1);
        expect(v.saga).toBe(2);
    });
    it('valeurs de combat dérivées des traits', () => {
        expect(getStartingValues({ ...complete(), traits: [trait('Leader né')] }).actions).toBe(2);
    });
});

describe('matchesSearch', () => {
    it('insensible à la casse et aux accents (§4.1)', () => {
        expect(matchesSearch('foret', 'Forêt profonde')).toBe(true);
        expect(matchesSearch('', 'n’importe quoi')).toBe(true);
    });
});

// Kit de départ (spec_vikings_pierre_peinte.md §9.5, tables du MJ)
describe('getCreationKit', () => {
    const names = (kit) => kit.items.map(i => i.name);
    it('le métier donne ses outils ; une compétence de combat ne donne aucune arme', () => {
        const kit = getCreationKit(complete());
        expect(names(kit)).toContain('Outils de forgeron');
        expect(names(kit)).not.toContain('Hache');
        expect(names(kit)).toEqual(expect.arrayContaining(['Briquet et pierre à feu', 'Provisions (semaine)', 'Peau de bête', 'Champignons de transe', 'Outils de graveur']));
    });
    it('armes et armures équipées, outils au sac (la hache de bûcheron est une arme de fortune rangée au sac)', () => {
        const c = { ...complete(), skills: [{ name: 'Bûcheron', level: 1 }], traits: [trait('Berserk')] };
        const items = getCreationKit(c).items;
        expect(items.find(i => i.name === 'Hache de bûcheron')).toMatchObject({ category: 'weapon', damage: 1, location: 'bag' });
        expect(items.find(i => i.name === 'Peau de bête')).toMatchObject({ category: 'armor', location: 'equipped' });
    });
    it('un objet donné par deux sources n’arrive qu’une fois', () => {
        const c = { ...complete(), skills: [{ name: 'Escalade', level: 1 }, { name: 'Navigation', level: 1 }], traits: [] };
        const kit = getCreationKit(c);
        expect(names(kit).filter(n => n === 'Corde (10m)')).toHaveLength(1);
        expect(kit.lines[1].rows[0].duplicateOf).toBe('Escalade');
    });
    it('un choix reste à faire tant qu’il n’est pas fait, puis donne l’objet choisi', () => {
        const c = { ...complete(), traits: [trait('Huskarl')] };
        expect(getCreationKit(c).pending).toHaveLength(2);
        const kit = getCreationKit(c, { ...EMPTY_GEAR, pick: { 'Huskarl#0': 1, 'Huskarl#1': 0 } });
        expect(kit.pending).toEqual([]);
        expect(names(kit)).toEqual(expect.arrayContaining(['Casque', 'Lance']));
    });
    it('un objet retiré ne part pas', () => {
        const kit = getCreationKit(complete(), { ...EMPTY_GEAR, off: ['Ferronnerie#0'] });
        expect(names(kit)).not.toContain('Outils de forgeron');
    });
    it('argent : rien pour un ancien esclave, doublé pour un fin négociant, plus l’argent choisi par Noble lignée', () => {
        const base = getCreationKit(complete()).silver.total;
        expect(base).toBeGreaterThan(0);
        expect(getCreationKit({ ...complete(), traits: [trait('Ancien esclave')] }).silver.total).toBe(0);
        expect(getCreationKit({ ...complete(), traits: [trait('Fin négociant')] }).silver.total).toBe(2 * base);
        const noble = getCreationKit({ ...complete(), traits: [trait('Noble lignée')] }, { ...EMPTY_GEAR, pick: { 'Noble lignée#0': 1 } });
        const gift = noble.lines[noble.lines.length - 1].rows[0].options[1].silver;
        expect(noble.silver.total).toBe(base + gift);
    });
    it('achats au prix du catalogue ; l’argent restant part dans la bourse', () => {
        const gear = { ...EMPTY_GEAR, bought: ['Provisions (semaine)', 'Provisions (semaine)'] };
        const kit = getCreationKit(complete(), gear);
        expect(kit.silver.spent).toBe(4);   // 2 × 2 oz
        expect(kit.silver.left).toBe(kit.silver.total - 4);
        const inventory = getCreationInventory(complete(), gear);
        expect(inventory.filter(i => i.name === 'Provisions (semaine)').map(i => i.quantity)).toEqual([1, 2]);
        expect(inventory.find(i => i.name === "Once d'argent").quantity).toBe(kit.silver.left);
    });
    it('objets à nommer : objet libre du joueur ; arme de famille : l’arme choisie, sous son nom', () => {
        const c = { ...complete(), traits: [trait('Maître des bêtes'), trait('Dernier de la lignée')] };
        expect(getCreationKit(c).pending).toHaveLength(2);
        const kit = getCreationKit(c, { ...EMPTY_GEAR, pick: { 'Dernier de la lignée#0': 1 }, names: { 'Maître des bêtes#0': 'Freki', 'Dernier de la lignée#0': 'Mord-Glace' } });
        expect(kit.items.find(i => i.name === 'Freki')).toMatchObject({ customItem: true, location: 'bag' });
        expect(kit.items.find(i => i.name === 'Mord-Glace')).toMatchObject({ category: 'weapon', location: 'equipped', notes: 'Arme de famille (Lance)' });
    });
});
