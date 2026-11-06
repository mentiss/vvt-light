// src/client/src/systems/fabula/components/layout/WeaponsCard.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Mains équipées — emplacements nommés (main_directrice / main_secondaire),
// ou une arme deux mains (deux_mains) occupant tout. Le pill "⇄ Changer de
// main" permute directrice/secondaire (échange les deux items si l'autre main
// est occupée) — action de jeu, visible hors editMode, comme "Équiper" au sac.
// Aucune contrainte de nature : un bouclier en main directrice est légal
// (Boucliers doubles du Gardien).
//
// Bouton "<FuIcon name="sword" className="fu-ico-sm" /> Attaquer" (aligné à droite) : uniquement sur un item avec un
// profil d'attaque (precisionAttr1/2 renseignés — donc les armes, jamais les
// boucliers/armures qui n'en portent pas). N'apparaît que si `onAttack` est
// fourni par le parent (Sheet.jsx uniquement — le GM ne joue pas les
// attaques à la place des joueurs, TabSession ne passe pas ce callback).
//
// Cas spécial "Boucliers jumeaux" (compétence Boucliers doubles du Gardien,
// NCMax 1) : deux boucliers équipés + la compétence possédée donnent un
// profil d'attaque à part entière défini par les règles — [PUI+PUI],
// [VH+5] physiques + NC en Maîtrise défensive. Ce n'est pas une extrapolation:
// c'est le texte exact de la compétence. Sans elle, deux boucliers équipés
// ne donnent toujours aucune attaque (cohérent : les boucliers n'ont pas de
// profil offensif dans le catalogue, à dessein).
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { unequipItem, switchHand } from '../../config.jsx';
import EquipmentEditForm, { EquipmentItemSummary } from './EquipmentEditForm.jsx';
import FuIcon from '../ui/FuIcon.jsx';

const findSkillRang = (skills, classKey, skillKey) =>
    (skills ?? []).find(s => s.classKey === classKey && s.skillKey === skillKey)?.rang ?? 0;

/** Item de main avec profil d'attaque exploitable (armes — jamais les boucliers/armures). */
const hasAttackProfile = (item) => !!item && item.precisionAttr1 && item.precisionAttr2;

const HandSlot = ({ label, entry, editMode, onUpdate, onUnequip, onSwitch, onAttack }) => (
    <div>
        <div className="fu-label mb-1">{label}</div>
        {!entry ? (
            <p className="fu-item is-empty">Vide</p>
        ) : (
            <div className="fu-item">
                <div className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                        {editMode ? (
                            <EquipmentEditForm item={entry.e} onChange={patch => onUpdate(entry.i, patch)} showType={false} />
                        ) : (
                            <EquipmentItemSummary item={entry.e} showType={false} />
                        )}
                    </div>
                    {/* Tout à droite de l'item, toujours visible (action de jeu). */}
                    {onAttack && hasAttackProfile(entry.e) && (
                        <button type="button" onClick={() => onAttack(entry.e, entry.i)}
                                className="fu-btn fu-btn-sm fu-btn-gold shrink-0"
                                title="Lancer une attaque avec cette arme">
                            <FuIcon name="sword" className="fu-ico-sm" /> Attaquer
                        </button>
                    )}
                </div>
                <div className="flex gap-1 flex-wrap">
                    {/* Déséquiper est une action de jeu immédiate, pas une édition de
                        texte libre — toujours disponible, comme "⇄ Changer de main". */}
                    <button type="button" onClick={() => onUnequip(entry.i)}
                            className="fu-btn fu-btn-sm fu-btn-danger">
                        Déséquiper
                    </button>
                    {onSwitch && (
                        <button type="button" onClick={() => onSwitch(entry.i)}
                                className="fu-btn fu-btn-sm">
                            <FuIcon name="swap" className="fu-ico-sm" />Changer de main
                        </button>
                    )}
                </div>
            </div>
        )}
    </div>
);

const WeaponsCard = ({ character, editMode, onArrayChange, onAttack }) => {
    const equipment = character.equipment ?? [];
    const indexed = equipment.map((e, i) => ({ e, i }));

    const twoHands = indexed.find(({ e }) => e.emplacementEquipe === 'deux_mains') ?? null;
    const mainHand = indexed.find(({ e }) => e.emplacementEquipe === 'main_directrice') ?? null;
    const offHand  = indexed.find(({ e }) => e.emplacementEquipe === 'main_secondaire') ?? null;

    const update  = (index, patch) => onArrayChange('equipment', equipment.map((e, i) => i === index ? { ...e, ...patch } : e));
    const unequip = (index) => onArrayChange('equipment', unequipItem(equipment, index));
    const doSwitch = (index) => onArrayChange('equipment', switchHand(equipment, index));

    // Boucliers jumeaux : deux boucliers équipés (main directrice + secondaire)
    // ET la compétence Boucliers doubles (Gardien, NCMax 1 → binaire, rang > 0).
    const bothShields = mainHand?.e?.typeEmplacement === 'bouclier' && offHand?.e?.typeEmplacement === 'bouclier';
    const hasBouclierDoubles = findSkillRang(character.skills, 'gardien', 'boucliers_doubles') > 0;
    const showBouclierJumeaux = bothShields && hasBouclierDoubles;
    const maitriseDefensiveNC = findSkillRang(character.skills, 'gardien', 'maitrise_defensive');

    const bouclierJumeauxContext = {
        nomLibre: 'Boucliers jumeaux',
        precisionAttr1: 'pui', precisionAttr2: 'pui', precisionBonus: 0,
        degatsBonus: 5 + maitriseDefensiveNC, degatsType: 'physique',
    };

    return (
        <section className="fu-equip-slot">
            <h4 className="fu-slot-title">Armes<span className="fu-kana" aria-hidden="true">武器</span></h4>
            <div className="flex flex-col gap-2">
                {twoHands ? (
                    <HandSlot label="Deux mains" entry={twoHands}
                              editMode={editMode} onUpdate={update} onUnequip={unequip} onAttack={onAttack} />
                ) : (
                    <>
                        <HandSlot label="Main directrice" entry={mainHand}
                                  editMode={editMode} onUpdate={update} onUnequip={unequip} onSwitch={doSwitch} onAttack={onAttack} />
                        <HandSlot label="Main secondaire" entry={offHand}
                                  editMode={editMode} onUpdate={update} onUnequip={unequip} onSwitch={doSwitch} onAttack={onAttack} />
                    </>
                )}

                {/* Boucliers jumeaux — profil d'attaque défini par la compétence
                    Boucliers doubles (règles officielles), pas une extrapolation. */}
                {showBouclierJumeaux && (
                    <div className="bg-surface-alt border border-accent rounded p-2 flex items-center justify-between gap-2">
                        <div className="text-xs">
                            <span className="font-semibold">Boucliers jumeaux</span>
                            <span className="text-muted"> — [PUI+PUI] · [VH+{5 + maitriseDefensiveNC}] physiques</span>
                        </div>
                        {onAttack && (
                            <button type="button" onClick={() => onAttack(bouclierJumeauxContext, null)}
                                    className="fu-btn fu-btn-sm fu-btn-gold shrink-0"
                                    title="Attaquer avec vos deux boucliers (Boucliers doubles)">
                                <FuIcon name="sword" className="fu-ico-sm" /> Attaquer
                            </button>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
};

export default WeaponsCard;