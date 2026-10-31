// Stockage simulé, de la forme de window.localStorage, pour les tests du stockage navigateur
export const memoryStorage = (initial = {}) => {
    const data = { ...initial };
    return {
        getItem: (k) => (k in data ? data[k] : null),
        setItem: (k, v) => { data[k] = String(v); },
        removeItem: (k) => { delete data[k]; },
        key: (i) => Object.keys(data)[i] ?? null,
        get length() { return Object.keys(data).length; },
        data,
    };
};
