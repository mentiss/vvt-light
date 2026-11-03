// src/client/src/systems/woddavampire/config/equipment.js
// ─────────────────────────────────────────────────────────────────────────────
// Équipement de combat (annexe vda20-catalogue-divers.md §4, spec §10).
//   weapon : ability (Capacité d'attaque), damage { strength, bonus, type }
//            type : bashing | lethal | aggravated ; strength : « For + X »
//            range (m), minStrength, diffMod (difficulté d'attaque), piercing, notes
//   armor  : rating (absorption), penalty (initiative, actions de Dextérité)
//   shield : parryDifficulty, attackerPenalty
// ─────────────────────────────────────────────────────────────────────────────

const w = (key, label, ability, damage, extra = {}) => ({ key, label, ability, damage, ...extra });
const str = (bonus, type) => ({ strength: true, bonus, type });
const fixed = (bonus, type) => ({ strength: false, bonus, type });

export const UNARMED = w('unarmed', 'Mains nues', 'brawl', str(0, 'bashing'), { range: 1 });

export const WEAPONS = [
    // Haches
    w('hatchet', 'Hachette', 'melee', str(1, 'lethal'), { minStrength: 2, notes: 'Peut être lancée' }),
    w('axe', 'Hache', 'melee', str(2, 'lethal'), { minStrength: 3 }),
    w('battle_axe', 'Hache de bataille', 'melee', str(4, 'lethal'), { minStrength: 4, notes: 'À deux mains' }),
    w('pick', 'Pioche', 'melee', str(2, 'lethal'), { minStrength: 4, piercing: 3 }),
    // Contondantes
    w('club', 'Gourdin', 'melee', str(2, 'bashing'), { minStrength: 2 }),
    w('mace', 'Masse', 'melee', str(2, 'lethal'), { minStrength: 3 }),
    w('morningstar', 'Morgenstern', 'melee', str(3, 'lethal'), { minStrength: 3 }),
    w('staff', 'Bâton', 'melee', str(3, 'bashing'), { minStrength: 2, notes: '+2 dés au balayage' }),
    w('war_hammer', 'Marteau de guerre', 'melee', str(4, 'bashing'), { minStrength: 4, notes: 'À deux mains' }),
    // Lames
    w('knife', 'Couteau', 'melee', str(0, 'lethal'), { minStrength: 1 }),
    w('dagger', 'Dague', 'melee', str(1, 'lethal'), { minStrength: 2, piercing: 2 }),
    w('sword', 'Sabre', 'melee', str(2, 'lethal'), { minStrength: 3 }),
    w('broadsword', 'Épée large', 'melee', str(2, 'lethal'), { minStrength: 3, notes: 'À deux mains : For min 2, For + 3 L' }),
    w('greatsword', 'Épée à deux mains', 'melee', str(4, 'lethal'), { minStrength: 4, notes: 'À deux mains' }),
    // Armes d'hast
    w('halberd', 'Hallebarde', 'melee', str(4, 'lethal'), { minStrength: 3, diffMod: 1, notes: 'À deux mains' }),
    w('javelin', 'Javelot', 'melee', str(0, 'lethal'), { minStrength: 2 }),
    w('cavalry_lance', 'Lance de cavalerie (montée)', 'melee', str(3, 'lethal'), { minStrength: 3, piercing: 3 }),
    w('pitchfork', 'Fourche', 'melee', str(1, 'lethal'), { minStrength: 2, piercing: 1, notes: 'À deux mains' }),
    w('spear', 'Lance', 'melee', str(2, 'lethal'), { minStrength: 2, piercing: 2, notes: 'À deux mains : For min 3, For + 3 L' }),
    // Tir
    w('crossbow', 'Arbalète', 'archery', fixed(3, 'lethal'), { range: 90, minStrength: 3, piercing: 2, notes: 'Recharger : 5 tours − 1 par point d’Archerie' }),
    w('heavy_crossbow', 'Arbalète lourde', 'archery', fixed(4, 'lethal'), { range: 90, minStrength: 4, piercing: 3, notes: 'Recharger : 5 tours − 1 par point d’Archerie' }),
    w('longbow', 'Arc long', 'archery', fixed(4, 'lethal'), { range: 120, minStrength: 4, piercing: 4 }),
    w('shortbow', 'Arc court', 'archery', fixed(2, 'lethal'), { range: 60, minStrength: 3, piercing: 2 }),
    w('sling', 'Fronde', 'archery', fixed(3, 'bashing'), { range: 40, minStrength: 2 }),
    // Jet
    w('thrown_dagger', 'Dague (jet)', 'athletics', str(1, 'lethal'), { range: 20 }),
    w('thrown_hatchet', 'Hachette (jet)', 'athletics', str(1, 'lethal'), { range: 20, minStrength: 2, diffMod: 1 }),
    w('thrown_javelin', 'Javelot (jet)', 'athletics', str(2, 'lethal'), { range: 50, minStrength: 2, piercing: 2 }),
    w('thrown_knife', 'Couteau (jet)', 'athletics', str(0, 'lethal'), { range: 15, minStrength: 2, diffMod: 1 }),
    w('stone', 'Pierre', 'athletics', str(0, 'bashing'), { range: 40, minStrength: 2, diffMod: 1 }),
    w('thrown_spear', 'Lance (jet)', 'athletics', str(2, 'lethal'), { range: 40, minStrength: 3, piercing: 2 }),
];

export const ARMORS = [
    { key: 'heavy_clothing', label: 'Vêtements épais', rating: 1, penalty: 0 },
    { key: 'cloth_armor', label: 'Armure de tissu', rating: 2, penalty: 1 },
    { key: 'composite_armor', label: 'Armure composite', rating: 3, penalty: 1 },
    { key: 'heavy_armor', label: 'Armure lourde', rating: 4, penalty: 2 },
    { key: 'knight_armor', label: 'Armure de chevalier', rating: 5, penalty: 3 },
];

export const SHIELDS = [
    { key: 'small_shield', label: 'Petit bouclier', parryDifficulty: 4, attackerPenalty: 0 },
    { key: 'shield', label: 'Bouclier standard', parryDifficulty: 6, attackerPenalty: 1 },
    { key: 'parry_dagger', label: 'Dague de parade', parryDifficulty: 5, attackerPenalty: 0 },
    { key: 'parry_sword', label: 'Épée de parade', parryDifficulty: 6, attackerPenalty: 1, notes: 'Pénalité seulement contre les attaques à mains nues' },
];

export const DAMAGE_TYPE_LABELS = { bashing: 'contondant', lethal: 'létal', aggravated: 'aggravé' };
export const DAMAGE_TYPE_SHORT = { bashing: 'C', lethal: 'L', aggravated: 'A' };

/** Types d'absorption proposés par « Absorber » (§10.4) */
export const SOAK_TYPES = [['bashing', 'Contondant'], ['lethal', 'Létal'], ['aggravated', 'Aggravé'], ['fire', 'Feu, soleil']];

/** Catalogue de la modale d'équipement (CatalogModal) : armes, armures, boucliers, avec un type filtrable */
const TYPE_OF_ABILITY = { melee: 'Mêlée', archery: 'Tir', athletics: 'Jet' };
export const EQUIPMENT_CATALOG = [
    ...WEAPONS.map(w => ({ ...w, kind: 'weapon', name: w.label, type: TYPE_OF_ABILITY[w.ability] })),
    ...ARMORS.map(a => ({ ...a, kind: 'armor', name: a.label, type: 'Armure' })),
    ...SHIELDS.map(s => ({ ...s, kind: 'shield', name: s.label, type: 'Bouclier' })),
];
export const EQUIPMENT_FILTERS = [{ key: 'type', getValue: i => i.type, options: ['Mêlée', 'Tir', 'Jet', 'Armure', 'Bouclier'].map(v => ({ value: v, label: v })) }];
