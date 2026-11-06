// src/client/src/systems/fabula/components/group/GroupSheet.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Fiche de groupe (spec_fabula.md §7, planche §8) : onglet « Groupe » côté joueur
// et côté MJ, une fiche par table, modifiable par tous (Q-5), partagée en direct.
//   • Objets d'inventaire : officiels (config/groupItems.js) + ajoutés par la
//     table ; « Utiliser » (joueur) retire les PI du personnage et laisse une
//     trace dans l'historique ; jamais dans le sac.
//   • Notes et cadrans : un clic sur une section remplit jusqu'à elle (ou vide la
//     dernière) ; le MJ peut cacher un cadran aux joueurs (Q-6, filtré ici).
//   • Journal : personnages, créatures et lieux, avec leurs notes.
// Les champs texte s'enregistrent quand on les quitte.
//
// Props : sessionId, isGM, character? (joueur : pour « Utiliser »), onQuickUpdate?
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import FuIcon from '../ui/FuIcon.jsx';
import Stepper from '../layout/Stepper.jsx';
import { GROUP_ITEMS, FRAGMENT_ELEMENTS, JOURNAL_TYPES } from '../../config/groupItems.js';
import { useGroupe } from '../../hooks/useGroupe.js';
import { useGroupItemUse } from '../../hooks/useGroupItemUse.js';

/** Champ texte enregistré à la sortie (seulement s'il a changé) */
const BlurField = ({ value, onSave, multiline = false, placeholder, className = '' }) => {
    const [draft, setDraft] = useState(value ?? '');
    const [prev, setPrev] = useState(value ?? '');
    if ((value ?? '') !== prev) { setPrev(value ?? ''); setDraft(value ?? ''); }   // mise à jour reçue d'un autre membre
    const commit = () => { if (draft !== (value ?? '')) onSave(draft); };
    const Tag = multiline ? 'textarea' : 'input';
    return (
        <Tag value={draft} onChange={e => setDraft(e.target.value)} onBlur={commit} placeholder={placeholder}
             rows={multiline ? 4 : undefined} className={`vtt-input w-full ${className}`} />
    );
};

// ── Cadran : sections en parts de disque ─────────────────────────────────────
const segmentPath = (n, i) => {
    const r = 46;
    const a0 = (i / n) * 2 * Math.PI - Math.PI / 2;
    const a1 = ((i + 1) / n) * 2 * Math.PI - Math.PI / 2;
    const p = a => `${(50 + r * Math.cos(a)).toFixed(2)} ${(50 + r * Math.sin(a)).toFixed(2)}`;
    return `M50 50 L${p(a0)} A${r} ${r} 0 0 1 ${p(a1)} Z`;
};

// Carte horizontale : disque à gauche ; nom, avancée (−1 / +1) et visibilité à
// droite ; réglages rares (sections, suppression confirmée) derrière l'engrenage.
// compact (volet de la fiche, ClockDrawer) : nom en texte, sans réglages.
export const Clock = ({ cadran, isGM, onPatch, onRemove, compact = false }) => {
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const full = cadran.remplies >= cadran.sections;
    const setFill = (n) => onPatch({ remplies: Math.max(0, Math.min(cadran.sections, n)) });
    // Clic sur une section : remplit jusqu'à elle ; sur la dernière remplie, la vide
    const clickSegment = (i) => setFill(i === cadran.remplies - 1 ? i : i + 1);
    const toggleSettings = () => { setSettingsOpen(o => !o); setConfirmDelete(false); };
    return (
        <div className={`fu-clock${cadran.cache ? ' is-hidden' : ''}${full ? ' is-full' : ''}${compact ? ' is-compact' : ''}`}>
            <svg viewBox="0 0 100 100" className="fu-clock-dial" role="img" aria-label={`${cadran.nom || 'Cadran'} : ${cadran.remplies} sur ${cadran.sections}`}>
                <circle cx="50" cy="50" r="48" className="fu-clock-face" />
                {Array.from({ length: cadran.sections }, (_, i) => (
                    <path key={i} d={segmentPath(cadran.sections, i)} onClick={() => clickSegment(i)}
                          className={i < cadran.remplies ? 'is-on' : ''} />
                ))}
            </svg>
            <div className="fu-clock-body">
                {compact
                    ? <b className="fu-clock-name">{cadran.nom || 'Cadran'}</b>
                    : <BlurField value={cadran.nom} onSave={nom => onPatch({ nom })} placeholder="Nom du cadran" />}
                <div className="fu-clock-count">
                    <span className="fu-clock-num"><b>{cadran.remplies}</b> / {cadran.sections}</span>
                    <button type="button" className="fu-btn fu-btn-sm" disabled={cadran.remplies <= 0}
                            onClick={() => setFill(cadran.remplies - 1)}>−1</button>
                    <button type="button" className="fu-btn fu-btn-sm" disabled={full}
                            onClick={() => setFill(cadran.remplies + 1)}>+1</button>
                    {!compact && (
                        <button type="button" className={`fu-clock-gear${settingsOpen ? ' is-on' : ''}`} onClick={toggleSettings}
                                aria-expanded={settingsOpen} title="Réglages du cadran">
                            <FuIcon name="gear" className="fu-ico-sm" />
                        </button>
                    )}
                </div>
                {isGM && !compact && (
                    <button type="button" className={`fu-clock-vis${cadran.cache ? ' is-hidden' : ''}`}
                            onClick={() => onPatch({ cache: !cadran.cache })}
                            title={cadran.cache ? 'Montrer le cadran à la table' : 'Cacher le cadran aux joueurs'}>
                        <FuIcon name={cadran.cache ? 'eyeOff' : 'eye'} className="fu-ico-sm" />
                        {cadran.cache ? 'Caché aux joueurs' : 'Visible de la table'}
                    </button>
                )}
                {settingsOpen && (
                    <div className="fu-clock-settings">
                        <span className="fu-label">Sections</span>
                        <Stepper value={cadran.sections} min={2} max={12} showMax={false} onChange={v => onPatch({ sections: v })} />
                        <button type="button" className={`fu-btn fu-btn-sm fu-btn-danger ml-auto${confirmDelete ? ' is-armed' : ''}`}
                                onClick={() => (confirmDelete ? onRemove() : setConfirmDelete(true))}>
                            <FuIcon name="close" className="fu-ico-sm" />{confirmDelete ? 'Confirmer' : 'Supprimer'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

const GroupSheet = ({ sessionId, isGM = false, character = null, onQuickUpdate }) => {
    const { groupe, loading, error, send } = useGroupe(sessionId);
    const consumeItem = useGroupItemUse({ character, sessionId, onQuickUpdate });
    const [choosing, setChoosing] = useState(null);

    if (!sessionId) return <p className="fu-win text-sm text-muted italic">Aucune table active : la fiche de groupe s'ouvre quand le MJ lance la table.</p>;
    if (loading && !groupe) return <p className="fu-win text-sm text-muted italic">Chargement…</p>;
    if (!groupe) return <p className="fu-win text-sm text-danger">{error ?? 'Fiche de groupe indisponible.'}</p>;

    const pi = character?.piActuel ?? 0;
    const cadrans = isGM ? groupe.cadrans : groupe.cadrans.filter(c => !c.cache);

    const applyOfficial = async (it, element = null) => {
        if (it.chooseElement && !element) { setChoosing(choosing === it.key ? null : it.key); return; }
        if (await consumeItem(it, element)) setChoosing(null);
    };
    const renderUseButton = (it) => character && (
        <button type="button" className="fu-btn fu-btn-sm" disabled={pi < it.pi} onClick={() => applyOfficial(it)}
                title={pi < it.pi ? 'PI insuffisants' : `Retirer ${it.pi} PI`}>
            Utiliser
        </button>
    );

    return (
        <div className="fu-group">
            {/* ── Objets d'inventaire ─────────────────────────────────────── */}
            <div className="fu-win">
                <div className="fu-win-head">
                    <h3 className="fu-title">Objets d'inventaire<span className="fu-kana" aria-hidden="true">アイテム</span></h3>
                    <span className="fu-rule" />
                    {character && <span className="fu-aside">{[character.prenom, character.nom].filter(Boolean).join(' ')} · <b>{pi}</b> PI</span>}
                </div>
                <div className="fu-gitems">
                    {GROUP_ITEMS.map(it => (
                        <div key={it.key} className="fu-gitem">
                            <div className="fu-slot-ico"><FuIcon name={it.icon} className="fu-ico" /></div>
                            <div className="min-w-0"><b>{it.nom}</b><p>{it.effet}</p></div>
                            <span className="fu-pi-cost">{it.pi} PI</span>
                            {renderUseButton(it) || <span />}
                            {choosing === it.key && (
                                <div className="fu-gitem-choice">
                                    <span className="fu-label">Type :</span>
                                    {FRAGMENT_ELEMENTS.map(e => (
                                        <button key={e.key} type="button" className="fu-pill" onClick={() => applyOfficial(it, e.key)}>{e.label}</button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                    {groupe.objets.map(o => (
                        <div key={o.id} className="fu-gitem is-custom">
                            <div className="fu-slot-ico"><FuIcon name="bag" className="fu-ico" /></div>
                            <div className="min-w-0 flex flex-col gap-1">
                                <BlurField value={o.nom} onSave={nom => send('PATCH', `/objets/${o.id}`, { nom })} placeholder="Nom de l'objet" />
                                <BlurField value={o.effet} onSave={effet => send('PATCH', `/objets/${o.id}`, { effet })} placeholder="Effet" />
                            </div>
                            <Stepper value={o.pi} min={0} max={20} showMax={false} onChange={v => send('PATCH', `/objets/${o.id}`, { pi: v })} />
                            <div className="flex flex-col gap-1">
                                {renderUseButton({ key: `table-${o.id}`, nom: o.nom || 'Objet', pi: o.pi, effet: o.effet })}
                                <button type="button" className="fu-btn fu-btn-sm fu-btn-danger" onClick={() => send('DELETE', `/objets/${o.id}`)} aria-label="Supprimer l'objet">
                                    <FuIcon name="close" className="fu-ico-sm" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                <button type="button" className="fu-btn fu-btn-sm mt-3" onClick={() => send('POST', '/objets', { nom: '', pi: 2, effet: '' })}>
                    <FuIcon name="plus" className="fu-ico-sm" />Ajouter un objet
                </button>
            </div>

            <div className="flex flex-col gap-3">
                {/* ── Notes et cadrans ────────────────────────────────────── */}
                <div className="fu-win">
                    <div className="fu-win-head">
                        <h3 className="fu-title">Notes et cadrans<span className="fu-kana" aria-hidden="true">メモ</span></h3>
                        <span className="fu-rule" />
                        <button type="button" className="fu-btn fu-btn-sm" onClick={() => send('POST', '/cadrans', { nom: '', sections: 6 })}>
                            <FuIcon name="plus" className="fu-ico-sm" />Cadran
                        </button>
                    </div>
                    <BlurField value={groupe.notes} onSave={notes => send('PUT', '/notes', { notes })} multiline placeholder="Notes de groupe" />
                    {cadrans.length > 0 && (
                        <div className="fu-clocks mt-3">
                            {cadrans.map(c => (
                                <Clock key={c.id} cadran={c} isGM={isGM}
                                       onPatch={patch => send('PATCH', `/cadrans/${c.id}`, patch)}
                                       onRemove={() => send('DELETE', `/cadrans/${c.id}`)} />
                            ))}
                        </div>
                    )}
                </div>

                {/* ── Journal ─────────────────────────────────────────────── */}
                <div className="fu-win">
                    <div className="fu-win-head">
                        <h3 className="fu-title">Journal<span className="fu-kana" aria-hidden="true">日誌</span></h3>
                        <span className="fu-rule" />
                        <button type="button" className="fu-btn fu-btn-sm" onClick={() => send('POST', '/journal', { nom: '', type: 'personnage', notes: '' })}>
                            <FuIcon name="plus" className="fu-ico-sm" />Entrée
                        </button>
                    </div>
                    {groupe.journal.length === 0 && <p className="text-xs text-muted italic">Personnages, créatures et lieux rencontrés.</p>}
                    {groupe.journal.map(j => (
                        <div key={j.id} className="fu-jentry">
                            <div className="flex items-center gap-2 flex-wrap">
                                <div className="flex-1 min-w-40"><BlurField value={j.nom} onSave={nom => send('PATCH', `/journal/${j.id}`, { nom })} placeholder="Nom" /></div>
                                {JOURNAL_TYPES.map(t => (
                                    <button key={t.key} type="button" onClick={() => send('PATCH', `/journal/${j.id}`, { type: t.key })}
                                            className={`fu-pill${j.type === t.key ? ' is-on' : ''}`}>{t.label}</button>
                                ))}
                                <button type="button" className="fu-btn fu-btn-sm fu-btn-danger" onClick={() => send('DELETE', `/journal/${j.id}`)} aria-label="Supprimer l'entrée">
                                    <FuIcon name="close" className="fu-ico-sm" />
                                </button>
                            </div>
                            <BlurField value={j.notes} onSave={notes => send('PATCH', `/journal/${j.id}`, { notes })} multiline placeholder="Notes" />
                        </div>
                    ))}
                </div>
                {error && <p className="text-xs text-danger">{error}</p>}
            </div>
        </div>
    );
};

export default GroupSheet;
