// src/client/src/tools/dice2d.js
// ─────────────────────────────────────────────────────────────────────────────
// Règles pures des dés 2D (spec_fabula.md §4 et §4.1, spec_diceengine_v2.md) :
//   - apparence d'un dé : une configuration au format que lit la bibliothèque 3D
//     (foreground, background, outline, edge, texture, material), résolue CHAMP
//     PAR CHAMP : dé (waves[n].colors[i]) > groupe (groups[n].color) > type de dé
//     déclaré par le slug (dice.byType) > réglages du joueur ;
//   - un jeu de couleurs nommé du joueur (mode « preset ») ramené à des couleurs ;
//   - la séquence d'animation dépliée en dés : type, valeur, apparence.
// Aucune dépendance à React ni à la 3D : la 2D l'utilise, la 3D pourra le faire
// le jour où la bibliothèque saura colorer chaque dé.
// ─────────────────────────────────────────────────────────────────────────────

import { COLORSET_PRESETS, DICE_FALLBACK_CONFIG } from '../hooks/useDiceConfig.js';

export const DIE_FIELDS = ['foreground', 'background', 'outline', 'edge', 'texture', 'material'];

// Rythme commun à la 2D et à la 3D (DiceAnimationOverlay)
export const DICE_TIMING = {
    WAVE_SETTLE_DELAY: 800,   // pause entre deux vagues ou deux groupes
    EXPLOSION_FLASH:   350,   // éclair d'une explosion
    END_DISPLAY_DELAY: 1200,  // résultat affiché avant de rendre la main
    ROLL_2D:           900,   // lancer 2D : les chiffres défilent puis se posent
};

// Fichiers des textures (public/dice-assets/textures) dont le nom diffère de la clé
const TEXTURE_FILES = { cloudy_2: 'cloudy.alt', glitter_2: 'glitter-alpha', bird: 'feather' };

/** Adresse de l'image d'une texture de la bibliothèque, ou null. */
export const textureUrl = (key) => (key ? `/dice-assets/textures/${TEXTURE_FILES[key] ?? key}.webp` : null);

/**
 * Apparence de base du joueur : sa configuration personnalisée, ou son jeu nommé
 * ramené à des couleurs (aperçu du jeu : fond, chiffres).
 */
export function playerDieConfig(config) {
    const c = config ?? DICE_FALLBACK_CONFIG;
    if (c.mode !== 'preset') {
        const custom = { ...DICE_FALLBACK_CONFIG.custom, ...(c.custom ?? {}) };
        return Object.fromEntries(DIE_FIELDS.map(f => [f, custom[f] || null]));
    }
    const preset = COLORSET_PRESETS.find(p => p.key === c.preset)?.preview;
    const bg = Array.isArray(preset?.bg) ? preset.bg[0] : preset?.bg;
    return {
        foreground: preset?.fg ?? DICE_FALLBACK_CONFIG.custom.foreground,
        background: bg ?? DICE_FALLBACK_CONFIG.custom.background,
        outline: '#000000', edge: null, texture: null, material: 'plastic',
    };
}

const asConfig = (v) => (v && typeof v === 'object' && !Array.isArray(v) ? v : null);

/**
 * Apparence résolue d'un dé, champ par champ : dé > groupe > type (slug) > joueur.
 * La chaîne 'default' (ancien format du groupe) ne fixe rien.
 */
export function resolveDieConfig({ player, byType, type, group, die }) {
    const layers = [asConfig(die), asConfig(group), asConfig(byType?.[type]), asConfig(player)];
    return Object.fromEntries(DIE_FIELDS.map(f => [f, layers.find(l => l?.[f] != null && l[f] !== '')?.[f] ?? null]));
}

/**
 * Types des dés d'une vague d'après le diceType du groupe :
 *   'd6' + 3 valeurs → ['d6','d6','d6'] ; '1d8+1d10' → ['d8','d10'] ; '2d6+1d8' → ['d6','d6','d8'].
 * Une explosion relance le même type : au-delà de la liste, le dernier type se répète.
 */
export function waveDiceTypes(diceType, count) {
    const parts = String(diceType ?? 'd6').split('+').map(s => s.trim()).filter(Boolean);
    const types = parts.flatMap(p => {
        const m = p.match(/^(\d*)d(\d+|%)$/i);
        if (!m) return [];
        const sides = m[2] === '%' ? '100' : m[2];
        return Array.from({ length: m[1] ? Number(m[1]) : 1 }, () => `d${sides}`);
    });
    if (types.length === 0) return Array.from({ length: count }, () => 'd6');
    if (types.length === 1 && !/^\d/.test(parts[0])) return Array.from({ length: count }, () => types[0]);
    return Array.from({ length: count }, (_, i) => types[Math.min(i, types.length - 1)]);
}

/**
 * Dés d'une vague prêts à dessiner : [{ type, value, config }].
 * @param {object} group     groupe de la séquence ({ diceType, color })
 * @param {object} wave      vague ({ dice: [valeurs], colors?: [configs] })
 * @param {object} player    apparence de base du joueur (playerDieConfig)
 * @param {object} byType    dice.byType du slug, ou null
 */
export function waveDice(group, wave, player, byType) {
    const values = wave?.dice ?? [];
    const types = waveDiceTypes(group?.diceType, values.length);
    return values.map((value, i) => ({
        type: types[i],
        value,
        config: resolveDieConfig({ player, byType, type: types[i], group: group?.color, die: wave?.colors?.[i] }),
    }));
}
