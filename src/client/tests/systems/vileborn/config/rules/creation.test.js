// tests/systems/vileborn/config/rules/creation.test.js
// Création (spec_vileborn.md §3.2) : répartitions des prétirés, placement des
// dés, ce qui reste à faire, corps envoyé au serveur.
import { describe, it, expect } from 'vitest';
import {
    INITIAL_CREATION, remainingDice, diceChoices, assignDie, chooseDistribution, chooseOrigin,
    creationTodo, isCreationComplete, buildCharacterPayload,
} from '../../../../../src/systems/vileborn/config/rules/creation.js';

const withDist = (index) => chooseDistribution(INITIAL_CREATION, index);

describe('Approches : répartition puis placement des dés', () => {
    it('chaque dé de la répartition se place une fois', () => {
        let ws = withDist(0);                       // d10, d8, d8, d6, d6, d6
        ws = assignDie(ws, 'influence', 10);
        expect(remainingDice(ws)).toEqual([8, 8, 6, 6, 6]);
        expect(diceChoices(ws, 'force')).toEqual([8, 6]);         // plus de d10 ailleurs
        expect(diceChoices(ws, 'influence')).toEqual([10, 8, 6]); // la sienne reste proposée
        ws = assignDie(ws, 'force', 10);                          // refusé : plus de d10
        expect(ws.dice.force).toBeUndefined();
    });
    it('recliquer sa taille la retire ; changer de taille rend l\'ancienne', () => {
        let ws = assignDie(withDist(1), 'will', 8);
        ws = assignDie(ws, 'will', 6);
        expect(ws.dice.will).toBe(6);
        expect(remainingDice(ws)).toEqual([8, 8, 8, 8, 6]);
        ws = assignDie(ws, 'will', 6);
        expect(ws.dice.will).toBeUndefined();
    });
    it('changer de répartition remet les dés à placer', () => {
        const ws = chooseDistribution(assignDie(withDist(0), 'force', 10), 1);
        expect(ws.dice).toEqual({});
        expect(remainingDice(ws)).toEqual([8, 8, 8, 8, 6, 6]);
    });
});

describe('Ce qui reste à faire', () => {
    const complete = () => {
        let ws = chooseOrigin({ ...withDist(0), heritageKey: 'chantesang' }, 'noble');
        [['influence', 10], ['reason', 8], ['precision', 8], ['force', 6], ['will', 6], ['subterfuge', 6]]
            .forEach(([k, d]) => { ws = assignDie(ws, k, d); });
        return { ...ws, personality: ['Raffiné', 'Courageux'], training: ['Escrime', 'Étiquette'], resourceName: 'Anneau sigillaire', prenom: 'Raphaël', nom: 'de Normante', playerName: 'Joueur' };
    };
    it('un personnage complet n\'a plus rien à faire', () => {
        expect(isCreationComplete(complete())).toBe(true);
    });
    it('les manques sont rangés par onglet', () => {
        const todo = creationTodo({ ...complete(), training: ['Escrime', ' '], prenom: '', nom: '' });
        expect(todo.words).toEqual(['1 mot de formation']);
        expect(todo.identity).toEqual(['le prénom du Paria', 'le nom du Paria']);
        expect(todo.approaches).toEqual([]);
        expect(creationTodo(INITIAL_CREATION).approaches).toEqual(['choisir une répartition']);
    });
    it('corps envoyé : dés, mots, dons de l\'héritage, ressource, devoir par défaut', () => {
        const p = buildCharacterPayload({ ...complete(), duty: '' });
        expect(p).toMatchObject({ prenom: 'Raphaël', nom: 'de Normante', dieInfluence: 10, dieForce: 6, heritageName: 'Chantesang', urge: 'Boire du sang humain', originName: 'Noble', duty: 'Achever votre formation' });
        expect(p.words.map(w => [w.kind, w.position, w.label])).toEqual([
            ['personality', 0, 'Raffiné'], ['personality', 1, 'Courageux'], ['training', 0, 'Escrime'], ['training', 1, 'Étiquette'],
        ]);
        expect(p.gifts.map(g => g.giftKey)).toEqual(['heart_cannot_lie', 'blood_power']);
        expect(p.resources).toEqual([{ name: 'Anneau sigillaire', effect: '' }]);
    });
});
