import React from "react";

export const SectionTitle = ({ children }) => (
    <h2
        className="text-xs font-bold cp-font-ui uppercase tracking-widest mb-3 text-muted"
    >
        {children}
    </h2>
);

// Boutons du HUD (theme.css .cp-btn)
const VARIANT_CLASSES = {
    default: '',
    primary: 'is-primary',
    danger:  'is-danger',
    success: 'is-success',
    ghost:   'is-ghost',
};

export const Btn = ({ onClick, children, variant = 'default', small = false, disabled = false }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`cp-btn ${VARIANT_CLASSES[variant] ?? ''} ${small ? 'is-sm' : ''}`}
    >
        {children}
    </button>
);

export const Input = ({ value, onChange, placeholder, type = 'text', small = false }) => (
    <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={`rounded-lg outline-none w-full ${small ? 'text-xs px-2 py-1' : 'text-sm px-3 py-2'}`}
        style={{
            background: 'var(--color-surface-alt)',
            border:     '1px solid var(--color-border)',
            color:      'var(--color-text)',
        }}
    />
);

export const Textarea = ({ value, onChange, placeholder, rows = 3 }) => (
    <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="rounded-lg outline-none w-full text-sm px-3 py-2 resize-none"
        style={{
            background: 'var(--color-surface-alt)',
            border:     '1px solid var(--color-border)',
            color:      'var(--color-text)',
        }}
    />
);