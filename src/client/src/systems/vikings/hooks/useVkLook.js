// src/client/src/systems/vikings/hooks/useVkLook.js
// ─────────────────────────────────────────────────────────────────────────────
// Habillage choisi par le joueur (spec_vikings_pierre_peinte.md §2, choix C-1, C-6, C-7) :
//   skin : 'pierre' (pierre peinte, par défaut) ou 'bois' (bois et or, thème d'origine)
//   night : 'aurore' (par défaut) ou 'foyer', nuit de la pierre peinte
// Gardé dans ce navigateur, propre au slug. Posé sur <html data-vk-skin data-vk-night>
// tant qu'une page du slug est montée (fiche, interface MJ, création) : les fenêtres
// de la plateforme, rendues hors de la fiche, suivent l'habillage (modèle : useLivery
// de maledictum). Jour / nuit reste data-theme, posé par la plateforme.
//
//   const [look, setLook] = useVkLook();   // dans un menu
//   useVkLookOnRoot();                     // une fois par page
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect } from 'react';
import { usePersistedState } from '../../../hooks/usePersistedState.js';
import { watchPlatformSlabs } from '../components/ui/VkSlabBg.jsx';

export const SKINS  = ['pierre', 'bois'];
export const NIGHTS = ['aurore', 'foyer'];

// odds : afficher les chances de réussite (C-2) ; absent d'un réglage enregistré avant
// son ajout, il vaut « oui » (lire look.odds !== false)
// anim : le vivant (ciels, gravure, corbeau, état du corps, D-15) ; même règle (absent = oui)
const LOOK_OPTIONS = {
    defaults: { skin: 'pierre', night: 'aurore', odds: true, anim: true },
    validate: (v) => v !== null && typeof v === 'object' && SKINS.includes(v.skin) && NIGHTS.includes(v.night)
        && (v.odds === undefined || typeof v.odds === 'boolean')
        && (v.anim === undefined || typeof v.anim === 'boolean'),
};

/** Le vivant est-il actif ? Pierre peinte, réglage du joueur, et « réduire les animations » du système. */
export const livingOn = (look) => look.skin === 'pierre' && look.anim !== false
    && !(typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);

// ── Événements du vivant (spec_vikings_pierre_peinte.md §3) ──────────────────
// Émis par la fiche (gain de SAGA) et le plateau de jet (triple 10), écoutés par le
// ciel, le ruban-serpent et le corbeau. detail : { id } (personnage concerné).
export const VK_SAGA_GAIN = 'vk:saga-gain';
export const VK_TRIPLE    = 'vk:triple';
export const emitVk = (name, detail) => window.dispatchEvent(new CustomEvent(name, { detail }));

/** @returns {[{skin: string, night: string}, Function]} */
export const useVkLook = () => usePersistedState('vikings', 'look', LOOK_OPTIONS);

// Plusieurs composants peuvent poser l'habillage en même temps (titre d'une page
// d'accès, puis la fiche) : l'attribut n'est retiré qu'au départ du dernier.
let mounted = 0;

/** Pose l'habillage sur <html> et le retire quand plus aucune page du slug ne le porte. */
export const useVkLookOnRoot = () => {
    const [look] = useVkLook();
    useEffect(() => {
        const html = document.documentElement;
        mounted += 1;
        html.dataset.vkSkin  = look.skin;
        html.dataset.vkNight = look.night;
        html.dataset.vkAnim  = look.anim === false ? 'off' : 'on';
        return () => {
            mounted -= 1;
            if (mounted === 0) {
                delete html.dataset.vkSkin;
                delete html.dataset.vkNight;
                delete html.dataset.vkAnim;
            }
        };
    }, [look.skin, look.night, look.anim]);
    // Pierre peinte : fenêtres, cartes d'historique et notifications prennent la forme de dalle des cartes
    useEffect(() => (look.skin === 'pierre' ? watchPlatformSlabs() : undefined), [look.skin]);
    return look;
};
