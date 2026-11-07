// src/client/src/systems/cyberpunk/components/layout/ResourceStrip.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Ressources du personnage (spec_cyberpunk.md §4), en briques communes :
//   <CredStick />, <TokenTrack />  Cred en credstick ; [info], [matos], Retenue en
//                                  losanges (clic = consommé, « + » = gagné ; au-delà
//                                  de MAX_TOKENS, le nombre suivi d'un seul losange)
//   <XPButton />                   barre jusqu'au prochain avancement, 5 avancements
//   <ResourceStrip />              fiche du joueur : bande en tête, tags à côté
//   <ResourceCard />               vue MJ : carte dédiée (ressources, XP, avancements, tags)
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { TagList } from './TagManager.jsx';
import { Card } from './Card.jsx';

const MAX_TOKENS = 5;
const XP_PER_ADV = 10;          // règles §15 : coût d'un avancement
const BASE_ADV_FOR_MAJOR = 5;   // avancements majeurs après 5 avancements de base

export const CredStick = ({ value = 0, onChange }) => (
    <div className="cp-res" style={{ '--rc': 'var(--cp-cred)' }}>
        <span className="cp-res-label">Cred</span>
        <span className="cp-cred">
            <button type="button" className="cp-step" onClick={() => onChange(Math.max(0, value - 1))} title="Dépenser 1 Cred">−</button>
            <span className="cp-credstick"><b>{value}</b></span>
            <button type="button" className="cp-step" onClick={() => onChange(value + 1)} title="Gagner 1 Cred">+</button>
        </span>
    </div>
);

export const TokenTrack = ({ label, value, colorVar, onChange }) => {
    const n = Math.max(0, value ?? 0);
    const spend = () => onChange(Math.max(0, n - 1));
    return (
        <div className="cp-res" style={{ '--rc': colorVar }}>
            <span className="cp-res-label">{label}</span>
            <span className="cp-token-row">
                {n === 0 && <span className="cp-res-zero">0</span>}
                {n > MAX_TOKENS && <span className="cp-res-count">{n}</span>}
                {Array.from({ length: n > MAX_TOKENS ? 1 : n }, (_, i) => (
                    <button key={i} type="button" className="cp-token" onClick={spend}
                            title={`Consommer 1 ${label} (${n} disponible${n > 1 ? 's' : ''})`} />
                ))}
                <button type="button" className="cp-token-plus" onClick={() => onChange(n + 1)} title={`Gagner 1 ${label}`}>+</button>
            </span>
        </div>
    );
};

// Cred et les trois jetons, dans l'ordre de la fiche
const Tokens = ({ char, onPatch }) => (
    <>
        <CredStick value={char?.cred ?? 0} onChange={v => onPatch('cred', v)} />
        <TokenTrack label="[info]"  value={char?.infoTokens}  colorVar="var(--cp-info)"    onChange={v => onPatch('infoTokens', v)} />
        <TokenTrack label="[matos]" value={char?.matosTokens} colorVar="var(--cp-matos)"   onChange={v => onPatch('matosTokens', v)} />
        <TokenTrack label="Retenue" value={char?.retenue}     colorVar="var(--cp-retenue)" onChange={v => onPatch('retenue', v)} />
    </>
);

/**
 * Bouton XP. onOpen absent (vue MJ) : la barre s'affiche sans ouvrir la dépense d'XP.
 */
export const XPButton = ({ xp = 0, baseAdvancements = 0, onOpen, onChange }) => {
    const ready = xp >= XP_PER_ADV;
    const major = baseAdvancements >= BASE_ADV_FOR_MAJOR;
    const Main = onOpen ? 'button' : 'div';
    return (
        <div className={`cp-xp ${ready ? 'is-ready' : ''}`}>
            <button type="button" className="cp-step" onClick={() => onChange(Math.max(0, xp - 1))} title="Retirer 1 XP">−</button>
            <Main type={onOpen ? 'button' : undefined} className="cp-xp-main" onClick={onOpen}
                  title={onOpen ? (ready ? 'Un avancement est disponible : dépenser de l\'XP' : 'Dépenser de l\'XP') : undefined}>
                <span className="cp-xp-top">
                    <span className="cp-xp-label">XP <b>{xp}</b>/{XP_PER_ADV}</span>
                    <span className={`cp-advpips ${major ? 'is-major' : ''}`}
                          title={major ? 'Avancements majeurs débloqués' : `${baseAdvancements} avancement${baseAdvancements > 1 ? 's' : ''} de base sur ${BASE_ADV_FOR_MAJOR}`}>
                        {Array.from({ length: BASE_ADV_FOR_MAJOR }, (_, i) => <i key={i} className={i < baseAdvancements ? 'is-on' : ''} />)}
                    </span>
                </span>
                <span className="cp-xpbar">
                    {Array.from({ length: XP_PER_ADV }, (_, i) => <i key={i} className={i < xp ? 'is-on' : ''} />)}
                </span>
            </Main>
            <button type="button" className="cp-step" onClick={() => onChange(xp + 1)} title="Ajouter 1 XP">+</button>
        </div>
    );
};

/**
 * Fiche du joueur : bande en tête.
 * @param {object}   char
 * @param {function} onPatch      (champ, valeur)
 * @param {object}   tagHandlers  { onAdd, onRemove, onChangeVariant } des tags du personnage
 */
export const ResourceStrip = ({ char, onPatch, tagHandlers }) => (
    <div className="cp-strip">
        <Tokens char={char} onPatch={onPatch} />
        <div className="cp-strip-tags">
            <span className="cp-res-label" style={{ '--rc': 'var(--color-text-muted)' }}>Tags</span>
            <TagList tags={char?.tags ?? []} entityType="character" emptyLabel="Aucun tag." {...tagHandlers} />
        </div>
    </div>
);

/** Vue MJ : carte dédiée, mêmes briques, plus l'XP et les avancements de base. */
export const ResourceCard = ({ char, onPatch, tagHandlers }) => {
    const adv = char?.baseAdvancements ?? 0;
    return (
        <Card title="Ressources et progression">
            <div className="cp-rescard">
                <Tokens char={char} onPatch={onPatch} />
            </div>
            <div className="cp-rescard-prog">
                <XPButton xp={char?.xp ?? 0} baseAdvancements={adv} onChange={v => onPatch('xp', v)} />
                <div className="cp-res" style={{ '--rc': 'var(--color-accent)' }}>
                    <span className="cp-res-label">Avancements</span>
                    <span className="cp-stepper">
                        <button type="button" className="cp-step" onClick={() => onPatch('baseAdvancements', Math.max(0, adv - 1))} title="Retirer un avancement">−</button>
                        <b className="cp-qty">{adv}</b>
                        <button type="button" className="cp-step" onClick={() => onPatch('baseAdvancements', adv + 1)} title="Ajouter un avancement">+</button>
                    </span>
                </div>
            </div>
            <div className="cp-rescard-tags">
                <span className="cp-res-label" style={{ '--rc': 'var(--color-text-muted)' }}>Tags</span>
                <TagList tags={char?.tags ?? []} entityType="character" emptyLabel="Aucun tag." {...tagHandlers} />
            </div>
        </Card>
    );
};
