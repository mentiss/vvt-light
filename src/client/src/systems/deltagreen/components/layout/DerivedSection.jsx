// src/client/src/systems/deltagreen/components/sheet/sections/DerivedSection.jsx
import React from 'react';

// Compteur actuel/max cliquable (patch immédiat, hors editMode)
const Counter = ({ label, current, max, onDecrement, onIncrement, editMode, onEditMax, onEditCurrent }) => (
    <div className="border border-default p-2 bg-surface">
        <p className="dg-section-label mb-1">{label}</p>
        <div className="flex items-center justify-between gap-2">
            {/* Maximum */}
            <div className="text-center">
                <p className="text-xs text-muted font-mono">MAX</p>
                {editMode
                    ? <input type="number" min={0} max={99}
                             className="dg-field-input w-12 text-center text-sm px-1"
                             value={max ?? 0}
                             onChange={e => onEditMax(Number(e.target.value))} />
                    : <span className="font-mono text-sm">{max ?? 0}</span>
                }
            </div>

            {/*<span className="text-muted">/</span>*/}

            {/* Actuel — patch immédiat même hors édition */}
            <div className={`${editMode ? '' : 'flex items-center justify-center'} gap-1`}>
                {!editMode && (
                    <button onClick={onDecrement}
                        className="w-6 h-6 border border-default text-muted hover:text-danger hover:border-danger text-xs font-bold transition-colors">
                        −
                    </button>
                )}
                {editMode
                    ? <>
                        <p className="text-xs text-muted font-mono">CURRENT</p>
                        <input type="number" min={0} max={99}
                                 className="dg-field-input w-12 text-center text-sm px-1"
                                 value={current ?? 0}
                                 onChange={e => onEditCurrent(Number(e.target.value))} />
                    </>
                    : <span className="font-mono text-base font-bold w-10 text-center">{current ?? 0}</span>
                }
                {!editMode && (
                    <button onClick={onIncrement}
                            className="w-6 h-6 border border-default text-muted hover:text-success hover:border-success text-xs font-bold transition-colors">
                        +
                    </button>
                    )}
            </div>
        </div>
    </div>
);

const DerivedSection = ({ char, editMode, set, onPatchImmediate }) => {
    const patch = (field, value) => onPatchImmediate({ [field]: Math.max(0, value) });

    return (
        <div className="space-y-3">
            <p className="dg-section-label text-base mb-2 border-b border-default pb-1">
                9. ATTRIBUTS DÉRIVÉS
            </p>

            <div className="grid grid-cols-2 gap-3">
                {/* PV */}
                <Counter
                    label="Points de vie (PV)"
                    max={char.hpMax} current={char.hpCurrent}
                    editMode={editMode}
                    onEditMax={v => set('hpMax', v)}
                    onEditCurrent={v => patch('hpCurrent', v)}
                    onDecrement={() => patch('hpCurrent', (char.hpCurrent ?? 0) - 1)}
                    onIncrement={() => patch('hpCurrent', Math.min(char.hpMax ?? 99, (char.hpCurrent ?? 0) + 1))}
                />

                {/* VOL */}
                <Counter
                    label="Volonté (VOL)"
                    max={char.wpMax} current={char.wpCurrent}
                    editMode={editMode}
                    onEditMax={v => set('wpMax', v)}
                    onEditCurrent={v => patch('wpCurrent', v)}
                    onDecrement={() => patch('wpCurrent', (char.wpCurrent ?? 0) - 1)}
                    onIncrement={() => patch('wpCurrent', Math.min(char.wpMax ?? 99, (char.wpCurrent ?? 0) + 1))}
                />

                {/* SAN */}
                <Counter
                    label={`SAN (max : ${char.sanMax ?? 0})`}
                    max={char.sanMax} current={char.sanCurrent}
                    editMode={editMode}
                    onEditMax={v => set('sanMax', v)}
                    onEditCurrent={v => patch('sanCurrent', v)}
                    onDecrement={() => patch('sanCurrent', (char.sanCurrent ?? 0) - 1)}
                    onIncrement={() => patch('sanCurrent', Math.min(char.sanMax ?? 99, (char.sanCurrent ?? 0) + 1))}
                />

                {/* SR — affiché uniquement */}
                <div className="border border-default p-2 bg-surface">
                    <p className="dg-section-label mb-1">Seuil de rupture (SR)</p>
                    <div className="flex items-center justify-center gap-2 mt-2">
                        {/*<span className="text-muted text-xs font-mono">—</span>*/}
                        <span className="font-mono text-default font-bold text-center">{char.sr ?? 0}</span>
                    </div>
                    {/*<p className="text-xs text-muted font-mono mt-1">SAN actuelle − POU</p>*/}
                </div>
            </div>

            {/* Accoutumance */}
            <div className="mt-3 space-y-2">
                {[
                    { label: 'Violence',    field: 'adaptedViolence'     },
                    { label: 'Impuissance', field: 'adaptedHelplessness' },
                ].map(({ label, field }) => {
                    const count   = char[field] ?? 0;
                    const adapted = count >= 3;

                    const toggle = (idx) => {
                        // Clic sur case i :
                        //   - si toutes les cases jusqu'à i sont cochées → décoche i (count = i)
                        //   - sinon → coche jusqu'à i+1 (count = i+1)
                        const next = count === idx + 1 ? idx : idx + 1;
                        onPatchImmediate({ [field]: next });
                    };

                    return (
                        <div key={field} className="flex items-center gap-3">
                            <span className="text-xs font-mono w-20 shrink-0">{label}</span>

                            {/* 3 cases */}
                            <div className="flex items-center gap-1.5">
                                {[0, 1, 2].map(idx => (
                                    <input
                                        key={idx}
                                        type="checkbox"
                                        className="dg-checkbox"
                                        checked={count > idx}
                                        onChange={() => toggle(idx)}
                                        title={`Case ${idx + 1}/3`}
                                    />
                                ))}
                            </div>

                            {/* Badge accoutumé — visible seulement quand les 3 sont cochées */}
                            {adapted && (
                                <span className="dg-stamp dg-stamp-red text-[9px] tracking-widest">
                                    ACCOUTUMÉ
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default DerivedSection;