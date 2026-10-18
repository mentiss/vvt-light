import React, {useState, useCallback, useEffect, useRef} from 'react';
import { useSystem } from '../../hooks/useSystem.js';
import useDiceConfig, {COLORSET_PRESETS, DICE_FALLBACK_CONFIG, readDiceConfig, writeDiceConfig} from "../../hooks/useDiceConfig.js";
import useSlugConfig from "../../hooks/useSlugConfig.js";
import useConfirm from "../../hooks/useConfirm.jsx";
import Modal from '../ui/Modal.jsx';

// ─────────────────────────────────────────────────────────────────────────────
// Sous-composants UI
// ─────────────────────────────────────────────────────────────────────────────

const PreviewSwatch = ({ colors }) => {
    const list = Array.isArray(colors) ? colors : [colors];
    return (
        <div className="w-full h-full rounded-lg overflow-hidden flex">
            {list.map((c, i) => (
                <div key={i} className="flex-1 h-full" style={{ background: c }} />
            ))}
        </div>
    );
};

const SliderField = ({ label, value, min, max, step = 1, onChange, formatValue }) => {
    const pct = ((value - min) / (max - min)) * 100;
    return (
        <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
                <span className="text-xs text-muted">{label}</span>
                <span className="text-xs font-mono text-primary">
                    {formatValue ? formatValue(value) : value}
                </span>
            </div>
            <input
                type="range" min={min} max={max} step={step} value={value}
                onChange={e => onChange(Number(e.target.value))}
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                style={{ background: `linear-gradient(to right, var(--color-primary) ${pct}%, var(--color-surface-alt) 0%)` }}
            />
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// Composant principal
// ─────────────────────────────────────────────────────────────────────────────

const DiceConfigModal = ({ onClose, slugDefaults }) => {
    const { config, saveConfig  } = useDiceConfig();
    const initialized = useRef(false);
    const [draft, setDraft] = useState(null);
    const { confirm, confirmEl } = useConfirm();

    useEffect(() => {
        if (!initialized.current && config) {
            setDraft(config);
            initialized.current = true;
        }
    }, [config]);

    const [activeCategory, setActiveCategory] = useState('JDR');

    useEffect(() => {
        if (draft?.preset) {
            setActiveCategory(
                COLORSET_PRESETS.find(p => p.key === draft.preset)?.category ?? 'JDR'
            );
        }
    }, [draft?.preset]);

    const updateDraft = useCallback((updates) => {
        setDraft(prev => {
            const next = { ...prev, ...updates };
            if (updates.custom) next.custom = { ...prev.custom, ...updates.custom };
            return next;
        });
    }, []);

    const handleSave = async () => {
        const ok = await confirm({
            title: 'Appliquer la configuration',
            message: 'La page va être rechargée pour appliquer les changements.',
            confirmText: 'Recharger',
        });
        if (!ok) return;
        saveConfig(draft);
        window.location.reload();
    };

    const handleReset = async () => {
        const ok = await confirm({
            title: 'Réinitialiser la configuration',
            message: 'La configuration sera réinitialisée et la page rechargée.',
            confirmText: 'Réinitialiser',
            danger: true,
        });
        if (!ok) return;
        const base = {
            ...DICE_FALLBACK_CONFIG,
            ...(slugDefaults ?? {}),
            custom: {...DICE_FALLBACK_CONFIG.custom, ...(slugDefaults?.custom ?? {})},
        };
        setDraft(base);
        saveConfig(base);
        window.location.reload();
    };

    if(draft === null) return null;

    const categories    = [...new Set(COLORSET_PRESETS.map(p => p.category))];
    const filteredPresets = COLORSET_PRESETS.filter(p => p.category === activeCategory);

    return (
        <>
            {confirmEl}
            <Modal
                title="Mes dés"
                subtitle="Apparence de l'animation"
                size="md"
                expandable
                onClose={onClose}
                footer={
                    <>
                        <button type="button" onClick={handleReset} className="vtt-btn">
                            Réinitialiser
                        </button>
                        <button type="button" onClick={onClose} className="vtt-btn">
                            Annuler
                        </button>
                        <button type="button" onClick={handleSave} className="vtt-btn vtt-btn-primary flex-1">
                            Appliquer
                        </button>
                    </>
                }
            >
                    <div className="space-y-6">

                        {/* Switcher preset / custom */}
                        <div className="vtt-segmented">
                            {[{ key: 'preset', label: 'Preset' }, { key: 'custom', label: 'Personnalisé' }].map(m => (
                                <button
                                    type="button"
                                    key={m.key}
                                    onClick={() => updateDraft({ mode: m.key })}
                                    className={`vtt-segment ${draft.mode === m.key ? 'is-active' : ''}`}
                                >
                                    {m.label}
                                </button>
                            ))}
                        </div>

                        {/* Mode PRESET */}
                        {draft.mode === 'preset' && (
                            <div className="space-y-3">
                                {/* Chips catégories */}
                                <div className="flex flex-wrap gap-1.5">
                                    {categories.map(cat => (
                                        <button
                                            type="button"
                                            key={cat}
                                            onClick={() => setActiveCategory(cat)}
                                            className={`vtt-pill ${activeCategory === cat ? 'is-selected' : ''}`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>

                                {/* Grille presets */}
                                <div className="grid grid-cols-3 gap-2">
                                    {filteredPresets.map(p => {
                                        const selected = draft.preset === p.key;
                                        return (
                                            <button
                                                type="button"
                                                key={p.key}
                                                onClick={() => updateDraft({ preset: p.key })}
                                                className={`vtt-list-item flex-col gap-1.5 p-2 ${selected ? 'is-selected' : ''}`}
                                            >
                                                <div className="w-full h-8 rounded-lg overflow-hidden">
                                                    <PreviewSwatch colors={p.preview.bg} />
                                                </div>
                                                <span className={`text-xs font-medium text-center truncate w-full ${selected ? 'text-primary' : 'text-muted'}`}>
                                                {p.name}
                                            </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Mode CUSTOM */}
                        {draft.mode === 'custom' && (
                            <div className="space-y-4">
                                {[
                                    { key: 'foreground', label: 'Faces (texte/chiffres)' },
                                    { key: 'background', label: 'Corps du dé' },
                                    { key: 'outline',    label: 'Contour' },
                                    { key: 'edge',       label: 'Tranche (optionnel)' },
                                ].map(({ key, label }) => (
                                    <div key={key} className="flex items-center justify-between gap-3">
                                        <span className="vtt-field-label mb-0">{label}</span>
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-8 h-8 rounded-lg border border-default"
                                                style={{ background: draft.custom[key] || 'transparent' }}
                                            />
                                            <input
                                                type="color"
                                                value={draft.custom[key] || '#000000'}
                                                onChange={e => updateDraft({ custom: { [key]: e.target.value } })}
                                                className="w-8 h-8 rounded cursor-pointer border-none bg-transparent"
                                            />
                                        </div>
                                    </div>
                                ))}

                                {/* Matière */}
                                <div>
                                    <span className="vtt-field-label">Matière</span>
                                    <div className="flex flex-wrap gap-1.5">
                                        {['metal', 'wood', 'glass', 'plastic', 'pristine'].map(mat => (
                                            <button
                                                type="button"
                                                key={mat}
                                                onClick={() => updateDraft({ custom: { material: mat } })}
                                                className={`vtt-pill ${draft.custom.material === mat ? 'is-selected' : ''}`}
                                            >
                                                {mat}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Physique */}
                        <div className="space-y-4 pt-2 border-t border-default">
                            <SliderField
                                label="Force de lancer"
                                value={draft.strength}
                                min={1} max={10}
                                onChange={v => updateDraft({ strength: v })}
                            />
                            <SliderField
                                label="Gravité"
                                value={draft.gravity}
                                min={100} max={2000} step={100}
                                onChange={v => updateDraft({ gravity: v })}
                                formatValue={v => `${v}`}
                            />
                        </div>

                        {/* Lumière */}
                        <div className="flex items-center justify-between gap-3 pt-2 border-t border-default">
                            <span className="vtt-field-label mb-0">Couleur lumière</span>
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg border border-default" style={{ background: draft.lightColor }} />
                                <input
                                    type="color"
                                    value={draft.lightColor}
                                    onChange={e => updateDraft({ lightColor: e.target.value })}
                                    className="w-8 h-8 rounded cursor-pointer border-none bg-transparent"
                                />
                            </div>
                        </div>

                        {/* Sons */}
                        <div className="pt-2 border-t border-default">
                            <button
                                type="button"
                                onClick={() => updateDraft({ sounds: !draft.sounds })}
                                className="vtt-list-item justify-between"
                            >
                                <div className="text-left">
                                    <div className="text-sm font-medium">Sons</div>
                                    <div className="text-xs text-muted">{draft.sounds ? 'Activés' : 'Désactivés'}</div>
                                </div>
                                <div className={`w-11 h-6 rounded-full transition-all duration-200 relative shrink-0 ${draft.sounds ? 'bg-primary' : 'bg-surface'}`}>
                                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-md transition-all duration-200 ${draft.sounds ? 'left-6' : 'left-1'}`} />
                                </div>
                            </button>
                        </div>
                    </div>
            </Modal>
        </>
    );
};

export default DiceConfigModal;