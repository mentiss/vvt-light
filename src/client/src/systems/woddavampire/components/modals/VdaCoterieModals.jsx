// src/client/src/systems/woddavampire/components/modals/VdaCoterieModals.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Fenêtres de la coterie (spec_woddavampire.md §II.17.3, planche_coterie.html),
// sur la modale de la plateforme :
//   - VdaContributeModal : verser des points (joueur : les siens ; Conteur : au nom d'un joueur) ;
//   - VdaWithdrawModal : retirer toute sa mise d'un Historique, un point perdu ;
//   - VdaAddPoolModal : le Conteur ajoute un Historique gagné par l'histoire ;
//   - VdaCoterieCreateModal : le Conteur crée la coterie (nom, ancre).
// onConfirm renvoie une promesse : true = enregistré (la fenêtre se ferme), sinon
// le message du serveur s'affiche (prop error).
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import Modal from '@/ui/modal/Modal.jsx';
import {
    POOLABLE_BACKGROUNDS, POOL_MAX, backgroundLabel, poolCap, shownPools, stakeOf, contributionOptions, withdrawRefund,
} from '../../config/rules/coterie.js';
import { VdaChip, VdaStepper } from '../ui/VdaUi.jsx';

const Footer = ({ label, disabled, busy, onConfirm, onClose }) => (
    <>
        <button type="button" className="vtt-btn" onClick={onClose}>Annuler</button>
        <button type="button" className="vtt-btn vtt-btn-primary" disabled={disabled || busy} onClick={onConfirm}>{label}</button>
    </>
);

/** Confirme : ferme la fenêtre si l'écriture a réussi */
const useConfirm = (onConfirm, onClose) => {
    const [busy, setBusy] = useState(false);
    const run = async (...args) => {
        setBusy(true);
        const ok = await onConfirm(...args);
        setBusy(false);
        if (ok) onClose();
    };
    return [busy, run];
};

const totalOf = (coterie, key) => coterie.backgrounds.find(b => b.backgroundKey === key)?.total ?? 0;

/** Verser des points — props : coterie, characters (fiches qui peuvent verser), error, onConfirm(characterId, key, points), onClose */
export const VdaContributeModal = ({ coterie, characters, error, onConfirm, onClose }) => {
    const [characterId, setCharacterId] = useState(characters[0]?.id ?? null);
    const character = characters.find(c => c.id === characterId) ?? null;
    const options = contributionOptions(coterie, character);
    const [key, setKey] = useState(() => options.find(o => o.max > 0)?.key ?? null);
    const option = options.find(o => o.key === key);
    const [points, setPoints] = useState(1);
    const n = Math.min(points, option?.max ?? 0);
    const [busy, run] = useConfirm(onConfirm, onClose);

    const pickCharacter = (id) => { setCharacterId(id); setKey(null); setPoints(1); };
    return (
        <Modal onClose={onClose} title="Verser des points" size="md"
               footer={<Footer label="Verser" disabled={!option || n < 1} busy={busy} onConfirm={() => run(characterId, key, n)} onClose={onClose} />}>
            <div className="flex flex-col gap-3">
                {characters.length > 1 && (
                    <div><div className="vda-label">Personnage</div>
                        <div className="vda-chips">{characters.map(c => <VdaChip key={c.id} on={c.id === characterId} onClick={() => pickCharacter(c.id)}>{c.nom}</VdaChip>)}</div></div>
                )}
                <div><div className="vda-label">Historique</div>
                    <div className="vda-chips">
                        {options.map(o => (
                            <VdaChip key={o.key} on={o.key === key} disabled={o.max < 1} onClick={() => { setKey(o.key); setPoints(1); }}
                                     title={o.rating < 1 ? 'Aucun point dans cet Historique' : o.room < 1 ? 'Plafond atteint' : undefined}>
                                {backgroundLabel(o.key)} <b>{o.rating}</b>
                            </VdaChip>
                        ))}
                    </div>
                </div>
                {option && option.max > 0 && <>
                    <div className="vda-trait"><span className="vda-trait-name">Points versés</span>
                        <VdaStepper value={n} min={1} max={option.max} onChange={setPoints} label="Points versés" /></div>
                    <div className="vda-coterie-recap">
                        <span>{character?.nom} : {backgroundLabel(key)} {option.rating} → <b>{option.rating - n}</b></span>
                        <span>Coterie : {backgroundLabel(key)} {totalOf(coterie, key)} → <b>{totalOf(coterie, key) + n}</b> (plafond {poolCap(coterie, key)}{key === coterie.anchorKey ? '' : ', l\'ancre'})</span>
                    </div>
                </>}
                {!option && <p className="vda-note">Choisissez un Historique (Alliés, Contacts, Domaine, Troupeau, Influence, Mentor, Ressources, Serviteurs).</p>}
                {error && <div className="vda-error-list">{error}</div>}
            </div>
        </Modal>
    );
};

/** Retirer sa mise — props : coterie, characterId, character (nom, Historiques si connus), backgroundKey, error, onConfirm, onClose */
export const VdaWithdrawModal = ({ coterie, characterId, character, backgroundKey, error, onConfirm, onClose }) => {
    const stake = stakeOf(coterie, characterId, backgroundKey);
    const refund = withdrawRefund(stake);
    const rating = (character?.backgrounds ?? []).find(b => b.backgroundKey === backgroundKey)?.rating;
    const label = backgroundLabel(backgroundKey);
    const [busy, run] = useConfirm(onConfirm, onClose);
    return (
        <Modal onClose={onClose} title="Retirer la mise" size="md"
               footer={<Footer label="Retirer" disabled={stake < 1} busy={busy} onConfirm={() => run()} onClose={onClose} />}>
            <div className="flex flex-col gap-3">
                <p>{character?.nom ?? character?.name} a versé <b>{stake}</b> point{stake > 1 ? 's' : ''} de {label}. En les retirant, il en récupère <b>{refund}</b> : la rupture en coûte un.</p>
                <div className="vda-coterie-recap">
                    {rating !== undefined && <span>Fiche : {label} {rating} → <b>{rating + refund}</b></span>}
                    <span>Coterie : {label} {totalOf(coterie, backgroundKey)} → <b>{totalOf(coterie, backgroundKey) - stake}</b></span>
                </div>
                {backgroundKey === coterie.anchorKey && <p className="vda-note">C'est l'ancre : un Historique commun au-dessus de sa nouvelle valeur échappe au contrôle de la coterie, on le reconquiert par l'histoire.</p>}
                {error && <div className="vda-error-list">{error}</div>}
            </div>
        </Modal>
    );
};

/** Conteur : Historique gagné par l'histoire — props : coterie, error, onConfirm(key, storyPoints), onClose */
export const VdaAddPoolModal = ({ coterie, error, onConfirm, onClose }) => {
    const present = new Set(shownPools(coterie).map(p => p.backgroundKey));
    const choices = POOLABLE_BACKGROUNDS.filter(k => !present.has(k));
    const [key, setKey] = useState(choices[0] ?? null);
    const [points, setPoints] = useState(1);
    const [busy, run] = useConfirm(onConfirm, onClose);
    return (
        <Modal onClose={onClose} title="Ajouter un Historique" size="md"
               footer={<Footer label="Ajouter" disabled={!key} busy={busy} onConfirm={() => run(key, points)} onClose={onClose} />}>
            <div className="flex flex-col gap-3">
                {choices.length === 0 && <p className="vda-note">Tous les Historiques communs sont déjà présents.</p>}
                {choices.length > 0 && <>
                    <div><div className="vda-label">Historique</div>
                        <div className="vda-chips">{choices.map(k => <VdaChip key={k} on={k === key} onClick={() => setKey(k)}>{backgroundLabel(k)}</VdaChip>)}</div></div>
                    <div className="vda-trait"><span className="vda-trait-name">Points (histoire)</span>
                        <VdaStepper value={points} min={1} max={POOL_MAX} onChange={setPoints} label="Points d'histoire" /></div>
                    {key && points > poolCap(coterie, key) && <p className="vda-note is-negative">Au-dessus de l'ancre ({poolCap(coterie, key)}) : il échappera au contrôle de la coterie.</p>}
                </>}
                {error && <div className="vda-error-list">{error}</div>}
            </div>
        </Modal>
    );
};

/** Conteur : création — props : error, onConfirm(name, anchorKey), onClose */
export const VdaCoterieCreateModal = ({ error, onConfirm, onClose }) => {
    const [name, setName] = useState('');
    const [anchorKey, setAnchorKey] = useState('domain');
    const [busy, run] = useConfirm(onConfirm, onClose);
    return (
        <Modal onClose={onClose} title="Créer la coterie" size="md"
               footer={<Footer label="Créer" disabled={!name.trim() || !anchorKey} busy={busy} onConfirm={() => run(name.trim(), anchorKey)} onClose={onClose} />}>
            <div className="flex flex-col gap-3">
                <label className="block"><span className="vda-label">Nom</span>
                    <input className="vda-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="La Compagnie du Pont de Pierre" autoFocus /></label>
                <div><div className="vda-label">Historique ancre</div>
                    <div className="vda-chips">{POOLABLE_BACKGROUNDS.map(k => <VdaChip key={k} on={k === anchorKey} onClick={() => setAnchorKey(k)}>{backgroundLabel(k)}</VdaChip>)}</div></div>
                <p className="vda-note">L'ancre ne change plus ensuite. Une coterie par table.</p>
                {error && <div className="vda-error-list">{error}</div>}
            </div>
        </Modal>
    );
};
