// src/client/src/systems/fabula/components/group/UseItemMenu.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Bouton « Utiliser un objet » près de la jauge PI (spec_fabula.md §7, planche §3) :
// ouvre la liste des objets du groupe (officiels + ajoutés par la table) avec leur
// coût ; un clic retire les PI et laisse une trace dans l'historique. Le Fragment
// élémentaire demande d'abord le type. Grisé si PI insuffisants.
//
// Props : character, sessionId?, onQuickUpdate
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect, useRef, useState } from 'react';
import FuIcon from '../ui/FuIcon.jsx';
import { GROUP_ITEMS, FRAGMENT_ELEMENTS } from '../../config/groupItems.js';
import { useGroupe } from '../../hooks/useGroupe.js';
import { useGroupItemUse } from '../../hooks/useGroupItemUse.js';

const UseItemMenu = ({ character, sessionId, onQuickUpdate }) => {
    const [open, setOpen] = useState(false);
    const [choosing, setChoosing] = useState(null);   // objet à choix (fragment) en cours
    const rootRef = useRef(null);
    const { groupe } = useGroupe(open ? sessionId : null);
    const consumeItem = useGroupItemUse({ character, sessionId, onQuickUpdate });
    const pi = character?.piActuel ?? 0;

    // Fermeture au clic à l'extérieur
    useEffect(() => {
        if (!open) return undefined;
        const onDown = (e) => { if (!rootRef.current?.contains(e.target)) { setOpen(false); setChoosing(null); } };
        document.addEventListener('mousedown', onDown);
        return () => document.removeEventListener('mousedown', onDown);
    }, [open]);

    const items = [
        ...GROUP_ITEMS,
        ...(groupe?.objets ?? []).map(o => ({ key: `table-${o.id}`, nom: o.nom || 'Objet', pi: o.pi, effet: o.effet, icon: 'bag' })),
    ];

    const pick = async (item, element = null) => {
        if (item.chooseElement && !element) { setChoosing(choosing === item.key ? null : item.key); return; }
        if (await consumeItem(item, element)) { setOpen(false); setChoosing(null); }
    };

    return (
        <span className="fu-use-item" ref={rootRef}>
            <button type="button" className="fu-use-item-btn" onClick={() => setOpen(v => !v)} aria-expanded={open}>
                <FuIcon name="potion" className="fu-ico-sm" /> Utiliser un objet
            </button>
            {open && (
                <div className="fu-items-pop fu-win" role="menu">
                    <div className="fu-label px-3 pb-2">Objets du groupe · {pi} PI</div>
                    {items.map(it => (
                        <React.Fragment key={it.key}>
                            <button type="button" role="menuitem" className="fu-use-row" disabled={pi < it.pi} onClick={() => pick(it)}
                                    title={pi < it.pi ? 'PI insuffisants' : undefined}>
                                <FuIcon name={it.icon} className="fu-ico text-primary" />
                                <span><b>{it.nom}</b><small>{it.effet}</small></span>
                                <span className="fu-pi-cost">{it.pi} PI</span>
                            </button>
                            {choosing === it.key && (
                                <div className="flex gap-1.5 flex-wrap px-3 pb-2 pl-10">
                                    {FRAGMENT_ELEMENTS.map(e => (
                                        <button key={e.key} type="button" className="fu-pill" onClick={() => pick(it, e.key)}>{e.label}</button>
                                    ))}
                                </div>
                            )}
                        </React.Fragment>
                    ))}
                </div>
            )}
        </span>
    );
};

export default UseItemMenu;
