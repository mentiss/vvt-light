// src/client/src/features/genmap/tools/engine/heap.js
// Moteur du générateur de plans (spec_genmap.md), découpé par étape (§36.10, M2).
// File de priorité (tas binaire) des recherches de chemin.

export const createHeap = () => {
    const items = [];
    const swap = (i, j) => { [items[i], items[j]] = [items[j], items[i]]; };
    return {
        get size() { return items.length; },
        push(item) {
            items.push(item);
            let i = items.length - 1;
            while (i > 0) {
                const parent = (i - 1) >> 1;
                if (items[parent].cost <= items[i].cost) break;
                swap(parent, i);
                i = parent;
            }
        },
        pop() {
            const top = items[0];
            const last = items.pop();
            if (items.length) {
                items[0] = last;
                let i = 0;
                for (;;) {
                    const l = 2 * i + 1, r = l + 1;
                    let m = i;
                    if (l < items.length && items[l].cost < items[m].cost) m = l;
                    if (r < items.length && items[r].cost < items[m].cost) m = r;
                    if (m === i) break;
                    swap(m, i);
                    i = m;
                }
            }
            return top;
        },
    };
};
