// src/client/src/systems/achtung/Creation.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Wizard de création de personnage Achtung! Cthulhu — PUBLIC, sans auth.
//
// 6 étapes :
//   1 — Identité       (playerName, nom, nationality, rank, sexe, age, taille, biography)
//   2 — Archétype      (bonus attributs + compétences + 2 focuses + 1 talent + belongings)
//   3 — Background     (bonus attributs + compétences + 2 focuses + 1 talent + 1 truth + belongings)
//   4 — Characteristic (bonus attributs + compétences + 1 talent)
//   5 — Truths + Langues
//   6 — Récapitulatif + création

import React, { useState, useCallback, useMemo } from 'react';
import './theme.css';
import { useSystem }   from '../../hooks/useSystem.js';
import { useNavigate } from 'react-router-dom';
import {
    ATTRIBUTES, SKILLS, ARCHETYPES, BACKGROUNDS, CHARACTERISTICS,
} from './config.jsx';

// ─────────────────────────────────────────────────────────────────────────────
// DONNÉES DE CRÉATION — Archetypes
// Source : PDFs archetypes.pdf
// ─────────────────────────────────────────────────────────────────────────────

const ARCHETYPE_DATA = {
    boffin: {
        label: 'Boffin',
        description: 'Vast technical and practical knowledge. If a Boffin doesn\'t know something, they can probably figure it out.',
        attrBonus:   { brawn: 1, coordination: 2, insight: 1, reason: 2 },
        skillBonus:  { academia: 1, engineering: 2, medicine: 2, observation: 1, stealth: 1, vehicles: 2 },
        focusPool:   ['engineering', 'medicine', 'vehicles'], // choisir 2
        talentPool:  ['Prototype', 'Lifesaver', 'Push the Limits'],
        belongings:  [
            'Mechanic\'s tools or a contact (mechanic)',
            'Electrician\'s tools or a contact (electrician)',
            'Demolition kit or a contact (demolitions)',
            'Medic\'s bag or a contact (medicine)',
        ],
        belongingsNote: 'Choose two sets of tools, two contacts, or one set of tools and a contact.',
    },
    commander: {
        label: 'Commander',
        description: 'A master at marshalling troops and resources. Able to see the bigger picture.',
        attrBonus:   { coordination: 2, insight: 1, reason: 2, will: 1 },
        skillBonus:  { academia: 1, fighting: 2, persuasion: 1, survival: 2, stealth: 1, tactics: 2 },
        focusPool:   ['fighting', 'survival', 'tactics'],
        talentPool:  ['Opportunist', 'Wilderness Guide', 'Born Leader'],
        belongings:  [],
        belongingsNote: 'At the start of each adventure, you may requisition one item up to Restriction 2 for free.',
    },
    con_artist: {
        label: 'Con Artist',
        description: 'Skilled manipulators, able to intimidate, seduce, persuade and deceive their way through life.',
        attrBonus:   { coordination: 1, insight: 2, reason: 1, will: 2 },
        skillBonus:  { academia: 1, observation: 2, persuasion: 2, resilience: 1, stealth: 2, tactics: 1 },
        focusPool:   ['observation', 'persuasion', 'stealth'],
        talentPool:  ['Cold Reading', 'A Way with Words', 'Chameleon'],
        belongings:  ['Disguise Kit', 'One contact, for any one skill or focus'],
        belongingsNote: '',
    },
    grease_monkey: {
        label: 'Grease Monkey',
        description: 'Expert in getting people and supplies where they need to be. Invaluable during dangerous missions.',
        attrBonus:   { brawn: 1, coordination: 2, insight: 1, reason: 2 },
        skillBonus:  { athletics: 1, engineering: 2, persuasion: 2, resilience: 1, survival: 1, vehicles: 2 },
        focusPool:   ['engineering', 'persuasion', 'vehicles'],
        talentPool:  ['Keep it Steady', 'Quartermaster', 'Born to Drive'],
        belongings:  ['Mechanic\'s Tools', 'A contact (Vehicles)'],
        belongingsNote: '',
    },
    infiltrator: {
        label: 'Infiltrator',
        description: 'Talented at getting into places they shouldn\'t. Excel at evading detection and bypassing security.',
        attrBonus:   { agility: 2, brawn: 1, coordination: 2, insight: 1 },
        skillBonus:  { athletics: 2, engineering: 1, fighting: 2, observation: 1, stealth: 2, survival: 1 },
        focusPool:   ['athletics', 'fighting', 'stealth'],
        talentPool:  ['Acrobatic', 'Assassination', 'Silent Step'],
        belongings:  ['Camouflaged clothing', 'Climbing equipment', 'Burglar\'s tools'],
        belongingsNote: '',
    },
    investigator: {
        label: 'Investigator',
        description: 'An insatiable appetite for the truth. Private investigators, military police, and journalists.',
        attrBonus:   { agility: 1, coordination: 1, insight: 2, reason: 2 },
        skillBonus:  { academia: 2, engineering: 1, medicine: 2, observation: 2, persuasion: 1, stealth: 1 },
        focusPool:   ['academia', 'medicine', 'observation'],
        talentPool:  ['Polymath', 'The Cutting Edge', 'Detailed Analysis'],
        belongings:  [
            'Analytical tools or a contact (science)',
            'A first aid kit or a contact (medicine)',
            'A handgun or a contact (Academia)',
        ],
        belongingsNote: 'Choose one set of tools or a contact.',
    },
    occultist: {
        label: 'Occultist',
        description: 'Delved into the deeper, stranger forces of the universe. Gleaned secrets of how to bend such forces.',
        // Deux variantes — A ou B, choisies dans le wizard
        variants: {
            A: { attrBonus: { brawn: 1, will: 2, insight: 2, reason: 1 }, skillBonus: { academia: 2, survival: 1 } },
            B: { attrBonus: { brawn: 1, will: 2, insight: 1, reason: 2 }, skillBonus: { academia: 1, survival: 2 } },
        },
        attrBonusBase:  { brawn: 1, will: 2 },
        skillBonusBase: { observation: 1, persuasion: 2, resilience: 2, stealth: 1 },
        focusPool:      ['academia', 'persuasion', 'resilience', 'survival'],
        talentPool:     ['Occult Scholar', 'Summoner', 'A Price to Pay'],
        talentNote:     'A character may only have one talent with the Spellcaster keyword.',
        belongings:     ['Ritual tools', 'A contact with either the occultism or mysticism focus'],
        belongingsNote: '',
        isSpellcaster:  true, // les talents Occultist sont Spellcaster
    },
    soldier: {
        label: 'Soldier',
        description: 'Excels at combat, defeating their foes, and protecting others.',
        attrBonus:   { agility: 1, brawn: 2, coordination: 2, insight: 1 },
        skillBonus:  { athletics: 1, fighting: 2, observation: 1, resilience: 2, survival: 2, tactics: 1 },
        focusPool:   ['fighting', 'resilience', 'survival'],
        talentPool:  ['Army of One', 'Draw Their Fire!', 'Own the Battlefield'],
        belongings:  ['One weapon with a restriction of 3 or lower', 'A handgun of restriction 1'],
        belongingsNote: '',
    },
};

// ─────────────────────────────────────────────────────────────────────────────
// DONNÉES DE CRÉATION — Backgrounds
// Source : PDFs backgrounds.pdf
// ─────────────────────────────────────────────────────────────────────────────

const BACKGROUND_DATA = {
    academic:         { label: 'Academic',         attrBonus: { coordination: 2, insight: 1, reason: 2, will: 1 }, skillBonus: { academia: 2, observation: 1, persuasion: 1 }, focusPool: ['academia'], talentKeyword: 'Academia', truths: ['Doctor of (subject)', 'Museum Curator', 'Professor of (subject)'], belongings: 'A contact (Academia)' },
    air_force:        { label: 'Air Force',         attrBonus: { agility: 1, coordination: 2, insight: 2, reason: 1 }, skillBonus: { engineering: 1, tactics: 1, vehicles: 2 }, focusPool: ['vehicles'], talentKeyword: 'Vehicles', truths: ['Fighter Ace', 'Expert Navigator', 'Talented Mechanic'], belongings: 'Mechanic\'s tools or a contact with focuses: mechanics, heavy vehicles, or aircraft' },
    army:             { label: 'Army',              attrBonus: { agility: 2, brawn: 2, coordination: 1, will: 1 }, skillBonus: { athletics: 1, fighting: 2, tactics: 1 }, focusPool: ['fighting'], talentKeyword: 'Fighting', truths: ['Trained Marksman', 'Paratrooper', 'Deadly Commando'], belongings: 'An ammo belt' },
    athlete:          { label: 'Athlete',           attrBonus: { agility: 2, brawn: 2, coordination: 1, insight: 1 }, skillBonus: { athletics: 2, fighting: 1, resilience: 1 }, focusPool: ['athletics'], talentKeyword: 'Athletics', truths: ['Star Footballer (Soccer)', 'Baseball Champion', 'Olympic Boxer'], belongings: 'A baseball bat, cricket bat, or other piece of sporting equipment' },
    covert_operative: { label: 'Covert Operative',  attrBonus: { agility: 2, coordination: 1, insight: 1, will: 2 }, skillBonus: { persuasion: 1, stealth: 2, tactics: 1 }, focusPool: ['stealth'], talentKeyword: 'Stealth', truths: ['Cover Identity', 'Silent Killer', 'Resistance Member'], belongings: 'Identity documents and 1 weapon of restriction 2 or less with the Hidden quality' },
    criminal:         { label: 'Criminal',          attrBonus: { agility: 2, brawn: 1, insight: 2, will: 1 }, skillBonus: { persuasion: 2, stealth: 1, tactics: 1 }, focusPool: ['persuasion'], talentKeyword: 'Persuasion', truths: ['Shifty Bagman', 'Criminal Mastermind', 'Black Market Dealer'], belongings: 'Any 1 item with a restriction of 1 or lower' },
    driver:           { label: 'Driver',            attrBonus: { brawn: 1, coordination: 2, insight: 2, reason: 1 }, skillBonus: { athletics: 1, engineering: 1, vehicles: 2 }, focusPool: ['vehicles'], talentKeyword: 'Vehicles', truths: ['Obsessive Motorist', 'Speed Freak', 'Aerobatic Daredevil'], belongings: 'A contact with focuses: cars, heavy vehicles, aircraft, or watercraft' },
    engineer:         { label: 'Engineer',          attrBonus: { agility: 1, coordination: 2, insight: 1, reason: 2 }, skillBonus: { academia: 1, engineering: 2, observation: 1 }, focusPool: ['engineering'], talentKeyword: 'Engineering', truths: ['Diligent Mechanic', 'Experimental Genius', 'Bookish Technician'], belongings: 'Mechanic\'s tools, electrician\'s tools, or a contact (electronics or mechanics)' },
    entertainer:      { label: 'Entertainer',       attrBonus: { agility: 2, coordination: 1, insight: 1, will: 2 }, skillBonus: { athletics: 1, observation: 1, persuasion: 2 }, focusPool: ['persuasion'], talentKeyword: 'Persuasion', truths: ['Star of Stage or Screen', 'One Act Wonder', 'Voice of a Generation'], belongings: 'A contact (persuasion)' },
    journalist:       { label: 'Journalist',        attrBonus: { coordination: 1, insight: 2, reason: 1, will: 2 }, skillBonus: { academia: 1, observation: 2, persuasion: 1 }, focusPool: ['observation'], talentKeyword: 'Observation', truths: ['Investigative Reporter', 'Unhinged Conspiracy Theorist', 'Award-winning Journalist'], belongings: 'A camera or a portable radio set' },
    labourer:         { label: 'Labourer',          attrBonus: { agility: 1, brawn: 2, coordination: 2, will: 1 }, skillBonus: { athletics: 1, resilience: 2, survival: 1 }, focusPool: ['resilience'], talentKeyword: 'Resilience', truths: ['Hardworking Farmhand', 'Jack of All Trades', 'Experienced Miner'], belongings: 'A contact with focuses: architecture, mechanics, animal handling, foraging, hunting, or orienteering' },
    military_officer: { label: 'Military Officer',  attrBonus: { agility: 1, insight: 1, reason: 2, will: 2 }, skillBonus: { fighting: 1, persuasion: 1, tactics: 2 }, focusPool: ['tactics'], talentKeyword: 'Tactics', truths: ['Calculating Strategist', 'Inspirational Leader', 'Frontline Commander'], belongings: 'Once per adventure reduce difficulty of special requisition requests by 1' },
    navy:             { label: 'Navy',              attrBonus: { agility: 2, brawn: 1, coordination: 2, reason: 1 }, skillBonus: { engineering: 1, tactics: 1, vehicles: 2 }, focusPool: ['vehicles'], talentKeyword: 'Vehicles', truths: ['Salty Sea Dog', 'Eager Ship\'s Mate', 'Experienced Submariner'], belongings: 'Mechanic\'s tools or engineer\'s tools' },
    physician:        { label: 'Physician',         attrBonus: { coordination: 2, insight: 1, reason: 2, will: 1 }, skillBonus: { academia: 1, medicine: 2, resilience: 1 }, focusPool: ['medicine'], talentKeyword: 'Medicine', truths: ['Caring Nurse', 'Probing Psychologist', 'Driven Frontline Medic'], belongings: 'First aid kit or a contact (medicine)' },
    police:           { label: 'Police',            attrBonus: { agility: 1, brawn: 1, coordination: 2, insight: 2 }, skillBonus: { fighting: 1, observation: 2, persuasion: 1 }, focusPool: ['observation'], talentKeyword: 'Observation', truths: ['Busy Beat Cop', 'Intimidating Military Policeman', 'Hard-Boiled Private Investigator'], belongings: 'One melee weapon of restriction 2 or lower, or one handgun' },
    politician:       { label: 'Politician',        attrBonus: { coordination: 1, insight: 2, reason: 1, will: 2 }, skillBonus: { academia: 1, persuasion: 2, tactics: 1 }, focusPool: ['persuasion'], talentKeyword: 'Persuasion', truths: ['Charismatic Public Figure', 'Devious Cabinet Minister', 'Overworked Public Servant'], belongings: 'At start of every adventure gain 2 more Requisition points for the group' },
    resistance:       { label: 'Resistance',        attrBonus: { agility: 1, coordination: 1, reason: 2, will: 2 }, skillBonus: { persuasion: 1, stealth: 2, tactics: 1 }, focusPool: ['stealth'], talentKeyword: 'Stealth', truths: ['Confident Saboteur', 'Émigré Allied Agent', 'Valiant Cell Leader'], belongings: 'Covert comms equipment, saboteur\'s kit, a weapon of restriction 2 or lower, or a contact (stealth)' },
    spiritual_leader: { label: 'Spiritual Leader',  attrBonus: { agility: 1, insight: 2, reason: 1, will: 2 }, skillBonus: { academia: 2, persuasion: 1, resilience: 1 }, focusPool: ['academia'], talentKeyword: 'Academia', truths: ['Mesmerising Cult Leader', 'Holy Person', 'Insightful Medium'], belongings: 'Appropriate clothing and insignia, plus a contact (occultism, invocation, mysticism)' },
};

// ─────────────────────────────────────────────────────────────────────────────
// DONNÉES DE CRÉATION — Characteristics
// ─────────────────────────────────────────────────────────────────────────────

const CHARACTERISTIC_DATA = {
    bookworm:               { label: 'Bookworm',                   attrBonus: { insight: 1, reason: 1 }, attrChoiceExtra: 1, skillBonus: { academia: 1 }, skillChoiceExtra: 3, talentKeyword: 'Academia' },
    born_behind_wheel:      { label: 'Born Behind the Wheel',      attrBonus: { coordination: 1, reason: 1 }, attrChoiceExtra: 1, skillBonus: { engineering: 1, vehicles: 1 }, skillChoiceExtra: 2, talentKeyword: 'Vehicles' },
    built_brick_outhouse:   { label: 'Built Like a Brick Outhouse', attrBonus: { brawn: 1, coordination: 1 }, attrChoiceExtra: 1, skillBonus: { athletics: 1, fighting: 1, resilience: 1 }, skillChoiceExtra: 1, talentKeyword: 'Athletics or Resilience' },
    conscientious_objector: { label: 'Conscientious Objector',     attrBonus: { reason: 1, will: 1 }, attrChoiceExtra: 1, skillBonus: { resilience: 1 }, skillChoiceExtra: 3, talentKeyword: 'Resilience', skillExclude: ['fighting', 'tactics'] },
    criminal_mindset:       { label: 'Criminal Mindset',           attrBonus: { insight: 1, agility: 1 }, attrChoiceExtra: 1, skillBonus: { observation: 1, stealth: 1 }, skillChoiceExtra: 2, talentKeyword: 'Stealth or Persuasion' },
    dilettante:             { label: 'Dilettante',                  attrBonus: { coordination: 1, insight: 1 }, attrChoiceExtra: 1, skillBonus: {}, skillChoiceExtra: 0, specialRule: 'Gain +1 to each skill currently at 0 ranks.', talentKeyword: 'Any' },
    dreamwalker:            { label: 'Dreamwalker',                attrBonus: { insight: 1, will: 1 }, attrChoiceExtra: 1, skillBonus: { resilience: 1, observation: 1 }, skillChoiceExtra: 2, talentKeyword: 'Observation or Weird' },
    escaped_europe:         { label: 'Escaped from Europe',        attrBonus: { insight: 1, will: 1 }, attrChoiceExtra: 1, skillBonus: { academia: 1, athletics: 1, persuasion: 1, survival: 1 }, skillChoiceExtra: 0, talentKeyword: 'Persuasion or Survival' },
    experimental_subject:   { label: 'Experimental Subject',       attrBonus: { agility: 1, brawn: 1 }, attrChoiceExtra: 1, skillBonus: {}, skillChoiceExtra: 4, talentKeyword: 'Weird' },
    my_war_started_early:   { label: 'My War Started Early',       attrBonus: { agility: 1, brawn: 1, coordination: 1 }, attrChoiceExtra: 0, skillBonus: { fighting: 1, medicine: 1 }, skillChoiceExtra: 2, talentKeyword: 'Fighting or Medicine' },
    nomadic:                { label: 'Nomadic',                    attrBonus: { brawn: 1, coordination: 1, reason: 1 }, attrChoiceExtra: 0, skillBonus: { survival: 1, vehicles: 1 }, skillChoiceExtra: 2, talentKeyword: 'Survival or Vehicles' },
    own_occult_artefact:    { label: 'Own an Occult Artefact',     attrBonus: { reason: 1, will: 1 }, attrChoiceExtra: 1, skillBonus: {}, skillChoiceExtra: 3, talentKeyword: 'Weird', specialRule: 'You own an Occult artefact — discuss with GM.' },
    raised_by_cult:         { label: 'Raised by a Cult',           attrBonus: { brawn: 1, insight: 1 }, attrChoiceExtra: 1, skillBonus: { academia: 1, resilience: 1, stealth: 1 }, skillChoiceExtra: 1, talentKeyword: 'Stealth, Resilience, or Weird' },
    raised_colonies:        { label: 'Raised in the Colonies',     attrBonus: { agility: 1, brawn: 1, will: 1 }, attrChoiceExtra: 0, skillBonus: { athletics: 1, survival: 1 }, skillChoiceExtra: 2, talentKeyword: 'Athletics or Survival' },
    read_occult_book:       { label: 'Read from an Occult Book',   attrBonus: { insight: 1, will: 1 }, attrChoiceExtra: 1, skillBonus: { observation: 1, resilience: 1 }, skillChoiceExtra: 2, talentKeyword: 'Weird' },
    scientific_visionary:   { label: 'Scientific Visionary',       attrBonus: { insight: 1, reason: 1 }, attrChoiceExtra: 1, skillBonus: { academia: 1, engineering: 1 }, skillChoiceExtra: 2, talentKeyword: 'Academia or Engineering' },
    street_kid:             { label: 'Street Kid',                 attrBonus: { brawn: 1, coordination: 1, reason: 1 }, attrChoiceExtra: 0, skillBonus: { resilience: 1, stealth: 1 }, skillChoiceExtra: 2, talentKeyword: 'Survival' },
    the_lucky_one:          { label: 'The Lucky One',              attrBonus: { agility: 1, brawn: 1, will: 1 }, attrChoiceExtra: 0, skillBonus: { athletics: 1, tactics: 1 }, skillChoiceExtra: 2, talentKeyword: 'Fortune' },
    veteran_great_war:      { label: 'Veteran of the Great War',   attrBonus: { brawn: 1, coordination: 1, will: 1 }, attrChoiceExtra: 0, skillBonus: { fighting: 1, survival: 1 }, skillChoiceExtra: 2, talentKeyword: 'Fighting or Survival' },
    wanted_authorities:     { label: 'Wanted by the Authorities',  attrBonus: { agility: 1, insight: 1 }, attrChoiceExtra: 1, skillBonus: { persuasion: 1, stealth: 1 }, skillChoiceExtra: 2, talentKeyword: 'Persuasion or Stealth' },
    young_at_heart:         { label: 'Young at Heart',             attrBonus: { agility: 1, reason: 1 }, attrChoiceExtra: 1, skillBonus: { athletics: 1, stealth: 1 }, skillChoiceExtra: 2, talentKeyword: 'Any', specialRule: '+2 to any one skill you have 0 or 1 ranks in.' },
};

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTES
// ─────────────────────────────────────────────────────────────────────────────

const ATTR_BASE  = 7;
const SKILL_BASE = 0;

const STEPS = [
    { id: 1, label: 'Identité' },
    { id: 2, label: 'Archétype' },
    { id: 3, label: 'Background' },
    { id: 4, label: 'Characteristic' },
    { id: 5, label: 'Truths & Langues' },
    { id: 6, label: 'Finalisation' },
];

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function applyAttrBonus(base, bonus) {
    const result = { ...base };
    for (const [k, v] of Object.entries(bonus ?? {})) {
        result[k] = (result[k] ?? ATTR_BASE) + v;
    }
    return result;
}

function initAttrs() {
    return Object.fromEntries(ATTRIBUTES.map(a => [a.key, ATTR_BASE]));
}

function initSkills() {
    return Object.fromEntries(SKILLS.map(s => [s.key, { rank: SKILL_BASE, focus: '' }]));
}

// ─────────────────────────────────────────────────────────────────────────────
// SOUS-COMPOSANTS
// ─────────────────────────────────────────────────────────────────────────────

const StepBar = ({ current }) => (
    <div className="flex items-center gap-0.5 mb-6 overflow-x-auto pb-1">
        {STEPS.map((s, i) => (
            <React.Fragment key={s.id}>
                <div className="flex flex-col items-center shrink-0">
                    <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold${
                            s.id < current ? ' bg-success text-white' :
                                s.id === current ? ' bg-primary text-white' :
                                    ' bg-surface-alt text-muted'
                        }`}
                    >
                        {s.id < current ? '✓' : s.id}
                    </div>
                    <span className={`text-[8px] mt-0.5 hidden sm:block${s.id === current ? ' text-primary' : ' text-muted'}`}>
                        {s.label}
                    </span>
                </div>
                {i < STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mb-3${s.id < current ? ' bg-success' : ' bg-border'}`} />
                )}
            </React.Fragment>
        ))}
    </div>
);

const FieldRow = ({ label, children }) => (
    <div className="flex flex-col gap-0.5">
        <label className="ac-label">{label}</label>
        {children}
    </div>
);

const CardButton = ({ selected, onClick, children, className = '' }) => (
    <button
        onClick={onClick}
        className={`ac-select-btn${selected ? ' selected' : ''} p-3 text-left w-full ${className}`}
    >
        {children}
    </button>
);

// Affichage des bonus d'un archétype/background
const BonusBadges = ({ attrBonus = {}, skillBonus = {} }) => (
    <div className="flex flex-wrap gap-1 mt-1">
        {Object.entries(attrBonus).map(([k, v]) => (
            <span key={k} className="ac-pill" style={{ fontSize: '0.65rem' }}>
                {ATTRIBUTES.find(a => a.key === k)?.label ?? k} +{v}
            </span>
        ))}
        {Object.entries(skillBonus).map(([k, v]) => (
            <span key={k} className="ac-pill" style={{ fontSize: '0.65rem', color: 'var(--ac-primary)' }}>
                {SKILLS.find(s => s.key === k)?.label ?? k} +{v}
            </span>
        ))}
    </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// ÉTAPE 2 — Archétype
// ─────────────────────────────────────────────────────────────────────────────

const StepArchetype = ({ value, occultistVariant, selectedFocuses, focusTexts, selectedTalent, onChange }) => {
    const data = value ? ARCHETYPE_DATA[value] : null;

    // Focuses sélectionnés — doit en choisir 2
    const handleFocusToggle = (skillKey) => {
        const current = selectedFocuses ?? [];
        if (current.includes(skillKey)) {
            onChange({ selectedFocuses: current.filter(f => f !== skillKey) });
        } else if (current.length < 2) {
            onChange({ selectedFocuses: [...current, skillKey] });
        }
    };

    return (
        <div className="flex flex-col gap-4">
            <div>
                <div className="ac-section-header">Choisissez votre Archétype</div>
                <div className="grid grid-cols-1 gap-2">
                    {Object.entries(ARCHETYPE_DATA).map(([key, arch]) => (
                        <CardButton
                            key={key}
                            selected={value === key}
                            onClick={() => onChange({ archetype: key, selectedFocuses: [], selectedTalent: null, occultistVariant: 'A' })}
                        >
                            <div className="ac-font-title text-sm">{arch.label}</div>
                            <div className="ac-text-muted mt-0.5" style={{ fontSize: '0.72rem' }}>{arch.description}</div>
                            <BonusBadges
                                attrBonus={arch.variants ? { ...arch.attrBonusBase, ...arch.variants.A.attrBonus } : arch.attrBonus}
                                skillBonus={arch.variants ? { ...arch.skillBonusBase, ...arch.variants.A.skillBonus } : arch.skillBonus}
                            />
                        </CardButton>
                    ))}
                </div>
            </div>

            {/* Variante Occultist */}
            {value === 'occultist' && (
                <div>
                    <div className="ac-section-header">Variante Occultist</div>
                    <div className="flex gap-2">
                        {['A', 'B'].map(v => {
                            const variant = ARCHETYPE_DATA.occultist.variants[v];
                            return (
                                <CardButton
                                    key={v}
                                    selected={occultistVariant === v}
                                    onClick={() => onChange({ occultistVariant: v })}
                                    className="flex-1"
                                >
                                    <div className="ac-font-title text-sm">Variante {v}</div>
                                    <BonusBadges
                                        attrBonus={{ ...ARCHETYPE_DATA.occultist.attrBonusBase, ...variant.attrBonus }}
                                        skillBonus={{ ...ARCHETYPE_DATA.occultist.skillBonusBase, ...variant.skillBonus }}
                                    />
                                </CardButton>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Sélection focuses */}
            {data && (
                <div>
                    <div className="ac-section-header">Choisissez 2 Focuses ({(selectedFocuses ?? []).length}/2)</div>
                    <div className="grid grid-cols-2 gap-1">
                        {data.focusPool.map(skillKey => {
                            const skillDef = SKILLS.find(s => s.key === skillKey);
                            const isSelected = (selectedFocuses ?? []).includes(skillKey);
                            return (
                                <CardButton
                                    key={skillKey}
                                    selected={isSelected}
                                    onClick={() => handleFocusToggle(skillKey)}
                                >
                                    <span style={{ fontSize: '0.8rem' }}>{skillDef?.label ?? skillKey}</span>
                                    <div className="ac-text-muted" style={{ fontSize: '0.65rem' }}>
                                        {skillDef?.focuses?.join(', ')}
                                    </div>
                                </CardButton>
                            );
                        })}
                    </div>
                    {(selectedFocuses ?? []).length > 0 && (
                        <div className="mt-2 flex flex-col gap-1">
                            {(selectedFocuses ?? []).map(skillKey => {
                                const skillDef = SKILLS.find(s => s.key === skillKey);
                                return (
                                    <div key={skillKey}>
                                        <div className="ac-label">{skillDef?.label} — focus spécifique</div>
                                        <input
                                            className="ac-input"
                                            placeholder={`Ex: ${skillDef?.focuses?.[0] ?? 'Focus...'}`}
                                            value={(focusTexts ?? {})[skillKey] ?? ''}
                                            onChange={e => onChange({
                                                focusTexts: { ...(focusTexts ?? {}), [skillKey]: e.target.value },
                                            })}
                                        />
                                        <div className="ac-text-muted mt-0.5" style={{ fontSize: '0.65rem' }}>
                                            Suggestions : {skillDef?.focuses?.join(', ')}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Sélection talent */}
            {data && (
                <div>
                    <div className="ac-section-header">Choisissez 1 Talent</div>
                    {data.talentNote && <div className="ac-text-muted mb-2" style={{ fontSize: '0.72rem' }}>{data.talentNote}</div>}
                    <div className="flex flex-col gap-1">
                        {data.talentPool.map(talent => (
                            <CardButton
                                key={talent}
                                selected={selectedTalent === talent}
                                onClick={() => onChange({ selectedTalent: talent })}
                            >
                                <span style={{ fontSize: '0.82rem' }}>{talent}</span>
                            </CardButton>
                        ))}
                    </div>
                </div>
            )}

            {/* Belongings */}
            {data?.belongings?.length > 0 && (
                <div className="ac-card-alt">
                    <div className="ac-label mb-1">Belongings</div>
                    {data.belongingsNote && <div className="ac-text-muted" style={{ fontSize: '0.72rem' }}>{data.belongingsNote}</div>}
                    <ul className="mt-1 flex flex-col gap-0.5">
                        {data.belongings.map((b, i) => (
                            <li key={i} className="text-default" style={{ fontSize: '0.8rem' }}>· {b}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// ÉTAPE 3 — Background
// ─────────────────────────────────────────────────────────────────────────────

const StepBackground = ({ value, selectedFocus, selectedTalentKeyword, selectedTruth, selectedTalent, onChange, allTalents }) => {
    const data = value ? BACKGROUND_DATA[value] : null;

    return (
        <div className="flex flex-col gap-4">
            <div>
                <div className="ac-section-header">Choisissez votre Background</div>
                <div className="grid grid-cols-1 gap-2">
                    {Object.entries(BACKGROUND_DATA).map(([key, bg]) => (
                        <CardButton
                            key={key}
                            selected={value === key}
                            onClick={() => onChange({ background: key, bgFocus: '', bgTalent: null, bgTruth: '' })}
                        >
                            <div className="ac-font-title text-sm">{bg.label}</div>
                            <BonusBadges attrBonus={bg.attrBonus} skillBonus={bg.skillBonus} />
                            {bg.truths?.length > 0 && (
                                <div className="ac-text-muted mt-0.5" style={{ fontSize: '0.65rem' }}>
                                    Truths : {bg.truths.join(', ')}
                                </div>
                            )}
                        </CardButton>
                    ))}
                </div>
            </div>

            {data && (
                <>
                    {/* Focus */}
                    <div>
                        <div className="ac-section-header">Choisissez 1 Focus ({data.focusPool[0]})</div>
                        <div>
                            <div className="ac-label mb-1">Focus spécifique</div>
                            <input
                                className="ac-input"
                                value={selectedFocus ?? ''}
                                onChange={e => onChange({ bgFocus: e.target.value })}
                                placeholder={`Focus pour ${SKILLS.find(s => s.key === data.focusPool[0])?.label}…`}
                            />
                            <div className="ac-text-muted mt-1" style={{ fontSize: '0.7rem' }}>
                                Suggestions : {SKILLS.find(s => s.key === data.focusPool[0])?.focuses?.join(', ')}
                            </div>
                        </div>
                        <div className="mt-2">
                            <div className="ac-label mb-1">Focus libre (compétence au choix)</div>
                            <input
                                className="ac-input"
                                placeholder="Ex: Jungle (Survival), Hand-to-Hand (Fighting)…"
                            />
                        </div>
                    </div>

                    {/* Talent */}
                    <div>
                        <div className="ac-section-header">Talent avec keyword : {data.talentKeyword}</div>
                        <input
                            className="ac-input"
                            value={selectedTalent ?? ''}
                            onChange={e => onChange({ bgTalent: e.target.value })}
                            placeholder={`Talent avec keyword ${data.talentKeyword}…`}
                        />
                    </div>

                    {/* Truth */}
                    <div>
                        <div className="ac-section-header">Personal Truth</div>
                        <div className="flex flex-col gap-1 mb-2">
                            {data.truths.map(t => (
                                <CardButton
                                    key={t}
                                    selected={selectedTruth === t}
                                    onClick={() => onChange({ bgTruth: t })}
                                >
                                    <span style={{ fontSize: '0.82rem' }}>{t}</span>
                                </CardButton>
                            ))}
                        </div>
                        <input
                            className="ac-input"
                            value={selectedTruth ?? ''}
                            onChange={e => onChange({ bgTruth: e.target.value })}
                            placeholder="Ou créez votre propre truth…"
                        />
                    </div>

                    {/* Belongings */}
                    {data.belongings && (
                        <div className="ac-card-alt">
                            <div className="ac-label mb-1">Belongings</div>
                            <div className="text-default" style={{ fontSize: '0.8rem' }}>· {data.belongings}</div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// ÉTAPE 4 — Characteristic
// ─────────────────────────────────────────────────────────────────────────────

const StepCharacteristic = ({ value, selectedTalent, onChange }) => {
    const data = value ? CHARACTERISTIC_DATA[value] : null;

    return (
        <div className="flex flex-col gap-4">
            <div>
                <div className="ac-section-header">Choisissez votre Characteristic</div>
                <div className="ac-text-muted mb-2" style={{ fontSize: '0.72rem' }}>
                    Les characteristics définissent pourquoi vous avez été recruté dans la Secret War.
                </div>
                <div className="grid grid-cols-1 gap-1.5">
                    {Object.entries(CHARACTERISTIC_DATA).map(([key, ch]) => (
                        <CardButton
                            key={key}
                            selected={value === key}
                            onClick={() => onChange({ characteristic: key, charTalent: null })}
                        >
                            <div className="ac-font-title text-sm">{ch.label}</div>
                            <BonusBadges attrBonus={ch.attrBonus} skillBonus={ch.skillBonus} />
                            {ch.specialRule && (
                                <div className="ac-text-muted mt-0.5" style={{ fontSize: '0.65rem' }}>★ {ch.specialRule}</div>
                            )}
                        </CardButton>
                    ))}
                </div>
            </div>

            {data && (
                <div>
                    <div className="ac-section-header">Talent avec keyword : {data.talentKeyword}</div>
                    <input
                        className="ac-input"
                        value={selectedTalent ?? ''}
                        onChange={e => onChange({ charTalent: e.target.value })}
                        placeholder={`Talent avec keyword ${data.talentKeyword}…`}
                    />
                </div>
            )}
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// ÉTAPE 5 — Truths & Langues
// ─────────────────────────────────────────────────────────────────────────────

const StepTruths = ({ truths, languages, nationality, onChange }) => {
    const [langInput, setLangInput] = useState('');

    const addLang = () => {
        const val = langInput.trim();
        if (!val || languages.includes(val)) return;
        onChange({ languages: [...languages, val] });
        setLangInput('');
    };

    return (
        <div className="flex flex-col gap-4">
            <div>
                <div className="ac-section-header">Personal Truths & Scars</div>
                <div className="ac-text-muted mb-2" style={{ fontSize: '0.72rem' }}>
                    Vous devez avoir au moins 4 truths : nationality, language, background truth, et characteristic truth.
                    Ajoutez vos truths personnelles ci-dessous.
                </div>
                <div className="flex flex-col gap-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i}>
                            <div className="ac-label">Truth {i + 1}</div>
                            <input
                                className="ac-input"
                                value={truths[i] ?? ''}
                                onChange={e => {
                                    const next = [...truths];
                                    next[i] = e.target.value;
                                    onChange({ truths: next });
                                }}
                                placeholder={
                                    i === 0 ? nationality ? `Nationalité : ${nationality}` : 'Nationalité…' :
                                        i === 1 ? 'Langue maternelle…' :
                                            'Truth personnelle…'
                                }
                            />
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <div className="ac-section-header">Languages</div>
                <div className="flex flex-wrap gap-1.5 mb-2">
                    {languages.map(lang => (
                        <span key={lang} className="ac-pill">
                            {lang}
                            <button className="ac-pill-remove" onClick={() => onChange({ languages: languages.filter(l => l !== lang) })}>✕</button>
                        </span>
                    ))}
                </div>
                <div className="flex gap-2">
                    <input
                        className="ac-input"
                        value={langInput}
                        onChange={e => setLangInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && addLang()}
                        placeholder="Ajouter une langue…"
                    />
                    <button onClick={addLang} className="ac-btn ac-btn-secondary">+</button>
                </div>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// RÉCAPITULATIF — calcul des valeurs finales
// ─────────────────────────────────────────────────────────────────────────────

function computeFinalValues(wizardState) {
    const { archetype, occultistVariant, background, characteristic } = wizardState;

    let attrs  = initAttrs();
    let skills = initSkills();

    // Archétype
    if (archetype && ARCHETYPE_DATA[archetype]) {
        const arch = ARCHETYPE_DATA[archetype];
        if (arch.variants) {
            const v = arch.variants[occultistVariant ?? 'A'];
            attrs  = applyAttrBonus(attrs,  { ...arch.attrBonusBase,  ...v.attrBonus  });
            skills = applySkillBonus(skills, { ...arch.skillBonusBase, ...v.skillBonus }, true);
        } else {
            attrs  = applyAttrBonus(attrs,  arch.attrBonus);
            skills = applySkillBonus(skills, arch.skillBonus, true);
        }
    }

    // Background
    if (background && BACKGROUND_DATA[background]) {
        const bg = BACKGROUND_DATA[background];
        attrs  = applyAttrBonus(attrs,  bg.attrBonus);
        skills = applySkillBonus(skills, bg.skillBonus, true);
    }

    // Characteristic
    if (characteristic && CHARACTERISTIC_DATA[characteristic]) {
        const ch = CHARACTERISTIC_DATA[characteristic];
        attrs  = applyAttrBonus(attrs,  ch.attrBonus);
        if (ch.skillBonus) skills = applySkillBonus(skills, ch.skillBonus, true);
    }

    return { attrs, skills };
}

function applySkillBonus(base, bonus, asRank) {
    const result = { ...base };
    for (const [k, v] of Object.entries(bonus ?? {})) {
        if (asRank) {
            result[k] = { rank: (result[k]?.rank ?? SKILL_BASE) + v, focus: result[k]?.focus ?? '' };
        } else {
            result[k] = (result[k] ?? SKILL_BASE) + v;
        }
    }
    return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// ÉTAPE 6 — Récapitulatif
// ─────────────────────────────────────────────────────────────────────────────

const StepRecap = ({ wizardState }) => {
    const { attrs, skills } = useMemo(() => computeFinalValues(wizardState), [wizardState]);

    return (
        <div className="flex flex-col gap-4">
            <div className="ac-section-header">Récapitulatif du personnage</div>

            {/* Identité */}
            <div className="ac-card">
                <div className="ac-label mb-1">Identité</div>
                <div className="grid grid-cols-2 gap-2" style={{ fontSize: '0.82rem' }}>
                    <div><span className="ac-text-muted">Nom : </span>{wizardState.nom || '—'}</div>
                    <div><span className="ac-text-muted">Joueur : </span>{wizardState.playerName || '—'}</div>
                    <div><span className="ac-text-muted">Nationalité : </span>{wizardState.nationality || '—'}</div>
                    <div><span className="ac-text-muted">Grade : </span>{wizardState.rank || '—'}</div>
                    <div><span className="ac-text-muted">Archétype : </span>{wizardState.archetype ? ARCHETYPE_DATA[wizardState.archetype]?.label : '—'}</div>
                    <div><span className="ac-text-muted">Background : </span>{wizardState.background ? BACKGROUND_DATA[wizardState.background]?.label : '—'}</div>
                    <div><span className="ac-text-muted">Characteristic : </span>{wizardState.characteristic ? CHARACTERISTIC_DATA[wizardState.characteristic]?.label : '—'}</div>
                </div>
            </div>

            {/* Attributs */}
            <div className="ac-card">
                <div className="ac-label mb-2">Attributs finaux</div>
                <div className="ac-attr-grid">
                    {ATTRIBUTES.map(a => (
                        <div key={a.key} className="ac-attr-cell">
                            <span className="ac-label">{a.label}</span>
                            <span className="ac-attr-value">{attrs[a.key] ?? ATTR_BASE}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Compétences */}
            <div className="ac-card">
                <div className="ac-label mb-2">Compétences finales</div>
                <table className="ac-table">
                    <thead><tr><th>Compétence</th><th style={{ textAlign: 'center' }}>Rang</th><th>Focus</th></tr></thead>
                    <tbody>
                    {SKILLS.map(s => {
                        const skill = skills[s.key];
                        const rank  = typeof skill === 'object' ? skill.rank : 0;
                        if (rank === 0) return null;
                        return (
                            <tr key={s.key}>
                                <td className="ac-label">{s.label}</td>
                                <td className="ac-value text-center">{rank}</td>
                                <td className="ac-text-muted">{skill?.focus || '—'}</td>
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
            </div>

            {/* Talents */}
            <div className="ac-card">
                <div className="ac-label mb-1">Talents</div>
                <div className="flex flex-col gap-1">
                    {[wizardState.archTalent, wizardState.bgTalent, wizardState.charTalent].filter(Boolean).map((t, i) => (
                        <div key={i} className="text-default" style={{ fontSize: '0.82rem' }}>· {t}</div>
                    ))}
                    {![wizardState.archTalent, wizardState.bgTalent, wizardState.charTalent].some(Boolean) && (
                        <div className="ac-text-muted">Aucun talent sélectionné</div>
                    )}
                </div>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPOSANT PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────

const Creation = ({ darkMode, onToggleDarkMode }) => {
    const { apiBase, slug } = useSystem();
    const navigate          = useNavigate();

    const [step,       setStep]       = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const [error,      setError]      = useState('');
    const [accessCode, setAccessCode] = useState(null);
    const [accessUrl,  setAccessUrl]  = useState(null);

    // État global du wizard
    const [ws, setWs] = useState({
        // Étape 1 — Identité
        playerName: '', nom: '', nationality: '', rank: '',
        sexe: '', age: '', taille: '', biography: '',
        // Étape 2 — Archétype
        archetype: null, occultistVariant: 'A',
        archFocuses: [], archFocusTexts: {}, archTalent: null,
        // Étape 3 — Background
        background: null, bgFocus: '', bgExtraFocus: '', bgTalent: null, bgTruth: '',
        // Étape 4 — Characteristic
        characteristic: null, charTalent: null,
        // Étape 5 — Truths & Langues
        truths: ['', '', '', '', ''],
        languages: [],
    });

    const patch = useCallback((partial) => {
        setWs(prev => ({ ...prev, ...partial }));
    }, []);

    // Validation par étape
    const canAdvance = useMemo(() => {
        switch (step) {
            case 1: return ws.playerName.trim() && ws.nom.trim();
            case 2: return ws.archetype && (ws.archFocuses?.length ?? 0) >= 2 && ws.archTalent;
            case 3: return ws.background && ws.bgTalent;
            case 4: return ws.characteristic && ws.charTalent;
            case 5: return true;
            default: return true;
        }
    }, [step, ws]);

    // Soumission finale
    const handleSubmit = async () => {
        setSubmitting(true);
        setError('');

        const { attrs, skills } = computeFinalValues(ws);

        // Construction du payload
        const attributes = ATTRIBUTES.map(a => ({
            key: a.key, value: attrs[a.key] ?? ATTR_BASE,
        }));

        const skillsPayload = SKILLS.map(s => {
            const sk = skills[s.key];
            return {
                key:   s.key,
                rank:  typeof sk === 'object' ? sk.rank : 0,
                focus: typeof sk === 'object' ? sk.focus : '',
            };
        });

        // Focuses archétype — textes saisis par l'utilisateur
        const skillsWithFocuses = skillsPayload.map(s => {
            if ((ws.archFocuses ?? []).includes(s.key)) {
                return { ...s, focus: (ws.archFocusTexts ?? {})[s.key] ?? s.focus };
            }
            if (ws.bgFocus && BACKGROUND_DATA[ws.background]?.focusPool?.includes(s.key)) {
                return { ...s, focus: ws.bgFocus };
            }
            return s;
        });

        const talents = [
            ws.archTalent  ? { name: ws.archTalent,  keywords: ws.archetype ? ARCHETYPE_DATA[ws.archetype]?.label : '',     effect: '' } : null,
            ws.bgTalent    ? { name: ws.bgTalent,     keywords: ws.background ? BACKGROUND_DATA[ws.background]?.label : '',   effect: '' } : null,
            ws.charTalent  ? { name: ws.charTalent,   keywords: ws.characteristic ? CHARACTERISTIC_DATA[ws.characteristic]?.label : '', effect: '' } : null,
        ].filter(Boolean);

        // Belongings → character_items
        const archData = ws.archetype ? ARCHETYPE_DATA[ws.archetype] : null;
        const bgData   = ws.background ? BACKGROUND_DATA[ws.background] : null;
        const items = [
            ...(archData?.belongings ?? []).map(name => ({ name, description: '', effect: '' })),
            bgData?.belongings ? { name: bgData.belongings, description: '', effect: '' } : null,
        ].filter(Boolean);

        const payload = {
            playerName:     ws.playerName.trim(),
            nom:            ws.nom.trim(),
            nationality:    ws.nationality,
            rank:           ws.rank,
            sexe:           ws.sexe,
            age:            ws.age ? parseInt(ws.age) : null,
            taille:         ws.taille ? parseInt(ws.taille) : null,
            biography:      ws.biography,
            archetype:      ws.archetype ?? '',
            background:     ws.background ?? '',
            characteristic: ws.characteristic ?? '',
            truths:         ws.truths,
            languages:      ws.languages,
            attributes:     attributes,
            skills:         skillsWithFocuses,
            talents,
            items,
            isSpellcaster:  ws.archetype === 'occultist',
            weapons:        [],
            spells:         [],
        };

        try {
            const res = await fetch(`${apiBase}/characters`, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify(payload),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error ?? 'Erreur lors de la création du personnage');
            }

            const char = await res.json();
            setAccessCode(char.accessCode);
            setAccessUrl(char.accessUrl);
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    // ── Écran post-création ───────────────────────────────────────────────────
    if (accessCode) {
        return (
            <div className={`min-h-screen bg-bg text-default flex items-center justify-center p-4${darkMode ? ' dark' : ''}`}>
                <div className="ac-card max-w-sm w-full text-center flex flex-col gap-4">
                    <div className="ac-section-header text-center" style={{ border: 'none' }}>✓ Personnage créé</div>
                    <div>
                        <div className="ac-label mb-1">Votre code d'accès</div>
                        <div className="ac-code-display text-2xl tracking-widest text-secondary">{accessCode}</div>
                        <div className="ac-text-muted mt-1" style={{ fontSize: '0.72rem' }}>
                            Notez ce code — il vous permettra de retrouver votre personnage.
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <button
                            onClick={() => navigate(`/${slug}/${accessUrl}`)}
                            className="ac-btn ac-btn-primary w-full"
                        >
                            Accéder à ma fiche →
                        </button>
                        <button
                            onClick={() => navigate(`/${slug}/`)}
                            className="ac-btn ac-btn-ghost w-full"
                        >
                            Retour à l'accueil
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ── Wizard ────────────────────────────────────────────────────────────────
    return (
        <div className={`min-h-screen bg-bg text-default${darkMode ? ' dark' : ''}`}>
            <header className="ac-header justify-center">
                <div className="ac-font-title text-primary" style={{ fontSize: '0.9rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    Création de Personnage
                </div>
            </header>

            <div className="max-w-2xl mx-auto px-4 py-6">
                <StepBar current={step} />

                {error && (
                    <div className="mb-4 px-3 py-2 rounded text-sm bg-danger text-white">{error}</div>
                )}

                {/* ── ÉTAPE 1 — Identité ──────────────────────────────────── */}
                {step === 1 && (
                    <div className="ac-card flex flex-col gap-4">
                        <div className="ac-section-header">Identité du personnage</div>

                        <div className="grid grid-cols-2 gap-3">
                            <FieldRow label="Nom du personnage *">
                                <input className="ac-input" value={ws.nom} onChange={e => patch({ nom: e.target.value })} placeholder="Nom…" />
                            </FieldRow>
                            <FieldRow label="Nom du joueur *">
                                <input className="ac-input" value={ws.playerName} onChange={e => patch({ playerName: e.target.value })} placeholder="Joueur…" />
                            </FieldRow>
                            <FieldRow label="Nationalité">
                                <input className="ac-input" value={ws.nationality} onChange={e => patch({ nationality: e.target.value })} placeholder="Ex: British, American…" />
                            </FieldRow>
                            <FieldRow label="Grade / Rank">
                                <input className="ac-input" value={ws.rank} onChange={e => patch({ rank: e.target.value })} placeholder="Ex: Captain, Private…" />
                            </FieldRow>
                            <FieldRow label="Sexe">
                                <input className="ac-input" value={ws.sexe} onChange={e => patch({ sexe: e.target.value })} placeholder="…" />
                            </FieldRow>
                            <FieldRow label="Âge">
                                <input className="ac-input" type="number" value={ws.age} onChange={e => patch({ age: e.target.value })} placeholder="…" />
                            </FieldRow>
                        </div>

                        <FieldRow label="Biographie">
                            <textarea
                                className="ac-input"
                                rows={3}
                                value={ws.biography}
                                onChange={e => patch({ biography: e.target.value })}
                                placeholder="Quelques mots sur votre personnage…"
                            />
                        </FieldRow>
                    </div>
                )}

                {/* ── ÉTAPE 2 — Archétype ─────────────────────────────────── */}
                {step === 2 && (
                    <div className="ac-card">
                        <StepArchetype
                            value={ws.archetype}
                            occultistVariant={ws.occultistVariant}
                            selectedFocuses={ws.archFocuses}
                            focusTexts={ws.archFocusTexts}
                            selectedTalent={ws.archTalent}
                            onChange={(partial) => patch({
                                archetype:        partial.archetype        ?? ws.archetype,
                                occultistVariant: partial.occultistVariant ?? ws.occultistVariant,
                                archFocuses:      partial.selectedFocuses  ?? ws.archFocuses,
                                archFocusTexts:   partial.focusTexts       ?? ws.archFocusTexts,
                                archTalent:       partial.selectedTalent   ?? ws.archTalent,
                            })}
                        />
                    </div>
                )}

                {/* ── ÉTAPE 3 — Background ────────────────────────────────── */}
                {step === 3 && (
                    <div className="ac-card">
                        <StepBackground
                            value={ws.background}
                            selectedFocus={ws.bgFocus}
                            selectedTalent={ws.bgTalent}
                            selectedTruth={ws.bgTruth}
                            onChange={(partial) => patch({
                                background: partial.background ?? ws.background,
                                bgFocus:    partial.bgFocus    ?? ws.bgFocus,
                                bgTalent:   partial.bgTalent   ?? ws.bgTalent,
                                bgTruth:    partial.bgTruth    ?? ws.bgTruth,
                            })}
                        />
                    </div>
                )}

                {/* ── ÉTAPE 4 — Characteristic ────────────────────────────── */}
                {step === 4 && (
                    <div className="ac-card">
                        <StepCharacteristic
                            value={ws.characteristic}
                            selectedTalent={ws.charTalent}
                            onChange={(partial) => patch({
                                characteristic: partial.characteristic ?? ws.characteristic,
                                charTalent:     partial.charTalent     ?? ws.charTalent,
                            })}
                        />
                    </div>
                )}

                {/* ── ÉTAPE 5 — Truths & Langues ──────────────────────────── */}
                {step === 5 && (
                    <div className="ac-card">
                        <StepTruths
                            truths={ws.truths}
                            languages={ws.languages}
                            nationality={ws.nationality}
                            onChange={(partial) => patch({
                                truths:    partial.truths    ?? ws.truths,
                                languages: partial.languages ?? ws.languages,
                            })}
                        />
                    </div>
                )}

                {/* ── ÉTAPE 6 — Récapitulatif ─────────────────────────────── */}
                {step === 6 && (
                    <StepRecap wizardState={ws} />
                )}

                {/* ── Navigation ──────────────────────────────────────────── */}
                <div className="flex gap-3 mt-6">
                    {step > 1 && (
                        <button
                            onClick={() => setStep(s => s - 1)}
                            className="ac-btn ac-btn-ghost flex-1"
                        >
                            ← Retour
                        </button>
                    )}
                    {step < 6 && (
                        <button
                            onClick={() => setStep(s => s + 1)}
                            disabled={!canAdvance}
                            className="ac-btn ac-btn-primary flex-1 disabled:opacity-30"
                        >
                            Suivant →
                        </button>
                    )}
                    {step === 6 && (
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="ac-btn ac-btn-primary flex-1 disabled:opacity-30"
                        >
                            {submitting ? '⏳ Création…' : '✓ Créer mon personnage'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Creation;