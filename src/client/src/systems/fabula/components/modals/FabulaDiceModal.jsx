// src/client/src/systems/fabula/components/modals/FabulaDiceModal.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Fenêtre de jet (planche §4, spec_fabula.md §6.2) : préparation et résultat
// côte à côte, sans fermer la fenêtre pour relancer.
//   • Deux dés en gemmes à leur taille effective (altérations et chevrons).
//   • Compétences du personnage qui touchent CE jet (config/rolls.js) : pills,
//     pré-activées quand l'arme, le sort ou la Crise les déclenche ; raccourcis
//     (Provocation…) qui préremplissent attributs et bonus ; Sorcelame qui prend
//     la formule de précision de l'arme.
//   • Trois usages : test d'attribut ; attaque (weaponContext, dégâts [VH + arme]) ;
//     sort (spellContext, dégâts lus dans le texte du sort s'il en inflige).
//   • Résultat : tampon Critique / Fumble, dégâts, compétences appliquées ;
//     Nombre porte-bonheur (Entropiste) : une fois par scène, remplace un dé par
//     le nombre, la valeur remplacée devient le nouveau nombre ; le jet corrigé
//     est ajouté à l'historique (POST /dice/roll) et la fiche mise à jour.
//
// Props : character, sessionId, onClose, initialAttr1, initialAttr2, initialLabel,
//         weaponContext?, spellContext?, onCharacterPatch? (patch immédiat de la fiche)
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useCallback, useMemo } from 'react';
import { roll } from '../../../../tools/diceEngine.js';
import { useFetch }  from '../../../../hooks/useFetch.js';
import { useSystem } from '../../../../hooks/useSystem.js';
import Modal from '../../../../components/ui/Modal.jsx';
import FuIcon from '../ui/FuIcon.jsx';
import FuDie from '../ui/FuDie.jsx';
import fabulaConfig, {
    effectiveAttrDie, TYPES_DEGATS, formatPrecision, formatDegats,
    applicableRollSkills, rollModifiers, resolveFabulaTest, parseSpellDamage, applyLuckyNumber, equippedWeapon, skillRank,
} from '../../config.jsx';

const ATTRS = [
    { key: 'dex', short: 'DEX', label: 'Dextérité' },
    { key: 'int', short: 'INT', label: 'Intuition' },
    { key: 'pui', short: 'PUI', label: 'Puissance' },
    { key: 'vol', short: 'VOL', label: 'Volonté' },
];
const shortOf = (k) => ATTRS.find(a => a.key === k)?.short ?? k;
const degatsLabel = (key) => TYPES_DEGATS.find(t => t.key === key)?.label ?? key;
const signed = (n) => (n >= 0 ? `+${n}` : `−${-n}`);

// ── Résultat (colonne de droite) ─────────────────────────────────────────────
const RollResult = ({ result, lucky, canLuck, onLuck, onLuckReset, onReroll }) => {
    const { die1, die2, dieSize1, dieSize2, vh, total, modifier, bonus, nd, criticalSuccess, criticalFailure, success, skills } = result;
    const showDmg = result.type === 'attaque' && result.degats != null && !criticalFailure && (success !== false);
    return (
        <div className={`fu-stage${criticalSuccess ? ' is-crit' : ''}${criticalFailure ? ' is-fumble' : ''}`}>
            {criticalSuccess && <div className="fu-stamp">Critique !<small aria-hidden="true">クリティカル</small></div>}
            {criticalFailure && <div className="fu-stamp is-fumble">Fumble…<small aria-hidden="true">ファンブル</small></div>}
            {showDmg && <div className="fu-dmg">{result.degats}<small>{degatsLabel(result.degatsType)}</small></div>}

            <div className={`fu-stage-body${criticalSuccess || criticalFailure ? ' has-stamp' : ''}`}>
                {result.label && <div className="fu-label mb-3">{result.label}</div>}
                <div className="fu-dice-pair">
                    <div className={`fu-die-slot${die1 >= die2 ? ' is-hi' : ''}`}><FuDie size={dieSize1} label={die1} className="fu-die-lg" /></div>
                    <span className="fu-plus">+</span>
                    <div className={`fu-die-slot${die2 > die1 ? ' is-hi' : ''}`}><FuDie size={dieSize2} label={die2} className="fu-die-lg" /></div>
                </div>
                <div className="fu-total">{total}</div>
                <div className="fu-total-detail">
                    {die1} + {die2}{modifier ? ` ${signed(modifier)}` : ''}{bonus ? ` ${signed(bonus)}` : ''} · VH {vh}{nd != null ? ` · ND ${nd}` : ''}
                </div>
                {criticalSuccess ? <span className="fu-verdict is-crit">Réussite critique</span>
                    : criticalFailure ? <span className="fu-verdict is-ko">Échec critique · +1 PF</span>
                    : success != null && <span className={`fu-verdict ${success ? 'is-ok' : 'is-ko'}`}>{success ? 'Réussite' : 'Échec'}</span>}
                {showDmg && (
                    <div className="fu-total-detail mt-2">Dégâts {result.degats} ({degatsLabel(result.degatsType)}) — VH {vh} + {result.degatsBonus}</div>
                )}
                {(skills?.length > 0 || result.lucky) && (
                    <div className="flex gap-1.5 justify-center flex-wrap mt-2">
                        {(skills ?? []).map(n => <span key={n} className="fu-tag text-primary">{n}</span>)}
                        {result.lucky && <span className="fu-tag text-secondary">Porte-bonheur : dé {result.lucky.index + 1} ({result.lucky.from} → {result.lucky.to})</span>}
                    </div>
                )}

                {canLuck && (
                    <div className="fu-luck">
                        <span className="fu-label">Nombre porte-bonheur <b>{lucky.value}</b>{lucky.used ? ' · déjà utilisé dans cette scène' : ''}</span>
                        {!lucky.used && !result.lucky && (
                            <div className="flex gap-1.5 justify-center flex-wrap">
                                <button type="button" className="fu-btn fu-btn-sm fu-btn-gold" onClick={() => onLuck(0)}>Dé 1 : {die1} → {lucky.value}</button>
                                <button type="button" className="fu-btn fu-btn-sm fu-btn-gold" onClick={() => onLuck(1)}>Dé 2 : {die2} → {lucky.value}</button>
                            </div>
                        )}
                        <div className="flex gap-1.5 justify-center">
                            <button type="button" className="fu-pill" onClick={() => onLuckReset(false)}>Nouvelle scène</button>
                            <button type="button" className="fu-pill" onClick={() => onLuckReset(true)}>Nouvelle séance (7)</button>
                        </div>
                    </div>
                )}

                <div className="mt-4"><button type="button" className="fu-btn fu-btn-sm" onClick={onReroll}>Relancer</button></div>
            </div>
        </div>
    );
};

const FabulaDiceModal = ({
    character, sessionId = null, onClose,
    initialAttr1 = 'dex', initialAttr2 = 'int', initialLabel = '',
    weaponContext = null, spellContext = null, onCharacterPatch,
}) => {
    const fetchWithAuth = useFetch();
    const { apiBase }   = useSystem();

    // Dégâts d'un sort : lus dans son texte ; un sort sans dégâts reste un test
    const spellDamage = spellContext ? parseSpellDamage(spellContext.description) : null;
    const mode = weaponContext || spellDamage ? 'attaque' : 'test';
    const dmgBase = weaponContext
        ? { degatsBonus: weaponContext.degatsBonus ?? 0, degatsType: weaponContext.degatsType ?? 'physique' }
        : spellDamage;

    const [attr1, setAttr1]       = useState(weaponContext?.precisionAttr1 ?? initialAttr1);
    const [attr2, setAttr2]       = useState(weaponContext ? weaponContext.precisionAttr2 : (initialAttr2 === initialAttr1 ? (initialAttr1 === 'dex' ? 'int' : 'dex') : initialAttr2));
    const [modifier, setModifier] = useState(weaponContext?.precisionBonus ?? 0);
    const [nd, setNd]             = useState('');
    const [label, setLabel]       = useState(weaponContext ? `Attaque : ${weaponContext.nomLibre}` : initialLabel);

    const rollCtx = useMemo(() => ({
        mode,
        weapon: weaponContext ? { categorie: weaponContext.categorie, portee: weaponContext.portee } : null,
        spell:  spellContext ? { offensif: !!spellContext.offensif } : null,
        attrs:  [attr1, attr2],
    }), [mode, weaponContext, spellContext, attr1, attr2]);
    const available = applicableRollSkills(character, rollCtx);

    // Compétences cochées : celles qui s'activent d'elles-mêmes à l'ouverture
    const [checked, setChecked] = useState(() => new Set(applicableRollSkills(character, rollCtx).filter(s => s.auto).map(s => s.key)));
    const selected = available.filter(s => checked.has(s.key) && s.effect !== 'lucky');
    const mods = rollModifiers(selected);

    const [rolling, setRolling] = useState(false);
    const [result, setResult]   = useState(null);
    const [error, setError]     = useState(null);

    const hasLucky = skillRank(character, 'entropiste', 'nombre_porte_bonheur') > 0;
    const [lucky, setLucky] = useState({ value: character.porteBonheur ?? 7, used: !!character.porteBonheurUtilise });

    const clickSkill = (s) => {
        if (s.effect === 'lucky') return;
        if (s.effect === 'shortcut') { setAttr1(s.attrs[0]); setAttr2(s.attrs[1]); setLabel(s.nom); }
        if (s.effect === 'weaponFormula') {
            const w = equippedWeapon(character);
            if (w && !checked.has(s.key)) { setAttr1(w.precisionAttr1); setAttr2(w.precisionAttr2); setModifier(w.precisionBonus ?? 0); }
        }
        setChecked(prev => {
            const next = new Set(prev);
            if (next.has(s.key)) next.delete(s.key); else next.add(s.key);
            return next;
        });
    };

    const handleRoll = useCallback(async () => {
        if (rolling) return;
        setRolling(true);
        setError(null);
        setResult(null);
        try {
            const ctx = {
                apiBase, fetchFn: fetchWithAuth,
                characterId: character.id,
                characterName: [character.prenom, character.nom].filter(Boolean).join(' ') || 'Personnage',
                sessionId,
                label: label || `Test [${shortOf(attr1)} + ${shortOf(attr2)}]`,
                rollType: 'fabula_test',
                systemData: {
                    type: mode,
                    dieSize1: effectiveAttrDie(character, attr1),
                    dieSize2: effectiveAttrDie(character, attr2),
                    modifier: parseInt(modifier) || 0,
                    nd: nd !== '' ? parseInt(nd) : null,
                    bonus: mods.bonus,
                    critAnyDouble: mods.critAnyDouble,
                    skills: mods.names,
                    degatsBonus: dmgBase ? dmgBase.degatsBonus + mods.damage : undefined,
                    degatsType:  dmgBase?.degatsType,
                },
            };
            const notation = fabulaConfig.dice.buildNotation(ctx);
            setResult(await roll(notation, ctx, fabulaConfig.dice));
        } catch (err) {
            console.error('[FabulaDiceModal] roll error:', err);
            setError(err.message || 'Erreur inattendue lors du jet.');
        } finally {
            setRolling(false);
        }
    }, [rolling, attr1, attr2, modifier, nd, label, character, apiBase, sessionId, mode, mods.bonus, mods.critAnyDouble, mods.names, mods.damage, dmgBase]); // fetchWithAuth exclu (référence instable)

    // Nombre porte-bonheur : jet corrigé, ajouté à l'historique, fiche mise à jour
    const applyLuck = async (index) => {
        const { dice: [d1, d2], next } = applyLuckyNumber([result.die1, result.die2], index, lucky.value);
        const r = resolveFabulaTest({
            die1: d1, die2: d2, modifier: result.modifier, bonus: result.bonus ?? 0, nd: result.nd,
            critAnyDouble: !!result.critAnyDouble, degatsBonus: result.type === 'attaque' ? result.degatsBonus : null,
        });
        const corrected = {
            ...result, die1: d1, die2: d2, vh: r.vh, total: r.total,
            criticalSuccess: r.criticalSuccess, criticalFailure: r.criticalFailure, success: r.success,
            successes: r.success === true ? 1 : 0,
            ...(result.type === 'attaque' ? { degats: r.degats } : {}),
            lucky: { index, from: index === 0 ? result.die1 : result.die2, to: lucky.value },
        };
        setResult(corrected);
        setLucky({ value: next, used: true });
        onCharacterPatch?.({ porteBonheur: next, porteBonheurUtilise: true });
        try {
            await fetchWithAuth(`${apiBase}/dice/roll`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    session_id: sessionId ?? null,
                    character_id: character.id,
                    character_name: [character.prenom, character.nom].filter(Boolean).join(' ') || 'Personnage',
                    roll_type: 'fabula_test',
                    notation: 'porte-bonheur',
                    roll_result: JSON.stringify(corrected),
                    successes: corrected.successes,
                }),
            });
        } catch (err) {
            console.warn('[FabulaDiceModal] porte-bonheur non enregistré :', err);
        }
    };
    const resetLuck = (newSession) => {
        const next = { value: newSession ? 7 : lucky.value, used: false };
        setLucky(next);
        onCharacterPatch?.({ porteBonheur: next.value, porteBonheurUtilise: false });
    };

    const d1 = effectiveAttrDie(character, attr1);
    const d2 = effectiveAttrDie(character, attr2);
    const title = mode === 'attaque' ? (spellContext ? 'Sort offensif' : 'Attaque') : spellContext ? 'Sort' : "Test d'attribut";

    return (
        <Modal onClose={onClose} title={title} size="xl" className="fu-roll-modal">
            <div className="fu-roll">
                <section>
                    {weaponContext && (
                        <div className="fu-roll-ref">
                            <FuIcon name="sword" className="fu-ico-sm text-primary" />
                            <b>{weaponContext.nomLibre}</b>
                            <span className="text-muted">Précision {formatPrecision(weaponContext)} · Dégâts {formatDegats(weaponContext)}</span>
                        </div>
                    )}
                    {spellContext && (
                        <div className="fu-roll-ref">
                            <FuIcon name={spellContext.offensif ? 'bolt' : 'spark'} className="fu-ico-sm text-primary" />
                            <b>{spellContext.nom}</b>
                            <span className="text-muted">{[spellContext.cout, spellContext.cible, spellContext.duree].filter(Boolean).join(' · ')}</span>
                        </div>
                    )}

                    {[{ v: attr1, set: setAttr1, label: 'Premier dé' }, { v: attr2, set: setAttr2, label: 'Second dé' }].map((slot, i) => (
                        <div key={i} className="mb-3">
                            <div className="fu-label mb-1.5">{slot.label}</div>
                            <div className="fu-pick">
                                {ATTRS.map(a => (
                                    <button key={a.key} type="button" onClick={() => slot.set(a.key)} className={slot.v === a.key ? 'is-on' : ''}
                                            title={`${a.label} (d${effectiveAttrDie(character, a.key)})`}>
                                        <FuDie size={effectiveAttrDie(character, a.key)} small />
                                        <span className="fu-label">{a.short}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}

                    {available.length > 0 && (
                        <div className="mb-3">
                            <div className="fu-label mb-1.5">Compétences</div>
                            <div className="flex flex-wrap gap-1.5">
                                {available.map(s => (
                                    <button key={s.key} type="button" onClick={() => clickSkill(s)} disabled={s.effect === 'lucky'}
                                            className={`fu-skill-pill${checked.has(s.key) && s.effect !== 'lucky' ? ' is-on' : ''}`}>
                                        {s.nom}
                                        <small>
                                            {s.effect === 'bonus' || s.effect === 'shortcut' ? signed(s.value) : s.effect === 'damage' ? `${signed(s.value)} dégâts` : ''}
                                            {s.note ? ` ${s.note}` : ''}
                                        </small>
                                        {s.auto && <span className="fu-auto">auto</span>}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="fu-formula">
                        <FuDie size={d1} small /> {shortOf(attr1)} <span className="fu-op">+</span> <FuDie size={d2} small /> {shortOf(attr2)}
                        {(parseInt(modifier) || 0) !== 0 && <> <span className="fu-op">{signed(parseInt(modifier) || 0)}</span></>}
                        {mods.bonus !== 0 && <> <span className="text-primary">{signed(mods.bonus)}</span></>}
                        {dmgBase && <> <span className="fu-op">·</span> <span className="text-accent">[VH + {dmgBase.degatsBonus + mods.damage}]</span></>}
                    </div>

                    <div className="vtt-field mb-3">
                        <label className="vtt-field-label">Intitulé (facultatif)</label>
                        <input value={label} onChange={e => setLabel(e.target.value)} placeholder="ex : Déchiffrer la stèle" className="vtt-input w-full" />
                    </div>
                    <div className="flex gap-4 flex-wrap items-end">
                        <div className="vtt-field">
                            <span className="vtt-field-label">Modificateur{weaponContext ? ' (arme)' : ''}</span>
                            <div className="fu-step">
                                <button type="button" className="fu-step-btn" onClick={() => setModifier(m => (parseInt(m) || 0) - 1)} aria-label="Diminuer"><FuIcon name="minus" className="fu-ico-sm" /></button>
                                <span className="fu-step-val">{signed(parseInt(modifier) || 0)}</span>
                                <button type="button" className="fu-step-btn" onClick={() => setModifier(m => (parseInt(m) || 0) + 1)} aria-label="Augmenter"><FuIcon name="plus" className="fu-ico-sm" /></button>
                            </div>
                        </div>
                        <div className="vtt-field">
                            <label className="vtt-field-label">ND (facultatif)</label>
                            <input type="number" value={nd} onChange={e => setNd(e.target.value)} placeholder="—" title="Difficulté annoncée par le MJ" className="vtt-input w-24 text-center" />
                        </div>
                    </div>

                    {error && <p className="text-xs text-danger mt-3">{error}</p>}

                    <button type="button" onClick={handleRoll} disabled={rolling} className="fu-btn fu-btn-gold fu-btn-big mt-4">
                        <FuIcon name="dice" />{rolling ? 'Les dés roulent…' : 'Lancer'}
                    </button>
                </section>

                <section>
                    {result ? (
                        <RollResult result={result} lucky={lucky} canLuck={hasLucky}
                                    onLuck={applyLuck} onLuckReset={resetLuck} onReroll={handleRoll} />
                    ) : (
                        <div className="fu-stage">
                            <div className="fu-stage-idle">
                                <FuIcon name="sigil" />
                                {rolling ? 'Les dés roulent…' : 'En attente du lancer'}
                            </div>
                        </div>
                    )}
                </section>
            </div>
        </Modal>
    );
};

export default FabulaDiceModal;
