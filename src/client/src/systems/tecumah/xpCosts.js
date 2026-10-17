// src/client/src/systems/tecumah/xpCosts.js
// ─────────────────────────────────────────────────────────────────────────────
// Barème de dépense des PP (Points de Personnage) — spec_tecumah_gulch §5.4.
// Réexporté par config.jsx : importer depuis config, pas depuis ce fichier.
//
// « Dés actuels » = Math.floor(pips / 3) de la valeur améliorée seule
// (compétence seule, sans l'attribut parent — validé par le MJ).
// ─────────────────────────────────────────────────────────────────────────────

const dice = (pips) => Math.floor((pips ?? 0) / 3);

/**
 * Coût en PP d'une amélioration.
 * @param {'new_skill'|'skill_pip'|'attr_pip'|'background'} type
 * @param {number} [value] pips actuels (compétence / attribut) ou niveau actuel (background)
 * @returns {number|null} null si type inconnu
 */
export function getCost(type, value = 0) {
    switch (type) {
        case 'new_skill':  return 8;                    // débloquer une compétence à 1D
        case 'skill_pip':  return dice(value) * 2;      // +1 pip compétence
        case 'attr_pip':   return dice(value) * 3;      // +1 pip attribut
        case 'background': return (value ?? 1) * 2;     // +1 niveau background
        default:           return null;
    }
}
