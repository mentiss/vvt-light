// src/client/src/components/gm/npc/NPCModal.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Modale unifiée de gestion des templates NPC.
// Remplace AddNPCModal.jsx et EditNPCModal.jsx.
//
// Quatre modes internes :
//   library     — liste des templates BDD (défaut)
//   create      — formulaire création
//   edit        — formulaire édition (prérempli)
//   instanciate — confirmation avant ajout en combat
//
// Props :
//   onClose            — ferme la modale
//   onAddCombatant     — ajoute un combattant NPC en mémoire combat
//   combatConfig       — config slug (renderNPCForm, buildNPCCombatStats,
//                        parseNPCCombatStats, buildNPCHealthData)
// ─────────────────────────────────────────────────────────────────────────────

import React, {useState, useEffect, useCallback, useRef} from 'react';
import { useFetch }    from '../../../hooks/useFetch.js';
import { useSystem }   from '../../../hooks/useSystem.js';
import ConfirmModal    from '../../modals/ConfirmModal.jsx';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const rollInitiative = () =>
    Math.floor(Math.random() * 10) + 1 + Math.floor(Math.random() * 10) + 1;

const DEFAULT_FORM = {
    name:        '',
    description: '',
    actionsMax:  1,
};

// ─── Composant principal ─────────────────────────────────────────────────────

const NPCModal = ({ onClose, onAddCombatant, combatConfig }) => {
    const { apiBase }   = useSystem();
    const fetchWithAuth = useFetch();

    const fetchRef  = useRef(fetchWithAuth);
    const apiRef    = useRef(apiBase);
    useEffect(() => { fetchRef.current = fetchWithAuth; }, [fetchWithAuth]);

    // Mode : 'library' | 'create' | 'edit' | 'instanciate'
    const [mode, setMode] = useState('library');

    // ── État library ──────────────────────────────────────────────────────────
    const [templates,    setTemplates]    = useState([]);
    const [loading,      setLoading]      = useState(false);
    const [error,        setError]        = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null); // template à confirmer suppression

    // ── État create/edit ──────────────────────────────────────────────────────
    const [genericForm,  setGenericForm]  = useState(DEFAULT_FORM);
    const [slugForm,     setSlugForm]     = useState({});   // géré par combatConfig.renderNPCForm
    const [editingId,    setEditingId]    = useState(null); // null = création
    const [saving,       setSaving]       = useState(false);
    const [formError,    setFormError]    = useState(null);

    // ── État instanciate ──────────────────────────────────────────────────────
    const [instTemplate,  setInstTemplate]  = useState(null); // template source
    const [instanceName,  setInstanceName]  = useState('');

    // ─── Chargement bibliothèque ─────────────────────────────────────────────

    const loadTemplates = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res  = await fetchRef.current(`${apiRef.current}/npc`);
            const data = await res.json();
            if (!res.ok) throw new Error(data.error ?? 'Erreur chargement');
            setTemplates(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (mode === 'library') loadTemplates();
    }, [mode, loadTemplates]);

    // ─── Helpers onChange slug form ──────────────────────────────────────────

    const handleSlugChange = (field, value) =>
        setSlugForm(prev => ({ ...prev, [field]: value }));

    // ─── Mode create ─────────────────────────────────────────────────────────

    const openCreate = () => {
        const defaultSlug = combatConfig?.parseNPCCombatStats
            ? combatConfig.parseNPCCombatStats({})
            : {};
        setGenericForm(DEFAULT_FORM);
        setSlugForm(defaultSlug);
        setEditingId(null);
        setFormError(null);
        setMode('create');
    };

    // ─── Mode edit ───────────────────────────────────────────────────────────

    const openEdit = (template) => {
        const parsed = combatConfig?.parseNPCCombatStats
            ? combatConfig.parseNPCCombatStats(template.combat_stats)
            : {};
        setGenericForm({
            name:        template.name        ?? '',
            description: template.description ?? '',
            actionsMax:  parsed.actionsMax    ?? 1,
        });
        setSlugForm(parsed);
        setEditingId(template.id);
        setFormError(null);
        setMode('edit');
    };

    // ─── Sauvegarde (create + edit) ──────────────────────────────────────────

    const handleSave = async () => {
        if (!genericForm.name?.trim()) {
            setFormError('Le nom est obligatoire.');
            return;
        }
        setSaving(true);
        setFormError(null);
        try {
            const combat_stats = combatConfig?.buildNPCCombatStats
                ? combatConfig.buildNPCCombatStats({ ...slugForm, actionsMax: genericForm.actionsMax })
                : { actionsMax: genericForm.actionsMax };

            const payload = {
                name:        genericForm.name.trim(),
                description: genericForm.description ?? null,
                combat_stats,
            };

            const url    = editingId ? `${apiBase}/npc/${editingId}` : `${apiBase}/npc`;
            const method = editingId ? 'PUT' : 'POST';

            const res  = await fetchWithAuth(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify(payload),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error ?? 'Erreur sauvegarde');

            setMode('library');
        } catch (err) {
            setFormError(err.message);
        } finally {
            setSaving(false);
        }
    };

    // ─── "Utiliser sans sauvegarder" (create uniquement) ────────────────────

    const handleUseWithoutSave = () => {
        if (!genericForm.name?.trim()) {
            setFormError('Le nom est obligatoire.');
            return;
        }
        const combat_stats = combatConfig?.buildNPCCombatStats
            ? combatConfig.buildNPCCombatStats({ ...slugForm, actionsMax: genericForm.actionsMax })
            : { actionsMax: genericForm.actionsMax };

        const pseudoTemplate = {
            id:          null,
            name:        genericForm.name.trim(),
            description: genericForm.description,
            combat_stats,
        };
        openInstanciate(pseudoTemplate);
    };

    // ─── Mode instanciate ────────────────────────────────────────────────────

    const openInstanciate = (template) => {
        setInstTemplate(template);
        setInstanceName(template.name ?? '');
        setMode('instanciate');
    };

    const handleInstanciate = () => {
        if (!instTemplate) return;
        const combatStats = instTemplate.combat_stats ?? {};

        const npcData = {
            type:       'npc',
            name:       instanceName.trim() || instTemplate.name,
            actionsMax: combatStats.actionsMax ?? 1,
            attaques:   combatStats.attaques   ?? [],
            initiative: rollInitiative(),
            healthData: combatConfig?.buildNPCHealthData
                ? combatConfig.buildNPCHealthData(combatStats)
                : { tokensBlessure: 0 },
            // Champs top-level pour compatibilité CombatantCard (fallback)
            blessure:    0,
            blessureMax: combatStats.blessureMax ?? 5,
            armure:      combatStats.armure      ?? 0,
            seuil:       combatStats.seuil       ?? 1,
        };

        onAddCombatant(npcData);
        onClose();
    };

    // ─── Suppression ─────────────────────────────────────────────────────────

    const handleDeleteConfirm = async () => {
        if (!deleteTarget) return;
        try {
            const res = await fetchWithAuth(`${apiBase}/npc/${deleteTarget.id}`, { method: 'DELETE' });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error ?? 'Erreur suppression');
            }
            setDeleteTarget(null);
            loadTemplates();
        } catch (err) {
            setError(err.message);
            setDeleteTarget(null);
        }
    };

    // ─── Render ───────────────────────────────────────────────────────────────

    return (
        <>
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div
                    className="bg-white dark:bg-viking-brown rounded-lg shadow-2xl max-w-lg w-full border-4 border-viking-bronze p-4 max-h-[90vh] overflow-y-auto"
                    onClick={e => e.stopPropagation()}
                >
                    {/* ── Header ──────────────────────────────────────────── */}
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2">
                            {mode !== 'library' && (
                                <button
                                    onClick={() => setMode('library')}
                                    className="text-viking-leather dark:text-viking-bronze hover:text-viking-bronze text-sm"
                                >← Retour</button>
                            )}
                            <h3 className="text-lg font-bold text-viking-brown dark:text-viking-parchment">
                                {mode === 'library'    && '👹 Adversaires'}
                                {mode === 'create'     && '➕ Nouveau template'}
                                {mode === 'edit'       && '✏️ Modifier le template'}
                                {mode === 'instanciate' && '⚔️ Ajouter en combat'}
                            </h3>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-2xl text-viking-leather dark:text-viking-bronze hover:text-viking-danger"
                        >✕</button>
                    </div>

                    {/* ── Mode library ────────────────────────────────────── */}
                    {mode === 'library' && (
                        <ModeLibrary
                            templates={templates}
                            loading={loading}
                            error={error}
                            onUse={openInstanciate}
                            onEdit={openEdit}
                            onDelete={setDeleteTarget}
                            onNew={openCreate}
                        />
                    )}

                    {/* ── Mode create / edit ───────────────────────────────── */}
                    {(mode === 'create' || mode === 'edit') && (
                        <ModeForm
                            mode={mode}
                            genericForm={genericForm}
                            slugForm={slugForm}
                            onGenericChange={(field, value) =>
                                setGenericForm(prev => ({ ...prev, [field]: value }))
                            }
                            onSlugChange={handleSlugChange}
                            combatConfig={combatConfig}
                            saving={saving}
                            error={formError}
                            onSave={handleSave}
                            onUseWithoutSave={mode === 'create' ? handleUseWithoutSave : null}
                            onCancel={() => setMode('library')}
                        />
                    )}

                    {/* ── Mode instanciate ─────────────────────────────────── */}
                    {mode === 'instanciate' && instTemplate && (
                        <ModeInstanciate
                            template={instTemplate}
                            instanceName={instanceName}
                            onNameChange={setInstanceName}
                            onConfirm={handleInstanciate}
                            onCancel={() => setMode(instTemplate.id ? 'library' : 'create')}
                        />
                    )}
                </div>
            </div>

            {/* ── Confirmation suppression ─────────────────────────────────── */}
            {deleteTarget && (
                <ConfirmModal
                    title="Supprimer le template"
                    message={`Supprimer "${deleteTarget.name}" ? Cette action est irréversible.`}
                    onConfirm={handleDeleteConfirm}
                    onCancel={() => setDeleteTarget(null)}
                />
            )}
        </>
    );
};

// ─── Sous-composant : bibliothèque ────────────────────────────────────────────

const ModeLibrary = ({ templates, loading, error, onUse, onEdit, onDelete, onNew }) => {
    const [search, setSearch] = useState('');

    const filtered = templates.filter(t =>
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        (t.description ?? '').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-viking-leather dark:text-viking-bronze">
                    {templates.length} template{templates.length > 1 ? 's' : ''}
                </span>
                <button
                    onClick={onNew}
                    className="px-3 py-1.5 bg-viking-bronze text-viking-brown rounded text-sm font-semibold hover:bg-viking-leather"
                >+ Nouveau template</button>
            </div>

            {/* Champ de recherche */}
            {templates.length > 3 && (
                <div className="mb-3">
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Rechercher un template…"
                        className="w-full px-3 py-2 border rounded text-sm text-viking-brown dark:text-viking-parchment dark:bg-gray-800 border-viking-bronze/50"
                    />
                </div>
            )}

            {loading && (
                <div className="text-center py-6 text-viking-leather dark:text-viking-bronze text-sm">Chargement…</div>
            )}
            {error && (
                <div className="text-center py-4 text-red-500 text-sm">{error}</div>
            )}
            {!loading && !error && templates.length === 0 && (
                <div className="text-center py-8 text-viking-leather dark:text-viking-bronze text-sm italic">
                    Aucun template. Créez votre premier adversaire !
                </div>
            )}
            {!loading && !error && filtered.length === 0 && templates.length > 0 && (
                <div className="text-center py-4 text-viking-leather dark:text-viking-bronze text-sm italic">
                    Aucun résultat pour "{search}"
                </div>
            )}

            <div className="space-y-2">
                {filtered.map(t => (
                    <TemplateCard
                        key={t.id}
                        template={t}
                        onUse={() => onUse(t)}
                        onEdit={() => onEdit(t)}
                        onDelete={() => onDelete(t)}
                    />
                ))}
            </div>
        </div>
    );
};

// ─── Carte template dans la bibliothèque ─────────────────────────────────────

const TemplateCard = ({ template, onUse, onEdit, onDelete }) => {
    const cs = template.combat_stats ?? {};
    return (
        <div className="p-3 border-2 border-viking-bronze/50 rounded bg-viking-parchment/40 dark:bg-gray-800/40">
            <div className="flex justify-between items-start">
                <div>
                    <div className="font-bold text-viking-brown dark:text-viking-parchment text-sm">
                        {template.name}
                    </div>
                    {template.description && (
                        <div className="text-xs text-viking-leather dark:text-viking-bronze mt-0.5">
                            {template.description}
                        </div>
                    )}
                    <div className="flex gap-3 mt-1 text-xs text-viking-leather dark:text-viking-bronze">
                        {cs.blessureMax !== undefined && <span>PV: {cs.blessureMax}</span>}
                        {cs.armure      !== undefined && <span>ARM: {cs.armure}</span>}
                        {cs.seuil       !== undefined && <span>SEUIL: {cs.seuil}</span>}
                        {cs.actionsMax  !== undefined && <span>ACT: {cs.actionsMax}</span>}
                        {cs.attaques?.length > 0 && (
                            <span>{cs.attaques.length} attaque{cs.attaques.length > 1 ? 's' : ''}</span>
                        )}
                    </div>
                </div>
                <div className="flex gap-1 ml-2 flex-shrink-0">
                    <button
                        onClick={onUse}
                        className="px-2 py-1 bg-viking-bronze text-viking-brown rounded text-xs font-semibold hover:bg-viking-leather"
                        title="Utiliser en combat"
                    >⚔️</button>
                    <button
                        onClick={onEdit}
                        className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-viking-brown dark:text-viking-parchment rounded text-xs hover:bg-gray-300 dark:hover:bg-gray-600"
                        title="Éditer"
                    >✏️</button>
                    <button
                        onClick={onDelete}
                        className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded text-xs hover:bg-red-200"
                        title="Supprimer"
                    >🗑️</button>
                </div>
            </div>
        </div>
    );
};

// ─── Sous-composant : formulaire create/edit ──────────────────────────────────

const ModeForm = ({
                      mode,
                      genericForm,
                      slugForm,
                      onGenericChange,
                      onSlugChange,
                      combatConfig,
                      saving,
                      error,
                      onSave,
                      onUseWithoutSave,
                      onCancel,
                  }) => (
    <div className="space-y-3">
        {/* Champs génériques */}
        <div>
            <label className="block text-sm font-semibold text-viking-brown dark:text-viking-parchment mb-1">
                Nom *
            </label>
            <input
                type="text"
                value={genericForm.name}
                onChange={e => onGenericChange('name', e.target.value)}
                placeholder="Bandit, Guerrier, Loup…"
                className="w-full px-3 py-2 border rounded text-viking-brown dark:text-viking-parchment dark:bg-gray-800"
            />
        </div>

        <div>
            <label className="block text-sm font-semibold text-viking-brown dark:text-viking-parchment mb-1">
                Description
            </label>
            <input
                type="text"
                value={genericForm.description ?? ''}
                onChange={e => onGenericChange('description', e.target.value)}
                placeholder="Description courte (optionnel)"
                className="w-full px-3 py-2 border rounded text-viking-brown dark:text-viking-parchment dark:bg-gray-800"
            />
        </div>

        <div>
            <label className="block text-sm font-semibold text-viking-brown dark:text-viking-parchment mb-1">
                Actions / tour
            </label>
            <input
                type="number"
                min="1"
                max="5"
                value={genericForm.actionsMax}
                onChange={e => onGenericChange('actionsMax', parseInt(e.target.value) || 1)}
                className="w-32 px-3 py-2 border rounded text-viking-brown dark:text-viking-parchment dark:bg-gray-800"
            />
        </div>

        {/* Slot slug-spécifique */}
        {combatConfig?.renderNPCForm
            ? combatConfig.renderNPCForm(slugForm, onSlugChange)
            : (
                <div className="text-xs text-viking-leather dark:text-viking-bronze italic p-2 border rounded">
                    (Aucun formulaire slug défini)
                </div>
            )
        }

        {/* Erreur */}
        {error && (
            <div className="text-red-500 text-sm px-1">{error}</div>
        )}

        {/* Boutons */}
        <div className="flex gap-2 pt-1">
            <button
                onClick={onCancel}
                className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-700 text-viking-brown dark:text-viking-parchment rounded font-semibold hover:bg-gray-400"
            >Annuler</button>

            {onUseWithoutSave && (
                <button
                    onClick={onUseWithoutSave}
                    disabled={saving}
                    className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-600 text-viking-brown dark:text-viking-parchment rounded font-semibold hover:bg-gray-300 dark:hover:bg-gray-500 text-sm"
                >Utiliser sans sauvegarder</button>
            )}

            <button
                onClick={onSave}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-viking-bronze text-viking-brown rounded font-semibold hover:bg-viking-leather disabled:opacity-60"
            >
                {saving ? 'Sauvegarde…' : mode === 'edit' ? 'Mettre à jour' : 'Sauvegarder'}
            </button>
        </div>
    </div>
);

// ─── Sous-composant : instanciation ──────────────────────────────────────────

const ModeInstanciate = ({ template, instanceName, onNameChange, onConfirm, onCancel }) => {
    const cs = template.combat_stats ?? {};
    return (
        <div className="space-y-4">
            <div className="p-3 bg-viking-parchment/50 dark:bg-gray-800/50 rounded border border-viking-bronze/40">
                <div className="font-bold text-viking-brown dark:text-viking-parchment mb-2">
                    {template.name}
                </div>
                <div className="grid grid-cols-2 gap-x-4 text-xs text-viking-leather dark:text-viking-bronze">
                    {cs.blessureMax  !== undefined && <div>PV : {cs.blessureMax}</div>}
                    {cs.armure       !== undefined && <div>Armure : {cs.armure}</div>}
                    {cs.seuil        !== undefined && <div>Seuil : {cs.seuil}</div>}
                    {cs.actionsMax   !== undefined && <div>Actions : {cs.actionsMax}</div>}
                </div>
                {cs.attaques?.length > 0 && (
                    <div className="mt-2 text-xs text-viking-leather dark:text-viking-bronze">
                        <div className="font-semibold mb-1">Attaques :</div>
                        {cs.attaques.map((a, i) => (
                            <div key={i} className="ml-2">
                                {a.name} — seuil {a.succes}, expl. {a.explosion}, {a.degats} dég.
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div>
                <label className="block text-sm font-semibold text-viking-brown dark:text-viking-parchment mb-1">
                    Nom de l'instance (modifiable)
                </label>
                <input
                    type="text"
                    value={instanceName}
                    onChange={e => onNameChange(e.target.value)}
                    className="w-full px-3 py-2 border rounded text-viking-brown dark:text-viking-parchment dark:bg-gray-800"
                />
            </div>

            <div className="text-xs text-viking-leather dark:text-viking-bronze italic">
                L'initiative sera tirée automatiquement (2d10).
            </div>

            <div className="flex gap-2">
                <button
                    onClick={onCancel}
                    className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-700 text-viking-brown dark:text-viking-parchment rounded font-semibold hover:bg-gray-400"
                >Retour</button>
                <button
                    onClick={onConfirm}
                    className="flex-1 px-4 py-2 bg-viking-bronze text-viking-brown rounded font-semibold hover:bg-viking-leather"
                >⚔️ Ajouter au combat</button>
            </div>
        </div>
    );
};

export default NPCModal;