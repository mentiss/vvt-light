// src/client/src/systems/vikings/components/ui/VkPanel.jsx
// Cadre à coins ornés du UI kit : variant 'heavy' (bloc principal), 'light'
// (section), 'sm' (carte). Les coins sont des pseudo-éléments du thème ; le
// <span class="vk-c"> porte les deux coins du bas.

import React from 'react';

const VARIANTS = { heavy: 'vk-heavy', light: 'vk-light', sm: 'vk-light-sm' };

const VkPanel = ({ variant = 'light', className = '', children, ...rest }) => (
    <div className={`vk-panel ${VARIANTS[variant]} ${className}`.trim()} {...rest}>
        <span className="vk-c" />
        {children}
    </div>
);

export default VkPanel;
