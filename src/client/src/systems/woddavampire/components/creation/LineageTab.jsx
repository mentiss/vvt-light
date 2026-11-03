// src/client/src/systems/woddavampire/components/creation/LineageTab.jsx
// Onglet « Lignée et Route » : clan ou lignée, caste ou branche, clan d'origine,
// Route et Voie (qui fixe le couple de Vertus). Clans majeurs d'abord, lignées
// repliées par défaut. Spec §II.6, §15, §11.

import React, { useState } from 'react';
import { CLANS, CLAN_ORDER, ORIGIN_CLAN_CHOICES, ROADS, ROAD_ORDER, VIRTUE_LABELS, DISCIPLINES, CHRONICLE, CLAN_TEXT, ROAD_TEXT } from '../../config.jsx';
import { virtueKeys, roadAllowed } from '../../config/rules/creationRules.js';
import { clanProfile, clanDisciplines } from '../../config/rules/character.js';
import { VdaChip, VdaSectionTitle } from '../ui/VdaUi.jsx';
import { useHelp, helpProps } from './CreationHelp.jsx';

const allowed = (key) => {
    const clan = CLANS[key];
    if (clan.playable === false) return false;
    return clan.kind !== 'bloodline' || !CHRONICLE.allowedBloodlines || CHRONICLE.allowedBloodlines.includes(key);
};

const ClanCard = ({ clanKey, on, onPick }) => {
    const show = useHelp();
    const clan = CLANS[clanKey];
    const profile = clanProfile(clanKey);
    const discs = profile.anyDisciplines ? 'Au choix (accord du Conteur)'
        : clan.castes ? 'Selon la caste' : profile.disciplines.map(d => DISCIPLINES[d]?.label).join(', ');
    return (
        <button type="button" className={`vda-card${on ? ' is-on' : ''}`} onClick={() => { onPick(clanKey); show({ kind: 'clan', key: clanKey }); }}
                {...helpProps(show, { kind: 'clan', key: clanKey })}>
            <div className="vda-card-title">{clan.label}</div>
            {CLAN_TEXT[clanKey]?.hook && <div className="vda-card-hook">{CLAN_TEXT[clanKey].hook}</div>}
            <div className="vda-card-text">{discs}{clan.originClan ? ' + 2 du clan d’origine' : ''}</div>
        </button>
    );
};

const LineageTab = ({ ws, patch }) => {
    const show = useHelp();
    const [openBloodlines, setOpenBloodlines] = useState(CLANS[ws.clanKey]?.kind === 'bloodline');
    // Une fois choisis, clan et Route se replient sur leur fiche (« Changer » rouvre la liste)
    const [pickingClan, setPickingClan] = useState(!ws.clanKey);
    const [pickingRoad, setPickingRoad] = useState(false);
    const profile = clanProfile(ws.clanKey, ws.casteKey);
    const clans = CLAN_ORDER.filter(k => allowed(k) && CLANS[k].kind !== 'bloodline');
    const bloodlines = CLAN_ORDER.filter(k => allowed(k) && CLANS[k].kind === 'bloodline');
    const road = ROADS[ws.roadKey];
    const path = road?.paths?.[ws.roadPathKey];
    const vk = virtueKeys(ws);

    // Changer de clan remet à zéro caste, clan d'origine et magie du sang ; les Disciplines
    // de départ qui ne sont plus permises sont rendues par sanitizeCreation (les communes restent)
    const pickClan = (key) => {
        setPickingClan(false);
        if (key === ws.clanKey) return;
        patch({ clanKey: key, casteKey: CLANS[key].defaultCaste ?? null, originClanKey: null, paths: {}, kraina: {}, rituals: {} });
    };
    const pickRoad = (key) => {
        setPickingRoad(false);
        show({ kind: 'road', key });
        if (key !== ws.roadKey) patch({ roadKey: key, roadPathKey: null });
    };

    return (
        <div className="flex flex-col gap-2">
            <VdaSectionTitle>Clan</VdaSectionTitle>
            {profile && !pickingClan && (
                <div className="vda-card is-static is-chosen">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <div className="vda-card-title">{profile.label}{profile.caste ? ` — ${profile.caste.label}` : ''}</div>
                            {CLAN_TEXT[ws.clanKey]?.hook && <div className="vda-card-hook">{CLAN_TEXT[ws.clanKey].hook}</div>}
                        </div>
                        <button type="button" className="vtt-btn vtt-btn-sm shrink-0" onClick={() => setPickingClan(true)}>Changer de clan</button>
                    </div>
                    {profile.castes && (
                        <div className="my-2">
                            <div className="vda-label">Caste</div>
                            <div className="vda-chips">
                                {Object.entries(profile.castes).map(([k, c]) => (
                                    <VdaChip key={k} on={(ws.casteKey ?? profile.defaultCaste) === k}
                                             onClick={() => patch({ casteKey: k, paths: {}, kraina: {}, rituals: {} })}>{c.label}</VdaChip>
                                ))}
                            </div>
                        </div>
                    )}
                    {profile.originClan && (
                        <div className="my-2">
                            <div className="vda-label">Clan d'origine (2 Disciplines et la faiblesse)</div>
                            <div className="vda-chips">
                                {ORIGIN_CLAN_CHOICES.map(k => (
                                    <VdaChip key={k} on={ws.originClanKey === k} onClick={() => patch({ originClanKey: k })}>{CLANS[k].label}</VdaChip>
                                ))}
                            </div>
                        </div>
                    )}
                    <p className="vda-card-text"><b>Disciplines de clan :</b>{' '}
                        {profile.anyDisciplines ? 'au choix, avec l’accord du Conteur'
                            : clanDisciplines(ws.clanKey, ws.casteKey, ws.originClanKey).map(d => DISCIPLINES[d]?.label).join(', ') || '—'}
                        {profile.caste?.koldunism && ' (+ Koldunisme, hors clan)'}
                    </p>
                    <p className="vda-card-text"><b>Faiblesse :</b> {profile.weakness}{profile.commonWeakness ? ` ${profile.commonWeakness}` : ''}</p>
                </div>
            )}
            {(pickingClan || !profile) && (
                <>
                    <div className="vda-grid-cards">{clans.map(k => <ClanCard key={k} clanKey={k} on={ws.clanKey === k} onPick={pickClan} />)}</div>
                    <div className="flex items-center gap-3 mt-1">
                        <button type="button" className="vtt-btn vtt-btn-sm" onClick={() => setOpenBloodlines(o => !o)} aria-expanded={openBloodlines}>
                            {openBloodlines ? 'Masquer les lignées' : `Afficher les lignées (${bloodlines.length})`}
                        </button>
                        <span className="vda-note">Plus rares : à réserver à un concept précis, avec le Conteur.</span>
                    </div>
                    {openBloodlines && (
                        <div className="vda-grid-cards">{bloodlines.map(k => <ClanCard key={k} clanKey={k} on={ws.clanKey === k} onPick={pickClan} />)}</div>
                    )}
                </>
            )}

            <VdaSectionTitle>Route</VdaSectionTitle>
            {road && !pickingRoad && (
                <div className="vda-card is-static is-chosen" {...helpProps(show, { kind: 'road', key: ws.roadKey })}>
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <div className="vda-card-title">{road.label}{path ? ` — ${path.label}` : ''}</div>
                            {ROAD_TEXT[ws.roadKey]?.hook && <div className="vda-card-hook">{ROAD_TEXT[ws.roadKey].hook}</div>}
                        </div>
                        <button type="button" className="vtt-btn vtt-btn-sm shrink-0" onClick={() => setPickingRoad(true)}>Changer de Route</button>
                    </div>
                    {Object.keys(road.paths ?? {}).length > 0 && (
                        <div className="my-2">
                            <div className="vda-label">Voie (facultative)</div>
                            <div className="vda-chips">
                                <VdaChip on={!ws.roadPathKey} onClick={() => patch({ roadPathKey: null })}>Aucune</VdaChip>
                                {Object.entries(road.paths).map(([k, p]) => (
                                    <VdaChip key={k} on={ws.roadPathKey === k} onClick={() => { patch({ roadPathKey: k }); show({ kind: 'path', road: ws.roadKey, key: k }); }}
                                             {...helpProps(show, { kind: 'path', road: ws.roadKey, key: k })}>{p.label}</VdaChip>
                                ))}
                            </div>
                        </div>
                    )}
                    <p className="vda-card-text"><b>Vertus :</b> {VIRTUE_LABELS[vk.moral]}, {VIRTUE_LABELS[vk.control]} et Courage · <b>Aura :</b> {path?.aura ?? road.aura}</p>
                </div>
            )}
            {(pickingRoad || !road) && (
                <div className="vda-grid-cards">
                    {ROAD_ORDER.filter(k => roadAllowed(ws, k)).map(k => (
                        <button key={k} type="button" className={`vda-card${ws.roadKey === k ? ' is-on' : ''}`}
                                onClick={() => pickRoad(k)} {...helpProps(show, { kind: 'road', key: k })}>
                            <div className="vda-card-title">{ROADS[k].label}</div>
                            {ROAD_TEXT[k]?.hook && <div className="vda-card-hook">{ROAD_TEXT[k].hook}</div>}
                            <div className="vda-card-text">
                                {ROADS[k].virtues.map(v => VIRTUE_LABELS[v]).join(' · ')} · aura : {ROADS[k].aura}
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LineageTab;