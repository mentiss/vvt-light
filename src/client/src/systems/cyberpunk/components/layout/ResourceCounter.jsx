import React from "react";

export const ResourceCounter = ({ label, value, color, onChange, editMode, colorLabel = "var(--color-text-muted)", char = null }) => (
    <div className="flex flex-col items-center gap-0.5">
        <span className="text-xs cp-font-ui uppercase tracking-wide" style={{ color: colorLabel}}>
            {label}
        </span>
        <div className="flex items-center gap-0.5">
            {editMode && (
                <button
                    onClick={() => onChange(Math.max(0, value - 1))}
                    className="w-6 h-6 rounded flex items-center justify-center text-sm font-bold"
                    style={{ background: 'var(--color-surface-alt)', color: 'var(--color-text-muted)' }}
                >
                    −
                </button>
            )}
            <span
                className="font-mono font-bold text-lg min-w-[2rem] text-center"
                style={{ color }}
            >
                {value}
            </span>
            {editMode && (
                <button
                    onClick={() => onChange(value + 1)}
                    className="w-6 h-6 rounded flex items-center justify-center text-sm font-bold"
                    style={{ background: 'var(--color-surface-alt)', color: 'var(--color-text-muted)' }}
                >
                    +
                </button>
            )}
        </div>
    </div>
);
