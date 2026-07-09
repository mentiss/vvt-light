// src/client/src/systems/fabula/components/modals/FabulaDiceModal.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Modale de Test d'Attribut — VERSION diceEngine v2 (async, pas d'overlay local).
// Le bouton 🎲 du header ouvre cette modale : choix de 2 attributs (le test
// Fabula Ultima combine toujours deux attributs, ex. [DEX+INT]), modificateur
// libre, ND optionnel (le MJ l'annonce verbalement, pas de champ obligatoire).
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useCallback } from 'react';
import { roll } from '../../../../tools/diceEngine.js';
import { useFetch }  from '../../../../hooks/useFetch.js';
import { useSystem } from '../../../../hooks/useSystem.js';
import fabulaConfig, { getAttributeAffliction, effectiveDieSize } from '../../config.jsx';

const ATTR_OPTIONS = [
    { key: 'dex', label: 'Dextérité' },
    { key: 'int', label: 'Intuition' },
    { key: 'pui', label: 'Puissance' },
    { key: 'vol', label: 'Volonté' },
];

const DIE_FIELD = { dex: 'dexDe', int: 'intDe', pui: 'puiDe', vol: 'volDe' };

const FabulaDiceModal = ({ character, sessionId = null, onClose, initialAttr1 = 'dex', initialAttr2 = 'int' }) => {
    const fetchWithAuth = useFetch();
    const { apiBase }   = useSystem();

    const [attr1, setAttr1]     = useState(initialAttr1);
    const [attr2, setAttr2]     = useState(initialAttr2 === initialAttr1 ? (initialAttr1 === 'dex' ? 'int' : 'dex') : initialAttr2);
    const [modifier, setModifier] = useState(0);
    const [nd, setNd]           = useState('');
    const [label, setLabel]     = useState('');

    const [rolling, setRolling] = useState(false);
    const [result, setResult]   = useState(null);
    const [error, setError]     = useState(null);

    const handleRoll = useCallback(async () => {
        if (rolling) return;
        setRolling(true);
        setError(null);
        try {
            const ctx = {
                apiBase, fetchFn: fetchWithAuth,
                characterId: character.id,
                characterName: character.nom || character.prenom || 'Personnage',
                sessionId,
                label: label || `Test [${ATTR_OPTIONS.find(a => a.key === attr1)?.label} + ${ATTR_OPTIONS.find(a => a.key === attr2)?.label}]`,
                rollType: 'fabula_test',
                systemData: {
                    type: 'test',
                    dieSize1: effectiveDieSize(character[DIE_FIELD[attr1]] ?? 8, !!getAttributeAffliction(character.alterationsEtat, attr1)),
                    dieSize2: effectiveDieSize(character[DIE_FIELD[attr2]] ?? 8, !!getAttributeAffliction(character.alterationsEtat, attr2)),
                    modifier: parseInt(modifier) || 0,
                    nd: nd !== '' ? parseInt(nd) : null,
                },
            };
            const notation = fabulaConfig.dice.buildNotation(ctx);
            const res = await roll(notation, ctx, fabulaConfig.dice);
            setResult(res);
        } catch (err) {
            console.error('[FabulaDiceModal] roll error:', err);
            setError(err.message || 'Erreur inattendue lors du jet.');
        } finally {
            setRolling(false);
        }
    }, [rolling, attr1, attr2, modifier, nd, label, character, apiBase, fetchWithAuth, sessionId]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
            <div className="bg-surface border border-default rounded-lg p-4 w-full max-w-md" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-3">
                    <h3 className="fu-font-title text-lg text-primary">Test d'Attribut</h3>
                    <button onClick={onClose} className="text-muted text-lg">✕</button>
                </div>

                {!result ? (
                    <div className="flex flex-col gap-3">
                        <div className="grid grid-cols-2 gap-2">
                            {[{ v: attr1, set: setAttr1 }, { v: attr2, set: setAttr2 }].map((slot, i) => (
                                <div key={i} className="flex flex-col gap-1">
                                    <label className="text-xs text-muted">Attribut {i + 1}</label>
                                    <div className="flex flex-wrap gap-1">
                                        {ATTR_OPTIONS.map(a => (
                                            <button key={a.key} type="button" onClick={() => slot.set(a.key)}
                                                    className={`px-2 py-1 rounded-full text-xs border ${
                                                        slot.v === a.key ? 'bg-primary text-white border-primary' : 'bg-default border-default'
                                                    }`}>
                                                {a.label} (d{effectiveDieSize(character[DIE_FIELD[a.key]] ?? 8, !!getAttributeAffliction(character.alterationsEtat, a.key))})
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <label className="text-xs text-muted">Intitulé (optionnel)</label>
                        <input value={label} onChange={e => setLabel(e.target.value)} placeholder="ex : Attaque à l'épée"
                               className="bg-default border border-default rounded px-2 py-1 text-sm" />

                        <div className="flex gap-3">
                            <div className="flex-1">
                                <label className="text-xs text-muted">Modificateur</label>
                                <input type="number" value={modifier} onChange={e => setModifier(e.target.value)}
                                       className="w-full bg-default border border-default rounded px-2 py-1 text-sm" />
                            </div>
                            <div className="flex-1">
                                <label className="text-xs text-muted">ND (optionnel)</label>
                                <input type="number" value={nd} onChange={e => setNd(e.target.value)} placeholder="annoncé par le MJ"
                                       className="w-full bg-default border border-default rounded px-2 py-1 text-sm" />
                            </div>
                        </div>

                        {error && <p className="text-xs text-danger">{error}</p>}

                        <button onClick={handleRoll} disabled={rolling}
                                className="px-4 py-2 rounded bg-primary text-white disabled:opacity-50">
                            {rolling ? 'Lancer en cours...' : 'Lancer les dés'}
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-center gap-4 py-2">
                            <div className="fu-die-badge bg-surface-alt border border-default text-lg">d{result.dieSize1} = {result.die1}</div>
                            <span className="text-muted">+</span>
                            <div className="fu-die-badge bg-surface-alt border border-default text-lg">d{result.dieSize2} = {result.die2}</div>
                        </div>
                        <div className="text-center text-sm text-muted">
                            VH : <strong>{result.vh}</strong> · Modificateur : {result.modifier} · Total : <strong>{result.total}</strong>
                        </div>
                        {result.criticalSuccess && <div className="text-center text-success font-bold">✦ Réussite critique !</div>}
                        {result.criticalFailure && <div className="text-center text-danger font-bold">✦ Échec critique !</div>}
                        {!result.criticalSuccess && !result.criticalFailure && result.nd != null && (
                            <div className={`text-center font-bold ${result.success ? 'text-success' : 'text-danger'}`}>
                                {result.success ? `Réussite (≥ ${result.nd})` : `Échec (< ${result.nd})`}
                            </div>
                        )}
                        <button onClick={onClose} className="px-4 py-2 rounded bg-primary text-white">Fermer</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FabulaDiceModal;