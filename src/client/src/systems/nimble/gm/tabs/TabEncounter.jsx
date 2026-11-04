// src/client/src/systems/nimble/gm/tabs/TabEncounter.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Onglet Rencontre de l'interface MJ (spec_nimble.md §6.4, D-5) : monstres
// ajoutés depuis le bestiaire (CatalogModal) ou libres ; par monstre, PV
// (armure moyenne −10 / lourde −20, ignorée par un critique), sbires en groupe,
// attaques en un clic, capacités repliées. Gardée dans ce navigateur, par table
// (usePersistedState, portée tableScope) : aucune base.
// Props : activeSession, heroes (nombre de héros de la table, PV des légendaires)
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import CatalogModal from '../../../../components/modals/CatalogModal.jsx';
import ConfirmModal from '../../../../components/modals/ConfirmModal.jsx';
import { usePersistedState } from '../../../../hooks/usePersistedState.js';
import { tableScope } from '../../../../tools/browserStorage.js';
import { FAMILIES, MONSTERS, MONSTER_SIZES } from '../../config/bestiary.js';
import { monsterInstance, monsterHp, ARMOR_LABELS } from '../../config/rules/encounter.js';
import NbMonsterCard from '../../components/layout/NbMonsterCard.jsx';

const ENCOUNTER_OPTIONS = { defaults: { monsters: [] }, validate: (v) => Array.isArray(v?.monsters) };
const MINION_GROUP = 4;   // sbires ajoutés d'un coup (ajustable sur la carte)

const FILTERS = [{ key: 'family', getValue: m => m.family, options: FAMILIES.map(f => ({ value: f.name, label: f.name })) }];
const GROUP = { getValue: m => m.family };
const SEARCH = ['name', 'vo', 'family'];
const LABELS = { customTab: 'Monstre libre', search: 'Rechercher un monstre…', countOne: 'monstre', countMany: 'monstres', added: 'Ajouté à la rencontre', all: 'Tous' };
const LAYOUT = ['filters', 'search'];
const CUSTOM = { name: '', hp: '20', armor: null, dice: '1d8', bonus: '0', minion: false };

const MonsterRow = ({ m, heroes }) => (
    <div>
        <div><b>{m.name}</b> <span className="nb-vo">{m.vo}</span> <span className="nb-tag">niv. {m.level}</span>{m.legendary && <span className="nb-tag is-gold"> légendaire</span>}</div>
        <div className="nb-line-meta">
            {[MONSTER_SIZES[m.size], m.minion ? 'sbire' : `${monsterHp(m, heroes)} PV${m.hpPerHero ? ` (${m.hp} par héros)` : ''}`, ARMOR_LABELS[m.armor],
                (m.attacks ?? []).map(a => `${a.name} ${a.dice ?? ''}`).join(', ')].filter(Boolean).join(' · ')}
        </div>
    </div>
);

const CustomForm = ({ value, onChange }) => (
    <div className="nb-fields">
        <label className="block"><span className="vtt-field-label">Nom</span><input className="nb-input" value={value.name} onChange={e => onChange({ name: e.target.value })} autoFocus /></label>
        <div className="nb-name-fields">
            <label className="block"><span className="vtt-field-label">PV</span><input className="nb-input" type="number" value={value.hp} onChange={e => onChange({ hp: e.target.value })} /></label>
            <label className="block"><span className="vtt-field-label">Dés d'attaque</span><input className="nb-input" value={value.dice} onChange={e => onChange({ dice: e.target.value })} /></label>
            <label className="block"><span className="vtt-field-label">Bonus</span><input className="nb-input" type="number" value={value.bonus} onChange={e => onChange({ bonus: e.target.value })} /></label>
        </div>
        <div className="nb-pills">
            {[{ v: null, l: 'Sans armure' }, { v: 'medium', l: 'Armure moyenne' }, { v: 'heavy', l: 'Armure lourde' }].map(o => (
                <button key={String(o.v)} type="button" className={`vtt-pill${value.armor === o.v ? ' is-selected' : ''}`} onClick={() => onChange({ armor: o.v })}>{o.l}</button>
            ))}
            <button type="button" className={`vtt-pill${value.minion ? ' is-selected' : ''}`} onClick={() => onChange({ minion: !value.minion })}>Sbires</button>
        </div>
    </div>
);

const TabEncounter = ({ activeSession, heroes }) => {
    const scope = activeSession ? tableScope('nimble', activeSession.id) : 'nimble';
    const [state, setState] = usePersistedState(scope, 'encounter', ENCOUNTER_OPTIONS);
    const [catalogOpen, setCatalogOpen] = useState(false);
    const [clearOpen, setClearOpen] = useState(false);
    const monsters = state.monsters;
    const setMonsters = (fn) => setState(prev => ({ ...prev, monsters: fn(prev.monsters) }));
    const update = (inst) => setMonsters(list => list.map(m => (m.id === inst.id ? inst : m)));
    const remove = (id) => setMonsters(list => list.filter(m => m.id !== id));
    const add = (m) => setMonsters(list => [...list, monsterInstance(m, MINION_GROUP, heroes)]);

    return (
        <div className="nb-page nb-enc">
            <div className="nb-toolbar">
                <button type="button" className="vtt-btn vtt-btn-primary vtt-btn-sm" onClick={() => setCatalogOpen(true)}>Ajouter des monstres</button>
                {monsters.length > 0 && <button type="button" className="vtt-btn vtt-btn-sm" onClick={() => setClearOpen(true)}>Vider la rencontre</button>}
                <span className="nb-note">{heroes} héros à la table · rencontre gardée dans ce navigateur.</span>
            </div>
            {monsters.length === 0 && <p className="nb-note">Aucun monstre. Les héros jouent d'abord, les monstres agissent ensuite.</p>}
            <div className="nb-enc-grid">
                {monsters.map(m => <NbMonsterCard key={m.id} inst={m} sessionId={activeSession?.id ?? null} onChange={update} onRemove={() => remove(m.id)} />)}
            </div>
            {catalogOpen && (
                <CatalogModal title="Bestiaire" subtitle="Nimble · Game Master's Guide" labels={LABELS} layout={LAYOUT} tabsAs="pill"
                              items={MONSTERS} getKey={m => m.key} filters={FILTERS} groupBy={GROUP} searchFields={SEARCH}
                              renderItem={m => <MonsterRow m={m} heroes={heroes} />} onAdd={add}
                              customDefaults={CUSTOM} renderCustomForm={props => <CustomForm {...props} />}
                              onAddCustom={d => add({ name: d.name.trim(), hp: Number(d.hp) || 0, armor: d.armor, minion: d.minion,
                                  attacks: d.dice ? [{ name: 'Attaque', dice: d.dice, bonus: Number(d.bonus) || 0, noCrit: d.minion }] : [] })}
                              onClose={() => setCatalogOpen(false)} />
            )}
            {clearOpen && (
                <ConfirmModal title="Vider la rencontre" message="Tous les monstres sont retirés." confirmText="Vider" danger
                              onConfirm={() => { setMonsters(() => []); setClearOpen(false); }} onCancel={() => setClearOpen(false)} />
            )}
        </div>
    );
};

export default TabEncounter;
