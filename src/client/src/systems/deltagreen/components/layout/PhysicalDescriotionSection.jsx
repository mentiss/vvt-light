// src/client/src/systems/deltagreen/components/layout/PhysicalDescriptionSection.jsx

import React from 'react';

const PhysicalDescriptionSection = ({ char, editMode, set }) => (
    <div>
        <p className="dg-section-label text-[10px] border-b border-default pb-1 mb-1">
            10. DESCRIPTION PHYSIQUE
        </p>
        {editMode ? (
            <textarea
                className="dg-field-input w-full px-2 py-1 text-xs font-mono resize-none min-h-[3rem]"
                value={char.physicalDescription ?? ''}
                onChange={e => set('physicalDescription', e.target.value)}
                placeholder="Signes particuliers, apparence…"
            />
        ) : (
            <p className={[
                'text-xs font-mono whitespace-pre-wrap min-h-[2rem]',
                char.degradationPalier >= 4 ? 'dg-censured' : '',
                !char.physicalDescription ? 'text-muted italic' : '',
            ].join(' ')}>
                {char.physicalDescription || 'Aucune description.'}
            </p>
        )}
    </div>
);

export default PhysicalDescriptionSection;