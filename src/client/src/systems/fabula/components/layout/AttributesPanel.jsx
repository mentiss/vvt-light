// src/client/src/systems/fabula/components/layout/AttributesPanel.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Attributs et altérations en arbre (retour du MJ, planche §3) :
//   • Deux paires : DEX / INT mènent à Enragé, PUI / VOL à Empoisonné ; chaque
//     attribut porte son altération propre juste dessous (Ralenti, Étourdi,
//     Affaibli, Traumatisé). La branche s'allume à la couleur de l'état actif.
//   • Le dé effectif est une gemme à sa taille (FuDie) ; un clic lance le test.
//     Dé de base en petit, flèche verte ou rouge si le dé effectif s'en écarte.
//   • Chevrons ▲ / ▼ : monter ou descendre d'un cran, sous la base comprise
//     (spec_fabula.md §3.1) ; ▲ masqué à d12, ▼ masqué à d6. Actifs hors mode
//     édition (action de jeu), persistés dans boostsAttributs.
//   • Altérations CUMULATIVES et indépendantes (règle officielle) : chaque
//     bouton s'active ou se désactive sans toucher aux autres.
//   • Mode édition : le choix du dé de base remplace gemme et chevrons.
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { getAttributeAfflictions, effectiveAttrDie, attrAdjustable, adjustAttrBoost } from '../../config.jsx';
import FuDie from '../ui/FuDie.jsx';
import FuIcon from '../ui/FuIcon.jsx';

const ATTRS = {
    dex: { field: 'dexDe', short: 'DEX', label: 'Dextérité' },
    int: { field: 'intDe', short: 'INT', label: 'Intuition' },
    pui: { field: 'puiDe', short: 'PUI', label: 'Puissance' },
    vol: { field: 'volDe', short: 'VOL', label: 'Volonté' },
};

// Couleur de chaque état (bouton, point sur l'attribut, branche)
const STATUSES = {
    ralenti:    { label: 'Ralenti',    icon: 'slow',    color: '#8FB7FF' },
    etourdi:    { label: 'Étourdi',    icon: 'dazed',   color: '#FFE066' },
    affaibli:   { label: 'Affaibli',   icon: 'weak',    color: '#FFA25C' },
    traumatise: { label: 'Traumatisé', icon: 'shaken',  color: '#C58BFF' },
    enrage:     { label: 'Enragé',     icon: 'enraged', color: '#FF5D6C' },
    empoisonne: { label: 'Empoisonné', icon: 'poison',  color: '#7EE07A' },
};

// Arbre : [attribut gauche, son état], [attribut droit, son état], état partagé
const PAIRS = [
    { left: ['dex', 'ralenti'], right: ['int', 'etourdi'],    shared: 'enrage' },
    { left: ['pui', 'affaibli'], right: ['vol', 'traumatise'], shared: 'empoisonne' },
];

const DIE_VALUES = [6, 8, 10, 12];

const StatusButton = ({ statusKey, active, onToggle }) => {
    const s = STATUSES[statusKey];
    return (
        <button type="button" onClick={() => onToggle(statusKey)}
                className={`fu-status${active ? ' is-on' : ''}`} style={{ '--st': s.color }}
                title={`${s.label} : un cran de moins sur le dé`}>
            <FuIcon name={s.icon} className="fu-ico-sm" />{s.label}
        </button>
    );
};

const AttributeCard = ({ character, attrKey, editMode, onFieldChange, onAdjust, onRoll }) => {
    const a = ATTRS[attrKey];
    const base = character[a.field];
    const die = effectiveAttrDie(character, attrKey);
    const { up, down } = attrAdjustable(character, attrKey);
    const afflictions = getAttributeAfflictions(character.alterationsEtat, attrKey);

    return (
        <div className="fu-attr">
            <div className="fu-attr-dots">
                {afflictions.map(k => <i key={k} style={{ color: STATUSES[k]?.color }} title={STATUSES[k]?.label} />)}
            </div>
            {!editMode && (
                <div className="fu-boost">
                    {up && (
                        <button type="button" onClick={() => onAdjust(attrKey, 1)} title="Monter d'un cran (arme, sort…)" aria-label="Monter d'un cran">
                            <FuIcon name="up" className="fu-ico-sm" />
                        </button>
                    )}
                    {down && (
                        <button type="button" className="is-down" onClick={() => onAdjust(attrKey, -1)} title="Descendre d'un cran" aria-label="Descendre d'un cran">
                            <FuIcon name="down" className="fu-ico-sm" />
                        </button>
                    )}
                </div>
            )}
            <span className="fu-attr-key">{a.short}</span>
            <span className="fu-attr-name">{a.label}</span>
            {editMode ? (
                <div className="fu-attr-bases">
                    {DIE_VALUES.map(v => (
                        <button key={v} type="button" onClick={() => onFieldChange(a.field, v)}
                                className={`fu-pill${base === v ? ' is-on' : ''}`}>d{v}</button>
                    ))}
                </div>
            ) : (
                <FuDie size={die} onClick={() => onRoll?.(attrKey)} title={`Lancer un test de ${a.label}`} />
            )}
            <span className="fu-attr-base">
                base d{base}
                {!editMode && die > base && <> <span className="is-up">▲</span></>}
                {!editMode && die < base && <> <span className="is-down">▼</span></>}
            </span>
        </div>
    );
};

const AttributesPanel = ({ character, editMode, onFieldChange, onQuickUpdate, onRollAttribute }) => {
    const alterations = character.alterationsEtat ?? [];
    const boosts      = character.boostsAttributs ?? {};

    // Bascule pure : ajoute ou retire UNE altération sans toucher aux autres
    const toggleAlteration = (key) => {
        const next = alterations.includes(key) ? alterations.filter(a => a !== key) : [...alterations, key];
        onQuickUpdate({ alterationsEtat: next });
    };
    const adjust = (attrKey, delta) =>
        onQuickUpdate({ boostsAttributs: { ...boosts, [attrKey]: adjustAttrBoost(character, attrKey, delta) } });

    const column = ([attrKey, statusKey]) => (
        <div className="fu-pair-col">
            <AttributeCard character={character} attrKey={attrKey} editMode={editMode}
                           onFieldChange={onFieldChange} onAdjust={adjust} onRoll={onRollAttribute} />
            <i className={`fu-stem${alterations.includes(statusKey) ? ' is-on' : ''}`} style={{ '--st': STATUSES[statusKey].color }} />
            <StatusButton statusKey={statusKey} active={alterations.includes(statusKey)} onToggle={toggleAlteration} />
        </div>
    );

    return (
        <div className="fu-win">
            <div className="fu-win-head">
                <h3 className="fu-title">Attributs &amp; Altérations<span className="fu-kana" aria-hidden="true">能力</span></h3>
                <span className="fu-rule" />
            </div>
            <div className="fu-tree">
                {PAIRS.map(p => (
                    <div key={p.shared} className="fu-pair">
                        {column(p.left)}
                        {column(p.right)}
                        <i className={`fu-branch${alterations.includes(p.shared) ? ' is-on' : ''}`} style={{ '--st': STATUSES[p.shared].color }} />
                        <StatusButton statusKey={p.shared} active={alterations.includes(p.shared)} onToggle={toggleAlteration} />
                    </div>
                ))}
            </div>
            <p className="fu-label mt-3 text-center">Altérations cumulables · un cran chacune · dés de d6 à d12</p>
        </div>
    );
};

export default AttributesPanel;
