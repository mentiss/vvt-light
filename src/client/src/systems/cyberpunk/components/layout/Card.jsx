import React from "react";

/**
 *
 * @param {string} title
 * @param children
 * @param action
 * @returns {React.JSX.Element}
 * @constructor
 */
// Panneau du HUD (theme.css .cp-panel) : coins coupés et crochets d'angle portés
// par le fond, le contenu peut déborder (listes de suggestions, menus).
export const Card = ({ title, children, action }) => (
    <div className="cp-panel flex flex-col gap-3">
        <div className="cp-panel-head">
            <h3 className="cp-panel-title">{title}</h3>
            <span className="cp-panel-rule" />
            {action && <div className="cp-panel-actions">{action}</div>}
        </div>
        {children}
    </div>
);
