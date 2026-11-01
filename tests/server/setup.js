// tests/server/setup.js
// ─────────────────────────────────────────────────────────────────────────────
// Environnement des tests serveur, posé avant tout chargement de module :
// utils/jwt.js lit ces variables au require. Valeurs de test uniquement, le
// .env du projet n'est jamais lu.
// ─────────────────────────────────────────────────────────────────────────────

process.env.JWT_SECRET             = 'test-secret';
process.env.JWT_ACCESS_EXPIRATION  = '15m';
process.env.JWT_REFRESH_EXPIRATION = '7d';
process.env.NODE_ENV               = 'test';
