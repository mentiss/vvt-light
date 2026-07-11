// src/client/src/systems/fabula/components/layout/EquipmentEditForm.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Deux faces d'un item d'équipement, partagées par BackpackCard, ArmorCard,
// WeaponsCard, AccessoryCard, EquipmentPanel et l'étape 4 du wizard :
//   - EquipmentEditForm (défaut)   : saisie libre enrichie, contextuelle au
//     typeEmplacement — arme (catégorie, précision [attr+attr]+N, dégâts
//     [VH+N] type, mains, portée), armure (DEF dé DEX + mod OU DEF fixe),
//     bouclier/accessoire (mods).
//   - EquipmentItemSummary (nommé) : résumé lecture (badges + profil formaté
//     via les helpers de utils.js).
// Le badge Martial est purement informatif — aucune contrainte logicielle,
// vérification à la table (décision actée).
// Changer le type d'un item le DÉSÉQUIPE (son emplacement n'aurait plus de
// sens) — commenté sur le handler.
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import {
    CATEGORIES_ARMES, TYPES_DEGATS, ATTR_LABELS,
    formatPrecision, formatDegats, formatDefense, formatDefenseMagique,
} from '../../config.jsx';

// ── Constantes UI partagées ───────────────────────────────────────────────────

export const TYPE_LABELS = {
    arme:       'Arme',
    armure:     'Armure',
    bouclier:   'Bouclier',
    accessoire: 'Accessoire',
};

export const EMPLACEMENT_LABELS = {
    armure:          'Armure',
    accessoire:      'Accessoire',
    main_directrice: 'Main directrice',
    main_secondaire: 'Main secondaire',
    deux_mains:      'Deux mains',
};

const MAINS_LABELS  = { 1: 'Une main', 2: 'Deux mains' };
const PORTEE_LABELS = { cac: 'Corps à corps', distance: 'Distance' };

/** Item vierge au contrat complet (BackpackCard, EquipmentPanel, wizard). */
export const createEmptyItem = (typeEmplacement = 'arme') => ({
    typeEmplacement, equipmentKey: null, nomLibre: '', notesLibres: '', prix: 0,
    categorie: null, estMartial: false, qualite: '',
    precisionAttr1: 'dex', precisionAttr2: 'dex', precisionBonus: 0,
    degatsBonus: 0, degatsType: 'physique', mains: 1, portee: 'cac',
    modDefense: 0, modDefenseMagique: 0, modInitiative: 0, defFixe: null,
    emplacementEquipe: null,
});

// ── Sous-composants (niveau module — jamais dans un render) ──────────────────

const Pill = ({ active, onClick, children, tone = 'primary' }) => (
    <button type="button" onClick={onClick}
            className={`px-2 py-0.5 rounded-full text-xs border ${
                active ? `bg-${tone} text-white border-${tone}` : 'bg-default border-default'
            }`}>
        {children}
    </button>
);

const AttrPills = ({ value, onChange }) => (
    <div className="flex gap-1">
        {Object.entries(ATTR_LABELS).map(([key, label]) => (
            <Pill key={key} active={value === key} onClick={() => onChange(key)}>{label}</Pill>
        ))}
    </div>
);

const NumField = ({ label, value, onChange, w = 'w-12' }) => (
    <label className="text-xs flex items-center">
        {label}
        <input type="number" value={value ?? 0}
               onChange={e => onChange(parseInt(e.target.value) || 0)}
               className={`${w} bg-default border border-default rounded px-1 ml-1`} />
    </label>
);

// ── Résumé lecture ────────────────────────────────────────────────────────────

export const EquipmentItemSummary = ({ item, showType = true }) => {
    const isWeapon = item.typeEmplacement === 'arme';
    const isDefensive = ['armure', 'bouclier', 'accessoire'].includes(item.typeEmplacement);
    const catLabel = CATEGORIES_ARMES.find(c => c.key === item.categorie)?.label;

    return (
        <div className="flex flex-col gap-0.5 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold">{item.nomLibre || '(sans nom)'}</span>
                {showType && (
                    <span className="text-xs text-muted">{TYPE_LABELS[item.typeEmplacement]}</span>
                )}
                {isWeapon && catLabel && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-surface border border-default">{catLabel}</span>
                )}
                {item.estMartial && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent/10 text-accent border border-accent">Martial</span>
                )}
            </div>

            {isWeapon && (
                <div className="text-xs text-muted">
                    Préc. <strong className="text-default">{formatPrecision(item)}</strong>
                    {' · '}Dég. <strong className="text-default">{formatDegats(item)}</strong>
                    {' · '}{MAINS_LABELS[item.mains] ?? 'Une main'}
                    {' · '}{PORTEE_LABELS[item.portee] ?? 'Corps à corps'}
                </div>
            )}
            {isDefensive && (
                <div className="text-xs text-muted">
                    Déf. <strong className="text-default">{formatDefense(item)}</strong>
                    {' · '}Déf.Mag. <strong className="text-default">{formatDefenseMagique(item)}</strong>
                    {(item.modInitiative ?? 0) !== 0 && <>{' · '}Init. <strong className="text-default">{item.modInitiative}</strong></>}
                </div>
            )}

            {item.qualite && <p className="text-xs text-accent">{item.qualite}</p>}
            {item.notesLibres && <p className="text-xs text-muted">{item.notesLibres}</p>}
        </div>
    );
};

// ── Formulaire d'édition ──────────────────────────────────────────────────────

/**
 * @param {object}   item      - item d'équipement (forme plate character_equipment)
 * @param {function} onChange  - onChange(patch) — patch partiel à fusionner
 * @param {boolean}  showType  - masquer les pills de type sur les cartes à
 *                               emplacement fixe (ArmorCard, AccessoryCard…)
 * @param {boolean}  showPrix  - masquer le prix hors contexte d'achat si besoin
 */
const EquipmentEditForm = ({ item, onChange, showType = true, showPrix = true }) => {
    const isWeapon = item.typeEmplacement === 'arme';
    const isArmor  = item.typeEmplacement === 'armure';

    // Changer la nature d'un item le déséquipe : son emplacement actuel
    // n'aurait plus de sens (une armure en main directrice…). Les champs des
    // autres profils sont conservés (retour arrière sans perte) — ils sont
    // simplement ignorés par les stats et le formatage.
    const setType = (key) => {
        const patch = { typeEmplacement: key, emplacementEquipe: null };
        if (key === 'arme' && (!item.precisionAttr1 || !item.precisionAttr2)) {
            patch.precisionAttr1 = 'dex';
            patch.precisionAttr2 = 'dex';
        }
        onChange(patch);
    };

    return (
        <div className="flex flex-col gap-2">
            {/* Ligne 1 — type, nom, prix, martial */}
            <div className="flex gap-2 items-center flex-wrap">
                {showType && (
                    <div className="flex gap-1">
                        {Object.entries(TYPE_LABELS).map(([key, label]) => (
                            <Pill key={key} active={item.typeEmplacement === key} onClick={() => setType(key)}>{label}</Pill>
                        ))}
                    </div>
                )}
                <input placeholder="Nom" value={item.nomLibre}
                       onChange={e => onChange({ nomLibre: e.target.value })}
                       className="bg-default border border-default rounded px-2 py-1 text-sm flex-1 min-w-[100px]" />
                {showPrix && <NumField label="Prix" value={item.prix} onChange={v => onChange({ prix: v })} w="w-16" />}
                <Pill active={!!item.estMartial} tone="accent" onClick={() => onChange({ estMartial: !item.estMartial })}>
                    Martial
                </Pill>
            </div>

            {/* Profil arme */}
            {isWeapon && (
                <>
                    <div className="flex gap-1 items-center flex-wrap">
                        <span className="text-xs text-muted mr-1">Catégorie :</span>
                        {CATEGORIES_ARMES.map(c => (
                            <Pill key={c.key} active={item.categorie === c.key}
                                  onClick={() => onChange({ categorie: item.categorie === c.key ? null : c.key })}>
                                {c.label}
                            </Pill>
                        ))}
                    </div>
                    <div className="flex gap-3 items-center flex-wrap">
                        <span className="text-xs text-muted">Précision :</span>
                        <AttrPills value={item.precisionAttr1} onChange={v => onChange({ precisionAttr1: v })} />
                        <span className="text-xs text-muted">+</span>
                        <AttrPills value={item.precisionAttr2} onChange={v => onChange({ precisionAttr2: v })} />
                        <NumField label="Bonus" value={item.precisionBonus} onChange={v => onChange({ precisionBonus: v })} />
                    </div>
                    <div className="flex gap-3 items-center flex-wrap">
                        <NumField label="Dégâts [VH+…]" value={item.degatsBonus} onChange={v => onChange({ degatsBonus: v })} />
                        <div className="flex gap-1 flex-wrap">
                            {TYPES_DEGATS.map(t => (
                                <Pill key={t.key} active={item.degatsType === t.key} tone="secondary"
                                      onClick={() => onChange({ degatsType: t.key })}>
                                    {t.label}
                                </Pill>
                            ))}
                        </div>
                    </div>
                    <div className="flex gap-3 items-center flex-wrap">
                        <div className="flex gap-1">
                            <Pill active={item.mains !== 2} onClick={() => onChange({ mains: 1 })}>Une main</Pill>
                            <Pill active={item.mains === 2} onClick={() => onChange({ mains: 2 })}>Deux mains</Pill>
                        </div>
                        <div className="flex gap-1">
                            <Pill active={item.portee !== 'distance'} onClick={() => onChange({ portee: 'cac' })}>Corps à corps</Pill>
                            <Pill active={item.portee === 'distance'} onClick={() => onChange({ portee: 'distance' })}>Distance</Pill>
                        </div>
                    </div>
                </>
            )}

            {/* Profil armure — DEF additive (dé DEX + mod) ou fixe (armures lourdes) */}
            {isArmor && (
                <div className="flex gap-3 items-center flex-wrap">
                    <div className="flex gap-1 items-center">
                        <span className="text-xs text-muted mr-1">Déf. :</span>
                        <Pill active={!Number.isInteger(item.defFixe)} onClick={() => onChange({ defFixe: null })}>
                            Dé DEX + mod
                        </Pill>
                        <Pill active={Number.isInteger(item.defFixe)} onClick={() => onChange({ defFixe: item.defFixe ?? 10 })}>
                            Fixe
                        </Pill>
                    </div>
                    {Number.isInteger(item.defFixe)
                        ? <NumField label="Valeur" value={item.defFixe} onChange={v => onChange({ defFixe: v })} />
                        : <NumField label="Mod" value={item.modDefense} onChange={v => onChange({ modDefense: v })} />}
                    <NumField label="Déf.Mag." value={item.modDefenseMagique} onChange={v => onChange({ modDefenseMagique: v })} />
                    <NumField label="Init." value={item.modInitiative} onChange={v => onChange({ modInitiative: v })} />
                </div>
            )}

            {/* Profil bouclier / accessoire — mods additifs simples */}
            {!isWeapon && !isArmor && (
                <div className="flex gap-3 items-center flex-wrap">
                    <NumField label="Déf." value={item.modDefense} onChange={v => onChange({ modDefense: v })} />
                    <NumField label="Déf.Mag." value={item.modDefenseMagique} onChange={v => onChange({ modDefenseMagique: v })} />
                    <NumField label="Init." value={item.modInitiative} onChange={v => onChange({ modInitiative: v })} />
                </div>
            )}

            {/* Commun — qualité + notes */}
            <input placeholder="Qualité (effet spécial, ex : Se brise après l'attaque)" value={item.qualite ?? ''}
                   onChange={e => onChange({ qualite: e.target.value })}
                   className="bg-default border border-default rounded px-2 py-1 text-xs" />
            <textarea placeholder="Notes libres" value={item.notesLibres ?? ''}
                      onChange={e => onChange({ notesLibres: e.target.value })}
                      className="bg-default border border-default rounded px-2 py-1 text-xs" rows={2} />
        </div>
    );
};

export default EquipmentEditForm;