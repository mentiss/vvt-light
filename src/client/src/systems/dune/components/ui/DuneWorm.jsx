// src/client/src/systems/dune/components/ui/DuneWorm.jsx
// Rosace du ver (planche §2) : bouche dentée en anneaux, qui tourne lentement
// (coupée si le système réduit les animations). Écrans vides, code d'accès.

import React from 'react';

/** @param {string} [props.className='dn-worm is-lg'] */
const DuneWorm = ({ className = 'dn-worm is-lg' }) => (
    <svg className={className} viewBox="0 0 64 64" aria-hidden="true">
        <g className="dn-worm-spin" fill="none" stroke="currentColor">
            <circle cx="32" cy="32" r="29" strokeWidth="1" />
            <circle cx="32" cy="32" r="22" strokeWidth="1.5" />
            <circle cx="32" cy="32" r="11" strokeWidth="1" />
            <path strokeWidth="1.6" d="M32 10l-2.5 6h5zM32 54l-2.5-6h5zM10 32l6-2.5v5zM54 32l-6-2.5v5zM16.4 16.4l5.3 3.3-2 2zM47.6 47.6l-5.3-3.3 2-2zM16.4 47.6l3.3-5.3 2 2zM47.6 16.4l-3.3 5.3-2-2z" />
        </g>
    </svg>
);

export default DuneWorm;
