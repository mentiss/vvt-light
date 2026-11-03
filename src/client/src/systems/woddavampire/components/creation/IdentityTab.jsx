// src/client/src/systems/woddavampire/components/creation/IdentityTab.jsx
// Onglet « Identité » (placé entre Finitions et Sang, demande du MJ) : noms,
// chronique, concept, Nature et Attitude (« Bête » exclue), sire, champ
// personnalisé de la faiblesse, trois phrases d'historique. §4.1, §15.1.

import React, { useState } from 'react';
import AvatarUploader from '../../../../components/AvatarUploader.jsx';
import { ARCHETYPES } from '../../config.jsx';
import { clanProfile } from '../../config/rules/character.js';
import { VdaChip, VdaSectionTitle } from '../ui/VdaUi.jsx';
import { useHelp, helpProps } from './CreationHelp.jsx';

const Field = ({ label, value, onChange, required = false }) => (
    <label className="block">
        <span className="vda-label">{label}{required ? ' *' : ''}</span>
        <input className="vda-input" value={value ?? ''} onChange={(e) => onChange(e.target.value)} />
    </label>
);

const Phrase = ({ label, value, onChange }) => (
    <label className="block">
        <span className="vda-label">{label}</span>
        <textarea className="vda-textarea" rows={2} value={value ?? ''} onChange={(e) => onChange(e.target.value)} />
    </label>
);

const ArchetypePicker = ({ label, value, onChange }) => {
    const show = useHelp();
    return (
        <div>
            <div className="vda-label">{label}</div>
            <div className="vda-chips">
                {ARCHETYPES.map(a => (
                    <VdaChip key={a.key} on={value === a.key} {...helpProps(show, { kind: 'archetype', key: a.key })}
                             onClick={() => { onChange(value === a.key ? null : a.key); show({ kind: 'archetype', key: a.key }); }}>{a.label}</VdaChip>
                ))}
            </div>
        </div>
    );
};

const IdentityTab = ({ ws, patch }) => {
    const weaknessField = clanProfile(ws.clanKey, ws.casteKey)?.weaknessField;
    const [avatarOpen, setAvatarOpen] = useState(false);
    return (
        <div>
            <VdaSectionTitle>Identité</VdaSectionTitle>
            <div className="vda-identity">
            {/* Portrait (facultatif), même médaillon que sur la fiche */}
            <button type="button" className="vda-avatar is-editable" onClick={() => setAvatarOpen(true)} title="Choisir un portrait" aria-label="Portrait">
                {ws.avatar ? <img src={ws.avatar} alt="" /> : <span aria-hidden="true">✠</span>}
            </button>
            <div className="vda-three">
                <Field label="Nom" value={ws.nom} onChange={(v) => patch({ nom: v })} required />
                <Field label="Joueur" value={ws.playerName} onChange={(v) => patch({ playerName: v })} required />
                <Field label="Chronique" value={ws.chronicle} onChange={(v) => patch({ chronicle: v })} />
                <Field label="Concept" value={ws.concept} onChange={(v) => patch({ concept: v })} />
                <Field label="Sire" value={ws.sire} onChange={(v) => patch({ sire: v })} />
                {weaknessField && <Field label={`Faiblesse : ${weaknessField}`} value={ws.weaknessDetail} onChange={(v) => patch({ weaknessDetail: v })} />}
            </div>
            </div>
            {avatarOpen && (
                <AvatarUploader currentAvatar={ws.avatar} onAvatarChange={(avatar) => patch({ avatar })} onClose={() => setAvatarOpen(false)} />
            )}
            <div className="vda-two mt-3">
                <ArchetypePicker label="Nature (regain de Volonté)" value={ws.natureKey} onChange={(v) => patch({ natureKey: v })} />
                <ArchetypePicker label="Attitude" value={ws.demeanorKey} onChange={(v) => patch({ demeanorKey: v })} />
            </div>
            <VdaSectionTitle small>Histoire</VdaSectionTitle>
            <div className="vda-three">
                <Phrase label="De mon vivant, j'étais…" value={ws.historyLife} onChange={(v) => patch({ historyLife: v })} />
                <Phrase label="Mon sire m'a choisi parce que…" value={ws.historySire} onChange={(v) => patch({ historySire: v })} />
                <Phrase label="Désormais, je passe mes nuits…" value={ws.historyNights} onChange={(v) => patch({ historyNights: v })} />
            </div>
            <div className="vda-two mt-2">
                <Field label="Langues" value={ws.languages} onChange={(v) => patch({ languages: v })} />
                <Field label="Description" value={ws.description} onChange={(v) => patch({ description: v })} />
            </div>
        </div>
    );
};

export default IdentityTab;
