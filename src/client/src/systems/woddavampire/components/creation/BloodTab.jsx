// src/client/src/systems/woddavampire/components/creation/BloodTab.jsx
// Onglet « Sang et résumé » : Génération, jet de la réserve de départ (1d10 +
// Domaine + Troupeau, plafonné), Route, Volonté, récapitulatif des manques et
// validation. §5.2 à §5.4, §7.1.

import React from 'react';
import { CLANS, ROADS, VIRTUE_LABELS } from '../../config.jsx';
import {
    computeGeneration, startingBlood, backgroundValue, roadRating, willpowerRating, virtueValue, virtueKeys, isCreationValid,
} from '../../config/rules/creationRules.js';
import { generationStats } from '../../config/rules/character.js';
import { VdaSectionTitle } from '../ui/VdaUi.jsx';

const TAB_LABELS = {
    lineage: 'Lignée et Route', attributes: 'Attributs', abilities: 'Capacités', advantages: 'Avantages',
    finishing: 'Finitions', identity: 'Identité', blood: 'Sang et résumé',
};

const Stat = ({ label, children }) => (
    <div className="vda-field"><b>{label}</b><span>{children}</span></div>
);

const BloodTab = ({ ws, report, rolling, onRollBlood, onSubmit, submitting }) => {
    const generation = computeGeneration(ws);
    const { bloodMax, perTurn, traitMax } = generationStats(generation);
    const domain = backgroundValue(ws, 'domain');
    const herd = backgroundValue(ws, 'herd');
    const blood = ws.bloodRoll != null ? startingBlood(ws.bloodRoll, domain, herd, bloodMax) : null;
    const vk = virtueKeys(ws);
    const valid = isCreationValid(report);
    const errors = Object.entries(report).flatMap(([tab, r]) => r.errors.map(e => `${TAB_LABELS[tab]} : ${e}`));
    const warnings = Object.entries(report).flatMap(([tab, r]) => r.warnings.map(w => `${TAB_LABELS[tab]} : ${w}`));

    return (
        <div>
            <VdaSectionTitle>Sang et résumé</VdaSectionTitle>
            <div className="vda-two">
                <div>
                    <Stat label="Clan">{CLANS[ws.clanKey]?.label ?? '—'}</Stat>
                    <Stat label="Route">{ROADS[ws.roadKey]?.label ?? '—'} · {roadRating(ws)}</Stat>
                    <Stat label="Vertus">{['moral', 'control', 'courage'].map(s => `${VIRTUE_LABELS[vk[s]]} ${virtueValue(ws, s)}`).join(' · ')}</Stat>
                    <Stat label="Volonté">{willpowerRating(ws)}</Stat>
                    <Stat label="Génération">{generation}ᵉ · traits max {traitMax} · sang max {bloodMax} · {perTurn} par tour</Stat>
                </div>
                <div>
                    <div className="vda-label">Réserve de sang de départ : 1d10 + Domaine ({domain}) + Troupeau ({herd}), au plus {bloodMax}</div>
                    <div className="flex items-center gap-3 mt-1">
                        <button type="button" className="vtt-btn vtt-btn-primary" disabled={rolling} onClick={onRollBlood}>
                            {ws.bloodRoll == null ? 'Lancer le dé' : 'Relancer'}
                        </button>
                        {blood != null && <span className="vda-roll-result">{ws.bloodRoll} → {blood} point{blood > 1 ? 's' : ''} de sang</span>}
                    </div>
                    <p className="vda-note mt-1">Modifiable ensuite sur la fiche par le joueur et le Conteur.</p>
                </div>
            </div>

            {errors.length > 0 && <ul className="vda-error-list">{errors.map(e => <li key={e}>{e}</li>)}</ul>}
            {warnings.length > 0 && <ul className="vda-warning-list">{warnings.map(w => <li key={w}>{w}</li>)}</ul>}

            <div className="flex justify-end mt-4">
                <button type="button" className="vtt-btn vtt-btn-primary" disabled={!valid || submitting} onClick={onSubmit}>
                    {submitting ? 'Création…' : 'Créer le personnage'}
                </button>
            </div>
        </div>
    );
};

export default BloodTab;
