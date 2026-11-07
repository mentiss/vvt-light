// tests/systems/cyberpunk/config/rules/creationRules.test.js
// Règles de la création (spec_cyberpunk.md §9) : chrome autorisé (Assassin 2,
// Chromé sauf Techie, console du Netrunner), défauts du cyberware offert, kit selon
// les manœuvres (sphère du Techie, spécialisation de l'Edgerunner, deck externe),
// achats en Cred par lot, tags verrouillés posés par les manœuvres.
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import {
    chromeAllowance, cyberwareDefects, resolveKit, moveGear, tagChoicesOf, findCyberware, findItem,
    purchaseCost, remainingCred, canBuy, purchaseQuantity, purchaseDefects, buildMoveTag,
    stepRemaining, stepReachable, incompleteSteps, playbookStatProfile, withDetail, splitChoice, chosenOptions, isMoveTag, consoleTarget, freeChromeSlots, chromeRemaining, moveTagsRemaining, gearRemaining, buildCreationPayload,
} from '../../../../../src/systems/cyberpunk/config.jsx';

describe('chrome autorisé', () => {
    it('un cyberware d\'archétype, un offert, un fashionware ; deux pour l\'Assassin', () => {
        expect(chromeAllowance('Solo')).toEqual({ archetype: 1, console: false, offered: 1, chrome: 0, cosmetic: 1 });
        expect(chromeAllowance('Assassin').archetype).toBe(2);
    });
    it('Chromé donne un cyberware de plus, sauf le Chromé du Techie', () => {
        expect(chromeAllowance('Fixer', ['Chromé']).chrome).toBe(1);
        expect(chromeAllowance('Techie', ['Chromé']).chrome).toBe(0);
    });
    it('le Netrunner a sa console imposée en plus', () => {
        expect(chromeAllowance('Netrunner').console).toBe(true);
    });
});

describe('défauts du cyberware offert', () => {
    it('1 par défaut, selon le catalogue sinon, 0 pour le fashionware', () => {
        expect(cyberwareDefects('Branchies (Gills)')).toBe(1);
        expect(cyberwareDefects('Kerenzikov (Réflexes passifs)')).toBe(3);
        expect(cyberwareDefects('Techhair (Fibre optique)')).toBe(0);
    });
});

describe('choix de tags', () => {
    it('le Cyberarmement de corps impose un type', () => {
        const [choice] = tagChoicesOf(findCyberware('Cyberarmement de corps'));
        expect(choice.pick).toBe(1);
        expect(choice.from.map(t => t.text)).toContain('+Lames Mantis');
    });
    it('la chip daemon propose les daemons de l\'aide de jeu', () => {
        const [choice] = tagChoicesOf(findItem('Chip daemon'));
        expect(choice.from[0]).toEqual({ text: '+Daemon briseur de glace', variant: 'neutral' });
    });
});

describe('kit', () => {
    it('objet seul = imposé ; groupe à choix sinon', () => {
        const kit = resolveKit('Fixer');
        expect(kit.find(g => g.id === 'comm')).toMatchObject({ fixed: true, pick: 1 });
        expect(kit.find(g => g.id === 'arme')).toMatchObject({ fixed: false, pick: 1 });
    });
    it('deck externe seulement avec la Prise de console', () => {
        expect(resolveKit('Netrunner', { console: 'Cyberconsole intégrée (Deck)' }).some(g => g.id === 'deck')).toBe(false);
        expect(resolveKit('Netrunner', { console: 'Prise de console' }).some(g => g.id === 'deck')).toBe(true);
    });
    it('Techie sans Expert : outil standard', () => {
        expect(resolveKit('Techie', { picks: ['Médecin'] }).find(g => g.id === 'outil').label).toBe('Outil');
    });
    it('Techie avec Expert : l\'outillage de la sphère remplace l\'outil', () => {
        const outil = resolveKit('Techie', { moves: ['Expert'], picks: ['Médecin'] }).find(g => g.id === 'outil');
        expect(outil).toMatchObject({ label: 'Outillage : Médecin', fixed: true });
        expect(outil.from.map(e => e.name)).toEqual(['Kit médical d\'urgence', 'Airhypo (Injecteur rapide)']);
    });
    it('deux sphères : outillage de l\'une ou de l\'autre', () => {
        const outil = resolveKit('Techie', { moves: ['Expert', 'Intérêts diversifiés'], picks: ['Médecin', 'Mécano'] }).find(g => g.id === 'outil');
        expect(outil.options.map(o => o.key)).toEqual(['Médecin', 'Mécano']);
        expect(outil.options[1].from[0]).toEqual({ name: 'Trousse spécialisée', tags: [{ text: '+mécanique', variant: 'neutral' }] });
    });
    it('Edgerunner CQC : une arme blanche au choix à la place du soutien', () => {
        const soutien = resolveKit('Edgerunner', { moves: ['Spécialisation opérationnelle'], picks: ['Combat rapproché / CQC'] }).find(g => g.id === 'soutien');
        expect(soutien).toMatchObject({ pick: 1, fixed: false });
        expect(soutien.from).toHaveLength(4);
    });
    it('matos personnalisé : Rig sur le véhicule du Nomad', () => {
        expect(moveGear('Nomad', ['Rig', 'Contacts'])).toEqual([
            expect.objectContaining({ move: 'Rig', kind: 'customize', group: 'vehicule', tags: 3, named: true }),
        ]);
    });
});

describe('achats en Cred', () => {
    // Les prix sont fixés par le MJ dans le catalogue : les tests posent les leurs
    const FIELDS = ['price', 'quantity', 'negative_tags'];
    const fixture = {
        'Grenades à fragmentation': { price: 2, quantity: 3 },
        'Couteau': { price: 1, negative_tags: [{ text: '+émoussé', variant: 'negative' }] },
        'Moto': {},
    };
    const saved = {};
    beforeAll(() => Object.entries(fixture).forEach(([n, f]) => {
        const it = findItem(n);
        saved[n] = Object.fromEntries(FIELDS.map(k => [k, it[k]]));
        FIELDS.forEach(k => { it[k] = f[k]; });
    }));
    afterAll(() => Object.entries(saved).forEach(([n, f]) => Object.assign(findItem(n), f)));

    it('défaut à prendre pour un achat à prix de création ; aucun sans liste', () => {
        expect(purchaseDefects('Couteau')).toEqual([{ text: '+émoussé', variant: 'negative' }]);
        expect(purchaseDefects('Grenades à fragmentation')).toEqual([]);
    });

    it('prix par lot, lots cumulés ; sans prix = ignoré', () => {
        const purchases = [{ name: 'Grenades à fragmentation', lots: 2 }, { name: 'Couteau', lots: 1 }, { name: 'Moto', lots: 1 }];
        expect(purchaseCost(purchases)).toBe(5);
        expect(remainingCred(purchases)).toBe(0);
        expect(purchaseQuantity('Grenades à fragmentation')).toBe(3);
    });
    it('achat refusé au-delà de la Cred restante ou sans prix', () => {
        expect(canBuy('Couteau', [{ name: 'Grenades à fragmentation', lots: 2 }])).toBe(true);
        expect(canBuy('Grenades à fragmentation', [{ name: 'Grenades à fragmentation', lots: 2 }])).toBe(false);
        expect(canBuy('Moto')).toBe(false);
    });
});

describe('stats des manœuvres d\'un playbook', () => {
    it('comptées depuis les manœuvres, sans les manœuvres sans jet ni celles des autres playbooks', () => {
        const moves = [
            { playbook: 'Assassin', stat: 'pro' }, { playbook: 'Assassin', stat: 'cran' }, { playbook: 'Assassin', stat: 'pro' },
            { playbook: 'Assassin', stat: null }, { playbook: 'Solo', stat: 'chair' }, { playbook: 'Assassin', stat: 'link' },
        ];
        expect(playbookStatProfile(moves, 'Assassin')).toEqual([{ stat: 'pro', count: 2 }, { stat: 'cran', count: 1 }]);
    });
});

describe('étapes de l\'assistant', () => {
    const draft = {
        playbook: 'Solo', identity: { playerName: 'Léa', prenom: 'Kai' },
        stats: { cran: 2, pro: 1, chair: 0, esprit: 0, style: 0, synth: -2 },
        moveIds: [12, 14], directives: [{ selected: true }, { selected: true }, { selected: false }],
        relations: [{ name: 'Vex' }, { name: 'Mama Lou' }],
        chrome: { console: null, archetype: ['Kerenzikov (Réflexes passifs)'], free: ['Branchies (Gills)'], cosmetic: null },
        chromeConfig: { 'Branchies (Gills)': { defects: ['+suinte'] } },
        gear: { kit: { arme: 'Fusil d\'assaut', arme_poing: 'Pistolet lourd', arme_blanche: 'Couteau', protection: 'Gilet pare-balles' }, buys: [] },
    };
    it('choix restants par étape', () => {
        expect(stepRemaining(2, { identity: { playerName: ' ', prenom: '' } })).toBe(2);
        expect(stepRemaining(3, { stats: { cran: 2, pro: null } })).toBe(1);
        expect(stepRemaining(4, { moveIds: [1] })).toBe(1);
        expect(stepRemaining(6, { relations: [{ name: 'Vex' }, { name: '' }] })).toBe(1);
        expect(stepRemaining(6, { relations: [{ name: 'Vex' }] })).toBe(1);
        expect([1, 2, 3, 4, 5, 6, 7, 8].map(s => stepRemaining(s, draft))).toEqual([0, 0, 0, 0, 0, 0, 0, 0]);
    });
    it('seules l\'archétype, les manœuvres et le chrome bloquent la suite', () => {
        const partial = { ...draft, moveIds: [12] };
        expect(stepReachable(4, partial)).toBe(true);
        expect(stepReachable(5, partial)).toBe(false);
        expect(stepReachable(2, partial)).toBe(true);
        // Identité vide : on continue, mais la création attend
        const noName = { ...draft, identity: { playerName: '', prenom: '' } };
        expect(stepReachable(9, noName)).toBe(true);
        expect(incompleteSteps(noName)).toEqual([{ id: 2, label: 'Identité', remaining: 2 }]);
        expect(incompleteSteps(draft)).toEqual([]);
    });
});

describe('brouillon : chrome', () => {
    const base = { playbook: 'Assassin', moveObjs: [], chrome: { archetype: [], free: [] }, chromeConfig: {} };
    it('Assassin : 2 dans sa liste + 1 offert ; Chromé en ajoute un', () => {
        expect(freeChromeSlots(base)).toBe(1);
        expect(chromeRemaining(base)).toBe(3);
        expect(freeChromeSlots({ ...base, moveObjs: [{ id: 1, name: 'Chromé' }] })).toBe(2);
    });
    it('l\'offert demande ses défauts, le type imposé se choisit', () => {
        const d = { ...base, chrome: { archetype: ['Kerenzikov (Réflexes passifs)', 'Cyberarmement de corps'], free: ['Sandevistan (Accélérateur neural)'] } };
        expect(chromeRemaining(d)).toBe(3 + 1);
        const done = { ...d, chromeConfig: { 'Sandevistan (Accélérateur neural)': { defects: ['+a', '+b', '+c'] }, 'Cyberarmement de corps': { choices: { Type: ['+Lames Mantis'] } } } };
        expect(chromeRemaining(done)).toBe(0);
    });
    it('Sandevistan pris dans la liste de l\'archétype : 2 défauts à choisir (3 offert)', () => {
        expect(cyberwareDefects('Sandevistan (Accélérateur neural)', 'archetype')).toBe(2);
        expect(cyberwareDefects('Sandevistan (Accélérateur neural)', 'offered')).toBe(3);
        expect(cyberwareDefects('Kerenzikov (Réflexes passifs)', 'archetype')).toBe(0);
        const d = { ...base, chrome: { archetype: ['Sandevistan (Accélérateur neural)', 'Kerenzikov (Réflexes passifs)'], free: ['Branchies (Gills)'] },
            chromeConfig: { 'Branchies (Gills)': { defects: ['+x'] } } };
        expect(chromeRemaining(d)).toBe(2);
    });
    it('une variante choisie remplit le champ option ; une capacité devient un tag', () => {
        expect(chosenOptions(findCyberware('Cyberbras (Cyberarm)'), { choices: { Variante: ['+outils intégrés'] } })).toEqual(['Main-outil']);
        expect(chosenOptions(findCyberware('Cyberoptiques (Kiroshi)'), { choices: { Spécialisation: ['+thermique'] } })).toEqual([]);
    });
    it('le Netrunner choisit sa console', () => {
        expect(chromeRemaining({ ...base, playbook: 'Netrunner' })).toBe(1 + 1 + 1);
    });
});

describe('brouillon : matos et enregistrement', () => {
    const fixture = { 'Couteau': { price: 1, negative_tags: [{ text: '+émoussé', variant: 'negative' }] }, 'Grenades à fragmentation': { price: 1, quantity: 3, negative_tags: undefined } };
    const saved = {};
    beforeAll(() => Object.entries(fixture).forEach(([n, f]) => { const it = findItem(n); saved[n] = { price: it.price, quantity: it.quantity, negative_tags: it.negative_tags }; Object.assign(it, f); }));
    afterAll(() => Object.entries(saved).forEach(([n, f]) => Object.assign(findItem(n), f)));

    const netrunner = {
        playbook: 'Netrunner', identity: { playerName: 'Léa', prenom: 'Yuki', nom: 'Ono', sexe: '', apparence: '' },
        stats: { cran: 0, pro: 0, chair: 0, esprit: 1, style: -2, synth: 2 },
        moveIds: [7], moveObjs: [{ id: 7, name: 'Daemon' }], moveTags: { 7: 'Daemon caméra' },
        chrome: { console: 'Cyberconsole intégrée (Deck)', archetype: ['Neuralink & Comms'], free: ['Branchies (Gills)'], cosmetic: null },
        chromeConfig: { 'Branchies (Gills)': { defects: ['+suinte'] } },
        gear: {
            kit: { arme: 'Taser', outil: 'Chip daemon' },
            config: { 'kit:outil:Chip daemon': { choices: { Daemon: ['+Daemon fantôme'] } }, 'buy:a': { defect: '+émoussé' } },
            buys: [{ uid: 'a', name: 'Couteau' }, { uid: 'b', name: 'Grenades à fragmentation' }, { uid: 'c', name: 'Grenades à fragmentation' }],
        },
        directives: [], relations: [], darkSecret: '',
    };
    it('tag de manœuvre à choisir ; achats incomplets comptés', () => {
        expect(moveTagsRemaining({ ...netrunner, moveTags: {} })).toBe(1);
        expect(gearRemaining(netrunner)).toBe(0);
        expect(gearRemaining({ ...netrunner, gear: { ...netrunner.gear, config: {} } })).toBe(2);
    });
    it('corps de création : défauts, daemon verrouillé sur la console, achats, Cred restante', () => {
        const body = buildCreationPayload(netrunner);
        const deck = body.cyberware.find(c => c.name === 'Cyberconsole intégrée (Deck)');
        expect(deck.tags).toContainEqual({ tag_text: '+Daemon caméra', tag_variant: 'neutral', locked: true });
        expect(body.cyberware.find(c => c.name === 'Branchies (Gills)').tags).toContainEqual({ tag_text: '+suinte', tag_variant: 'negative', locked: false });
        expect(body.items.find(i => i.name === 'Chip daemon').tags.map(t => t.tag_text)).toContain('+Daemon fantôme');
        expect(body.items.find(i => i.name === 'Couteau').tags.map(t => t.tag_text)).toContain('+émoussé');
        expect(body.items.filter(i => i.name === 'Grenades à fragmentation')).toEqual([expect.objectContaining({ quantity: 6 })]);
        expect(body.cred).toBe(2);
    });
});

describe('tags des manœuvres', () => {
    it('contact choisi dans la liste : tag verrouillé sur le personnage', () => {
        expect(buildMoveTag('Solo', 'Contacts', 'Faussaire')).toEqual({ tag_text: '+contact : Faussaire', tag_variant: 'neutral', locked: true, on: 'character' });
    });
    it('daemon : sur la console ; tag fixe sans choix', () => {
        expect(buildMoveTag('Netrunner', 'Daemon', 'Daemon caméra').on).toBe('console');
        expect(buildMoveTag('Media', 'Carte de presse').tag_text).toBe('+figure publique');
    });
    it('retrouver le tag d\'une manœuvre pour le retirer avec elle', () => {
        const locked = (tag_text) => ({ tag_text, locked: true });
        expect(isMoveTag('Techie', 'Expert', locked('+Médecin'))).toBe(true);
        expect(isMoveTag('Techie', 'Expert', locked('+contact : Faussaire'))).toBe(false);
        expect(isMoveTag('Solo', 'Contacts', locked('+contact : Faussaire'))).toBe(true);
        expect(isMoveTag('Solo', 'Contacts', { tag_text: '+contact : Faussaire', locked: false })).toBe(false);
        expect(isMoveTag('Media', 'Carte de presse', locked('+figure publique'))).toBe(true);
    });
    it('tag sur la console : intégrée, sinon deck externe, sinon le personnage', () => {
        expect(consoleTarget({ id: 3, cyberware: [{ id: 9, name: 'Cyberconsole intégrée (Deck)' }] })).toEqual({ entityType: 'cyberware', entityId: 9 });
        expect(consoleTarget({ id: 3, cyberware: [], items: [{ id: 4, name: 'Le Corbeau', tags: [{ tag_text: '+confiscable' }] }] })).toEqual({ entityType: 'item', entityId: 4 });
        expect(consoleTarget({ id: 3 })).toEqual({ entityType: 'character', entityId: 3 });
    });
    it('élément « (choisir) » : la précision est obligatoire et remplace la mention', () => {
        expect(buildMoveTag('Assassin', 'Réseau de contacts', 'Agent corpo (choisir)')).toBeNull();
        const value = withDetail('Agent corpo (choisir)', 'Arasaka');
        expect(value).toBe('Agent corpo (Arasaka)');
        expect(buildMoveTag('Assassin', 'Réseau de contacts', value).tag_text).toBe('+contact : Agent corpo (Arasaka)');
        expect(splitChoice(['Faussaire', 'Agent corpo (choisir)'], value)).toEqual({ item: 'Agent corpo (choisir)', detail: 'Arasaka' });
        expect(isMoveTag('Assassin', 'Réseau de contacts', { tag_text: '+contact : Agent corpo (Arasaka)', locked: true })).toBe(true);
        expect(moveTagsRemaining({ playbook: 'Assassin', moveObjs: [{ id: 1, name: 'Réseau de contacts' }], moveTags: { 1: 'Agent corpo (choisir)' } })).toBe(1);
    });
    it('choix manquant ou manœuvre sans tag : rien', () => {
        expect(buildMoveTag('Fixer', 'Mon équipe', '  ')).toBeNull();
        expect(buildMoveTag('Solo', 'Repérage', 'x')).toBeNull();
    });
});
