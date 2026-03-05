// src/server/routes/npc.js
// Route générique CRUD pour les templates NPC.
// Partagée par tous les systèmes via systemResolver (req.db, req.system).
//
// Contrat :
//   - combat_stats : JSON opaque — jamais inspecté ici, géré par le slug client
//   - system_data  : JSON opaque — idem
//   - La route parse ces champs en JSON au retour (GET)
//   - La route sérialise en string à l'écriture (POST/PUT)
//
// Table cible : npc_templates (créée par 28022026_add_npc_templates.sql)

const express = require('express');
const router  = express.Router();

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Parse les champs JSON d'un template brut BDD.
 * Ne lève pas d'erreur si le champ est déjà un objet ou null.
 */
function parseTemplate(row) {
    if (!row) return null;
    return {
        ...row,
        combat_stats: _parseJson(row.combat_stats, {}),
        system_data:  _parseJson(row.system_data,  {}),
    };
}

function _parseJson(value, fallback) {
    if (value === null || value === undefined) return fallback;
    if (typeof value === 'object') return value;
    try { return JSON.parse(value); } catch { return fallback; }
}

// ─── GET / — Liste tous les templates ────────────────────────────────────────

router.get('/', (req, res) => {
    try {
        const rows = req.db.prepare(
            'SELECT * FROM npc_templates ORDER BY name ASC'
        ).all();
        res.json(rows.map(parseTemplate));
    } catch (err) {
        console.error('[npc] GET / error:', err);
        res.status(500).json({ error: 'Erreur lors de la récupération des templates' });
    }
});

// ─── GET /:id — Un template par id ───────────────────────────────────────────

router.get('/:id', (req, res) => {
    try {
        const row = req.db.prepare(
            'SELECT * FROM npc_templates WHERE id = ?'
        ).get(req.params.id);

        if (!row) return res.status(404).json({ error: 'Template introuvable' });
        res.json(parseTemplate(row));
    } catch (err) {
        console.error('[npc] GET /:id error:', err);
        res.status(500).json({ error: 'Erreur lors de la récupération du template' });
    }
});

// ─── POST / — Créer un template ──────────────────────────────────────────────

router.post('/', (req, res) => {
    try {
        const { name, description, combat_stats, system_data } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ error: 'Le nom est obligatoire' });
        }

        const stmt = req.db.prepare(`
            INSERT INTO npc_templates (name, description, combat_stats, system_data)
            VALUES (?, ?, ?, ?)
        `);

        const result = stmt.run(
            name.trim(),
            description ?? null,
            JSON.stringify(combat_stats  ?? {}),
            JSON.stringify(system_data   ?? {}),
        );

        const created = req.db.prepare(
            'SELECT * FROM npc_templates WHERE id = ?'
        ).get(result.lastInsertRowid);

        res.status(201).json(parseTemplate(created));
    } catch (err) {
        console.error('[npc] POST / error:', err);
        res.status(500).json({ error: 'Erreur lors de la création du template' });
    }
});

// ─── PUT /:id — Modifier un template ─────────────────────────────────────────

router.put('/:id', (req, res) => {
    try {
        const { name, description, combat_stats, system_data } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ error: 'Le nom est obligatoire' });
        }

        // Vérifier l'existence
        const existing = req.db.prepare(
            'SELECT id FROM npc_templates WHERE id = ?'
        ).get(req.params.id);
        if (!existing) return res.status(404).json({ error: 'Template introuvable' });

        req.db.prepare(`
            UPDATE npc_templates
            SET name = ?, description = ?, combat_stats = ?, system_data = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `).run(
            name.trim(),
            description ?? null,
            JSON.stringify(combat_stats  ?? {}),
            JSON.stringify(system_data   ?? {}),
            req.params.id,
        );

        const updated = req.db.prepare(
            'SELECT * FROM npc_templates WHERE id = ?'
        ).get(req.params.id);

        res.json(parseTemplate(updated));
    } catch (err) {
        console.error('[npc] PUT /:id error:', err);
        res.status(500).json({ error: 'Erreur lors de la mise à jour du template' });
    }
});

// ─── DELETE /:id — Supprimer un template ─────────────────────────────────────

router.delete('/:id', (req, res) => {
    try {
        const existing = req.db.prepare(
            'SELECT id FROM npc_templates WHERE id = ?'
        ).get(req.params.id);
        if (!existing) return res.status(404).json({ error: 'Template introuvable' });

        req.db.prepare('DELETE FROM npc_templates WHERE id = ?').run(req.params.id);
        res.json({ success: true, id: parseInt(req.params.id) });
    } catch (err) {
        console.error('[npc] DELETE /:id error:', err);
        res.status(500).json({ error: 'Erreur lors de la suppression du template' });
    }
});

module.exports = router;