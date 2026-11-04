// src/client/src/systems/nimble/hooks/useNbActions.js
// ─────────────────────────────────────────────────────────────────────────────
// Actions de jeu d'une fiche : chacune applique une règle pure
// (config/rules/actions.js, items.js, levelUp.js) et enregistre le patch tout
// de suite. Sert à la fiche joueur et à la fiche MJ (patch différent).
//
// const act = useNbActions({ character, patch });
//   patch(objet) : enregistre les champs modifiés (PUT joueur ou PATCH MJ)
// ─────────────────────────────────────────────────────────────────────────────

import * as A from '../config/rules/actions.js';
import { toggleEquip } from '../config/rules/items.js';
import { applyLevelUp } from '../config/rules/levelUp.js';

export const useNbActions = ({ character: c, patch }) => {
    const items = c?.items ?? [];
    const setItems = (next) => patch({ items: next });
    return {
        patch,
        // Santé
        clickWound:   (n) => patch(A.clickWound(c, n)),
        takeDamage:   (opts) => { const r = A.takeDamage(c, opts); patch(r.patch); return r; },
        heal:         (amount) => patch(A.heal(c, amount)),
        setTempHp:    (value) => patch(A.setTempHp(value)),
        toggleDying:  () => patch({ dying: !c.dying }),
        // Combat
        startCombat:  (actions) => patch(A.startCombat(actions)),
        spend:        (count, opts) => patch(A.spendActions(c, count, opts)),
        clickAction:  (n) => patch(A.clickAction(c, n)),
        endTurn:      () => patch(A.endTurn()),
        endEncounter: () => patch(A.endEncounter(c)),
        // Ressources, usages, états
        setResource:  (key, value) => patch(A.setResource(c, key, value)),
        clickUse:     (id, n) => patch(A.clickUse(c, id, n)),
        toggleCondition: (key) => patch(A.toggleCondition(c, key)),
        // Repos et progression
        fieldRest:    (r) => patch(A.fieldRest(c, r)),
        safeRest:     () => patch(A.safeRest(c)),
        levelUp:      (choices) => patch(applyLevelUp(c, choices)),
        // Inventaire et bourse
        addItems:     (list) => setItems([...items, ...list]),
        toggleEquip:  (id) => setItems(toggleEquip(items, id)),
        setQuantity:  (id, quantity) => setItems(items.map(it => (it.id === id ? { ...it, quantity } : it))),
        removeItem:   (id) => setItems(items.filter(it => it.id !== id)),
        setPurse:     (gold, silver) => patch({ gold: Math.max(0, gold), silver: Math.max(0, silver) }),
    };
};
