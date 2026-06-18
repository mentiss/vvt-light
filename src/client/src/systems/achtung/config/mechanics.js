// src/client/src/systems/achtung/config/mechanics.js
// Calculs dérivés du système (dégâts, résistances, stress, armure, courage,
// langues bonus, coût des dés, comptage succès / dommages).

export const WEAPON_RANGES = ['Close', 'Short', 'Medium', 'Long'];
export const WEAPON_SIZES  = ['Minor', 'Major'];

export function getBonusDamage(value) {
    if (value <= 8)  return 0;
    if (value === 9) return 1;
    if (value <= 11) return 2;
    if (value <= 13) return 3;
    if (value <= 15) return 4;
    return 5;
}

export function getResistance(value) {
    return getBonusDamage(value);
}

// Stress = max(Brawn, Will) + Resilience
export function computeStress(attrs, skills) {
    const brawn      = attrs.find(a => a.key === 'brawn')?.value     ?? 6;
    const will       = attrs.find(a => a.key === 'will')?.value      ?? 6;
    const resilience = skills.find(s => s.key === 'resilience')?.rank ?? 0;
    return Math.max(brawn, will) + resilience;
}

// Armour = resistance based on Brawn
export function computeArmour(attrs) {
    const brawn = attrs.find(a => a.key === 'brawn')?.value ?? 6;
    return getResistance(brawn);
}

// Courage = resistance based on Will
export function computeCourage(attrs) {
    const will = attrs.find(a => a.key === 'will')?.value ?? 6;
    return getResistance(will);
}

// Bonus languages from Reason
export function getBonusLanguages(attrs) {
    const reason = attrs.find(a => a.key === 'reason')?.value ?? 6;
    if (reason >= 11) return 2;
    if (reason >= 9)  return 1;
    return 0;
}

// ── Coût des dés supplémentaires (cumulatif global) ───────────────────────────
// 1er dé supplémentaire = 1, 2e = 2, 3e = 3 (Momentum ou Threat, source mixable)
export const EXTRA_DIE_COST = [1, 2, 3];

// ── Calcul succès — jet de compétence 2D20 ────────────────────────────────────
// expertiseApplied : déclaré explicitement par le joueur après le jet
// (la compétence peut avoir un focus sans que celui-ci soit applicable à l'action)

export function countSuccesses(results, target, skillRank, expertiseApplied) {
    let successes     = 0;
    let complications = 0;
    for (const val of results) {
        if (val === 20) {
            complications++;
        } else if (val === 1) {
            // 1 naturel = toujours 2 succès, même sans expertise, même compétence à 0
            successes += 2;
        } else if (val <= target) {
            // Double succès uniquement si l'expertise est déclarée applicable ET val ≤ rang
            successes += (expertiseApplied && val <= skillRank) ? 2 : 1;
        }
    }
    return { successes, complications };
}

// ── Calcul dommages — dés de Challenge (d6) ───────────────────────────────────

export function countChallengeDice(results, salvo = '') {
    let stress  = 0;
    let effects = 0;
    const salvoUpper = salvo.toUpperCase();
    for (const val of results) {
        if (val === 1)      { stress += 1; }
        else if (val === 2) { stress += 2; }
        else if (val === 3 || val === 4) { /* 0 */ }
        else if (val === 5 || val === 6) {
            if (salvoUpper.includes('VICIOUS') && val === 5) {
                stress += 2;
            } else {
                stress += 1;
                effects += 1;
            }
        }
    }
    return { stress, effects };
}