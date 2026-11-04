// tests/tools/boardRights.test.js
// Droits sur le tableau (documentations/spec_tableau.md §10.2), mêmes règles que le serveur
import { describe, it, expect } from 'vitest';
import { BOARD_PALETTE, canDelete, canDraw, canMove, participantColor } from '../../src/tools/boardRights.js';

const closed = { playersDraw: false, playersMove: false };
const open = { playersDraw: true, playersMove: true };
const item = (kind, locked = false) => ({ kind, locked });

describe('droits des joueurs', () => {
    it('dessin selon le réglage de la diapositive ; le MJ dessine toujours', () => {
        expect(canDraw(false, closed)).toBe(false);
        expect(canDraw(false, open)).toBe(true);
        expect(canDraw(true, closed)).toBe(true);
    });

    it('gomme des joueurs : traits et rectangles seulement (P-4)', () => {
        expect(canDelete(false, open, item('stroke'))).toBe(true);
        expect(canDelete(false, open, item('rect'))).toBe(true);
        expect(canDelete(false, open, item('token'))).toBe(false);
        expect(canDelete(false, open, item('image'))).toBe(false);
        expect(canDelete(false, closed, item('stroke'))).toBe(false);
        expect(canDelete(true, closed, item('token'))).toBe(true);
    });

    it('déplacement des joueurs : jetons et icônes, si permis (Q-10, Q-42)', () => {
        expect(canMove(false, open, item('token'))).toBe(true);
        expect(canMove(false, open, item('icon'))).toBe(true);
        expect(canMove(false, open, item('stroke'))).toBe(false);
        expect(canMove(false, closed, item('token'))).toBe(false);
    });

    it('un objet verrouillé ne bouge ni ne s\'efface, MJ compris (Q-41)', () => {
        expect(canMove(true, open, item('image', true))).toBe(false);
        expect(canDelete(true, open, item('rect', true))).toBe(false);
    });
});

describe('participantColor', () => {
    it('stable, prise dans la palette hors noir et blanc', () => {
        expect(participantColor(7)).toBe(participantColor(7));
        const colors = BOARD_PALETTE.slice(2).map(c => c.color);
        expect(colors).toContain(participantColor(-1));
        expect(colors).toContain(participantColor(42));
    });
});
