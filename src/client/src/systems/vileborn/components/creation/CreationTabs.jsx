// src/client/src/systems/vileborn/components/creation/CreationTabs.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Onglets de l'assistant de création (spec_vileborn.md §II.7), un composant
// par onglet. Chacun reçoit { ws, setWs } ; les règles (placement des dés,
// choix d'une origine) sont dans config/rules/creation.js. Pas de <select> :
// des pills, avec « Autre… » pour la saisie libre.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import AvatarUploader from '@/ui/image/AvatarUploader.jsx';
import {
    HERITAGES, HERITAGE_ORDER, ORIGINS, ORIGIN_ORDER, RESOURCES, APPROACHES,
    PERSONALITY_SUGGESTIONS, TRAINING_SUGGESTIONS, GUIDE,
} from '../../config.jsx';
import { DISTRIBUTIONS, diceChoices, assignDie, chooseDistribution, chooseOrigin } from '../../config/rules/creation.js';
import { VilLabel, VilPill } from '../ui/VilUi.jsx';
import { useHelp, helpProps } from './CreationHelp.jsx';

// ── Guide ──────────────────────────────────────────────────────────────────

export const GuideTab = ({ onStart }) => (
    <div className="vil-fields">
        {GUIDE.map(g => (
            <div key={g.title}>
                <div className="vil-help-title">{g.title}</div>
                <p>{g.text}</p>
            </div>
        ))}
        <div><button type="button" className="vtt-btn vtt-btn-primary" onClick={onStart}>Commencer</button></div>
    </div>
);

// ── Sombre héritage ───────────────────────────────────────────────────────

export const HeritageTab = ({ ws, setWs }) => {
    const show = useHelp();
    return (
        <div className="vil-cards">
            {HERITAGE_ORDER.map(key => {
                const h = HERITAGES[key];
                return (
                    <button key={key} type="button" className={`vil-card-choice${ws.heritageKey === key ? ' is-selected' : ''}`}
                            {...helpProps(show, { kind: 'heritage', key })}
                            onClick={() => { setWs({ ...ws, heritageKey: key }); show({ kind: 'heritage', key }); }}>
                        <b>{h.name}</b>
                        <span>{h.gifts.map(g => g.name).join(' · ')}</span>
                    </button>
                );
            })}
        </div>
    );
};

// ── Origine ───────────────────────────────────────────────────────────────

export const OriginTab = ({ ws, setWs }) => {
    const show = useHelp();
    const custom = ws.originKey === null && (ws.originName !== '' || ws.originEffect !== '' || ws.customOrigin);
    return (
        <div className="vil-fields">
            <div className="vil-pills">
                {ORIGIN_ORDER.map(key => (
                    <VilPill key={key} on={ws.originKey === key} {...helpProps(show, { kind: 'origin', key })}
                             onClick={() => { setWs(chooseOrigin(ws, key)); show({ kind: 'origin', key }); }}>
                        {ORIGINS[key].name}
                    </VilPill>
                ))}
                <VilPill on={!!custom} onClick={() => setWs({ ...chooseOrigin(ws, null), customOrigin: true, originName: '', originEffect: '' })}>Autre…</VilPill>
            </div>
            {(ws.originKey || custom) && (
                <>
                    <label><span className="vtt-field-label">Origine</span>
                        <input className="vil-input" value={ws.originName} onChange={(e) => setWs({ ...ws, originName: e.target.value })} /></label>
                    <label><span className="vtt-field-label">Effet</span>
                        <textarea className="vil-textarea" rows={2} value={ws.originEffect} onChange={(e) => setWs({ ...ws, originEffect: e.target.value })} /></label>
                </>
            )}
        </div>
    );
};

// ── Approches ─────────────────────────────────────────────────────────────

export const ApproachesTab = ({ ws, setWs }) => {
    const show = useHelp();
    return (
        <div>
            <div className="vil-field-row">
                <b>Répartition</b>
                <span className="vil-pills" {...helpProps(show, { kind: 'distribution' })}>
                    {DISTRIBUTIONS.map((d, i) => (
                        <VilPill key={i} on={ws.distribution === i} onClick={() => setWs(chooseDistribution(ws, i))}>
                            {d.map(s => `d${s}`).join(' · ')}
                        </VilPill>
                    ))}
                </span>
            </div>
            {ws.distribution !== null && (
                <div className="vil-assign">
                    {APPROACHES.map(a => (
                        <React.Fragment key={a.key}>
                            <b {...helpProps(show, { kind: 'approach', key: a.key })}>{a.label}</b>
                            <span className="vil-pills" {...helpProps(show, { kind: 'approach', key: a.key })}>
                                {diceChoices(ws, a.key).map(size => (
                                    <VilPill key={size} on={ws.dice[a.key] === size} onClick={() => setWs(assignDie(ws, a.key, size))}>d{size}</VilPill>
                                ))}
                            </span>
                        </React.Fragment>
                    ))}
                </div>
            )}
        </div>
    );
};

// ── Personnalité et Formation ─────────────────────────────────────────────

const WordColumn = ({ kind, title, list, suggestions, onChange }) => {
    const show = useHelp();
    // Une suggestion remplit la première case vide ; recliquer un mot déjà pris le retire
    const pick = (word) => {
        const i = list.indexOf(word);
        if (i >= 0) return onChange(list.map((w, j) => (j === i ? '' : w)));
        const empty = list.findIndex(w => !w.trim());
        if (empty >= 0) onChange(list.map((w, j) => (j === empty ? word : w)));
    };
    return (
        <div {...helpProps(show, { kind: 'words', key: kind })}>
            <VilLabel>{title}</VilLabel>
            <div className="vil-word-inputs">
                {list.map((w, i) => (
                    <input key={i} className="vil-input" value={w} placeholder={`Mot ${i + 1}`}
                           onChange={(e) => onChange(list.map((x, j) => (j === i ? e.target.value : x)))} />
                ))}
            </div>
            <div className="vil-pills">
                {suggestions.map(s => <VilPill key={s} on={list.includes(s)} onClick={() => pick(s)}>{s}</VilPill>)}
            </div>
        </div>
    );
};

export const WordsTab = ({ ws, setWs }) => (
    <div className="vil-word-grid">
        <WordColumn kind="personality" title="Personnalité (adjectifs)" list={ws.personality} suggestions={PERSONALITY_SUGGESTIONS}
                    onChange={(personality) => setWs({ ...ws, personality })} />
        <WordColumn kind="training" title="Formation (verbes ou noms)" list={ws.training} suggestions={TRAINING_SUGGESTIONS}
                    onChange={(training) => setWs({ ...ws, training })} />
    </div>
);

// ── Ressource et mobiles ──────────────────────────────────────────────────

export const ResourceTab = ({ ws, setWs }) => {
    const show = useHelp();
    const pickedIndex = RESOURCES.findIndex(r => r.name === ws.resourceName && r.effect === ws.resourceEffect);
    const custom = pickedIndex < 0 && (ws.resourceName !== '' || ws.customResource);
    return (
        <div className="vil-fields">
            <div>
                <VilLabel>Ressource</VilLabel>
                <div className="vil-pills">
                    {RESOURCES.map((r, i) => (
                        <VilPill key={r.name} on={pickedIndex === i} {...helpProps(show, { kind: 'resource', key: i })}
                                 onClick={() => { setWs({ ...ws, resourceName: r.name, resourceEffect: r.effect, customResource: false }); show({ kind: 'resource', key: i }); }}>
                            {r.name}
                        </VilPill>
                    ))}
                    <VilPill on={!!custom} onClick={() => setWs({ ...ws, resourceName: '', resourceEffect: '', customResource: true })}>Autre…</VilPill>
                </div>
            </div>
            {(pickedIndex >= 0 || custom) && (
                <>
                    <label><span className="vtt-field-label">Nom</span>
                        <input className="vil-input" value={ws.resourceName} onChange={(e) => setWs({ ...ws, resourceName: e.target.value })} /></label>
                    <label><span className="vtt-field-label">Effet</span>
                        <textarea className="vil-textarea" rows={2} value={ws.resourceEffect} onChange={(e) => setWs({ ...ws, resourceEffect: e.target.value })} /></label>
                </>
            )}
            <div>
                <VilLabel>Mobiles</VilLabel>
                <div className="vil-fields">
                    <label><span className="vtt-field-label">Aspiration (facultative) : cochée, elle guérit une blessure</span>
                        <input className="vil-input" value={ws.aspiration} placeholder="Votre objectif personnel"
                               onChange={(e) => setWs({ ...ws, aspiration: e.target.value })} /></label>
                    <label><span className="vtt-field-label">Devoir : coché, il guérit un état</span>
                        <input className="vil-input" value={ws.duty} onChange={(e) => setWs({ ...ws, duty: e.target.value })} /></label>
                </div>
            </div>
        </div>
    );
};

// ── Identité ──────────────────────────────────────────────────────────────

export const IdentityTab = ({ ws, setWs }) => {
    const [avatarOpen, setAvatarOpen] = useState(false);
    return (
        <div className="vil-identity">
            <button type="button" className="vil-portrait-pick" onClick={() => setAvatarOpen(true)} title="Choisir un portrait">
                {ws.avatar ? <img src={ws.avatar} alt="" /> : 'Portrait'}
            </button>
            <div className="vil-fields">
                <div className="vil-name-fields">
                    <label><span className="vtt-field-label">Prénom *</span>
                        <input className="vil-input" value={ws.prenom} onChange={(e) => setWs({ ...ws, prenom: e.target.value })} /></label>
                    <label><span className="vtt-field-label">Nom *</span>
                        <input className="vil-input" value={ws.nom} onChange={(e) => setWs({ ...ws, nom: e.target.value })} /></label>
                </div>
                <label><span className="vtt-field-label">Devise</span>
                    <input className="vil-input" value={ws.motto} placeholder="Tout s'achève dans le sang."
                           onChange={(e) => setWs({ ...ws, motto: e.target.value })} /></label>
                <label><span className="vtt-field-label">Joueur *</span>
                    <input className="vil-input" value={ws.playerName} onChange={(e) => setWs({ ...ws, playerName: e.target.value })} /></label>
            </div>
            {avatarOpen && (
                <AvatarUploader currentAvatar={ws.avatar} onAvatarChange={(avatar) => setWs(prev => ({ ...prev, avatar }))} onClose={() => setAvatarOpen(false)} />
            )}
        </div>
    );
};
