// src/client/src/systems/vikings/components/creation/StepFinal.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Étape 6 : finalisation et naissance (spec_vikings.md §4 ; spec_vikings_pierre_peinte.md §9.2).
//   StepFinal : la pierre au centre, en grand, comme récapitulatif ; ce qui manque, avec
//               un lien vers l'étape ; code d'accès personnalisé ; création une fois tout complet.
//   Birth     : écran après création : gravure du ruban, rune ᛊ et vague de lumière
//               (événement VK_TRIPLE, écouté par le ciel et le ruban), corbeau qui vient se
//               poser une fois sur la pierre (pierre peinte, animations actives), code d'accès.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect } from 'react';
import { CREATION_STEPS, getCreationMissing } from '../../config/creation.js';
import CopyAccessButton from '@/features/table/CopyAccessButton.jsx';
import { emitVk, VK_TRIPLE } from '../../hooks/useVkLook.js';
import VkIcon from '../ui/VkIcon.jsx';
import VkPanel from '../ui/VkPanel.jsx';
import VkRaven from '../ui/VkRaven.jsx';
import CreationStone from './CreationStone.jsx';
import CreationSummary from './CreationSummary.jsx';

const OMEN_DELAY_MS = 2300;   // après la gravure du ruban

/**
 * @param {object} props.character personnage en cours, `items` = inventaire du kit
 * @param {object} props.gear      choix du kit ; props.silver : argent restant
 */
export const StepFinal = ({ character, gear, silver, inscription, invalid, onGo, customCode, onCustomCode, onCreate, loading, error }) => {
    const missing = getCreationMissing(character, gear);
    return (
        <>
            <CreationStone character={character} inscription={inscription} invalid={invalid} className="vk-cr-final-stone" />
            {missing.length > 0 && (
                <div className="vk-callout vk-callout-warn vk-cr-missing">
                    <strong>Avant de créer le personnage</strong>
                    <ul>
                        {missing.map(m => (
                            <li key={m.text}>{m.text} : <button type="button" className="vk-item-link" onClick={() => onGo(m.step)}>{CREATION_STEPS[m.step]}</button></li>
                        ))}
                    </ul>
                </div>
            )}
            <CreationSummary character={character} silver={silver} variant="final" />
            <div className="vk-cr-code">
                <label>
                    <span className="vk-field-label">Code d'accès personnalisé (facultatif)</span>
                    <input className="vk-input vk-num" value={customCode} maxLength={6}
                           onChange={e => onCustomCode(e.target.value.toUpperCase().substring(0, 6))}
                           placeholder="Généré si vide" />
                    <span className="block text-xs text-muted mt-1">6 caractères au plus ; le code doit être libre.</span>
                </label>
                <button type="button" className="vk-btn vk-btn-primary vk-cr-create" onClick={onCreate} disabled={loading || missing.length > 0}>
                    {loading ? 'Création…' : 'Créer le personnage'}
                </button>
            </div>
            {error && <div className="vk-callout vk-callout-danger text-sm mt-4">{error}</div>}
        </>
    );
};

export const Birth = ({ character, created, inscription, onCreated }) => {
    useEffect(() => {
        const t = setTimeout(() => emitVk(VK_TRIPLE, {}), OMEN_DELAY_MS);
        return () => clearTimeout(t);
    }, []);
    return (
        <div className="vk-cr-birth">
            <CreationStone character={character} inscription={inscription}>
                <VkRaven characterId={created.id} once />
            </CreationStone>
            <div className="vk-title vk-cr-born">{character.prenom} est né{character.sexe === 'femme' ? 'e' : ''} !</div>
            <VkPanel className="vk-cr-code-slab">
                <h3 className="vk-band-title">Votre code d'accès</h3>
                <div className="vk-title vk-num vk-cr-code-value">{created.accessCode}</div>
                <CopyAccessButton character={created} codeOnly icon={<VkIcon name="key" />} className="vtt-btn-sm" />
                <p className="text-xs text-muted mt-2 mb-0">Conservez-le : c'est votre clé d'accès permanente.</p>
            </VkPanel>
            <button type="button" className="vk-btn vk-btn-primary vk-cr-create" onClick={() => onCreated(created)}>Accéder à ma fiche →</button>
        </div>
    );
};
