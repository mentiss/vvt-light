// src/client/src/features/genmap/tools/engine/random.js
// Moteur du générateur de plans (spec_genmap.md), découpé par étape (§36.10, M2).
// Hasard déterministe : générateur mulberry32 et tirages.

export const mulberry32 = (seed) => {
    let a = seed >>> 0;
    return () => {
        a = (a + 0x6D2B79F5) >>> 0;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
};

export const makeRandom = (seed) => {
    const next = mulberry32(seed);
    return {
        next,
        int:  (min, max) => min + Math.floor(next() * (max - min + 1)),
        pick: (items) => items[Math.floor(next() * items.length)],
    };
};
