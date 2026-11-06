// src/client/src/systems/fabula/components/layout/FabulaPointsPanel.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Points Fabula (planche §3) : un cristal par point, le nombre en grand.
//   • Plus AUCUN plafond (la limite officielle de 6 de la spec §4.1 est
//     écartée par règle de table — supprimée aussi côté controller). Au-delà
//     de 12 cristaux, seul le nombre continue de monter.
//   • Le rappel des règles est toujours affiché (il remplit la carte, posée à
//     côté du Héros).
// Le compteur fonctionne toujours hors mode édition, comme les autres
// ressources (persistance immédiate via onQuickUpdate).
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import FuIcon from '../ui/FuIcon.jsx';

const MAX_CRYSTALS = 12;

const FabulaPointsPanel = ({ character, onQuickUpdate }) => {
    const pf = character.pointsFabula ?? 0;
    const adjust = (delta) => onQuickUpdate({ pointsFabula: Math.max(0, pf + delta) });

    return (
        <div className="fu-win">
            <div className="fu-win-head">
                <h3 className="fu-title">Points Fabula<span className="fu-kana" aria-hidden="true">ファブラポイント</span></h3>
                <span className="fu-rule" />
            </div>

            <div className="fu-pf">
                <button type="button" onClick={() => adjust(-1)} disabled={pf <= 0} className="fu-step-btn" aria-label="Retirer un Point Fabula">
                    <FuIcon name="minus" className="fu-ico-sm" />
                </button>
                <div className="fu-pf-crystals" aria-hidden="true">
                    {Array.from({ length: Math.min(pf, MAX_CRYSTALS) }, (_, i) => <i key={i} className="fu-crystal" />)}
                </div>
                <span className="fu-pf-count">{pf}</span>
                <button type="button" onClick={() => adjust(1)} className="fu-step-btn" aria-label="Ajouter un Point Fabula">
                    <FuIcon name="plus" className="fu-ico-sm" />
                </button>
            </div>

            <div className="fu-rules">
                <b>+1</b> fumble sur un test · <b>+1</b> un Méchant entre en scène · <b>+2</b> réduit à 0 PV et vous vous rendez · <b>+1</b> (facultatif) invoquer un trait ou un lien pour échouer
                <br />
                <b>−1</b> altérer l'histoire · <b>−1</b> invoquer un trait ou un lien pour relancer ou améliorer un test
            </div>
        </div>
    );
};

export default FabulaPointsPanel;
