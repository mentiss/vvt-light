// src/client/src/systems/achtung/components/ShieldBadge.jsx
import React from 'react';

const ShieldBadge = ({ value }) => {
    return (
        <div style={{ position: 'relative', width: '2.5rem', height: '3rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

            <svg width="200" height="230" viewBox="0 0 200 230" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%', filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.3))' }}>
                <path d="M100 220C100 220 10 180 10 90V40L100 10L190 40V90C190 180 100 220 100 220Z" fill="var(--ac-muted)"/>
                <path d="M100 205C100 205 25 170 25 90V48L100 25L175 48V90C175 170 100 205 100 205Z" fill="var(--ac-surface)"/>
                <path d="M100 190C100 190 40 160 40 90V55L100 37L160 55V90C160 160 100 190 100 190Z" fill="var(--ac-muted)"/>
            </svg>
            <span style={{
                position: 'absolute',
                fontWeight: 800,
                fontSize: '1.1rem',
                color: 'var(--ac-primary)',
                fontFamily: 'var(--ac-font-title)'
            }}>
                {value}
            </span>
        </div>
    );
};

export default ShieldBadge;