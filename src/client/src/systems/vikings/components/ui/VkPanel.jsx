// src/client/src/systems/vikings/components/ui/VkPanel.jsx
// Cadre à coins ornés du UI kit : variant 'heavy' (bloc principal), 'light'
// (section), 'sm' (carte). Les coins sont des pseudo-éléments du thème ; le
// <span class="vk-c"> porte les deux coins du bas.
// Pierre peinte : le cadre devient une dalle taillée (VkSlabBg), les coins sont masqués.

import React from 'react';
import VkSlabBg from './VkSlabBg.jsx';

const VARIANTS = { heavy: 'vk-heavy', light: 'vk-light', sm: 'vk-light-sm' };

const VkPanel = ({ variant = 'light', className = '', children, ...rest }) => (
    <div className={`vk-panel ${VARIANTS[variant]} ${className}`.trim()} {...rest}>
        <VkSlabBg />
        <span className="vk-c" />
        {children}
    </div>
);

export default VkPanel;
