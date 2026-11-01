// vitest.config.mjs — tests serveur (racine). Les tests du front ont leur
// propre configuration dans src/client (npm test depuis src/client).
import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        include:     ['tests/server/**/*.test.js'],
        environment: 'node',
        setupFiles:  ['tests/server/setup.js'],
    },
});
