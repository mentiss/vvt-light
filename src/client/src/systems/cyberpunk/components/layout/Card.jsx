import React from "react";

/**
 *
 * @param {string} title
 * @param children
 * @param action
 * @returns {React.JSX.Element}
 * @constructor
 */
export const Card = ({ title, children, action }) => (
    <div
        className="rounded-xl flex flex-col gap-3 p-4"
        style={{
            background: 'var(--color-surface)',
            border:     '1px solid var(--color-border)',
        }}
    >
        <div className="flex items-center justify-between">
            <h3
                className="text-xs font-bold cp-font-ui uppercase tracking-widest"
                style={{ color: 'var(--color-text-muted)' }}
            >
                {title}
            </h3>
            {action}
        </div>
        {children}
    </div>
);
