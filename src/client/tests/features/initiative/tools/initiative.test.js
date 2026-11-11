// tests/tools/initiative.test.js
// Fonctions pures de l'initiative (documentations/spec_initiative.md §9.5, §7.7, §9.11).
import { describe, it, expect } from 'vitest';
import {
    createInitiative, makeParticipant, start, addParticipants, next, designate, keepHand, keepableSide,
    delay, enter, toReserve, moveParticipant, updateParticipant, removeParticipant, sortByInitiative,
    woundFromRatio, visibleTo, applyNpcChange,
} from '@/features/initiative/tools/initiative.js';

const pc = (key, initiative = null, extra = {}) => makeParticipant({ key, kind: 'character', refId: 1, name: key, initiative, ...extra });
const npc = (key, initiative = null, extra = {}) => makeParticipant({ key, kind: 'npc', refId: 1, name: key, initiative, ...extra });

/** Clés dans l'ordre de passage, en appuyant sur Suivant jusqu'au tour suivant. */
function playRound(state) {
    const order = [];
    let s = state;
    const round = s.round;
    while (s.round === round && order.length < 50) {
        if (!s.activeKey) break;
        order.push(s.activeKey);
        s = next(s);
    }
    return { order, state: s };
}

describe('mode trié (Delta Green)', () => {
    const base = () => start(addParticipants(createInitiative({ mode: 'order' }), [pc('voss', 11), pc('harper', 14), npc('cultiste', 13)]));

    it('range par initiative décroissante et commence par le plus haut', () => {
        const s = base();
        expect(s.participants.map(p => p.key)).toEqual(['harper', 'cultiste', 'voss']);
        expect(s.activeKey).toBe('harper');
    });

    it('Suivant fait le tour puis passe au tour 2', () => {
        const { order, state } = playRound(base());
        expect(order).toEqual(['harper', 'cultiste', 'voss']);
        expect(state.round).toBe(2);
        expect(state.activeKey).toBe('harper');
        expect(state.participants.every(p => p.acted === 0)).toBe(true);
    });

    it('le tri est stable pour les égalités et met les valeurs vides à la fin', () => {
        const s = sortByInitiative({ ...createInitiative(), participants: [pc('a', 10), pc('b'), pc('c', 10), pc('d', 12)] });
        expect(s.participants.map(p => p.key)).toEqual(['d', 'a', 'c', 'b']);
    });

    it('saisir une valeur range la bande (Q-6)', () => {
        const s = updateParticipant(base(), 'voss', { initiative: 20 });
        expect(s.participants[0].key).toBe('voss');
    });

    it('une action retardée passe après les autres, puis revient avant le changement de tour (Q-16)', () => {
        let s = delay(base());                       // harper retarde
        expect(s.activeKey).toBe('cultiste');
        s = next(s);                                 // cultiste agit
        s = next(s);                                 // voss agit → harper, en attente, est proposé
        expect(s.activeKey).toBe('harper');
        expect(s.round).toBe(1);
        s = next(s);
        expect(s.round).toBe(2);
    });

    it('le MJ peut faire agir n\'importe qui', () => {
        expect(designate(base(), 'voss').activeKey).toBe('voss');
    });
});

describe('mode camps, 2D20 (Dune, Achtung)', () => {
    const base = () => start(addParticipants(createInitiative({ mode: 'sides', alternate: true, opening: 'players' }),
        [pc('a'), pc('b'), pc('c'), npc('x'), npc('y')]));

    it('le camp qui ouvre a la main ; le MJ désigne parmi plusieurs candidats', () => {
        const s = base();
        expect(s.hand).toBe('players');
        expect(s.activeKey).toBeNull();
        expect(designate(s, 'x').activeKey).toBeNull();     // pas le camp qui a la main
        expect(designate(s, 'b').activeKey).toBe('b');
    });

    it('alternance : après un PJ, la main passe aux adversaires', () => {
        const s = next(designate(base(), 'a'));
        expect(s.hand).toBe('gm');
        expect(s.lastSide).toBe('players');
    });

    it('garder la main : choisi à la fin de l\'action, une fois par tour et par camp (§7.5, §12.5)', () => {
        let s = designate(base(), 'a');
        expect(keepableSide(s)).toBe('players');   // a agit : il peut finir en gardant la main
        s = keepHand(s);                           // action de a comptée, la main reste aux joueurs
        expect(s).toMatchObject({ hand: 'players', activeKey: null });
        expect(designate(s, 'a').activeKey).toBeNull();   // pas à lui-même : un autre personnage (Q-38)
        s = designate(s, 'b');
        expect(keepableSide(s)).toBeNull();        // déjà gardée ce tour par les joueurs
        s = designate(next(s), 'x');               // b passe la main ; x agit
        expect(keepableSide(s)).toBe('gm');        // les adversaires, eux, peuvent encore
    });

    it('pas de « garder la main » sans autre personnage du camp, ni quand l\'autre camp a fini', () => {
        const solo = start(addParticipants(createInitiative({ mode: 'sides' }), [pc('a'), npc('x'), npc('y')]));
        expect(keepableSide(designate(solo, 'a'))).toBeNull();
        let s = base();
        for (const k of ['a', 'x', 'b', 'y']) s = next(designate(s, k));
        expect(keepableSide(s)).toBeNull();        // c joue seul : les adversaires ont fini
    });

    it('un camp vidé (retrait, réserve, hors de combat) cède la main : la bande ne se bloque pas', () => {
        const two = (opening) => start(addParticipants(createInitiative({ mode: 'sides', opening }), [pc('a'), npc('x')]));
        // Cas relevé par la relecture : le PJ actif retiré laissait la main à un camp vide
        expect(removeParticipant(two('players'), 'a')).toMatchObject({ hand: 'gm', activeKey: 'x' });
        expect(toReserve(two('gm'), 'x')).toMatchObject({ hand: 'players', activeKey: 'a' });
        expect(updateParticipant(two('gm'), 'x', { wound: 'out' })).toMatchObject({ hand: 'players', activeKey: 'a' });
    });

    it('le camp en surnombre finit seul, puis tour suivant (Q-21)', () => {
        let s = base();
        for (const k of ['a', 'x', 'b', 'y']) s = next(designate(s, k));
        expect(s.hand).toBe('players');            // plus d'adversaire : les PJ enchaînent
        expect(s.activeKey).toBe('c');             // seul candidat : désigné d'office
        s = next(s);
        expect(s.round).toBe(2);
        expect(s.kept).toEqual({ players: false, gm: false });
    });
});

describe('mode camps, Fabula (§7.7)', () => {
    it('le camp d\'ouverture est le même à chaque tour', () => {
        let s = start(addParticipants(createInitiative({ mode: 'sides', opening: 'gm' }), [pc('a'), npc('x')]));
        expect(s.activeKey).toBe('x');
        s = next(s);
        expect(s.activeKey).toBe('a');
        s = next(s);
        expect(s.round).toBe(2);
        expect(s.hand).toBe('gm');
    });

    it('camp d\'ouverture vidé : le tour suivant revient à l\'autre camp, sans blocage (relecture, Q-21)', () => {
        let s = start(addParticipants(createInitiative({ mode: 'sides', opening: 'gm' }), [pc('a'), npc('x')]));
        s = updateParticipant(s, 'x', { wound: 'out' });   // le dernier adversaire tombe
        expect(s).toMatchObject({ hand: 'players', activeKey: 'a' });
        s = next(s);                                        // a finit : tour 2
        expect(s).toMatchObject({ round: 2, hand: 'players', activeKey: 'a' });
    });

    it('une Élite (2 actions) revient deux fois dans l\'alternance (exemple du livre : PJ, PNJ, PJ, PNJ, PNJ)', () => {
        let s = start(addParticipants(createInitiative({ mode: 'sides', opening: 'players' }),
            [pc('a'), pc('b'), npc('golem', 9, { actions: 2 }), npc('gob', 7)]));
        const order = [];
        for (const k of ['a', 'golem', 'b', 'gob']) { s = designate(s, k); order.push(s.activeKey); s = next(s); }
        expect(s.activeKey).toBe('golem');         // seul candidat restant
        order.push(s.activeKey);
        expect(order).toEqual(['a', 'golem', 'b', 'gob', 'golem']);
    });

    it('initiative ennemie : le PNJ le plus rapide est désigné d\'office (Q-29)', () => {
        const s = start(addParticipants(createInitiative({ mode: 'sides', opening: 'gm', enemyOrder: true }),
            [pc('a'), npc('lent', 5), npc('vif', 12)]));
        expect(s.activeKey).toBe('vif');
    });
});

describe('mode camps sans alternance (Nimble)', () => {
    it('tous les héros, puis tous les monstres', () => {
        let s = start(addParticipants(createInitiative({ mode: 'sides', alternate: false }), [pc('a'), pc('b'), npc('x'), npc('y')]));
        s = next(designate(s, 'a'));
        expect(s.hand).toBe('players');
        expect(s.activeKey).toBe('b');
        s = next(s);
        expect(s.hand).toBe('gm');
    });
});

describe('réserve, entrées, sorties (§9.11)', () => {
    const base = () => start(addParticipants(createInitiative({ mode: 'order' }),
        [pc('a', 15), npc('b', 12), npc('c', 8), npc('renforts', 10, { reserve: true })]));

    it('un participant en réserve ne compte pas', () => {
        const { order } = playRound(base());
        expect(order).toEqual(['a', 'b', 'c']);
    });

    it('entré à une place pas encore passée : il agit ce tour', () => {
        const s = enter(base(), 'renforts');
        expect(s.participants.map(p => p.key)).toEqual(['a', 'b', 'renforts', 'c']);
        expect(playRound(s).order).toEqual(['a', 'b', 'renforts', 'c']);
    });

    it('entré à une place déjà passée : il agit au tour suivant', () => {
        let s = next(next(base()));                // a et b ont agi, c actif
        s = enter(s, 'renforts');
        const { order, state } = playRound(s);
        expect(order).toEqual(['c']);
        expect(playRound(state).order).toEqual(['a', 'b', 'renforts', 'c']);
    });

    it('entrer le rend visible, même s\'il était caché', () => {
        const s = enter(updateParticipant(base(), 'renforts', { hidden: true }), 'renforts');
        expect(s.participants.find(p => p.key === 'renforts')).toMatchObject({ reserve: false, hidden: false });
    });

    it('un PJ ne va pas en réserve ; un PNJ si, et l\'actif passe au suivant', () => {
        expect(toReserve(base(), 'a').participants.find(p => p.key === 'a').reserve).toBe(false);
        const s = toReserve(next(base()), 'b');
        expect(s.activeKey).toBe('c');
    });

    it('glisser change le camp, et glisser hors de la réserve fait entrer', () => {
        const sides = start(addParticipants(createInitiative({ mode: 'sides' }), [pc('a'), npc('x'), npc('y', null, { reserve: true })]));
        expect(moveParticipant(sides, 'x', { targetKey: 'a' }).participants.find(p => p.key === 'x').side).toBe('players');
        const entered = moveParticipant(sides, 'y', { targetKey: 'x', after: true });
        expect(entered.participants.find(p => p.key === 'y')).toMatchObject({ reserve: false, side: 'gm' });
    });

    it('un PNJ hors de combat est sauté, puis sort de la bande au tour suivant ; un PJ hors de combat reste', () => {
        let s = updateParticipant(base(), 'b', { wound: 'out' });
        s = updateParticipant(s, 'a', { down: true });
        const { order, state } = playRound(s);
        expect(order).toEqual(['a', 'c']);
        expect(state.participants.map(p => p.key)).toEqual(['a', 'renforts', 'c']);   // b est sorti
    });

    it('retirer l\'actif donne la main au suivant', () => {
        expect(removeParticipant(base(), 'a').activeKey).toBe('b');
    });
});

describe('PNJ modifié à la table (§12)', () => {
    const woundOf = (npc) => (npc.state.hp <= 0 ? 'out' : npc.state.hp < 5 ? 'severe' : null);
    const base = () => start(addParticipants(createInitiative(), [pc('a', 10), npc('n7', 8), npc('n9', 5)]));

    it('la blessure suit les PV, et le nom suit le PNJ', () => {
        const s = applyNpcChange(base(), { npc: { id: 7, name: 'Garde blessé', state: { hp: 3 } } }, woundOf);
        expect(s.participants.find(p => p.key === 'n7')).toMatchObject({ wound: 'severe', name: 'Garde blessé' });
    });

    it('une blessure forcée par le MJ n\'est plus écrasée', () => {
        const forced = updateParticipant(base(), 'n7', { wound: 'light', woundForced: true });
        const s = applyNpcChange(forced, { npc: { id: 7, name: 'n7', state: { hp: 0 } } }, woundOf);
        expect(s.participants.find(p => p.key === 'n7').wound).toBe('light');
    });

    it('rien ne change : le même état est rendu (pas d\'écriture inutile)', () => {
        const s = base();
        expect(applyNpcChange(s, { npc: { id: 7, name: 'n7', state: { hp: 12 } } }, woundOf)).toBe(s);
        expect(applyNpcChange(s, { npc: { id: 99, name: 'x', state: { hp: 0 } } }, woundOf)).toBe(s);
    });

    it('table vidée pendant l\'action d\'un PNJ : plus d\'actif fantôme (relecture)', () => {
        const s = applyNpcChange(next(base()), { cleared: true });     // n7 agissait
        expect(s.participants.map(p => p.key)).toEqual(['a']);
        expect(s.activeKey === null || s.participants.some(p => p.key === s.activeKey)).toBe(true);
    });

    it('retiré de la table, ou table vidée : il sort de la bande', () => {
        expect(applyNpcChange(base(), { removedId: 9 }).participants.map(p => p.key)).toEqual(['a', 'n7']);
        expect(applyNpcChange(base(), { cleared: true }).participants.map(p => p.key)).toEqual(['a']);
    });
});

describe('blessures et vue joueur', () => {
    it.each([[1, null], [0.8, 'light'], [0.5, 'moderate'], [0.3, 'moderate'], [0.25, 'severe'], [0.1, 'severe'], [0, 'out'], [-3, 'out']])(
        'part de santé %s → %s', (ratio, level) => expect(woundFromRatio(ratio)).toBe(level));

    it('le joueur ne voit ni cachés ni réserve, ni nom ni valeur d\'un PNJ (sauf nom affiché)', () => {
        const s = addParticipants(createInitiative(), [pc('a', 12), npc('garde', 9, { publicName: 'Officier' }),
            npc('tireur', 15, { hidden: true }), npc('renforts', 10, { reserve: true })]);
        const seen = visibleTo(s, 'player').participants;
        expect(seen.map(p => p.key)).toEqual(['a', 'garde']);
        expect(seen[0]).toMatchObject({ name: 'a', initiative: null });
        expect(seen[1]).toMatchObject({ name: 'Officier', initiative: null });
        expect(visibleTo(s, 'gm')).toBe(s);
    });

    it('les fonctions ne modifient jamais l\'état reçu', () => {
        const s = start(addParticipants(createInitiative(), [pc('a', 2), pc('b', 1)]));
        const snapshot = JSON.stringify(s);
        next(s); delay(s); updateParticipant(s, 'a', { initiative: 0 }); removeParticipant(s, 'a');
        expect(JSON.stringify(s)).toBe(snapshot);
    });
});
