// src/client/src/systems/vikings/components/creation/CreationSummary.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Le personnage en cours, sous la pierre (spec_vikings_pierre_peinte.md §9.2) :
// caractéristiques en pierres levées, SAGA de départ (1 + les « SAGA +N » des traits,
// D-9, D-11) et valeurs de combat (armure des objets équipés comprise), compétences en
// lecture « seuil seul », runes, paquetage (§9.5).
// variant 'aside' : colonne de droite, compacte ; 'final' : récapitulatif au centre.
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { CARACNAMES } from '../../config/competences.js';
import { RUNES } from '../../config/runes.js';
import { getBestCharacteristic, getSuccessThreshold, SAGA_MAX } from '../../config/rules.js';
import { formatItemNote, getCreationBudget, getStartingValues } from '../../config/creation.js';
import { formatExplosion, formatSkillName } from '../../config/utils.js';
import VkPanel from '../ui/VkPanel.jsx';
import { SkillOdds } from './CreationParts.jsx';

const itemLabel = (item) => `${item.name}${item.quantity > 1 ? ` ×${item.quantity}` : ''}`;

/** Paquetage : équipé, sac, bourse (étape Équipement et récapitulatif) */
export const Pack = ({ items, silver }) => {
    const groups = [['Équipé', items.filter(i => i.location === 'equipped')], ['Sac', items.filter(i => i.location !== 'equipped')]];
    return (
        <div className="vk-cr-pack">
            {groups.map(([label, list]) => (
                <div key={label}>
                    <span className="vk-vital-label">{label}</span>
                    {list.length === 0 && <p className="text-sm text-muted italic m-0">Rien.</p>}
                    {list.map((item, i) => (
                        <div key={`${item.name}-${i}`} className="vk-cr-pack-item">
                            <span>{itemLabel(item)}</span>
                            {formatItemNote(item) && <small className="text-muted">{formatItemNote(item)}</small>}
                        </div>
                    ))}
                </div>
            ))}
            <div>
                <span className="vk-vital-label">Bourse</span>
                <div className="vk-cr-pack-item"><span><strong className="vk-num">{silver}</strong> oz d'argent</span></div>
            </div>
        </div>
    );
};

const MiniPack = ({ items, silver }) => (
    <>
        {items.length ? (
            <div className="vk-cr-mini-runes">{items.map((item, i) => <span key={`${item.name}-${i}`}>{itemLabel(item)}</span>)}</div>
        ) : <p className="text-sm text-muted italic m-0">Rien pour l'instant.</p>}
        <p className="text-xs text-muted mt-2 mb-0">Bourse : <strong className="vk-num">{silver}</strong> oz</p>
    </>
);

const Caracs = ({ character }) => (
    <div className="vk-cr-mini-caracs">
        {Object.entries(CARACNAMES).map(([key, label]) => (
            <div key={key} className="vk-stat" title={`${label} ${character[key]}, explosion ${formatExplosion(character[key])}`}>
                <div className="val">{character[key]}</div>
                <div className="lbl">{label}</div>
            </div>
        ))}
    </div>
);

const Start = ({ character }) => {
    const v = getStartingValues(character);
    return (
        <>
            <div className="vk-cr-start">
                <div className="vk-vital-saga">
                    <span className="vk-vital-label">Saga</span>
                    <div className="vk-saga is-static" aria-label={`Saga ${v.saga} sur ${SAGA_MAX}`}>
                        {Array.from({ length: SAGA_MAX }, (_, i) => <button key={i} type="button" tabIndex={-1} className={i < v.saga ? 'is-full' : ''} />)}
                    </div>
                </div>
                <div className="vk-cr-combat">
                    <div><div className="val">{v.actions}</div><div className="lbl">Actions</div></div>
                    <div><div className="val">{v.seuil}</div><div className="lbl">Seuil</div></div>
                    <div><div className="val">{v.armure}</div><div className="lbl">Armure</div></div>
                </div>
            </div>
            <p className="text-xs text-muted mt-2 mb-0">SAGA de départ 1{v.bonus ? ` + ${v.bonus} des traits` : ''} · légende {v.saga}</p>
        </>
    );
};

const Skills = ({ character, full }) => {
    if (!character.skills.length) return <p className="text-sm text-muted italic m-0">Aucune pour l'instant.</p>;
    return character.skills.map(skill => {
        const bc = getBestCharacteristic(character, skill);
        const key = `${skill.name}-${skill.specialization || 'default'}`;
        if (!full) {
            return (
                <div key={key} className="vk-cr-mini-skill">
                    <span className="vk-cr-mini-skill-name">{skill.name}{skill.specialization && <small> · {skill.specialization}</small>}</span>
                    <span className="vk-seuil">{getSuccessThreshold(skill.level)}+</span>
                    <span className="vk-boom">↻ {formatExplosion(bc.level).replace(/, /g, '-')}</span>
                </div>
            );
        }
        return (
            <div key={key} className="vk-cr-skill">
                <div className="vk-skill-name">{formatSkillName(skill)}</div>
                <SkillOdds level={skill.level} caracLevel={bc.level} />
                <div className="vk-dots" title={`${skill.level} succès auto`}>
                    {Array.from({ length: skill.level }, (_, i) => <i key={i} className="is-full" />)}
                </div>
            </div>
        );
    });
};

const Runes = ({ character }) => {
    const b = getCreationBudget(character);
    return (
        <>
            {b.runeBook > 0 && <p className="text-xs text-muted mt-0 mb-2">Livre de sort {b.runeSpent} / {b.runeBook}</p>}
            {character.runes.length ? (
                <div className="vk-cr-mini-runes">
                    {character.runes.map(r => (
                        <span key={r.name}><span className="vk-rune">{RUNES.find(x => x.name === r.name)?.symbol}</span>{r.name} {r.level}</span>
                    ))}
                </div>
            ) : <p className="text-sm text-muted italic m-0">Aucune.</p>}
        </>
    );
};

/**
 * @param {object} props.character personnage en cours, `items` = inventaire du kit (sans l'argent)
 * @param {number} props.silver    onces d'argent restantes
 * @param {'aside'|'final'} [props.variant]
 */
const CreationSummary = ({ character, silver, variant = 'aside' }) => {
    const b = getCreationBudget(character);
    const showRunes = variant === 'final' || b.runeBook > 0 || character.runes.length > 0;
    if (variant === 'final') {
        return (
            <div className="vk-cr-final-grid">
                <VkPanel><h3 className="vk-band-title">Caractéristiques</h3><Caracs character={character} /></VkPanel>
                <VkPanel><h3 className="vk-band-title">Au départ</h3><Start character={character} /></VkPanel>
                <VkPanel><h3 className="vk-band-title">Runes</h3><Runes character={character} /></VkPanel>
                <VkPanel className="vk-cr-final-wide"><h3 className="vk-band-title">Paquetage</h3><Pack items={character.items} silver={silver} /></VkPanel>
                <VkPanel className="vk-cr-final-wide"><h3 className="vk-band-title">Compétences</h3><Skills character={character} full /></VkPanel>
            </div>
        );
    }
    return (
        <>
            <VkPanel><h3 className="vk-band-title">Caractéristiques</h3><Caracs character={character} /></VkPanel>
            <VkPanel><h3 className="vk-band-title">Au départ</h3><Start character={character} /></VkPanel>
            <VkPanel><h3 className="vk-band-title">Compétences</h3><Skills character={character} /></VkPanel>
            {showRunes && <VkPanel><h3 className="vk-band-title">Runes</h3><Runes character={character} /></VkPanel>}
            <VkPanel><h3 className="vk-band-title">Paquetage</h3><MiniPack items={character.items} silver={silver} /></VkPanel>
        </>
    );
};

export default CreationSummary;
